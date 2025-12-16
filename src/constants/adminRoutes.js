/**
 * Admin Routes Definitions
 * Register all admin management routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

/**
 * Admin routes with metadata
*/
const ADMIN_ROUTES = [
  {
    method: 'GET',
    path: '/api/admin/users',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.usersList',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get list of all users with filtering and pagination'
    }
  },
  {
    method: 'POST',
    path: '/api/admin/users',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.createUser',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Create new user account'
    }
  },
  {
    method: 'GET',
    path: '/api/admin/users/:id',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.userDetails',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get detailed information of specific user'
    }
  },
  {
    method: 'PUT',
    path: '/api/admin/users/:id',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.updateUser',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Update user information (excluding role changes)'
    }
  },
  {
    method: 'DELETE',
    path: '/api/admin/users/:id',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.deleteUser',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Delete user account permanently'
    }
  },
  {
    method: 'PUT',
    path: '/api/admin/users/:id/role',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.changeRole',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Change user role with hierarchy validation'
    }
  },
  {
    method: 'GET',
    path: '/api/admin/dashboard',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.dashboard',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Admin dashboard with system overview and statistics'
    }
  },
  {
    method: 'GET',
    path: '/api/admin/stats',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.stats',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'System statistics and metrics'
    }
  },
  {
    method: 'GET',
    path: '/api/admin/system-health',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.systemHealth',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'System health check with performance metrics'
    }
  }
];

/**
 * Register all admin routes
*/
export function registerAdminRoutes() {
  registerRoutes('admin', ADMIN_ROUTES);
}

// Auto-register when imported
registerAdminRoutes();
