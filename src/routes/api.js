import { Hono } from 'hono';
import { getAppSettings } from '../utils/dynamicConfig.js';
import { createSuccessResponse } from '../utils/helpers.js';
import { t, getSupportedLanguagesSync } from '../i18n/index.js';
import { i18n_log } from '../utils/debug.js';
import { authMiddleware } from '../middleware/auth.js';
import { getAllRoutes } from '../constants/routeRegistry.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { ROLES, ROLE_COMBINATIONS } from '../constants/roles.js';

const api = new Hono();
// Apply auto middleware for all API system routes
api.use('*', unifiedMiddlewares.auto());

// Default route - API info with i18n support
api.get('/', async (c) => {
  const lang = c.get('language');
  const appConfig = await getAppSettings(c.env);
  i18n_log(`Serving API info in language: ${lang}`);

  return c.json(createSuccessResponse({
    message: t(c, 'system.welcome', {
      version: appConfig.version,
      language: lang
    }),
    language: lang,
    version: appConfig.version,
    environment: c.get('environment') || 'unknown',
    supportedLanguages: getSupportedLanguagesSync()
  }));
});

// all API endpoints with i18n support - requires authentication
api.get('/api', authMiddleware, async (c) => {
  const lang = c.get('language');
  const currentUser = c.get('user');
  const appConfig = await getAppSettings(c.env);

  i18n_log(`Serving API info in language: ${lang} for user: ${currentUser.user_id} (${currentUser.role})`);

  // Get routes directly from registry (no need for app instance scanning)
  const routeRegistry = getAllRoutes();

  // Filter routes based on user permissions
  const filteredEndpoints = {};
  const userRole = currentUser.role;

  Object.keys(routeRegistry).forEach(category => {
    const categoryRoutes = routeRegistry[category];
    const filteredCategoryRoutes = {};

    Object.keys(categoryRoutes).forEach(routeKey => {
      const routeData = categoryRoutes[routeKey];
      const permissions = routeData.permissions;

      try {
        // Include route if it's public or user has required role
        if (permissions && (permissions.public || (permissions.roles && permissions.roles.includes(userRole)))) {
          filteredCategoryRoutes[routeKey] = t(c, routeData.i18nKey);
        }
      } catch (err) {
        console.error(`Error processing route ${routeKey} in category ${category}:`, err);
        console.error('Route data:', JSON.stringify(routeData, null, 2));
      }
    });

    if (Object.keys(filteredCategoryRoutes).length > 0) {
      filteredEndpoints[category] = filteredCategoryRoutes;
    }
  });

  // Calculate totals
  const totalSystemRoutes = Object.values(routeRegistry).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
  const totalAvailableRoutes = Object.values(filteredEndpoints).reduce((sum, cat) => sum + Object.keys(cat).length, 0);

  return c.json({
    message: t(c, 'system.apiInfo'),
    version: appConfig.version,
    status: 'running',
    language: lang,
    environment: c.get('environment') || 'unknown',
    user: {
      id: currentUser.user_id,
      role: currentUser.role,
      access_level: currentUser.role
    },
    endpoints: filteredEndpoints,
    route_summary: {
      total_available: totalAvailableRoutes,
      total_system: totalSystemRoutes,
      categories: Object.keys(filteredEndpoints),
      user_permissions: {
        role: userRole,
        can_access_admin: ROLE_COMBINATIONS.ADMIN_ONLY.includes(userRole),
        can_access_kv_admin: userRole === ROLES.SUPER_ADMIN,
        can_access_audit: ROLE_COMBINATIONS.ADMIN_ONLY.includes(userRole)
      }
    }
  });
});

// Health check endpoint with i18n support
// Health check endpoint
api.get('/health', (c) => {
  const lang = c.get('language');
  i18n_log(`Serving health check in language: ${lang}`);

  const headers = {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY', // or SAMEORIGIN
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=63072000; includeSubDomains; preload'
  };

  return c.json(createSuccessResponse({
    status: 'ok',
    language: lang,
    timestamp: new Date().toISOString(),
    environment: c.get('environment') || 'unknown',
    uptime: 'unknown' // process.uptime not available in Cloudflare Workers
  }, t(c, 'api.healthCheck')), 200, headers);
});

// API version endpoint with i18n support
// Version endpoint
api.get('/version', async (c) => {
  const lang = c.get('language');
  const appConfig = await getAppSettings(c.env);
  i18n_log(`Serving API version in language: ${lang}`);

  return c.json(createSuccessResponse({
    name: appConfig.name,
    version: appConfig.version,
    language: lang
  }));
});

// Language switcher endpoint
api.get('/language', (c) => {
  const lang = c.get('language');
  const requestedLang = c.req.query('lang');

  return c.json(createSuccessResponse({
    current_language: lang,
    requested_language: requestedLang,
    supported_languages: getSupportedLanguagesSync(),
    message: t(c, 'system.success')
  }));
});

// System route discovery endpoint (admin only) - comprehensive route listing
api.get('/routes', authMiddleware, (c) => {
  const currentUser = c.get('user');
  const lang = c.get('language');

  // Only allow admin and super_admin to see full route listing
  if (!ROLE_COMBINATIONS.ADMIN_ONLY.includes(currentUser.role)) {
    return c.json({
      success: false,
      error: t(c, 'auth.forbidden', { operation: 'routeRegistryAccess' }),
      message: t(c, 'admin.accessDenied')
    }, 403);
  }

  // Get routes directly from registry
  const routeRegistry = getAllRoutes();

  // Enhanced route information with permissions
  const enhancedRoutes = {};

  Object.keys(routeRegistry).forEach(category => {
    enhancedRoutes[category] = {};

    Object.keys(routeRegistry[category]).forEach(routeKey => {
      const routeData = routeRegistry[category][routeKey];

      enhancedRoutes[category][routeKey] = {
        description: t(c, routeData.i18nKey),
        method: routeData.method,
        path: routeData.path,
        permissions: routeData.permissions,
        category: routeData.category
      };
    });
  });

  i18n_log(`System routes requested by user: ${currentUser.user_id} (${currentUser.role})`);

  const totalRoutes = Object.values(routeRegistry).reduce((sum, cat) => sum + Object.keys(cat).length, 0);
  const categories = Object.keys(routeRegistry);

  return c.json(createSuccessResponse({
    language: lang,
    routes: enhancedRoutes,
    summary: {
      total_routes: totalRoutes,
      total_categories: categories.length,
      categories: categories,
      routes_by_category: Object.fromEntries(
        categories.map(cat => [cat, Object.keys(routeRegistry[cat]).length])
      ),
      scan_method: 'registry'
    },
    user_context: {
      role: currentUser.role,
      user_id: currentUser.user_id,
      can_access_all: currentUser.role === ROLES.SUPER_ADMIN
    }
  }, t(c, 'admin.routeDiscoverySuccess')));
});

export default api;
