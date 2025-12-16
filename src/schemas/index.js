/**
 * Schema Index - Export all validation schemas
 * Main entry point for schema imports across the application
 *
 * This file provides a centralized export point for all Zod validation schemas,
 * including both basic schemas and i18n-aware schema creators.
 */

// Base schema utilities and builders
export * from './base.js';

// Schema registry and management (primary exports)
export * from './registry.js';

// I18n-aware schema creators and utilities (optimized)
export * from './i18n.js';

// Authentication schemas
export * from './auth.js';

// User management schemas
export * from './user.js';

// Admin and role management schemas
export * from './admin.js';

// Audit logging schemas
export * from './audit.js';
export * from './advancedAudit.js';
export * from './auditRetention.js';

// Security incident management schemas
export * from './securityIncident.js';

// Real-time monitoring schemas
export * from './realtimeMonitoring.js';

// Key-Value configuration schemas
export * from './kv.js';

// Demo and testing schemas
export * from './zodDemo.js';

// Convenience re-exports for commonly used functions
export {
  getSchema,
  getSchemasByCategory,
  getAvailableSchemas,
  getAvailableCategories,
  getCacheStats,
  clearCache,
  cleanupCache,
  preloadSchemas,
  preloadCategorySchemas
} from './registry.js';

export {
  createI18nSchemas,
  getI18nSchema,
  createMultiLanguageSchemas
} from './i18n.js';
