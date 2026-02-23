import bcrypt from 'bcryptjs';
import { userService_log, query_log, dbError_log } from '../utils/debug.js';
import {
  DEFAULT_USER_ROLE,
  DEFAULT_USER_STATUS,
  ROLES,
  USER_STATUSES,
  canManageUser
} from '../constants/roles.js';
import { BaseService } from './baseService.js';
import { createKvConfigService } from '../utils/serviceFactory.js';

/**
 * Service for managing operations with users table
 * Inherits optimized config management from BaseService
*/
export class UserService extends BaseService {
  constructor(env) {
    super(env, 'UserService');
    this.kvService = createKvConfigService(env);
    userService_log('UserService initialized with optimized config management');
  }

  /**
   * Find user by email
   * @param {string} email - User email
   * @returns {Promise<Object|null>} User object or null
   */
  async findByEmail(email) {
    query_log(`Finding user by email: ${email}`);

    try {
      const user = await this.dbService.select(
        'SELECT id, full_name, email, password, role, status, disabled_by_admin FROM users WHERE email = ?',
        [email],
        true
      );

      if (user) {
        userService_log(`User found by email: ${email}, ID: ${user.id}, role: ${user.role}`);
      } else {
        userService_log(`No user found for email: ${email}`);
      }

      return user;
    } catch (error) {
      dbError_log(`Error finding user by email: ${error.message}`);
      return null;
    }
  }

  /**
   * Find user by ID
   * @param {number} id - User ID
   * @returns {Promise<Object|null>} User object or null
   */
  async findById(id) {
    query_log(`Finding user by ID: ${id}`);

    try {
      const user = await this.dbService.select(
        'SELECT id, full_name, email, new_email, role, status, created_at, disabled_by_admin FROM users WHERE id = ?',
        [id],
        true
      );

      if (user) {
        userService_log(`User found by ID: ${id}, email: ${user.email}, role: ${user.role}`);
      } else {
        userService_log(`No user found for ID: ${id}`);
      }

      return user;
    } catch (error) {
      dbError_log(`Error finding user by ID: ${error.message}`);
      return null;
    }
  }

  /**
   * Create new user
   * @param {Object} userData - User data
   * @returns {Promise<Object|null>} Created user or null
   */
  async create(userData) {
    userService_log(`Creating new user: ${userData.email}`);

    try {
      const { full_name, email, password, role = DEFAULT_USER_ROLE, status = DEFAULT_USER_STATUS } = userData;

      const result = await this.dbService.insert(
        'INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
        [full_name, email, password, role, status]
      );

      if (result && result.success) {
        userService_log(`User created successfully with ID: ${result.insertId}, role: ${role}`);
        return await this.findById(result.insertId);
      }

      userService_log('Failed to create user - database operation failed');
      return null;
    } catch (error) {
      dbError_log(`Error creating user: ${error.message}`);
      return null;
    }
  }

  /**
   * Update user information
   * @param {number} id - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<boolean>} True if successful
   */
  async update(id, updateData) {
    userService_log(`Updating user ID: ${id}, with data: ${Object.keys(updateData).join(', ')}`);

    try {
      const { setClause, params } = this.dbService.buildSetClause(updateData);

      if (!setClause) {
        userService_log(`No valid fields to update for user ID: ${id}`);
        return false;
      }

      const query = `UPDATE users SET ${setClause} WHERE id = ?`;
      const result = await this.dbService.update(query, [...params, id]);

      if (result && result.success) {
        userService_log(`User updated successfully, ID: ${id}`);
        await this.invalidateUserCache(id);
        return true;
      } else {
        userService_log(`Failed to update user, ID: ${id}`);
        return false;
      }
    } catch (error) {
      dbError_log(`Error updating user: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete user by ID
   * @param {number} id - User ID
   * @returns {Promise<boolean>} True if deletion successful
  */
  async delete(id) {
    userService_log(`Deleting user ID: ${id}`);
    try {
      const result = await this.dbService.delete('DELETE FROM users WHERE id = ?', [id]);

      if (result && result.success) {
        userService_log(`User deleted successfully, ID: ${id}`);
        await this.invalidateUserCache(id);
        return true;
      } else {
        userService_log(`Failed to delete user, ID: ${id}`);
        return false;
      }
    } catch (error) {
      dbError_log(`Error deleting user: ${error.message}`);
      return false;
    }
  }

  /**
   * Register new user with email validation and password hashing
   * @param {Object} userData - User data {full_name, email, password}
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async register(userData, autoSetActiveStatus = false) {
    userService_log(`Processing user registration for email: ${userData.email}`);

    try {
      const { full_name, email, password } = userData;

      // Check if email already exists
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        userService_log(`Registration failed: email already exists: ${email}`);
        return {
          success: false,
          error: 'EMAIL_EXISTS'
        };
      }

      // Hash password
      const bcryptConfig = await this.getBcryptConfig();
      const hashedPassword = await bcrypt.hash(password, bcryptConfig.saltRounds);
      userService_log(`Password hashed successfully for registration using ${bcryptConfig.saltRounds} salt rounds`);

      // Create new user (with activation token when activation is required)
      const newUser = autoSetActiveStatus
        ? await this.create({
          full_name,
          email,
          status: USER_STATUSES.ACTIVE,
          password: hashedPassword
        })
        : await this.createWithActivationToken({
          full_name,
          email,
          status: USER_STATUSES.INACTIVE,
          password: hashedPassword
        });

      if (!newUser) {
        userService_log('Registration failed: could not create user');
        return {
          success: false,
          error: 'CREATE_FAILED'
        };
      }

      userService_log(`User registered successfully with ID: ${newUser.id}, email: ${email}`);

      // Return user data (excluding password)
      const baseData = {
        id: newUser.id,
        full_name: newUser.full_name,
        email: newUser.email,
        status: newUser.status,
        created_at: newUser.created_at
      };

      if (newUser.activation_token) {
        baseData.activation_token = newUser.activation_token;
        baseData.activation_token_expires_at = newUser.activation_token_expires_at;
      }

      return {
        success: true,
        data: baseData
      };

    } catch (error) {
      dbError_log(`User registration error: ${error.message}`);
      return {
        success: false,
        error: 'REGISTRATION_ERROR',
        details: error.message
      };
    }
  }

  /**
   * Change user password (includes verify current password)
   * @param {number} userId - User ID
   * @param {string} currentPassword - Current password
   * @param {string} newPassword - New password
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async changePassword(userId, currentPassword, newPassword) {
    userService_log(`Processing password change for user ID: ${userId}`);

    try {
      // Get current user information (need password to verify)
      const user = await this.dbService.select(
        'SELECT id, password FROM users WHERE id = ?',
        [userId],
        true
      );

      if (!user) {
        userService_log(`Password change failed: user not found: ${userId}`);
        return {
          success: false,
          error: 'USER_NOT_FOUND'
        };
      }

      // Verify current password
      const isValidPassword = await bcrypt.compare(currentPassword, user.password);

      if (!isValidPassword) {
        userService_log(`Password change failed: current password incorrect for user: ${userId}`);
        return {
          success: false,
          error: 'INVALID_CURRENT_PASSWORD'
        };
      }

      // Update password
      const updateResult = await this.updatePassword(userId, newPassword);

      if (!updateResult) {
        userService_log(`Password change failed: could not update password for user: ${userId}`);
        return {
          success: false,
          error: 'UPDATE_FAILED'
        };
      }

      userService_log(`Password changed successfully for user: ${userId}`);
      return {
        success: true
      };

    } catch (error) {
      dbError_log(`Password change error: ${error.message}`);
      return {
        success: false,
        error: 'PASSWORD_CHANGE_ERROR',
        details: error.message
      };
    }
  }

  /**
   * Update user password
   * @param {number} id - User ID
   * @param {string} newPassword - New password (not hashed)
   * @returns {Promise<boolean>} True if successful
   */
  async updatePassword(id, newPassword) {
    userService_log(`Updating password for user ID: ${id}`);
    const bcryptConfig = await this.getBcryptConfig();

    try {
      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, bcryptConfig.saltRounds);

      const result = await this.dbService.update(
        'UPDATE users SET password = ? WHERE id = ?',
        [hashedPassword, id]
      );

      if (result && result.success) {
        userService_log(`Password updated successfully for user ID: ${id} using ${bcryptConfig.saltRounds} salt rounds`);
        await this.invalidateUserCache(id);
        return true;
      } else {
        userService_log(`Failed to update password for user ID: ${id}`);
        return false;
      }
    } catch (error) {
      dbError_log(`Error updating password: ${error.message}`);
      return false;
    }
  }

  /**
   * Get list of users with pagination and filter
   * @param {Object} options - Query options {page, limit, role, status, search, roleFilter}
   * @returns {Promise<{users: Array, total: number, page: number, limit: number}>}
   */
  async getUsers(options = {}) {
    const paginationConfig = await this.getPaginationConfig();

    const {
      page = 1,
      limit = paginationConfig.defaultPageSize,
      role,
      status,
      search,
      roleFilter
    } = options;

    // Validate limit against max page size
    const validatedLimit = Math.min(limit, paginationConfig.maxPageSize);
    const offset = (page - 1) * validatedLimit;

    userService_log(`Getting users list - page: ${page}, limit: ${validatedLimit} (requested: ${limit}), role: ${role}, status: ${status}, search: ${search}, roleFilter: ${roleFilter}`);

    try {
      // Build conditions object
      const conditions = {};

      if (role) {
        conditions.role = role;
      } else if (roleFilter && Array.isArray(roleFilter)) {
        conditions.role = roleFilter; // This will be handled as IN clause
      }

      if (status) {
        conditions.status = status;
      }

      // Build WHERE clause using DatabaseService helper
      const { whereClause, params } = this.dbService.buildWhereClause(conditions);

      // Handle search separately as it requires OR condition
      let searchClause = '';
      let searchParams = [];
      if (search) {
        searchClause = whereClause
          ? ' AND (full_name LIKE ? OR email LIKE ?)'
          : 'WHERE (full_name LIKE ? OR email LIKE ?)';
        searchParams = [`%${search}%`, `%${search}%`];
      }

      const finalWhereClause = whereClause + searchClause;
      const finalParams = [...params, ...searchParams];

      userService_log(`Final WHERE clause: ${finalWhereClause}, params: ${JSON.stringify(finalParams)}`);

      // Get total count
      const countQuery = `SELECT COUNT(*) as total FROM users ${finalWhereClause}`;
      const countResult = await this.dbService.select(countQuery, finalParams, true);
      const total = countResult?.total || 0;

      // Get users
      const usersQuery = `
        SELECT id, full_name, email, role, status, created_at, updated_at 
        FROM users ${finalWhereClause} 
        ORDER BY created_at DESC 
        LIMIT ? OFFSET ?
      `;
      const users = await this.dbService.select(usersQuery, [...finalParams, validatedLimit, offset]);

      userService_log(`Retrieved ${users?.length || 0} users, total: ${total}`);

      return {
        users: users || [],
        total,
        page,
        limit: validatedLimit,
        totalPages: Math.ceil(total / validatedLimit)
      };
    } catch (error) {
      dbError_log(`Error getting users list: ${error.message}`);
      return {
        users: [],
        total: 0,
        page,
        limit: validatedLimit,
        totalPages: 0
      };
    }
  }

  /**
   * Create new user by admin (with role and automatic password)
   * @param {Object} userData - User data {full_name, email, password, role, status}
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async createUserByAdmin(userData) {
    userService_log(`Admin creating new user: ${userData.email}, role: ${userData.role}`);
    const bcryptConfig = await this.getBcryptConfig();

    try {
      const { full_name, email, password, role = DEFAULT_USER_ROLE, status = DEFAULT_USER_STATUS } = userData;

      // Check if email already exists
      const existingUser = await this.findByEmail(email);
      if (existingUser) {
        userService_log(`Admin user creation failed: email already exists: ${email}`);
        return {
          success: false,
          error: 'EMAIL_EXISTS'
        };
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, bcryptConfig.saltRounds);
      userService_log(`Password hashed successfully for admin user creation using ${bcryptConfig.SALT_ROUNDS} salt rounds`);

      // Create new user
      const newUser = await this.create({
        full_name,
        email,
        password: hashedPassword,
        role,
        status
      });

      if (!newUser) {
        userService_log('Admin user creation failed: could not create user');
        return {
          success: false,
          error: 'CREATE_FAILED'
        };
      }

      userService_log(`User created by admin successfully with ID: ${newUser.id}, role: ${role}`);

      return {
        success: true,
        data: {
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
          role: newUser.role,
          status: newUser.status,
          created_at: newUser.created_at
        }
      };

    } catch (error) {
      dbError_log(`Admin user creation error: ${error.message}`);
      return {
        success: false,
        error: 'CREATION_ERROR',
        details: error.message
      };
    }
  }

  /**
   * Update user by admin
   * @param {number} userId - User ID
   * @param {Object} updateData - Update data
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async updateUserByAdmin(userId, updateData) {
    userService_log(`Admin updating user ID: ${userId}, fields: ${Object.keys(updateData).join(', ')}`);

    try {
      // Check if user exists
      const existingUser = await this.findById(userId);
      if (!existingUser) {
        userService_log(`Admin update failed: user not found: ${userId}`);
        return {
          success: false,
          error: 'USER_NOT_FOUND'
        };
      }

      // If updating email, check if new email is duplicated
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailExists = await this.findByEmail(updateData.email);
        if (emailExists) {
          userService_log(`Admin update failed: email already exists: ${updateData.email}`);
          return {
            success: false,
            error: 'EMAIL_EXISTS'
          };
        }
      }

      // Update timestamp
      updateData.updated_at = new Date().toISOString();

      // Perform update
      const updateResult = await this.update(userId, updateData);

      if (!updateResult) {
        userService_log(`Admin update failed: could not update user: ${userId}`);
        return {
          success: false,
          error: 'UPDATE_FAILED'
        };
      }

      // Get user information after update
      const updatedUser = await this.findById(userId);

      userService_log(`User updated by admin successfully: ${userId}`);

      return {
        success: true,
        data: {
          id: updatedUser.id,
          full_name: updatedUser.full_name,
          email: updatedUser.email,
          role: updatedUser.role,
          status: updatedUser.status,
          created_at: updatedUser.created_at,
          updated_at: updatedUser.updated_at
        }
      };

    } catch (error) {
      dbError_log(`Admin user update error: ${error.message}`);
      return {
        success: false,
        error: 'UPDATE_ERROR',
        details: error.message
      };
    }
  }

  /**
   * Delete user by admin (admin can delete user/admin, Super Admin can delete all except super_admin)
   * @param {number} userId - User ID
   * @param {object} currentUser - Current user performing the deletion
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async deleteUserByAdmin(userId, currentUser) {
    userService_log(`Admin deleting user ID: ${userId} by user: ${currentUser.user_id} (${currentUser.role})`);

    try {
      // Cannot delete yourself
      if (userId === currentUser.user_id) {
        userService_log(`User ${currentUser.user_id} cannot delete their own account`);
        return {
          success: false,
          error: 'CANNOT_DELETE_YOURSELF'
        };
      }

      // Check if user exists
      const existingUser = await this.findById(userId);
      if (!existingUser) {
        userService_log(`Admin delete failed: user not found: ${userId}`);
        return {
          success: false,
          error: 'USER_NOT_FOUND'
        };
      }

      // Check deletion permissions based on target user's role
      const managementCheck = canManageUser(
        currentUser.role,
        existingUser.role,
        currentUser.user_id,
        userId
      );

      if (!managementCheck.canManage) {
        userService_log(`User ${currentUser.user_id} cannot delete user ${userId}: ${managementCheck.reason}`);
        return {
          success: false,
          error: 'CANNOT_DELETE_USER',
          details: managementCheck.reason
        };
      }

      // Perform deletion
      const result = await this.dbService.delete('DELETE FROM users WHERE id = ?', [userId]);

      if (result && result.success) {
        userService_log(`User deleted by admin successfully: ${userId} by user: ${currentUser.user_id}`);
        return {
          success: true
        };
      } else {
        userService_log(`Admin delete failed: could not delete user: ${userId}`);
        return {
          success: false,
          error: 'DELETE_FAILED'
        };
      }

    } catch (error) {
      dbError_log(`Admin user delete error: ${error.message}`);
      return {
        success: false,
        error: 'DELETE_ERROR',
        details: error.message
      };
    }
  }

  /**
   * Change user role (for Super Admin only)
   * @param {number} userId - User ID
   * @param {string} newRole - New role
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async changeUserRole(userId, newRole) {
    userService_log(`Changing role for user ID: ${userId} to ${newRole}`);

    try {
      const updateResult = await this.update(userId, {
        role: newRole,
        updated_at: new Date().toISOString()
      });

      if (updateResult) {
        userService_log(`Role changed successfully for user: ${userId} -> ${newRole}`);
        await this.invalidateUserCache(userId);
        return {
          success: true
        };
      } else {
        userService_log(`Failed to change role for user: ${userId}`);
        return {
          success: false,
          error: 'ROLE_CHANGE_FAILED'
        };
      }

    } catch (error) {
      dbError_log(`Error changing user role: ${error.message}`);
      return {
        success: false,
        error: 'ROLE_CHANGE_ERROR',
        details: error.message
      };
    }
  }

  /**
   * Get system statistics for admin
   * @param {Object} options - Options for filtering data
   * @param {boolean} options.excludeSuperAdmin - Whether to exclude super_admin data
   * @returns {Promise<Object>} System statistics
   */
  async getSystemStats(options = {}) {
    const { excludeSuperAdmin = false } = options;
    userService_log(`Getting system statistics, excludeSuperAdmin: ${excludeSuperAdmin}`);
    const metricsConfig = await this.getMetricsConfig();

    try {
      // Apply filter for super_admin exclusion
      let userFilter = '';
      let filterParams = [];

      if (excludeSuperAdmin) {
        userFilter = 'WHERE role != ?';
        filterParams = [ROLES.SUPER_ADMIN];
      }

      // Total users (excluding super_admin if requested)
      const totalUsers = await this.dbService.select(
        `SELECT COUNT(*) as count FROM users ${userFilter}`,
        filterParams,
        true
      );

      // Users by status (excluding super_admin if requested)
      const usersByStatus = await this.dbService.select(`
        SELECT 
          status,
          COUNT(*) as count 
        FROM users 
        ${userFilter}
        GROUP BY status
      `, filterParams);

      // Users by role (excluding super_admin if requested)
      const usersByRole = await this.dbService.select(`
        SELECT 
          role,
          COUNT(*) as count 
        FROM users 
        ${userFilter}
        GROUP BY role
      `, filterParams);

      // Recent registrations (last X days from config) - excluding super_admin if requested
      const recentRegistrations = await this.dbService.select(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= date('now', '-${metricsConfig.weeklyDays} days') ${excludeSuperAdmin ? 'AND role != ?' : ''}
      `, excludeSuperAdmin ? [ROLES.SUPER_ADMIN] : [], true);

      // Transform data for easier consumption
      const statusStats = {};
      usersByStatus.forEach(row => {
        statusStats[row.status] = row.count;
      });

      const roleStats = {};
      usersByRole.forEach(row => {
        roleStats[row.role] = row.count;
      });

      const stats = {
        totalUsers: totalUsers?.count || 0,
        activeUsers: statusStats.active || 0,
        inactiveUsers: statusStats.inactive || 0,
        suspendedUsers: statusStats.suspended || 0,
        usersByRole: roleStats,
        recentRegistrations: recentRegistrations?.count || 0
      };

      userService_log(`System stats retrieved (excludeSuperAdmin: ${excludeSuperAdmin}): ${JSON.stringify(stats)}`);
      return stats;

    } catch (error) {
      dbError_log(`Error getting system stats: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get detailed dashboard data for admin
   * @param {Object} options - Options for filtering data
   * @param {boolean} options.excludeSuperAdmin - Whether to exclude super_admin data
   * @returns {Promise<Object>} Dashboard data with comprehensive statistics
   */
  async getDashboardData(options = {}) {
    const { excludeSuperAdmin = false } = options;
    userService_log(`Getting comprehensive dashboard data, excludeSuperAdmin: ${excludeSuperAdmin}`);
    const metricsConfig = await this.getMetricsConfig();

    try {
      // Basic user statistics with optional super_admin exclusion
      let userFilter = '';
      let roleFilter = '';
      let filterParams = [];

      if (excludeSuperAdmin) {
        userFilter = 'WHERE role != ?';
        roleFilter = 'WHERE role != ?';
        filterParams = [ROLES.SUPER_ADMIN];
      }

      const totalUsers = await this.dbService.select(
        `SELECT COUNT(*) as count FROM users ${userFilter}`,
        filterParams,
        true
      );

      // Users by status (excluding super_admin if requested)
      const usersByStatus = await this.dbService.select(`
        SELECT 
          status,
          COUNT(*) as count 
        FROM users 
        ${userFilter}
        GROUP BY status
      `, filterParams);

      // Users by role (excluding super_admin if requested)
      const usersByRole = await this.dbService.select(`
        SELECT 
          role,
          COUNT(*) as count 
        FROM users 
        ${roleFilter}
        GROUP BY role
      `, filterParams);

      // Recent activity (last X days from config) - excluding super_admin if requested
      const recentActivity = await this.dbService.select(`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as registrations
        FROM users 
        WHERE created_at >= date('now', '-${metricsConfig.monthlyDays} days') ${excludeSuperAdmin ? 'AND role != ?' : ''}
        GROUP BY DATE(created_at)
        ORDER BY date DESC
      `, excludeSuperAdmin ? [ROLES.SUPER_ADMIN] : []);

      // Growth statistics - excluding super_admin if requested
      const last7Days = await this.dbService.select(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= date('now', '-${metricsConfig.weeklyDays} days') ${excludeSuperAdmin ? 'AND role != ?' : ''}
      `, excludeSuperAdmin ? [ROLES.SUPER_ADMIN] : [], true);

      const last30Days = await this.dbService.select(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= date('now', '-${metricsConfig.monthlyDays} days') ${excludeSuperAdmin ? 'AND role != ?' : ''}
      `, excludeSuperAdmin ? [ROLES.SUPER_ADMIN] : [], true);

      const last90Days = await this.dbService.select(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= date('now', '-${metricsConfig.quarterlyDays} days') ${excludeSuperAdmin ? 'AND role != ?' : ''}
      `, excludeSuperAdmin ? [ROLES.SUPER_ADMIN] : [], true);

      // Top 10 most recent users - excluding super_admin if requested
      const recentUsers = await this.dbService.select(`
        SELECT 
          id,
          full_name,
          email,
          role,
          status,
          created_at
        FROM users 
        ${userFilter}
        ORDER BY created_at DESC 
        LIMIT 10
      `, filterParams);

      // Role distribution percentages
      const totalCount = totalUsers?.count || 0;

      // Transform data for easier consumption
      const statusStats = {};
      usersByStatus.forEach(row => {
        statusStats[row.status] = {
          count: row.count,
          percentage: totalCount > 0 ? ((row.count / totalCount) * 100).toFixed(1) : 0
        };
      });

      const roleStats = {};
      usersByRole.forEach(row => {
        roleStats[row.role] = {
          count: row.count,
          percentage: totalCount > 0 ? ((row.count / totalCount) * 100).toFixed(1) : 0
        };
      });

      // Activity trend (compare with previous periods) - excluding super_admin if requested
      const previousWeek = await this.dbService.select(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= date('now', '-${metricsConfig.weeklyDays * 2} days') 
        AND created_at < date('now', '-${metricsConfig.weeklyDays} days')
        ${excludeSuperAdmin ? 'AND role != ?' : ''}
      `, excludeSuperAdmin ? [ROLES.SUPER_ADMIN] : [], true);

      const previousMonth = await this.dbService.select(`
        SELECT COUNT(*) as count 
        FROM users 
        WHERE created_at >= date('now', '-${metricsConfig.monthlyDays * 2} days') 
        AND created_at < date('now', '-${metricsConfig.monthlyDays} days')
        ${excludeSuperAdmin ? 'AND role != ?' : ''}
      `, excludeSuperAdmin ? [ROLES.SUPER_ADMIN] : [], true);

      // Calculate growth trends
      const last7DaysCount = last7Days?.count || 0;
      const last30DaysCount = last30Days?.count || 0;
      const previousWeekCount = previousWeek?.count || 0;
      const previousMonthCount = previousMonth?.count || 0;

      const weeklyGrowth = previousWeekCount > 0
        ? (((last7DaysCount - previousWeekCount) / previousWeekCount) * 100).toFixed(1)
        : last7DaysCount > 0 ? 100 : 0;

      const monthlyGrowth = previousMonthCount > 0
        ? (((last30DaysCount - previousMonthCount) / previousMonthCount) * 100).toFixed(1)
        : last30DaysCount > 0 ? 100 : 0;

      const dashboardData = {
        overview: {
          totalUsers: totalCount,
          activeUsers: statusStats.active?.count || 0,
          inactiveUsers: statusStats.inactive?.count || 0,
          suspendedUsers: statusStats.suspended?.count || 0
        },
        growth: {
          last7Days: last7DaysCount,
          last30Days: last30DaysCount,
          last90Days: last90Days?.count || 0,
          weeklyGrowthRate: `${weeklyGrowth}%`,
          monthlyGrowthRate: `${monthlyGrowth}%`
        },
        distribution: {
          byStatus: statusStats,
          byRole: roleStats
        },
        recentActivity: recentActivity.map(row => ({
          date: row.date,
          registrations: row.registrations
        })),
        recentUsers: recentUsers.map(user => ({
          id: user.id,
          full_name: user.full_name,
          email: user.email,
          role: user.role,
          status: user.status,
          created_at: user.created_at
        })),
        summary: {
          totalActiveRate: statusStats.active?.percentage || 0,
          adminCount: roleStats[ROLES.ADMIN]?.count || 0,
          superAdminCount: excludeSuperAdmin ? 0 : (roleStats[ROLES.SUPER_ADMIN]?.count || 0),
          regularUserCount: roleStats[ROLES.USER]?.count || 0
        }
      };

      userService_log(`Dashboard data retrieved successfully, excludeSuperAdmin: ${excludeSuperAdmin}`);
      return dashboardData;

    } catch (error) {
      dbError_log(`Error getting dashboard data: ${error.message}`);
      throw error;
    }
  }

  /**
   * Invalidate user cache
   * @param {number} userId - User ID
   */
  async invalidateUserCache(userId) {
    if (this.kvService.kv) {
      try {
        await this.kvService.deleteRaw(`user:cache:${userId}`);
        userService_log(`User cache invalidated for ID: ${userId}`);
      } catch (error) {
        userService_log(`Failed to invalidate user cache: ${error.message}`);
      }
    }
  }

  /**
   * Generate a secure random activation token
   * @returns {string} 64 character random token
   */
  generateActivationToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let token = '';
    for (let i = 0; i < 64; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return token;
  }

  /**
   * Create user with activation token
   * @param {Object} userData - User data
   * @param {number} tokenExpiryDays - Token expiry in days (default: 2)
   * @returns {Promise<Object|null>} Created user with activation token or null
   */
  async createWithActivationToken(userData, tokenExpiryDays = 2) {
    userService_log(`Creating new user with activation token: ${userData.email}`);

    try {
      const { full_name, email, password, role = DEFAULT_USER_ROLE, status = 'inactive' } = userData;

      const activationToken = this.generateActivationToken();
      const expiresAt = new Date(Date.now() + tokenExpiryDays * 24 * 60 * 60 * 1000).toISOString();

      const result = await this.dbService.insert(
        `INSERT INTO users (full_name, email, password, role, status, activation_token, activation_token_expires_at) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [full_name, email, password, role, status, activationToken, expiresAt]
      );

      if (result && result.success) {
        userService_log(`User created with activation token, ID: ${result.insertId}, expires: ${expiresAt}`);
        const user = await this.findById(result.insertId);
        return {
          ...user,
          activation_token: activationToken,
          activation_token_expires_at: expiresAt
        };
      }

      userService_log('Failed to create user with activation token');
      return null;
    } catch (error) {
      dbError_log(`Error creating user with activation token: ${error.message}`);
      return null;
    }
  }

  /**
   * Find user by activation token
   * @param {string} token - Activation token
   * @returns {Promise<Object|null>} User object or null
   */
  async findByActivationToken(token) {
    query_log('Finding user by activation token');

    try {
      const user = await this.dbService.select(
        `SELECT id, full_name, email, role, status, activation_token, activation_token_expires_at, 
                activated_at, disabled_by_admin, created_at 
         FROM users WHERE activation_token = ?`,
        [token],
        true
      );

      if (user) {
        userService_log(`User found by activation token, ID: ${user.id}`);
      } else {
        userService_log('No user found for activation token');
      }

      return user;
    } catch (error) {
      dbError_log(`Error finding user by activation token: ${error.message}`);
      return null;
    }
  }

  /**
   * Activate user account via token
   * Token is unique and sufficient to identify the user - no email needed in URL for security
   * @param {string} token - Activation token (unique identifier)
   * @returns {Promise<Object>} Activation result
   */
  async activateByToken(token) {
    userService_log('Attempting to activate user by token');

    try {
      const user = await this.findByActivationToken(token);

      if (!user) {
        userService_log('Activation failed: invalid token');
        return { success: false, error: 'INVALID_TOKEN', message: 'Invalid or expired activation token' };
      }

      // Check if token expired
      const now = new Date();
      const expiresAt = new Date(user.activation_token_expires_at);
      if (now > expiresAt) {
        userService_log('Activation failed: token expired');
        return { success: false, error: 'TOKEN_EXPIRED', message: 'Activation token has expired' };
      }

      // Check if user was disabled by admin (prevents re-activation)
      if (user.disabled_by_admin === 1) {
        userService_log('Activation failed: account disabled by admin');
        return {
          success: false,
          error: 'DISABLED_BY_ADMIN',
          message: 'Your account has been disabled by an administrator. Please contact support.'
        };
      }

      // Check if already active
      if (user.status === 'active') {
        userService_log('Account already active');
        return { success: true, alreadyActive: true, message: 'Account is already active' };
      }

      // Activate the account
      const activatedAt = new Date().toISOString();
      const updateResult = await this.dbService.update(
        'UPDATE users SET status = \'active\', activated_at = ?, activation_token = NULL WHERE id = ?',
        [activatedAt, user.id]
      );

      if (updateResult && updateResult.success) {
        userService_log(`User activated successfully, ID: ${user.id}`);
        await this.invalidateUserCache(user.id);
        return {
          success: true,
          user: {
            id: user.id,
            email: user.email,
            full_name: user.full_name,
            status: 'active',
            activated_at: activatedAt
          },
          message: 'Account activated successfully'
        };
      }

      userService_log('Activation failed: database update error');
      return { success: false, error: 'UPDATE_FAILED', message: 'Failed to activate account' };

    } catch (error) {
      dbError_log(`Error activating user: ${error.message}`);
      return { success: false, error: 'ACTIVATION_ERROR', message: error.message };
    }
  }

  /**
   * Disable user by admin (sets flag to prevent re-activation via link)
   * @param {number} userId - User ID
   * @param {boolean} setAdminFlag - Whether to set disabled_by_admin flag
   * @returns {Promise<boolean>} Success status
   */
  async disableUserByAdmin(userId, setAdminFlag = true) {
    userService_log(`Disabling user by admin, ID: ${userId}, setAdminFlag: ${setAdminFlag}`);

    try {
      const query = setAdminFlag
        ? 'UPDATE users SET status = \'inactive\', disabled_by_admin = 1 WHERE id = ?'
        : 'UPDATE users SET status = \'inactive\' WHERE id = ?';

      const result = await this.dbService.update(query, [userId]);

      if (result && result.success) {
        userService_log(`User disabled by admin successfully, ID: ${userId}`);
        await this.invalidateUserCache(userId);
        return true;
      }

      return false;
    } catch (error) {
      dbError_log(`Error disabling user by admin: ${error.message}`);
      return false;
    }
  }

  /**
   * Regenerate activation token for user
   * @param {number} userId - User ID
   * @param {number} tokenExpiryDays - Token expiry in days (default: 2)
   * @returns {Promise<Object|null>} New token info or null
   */
  async regenerateActivationToken(userId, tokenExpiryDays = 2) {
    userService_log(`Regenerating activation token for user ID: ${userId}`);

    try {
      const user = await this.findById(userId);
      if (!user) {
        return null;
      }

      // Don't regenerate if disabled by admin
      if (user.disabled_by_admin === 1) {
        userService_log('Cannot regenerate token: user disabled by admin');
        return { error: 'DISABLED_BY_ADMIN' };
      }

      const newToken = this.generateActivationToken();
      const expiresAt = new Date(Date.now() + tokenExpiryDays * 24 * 60 * 60 * 1000).toISOString();

      const result = await this.dbService.update(
        'UPDATE users SET activation_token = ?, activation_token_expires_at = ? WHERE id = ?',
        [newToken, expiresAt, userId]
      );

      if (result && result.success) {
        userService_log(`Activation token regenerated for user ID: ${userId}`);
        return {
          token: newToken,
          expiresAt
        };
      }

      return null;
    } catch (error) {
      dbError_log(`Error regenerating activation token: ${error.message}`);
      return null;
    }
  }

  /**
   * Request email change
   * @param {number} userId - User ID
   * @param {string} newEmail - New email address
   * @returns {Promise<{success: boolean, data?: Object, error?: string}>}
   */
  async requestEmailChange(userId, newEmail) {
    userService_log(`Requesting email change for user ${userId} to ${newEmail}`);

    try {
      // Check if new email is already in use
      const existingUser = await this.findByEmail(newEmail);
      if (existingUser) {
        return { success: false, error: 'EMAIL_ALREADY_EXISTS', message: 'Email is already in use' };
      }

      // Generate verification token
      const token = this.generateActivationToken(); // Reuse same token generator
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

      const { setClause, params } = this.dbService.buildSetClause({
        new_email: newEmail,
        email_verification_token: token,
        email_verification_expires_at: expiresAt.toISOString()
      });

      const paramsWithId = [...params, userId]; // params is a spreadable array

      const result = await this.dbService.update(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        paramsWithId
      );

      if (!result || !result.success) {
        return { success: false, error: 'UPDATE_FAILED', message: 'Failed to update user record' };
      }

      // Allow fetching user details to send email
      const user = await this.findById(userId);
      user.new_email = newEmail;
      user.email_verification_token = token;

      return { success: true, data: user };

    } catch (error) {
      dbError_log(`Error requesting email change: ${error.message}`);
      return { success: false, error: 'SYSTEM_ERROR', details: error.message };
    }
  }

  /**
   * Clear pending email change data for user
   * @param {number} userId - User ID
   * @returns {Promise<{success: boolean, error?: string, message?: string}>}
   */
  async clearPendingEmailChange(userId) {
    userService_log(`Clearing pending email change for user ${userId}`);

    try {
      const user = await this.findById(userId);

      if (!user) {
        return { success: false, error: 'USER_NOT_FOUND', message: 'User not found' };
      }

      if (!user.new_email) {
        return { success: false, error: 'NO_PENDING_EMAIL_CHANGE', message: 'No pending email change to clear' };
      }

      const { setClause, params } = this.dbService.buildSetClause({
        new_email: null,
        email_verification_token: null,
        email_verification_expires_at: null
      });

      const result = await this.dbService.update(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        [...params, userId]
      );

      if (!result || !result.success) {
        return { success: false, error: 'UPDATE_FAILED', message: 'Failed to clear pending email change' };
      }

      userService_log(`Pending email change cleared for user ${userId}`);
      return { success: true };
    } catch (error) {
      dbError_log(`Error clearing pending email change: ${error.message}`);
      return { success: false, error: 'SYSTEM_ERROR', details: error.message };
    }
  }

  /**
   * Find user by email verification token
   * @param {string} token - Verification token
   * @returns {Promise<Object|null>} User object
   */
  async findByEmailVerificationToken(token) {
    query_log('Finding user by email verification token');
    try {
      const user = await this.dbService.select(
        'SELECT * FROM users WHERE email_verification_token = ?',
        [token],
        true
      );
      if (!user) {return null;}
      return user;
    } catch (error) {
      dbError_log(`Error finding user by verification token: ${error.message}`);
      return null;
    }
  }

  /**
   * Verify and complete email change
   * @param {string} token - Verification token
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  async verifyEmailChange(token) {
    userService_log('Verifying email change token');

    try {
      const user = await this.findByEmailVerificationToken(token);

      if (!user) {
        return { success: false, error: 'INVALID_TOKEN', message: 'Token not found' };
      }

      if (!user.new_email) {
        return { success: false, error: 'INVALID_STATE', message: 'No pending email change' };
      }

      // Check expiry
      if (new Date(user.email_verification_expires_at) < new Date()) {
        return { success: false, error: 'TOKEN_EXPIRED', message: 'Token has expired' };
      }

      // Final check for collision (race condition)
      const collision = await this.findByEmail(user.new_email);
      if (collision && collision.id !== user.id) {
        return { success: false, error: 'EMAIL_TAKEN', message: 'New email is now taken' };
      }

      // Update email and clear pending fields
      const { setClause, params } = this.dbService.buildSetClause({
        email: user.new_email,
        new_email: null,
        email_verification_token: null,
        email_verification_expires_at: null
      });

      const paramsWithId = [...params, user.id];

      const result = await this.dbService.update(
        `UPDATE users SET ${setClause} WHERE id = ?`,
        paramsWithId
      );

      if (!result || !result.success) {
        return { success: false, error: 'UPDATE_FAILED', message: 'Failed to update email' };
      }

      userService_log(`Email updated successfully for user ${user.id} to ${user.new_email}`);
      return { success: true, updatedEmail: user.new_email, userId: user.id };

    } catch (error) {
      dbError_log(`Error verifying email change: ${error.message}`);
      return { success: false, error: 'SYSTEM_ERROR', details: error.message };
    }
  }
}
