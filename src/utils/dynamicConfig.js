import { dynamicConfig_log } from './debug.js';
import { DEFAULT_CONFIGS, isValidKVKey } from '../constants/kvKeys.js';
import { DEFAULT_JWT_SECRET } from '../constants/security.js';
import { createKvConfigService } from '../utils/serviceFactory.js';

/**
 * Get dynamic config: if key is in KV, get from KV, otherwise get from env
 * @param {Object} env - Hono Environment context
 * @param {string} key - Name of the config key
 * @param {*} defaultValue - Default value
 * @param {boolean} preferKV - Prefer KV over env (default: true)
 * @returns {Promise<*>} Value of the config
 * @throws {Error} If unable to get config
 * @throws {TypeError} If key is not a string
 * @throws {Error} If unable to parse value
 * @throws {Error} If unable to get config from KV or env
 * @throws {Error} If unable to get config from KV or env, returns default value
 * @example
 * const value = await getDynamicConfig(env, 'MY_CONFIG_KEY', 'default value');
 * console.log(value); // 'default value' or the value from KV/env
*/
export async function getDynamicConfig(env, key, defaultValue = null, preferKV = true) {
  try {
    const isKVKey = isValidKVKey(key);
    const kvConfig = createKvConfigService(env);

    if (isKVKey && kvConfig && preferKV) {
      // first: get from KV, fallback to env, then default
      const kvValue = await kvConfig.get(key);
      if (kvValue !== null && kvValue !== undefined) {
        dynamicConfig_log(`Dynamic config from cloudflare KV: ${key} = ${kvValue}`);
        return kvValue;
      }

      // Fallback to env
      if (env[key] !== undefined) {
        dynamicConfig_log(`Dynamic config fallback to ENV: ${key} = ${env[key]}`);
        return parseEnvValue(env[key]);
      }

      // Fallback to default
      const finalDefault = defaultValue !== null ? defaultValue : DEFAULT_CONFIGS[key];
      dynamicConfig_log(`Dynamic config using default: ${key} = ${finalDefault}`);
      return finalDefault;
    } else {
      // Get from env first, fallback to KV (if any), then default
      if (env[key] !== undefined) {
        dynamicConfig_log(`Dynamic config from ENV: ${key} = ${env[key]}`);
        return parseEnvValue(env[key]);
      }

      // Fallback to KV if key is in KV
      if (isKVKey && kvConfig) {
        const kvValue = await kvConfig.get(key);
        if (kvValue !== null && kvValue !== undefined) {
          dynamicConfig_log(`Dynamic config fallback to KV: ${key} = ${kvValue}`);
          return kvValue;
        }
      }

      // Fallback to default
      const finalDefault = defaultValue !== null ? defaultValue : DEFAULT_CONFIGS[key];
      dynamicConfig_log(`Dynamic config using default: ${key} = ${finalDefault}`);
      return finalDefault;
    }
  } catch (error) {
    dynamicConfig_log(`Error getting dynamic config for ${key}: ${error.message}`);
    const finalDefault = defaultValue !== null ? defaultValue : DEFAULT_CONFIGS[key];
    return finalDefault;
  }
}

/**
 * Parse value from env (string) to appropriate data type
 * @param {string} value - Value from env
 * @returns {*} Parsed value
 * @example
 * const parsed = parseEnvValue('true'); // true
 * const parsed = parseEnvValue('123'); // 123
 * const parsed = parseEnvValue('null'); // null
 * const parsed = parseEnvValue('undefined'); // undefined
 * const parsed = parseEnvValue('some string'); // 'some string'
 * @throws {Error} If unable to parse value
*/
function parseEnvValue(value) {
  if (typeof value !== 'string') {
    return value;
  }

  // Boolean values
  if (value === 'true') {return true;}
  if (value === 'false') {return false;}

  // Null/undefined
  if (value === 'null') {return null;}
  if (value === 'undefined') {return undefined;}

  // Numbers
  const num = Number(value);
  if (!isNaN(num) && isFinite(num) && value.trim() !== '') {
    return num;
  }

  return value;
}

/**
 * Get boolean config with validation
 * @param {Object} env - Hono Environment context
 * @param {string} key - Name of the config key
 * @param {boolean} defaultValue - Default value if not found
 * @returns {Promise<boolean>} Parsed boolean value
 * @example
 * const value = await getBooleanConfig(env, 'MY_BOOLEAN_CONFIG', false);
 * console.log(value); // true or false
 * @throws {Error} If unable to get config
*/
export async function getBooleanConfig(env, key, defaultValue = false) {
  try {
    const value = await getDynamicConfig(env, key, defaultValue);
    return Boolean(value);
  } catch (error) {
    dynamicConfig_log(`Error getting boolean config for ${key}: ${error.message}`);
    return Boolean(defaultValue);
  }
}

/**
 * Get number config with validation
 * @param {Object} env - Hono Environment context
 * @param {string} key - Name of the config key
 * @param {number} defaultValue - Default value if not found
 * @param {number} min - Minimum value (optional)
 * @param {number} max - Maximum value (optional)
 * @returns {Promise<number>} Parsed number value
 * @example
 * const value = await getNumberConfig(env, 'MY_NUMBER_CONFIG', 10, 0, 100);
 * console.log(value); // 10 or the value from KV/env
*/
export async function getNumberConfig(env, key, defaultValue = 0, min = null, max = null) {
  try {
    const value = await getDynamicConfig(env, key, defaultValue);
    let num = Number(value);

    if (isNaN(num) || !isFinite(num)) {
      num = Number(defaultValue);
    }

    if (min !== null && num < min) {num = min;}
    if (max !== null && num > max) {num = max;}

    return num;
  } catch (error) {
    dynamicConfig_log(`Error getting number config for ${key}: ${error.message}`);
    return Number(defaultValue);
  }
}

/**
 * Get string config with validation
 * @param {Object} env - Hono Environment context
 * @param {string} key - Name of the config key
 * @param {string} defaultValue - Default value if not found
 * @param {number} maxLength - Maximum length of the string (optional)
 * @returns {Promise<string>} Parsed string value
 * @example
 * const value = await getStringConfig(env, 'MY_STRING_CONFIG', 'default', 100);
 * console.log(value); // 'default' or the value from KV/env
*/
export async function getStringConfig(env, key, defaultValue = '', maxLength = null) {
  try {
    const value = await getDynamicConfig(env, key, defaultValue);
    let str = String(value);

    if (maxLength !== null && str.length > maxLength) {
      str = str.substring(0, maxLength);
    }

    return str;
  } catch (error) {
    dynamicConfig_log(`Error getting string config for ${key}: ${error.message}`);
    return String(defaultValue);
  }
}

/**
 * Check maintenance mode
 * @param {Object} env - Hono Environment context
 * @param {boolean} defaultValue - Default value if not found
 * @returns {Promise<boolean>} True if maintenance mode is enabled, false otherwise
 * @example
 * const isMaintenance = await isMaintenanceMode(env);
 * console.log(isMaintenance); // true or false
*/
export async function isMaintenanceMode(env) {
  return await getBooleanConfig(env, 'MAINTENANCE_MODE', false);
}

/**
 * Get rate limit settings
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Rate limit settings
 * @property {boolean} disabled - Whether rate limiting is disabled
 * @property {number} maxAttempts - Maximum allowed attempts
 * @property {number} lockoutDuration - Lockout duration in seconds
 * @example
 * const settings = await getRateLimitSettings(env);
 * console.log(settings); // { disabled: false, maxAttempts: 5, lockoutDuration: 120 }
*/
export async function getRateLimitSettings(env) {
  return {
    disabled: await getBooleanConfig(env, 'RATE_LIMIT_DISABLED', false),
    maxAttempts: await getNumberConfig(env, 'RATE_LIMIT_MAX_ATTEMPTS', 5, 1, 100),
    lockoutDuration: await getNumberConfig(env, 'RATE_LIMIT_LOCKOUT_DURATION', 120, 30, 3600)
  };
}

/**
 * Get performance settings
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Performance settings
 * @property {number} goodThreshold - Threshold for good performance in milliseconds
 * @example
 * const settings = await getPerformanceSettings(env);
 * console.log(settings); // { goodThreshold: 1000 }
*/
export async function getPerformanceSettings(env) {
  return {
    goodThreshold: await getNumberConfig(env, 'PERFORMANCE_GOOD_THRESHOLD', 1000, 100, 10000)
  };
}

/**
 * Get pagination settings
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Pagination settings
 * @property {number} defaultPageSize - Default page size for pagination
 * @property {number} maxPageSize - Maximum page size for pagination
 * @example
 * const settings = await getPaginationSettings(env);
 * console.log(settings); // { defaultPageSize: 10, maxPageSize: 100 }
*/
export async function getPaginationSettings(env) {
  return {
    defaultPageSize: await getNumberConfig(env, 'DEFAULT_PAGE_SIZE', 10, 1, 100),
    maxPageSize: await getNumberConfig(env, 'MAX_PAGE_SIZE', 100, 10, 1000)
  };
}

/**
 * Get bcrypt configuration (dynamic)
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Bcrypt configuration
 * @property {number} saltRounds - Number of salt rounds for bcrypt
 * @example
 * const bcryptConfig = await getBcryptSettings(env);
 * console.log(bcryptConfig); // { saltRounds: 10 }
*/
export async function getBcryptSettings(env) {
  return {
    saltRounds: await getNumberConfig(env, 'BCRYPT_SALT_ROUNDS', 10, 4, 16)
  };
}

/**
 * Get JWT configuration (dynamic)
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} JWT configuration
 * @property {string} secret - JWT secret
 * @property {number} accessTokenExpires - Access token expiration in seconds
 * @property {number} refreshTokenExpires - Refresh token expiration in seconds
 * @example
 * const jwtConfig = await getJwtSettings(env);
 * console.log(jwtConfig); // { secret: 'your-super-secret-jwt-key-change-this-in-production', accessTokenExpires: 3600, refreshTokenExpires: 259200 }
*/
export async function getJwtSettings(env) {
  const issuer = await getStringConfig(env, 'JWT_ISSUER', 'hono-auth-worker');
  const audienceRaw = await getStringConfig(env, 'JWT_AUDIENCE', 'hono-auth-client');
  const scopeSeparator = await getStringConfig(env, 'JWT_SCOPE_SEPARATOR', ' ');
  const audience = parseStringArray(audienceRaw);
  const subjectPrefix = await getStringConfig(env, 'JWT_SUBJECT_PREFIX', 'user');
  const maxAccessTokenLifetime = await getNumberConfig(env, 'JWT_MAX_ACCESS_TOKEN_LIFETIME', 7200, 600, 86400);
  return {
    secret: await getStringConfig(env, 'JWT_SECRET', DEFAULT_JWT_SECRET),
    accessTokenExpires: await getNumberConfig(env, 'JWT_ACCESS_TOKEN_EXPIRES', 3600, 300, 86400), // 1 hour default
    refreshTokenExpires: await getNumberConfig(env, 'JWT_REFRESH_TOKEN_EXPIRES', 259200, 3600, 604800), // 3 days default
    issuer,
    audience: audience.length ? audience : [audienceRaw || 'hono-auth-client'],
    enforceIssuer: await getBooleanConfig(env, 'JWT_ENFORCE_ISSUER', true),
    enforceAudience: await getBooleanConfig(env, 'JWT_ENFORCE_AUDIENCE', true),
    allowedClockSkew: await getNumberConfig(env, 'JWT_ALLOWED_CLOCK_SKEW', 10, 0, 120),
    maxAccessTokenLifetime,
    defaultScope: await getStringConfig(env, 'JWT_DEFAULT_SCOPE', 'user:basic'),
    scopeSeparator: scopeSeparator || ' ',
    subjectPrefix
  };
}

/**
 * Get token security configuration (dynamic)
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Token security configuration
 * @property {number} maxRefreshTokensPerUser - Maximum number of active refresh tokens per user
 * @property {number} refreshTokenReuseGraceSeconds - Grace period (seconds) for refresh token reuse detection
 */
export async function getTokenSecuritySettings(env) {
  const strictIpBinding = await getBooleanConfig(env, 'STRICT_IP_BINDING', false);
  return {
    maxRefreshTokensPerUser: await getNumberConfig(env, 'MAX_REFRESH_TOKENS_PER_USER', 5, 1, 50),
    refreshTokenReuseGraceSeconds: await getNumberConfig(env, 'REFRESH_TOKEN_REUSE_GRACE_SECONDS', 30, 0, 600),
    enforceAccessTokenIpBinding: await getBooleanConfig(env, 'ENFORCE_ACCESS_TOKEN_IP_BINDING', strictIpBinding),
    enforceAccessTokenUserAgentBinding: await getBooleanConfig(env, 'ENFORCE_ACCESS_TOKEN_UA_BINDING', false),
    enforceRefreshTokenIpBinding: await getBooleanConfig(env, 'ENFORCE_REFRESH_TOKEN_IP_BINDING', strictIpBinding),
    enforceRefreshTokenUserAgentBinding: await getBooleanConfig(env, 'ENFORCE_REFRESH_TOKEN_UA_BINDING', false)
  };
}

/**
 * Get metrics configuration (dynamic)
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Metrics configuration
 * @property {number} recentHours - Number of hours for recent metrics
 * @property {number} weeklyDays - Number of days for weekly metrics
 * @property {number} monthlyDays - Number of days for monthly metrics
 * @property {number} quarterlyDays - Number of days for quarterly metrics
 * @example
 * const metricsConfig = await getMetricsSettings(env);
 * console.log(metricsConfig); // { recentHours: 24, weeklyDays: 7, monthlyDays: 30, quarterlyDays: 90 }
 * @throws {Error} If unable to get config
 * @throws {TypeError} If any value is not a number
 * @throws {Error} If unable to get config from KV or env, returns default value
*/
export async function getMetricsSettings(env) {
  return {
    recentHours: await getNumberConfig(env, 'METRICS_RECENT_HOURS', 24, 1, 168),
    weeklyDays: await getNumberConfig(env, 'METRICS_WEEKLY_DAYS', 7, 1, 14),
    monthlyDays: await getNumberConfig(env, 'METRICS_MONTHLY_DAYS', 30, 1, 90),
    quarterlyDays: await getNumberConfig(env, 'METRICS_QUARTERLY_DAYS', 90, 30, 365)
  };
}

/**
 * Get security configuration (dynamic)
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Security configuration
 * @property {number} highRiskThreshold - Threshold for high risk actions
 * @property {number} performanceGoodThreshold - Threshold for good performance in milliseconds
 * @example
 * const securityConfig = await getSecuritySettings(env);
 * console.log(securityConfig); // { highRiskThreshold: 10, performanceGoodThreshold: 1000 }
*/
export async function getSecuritySettings(env) {
  return {
    highRiskThreshold: await getNumberConfig(env, 'SECURITY_HIGH_RISK_THRESHOLD', 10, 1, 100),
    performanceGoodThreshold: await getNumberConfig(env, 'PERFORMANCE_GOOD_THRESHOLD', 1000, 100, 10000)
  };
}

/**
 * Get feature flags configuration (dynamic)
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Feature flags configuration
 * @property {boolean} autoActivateUserOnRegister - Whether to auto-activate user on registration
 * @property {boolean} disableRateLimiting - Whether to disable rate limiting
 * @property {boolean} enableDetailedErrors - Whether to enable detailed error messages
 * @property {boolean} logSqlQueries - Whether to log SQL queries
 * @example
 * const featureFlags = await getFeatureFlags(env);
 * console.log(featureFlags); // { autoActivateUserOnRegister: false, disableRateLimiting: false, enableDetailedErrors: false, logSqlQueries: false }
*/
export async function getFeatureFlags(env) {
  return {
    autoActivateUserOnRegister: await getBooleanConfig(env, 'AUTO_ACTIVATE_USER_ON_REGISTER', false),
    disableRateLimiting: await getBooleanConfig(env, 'RATE_LIMIT_DISABLED', false),
    enableDetailedErrors: await getBooleanConfig(env, 'ENABLE_DETAILED_ERRORS', false),
    logSqlQueries: await getBooleanConfig(env, 'LOG_SQL_QUERIES', false)
  };
}

/**
 * Parse string as array (comma-separated)
 * @param {string} str - String to parse
 * @returns {Array} Parsed array
 * @example
 * const arr = parseStringArray('a,b,c'); // ['a', 'b', 'c']
*/
function parseStringArray(str) {
  if (!str) {
    return [];
  }
  return str.split(',').map(s => s.trim()).filter(s => s);
}

/**
 * Get CORS configuration from environment
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} CORS configuration
 * @property {string|Array} origin - Allowed origins (string or array)
 * @property {Array} allowMethods - Allowed HTTP methods
 * @property {Array} allowHeaders - Allowed HTTP headers
 * @example
 * const corsConfig = getCorsSettings(env);
 * console.log(corsConfig); // { origin: '*', allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], allowHeaders: ['Content-Type', 'Authorization
*/
export async function getCorsSettings(env) {
  const origin = await getStringConfig(env, 'CORS_ORIGIN', '*');
  return {
    origin: origin === '*' ? '*' : parseStringArray(origin),
    allowMethods: parseStringArray(await getStringConfig(env, 'CORS_ALLOW_METHODS', 'GET,POST,PUT,DELETE,OPTIONS')),
    allowHeaders: parseStringArray(await getStringConfig(env, 'CORS_ALLOW_HEADERS', 'Content-Type,Authorization'))
  };
}

/**
 * Get Environment configuration from environment or fallback
 * @param {Object} env - Hono Environment context
 * @returns {Promise<string>} Environment name (development, production, test, etc.)
 * @example
 * const environment = getEnvConfig(env);
 * console.log(environment); // 'development'
*/
export async function getEnvConfig(env) {
  const environment = await getStringConfig(env, 'ENV', null) || await getStringConfig(env, 'ENVIRONMENT', null);
  return (environment || '').toLowerCase() || 'development';
}

/**
 * Check if running in production environment
 * @param {Object} env - Hono Environment context
 * @returns {Promise<boolean>} True if in production environment
 * @example
 * const isProd = isProduction(env);
 * console.log(isProd); // true or false
*/
export async function isProduction(env) {
  const config = await getEnvConfig(env);
  return config === 'production';
}

/**
 * Check if running in test environment
 * @param {Object} env - Hono Environment context
 * @returns {Promise<boolean>} True if in test environment
 * @example
 * const isTestEnv = isTest(env);
 * console.log(isTestEnv); // true or false
*/
export async function isTest(env) {
  const config = await getEnvConfig(env);
  return config === 'test' || config === 'testing';
}

/**
 * Check if running in development environment
 * @param {Object} env - Hono Environment context
 * @returns {Promise<boolean>} True if in development environment
 * @example
 * const isDevEnv = isDevelopment(env);
 * console.log(isDevEnv); // true or false
*/
export async function isDevelopment(env) {
  const config = await getEnvConfig(env);
  return config === 'development';
}

/**
 * Check if running in staging environment
 * @param {Object} env - Hono Environment context
 * @returns {Promise<boolean>} True if in staging environment
 * @example
 * const isStagingEnv = isStaging(env);
 * console.log(isStagingEnv); // true or false
*/
export async function isStaging(env) {
  const config = await getEnvConfig(env);
  return config === 'staging';
}

/**
 * Get application configuration from environment
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Application configuration
 * @property {string} name - Application name
 * @property {string} version - Application version
 * @example
 * const appConfig = getAppSettings(env);
 * console.log(appConfig); // { name: 'Hono Auth API', version: '1.0.0' }
*/
export async function getAppSettings(env) {
  return {
    name: await getStringConfig(env, 'APP_NAME', 'Hono Auth API'),
    version: await getStringConfig(env, 'APP_VERSION', '1.0.0')
  };
}

/** * Get response log settings
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Response log settings
 * @property {boolean} responseCaptureEnabled - Whether response body capture is enabled
 * @example
 * const responseLogSettings = await getResponseLogSettings(env);
 * console.log(responseLogSettings); // { responseCaptureEnabled: true }
*/
export async function getResponseLogSettings(env) {
  return {
    responseCaptureEnabled: await getBooleanConfig(env, 'ENABLE_RESPONSE_BODY_CAPTURE', false)
  };
}

/**
 * Get security headers settings
 * @param {Object} env - Hono Environment context
 * @returns {Promise<Object>} Security headers configuration
 * @property {Object} headers - Security headers to apply
 * @example
 * const securityConfig = await getSecurityHeadersSettings(env);
 * console.log(securityConfig); // { headers: { 'X-Content-Type-Options': 'nosniff' } }
 */
export async function getSecurityHeadersSettings(env) {
  const isProd = await isProduction(env);

  return {
    headers: {
      // Prevent MIME type sniffing
      'X-Content-Type-Options': await getStringConfig(env, 'SECURITY_X_CONTENT_TYPE_OPTIONS', 'nosniff'),

      // Prevent clickjacking
      'X-Frame-Options': await getStringConfig(env, 'SECURITY_X_FRAME_OPTIONS', 'DENY'),

      // Enable XSS protection
      'X-XSS-Protection': await getStringConfig(env, 'SECURITY_X_XSS_PROTECTION', '1; mode=block'),

      // Content Security Policy
      'Content-Security-Policy': await getStringConfig(env, 'SECURITY_CSP', 'default-src \'self\'; script-src \'self\' \'unsafe-inline\'; style-src \'self\' \'unsafe-inline\'; img-src \'self\' data: https:; font-src \'self\'; connect-src \'self\'; media-src \'self\'; object-src \'none\'; frame-src \'none\'; worker-src \'self\'; manifest-src \'self\'; base-uri \'self\'; form-action \'self\''),

      // Control referrer policy
      'Referrer-Policy': await getStringConfig(env, 'SECURITY_REFERRER_POLICY', 'strict-origin-when-cross-origin'),

      // Control browser features
      'Permissions-Policy': await getStringConfig(env, 'SECURITY_PERMISSIONS_POLICY', 'camera=(), microphone=(), geolocation=(), payment=(), usb=(), magnetometer=(), accelerometer=(), gyroscope=()'),
      'Cross-Origin-Opener-Policy': await getStringConfig(env, 'SECURITY_COOP', 'same-origin'),
      'Cross-Origin-Embedder-Policy': await getStringConfig(env, 'SECURITY_COEP', 'require-corp'),
      'Cross-Origin-Resource-Policy': await getStringConfig(env, 'SECURITY_CORP', 'same-origin'),
      'X-Download-Options': await getStringConfig(env, 'SECURITY_X_DOWNLOAD_OPTIONS', 'noopen'),
      'X-Permitted-Cross-Domain-Policies': await getStringConfig(env, 'SECURITY_X_PERMITTED_CDP', 'none'),

      // Add HSTS only in production
      ...(isProd && {
        'Strict-Transport-Security': await getStringConfig(env, 'SECURITY_HSTS', 'max-age=31536000; includeSubDomains; preload')
      })
    }
  };
}
