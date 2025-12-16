/**
 * KV Configuration Validation Schemas
 * Unified basic and i18n-aware Zod schemas for KV configuration management
 */

import { createSchemaBuilder } from './base.js';

// ============================================================================
// I18N SCHEMA CREATORS
// ============================================================================

/**
 * Create config update schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createConfigUpdateSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    value: builder.union([
      builder.string('value'),
      builder.number('value'),
      builder.boolean('value')
    ], 'configValue'),
    description: builder.description().optional(),
    metadata: builder.record(builder.any(), 'metadata').optional()
  }, 'configUpdate', { requiredField: 'value' }).strict();
}

/**
 * Create config batch update schema with i18n support
 * @param {string} lang - Language code
 * @returns {Object} Zod schema with translated messages
 */
export function createConfigBatchUpdateSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);

  return builder.object({
    configs: builder.array(
      builder.object({
        key: builder.name(),
        value: builder.union([
          builder.string('value'),
          builder.number('value'),
          builder.boolean('value')
        ], 'configValue'),
        description: builder.description().optional()
      }, 'configItem'),
      'configs',
      1,
      50
    )
  }, 'configBatchUpdate');
}

/**
 * Create all KV i18n schemas at once
 * @param {string} lang - Language code
 * @returns {Object} All KV schemas with translated messages
 */
export function createKvI18nSchemas(lang = 'en') {
  return {
    configUpdateSchema: createConfigUpdateSchema(lang),
    configBatchUpdateSchema: createConfigBatchUpdateSchema(lang)
  };
}
