/**
 * Route Category -> Route Type mapping
 * Centralized mapping to avoid hard-coded switch statements inside middleware.
 * Extend or modify here when adding new route categories.
 */
import { ROLES } from './roles.js';

export const ROUTE_TYPES = {
  PUBLIC: 'public',
  AUTH: 'auth',
  USER: ROLES.USER,
  ADMIN: ROLES.ADMIN,
  SUPER_ADMIN: ROLES.SUPER_ADMIN,
  SYSTEM: 'system',
  API: 'api'
};

// Mapping of registry category names to internal ROUTE_TYPES
export const CATEGORY_ROUTE_TYPE = {
  // Core
  system: ROUTE_TYPES.PUBLIC,
  assets: ROUTE_TYPES.PUBLIC,
  auth: ROUTE_TYPES.AUTH,
  user: ROUTE_TYPES.USER,
  admin: ROUTE_TYPES.ADMIN,

  // Enterprise / elevated
  kv_admin: ROUTE_TYPES.SUPER_ADMIN,
  realtime_monitoring: ROUTE_TYPES.SUPER_ADMIN,
  security_incident: ROUTE_TYPES.SUPER_ADMIN,
  advanced_audit: ROUTE_TYPES.SUPER_ADMIN,

  // Audit (basic audit accessible to admins)
  audit: ROUTE_TYPES.ADMIN,

  // Misc/demo
  translations: ROUTE_TYPES.API,
  zod_demo: ROUTE_TYPES.API,
  demo: ROUTE_TYPES.API,
  i18n: ROUTE_TYPES.API
};

export function mapCategoryToRouteType(category) {
  return CATEGORY_ROUTE_TYPE[category] || ROUTE_TYPES.API;
}
