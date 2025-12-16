import { authMiddleware_log, authError_log } from '../utils/debug.js';
import { createAuthService, createUserService } from '../utils/serviceFactory.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { getClientIP } from '../utils/auditHelpers.js';

/**
 * JWT token authentication middleware with i18n support
 * @param {Object} c - Hono context
 * @param {Function} next - Next function
 * @returns {Promise} Response or next()
*/
export const authMiddleware = async (c, next) => {
  const authorization = c.req.header('Authorization');

  authMiddleware_log(`Checking authorization header: ${authorization}`);

  if (!authorization || !authorization.startsWith('Bearer ')) {
    authError_log('Missing or invalid authorization header');
    return await handleStandardError(c, new Error('UNAUTHORIZED'), 'Auth middleware: missing or invalid authorization header', authError_log, 'auth.unauthorized', { resource: c.req.url }, 401);
  }

  const token = authorization.split(' ')[1];
  authMiddleware_log('Extracted token from authorization header');

  const authService = createAuthService(c.env);
  const verification = await authService.verifyAccessToken(token, {
    requestIp: getClientIP(c),
    userAgent: c.req.header('user-agent'),
    expectedAudience: c.req.header('x-api-client') || undefined
  });

  if (!verification.success) {
    const reason = verification.reason || verification.error || 'TOKEN_INVALID';
    authError_log(`Token verification failed: ${reason}`);
    return await handleStandardError(c, new Error(reason), 'Auth middleware: token verification failed', authError_log, 'auth.tokenInvalid', { reason }, 401);
  }

  const payload = verification.payload;
  authMiddleware_log(`Token verified successfully for user: ${payload.user_id}`);
  if (verification.scopeSet) {
    c.set('tokenScopes', Array.from(verification.scopeSet));
  }

  c.set('accessToken', token);
  c.set('accessPayload', payload);

  // Get user information from database to have role
  try {
    let userDetails = null;
    const cacheKey = `user:cache:${payload.user_id}`;
    
    // Try to get from cache first
    if (c.env.CONFIG_KV) {
      try {
        userDetails = await c.env.CONFIG_KV.get(cacheKey, 'json');
        if (userDetails) {
          authMiddleware_log(`User details loaded from cache: ${payload.user_id}`);
        }
      } catch (e) {
        authError_log(`Error reading user cache: ${e.message}`);
      }
    }

    // If not in cache, get from database
    if (!userDetails) {
      const userService = createUserService(c.env);
      userDetails = await userService.findById(payload.user_id);

      if (!userDetails) {
        authError_log(`User not found in database: ${payload.user_id}`);
        return await handleStandardError(c, new Error('USER_NOT_FOUND'), 'Auth middleware: user not found', authError_log, 'auth.userNotFound', {}, 401);
      }

      // Cache user details for 5 minutes (300 seconds)
      if (c.env.CONFIG_KV) {
        c.env.CONFIG_KV.put(cacheKey, JSON.stringify(userDetails), { expirationTtl: 300 })
          .catch(e => authError_log(`Error caching user: ${e.message}`));
      }
    }

    // Add role to payload
    // Enrich user context with commonly used identity fields so downstream routes (e.g. security incidents)
    // can reliably access email/fullName/id regardless of whether request passed through /auth routes.
    const userWithRole = {
      ...payload,              // original JWT payload (contains user_id)
      id: payload.user_id,     // normalize id field
      user_id: payload.user_id,
      email: userDetails.email,
      fullName: userDetails.full_name,
      full_name: userDetails.full_name, // retain original DB naming for compatibility
      role: userDetails.role,
      status: userDetails.status
    };

    // Check user status
    if (userDetails.status !== 'active') {
      authError_log(`User account not active: ${payload.user_id}, status: ${userDetails.status}`);
      const statusKeyMap = {
        inactive: 'auth.accountInactive',
        suspended: 'auth.accountSuspended'
      };
      const statusKey = statusKeyMap[userDetails.status] || 'auth.accountNotActive';
      return await handleStandardError(c, new Error('ACCOUNT_NOT_ACTIVE'), 'Auth middleware: account not active', authError_log, statusKey, { status: userDetails.status }, 401);
    }

    authMiddleware_log(`User role loaded: ${payload.user_id} -> ${userDetails.role}`);

    // Save user information and language to context
    c.set('user', userWithRole);
    await next();
  } catch (error) {
    authError_log(`Error loading user details: ${error.message}`);
    return await handleStandardError(c, error, 'Error loading user details', authError_log, 'system.serverError');
  }
};
