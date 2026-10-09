import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createTestEnv } from './helpers/local-env.mjs';
import { createAuditScope, normalizeAuditFilters, buildScopedWhere } from '../../src/services/auditScope.js';

function installAuditDbStub(env, statements) {
  const makeStatement = (sql, params = []) => ({
    sql,
    params,
    bind: (...bound) => {
      const next = makeStatement(sql, bound);
      params.length = 0;
      params.push(...bound);
      return next;
    },
    first: () => Promise.resolve({ total: 0 }),
    all: () => Promise.resolve({ results: [], success: true }),
    run: () => Promise.resolve({ success: true, meta: { changes: 0 } })
  });
  env.DB = {
    prepare: (sql) => {
      const statement = makeStatement(sql);
      statements.push(statement);
      return statement;
    }
  };
  return env;
}

/**
 * Extract just the WHERE predicate from a statement.
 *
 * Every audit read projects the `actor_role` column, so assertions about role
 * *restrictions* have to look at the predicate only. Otherwise a query with no
 * restriction at all still appears to contain `actor_role`.
 * @param {string} sql - Statement text
 * @returns {string} The text between WHERE and ORDER BY, or an empty string
 */
function whereClauseOf(sql) {
  const match = /WHERE([\s\S]*?)(?:ORDER\s+BY|LIMIT|$)/i.exec(sql);
  return match ? match[1] : '';
}

const ADMIN = { id: 10, role: 'admin' };
const SUPER_ADMIN = { id: 1, role: 'super_admin' };
const USER = { id: 99, role: 'user' };

test('B04: an admin scope cannot read super_admin events', () => {
  const adminScope = createAuditScope(ADMIN);
  assert.equal(adminScope.excludeSuperAdmin, true);
  assert.equal(adminScope.canReadAll, false);

  const superScope = createAuditScope(SUPER_ADMIN);
  assert.equal(superScope.excludeSuperAdmin, false);
  assert.equal(superScope.canReadAll, true);
});

test('B04: a client cannot override the server-side scope', () => {
  const adminScope = createAuditScope(ADMIN);
  const hostile = normalizeAuditFilters({
    exclude_super_admin: false,
    exclude_super_admin_actions: false,
    canReadAll: true,
    actor_role: 'super_admin'
  }, adminScope);

  assert.equal(hostile.exclude_super_admin, true, 'client cannot disable super_admin exclusion');
  assert.equal(hostile.exclude_super_admin_actions, true, 'client cannot disable action filtering');
  assert.equal(hostile.canReadAll, undefined, 'client cannot grant read-all');
});

test('B04: camelCase filters are mapped once to the service column names', () => {
  const filters = normalizeAuditFilters({
    actorRole: 'admin',
    userId: 5,
    startDate: '2026-01-01T00:00:00.000Z',
    endDate: '2026-02-01T00:00:00.000Z',
    sortBy: 'timestamp',
    sortOrder: 'asc'
  }, createAuditScope(SUPER_ADMIN));

  assert.equal(filters.actor_role, 'admin');
  assert.equal(filters.actor_id, 5);
  assert.equal(filters.start_date, '2026-01-01T00:00:00.000Z');
  assert.equal(filters.end_date, '2026-02-01T00:00:00.000Z');
  assert.equal(filters.sort_order, 'ASC');
  assert.equal(filters.actorRole, undefined, 'camelCase alias must not leak into the query builder');
  assert.equal(filters.userId, undefined);
});

test('B04: the scoped WHERE clause always applies the role restriction', () => {
  const { whereClause, params } = buildScopedWhere({ action: 'login' }, createAuditScope(ADMIN));
  // COALESCE keeps the comparison NULL-safe: a system event with no actor_role
  // is not a super_admin event and must stay visible to an admin.
  assert.ok(/COALESCE\(actor_role, ''\) != \?/.test(whereClause), whereClause);
  assert.ok(params.includes('super_admin'), JSON.stringify(params));
  assert.ok(params.includes('login'));
});

test('B04: super_admin scope adds no role restriction', () => {
  const { whereClause, params } = buildScopedWhere({ action: 'login' }, createAuditScope(SUPER_ADMIN));
  assert.equal(/actor_role/.test(whereClause), false, whereClause);
  assert.equal(params.includes('super_admin'), false, JSON.stringify(params));
});

test('B04: a regular user scope is pinned to its own actor id', () => {
  const scope = createAuditScope(USER);
  assert.equal(scope.pinToOwnActor, true);
  const { whereClause, params } = buildScopedWhere({}, scope);
  assert.ok(whereClause.includes('actor_id = ?'), whereClause);
  assert.ok(params.includes(USER.id));
});

test('B04: user scope cannot be widened by client filters', () => {
  const scope = createAuditScope(USER);
  const filters = normalizeAuditFilters({ actor_id: 1, exclude_super_admin: false }, scope);
  assert.equal(filters.actor_id, USER.id, 'a user may only read its own events');
});

test('B04: list, search and export all emit a super_admin-restricted query for an admin', async () => {
  const { AuditLogService } = await import('../../src/services/auditLogService.js');
  const env = createTestEnv();
  const statements = [];

  installAuditDbStub(env, statements);

  const service = new AuditLogService(env);
  const scope = createAuditScope(ADMIN);

  await service.getLogs({}, { page: 1, limit: 10 }, scope);
  await service.searchLogs({ query: 'login' }, scope);
  await service.exportLogs({ format: 'json' }, scope);

  const scopedReads = statements.filter((st) => /FROM audit_logs/i.test(st.sql) && !/COUNT/i.test(st.sql));
  assert.ok(scopedReads.length >= 3, `expected 3 audit reads, saw ${scopedReads.length}`);
  for (const st of scopedReads) {
    assert.ok(/COALESCE\(actor_role, ''\) != \?/.test(st.sql), `unscoped audit read: ${st.sql}`);
    assert.ok(st.params.includes('super_admin'), `missing super_admin exclusion param: ${JSON.stringify(st.params)}`);
  }
});

test('B04: a super_admin principal is the only way to read super_admin events', async () => {
  const { AuditLogService } = await import('../../src/services/auditLogService.js');
  const env = createTestEnv();
  const statements = [];

  installAuditDbStub(env, statements);

  const service = new AuditLogService(env);
  await service.getLogs({}, { page: 1, limit: 10 }, createAuditScope(SUPER_ADMIN));

  const scopedReads = statements.filter((st) => /FROM audit_logs/i.test(st.sql) && !/COUNT/i.test(st.sql));
  assert.ok(scopedReads.length >= 1);
  for (const st of scopedReads) {
    // Only the predicate matters here; the SELECT list always projects actor_role.
    assert.ok(!/actor_role/.test(whereClauseOf(st.sql)), `super_admin scope must not be filtered: ${st.sql}`);
    assert.equal(st.params.includes('super_admin'), false, JSON.stringify(st.params));
  }
});

test('B04: omitting the principal cannot widen the result set', async () => {
  const { AuditLogService } = await import('../../src/services/auditLogService.js');
  const env = createTestEnv();
  const statements = [];

  installAuditDbStub(env, statements);

  const service = new AuditLogService(env);
  await service.getLogs({ exclude_super_admin: false }, { page: 1, limit: 10 });

  const scopedReads = statements.filter((st) => /FROM audit_logs/i.test(st.sql) && !/COUNT/i.test(st.sql));
  assert.ok(scopedReads.length >= 1);
  for (const st of scopedReads) {
    assert.ok(/COALESCE\(actor_role, ''\) != \?/.test(st.sql), `default scope must stay restricted: ${st.sql}`);
    assert.ok(st.params.includes('super_admin'), JSON.stringify(st.params));
  }
});
