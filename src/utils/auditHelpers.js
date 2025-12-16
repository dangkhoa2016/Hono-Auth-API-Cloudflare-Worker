import { auditService_log } from '../utils/debug.js';

/**
 * Shared utilities for audit services
 * Contains common query building and filtering logic
 */

/**
 * Build WHERE clause for audit queries with role-based filtering
 * @param {Object} filters - Filter parameters
 * @param {Array} params - Existing parameters array
 * @returns {Object} { whereClause, params }
 */
export function buildAuditWhereClause(filters = {}, params = []) {
  const conditions = [];
  const newParams = [...params];

  if (filters.action) {
    conditions.push('action = ?');
    newParams.push(filters.action);
  }

  if (filters.actor_id) {
    conditions.push('actor_id = ?');
    newParams.push(filters.actor_id);
  }

  if (filters.target_type) {
    conditions.push('target_type = ?');
    newParams.push(filters.target_type);
  }

  if (filters.start_date) {
    conditions.push('timestamp >= ?');
    newParams.push(filters.start_date);
  }

  if (filters.end_date) {
    conditions.push('timestamp <= ?');
    newParams.push(filters.end_date);
  }

  if (filters.status) {
    conditions.push('status = ?');
    newParams.push(filters.status);
  }

  if (filters.ip_address) {
    conditions.push('ip_address = ?');
    newParams.push(filters.ip_address);
  }

  // Role-based filtering
  if (filters.exclude_super_admin) {
    conditions.push('actor_role != ?');
    newParams.push('super_admin');
  }

  if (filters.exclude_super_admin_actions) {
    conditions.push('(target_type != ? OR (target_type = ? AND target_identifier NOT LIKE ?))');
    newParams.push('USER', 'USER', '%super_admin%');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  auditService_log(`Built WHERE clause: ${whereClause}, params: ${JSON.stringify(newParams)}`);

  return { whereClause, params: newParams };
}

/**
 * Parse JSON fields safely for audit logs
 * @param {string} jsonString - JSON string to parse
 * @returns {Object} Parsed object or empty object
 */
export function safeParseAuditJSON(jsonString) {
  try {
    return jsonString ? JSON.parse(jsonString) : {};
  } catch {
    return {};
  }
}

/**
 * Generate request ID for audit logging
 * @returns {string} Request ID
 */
export function generateAuditRequestId() {
  const cryptoApi = typeof globalThis !== 'undefined' ? globalThis.crypto : null;
  const hasRandomUUID = cryptoApi && typeof cryptoApi.randomUUID === 'function';
  const id = hasRandomUUID
    ? cryptoApi.randomUUID()
    : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

  return `req_${id}`;
}

/**
 * Get client IP from Hono context
 * @param {Object} context - Hono context
 * @returns {string} Client IP
 */
export function getClientIP(context) {
  return context.req.header('CF-Connecting-IP') ||
         context.req.header('X-Forwarded-For') ||
         context.req.header('X-Real-IP') ||
         'unknown';
}

/**
 * Sanitize audit details based on level
 * @param {Object} details - Details to sanitize
 * @param {string} level - Sanitization level
 * @returns {Object} Sanitized details
 */
export function sanitizeAuditDetails(details, level = 'standard') {
  if (!details || typeof details !== 'object') {
    return details;
  }

  const sanitized = { ...details };
  let sensitiveFields = [];

  switch (level) {
  case 'minimal':
    sensitiveFields = ['password', 'secret'];
    break;
  case 'standard':
    sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
    break;
  case 'strict':
    sensitiveFields = ['password', 'token', 'secret', 'key', 'credential', 'email', 'phone', 'ssn', 'id'];
    break;
  default:
    sensitiveFields = ['password', 'token', 'secret', 'key', 'credential'];
  }

  Object.keys(sanitized).forEach(key => {
    const lowerKey = key.toLowerCase();
    if (sensitiveFields.some(field => lowerKey.includes(field))) {
      sanitized[key] = level === 'strict' ? '[REDACTED]' : '***MASKED***';
    }
  });

  return sanitized;
}
