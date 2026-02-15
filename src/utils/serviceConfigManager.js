import { BaseService } from '../services/baseService.js';
import { serviceConfig_log } from '../utils/debug.js';

/**
 * Centralized Service Configuration Manager
 * Optimizes config access across all services with shared caching
*/
export class ServiceConfigManager {
  constructor() {
    this._globalCache = new Map();
    this._instances = new Map();
    this._cacheTimeout = 5 * 60 * 1000; // 5 minutes
    serviceConfig_log('ServiceConfigManager initialized');
  }

  /**
   * Get or create service instance with optimized config
   * @param {string} serviceName - Name of the service
   * @param {Function} serviceClass - Service class constructor
   * @param {Object} env - Environment context
   * @returns {Object} Service instance
   */
  getServiceInstance(serviceName, serviceClass, env) {
    const envHash = this._generateEnvHash(env);
    const instanceKey = `${serviceName}_${envHash}`;

    if (!this._instances.has(instanceKey)) {
      const instance = new serviceClass(env);

      // If it's a BaseService, share global cache
      if (instance instanceof BaseService) {
        instance._configCache = this._globalCache;
        serviceConfig_log(`${serviceName}: Shared global config cache`);
      }

      this._instances.set(instanceKey, instance);
      serviceConfig_log(`${serviceName}: Created new instance with shared config`);
    }

    return this._instances.get(instanceKey);
  }

  /**
   * Pre-warm configurations for better performance
   * @param {Object} env - Environment context
   * @param {Array<string>} configKeys - Config keys to pre-warm
   */
  async preWarmConfigs(env, configKeys = []) {
    serviceConfig_log(`Pre-warming ${configKeys.length} configurations`);

    const tempService = new BaseService(env, 'PreWarmer');
    tempService._configCache = this._globalCache;

    try {
      await tempService.getBulkConfigs(configKeys);
      serviceConfig_log(`Successfully pre-warmed ${configKeys.length} configurations`);
    } catch (error) {
      serviceConfig_log(`Error pre-warming configs: ${error.message}`);
    }
  }

  /**
   * Generate hash for environment to identify unique contexts
   * @param {Object} env - Environment context
   * @returns {string} Environment hash
   */
  _generateEnvHash(env) {
    // Simple hash based on key environment variables
    const keys = ['ENV', 'DEBUG', 'JWT_SECRET'];
    const values = keys.map(key => env[key] || '').join('|');
    return btoa(values).slice(0, 8);
  }

  /**
   * Clear all cached configurations
   */
  clearAllCache() {
    this._globalCache.clear();
    
    // Also clear cache for all service instances
    for (const [key, instance] of this._instances.entries()) {
      // Clear KVConfigService's own cache
      if (instance && typeof instance.clearCache === 'function') {
        instance.clearCache();
      }
      // Clear BaseService's config cache
      if (instance && typeof instance.clearConfigCache === 'function') {
        instance.clearConfigCache();
      }
    }
    
    this._instances.clear();
    serviceConfig_log('Cleared all global cache, KV config caches, BaseService caches, and service instances');
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    return {
      globalCacheSize: this._globalCache.size,
      serviceInstances: this._instances.size,
      cacheKeys: Array.from(this._globalCache.keys())
    };
  }
}

// Singleton instance
export const serviceConfigManager = new ServiceConfigManager();
