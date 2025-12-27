/**
 * Authorization Middleware
 * Check access permissions based on user role
*/

import { t } from '../i18n/index.js';
import { authMiddleware_log, error_log } from '../utils/debug.js';
import { handleStandardError } from '../utils/errorHandler.js';
import {
  ROLES,
  SUPER_ADMIN_USER_ID,
  hasPermission
} from '../constants/roles.js';

/**
 * Middleware to check admin permissions
 * Only allow admin and super_admin access
*/
export const requireAdmin = async (c, next) => {
  const user = c.get('user');

  if (!user) {
    error_log('Authorization: No user found in context');
    return await handleStandardError(c, new Error('UNAUTHORIZED'), 'Authorization: missing user', error_log, 'auth.unauthorized', { resource: '[Admin route]' }, 401);
  }

  authMiddleware_log(`Authorization check for user ${user.user_id}, role: ${user.role}`);

  // Check admin route permissions
  if (!hasPermission(user.role, 'canAccessAdminRoutes')) {
    authMiddleware_log(`Access denied for user ${user.user_id}: insufficient privileges`);
    return await handleStandardError(c, new Error('FORBIDDEN'), 'Authorization: insufficient privileges', authMiddleware_log, 'auth.forbidden', { operation: t(c, 'admin.operations.adminRoutesAccess') }, 403);
  }

  await next();
};

/**
 * Middleware to check specific role requirement
 * @param {string|Array} requiredRoles - The role(s) required to access the route
 * @returns {Function} Middleware function
*/
export const requireRole = (requiredRoles) => {
  return async (c, next) => {
    const user = c.get('user');

    if (!user) {
      error_log('Authorization: No user found in context');
      return await handleStandardError(c, new Error('UNAUTHORIZED'), 'Role check: missing user', error_log, 'auth.unauthorized', { resource: '[Protected route]' }, 401);
    }

    // Normalize to array for consistent processing
    const rolesArray = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

    authMiddleware_log(`Role check for user ${user.user_id}, required: ${rolesArray.join(',')}, actual: ${user.role}`);

    // Check if user has any of the required roles
    if (!rolesArray.includes(user.role)) {
      authMiddleware_log(`Access denied for user ${user.user_id}: role ${user.role} does not match required ${rolesArray.join(',')}`);
      return await handleStandardError(c, new Error('FORBIDDEN'), 'Role check: role not permitted', authMiddleware_log, 'auth.forbidden', { operation: t(c, 'admin.operations.adminRoutesAccess') }, 403);
    }

    await next();
  };
};

/**
 * Middleware to check Super Admin permissions
 * Only allow super_admin access
*/
export const requireSuperAdmin = async (c, next) => {
  const user = c.get('user');

  if (!user) {
    error_log('Authorization: No user found in context');
    return await handleStandardError(c, new Error('UNAUTHORIZED'), 'Super admin check: missing user', error_log, 'auth.unauthorized', { resource: '[Super Admin route]' }, 401);
  }

  authMiddleware_log(`Super Admin check for user ${user.user_id}, role: ${user.role}`);

  // Check if user is super_admin with correct ID
  if (user.user_id !== SUPER_ADMIN_USER_ID || user.role !== ROLES.SUPER_ADMIN) {
    authMiddleware_log(`Super Admin access denied for user ${user.user_id}`);
    return await handleStandardError(c, new Error('SUPER_ADMIN_REQUIRED'), 'Super admin check failed', authMiddleware_log, 'auth.superAdminRequired', {}, 403);
  }

  await next();
};

/**
 * Middleware to check access permissions for user resources
 * Allow user to access their own resources, admin to access based on permissions
*/
export const requireOwnerOrAdmin = (resourceUserIdParam = 'id') => {
  return async (c, next) => {
    const currentUser = c.get('user');
    const resourceUserId = parseInt(c.req.param(resourceUserIdParam));

    if (!currentUser) {
      error_log('Authorization: No user found in context');
      return await handleStandardError(c, new Error('UNAUTHORIZED'), 'Owner/Admin check: missing user', error_log, 'auth.unauthorized', { resource: '[Owner/Admin resource]' }, 401);
    }

    authMiddleware_log(`Resource access check: user ${currentUser.user_id} (${currentUser.role}) accessing resource of user ${resourceUserId}`);

    // Super Admin has access to all resources
    if (currentUser.role === ROLES.SUPER_ADMIN) {
      return await next();
    }

    // Admin has access to all resources except super_admin
    if (currentUser.role === ROLES.ADMIN) {
      if (resourceUserId === SUPER_ADMIN_USER_ID) {
        authMiddleware_log(`Admin ${currentUser.user_id} denied access to Super Admin resource`);
        return await handleStandardError(c, new Error('FORBIDDEN_SUPER_ADMIN'), 'Admin cannot access super admin resource', authMiddleware_log, 'auth.cannotAccessSuperAdmin', {}, 403);
      }
      return await next();
    }

    // User can only access their own resources
    if (currentUser.role === ROLES.USER) {
      if (currentUser.user_id !== resourceUserId) {
        authMiddleware_log(`User ${currentUser.user_id} denied access to resource of user ${resourceUserId}`);
        return await handleStandardError(c, new Error('FORBIDDEN_OTHER_USER'), 'User cannot access other user resource', authMiddleware_log, 'auth.cannotAccessOtherUsers', {}, 403);
      }
      return await next();
    }

    // Invalid role
    error_log(`Invalid role for user ${currentUser.user_id}: ${currentUser.role}`);
    return await handleStandardError(c, new Error('INVALID_ROLE'), 'Invalid role encountered', error_log, 'auth.invalidRole', {}, 403);
  };
};

/**
 * Middleware to check user deletion permissions
 * Use permission system from roles.js to determine deletion rights
*/
export const requireDeletePermission = async (c, next) => {
  const currentUser = c.get('user');
  const targetUserId = parseInt(c.req.param('id'));

  if (!currentUser) {
    error_log('Authorization: No user found in context');
    return await handleStandardError(c, new Error('UNAUTHORIZED'), 'Delete permission: missing user', error_log, 'auth.unauthorized', { resource: '[Deletion]' }, 401);
  }

  authMiddleware_log(`Delete permission check: user ${currentUser.user_id} (${currentUser.role}) trying to delete user ${targetUserId}`);

  // Check user deletion permissions
  if (!hasPermission(currentUser.role, 'canDeleteUsers')) {
    authMiddleware_log(`Delete denied: user ${currentUser.user_id} does not have delete privileges`);
    return await handleStandardError(c, new Error('DELETE_NOT_ALLOWED'), 'Delete permission: insufficient privileges', authMiddleware_log, 'auth.deleteNotAllowed', {}, 403);
  }

  // Cannot delete super_admin
  if (targetUserId === SUPER_ADMIN_USER_ID) {
    authMiddleware_log(`User ${currentUser.user_id} cannot delete Super Admin`);
    return await handleStandardError(c, new Error('CANNOT_DELETE_SUPER_ADMIN'), 'Attempt to delete super admin', authMiddleware_log, 'auth.cannotDeleteSuperAdmin', {}, 403);
  }

  // Cannot delete yourself
  if (currentUser.user_id === targetUserId) {
    authMiddleware_log(`User ${currentUser.user_id} cannot delete themselves`);
    return await handleStandardError(c, new Error('CANNOT_DELETE_SELF'), 'Attempt to delete own account', authMiddleware_log, 'auth.cannotDeleteYourself', {}, 403);
  }

  await next();
};
