/**
 * Enhanced i18n Middleware using Hono languageDetector + Cloudflare
 * Integrates Hono's built-in language detection with Cloudflare Workers enhancements
 * Uses centralized detectLanguage function from i18n service for consistency
*/

import { detectLanguage } from '../i18n/service.js';
import { loadLanguage, i18next } from '../i18n/config.js';
import { i18nMiddleware_log } from '../utils/debug.js';

/**
 * Create enhanced i18n middleware with Cloudflare support
 * Applies language detection and sets context variables for routes to use
 * @param {Object} c - Hono context
 * @param {Function} next - Next middleware function
 * @returns {Promise<void>}
*/
export async function createI18nMiddleware(c, next) {
  // Use the centralized language detection function (which uses Hono's languageDetector)
  const detectedLanguage = await detectLanguage(c);

  // Load language if not already loaded (lazy loading)
  // We do this regardless of whether it changed, because detectLanguage might have set the context
  // but the language resources might not be loaded yet.
  try {
    await loadLanguage(detectedLanguage);
    // Ensure i18next is switched to the detected language
    if (i18next.language !== detectedLanguage) {
      await i18next.changeLanguage(detectedLanguage);
    }
  } catch (error) {
    i18nMiddleware_log(`Failed to load language ${detectedLanguage}: ${error.message}`);
    // Continue with default language
  }

  const currentLanguage = c.get('language');
  // Set language in context if it changed or wasn't set
  if (currentLanguage !== detectedLanguage) {
    i18nMiddleware_log(`Language set to: ${detectedLanguage} (was: ${currentLanguage || 'undefined'})`);
    c.set('language', detectedLanguage);
  }

  await next();
}
