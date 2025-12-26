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

// GET /activate - Activate user account via email link
auth.get('/activate', async (c) => {
  authRoutes_log(`Activation attempt from IP: ${getClientIP(c)}`);

  try {
    const token = c.req.query('token');

    if (!token) {
      authRoutes_log('Activation failed: missing token');
      return c.html(renderActivationPage({
        success: false,
        error: 'MISSING_PARAMS',
        message: t(c, 'auth.activationMissingToken', {}, 'Missing activation token')
      }), 400);
    }

    const { UserService } = await import('../services/userService.js');
    const userService = new UserService(c.env);
    const result = await userService.activateByToken(token);

    if (!result.success) {
      authRoutes_log(`Activation failed: ${result.error}`);

      const errorMessages = {
        'INVALID_TOKEN': t(c, 'auth.activationInvalidToken', {}, 'Invalid or expired activation link'),
        'TOKEN_EXPIRED': t(c, 'auth.activationTokenExpired', {}, 'Activation link has expired. Please request a new one.'),
        'DISABLED_BY_ADMIN': t(c, 'auth.activationDisabledByAdmin', {}, 'Your account has been disabled by an administrator. Please contact support.'),
        'UPDATE_FAILED': t(c, 'auth.activationFailed', {}, 'Failed to activate account')
      };

      return c.html(renderActivationPage({
        success: false,
        error: result.error,
        message: errorMessages[result.error] || result.message
      }), result.error === 'DISABLED_BY_ADMIN' ? 403 : 400);
    }

    if (result.alreadyActive) {
      authRoutes_log('Account already active');
      return c.html(renderActivationPage({
        success: true,
        alreadyActive: true,
        message: t(c, 'auth.activationAlreadyActive', {}, 'Your account is already active. You can log in now.')
      }));
    }

    authRoutes_log(`Account activated successfully for: ${result.user?.email}`);
    return c.html(renderActivationPage({
      success: true,
      user: result.user,
      message: t(c, 'auth.activationSuccess', {}, 'Your account has been activated successfully!')
    }));

  } catch (error) {
    error_log(`Activation error: ${error.message}`);
    return c.html(renderActivationPage({
      success: false,
      error: 'SERVER_ERROR',
      message: t(c, 'auth.activationServerError', {}, 'An error occurred. Please try again later.')
    }), 500);
  }
});

/**
 * Render activation result page (HTML)
 */
function renderActivationPage({ success, alreadyActive, user, error, message }) {
  const title = success ? '✅ Account Activated' : '❌ Activation Failed';
  // eslint-disable-next-line no-unused-vars
  const bgColor = success ? '#10b981' : '#ef4444';

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { 
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; 
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .card {
      background: white;
      border-radius: 16px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 40px;
      max-width: 450px;
      width: 100%;
      text-align: center;
    }
    .icon {
      width: 80px;
      height: 80px;
      border-radius: 50%;
      background: ${bgColor};
      display: flex;
      align-items: center;
      justify-content: center;
      margin: 0 auto 24px;
    }
    .icon svg { width: 40px; height: 40px; fill: white; }
    h1 { color: #1f2937; font-size: 24px; margin-bottom: 16px; }
    p { color: #6b7280; font-size: 16px; line-height: 1.6; margin-bottom: 24px; }
    .btn {
      display: inline-block;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      text-decoration: none;
      padding: 14px 32px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    .btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 20px rgba(102, 126, 234, 0.4);
    }
    .error-code { 
      font-size: 12px; 
      color: #9ca3af; 
      margin-top: 16px;
      font-family: monospace;
    }
    .user-info {
      background: #f3f4f6;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      text-align: left;
    }
    .user-info p { margin-bottom: 8px; font-size: 14px; }
    .user-info strong { color: #374151; }
  </style>
</head>
<body>
  <div class="card">
    <div class="icon">
      ${success
    ? '<svg viewBox="0 0 24 24"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/></svg>'
    : '<svg viewBox="0 0 24 24"><path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"/></svg>'
}
    </div>
    <h1>${success ? (alreadyActive ? 'Already Active' : 'Account Activated!') : 'Activation Failed'}</h1>
    ${user ? `
    <div class="user-info">
      <p><strong>Email:</strong> ${user.email}</p>
      <p><strong>Name:</strong> ${user.full_name}</p>
      <p><strong>Activated:</strong> ${new Date(user.activated_at).toLocaleString()}</p>
    </div>
    ` : ''}
    <p>${message}</p>
    <a href="/login" class="btn">${success ? 'Go to Login' : 'Back to Home'}</a>
    ${error ? `<p class="error-code">Error: ${error}</p>` : ''}
  </div>
</body>
</html>`;
}

export default auth;
