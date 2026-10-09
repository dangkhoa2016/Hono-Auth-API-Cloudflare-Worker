/**
 * Error handling utilities for consistent error responses
 * Handles conditional detailed error messages based on feature flags
*/

import { getFeatureFlags } from './dynamicConfig.js';

/**
 * Feature flags for the error path.
 *
 * Rendering an error response must not itself depend on configuration being
 * readable: if the KV binding is unreachable while a 503 is being reported, the
 * default is used so the client still receives the real status and code.
 * @param {Object} env - Worker environment
 * @returns {Promise<Object>} Flags, with defaults on failure
 */
async function readErrorPathFlags(env) {
  try {
    return await getFeatureFlags(env);
  } catch {
    return { enableDetailedErrors: false };
  }
}
import { tError } from '../i18n/service.js';
import { createErrorResponse } from './helpers.js';
import { codeForError, isServiceError } from './serviceErrors.js';

/**
 * Create standardized error response with conditional detail based on feature flags
 * @param {Object} c - Hono context
 * @param {Error} error - The error object
 * @param {string} fallbackMessageKey - I18n key for fallback message (default: 'system.serverError')
 * @param {Object} i18nParams - Parameters for i18n interpolation (optional)
 * @param {number} statusCode - HTTP status code (default: 500)
 * @returns {Promise<Response>} JSON error response
*/
/**
 * Resolve the HTTP status for an error response.
 *
 * A ServiceError carries the authoritative status for its own domain contract
 * (DB_UNAVAILABLE -> 503, REFRESH_ALREADY_ROTATED -> 409, TOKEN_INVALID -> 401),
 * so it wins over the status a caller happened to pass. Losing that mapping is
 * how a rotation conflict gets reported as 401 and a dependency outage gets
 * reported as 500. An explicit `extraFields.status` remains the highest
 * precedence override for callers that really mean a different status.
 * @param {Error} error - The error object
 * @param {number} requestedStatus - Status requested by the caller
 * @param {Object|null} extraFields - Optional extra fields carrying an explicit status
 * @returns {number} Final HTTP status code
 */
export function resolveErrorStatus(error, requestedStatus, extraFields = null) {
  // `extraFields` is server-controlled route metadata, never request data. It may
  // pick the exact status a route wants (e.g. 502 for a proxy failure), but it may
  // never downgrade an infrastructure failure into a success or a client error:
  // that is the bug class B03/R5 exists to prevent. Downgrades to a non-5xx are
  // ignored, while a 5xx-to-5xx override is honoured.
  if (extraFields && Number.isInteger(extraFields.status)) {
    const isServiceFailure = isServiceError(error) && Number.isInteger(error.statusCode) && error.statusCode >= 500;
    const wouldDowngrade = isServiceFailure && extraFields.status < 500;
    if (!wouldDowngrade) {
      return extraFields.status;
    }
  }
  if (isServiceError(error) && Number.isInteger(error.statusCode)) {
    return error.statusCode;
  }
  return Number.isInteger(requestedStatus) ? requestedStatus : 500;
}

export async function createStandardErrorResponse(c, error, fallbackMessageKey = 'system.serverError', i18nParams = {}, statusCode = 500, extraFields = null) {
  const featureFlags = await readErrorPathFlags(c.env);
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
  const serviceErrorFields = isServiceError(error) ? { code: codeForError(error) } : {};
  const responseBody = {
    ...base,
    ...serviceErrorFields,
    ...(extraFields && typeof extraFields === 'object' ? extraFields : {})
  };
  const finalStatus = resolveErrorStatus(error, statusCode, extraFields);
  return c.json(responseBody, finalStatus);
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
  const featureFlags = await readErrorPathFlags(c.env);
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
