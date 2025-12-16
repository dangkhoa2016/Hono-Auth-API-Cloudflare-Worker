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

/**
 * Service for managing operations with users table
 * Inherits optimized config management from BaseService
*/
export class UserService extends BaseService {
  constructor(env) {
    super(env, 'UserService');
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
        'SELECT id, full_name, email, password, role, status FROM users WHERE email = ?',
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
        'SELECT id, full_name, email, role, status, created_at FROM users WHERE id = ?',
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

      // Create new user with hashed password
      const newUser = await this.create({
        full_name,
        email,
        status: autoSetActiveStatus ? USER_STATUSES.ACTIVE : USER_STATUSES.INACTIVE, // Default is inactive, needs to be activated later
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
      return {
        success: true,
        data: {
          id: newUser.id,
          full_name: newUser.full_name,
          email: newUser.email,
          status: newUser.status,
          created_at: newUser.created_at
        }
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
    if (this.env.CONFIG_KV) {
      try {
        await this.env.CONFIG_KV.delete(`user:cache:${userId}`);
        userService_log(`User cache invalidated for ID: ${userId}`);
      } catch (error) {
        userService_log(`Failed to invalidate user cache: ${error.message}`);
      }
    }
  }
}
