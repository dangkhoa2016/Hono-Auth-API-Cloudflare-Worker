/**
 * Audit Log Validation Schemas
 * Unified basic and i18n-aware Zod schemas for audit log API validation
 */

import { createSchemaBuilder, ValidationPatterns } from './base.js';
import { getAllRoles } from '../constants/roles.js';

// ============================================================================
// I18N SCHEMA CREATORS
// ============================================================================

/**
 * Create audit query schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createAuditQuerySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  const paginationSchema = ValidationPatterns.createPaginationSchema(lang);

  return builder.object({
    ...paginationSchema.shape,
    userId: builder.coerceNumber('userId', 1).optional(),
    action: builder.string('action', 0, 50).optional(),
    entityType: builder.string('entityType', 0, 100).optional(),
    userRole: builder.enum(getAllRoles(), 'userRole').optional(),
    startDate: builder.string('startDate').optional(),
    endDate: builder.string('endDate').optional(),
    search: builder.string('search', 0, 200).optional()
  }, 'auditQuery');
}

/**
 * Create audit search schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createAuditSearchSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  const paginationSchema = ValidationPatterns.createPaginationSchema(lang);

  return builder.object({
    ...paginationSchema.shape,
    query: builder.string('query', 1, 200).optional(),
    search: builder.string('search', 1, 200).optional(),
    userId: builder.coerceNumber('userId', 1).optional(),
    action: builder.string('action', 0, 50).optional(),
    entityType: builder.string('entityType', 0, 100).optional(),
    userRole: builder.enum(getAllRoles(), 'userRole').optional(),
    startDate: builder.string('startDate').optional(),
    endDate: builder.string('endDate').optional(),
    sortBy: builder.string('sortBy', 0, 50).optional().default('created_at'),
    sortOrder: builder.enum(['asc', 'desc'], 'sortOrder').optional().default('desc'),
    searchFields: builder.string('searchFields').optional() // comma-separated fields to search in
  }, 'auditSearch').refine((data) => {
    // At least one of query, search, action, userId, or other filters must be provided
    return data.query || data.search || data.action || data.userId || data.entityType || data.userRole || data.startDate;
  }, {
    // Provide required interpolation parameter 'min' used in translation string
    message: builder.tl('validation.auditSearch.atLeastOneFilterRequired', { min: 1 })
  });
}

/**
 * Create audit export schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createAuditExportSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  const dateRangeSchema = ValidationPatterns.createDateRangeSchema(lang);

  return builder.object({
    format: builder.enum(['json', 'csv', 'xlsx'], 'format').default('json'),
    ...dateRangeSchema.shape,
    filters: builder.object({}).optional(), // Record type using builder
    includeDetails: builder.boolean('includeDetails').default(true),
    maxRecords: builder.number('maxRecords', 1, 10000).default(1000)
  }, 'auditExport');
}

/**
 * Create all audit i18n schemas at once
 * @param {string} lang - Language code
 * @returns {Object} All audit schemas with translated messages
 */
export function createAuditI18nSchemas(lang = 'en') {
  return {
    auditQuerySchema: createAuditQuerySchema(lang),
    auditSearchSchema: createAuditSearchSchema(lang),
    auditExportSchema: createAuditExportSchema(lang)
  };
}
