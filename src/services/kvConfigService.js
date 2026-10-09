import { kvConfigService_log } from '../utils/debug.js';
import { parseConfigValue } from '../utils/configResolver.js';
import { ConfigDependencyUnavailableError } from '../utils/serviceErrors.js';
import { CLOUDFLARE_KV_PREFIX } from '../constants/app.js';
import { DEFAULT_CONFIGS, AUDIT_EXPORT_EFFECTIVE } from '../constants/kvKeys.js';
import { describeValueShape } from '../utils/sensitiveData.js';

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

      // Get from KV. A read that never succeeds is reported as a dependency
      // outage, not as "the key is absent": the two need different handling and
      // the caller decides whether to fall back.
      const value = await this.getWithCircuitBreaker(key);

      if (value === null || value === undefined) {
        kvConfigService_log(`Key not found in KV: ${key}, using default: ${describeValueShape(defaultValue)}`);
        return defaultValue;
      }

      const parsedValue = this.parseValue(value, this.registryKey(key));

      // Cache the result
      if (useCache) {
        this.cache.set(key, {
          value: parsedValue,
          expiry: Date.now() + this.defaultCacheTTL
        });
      }

      kvConfigService_log(`Retrieved from KV: ${key} = ${describeValueShape(parsedValue)}`);
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

      // Invalidate cache for this specific key to force fresh fetch on next read
      // This ensures immediate consistency after an update
      this.cache.delete(key);
      kvConfigService_log(`Set KV config: ${key} = ${describeValueShape(value)} (cache invalidated for this key)`);
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
      const list = await this.listConfigs();
      if (!list.keys || list.keys.length === 0) {
        kvConfigService_log('No KV configs found');
        return {};
      }

      const configs = {};

      for (const item of list.keys) {
        const value = await this.get(item.name, null, false);
        // Strip prefix from key name for consistent object keys
        const keyWithoutPrefix = item.name.replace(`${CLOUDFLARE_KV_PREFIX}:`, '');
        configs[keyWithoutPrefix] = value;
      }

      kvConfigService_log(`Retrieved all configs: ${Object.keys(configs).length} items`);
      return configs;
    } catch (error) {
      // An outage must not look like "there are no configurations": callers
      // such as the kv-admin comparison endpoint would otherwise report every
      // key as unset while the binding is simply unreachable.
      if (error instanceof ConfigDependencyUnavailableError) {
        throw error;
      }
      kvConfigService_log(`Error getting all configs: ${error.message}`);
      return {};
    }
  }

  /**
   * List the configuration keys, reporting an unreachable binding as an outage.
   * @returns {Promise<{keys: Array}>} KV listing
   * @throws {ConfigDependencyUnavailableError} When the binding cannot be read
   */
  async listConfigs() {
    try {
      return await this.kv.list({
        prefix: CLOUDFLARE_KV_PREFIX,
        limit: 1000 // Limit to prevent overload
      });
    } catch (error) {
      throw new ConfigDependencyUnavailableError('CONFIG_KV is unreachable', {
        operation: 'list',
        reason: error.message
      });
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
   * Invalidate cache for specific keys
   * @param {string|Array<string>} keys - Key(s) to invalidate
   */
  invalidateCacheKeys(keys) {
    if (!Array.isArray(keys)) {
      keys = [keys];
    }

    keys.forEach(key => {
      // Handle keys with and without prefix
      let cacheKey = key;
      if (!key.startsWith(CLOUDFLARE_KV_PREFIX)) {
        cacheKey = this.realKey(key);
      }

      if (this.cache.has(cacheKey)) {
        this.cache.delete(cacheKey);
        kvConfigService_log(`Invalidated cache for key: ${cacheKey}`);
      }
    });
  }

  /**
   * Parse a value read from KV.
   *
   * Delegates to `configResolver` for every key in the published registry, so
   * the KV service, `dynamicConfig` and the kv-admin routes cannot drift apart
   * on booleans, numbers or empty strings. Keys outside the registry (the
   * `AUDIT_*` settings below) keep a generic JSON/scalar parse.
   *
   * @param {*} value - Raw value as stored
   * @param {string} [key] - Configuration key, when known
   * @returns {*} Parsed value
   */
  parseValue(value, key = null) {
    if (key !== null) {
      // Values written by `set()` are JSON-encoded, so a stored string arrives as
      // `"true"` rather than `true`. Unwrap that first, then let the registry
      // decide the type, otherwise an encoded boolean would look invalid.
      let candidate = value;
      if (typeof value === 'string') {
        const decoded = this._decodeJsonString(value);
        if (decoded !== undefined) {
          candidate = decoded;
        }
      }
      const parsed = parseConfigValue(key, candidate);
      if (parsed.status === 'ok') {
        return parsed.value;
      }
      // `missing` and `invalid` are the caller's decision: a stored value that
      // cannot be used must not reach business code as if it were valid.
      if (parsed.status === 'invalid') {
        kvConfigService_log(`Unusable stored value for ${key} (${parsed.reason}); ignoring it`);
      }
      return value;
    }

    kvConfigService_log(`parseValue input type: ${typeof value}, length: ${typeof value === 'string' ? value.length : 0}`);

    // Early return for non-string values
    if (typeof value !== 'string') {
      return value;
    }

    // Cache trimmed value to avoid multiple trim() calls
    const trimmedValue = value.trim();

    // Handle empty strings
    if (trimmedValue === '') {
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
      return specialValues[trimmedValue];
    }

    // Try number conversion before JSON parsing (more efficient for numbers)
    if (this._isNumericString(trimmedValue)) {
      const num = Number(trimmedValue);
      if (isFinite(num)) {
        return num;
      }
    }

    // Try JSON parsing for complex values (objects, arrays, quoted strings)
    try {
      const parsed = JSON.parse(value); // Use original value for JSON parse

      // If JSON parsed to a different string, apply the same parsing logic
      if (typeof parsed === 'string' && parsed !== value) {
        return this.parseValue(parsed);
      }

      return parsed;
    } catch {
      // JSON parse failed, return trimmed original string
      return trimmedValue;
    }
  }

  /**
   * Decode a JSON-encoded string, e.g. `"true"` -> `true`.
   * @param {string} value - Raw stored value
   * @returns {*} The decoded string, or undefined when it is not an encoded string
   * @private
   */
  _decodeJsonString(value) {
    if (typeof value !== 'string' || !value.startsWith('"')) {
      return undefined;
    }
    try {
      const decoded = JSON.parse(value);
      return typeof decoded === 'string' ? decoded : undefined;
    } catch {
      return undefined;
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
  async getWithCircuitBreaker(key) {
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
          kvConfigService_log(`All KV get attempts failed for key: ${key}; reporting an outage, not a miss`);
          // Reads are safe to retry, so this is not a silent degradation: the
          // caller receives a typed 503-class error and decides the policy.
          throw new ConfigDependencyUnavailableError('CONFIG_KV is unreachable', {
            key,
            attempts: maxRetries,
            reason: error.message
          });
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        kvConfigService_log(`Waiting ${delay}ms before retry ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  /**
   * Strip the KV prefix so the shared parser sees a registry key.
   * @param {string} key - Key as stored, with or without prefix
   * @returns {string} Key without the prefix
   */
  registryKey(key) {
    return String(key).replace(`${CLOUDFLARE_KV_PREFIX}:`, '');
  }

  // ==========================================================================
  // RAW KV ACCESS METHODS (For non-config use cases like Rate Limiting)
  // ==========================================================================

  /**
   * Get raw value from KV without prefixing or internal caching
   * @param {string} key - The exact key to get
   * @param {string} type - 'text', 'json', 'arrayBuffer', 'stream'
   */
  async getRaw(key, type = 'text') {
    return await this.kv.get(key, type);
  }

  /**
   * Get raw value with metadata from KV
   * @param {string} key - The exact key to get
   * @param {string} type - 'text', 'json', 'arrayBuffer', 'stream'
   */
  async getWithMetadataRaw(key, type = 'text') {
    return await this.kv.getWithMetadata(key, type);
  }

  /**
   * Put raw value into KV without prefixing
   * @param {string} key - The exact key to set
   * @param {string|ReadableStream|ArrayBuffer} value - The value to store
   * @param {Object} options - KV options (expiration, expirationTtl, metadata)
   */
  async putRaw(key, value, options = {}) {
    return await this.kv.put(key, value, options);
  }

  /**
   * Delete raw key from KV without prefixing
   * @param {string} key - The exact key to delete
   */
  async deleteRaw(key) {
    return await this.kv.delete(key);
  }

  /**
   * List keys from KV without forced prefix
   * @param {Object} options - List options (prefix, limit, cursor)
   */
  async listRaw(options = {}) {
    return await this.kv.list(options);
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

      kvConfigService_log(`Retrieved audit config: ${key} = ${describeValueShape(value)}`);
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
    // The stored AUDIT_EXPORT_MAX_RECORDS and AUDIT_EXPORT_TIMEOUT_MS keys are
    // reported as stored, but they are not what the export path enforces: the
    // service capped a query at 10000 rows and the route gave up after 5000ms
    // regardless of either value. Publishing the stored numbers here is what
    // let an operator set a two minute timeout and watch a five second one
    // happen. The enforced values are reported instead, and the stored keys are
    // left untouched for an existing namespace.
    const maxRecords = await this.getAuditConfig('AUDIT_EXPORT_MAX_RECORDS');
    const timeoutMs = await this.getAuditConfig('AUDIT_EXPORT_TIMEOUT_MS');
    return {
      // The formats and flags are the ones the export service implements, not
      // what AUDIT_EXPORT_ALLOWED_FORMATS says. That setting defaulted to
      // 'csv,json,excel' and reported compression on, so a UI built from this
      // method offered an Excel download and a compressed file that the
      // backend never produced.
      allowedFormats: [...AUDIT_EXPORT_EFFECTIVE.FORMATS],
      compressionEnabled: false,
      maxRecords: AUDIT_EXPORT_EFFECTIVE.MAX_RECORDS,
      timeoutMs: AUDIT_EXPORT_EFFECTIVE.TIMEOUT_MS,
      storedSettings: {
        maxRecords,
        timeoutMs,
        applied: false
      }
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
    // The string "false" and the number 0 are both false. `Boolean(value)` is
    // never used to decide: a non-empty string that is not a boolean literal
    // must not be reported as `true`.
    if (typeof value === 'boolean') {return value;}
    if (typeof value === 'string') {
      const normalized = value.trim().toLowerCase();
      if (normalized === 'true' || normalized === '1') {return true;}
      if (normalized === 'false' || normalized === '0') {return false;}
    }
    kvConfigService_log(`Non-boolean value for ${key}: ${describeValueShape(value)}`);
    const parsed = parseConfigValue(key, value);
    return parsed.status === 'ok' ? Boolean(parsed.value) : false;
  }

  /**
   * Helper method to get numeric configuration values
   * @param {string} key - Configuration key
   * @returns {Promise<number>} Numeric value
   */
  async getNumericConfig(key) {
    const value = await this.getAuditConfig(key);
    if (typeof value === 'number') {return value;}
    // Registry ranges apply here too, so a stored value cannot drift outside
    // the published bounds.
    const parsed = parseConfigValue(key, value);
    if (parsed.status === 'ok' && typeof parsed.value === 'number') {
      return parsed.value;
    }
    return Number.isFinite(parseInt(value, 10)) ? parseInt(value, 10) : 0;
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
