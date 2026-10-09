/**
 * Service-layer error contract shared by database, auth and capability callers.
 *
 * Contract v1:
 *  - `null` from a read means "no row", never "the database is broken".
 *  - A dependency failure raises `ServiceUnavailableError` (code DB_UNAVAILABLE)
 *    and the HTTP layer maps it to 503.
 *  - A rotation race raises `ConflictError` (code REFRESH_ALREADY_ROTATED) -> 409.
 *  - A capability that is not implemented raises `UnsupportedOptionError` -> 422.
 */

export class ServiceError extends Error {
  constructor(message, code, details = {}) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.details = details;
  }
}

export class ServiceUnavailableError extends ServiceError {
  constructor(message = 'Database dependency is unavailable', details = {}) {
    super(message, 'DB_UNAVAILABLE', details);
    this.statusCode = 503;
  }
}

/**
 * A configuration dependency (KV) could not be read.
 *
 * Distinct from a missing key: a missing key falls through to env/default, an
 * unreachable binding must not be reported as "not configured", because for a
 * security control that reads as "the operator never set it".
 */
export class ConfigDependencyUnavailableError extends ServiceError {
  constructor(message = 'Configuration dependency is unavailable', details = {}) {
    super(message, 'CONFIG_UNAVAILABLE', details);
    this.statusCode = 503;
  }
}

export class ConflictError extends ServiceError {
  constructor(message = 'Resource already updated by another request', code = 'REFRESH_ALREADY_ROTATED', details = {}) {
    super(message, code, details);
    this.statusCode = 409;
  }
}

export class UnsupportedOptionError extends ServiceError {
  constructor(message = 'Requested option is not implemented', code = 'UNSUPPORTED_EXPORT_OPTION', details = {}) {
    super(message, code, details);
    this.statusCode = 422;
  }
}

/**
 * A configuration value is present but cannot be used under the published
 * registry. Security-relevant keys must surface this instead of silently
 * falling back to a default, because a fallback can turn a control off.
 */
export class InvalidConfigValueError extends ServiceError {
  constructor(key, reason, details = {}) {
    super(`Configuration value for ${key} is invalid`, 'INVALID_CONFIG_VALUE', { key, reason, ...details });
    this.statusCode = 422;
  }
}

export function isServiceError(error) {
  return error instanceof ServiceError
    || (typeof error === 'object' && error !== null && typeof error.code === 'string' && typeof error.statusCode === 'number');
}

export function statusForError(error) {
  if (isServiceError(error) && Number.isInteger(error.statusCode)) {
    return error.statusCode;
  }
  return 500;
}

export function codeForError(error) {
  return isServiceError(error) && error.code ? error.code : 'INTERNAL_ERROR';
}

/**
 * Build a service error from a `{ success: false, error, statusCode }` result
 * so the HTTP layer keeps the machine code and status instead of reducing the
 * failure to a message-only Error.
 * @param {Object} result - Service result object
 * @param {string} fallbackCode - Code used when the result carries none
 * @returns {Error} Error carrying `code` and `statusCode`
 */
export function serviceErrorFromResult(result, fallbackCode = 'REQUEST_FAILED') {
  const code = typeof result?.error === 'string' && result.error ? result.error : fallbackCode;
  const error = new Error(code);
  error.code = code;
  error.statusCode = Number.isInteger(result?.statusCode) ? result.statusCode : 500;
  if (result?.reason) {
    error.reason = result.reason;
  }
  return error;
}
