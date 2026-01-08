/**
 * Token Blacklist Routes Definitions
 * Register all token blacklist management routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

/**
 * Token Blacklist routes with metadata
*/
const TOKEN_BLACKLIST_ROUTES = [
  {
    method: 'GET',
    path: '/api/admin/token-blacklist',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.blacklistList',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'List blacklisted tokens with pagination and search'
    }
  },
  {
    method: 'POST',
    path: '/api/admin/token-blacklist',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.blacklistCreate',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Manually add a token to the blacklist'
    }
  },
  {
    method: 'GET',
    path: '/api/admin/token-blacklist/:id',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.blacklistDetails',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get detailed information about a blacklisted token'
    }
  },
  {
    method: 'POST',
    path: '/api/admin/token-blacklist/bulk-delete',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.blacklistBulkDelete',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Batch remove tokens from blacklist'
    }
  },
  {
    method: 'DELETE',
    path: '/api/admin/token-blacklist/:id',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.blacklistDelete',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Remove a token from blacklist'
    }
  }
];

// Register routes
registerRoutes('admin', TOKEN_BLACKLIST_ROUTES);
