/**
 * Admin Management Validation Schemas
 * I18n-aware Zod schemas for admin management endpoints
 */

import { createSchemaBuilder } from './base.js';
import { getAllRoles, getAllUserStatuses, DEFAULT_USER_STATUS } from '../constants/roles.js';

// ============================================================================
// I18N SCHEMA CREATORS
// ============================================================================

/**
 * Create role change schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createRoleChangeSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    role: builder.enum(getAllRoles(), 'role')
  }, 'roleChange');
}

/**
 * Create admin statistics query schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createAdminStatsQuerySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    period: builder.enum(['day', 'week', 'month', 'year'], 'period').default('week'),
    includeInactive: builder.boolean('includeInactive').default(false),
    groupBy: builder.enum(['role', 'status', 'registration_date'], 'groupBy').optional()
  }, 'adminStatsQuery');
}

/**
 * Create system health schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createSystemHealthSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    includeMetrics: builder.boolean('includeMetrics').default(true),
    includeDatabase: builder.boolean('includeDatabase').default(true),
    includeCache: builder.boolean('includeCache').default(false)
  }, 'systemHealth');
}

/**
 * Create admin user creation schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createCreateAdminUserSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    name: builder.name(),
    email: builder.email(),
    password: builder.password(),
    role: builder.enum(getAllRoles(), 'role').default('admin'),
    status: builder.enum(getAllUserStatuses(), 'status').default(DEFAULT_USER_STATUS)
  }, 'createAdminUser');
}

/**
 * Create admin user update schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createAdminUserUpdateSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    name: builder.name().optional(),
    email: builder.email(false).optional(),
    status: builder.enum(getAllUserStatuses(), 'status').optional(),
    role: builder.enum(getAllRoles(), 'role').optional()
  }, 'adminUserUpdate');
}

/**
 * Create all admin management i18n schemas at once
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} All admin schemas with translated messages
 */
export function createAdminI18nSchemas(lang = 'en') {
  return {
    roleChangeSchema: createRoleChangeSchema(lang),
    adminStatsQuerySchema: createAdminStatsQuerySchema(lang),
    systemHealthSchema: createSystemHealthSchema(lang),
    createAdminUserSchema: createCreateAdminUserSchema(lang),
    adminUserUpdateSchema: createAdminUserUpdateSchema(lang)
  };
}
