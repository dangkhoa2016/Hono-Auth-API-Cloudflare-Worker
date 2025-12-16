/**
 * Role Management System
 * Centralized role definitions and hierarchy management
*/

// ====================================================================
// ROLE DEFINITIONS
// ====================================================================

export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin'
};

// Role hierarchy (higher number = higher privilege)
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3
};

// Role display names for UI/API responses
export const ROLE_DISPLAY_NAMES = {
  [ROLES.USER]: 'Regular User',
  [ROLES.ADMIN]: 'Administrator',
  [ROLES.SUPER_ADMIN]: 'Super Administrator'
};

// Role descriptions
export const ROLE_DESCRIPTIONS = {
  [ROLES.USER]: 'Standard user with basic permissions',
  [ROLES.ADMIN]: 'Administrator with extended permissions',
  [ROLES.SUPER_ADMIN]: 'Super Administrator with full system access'
};

// ====================================================================
// ROLE VALIDATION AND UTILITIES
// ====================================================================

/**
 * Get all available roles as array
 * @returns {string[]} Array of role names
*/
export const getAllRoles = () => Object.values(ROLES);

/**
 * Check if a role is valid
 * @param {string} role - Role to validate
 * @returns {boolean} True if role is valid
*/
export const isValidRole = (role) => getAllRoles().includes(role);

/**
 * Get role hierarchy level
 * @param {string} role - Role to check
 * @returns {number} Hierarchy level (higher = more privileged)
*/
export const getRoleLevel = (role) => ROLE_HIERARCHY[role] || 0;

/**
 * Check if role1 has higher or equal privilege than role2
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean} True if role1 >= role2 in hierarchy
*/
export const hasHigherOrEqualRole = (role1, role2) => {
  return getRoleLevel(role1) >= getRoleLevel(role2);
};

/**
 * Check if role1 has strictly higher privilege than role2
 * @param {string} role1 - First role
 * @param {string} role2 - Second role
 * @returns {boolean} True if role1 > role2 in hierarchy
*/
export const hasHigherRole = (role1, role2) => {
  return getRoleLevel(role1) > getRoleLevel(role2);
};

/**
 * Get roles that are lower than or equal to the given role
 * @param {string} role - Reference role
 * @returns {string[]} Array of roles with lower or equal privilege
*/
export const getRolesLowerOrEqual = (role) => {
  const referenceLevel = getRoleLevel(role);
  return getAllRoles().filter(r => getRoleLevel(r) <= referenceLevel);
};

/**
 * Get roles that are strictly lower than the given role
 * @param {string} role - Reference role
 * @returns {string[]} Array of roles with lower privilege
*/
export const getRolesLower = (role) => {
  const referenceLevel = getRoleLevel(role);
  return getAllRoles().filter(r => getRoleLevel(r) < referenceLevel);
};

// ====================================================================
// PERMISSION DEFINITIONS
// ====================================================================

/**
 * Define permissions for each role
*/
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: false,
    canViewAllUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canChangeRoles: false,
    canViewSuperAdminData: false,
    canAccessAdminRoutes: false
  },
  [ROLES.ADMIN]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: true,
    canViewAllUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canChangeRoles: true,
    canViewSuperAdminData: false,
    canAccessAdminRoutes: true
  },
  [ROLES.SUPER_ADMIN]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: true,
    canViewAllUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canChangeRoles: true,
    canViewSuperAdminData: true,
    canAccessAdminRoutes: true
  }
};

/**
 * Check if a role has a specific permission
 * @param {string} role - Role to check
 * @param {string} permission - Permission to check
 * @returns {boolean} True if role has permission
*/
export const hasPermission = (role, permission) => {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions ? !!permissions[permission] : false;
};

/**
 * Get all permissions for a role
 * @param {string} role - Role to get permissions for
 * @returns {Object} Permissions object
*/
export const getRolePermissions = (role) => {
  return ROLE_PERMISSIONS[role] || {};
};

// ====================================================================
// ROLE COMBINATIONS FOR ROUTE PERMISSIONS
// ====================================================================

// Common role combinations used in routes
export const ROLE_COMBINATIONS = {
  // Public access (no authentication required)
  PUBLIC: [],

  // All authenticated users
  ALL_USERS: [ROLES.USER, ROLES.ADMIN, ROLES.SUPER_ADMIN],

  // Admin level and above
  ADMIN_ONLY: [ROLES.ADMIN, ROLES.SUPER_ADMIN],

  // Super admin only
  SUPER_ADMIN_ONLY: [ROLES.SUPER_ADMIN],

  // User and admin (excluding super admin)
  USER_AND_ADMIN: [ROLES.USER, ROLES.ADMIN]
};

// Permission objects for common scenarios
export const PERMISSION_PRESETS = {
  // Public endpoints (no auth required)
  PUBLIC: {
    public: true,
    roles: ROLE_COMBINATIONS.PUBLIC
  },

  // Authenticated users only
  AUTHENTICATED: {
    public: false,
    roles: ROLE_COMBINATIONS.ALL_USERS
  },

  // Admin level access
  ADMIN: {
    public: false,
    roles: ROLE_COMBINATIONS.ADMIN_ONLY
  },

  // Super admin only
  SUPER_ADMIN: {
    public: false,
    roles: ROLE_COMBINATIONS.SUPER_ADMIN_ONLY
  }
};

// ====================================================================
// SPECIAL CONSTANTS
// ====================================================================

// Super Admin user ID (traditionally user_id = 1)
export const SUPER_ADMIN_USER_ID = 1;

// Default role for new users
export const DEFAULT_USER_ROLE = ROLES.USER;

// Default status for new users
export const DEFAULT_USER_STATUS = 'active';

// ====================================================================
// USER STATUS CONSTANTS
// ====================================================================

export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Get all user statuses as array
export const getAllUserStatuses = () => Object.values(USER_STATUSES);

/**
 * Check if status is valid
 * @param {string} status - Status to validate
 * @returns {boolean} True if status is valid
*/
export const isValidStatus = (status) => getAllUserStatuses().includes(status);

/**
 * Status display names for UI/API responses
*/
export const STATUS_DISPLAY_NAMES = {
  [USER_STATUSES.ACTIVE]: 'Active',
  [USER_STATUSES.INACTIVE]: 'Inactive',
  [USER_STATUSES.SUSPENDED]: 'Suspended'
};

/**
 * Status descriptions
*/
export const STATUS_DESCRIPTIONS = {
  [USER_STATUSES.ACTIVE]: 'User account is active and functional',
  [USER_STATUSES.INACTIVE]: 'User account is inactive',
  [USER_STATUSES.SUSPENDED]: 'User account has been suspended'
};

// ====================================================================
// ROLE UTILITIES FOR DATABASE QUERIES
// ====================================================================

/**
 * Get SQL WHERE clause for role filtering
 * @param {string} currentUserRole - Current user's role
 * @param {string} tableAlias - Table alias (optional)
 * @returns {Object} Object with where clause and bind parameters
*/
export const getRoleFilterClause = (currentUserRole, tableAlias = '') => {
  const table = tableAlias ? `${tableAlias}.` : '';

  switch (currentUserRole) {
  case ROLES.SUPER_ADMIN:
    // Super Admin can see all roles
    return { where: '', binds: [] };

  case ROLES.ADMIN:
    // Admin can see user and admin roles only
    return {
      where: `AND ${table}role IN (?, ?)`,
      binds: ROLE_COMBINATIONS.USER_AND_ADMIN
    };

  case ROLES.USER:
  default:
    // Regular users should not see other users in admin contexts
    return {
      where: `AND ${table}role = ?`,
      binds: [ROLES.USER]
    };
  }
};

/**
 * Check if current user can manage target user
 * @param {string} currentUserRole - Current user's role
 * @param {string} targetUserRole - Target user's role
 * @param {number} currentUserId - Current user's ID
 * @param {number} targetUserId - Target user's ID
 * @returns {Object} Result with canManage boolean and reason
*/
export const canManageUser = (currentUserRole, targetUserRole, currentUserId, targetUserId) => {
  // Cannot manage Super Admin
  if (targetUserId === SUPER_ADMIN_USER_ID) {
    return {
      canManage: false,
      reason: 'Cannot manage Super Administrator'
    };
  }

  // Cannot manage yourself (for deletion/role changes)
  if (currentUserId === targetUserId) {
    return {
      canManage: false,
      reason: 'Cannot manage yourself'
    };
  }

  // Super Admin can manage everyone (except themselves)
  if (currentUserRole === ROLES.SUPER_ADMIN) {
    return {
      canManage: true,
      reason: 'Super Admin privileges'
    };
  }

  // Admin can manage users with lower or equal roles (user, admin)
  if (currentUserRole === ROLES.ADMIN) {
    if (hasHigherOrEqualRole(currentUserRole, targetUserRole)) {
      return {
        canManage: true,
        reason: 'Admin privileges'
      };
    }
    return {
      canManage: false,
      reason: 'Insufficient privileges to manage this role'
    };
  }

  // Regular users cannot manage other users
  return {
    canManage: false,
    reason: 'No management privileges'
  };
};

// ====================================================================
// EXPORTS FOR EASY MIGRATION
// ====================================================================

// Legacy exports for backward compatibility during migration
export const USER_ROLE = ROLES.USER;
export const ADMIN_ROLE = ROLES.ADMIN;
export const SUPER_ADMIN_ROLE = ROLES.SUPER_ADMIN;
