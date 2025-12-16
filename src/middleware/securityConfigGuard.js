import { DEFAULT_JWT_SECRET, SECURITY_VALIDATION_CACHE_TTL } from '../constants/security.js';
import { securityMiddleware_log, error_log } from '../utils/debug.js';
import { getJwtSettings, isProduction } from '../utils/dynamicConfig.js';

const cacheState = {
  lastCheck: 0,
  valid: true,
  failureReason: null
};

async function validateSecurityConfig(env) {
  const now = Date.now();

  if (cacheState.valid && now - cacheState.lastCheck < SECURITY_VALIDATION_CACHE_TTL) {
    return cacheState.valid;
  }

  try {
    const production = await isProduction(env);

    cacheState.lastCheck = now;
    cacheState.failureReason = null;
    cacheState.valid = true;

    if (!production) {
      return true;
    }

    const jwtSettings = await getJwtSettings(env);

    if (!jwtSettings.secret || jwtSettings.secret === DEFAULT_JWT_SECRET) {
      cacheState.valid = false;
      cacheState.failureReason = 'JWT_SECRET_DEFAULT';
      securityMiddleware_log('Security guard detected default JWT secret in production environment.');
    }

    return cacheState.valid;
  } catch (error) {
    cacheState.lastCheck = now;
    cacheState.failureReason = 'SECURITY_VALIDATION_ERROR';
    cacheState.valid = false;
    error_log(`Security guard validation failed: ${error.message}`);
    return cacheState.valid;
  }
}

export const securityConfigGuardMiddleware = async (c, next) => {
  const isValid = await validateSecurityConfig(c.env);

  if (!isValid) {
    const response = {
      success: false,
      error: 'SERVER_MISCONFIGURATION',
      details: cacheState.failureReason === 'JWT_SECRET_DEFAULT'
        ? 'Production JWT secret is using the default value. Update JWT_SECRET via secrets or KV configuration before serving traffic.'
        : 'Security configuration validation failed. Check worker logs for details.'
    };

    return c.json(response, 500);
  }

  await next();
};
