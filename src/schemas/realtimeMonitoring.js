/**
 * Real-time Monitoring Validation Schemas
 * Unified basic and i18n-aware Zod schemas for real-time monitoring and alerts
 */

import { createSchemaBuilder, SCHEMA_CONFIG } from './base.js';

// ============================================================================
// I18N SCHEMA CREATORS
// ============================================================================

/**
 * Create monitoring configuration schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createMonitoringConfigSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    intervalMs: builder.number('intervalMs', 1000, 60000).default(5000),
    enableThreatDetection: builder.boolean('enableThreatDetection').default(true)
  }, 'monitoringConfig');
}

/**
 * Create alert rule schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createAlertRuleSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    name: builder.name(),
    description: builder.description(),
    severity: builder.enum(SCHEMA_CONFIG.SEVERITY_LEVELS, 'severity'),
    enabled: builder.boolean('enabled').default(true),
    condition: builder.string('condition', 1, 500, false).optional(),
    cooldown: builder.coerceNumber('cooldown', 0, 86400).default(300),
    channels: builder.array(builder.string('channel', 1), 'channels', 1).optional().default(['email']),
    conditions: builder.record(builder.any(), 'conditions').optional(),
    actions: builder.array(builder.string('action', 1), 'actions', 1).optional()
  }, 'alertRule').refine((data) => {
    return Boolean(
      String(data.condition || '').trim()
      || (data.conditions && Object.keys(data.conditions).length)
    );
  }, {
    message: builder.tl('validation.fieldRequired.condition'),
    path: ['condition']
  });
}

/**
 * Create alert channel schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createAlertChannelSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    name: builder.name(),
    type: builder.enum(['email', 'webhook', 'sms'], 'channelType'),
    config: builder.record(builder.any(), 'config'), // Use builder methods
    enabled: builder.boolean('enabled').default(true)
  }, 'alertChannel');
}

/**
 * Create threat resolution schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createThreatResolutionSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    resolution: builder.enum(['manual', 'automatic', 'block', 'monitor', 'ignore'], 'resolution'),
    note: builder.string('note', 0, 500).optional(),
    notes: builder.string('notes', 0, 500).optional(), // Accept both note and notes
    actionTaken: builder.string('actionTaken', 0, 200).optional()
  }, 'threatResolution');
}

/**
 * Create time range schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createTimeRangeSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    startTime: builder.date('startTime', false).optional(),
    endTime: builder.date('endTime', false).optional(),
    hours: builder.coerceNumber('hours', 1).optional()
  }, 'timeRange').refine((data) => {
    // Either hours OR (startTime and endTime) must be provided
    const hasHours = data.hours !== undefined;
    const hasTimeRange = data.startTime && data.endTime;
    return hasHours || hasTimeRange;
  }, {
    message: builder.tl('validation.timeRange.eitherHoursOrRangeRequired'),
    path: ['hours']
  }).refine((data) => {
    // If both startTime and endTime are provided, validate the range
    if (data.startTime && data.endTime) {
      return data.startTime <= data.endTime;
    }
    return true;
  }, {
    message: builder.tl('validation.timeRange.endTimeMustBeAfterStartTime'),
    path: ['endTime']
  });
}

/**
 * Create manual alert schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createManualAlertSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    title: builder.name(),
    message: builder.description(true),
    severity: builder.enum(SCHEMA_CONFIG.SEVERITY_LEVELS, 'severity'),
    channels: builder.array(builder.string('channel', 1), 'channels', 1).default(['system']) // Default to system channel
  }, 'manualAlert');
}

/**
 * Create alert configuration schema (thresholds/settings) with i18n support
 */
export function createAlertConfigSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    thresholds: builder.object({
      errorRate: builder.number('errorRate', 0).optional(),
      responseTime: builder.number('responseTime', 0).optional(),
      failureCount: builder.number('failureCount', 0).optional(),
      securityIncident: builder.number('securityIncident', 0).optional()
    }, 'thresholds').optional(),
    settings: builder.object({
      notificationsEnabled: builder.coerceBoolean('notificationsEnabled').optional(),
      autoEscalation: builder.coerceBoolean('autoEscalation').optional()
    }, 'settings').optional()
  }, 'alertConfig');
}

/**
 * Create realtime incident creation schema with i18n support
 */
export function createRealtimeIncidentSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    type: builder.string('incidentType', 1, 100).default('test_incident'),
    severity: builder.enum(['low', 'medium', 'high', 'critical'], 'severity').default('low'),
    description: builder.string('description', 0, 500).optional(),
    metadata: builder.record(builder.any(), 'metadata').optional()
  }, 'realtimeIncident');
}

/**
 * Create dashboard export schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createDashboardExportSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    format: builder.enum(['json', 'csv'], 'format').default('json'),
    timeRange: builder.enum(['last_1h', 'last_6h', 'last_24h', 'last_7d', 'last_30d'], 'timeRange').default('last_24h'),
    includeCharts: builder.coerceBoolean('includeCharts').default(false),
    compression: builder.coerceBoolean('compression').default(false)
  }, 'dashboardExport');
}

/**
 * Create all realtime monitoring i18n schemas at once
 * @param {string} lang - Language code
 * @returns {Object} All realtime monitoring schemas with translated messages
 */
export function createRealtimeMonitoringSchemas(lang = 'en') {
  return {
    monitoringConfigSchema: createMonitoringConfigSchema(lang),
    alertRuleSchema: createAlertRuleSchema(lang),
    alertChannelSchema: createAlertChannelSchema(lang),
    threatResolutionSchema: createThreatResolutionSchema(lang),
    timeRangeSchema: createTimeRangeSchema(lang),
    manualAlertSchema: createManualAlertSchema(lang),
    alertConfigSchema: createAlertConfigSchema(lang),
    realtimeIncidentSchema: createRealtimeIncidentSchema(lang),
    dashboardExportSchema: createDashboardExportSchema(lang)
  };
}
