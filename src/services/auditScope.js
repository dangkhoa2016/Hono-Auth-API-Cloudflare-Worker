import { ROLES } from '../constants/roles.js';
import { buildAuditWhereClause } from '../utils/auditHelpers.js';

/**
 * Server-side audit read scope.
 *
 * The scope is derived from the authenticated principal only. A client may
 * narrow its own result set, but it can never widen the policy: `canReadAll` and
 * `exclude_super_admin` are owned by the server.
 */

const FILTER_ALIASES = {
  actorRole: 'actor_role',
  userId: 'actor_id',
  actorId: 'actor_id',
  startDate: 'start_date',
  endDate: 'end_date',
  targetType: 'target_type',
  targetId: 'target_id',
  ipAddress: 'ip_address',
  sortBy: 'sort_by',
  sortOrder: 'sort_order',
  search: 'query',
  q: 'query'
};

const ALLOWED_FILTERS = [
  'query',
  'action',
  'actor_id',
  'actor_role',
  'target_type',
  'target_id',
  'start_date',
  'end_date',
  'status',
  'ip_address',
  'sort_by',
  'sort_order',
  'exclude_super_admin_actions'
];

const CLIENT_CONTROLLED_POLICY_KEYS = [
  'exclude_super_admin',
  'canReadAll',
  'pinToOwnActor',
  'actorId',
  'role',
  'scope'
];

/**
 * Columns of `audit_logs` (migrations/0003_add_audit_logs.sql) that may be used
 * to order a result set. The table has no `created_at`; the time column is
 * `timestamp`. Only these five are orderable, so `sortBy` can never carry an
 * arbitrary SQL expression into ORDER BY.
 */
export const SORTABLE_AUDIT_COLUMNS = Object.freeze([
  'timestamp',
  'id',
  'action',
  'actor_role',
  'status'
]);

/**
 * Sort aliases kept for clients that still send the old name. `created_at`
 * existed only as a schema default and never as a column, which is why it
 * produced "no such column". Mapped here, in one place, to the real column.
 */
export const SORT_ALIASES = Object.freeze({
  created_at: 'timestamp',
  createdAt: 'timestamp',
  time: 'timestamp',
  actor_role: 'actor_role',
  role: 'actor_role'
});

export const DEFAULT_AUDIT_SORT = Object.freeze({ field: 'timestamp', direction: 'DESC' });
export const DEFAULT_AUDIT_PAGINATION = Object.freeze({ page: 1, limit: 50 });
export const MAX_AUDIT_LIMIT = 100;

export function createAuditScope(principal = {}) {
  const role = principal.role || ROLES.USER;
  const actorId = principal.id ?? principal.user_id ?? null;
  const isSuperAdmin = role === ROLES.SUPER_ADMIN;
  const isAdmin = role === ROLES.ADMIN || isSuperAdmin;

  return Object.freeze({
    actorId,
    role,
    canReadAll: isSuperAdmin,
    isAdmin,
    excludeSuperAdmin: !isSuperAdmin,
    pinToOwnActor: !isAdmin,
    cacheKey: `role:${role}|actor:${actorId ?? 'none'}`
  });
}

function normalizeSortOrder(value) {
  return String(value || 'DESC').toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
}

/**
 * Resolve the ORDER BY field to a real `audit_logs` column.
 * Unknown values fall back to the canonical default instead of reaching SQL.
 * @param {*} value - Requested sort field, possibly an alias
 * @returns {string} A member of SORTABLE_AUDIT_COLUMNS
 */
export function normalizeAuditSortField(value) {
  const requested = String(value ?? '').trim();
  if (!requested) {
    return DEFAULT_AUDIT_SORT.field;
  }
  const candidate = SORT_ALIASES[requested] || requested;
  return SORTABLE_AUDIT_COLUMNS.includes(candidate) ? candidate : DEFAULT_AUDIT_SORT.field;
}

/**
 * Resolve ORDER BY direction.
 * @param {*} value - Requested direction
 * @returns {'ASC'|'DESC'} Normalized direction
 */
export function normalizeAuditSortDirection(value) {
  return normalizeSortOrder(value);
}

/**
 * Resolve pagination into a positive page and a bounded limit.
 * Previously `page`/`limit` were not in the filter allowlist, so the normalizer
 * dropped them and the service silently fell back to page 1 with an unbounded
 * client-supplied limit.
 * @param {Object} input - Request carrying page/limit
 * @param {Object} [options] - Bounds
 * @param {number} [options.maxLimit] - Upper bound for limit
 * @returns {{page: number, limit: number}} Normalized pagination
 */
export function normalizeAuditPagination(input = {}, options = {}) {
  const maxLimit = Number.isInteger(options.maxLimit) && options.maxLimit > 0
    ? options.maxLimit
    : MAX_AUDIT_LIMIT;

  const rawPage = Number(input?.page);
  const page = Number.isInteger(rawPage) && rawPage > 0 ? rawPage : DEFAULT_AUDIT_PAGINATION.page;

  const rawLimit = Number(input?.limit);
  let limit = Number.isInteger(rawLimit) && rawLimit > 0 ? rawLimit : DEFAULT_AUDIT_PAGINATION.limit;
  if (limit > maxLimit) {
    limit = maxLimit;
  }

  return { page, limit };
}

/**
 * Maps camelCase client filters onto service column names exactly once and
 * re-applies the server-owned policy flags.
 */
export function normalizeAuditFilters(input = {}, scope = createAuditScope({ role: ROLES.USER })) {
  const source = { ...(input || {}) };
  for (const key of CLIENT_CONTROLLED_POLICY_KEYS) {
    delete source[key];
  }

  const mapped = {};
  for (const [key, value] of Object.entries(source)) {
    const target = FILTER_ALIASES[key] || key;
    if (!ALLOWED_FILTERS.includes(target)) {
      continue;
    }
    if (value === undefined || value === null || value === '') {
      continue;
    }
    mapped[target] = value;
  }

  mapped.exclude_super_admin = scope.excludeSuperAdmin;
  mapped.exclude_super_admin_actions = scope.excludeSuperAdmin;

  if (scope.pinToOwnActor) {
    mapped.actor_id = scope.actorId;
  }

  // Sort is resolved through the allowlist here, so `sort_by` reaching SQL is
  // always a real `audit_logs` column.
  if (mapped.sort_by) {
    mapped.sort_by = normalizeAuditSortField(mapped.sort_by);
  }
  mapped.sort_order = normalizeAuditSortDirection(mapped.sort_order);

  return mapped;
}

/**
 * Split a request into the three parts the service actually needs.
 * `filters` feeds the WHERE clause, `pagination` feeds LIMIT/OFFSET and `sort`
 * feeds ORDER BY. Keeping them separate is what stops pagination from being
 * dropped by the filter allowlist.
 * @param {Object} input - Raw request filters
 * @param {Object} scope - Server-owned scope
 * @param {Object} [options] - `{ maxLimit }` bound for pagination
 * @returns {{filters: Object, pagination: {page: number, limit: number}, sort: {field: string, direction: string}}}
 */
export function normalizeAuditRequest(input = {}, scope, options = {}) {
  const filters = normalizeAuditFilters(input, scope);
  // Sort is a presentation concern, not a predicate. Keeping `sort_by` /
  // `sort_order` inside the filter set would put them in the cache key and in
  // every WHERE builder downstream, where they can only ever be dead weight.
  const sort = {
    field: normalizeAuditSortField(filters.sort_by),
    direction: normalizeAuditSortDirection(filters.sort_order)
  };
  delete filters.sort_by;
  delete filters.sort_order;
  return {
    filters,
    pagination: normalizeAuditPagination(input, options),
    sort
  };
}

/**
 * Cache key fragment covering everything that can change a scoped result:
 * the scope, every normalized filter, the page/limit window and the sort.
 * A key that omits pagination serves page 1 to a request for page 2.
 * @param {Object} scope - Server-owned scope
 * @param {Object} request - Output of `normalizeAuditRequest`
 * @returns {string} Stable cache key
 */
export function auditResultCacheKey(scope, request) {
  const { filters = {}, pagination = {}, sort = {} } = request || {};
  const stableFilters = Object.keys(filters).sort().reduce((acc, key) => {
    acc[key] = filters[key];
    return acc;
  }, {});
  return [
    scopeCacheKey(scope),
    `page=${pagination.page}`,
    `limit=${pagination.limit}`,
    `sort=${sort.field}:${sort.direction}`,
    `filters=${JSON.stringify(stableFilters)}`
  ].join('|');
}

/**
 * Builds the WHERE clause for a scoped read. The role restriction is always
 * applied, never derived from request input.
 */
export function buildScopedWhere(filters = {}, scope = createAuditScope({ role: ROLES.USER })) {
  const normalized = normalizeAuditFilters(filters, scope);
  const { whereClause, params } = buildAuditWhereClause(normalized);
  return { whereClause, params, filters: normalized };
}

/**
 * Accepts either an already-built scope or a raw principal. When no principal
 * is supplied the scope stays restricted to non-super_admin rows, so an
 * internal caller can never widen the result set by omission.
 */
export function resolveAuditScope(input) {
  if (input && typeof input === 'object' && typeof input.cacheKey === 'string' && 'canReadAll' in input) {
    return input;
  }
  if (input && typeof input === 'object' && (input.role || input.id || input.user_id)) {
    return createAuditScope(input);
  }
  return createAuditScope({ role: ROLES.ADMIN });
}

/**
 * Cache key fragment for a scoped read so results warmed by a super_admin are
 * never served to an admin (or the reverse).
 */
export function scopeCacheKey(scope) {
  return scope?.cacheKey || 'role:unknown|actor:none';
}
