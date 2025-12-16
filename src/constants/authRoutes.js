/**
 * Authentication Routes Definitions
 * Register all authentication routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

/**
 * Authentication routes with metadata
*/
const AUTH_ROUTES = [
  {
    method: 'POST',
    path: '/api/auth/login',
    metadata: {
      category: 'auth',
      i18nKey: 'endpoints.auth.login',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'User login with email and password'
    }
  },
  {
    method: 'POST',
    path: '/api/auth/refresh_token',
    metadata: {
      category: 'auth',
      i18nKey: 'endpoints.auth.refresh',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Refresh JWT access token'
    }
  },
  {
    method: 'POST',
    path: '/api/auth/logout',
    metadata: {
      category: 'auth',
      i18nKey: 'endpoints.auth.logout',
      permissions: PERMISSION_PRESETS.AUTHENTICATED,
      description: 'User logout and token invalidation'
    }
  },
  {
    method: 'POST',
    path: '/api/auth/logout-all',
    metadata: {
      category: 'auth',
      i18nKey: 'endpoints.auth.logoutAll',
      permissions: PERMISSION_PRESETS.AUTHENTICATED,
      description: 'Logout from all devices and revoke tokens'
    }
  }
];

/**
 * Register all authentication routes
*/
export function registerAuthRoutes() {
  registerRoutes('auth', AUTH_ROUTES);
}

// Auto-register when imported
registerAuthRoutes();
