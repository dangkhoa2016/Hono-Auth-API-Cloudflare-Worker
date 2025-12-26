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
}
