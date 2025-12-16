/**
 * Security Incident Response Validation Schemas
 * Unified basic and i18n-aware Zod schemas for incident management
 */

import { createSchemaBuilder, SCHEMA_CONFIG } from './base.js';

// ============================================================================
// I18N SCHEMA CREATORS
// ============================================================================

/**
 * Create incident creation schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createIncidentCreationSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    type: builder.name(),
    severity: builder.enum(SCHEMA_CONFIG.SEVERITY_LEVELS, 'severity').default('medium'),
    title: builder.name(),
    description: builder.description(true),
    source: builder.string('source', 0, 100).optional(),
    affectedSystems: builder.array(builder.string('system', 1), 'affectedSystems').optional(),
    metadata: builder.record(builder.any(), 'metadata').optional()
  }, 'incidentCreation');
}

/**
 * Create status update schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createStatusUpdateSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    status: builder.enum(['open', 'investigating', 'resolved', 'closed'], 'status'),
    resolution: builder.description().optional(),
    assignedTo: builder.uuid('assignedTo').optional(),
    priority: builder.enum(['low', 'medium', 'high', 'critical'], 'priority').optional()
  }, 'statusUpdate');
}

/**
 * Create manual response schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createManualResponseSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    action: builder.enum(['acknowledge', 'escalate', 'resolve', 'close'], 'action'),
    note: builder.description().optional(),
    actionTaken: builder.string('actionTaken', 0, 200).optional(),
    nextSteps: builder.string('nextSteps', 0, 500).optional()
  }, 'manualResponse');
}

/**
 * Create all security incident i18n schemas at once
 * @param {string} lang - Language code
 * @returns {Object} All security incident schemas with translated messages
 */
export function createSecurityIncidentI18nSchemas(lang = 'en') {
  return {
    createIncidentSchema: createIncidentCreationSchema(lang),
    updateStatusSchema: createStatusUpdateSchema(lang),
    manualResponseSchema: createManualResponseSchema(lang)
  };
}
