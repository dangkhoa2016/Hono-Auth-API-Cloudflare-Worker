import bcrypt from 'bcryptjs';
import { authService_log, bcrypt_log, error_log, authError_log } from '../utils/debug.js';
import { UserService } from './userService.js';
import {
  createRateLimitService,
  createTokenService,
  createTokenBlacklistService,
  createTokenAuditService
} from '../utils/serviceFactory.js';
import { BaseService } from './baseService.js';
import { ServiceUnavailableError, codeForError, isServiceError, statusForError } from '../utils/serviceErrors.js';
import { redactText } from '../utils/sensitiveData.js';
import { getSessionRevocationSettings } from '../utils/dynamicConfig.js';

const RATE_LIMIT_CONTEXT_IP = 'auth:ip';
const RATE_LIMIT_CONTEXT_EMAIL = 'auth:email';
const RATE_LIMIT_CONTEXT_USER = 'auth:user';
const RATE_LIMIT_CONTEXT_REFRESH_IP = 'auth:refresh:ip';

function normalizeIdentifier(value) {
  if (!value) {
    return null;
  }
  return String(value).trim().toLowerCase();
}

/**
 * Map a caught error to a service result.
 * A dependency outage keeps its machine code and 503 status so the HTTP layer
 * never reports a database problem as an authentication failure; anything else
 * stays a generic server error without leaking the internal message.
 * @param {Error} error - The caught error
 * @param {string} logMessage - Log context for the fallback branch
 * @returns {Object} Service result
 */
function dependencyFailure(error, logMessage) {
  if (isServiceError(error) && statusForError(error) >= 500) {
    authError_log(`${logMessage}: dependency unavailable (${codeForError(error)})`);
    return {
      success: false,
      error: codeForError(error),
      reason: 'DEPENDENCY_UNAVAILABLE',
      statusCode: statusForError(error)
    };
  }
  return {
    success: false,
    error: 'SERVER_ERROR',
    statusCode: 500,
    details: error.name || 'Error'
  };
}

/**
 * Service for managing authentication operations
 * Inherits optimized config management from BaseService
*/
export class AuthService extends BaseService {
  constructor(env) {
    super(env, 'AuthService');
    this.userService = new UserService(env);
    this.tokenService = createTokenService(env);
    this.tokenBlacklistService = createTokenBlacklistService(env);
    this.tokenAuditService = createTokenAuditService(env);
    authService_log('AuthService initialized with optimized config management');
  }

  /**
   * Handle user login
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} ipAddress - Request IP address
   * @param {Object} requestContext - Additional request metadata (e.g., userAgent)
   * @param {boolean} [requestContext.admitIp] - Set to false when the caller has
   *   already reserved this request's unit of the shared per-IP budget. The
   *   default is to admit, so a new route cannot accidentally skip it.
   * @returns {Promise<Object>} Authentication result
   */
  async login(email, password, ipAddress, requestContext = {}) {
    authService_log(`Processing login for email: ${email} from IP: ${ipAddress}`);

    try {
      const normalizedEmail = normalizeIdentifier(email);
      const featureFlags = await this.getFeatureFlags();
      const isRateLimitDisabled = featureFlags.disableRateLimiting;
      const rateLimitService = createRateLimitService(this.env);

      if (!isRateLimitDisabled) {
        // The per-account budget is admitted here. The per-IP budget belongs to
        // `strictRateLimitMiddleware`, which already reserved a unit for this
        // same request on its way in; admitting it again would charge one login
        // two units and halve the effective limit.
        const admissions = [];

        if (requestContext.admitIp !== false) {
          admissions.push(rateLimitService.admitRequest(ipAddress, {
            context: RATE_LIMIT_CONTEXT_IP,
            limit: (await this.getRateLimitConfig()).maxAttempts
          }));
        }

        if (normalizedEmail) {
          admissions.push(rateLimitService.admitRequest(normalizedEmail, {
            context: RATE_LIMIT_CONTEXT_EMAIL,
            limit: (await this.getRateLimitConfig()).maxAttempts
          }));
        }

        const results = await Promise.all(admissions);
        const blocked = results.find(result => !result.allowed);

        if (blocked) {
          authService_log(`Login blocked due to rate limit in context ${blocked.context}`);
          return {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
            rateLimit: this._buildRateLimitMetadata(blocked, blocked.windowSeconds)
          };
        }
      } else {
        authService_log('Rate limiting is disabled for this environment');
      }

      authService_log(`Finding user by email: ${email}`);
      const user = await this.userService.findByEmail(email);
      authService_log(`User found: ${user ? 'YES' : 'NO'}`);

      if (!user) {
        authService_log(`Login failed: user not found for email: ${email}`);

        return {
          success: false,
          error: 'INVALID_CREDENTIALS',
          statusCode: 401
        };
      }

      bcrypt_log(`Comparing password for user: ${user.id}`);
      const isValidPassword = await bcrypt.compare(password, user.password);

      if (!isValidPassword) {
        authService_log(`Login failed: invalid password for user: ${user.id}`);

        return {
          success: false,
          error: 'INVALID_CREDENTIALS',
          statusCode: 401
        };
      }

      // Credentials are valid; now enforce account state constraints
      if (user.disabled_by_admin) {
        authService_log(`Login blocked after password check: user disabled by admin for email: ${email}`);
        return {
          success: false,
          error: 'ACCOUNT_DISABLED',
          statusCode: 403
        };
      }

      if (user.status !== 'active') {
        authService_log(`Login blocked after password check: user inactive for email: ${email}`);
        return {
          success: false,
          error: 'ACCOUNT_INACTIVE',
          statusCode: 401
        };
      }

      authService_log(`Password verified successfully for user: ${user.id}`);

      if (!isRateLimitDisabled) {
        // Only the account's own budgets are released. The shared per-IP budget
        // is deliberately left alone: clearing it here would let anyone holding
        // one valid account reset the budget that is supposed to stop them
        // guessing other accounts from the same address.
        const releases = [];

        if (normalizedEmail) {
          releases.push(rateLimitService.resetFailedAttempts(normalizedEmail, { context: RATE_LIMIT_CONTEXT_EMAIL }));
        }

        if (user?.id) {
          releases.push(rateLimitService.resetFailedAttempts(String(user.id), { context: RATE_LIMIT_CONTEXT_USER }));
        }

        await Promise.all(releases);
      }

      const tokens = await this.generateTokens(user, {
        ipAddress,
        userAgent: requestContext.userAgent,
        reason: 'login'
      });

      await this.tokenAuditService.logTokenAction('login', user.id, {
        tokenJti: tokens.accessTokenPayload?.jti,
        refreshJti: tokens.refreshTokenPayload?.jti,
        ipAddress,
        userAgent: requestContext.userAgent,
        metadata: { method: 'password' }
      });

      // Lazy cleanup: Trigger token cleanup with low probability (e.g., 1%)
      // Use waitUntil if available to avoid blocking response
      if (Math.random() < 0.01) {
        const cleanupTasks = [
          this.tokenService.cleanupExpiredTokens(50),
          this.tokenBlacklistService.cleanupExpired(50),
          this.tokenAuditService.cleanupOldLogs(90, 100)
        ];

        const cleanupPromise = Promise.allSettled(cleanupTasks);
        if (this.env.executionCtx && typeof this.env.executionCtx.waitUntil === 'function') {
          this.env.executionCtx.waitUntil(cleanupPromise);
        } else {
          cleanupPromise.catch(e => error_log(`Cleanup task failed: ${e.message}`));
        }
      }

      authService_log(`Login successful for user: ${user.id}, email: ${user.email}`);

      return {
        success: true,
        data: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_in: tokens.accessTokenPayload?.exp ? tokens.accessTokenPayload.exp - Math.floor(Date.now() / 1000) : null,
          expires_at: tokens.accessTokenPayload?.exp || null,
          refresh_expires_in: tokens.refreshTokenPayload?.exp ? tokens.refreshTokenPayload.exp - Math.floor(Date.now() / 1000) : null,
          refresh_expires_at: tokens.refreshTokenPayload?.exp || null,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role
          }
        }
      };

    } catch (error) {
      error_log(`Login service error: ${error.name || 'Error'}: ${redactText(error.message)}`);
      return dependencyFailure(error, 'Login service error');
    }
  }

  /**
   * Handle refresh token with rotation
   * @param {string} refreshToken - Refresh token
   * @param {Object} requestContext - Additional request metadata (ipAddress, userAgent)
   * @returns {Promise<Object>} Refresh result
   */
  async refreshToken(refreshToken, requestContext = {}) {
    authService_log('Processing refresh token request');

    try {
      const featureFlags = await this.getFeatureFlags();
      const rateLimitService = createRateLimitService(this.env);
      const ipAddress = requestContext.ipAddress;
      const isRateLimitDisabled = featureFlags.disableRateLimiting;

      if (!isRateLimitDisabled) {
        // A distinct budget from the shared `auth:ip` one the middleware
        // reserves, because refresh has its own much tighter policy (10 per 10
        // minutes) and must not be able to exhaust the login budget or the
        // other way round.
        const rateLimit = await rateLimitService.admitRequest(ipAddress, {
          context: RATE_LIMIT_CONTEXT_REFRESH_IP,
          limit: 10,
          windowSeconds: 600
        });

        if (!rateLimit.allowed) {
          authService_log(`Refresh token blocked due to rate limit for IP: ${ipAddress}`);
          return {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
            rateLimit: this._buildRateLimitMetadata(rateLimit, 600)
          };
        }
      }

      const validation = await this.tokenService.validateRefreshToken(refreshToken, requestContext);

      if (!validation.success) {
        authService_log(`Refresh token validation failed: ${validation.reason || validation.error}`);

        return {
          success: false,
          error: validation.error || 'REFRESH_TOKEN_INVALID',
          statusCode: validation.statusCode || 401
        };
      }

      const { payload, record } = validation;
      // Refresh does not pass through access-token middleware. Apply the same
      // legacy-version rollout before it can mint a new versioned session.
      if (!Number.isSafeInteger(payload.auth_version) || payload.auth_version < 1) {
        const revocation = await getSessionRevocationSettings(this.env);
        if (revocation.mode === 'enforce' || revocation.expired) {
          return { success: false, error: 'TOKEN_MISSING_AUTH_VERSION', statusCode: 401 };
        }
      }

      const user = await this.userService.findById(payload.user_id);

      // A refresh token that predates the current version is dead, even if the
      // revocation write has not landed yet. Password change and logout-all
      // bump the version, so this is what stops an old refresh token from
      // minting a fresh pair during the window between the two writes.
      if (user && Number.isInteger(payload.auth_version) && payload.auth_version !== user.auth_version) {
        authService_log(`Refresh token rejected: auth_version ${payload.auth_version} vs row ${user.auth_version}`);
        await this.tokenService.revokeRefreshToken(record.jti, 'AUTH_VERSION_MISMATCH', { skipIfRevoked: true });
        return {
          success: false,
          error: 'SESSION_REVOKED',
          statusCode: 401
        };
      }

      if (!user || user.status !== 'active') {
        authService_log(`Refresh token failed: user not found or inactive: ${payload.user_id}`);
        await this.tokenService.revokeRefreshToken(record.jti, 'USER_NOT_ACTIVE', { skipIfRevoked: true });
        if (record?.user_id) {
          await this.tokenService.revokeAllTokensForUser(record.user_id, 'USER_NOT_ACTIVE');
        }
        return {
          success: false,
          error: 'USER_NOT_FOUND',
          statusCode: 401
        };
      }

      const rotation = await this.tokenService.rotateRefreshToken({
        record,
        user,
        metadata: requestContext
      });

      if (!rotation.rotated) {
        // Another request consumed this token first. Whether that is a harmless
        // race or a stolen-token replay depends on the winner's grace window,
        // which only the authoritative row knows.
        const state = await this.tokenService.getRefreshRotationState(record.jti);
        const { race } = await this.tokenService.classifyRotationLoss(state);

        if (race) {
          authService_log(`Refresh token ${record.jti} was already rotated by a concurrent request`);
          return {
            success: false,
            error: 'REFRESH_ALREADY_ROTATED',
            statusCode: 409
          };
        }

        // Past the window the token is being replayed, not raced: that is a
        // compromise signal, so the whole family goes. A consistent database
        // should not reach here, since the window is written by the winner at
        // the same moment the row is consumed; this stays as the fail-closed
        // answer for a row that was already outside its window when the
        // conditional update was tried.
        authService_log(`Refresh token reuse detected for user ${user.id}`);
        await this.tokenService.revokeAllTokensForUser(user.id, 'REFRESH_TOKEN_REUSE');
        await this.tokenAuditService.logTokenAction('security_event', user.id, {
          ipAddress,
          userAgent: requestContext.userAgent,
          metadata: { event: 'REFRESH_TOKEN_REUSE', refreshJti: record.jti }
        });
        return {
          success: false,
          error: 'REFRESH_TOKEN_REUSE',
          statusCode: 401
        };
      }

      const tokens = rotation.successor;

      await this.tokenAuditService.logTokenAction('refresh', user.id, {
        tokenJti: tokens.accessTokenPayload?.jti,
        refreshJti: tokens.refreshTokenPayload?.jti,
        ipAddress,
        userAgent: requestContext.userAgent,
        metadata: { replaced: record.jti }
      });

      // The refresh window counts requests, not failures, so a successful
      // rotation does not refund it. Clearing it here would have let a caller
      // that already holds a valid token mint an unbounded number of pairs.

      return {
        success: true,
        data: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          expires_in: tokens.accessTokenPayload?.exp ? tokens.accessTokenPayload.exp - Math.floor(Date.now() / 1000) : null,
          expires_at: tokens.accessTokenPayload?.exp || null,
          refresh_expires_in: tokens.refreshTokenPayload?.exp ? tokens.refreshTokenPayload.exp - Math.floor(Date.now() / 1000) : null,
          refresh_expires_at: tokens.refreshTokenPayload?.exp || null,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role
          }
        }
      };

    } catch (error) {
      error_log(`Refresh token service error: ${error.name || 'Error'}: ${redactText(error.message)}`);
      return dependencyFailure(error, 'Refresh token service error');
    }
  }

  /**
   * Generate access token and refresh token
   * Delegates to TokenService for storage and quota enforcement
   * @param {Object} user - User object
   * @param {Object} metadata - Additional metadata for token storage
   * @returns {Promise<Object>} Tokens object
   */
  async generateTokens(user, metadata = {}) {
    authService_log(`Generating tokens for user: ${user.id}`);
    return await this.tokenService.issueTokenPair(user, metadata);
  }

  /**
   * Verify access token
   * @param {string} token - Access token
   * @returns {Promise<Object>} Verification result
   */
  async verifyAccessToken(token, context = {}) {
    authService_log('Verifying access token');

    try {
      const result = await this.tokenService.verifyAccessToken(token, context);

      if (result.success && result.payload?.jti) {
        const isBlacklisted = await this.tokenBlacklistService.isBlacklisted(result.payload.jti);
        if (isBlacklisted) {
          authService_log(`Access token blacklisted: ${result.payload.jti}`);
          await this.tokenAuditService.logTokenAction('access_denied', result.payload.user_id, {
            tokenJti: result.payload.jti,
            ipAddress: context.requestIp,
            userAgent: context.userAgent,
            success: false,
            errorMessage: 'TOKEN_BLACKLISTED'
          });
          return {
            success: false,
            error: 'ACCESS_TOKEN_REVOKED',
            reason: 'TOKEN_BLACKLISTED'
          };
        }
      }

      if (!result.success) {
        authService_log(`Access token verification failed: ${result.reason || result.error}`);
      } else {
        authService_log(`Access token verified for user: ${result.payload.user_id}`);
      }

      return result;

    } catch (error) {
      if (error instanceof ServiceUnavailableError) {
        error_log('Access token verification blocked: database dependency unavailable');
        return {
          ...dependencyFailure(error, 'Access token verification blocked'),
          reason: 'BLACKLIST_LOOKUP_FAILED'
        };
      }
      error_log(`Access token verification error: ${error.name || 'Error'}: ${redactText(error.message)}`);
      return dependencyFailure(error, 'Access token verification error');
    }
  }

  /**
   * Logout single session: revoke refresh token and blacklist access token
   */
  async logout(refreshToken, accessToken, requestContext = {}) {
    authService_log('Processing logout request');

    const ipAddress = requestContext.ipAddress;
    const userAgent = requestContext.userAgent;

    if (!accessToken) {
      return {
        success: false,
        error: 'ACCESS_TOKEN_REQUIRED',
        statusCode: 401
      };
    }

    const accessVerification = await this.tokenService.verifyAccessToken(accessToken, {
      requestIp: ipAddress,
      userAgent,
      expectedAudience: requestContext.expectedAudience
    });

    if (!accessVerification.success) {
      return {
        success: false,
        error: accessVerification.error || 'ACCESS_TOKEN_INVALID',
        reason: accessVerification.reason || 'ACCESS_TOKEN_INVALID',
        // Keep a dependency outage at 503; only real token problems are 401.
        statusCode: accessVerification.statusCode || 401
      };
    }

    const accessPayload = accessVerification.payload;

    const validation = await this.tokenService.validateRefreshToken(refreshToken, {
      ipAddress,
      userAgent
    });

    if (!validation.success) {
      await this.tokenAuditService.logTokenAction('logout', accessPayload.user_id, {
        tokenJti: accessPayload.jti,
        refreshJti: validation.payload?.jti,
        ipAddress,
        userAgent,
        success: false,
        errorMessage: validation.reason || validation.error
      });

      return {
        success: false,
        error: validation.error,
        reason: validation.reason,
        statusCode: validation.statusCode || 401
      };
    }

    const refreshPayload = validation.payload;

    if (refreshPayload.user_id !== accessPayload.user_id) {
      await this.tokenAuditService.logSuspiciousActivity('logout_mismatch', accessPayload.user_id, {
        tokenJti: accessPayload.jti,
        refreshJti: refreshPayload.jti,
        ipAddress,
        userAgent,
        metadata: { refreshUserId: refreshPayload.user_id }
      });
      return {
        success: false,
        error: 'TOKEN_USER_MISMATCH',
        statusCode: 401
      };
    }

    const refreshRevocation = await this.tokenService.revokeRefreshToken(refreshPayload.jti, 'USER_LOGOUT', { skipIfRevoked: true });

    if (accessPayload.jti && accessPayload.exp) {
      await this.tokenBlacklistService.addToBlacklist({
        jti: accessPayload.jti,
        userId: accessPayload.user_id,
        expiresAt: accessPayload.exp * 1000,
        reason: 'USER_LOGOUT'
      });
    }

    if (!refreshRevocation.revoked) {
      return {
        success: false,
        error: 'DB_UNAVAILABLE',
        reason: 'REFRESH_REVOCATION_NOT_CONFIRMED',
        statusCode: 503
      };
    }

    await this.tokenAuditService.logTokenAction('logout', accessPayload.user_id, {
      tokenJti: accessPayload.jti,
      refreshJti: refreshPayload.jti,
      ipAddress,
      userAgent
    });

    return {
      success: true
    };
  }

  /**
   * Logout all devices for a user
   */
  async logoutAll(userId, accessPayload = null, requestContext = {}, refreshToken = null) {
    if (!userId) {
      return {
        success: false,
        error: 'USER_REQUIRED',
        statusCode: 400
      };
    }

    if (refreshToken) {
      const validation = await this.tokenService.validateRefreshToken(refreshToken, {
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent
      });

      if (!validation.success) {
        await this.tokenAuditService.logTokenAction('logout_all', userId, {
          tokenJti: accessPayload?.jti,
          refreshJti: validation.payload?.jti,
          ipAddress: requestContext.ipAddress,
          userAgent: requestContext.userAgent,
          success: false,
          errorMessage: validation.reason || validation.error
        });

        return {
          success: false,
          error: validation.error,
          reason: validation.reason,
          statusCode: validation.statusCode || 401
        };
      }

      if (validation.payload?.user_id && validation.payload.user_id !== userId) {
        await this.tokenAuditService.logSuspiciousActivity('logout_all_mismatch', userId, {
          tokenJti: accessPayload?.jti,
          refreshJti: validation.payload.jti,
          ipAddress: requestContext.ipAddress,
          userAgent: requestContext.userAgent,
          metadata: { refreshUserId: validation.payload.user_id }
        });
        return {
          success: false,
          error: 'TOKEN_USER_MISMATCH',
          statusCode: 401
        };
      }
    }

    // The version bump is what makes the other devices' access tokens fail on
    // their next request; revoking the refresh rows alone would leave them
    // working until they expired on their own.
    const bulkRevocation = await this.userService.revokeAllSessions(userId, 'USER_LOGOUT_ALL');

    if (!bulkRevocation.success) {
      await this.tokenAuditService.logTokenAction('logout_all', userId, {
        tokenJti: accessPayload?.jti,
        ipAddress: requestContext.ipAddress,
        userAgent: requestContext.userAgent,
        success: false,
        errorMessage: bulkRevocation.error
      });
      return {
        success: false,
        error: bulkRevocation.error || 'USER_NOT_FOUND',
        statusCode: 404
      };
    }

    if (accessPayload?.jti && accessPayload?.exp) {
      await this.tokenBlacklistService.addToBlacklist({
        jti: accessPayload.jti,
        userId,
        expiresAt: accessPayload.exp * 1000,
        reason: 'USER_LOGOUT_ALL'
      });
    }

    await this.tokenAuditService.logTokenAction('logout_all', userId, {
      tokenJti: accessPayload?.jti,
      ipAddress: requestContext.ipAddress,
      userAgent: requestContext.userAgent
    });

    return {
      success: true,
      revokedCount: bulkRevocation.revokedCount,
      authVersion: bulkRevocation.authVersion
    };
  }

  _buildRateLimitMetadata(rateLimitResult, fallbackSeconds = 0) {
    if (!rateLimitResult || typeof rateLimitResult !== 'object') {
      return null;
    }

    const limit = typeof rateLimitResult.limit === 'number' ? rateLimitResult.limit : null;
    const attempts = typeof rateLimitResult.attempts === 'number' ? rateLimitResult.attempts : null;
    const retryAfterSeconds = rateLimitResult.retryAfterSeconds
      || fallbackSeconds
      || rateLimitResult.blockDurationSeconds
      || null;
    const remaining = limit !== null && attempts !== null
      ? Math.max(0, limit - attempts)
      : null;

    return {
      retryAfterSeconds,
      limit,
      remaining,
      context: rateLimitResult.context || RATE_LIMIT_CONTEXT_IP
    };
  }
}
