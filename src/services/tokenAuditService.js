import { BaseService } from './baseService.js';
import { tokenAuditService_log, error_log } from '../utils/debug.js';

function serializeMetadata(metadata) {
  if (!metadata) {
    return null;
  }

  try {
    return JSON.stringify(metadata);
  } catch (error) {
    error_log(`Failed to serialize token audit metadata: ${error.message}`);
    return null;
  }
}

export class TokenAuditService extends BaseService {
  constructor(env) {
    super(env, 'TokenAuditService');
    tokenAuditService_log('TokenAuditService initialized');
  }

  async logTokenAction(action, userId, details = {}) {
    if (!action || !userId) {
      return false;
    }

    const {
      tokenJti,
      refreshJti,
      ipAddress,
      userAgent,
      success = true,
      errorMessage,
      metadata
    } = details;

    try {
      await this.dbService.insert(
        `INSERT INTO token_audit_logs (
          user_id, action, token_jti, refresh_jti,
          ip_address, user_agent, success, error_message, metadata, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)`,
        [
          userId,
          action,
          tokenJti || null,
          refreshJti || null,
          ipAddress || null,
          userAgent || null,
          success ? 1 : 0,
          errorMessage || null,
          serializeMetadata(metadata)
        ]
      );
      tokenAuditService_log(`Logged token action '${action}' for user ${userId}`);
      return true;
    } catch (error) {
      error_log(`Failed to log token action '${action}': ${error.message}`);
      return false;
    }
  }

  logSuspiciousActivity(action, userId, details = {}) {
    return this.logTokenAction(action, userId, {
      ...details,
      success: false
    });
  }

  async getAuditTrail(userId, limit = 50) {
    if (!userId) {
      return [];
    }

    try {
      const rows = await this.dbService.select(
        `SELECT id, action, token_jti, refresh_jti, ip_address, user_agent,
                success, error_message, metadata, created_at
         FROM token_audit_logs
         WHERE user_id = ?
         ORDER BY created_at DESC
         LIMIT ?`,
        [userId, limit]
      );
      return rows || [];
    } catch (error) {
      error_log(`Failed to fetch token audit trail for user ${userId}: ${error.message}`);
      return [];
    }
  }

  async cleanupOldLogs(retentionDays = 90, limit = 500) {
    const retentionWindow = `-${retentionDays} days`;

    try {
      const result = await this.dbService.delete(
        `DELETE FROM token_audit_logs
         WHERE created_at < datetime('now', ?)
         LIMIT ?`,
        [retentionWindow, limit]
      );

      const removed = result?.changes || 0;
      if (removed > 0) {
        tokenAuditService_log(`Cleaned up ${removed} token audit logs older than ${retentionDays} days`);
      }
      return removed;
    } catch (error) {
      error_log(`Failed to cleanup token audit logs: ${error.message}`);
      return 0;
    }
  }

  // --- Admin CRUD Methods ---

  async listLogs({ page = 1, limit = 20, search = '' }) {
    try {
      const offset = (page - 1) * limit;
      const searchPattern = search ? `%${search}%` : '%';

      const countResult = await this.dbService.select(
        `SELECT COUNT(tal.id) as total 
         FROM token_audit_logs tal
         LEFT JOIN users u ON tal.user_id = u.id
         WHERE tal.action LIKE ? OR tal.token_jti LIKE ? OR u.email LIKE ? OR tal.ip_address LIKE ?`,
        [searchPattern, searchPattern, searchPattern, searchPattern],
        true
      );
      const total = countResult?.total || 0;

      const items = await this.dbService.select(
        `SELECT tal.*, 
                u.email as user_email, 
                u.full_name as user_full_name
         FROM token_audit_logs tal
         LEFT JOIN users u ON tal.user_id = u.id
         WHERE tal.action LIKE ? OR tal.token_jti LIKE ? OR u.email LIKE ? OR tal.ip_address LIKE ?
         ORDER BY tal.created_at DESC
         LIMIT ? OFFSET ?`,
        [searchPattern, searchPattern, searchPattern, searchPattern, limit, offset]
      );

      return {
        items,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      error_log(`Failed to list token audit logs: ${error.message}`);
      throw error;
    }
  }

  async getLogDetails(id) {
    try {
      const log = await this.dbService.select(
        `SELECT tal.*, 
                u.email as user_email, 
                u.full_name as user_full_name,
                u.role as user_role
         FROM token_audit_logs tal
         LEFT JOIN users u ON tal.user_id = u.id
         WHERE tal.id = ?`,
        [id],
        true
      );
      return log || null;
    } catch (error) {
      error_log(`Failed to get token audit log ${id}: ${error.message}`);
      throw error;
    }
  }

  async updateLog(id, data) {
    if (!id || !data) return false;

    try {
      const { action, success, errorMessage, metadata } = data;
      
      const setClauses = [];
      const params = [];
      
      if (action !== undefined) {
        setClauses.push('action = ?');
        params.push(action);
      }
      if (success !== undefined) {
        setClauses.push('success = ?');
        params.push(success ? 1 : 0);
      }
      if (errorMessage !== undefined) {
        setClauses.push('error_message = ?');
        params.push(errorMessage);
      }
      if (metadata !== undefined) {
        setClauses.push('metadata = ?');
        params.push(serializeMetadata(metadata));
      }

      if (setClauses.length === 0) return true; // Nothing to update
      
      params.push(id);
      
      const result = await this.dbService.update(
        `UPDATE token_audit_logs 
         SET ${setClauses.join(', ')}
         WHERE id = ?`,
        params
      );
      return result?.changes > 0;
    } catch (error) {
      error_log(`Failed to update token audit log ${id}: ${error.message}`);
      throw error;
    }
  }

  async deleteLog(id) {
    try {
      const result = await this.dbService.delete(
        'DELETE FROM token_audit_logs WHERE id = ?',
        [id]
      );
      return result?.changes > 0;
    } catch (error) {
      error_log(`Failed to delete token audit log ${id}: ${error.message}`);
      throw error;
    }
  }

  async bulkDeleteLogs(ids) {
    if (!ids || ids.length === 0) return 0;

    try {
      const placeholders = ids.map(() => '?').join(',');
      const result = await this.dbService.delete(
        `DELETE FROM token_audit_logs WHERE id IN (${placeholders})`,
        ids
      );
      return result?.changes || 0;
    } catch (error) {
      error_log(`Failed to bulk delete token audit logs: ${error.message}`);
      throw error;
    }
  }
}
