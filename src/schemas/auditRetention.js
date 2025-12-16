/**
 * Audit Retention Validation Schemas
 * Zod schemas for audit retention policy management
 */

import { createSchemaBuilder } from './base.js';


// ============================================================================
// I18N SCHEMA CREATORS
// ============================================================================


// Retention policy schema with i18n
export function createRetentionPolicySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    audit_log_retention_days: builder.number('auditRetention', 1, 36500).optional(),
    user_data_retention_days: builder.number('userDataRetention', 1, 36500).optional(),
    created_by: builder.name().optional(),
    description: builder.description().optional()
  }, 'retentionPolicy').refine(
    (data) => data.audit_log_retention_days || data.user_data_retention_days,
    {
      // Provide interpolation parameter 'min' required by i18n string
      message: builder.tl('validation.retentionPolicy.atLeastOneRequired', { min: 1 }),
      path: ['audit_log_retention_days']
    }
  );
}

// Cleanup simulation schema with i18n
export function createCleanupSimulationSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    dry_run: builder.coerceBoolean('dryRun').default(true),
    force: builder.coerceBoolean('force').default(false).optional(),
    confirm_deletion: builder.coerceBoolean('confirmDeletion').optional()
  }, 'cleanupSimulation').refine(
    (data) => {
      // If not dry run, require explicit confirmation
      if (!data.dry_run && !data.confirm_deletion) {
        return false;
      }
      return true;
    },
    {
      message: builder.tl('validation.cleanupSimulation.confirmationRequired'),
      path: ['confirm_deletion']
    }
  );
}

// Retention policy update schema with i18n
export function createRetentionPolicyUpdateSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    days: builder.number('days', 1, 7300).optional(),
    auto_cleanup: builder.coerceBoolean('autoCleanup').optional(),
    archive_before_delete: builder.coerceBoolean('archiveBeforeDelete').optional(),
    max_records_per_cleanup: builder.number('maxRecords', 1, 10000).optional()
  }, 'retentionPolicyUpdate').refine(
    (data) => Object.keys(data).length > 0,
    {
      // Provide required interpolation param 'min' for message 'At least {{min}} field(s) must be updated'
      message: builder.tl('validation.retentionPolicyUpdate.atLeastOneFieldRequired', { min: 1 }),
      path: ['days']
    }
  );
}

// Advanced cleanup schema with i18n
export function createAdvancedCleanupSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    dry_run: builder.coerceBoolean('dryRun').default(true),
    backup_first: builder.coerceBoolean('backupFirst').default(true),
    confirm_deletion: builder.coerceBoolean('confirmDeletion').default(false),
    batch_size: builder.number('batchSize', 1, 10000).default(1000).optional(),
    max_execution_time: builder.number('executionTime', 1, 3600).default(300).optional()
  }, 'advancedCleanup').refine(
    (data) => {
      if (!data.dry_run && !data.confirm_deletion) {
        return false;
      }
      return true;
    },
    {
      message: builder.tl('validation.advancedCleanup.confirmationRequired'),
      path: ['confirm_deletion']
    }
  );
}

/**
 * Aggregated i18n Schema Creator Function
 * Creates all audit retention schemas with i18n support
 */
export function createAuditRetentionI18nSchemas(lang = 'en') {
  return {
    cleanupSimulationSchema: createCleanupSimulationSchema(lang),
    retentionPolicyUpdateSchema: createRetentionPolicyUpdateSchema(lang),
    advancedCleanupSchema: createAdvancedCleanupSchema(lang),
    auditRetentionPolicySchema: createRetentionPolicySchema(lang)
  };
}
