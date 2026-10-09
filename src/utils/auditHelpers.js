import { auditService_log } from '../utils/debug.js';
import { redactSensitiveData } from './sensitiveData.js';

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

  if (filters.actor_role) {
    conditions.push('actor_role = ?');
    newParams.push(filters.actor_role);
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

  // Role-based filtering.
  //
  // NULL policy: a row with no actor_role is a system event, not a super_admin
  // event, so it stays visible. In SQL `NULL != 'super_admin'` evaluates to NULL
  // (not true) and would silently drop every system event from an admin's view,
  // which is how the audit trail loses exactly the events nobody expected to
  // lose. COALESCE makes "unknown role" compare as "not super_admin".
  if (filters.exclude_super_admin) {
    conditions.push('COALESCE(actor_role, \'\') != ?');
    newParams.push('super_admin');
  }

  // Same NULL trap here: a row with no target_type/target_identifier is not a
  // request against a super_admin user, so it must stay visible. Only an actual
  // USER target whose identifier names a super_admin is hidden.
  if (filters.exclude_super_admin_actions) {
    conditions.push('(IFNULL(target_type, \'\') != ? OR IFNULL(target_identifier, \'\') NOT LIKE ?)');
    newParams.push('USER', '%super_admin%');
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  auditService_log(`Built WHERE clause: ${whereClause} (${newParams.length} bound parameters omitted)`);

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

  const marker = level === 'strict' ? '[REDACTED]' : '***MASKED***';
  const base = redactSensitiveData(details, {
    maxDepth: 8,
    maxKeys: 300,
    maxString: 2048
  });

  const applyStrictKeys = (node) => {
    if (Array.isArray(node)) {
      return node.map(applyStrictKeys);
    }
    if (!node || typeof node !== 'object') {
      return node;
    }
    const out = {};
    for (const [key, value] of Object.entries(node)) {
      if (sensitiveFields.some((field) => key.toLowerCase().includes(field))) {
        out[key] = value === null || value === undefined || value === '' ? value : marker;
        continue;
      }
      out[key] = applyStrictKeys(value);
    }
    return out;
  };

  return applyStrictKeys(base);
}
