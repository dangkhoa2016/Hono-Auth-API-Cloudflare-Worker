/**
 * System Routes Definitions
 * Register all system-level routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

/**
 * System routes with metadata
*/
const SYSTEM_ROUTES = [
  {
    method: 'GET',
    path: '/',
    metadata: {
      category: 'system',
      i18nKey: 'endpoints.system.root',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Application root endpoint'
    }
  },
  {
    method: 'GET',
    path: '/health',
    metadata: {
      category: 'system',
      i18nKey: 'endpoints.system.health',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Health check endpoint'
    }
  },
  {
    method: 'GET',
    path: '/version',
    metadata: {
      category: 'system',
      i18nKey: 'endpoints.system.version',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Application version information'
    }
  },
  {
    method: 'GET',
    path: '/language',
    metadata: {
      category: 'system',
      i18nKey: 'endpoints.system.language',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Language detection and settings'
    }
  },
  {
    method: 'GET',
    path: '/api',
    metadata: {
      category: 'system',
      i18nKey: 'endpoints.system.apiInfo',
      permissions: PERMISSION_PRESETS.AUTHENTICATED,
      description: 'API information and available endpoints'
    }
  },
  {
    method: 'GET',
    path: '/routes',
    metadata: {
      category: 'system',
      i18nKey: 'endpoints.system.routes',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'System routes listing'
    }
  }
];

/**
 * Asset routes with metadata
*/
const ASSET_ROUTES = [
  {
    method: 'GET',
    path: '/favicon',
    metadata: {
      category: 'assets',
      i18nKey: 'endpoints.system.favicon',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Favicon redirect'
    }
  },
  {
    method: 'GET',
    path: '/favicon.ico',
    metadata: {
      category: 'assets',
      i18nKey: 'endpoints.system.favicon',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Favicon ICO file'
    }
  },
  {
    method: 'GET',
    path: '/favicon.png',
    metadata: {
      category: 'assets',
      i18nKey: 'endpoints.system.favicon',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Favicon PNG file'
    }
  },
  {
    method: 'GET',
    path: '/apple-touch-icon.png',
    metadata: {
      category: 'assets',
      i18nKey: 'endpoints.system.favicon',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'Apple touch icon'
    }
  },
  {
    method: 'GET',
    path: '/icon-192.png',
    metadata: {
      category: 'assets',
      i18nKey: 'endpoints.system.favicon',
      permissions: PERMISSION_PRESETS.PUBLIC,
      description: 'App icon 192x192'
    }
  }
];

/**
 * Register all system routes
*/
export function registerSystemRoutes() {
  registerRoutes('system', SYSTEM_ROUTES);
  registerRoutes('assets', ASSET_ROUTES);
}

// Auto-register when imported
registerSystemRoutes();
