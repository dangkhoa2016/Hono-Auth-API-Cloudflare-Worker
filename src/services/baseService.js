import {
  getJwtSettings,
  getRateLimitSettings,
  getCorsSettings,
  getPaginationSettings,
  getSecuritySettings,
  getMetricsSettings,
  getBcryptSettings,
  getFeatureFlags,
  getEmailSettings,
  getTokenSecuritySettings,
  getEnvConfig,
  isProduction,
  isDevelopment,
  isTest,
  isStaging
} from '../utils/dynamicConfig.js';
import { DatabaseService } from './databaseService.js';
import { serviceBase_log } from '../utils/debug.js';

/**
 * Base service class with optimized environment configuration management
 * Provides caching, lazy loading, and consistent access patterns
*/
export class BaseService {
  constructor(env, serviceName = 'BaseService') {
    this.db = env.DB;
    this.env = env;
    this.serviceName = serviceName;

    // Initialize config cache
    this._configCache = new Map();
    this._cacheTimestamps = new Map();
    this._cacheTimeout = 5 * 60 * 1000; // 5 minutes cache timeout

    // Initialize database service
    this._dbService = null;

    serviceBase_log(`${serviceName} initialized with optimized config management`);
  }

  /**
   * Get database service instance (lazy loading)
   */
  get dbService() {
    if (!this._dbService) {
      this._dbService = new DatabaseService(this.env);
    }
    return this._dbService;
  }

  /**
   * Check if cached config is still valid
   * @param {string} configKey - Configuration key
   * @returns {boolean} True if cache is valid
   */
  _isCacheValid(configKey) {
    const timestamp = this._cacheTimestamps.get(configKey);
    if (!timestamp) {return false;}

    return (Date.now() - timestamp) < this._cacheTimeout;
  }

  /**
   * Get cached config or fetch and cache new one
   * @param {string} configKey - Configuration key
   * @param {Function} fetchFunction - Function to fetch config
   * @returns {Promise<*>} Configuration value
   */
  async _getCachedConfig(configKey, fetchFunction) {
    // Check cache validity
    if (this._configCache.has(configKey) && this._isCacheValid(configKey)) {
      serviceBase_log(`${this.serviceName}: Using cached config for ${configKey}`);
      return this._configCache.get(configKey);
    }

    // Fetch new config
    serviceBase_log(`${this.serviceName}: Fetching fresh config for ${configKey}`);
    const config = await fetchFunction.call(this);

    // Cache the result
    this._configCache.set(configKey, config);
    this._cacheTimestamps.set(configKey, Date.now());

    return config;
  }

  /**
   * Clear specific config from cache
   * @param {string} configKey - Configuration key to clear
   */
  clearConfigCache(configKey = null) {
    if (configKey) {
      this._configCache.delete(configKey);
      this._cacheTimestamps.delete(configKey);
      serviceBase_log(`${this.serviceName}: Cleared cache for ${configKey}`);
    } else {
      this._configCache.clear();
      this._cacheTimestamps.clear();
      serviceBase_log(`${this.serviceName}: Cleared all config cache`);
    }
  }

  /**
   * Force refresh config (bypasses cache)
   * @param {string} configKey - Configuration key
   * @param {Function} fetchFunction - Function to fetch config
   * @returns {Promise<*>} Fresh configuration value
   */
  async refreshConfig(configKey, fetchFunction) {
    serviceBase_log(`${this.serviceName}: Force refreshing config for ${configKey}`);
    this.clearConfigCache(configKey);
    return await this._getCachedConfig(configKey, fetchFunction);
  }

  // ====================================================================
  // OPTIMIZED CONFIG GETTERS WITH CACHING
  // ====================================================================

  /**
   * Get JWT settings with caching
   * @returns {Promise<Object>} JWT configuration
   */
  async getJwtConfig() {
    return await this._getCachedConfig('jwt', () => getJwtSettings(this.env));
  }

  /**
   * Get Rate Limit settings with caching
   * @returns {Promise<Object>} Rate limit configuration
   */
  async getRateLimitConfig() {
    return await this._getCachedConfig('rateLimit', () => getRateLimitSettings(this.env));
  }

  /**
   * Get CORS settings with caching
   * @returns {Promise<Object>} CORS configuration
   */
  async getCorsConfig() {
    return await this._getCachedConfig('cors', () => getCorsSettings(this.env));
  }

  /**
   * Get Pagination settings with caching
   * @returns {Promise<Object>} Pagination configuration
   */
  async getPaginationConfig() {
    return await this._getCachedConfig('pagination', () => getPaginationSettings(this.env));
  }

  /**
   * Get Security settings with caching
   * @returns {Promise<Object>} Security configuration
   */
  async getSecurityConfig() {
    return await this._getCachedConfig('security', () => getSecuritySettings(this.env));
  }

  /**
   * Get Metrics settings with caching
   * @returns {Promise<Object>} Metrics configuration
   */
  async getMetricsConfig() {
    return await this._getCachedConfig('metrics', () => getMetricsSettings(this.env));
  }

  /**
   * Get Bcrypt settings with caching
   * @returns {Promise<Object>} Bcrypt configuration
   */
  async getBcryptConfig() {
    return await this._getCachedConfig('bcrypt', () => getBcryptSettings(this.env));
  }

  /**
   * Get token security settings with caching
   * @returns {Promise<Object>} Token security configuration
   */
  async getTokenSecurityConfig() {
    return await this._getCachedConfig('tokenSecurity', () => getTokenSecuritySettings(this.env));
  }

  /**
   * Get Feature Flags with caching
   * @returns {Promise<Object>} Feature flags configuration
   */
  async getFeatureFlags() {
    return await this._getCachedConfig('featureFlags', () => getFeatureFlags(this.env));
  }

  /**
   * Get Email settings with caching
   * @returns {Promise<Object>} Email configuration
   */
  async getEmailConfig() {
    return await this._getCachedConfig('email', () => getEmailSettings(this.env));
  }

  /**
   * Get Environment configuration with caching
   * @returns {Promise<string>} Environment name
   */
  async getEnvConfig() {
    return await this._getCachedConfig('environment', () => getEnvConfig(this.env));
  }

  // ====================================================================
  // ENVIRONMENT CHECK HELPERS WITH CACHING
  // ====================================================================

  /**
   * Check if running in production environment
   * @returns {Promise<boolean>} True if production
   */
  async isProduction() {
    return await this._getCachedConfig('isProduction', () => isProduction(this.env));
  }

  /**
   * Check if running in development environment
   * @returns {Promise<boolean>} True if development
   */
  async isDevelopment() {
    return await this._getCachedConfig('isDevelopment', () => isDevelopment(this.env));
  }

  /**
   * Check if running in test environment
   * @returns {Promise<boolean>} True if test
   */
  async isTest() {
    return await this._getCachedConfig('isTest', () => isTest(this.env));
  }

  /**
   * Check if running in staging environment
   * @returns {Promise<boolean>} True if staging
   */
  async isStaging() {
    return await this._getCachedConfig('isStaging', () => isStaging(this.env));
  }

  // ====================================================================
  // BULK CONFIG OPERATIONS
  // ====================================================================

  /**
   * Get multiple configs at once (optimized for bulk operations)
   * @param {Array<string>} configKeys - Array of config keys to fetch
   * @returns {Promise<Object>} Object with all requested configs
   */
  async getBulkConfigs(configKeys) {
    const configs = {};
    const fetchPromises = [];

    for (const key of configKeys) {
      switch (key) {
      case 'jwt':
        fetchPromises.push(this.getJwtConfig().then(config => configs.jwt = config));
        break;
      case 'rateLimit':
        fetchPromises.push(this.getRateLimitConfig().then(config => configs.rateLimit = config));
        break;
      case 'cors':
        fetchPromises.push(this.getCorsConfig().then(config => configs.cors = config));
        break;
      case 'pagination':
        fetchPromises.push(this.getPaginationConfig().then(config => configs.pagination = config));
        break;
      case 'security':
        fetchPromises.push(this.getSecurityConfig().then(config => configs.security = config));
        break;
      case 'metrics':
        fetchPromises.push(this.getMetricsConfig().then(config => configs.metrics = config));
        break;
      case 'bcrypt':
        fetchPromises.push(this.getBcryptConfig().then(config => configs.bcrypt = config));
        break;
      case 'featureFlags':
        fetchPromises.push(this.getFeatureFlags().then(config => configs.featureFlags = config));
        break;
      case 'environment':
        fetchPromises.push(this.getEnvConfig().then(config => configs.environment = config));
        break;
      default:
        serviceBase_log(`${this.serviceName}: Unknown config key: ${key}`);
      }
    }

    await Promise.all(fetchPromises);
    serviceBase_log(`${this.serviceName}: Bulk loaded ${Object.keys(configs).length} configs`);
    return configs;
  }

  /**
   * Get all available configs (useful for debugging)
   * @returns {Promise<Object>} All configurations
   */
  async getAllConfigs() {
    return await this.getBulkConfigs([
      'jwt',
      'rateLimit',
      'cors',
      'pagination',
      'security',
      'metrics',
      'bcrypt',
      'featureFlags',
      'environment'
    ]);
  }

  // ====================================================================
  // CACHE MANAGEMENT & DEBUGGING
  // ====================================================================

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      serviceName: this.serviceName,
      cacheSize: this._configCache.size,
      cacheKeys: Array.from(this._configCache.keys()),
      cacheTimeout: this._cacheTimeout,
      oldestCacheEntry: Math.min(...Array.from(this._cacheTimestamps.values())),
      newestCacheEntry: Math.max(...Array.from(this._cacheTimestamps.values()))
    };
  }

  /**
   * Cleanup expired cache entries
   */
  cleanupExpiredCache() {
    const now = Date.now();
    let cleanedCount = 0;

    for (const [key, timestamp] of this._cacheTimestamps.entries()) {
      if ((now - timestamp) >= this._cacheTimeout) {
        this._configCache.delete(key);
        this._cacheTimestamps.delete(key);
        cleanedCount++;
      }
    }

    if (cleanedCount > 0) {
      serviceBase_log(`${this.serviceName}: Cleaned up ${cleanedCount} expired cache entries`);
    }

    return cleanedCount;
  }
}
