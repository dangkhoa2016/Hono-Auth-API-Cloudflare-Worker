/**
 * Advanced Audit Validation Schemas
 * I18n-aware Zod schemas for advanced audit features (analytics, archival, compliance)
 */

import { createSchemaBuilder } from './base.js';
import { getAllRoles } from '../constants/roles.js';

// ============================================================================
// I18N SCHEMA CREATORS
// ============================================================================

/**
 * Create analytics query schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createAnalyticsQuerySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    timeframe: builder.enum(['1h', '24h', '7d', '30d', '90d', '1y'], 'timeframe').default('24h'),
    actorRole: builder.enum(getAllRoles(), 'actorRole').optional(),
    includeDetails: builder.coerceBoolean('includeDetails').default(false),
    format: builder.enum(['json', 'csv'], 'format').default('json')
  }, 'analyticsQuery');
}

/**
 * Create archival query schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createArchivalQuerySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    dryRun: builder.boolean('dryRun').default(true),
    batchSize: builder.number('batchSize', 100, 10000).default(1000),
    categoryFilter: builder.enum(['authentication', 'admin_operations', 'security_events', 'general'], 'categoryFilter').optional(),
    forceArchival: builder.boolean('forceArchival').default(false)
  }, 'archivalQuery');
}

/**
 * Create restore query schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createRestoreQuerySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    startDate: builder.date('startDate', true),
    endDate: builder.date('endDate', true),
    userId: builder.number('userId', 1).optional(),
    action: builder.string('action').optional(),
    dryRun: builder.boolean('dryRun').default(true)
  }, 'restoreQuery');
}

/**
 * Create truncate query schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createTruncateQuerySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    startDate: builder.date('startDate', true),
    endDate: builder.date('endDate', true),
    batchSize: builder.number('batchSize', 1, 10000).default(1000),
    archiveFirst: builder.boolean('archiveFirst'),
    dryRun: builder.boolean('dryRun').default(true),
    confirmDelete: builder.boolean('confirmDelete').optional()
  }, 'truncateQuery').refine(
    data => data.startDate <= data.endDate,
    {
      message: builder.tl('validation.dateRange.invalid'),
      path: ['endDate']
    }
  ).refine(
    data => data.dryRun || data.confirmDelete === true,
    {
      message: builder.tl('validation.advancedAudit.confirmDeleteRequired'),
      path: ['confirmDelete']
    }
  ).refine(
    data => data.archiveFirst === true,
    {
      message: builder.tl('validation.advancedAudit.archiveFirstRequired'),
      path: ['archiveFirst']
    }
  );
}

/**
 * Create performance query schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createPerformanceQuerySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    period: builder.enum(['1h', '6h', '24h', '7d'], 'period').default('24h'),
    metrics: builder.array(
      builder.enum(['response_time', 'throughput', 'error_rate', 'memory_usage'], 'metric'),
      'metrics'
    ).optional(),
    threshold: builder.number('threshold', 0).optional()
  }, 'performanceQuery');
}

/**
 * Create compliance report schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createComplianceReportSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    reportType: builder.enum(['security', 'access', 'data_changes', 'system_health'], 'reportType'),
    dateRange: builder.dateRangeSchema(),
    format: builder.enum(['json', 'pdf', 'csv'], 'format').default('json'),
    includeMetadata: builder.boolean('includeMetadata').default(true),
    filterCriteria: builder.filterCriteriaSchema()
  }, 'complianceReport');
}

/**
 * Create alert configuration schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createAlertConfigSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    name: builder.name(),
    description: builder.description().optional(),
    conditions: builder.array(builder.conditionSchema(), 'conditions', 1),
    actions: builder.array(builder.actionSchema(), 'actions', 1),
    enabled: builder.boolean('enabled').default(true),
    priority: builder.enum(['low', 'medium', 'high', 'critical'], 'priority').default('medium')
  }, 'alertConfig');
}

/**
 * Create compliance query schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createComplianceQuerySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    timeframe: builder.enum(['1h', '24h', '7d', '30d', '90d', '1y'], 'timeframe').default('24h'),
    actorRole: builder.enum(getAllRoles(), 'actorRole').optional(),
    includeDetails: builder.boolean('includeDetails').default(false),
    format: builder.enum(['json', 'csv'], 'format').default('json'),
    includeUserData: builder.boolean('includeUserData').default(false)
  }, 'complianceQuery');
}

/**
 * Create retention policy schema with i18n support
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} Zod schema with translated messages
 */
export function createRetentionPolicySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    action: builder.enum(['set_policy', 'get_policy', 'simulate_cleanup', 'run_cleanup'], 'action'),
    policy: builder.policySchema().optional(),
    dryRun: builder.boolean('dryRun').optional()
  }, 'retentionPolicy').refine(
    data => {
      if (data.action === 'set_policy') {
        return !!data.policy;
      }
      return true;
    },
    {
      message: builder.tl('validation.fieldRequired.policy'),
      path: ['policy']
    }
  );
}

/**
 * Create all advanced audit i18n schemas at once
 * @param {string} lang - Language code (default: 'en')
 * @returns {Object} All advanced audit schemas with translated messages
 */
export function createAdvancedAuditI18nSchemas(lang = 'en') {
  return {
    analyticsQuerySchema: createAnalyticsQuerySchema(lang),
    archivalQuerySchema: createArchivalQuerySchema(lang),
    restoreQuerySchema: createRestoreQuerySchema(lang),
    truncateQuerySchema: createTruncateQuerySchema(lang),
    performanceQuerySchema: createPerformanceQuerySchema(lang),
    complianceReportSchema: createComplianceReportSchema(lang),
    alertConfigSchema: createAlertConfigSchema(lang),
    complianceQuerySchema: createComplianceQuerySchema(lang),
    retentionPolicySchema: createRetentionPolicySchema(lang)
  };
}
