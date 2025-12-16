/**
 * Dynamic Route Scanner for Hono App
 * Automatically extracts all routes and their methods from the application
*/

import { routeScanner_log } from './debug.js';
import { getAllRoutes } from '../constants/routeRegistry.js';

/**
 * Extract routes from Hono app instance
 * @param {Object} app - Hono app instance
 * @returns {Object} Organized routes by category
*/
export function extractRoutesFromApp(app) {
  try {
    const routes = {};
    const allRoutes = [];

    // Get all registered routes from Hono app
    const appRoutes = app.routes || [];

    // If app.routes doesn't exist, try to access the router directly
    if (appRoutes.length === 0 && app.router && app.router.routes) {
      appRoutes.push(...app.router.routes);
    }

    // Extract routes from the app instance
    if (app._routes) {
      appRoutes.push(...app._routes);
    }

    // Fallback: manually track routes from known route files
    const knownRoutes = getKnownRoutes();

    routeScanner_log(`Found ${appRoutes.length} routes from app instance`);
    routeScanner_log(`Using ${knownRoutes.length} known routes as fallback`);    // Process extracted routes or use known routes
    const routesToProcess = appRoutes.length > 0 ? appRoutes : knownRoutes;

    routesToProcess.forEach(route => {
      const method = route.method || route.verb || 'GET';
      const path = route.path || route.pattern || route.route;

      // Filter out invalid routes
      if (shouldSkipRoute(method, path)) {
        return;
      }

      const category = categorizeRoute(path);

      // Skip routes that don't have a category in registry
      if (!category) {
        return;
      }

      if (!routes[category]) {
        routes[category] = {};
      }

      const routeKey = `${method.toUpperCase()} ${path}`;
      routes[category][routeKey] = getRouteDescription(method, path);
      allRoutes.push({ method: method.toUpperCase(), path, category });
    });

    return {
      routes,
      allRoutes,
      summary: {
        total: allRoutes.length,
        categories: Object.keys(routes),
        byCategory: Object.keys(routes).reduce((acc, cat) => {
          acc[cat] = Object.keys(routes[cat]).length;
          return acc;
        }, {})
      }
    };

  } catch (error) {
    routeScanner_log(`Error extracting routes: ${error.message}`);
    return {
      routes: {},
      allRoutes: [],
      summary: {
        total: 0,
        categories: [],
        byCategory: {}
      }
    };
  }
}

/**
 * Check if a route should be skipped during scanning
 * @param {string} method - HTTP method
 * @param {string} path - Route path
 * @returns {boolean} True if route should be skipped
*/
function shouldSkipRoute(method, path) {
  if (!method || !path) {return true;}

  // Skip routes with wildcards or ALL methods
  if (method === 'ALL' || method.includes('*')) {return true;}
  if (path.includes('*') && path !== '/') {return true;}

  // Skip internal or system routes
  if (path.startsWith('/_') || path.startsWith('/__')) {return true;}

  // Skip duplicate or malformed paths
  if (path.includes('//')) {return true;}

  return false;
}

/**
 * Get known routes from the route registry
 * This serves as a fallback when dynamic extraction fails
*/
function getKnownRoutes() {
  const registry = getAllRoutes();
  const routes = [];

  // Convert registry format to array of routes
  Object.keys(registry).forEach(category => {
    Object.keys(registry[category]).forEach(routeKey => {
      const routeData = registry[category][routeKey];
      routes.push({
        method: routeData.method,
        path: routeData.path,
        category: routeData.category,
        metadata: routeData
      });
    });
  });

  routeScanner_log(`Loaded ${routes.length} routes from registry`);

  return routes.filter(route => {
    // Filter out invalid routes
    return route.method && route.path &&
           !route.path.includes('*') &&
           !route.method.includes('ALL') &&
           route.method !== 'ALL';
  });
}

/**
 * Categorize route based on its path - now using registry data only
*/
function categorizeRoute(path) {
  // Get from registry only
  const registry = getAllRoutes();
  for (const category of Object.keys(registry)) {
    for (const routeKey of Object.keys(registry[category])) {
      const routeData = registry[category][routeKey];
      if (routeData && routeData.path === path) {
        // Use category from metadata if available, otherwise use registry category
        return routeData.category || category;
      }
    }
  }

  // Return null if not found in registry (no fallback guessing)
  return null;
}


/**
 * Get route description for i18n - registry only
*/
function getRouteDescription(method, path) {
  // Get from registry only
  const registry = getAllRoutes();
  for (const category of Object.keys(registry)) {
    const routeKey = `${method.toUpperCase()} ${path}`;
    const routeData = registry[category][routeKey];
    if (routeData && routeData.i18nKey) {
      return routeData.i18nKey;
    }
  }

  // Return null if not found (no fallback i18n key generation)
  return null;
}


/**
 * Get route permissions from registry
*/
export function getRoutePermissions(path, method) {
  const registry = getAllRoutes();
  for (const category of Object.keys(registry)) {
    const routeKey = `${method.toUpperCase()} ${path}`;
    const routeData = registry[category][routeKey];
    if (routeData && routeData.permissions) {
      return routeData.permissions;
    }
  }

  // Return null if not found
  return null;
}
