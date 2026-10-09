/**
 * T3 / R3 / R4: sort, pagination and cache key against a REAL D1 database.
 *
 * The previous coverage asserted on captured SQL strings, which cannot tell you
 * that `created_at` is not a column. Every case here runs on real workerd/SQLite
 * with the real `migrations/*.sql` schema applied, so a bad column, a wrong
 * OFFSET or a poisoned cache entry fails the test rather than passing quietly.
 */
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { startD1, tableColumns, traceStatements } from './helpers/d1-local.mjs';
import { createTestEnv, initTestI18n, seedKv } from './helpers/local-env.mjs';
import { createAuditSearchSchema } from '../../src/schemas/audit.js';
import {
  createAuditScope,
  normalizeAuditRequest,
  normalizeAuditSortField,
  normalizeAuditPagination,
  auditResultCacheKey,
  SORTABLE_AUDIT_COLUMNS,
  SORT_ALIASES
} from '../../src/services/auditScope.js';
import { ROLES } from '../../src/constants/roles.js';

let d1;

const ADMIN = { id: 7, role: ROLES.ADMIN };
const SUPER_ADMIN = { id: 1, role: ROLES.SUPER_ADMIN };
const USER = { id: 42, role: ROLES.USER };

before(async () => {
  await initTestI18n();
  d1 = await startD1();
});

after(async () => {
  await d1?.dispose();
});

beforeEach(async () => {
  await d1.db.prepare('DELETE FROM audit_logs').run();
  // audit_logs.actor_id references users(id) and the real schema enforces it,
  // so the actors must exist before any event can reference them.
  await d1.db.prepare('DELETE FROM users').run();
  const insertUser = d1.db.prepare(
    'INSERT INTO users (id, full_name, email, password, status) VALUES (?, ?, ?, ?, ?)'
  );
  await insertUser.bind(1, 'Super Admin', 'super@example.invalid', 'FAKE-PASSWORD-MARKER', 'active').run();
  for (const id of [7, 42]) {
    await insertUser.bind(id, `User ${id}`, `user${id}@example.invalid`, 'FAKE-PASSWORD-MARKER', 'active').run();
  }
});

/**
 * Insert audit rows through the real schema.
 * @param {Array<Object>} rows - Rows to insert
 * @returns {Promise<void>} Resolves when inserted
 */
async function seedAuditLogs(rows) {
  for (const row of rows) {
    await d1.db.prepare(
      `INSERT INTO audit_logs
         (id, action, actor_id, actor_role, actor_email, target_type, target_id,
          target_identifier, status, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
    ).bind(
      row.id,
      row.action,
      row.actor_id ?? null,
      row.actor_role ?? null,
      row.actor_email ?? null,
      row.target_type ?? null,
      row.target_id ?? null,
      row.target_identifier ?? null,
      row.status ?? 'SUCCESS',
      row.timestamp
    ).run();
  }
}

/**
 * Enough rows that pages 2 and 3 are genuinely different windows.
 * Timestamps are strictly increasing so ORDER BY assertions are deterministic
 * rather than depending on how ties happen to be stored.
 * @param {number} count - Number of rows
 * @returns {Array<Object>} Rows for `seedAuditLogs`
 */
function manyRows(count) {
  const base = Date.UTC(2026, 0, 1, 0, 0, 0);
  return Array.from({ length: count }, (_, index) => ({
    id: index + 1,
    action: 'login',
    actor_id: 7,
    actor_role: ROLES.ADMIN,
    actor_email: 'admin@example.invalid',
    status: 'SUCCESS',
    timestamp: new Date(base + index * 1000).toISOString()
  }));
}

/**
 * Build an audit service bound to the real D1 database.
 * @returns {Promise<AuditLogService>} Service under test
 */
async function makeService() {
  const env = createTestEnv({ DB: d1.db });
  // Ensure dynamic config resolves without a pre-seeded KV.
  await seedKv(env, 'hono-auth-api:feature-flags', JSON.stringify({ enableAdvancedSearch: true }));
  const { createAuditLogService } = await import('../../src/utils/serviceFactory.js');
  return createAuditLogService(env);
}

test('R3: the real audit_logs table has no created_at column', async () => {
  const columns = await tableColumns(d1.db, 'audit_logs');
  assert.ok(
    !columns.includes('created_at'),
    `if audit_logs ever gains created_at the alias story must be revisited; columns: ${columns.join(', ')}`
  );
  assert.ok(columns.includes('timestamp'), 'audit_logs must expose the timestamp column');
});

test('R3: the schema default sortBy is a column that exists', async () => {
  const parsed = createAuditSearchSchema('en').parse({ action: 'login' });
  const columns = await tableColumns(d1.db, 'audit_logs');

  assert.ok(
    columns.includes(parsed.sortBy),
    `the schema default sortBy "${parsed.sortBy}" is not an audit_logs column: ${columns.join(', ')}`
  );
  assert.equal(parsed.sortBy, 'timestamp', 'the canonical default sort is timestamp');
});

test('R3: a schema-validated search runs on the real schema without an exception', async () => {
  // The reported failure: a search validated with `{action:'login'}` threw
  // "no such column: created_at" because the default sort did not exist.
  const service = await makeService();
  await seedAuditLogs(manyRows(3));

  const parsed = createAuditSearchSchema('en').parse({ action: 'login' });
  const result = await service.searchLogs({ ...parsed }, ADMIN);

  assert.equal(result.success, true, `search must succeed, got ${JSON.stringify(result).slice(0, 300)}`);
  assert.equal(result.data.logs.length, 3);
});

test('R3: the deprecated created_at alias still works and maps to timestamp', async () => {
  const service = await makeService();
  await seedAuditLogs(manyRows(3));

  const parsed = createAuditSearchSchema('en').parse({ action: 'login', sortBy: 'created_at' });
  const result = await service.searchLogs({ ...parsed }, ADMIN);

  assert.equal(result.success, true, `the alias must not fail, got ${JSON.stringify(result).slice(0, 300)}`);
  assert.equal(normalizeAuditSortField('created_at'), 'timestamp');

  // A deprecated alias must be *resolved*, not rejected. Both outcomes happen to
  // equal the default for `created_at`, so asserting only that value would also
  // pass if the alias table were deleted and the value merely fell through to the
  // "unknown field" fallback. `role` proves the difference: its target
  // `actor_role` is sortable but is not the default, so only a working alias
  // table can produce it.
  for (const [alias, expected] of [
    ['role', 'actor_role'],
    ['time', 'timestamp'],
    ['createdAt', 'timestamp']
  ]) {
    assert.equal(
      normalizeAuditSortField(alias),
      expected,
      `alias "${alias}" must resolve to "${expected}", not to the default fallback`
    );
  }

  // The alias table is a closed allowlist: an unknown value still falls back,
  // and no alias may name a column outside the sortable set.
  assert.equal(normalizeAuditSortField('unknown_column'), 'timestamp');
  for (const alias of Object.values(SORT_ALIASES)) {
    assert.ok(
      SORTABLE_AUDIT_COLUMNS.includes(alias),
      `alias target "${alias}" must be a sortable audit_logs column`
    );
  }
});

test('R3: sortBy is an allowlist, not an SQL expression', async () => {
  const service = await makeService();
  await seedAuditLogs(manyRows(3));

  const attempts = [
    'timestamp, (SELECT 1)',
    'id; DROP TABLE audit_logs',
    'details',
    'timestamp DESC, id',
    'unknown_column',
    'actor_email'
  ];

  for (const sortBy of attempts) {
    const request = normalizeAuditRequest({ action: 'login', sortBy }, createAuditScope(ADMIN));
    assert.ok(
      SORTABLE_AUDIT_COLUMNS.includes(request.sort.field),
      `"${sortBy}" must not survive normalization, got ${request.sort.field}`
    );
    assert.equal(request.sort.field, 'timestamp', `"${sortBy}" must fall back to the default`);
  }

  // And the table is still there with its rows.
  const result = await service.searchLogs({ action: 'login' }, ADMIN);
  assert.equal(result.success, true);
  const { total } = await d1.db.prepare('SELECT COUNT(*) AS total FROM audit_logs').first();
  assert.equal(total, 3, 'no injection may alter the table');
});

test('R4: page and limit are normalized instead of dropped', () => {
  const request = normalizeAuditRequest(
    { action: 'login', page: 2, limit: 10 },
    createAuditScope(ADMIN)
  );

  assert.deepEqual(request.pagination, { page: 2, limit: 10 }, 'page/limit must survive normalization');
  assert.equal(request.filters.page, undefined, 'page must not leak into the WHERE filter set');
  assert.equal(request.filters.limit, undefined, 'limit must not leak into the WHERE filter set');
});

test('R4: sort never reaches the WHERE filter set, even when the client sends it', () => {
  const scope = createAuditScope(ADMIN);
  const request = normalizeAuditRequest(
    { action: 'login', sortBy: 'created_at', sortOrder: 'asc' },
    scope,
    { maxLimit: 100 }
  );

  assert.equal(request.filters.sort_by, undefined, 'sort_by must not leak into the WHERE filter set');
  assert.equal(request.filters.sort_order, undefined, 'sort_order must not leak into the WHERE filter set');
  // The alias is still honoured, it just moves to the sort descriptor.
  assert.deepEqual(request.sort, { field: 'timestamp', direction: 'ASC' });
  assert.deepEqual(
    Object.keys(request.filters).filter((key) => key.startsWith('sort')),
    [],
    'no sort key may survive into the filter set'
  );
});

test('R4: page must be a positive integer and limit must be bounded', () => {
  const cases = [
    [{ page: 0 }, { page: 1, limit: 50 }],
    [{ page: -3 }, { page: 1, limit: 50 }],
    [{ page: 1.5 }, { page: 1, limit: 50 }],
    [{ page: 'abc' }, { page: 1, limit: 50 }],
    [{ limit: 0 }, { page: 1, limit: 50 }],
    [{ limit: -5 }, { page: 1, limit: 50 }],
    [{ limit: 99999 }, { page: 1, limit: 100 }],
    [{ page: 2, limit: 1000 }, { page: 2, limit: 100 }]
  ];

  for (const [input, expected] of cases) {
    assert.deepEqual(
      normalizeAuditPagination(input),
      expected,
      `${JSON.stringify(input)} must normalize to ${JSON.stringify(expected)}`
    );
  }
});

test('R4: page=2 limit=10 produces OFFSET 10 on the real database', async () => {
  const db = traceStatements(d1.db);
  const env = createTestEnv({ DB: db });
  await seedKv(env, 'hono-auth-api:feature-flags', JSON.stringify({ enableAdvancedSearch: true }));
  const { createAuditLogService } = await import('../../src/utils/serviceFactory.js');
  const service = createAuditLogService(env);

  await seedAuditLogs(manyRows(30));

  const result = await service.searchLogs({ action: 'login', page: 2, limit: 10 }, ADMIN);
  assert.equal(result.success, true, JSON.stringify(result).slice(0, 200));
  assert.equal(result.data.pagination.page, 2, 'the service must report page 2, not fall back to page 1');

  const paged = db.statements.find((sql) => /ORDER BY/i.test(sql) && /LIMIT \? OFFSET \?/i.test(sql));
  assert.ok(paged, `a paged SELECT must run, saw:\n${db.statements.join('\n')}`);
  assert.match(paged, /ORDER BY timestamp DESC/i);
  assert.equal(
    lastBoundPair(db, paged),
    '10,10',
    'page 2 limit 10 must send LIMIT 10 OFFSET 10'
  );
});

test('R4: page=3 limit=25 produces OFFSET 50 on the real database', async () => {
  const db = traceStatements(d1.db);
  const env = createTestEnv({ DB: db });
  await seedKv(env, 'hono-auth-api:feature-flags', JSON.stringify({ enableAdvancedSearch: true }));
  const { createAuditLogService } = await import('../../src/utils/serviceFactory.js');
  const service = createAuditLogService(env);

  await seedAuditLogs(manyRows(75));

  const result = await service.searchLogs({ action: 'login', page: 3, limit: 25 }, ADMIN);
  assert.equal(result.success, true, JSON.stringify(result).slice(0, 200));
  assert.equal(result.data.pagination.page, 3);

  const paged = db.statements.find((sql) => /ORDER BY/i.test(sql) && /LIMIT \? OFFSET \?/i.test(sql));
  assert.ok(paged, 'a paged SELECT must run');
  assert.equal(lastBoundPair(db, paged), '25,50', 'page 3 limit 25 must send LIMIT 25 OFFSET 50');
  assert.equal(result.data.logs.length, 25);
  assert.equal(result.data.pagination.total, 75);
  assert.equal(result.data.pagination.totalPages, 3);
  // Newest first, so pages 1-2 hold ids 75..26 and page 3 holds ids 25..1.
  assert.equal(result.data.logs[0].id, 25);
  assert.equal(result.data.logs[24].id, 1);
});

test('R4: distinct pages do not share a cache entry', async () => {
  const service = await makeService();
  await seedAuditLogs(manyRows(30));

  const page1 = await service.searchLogs({ action: 'login', page: 1, limit: 10 }, ADMIN);
  const page2 = await service.searchLogs({ action: 'login', page: 2, limit: 10 }, ADMIN);
  const page1Again = await service.searchLogs({ action: 'login', page: 1, limit: 10 }, ADMIN);

  assert.equal(page1.data.pagination.page, 1);
  assert.equal(page2.data.pagination.page, 2, 'page 2 must not be served the page 1 cache entry');
  assert.equal(page1Again.data.pagination.page, 1);

  const ids1 = page1.data.logs.map((log) => log.id);
  const ids2 = page2.data.logs.map((log) => log.id);
  assert.notDeepEqual(ids1, ids2, 'page 1 and page 2 must not return the same rows');
  assert.equal(ids1.length, 10);
  assert.equal(ids2.length, 10);
});

test('R4: distinct limits and sort orders do not share a cache entry', async () => {
  const service = await makeService();
  await seedAuditLogs(manyRows(30));

  const limit10 = await service.searchLogs({ action: 'login', page: 1, limit: 10 }, ADMIN);
  const limit25 = await service.searchLogs({ action: 'login', page: 1, limit: 25 }, ADMIN);
  const ascending = await service.searchLogs(
    { action: 'login', page: 1, limit: 10, sortOrder: 'asc' },
    ADMIN
  );

  assert.equal(limit10.data.logs.length, 10);
  assert.equal(limit25.data.logs.length, 25, 'a larger limit must not reuse the 10-row entry');
  // A wider window on the same page must extend the narrow one, not replace it.
  assert.deepEqual(
    limit25.data.logs.slice(0, 10).map((log) => log.id),
    limit10.data.logs.map((log) => log.id),
    'page 1 with limit 25 must contain page 1 with limit 10 as a prefix'
  );
  assert.notEqual(ascending.data.logs[0].id, limit10.data.logs[0].id, 'sort direction must be part of the key');
  // Timestamps increase with id, so ascending page 1 is the oldest window and
  // descending page 1 is the newest.
  assert.equal(ascending.data.logs[0].id, 1, 'ascending must start at the oldest row');
  assert.equal(limit10.data.logs[0].id, 30, 'descending must start at the newest row');
  const stamps = ascending.data.logs.map((log) => new Date(log.timestamp).getTime());
  assert.ok(
    stamps.every((value, index) => index === 0 || value >= stamps[index - 1]),
    `ascending order must be non-decreasing, got ${JSON.stringify(stamps)}`
  );
});

test('R4: the cache key separates scope, page, limit and sort', () => {
  const admin = createAuditScope(ADMIN);
  const superAdmin = createAuditScope(SUPER_ADMIN);
  const key = (scope, input) => auditResultCacheKey(scope, normalizeAuditRequest(input, scope));

  const base = key(admin, { action: 'login', page: 1, limit: 10 });

  assert.notEqual(base, key(admin, { action: 'login', page: 2, limit: 10 }), 'page must be in the key');
  assert.notEqual(base, key(admin, { action: 'login', page: 1, limit: 25 }), 'limit must be in the key');
  assert.notEqual(base, key(admin, { action: 'login', page: 1, limit: 10, sortOrder: 'asc' }), 'direction must be in the key');
  assert.notEqual(base, key(admin, { action: 'logout', page: 1, limit: 10 }), 'filters must be in the key');
  assert.notEqual(base, key(superAdmin, { action: 'login', page: 1, limit: 10 }), 'scope must be in the key');

  // Stable regardless of key insertion order.
  assert.equal(
    key(admin, { action: 'login', limit: 10, page: 1 }),
    base,
    'the key must not depend on property order'
  );
});

test('R4: a super_admin-warmed cache entry is never served to an admin', async () => {
  const service = await makeService();
  // One super_admin event plus admin events.
  await seedAuditLogs([
    { id: 1, action: 'system_wipe', actor_id: 1, actor_role: ROLES.SUPER_ADMIN, timestamp: '2026-01-01T00:00:00.000Z' },
    { id: 2, action: 'user_update', actor_id: 7, actor_role: ROLES.ADMIN, timestamp: '2026-01-02T00:00:00.000Z' },
    { id: 3, action: 'user_update', actor_id: 7, actor_role: ROLES.ADMIN, timestamp: '2026-01-03T00:00:00.000Z' }
  ]);

  const privileged = await service.searchLogs({ action: 'user_update' }, SUPER_ADMIN);
  const restricted = await service.searchLogs({ action: 'user_update' }, ADMIN);

  // Both roles may read user_update, so the two results legitimately match here.
  // The point of the test is the warmed-cache check below.
  assert.equal(privileged.data.logs.length, 2, 'a super_admin sees every user_update event');
  assert.equal(restricted.data.logs.length, 2, 'an admin may see user_update events');

  // Warm super_admin first, then read as admin with the identical filters.
  const superResult = await service.searchLogs({}, SUPER_ADMIN);
  const adminResult = await service.searchLogs({}, ADMIN);
  const superIds = superResult.data.logs.map((log) => log.id);
  const adminIds = adminResult.data.logs.map((log) => log.id);

  assert.ok(superIds.includes(1), 'super_admin must see its own event');
  assert.ok(!adminIds.includes(1), 'an admin must never be served the super_admin event');
});

test('R4: a null-actor system event is visible to admin but not to a user', async () => {
  const service = await makeService();
  await seedAuditLogs([
    // Deliberately null actor: a system event with no user behind it.
    { id: 1, action: 'system_event', actor_id: null, actor_role: null, timestamp: '2026-01-01T00:00:00.000Z' },
    { id: 2, action: 'user_login', actor_id: 42, actor_role: ROLES.USER, timestamp: '2026-01-02T00:00:00.000Z' }
  ]);

  const adminView = await service.searchLogs({}, ADMIN);
  const userView = await service.searchLogs({}, USER);

  const adminIds = adminView.data.logs.map((log) => log.id);
  const userIds = userView.data.logs.map((log) => log.id);

  assert.ok(adminIds.includes(1), 'an admin should see a null-actor system event');
  assert.ok(!userIds.includes(1), 'a user must not see a null-actor system event');
  assert.deepEqual(userIds, [2], 'a user sees only their own events');
});

test('R3/R4: getLogs applies the same pagination and sort rules', async () => {
  const db = traceStatements(d1.db);
  const env = createTestEnv({ DB: db });
  await seedKv(env, 'hono-auth-api:feature-flags', JSON.stringify({ enableAdvancedSearch: true }));
  const { createAuditLogService } = await import('../../src/utils/serviceFactory.js');
  const service = createAuditLogService(env);
  await seedAuditLogs(manyRows(30));

  const result = await service.getLogs({ action: 'login' }, { page: 2, limit: 10, sortBy: 'created_at' }, ADMIN);

  assert.equal(result.success, true, JSON.stringify(result).slice(0, 200));
  assert.equal(result.data.pagination.page, 2, 'getLogs must honour page 2');

  const paged = db.statements.find((sql) => /ORDER BY/i.test(sql) && /LIMIT \? OFFSET \?/i.test(sql));
  assert.ok(paged, 'a paged SELECT must run');
  assert.match(paged, /ORDER BY timestamp/i, 'the created_at alias must map to timestamp here too');
  assert.equal(lastBoundPair(db, paged), '10,10');
});

test('R3/R4: getLogs rejects a sort expression in the pagination argument', async () => {
  const service = await makeService();
  await seedAuditLogs(manyRows(5));

  const result = await service.getLogs(
    {},
    { page: 1, limit: 5, sortBy: 'id; DROP TABLE audit_logs' },
    ADMIN
  );

  assert.equal(result.success, true, JSON.stringify(result).slice(0, 200));
  const { total } = await d1.db.prepare('SELECT COUNT(*) AS total FROM audit_logs').first();
  assert.equal(total, 5, 'the table must be intact');
});

/**
 * Read the LIMIT/OFFSET values a traced statement was executed with.
 * @param {Object} db - Tracing binding
 * @param {string} sql - The paged statement text
 * @returns {string} `limit,offset`
 */
function lastBoundPair(db, sql) {
  const bound = db.boundPairs.get(sql);
  assert.ok(bound, `no recorded parameters for: ${sql}`);
  const tail = bound.slice(-2);
  assert.equal(tail.length, 2, `expected trailing LIMIT/OFFSET parameters, got ${JSON.stringify(bound)}`);
  return tail.map(Number).join(',');
}
