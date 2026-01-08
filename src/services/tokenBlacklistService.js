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

  /**
   * Get paginated list of blacklisted tokens with user details and usage stats
   * @param {Object} params - Query parameters
   * @param {number} params.page - Page number
   * @param {number} params.limit - Items per page
   * @param {string} [params.search] - Search term (JTI or User Email)
   * @returns {Promise<Object>} Paginated results
   */
  async listTokens({ page = 1, limit = 20, search = '' }) {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = search ? `%${search}%` : '%';

      // Calculate total for pagination
      const countResult = await this.dbService.select(
        `SELECT COUNT(tb.id) as total 
         FROM token_blacklist tb
         LEFT JOIN users u ON tb.user_id = u.id
         WHERE tb.jti LIKE ? OR u.email LIKE ? OR tb.reason LIKE ?`,
        [searchPattern, searchPattern, searchPattern],
        true
      );
      const total = countResult?.total || 0;

      // Get Data with User Info and Usage Count
      // Note: usage_count is strictly based on exact JTI match in token_audit_logs
      const items = await this.dbService.select(
        `SELECT tb.*, 
                u.email as user_email, 
                u.full_name as user_full_name,
                (SELECT COUNT(*) FROM token_audit_logs tal WHERE tal.token_jti = tb.jti) as usage_count
         FROM token_blacklist tb
         LEFT JOIN users u ON tb.user_id = u.id
         WHERE tb.jti LIKE ? OR u.email LIKE ? OR tb.reason LIKE ?
         ORDER BY tb.created_at DESC
         LIMIT ? OFFSET ?`,
        [searchPattern, searchPattern, searchPattern, limit, offset]
      );

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      error_log(`Failed to list blacklisted tokens: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get detailed info of a blacklisted token
   * @param {number} id - Blacklist Entry ID
   * @returns {Promise<Object|null>} Token details
   */
  async getTokenDetails(id) {
    try {
      const token = await this.dbService.select(
        `SELECT tb.*, 
                u.email as user_email, 
                u.full_name as user_full_name,
                u.role as user_role,
                (SELECT COUNT(*) FROM token_audit_logs tal WHERE tal.token_jti = tb.jti) as usage_count
         FROM token_blacklist tb
         LEFT JOIN users u ON tb.user_id = u.id
         WHERE tb.id = ?`,
        [id],
        true
      );
      return token || null;
    } catch (error) {
      error_log(`Failed to get token details ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a blacklisted token entry
   * @param {number} id - Blacklist Entry ID
   * @returns {Promise<boolean>} Success status
   */
  async deleteToken(id) {
    try {
      const result = await this.dbService.delete(
        'DELETE FROM token_blacklist WHERE id = ?',
        [id]
      );
      return result?.changes > 0;
    } catch (error) {
      error_log(`Failed to delete token ${id}: ${error.message}`);
      throw error;
    }
  }

  /**
   * Bulk delete blacklisted token entries
   * @param {number[]} ids - Array of Blacklist Entry IDs
   * @returns {Promise<number>} Number of deleted entries
   */
  async bulkDeleteTokens(ids) {
    if (!ids || ids.length === 0) {return 0;}

    try {
      // D1 specific bulk delete syntax isn't always efficient with IN clause parameter binding issues
      // But we'll use standard parameterized IN clause builder
      const placeholders = ids.map(() => '?').join(',');
      const result = await this.dbService.delete(
        `DELETE FROM token_blacklist WHERE id IN (${placeholders})`,
        ids
      );
      return result?.changes || 0;
    } catch (error) {
      error_log(`Failed to bulk delete tokens: ${error.message}`);
      throw error;
    }
  }
}
