/**
 * Dynamic Translation Loader for Cloudflare Workers
 * Fully automatic language detection system
*/

import { i18n_log } from '../utils/debug.js';

// Explicitly define known languages to ensure bundlers can resolve them
// This is required for Cloudflare Workers / Vite / Rollup to correctly bundle the files
const KNOWN_LANGUAGES = {
  'en': () => import('./locales/en.js'),
  'vi': () => import('./locales/vi.js'),
  'fr': () => import('./locales/fr.js'),
  'es': () => import('./locales/es.js'),
  'de': () => import('./locales/de.js'),
  'ja': () => import('./locales/ja.js'),
  'th': () => import('./locales/th.js')
};

// Cache for loaded translations and discovered languages
const TRANSLATIONS_CACHE = new Map();
const CACHE_TTL = 300000; // 5 minutes
let DISCOVERED_LANGUAGES = null;
let LANGUAGES_LAST_CHECKED = 0;

/**
 * Auto-discover available language files
 * @returns {Promise<Array>} Array of available language codes
*/
async function discoverAvailableLanguages() {
  const now = Date.now();

  // Return cached result if still valid
  if (DISCOVERED_LANGUAGES && (now - LANGUAGES_LAST_CHECKED) < CACHE_TTL) {
    return DISCOVERED_LANGUAGES;
  }

  try {
    const availableLanguages = [];
    // Prioritized list of common languages to check first
    const commonLanguages = ['en', 'vi', 'fr', 'es', 'de', 'ja', 'th', 'zh', 'ko', 'id'];
    // Extended list for comprehensive coverage
    const extendedLanguages = [
      'pt', 'ru', 'ar', 'hi', 'it', 'nl', 'pl', 'tr', 'sv', 'da',
      'no', 'fi', 'el', 'he', 'cs', 'sk', 'hu', 'ro', 'bg', 'hr'
    ];

    const languagesToCheck = [...commonLanguages, ...extendedLanguages];

    for (const lang of languagesToCheck) {
      try {
        let module;
        // Try known languages map first (better for bundlers)
        if (KNOWN_LANGUAGES[lang]) {
          module = await KNOWN_LANGUAGES[lang]();
        } else {
          // Fallback to dynamic import
          module = await import(`./locales/${lang}.js`);
        }

        if (module && module.default) {
          availableLanguages.push(lang);
          i18n_log(`✅ Discovered language: ${lang}`);
        }
      } catch (error) {
        // Language file doesn't exist, skip silently
      }
    }

    DISCOVERED_LANGUAGES = availableLanguages;
    LANGUAGES_LAST_CHECKED = now;
    i18n_log(`🌍 Total discovered languages: ${availableLanguages.length}`);
    return availableLanguages;
  } catch (error) {
    i18n_log(`❌ Error discovering languages: ${error.message}`);
    return ['en']; // Minimal fallback
  }
}

/**
 * Load translation for specific language dynamically
 * @param {string} language - Language code
 * @returns {Promise<Object>} Translation object
*/
export async function loadTranslation(language) {
  try {
    // Check cache first
    const cached = TRANSLATIONS_CACHE.get(language);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.data;
    }

    // Try to dynamically import the language file
    let module;
    
    // Try known languages map first (better for bundlers)
    if (KNOWN_LANGUAGES[language]) {
      module = await KNOWN_LANGUAGES[language]();
    } else {
      // Fallback to dynamic import
      module = await import(`./locales/${language}.js`);
    }

    if (module && module.default) {
      // Cache with timestamp
      TRANSLATIONS_CACHE.set(language, {
        data: module.default,
        timestamp: Date.now()
      });
      i18n_log(`📥 Loaded translations for: ${language}`);
      // DEBUG: Check if validation keys exist
      if (module.default.validation) {
         i18n_log(`[DEBUG_LOADER] ${language} has validation keys: ${Object.keys(module.default.validation).join(',')}`);
      } else {
         i18n_log(`[DEBUG_LOADER] ${language} MISSING validation keys`);
      }
      return module.default;
    }

    throw new Error(`Translation module not found for ${language}`);
  } catch (error) {
    i18n_log(`⚠️ Error loading translations for ${language}: ${error.message}`);

    // Fallback to English if available and not already English
    if (language !== 'en') {
      try {
        return await loadTranslation('en');
      } catch (fallbackError) {
        i18n_log('❌ English fallback also failed');
      }
    }

    // Final fallback - return basic structure
    return {
      system: {
        welcome: 'Welcome',
        success: 'Success',
        error: 'Error'
      }
    };
  }
}

/**
 * Get all available languages dynamically
 * @returns {Promise<Array>} Array of supported language codes
*/
export async function getSupportedLanguagesFromFiles() {
  return await discoverAvailableLanguages();
}

/**
 * Get supported languages from loader cache (internal use)
 * @returns {Array} Array of supported language codes
*/
export function getSupportedLanguagesFromCache() {
  if (DISCOVERED_LANGUAGES) {
    return DISCOVERED_LANGUAGES;
  }

  // Return languages from cache keys (extract from cached data)
  const cached = Array.from(TRANSLATIONS_CACHE.keys());
  return cached.length > 0 ? cached : ['en'];
}

/**
 * Initialize language discovery (should be called at startup)
 * @returns {Promise<Array>} Array of discovered languages
*/
export async function initializeLanguageDiscovery() {
  const languages = await discoverAvailableLanguages();
  i18n_log(`🚀 Language discovery initialized: ${languages}`);
  return languages;
}

/**
 * Load all available translations
 * @returns {Promise<Object>} Object with all translations by language
*/
export async function loadAllTranslations() {
  const translations = {};

  try {
    const languages = await getSupportedLanguagesFromFiles();

    for (const language of languages) {
      translations[language] = await loadTranslation(language);
    }

    i18n_log(`📚 All translations loaded for: ${Object.keys(translations)}`);
    return translations;
  } catch (error) {
    i18n_log(`❌ Error loading all translations: ${error.message}`);
    return translations;
  }
}

/**
 * Validate translation file structure
 * @param {string} language - Language code
 * @returns {Promise<Object>} Validation result
*/
export async function validateTranslation(language) {
  try {
    const translations = await loadTranslation(language);
    const requiredSections = ['auth', 'user', 'validation', 'system', 'api'];
    const missingSections = [];

    for (const section of requiredSections) {
      if (!translations[section]) {
        missingSections.push(section);
      }
    }

    return {
      valid: missingSections.length === 0,
      missing_sections: missingSections,
      available_sections: Object.keys(translations),
      language
    };
  } catch (error) {
    return {
      valid: false,
      error: error.message,
      language
    };
  }
}

/**
 * Clear translation cache (useful for testing)
*/
export function clearCache() {
  TRANSLATIONS_CACHE.clear();
  DISCOVERED_LANGUAGES = null;
  LANGUAGES_LAST_CHECKED = 0;
  i18n_log('🧹 Translation cache cleared');
}

/**
 * Get cache statistics
 * @returns {Object} Cache stats
*/
export function getCacheStats() {
  return {
    cached_languages: Array.from(TRANSLATIONS_CACHE.keys()),
    cache_size: TRANSLATIONS_CACHE.size,
    discovered_languages: DISCOVERED_LANGUAGES,
    last_discovery_check: new Date(LANGUAGES_LAST_CHECKED).toISOString(),
    cache_ttl_minutes: CACHE_TTL / 60000
  };
}
