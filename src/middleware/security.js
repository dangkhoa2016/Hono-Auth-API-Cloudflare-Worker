import { getSecurityHeadersSettings } from '../utils/dynamicConfig.js';
import { securityMiddleware_log } from '../utils/debug.js';

/**
 * Security Headers Middleware for Hono applications
 * Adds essential security headers to all responses
 *
 * Headers added:
 * - X-Content-Type-Options: Prevents MIME type sniffing
 * - X-Frame-Options: Prevents clickjacking attacks
 * - X-XSS-Protection: Enables XSS protection in browsers
 * - Content-Security-Policy: Controls resource loading
 * - Referrer-Policy: Controls referrer information
 * - Strict-Transport-Security: Enforces HTTPS (production only)
 * - Permissions-Policy: Controls browser features
 */
export const securityMiddleware = async (c, next) => {
  try {
    const securityConfig = await getSecurityHeadersSettings(c.env);
    securityMiddleware_log(`Applying security middleware with config: ${JSON.stringify(securityConfig)}`);

    // Execute the next middleware/handler first
    await next();

    // Add security headers to the response
    const headers = securityConfig.headers || getDefaultSecurityHeaders(c.env);

    for (const [headerName, headerValue] of Object.entries(headers)) {
      if (headerValue && typeof headerValue === 'string') {
        c.header(headerName, headerValue);
        securityMiddleware_log(`Added security header: ${headerName}: ${headerValue}`);
      }
    }

  } catch (error) {
    securityMiddleware_log(`Error in security middleware: ${error.message}`);

    // Apply default headers even if config fails
    const defaultHeaders = getDefaultSecurityHeaders(c.env);
    for (const [headerName, headerValue] of Object.entries(defaultHeaders)) {
      c.header(headerName, headerValue);
    }

    await next();
  }
};

/**
 * Get default security headers configuration
 * @param {Object} env - Environment variables
 * @returns {Object} Default security headers
 */
function getDefaultSecurityHeaders(env) {
  const isProduction = env?.NODE_ENV === 'production' || env?.ENVIRONMENT === 'production';

  const headers = {
    // Prevent MIME type sniffing
    'X-Content-Type-Options': 'nosniff',

    // Prevent clickjacking
    'X-Frame-Options': 'DENY',

    // Enable XSS protection
    'X-XSS-Protection': '1; mode=block',

    // Content Security Policy - restrictive but functional
    'Content-Security-Policy': [
      'default-src \'self\'',
      'script-src \'self\' \'unsafe-inline\'', // Allow inline scripts for API responses
      'style-src \'self\' \'unsafe-inline\'',  // Allow inline styles
      'img-src \'self\' data: https:',       // Allow images from self, data URLs, and HTTPS
      'font-src \'self\'',
      'connect-src \'self\'',
      'media-src \'self\'',
      'object-src \'none\'',                 // Block object/embed tags
      'frame-src \'none\'',                  // Block frames
      'worker-src \'self\'',
      'manifest-src \'self\'',
      'base-uri \'self\'',
      'form-action \'self\''
    ].join('; '),

    // Control referrer policy
    'Referrer-Policy': 'strict-origin-when-cross-origin',

    // Control browser features
    'Permissions-Policy': [
      'camera=()',      // Disable camera
      'microphone=()',  // Disable microphone
      'geolocation=()', // Disable geolocation
      'payment=()',     // Disable payment
      'usb=()',         // Disable USB
      'magnetometer=()', // Disable magnetometer
      'accelerometer=()', // Disable accelerometer
      'gyroscope=()'    // Disable gyroscope
    ].join(', ')
  };

  headers['Cross-Origin-Opener-Policy'] = 'same-origin';
  headers['Cross-Origin-Embedder-Policy'] = 'require-corp';
  headers['Cross-Origin-Resource-Policy'] = 'same-origin';
  headers['X-Download-Options'] = 'noopen';
  headers['X-Permitted-Cross-Domain-Policies'] = 'none';

  // Add HSTS only in production
  if (isProduction) {
    headers['Strict-Transport-Security'] = 'max-age=31536000; includeSubDomains; preload';
  }

  return headers;
}

/**
 * Security middleware specifically for API responses
 * More relaxed CSP for API endpoints that return JSON
 */
export const apiSecurityMiddleware = async (c, next) => {
  await next();

  // API-specific security headers
  c.header('X-Content-Type-Options', 'nosniff');
  c.header('X-Frame-Options', 'DENY');
  c.header('X-XSS-Protection', '1; mode=block');

  // More relaxed CSP for API responses
  c.header('Content-Security-Policy', 'default-src \'none\'; frame-ancestors \'none\'');
  c.header('Referrer-Policy', 'no-referrer');

  securityMiddleware_log('Applied API-specific security headers');
};
