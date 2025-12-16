/**
 * Schema Registry - Centralized schema management and caching
 * High-performance schema registry with intelligent caching and fallback strategies
 */

// Import centralized schema definitions
import {
  SCHEMA_CATEGORIES
} from './definitions.js';
import { schemaRegistry_log } from '../utils/debug.js';

// Import schema creator functions statically
import { createAuthI18nSchemas } from './auth.js';
import { createUserI18nSchemas } from './user.js';
import { createAdminI18nSchemas } from './admin.js';
import { createAuditI18nSchemas } from './audit.js';
import { createAdvancedAuditI18nSchemas } from './advancedAudit.js';
import { createAuditRetentionI18nSchemas } from './auditRetention.js';
import { createRealtimeMonitoringSchemas } from './realtimeMonitoring.js';
import { createSecurityIncidentI18nSchemas } from './securityIncident.js';
import { createKvI18nSchemas } from './kv.js';
import { createZodDemoSchemas } from './zodDemo.js';

/**
 * Schema cache configuration
 */
const CACHE_CONFIG = {
  maxSize: 200,
  ttl: 600000, // 10 minutes
  cleanupInterval: 300000 // 5 minutes
};

/**
 * Schema cache with timestamp tracking
 */
class SchemaCache {
  constructor() {
    this.cache = new Map();
    this.stats = {
      hits: 0,
      misses: 0,
      creations: 0,
      evictions: 0
    };

    // No automatic cleanup in Cloudflare Workers - will cleanup on access
  }

  /**
   * Generate cache key
   */
  generateKey(schemaName, lang) {
    return `${schemaName}:${lang}`;
  }

  /**
   * Get schema from cache
   */
  get(schemaName, lang) {
    const key = this.generateKey(schemaName, lang);
    const entry = this.cache.get(key);

    if (entry && (Date.now() - entry.timestamp) < CACHE_CONFIG.ttl) {
      this.stats.hits++;
      return entry.schema;
    }

    if (entry) {
      this.cache.delete(key);
    }

    this.stats.misses++;

    // Opportunistic cleanup on cache miss (instead of timer-based)
    if (this.stats.misses % 10 === 0) {
      this.cleanExpired();
    }

    return null;
  }

  /**
   * Set schema in cache
   */
  set(schemaName, lang, schema) {
    const key = this.generateKey(schemaName, lang);

    // Clean up if cache is too large
    if (this.cache.size >= CACHE_CONFIG.maxSize) {
      this.evictOldest();
    }

    this.cache.set(key, {
      schema,
      timestamp: Date.now()
    });

    this.stats.creations++;
  }

  /**
   * Evict oldest entries
   */
  evictOldest() {
    let oldestKey = null;
    let oldestTimestamp = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
      this.stats.evictions++;
    }
  }

  /**
   * Clean expired entries
   */
  cleanExpired() {
    const now = Date.now();
    let cleaned = 0;

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > CACHE_CONFIG.ttl) {
        this.cache.delete(key);
        cleaned++;
      }
    }

    return cleaned;
  }

  /**
   * Manual cleanup method (replaces timer-based cleanup)
   */
  manualCleanup() {
    return this.cleanExpired();
  }

  /**
   * Get cache statistics
   */
  getStats() {
    const hitRate = this.stats.hits / (this.stats.hits + this.stats.misses) * 100;
    return {
      ...this.stats,
      hitRate: isNaN(hitRate) ? 0 : hitRate,
      cacheSize: this.cache.size,
      maxSize: CACHE_CONFIG.maxSize
    };
  }

  /**
   * Clear cache
   */
  clear() {
    const size = this.cache.size;
    this.cache.clear();
    return size;
  }
}

// Global schema cache instance
const schemaCache = new SchemaCache();

// Note: SCHEMA_REGISTRY removed - now generated dynamically from definitions.js

/**
 * Generate schema registry from definitions
 * Creates schema metadata from centralized definitions
 */
function generateSchemaRegistry() {
  const registry = {};

  // Generate from SCHEMA_CATEGORIES
  for (const [category, categoryData] of Object.entries(SCHEMA_CATEGORIES)) {
    for (const [schemaName, schemaConfig] of Object.entries(categoryData.schemas)) {
      registry[schemaName] = {
        category,
        target: schemaConfig.defaultTarget,
        friendlyName: schemaConfig.validatorName,
        description: `${schemaConfig.validatorName.charAt(0).toUpperCase() + schemaConfig.validatorName.slice(1)} validation`
      };
    }
  }

  return registry;
}

// Generate schema registry from definitions
const SCHEMA_REGISTRY = generateSchemaRegistry();

/**
 * Schema creator function cache with static imports
 * Uses static imports instead of dynamic imports to avoid Cloudflare Workers issues
 */
const CATEGORY_CREATOR_FUNCTIONS = {
  auth: createAuthI18nSchemas,
  user: createUserI18nSchemas,
  admin: createAdminI18nSchemas,
  audit: createAuditI18nSchemas,
  advancedAudit: createAdvancedAuditI18nSchemas,
  auditRetention: createAuditRetentionI18nSchemas,
  realtimeMonitoring: createRealtimeMonitoringSchemas,
  securityIncident: createSecurityIncidentI18nSchemas,
  kv: createKvI18nSchemas,
  demo: createZodDemoSchemas
};

/**
 * Get creator function for a schema category with static mapping
 * @param {string} category - Category name
 * @returns {Function} Creator function
 */
function getCreatorFunction(category) {
  const creatorFunction = CATEGORY_CREATOR_FUNCTIONS[category];
  if (!creatorFunction) {
    throw new Error(`Category '${category}' not found in creator functions`);
  }
  return creatorFunction;
}

/**
 * Get schema metadata
 * @param {string} schemaName - Schema name
 * @returns {Object|null} Schema metadata or null
 */
export function getSchemaMetadata(schemaName) {
  return SCHEMA_REGISTRY[schemaName] || null;
}

/**
 * Get all schema registry data
 * @returns {Object} Complete schema registry
 */
export function getSchemaRegistry() {
  return SCHEMA_REGISTRY;
}

/**
 * Generate convenience validator function name and default target
 * @param {string} schemaName - Schema name
 * @returns {Object} { friendlyName, defaultTarget } or null
 */
export function getValidatorInfo(schemaName) {
  const metadata = SCHEMA_REGISTRY[schemaName];
  if (!metadata) {
    return null;
  }

  return {
    friendlyName: metadata.friendlyName,
    defaultTarget: metadata.target,
    description: metadata.description,
    category: metadata.category
  };
}

/**
 * Get schema with intelligent fallback and caching
 * @param {string} schemaName - Name of the schema
 * @param {string} lang - Language code
 * @returns {Promise<Object|null>} Schema object or null
 */
export async function getSchema(schemaName, lang = 'en') {
  // Step 1: Check cache first
  const cachedSchema = schemaCache.get(schemaName, lang);
  if (cachedSchema) {
    return cachedSchema;
  }

  // Step 2: Get schema metadata to find category
  const metadata = getSchemaMetadata(schemaName);
  if (!metadata) {
    schemaRegistry_log(`Schema metadata for '${schemaName}' not found in registry`);
    return null;
  }

  // Step 3: Get creator function statically by category
  try {
    const creatorFunction = getCreatorFunction(metadata.category);
    const i18nSchemas = await creatorFunction(lang);
    const schema = i18nSchemas[schemaName];

    if (schema) {
      schemaCache.set(schemaName, lang, schema);
      return schema;
    }
  } catch (error) {
    schemaRegistry_log(`Failed to create i18n schema for '${schemaName}': ${error.message}`);
  }

  schemaRegistry_log(`Schema '${schemaName}' not found in registry`);
  return null;
}

/**
 * Preload schemas for common languages
 * @param {Array<string>} languages - Languages to preload
 * @param {Array<string>} schemaNames - Schema names to preload
 */
export async function preloadSchemas(languages = ['en', 'vi'], schemaNames = Object.keys(SCHEMA_REGISTRY)) {
  const promises = [];

  for (const lang of languages) {
    for (const schemaName of schemaNames) {
      promises.push(getSchema(schemaName, lang));
    }
  }

  await Promise.all(promises);
}

/**
 * Get all available schema names
 * @returns {Array<string>} Array of schema names
 */
export function getAvailableSchemas() {
  return Object.keys(SCHEMA_REGISTRY);
}

/**
 * Get cache statistics
 * @returns {Object} Cache statistics
 */
export function getCacheStats() {
  return schemaCache.getStats();
}

/**
 * Clear schema cache
 * @returns {number} Number of entries cleared
 */
export function clearCache() {
  return schemaCache.clear();
}

/**
 * Validate schema name
 * @param {string} schemaName - Schema name to validate
 * @returns {boolean} True if schema exists
 */
export function validateSchemaName(schemaName) {
  return SCHEMA_REGISTRY[schemaName] !== undefined;
}

/**
 * Manual cache cleanup utility
 * Can be called periodically from request handlers
 * @returns {number} Number of expired entries cleaned
 */
export function cleanupCache() {
  return schemaCache.manualCleanup();
}

/**
 * Get schemas by category
 * @param {string} category - Category name (auth, user, admin, etc.)
 * @param {string} lang - Language code
 * @returns {Promise<Object>} Object with schemas from the specified category
 */
export async function getSchemasByCategory(category, lang = 'en') {
  const categoryData = SCHEMA_CATEGORIES[category];
  if (!categoryData) {
    schemaRegistry_log(`Category '${category}' not found`);
    return {};
  }

  const categorySchemas = {};
  const schemaNames = Object.keys(categoryData.schemas);
  const promises = schemaNames.map(async (schemaName) => {
    const schema = await getSchema(schemaName, lang);
    if (schema) {
      categorySchemas[schemaName] = schema;
    }
  });

  await Promise.all(promises);
  return categorySchemas;
}

/**
 * Get available categories
 * @returns {Array<string>} Array of category names
 */
export function getAvailableCategories() {
  return Object.keys(SCHEMA_CATEGORIES);
}

/**
 * Bulk preload schemas for a specific category
 * @param {string} category - Category name
 * @param {Array<string>} languages - Languages to preload
 * @returns {Promise<void>}
 */
export async function preloadCategorySchemas(category, languages = ['en', 'vi']) {
  const categoryData = SCHEMA_CATEGORIES[category];
  if (!categoryData) {return;}

  const promises = [];
  const schemaNames = Object.keys(categoryData.schemas);
  for (const lang of languages) {
    for (const schemaName of schemaNames) {
      promises.push(getSchema(schemaName, lang));
    }
  }

  await Promise.all(promises);
}
