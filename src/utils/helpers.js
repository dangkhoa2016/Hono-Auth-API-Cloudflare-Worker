/**
 * Get IP address from request headers
 * @param {Object} c - Hono context
 * @returns {string} IP address
*/
export function getClientIP(c) {
  return c.req.header('cf-connecting-ip') ||
         c.req.header('x-forwarded-for') ||
         'unknown';
}

/**
 * Check valid email format
 * @param {string} email - Email to check
 * @returns {boolean} True if email is valid
*/
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Create standard success response with i18n support
 * @param {*} data - Data to return
 * @param {string} message - Optional success message
 * @returns {Object} Success response object
*/
export function createSuccessResponse(data, message = null) {
  const response = {
    success: true,
    data
  };

  if (message) {
    response.message = message;
  }

  return response;
}

/**
 * Create standard error response with i18n support
 * @param {string|Object} error - Error message or error object
 * @returns {Object} Error response object
*/
export function createErrorResponse(error) {
  if (typeof error === 'string') {
    return {
      success: false,
      error: error
    };
  }

  // Handle error objects with additional fields
  return {
    success: false,
    error: error.message || error.error || 'Unknown error',
    ...error
  };
}

/**
 * Sanitize user input to prevent XSS attacks
 * Basic HTML sanitization - removes potentially dangerous HTML tags and attributes
 * @param {string} input - Input string to sanitize
 * @returns {string} Sanitized string
 */
export function sanitizeInput(input) {
  if (typeof input !== 'string') {
    return input;
  }

  // Remove HTML tags
  let sanitized = input.replace(/<[^>]*>/g, '');

  // Remove JavaScript event handlers
  sanitized = sanitized.replace(/on\w+="[^"]*"/gi, '');
  sanitized = sanitized.replace(/on\w+='[^']*'/gi, '');

  // Remove JavaScript URLs
  sanitized = sanitized.replace(/javascript:[^;]*/gi, '');

  // Remove data URLs that might contain scripts
  sanitized = sanitized.replace(/data:text\/html[^,]*,[^;]*/gi, '');

  // Trim whitespace
  sanitized = sanitized.trim();

  return sanitized;
}

/**
 * Sanitize object properties recursively
 * @param {Object|Array|string} obj - Object to sanitize
 * @param {Array<string>} fieldsToSanitize - Specific fields to sanitize (optional)
 * @returns {Object|Array|string} Sanitized object
 */
export function sanitizeObject(obj, fieldsToSanitize = null) {
  if (typeof obj === 'string') {
    return sanitizeInput(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item, fieldsToSanitize));
  }

  if (obj && typeof obj === 'object') {
    const sanitized = {};

    for (const [key, value] of Object.entries(obj)) {
      if (fieldsToSanitize && !fieldsToSanitize.includes(key)) {
        // If specific fields are defined and this key is not in the list, copy as-is
        sanitized[key] = value;
      } else {
        // Sanitize the value
        sanitized[key] = sanitizeObject(value, fieldsToSanitize);
      }
    }

    return sanitized;
  }

  return obj;
}
