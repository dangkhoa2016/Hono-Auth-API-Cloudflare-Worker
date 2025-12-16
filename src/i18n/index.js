/**
 * i18n Index - Main exports for i18next integration
 * Centralized exports from config.js and service.js
*/

// Core i18n functions - all from config.js for consistency
export {
  initI18n,
  i18next,
  getDefaultLanguage,
  getSupportedLanguages,
  getSupportedLanguagesSync,
  isLanguageSupported,
  isI18nInitialized,
  resetI18n
} from './config.js';

// Translation and detection functions - optimized to 3 functions
export {
  t,
  tl,
  tError,
  tSuccess,
  detectLanguage
} from './service.js';
