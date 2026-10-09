import { createRateLimitService } from '../utils/serviceFactory.js';
import { getClientIP } from '../utils/helpers.js';
import { rateLimitMiddleware_log } from '../utils/debug.js';
import { getFeatureFlags } from '../utils/dynamicConfig.js';
import { tError } from '../i18n/index.js';

/**
 * The shared per-IP budget for unauthenticated entry points (login, refresh).
 *
 * It lives in one place on purpose. `strictRateLimitMiddleware` used to reserve
 * this budget on its way in *and* `authService.login()` checked the same
 * `auth:ip` key again, so a single login cost two units and the effective limit
 * was half of whatever the configuration said. The middleware is the admission
 * point; the service admits the per-account keys and is told to leave this one
 * alone.
 */
const SHARED_IP_CONTEXT = 'auth:ip';

/** Lower bound for a strict limit, so a misconfigured `maxAttempts` cannot disable it. */
const MIN_STRICT_LIMIT = 3;
/** Shortest window the strict limiter will use, in seconds. */
const MIN_LOCKOUT_SECONDS = 60;

/**
 * Run the shared per-IP admission and answer the request here when it is
 * refused or when the counter cannot answer.
 *
 * The failure path is the point of this rewrite. The previous version wrapped
 * everything in a try/catch whose catch called `await next()`, so a D1 outage
 * was indistinguishable from a permitted request: the caller got a 200 and the
 * rate limit had simply stopped existing. An admission that could not be made is
 * now a 503, and the protected handler does not run.
 *
 * @param {Object} c - Hono context
 * @param {Function} next - Next function
 * @param {Object} [settings] - Limit and context overrides
 * @returns {Promise<Object|undefined>} A refusal response, or undefined to continue
 */
async function admitSharedIpBudget(c, settings) {
  const featureFlags = await getFeatureFlags(c.env);

  if (featureFlags.disableRateLimiting) {
    rateLimitMiddleware_log('Rate limiting is disabled, skipping middleware');
    return undefined;
  }

  const ipAddress = getClientIP(c);
  const rateLimitService = createRateLimitService(c.env);
  const rateLimitConfig = await rateLimitService.getRateLimitConfig();

  const limit = Math.max(MIN_STRICT_LIMIT, settings.limit ?? rateLimitConfig.maxAttempts ?? MIN_STRICT_LIMIT);
  const windowSeconds = Math.max(
    MIN_LOCKOUT_SECONDS,
    settings.blockDurationSeconds ?? (rateLimitConfig.lockoutDuration || 0) * 60
  );

  rateLimitMiddleware_log(`Checking rate limit for IP: ${ipAddress} on ${c.req.method} ${c.req.path}`);

  const admission = await rateLimitService.admitRequest(ipAddress, {
    context: settings.context || SHARED_IP_CONTEXT,
    limit,
    windowSeconds
  });

  if (admission.skipped) {
    return undefined;
  }

  if (!admission.allowed) {
    const retryAfterSeconds = admission.retryAfterSeconds || windowSeconds;
    c.header('Retry-After', String(retryAfterSeconds));
    c.header('X-RateLimit-Limit', String(admission.limit));
    c.header('X-RateLimit-Remaining', '0');

    rateLimitMiddleware_log(`Rate limit exceeded for IP: ${ipAddress}, blocking request`);

    return c.json({
      success: false,
      code: 'RATE_LIMIT_EXCEEDED',
      error: 'Too many requests. Please try again later.',
      retryAfter: retryAfterSeconds
    }, 429);
  }

  rateLimitMiddleware_log(`Rate limit check passed for IP: ${ipAddress}, attempts: ${admission.attempts}`);

  c.header('X-RateLimit-Limit', String(admission.limit));
  c.header('X-RateLimit-Remaining', String(Math.max(0, admission.limit - admission.attempts)));

  return undefined;
}

/**
 * Answer a request whose admission could not be made.
 *
 * Not a free pass. The previous version wrapped everything in a try/catch whose
 * catch called `await next()`, so a D1 outage was indistinguishable from a
 * permitted request: the caller got a 200 and the rate limit had simply stopped
 * existing. Silence from a security control is not consent, so this is a 503
 * with the dependency's machine code, and the protected handler does not run.
 *
 * @param {Object} c - Hono context
 * @param {Error} error - The failure raised by the counter
 * @returns {Promise<Object>} The 503 response
 */
function admissionUnavailable(c, error) {
  const requestId = c.get('requestId') || c.req.header('cf-ray') || null;
  const code = typeof error?.code === 'string' ? error.code : 'RATE_LIMIT_UNAVAILABLE';

  rateLimitMiddleware_log(`Rate limit admission unavailable: ${error?.message}`);

  return c.json({
    success: false,
    error: code,
    code,
    message: tError(c, 'system.rateLimitUnavailable'),
    ...(requestId ? { requestId } : {})
  }, 503);
}

/**
 * Rate limiting middleware for sensitive endpoints
 * @param {Object} c - Hono context
 * @param {Function} next - Next function
 * @returns {Promise} Response or next()
 */
export const rateLimitMiddleware = async (c, next) => {
  try {
    const refusal = await admitSharedIpBudget(c, {});
    if (refusal) {
      return refusal;
    }
    await next();
  } catch (error) {
    return admissionUnavailable(c, error);
  }
};

/**
 * Stricter rate limiting middleware for authentication endpoints
 * @param {Object} c - Hono context
 * @param {Function} next - Next function
 * @returns {Promise} Response or next()
 */
export const strictRateLimitMiddleware = async (c, next) => {
  try {
    const refusal = await admitSharedIpBudget(c, {});
    if (refusal) {
      return refusal;
    }
    await next();
  } catch (error) {
    return admissionUnavailable(c, error);
  }
};

export { SHARED_IP_CONTEXT, admitSharedIpBudget };
