// src/utils/auditHelper.js
// Helper functions for manual audit logging
// Provides convenient methods for different types of audit events

import { createAuditLogService } from './serviceFactory.js';
import { ROLES } from '../constants/roles.js';

/**
 * AuditHelper - Utility class for manual audit logging
 * Provides convenient methods for different audit scenarios
*/
export class AuditHelper {
  /**
   * Log user-related actions (create, update, delete, role change)
   * @param {Object} context - Hono context object
   * @param {string} action - Action type (e.g., 'ADMIN_USER_DELETE')
   * @param {Object} targetUser - Target user object
   * @param {Object} details - Additional details about the action
   */
  static async logUserAction(context, action, targetUser, details = {}) {
    const auditLogService = createAuditLogService(context.env);
    const currentUser = context.get('user');

    return await auditLogService.log({
      action,
      actor_id: currentUser.user_id,
      actor_role: currentUser.role,
      actor_email: currentUser.email,
      target_type: 'USER',
      target_id: targetUser.id?.toString(),
      target_identifier: targetUser.email,
      details: {
        ...details,
        target_user_id: targetUser.id,
        target_user_role: targetUser.role,
        action_timestamp: new Date().toISOString()
      }
    }, context);
  }

  /**
   * Log system-level actions (configuration changes, maintenance, etc.)
   * @param {Object} context - Hono context object
   * @param {string} action - Action type (e.g., 'SYSTEM_MAINTENANCE')
   * @param {Object} details - Additional details about the action
   */
  static async logSystemAction(context, action, details = {}) {
    const auditLogService = createAuditLogService(context.env);
    const currentUser = context.get('user');

    return await auditLogService.log({
      action,
      actor_id: currentUser?.user_id || null,
      actor_role: currentUser?.role || 'SYSTEM',
      actor_email: currentUser?.email || 'system@internal',
      target_type: 'SYSTEM',
      target_id: 'system',
      target_identifier: 'System Operation',
      details: {
        ...details,
        operation_type: 'system_action',
        action_timestamp: new Date().toISOString()
      }
    }, context);
  }

  /**
   * Log KV configuration actions (create, update, delete KV configs)
   * @param {Object} context - Hono context object
   * @param {string} action - Action type (e.g., 'KV_CONFIG_UPDATE')
   * @param {string} configKey - KV configuration key
   * @param {Object} details - Additional details about the action
   */
  static async logKvConfigAction(context, action, configKey, details = {}) {
    const auditLogService = createAuditLogService(context.env);
    const currentUser = context.get('user');

    return await auditLogService.log({
      action,
      actor_id: currentUser.user_id,
      actor_role: currentUser.role,
      actor_email: currentUser.email,
      target_type: 'KV_CONFIG',
      target_id: configKey,
      target_identifier: `KV Config: ${configKey}`,
      details: {
        ...details,
        config_key: configKey,
        operation_type: 'kv_config_action',
        action_timestamp: new Date().toISOString()
      }
    }, context);
  }

  /**
   * Log security events (suspicious activity, rate limiting, etc.)
   * @param {Object} context - Hono context object
   * @param {string} action - Action type (e.g., 'SECURITY_VIOLATION')
   * @param {Object} details - Additional details about the security event
   */
  static async logSecurityEvent(context, action, details = {}) {
    const auditLogService = createAuditLogService(context.env);

    return await auditLogService.log({
      action,
      actor_id: null,
      actor_role: 'ANONYMOUS',
      actor_email: null,
      target_type: 'SECURITY',
      target_id: 'security_event',
      target_identifier: action,
      details: {
        ...details,
        security_level: details.security_level || 'medium',
        operation_type: 'security_event',
        action_timestamp: new Date().toISOString()
      },
      status: 'SECURITY_EVENT'
    }, context);
  }

  /**
   * Log authentication events (login, logout, token refresh)
   * @param {Object} context - Hono context object
   * @param {string} action - Action type (e.g., 'LOGIN_SUCCESS')
   * @param {string} email - User email
   * @param {Object} details - Additional details about the auth event
   */
  static async logAuthEvent(context, action, email, details = {}) {
    const auditLogService = createAuditLogService(context.env);

    return await auditLogService.log({
      action,
      actor_id: details.user_id || null,
      actor_role: details.actor_role || null,
      actor_email: email,
      target_type: 'AUTH',
      target_id: 'authentication',
      target_identifier: email,
      details: {
        ...details,
        auth_method: details.auth_method || 'password',
        operation_type: 'auth_event',
        action_timestamp: new Date().toISOString()
      },
      status: details.success ? 'SUCCESS' : 'FAILED'
    }, context);
  }

  /**
   * Log audit access events (viewing audit logs, searching, exporting)
   * @param {Object} context - Hono context object
   * @param {string} action - Action type (e.g., 'AUDIT_LOG_ACCESS')
   * @param {Object} details - Additional details about the audit access
   */
  static async logAuditAccess(context, action, details = {}) {
    const auditLogService = createAuditLogService(context.env);
    const currentUser = context.get('user');

    return await auditLogService.log({
      action,
      actor_id: currentUser.user_id,
      actor_role: currentUser.role,
      actor_email: currentUser.email,
      target_type: 'AUDIT',
      target_id: 'audit_access',
      target_identifier: 'Audit Log Access',
      details: {
        ...details,
        access_level: currentUser.role === ROLES.SUPER_ADMIN ? 'full' : 'restricted',
        operation_type: 'audit_access',
        action_timestamp: new Date().toISOString()
      }
    }, context);
  }

  /**
   * Log batch operations (multiple actions performed together)
   * @param {Object} context - Hono context object
   * @param {string} action - Action type (e.g., 'BATCH_USER_UPDATE')
   * @param {Array} operations - Array of operations performed
   * @param {Object} details - Additional details about the batch operation
   */
  static async logBatchOperation(context, action, operations, details = {}) {
    const auditLogService = createAuditLogService(context.env);
    const currentUser = context.get('user');

    return await auditLogService.log({
      action,
      actor_id: currentUser.user_id,
      actor_role: currentUser.role,
      actor_email: currentUser.email,
      target_type: 'BATCH',
      target_id: `batch_${Date.now()}`,
      target_identifier: `Batch Operation: ${action}`,
      details: {
        ...details,
        operations_count: operations.length,
        operations_summary: operations.map(op => ({
          type: op.type,
          target: op.target,
          status: op.status
        })),
        operation_type: 'batch_operation',
        action_timestamp: new Date().toISOString()
      }
    }, context);
  }

  /**
   * Log error events (system errors, validation failures, etc.)
   * @param {Object} context - Hono context object
   * @param {string} action - Action type (e.g., 'SYSTEM_ERROR')
   * @param {Error} error - Error object
   * @param {Object} details - Additional details about the error
   */
  static async logErrorEvent(context, action, error, details = {}) {
    const auditLogService = createAuditLogService(context.env);
    const currentUser = context.get('user');

    return await auditLogService.log({
      action,
      actor_id: currentUser?.user_id || null,
      actor_role: currentUser?.role || 'SYSTEM',
      actor_email: currentUser?.email || null,
      target_type: 'ERROR',
      target_id: 'error_event',
      target_identifier: error.name || 'Unknown Error',
      details: {
        ...details,
        error_name: error.name,
        error_stack: error.stack,
        operation_type: 'error_event',
        action_timestamp: new Date().toISOString()
      },
      status: 'ERROR',
      error_message: error.message
    }, context);
  }
}
