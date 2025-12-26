import { kvConfigService_log } from '../utils/debug.js';
import { CLOUDFLARE_KV_PREFIX } from '../constants/app.js';
import { DEFAULT_CONFIGS } from '../constants/kvKeys.js';

/**
 * KV Configuration Service
 * Manages dynamic configuration through Cloudflare KV
 * Includes audit-specific configuration methods
*/
export class KVConfigService {
  constructor(env) {
    this.kv = env.CONFIG_KV;
    this.cache = new Map();
    this.defaultCacheTTL = 300000; // 5 minutes
    kvConfigService_log('KVConfigService initialized');
  }

  /**
   * Get configuration value with caching and circuit breaker
   * @param {string} key - Name of the configuration key
   * @param {*} defaultValue - Default value if key not found
   * @param {boolean} useCache - Whether to use cache (default: true)
   * @returns {Promise<*>} Configuration value
   */
  async get(key, defaultValue = null, useCache = true) {
    if (!key || typeof key !== 'string') {
      kvConfigService_log(`Invalid key: ${key}`);
      return defaultValue;
    }

    // Check if the key has a prefix
    if (!key.startsWith(CLOUDFLARE_KV_PREFIX)) {
      key = this.realKey(key);
      kvConfigService_log(`Key without prefix, using real key: ${key}`);
    }

    try {
      // Check cache first
      if (useCache && this.cache.has(key)) {
        const cached = this.cache.get(key);
        if (Date.now() < cached.expiry) {
          kvConfigService_log(`Cache hit for key: ${key}`);
          return cached.value;
        }
        this.cache.delete(key);
      }

      // Get from KV with circuit breaker
      const value = await this.getWithCircuitBreaker(key, defaultValue);

      if (value === null) {
        kvConfigService_log(`Key not found in KV: ${key}, using default: ${defaultValue}`);
        return defaultValue;
      }

      const parsedValue = this.parseValue(value);

      // Cache the result
      if (useCache) {
        this.cache.set(key, {
          value: parsedValue,
          expiry: Date.now() + this.defaultCacheTTL
        });
      }

      kvConfigService_log(`Retrieved from KV: ${key} = ${parsedValue}`);
      return parsedValue;
    } catch (error) {
      kvConfigService_log(`Error getting key ${key}: ${error.message}`);
      return defaultValue;
    }
  }

  /**
   * Set configuration value
   */
  async set(key, value) {
    if (!key || typeof key !== 'string') {
      kvConfigService_log(`Invalid key: ${key}`);
      return false;
    }

    // Check if the key has a prefix
    if (!key.startsWith(CLOUDFLARE_KV_PREFIX)) {
      key = this.realKey(key);
      kvConfigService_log(`Key without prefix, using real key: ${key}`);
    }

    try {
      const stringValue = JSON.stringify(value);
      await this.kv.put(key, stringValue);

      // Update cache
      this.cache.set(key, {
        value: value,
        expiry: Date.now() + this.defaultCacheTTL
      });

      kvConfigService_log(`Set KV config: ${key} = ${value}`);
      return true;
    } catch (error) {
      kvConfigService_log(`Error setting key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete configuration
   */
  async delete(key) {
    if (!key || typeof key !== 'string') {
      kvConfigService_log(`Invalid key: ${key}`);
      return false;
    }

    // Check if the key has a prefix
    if (!key.startsWith(CLOUDFLARE_KV_PREFIX)) {
      key = this.realKey(key);
      kvConfigService_log(`Key without prefix, using real key: ${key}`);
    }

    try {
      await this.kv.delete(key);
      this.cache.delete(key);
      kvConfigService_log(`Deleted KV config: ${key}`);
      return true;
    } catch (error) {
      kvConfigService_log(`Error deleting key ${key}: ${error.message}`);
      return false;
    }
  }

  /**
   * Get all configurations
   */
  async getAll() {
    try {
      const list = await this.kv.list({
        prefix: CLOUDFLARE_KV_PREFIX,
        limit: 1000 // Limit to prevent overload
      });
      if (!list.keys || list.keys.length === 0) {
        kvConfigService_log('No KV configs found');
        return {};
      }

      const configs = {};

      for (const item of list.keys) {
        const value = await this.get(item.name, null, false);
        configs[item.name] = value;
      }

      kvConfigService_log(`Retrieved all configs: ${Object.keys(configs).length} items`);
      return configs;
    } catch (error) {
      kvConfigService_log(`Error getting all configs: ${error.message}`);
      return {};
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    kvConfigService_log('Cache cleared');
  }

  /**
   * Parse value from string - Optimized version
   * Handles type conversion with better performance and cleaner logic
   */
  parseValue(value) {
    kvConfigService_log(`parseValue input: ${JSON.stringify(value)} (type: ${typeof value})`);

    // Early return for non-string values
    if (typeof value !== 'string') {
      return value;
    }

    // Cache trimmed value to avoid multiple trim() calls
    const trimmedValue = value.trim();

    // Handle empty strings
    if (trimmedValue === '') {
      // kvConfigService_log('parseValue returning empty string');
      return '';
    }

    // Handle special literal values first (most common cases)
    const specialValues = {
      'true': true,
      'false': false,
      'null': null,
      'undefined': undefined
    };

    if (trimmedValue in specialValues) {
      const result = specialValues[trimmedValue];
      // kvConfigService_log(`parseValue special value: ${trimmedValue} -> ${result}`);
      return result;
    }

    // Try number conversion before JSON parsing (more efficient for numbers)
    if (this._isNumericString(trimmedValue)) {
      const num = Number(trimmedValue);
      if (isFinite(num)) {
        // kvConfigService_log(`parseValue number converted: ${num} (type: ${typeof num})`);
        return num;
      }
    }

    // Try JSON parsing for complex values (objects, arrays, quoted strings)
    try {
      const parsed = JSON.parse(value); // Use original value for JSON parse
      // kvConfigService_log(`parseValue JSON parsed: ${JSON.stringify(parsed)} (type: ${typeof parsed})`);

      // If JSON parsed to a different string, apply the same parsing logic
      if (typeof parsed === 'string' && parsed !== value) {
        return this.parseValue(parsed);
      }

      return parsed;
    } catch {
      // JSON parse failed, return trimmed original string
      // kvConfigService_log(`parseValue returning original string: ${trimmedValue}`);
      return trimmedValue;
    }
  }

  /**
   * Helper method to check if a string represents a valid number
   * @private
   */
  _isNumericString(str) {
    // Handle edge cases
    if (str === '' || str === '.' || str === '-' || str === '+') {
      return false;
    }

    // Use parseFloat and Number for validation
    const num = parseFloat(str);
    return !isNaN(num) && isFinite(num) && str === num.toString();
  }

  /**
   * Get real key with prefix
  */
  realKey(key) {
    return `${CLOUDFLARE_KV_PREFIX}:${key}`;
  }

  /**
   * Get configuration value with circuit breaker pattern
   * @param {string} key - Configuration key
   * @param {*} defaultValue - Default value if operation fails
   * @returns {Promise<*>} Configuration value or default
   */
  async getWithCircuitBreaker(key, defaultValue) {
    const maxRetries = 3;
    const baseDelay = 100; // 100ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        kvConfigService_log(`KV get attempt ${attempt}/${maxRetries} for key: ${key}`);
        const value = await this.kv.get(key);
        return value; // Success, return the value
      } catch (error) {
        kvConfigService_log(`KV get attempt ${attempt} failed: ${error.message}`);

        if (attempt === maxRetries) {
          kvConfigService_log(`All KV get attempts failed for key: ${key}, using circuit breaker fallback`);
          return defaultValue; // Circuit breaker: return default after all retries
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        kvConfigService_log(`Waiting ${delay}ms before retry ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  // ==========================================================================
  // AUDIT CONFIGURATION METHODS
  // ==========================================================================

  /**
   * Get audit-specific configuration with caching
   * @param {string} key - Configuration key
   * @param {*} defaultValue - Default value if not found
   * @returns {Promise<*>} Configuration value
   */
  async getAuditConfig(key, defaultValue = null) {
    const cacheKey = `audit_${key}`;

    // Check cache first
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() < cached.expiry) {
        kvConfigService_log(`Cache hit for audit config: ${key}`);
        return cached.value;
      }
      this.cache.delete(cacheKey);
    }

    try {
      const value = await this.get(key, defaultValue || DEFAULT_CONFIGS[key]);

      // Cache the result
      this.cache.set(cacheKey, {
        value: value,
        expiry: Date.now() + this.defaultCacheTTL
      });

      kvConfigService_log(`Retrieved audit config: ${key} = ${value} (type: ${typeof value})`);
      return value;
    } catch (error) {
      kvConfigService_log(`Error getting audit config ${key}: ${error.message}`);
      return defaultValue || DEFAULT_CONFIGS[key];
    }
  }

  /**
   * Get retention policies configuration
   * @returns {Promise<Object>} Retention policies settings
   */
  async getRetentionPolicies() {
    return {
      defaultRetentionDays: await this.getAuditConfig('AUDIT_DEFAULT_RETENTION_DAYS'),
      sensitiveRetentionDays: await this.getAuditConfig('AUDIT_SENSITIVE_RETENTION_DAYS'),
      complianceRetentionDays: await this.getAuditConfig('AUDIT_COMPLIANCE_RETENTION_DAYS'),
      autoArchiveEnabled: await this.getBooleanConfig('AUDIT_AUTO_ARCHIVE_ENABLED'),
      autoArchiveThresholdDays: await this.getAuditConfig('AUDIT_AUTO_ARCHIVE_THRESHOLD_DAYS')
    };
  }

  /**
   * Get performance settings
   * @returns {Promise<Object>} Performance configuration
   */
  async getPerformanceSettings() {
    return {
      maxQueryResults: await this.getAuditConfig('AUDIT_MAX_QUERY_RESULTS'),
      defaultPageSize: await this.getAuditConfig('AUDIT_DEFAULT_PAGE_SIZE'),
      maxPageSize: await this.getAuditConfig('AUDIT_MAX_PAGE_SIZE'),
      queryTimeoutMs: await this.getAuditConfig('AUDIT_QUERY_TIMEOUT_MS'),
      batchSize: await this.getAuditConfig('AUDIT_BATCH_SIZE')
    };
  }

  /**
   * Get alert thresholds
   * @returns {Promise<Object>} Alert threshold settings
   */
  async getAlertThresholds() {
    return {
      failedLoginThreshold: await this.getAuditConfig('AUDIT_FAILED_LOGIN_THRESHOLD'),
      suspiciousActivityThreshold: await this.getAuditConfig('AUDIT_SUSPICIOUS_ACTIVITY_THRESHOLD'),
      highRiskActionThreshold: await this.getAuditConfig('AUDIT_HIGH_RISK_ACTION_THRESHOLD'),
      performanceAlertThresholdMs: await this.getAuditConfig('AUDIT_PERFORMANCE_ALERT_THRESHOLD_MS')
    };
  }

  /**
   * Get feature flags for audit system
   * @returns {Promise<Object>} Feature flags configuration
   */
  async getFeatureFlags() {
    return {
      enableAuditLogging: await this.getBooleanConfig('AUDIT_ENABLE_AUDIT_LOGGING'),
      enableRealTimeMonitoring: await this.getBooleanConfig('AUDIT_ENABLE_REAL_TIME_MONITORING'),
      enableAdvancedAnalytics: await this.getBooleanConfig('AUDIT_ENABLE_ADVANCED_ANALYTICS'),
      enableExport: await this.getBooleanConfig('AUDIT_ENABLE_EXPORT'),
      enableArchival: await this.getBooleanConfig('AUDIT_ENABLE_ARCHIVAL'),
      enableComplianceReporting: await this.getBooleanConfig('AUDIT_ENABLE_COMPLIANCE_REPORTING'),
      enablePerformanceMonitoring: await this.getBooleanConfig('AUDIT_ENABLE_PERFORMANCE_MONITORING'),
      enableAdvancedSearch: await this.getBooleanConfig('AUDIT_ENABLE_ADVANCED_SEARCH')
    };
  }

  /**
   * Get real-time monitoring settings
   * @returns {Promise<Object>} Real-time monitoring configuration
   */
  async getRealtimeMonitoringSettings() {
    return {
      bufferSize: await this.getAuditConfig('AUDIT_REALTIME_BUFFER_SIZE'),
      flushIntervalMs: await this.getAuditConfig('AUDIT_REALTIME_FLUSH_INTERVAL_MS'),
      maxConnections: await this.getAuditConfig('AUDIT_REALTIME_MAX_CONNECTIONS'),
      threatDetectionEnabled: await this.getBooleanConfig('AUDIT_THREAT_DETECTION_ENABLED')
    };
  }

  /**
   * Get export configuration
   * @returns {Promise<Object>} Export settings
   */
  async getExportSettings() {
    const allowedFormats = await this.getAuditConfig('AUDIT_EXPORT_ALLOWED_FORMATS');
    return {
      maxRecords: await this.getAuditConfig('AUDIT_EXPORT_MAX_RECORDS'),
      allowedFormats: typeof allowedFormats === 'string'
        ? allowedFormats.split(',').map(f => f.trim())
        : ['csv', 'json'],
      timeoutMs: await this.getAuditConfig('AUDIT_EXPORT_TIMEOUT_MS'),
      compressionEnabled: await this.getBooleanConfig('AUDIT_EXPORT_COMPRESSION_ENABLED')
    };
  }

  /**
   * Get analytics settings
   * @returns {Promise<Object>} Analytics configuration
   */
  async getAnalyticsSettings() {
    return {
      cacheTtlMs: await this.getAuditConfig('AUDIT_ANALYTICS_CACHE_TTL_MS'),
      maxTimeRangeDays: await this.getAuditConfig('AUDIT_ANALYTICS_MAX_TIME_RANGE_DAYS'),
      enableBehavioral: await this.getBooleanConfig('AUDIT_ANALYTICS_ENABLE_BEHAVIORAL'),
      enableSecurity: await this.getBooleanConfig('AUDIT_ANALYTICS_ENABLE_SECURITY')
    };
  }

  /**
   * Get security incident management settings
   * @returns {Promise<Object>} Security incident configuration
   */
  async getSecurityIncidentSettings() {
    return {
      autoDetectionEnabled: await this.getBooleanConfig('AUDIT_INCIDENT_AUTO_DETECTION_ENABLED'),
      responseTimeoutMs: await this.getAuditConfig('AUDIT_INCIDENT_RESPONSE_TIMEOUT_MS'),
      maxSeverityLevel: await this.getAuditConfig('AUDIT_INCIDENT_MAX_SEVERITY_LEVEL'),
      emailNotificationsEnabled: await this.getBooleanConfig('AUDIT_INCIDENT_EMAIL_NOTIFICATIONS_ENABLED')
    };
  }

  /**
   * Get compliance settings
   * @returns {Promise<Object>} Compliance configuration
   */
  async getComplianceSettings() {
    return {
      gdprEnabled: await this.getBooleanConfig('AUDIT_COMPLIANCE_GDPR_ENABLED'),
      soxEnabled: await this.getBooleanConfig('AUDIT_COMPLIANCE_SOX_ENABLED'),
      hipaaEnabled: await this.getBooleanConfig('AUDIT_COMPLIANCE_HIPAA_ENABLED'),
      autoReportEnabled: await this.getBooleanConfig('AUDIT_COMPLIANCE_AUTO_REPORT_ENABLED')
    };
  }

  /**
   * Helper method to get boolean configuration values
   * @param {string} key - Configuration key
   * @returns {Promise<boolean>} Boolean value
   */
  async getBooleanConfig(key) {
    const value = await this.getAuditConfig(key);
    if (typeof value === 'boolean') {return value;}
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true';
    }
    return Boolean(value);
  }

  /**
   * Helper method to get numeric configuration values
   * @param {string} key - Configuration key
   * @returns {Promise<number>} Numeric value
   */
  async getNumericConfig(key) {
    const value = await this.getAuditConfig(key);
    return typeof value === 'number' ? value : parseInt(value, 10) || 0;
  }

  /**
   * Get all audit configurations in one response
   * @returns {Promise<Object>} All audit configuration data
   */
  async getAllAuditConfigurations() {
    try {
      kvConfigService_log('Getting all audit configurations');

      // Get all configuration types
      const [
        retentionPolicies,
        performanceSettings,
        alertThresholds,
        featureFlags,
        realtimeSettings,
        exportSettings,
        analyticsSettings,
        securityIncidentSettings,
        complianceSettings
      ] = await Promise.all([
        this.getRetentionPolicies(),
        this.getPerformanceSettings(),
        this.getAlertThresholds(),
        this.getFeatureFlags(),
        this.getRealtimeMonitoringSettings(),
        this.getExportSettings(),
        this.getAnalyticsSettings(),
        this.getSecurityIncidentSettings(),
        this.getComplianceSettings()
      ]);

      const allConfigs = {
        retentionPolicies,
        performanceSettings,
        alertThresholds,
        featureFlags,
        realtimeSettings,
        exportSettings,
        analyticsSettings,
        securityIncidentSettings,
        complianceSettings
      };

      kvConfigService_log('Successfully retrieved all audit configurations');
      return allConfigs;
    } catch (error) {
      kvConfigService_log(`Error getting all configurations: ${error.message}`);
      throw error;
    }
  }
}
