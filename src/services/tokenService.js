import { BaseService } from './baseService.js';
import { tokenService_log, error_log } from '../utils/debug.js';
import { createTokenPayload, signToken, verifyToken } from '../utils/jwt.js';
import { codeForError, isServiceError, statusForError } from '../utils/serviceErrors.js';
import { redactText } from '../utils/sensitiveData.js';

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

  /**
   * The version a token is minted under.
   *
   * Missing means the caller loaded a user without selecting the column, which
   * is a bug rather than a state to paper over: minting a token with no version
   * produces a session that logout-all and password changes cannot reach.
   * @param {Object} user - User row
   * @returns {number} A positive integer version
   */
  _resolveAuthVersion(user) {
    const version = Number(user?.auth_version);
    if (!Number.isInteger(version) || version < 1) {
      throw new Error(`Cannot issue a token: user ${user?.id} has no usable auth_version`);
    }
    return version;
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
      const issued = await this._buildTokenPair(user, metadata);

      await this._persistRefreshToken({
        userId: user.id,
        refreshToken: issued.refreshToken,
        refreshTokenPayload: issued.refreshTokenPayload,
        authVersion: issued.authVersion,
        metadata
      });

      if (!options.skipQuota) {
        await this._enforceTokenQuota(user.id);
      }

      tokenService_log(`Issued new token pair for user ${user.id}`);

      return issued;
    } catch (error) {
      error_log(`Failed to issue token pair: ${error.message}`);
      throw error;
    }
  }

  /**
   * Signs an access/refresh pair and returns it without persisting anything.
   *
   * Split out from issueTokenPair because a rotation has to know the successor's
   * jti before it writes the conditional consume, and a prepared pair must be
   * discardable if that write loses.
   * @param {Object} user - User row
   * @param {Object} metadata - Request metadata for the bindings
   * @returns {Promise<Object>} The pair, plus the version it was minted under
   */
  async _buildTokenPair(user, metadata = {}) {
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

    // The version the token belongs to. A row without one would mint a token
    // that no revocation can ever invalidate, so issuance refuses instead.
    const authVersion = this._resolveAuthVersion(user);

    const accessPayloadBase = {
      sub: subject,
      iss: jwtConfig.issuer,
      aud: audienceClaim,
      user_id: user.id,
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      auth_version: authVersion,
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
      auth_version: authVersion,
      jti: this._generateJti()
    };

    const refreshPayload = await createTokenPayload(refreshPayloadBase, 'refresh', this.env);

    return {
      accessToken: await signToken(accessPayload, jwtConfig.secret),
      refreshToken: await signToken(refreshPayload, jwtConfig.secret),
      accessTokenPayload: accessPayload,
      refreshTokenPayload: refreshPayload,
      authVersion
    };
  }

  async validateRefreshToken(refreshToken, metadata = {}) {
    try {
      const jwtConfig = await this.getJwtConfig();
      const tokenSecurityConfig = await this.getTokenSecurityConfig();

      let payload;
      try {
        payload = await verifyToken(refreshToken, jwtConfig.secret);
      } catch (verifyError) {
        tokenService_log(`Refresh token verification failed: ${verifyError.name || 'Error'}`);
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
                reuse_ip, reuse_user_agent, consumed_at, rotation_grace_until
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
        const { race } = await this.classifyRotationLoss(record);

        if (race) {
          // Another request rotated this token moments ago. That is a normal
          // race between two honest callers, so it is retryable and is not
          // recorded as reuse.
          tokenService_log(`Refresh token ${record.jti} was rotated by a concurrent request`);
          return {
            success: false,
            error: 'REFRESH_ALREADY_ROTATED',
            reason: 'RECENT_ROTATION',
            statusCode: 409,
            payload,
            record
          };
        }

        const revokedAt = record.revoked_at ? Date.parse(record.revoked_at) : null;
        const graceSeconds = tokenSecurityConfig.refreshTokenReuseGraceSeconds || 0;
        const withinGrace = !record.consumed_at && revokedAt && (Date.now() - revokedAt) <= graceSeconds * 1000;

        // Reached only when the token was revoked outright. Within the grace
        // that still is not a race, so the client is told the token is stale
        // rather than invited to retry one that can never work.
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
          // A token that was rotated and came back is reuse. One that was
          // revoked outright is not, and reporting it as reuse would train
          // clients to treat a plain logout as a compromise.
          error: record.consumed_at ? 'REFRESH_TOKEN_REUSE' : 'REFRESH_TOKEN_REVOKED',
          reason: record.consumed_at ? 'ROTATED_TOKEN_REPLAYED' : 'TOKEN_REVOKED',
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
      error_log(`Error validating refresh token: ${error.name || 'Error'}: ${redactText(error.message)}`);
      // A dependency outage must not be reported as a generic 500: the caller
      // has to be able to tell "token is bad" from "we could not check".
      if (isServiceError(error) && statusForError(error) >= 500) {
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
        reason: 'VALIDATION_ERROR',
        statusCode: 500
      };
    }
  }

  async rotateRefreshToken({ record, user, metadata = {} }) {
    // Sign the successor first so the conditional consume can name it. Nothing
    // is returned to the caller until the transaction below commits, so a
    // prepared token can never be handed out over a failed write.
    const successor = await this._buildTokenPair(user, metadata);
    const tokenHash = await TokenService.hashToken(successor.refreshToken);
    const issuedAtIso = toIso(successor.refreshTokenPayload.iat);
    const expiresAtIso = toIso(successor.refreshTokenPayload.exp);
    const ipAddress = metadata?.ipAddress || null;
    const userAgent = metadata?.userAgent || null;
    const grace = await this._rotationGraceSeconds();
    const now = nowIso();
    const graceUntil = new Date(Date.now() + grace * 1000).toISOString();

    // One transaction. The successor insert is written as INSERT ... WHERE
    // EXISTS against the lineage marker this attempt just wrote, because a
    // conditional UPDATE that matches nothing is not an error: D1 still commits
    // the rest of the batch, so a plain INSERT here would leave an orphan
    // successor row behind for every racer that lost.
    const results = await this.dbService.batch([
      {
        query: `UPDATE refresh_tokens
                SET revoked = 1,
                    revoked_at = ?,
                    revocation_reason = 'ROTATED',
                    consumed_at = ?,
                    rotation_grace_until = ?,
                    replaced_by = ?,
                    updated_at = CURRENT_TIMESTAMP
                WHERE jti = ? AND revoked = 0`,
        params: [now, now, graceUntil, successor.refreshTokenPayload.jti, record.jti]
      },
      {
        query: `INSERT INTO refresh_tokens (
          user_id, token_hash, jti, issued_at, expires_at, auth_version,
          ip_address, user_agent, created_at, updated_at
        )
        SELECT ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        WHERE EXISTS (
          SELECT 1 FROM refresh_tokens
          WHERE jti = ? AND replaced_by = ? AND consumed_at IS NOT NULL
        )`,
        params: [
          user.id,
          tokenHash,
          successor.refreshTokenPayload.jti,
          issuedAtIso,
          expiresAtIso,
          successor.authVersion,
          ipAddress,
          userAgent,
          record.jti,
          successor.refreshTokenPayload.jti
        ]
      }
    ]);

    const consumed = Number(results?.[0]?.meta?.changes ?? 0);
    const created = Number(results?.[1]?.meta?.changes ?? 0);
    if (consumed !== 1 || created !== 1) {
      // The loser wrote no lineage marker, so the insert matched nothing. The
      // prepared pair is dropped here and is never returned to the caller.
      tokenService_log(`Refresh token ${record.jti} was already rotated; no successor created`);
      return { rotated: false, successor: null };
    }

    await this._enforceTokenQuota(user.id);
    tokenService_log(`Rotated refresh token for user ${user.id}`);
    return { rotated: true, successor, graceUntil };
  }

  /**
   * How long a losing racer may be told "someone else already rotated this".
   *
   * The window exists so two tabs refreshing at once get a retryable answer
   * instead of a logout. It is not permission to replay: past the window the
   * same token is treated as a reuse.
   * @returns {Promise<number>} Grace in seconds
   */
  async _rotationGraceSeconds() {
    const config = await this.getTokenSecurityConfig();
    const seconds = Number(config.refreshTokenReuseGraceSeconds);
    return Number.isFinite(seconds) && seconds > 0 ? seconds : 0;
  }

  /**
   * Revoke a refresh token.
   * Reports success only when the write is confirmed. `null` from the database
   * layer means the state is unknown, which is never reported as revoked.
   * @returns {Promise<{revoked: boolean, reason: string, changes: number}>}
   */
  /**
   * Decides whether a token that can no longer be used is a lost race or a replay.
   *
   * Both callers must agree, or the same event answers 409 on one path and 401
   * with a family revocation on the other, so the rule lives here only.
   *
   * The window applies to a consumed token and nothing else. A token revoked by
   * a logout or a password change is dead from the first moment, so calling
   * that a race would answer "retry" for a token that can never work again.
   * @param {Object} record - Refresh row, with the rotation markers
   * @returns {Promise<{race: boolean, graceUntil: string|null}>} Classification
   */
  async classifyRotationLoss(record) {
    if (!record?.consumed_at) {
      return { race: false, graceUntil: null };
    }

    const tokenSecurityConfig = await this.getTokenSecurityConfig();
    const graceSeconds = Number(tokenSecurityConfig.refreshTokenReuseGraceSeconds) || 0;
    const deadlineMs = record.rotation_grace_until
      ? Date.parse(record.rotation_grace_until)
      : Date.parse(record.revoked_at || '') + graceSeconds * 1000;

    const race = graceSeconds > 0 && Number.isFinite(deadlineMs) && Date.now() <= deadlineMs;

    return {
      race,
      graceUntil: Number.isFinite(deadlineMs) ? new Date(deadlineMs).toISOString() : null
    };
  }

  /**
   * Re-reads a refresh row authoritatively to classify a lost rotation race.
   *
   * The copy the caller holds was read before the winner committed, so it
   * cannot answer whether the grace window is still open.
   * @param {string} jti - Refresh token jti
   * @returns {Promise<Object|null>} Rotation markers, or null if the row is gone
   */
  getRefreshRotationState(jti) {
    return this.dbService.selectAuthoritative(
      `SELECT jti, user_id, revoked, consumed_at, rotation_grace_until, replaced_by
         FROM refresh_tokens WHERE jti = ?`,
      [jti],
      true
    );
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

      const result = await this.dbService.update(query, [now, reason, jti]);
      const changes = Number(result?.changes ?? 0);

      if (changes > 0) {
        tokenService_log(`Refresh token ${jti} revoked (${changes} row(s))`);
        return { revoked: true, reason: 'REVOKED', changes };
      }

      const existing = await this.dbService.select(
        'SELECT revoked, revocation_reason FROM refresh_tokens WHERE jti = ? LIMIT 1',
        [jti],
        true
      );

      if (existing && Number(existing.revoked) === 1) {
        return { revoked: true, reason: 'ALREADY_REVOKED', changes: 0 };
      }

      error_log(`Refresh token ${jti} was not found, revocation not applied`);
      return { revoked: false, reason: 'NOT_REVOKED', changes: 0 };
    } catch (error) {
      error_log(`Failed to revoke refresh token ${jti}: ${error.message}`);
      throw error;
    }
  }

  async revokeAllTokensForUser(userId, reason = 'ADMIN_REVOKE') {
    try {
      const now = nowIso();
      const result = await this.dbService.update(
        `UPDATE refresh_tokens
         SET revoked = 1,
             revoked_at = COALESCE(revoked_at, ?),
             revocation_reason = COALESCE(revocation_reason, ?),
             updated_at = CURRENT_TIMESTAMP
         WHERE user_id = ? AND revoked = 0`,
        [now, reason, userId]
      );
      const revoked = Number(result?.changes ?? 0);
      tokenService_log(`Revoked ${revoked} active refresh token(s) for user ${userId}`);
      return { revoked, reason: revoked > 0 ? 'REVOKED' : 'NOTHING_ACTIVE' };
    } catch (error) {
      error_log(`Failed to revoke all tokens for user ${userId}: ${error.message}`);
      throw error;
    }
  }

  async _persistRefreshToken({ userId, refreshToken, refreshTokenPayload, authVersion, metadata }) {
    const tokenHash = await TokenService.hashToken(refreshToken);
    const issuedAtIso = toIso(refreshTokenPayload.iat);
    const expiresAtIso = toIso(refreshTokenPayload.exp);
    const ipAddress = metadata?.ipAddress || null;
    const userAgent = metadata?.userAgent || null;

    const result = await this.dbService.insert(
      `INSERT INTO refresh_tokens (
        user_id, token_hash, jti, issued_at, expires_at, auth_version,
        ip_address, user_agent, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        userId,
        tokenHash,
        refreshTokenPayload.jti,
        issuedAtIso,
        expiresAtIso,
        authVersion,
        ipAddress,
        userAgent
      ]
    );

    if (!result || result.success !== true) {
      throw new Error('Refresh token could not be persisted');
    }
    return result;
  }

  async _markRefreshTokenRevoked(jti, reason, replacedByJti = null) {
    const now = nowIso();
    const result = await this.dbService.update(
      `UPDATE refresh_tokens
       SET revoked = 1,
           revoked_at = ?,
           revocation_reason = ?,
           replaced_by = ?,
           updated_at = CURRENT_TIMESTAMP
       WHERE jti = ?`,
      [now, reason, replacedByJti, jti]
    );
    return Number(result?.changes ?? 0) > 0;
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
      error_log(`Access token verification failed: ${error.name || 'Error'}`);
      return {
        success: false,
        error: 'ACCESS_TOKEN_INVALID',
        reason: 'TOKEN_SIGNATURE_INVALID',
        details: error.name || 'Error'
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
