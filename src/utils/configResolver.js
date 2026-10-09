/**
 * Single source of truth for reading configuration.
 *
 * Both `dynamicConfig` and `KVConfigService` go through here so that:
 *  - "missing" is distinguishable from `false`, `0` and `''`;
 *  - booleans are parsed, never coerced by string truthiness;
 *  - numbers are validated and clamped against the published registry;
 *  - the precedence KV > env > default is identical everywhere and the layer
 *    that won is reported back instead of being implied;
 *  - a value for a key outside KV_CONFIG_KEYS can never be injected through KV.
 */

import { DEFAULT_CONFIGS, KV_CONFIG_KEYS, isValidKVKey } from '../constants/kvKeys.js';
import { CLOUDFLARE_KV_PREFIX } from '../constants/app.js';
import { isSensitiveKey, MASKED } from './sensitiveData.js';
import { InvalidConfigValueError } from './serviceErrors.js';
import { configResolver_log } from './debug.js';

const KV_KEY_SET = new Set(KV_CONFIG_KEYS);

/**
 * Declared type of every key, inferred from the default so the registry cannot
 * drift from DEFAULT_CONFIGS.
 */
const CONFIG_TYPES = new Map(
  Object.entries(DEFAULT_CONFIGS).map(([key, value]) => [
    key,
    typeof value === 'boolean' ? 'boolean' : (typeof value === 'number' ? 'number' : 'string')
  ])
);

/**
 * Documented numeric bounds. A value outside the range is clamped rather than
 * rejected, because a too-large rate limit or retention window is still a
 * usable value; a non-numeric value is rejected outright.
 */
export const CONFIG_NUMBER_RANGES = Object.freeze({
  RATE_LIMIT_MAX_ATTEMPTS: { min: 1, max: 1000 },
  RATE_LIMIT_LOCKOUT_DURATION: { min: 0, max: 86400 },
  DEFAULT_PAGE_SIZE: { min: 1, max: 500 },
  MAX_PAGE_SIZE: { min: 1, max: 5000 },
  SECURITY_HIGH_RISK_THRESHOLD: { min: 1, max: 100 },
  PERFORMANCE_GOOD_THRESHOLD: { min: 100, max: 10000 },
  MAX_REFRESH_TOKENS_PER_USER: { min: 1, max: 100 },
  REFRESH_TOKEN_REUSE_GRACE_SECONDS: { min: 0, max: 300 },
  JWT_ALLOWED_CLOCK_SKEW: { min: 0, max: 300 },
  JWT_MAX_ACCESS_TOKEN_LIFETIME: { min: 60, max: 86400 },
  JWT_ACCESS_TOKEN_EXPIRES: { min: 60, max: 86400 },
  JWT_REFRESH_TOKEN_EXPIRES: { min: 60, max: 31536000 },
  AUDIT_QUERY_TIMEOUT_MS: { min: 100, max: 600000 },
  AUDIT_DEFAULT_PAGE_SIZE: { min: 1, max: 500 },
  AUDIT_MAX_PAGE_SIZE: { min: 1, max: 5000 }
});

/**
 * Keys that gate a security control. An unusable value here is refused instead
 * of being replaced by the default, because "default" for these keys can mean
 * "the control is off".
 */
export const SECURITY_SENSITIVE_KEYS = Object.freeze(new Set([
  'RATE_LIMIT_DISABLED',
  'ENABLE_DETAILED_ERRORS',
  'LOG_SQL_QUERIES',
  'JWT_ENFORCE_ISSUER',
  'JWT_ENFORCE_AUDIENCE',
  'ENFORCE_ACCESS_TOKEN_IP_BINDING',
  'ENFORCE_ACCESS_TOKEN_UA_BINDING',
  'AUDIT_ENABLE_AUDIT_LOGGING',
  'AUDIT_ENABLE_EXPORT',
  'AUDIT_ENABLE_ARCHIVAL',
  'AUDIT_ENABLE_COMPLIANCE_REPORTING',
  'AUDIT_ENABLE_ADVANCED_SEARCH',
  'AUDIT_THREAT_DETECTION_ENABLED'
]));

const TRUE_TOKENS = new Set(['true', '1']);
const FALSE_TOKENS = new Set(['false', '0']);

export function configTypeOf(key) {
  return CONFIG_TYPES.get(key) || 'string';
}

export function isSecuritySensitiveKey(key) {
  return SECURITY_SENSITIVE_KEYS.has(key);
}

/**
 * Parse one raw configuration value.
 * @param {string} key - Configuration key
 * @param {*} rawValue - Value as stored in KV / env / default table
 * @returns {{status: 'ok'|'missing'|'invalid', value: *, reason: string|null}}
 */
export function parseConfigValue(key, rawValue) {
  if (rawValue === undefined || rawValue === null) {
    return { status: 'missing', value: undefined, reason: null };
  }

  const type = configTypeOf(key);

  // An empty string is a meaningful override for a text setting ("set, but to
  // nothing" - this is how DEBUG is switched off). For a boolean or a number it
  // is not a value at all, so it counts as unset rather than as `false`/`0`.
  if (rawValue === '') {
    return type === 'string'
      ? { status: 'ok', value: '', reason: null }
      : { status: 'missing', value: undefined, reason: null };
  }

  if (type === 'boolean') {
    if (typeof rawValue === 'boolean') {
      return { status: 'ok', value: rawValue, reason: null };
    }
    if (typeof rawValue === 'number') {
      if (rawValue === 1) { return { status: 'ok', value: true, reason: null }; }
      if (rawValue === 0) { return { status: 'ok', value: false, reason: null }; }
      return { status: 'invalid', value: undefined, reason: 'not_a_boolean' };
    }
    if (typeof rawValue === 'string') {
      const normalized = rawValue.trim().toLowerCase();
      if (TRUE_TOKENS.has(normalized)) { return { status: 'ok', value: true, reason: null }; }
      if (FALSE_TOKENS.has(normalized)) { return { status: 'ok', value: false, reason: null }; }
      return { status: 'invalid', value: undefined, reason: 'not_a_boolean' };
    }
    return { status: 'invalid', value: undefined, reason: 'not_a_boolean' };
  }

  if (type === 'number') {
    let numeric;
    if (typeof rawValue === 'number') {
      numeric = rawValue;
    } else if (typeof rawValue === 'string') {
      const trimmed = rawValue.trim();
      numeric = trimmed === '' ? Number.NaN : Number(trimmed);
    } else {
      return { status: 'invalid', value: undefined, reason: 'not_a_number' };
    }
    if (!Number.isFinite(numeric)) {
      return { status: 'invalid', value: undefined, reason: 'not_a_number' };
    }
    const range = CONFIG_NUMBER_RANGES[key];
    let clamped = numeric;
    if (range) {
      if (typeof range.min === 'number' && clamped < range.min) { clamped = range.min; }
      if (typeof range.max === 'number' && clamped > range.max) { clamped = range.max; }
    }
    return { status: 'ok', value: clamped, reason: clamped === numeric ? null : 'clamped_to_range' };
  }

  if (typeof rawValue === 'object') {
    return { status: 'invalid', value: undefined, reason: 'not_a_string' };
  }
  return { status: 'ok', value: String(rawValue), reason: null };
}

/**
 * Resolve one key with the published precedence and report the winning layer.
 *
 * @param {string} key - Configuration key
 * @param {Object} env - Worker environment bindings
 * @param {{get: (key: string) => Promise<*>}|null} kv - KV reader, or null to skip KV
 * @param {{preferKV?: boolean, fallbackValue?: *}} options - `preferKV: false` inverts
 *   KV and env; `fallbackValue` replaces the built-in default for this call
 * @returns {Promise<{key: string, source: 'kv'|'env'|'default', value: *}>}
 * @throws {InvalidConfigValueError} When a security-relevant key holds a value
 *   that cannot be parsed. The default is not substituted, because for these
 *   keys the default can mean "the control is disabled".
 */
export async function resolveConfigKey(key, env, kv = null, options = {}) {
  const preferKV = options.preferKV !== false;
  const isKvKey = KV_KEY_SET.has(key);
  const kvValue = isKvKey && kv && typeof kv.get === 'function'
    ? await kv.get(`${CLOUDFLARE_KV_PREFIX}:${key}`)
    : null;

  const envValue = env ? env[key] : undefined;
  const fallbackValue = options.fallbackValue === undefined ? DEFAULT_CONFIGS[key] : options.fallbackValue;

  const order = preferKV
    ? [['kv', kvValue], ['env', envValue], ['default', fallbackValue]]
    : [['env', envValue], ['kv', kvValue], ['default', fallbackValue]];

  let firstOk = null;
  let invalid = null;
  for (const [source, rawValue] of order) {
    const parsed = parseConfigValue(key, rawValue);
    if (parsed.status === 'ok') {
      if (!firstOk) {
        firstOk = { source, value: parsed.value, reason: parsed.reason };
      }
      continue;
    }
    if (parsed.status === 'invalid' && !invalid) {
      invalid = { source, reason: parsed.reason };
    }
  }

  if (invalid && isSecuritySensitiveKey(key)) {
    // Reported even when a lower layer holds a usable value: an operator who
    // wrote a broken value for a security control must be told, not silently
    // bypassed by the next layer down.
    throw new InvalidConfigValueError(key, invalid.reason, { source: invalid.source, type: configTypeOf(key) });
  }

  if (firstOk) {
    if (invalid) {
      configResolver_log(`Ignoring unusable ${invalid.source} value for ${key}: ${invalid.reason}`);
    }
    return { key, source: firstOk.source, value: firstOk.value };
  }

  const fallback = parseConfigValue(key, fallbackValue);
  configResolver_log(`No usable value for ${key}; using default (ignored ${invalid ? `${invalid.source}:${invalid.reason}` : 'nothing set'})`);
  return { key, source: 'default', value: fallback.value };
}

/**
 * Build the secret-safe ENV vs KV comparison shown by the kv-admin route.
 *
 * The output never contains a configuration value: only whether each layer is
 * configured, which layer wins, and — for secrets — a constant mask. No digest
 * is included, because a digest of a short secret is guessable.
 *
 * @param {{keys: string[], env: Object, kv: {get: (key: string) => Promise<*>}}} input
 * @returns {Promise<{comparison: Object, summary: Object}>}
 */
export async function buildConfigComparison({ keys = KV_CONFIG_KEYS, env = {}, kv = null } = {}) {
  const comparison = {};
  let fromKV = 0;
  let fromEnv = 0;
  let fromDefault = 0;
  let sensitive = 0;

  const reader = kv && typeof kv.get === 'function'
    ? { get: (key) => kv.get(key) }
    : null;

  for (const key of keys) {
    const isKvKey = KV_KEY_SET.has(key);
    const [resolved, kvRaw, envRaw] = await Promise.all([
      resolveConfigKey(key, env, reader, { preferKV: true }),
      isKvKey && reader ? reader.get(`${CLOUDFLARE_KV_PREFIX}:${key}`) : Promise.resolve(null),
      Promise.resolve(env ? env[key] : undefined)
    ]);

    const secret = isSensitiveKey(key);
    if (secret) {
      sensitive += 1;
    }
    if (resolved.source === 'kv') { fromKV += 1; } else if (resolved.source === 'env') { fromEnv += 1; } else { fromDefault += 1; }

    const describeLayer = (raw) => {
      const parsed = parseConfigValue(key, raw);
      if (secret) {
        return parsed.status === 'ok' ? MASKED : null;
      }
      return parsed.status === 'ok' ? parsed.value : null;
    };

    const entry = {
      configured: {
        env: parseConfigValue(key, envRaw).status !== 'missing',
        kv: isKvKey && parseConfigValue(key, kvRaw).status !== 'missing',
        default: parseConfigValue(key, DEFAULT_CONFIGS[key]).status !== 'missing'
      },
      source: resolved.source
    };

    if (secret) {
      entry.sensitive = true;
      entry.masked = {
        env: describeLayer(envRaw),
        kv: isKvKey ? describeLayer(kvRaw) : null,
        default: describeLayer(DEFAULT_CONFIGS[key])
      };
    }

    comparison[key] = entry;
  }

  return {
    comparison,
    summary: { total: Object.keys(comparison).length, fromKV, fromEnv, fromDefault, sensitive }
  };
}

export { isValidKVKey };
