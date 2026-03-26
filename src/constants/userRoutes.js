/**
 * User Routes Definitions
 * Register all user management routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

/**
 * User routes with metadata
*/
const USER_ROUTES = [
  {
    method: 'POST',
    path: '/api/user/register',
    metadata: {
      category: 'user',
      i18nKey: 'endpoints.user.register',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'User registration with email and password'
    }
  },
  {
    method: 'GET',
    path: '/api/user/profile',
    metadata: {
      category: 'user',
      i18nKey: 'endpoints.user.profile',
      permissions: PERMISSION_PRESETS.AUTHENTICATED,
      description: 'Get current user profile information'
    }
  },
  {
    method: 'PUT',
    path: '/api/user/profile',
    metadata: {
      category: 'user',
      i18nKey: 'endpoints.user.updateProfile',
      permissions: PERMISSION_PRESETS.AUTHENTICATED,
      description: 'Update current user profile information'
    }
  },
  {
    method: 'GET',
    path: '/api/user/me',
    metadata: {
      category: 'user',
      i18nKey: 'endpoints.user.me',
      permissions: PERMISSION_PRESETS.AUTHENTICATED,
      description: 'Get current user basic information'
    }
  },
  {
    method: 'PUT',
    path: '/api/user/me',
    metadata: {
      category: 'user',
      i18nKey: 'endpoints.user.updateProfile',
      permissions: PERMISSION_PRESETS.AUTHENTICATED,
      description: 'Update current user profile information via alias endpoint'
    }
  },
  {
    method: 'GET',
    path: '/api/user/verify-email',
    metadata: {
      category: 'user',
      i18nKey: 'endpoints.user.verifyEmail',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Verify pending email change using tokenized link'
    }
  },
  {
    method: 'DELETE',
    path: '/api/user/pending-email',
    metadata: {
      category: 'user',
      i18nKey: 'endpoints.user.clearPendingEmail',
      permissions: PERMISSION_PRESETS.AUTHENTICATED,
      description: 'Clear pending unverified email change for current user'
    }
  },
  {
    method: 'POST',
    path: '/api/user/change-password',
    metadata: {
      category: 'user',
      i18nKey: 'endpoints.user.updatePassword',
      permissions: PERMISSION_PRESETS.AUTHENTICATED,
      description: 'Change user password'
    }
  },
  {
    method: 'PUT',
    path: '/api/user/change-password',
    metadata: {
      category: 'user',
      i18nKey: 'endpoints.user.updatePassword',
      permissions: PERMISSION_PRESETS.AUTHENTICATED,
      description: 'Change user password via PUT alias'
    }
  }
];

/**
 * Register all user routes
*/
export function registerUserRoutes() {
  registerRoutes('user', USER_ROUTES);
}

// Auto-register when imported
registerUserRoutes();
