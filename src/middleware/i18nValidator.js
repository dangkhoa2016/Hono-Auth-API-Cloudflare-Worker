/**
 * i18n Zod Validator Middleware
 * Optimized custom Zod validator with internationalization support
 */

import { zValidator } from '@hono/zod-validator';
import { getSchema, validateSchemaName, getCacheStats, clearCache, getSchemaRegistry } from '../schemas/registry.js';
import { generateValidatorMiddleware } from '../schemas/validatorGenerator.js';
import { t } from '../i18n/index.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { zod_log, i18nMiddleware_log } from '../utils/debug.js';

/**
 * Create i18n-aware Zod validator with high performance caching
 * @param {string} target - 'json', 'query', 'param', etc.
 * @param {string} schemaName - Name of the schema to use
 * @returns {Function} Middleware function
 */
export function i18nValidator(target, schemaName) {
  return async (c, next) => {
    const startTime = Date.now();

    try {
      // Validate schema name first
      if (!validateSchemaName(schemaName)) {
        zod_log(`Invalid schema name: ${schemaName}`);
        return handleStandardError(c, new Error('INVALID_SCHEMA_NAME'), 'Validation: invalid schema name', zod_log, 'validation', { schemaName, details: `Invalid schema name: ${schemaName}` }, 400);
      }

      // Detect language from request
      const lang = c.get('language') || 'en';
      i18nMiddleware_log(`Language detected for validation: ${lang}`);

      // Get schema using optimized registry
      const schema = await getSchema(schemaName, lang);

      if (!schema) {
        zod_log(`Schema '${schemaName}' could not be loaded for language '${lang}'`);
        return handleStandardError(c, new Error('SCHEMA_NOT_FOUND'), 'Validation: schema not found', zod_log, 'validation', { schemaName, lang, details: `Schema '${schemaName}' not found for language '${lang}'` }, 400);
      }

      const schemaLoadTime = Date.now() - startTime;
      zod_log(`Schema '${schemaName}' loaded in ${schemaLoadTime}ms for language '${lang}'`);

      // Use the standard validator with the selected schema
      const validatorMiddleware = zValidator(target, schema, (result, c) => {
        if (!result.success) {
          const validationTime = Date.now() - startTime;
          const errorCount = result.error.errors.length;

          zod_log(`Validation failed for ${schemaName} in ${validationTime}ms: ${JSON.stringify(result.error.errors)}`);

          // Format validation errors with enhanced i18n
          const errors = result.error.errors.map(err => ({
            field: err.path.join('.'),
            message: err.message,
            code: err.code,
            value: err.received
          }));


          // Aggregate localized error string (if needed for future logging) purposely omitted from payload to reduce redundancy

          const detailsString = t(c, 'api.validationErrorDetails', {
            schemaName,
            errorCount,
            count: errorCount, // enable pluralization
            validationTime,
            target
          });

          return handleStandardError(
            c,
            new Error('VALIDATION_FAILED'),
            'Validation failed',
            zod_log,
            'validation',
            { schemaName, details: detailsString, count: errorCount },
            400,
            {
              errors,
              schemaName,
              validationTime: `${validationTime}ms`,
              errorCount,
              details: detailsString
            }
          );
        }
      });

      try {
        return await validatorMiddleware(c, next);
      } catch (err) {
        // Handle malformed or unparseable JSON explicitly to return 400 instead of 500
        if (target === 'json') {
          return handleStandardError(
            c,
            err,
            'Invalid JSON payload',
            zod_log,
            'validation.invalidJson',
            { schemaName, details: err.message },
            400
          );
        }
        throw err;
      }
    } catch (error) {
      const errorTime = Date.now() - startTime;
      zod_log(`Error in i18n validator after ${errorTime}ms: ${error.message}`);
      return handleStandardError(c, error, 'Validator internal error', zod_log, 'system.serverError', { schemaName, errorTime: `${errorTime}ms` }, 500);
    }
  };
}

/**
 * Convenience functions for common validations
 * Auto-generated from schema registry - no manual maintenance needed!
 */
export const i18nValidatorsMiddleware = generateValidatorMiddleware();

/**
 * Cache management utilities
 * Provides access to cache statistics and management functions
 */
export const validatorCacheUtils = {
  /**
   * Get cache statistics
   * @returns {Object} Cache statistics including hit rate, size, etc.
   */
  getStats() {
    return getCacheStats();
  },

  /**
   * Clear all cached schemas
   * @returns {number} Number of entries cleared
   */
  clearAll() {
    const cleared = clearCache();
    zod_log(`Validator cache cleared: ${cleared} entries removed`);
    return cleared;
  },

  /**
   * Get cache health information
   * @returns {Object} Cache health metrics
   */
  getHealthInfo() {
    const stats = getCacheStats();
    return {
      ...stats,
      isHealthy: stats.hitRate > 50 && stats.cacheSize < stats.maxSize * 0.9,
      recommendations: this.getRecommendations(stats)
    };
  },

  /**
   * Get cache optimization recommendations
   * @param {Object} stats - Cache statistics
   * @returns {Array<string>} Recommendations
   */
  getRecommendations(stats) {
    const recommendations = [];

    if (stats.hitRate < 30) {
      recommendations.push('Consider preloading frequently used schemas');
    }

    if (stats.cacheSize > stats.maxSize * 0.8) {
      recommendations.push('Cache is near capacity, consider increasing maxSize');
    }

    if (stats.evictions > stats.creations * 0.1) {
      recommendations.push('High eviction rate detected, consider increasing TTL or maxSize');
    }

    return recommendations;
  }
};

/**
 * Validator performance monitoring
 */
export const validatorPerformance = {
  /**
   * Create performance monitoring middleware
   * @param {string} schemaName - Schema name for monitoring
   * @returns {Function} Middleware function
   */
  monitor(schemaName) {
    return async (_c, next) => {
      const startTime = Date.now();
      const result = await next();
      const duration = Date.now() - startTime;

      // Log performance metrics
      if (duration > 100) {
        zod_log(`Slow validation detected for ${schemaName}: ${duration}ms`);
      }

      return result;
    };
  },

  /**
   * Get validation performance summary
   * @returns {Object} Performance summary
   */
  getSummary() {
    return {
      cacheStats: getCacheStats(),
      recommendations: validatorCacheUtils.getRecommendations(getCacheStats())
    };
  }
};

/**
 * Schema registry management utilities
 * Provides tools for managing and inspecting the schema registry
 */
export const schemaRegistryUtils = {
  /**
   * Get all available validators
   * @returns {Array<Object>} Array of validator information
   */
  getAvailableValidators() {
    const registry = getSchemaRegistry();
    return Object.entries(registry).map(([schemaName, metadata]) => ({
      schemaName,
      friendlyName: metadata.friendlyName,
      category: metadata.category,
      defaultTarget: metadata.target,
      description: metadata.description
    }));
  },

  /**
   * Get validators by category
   * @param {string} category - Category name
   * @returns {Array<Object>} Validators in the specified category
   */
  getValidatorsByCategory(category) {
    return this.getAvailableValidators().filter(v => v.category === category);
  },

  /**
   * Find validator by friendly name
   * @param {string} friendlyName - Friendly name to search for
   * @returns {Object|null} Validator info or null
   */
  findValidatorByName(friendlyName) {
    return this.getAvailableValidators().find(v => v.friendlyName === friendlyName) || null;
  },

  /**
   * Get validator usage example
   * @param {string} friendlyName - Friendly name of validator
   * @returns {string|null} Usage example or null
   */
  getUsageExample(friendlyName) {
    const validator = this.findValidatorByName(friendlyName);
    if (!validator) {
      return null;
    }

    const target = validator.defaultTarget;
    return `i18nValidatorsMiddleware.${friendlyName}()  // Uses default target: '${target}'\n` +
           `i18nValidatorsMiddleware.${friendlyName}('json')  // Override target\n` +
           `// Description: ${validator.description}`;
  },

  /**
   * Get all categories
   * @returns {Array<string>} Available categories
   */
  getCategories() {
    const registry = getSchemaRegistry();
    const categories = new Set();
    Object.values(registry).forEach(metadata => categories.add(metadata.category));
    return Array.from(categories).sort();
  },

  /**
   * Generate documentation for all validators
   * @returns {string} Markdown documentation
   */
  generateDocumentation() {
    const categories = this.getCategories();
    let doc = '# i18n Validators Documentation\n\n';
    doc += 'Auto-generated from Schema Registry. All validators use their default target unless overridden.\n\n';

    categories.forEach(category => {
      doc += `## ${category.charAt(0).toUpperCase() + category.slice(1)} Validators\n\n`;
      const validators = this.getValidatorsByCategory(category);

      validators.forEach(validator => {
        doc += `### ${validator.friendlyName}\n`;
        doc += `- **Schema**: \`${validator.schemaName}\`\n`;
        doc += `- **Default Target**: \`${validator.defaultTarget}\`\n`;
        doc += `- **Description**: ${validator.description}\n`;
        doc += `- **Usage**: \`i18nValidatorsMiddleware.${validator.friendlyName}()\`\n\n`;
      });
    });

    return doc;
  },

  /**
   * Validate registry consistency
   * @returns {Object} Validation results
   */
  validateRegistry() {
    const registry = getSchemaRegistry();
    const issues = [];
    const friendlyNames = new Set();
    const duplicates = [];

    for (const [schemaName, metadata] of Object.entries(registry)) {
      // Check for required fields
      if (!metadata.category) {
        issues.push(`${schemaName}: Missing category`);
      }
      if (!metadata.target) {
        issues.push(`${schemaName}: Missing target`);
      }
      if (!metadata.friendlyName) {
        issues.push(`${schemaName}: Missing friendlyName`);
      }

      // Check for duplicate friendly names
      if (friendlyNames.has(metadata.friendlyName)) {
        duplicates.push(metadata.friendlyName);
      } else {
        friendlyNames.add(metadata.friendlyName);
      }

      // Validate target values
      if (metadata.target && !['json', 'query', 'param', 'form'].includes(metadata.target)) {
        issues.push(`${schemaName}: Invalid target '${metadata.target}'`);
      }
    }

    return {
      isValid: issues.length === 0 && duplicates.length === 0,
      issues,
      duplicateFriendlyNames: duplicates,
      totalSchemas: Object.keys(registry).length,
      totalCategories: this.getCategories().length
    };
  }
};
