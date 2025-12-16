/**
 * i18n Service with i18next and Hono Language Detection
 * Uses Hono's built-in languageDetector middleware with Cloudflare enhancements
 *
 * Features:
 * - Automatic language detection using Hono's languageDetector
 * - Enhanced Accept-Language header parsing for better language matching
 * - Cloudflare country-based language detection as fallback
 * - Centralized translation functions with context awareness
 * - Support for both middleware-detected and manual language detection
*/

import { i18next, getDefaultLanguage, getSupportedLanguages, isLanguageSupported, isLanguageLoaded, loadLanguage } from './config.js';
import { i18nService_log } from '../utils/debug.js';
import { languageDetector } from 'hono/language';

/**
 * Country-to-language mapping for Cloudflare integration
 * Shared mapping used by both service and middleware
*/
export const COUNTRY_LANGUAGE_MAP = {
  // Vietnam
  'vn': 'vi', 'vietnam': 'vi',
  // France
  'fr': 'fr', 'france': 'fr',
  // Spain
  'es': 'es', 'spain': 'es',
  //Germany
  'de': 'de', 'germany': 'de',
  // Japan
  'jp': 'ja', 'japan': 'ja',
  // Thailand
  'th': 'th', 'thailand': 'th',
  // English-speaking countries
  'us': 'en', 'uk': 'en', 'gb': 'en',
  'english': 'en', 'england': 'en',
  'australia': 'en', 'canada': 'en',
  'usa': 'en'
};

/**
 * Enhanced language detection using Hono languageDetector + Cloudflare
 * Uses Hono's built-in languageDetector middleware with custom enhancements
 * Priority: 1. Hono detector (query/cookie/header) 2. Manual Accept-Language parsing 3. Cloudflare country 4. Default
 * @param {Object} c - Hono context
 * @returns {Promise<string>} Detected language code
*/
export async function detectLanguage(c) {
  const supportedLanguages = getSupportedLanguages();
  const defaultLanguage = getDefaultLanguage();

  try {
    // 1. Use Hono's languageDetector middleware for standard detection
    // This handles query parameter 'lang', cookies, and Accept-Language header
    const honoLanguageMiddleware = languageDetector({
      supportedLanguages,
      fallbackLanguage: defaultLanguage
    });

    // Apply Hono's languageDetector middleware
    await honoLanguageMiddleware(c, async () => {});

    // Get the language that Hono detected
    let detectedLanguage = c.get('language') || defaultLanguage;
    i18nService_log(`Hono detected language: ${detectedLanguage}`);

    // 2. Manual enhancement: Better Accept-Language header parsing
    // This fixes edge cases where Hono's parser might miss valid languages
    if (detectedLanguage === defaultLanguage) {
      const acceptLanguage = c.req.header('Accept-Language');
      if (acceptLanguage) {
        const languages = acceptLanguage.split(',').map(lang => lang.split(';')[0].trim());
        for (let lang of languages) {
          let isSupport = supportedLanguages.includes(lang);
          if (!isSupport) {
            lang = lang.split('-')[0]; // Normalize to base language code (e.g., en-US -> en)
            isSupport = supportedLanguages.includes(lang);
          }

          if (isSupport) {
            detectedLanguage = lang;
            i18nService_log(`Language detected from manual Accept-Language parsing: ${lang}`);
            break; // Use the first supported language found
          }
        }
      }
    }

    // 3. Cloudflare country enhancement: Use geolocation as fallback
    if (detectedLanguage === defaultLanguage && c.req.cf) {
      const countryCode = (c.req.cf.country || '').toLowerCase();
      const mappedLang = COUNTRY_LANGUAGE_MAP[countryCode] || countryCode;

      if (supportedLanguages.includes(mappedLang)) {
        detectedLanguage = mappedLang;
        i18nService_log(`Language enhanced from CF country code: ${c.req.cf.country} → ${mappedLang}`);
      }
    }

    i18nService_log(`Final detected language: ${detectedLanguage}`);
    return detectedLanguage;

  } catch (error) {
    i18nService_log(`Error in language detection: ${error.message}`);
    return defaultLanguage;
  }
}

/**
 * Core translation function with language detection
 *
 * Uses middleware-detected language from context, ensuring consistency
 * @param {Object} c - Hono context
 * @param {string} key - Translation key path
 * @param {Object} options - Translation options (interpolation, count, context, format, etc.)
 * @returns {string} Translated message
*/
export function t(c, key, options = {}) {
  // Get language from middleware (set by i18n middleware)
  const lang = c.get('language');

  // Change language if different from current
  if (lang && i18next.language !== lang) {
    i18next.changeLanguage(lang);
    i18nService_log(`Changed i18next language to: ${lang}`);
  }

  // Delegate to language-specific translator (will throw if missing)
  return tl(i18next.language, key, options);
}

/**
 * Language-specific translation function (UNIQUE - Cannot be replaced by t())
 *
 * Direct translation without language detection, useful for:
 * - Multi-language responses
 * - Admin operations requiring specific language
 * - Email templates in user's preferred language
 * - API responses with explicit language control
 *
 * @param {string} lang - Language code
 * @param {string} key - Translation key path
 * @param {Object} options - Translation options (interpolation, count, context, format, etc.)
 * @returns {string} Translated message
*/
export class MissingTranslationError extends Error {
  constructor(lang, key) {
    super(`Missing translation for key "${key}" in language "${lang}"`);
    this.name = 'MissingTranslationError';
    this.lang = lang;
    this.key = key;
  }
}

export class MissingInterpolationError extends Error {
  constructor(lang, key, placeholders) {
    super(`Missing interpolation values for key "${key}" in language "${lang}": ${placeholders.join(', ')}`);
    this.name = 'MissingInterpolationError';
    this.lang = lang;
    this.key = key;
    this.placeholders = placeholders;
  }
}

export function tl(lang, key, options = {}) {
  return baseTranslate(lang, key, options);
}


/**
 * Error message translation function (UNIQUE - Cannot be replaced by t())
 *
 * Provides specialized error formatting that t() cannot replicate:
 * - Automatically adds "errors." prefix to translation keys
 * - Enhanced error context with timestamp
 * - Specialized error interpolation handling
 * - Count and context support for complex error messages
 *
 * @param {Object} c - Hono context
 * @param {string} errorType - Type of error (validation, auth, system, etc.)
 * @param {Object} errorData - Error details for interpolation
 * @returns {string} Formatted error message
*/
export function tError(c, errorType, errorData = {}) {
  // Build candidate keys.
  // We previously *always* prefixed with 'errors.' which breaks when callers already pass
  // full paths like 'system.serverError'. Here we resolve smartly:
  // 1. If errorType already starts with 'errors.' treat as full path.
  // 2. Else try 'errors.' + errorType.
  // 3. If that points to an OBJECT (category) not a string, attempt common default leafs.
  // 4. Fallback to raw errorType (supports root domains like 'system.serverError').
  // 5. Final fallback: 'errors.system.serverError' then 'system.serverError'.

  const lang = c.get('language') || getDefaultLanguage();
  const candidates = [];

  if (errorType.startsWith('errors.')) {
    candidates.push(errorType);
  } else {
    candidates.push(`errors.${errorType}`);
    candidates.push(errorType); // raw path (may already include section like 'system.serverError')
  }

  // Helper to check if a key resolves to a string (not object)
  const isStringKey = (key) => {
    try {
      // i18next stores resources under default namespace; use getResource to inspect
      const res = i18next.getResource(lang, i18next.options.defaultNS, key);
      return typeof res === 'string';
    } catch (_) {
      return false;
    }
  };

  // If a candidate is a category object (e.g. errors.system), append default leaves
  const expandCategory = (key) => {
    const defaults = ['serverError', 'operationFailed', 'failed'];
    return defaults.map(d => `${key}.${d}`);
  };

  // Build full candidate list with expansions for object categories
  for (let i = 0; i < candidates.length; i++) {
    const k = candidates[i];
    try {
      const res = i18next.getResource(lang, i18next.options.defaultNS, k);
      if (res && typeof res === 'object') {
        expandCategory(k).forEach(e => candidates.push(e));
      }
    } catch (_) { /* ignore */ }
  }

  // Add hard fallbacks
  candidates.push('errors.system.serverError');
  candidates.push('system.serverError');

  // Pick the first string key
  const resolvedKey = candidates.find(isStringKey) || 'system.serverError';

  // Enhanced error formatting with count/context + timestamp
  const options = {
    ...errorData,
    timestamp: new Date().toISOString(),
    format: errorData.format || 'default'
  };

  // Provide safe default for validation errors missing details
  if (resolvedKey.includes('validation') && typeof options.details === 'undefined') {
    try { options.details = t(c, 'errors.validationGeneric'); } catch { options.details = 'Validation error'; }
  }

  // Auto-fill missing placeholders with generic words
  try {
    const { placeholders } = getRawResourceAndPlaceholders(lang, resolvedKey);
    if (placeholders && placeholders.length) {
      const defaultMap = { operation: 'operation', reason: 'unspecified', resource: 'resource', error: 'error', details: 'N/A' };
      for (const ph of placeholders) {
        if (options[ph] === undefined && !['count', 'context', 'timestamp', 'format', 'lng', 'interpolation'].includes(ph)) {
          options[ph] = defaultMap[ph] || ph;
        }
      }
    }
  } catch { /* non-critical */ }

  if (typeof errorData.count !== 'undefined') { options.count = errorData.count; }
  if (errorData.context) { options.context = errorData.context; }

  return t(c, resolvedKey, options);
}

/**
 * Success message translation function (UNIQUE - Cannot be replaced by t())
 *
 * Provides specialized success formatting that t() cannot replicate:
 * - Automatically adds "success." prefix to translation keys
 * - Enhanced success context with timestamp
 * - Complex interpolation templates for success scenarios
 * - Count and context support for batch operations
 *
 * @param {Object} c - Hono context
 * @param {string} successType - Type of success message
 * @param {Object} successData - Success details for interpolation
 * @returns {string} Formatted success message
*/
export function tSuccess(c, successType, successData = {}) {
  const successKey = `success.${successType}`;

  const options = {
    ...successData,
    timestamp: new Date().toISOString(),
    format: successData.format || 'default'
  };

  if (typeof successData.count !== 'undefined') {
    options.count = successData.count;
  }

  if (successData.context) {
    options.context = successData.context;
  }

  return t(c, successKey, options);
}

/**
 * Works with language string directly using i18next
 * @param {string} language - Language code
 * @param {string} key - Translation key (without _other suffix)
 * @param {number} count - Count to determine plural form
 * @param {Object} params - Additional parameters for interpolation
 * @returns {string} Pluralized message
*/
export function tpl(language, key, count, params = {}) {
  const finalParams = { ...params, count };
  const translationKey = count === 1 ? key : `${key}_other`;
  return baseTranslate(language, translationKey, finalParams);
}

/**
 * Unified base translation helper ensuring single usage of i18next.t
 * Centralizes:
 *  - Language resolution & fallback
 *  - Interpolation format handling
 *  - Missing key detection & error throwing
 *  - Debug logging
 * @param {string} lang - Requested language
 * @param {string} key - Translation key
 * @param {Object} options - i18next options / interpolation data
 * @returns {string} Translation value
 */
function baseTranslate(lang, key, options = {}) {
  let resolvedLang = lang;
  if (!isLanguageSupported(resolvedLang)) {
    resolvedLang = getDefaultLanguage();
  }

  const enhancedOptions = {
    ...options,
    lng: resolvedLang,
    interpolation: {
      format: options.format || undefined,
      ...options.interpolation
    }
  };

  const translation = i18next.t(key, enhancedOptions); // SINGLE DIRECT USAGE

  if (!i18next.exists(key, { lng: resolvedLang })) {
    // Differentiate plural helper logging slightly
    const isPluralForm = key.endsWith('_other');
    const prefix = isPluralForm ? '❌ Missing plural translation detected' : '❌ Missing translation detected';
    i18nService_log(`${prefix}: [${resolvedLang}] ${key}`);
    throw new MissingTranslationError(resolvedLang, key);
  }

  // Interpolation validation: ensure that if the raw resource contains placeholders, user supplied them
  try {
    const { placeholders } = getRawResourceAndPlaceholders(resolvedLang, key);
    // i18nService_log(`🔍 Interpolation analysis: [${resolvedLang}] ${key} -> ${placeholders.join(', ')}: ${rawString}`);
    if (placeholders.length > 0) {
      // Collect provided keys (exclude reserved keys)
      const reserved = new Set(['lng', 'count', 'format', 'context', 'timestamp', 'interpolation']);
      const providedKeys = new Set(Object.keys(options || {}).filter(k => !reserved.has(k)));

      // Always treat count/context present in enhanced options as provided
      if (typeof enhancedOptions.count !== 'undefined') { providedKeys.add('count'); }
      if (typeof enhancedOptions.context !== 'undefined') { providedKeys.add('context'); }

      const missing = placeholders.filter(ph => !providedKeys.has(ph));
      if (missing.length > 0) {
        // If placeholders still visible in final translation, it's certainly missing
        const stillVisible = missing.filter(ph => translation.includes(`{{${ph}`));
        if (stillVisible.length === missing.length) {
          i18nService_log(`❌ Missing interpolation values detected: [${resolvedLang}] ${key} -> ${missing.map(ph => `{{${ph}}}`).join(', ')}`);
          throw new MissingInterpolationError(resolvedLang, key, missing);
        }
      }
    }
  } catch (interpErr) {
    i18nService_log(`❌ Interpolation error: [${resolvedLang}] ${key} -> ${interpErr.message}`);
    if (interpErr instanceof MissingInterpolationError) {throw interpErr;} // propagate intended error
    // Silent fail for non-critical resource lookup issues (namespaced or nested keys)
  }

  return translation;
}

// Helper: get raw resource string and extract interpolation placeholders from original (pre-render) value
function getRawResourceAndPlaceholders(lang, key) {
  // Determine namespace & pure key
  let ns = i18next.options.defaultNS || (Array.isArray(i18next.options.ns) ? i18next.options.ns[0] : 'translation');
  let pureKey = key;
  if (key.includes(':')) {
    const parts = key.split(':');
    ns = parts[0];
    pureKey = parts.slice(1).join(':');
  }

  // For plural variant keys (_other etc.) keep as-is
  const raw = i18next.getResource(lang, ns, pureKey);
  const rawString = typeof raw === 'string' ? raw : '';
  const placeholderRegex = /\{\{\s*([^{}\s]+)\s*}}/g;
  const placeholders = [];
  let match;
  while ((match = placeholderRegex.exec(rawString)) !== null) {
    placeholders.push(match[1]);
  }
  return { rawString, placeholders };
}
