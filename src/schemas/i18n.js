/**
 * I18n Schemas Index - Optimized version using registry
 * Centralized access to all i18n-aware validation schemas with caching
 */

import { initI18n } from '../i18n/config.js';
import { getAvailableSchemas, getSchema } from './registry.js';

/**
 * Create all i18n-aware Zod schemas with i18next translations
 * Optimized version that leverages the registry system for better performance
 * @param {string} lang - Language code
 * @returns {Promise<Object>} All Zod schemas with translated error messages
 */
export async function createI18nSchemas(lang = 'en') {
  // Initialize i18n if not already done
  await initI18n();

  // Get all available schema names from registry
  const availableSchemas = getAvailableSchemas();

  // Create an object to hold all schemas
  const allSchemas = {};

  // Use Promise.all for parallel schema creation (better performance)
  const schemaPromises = availableSchemas.map(async (schemaName) => {
    const schema = await getSchema(schemaName, lang);
    if (schema) {
      allSchemas[schemaName] = schema;
    }
  });

  await Promise.all(schemaPromises);

  return allSchemas;
}

/**
 * Get a specific i18n schema by name
 * @param {string} schemaName - Name of the schema
 * @param {string} lang - Language code
 * @returns {Promise<Object|null>} Schema object or null
 */
export async function getI18nSchema(schemaName, lang = 'en') {
  // Initialize i18n if not already done
  await initI18n();

  return await getSchema(schemaName, lang);
}

/**
 * Create schemas for multiple languages at once
 * @param {Array<string>} languages - Array of language codes
 * @returns {Promise<Object>} Object with language codes as keys and schema objects as values
 */
export async function createMultiLanguageSchemas(languages = ['en', 'vi']) {
  await initI18n();

  const multiLangSchemas = {};

  const langPromises = languages.map(async (lang) => {
    multiLangSchemas[lang] = await createI18nSchemas(lang);
  });

  await Promise.all(langPromises);

  return multiLangSchemas;
}
