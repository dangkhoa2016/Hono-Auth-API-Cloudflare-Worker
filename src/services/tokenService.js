import { BaseService } from './baseService.js';
import { tokenService_log, error_log } from '../utils/debug.js';
import { createTokenPayload, signToken, verifyToken } from '../utils/jwt.js';

const textEncoder = new TextEncoder();

function getCryptoApi() {
  return typeof globalThis !== 'undefined' ? globalThis.crypto : null;
}

async function sha256Digest(value) {
  const cryptoApi = getCryptoApi();
  if (!cryptoApi || !cryptoApi.subtle || typeof cryptoApi.subtle.digest !== 'function') {
    throw new Error('Web Crypto API with subtle.digest is required but not available in this runtime');
  }

  const data = textEncoder.encode(value);
  const digest = await cryptoApi.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(digest)).map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function toIso(epochSeconds) {
  return new Date(epochSeconds * 1000).toISOString();
}

function nowIso() {
  return new Date().toISOString();
}

function tryGetCrypto() {
  const cryptoApi = getCryptoApi();
  return cryptoApi && typeof cryptoApi.randomUUID === 'function' ? cryptoApi : null;
}

export class TokenService extends BaseService {
  constructor(env) {
    super(env, 'TokenService');
    tokenService_log('TokenService initialized with optimized config management');
  }

  static async hashToken(token) {
    return await sha256Digest(token);
  }

  _generateJti() {
    const cryptoApi = tryGetCrypto();
    if (cryptoApi) {
      return cryptoApi.randomUUID();
    }
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async issueTokenPair(user, metadata = {}, options = {}) {
    try {
      const jwtConfig = await this.getJwtConfig();
      const tokenSecurityConfig = await this.getTokenSecurityConfig();
      const subjectPrefix = jwtConfig.subjectPrefix || 'user';
      const subject = `${subjectPrefix}:${user.id}`;
      const audienceClaim = Array.isArray(jwtConfig.audience)
        ? (jwtConfig.audience.length === 1 ? jwtConfig.audience[0] : jwtConfig.audience)
        : jwtConfig.audience;
      const scopeValue = this._normalizeScopes(
        metadata?.scopes ?? metadata?.scope ?? jwtConfig.defaultScope,
        jwtConfig.scopeSeparator
      );

      const ipHash = metadata?.ipAddress
        ? await TokenService.hashToken(metadata.ipAddress)
        : null;
      const userAgentHash = metadata?.userAgent
        ? await TokenService.hashToken(metadata.userAgent)
        : null;
      const sessionId = metadata?.sessionId || metadata?.session_id;
      const clientId = metadata?.clientId || metadata?.client_id;

      const accessPayloadBase = {
        sub: subject,
        iss: jwtConfig.issuer,
        aud: audienceClaim,
        user_id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role,
        jti: this._generateJti()
      };

      if (scopeValue) {
        accessPayloadBase.scope = scopeValue;
      }

      if (clientId) {
        accessPayloadBase.client_id = clientId;
      }

      if (sessionId) {
        accessPayloadBase.session_id = sessionId;
      }

      if (ipHash) {
        const ipClaimKey = tokenSecurityConfig.enforceAccessTokenIpBinding ? 'ip_hash' : 'ip_hint';
        accessPayloadBase[ipClaimKey] = ipHash;
      }

      if (userAgentHash) {
        const uaClaimKey = tokenSecurityConfig.enforceAccessTokenUserAgentBinding ? 'ua_hash' : 'ua_hint';
        accessPayloadBase[uaClaimKey] = userAgentHash;
      }

      const accessPayload = await createTokenPayload(accessPayloadBase, 'access', this.env);

      const refreshPayloadBase = {
        user_id: user.id,
        jti: this._generateJti()
      };

      const refreshPayload = await createTokenPayload(refreshPayloadBase, 'refresh', this.env);

      const accessToken = await signToken(accessPayload, jwtConfig.secret);
      const refreshToken = await signToken(refreshPayload, jwtConfig.secret);

      await this._persistRefreshToken({
        userId: user.id,
        refreshToken,
        refreshPayload,
        metadata
      });

      if (!options.skipQuota) {
        await this._enforceTokenQuota(user.id);
      }

      tokenService_log(`Issued new token pair for user ${user.id}`);

      return {
        accessToken,
        refreshToken,
        accessTokenPayload: accessPayload,
        refreshTokenPayload: refreshPayload
      };
    } catch (error) {
      error_log(`Failed to issue token pair: ${error.message}`);
      throw error;
    }
  }

  async validateRefreshToken(refreshToken, metadata = {}) {
    try {
      const jwtConfig = await this.getJwtConfig();
      const tokenSecurityConfig = await this.getTokenSecurityConfig();

      let payload;
      try {
        payload = await verifyToken(refreshToken, jwtConfig.secret);
      } catch (verifyError) {
        tokenService_log(`Refresh token verification failed: ${verifyError.message}`);
        return {
          success: false,
          error: 'REFRESH_TOKEN_INVALID',
          reason: 'SIGNATURE_INVALID',
          statusCode: 401
        };
      }

      if (!payload || !payload.user_id || !payload.jti) {
        tokenService_log('Refresh token payload missing required claims');
        return {
          success: false,
          error: 'REFRESH_TOKEN_INVALID',
          reason: 'MALFORMED_PAYLOAD',
          statusCode: 401
        };
      }

      const record = await this.dbService.select(
        `SELECT id, user_id, token_hash, jti, issued_at, expires_at, revoked,
                revoked_at, revocation_reason, replaced_by, reuse_detected_at,
                reuse_ip, reuse_user_agent
         FROM refresh_tokens
         WHERE jti = ?`,
        [payload.jti],
        true
      );

      if (!record) {
        tokenService_log(`Refresh token record not found for jti ${payload.jti}`);
        return {
          success: false,
          error: 'REFRESH_TOKEN_INVALID',
          reason: 'TOKEN_NOT_FOUND',
          statusCode: 401,
          payload
        };
      }

      const incomingHash = await TokenService.hashToken(refreshToken);
      if (record.token_hash !== incomingHash) {
        tokenService_log(`Refresh token hash mismatch detected for user ${record.user_id}`);
        await this._flagReuse(record, metadata, 'HASH_MISMATCH');
        await this.revokeAllTokensForUser(record.user_id, 'TOKEN_HASH_MISMATCH');
        return {
          success: false,
          error: 'REFRESH_TOKEN_REUSED',
          reason: 'HASH_MISMATCH',
          statusCode: 401,
          payload,
          record
        };
      }

      if (record.revoked) {
        const revokedAt = record.revoked_at ? Date.parse(record.revoked_at) : null;
        const graceSeconds = tokenSecurityConfig.refreshTokenReuseGraceSeconds || 0;
        const withinGrace = revokedAt && (Date.now() - revokedAt) <= graceSeconds * 1000;

        await this._flagReuse(record, metadata, 'TOKEN_REVOKED');

        if (withinGrace) {
          return {
            success: false,
            error: 'REFRESH_TOKEN_STALE',
            reason: 'RECENT_ROTATION',
            statusCode: 401,
            payload,
            record
          };
        }

        await this.revokeAllTokensForUser(record.user_id, 'TOKEN_REUSE_DETECTED');
        return {
          success: false,
          error: 'REFRESH_TOKEN_REVOKED',
          reason: 'TOKEN_REVOKED',
          statusCode: 401,
          payload,
          record
        };
      }

      const now = Date.now();
      if (new Date(record.expires_at).getTime() <= now) {
        await this.revokeRefreshToken(record.jti, 'TOKEN_EXPIRED', { skipIfRevoked: true });
        return {
          success: false,
          error: 'REFRESH_TOKEN_EXPIRED',
          reason: 'TOKEN_EXPIRED',
          statusCode: 401,
          payload,
          record
        };
      }

      if (tokenSecurityConfig.enforceRefreshTokenIpBinding) {
        if (!record.ip_address || !metadata.ipAddress) {
          return {
            success: false,
            error: 'REFRESH_TOKEN_INVALID',
            reason: record.ip_address ? 'IP_CONTEXT_REQUIRED' : 'IP_BINDING_MISSING',
            statusCode: 401,
            payload,
            record
          };
        }

        if (record.ip_address !== metadata.ipAddress) {
          await this._flagReuse(record, metadata, 'IP_BINDING_MISMATCH');
          await this.revokeAllTokensForUser(record.user_id, 'REFRESH_IP_BINDING_MISMATCH');
          return {
            success: false,
            error: 'REFRESH_TOKEN_INVALID',
            reason: 'IP_BINDING_MISMATCH',
            statusCode: 401,
            payload,
            record
          };
        }
      }

      if (tokenSecurityConfig.enforceRefreshTokenUserAgentBinding) {
        if (!record.user_agent || !metadata.userAgent) {
          return {
            success: false,
            error: 'REFRESH_TOKEN_INVALID',
            reason: record.user_agent ? 'UA_CONTEXT_REQUIRED' : 'UA_BINDING_MISSING',
            statusCode: 401,
            payload,
            record
          };
        }

        if (record.user_agent !== metadata.userAgent) {
          await this._flagReuse(record, metadata, 'UA_BINDING_MISMATCH');
          await this.revokeAllTokensForUser(record.user_id, 'REFRESH_UA_BINDING_MISMATCH');
          return {
            success: false,
            error: 'REFRESH_TOKEN_INVALID',
            reason: 'UA_BINDING_MISMATCH',
            statusCode: 401,
            payload,
            record
          };
        }
      }

      return {
        success: true,
        payload,
        record
      };
    } catch (error) {
      error_log(`Error validating refresh token: ${error.message}`);
      return {
        success: false,
        error: 'SERVER_ERROR',
        reason: 'VALIDATION_ERROR',
        statusCode: 500
      };
    }
  }

  async rotateRefreshToken({ record, user, metadata = {} }) {
    try {
      const tokens = await this.issueTokenPair(user, metadata, { skipQuota: true });
      await this._markRefreshTokenRevoked(record.jti, 'ROTATED', tokens.refreshTokenPayload.jti);
      await this._enforceTokenQuota(user.id);
      tokenService_log(`Rotated refresh token for user ${user.id}`);
      return tokens;
    } catch (error) {
      error_log(`Failed to rotate refresh token: ${error.message}`);
      throw error;
    }
  }

  async revokeRefreshToken(jti, reason = 'MANUAL_REVOKE', options = {}) {
    try {
      const now = nowIso();
      const query = options.skipIfRevoked
        ? `UPDATE refresh_tokens
           SET revoked = 1,
               revoked_at = COALESCE(revoked_at, ?),
               revocation_reason = COALESCE(revocation_reason, ?),
               updated_at = CURRENT_TIMESTAMP
           WHERE jti = ?`
        : `UPDATE refresh_tokens
           SET revoked = 1,
               revoked_at = ?,
               revocation_reason = ?,
               updated_at = CURRENT_TIMESTAMP
           WHERE jti = ?`;

      await this.dbService.update(query, [now, reason, jti]);
      tokenService_log(`Refresh token ${jti} revoked`);
      return true;
    } catch (error) {
      error_log(`Failed to revoke refresh token ${jti}: ${error.message}`);
      return false;
    }
  }

  async revokeAllTokensForUser(userId, reason = 'ADMIN_REVOKE') {
    try {
      const now = nowIso();
      await this.dbService.update(
        `UPDATE refresh_tokens
         SET revoked = 1,
             revoked_at = COALESCE(revoked_at, ?),
             revocation_reason = COALESCE(revocation_reason, ?),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND revoked = 0`,
        [now, reason, userId]
      );
      tokenService_log(`Revoked all active refresh tokens for user ${userId}`);
    } catch (error) {
      error_log(`Failed to revoke all tokens for user ${userId}: ${error.message}`);
    }
  }

  async _persistRefreshToken({ userId, refreshToken, refreshPayload, metadata }) {
    const tokenHash = await TokenService.hashToken(refreshToken);
    const issuedAtIso = toIso(refreshPayload.iat);
    const expiresAtIso = toIso(refreshPayload.exp);
    const ipAddress = metadata?.ipAddress || null;
    const userAgent = metadata?.userAgent || null;

    await this.dbService.insert(
      `INSERT INTO refresh_tokens (
        user_id, token_hash, jti, issued_at, expires_at,
        ip_address, user_agent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [userId, tokenHash, refreshPayload.jti, issuedAtIso, expiresAtIso, ipAddress, userAgent]
    );
  }

  async _markRefreshTokenRevoked(jti, reason, replacedByJti = null) {
    const now = nowIso();
    await this.dbService.update(
      `UPDATE refresh_tokens
       SET revoked = 1,
           revoked_at = ?,
           revocation_reason = ?,
           replaced_by = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE jti = ?`,
      [now, reason, replacedByJti, jti]
    );
  }

  async _flagReuse(record, metadata, reason) {
    const now = nowIso();
    const reuseIp = metadata?.ipAddress || null;
    const reuseUserAgent = metadata?.userAgent || null;

    await this.dbService.update(
      `UPDATE refresh_tokens
       SET reuse_detected_at = COALESCE(reuse_detected_at, ?),
           reuse_ip = COALESCE(reuse_ip, ?),
           reuse_user_agent = COALESCE(reuse_user_agent, ?),
           updated_at = CURRENT_TIMESTAMP,
           revocation_reason = COALESCE(revocation_reason, ?)
       WHERE id = ?`,
      [now, reuseIp, reuseUserAgent, reason, record.id]
    );
  }

  async _enforceTokenQuota(userId) {
    const tokenSecurityConfig = await this.getTokenSecurityConfig();
    const maxActive = tokenSecurityConfig.maxRefreshTokensPerUser;

    if (!maxActive || maxActive <= 0) {
      return;
    }

    const activeTokens = await this.dbService.select(
      `SELECT id, jti
       FROM refresh_tokens
       WHERE user_id = ? AND revoked = 0
       ORDER BY issued_at DESC`,
      [userId]
    );

    if (!Array.isArray(activeTokens) || activeTokens.length <= maxActive) {
      return;
    }

    const tokensToRevoke = activeTokens.slice(maxActive);
    const now = nowIso();

    await Promise.all(tokensToRevoke.map(token =>
      this.dbService.update(
        `UPDATE refresh_tokens
         SET revoked = 1,
             revoked_at = ?,
             revocation_reason = 'QUOTA_EXCEEDED',
             updated_at = CURRENT_TIMESTAMP
         WHERE id = ?`,
        [now, token.id]
      )
    ));

    tokenService_log(`Enforced token quota for user ${userId}, revoked ${tokensToRevoke.length} token(s)`);
  }

  async verifyAccessToken(token, options = {}) {
    tokenService_log('Verifying access token with enhanced claim checks');

    const jwtConfig = await this.getJwtConfig();
    const tokenSecurityConfig = await this.getTokenSecurityConfig();
    const allowedSkew = typeof options.clockToleranceSeconds === 'number'
      ? Math.max(0, options.clockToleranceSeconds)
      : (jwtConfig.allowedClockSkew || 0);

    let payload;
    try {
      payload = await verifyToken(token, jwtConfig.secret);
    } catch (error) {
      error_log(`Access token verification failed: ${error.message}`);
      return {
        success: false,
        error: 'ACCESS_TOKEN_INVALID',
        reason: 'TOKEN_SIGNATURE_INVALID',
        details: error.message
      };
    }

    if (!payload) {
      return {
        success: false,
        error: 'ACCESS_TOKEN_INVALID',
        reason: 'TOKEN_SIGNATURE_INVALID'
      };
    }

    if (!payload.user_id) {
      return {
        success: false,
        error: 'ACCESS_TOKEN_INVALID',
        reason: 'CLAIMS_MISSING'
      };
    }

    if (jwtConfig.enforceIssuer && payload.iss !== jwtConfig.issuer) {
      error_log(`Access token issuer mismatch: expected ${jwtConfig.issuer}, received ${payload.iss}`);
      return {
        success: false,
        error: 'ACCESS_TOKEN_INVALID',
        reason: 'ISSUER_MISMATCH'
      };
    }

    const expectedAudiences = this._normalizeToArray(options.expectedAudience || jwtConfig.audience);
    const tokenAudiences = this._normalizeToArray(payload.aud);
    if (jwtConfig.enforceAudience && !this._hasAudienceMatch(expectedAudiences, tokenAudiences)) {
      error_log(`Access token audience mismatch: expected one of [${expectedAudiences.join(', ')}], received [${tokenAudiences.join(', ')}]`);
      return {
        success: false,
        error: 'ACCESS_TOKEN_INVALID',
        reason: 'AUDIENCE_MISMATCH'
      };
    }

    const subjectPrefix = jwtConfig.subjectPrefix || 'user';
    const expectedSubject = `${subjectPrefix}:${payload.user_id}`;
    if (payload.sub && payload.sub !== expectedSubject) {
      error_log(`Access token subject mismatch: expected ${expectedSubject}, received ${payload.sub}`);
      return {
        success: false,
        error: 'ACCESS_TOKEN_INVALID',
        reason: 'SUBJECT_MISMATCH'
      };
    }

    const nowSeconds = Math.floor(Date.now() / 1000);
    if (typeof payload.iat === 'number') {
      const futureOffset = payload.iat - nowSeconds;
      if (futureOffset > allowedSkew) {
        error_log(`Access token issued-at too far in future: iat=${payload.iat}, now=${nowSeconds}, skew=${allowedSkew}`);
        return {
          success: false,
          error: 'ACCESS_TOKEN_INVALID',
          reason: 'TOKEN_IAT_OUT_OF_RANGE'
        };
      }
    }

    if (typeof payload.exp === 'number' && typeof payload.iat === 'number') {
      const maxLifetime = Math.max(jwtConfig.maxAccessTokenLifetime || 0, jwtConfig.accessTokenExpires || 0);
      if ((payload.exp - payload.iat) > (maxLifetime + allowedSkew)) {
        error_log(`Access token lifetime exceeds maximum allowed: exp=${payload.exp}, iat=${payload.iat}, maxLifetime=${maxLifetime}`);
        return {
          success: false,
          error: 'ACCESS_TOKEN_INVALID',
          reason: 'TOKEN_LIFETIME_EXCEEDED'
        };
      }
    }

    if (options.requiredScopes) {
      const scopeSet = this._parseScopes(payload.scope, jwtConfig.scopeSeparator);
      const missingScopes = this._getMissingScopes(scopeSet, options.requiredScopes, jwtConfig.scopeSeparator);
      if (missingScopes.length > 0) {
        error_log(`Access token missing required scopes: ${missingScopes.join(', ')}`);
        return {
          success: false,
          error: 'ACCESS_TOKEN_SCOPE_MISSING',
          reason: 'SCOPE_MISSING',
          details: { missingScopes }
        };
      }
    }

    const requestIp = options.requestIp;
    if (tokenSecurityConfig.enforceAccessTokenIpBinding) {
      if (!payload.ip_hash) {
        return {
          success: false,
          error: 'ACCESS_TOKEN_INVALID',
          reason: 'IP_BINDING_MISSING'
        };
      }
      if (!requestIp) {
        return {
          success: false,
          error: 'ACCESS_TOKEN_INVALID',
          reason: 'IP_CONTEXT_REQUIRED'
        };
      }
      const contextIpHash = await TokenService.hashToken(requestIp);
      if (contextIpHash !== payload.ip_hash) {
        error_log('Access token IP binding mismatch detected');
        return {
          success: false,
          error: 'ACCESS_TOKEN_INVALID',
          reason: 'IP_BINDING_MISMATCH'
        };
      }
    } else if (payload.ip_hash && requestIp) {
      const contextIpHash = await TokenService.hashToken(requestIp);
      if (contextIpHash !== payload.ip_hash) {
        error_log('Access token IP hash present but does not match request IP');
        return {
          success: false,
          error: 'ACCESS_TOKEN_INVALID',
          reason: 'IP_BINDING_MISMATCH'
        };
      }
    }

    const requestUserAgent = options.userAgent;
    if (tokenSecurityConfig.enforceAccessTokenUserAgentBinding) {
      if (!payload.ua_hash) {
        return {
          success: false,
          error: 'ACCESS_TOKEN_INVALID',
          reason: 'UA_BINDING_MISSING'
        };
      }
      if (!requestUserAgent) {
        return {
          success: false,
          error: 'ACCESS_TOKEN_INVALID',
          reason: 'UA_CONTEXT_REQUIRED'
        };
      }
      const contextUaHash = await TokenService.hashToken(requestUserAgent);
      if (contextUaHash !== payload.ua_hash) {
        error_log('Access token user-agent binding mismatch detected');
        return {
          success: false,
          error: 'ACCESS_TOKEN_INVALID',
          reason: 'UA_BINDING_MISMATCH'
        };
      }
    } else if (payload.ua_hash && requestUserAgent) {
      const contextUaHash = await TokenService.hashToken(requestUserAgent);
      if (contextUaHash !== payload.ua_hash) {
        error_log('Access token user-agent hash present but does not match request user-agent');
        return {
          success: false,
          error: 'ACCESS_TOKEN_INVALID',
          reason: 'UA_BINDING_MISMATCH'
        };
      }
    }

    tokenService_log(`Access token verified successfully for user ${payload.user_id}`);

    return {
      success: true,
      payload,
      scopeSet: this._parseScopes(payload.scope, jwtConfig.scopeSeparator)
    };
  }

  /**
   * Cleanup expired refresh tokens
   * @param {number} limit - Maximum number of tokens to delete per run
   * @returns {Promise<number>} Number of deleted tokens
   */
  async cleanupExpiredTokens(limit = 100) {
    try {
      const now = nowIso();

      // Delete tokens that are expired OR revoked more than 30 days ago
      const result = await this.dbService.delete(
        `DELETE FROM refresh_tokens 
         WHERE (expires_at < ?) 
            OR (revoked = 1 AND revoked_at < datetime(?, '-30 days'))
         LIMIT ?`,
        [now, now, limit]
      );

      if (result && result.changes > 0) {
        tokenService_log(`Cleaned up ${result.changes} expired/revoked refresh tokens`);
        return result.changes;
      }

      return 0;
    } catch (error) {
      error_log(`Failed to cleanup expired tokens: ${error.message}`);
      return 0;
    }
  }

  _normalizeScopes(scopes, separator = ' ') {
    const tokens = this._tokenizeScopes(scopes, separator);
    return tokens.join(separator).trim();
  }

  _parseScopes(scopeValue, separator = ' ') {
    const tokens = this._tokenizeScopes(scopeValue, separator);
    return new Set(tokens);
  }

  _tokenizeScopes(scopeValue, separator = ' ') {
    if (!scopeValue) {
      return [];
    }

    if (Array.isArray(scopeValue)) {
      return scopeValue.map(scope => scope && String(scope).trim()).filter(Boolean);
    }

    const normalized = String(scopeValue);

    if (separator && separator !== ' ') {
      const escapedSeparator = separator.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
      return normalized
        .replace(new RegExp(escapedSeparator, 'g'), ' ')
        .split(/[\s,]+/)
        .map(token => token.trim())
        .filter(Boolean);
    }

    return normalized
      .split(/[\s,]+/)
      .map(token => token.trim())
      .filter(Boolean);
  }

  _getMissingScopes(scopeSet, requiredScopes, separator = ' ') {
    const requiredTokens = this._tokenizeScopes(requiredScopes, separator);
    return requiredTokens.filter(scope => !scopeSet.has(scope));
  }

  _normalizeToArray(value) {
    if (!value) {
      return [];
    }
    if (Array.isArray(value)) {
      return value.map(v => v && String(v).trim()).filter(Boolean);
    }
    return [String(value).trim()].filter(Boolean);
  }

  _hasAudienceMatch(expected, actual) {
    if (!expected.length || !actual.length) {
      return false;
    }
    return expected.some(value => actual.includes(value));
  }
}
