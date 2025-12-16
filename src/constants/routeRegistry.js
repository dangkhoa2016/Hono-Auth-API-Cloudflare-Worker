/**
 * Route Registry - Centralized route metadata
 * Each route module registers its routes with metadata here
*/

/**
 * Route registry to store all route metadata
 * Structure: { category: { 'METHOD /path': { i18nKey, permissions, description } } }
*/
const ROUTE_REGISTRY = {};

/**
 * Register a route with metadata
 * @param {string} category - Route category (auth, user, admin, etc.)
 * @param {string} method - HTTP method
 * @param {string} path - Route path
 * @param {Object} metadata - Route metadata
*/
export function registerRoute(category, method, path, metadata = {}) {
  if (!ROUTE_REGISTRY[category]) {
    ROUTE_REGISTRY[category] = {};
  }

  const routeKey = `${method.toUpperCase()} ${path}`;
  ROUTE_REGISTRY[category][routeKey] = {
    i18nKey: metadata.i18nKey,
    permissions: metadata.permissions,
    description: metadata.description || '',
    method: method.toUpperCase(),
    path: path,
    category: category,
    ...metadata
  };
}

/**
 * Get all registered routes
 * @returns {Object} All routes organized by category
*/
export function getAllRoutes() {
  return ROUTE_REGISTRY;
}

/**
 * Get routes by category
 * @param {string} category - Category name
 * @returns {Object} Routes in the specified category
*/
export function getRoutesByCategory(category) {
  return ROUTE_REGISTRY[category] || {};
}

/**
 * Get route metadata
 * @param {string} category - Category name
 * @param {string} method - HTTP method
 * @param {string} path - Route path
 * @returns {Object|null} Route metadata or null if not found
*/
export function getRouteMetadata(category, method, path) {
  const routeKey = `${method.toUpperCase()} ${path}`;
  return ROUTE_REGISTRY[category]?.[routeKey] || null;
}

/**
 * Register multiple routes at once
 * @param {string} category - Route category
 * @param {Array} routes - Array of route objects
*/
export function registerRoutes(category, routes) {
  routes.forEach(route => {
    registerRoute(category, route.method, route.path, route.metadata);
  });
}

/**
 * Clear all routes (useful for testing)
*/
export function clearRegistry() {
  Object.keys(ROUTE_REGISTRY).forEach(key => delete ROUTE_REGISTRY[key]);
}

/**
 * Get route statistics
 * @returns {Object} Statistics about registered routes
*/
export function getRouteStats() {
  const categories = Object.keys(ROUTE_REGISTRY);
  const totalRoutes = categories.reduce((total, category) => {
    return total + Object.keys(ROUTE_REGISTRY[category]).length;
  }, 0);

  return {
    totalRoutes,
    totalCategories: categories.length,
    categories: categories,
    byCategory: categories.reduce((acc, category) => {
      acc[category] = Object.keys(ROUTE_REGISTRY[category]).length;
      return acc;
    }, {})
  };
}
