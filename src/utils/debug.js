/**
 * Debug Configuration
 * Centralized debug setup for different application components
 * Supports environment-based debug configuration through Cloudflare KV: DEBUG
*/

import debug from './debugEnhanced.js'; // Use the enhanced debug with ANSI colors

// Default app name for debuggers
import { DEBUG_PREFIX } from '../constants/app.js';


// temporatory enable here - will be controlled by middleware in index.js
debug.enable(`${DEBUG_PREFIX}:*`);

// Create debug instances for different components
const createDebugger = (namespace) => debug(`${DEBUG_PREFIX}:${namespace}`);

// Debug instances for different parts of the application
const debuggers = {
  // Core application
  app_log: createDebugger('app'),
  server_log: createDebugger('server'),
  config_log: createDebugger('config'),

  // Middleware
  middleware_log: createDebugger('middleware'),
  authMiddleware_log: createDebugger('middleware:auth'),
  corsMiddleware_log: createDebugger('middleware:cors'),
  securityMiddleware_log: createDebugger('middleware:security'),
  errorMiddleware_log: createDebugger('middleware:error'),
  handleMiddleware_log: createDebugger('middleware:handle'),
  kvConfigMiddleware_log: createDebugger('middleware:kv-config'),
  auditMiddleware_log: createDebugger('middleware:audit'),
  optimizedAuditMiddleware_log: createDebugger('middleware:optimized-audit'),
  debugMiddleware_log: createDebugger('middleware:debug'),
  i18nMiddleware_log: createDebugger('middleware:i18n'),
  rateLimitMiddleware_log: createDebugger('middleware:ratelimit'),

  // Routes & Controllers
  routes_log: createDebugger('routes'),
  authRoutes_log: createDebugger('routes:auth'),
  userRoutes_log: createDebugger('routes:user'),
  adminRoutes_log: createDebugger('routes:admin'),
  apiRoutes_log: createDebugger('routes:api'),
  faviconRoutes_log: createDebugger('routes:favicon'),
  kvAdminRoutes_log: createDebugger('routes:kv-admin'),
  advancedAuditRoutes_log: createDebugger('routes:advanced-audit'),
  realtimeMonitoringRoutes_log: createDebugger('routes:realtime-monitoring'),
  auditRoutes_log: createDebugger('routes:audit'),
  securityIncidentRoutes_log: createDebugger('routes:security-incident'),

  // Services
  services_log: createDebugger('services'),
  serviceBase_log: createDebugger('services:base'),
  serviceConfig_log: createDebugger('services:config'),
  serviceOptimization_log: createDebugger('services:optimization'),
  userService_log: createDebugger('services:user'),
  authService_log: createDebugger('services:auth'),
  auditService_log: createDebugger('services:audit'),
  auditAnalytics_log: createDebugger('services:audit-analytics'),
  auditArchival_log: createDebugger('services:audit-archival'),
  auditExportService_log: createDebugger('services:audit-export'),
  auditMonitoring_log: createDebugger('services:audit-monitoring'),
  alertSystem_log: createDebugger('services:alert-system'),
  auditDashboard_log: createDebugger('services:audit-dashboard'),
  tokenService_log: createDebugger('services:token'),
  tokenBlacklistService_log: createDebugger('services:token-blacklist'),
  tokenAuditService_log: createDebugger('services:token-audit'),
  emailService_log: createDebugger('services:email'),
  securityIncident_log: createDebugger('services:security-incident'),
  rateLimitService_log: createDebugger('services:ratelimit'),
  kvConfigService_log: createDebugger('services:kv-config'),
  dbService_log: createDebugger('services:database'),
  auditRetentionService_log: createDebugger('services:audit-retention'),
  auditConfigService_log: createDebugger('services:audit-config'),
  i18nService_log: createDebugger('services:i18n'),

  // Security & Auth
  jwt_log: createDebugger('security:jwt'),
  bcrypt_log: createDebugger('security:bcrypt'),
  rateLimit_log: createDebugger('security:ratelimit'),

  // Database
  database_log: createDebugger('database'),
  migration_log: createDebugger('database:migration'),
  query_log: createDebugger('database:query'),

  // Utilities
  utils_log: createDebugger('utils'),
  helpers_log: createDebugger('utils:helpers'),
  auditHelper_log: createDebugger('utils:audit-helper'),
  i18n_log: createDebugger('i18n'),
  dynamicConfig_log: createDebugger('utils:dynamic-config'),
  serviceContext_log: createDebugger('utils:service-context'),
  routeScanner_log: createDebugger('utils:route-scanner'),

  // Validation
  validation_log: createDebugger('validation'),
  zod_log: createDebugger('validation:zod'),

  // Errors & Exceptions
  error_log: createDebugger('error'),
  authError_log: createDebugger('error:auth'),
  dbError_log: createDebugger('error:database'),
  validationError_log: createDebugger('error:validation'),

  // Testing
  test_log: createDebugger('test'),
  testRunner_log: createDebugger('test:runner'),
  testSuite_log: createDebugger('test:suite'),

  // Schema Validation
  schemaRegistry_log: createDebugger('schemas:registry'),
};

// Export individual debuggers
export const {
  app_log,
  routeScanner_log,
  server_log,
  config_log,
  middleware_log,
  authMiddleware_log,
  corsMiddleware_log,
  securityMiddleware_log,
  errorMiddleware_log,
  handleMiddleware_log,
  kvConfigMiddleware_log,
  auditMiddleware_log,
  optimizedAuditMiddleware_log,
  debugMiddleware_log,
  i18nMiddleware_log,
  rateLimitMiddleware_log,
  routes_log,
  authRoutes_log,
  userRoutes_log,
  adminRoutes_log,
  apiRoutes_log,
  faviconRoutes_log,
  kvAdminRoutes_log,
  advancedAuditRoutes_log,
  realtimeMonitoringRoutes_log,
  auditRoutes_log,
  securityIncidentRoutes_log,
  services_log,
  serviceBase_log,
  serviceConfig_log,
  serviceOptimization_log,
  userService_log,
  authService_log,
  auditService_log,
  auditAnalytics_log,
  auditArchival_log,
  auditExportService_log,
  securityIncident_log,
  rateLimitService_log,
  kvConfigService_log,
  dbService_log,
  auditRetentionService_log,
  auditConfigService_log,
  i18nService_log,
  auditMonitoring_log,
  alertSystem_log,
  auditDashboard_log,
  tokenService_log,
  tokenBlacklistService_log,
  tokenAuditService_log,
  emailService_log,
  jwt_log,
  bcrypt_log,
  rateLimit_log,
  database_log,
  migration_log,
  query_log,
  utils_log,
  helpers_log,
  auditHelper_log,
  i18n_log,
  dynamicConfig_log,
  serviceContext_log,
  validation_log,
  zod_log,
  error_log,
  authError_log,
  dbError_log,
  validationError_log,
  test_log,
  testRunner_log,
  testSuite_log,
  schemaRegistry_log
} = debuggers;

// Export helper function
export { createDebugger, debug };

// Export commonly used patterns for convenience
export const patterns = {
  all: `${DEBUG_PREFIX}:*`,
  middleware: `${DEBUG_PREFIX}:middleware*`,
  routes: `${DEBUG_PREFIX}:routes*`,
  services: `${DEBUG_PREFIX}:services*`,
  security: `${DEBUG_PREFIX}:security*`,
  database: `${DEBUG_PREFIX}:database*`,
  validation: `${DEBUG_PREFIX}:validation*`,
  i18n: `${DEBUG_PREFIX}:i18n*`,
  errors: `${DEBUG_PREFIX}:error*`,
  test: `${DEBUG_PREFIX}:test*`,
};
