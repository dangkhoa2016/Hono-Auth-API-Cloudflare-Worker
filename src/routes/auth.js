import { Hono } from 'hono';
import { createAuthService } from '../utils/serviceFactory.js';
import { getClientIP, createSuccessResponse } from '../utils/helpers.js';
import { authRoutes_log, zod_log, error_log } from '../utils/debug.js';
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';
import { t, tSuccess } from '../i18n/index.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { strictRateLimitMiddleware } from '../middleware/rateLimit.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { authMiddleware } from '../middleware/auth.js';

const auth = new Hono();

function applyRateLimitHeaders(c, rateLimitInfo) {
  if (!rateLimitInfo) {
    return;
  }

  if (rateLimitInfo.retryAfterSeconds) {
    c.header('Retry-After', String(rateLimitInfo.retryAfterSeconds));
  }

  if (rateLimitInfo.limit !== undefined && rateLimitInfo.limit !== null) {
    c.header('X-RateLimit-Limit', String(rateLimitInfo.limit));
  }

  if (rateLimitInfo.remaining !== undefined && rateLimitInfo.remaining !== null) {
    const remaining = Math.max(0, Number(rateLimitInfo.remaining));
    c.header('X-RateLimit-Remaining', String(remaining));
  }
}

// Apply auto middleware for all routes in this router
auth.use('*', unifiedMiddlewares.auto());

// POST /login - Login with i18n support and strict rate limiting
auth.post('/login', strictRateLimitMiddleware, i18nValidatorsMiddleware.login(), async (c) => {
  authRoutes_log(`Login attempt from IP: ${getClientIP(c)}`);

  try {
    const { email, password } = c.req.valid('json');
    zod_log('Login data validated with i18n Zod schema successfully');

    const ipAddress = getClientIP(c);
    const userAgent = c.req.header('user-agent') || 'Unknown';

    const authService = createAuthService(c.env);
    const result = await authService.login(email, password, ipAddress, { userAgent });

    if (!result.success) {
      applyRateLimitHeaders(c, result.rateLimit);
      // Known user/auth domain errors -> keep precise 4xx response
      const statusCode = result.statusCode || 500;
      const isServer = statusCode >= 500;

      if (isServer) {
        // Standardize server-side failures (unexpected)
        return await handleStandardError(c, new Error(result.error || 'LOGIN_FAILED'), 'Login service error', error_log, 'auth.loginFailed', {
          operation: t(c, 'auth.operations.login'),
          actor: email,
          reason: result.error
        }, statusCode);
      }

      // Directly map error key for standardized handler; statusCode carries original 4xx/429
      return await handleStandardError(c, new Error(result.error || 'LOGIN_ERROR'), 'Login failed (client domain)', authRoutes_log, result.error === 'RATE_LIMIT_EXCEEDED' ? 'auth.rateLimitExceeded' : result.error === 'INVALID_CREDENTIALS' ? 'auth.invalidCredentials' : 'auth.loginFailedGeneric', {}, statusCode);
    }

    // Set user info in context for middleware audit logging
    if (result.data.user) {
      c.set('user', {
        user_id: result.data.user.id,
        id: result.data.user.id,
        email: result.data.user.email,
        role: result.data.user.role,
        full_name: result.data.user.full_name
      });
    }

    // Create formatted login success message with user details and timestamp
    const loginTime = new Date().toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });

    const successMessage = tSuccess(c, 'auth.loginSuccess', {
      userName: result.data.user.full_name || result.data.user.email,
      userRole: result.data.user.role,
      loginTime: loginTime
    });

    return c.json(createSuccessResponse(result.data, successMessage));

  } catch (error) {
    const { email } = c.req.valid('json') || {};
    return await handleStandardError(c, error, 'Login failed due to server error', error_log, 'auth.loginFailed', {
      actor: email || 'Unknown User',
      reason: error.message,
      operation: t(c, 'auth.operations.login'),
      ipAddress: getClientIP(c)
    });
  }
});

// POST /refresh_token - Refresh token with i18n support and strict rate limiting
auth.post('/refresh_token', strictRateLimitMiddleware, i18nValidatorsMiddleware.refreshToken(), async (c) => {
  authRoutes_log('Token refresh request');

  try {
    const { refresh_token } = c.req.valid('json');
    zod_log('Refresh token data validated with i18n Zod schema successfully');

    const authService = createAuthService(c.env);
    const ipAddress = getClientIP(c);
    const userAgent = c.req.header('user-agent') || 'Unknown';
    const result = await authService.refreshToken(refresh_token, { ipAddress, userAgent });

    if (!result.success) {
      applyRateLimitHeaders(c, result.rateLimit);
      const statusCode = result.statusCode || 500;
      const isServer = statusCode >= 500;
      if (isServer) {
        return await handleStandardError(c, new Error(result.error || 'REFRESH_FAILED'), 'Token refresh service error', error_log, 'auth.refreshTokenFailed', {
          operation: 'refreshToken',
          actor: 'refresh',
          reason: result.error
        }, statusCode);
      }
      // Direct error mapping for standardized handler
      return await handleStandardError(c, new Error(result.error || 'REFRESH_ERROR'), 'Refresh token failed (client domain)', authRoutes_log, result.error === 'REFRESH_TOKEN_INVALID' ? 'auth.refreshTokenInvalid' : result.error === 'USER_NOT_FOUND' ? 'user.notFound' : 'auth.refreshFailedGeneric', {}, statusCode);
    }

    // Set user info in context for middleware audit logging
    if (result.data.user) {
      c.set('user', {
        user_id: result.data.user.id,
        id: result.data.user.id,
        email: result.data.user.email,
        role: result.data.user.role,
        full_name: result.data.user.full_name
      });
    }

    return c.json(createSuccessResponse(result.data, t(c, 'auth.refreshSuccess')));

  } catch (error) {
    const { refresh_token } = c.req.valid('json') || {};
    return await handleStandardError(c, error, 'Token refresh failed due to server error', error_log, 'auth.refreshTokenFailed', {
      actor: 'Token Refresh User',
      reason: error.message,
      operation: 'refreshToken',
      refreshToken: refresh_token ? '***' : 'Not provided'
    });
  }
});

// POST /logout - revoke refresh token and blacklist current access token
auth.post('/logout', authMiddleware, i18nValidatorsMiddleware.logout(), async (c) => {
  authRoutes_log('Logout request');

  try {
    const { refresh_token } = c.req.valid('json');
    const authService = createAuthService(c.env);
    const ipAddress = getClientIP(c);
    const userAgent = c.req.header('user-agent') || 'Unknown';
    const accessToken = c.get('accessToken') || (c.req.header('authorization') || '').split(' ')[1];

    const result = await authService.logout(refresh_token, accessToken, {
      ipAddress,
      userAgent
    });

    if (!result.success) {
      const statusCode = result.statusCode || 401;
      return await handleStandardError(c, new Error(result.error || 'LOGOUT_FAILED'), 'Logout failed', authRoutes_log, 'auth.logoutFailed', {
        reason: result.reason || result.error,
        ipAddress
      }, statusCode);
    }

    return c.json(createSuccessResponse({ success: true }, t(c, 'auth.logoutSuccess')));

  } catch (error) {
    return await handleStandardError(c, error, 'Logout failed due to server error', error_log, 'auth.logoutFailed', {
      reason: error.message,
      ipAddress: getClientIP(c)
    });
  }
});

// POST /logout-all - revoke all refresh tokens for the user
auth.post('/logout-all', authMiddleware, i18nValidatorsMiddleware.logoutAll(), async (c) => {
  authRoutes_log('Logout all devices request');

  try {
    const { refresh_token } = c.req.valid('json');
    const authService = createAuthService(c.env);
    const ipAddress = getClientIP(c);
    const userAgent = c.req.header('user-agent') || 'Unknown';
    const user = c.get('user');
    const accessPayload = c.get('accessPayload');

    const result = await authService.logoutAll(user?.user_id || user?.id, accessPayload, {
      ipAddress,
      userAgent
    }, refresh_token);

    if (!result.success) {
      const statusCode = result.statusCode || 401;
      return await handleStandardError(c, new Error(result.error || 'LOGOUT_ALL_FAILED'), 'Logout-all failed', authRoutes_log, 'auth.logoutFailed', {
        reason: result.reason || result.error,
        ipAddress
      }, statusCode);
    }

    return c.json(createSuccessResponse({ success: true }, t(c, 'auth.logoutAllSuccess')));

  } catch (error) {
    return await handleStandardError(c, error, 'Logout-all failed due to server error', error_log, 'auth.logoutFailed', {
      reason: error.message,
      ipAddress: getClientIP(c)
    });
  }
});

export default auth;
