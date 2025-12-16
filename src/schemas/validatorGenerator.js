/**
 * Schema Validator Generator
 * Utility to generate validator functions from centralized schema definitions
 */

import { getSchemaRegistry } from './registry.js';
import { i18nValidator } from '../middleware/i18nValidator.js';

/**
 * Generate validator middleware functions from schema registry
 * This replaces the manually maintained list in i18nValidator.js
 */
export function generateValidatorMiddleware() {
  const validators = {};
  const registry = getSchemaRegistry();

  for (const [schemaName, metadata] of Object.entries(registry)) {
    const { friendlyName, target, description } = metadata;

    // Create validator function with default target from registry
    validators[friendlyName] = (customTarget = target) => i18nValidator(customTarget, schemaName);

    // Add metadata for documentation
    validators[friendlyName].schemaName = schemaName;
    validators[friendlyName].defaultTarget = target;
    validators[friendlyName].description = description;
    validators[friendlyName].category = metadata.category;
  }

  return validators;
}

/**
 * Generate TypeScript-like type definitions for validators (for documentation)
 */
export function generateValidatorTypes() {
  const registry = getSchemaRegistry();
  const types = [];

  for (const [schemaName, metadata] of Object.entries(registry)) {
    const { friendlyName, target, description } = metadata;
    types.push({
      name: friendlyName,
      signature: `${friendlyName}(target?: '${target}' | 'json' | 'query' | 'param' | 'form' | 'header'): Middleware`,
      description,
      defaultTarget: target,
      schemaName
    });
  }

  return types.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Validate that all schema names in definitions exist in registry
 */
export function validateSchemaDefinitions() {
  const registry = getSchemaRegistry();
  const results = {
    valid: true,
    errors: [],
    warnings: [],
    stats: {
      totalSchemas: Object.keys(registry).length,
      totalValidators: Object.keys(registry).length,
      categories: {}
    }
  };

  // Count by category
  for (const metadata of Object.values(registry)) {
    if (!results.stats.categories[metadata.category]) {
      results.stats.categories[metadata.category] = 0;
    }
    results.stats.categories[metadata.category]++;
  }

  // Check for duplicate friendly names
  const friendlyNames = new Set();
  const duplicates = new Set();

  for (const [, metadata] of Object.entries(registry)) {
    if (friendlyNames.has(metadata.friendlyName)) {
      duplicates.add(metadata.friendlyName);
      results.valid = false;
    }
    friendlyNames.add(metadata.friendlyName);
  }

  if (duplicates.size > 0) {
    results.errors.push(`Duplicate friendly names found: ${Array.from(duplicates).join(', ')}`);
  }

  return results;
}

/**
 * Generate documentation for all validators
 */
export function generateValidatorDocumentation() {
  const types = generateValidatorTypes();
  const grouped = {};

  // Group by category
  for (const type of types) {
    const registry = getSchemaRegistry();
    const metadata = registry[type.schemaName];
    const category = metadata.category;

    if (!grouped[category]) {
      grouped[category] = [];
    }
    grouped[category].push(type);
  }

  return {
    total: types.length,
    byCategory: grouped,
    allTypes: types
  };
}

/**
 * Get validator information for debugging
 */
export function getValidatorDebugInfo(validatorName) {
  const registry = getSchemaRegistry();

  for (const [schemaName, metadata] of Object.entries(registry)) {
    if (metadata.friendlyName === validatorName) {
      return {
        validatorName,
        schemaName,
        defaultTarget: metadata.target || metadata.defaultTarget,
        ...metadata,
        found: true
      };
    }
  }

  return {
    validatorName,
    found: false,
    error: `Validator '${validatorName}' not found in registry`
  };
}

/**
 * Create schema registry utilities for tools
 */
export function createSchemaRegistryUtils() {
  return {
    findValidatorByName: (validatorName) => {
      return getValidatorDebugInfo(validatorName);
    },

    getAvailableValidators: () => {
      const registry = getSchemaRegistry();
      return Object.entries(registry).map(([schemaName, metadata]) => ({
        schemaName,
        friendlyName: metadata.friendlyName,
        category: metadata.category,
        description: metadata.description
      }));
    },

    getCategories: () => {
      const registry = getSchemaRegistry();
      const categories = new Set();
      Object.values(registry).forEach(metadata => {
        categories.add(metadata.category);
      });
      return Array.from(categories).sort();
    },

    getValidatorsByCategory: (category) => {
      const registry = getSchemaRegistry();
      return Object.entries(registry)
        .filter(([, metadata]) => metadata.category === category)
        .map(([schemaName, metadata]) => ({
          schemaName,
          friendlyName: metadata.friendlyName,
          description: metadata.description,
          defaultTarget: metadata.target,
          category: metadata.category
        }));
    },

    getSchemasByCategory: (category) => {
      const registry = getSchemaRegistry();
      return Object.entries(registry)
        .filter(([, metadata]) => metadata.category === category)
        .map(([schemaName, metadata]) => ({
          schemaName,
          friendlyName: metadata.friendlyName,
          description: metadata.description
        }));
    },

    getUsageExample: (validatorName) => {
      const info = getValidatorDebugInfo(validatorName);
      if (!info.found) {
        return 'Validator not found';
      }

      return `
// Using ${validatorName} validator in route
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';

app.post('/route', i18nValidatorsMiddleware.${validatorName}(), async (c) => {
  const data = c.req.valid('json');
  // Your route logic here
});`;
    }
  };
}
