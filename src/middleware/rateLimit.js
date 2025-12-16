import { createRateLimitService } from '../utils/serviceFactory.js';
import { getClientIP } from '../utils/helpers.js';
import { rateLimitMiddleware_log } from '../utils/debug.js';
import { getFeatureFlags } from '../utils/dynamicConfig.js';

/**
 * Rate limiting middleware for sensitive endpoints
 * Applies rate limiting based on IP address for authentication and sensitive operations
 * @param {Object} c - Hono context
 * @param {Function} next - Next function
 * @returns {Promise} Response or next()
 */
export const rateLimitMiddleware = async (c, next) => {
  try {
    // Get feature flags to check if rate limiting is enabled
    const featureFlags = await getFeatureFlags(c.env);

    // Skip rate limiting if disabled
    if (featureFlags.disableRateLimiting) {
      rateLimitMiddleware_log('Rate limiting is disabled, skipping middleware');
      await next();
      return;
    }

    const ipAddress = getClientIP(c);
    const rateLimitService = createRateLimitService(c.env);
    const rateLimitConfig = await rateLimitService.getRateLimitConfig();

    rateLimitMiddleware_log(`Checking rate limit for IP: ${ipAddress} on ${c.req.method} ${c.req.path}`);

    const rateLimit = await rateLimitService.checkRateLimit(ipAddress, {
      context: 'auth:ip',
      limit: rateLimitConfig.maxAttempts,
      blockDurationSeconds: rateLimitConfig.lockoutDuration * 60
    });

    if (!rateLimit.allowed) {
      rateLimitMiddleware_log(`Rate limit exceeded for IP: ${ipAddress}, blocking request`);

      const retryAfterSeconds = rateLimit.retryAfterSeconds || rateLimit.blockDurationSeconds || rateLimitConfig.lockoutDuration * 60;
      c.header('Retry-After', String(retryAfterSeconds));
      c.header('X-RateLimit-Limit', String(rateLimit.limit || rateLimitConfig.maxAttempts));
      c.header('X-RateLimit-Remaining', '0');

      return c.json({
        success: false,
        error: 'Too many requests. Please try again later.',
        retryAfter: retryAfterSeconds
      }, 429);
    }

    rateLimitMiddleware_log(`Rate limit check passed for IP: ${ipAddress}, attempts: ${rateLimit.attempts}`);

    // Add rate limit headers to response
    const remaining = Math.max(0, rateLimit.limit - rateLimit.attempts);
    c.header('X-RateLimit-Limit', String(rateLimit.limit));
    c.header('X-RateLimit-Remaining', String(remaining));
    if (rateLimit.retryAfterSeconds) {
      c.header('Retry-After', String(rateLimit.retryAfterSeconds));
    }

    await next();
  } catch (error) {
    rateLimitMiddleware_log(`Rate limit middleware error: ${error.message}`);
    // On error, allow the request to continue to avoid blocking legitimate users
    await next();
  }
};

/**
 * Stricter rate limiting middleware for authentication endpoints
 * More aggressive rate limiting for login, registration, and password reset
 * @param {Object} c - Hono context
 * @param {Function} next - Next function
 * @returns {Promise} Response or next()
 */
export const strictRateLimitMiddleware = async (c, next) => {
  try {
    // Get feature flags to check if rate limiting is enabled
    const featureFlags = await getFeatureFlags(c.env);

    // Skip rate limiting if disabled
    if (featureFlags.disableRateLimiting) {
      rateLimitMiddleware_log('Strict rate limiting is disabled, skipping middleware');
      await next();
      return;
    }

    const ipAddress = getClientIP(c);
    const rateLimitService = createRateLimitService(c.env);
    const rateLimitConfig = await rateLimitService.getRateLimitConfig();

    const lockoutDurationSeconds = Math.max(60, (rateLimitConfig.lockoutDuration || 0) * 60);
    const strictLimit = Math.max(3, rateLimitConfig.maxAttempts || 3);

    rateLimitMiddleware_log(`Checking strict rate limit for IP: ${ipAddress} on ${c.req.method} ${c.req.path}`);

    const rateLimit = await rateLimitService.checkRateLimit(ipAddress, {
      context: 'auth:ip',
      limit: strictLimit,
      blockDurationSeconds: lockoutDurationSeconds,
      windowSeconds: lockoutDurationSeconds
    });

    if (!rateLimit.allowed) {
      rateLimitMiddleware_log(`Strict rate limit exceeded for IP: ${ipAddress}, blocking auth request`);

      const retryAfterSeconds = rateLimit.retryAfterSeconds || rateLimit.blockDurationSeconds || 900;
      c.header('Retry-After', String(retryAfterSeconds));
      c.header('X-RateLimit-Limit', String(rateLimit.limit || 3));
      c.header('X-RateLimit-Remaining', '0');

      return c.json({
        success: false,
        error: 'Too many authentication attempts. Please try again later.',
        retryAfter: retryAfterSeconds
      }, 429);
    }

    rateLimitMiddleware_log(`Strict rate limit check passed for IP: ${ipAddress}, attempts: ${rateLimit.attempts}`);

    // Add rate limit headers
    const remaining = Math.max(0, rateLimit.limit - rateLimit.attempts);
    c.header('X-RateLimit-Limit', String(rateLimit.limit));
    c.header('X-RateLimit-Remaining', String(remaining));
    if (rateLimit.retryAfterSeconds) {
      c.header('Retry-After', String(rateLimit.retryAfterSeconds));
    }

    await next();
  } catch (error) {
    rateLimitMiddleware_log(`Strict rate limit middleware error: ${error.message}`);
    // On error, allow the request to continue
    await next();
  }
};