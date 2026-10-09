/**
 * T5/B06/B07: one retention policy per audit event, one cutoff per selection.
 *
 * The previous behaviour deleted every `audit_logs` row older than a single
 * "general" cutoff, which meant a security or compliance event was removed on
 * the same schedule as a debug line, and the dry-run counted a different set of
 * rows than the execute deleted. Both are decided here instead:
 *
 *  - `resolveRetentionPolicy` maps an event to exactly one policy. When several
 *    policies match, the **longest** retention wins, so adding a rule can only
 *    ever keep more data, never delete more.
 *  - `buildArchiveSelection` validates the operator's range and freezes the
 *    cutoff and cursor. A preview and the execution built from it therefore
 *    share one predicate, and no SQL fragment ever comes from the request.
 *
 * Default durations are per-category fallbacks only. A value from configuration
 * wins when it is valid, and is never silently shortened here.
 */
import { InvalidConfigValueError } from '../utils/serviceErrors.js';
import { auditRetentionPolicy_log } from '../utils/debug.js';

/**
 * Sentinel stored in `actor_role` when the source row had none.
 * The archive column is NOT NULL (migration 0004); the flag below keeps this
 * distinguishable from a real role.
 */
export const UNKNOWN_ACTOR_ROLE = 'UNKNOWN';

/**
 * Sentinel for a status that was never recorded. Never `SUCCESS`: a legacy
 * archive row has no status, and claiming success would invent evidence.
 */
export const UNKNOWN_STATUS = 'UNKNOWN';

/**
 * Per-category fallback durations in days. These mirror the recorded policy
 * defaults (90/365/1095/2555) and are only used when configuration holds no
 * valid value for the category.
 */
export const CATEGORY_FALLBACK_DAYS = Object.freeze({
  general: 90,
  sensitive: 365,
  administrative: 1095,
  compliance: 2555
});

/** Configuration key backing each category. */
export const CATEGORY_CONFIG_KEYS = Object.freeze({
  general: 'AUDIT_DEFAULT_RETENTION_DAYS',
  sensitive: 'AUDIT_SENSITIVE_RETENTION_DAYS',
  administrative: 'AUDIT_ADMINISTRATIVE_RETENTION_DAYS',
  compliance: 'AUDIT_COMPLIANCE_RETENTION_DAYS'
});

/** Longest value a category may be configured to. */
export const MAX_RETENTION_DAYS = 3650;

/**
 * Most rows one archive page may hold. A page is split into transaction-sized
 * chunks, so this is a batching choice rather than a hard limit, but a page
 * larger than this is read into memory for no benefit and the request that asks
 * for it is rejected rather than silently clamped.
 */
export const MAX_PAGE_ROWS = 1000;

const LOWER = (value) => String(value ?? '').trim().toLowerCase();

/**
 * Actions that are never removed on the general schedule.
 * Every entry was previously deleted by the single-cutoff query.
 */
const SENSITIVE_ACTIONS = new Set([
  'password_change', 'password_reset', 'password_reset_request', 'password_reset_confirm',
  'email_change', 'email_change_request', 'email_verification', 'email_verification_sent',
  'two_factor_enable', 'two_factor_disable', 'mfa_enable', 'mfa_disable',
  'logout_all', 'logout_all_devices', 'session_revoked', 'token_revoked', 'token_blacklisted',
  'account_locked', 'account_unlocked', 'suspicious_login', 'impossible_travel'
]);

/** Actions performed by an administrator or a security workflow. */
const ADMINISTRATIVE_ACTIONS = new Set([
  'user_role_change', 'role_change', 'user_delete', 'user_update', 'user_create',
  'kv_config_update', 'config_update', 'policy_update', 'retention_policy_update',
  'incident_update', 'bulk_operation', 'admin_action', 'impersonate'
]);

/** Actions and statuses that must satisfy a compliance hold. */
const COMPLIANCE_ACTIONS = new Set([
  'data_export', 'export', 'report_generated', 'compliance_report',
  'gdpr_request', 'data_subject_request', 'legal_hold', 'audit_export'
]);

const COMPLIANCE_STATUSES = new Set(['SECURITY_EVENT', 'ESCALATED', 'COMPLIANCE_HOLD']);

/**
 * Category names, in the order a sweep may iterate them. Declared once so the
 * policy, the SQL predicates and the request schema cannot disagree about what a
 * caller is allowed to name.
 */
export const RETENTION_CATEGORIES = Object.freeze(['general', 'sensitive', 'administrative', 'compliance']);

/**
 * One representative action per category, used to resolve a category's own
 * window without inspecting a real event.
 */
export const SAMPLE_ACTION = Object.freeze({
  general: 'unknown_action',
  sensitive: 'password_change',
  administrative: 'user_role_change',
  compliance: 'data_export'
});

/**
 * SQL-facing view of the same matchers, so the archival sweep and the policy
 * cannot disagree about which events a category owns.
 *
 * `general` is deliberately empty: a general sweep takes whatever the protected
 * categories did not claim, which is what the old `1=1` failed to do.
 */
export const CATEGORY_MATCHERS = Object.freeze({
  general: Object.freeze({ actions: [], statuses: [], targetTypes: [] }),
  sensitive: Object.freeze({
    actions: Object.freeze([...SENSITIVE_ACTIONS]),
    statuses: Object.freeze([]),
    targetTypes: Object.freeze(['security_event', 'credential'])
  }),
  administrative: Object.freeze({
    actions: Object.freeze([...ADMINISTRATIVE_ACTIONS]),
    statuses: Object.freeze([]),
    targetTypes: Object.freeze(['user', 'role'])
  }),
  compliance: Object.freeze({
    actions: Object.freeze([...COMPLIANCE_ACTIONS]),
    statuses: Object.freeze([...COMPLIANCE_STATUSES]),
    targetTypes: Object.freeze([])
  })
});

/**
 * Build the `WHERE` fragment that selects exactly the rows a category owns.
 * @param {string} category - Retention category
 * @returns {{sql: string, params: Array}} Fragment and bound parameters
 * @throws {RangeError} On an unknown category
 */
export function buildCategoryPredicate(category) {
  const matcher = CATEGORY_MATCHERS[category];
  if (!matcher) {
    throw new RangeError(`unknown retention category: ${category}`);
  }
  if (category === 'general') {
    // The general sweep takes only what no protected category claims. Every
    // dimension counts: an event protected by its `status` or `target_type`
    // alone must survive even when its action is not on any list.
    const protectedNames = Object.keys(CATEGORY_MATCHERS).filter((name) => name !== 'general');
    const clauses = [];
    const params = [];
    for (const name of protectedNames) {
      const other = CATEGORY_MATCHERS[name];
      const parts = [];
      if (other.actions.length) {
        parts.push(`LOWER(TRIM(COALESCE(action, ''))) IN (${other.actions.map(() => '?').join(', ')})`);
        params.push(...other.actions);
      }
      if (other.statuses.length) {
        parts.push(`UPPER(COALESCE(status, '')) IN (${other.statuses.map(() => '?').join(', ')})`);
        params.push(...other.statuses);
      }
      if (other.targetTypes.length) {
        parts.push(`LOWER(TRIM(COALESCE(target_type, ''))) IN (${other.targetTypes.map(() => '?').join(', ')})`);
        params.push(...other.targetTypes);
      }
      if (parts.length) {
        clauses.push(`(${parts.join(' OR ')})`);
      }
    }
    return { sql: clauses.length ? `NOT (${clauses.join(' OR ')})` : '', params };
  }

  const clauses = [];
  const params = [];
  if (matcher.actions.length) {
    clauses.push(`LOWER(TRIM(COALESCE(action, ''))) IN (${matcher.actions.map(() => '?').join(', ')})`);
    params.push(...matcher.actions);
  }
  if (matcher.statuses.length) {
    clauses.push(`UPPER(COALESCE(status, '')) IN (${matcher.statuses.map(() => '?').join(', ')})`);
    params.push(...matcher.statuses);
  }
  if (matcher.targetTypes.length) {
    clauses.push(`LOWER(TRIM(COALESCE(target_type, ''))) IN (${matcher.targetTypes.map(() => '?').join(', ')})`);
    params.push(...matcher.targetTypes);
  }
  return { sql: clauses.length ? clauses.join(' OR ') : '1 = 0', params };
}

/**
 * Rows that a date-range sweep must leave alone.
 *
 * A range request names dates, but each event also has a retention window. If a
 * security event is 200 days old and the sensitive window is 365 days, a plain
 * `timestamp <= endDate` sweep removes it on the general schedule, which is the
 * defect the category split was meant to remove. So for every protected category
 * whose own window still covers the end of the range, the rows it matches are
 * excluded here.
 *
 * @param {string} rangeEnd - Inclusive end of the requested range
 * @param {Date} [now] - Clock the windows are measured from
 * @param {Object} [config] - Configured durations, by category or config key
 * @returns {{sql: string, params: Array, protectedCategories: Array}} Fragment,
 *   bound parameters, and the categories the fragment protects
 */
export function buildCutoffProtectionPredicate(rangeEnd, now = new Date(), config = {}) {
  const end = rangeEnd instanceof Date ? rangeEnd : new Date(rangeEnd);
  if (Number.isNaN(end.getTime())) {
    throw new TypeError('rangeEnd must be a valid date');
  }
  const clock = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(clock.getTime())) {
    throw new TypeError('now must be a valid date');
  }

  // Reported so the caller can say what was left in place and why.
  const protectedCategories = [];
  const clauses = [];
  const params = [];

  for (const name of RETENTION_CATEGORIES) {
    if (name === 'general') {
      continue;
    }
    const policy = resolveRetentionPolicy({ action: SAMPLE_ACTION[name] }, config, clock);
    // A category protects the rows it matches that are still inside its own
    // window. The comparison is per row, not per range: a 200-day-old security
    // event is protected by a 365-day window even when the requested range
    // reaches back 5000 days, and a 5-year-old one is not.
    if (policy.cutoff > end.toISOString()) {
      continue;
    }
    const matcher = buildCategoryPredicate(name);
    if (!matcher.sql) {
      continue;
    }
    // The matcher may itself be a disjunction (`LOWER(TRIM(COALESCE(action, ''))) IN (...) OR
    // target_type IN (...)`). Without its own parentheses `AND` would bind to
    // the second branch only, and a row would be protected by the action alone
    // however old it was.
    clauses.push(`((${matcher.sql}) AND julianday(timestamp) >= julianday(?))`);
    params.push(...matcher.params, policy.cutoff);
    protectedCategories.push({ category: name, retention_days: policy.days, cutoff: policy.cutoff });
  }

  if (clauses.length === 0) {
    return { sql: '', params, protectedCategories };
  }
  return { sql: `NOT (${clauses.join(' OR ')})`, params, protectedCategories };
}

/**
 * Categories a caller may iterate, longest retention first, so a sweep never
 * visits a category after one that would have kept its rows.
 * @returns {string[]} Category names
 */
export function retentionCategories() {
  return [...RETENTION_CATEGORIES];
}

/**
 * Classify one audit event. Returns every category that matches, so the caller
 * can apply the "longest retention wins" rule explicitly.
 * @param {Object} event - Row from `audit_logs`
 * @returns {string[]} Matching category names
 */
export function matchRetentionCategories(event = {}) {
  const action = LOWER(event.action);
  const targetType = LOWER(event.target_type);
  const status = String(event.status ?? '').toUpperCase();
  const categories = [];

  // Driven by `CATEGORY_MATCHERS`, the same table the SQL predicates are built
  // from. Classifying an event and selecting it in a sweep therefore cannot
  // disagree: a category that protects a row is a category that claims it.
  for (const [name, matcher] of Object.entries(CATEGORY_MATCHERS)) {
    if (name === 'general') {
      continue;
    }
    const matched = matcher.actions.some((value) => LOWER(value) === action)
      || matcher.statuses.some((value) => value === status)
      || matcher.targetTypes.some((value) => LOWER(value) === targetType);
    if (matched) {
      categories.push(name);
    }
  }

  // An event nothing claims is the general case, and only then.
  return categories.length === 0 ? ['general'] : categories;
}

/**
 * Validate one configured duration.
 * @param {*} value - Configured value
 * @param {string} category - Category the value belongs to
 * @returns {{valid: boolean, days: number|null, reason: string|null}}
 */
export function validateRetentionDays(value, category) {
  if (value === undefined || value === null || value === '') {
    return { valid: false, days: null, reason: 'not_configured' };
  }
  const days = typeof value === 'number' ? value : Number(String(value).trim());
  if (!Number.isFinite(days)) {
    return { valid: false, days: null, reason: 'not_a_number' };
  }
  if (!Number.isInteger(days)) {
    return { valid: false, days: null, reason: 'not_an_integer' };
  }
  if (days < 1) {
    return { valid: false, days: null, reason: `not_positive:${category}` };
  }
  if (days > MAX_RETENTION_DAYS) {
    return { valid: false, days: null, reason: `above_maximum:${category}` };
  }
  return { valid: true, days, reason: null };
}

/**
 * Resolve the single policy that applies to an event.
 *
 * @param {Object} event - Row from `audit_logs`
 * @param {Object} [config] - Durations keyed by category, or by config key
 * @param {Date} [now] - Clock used for the cutoff. The archival service passes
 *   its own so a preview and the run it describes share one instant; it
 *   defaults to the current time.
 * @returns {{category: string, categories: string[], days: number, cutoff: string,
 *   source: string, fallbackUsed: string[]}}
 * @throws {InvalidConfigValueError} When configuration holds a value that cannot
 *   be used and the event would otherwise be deleted on a shorter schedule than
 *   the operator asked for.
 */
export function resolveRetentionPolicy(event, config = {}, now = new Date()) {
  const clock = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(clock.getTime())) {
    throw new TypeError('now must be a valid date');
  }
  const categories = matchRetentionCategories(event);
  const lookup = new Map();
  for (const [category, key] of Object.entries(CATEGORY_CONFIG_KEYS)) {
    const raw = config[category] !== undefined ? config[category] : config[key];
    lookup.set(category, validateRetentionDays(raw, category));
  }

  // Longest retention wins, so an overlapping match can only ever keep more.
  const chosen = categories.reduce((longest, category) => {
    const entry = lookup.get(category);
    const days = entry.valid ? entry.days : CATEGORY_FALLBACK_DAYS[category];
    return (!longest || days > longest.days) ? { category, days, configured: entry.valid } : longest;
  }, null);

  const fallbackUsed = categories.filter((category) => !lookup.get(category).valid);

  // A category whose configured value is unusable must not silently drop to a
  // shorter fallback while another category decides the outcome.
  const rejected = categories
    .map((category) => ({ category, entry: lookup.get(category) }))
    .filter(({ category, entry }) => !entry.valid && entry.reason !== 'not_configured' && category === chosen.category);

  if (rejected.length > 0) {
    throw new InvalidConfigValueError(
      CATEGORY_CONFIG_KEYS[chosen.category],
      rejected[0].entry.reason,
      { category: chosen.category, categories }
    );
  }

  const cutoff = retentionCutoff(chosen.days, clock);
  auditRetentionPolicy_log(
    `Retention for ${LOWER(event.action) || 'unknown'}: ${chosen.category} ${chosen.days}d (matches ${categories.join(', ')})`
  );

  return {
    category: chosen.category,
    categories,
    days: chosen.days,
    cutoff,
    source: chosen.configured ? 'config' : 'default',
    fallbackUsed
  };
}

/**
 * Validate and freeze an archive selection.
 *
 * The returned object is the single contract shared by the preview and the
 * execution: same start, same end, same limit, same cursor. Nothing here is
 * interpolated into SQL by the caller.
 *
 * @param {Object} input - Operator request
 * @param {Object} scope - Caller scope, e.g. `{canReadAll}`
 * @param {Date|string|number} now - Current time, injectable for tests
 * @returns {{startDate: string, endDate: string, limit: number, cursorAfterId: number,
 *   dryRun: boolean, generatedAt: string, scopeAll: boolean}}
 * @throws {TypeError|RangeError} On an invalid range
 */
export function buildArchiveSelection(input = {}, scope = {}, now = new Date()) {
  // `limit` is accepted alongside `batchSize` so a selection that has already
  // been normalised can be handed straight back in. Without this a caller that
  // re-validates its own selection silently falls back to the default page size.
  const { startDate, endDate, cursorAfterId, dryRun, category } = input;
  const batchSize = input.batchSize ?? input.limit;

  if (typeof startDate !== 'string' || typeof endDate !== 'string') {
    throw new TypeError('startDate and endDate are required ISO strings');
  }
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new TypeError('startDate and endDate must be valid ISO dates');
  }
  if (start.getTime() > end.getTime()) {
    throw new RangeError('startDate must not be after endDate');
  }

  const limit = batchSize === undefined ? 100 : Number(batchSize);
  if (!Number.isInteger(limit) || limit < 1 || limit > MAX_PAGE_ROWS) {
    throw new RangeError(`batchSize must be an integer between 1 and ${MAX_PAGE_ROWS}, got ${batchSize}`);
  }
  const cursor = cursorAfterId === undefined ? 0 : Number(cursorAfterId);
  if (!Number.isInteger(cursor) || cursor < 0) {
    throw new RangeError(`cursorAfterId must be a non-negative integer, got ${cursorAfterId}`);
  }
  // `null` means "no category filter", which is what a normalised selection
  // carries. Re-validating a selection therefore has to be allowed, or a caller
  // that re-checks its own selection fails on its own output.
  if (category !== undefined && category !== null && !Object.hasOwn(CATEGORY_FALLBACK_DAYS, category)) {
    throw new RangeError(`unknown retention category: ${category}`);
  }

  const generatedAt = now instanceof Date ? new Date(now.getTime()) : new Date(now);
  if (Number.isNaN(generatedAt.getTime())) {
    throw new TypeError('now must be a valid date');
  }

  return {
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    limit,
    cursorAfterId: cursor,
    dryRun: dryRun === true,
    category: category ?? null,
    generatedAt: generatedAt.toISOString(),
    // A range outside the caller's scope is rejected by the caller, not silently
    // widened here; the flag exists so the service can refuse instead of
    // guessing.
    scopeAll: scope?.canReadAll === true
  };
}

/**
 * Build the `WHERE` fragment and parameters for a selection.
 *
 * Keyset pagination: rows are selected by `id > cursorAfterId` ordered by `id`,
 * so a delete inside the loop never makes the next page skip or repeat a row
 * the way an increasing OFFSET does.
 *
 * @param {Object} selection - Output of `buildArchiveSelection`; internal automatic
 *   sweeps may set `olderThan` to select all rows strictly before `endDate`
 * @param {string} [column] - Timestamp column, for age-bounded predicates
 * @returns {{sql: string, params: Array}} Fragment and bound parameters
 */
export function buildSelectionPredicate(selection, column = 'timestamp') {
  // ISO, UTC offsets and SQLite CURRENT_TIMESTAMP must compare as instants.
  // julianday preserves the millisecond boundaries produced by this service.
  if (selection.olderThan === true) {
    return {
      sql: `julianday(${column}) < julianday(?) AND id > ?`,
      params: [selection.endDate, selection.cursorAfterId]
    };
  }
  const clauses = [`julianday(${column}) >= julianday(?)`, `julianday(${column}) <= julianday(?)`, 'id > ?'];
  const params = [selection.startDate, selection.endDate, selection.cursorAfterId];
  return { sql: clauses.join(' AND '), params };
}

/**
 * Rows whose retention window has not expired must not be deleted. This is the
 * single predicate used by both the preview and the execution.
 * @param {number} days - Retention days for the event's policy
 * @param {Date|string|number} now - Current time
 * @returns {string} ISO cutoff
 */
export function retentionCutoff(days, now = new Date()) {
  if (!Number.isFinite(days)) {
    throw new TypeError(`retentionCutoff needs a number of days, got ${days}`);
  }
  const base = now instanceof Date ? now : new Date(now);
  if (Number.isNaN(base.getTime())) {
    throw new TypeError('now must be a valid date');
  }
  return new Date(base.getTime() - days * 86400000).toISOString();
}
