import { authMiddleware_log, authError_log } from '../utils/debug.js';
import { createAuthService, createUserService, createKvConfigService } from '../utils/serviceFactory.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { getClientIP } from '../utils/auditHelpers.js';
import { codeForError, isServiceError, statusForError, ServiceUnavailableError } from '../utils/serviceErrors.js';
import { describeAuthScheme, redactText } from '../utils/sensitiveData.js';
import { getSessionRevocationSettings } from '../utils/dynamicConfig.js';

/**
 * JWT token authentication middleware with i18n support
 * @param {Object} c - Hono context
 * @param {Function} next - Next function
 * @returns {Promise} Response or next()
 */
export const authMiddleware = async (c, next) => {
  const authorization = c.req.header('Authorization');

  // Never log the raw header: it carries the bearer token itself.
  authMiddleware_log(`Authorization header ${authorization ? `present (${describeAuthScheme(authorization)})` : 'missing'}`);

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

    if (verification.statusCode === 503 || verification.error === 'DB_UNAVAILABLE') {
      return await handleStandardError(
        c,
        new Error('DB_UNAVAILABLE'),
        'Auth middleware: token verification blocked by dependency failure',
        authError_log,
        'system.serviceUnavailable',
        { reason: 'DB_UNAVAILABLE' },
        503,
        { code: 'DB_UNAVAILABLE' }
      );
    }

    return await handleStandardError(c, new Error(reason), 'Auth middleware: token verification failed', authError_log, 'auth.tokenInvalid', { reason }, 401);
  }

  const payload = verification.payload;
  authMiddleware_log(`Token verified successfully for user: ${payload.user_id}`);
  if (verification.scopeSet) {
    c.set('tokenScopes', Array.from(verification.scopeSet));
  }

  c.set('accessToken', token);
  c.set('accessPayload', payload);

  // Authorization decisions come from the database, every request.
  //
  // The identity cache is still useful for the fields a route merely displays,
  // but role, status and auth version decide what a request may do, and those
  // three were being answered from a cache with a 300-second TTL. A session
  // revoked by logout-all, a password change or a role downgrade therefore kept
  // working for up to five minutes, and the version check below only ever ran on
  // a cache miss, where the lookup did not even select the column.
  try {
    const userService = createUserService(c.env);
    const securityState = await userService.findSecurityState(payload.user_id);

    if (!securityState) {
      authError_log(`User not found in database: ${payload.user_id}`);
      return await handleStandardError(c, new Error('USER_NOT_FOUND'), 'Auth middleware: user not found', authError_log, 'auth.userNotFound', {}, 401);
    }

    const revocation = await getSessionRevocationSettings(c.env);
    // Only a token that predates the claim needs a transition policy. A token
    // that carries a version and disagrees with the row is revoked, full stop:
    // there is no rollout in which that token should keep working, and a
    // mismatch is a positive statement that something changed.
    const enforceLegacy = revocation.mode === 'enforce' || revocation.expired;

    if (!revocation.valid) {
      authError_log(
        `AUTH_VERSION_ENFORCEMENT is "${revocation.mode}", which is not a published mode; using the transition state`
      );
    }

    // A token minted before the claim existed cannot be compared with anything.
    // Treating it as current would make every legacy token immortal, so
    // enforcement refuses it under its own published code.
    const tokenVersion = Number(payload.auth_version);
    const hasVersion = Number.isInteger(tokenVersion) && tokenVersion > 0;
    const currentVersion = Number(securityState.auth_version);
    if (!Number.isSafeInteger(currentVersion) || currentVersion < 1) {
      throw new ServiceUnavailableError('Stored session version is unusable');
    }


    if (!hasVersion) {
      authError_log(`Token for user ${payload.user_id} carries no auth_version claim`);
      if (enforceLegacy) {
        return await handleStandardError(
          c,
          new Error('TOKEN_MISSING_AUTH_VERSION'),
          'Auth middleware: token predates auth version enforcement',
          authError_log,
          'auth.tokenInvalid',
          { reason: 'TOKEN_MISSING_AUTH_VERSION' },
          401,
          { code: 'TOKEN_MISSING_AUTH_VERSION' }
        );
      }
    } else if (Number.isInteger(currentVersion) && currentVersion > 0 && tokenVersion !== currentVersion) {
      authError_log(
        `Auth version mismatch for user ${payload.user_id} (token ${tokenVersion}, current ${currentVersion}), session revoked`
      );
      return await handleStandardError(
        c,
        new Error('SESSION_REVOKED'),
        'Auth middleware: session revoked',
        authError_log,
        'auth.tokenInvalid',
        { reason: 'SESSION_REVOKED' },
        401,
        { code: 'SESSION_REVOKED' }
      );
    }

    // Account status gates the request too, and it has to be the current value.
    if (securityState.status !== 'active') {
      authError_log(`User account not active: ${payload.user_id}, status: ${securityState.status}`);
      const statusKeyMap = {
        inactive: 'auth.accountInactive',
        suspended: 'auth.accountSuspended'
      };
      const statusKey = statusKeyMap[securityState.status] || 'auth.accountNotActive';
      return await handleStandardError(c, new Error('ACCOUNT_NOT_ACTIVE'), 'Auth middleware: account not active', authError_log, statusKey, { status: securityState.status }, 401);
    }

    // Display fields may come from the cache; the three decisions above may not.
    const cacheKey = `user:cache:${payload.user_id}`;
    const kvConfigService = createKvConfigService(c.env);
    let displayFields = null;
    if (kvConfigService.kv) {
      try {
        displayFields = await kvConfigService.getRaw(cacheKey, 'json');
        if (displayFields) {
          authMiddleware_log(`Display fields loaded from cache: ${payload.user_id}`);
        }
      } catch (e) {
        authError_log(`Error reading user cache: ${e.message}`);
      }
    }

    if (!displayFields) {
      const profile = await userService.findById(payload.user_id);
      displayFields = { email: profile?.email, full_name: profile?.full_name };
      if (kvConfigService.kv) {
        kvConfigService.putRaw(cacheKey, JSON.stringify(displayFields), { expirationTtl: 300 })
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
      email: displayFields.email,
      fullName: displayFields.full_name,
      full_name: displayFields.full_name, // retain original DB naming for compatibility
      // The authoritative role, not the role in the token or the cache: a
      // downgrade has to take effect on the next request.
      role: securityState.role,
      status: securityState.status,
      auth_version: currentVersion
    };

    authMiddleware_log(`User role loaded: ${payload.user_id} -> ${securityState.role}`);

    // Save user information and language to context
    c.set('user', userWithRole);
    await next();
  } catch (error) {
    authError_log(`Error loading user details: ${error.name || 'Error'}: ${redactText(error.message)}`);
    // A dependency outage is never a client error: reporting 401 here would
    // tell the client to drop a perfectly valid session.
    if (isServiceError(error) && statusForError(error) >= 500) {
      return await handleStandardError(
        c,
        new Error('DB_UNAVAILABLE'),
        'Auth middleware: user lookup unavailable',
        authError_log,
        'system.serviceUnavailable',
        { reason: 'DB_UNAVAILABLE' },
        503,
        { code: codeForError(error) }
      );
    }
    return await handleStandardError(c, error, 'Error loading user details', authError_log, 'system.serverError');
  }
};
