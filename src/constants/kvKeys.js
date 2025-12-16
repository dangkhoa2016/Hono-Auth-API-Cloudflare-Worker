
/**
 * Default configurations - fallback values when KV is not available
*/
export const DEFAULT_CONFIGS = {
  // App Info
  APP_NAME: 'Hono Auth API',
  APP_VERSION: '1.0.0',

  // Debug & Development
  DEBUG: 'hono-auth-api:*',
  ENABLE_DETAILED_ERRORS: true,
  LOG_SQL_QUERIES: false,
  ENABLE_RESPONSE_BODY_CAPTURE: false, // Super admin can enable response body capture for debugging

  // Rate Limiting
  RATE_LIMIT_MAX_ATTEMPTS: 5,
  RATE_LIMIT_LOCKOUT_DURATION: 120,
  RATE_LIMIT_DISABLED: false,

  // Pagination
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 100,

  // Security
  SECURITY_HIGH_RISK_THRESHOLD: 10,

  // Security Headers
  SECURITY_X_CONTENT_TYPE_OPTIONS: 'nosniff',
  SECURITY_X_FRAME_OPTIONS: 'DENY',
  SECURITY_X_XSS_PROTECTION: '1; mode=block',
  SECURITY_CSP: 'default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:; font-src \'self\'; connect-src \'self\'; media-src \'self\'; object-src \'none\'; frame-src \'none\'; worker-src \'self\'; manifest-src \'self\'; base-uri \'self\'; form-action \'self\'',
  SECURITY_REFERRER_POLICY: 'strict-origin-when-cross-origin',
  SECURITY_PERMISSIONS_POLICY: 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()',
  SECURITY_COOP: 'same-origin',
  SECURITY_COEP: 'require-corp',
  SECURITY_CORP: 'same-origin',
  SECURITY_X_DOWNLOAD_OPTIONS: 'noopen',
  SECURITY_X_PERMITTED_CDP: 'none',
  SECURITY_HSTS: 'max-age=31536000; includeSubDomains; preload',

  // Token Security
  MAX_REFRESH_TOKENS_PER_USER: 5,
  REFRESH_TOKEN_REUSE_GRACE_SECONDS: 30,
  JWT_ISSUER: 'hono-auth-worker',
  JWT_AUDIENCE: 'hono-auth-client',
  JWT_ENFORCE_ISSUER: true,
  JWT_ENFORCE_AUDIENCE: true,
  JWT_ALLOWED_CLOCK_SKEW: 10,
  JWT_MAX_ACCESS_TOKEN_LIFETIME: 7200,
  JWT_DEFAULT_SCOPE: 'user:basic',
  JWT_SCOPE_SEPARATOR: ' ',
  JWT_SUBJECT_PREFIX: 'user',
  ENFORCE_ACCESS_TOKEN_IP_BINDING: false,
  ENFORCE_ACCESS_TOKEN_UA_BINDING: false,

  // Performance
  PERFORMANCE_GOOD_THRESHOLD: 1000,

  // User Management
  AUTO_ACTIVATE_USER_ON_REGISTER: false,

  // CORS
  CORS_ORIGIN: '*',

  // ==========================================================================
  // AUDIT SYSTEM CONFIGURATION
  // ==========================================================================

  // Retention Policies
  AUDIT_DEFAULT_RETENTION_DAYS: 90,
  AUDIT_SENSITIVE_RETENTION_DAYS: 365,
  AUDIT_COMPLIANCE_RETENTION_DAYS: 2555, // 7 years for compliance
  AUDIT_AUTO_ARCHIVE_ENABLED: true,
  AUDIT_AUTO_ARCHIVE_THRESHOLD_DAYS: 30,

  // Performance Settings
  AUDIT_MAX_QUERY_RESULTS: 1000,
  AUDIT_DEFAULT_PAGE_SIZE: 50,
  AUDIT_MAX_PAGE_SIZE: 500,
  AUDIT_QUERY_TIMEOUT_MS: 30000,
  AUDIT_BATCH_SIZE: 100,

  // Alert Thresholds
  AUDIT_FAILED_LOGIN_THRESHOLD: 5,
  AUDIT_SUSPICIOUS_ACTIVITY_THRESHOLD: 10,
  AUDIT_HIGH_RISK_ACTION_THRESHOLD: 3,
  AUDIT_PERFORMANCE_ALERT_THRESHOLD_MS: 5000,

  // Feature Toggles
  AUDIT_ENABLE_REAL_TIME_MONITORING: true,
  AUDIT_ENABLE_ADVANCED_ANALYTICS: true,
  AUDIT_ENABLE_EXPORT: true,
  AUDIT_ENABLE_ARCHIVAL: true,
  AUDIT_ENABLE_COMPLIANCE_REPORTING: true,
  AUDIT_ENABLE_PERFORMANCE_MONITORING: true,
  AUDIT_ENABLE_ADVANCED_SEARCH: true,

  // Real-time Monitoring
  AUDIT_REALTIME_BUFFER_SIZE: 1000,
  AUDIT_REALTIME_FLUSH_INTERVAL_MS: 5000,
  AUDIT_REALTIME_MAX_CONNECTIONS: 100,
  AUDIT_THREAT_DETECTION_ENABLED: true,

  // Export Configuration
  AUDIT_EXPORT_MAX_RECORDS: 10000,
  AUDIT_EXPORT_ALLOWED_FORMATS: 'csv,json,excel',
  AUDIT_EXPORT_TIMEOUT_MS: 120000,
  AUDIT_EXPORT_COMPRESSION_ENABLED: true,

  // Analytics Settings
  AUDIT_ANALYTICS_CACHE_TTL_MS: 300000, // 5 minutes
  AUDIT_ANALYTICS_MAX_TIME_RANGE_DAYS: 365,
  AUDIT_ANALYTICS_ENABLE_BEHAVIORAL: true,
  AUDIT_ANALYTICS_ENABLE_SECURITY: true,

  // Security Incident Management
  AUDIT_INCIDENT_AUTO_DETECTION_ENABLED: true,
  AUDIT_INCIDENT_RESPONSE_TIMEOUT_MS: 60000,
  AUDIT_INCIDENT_MAX_SEVERITY_LEVEL: 5,
  AUDIT_INCIDENT_EMAIL_NOTIFICATIONS_ENABLED: false,

  // Compliance Settings
  AUDIT_COMPLIANCE_GDPR_ENABLED: true,
  AUDIT_COMPLIANCE_SOX_ENABLED: false,
  AUDIT_COMPLIANCE_HIPAA_ENABLED: false,
  AUDIT_COMPLIANCE_AUTO_REPORT_ENABLED: false,
};

/**
 * KV Configuration Keys
 * List of keys allowed to be stored in Cloudflare KV
*/
export const KV_CONFIG_KEYS = Object.keys(DEFAULT_CONFIGS);


/**
 * Check if the key is valid for KV storage
 * @param {string} key - Key needed to check
 * @returns {boolean} - True if the key is valid, false otherwise
 * @example
 * const isValid = isValidKVKey('RATE_LIMIT_MAX_ATTEMPTS');
 * console.log(isValid); // true
 * @example
 * const isValid = isValidKVKey('INVALID_KEY');
 * console.log(isValid); // false
*/
export function isValidKVKey(key) {
  return KV_CONFIG_KEYS.includes(key);
}

/**
 * Get all KV keys
*/
export function getAllKVKeys() {
  return [...KV_CONFIG_KEYS];
}
