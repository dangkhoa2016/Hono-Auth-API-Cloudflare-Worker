/**
 * Error handling utilities for consistent error responses
 * Handles conditional detailed error messages based on feature flags
*/

import { getFeatureFlags } from './dynamicConfig.js';
import { tError } from '../i18n/service.js';
import { createErrorResponse } from './helpers.js';

/**
 * Create standardized error response with conditional detail based on feature flags
 * @param {Object} c - Hono context
 * @param {Error} error - The error object
 * @param {string} fallbackMessageKey - I18n key for fallback message (default: 'system.serverError')
 * @param {Object} i18nParams - Parameters for i18n interpolation (optional)
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {Promise<Response>} JSON error response
*/
export async function createStandardErrorResponse(c, error, fallbackMessageKey = 'system.serverError', i18nParams = {}, statusCode = 500, extraFields = null) {
  const featureFlags = await getFeatureFlags(c.env);
  // Always resolve translated message with interpolation so tests expecting placeholders (language, section, etc.) pass
  const translatedMessage = tError(c, fallbackMessageKey, i18nParams);

  let errorMessage;
  if (featureFlags.enableDetailedErrors) {
    // If original error message is just an error code (e.g. LANGUAGE_NOT_SUPPORTED) prefer the translated message
    if (error && error.message && /^[A-Z0-9_]+$/.test(error.message)) {
      errorMessage = translatedMessage;
    } else if (error && error.message) {
      // Combine translated + raw for richer context while keeping interpolation visible
      errorMessage = `${translatedMessage} (${error.message})`;
    } else {
      errorMessage = translatedMessage;
    }
  } else {
    errorMessage = translatedMessage;
  }
  const base = createErrorResponse(errorMessage);
  const responseBody = extraFields && typeof extraFields === 'object'
    ? { ...base, ...extraFields }
    : base;
  return c.json(responseBody, statusCode);
}

/**
 * Get error message based on feature flags
 * @param {Object} c - Hono context
 * @param {Error} error - The error object
 * @param {string} fallbackMessageKey - I18n key for fallback message (default: 'system.serverError')
 * @param {Object} i18nParams - Parameters for i18n interpolation (optional)
 * @returns {Promise<string>} Error message
*/
export async function getStandardErrorMessage(c, error, fallbackMessageKey = 'system.serverError', i18nParams = {}) {
  const featureFlags = await getFeatureFlags(c.env);
  const translatedMessage = tError(c, fallbackMessageKey, i18nParams);

  if (featureFlags.enableDetailedErrors) {
    if (error && error.message) {
      // If it's just an error code token, prefer translation only
      if (/^[A-Z0-9_]+$/.test(error.message)) {return translatedMessage;}
      // Avoid duplicating if translation already equals raw message
      if (error.message === translatedMessage || translatedMessage.includes(error.message)) {return translatedMessage;}
      return `${translatedMessage} (${error.message})`;
    }
    return translatedMessage;
  }
  return translatedMessage;
}

/**
 * Handle catch block with standardized error response
 * @param {Object} c - Hono context
 * @param {Error} error - The error object
 * @param {string} logMessage - Message to log
 * @param {Function} logFunction - Log function to use
 * @param {string} fallbackMessageKey - I18n key for fallback message (default: 'system.serverError')
 * @param {Object|number} i18nParamsOrStatusCode - Parameters for i18n interpolation OR status code (for backward compatibility)
 * @param {number} statusCode - HTTP status code (default: 500) - only used when i18nParamsOrStatusCode is an object
 * @returns {Promise<Response>} JSON error response
*/
export async function handleStandardError(c, error, logMessage, logFunction, fallbackMessageKey = 'system.serverError', i18nParamsOrStatusCode = 500, statusCode = 500, extraFields = null) {
  if (logFunction && logMessage) {
    logFunction(`${logMessage}: ${error.message}`);
  }

  // Handle backward compatibility - if 5th parameter is a number, treat it as statusCode
  let i18nParams = {};
  let finalStatusCode = 500;

  if (typeof i18nParamsOrStatusCode === 'number') {
    // Old API: handleStandardError(c, error, logMessage, logFunction, fallbackMessageKey, statusCode)
    finalStatusCode = i18nParamsOrStatusCode;
  } else {
    // New API: handleStandardError(c, error, logMessage, logFunction, fallbackMessageKey, i18nParams, statusCode)
    i18nParams = i18nParamsOrStatusCode || {};
    finalStatusCode = statusCode;
  }

  return await createStandardErrorResponse(c, error, fallbackMessageKey, i18nParams, finalStatusCode, extraFields);
}
