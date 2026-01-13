import bcrypt from 'bcryptjs';
import { authService_log, bcrypt_log, error_log } from '../utils/debug.js';
import { UserService } from './userService.js';
import {
  createRateLimitService,
  createTokenService,
  createTokenBlacklistService,
  createTokenAuditService
} from '../utils/serviceFactory.js';
import { BaseService } from './baseService.js';

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
   * @returns {Promise<Object>} Authentication result
   */
  async login(email, password, ipAddress, requestContext = {}) {
    authService_log(`Processing login for email: ${email} from IP: ${ipAddress}`);

    try {
      const normalizedEmail = normalizeIdentifier(email);
      const featureFlags = await this.getFeatureFlags();
      const rateLimitConfig = await this.getRateLimitConfig();
      const isRateLimitDisabled = featureFlags.disableRateLimiting;
      const rateLimitService = createRateLimitService(this.env);

      const lockoutDurationSeconds = rateLimitConfig.lockoutDuration * 60;

      if (!isRateLimitDisabled) {
        const checks = [];

        checks.push(rateLimitService.checkRateLimit(ipAddress, {
          context: RATE_LIMIT_CONTEXT_IP,
          limit: rateLimitConfig.maxAttempts,
          blockDurationSeconds: lockoutDurationSeconds
        }));

        if (normalizedEmail) {
          checks.push(rateLimitService.checkRateLimit(normalizedEmail, {
            context: RATE_LIMIT_CONTEXT_EMAIL,
            limit: rateLimitConfig.maxAttempts,
            blockDurationSeconds: lockoutDurationSeconds
          }));
        }

        const results = await Promise.all(checks);
        const blocked = results.find(result => !result.allowed);

        if (blocked) {
          authService_log(`Login blocked due to rate limit in context ${blocked.context}`);
          return {
            success: false,
            error: 'RATE_LIMIT_EXCEEDED',
            statusCode: 429,
            rateLimit: this._buildRateLimitMetadata(blocked, lockoutDurationSeconds)
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

        if (!isRateLimitDisabled) {
          const ops = [
            rateLimitService.recordFailedAttempt(ipAddress, {
              context: RATE_LIMIT_CONTEXT_IP,
              metadata: { reason: 'user_not_found', email: normalizedEmail }
            })
          ];

          if (normalizedEmail) {
            ops.push(rateLimitService.recordFailedAttempt(normalizedEmail, {
              context: RATE_LIMIT_CONTEXT_EMAIL,
              metadata: { reason: 'user_not_found' }
            }));
          }

          await Promise.all(ops);
        }

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

        if (!isRateLimitDisabled) {
          const ops = [
            rateLimitService.recordFailedAttempt(ipAddress, {
              context: RATE_LIMIT_CONTEXT_IP,
              metadata: { reason: 'invalid_password', userId: user.id }
            }),
            rateLimitService.recordFailedAttempt(String(user.id), {
              context: RATE_LIMIT_CONTEXT_USER,
              metadata: { reason: 'invalid_password' }
            })
          ];

          if (normalizedEmail) {
            ops.push(rateLimitService.recordFailedAttempt(normalizedEmail, {
              context: RATE_LIMIT_CONTEXT_EMAIL,
              metadata: { reason: 'invalid_password', userId: user.id }
            }));
          }

          await Promise.all(ops);
        }

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
        const ops = [rateLimitService.resetFailedAttempts(ipAddress, { context: RATE_LIMIT_CONTEXT_IP })];

        if (normalizedEmail) {
          ops.push(rateLimitService.resetFailedAttempts(normalizedEmail, { context: RATE_LIMIT_CONTEXT_EMAIL }));
        }

        if (user?.id) {
          ops.push(rateLimitService.resetFailedAttempts(String(user.id), { context: RATE_LIMIT_CONTEXT_USER }));
        }

        await Promise.all(ops);
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
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role
          }
        }
      };

    } catch (error) {
      error_log(`Login service error: ${error.message}`);
      return {
        success: false,
        error: 'SERVER_ERROR',
        statusCode: 500,
        details: error.message
      };
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
        const rateLimit = await rateLimitService.checkRateLimit(ipAddress, {
          context: RATE_LIMIT_CONTEXT_REFRESH_IP,
          limit: 10,
          blockDurationSeconds: 600,
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

        if (!isRateLimitDisabled) {
          await rateLimitService.recordFailedAttempt(ipAddress, {
            context: RATE_LIMIT_CONTEXT_REFRESH_IP,
            metadata: { reason: validation.reason || validation.error }
          });
        }

        return {
          success: false,
          error: validation.error || 'REFRESH_TOKEN_INVALID',
          statusCode: validation.statusCode || 401
        };
      }

      const { payload, record } = validation;
      const user = await this.userService.findById(payload.user_id);

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

      const tokens = await this.tokenService.rotateRefreshToken({
        record,
        user,
        metadata: requestContext
      });

      await this.tokenAuditService.logTokenAction('refresh', user.id, {
        tokenJti: tokens.accessTokenPayload?.jti,
        refreshJti: tokens.refreshTokenPayload?.jti,
        ipAddress,
        userAgent: requestContext.userAgent,
        metadata: { replaced: record.jti }
      });

      if (!isRateLimitDisabled) {
        await rateLimitService.resetFailedAttempts(ipAddress, { context: RATE_LIMIT_CONTEXT_REFRESH_IP });
      }

      return {
        success: true,
        data: {
          access_token: tokens.accessToken,
          refresh_token: tokens.refreshToken,
          user: {
            id: user.id,
            full_name: user.full_name,
            email: user.email,
            role: user.role
          }
        }
      };

    } catch (error) {
      error_log(`Refresh token service error: ${error.message}`);
      return {
        success: false,
        error: 'SERVER_ERROR',
        statusCode: 500,
        details: error.message
      };
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
      error_log(`Access token verification error: ${error.message}`);
      return {
        success: false,
        error: 'ACCESS_TOKEN_INVALID',
        details: error.message
      };
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
        statusCode: 401
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

    await this.tokenService.revokeRefreshToken(refreshPayload.jti, 'USER_LOGOUT', { skipIfRevoked: true });

    if (accessPayload.jti && accessPayload.exp) {
      await this.tokenBlacklistService.addToBlacklist({
        jti: accessPayload.jti,
        userId: accessPayload.user_id,
        expiresAt: accessPayload.exp * 1000,
        reason: 'USER_LOGOUT'
      });
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

    await this.tokenService.revokeAllTokensForUser(userId, 'USER_LOGOUT_ALL');

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
      success: true
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
