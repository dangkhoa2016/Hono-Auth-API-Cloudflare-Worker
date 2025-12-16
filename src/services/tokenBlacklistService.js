import { BaseService } from './baseService.js';
import { tokenBlacklistService_log, error_log } from '../utils/debug.js';

function toIsoDate(value) {
  if (!value) {
    return null;
  }

  if (typeof value === 'number') {
    return new Date(value).toISOString();
  }

  const date = value instanceof Date ? value : new Date(value);
  return date.toISOString();
}

export class TokenBlacklistService extends BaseService {
  constructor(env) {
    super(env, 'TokenBlacklistService');
    tokenBlacklistService_log('TokenBlacklistService initialized');
  }

  /**
   * Add an access token JTI to blacklist
   * @param {Object} params
   * @param {string} params.jti - Access token JTI
   * @param {number|string|Date} params.expiresAt - Expiry datetime (ms epoch or Date or ISO)
   * @param {number} params.userId - User ID
   * @param {string} [params.reason] - Reason for revocation
   */
  async addToBlacklist({ jti, expiresAt, userId, reason = 'TOKEN_REVOKED' }) {
    if (!jti || !expiresAt || !userId) {
      throw new Error('Missing required parameters for blacklist');
    }

    const expiresIso = toIsoDate(expiresAt);

    try {
      await this.dbService.insert(
        `INSERT INTO token_blacklist (jti, user_id, expires_at, reason, blacklisted_at, created_at, updated_at)
         VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         ON CONFLICT(jti) DO UPDATE SET
           user_id = excluded.user_id,
           expires_at = excluded.expires_at,
           reason = excluded.reason,
           updated_at = CURRENT_TIMESTAMP`,
        [jti, userId, expiresIso, reason]
      );
      tokenBlacklistService_log(`Blacklisted token jti=${jti} until ${expiresIso}`);
      return true;
    } catch (error) {
      error_log(`Failed to blacklist token ${jti}: ${error.message}`);
      return false;
    }
  }

  /**
   * Check if a JTI is blacklisted and still valid
   * @param {string} jti - Token JTI
   * @returns {Promise<boolean>} True if blacklisted
   */
  async isBlacklisted(jti) {
    if (!jti) {
      return false;
    }

    try {
      const record = await this.dbService.select(
        `SELECT jti FROM token_blacklist
         WHERE jti = ? AND expires_at > CURRENT_TIMESTAMP
         LIMIT 1`,
        [jti],
        true
      );
      return Boolean(record);
    } catch (error) {
      error_log(`Failed to check blacklist for ${jti}: ${error.message}`);
      return false;
    }
  }

  /**
   * Remove expired blacklist entries
   * @param {number} limit - Max rows to delete per run
   * @returns {Promise<number>} Deleted rows count
   */
  async cleanupExpired(limit = 200) {
    try {
      const result = await this.dbService.delete(
        `DELETE FROM token_blacklist
         WHERE expires_at <= CURRENT_TIMESTAMP
         LIMIT ?`,
        [limit]
      );
      const removed = result?.changes || 0;
      if (removed > 0) {
        tokenBlacklistService_log(`Cleaned up ${removed} expired blacklist entries`);
      }
      return removed;
    } catch (error) {
      error_log(`Failed to cleanup blacklist: ${error.message}`);
      return 0;
    }
  }
}
