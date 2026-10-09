import { error_log, middleware_log, i18nMiddleware_log } from '../utils/debug.js';
import { getFeatureFlags } from '../utils/dynamicConfig.js';
import { getStandardErrorMessage, handleStandardError } from '../utils/errorHandler.js';
import { codeForError, statusForError, isServiceError } from '../utils/serviceErrors.js';
import { redactText } from '../utils/sensitiveData.js';

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

  const serviceStatus = isServiceError(err) ? statusForError(err) : null;
  const statusCode = serviceStatus || err.status || 500;
  const machineCode = isServiceError(err) ? codeForError(err) : null;

  // Build log object first
  error_log(`Global error handler caught error: ${JSON.stringify({
    message: redactText(err.message || ''),
    code: machineCode,
    url: c.req.url,
    method: c.req.method,
    language: lang,
    status: statusCode
  })}`);

  // Always build a consistent translated+raw message using standardized helper
  const fallbackKey = statusCode >= 500 ? 'system.serviceUnavailable' : 'system.operationFailed';
  const composedMessage = await getStandardErrorMessage(c, err, fallbackKey);

  return await handleStandardError(
    c,
    new Error(composedMessage),
    'Global error handler',
    error_log,
    fallbackKey,
    { reason: machineCode || 'internal' },
    statusCode,
    machineCode ? { code: machineCode } : null
  );
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
