/**
 * Dynamic i18next Configuration
 * Fully automatic language detection and initialization
*/

import i18next from 'i18next';
import { loadTranslation, initializeLanguageDiscovery } from './loader.js';
import { i18n_log } from '../utils/debug.js';

let isInitialized = false;
let defaultLanguage = 'en';
let supportedLanguages = [];
let loadedLanguages = new Set(); // Track which languages are loaded

/**
 * Initialize i18next with lazy loading
 * Only loads default language initially, others loaded on demand
 * @returns {Promise<Object>} Initialized i18next instance
*/
const initI18n = async () => {
  if (isInitialized) {
    return i18next;
  }

  try {
    // First, discover all available languages
    i18n_log('🔍 Discovering available languages...');
    supportedLanguages = await initializeLanguageDiscovery();

    // Set default language based on available languages
    defaultLanguage = supportedLanguages.includes('en') ? 'en' : supportedLanguages[0] || 'en';

    // Load only the default language initially
    i18n_log(`📚 Loading default language: ${defaultLanguage}`);
    const defaultTranslations = await loadTranslation(defaultLanguage);

    // Prepare resources object with only default language
    const resources = {
      [defaultLanguage]: {
        translation: defaultTranslations
      }
    };

    await i18next.init({
      lng: defaultLanguage,
      fallbackLng: defaultLanguage,
      debug: false, // set to true for debugging
      resources,
      interpolation: {
        escapeValue: false, // not needed for server-side
        format: function (value, format, lng) {
          // Custom formatting function
          if (format === 'uppercase') {return value.toUpperCase();}
          if (format === 'lowercase') {return value.toLowerCase();}
          if (format === 'capitalize') {return value.charAt(0).toUpperCase() + value.slice(1);}
          if (format === 'number') {return Number(value).toLocaleString(lng);}
          if (format === 'currency') {return new Intl.NumberFormat(lng, { style: 'currency', currency: 'USD' }).format(value);}
          if (format === 'date') {return new Date(value).toLocaleDateString(lng);}
          if (format === 'datetime') {return new Date(value).toLocaleString(lng);}
          if (format === 'time') {return new Date(value).toLocaleTimeString(lng);}
          return value;
        }
      },
      pluralSeparator: '_',
      contextSeparator: '_context_',
      nsSeparator: ':',
      keySeparator: '.',
      // Standard i18next pluralization for better compatibility
      compatibilityJSON: 'v4'  // Ensure v4 compatibility for pluralization
    });

    // Mark default language as loaded
    loadedLanguages.add(defaultLanguage);
    isInitialized = true;

    i18n_log('✅ i18next initialized successfully with lazy loading');
    i18n_log(`🌍 Available languages: ${supportedLanguages.join(', ')}`);
    i18n_log(`🏠 Default language: ${defaultLanguage} (loaded)`);

    return i18next;
  } catch (error) {
    i18n_log(`❌ Failed to initialize i18next: ${error.message}`);

    // Fallback initialization with minimal resources
    try {
      await i18next.init({
        lng: 'en',
        fallbackLng: 'en',
        resources: {
          en: {
            translation: {
              system: {
                welcome: 'Welcome',
                success: 'Success',
                error: 'Error'
              }
            }
          }
        }
      });

      isInitialized = true;
      i18n_log('⚠️ i18next initialized with fallback configuration');
      return i18next;
    } catch (fallbackError) {
      i18n_log(`💥 Failed to initialize i18next even with fallback: ${fallbackError.message}`);
      throw fallbackError;
    }
  }
};

/**
 * Get default language (determined dynamically)
 * @returns {string} Default language code
*/
export function getDefaultLanguage() {
  return defaultLanguage;
}

/**
 * Get supported languages (cached from initialization)
 * @returns {Array<string>} Array of supported language codes
*/
export function getSupportedLanguages() {
  return supportedLanguages;
}

/**
 * Get supported languages synchronously (same as getSupportedLanguages)
 * @returns {Array<string>} Array of supported language codes
*/
export function getSupportedLanguagesSync() {
  return supportedLanguages;
}

/**
 * Check if language is supported
 * @param {string} lang - Language code to check
 * @returns {boolean} True if supported
*/
export function isLanguageSupported(lang) {
  return supportedLanguages.includes(lang);
}

/**
 * Check if i18next is initialized
 * @returns {boolean} True if initialized
*/
export function isI18nInitialized() {
  return isInitialized;
}

/**
 * Check if a language is loaded
 * @param {string} lang - Language code
 * @returns {boolean} True if loaded
*/
export function isLanguageLoaded(lang) {
  return loadedLanguages.has(lang);
}

/**
 * Load a language on demand
 * @param {string} lang - Language code to load
 * @returns {Promise<boolean>} True if loaded successfully
*/
export async function loadLanguage(lang) {
  if (!isInitialized) {
    throw new Error('i18next not initialized');
  }

  if (!supportedLanguages.includes(lang)) {
    i18n_log(`⚠️ Language ${lang} not supported`);
    return false;
  }

  if (loadedLanguages.has(lang)) {
    return true; // Already loaded
  }

  try {
    i18n_log(`📥 Loading language on demand: ${lang}`);
    const translations = await loadTranslation(lang);

    // Add to i18next resources
    i18next.addResourceBundle(lang, 'translation', translations, true, true);

    loadedLanguages.add(lang);
    i18n_log(`✅ Language loaded: ${lang}`);
    return true;
  } catch (error) {
    i18n_log(`❌ Failed to load language ${lang}: ${error.message}`);
    return false;
  }
}

/**
 * Get loaded languages
 * @returns {Array<string>} Array of loaded language codes
*/
export function getLoadedLanguages() {
  return Array.from(loadedLanguages);
}

/**
 * Reset initialization state (useful for testing)
*/
export function resetI18n() {
  isInitialized = false;
  defaultLanguage = 'en';
  supportedLanguages = [];
  loadedLanguages.clear();
  i18n_log('🔄 i18n initialization state reset');
}

// Export configured i18next instance and initialization function
export { initI18n, i18next };
