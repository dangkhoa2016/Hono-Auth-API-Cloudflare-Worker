/**
 * Admin User Management Routes
 * Comprehensive admin endpoints for user management
*/

import { Hono } from 'hono';
// import { zValidator } from '@hono/zod-validator'; // Removed: using i18n validators only
import { createUserService } from '../utils/serviceFactory.js';
import { getSecuritySettings, getMetricsSettings } from '../utils/dynamicConfig.js';
import { authMiddleware } from '../middleware/auth.js';
import { requireAdmin, requireOwnerOrAdmin, requireDeletePermission } from '../middleware/authorization.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { adminRoutes_log, error_log } from '../utils/debug.js';
import { t, tSuccess } from '../i18n/index.js';
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';
// Import removed: now using i18n validators only
// import { createUserSchema, updateUserWithoutRoleSchema, userListQuerySchema } from '../schemas/user.js';
// import { roleChangeSchema } from '../schemas/admin.js';
import { ROLES, getRolesLowerOrEqual, hasHigherOrEqualRole, hasPermission } from '../constants/roles.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { handleStandardError } from '../utils/errorHandler.js';

const admin = new Hono();

// Apply auth middleware first to populate user context
admin.use('*', authMiddleware);

// Apply auto middleware for all admin routes
admin.use('*', unifiedMiddlewares.auto());


// =============================================================================
// USER MANAGEMENT ENDPOINTS
// =============================================================================

// GET /admin/users - Get users list (admin only)
admin.get('/users', requireAdmin, i18nValidatorsMiddleware.userListQuery('query'), async (c) => {
  const currentUser = c.get('user');

  adminRoutes_log(`Admin users list request by user: ${currentUser.user_id} (${currentUser.role})`);

  try {
    const queryParams = c.req.valid('query');
    const userService = createUserService(c.env);

    // Apply role filtering based on current user's role
    if (currentUser.role === ROLES.ADMIN) {
      // Admin can only see users with roles they can manage
      const allowedRoles = getRolesLowerOrEqual(currentUser.role);

      if (!queryParams.role) {
        // If no role filter specified, default to showing allowed roles only
        queryParams.roleFilter = allowedRoles;
      } else if (!allowedRoles.includes(queryParams.role)) {
        // If requesting a role they can't see, return empty result
        adminRoutes_log(`Admin ${currentUser.user_id} tried to access restricted role: ${queryParams.role}`);
        return c.json(createSuccessResponse({
          users: [],
          pagination: {
            total: 0,
            page: queryParams.page || 1,
            limit: queryParams.limit || 10,
            totalPages: 0
          }
        }, t(c, 'admin.restrictedRoleAccess', {
          requestedRole: t(c, 'roles.displayName', { context: queryParams.role }),
          currentRole: t(c, 'roles.displayName', { context: currentUser.role })
        })));
      }
    }
    // Super Admin has no restrictions - can see all users

    const result = await userService.getUsers(queryParams);

    adminRoutes_log(`Admin users list retrieved: ${result.users.length} users, total: ${result.total}`);

    // Enhanced message with pluralization and formatting
    const successMessage = t(c, 'admin.usersListRetrieved', {
      count: result.users.length,
      displayedCount: result.users.length,
      currentPage: result.page,
      totalPages: result.totalPages,
      totalUsers: result.total,
      requestedBy: t(c, 'admin.requestedByUser', {
        username: currentUser.full_name || currentUser.email,
        role: t(c, 'roles.displayName', { context: currentUser.role })
      })
    });

    return c.json(createSuccessResponse({
      users: result.users,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    }, successMessage));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve users list', error_log, 'errors.user.listFailed');
  }
});

// GET /admin/users/:id - Get specific user (admin or owner)
admin.get('/users/:id', requireOwnerOrAdmin('id'), async (c) => {
  const currentUser = c.get('user');
  const userId = parseInt(c.req.param('id'));

  adminRoutes_log(`Admin user details request by user: ${currentUser.user_id} (${currentUser.role}) for user: ${userId}`);

  try {
    const userService = createUserService(c.env);
    const userDetails = await userService.findById(userId);

    if (!userDetails) {
      adminRoutes_log(`Admin user details failed: user not found: ${userId}`);
      return await handleStandardError(c, new Error('NOT_FOUND'), 'Admin get user details - not found', adminRoutes_log, 'user.notFound', { userName: `User ID: ${userId}` }, 404);
    }

    adminRoutes_log(`Admin user details retrieved for user: ${userId}`);

    // Enhanced success message with user information
    const successMessage = tSuccess(c, 'admin.userDetailsRetrieved', {
      userName: userDetails.full_name || userDetails.email,
      userRole: t(c, 'roles.displayName', { context: userDetails.role }),
      userStatus: t(c, 'user.statusDisplay', { status: userDetails.status }),
      joinedDate: t(c, 'dates.userJoined', { date: userDetails.created_at }),
      requestedBy: t(c, 'admin.requestedByUser', {
        username: currentUser.full_name || currentUser.email,
        role: t(c, 'roles.displayName', { context: currentUser.role })
      })
    });

    return c.json(createSuccessResponse({
      id: userDetails.id,
      full_name: userDetails.full_name,
      email: userDetails.email,
      role: userDetails.role,
      status: userDetails.status,
      created_at: userDetails.created_at,
      updated_at: userDetails.updated_at
    }, successMessage));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve user details', error_log, 'errors.user.notFound');
  }
});

// POST /admin/users - Create new user (admin only)
admin.post('/users', requireAdmin, i18nValidatorsMiddleware.createUser(), async (c) => {
  const currentUser = c.get('user');

  adminRoutes_log(`Admin user creation request by user: ${currentUser.user_id} (${currentUser.role})`);

  try {
    const userData = c.req.valid('json');
    const userService = createUserService(c.env);

    // Check permission to create user with higher role
    // Admin cannot create role higher than theirs
    if (!hasHigherOrEqualRole(currentUser.role, userData.role)) {
      adminRoutes_log(`User ${currentUser.user_id} (${currentUser.role}) denied creating user with higher role: ${userData.role}`);
      return await handleStandardError(c, new Error('FORBIDDEN_ROLE'), 'Admin create user - higher role forbidden', adminRoutes_log, 'auth.cannotCreateHigherRole', {
        currentRole: t(c, 'roles.displayName', { context: currentUser.role }),
        requestedRole: t(c, 'roles.displayName', { context: userData.role })
      }, 403);
    }

    const result = await userService.createUserByAdmin(userData);

    if (!result.success) {
      if (result.error === 'EMAIL_EXISTS') {
        adminRoutes_log(`Admin user creation failed: email exists: ${userData.email}`);
        return await handleStandardError(c, new Error('EMAIL_EXISTS'), 'Admin create user - email exists', adminRoutes_log, 'user.emailAlreadyExists', {
          email: userData.email,
          suggestion: t(c, 'user.emailSuggestion', { domain: userData.email.split('@')[1] })
        }, 409);
      }

      adminRoutes_log(`Admin user creation failed: ${result.error}`);
      return await handleStandardError(c, new Error(result.error), 'Admin user creation failed', error_log, 'system.operationFailed', {
        operation: t(c, 'admin.operations.createUser'),
        reason: result.error
      }, 500);
    }

    adminRoutes_log(`Admin user created successfully by user: ${currentUser.user_id}, new user ID: ${result.data.id}`);

    // Enhanced success message with user creation details
    const successMessage = t(c, 'admin.userCreatedSuccessfully', {
      userName: result.data.full_name || result.data.email,
      newUserRole: t(c, 'roles.displayName', { context: result.data.role }),
      createdBy: t(c, 'admin.createdByUser', {
        username: currentUser.full_name || currentUser.email,
        role: t(c, 'roles.displayName', { context: currentUser.role })
      }),
      timestamp: t(c, 'dates.createdAt', { date: new Date().toISOString() })
    });

    return c.json(createSuccessResponse(result.data, successMessage), 201);

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to create user', error_log, 'errors.user.createFailed');
  }
});

// PUT /admin/users/:id - Update user information (admin or owner)
admin.put('/users/:id', requireOwnerOrAdmin('id'), i18nValidatorsMiddleware.updateUserWithoutRole(), async (c) => {
  const currentUser = c.get('user');
  const userId = parseInt(c.req.param('id'));

  adminRoutes_log(`Admin user update request by user: ${currentUser.user_id} (${currentUser.role}) for user: ${userId}`);

  try {
    const updateData = c.req.valid('json');
    const userService = createUserService(c.env);

    // Ensure that role is not changed through this endpoint
    // Role can only be changed through separate /admin/users/:id/role endpoint
    if (updateData.role) {
      delete updateData.role;
      adminRoutes_log(`Role parameter removed from update data for user: ${userId}`);
    }

    const result = await userService.updateUserByAdmin(userId, updateData);

    if (!result.success) {
      if (result.error === 'USER_NOT_FOUND') {
        adminRoutes_log(`Admin user update failed: user not found: ${userId}`);
        return await handleStandardError(c, new Error('NOT_FOUND'), 'Admin update user - not found', adminRoutes_log, 'user.notFoundById', { userId }, 404);
      }

      if (result.error === 'EMAIL_EXISTS') {
        adminRoutes_log(`Admin user update failed: email exists: ${updateData.email}`);
        return await handleStandardError(c, new Error('EMAIL_EXISTS'), 'Admin update user - email exists', adminRoutes_log, 'user.emailAlreadyExists', {
          email: updateData.email,
          userId: userId,
          suggestion: t(c, 'user.emailUpdateSuggestion')
        }, 409);
      }

      adminRoutes_log(`Admin user update failed: ${result.error}`);
      return await handleStandardError(c, new Error(result.error), 'Admin user update failed', error_log, 'system.operationFailed', {
        operation: t(c, 'admin.operations.updateUser', { userId }),
        reason: result.error
      }, 500);
    }

    adminRoutes_log(`Admin user updated successfully by user: ${currentUser.user_id}, updated user: ${userId}`);

    // Enhanced success message with update details
    const successMessage = t(c, 'admin.userUpdatedSuccessfully', {
      updatedUserName: result.data.full_name || result.data.email,
      updatedBy: t(c, 'admin.updatedByUser', {
        username: currentUser.full_name || currentUser.email,
        role: t(c, 'roles.displayName', { context: currentUser.role })
      }),
      timestamp: t(c, 'dates.updatedAt', { date: new Date().toISOString() })
    });

    return c.json(createSuccessResponse(result.data, successMessage));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to update user', error_log, 'errors.user.updateFailed');
  }
});

// DELETE /admin/users/:id - Delete user (admin can delete user/admin, Super Admin can delete all)
admin.delete('/users/:id', requireDeletePermission, async (c) => {
  const currentUser = c.get('user');
  const userId = parseInt(c.req.param('id'));

  adminRoutes_log(`Admin user deletion request by user: ${currentUser.user_id} (${currentUser.role}) for user: ${userId}`);

  // Do not allow admin to delete their own account
  if (userId === currentUser.user_id) {
    adminRoutes_log(`Admin ${currentUser.user_id} cannot delete their own account`);
    return await handleStandardError(c, new Error('CANNOT_DELETE_SELF'), 'Admin delete user - cannot delete own account', adminRoutes_log, 'auth.cannotDeleteOwnAccount', {
      userName: currentUser.full_name || currentUser.email,
      role: t(c, 'roles.displayName', { context: currentUser.role }),
      suggestion: t(c, 'admin.accountDeletionSuggestion')
    }, 403);
  }

  try {
    const userService = createUserService(c.env);

    const result = await userService.deleteUserByAdmin(userId, currentUser);

    if (!result.success) {
      if (result.error === 'USER_NOT_FOUND') {
        adminRoutes_log(`Admin user deletion failed: user not found: ${userId}`);
        return await handleStandardError(c, new Error('NOT_FOUND'), 'Admin delete user - not found', adminRoutes_log, 'user.notFoundById', { userId }, 404);
      }

      if (result.error === 'CANNOT_DELETE_SUPER_ADMIN') {
        adminRoutes_log(`Admin user deletion failed: cannot delete Super Admin: ${userId}`);
        return await handleStandardError(c, new Error('CANNOT_DELETE_SUPER_ADMIN'), 'Admin delete user - cannot delete super admin', adminRoutes_log, 'auth.cannotDeleteSuperAdmin', {
          targetRole: t(c, 'roles.displayName', { context: ROLES.SUPER_ADMIN }),
          currentRole: t(c, 'roles.displayName', { context: currentUser.role }),
          reason: t(c, 'admin.protectionReason.superAdmin')
        }, 403);
      }

      if (result.error === 'CANNOT_DELETE_YOURSELF') {
        adminRoutes_log(`Admin user deletion failed: cannot delete own account: ${userId}`);
        return await handleStandardError(c, new Error('CANNOT_DELETE_SELF'), 'Admin delete user - cannot delete own account', adminRoutes_log, 'auth.cannotDeleteOwnAccount', {
          userName: currentUser.full_name || currentUser.email,
          suggestion: t(c, 'admin.accountDeletionSuggestion')
        }, 403);
      }

      adminRoutes_log(`Admin user deletion failed: ${result.error}`);
      return await handleStandardError(c, new Error(result.error), 'Admin user deletion failed', error_log, 'system.operationFailed', {
        operation: t(c, 'admin.operations.deleteUser', { userId }),
        reason: result.error
      }, 500);
    }

    adminRoutes_log(`Admin user deleted successfully by user: ${currentUser.user_id}, deleted user: ${userId}`);

    // Enhanced success message with deletion details
    const successMessage = t(c, 'admin.userDeletedSuccessfully', {
      deletedBy: t(c, 'admin.deletedByUser', {
        username: currentUser.full_name || currentUser.email,
        role: t(c, 'roles.displayName', { context: currentUser.role })
      }),
      timestamp: t(c, 'dates.deletedAt', { date: new Date().toISOString() }),
      action: t(c, 'admin.actions.permanentDeletion')
    });

    return c.json(createSuccessResponse({
      message: successMessage
    }, successMessage));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to delete user', error_log, 'errors.user.deleteFailed');
  }
});

// PUT /admin/users/:id/role - Change user role (admin and Super Admin)
admin.put('/users/:id/role', requireAdmin, i18nValidatorsMiddleware.roleChange(), async (c) => {
  const currentUser = c.get('user');
  const userId = parseInt(c.req.param('id'));

  adminRoutes_log(`Role change request by user: ${currentUser.user_id} (${currentUser.role}) for user: ${userId}`);

  try {
    const { role } = c.req.valid('json');

    // Do not allow changing own role
    if (userId === currentUser.user_id) {
      adminRoutes_log(`User ${currentUser.user_id} cannot change their own role`);
      return await handleStandardError(c, new Error('CANNOT_CHANGE_OWN_ROLE'), 'Admin change role - cannot change own role', adminRoutes_log, 'auth.cannotChangeOwnRole', {
        userName: currentUser.full_name || currentUser.email,
        currentRole: t(c, 'roles.displayName', { context: currentUser.role }),
        reason: t(c, 'admin.protectionReason.roleChange')
      }, 403);
    }

    // User can only change role to lower or equal role than theirs
    if (!hasHigherOrEqualRole(currentUser.role, role)) {
      adminRoutes_log(`User ${currentUser.user_id} (${currentUser.role}) denied changing role to higher role: ${role}`);
      return await handleStandardError(c, new Error('HIGHER_ROLE_FORBIDDEN'), 'Admin change role - higher role forbidden', adminRoutes_log, 'auth.cannotPromoteToHigherRole', {
        currentRole: t(c, 'roles.displayName', { context: currentUser.role }),
        requestedRole: t(c, 'roles.displayName', { context: role }),
        reason: t(c, 'admin.protectionReason.hierarchy')
      }, 403);
    }

    // Get user information for role change
    const userService = createUserService(c.env);
    const targetUser = await userService.findById(userId);

    if (!targetUser) {
      adminRoutes_log(`Role change failed: user not found: ${userId}`);
      return await handleStandardError(c, new Error('NOT_FOUND'), 'Admin change role - user not found', adminRoutes_log, 'user.notFoundById', { userId }, 404);
    }

    // User cannot change role of user with higher role
    if (!hasHigherOrEqualRole(currentUser.role, targetUser.role)) {
      adminRoutes_log(`User ${currentUser.user_id} (${currentUser.role}) denied changing role of higher privileged user: ${userId} (${targetUser.role})`);
      return await handleStandardError(c, new Error('HIGHER_PRIVILEGE_TARGET'), 'Admin change role - target higher privileged', adminRoutes_log, 'auth.cannotModifyHigherRoleUser', {
        targetUserName: targetUser.full_name || targetUser.email,
        targetRole: t(c, 'roles.displayName', { context: targetUser.role }),
        currentRole: t(c, 'roles.displayName', { context: currentUser.role }),
        reason: t(c, 'admin.protectionReason.higherPrivilege')
      }, 403);
    }

    const result = await userService.changeUserRole(userId, role);

    if (!result.success) {
      if (result.error === 'USER_NOT_FOUND') {
        adminRoutes_log(`Role change failed: user not found: ${userId}`);
        return await handleStandardError(c, new Error('NOT_FOUND'), 'Admin change role - user not found (after service call)', adminRoutes_log, 'user.notFoundById', { userId }, 404);
      }

      adminRoutes_log(`Role change failed: ${result.error}`);
      return await handleStandardError(c, new Error(result.error), 'Failed to change role (service error)', error_log, 'system.serverError');
    }

    adminRoutes_log(`Role changed successfully by user: ${currentUser.user_id} (${currentUser.role}), user: ${userId} -> ${role}`);

    // Enhanced success message with role change details
    const successMessage = t(c, 'admin.roleChangedSuccessfully', {
      targetUserName: targetUser.full_name || targetUser.email,
      oldRole: t(c, 'roles.displayName', { context: targetUser.role }),
      newRole: t(c, 'roles.displayName', { context: role }),
      changedBy: t(c, 'admin.changedByUser', {
        username: currentUser.full_name || currentUser.email,
        role: t(c, 'roles.displayName', { context: currentUser.role })
      }),
      timestamp: t(c, 'dates.changedAt', { date: new Date().toISOString() }),
      effectiveImmediately: t(c, 'admin.effectiveImmediately')
    });

    return c.json(createSuccessResponse({
      message: successMessage,
      userId: userId,
      newRole: role
    }, successMessage));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to change user role', error_log, 'errors.user.roleChangeFailed');
  }
});

// =============================================================================
// ADMIN STATISTICS ENDPOINTS
// =============================================================================

// GET /admin/dashboard - Overview dashboard with detailed information (admin only)
admin.get('/dashboard', requireAdmin, async (c) => {
  const currentUser = c.get('user');

  adminRoutes_log(`Admin dashboard request by user: ${currentUser.user_id} (${currentUser.role})`);

  try {
    const userService = createUserService(c.env);

    // Apply role-based filtering for dashboard data
    let dashboardData;
    if (currentUser.role === ROLES.SUPER_ADMIN) {
      // Super Admin can see all data
      dashboardData = await userService.getDashboardData();
      adminRoutes_log('Super Admin: Full dashboard data retrieved');
    } else if (hasPermission(currentUser.role, 'canViewDashboard')) {
      // Admin can only see limited data (excluding super_admin info)
      dashboardData = await userService.getDashboardData({ excludeSuperAdmin: true });
      adminRoutes_log(`${currentUser.role}: Limited dashboard data retrieved (excluding super_admin data)`);
    } else {
      // This shouldn't happen due to requireAdmin middleware, but just in case
      adminRoutes_log(`Unauthorized dashboard access attempt by role: ${currentUser.role}`);
      return await handleStandardError(c, new Error('FORBIDDEN'), 'Admin dashboard forbidden access', adminRoutes_log, 'auth.forbidden', { operation: t(c, 'admin.operations.adminDashboardAccess') }, 403);
    }

    // Filter recent users based on role permissions
    let filteredRecentUsers = dashboardData.recentUsers;
    if (!hasPermission(currentUser.role, 'canViewSuperAdminData')) {
      // Users without Super Admin view permission cannot see super_admin users
      filteredRecentUsers = dashboardData.recentUsers.filter(user => user.role !== ROLES.SUPER_ADMIN);
      adminRoutes_log(`${currentUser.role}: Filtered recent users, removed ${dashboardData.recentUsers.length - filteredRecentUsers.length} super_admin users`);
    }

    adminRoutes_log('Admin dashboard data retrieved successfully');

    // Enhanced success message with dashboard statistics
    const successMessage = t(c, 'admin.dashboardDataRetrieved', {
      totalUsers: t(c, 'admin.totalUsersCount', {
        count: dashboardData.overview.totalUsers
      }),
      accessLevel: currentUser.role === ROLES.SUPER_ADMIN ?
        t(c, 'admin.accessLevel.full') : t(c, 'admin.accessLevel.limited'),
      requestedBy: t(c, 'admin.requestedByUser', {
        username: currentUser.full_name || currentUser.email,
        role: t(c, 'roles.displayName', { context: currentUser.role })
      }),
      dataFreshness: t(c, 'admin.dataFreshness', {
        timestamp: new Date().toISOString()
      })
    });

    return c.json(createSuccessResponse({
      overview: dashboardData.overview,
      growth: dashboardData.growth,
      distribution: dashboardData.distribution,
      recentActivity: dashboardData.recentActivity,
      recentUsers: filteredRecentUsers,
      summary: dashboardData.summary,
      permissions: {
        canViewSuperAdminData: hasPermission(currentUser.role, 'canViewSuperAdminData'),
        accessLevel: hasPermission(currentUser.role, 'canViewSuperAdminData') ? 'full' : 'limited'
      },
      metadata: {
        generatedAt: new Date().toISOString(),
        requestedBy: {
          userId: currentUser.user_id,
          role: currentUser.role
        }
      }
    }, successMessage));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve dashboard data', error_log, 'errors.admin.dashboardRetrieveFailed');
  }
});

// GET /admin/stats - Overview statistics (admin only)
admin.get('/stats', requireAdmin, async (c) => {
  const currentUser = c.get('user');

  adminRoutes_log(`Admin stats request by user: ${currentUser.user_id} (${currentUser.role})`);

  try {
    const userService = createUserService(c.env);

    // Apply role-based filtering for stats data
    const excludeSuperAdmin = currentUser.role !== ROLES.SUPER_ADMIN;
    const stats = await userService.getSystemStats({ excludeSuperAdmin });

    if (excludeSuperAdmin) {
      adminRoutes_log(`Admin stats filtered for role: ${currentUser.role} (excluded super_admin data)`);
    }

    adminRoutes_log('Admin stats retrieved successfully');

    // Enhanced success message with statistics details
    const successMessage = t(c, 'admin.statisticsRetrieved', {
      totalUsers: t(c, 'admin.totalUsersCount', {
        count: stats.totalUsers
      }),
      activeUsers: t(c, 'admin.activeUsersCount', {
        count: stats.activeUsers,
        percentage: t(c, 'numbers.percentage', {
          value: ((stats.activeUsers / stats.totalUsers) * 100).toFixed(1)
        })
      }),
      dataScope: excludeSuperAdmin ?
        t(c, 'admin.dataScope.limited') : t(c, 'admin.dataScope.full'),
      requestedBy: t(c, 'admin.requestedByUser', {
        username: currentUser.full_name || currentUser.email,
        role: t(c, 'roles.displayName', { context: currentUser.role })
      })
    });

    return c.json(createSuccessResponse({
      totalUsers: stats.totalUsers,
      activeUsers: stats.activeUsers,
      inactiveUsers: stats.inactiveUsers,
      suspendedUsers: stats.suspendedUsers,
      usersByRole: stats.usersByRole,
      recentRegistrations: stats.recentRegistrations
    }, successMessage));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve statistics', error_log, 'errors.admin.statsRetrieveFailed');
  }
});

// GET /admin/system-health - Comprehensive system health check (admin only)
// GET /admin/system-health - System health check (admin only)
admin.get('/system-health', requireAdmin, async (c) => {
  const currentUser = c.get('user');

  adminRoutes_log(`Admin system health request by user: ${currentUser.user_id} (${currentUser.role})`);

  try {
    const userService = createUserService(c.env);
    const securityConfig = await getSecuritySettings(c.env);
    const metricsConfig = await getMetricsSettings(c.env);
    const dbService = userService.dbService;

    const startTime = Date.now();

    // Basic health checks
    const databaseHealth = await dbService.healthCheck();
    const databaseInfo = await dbService.getDatabaseInfo();
    const databaseMetrics = await dbService.getDatabaseMetrics(metricsConfig, securityConfig);

    // System statistics with role-based filtering
    const excludeSuperAdmin = currentUser.role !== ROLES.SUPER_ADMIN;
    const systemStats = await userService.getSystemStats({ excludeSuperAdmin });

    // Calculate overall system response time
    const totalResponseTime = Date.now() - startTime;

    // Determine overall system health status
    const isHealthy = databaseHealth &&
                     databaseMetrics.performance.isResponsive &&
                     databaseMetrics.performance.testQuerySuccess;

    // Security assessment using environment configuration
    const securityStatus = {
      recentFailedLogins: databaseMetrics.security.recentFailures1h,
      totalFailedAttempts: databaseMetrics.security.totalFailedAttempts,
      uniqueIpsWithFailures: databaseMetrics.security.uniqueIpsWithFailures,
      riskLevel: databaseMetrics.security.recentFailures1h > securityConfig.highRiskThreshold ? 'high' :
        databaseMetrics.security.recentFailures1h > (securityConfig.highRiskThreshold / 2) ? 'medium' : 'low'
    };

    // Performance assessment using environment configuration
    const performanceStatus = {
      responseTime: `${totalResponseTime}ms`,
      databaseResponseTime: databaseMetrics.performance.queryResponseTime,
      isPerformant: totalResponseTime < (securityConfig.performanceGoodThreshold * 2) && databaseMetrics.performance.isResponsive,
      performanceGrade: totalResponseTime < (securityConfig.performanceGoodThreshold / 2) ? 'excellent' :
        totalResponseTime < securityConfig.performanceGoodThreshold ? 'good' :
          totalResponseTime < (securityConfig.performanceGoodThreshold * 2) ? 'fair' : 'poor'
    };

    if (excludeSuperAdmin) {
      adminRoutes_log(`System health data filtered for role: ${currentUser.role} (excluded super_admin data)`);
    }

    adminRoutes_log(`System health check completed in ${totalResponseTime}ms, healthy: ${isHealthy}`);

    // Enhanced success message with system health details
    const successMessage = t(c, 'admin.systemHealthRetrieved', {
      healthStatus: isHealthy ?
        t(c, 'admin.systemStatus.healthy') : t(c, 'admin.systemStatus.unhealthy'),
      responseTime: t(c, 'admin.responseTime', {
        time: totalResponseTime,
        unit: 'ms'
      }),
      performanceGrade: t(c, 'admin.performanceGrade', {
        grade: performanceStatus.performanceGrade
      }),
      securityRisk: t(c, 'admin.securityRisk', {
        level: securityStatus.riskLevel,
        failedAttempts: t(c, 'admin.failedLoginAttempts', {
          count: securityStatus.recentFailedLogins
        })
      }),
      checkedBy: t(c, 'admin.checkedByUser', {
        username: currentUser.full_name || currentUser.email,
        role: t(c, 'roles.displayName', { context: currentUser.role })
      }),
      timestamp: t(c, 'dates.checkedAt', { date: new Date().toISOString() })
    });

    return c.json(createSuccessResponse({
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${totalResponseTime}ms`,
      environment: c.get('environment') || 'unknown',
      database: {
        isConnected: databaseHealth,
        info: databaseInfo,
        metrics: databaseMetrics
      },
      system: {
        statistics: systemStats,
        performance: performanceStatus,
        security: securityStatus
      },
      healthChecks: {
        database: databaseHealth ? 'pass' : 'fail',
        performance: performanceStatus.isPerformant ? 'pass' : 'warn',
        security: securityStatus.riskLevel === 'low' ? 'pass' :
          securityStatus.riskLevel === 'medium' ? 'warn' : 'fail'
      },
      metadata: {
        checkedBy: {
          userId: currentUser.user_id,
          role: currentUser.role
        },
        accessLevel: currentUser.role === ROLES.SUPER_ADMIN ? 'full' : 'limited',
        canViewSuperAdminData: currentUser.role === ROLES.SUPER_ADMIN
      }
    }, successMessage));

  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve system health', error_log, 'errors.admin.systemHealthRetrieveFailed');
  }
});

export default admin;
