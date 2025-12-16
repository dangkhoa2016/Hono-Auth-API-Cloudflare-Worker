import { sign, verify } from 'hono/jwt';
import { getJwtSettings } from './dynamicConfig.js';
import { jwt_log, authError_log } from './debug.js';

const JWT_ALGORITHM = 'HS256';

/**
 * Create JWT token with payload and expiration time
 * @param {Object} payload - Data to encode
 * @param {string} expiresIn - Expiration time ('1h' or '3d')
 * @param {Object} env - Environment context for configuration
 * @returns {Promise<Object>} Token payload with iat and exp
*/
export async function createTokenPayload(payload, expiresIn = '1h', env = null) {
  const now = Math.floor(Date.now() / 1000);
  const jwtConfig = await getJwtSettings(env);

  const exp = expiresIn === '1h' ?
    now + jwtConfig.accessTokenExpires :
    now + jwtConfig.refreshTokenExpires;

  jwt_log(`Creating token payload for: ${payload.user_id || 'unknown'}, expires in: ${exp - now} seconds (${expiresIn})`);

  return {
    ...payload,
    iat: now,
    exp: exp
  };
}

/**
 * Sign JWT token
 * @param {Object} payload - Token payload
 * @param {string} secret - JWT secret
 * @returns {Promise<string>} Signed JWT token
*/
export async function signToken(payload, secret) {
  jwt_log(`Signing JWT token for user: ${payload.user_id}`);
  try {
    const token = await sign(payload, secret, JWT_ALGORITHM);
    jwt_log('JWT token signed successfully');
    return token;
  } catch (error) {
    authError_log(`JWT signing failed: ${error.message}`);
    throw error;
  }
}

/**
 * Verify JWT token
 * @param {string} token - JWT token
 * @param {string} secret - JWT secret
 * @returns {Promise<Object|null>} Decoded payload or null if invalid
*/
export async function verifyToken(token, secret) {
  jwt_log('Verifying JWT token');
  try {
    const payload = await verify(token, secret, JWT_ALGORITHM);
    jwt_log(`JWT token verified successfully for user: ${payload.user_id || 'unknown'}`);
    return payload;
  } catch (error) {
    authError_log(`JWT verification failed: ${error.message}`);
    return null;
  }
}

/**
 * Get JWT secret from environment or fallback
 * @param {Object} env - Environment variables
 * @returns {Promise<string>} JWT secret
*/
export async function getJwtSecret(env) {
  const jwtConfig = await getJwtSettings(env);
  return jwtConfig.secret;
}
