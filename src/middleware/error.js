import { error_log, middleware_log, i18nMiddleware_log } from '../utils/debug.js';
import { getFeatureFlags } from '../utils/dynamicConfig.js';
import { getStandardErrorMessage, handleStandardError } from '../utils/errorHandler.js';

/**
 * Global error handling middleware with i18n support
 * @param {Error} err - Error object
 * @param {Object} c - Hono context
 * @returns {Response} Error response
*/
export const errorHandler = async (err, c) => {
  const lang = c.get('language');
  await getFeatureFlags(c.env); // Ensure flags loaded (side effects / future use)
  i18nMiddleware_log(`Processing error handler in language: ${lang}`);

  const statusCode = err.status || 500;

  // Build log object first
  error_log(`Global error handler caught error: ${JSON.stringify({
    message: err.message,
    stack: err.stack,
    url: c.req.url,
    method: c.req.method,
    language: lang,
    status: statusCode
  })}`);

  // Always build a consistent translated+raw message using standardized helper
  const fallbackKey = statusCode >= 500 ? 'system.serverError' : 'system.operationFailed';
  const composedMessage = await getStandardErrorMessage(c, err, fallbackKey);

  // Use composed message as original error replacement to maintain consistent formatting
  return await handleStandardError(c, new Error(composedMessage), 'Global error handler', error_log, fallbackKey, {}, statusCode);
};

/**
 * 404 handler middleware with i18n support
 * @param {Object} c - Hono context
 * @returns {Response} 404 response
*/
export const notFoundHandler = (c) => {
  const lang = c.get('language');

  middleware_log(`404 Not Found: ${c.req.method} - ${c.req.url}, Language: ${lang}`);
  return handleStandardError(c, new Error('ROUTE_NOT_FOUND'), 'Not Found handler', middleware_log, 'api.routeNotFound', { method: c.req.method, path: c.req.url }, 404);
};
