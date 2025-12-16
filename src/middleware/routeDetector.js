// Lightweight route detection utilities extracted for independent testing
import { getAllRoutes } from '../constants/routeRegistry.js';
import { mapCategoryToRouteType } from '../constants/routeCategoryMappings.js';

function buildParamRegex(routePath) {
  const escaped = routePath.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
  const pattern = escaped.replace(/:(\w+)/g, '[^/]+');
  return new RegExp(`^${pattern}$`);
}

export function detectFromRegistry(path, method) {
  const routesByCategory = getAllRoutes();
  const normalizedMethod = method.toUpperCase();
  for (const [category, routes] of Object.entries(routesByCategory)) {
    // Exact match first
    const exactKey = `${normalizedMethod} ${path}`;
    if (routes[exactKey]) {
      const meta = routes[exactKey];
      return {
        name: meta.logName || meta.description || meta.i18nKey || exactKey,
        pattern: exactKey,
        routeType: mapCategoryToRouteType(category)
      };
    }
  }
  // Param match second pass
  for (const [category, routes] of Object.entries(routesByCategory)) {
    for (const [key, meta] of Object.entries(routes)) {
      if (meta.method !== normalizedMethod) {continue;}
      if (!meta.path.includes(':')) {continue;}
      const regex = buildParamRegex(meta.path);
      if (regex.test(path)) {
        return {
          name: meta.logName || meta.description || meta.i18nKey || key,
          pattern: `${meta.method} ${meta.path}`,
          routeType: mapCategoryToRouteType(category)
        };
      }
    }
  }
  return null;
}

export const __internal = { buildParamRegex };
