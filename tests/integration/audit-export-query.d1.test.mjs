/**
 * BP7-02 / BP7-03 - the export query itself, run against a real D1.
 *
 * `tests/regression/audit-export.test.mjs` can assert which SQL string was
 * built; it cannot tell a working filter from one that silently matches
 * nothing. Both of the bugs these tests pin produced a *successful* export
 * with the wrong rows in it, so the only way to see them is to run the query on
 * the production schema and count what came back:
 *
 *   - `7d` was turned into the SQLite modifier `-7 d`, which is NULL. Every
 *     row compared against NULL and was excluded, so the answer was an empty
 *     success. Nothing about the response distinguished it from a quiet day.
 *   - the aggregated builder read `time_range` and `actions` but not `users`,
 *     and had no LIMIT at all, so an aggregated report silently ignored two of
 *     the caller's filters and could return more groups than were asked for.
 *
 * Fixtures are inserted with SQL relative to `datetime('now')`, which is the
 * same clock the queries use, so these tests need no sleep and no frozen
 * clock. Offsets are minutes rather than seconds, so a test that takes a second
 * to run cannot move a row across the cutoff.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { startD1, traceStatements } from '../regression/helpers/d1-local.mjs';
import { AuditExportService } from '../../src/services/auditExportService.js';

let d1Promise;
let service;

test.before(async () => {
  const d1 = await startD1();
  d1Promise = Promise.resolve(d1);
  service = new AuditExportService({ DB: d1.db });
});

test.after(async () => {
  const d1 = await d1Promise;
  if (d1) {
    await d1.dispose();
  }
});

const PREFIX = 'bp7_query';
const ALICE = 'bp7_alice@example.invalid';
const BOB = 'bp7_bob@example.invalid';

/**
 * Insert a row whose timestamp is computed by SQLite relative to now.
 *
 * The offset is applied by the database, not by JavaScript, so the fixture and
 * the cutoff the query builds come from one clock and one granularity.
 * @param {Object} d1 - D1 instance
 * @param {Object} row - Fixture fields
 * @param {string} row.action - Action name
 * @param {string} row.actor - Actor email
 * @param {string} [row.offset] - SQLite modifier, e.g. `-90 minutes`
 * @returns {Promise<number>} The new row id
 */
async function insert(d1, { action, actor, offset = '0 minutes' }) {
  const result = await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, status, actor_email, timestamp)
       VALUES (?, 'user', 'SUCCESS', ?, datetime('now', ?))`
    )
    .bind(action, actor, offset)
    .run();
  return result.meta.last_row_id;
}

/** Remove this suite's rows, so each test starts from a known table. */
async function reset() {
  const d1 = await d1Promise;
  await d1.db.prepare('DELETE FROM audit_logs WHERE action LIKE ?').bind(`${PREFIX}%`).run();
}

/** Run a query the service built and return the rows. */
async function run(query) {
  const d1 = await d1Promise;
  const { results } = await d1.db.prepare(query.sql).bind(...query.params).all();
  return results;
}

test('BP7-02: the one-letter unit is what SQLite cannot read, which is why the range matched nothing', async () => {
  const d1 = await d1Promise;

  // The root cause, asserted on the same engine the export runs on. A short
  // unit is not a synonym for a long one: it is not a valid modifier at all.
  const { results } = await d1.db
    .prepare('SELECT datetime(\'now\', ?) AS cut, datetime(\'now\', ?) AS good')
    .bind('-7 d', '-7 days')
    .all();

  assert.equal(results[0].cut, null, 'precondition: SQLite returns NULL for the -7 d modifier');
  assert.ok(results[0].good, 'precondition: -7 days is a modifier SQLite understands');
});

test('BP7-02: each unit is mapped to the modifier SQLite understands', () => {
  const normalized = (value) => service.normalizeExportFilters({ time_range: value }).time_range;

  assert.equal(normalized('7d'), '-7 days');
  assert.equal(normalized('2h'), '-2 hours');
  assert.equal(normalized('15m'), '-15 minutes');

  // Spelled out so a regression that puts the letter back is a named failure
  // rather than a diff nobody reads. A bare `-7 d` is the exact shape that
  // produced NULL, so the whole modifier is matched rather than a substring:
  // `'-7 days'` legitimately contains the characters `" d"`.
  assert.doesNotMatch(normalized('7d'), /^\s*-\d+\s+d\s*$/, 'days must not be abbreviated to "d"');
  assert.doesNotMatch(normalized('2h'), /^\s*-\d+\s+h\s*$/, 'hours must not be abbreviated to "h"');
  assert.doesNotMatch(normalized('15m'), /^\s*-\d+\s+m\s*$/, 'minutes must not be abbreviated to "m"');
});

test('BP7-02: a range keeps the rows inside it and drops the rows outside it', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_inside_2h`, actor: ALICE, offset: '-30 minutes' });
  await insert(d1, { action: `${PREFIX}_outside_2h`, actor: ALICE, offset: '-6 hours' });
  await insert(d1, { action: `${PREFIX}_old_7d`, actor: ALICE, offset: '-9 days' });

  const rows = await run(service.buildQuery({
    time_range: '2h',
    actions: [`${PREFIX}_inside_2h`, `${PREFIX}_outside_2h`, `${PREFIX}_old_7d`]
  }));

  assert.deepEqual(
    rows.map((row) => row.action),
    [`${PREFIX}_inside_2h`],
    'only the row inside the window may come back'
  );
});

test('BP7-02: days, hours and minutes are three different windows, not one', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_m30`, actor: ALICE, offset: '-30 minutes' });
  await insert(d1, { action: `${PREFIX}_h3`, actor: ALICE, offset: '-3 hours' });
  await insert(d1, { action: `${PREFIX}_d5`, actor: ALICE, offset: '-5 days' });

  const actions = [`${PREFIX}_m30`, `${PREFIX}_h3`, `${PREFIX}_d5`];
  // `.sort()` is applied to the result, so the expectations are written in
  // sorted order: `h3` before `m30`, which is not the order they were seeded.
  const names = async (range) => (await run(service.buildQuery({ time_range: range, actions })))
    .map((row) => row.action)
    .sort();

  assert.deepEqual(await names('45m'), [`${PREFIX}_m30`], 'a 45 minute window keeps only the 30 minute row');
  assert.deepEqual(
    await names('6h'),
    [`${PREFIX}_h3`, `${PREFIX}_m30`],
    'a 6 hour window keeps the 30 minute and 3 hour rows'
  );
  assert.deepEqual(await names('7d'), [`${PREFIX}_d5`, `${PREFIX}_h3`, `${PREFIX}_m30`], 'a 7 day window keeps all three');
});

test('BP7-02: the aggregated query uses the same window as the plain one', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_agg_recent`, actor: ALICE, offset: '-20 minutes' });
  await insert(d1, { action: `${PREFIX}_agg_recent`, actor: BOB, offset: '-25 minutes' });
  await insert(d1, { action: `${PREFIX}_agg_old`, actor: ALICE, offset: '-8 days' });

  const plain = await run(service.buildQuery({
    time_range: '2h',
    actions: [`${PREFIX}_agg_recent`, `${PREFIX}_agg_old`]
  }));
  const aggregated = await run(service.buildAggregatedQuery(
    { time_range: '2h', actions: [`${PREFIX}_agg_recent`, `${PREFIX}_agg_old`] },
    { group_by: ['action'], metrics: ['count'] }
  ));

  const plainTotal = plain.length;
  const aggregatedTotal = aggregated.reduce((sum, group) => sum + group.count, 0);

  assert.equal(plainTotal, 2, 'the plain query sees the two recent rows');
  assert.equal(
    aggregatedTotal,
    plainTotal,
    'the aggregated query must count exactly the rows the plain query returns'
  );
  assert.deepEqual(
    aggregated.map((group) => group.action).sort(),
    [`${PREFIX}_agg_recent`],
    'the old row is outside the window and must not be grouped at all'
  );
});

test('BP7-02: a range that cannot be represented is refused, not treated as no range', async () => {
  // Asserted through the public entry point rather than the normaliser, so the
  // test measures the behaviour and not merely that a helper exists. A helper
  // that is simply absent on an older build would otherwise make every
  // "it refused" assertion pass for the wrong reason.
  const refused = async (value) => {
    const result = await service.export({ format: 'json', filters: { time_range: value } });
    return result.success === false ? result : null;
  };

  for (const value of ['0d', '0h', '0m', '7w', '7', 'd7', '-7d', '7.5d', '1e3d', '', '  ']) {
    const outcome = await refused(value);
    assert.ok(
      outcome,
      `time_range "${value}" must be refused rather than silently meaning something else`
    );
    assert.equal(outcome.error, 'INVALID_EXPORT_FILTER', `"${value}" is a caller error, not a server fault`);
    assert.equal(outcome.statusCode, 400);
  }
});

test('BP7-03: the aggregated query honours the users filter it used to ignore', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_u_alice1`, actor: ALICE });
  await insert(d1, { action: `${PREFIX}_u_alice2`, actor: ALICE });
  await insert(d1, { action: `${PREFIX}_u_bob`, actor: BOB });

  const forAlice = await run(service.buildAggregatedQuery(
    { users: [ALICE], actions: [`${PREFIX}_u_alice1`, `${PREFIX}_u_alice2`, `${PREFIX}_u_bob`] },
    { group_by: ['action'], metrics: ['count'] }
  ));

  assert.equal(
    forAlice.reduce((sum, group) => sum + group.count, 0),
    2,
    'only Alice\'s two rows may be counted'
  );
  assert.ok(
    forAlice.every((group) => group.action.startsWith(`${PREFIX}_u_alice`)),
    'Bob\'s row must not appear in an export filtered to Alice'
  );
});

test('BP7-03: a user who has no rows produces no groups, not everyone else\'s', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_absent_a`, actor: ALICE });
  await insert(d1, { action: `${PREFIX}_absent_b`, actor: BOB });

  const rows = await run(service.buildAggregatedQuery(
    { users: ['nobody@example.invalid'], limit: 1 },
    { group_by: ['action'], metrics: ['count'] }
  ));

  assert.deepEqual(
    rows,
    [],
    'a filter that matches nothing must return nothing, not an unfiltered report'
  );
});

test('BP7-03: users, actions and time intersect in the aggregated query too', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_i_wanted`, actor: ALICE, offset: '-10 minutes' });
  await insert(d1, { action: `${PREFIX}_i_wronguser`, actor: BOB, offset: '-10 minutes' });
  await insert(d1, { action: `${PREFIX}_i_tooold`, actor: ALICE, offset: '-10 days' });
  // Deliberately left out of the `actions` list: without a row the action
  // filter actually excludes, this only proves users and time were applied.
  await insert(d1, { action: `${PREFIX}_i_notlisted`, actor: ALICE, offset: '-10 minutes' });

  const filters = {
    users: [ALICE],
    actions: [`${PREFIX}_i_wanted`, `${PREFIX}_i_wronguser`, `${PREFIX}_i_tooold`],
    time_range: '2h'
  };

  const plain = await run(service.buildQuery(filters));
  const aggregated = await run(service.buildAggregatedQuery(filters, {
    group_by: ['action'],
    metrics: ['count']
  }));

  assert.deepEqual(plain.map((row) => row.action), [`${PREFIX}_i_wanted`]);
  assert.deepEqual(aggregated, [
    { action: `${PREFIX}_i_wanted`, count: 1 }
  ], 'all three filters must be applied together, not one at a time');
});

test('BP7-03: limit caps the number of groups the aggregated query returns', async () => {
  await reset();
  const d1 = await d1Promise;
  for (let index = 0; index < 5; index += 1) {
    await insert(d1, { action: `${PREFIX}_g${index}`, actor: ALICE });
  }
  const actions = Array.from({ length: 5 }, (_, index) => `${PREFIX}_g${index}`);

  const one = await run(service.buildAggregatedQuery({ actions, limit: 1 }, {
    group_by: ['action'],
    metrics: ['count']
  }));
  const two = await run(service.buildAggregatedQuery({ actions, limit: 2 }, {
    group_by: ['action'],
    metrics: ['count']
  }));

  assert.equal(one.length, 1, 'limit 1 must return one group');
  assert.equal(two.length, 2, 'limit 2 must return two groups');
});

test('BP7-03: limit caps output groups, and a count still covers every matching row', async () => {
  await reset();
  const d1 = await d1Promise;
  // One group with three rows, one with a single row.
  for (let index = 0; index < 3; index += 1) {
    await insert(d1, { action: `${PREFIX}_big`, actor: ALICE });
  }
  await insert(d1, { action: `${PREFIX}_small`, actor: ALICE });

  const groups = await run(service.buildAggregatedQuery(
    { actions: [`${PREFIX}_big`, `${PREFIX}_small`], limit: 1 },
    { group_by: ['action'], metrics: ['count'] }
  ));

  assert.equal(groups.length, 1, 'precondition: only the larger group is returned');
  assert.equal(
    groups[0].count,
    3,
    'the count must reflect all three rows in the group, not the single row the limit left'
  );
});

test('BP7-03: the ordering is decided by what is actually projected', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_o_b`, actor: ALICE, offset: '-1 minutes' });
  await insert(d1, { action: `${PREFIX}_o_a`, actor: ALICE, offset: '-2 minutes' });

  // No count projected: ordering by a `count` column that is not in the result
  // is a query error, so the sort falls back to the group columns.
  const withoutCount = await run(service.buildAggregatedQuery(
    { actions: [`${PREFIX}_o_a`, `${PREFIX}_o_b`] },
    { group_by: ['action'], metrics: ['first_occurrence'] }
  ));

  assert.deepEqual(
    withoutCount.map((group) => group.action),
    [`${PREFIX}_o_a`, `${PREFIX}_o_b`],
    'without a count the order must be a stable one over the group columns'
  );
  assert.ok(
    withoutCount.every((group) => 'first_occurrence' in group && group.count === undefined),
    'only the requested metric may be projected'
  );
});

test('BP7-03: a limit above the ceiling is refused rather than clamped', () => {
  assert.throws(
    () => service.normalizeExportFilters({ limit: 10001 }),
    /at most 10000/,
    'a client asking for more than the ceiling must be told, not silently given less'
  );
});

test('BP7-03: an empty filter list is refused rather than dropped', () => {
  for (const key of ['actions', 'users']) {
    assert.throws(
      () => service.normalizeExportFilters({ [key]: [] }),
      new RegExp(`${key} must not be empty`),
      `an empty ${key} must not be read as "do not filter by ${key}"`
    );
  }
  assert.throws(() => service.normalizeExportFilters({ actions: 'LOGIN' }), /must be an array/);
  assert.throws(() => service.normalizeExportFilters({ actions: [1, 2] }), /only non-empty strings/);
});

test('BP7-01: the grouped columns are looked up, never interpolated', () => {
  const query = service.buildAggregatedQuery(
    {},
    { group_by: ['actor_email'], metrics: ['count'] }
  );

  assert.match(query.sql, /SELECT actor_email, COUNT\(\*\) AS count FROM audit_logs/);
  assert.equal(
    query.params.length,
    1,
    'only the limit is bound; the projection is built from constants'
  );
});

/*
 * ---------------------------------------------------------------------------
 * BR8-01 / BR8-02 - the filters have to survive the whole way through
 * `export()`, not just the query builders.
 *
 * Everything above this line drives `buildQuery()` / `buildAggregatedQuery()`
 * directly, which is why BR8-01 got through: those tests were green while
 * `export()` normalised `7d` to `-7 days` and then handed that internal value
 * back to a builder that only understands the raw form. The result was a caller
 * error raised inside the production `catch` and reported as `EXPORT_FAILED`
 * with a 500 - for a request that was perfectly valid.
 *
 * So the tests below enter at `export()`, on a real D1, and assert the rows.
 * A builder that builds a correct SQL string and a service that cannot reach it
 * are different things, and only one of them is what a client sees.
 * ---------------------------------------------------------------------------
 */

/** Every seeded action, so a test can name them in one filter. */
function actionList(...names) {
  return names.map((name) => `${PREFIX}_${name}`);
}

/**
 * A service whose database binding records every statement, so a test can prove
 * a refusal happened *before* the export rows were read.
 * @param {Object} d1 - The D1 instance
 * @returns {Object} Service plus the statement list
 */
function tracedService(d1) {
  const tracer = traceStatements(d1.db);
  return {
    service: new AuditExportService({ DB: tracer }),
    statements: tracer.statements
  };
}

/** True when a statement against the audit log was executed. */
function readAuditRows(statements) {
  return statements.some((sql) => /FROM\s+audit_logs/i.test(sql));
}

test('BR8-01: a valid time_range survives export() and keeps exactly the rows in the window', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_win_inside`, actor: ALICE, offset: '-30 minutes' });
  await insert(d1, { action: `${PREFIX}_win_outside`, actor: ALICE, offset: '-9 days' });

  const actions = actionList('win_inside', 'win_outside');
  const result = await service.export({ format: 'json', filters: { time_range: '7d', actions } });

  assert.equal(
    result.success,
    true,
    `a valid 7d window must not fail: ${result.error || ''} ${result.message || ''}`
  );
  assert.equal(result.statusCode, undefined, 'a success carries no failure status');
  assert.equal(result.total_records, 1);
  assert.deepEqual(
    result.data.map((row) => row.action),
    [`${PREFIX}_win_inside`],
    'the 9 day old row is outside a 7 day window and must not be exported'
  );
  assert.equal(
    result.metadata.filters_applied.time_range,
    '-7 days',
    'the metadata reports the window that was actually applied'
  );
});

test('BR8-01: the same window is applied in CSV, and the row is in the text', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_csv_inside`, actor: ALICE, offset: '-30 minutes' });
  await insert(d1, { action: `${PREFIX}_csv_outside`, actor: ALICE, offset: '-9 days' });

  const result = await service.export({
    format: 'csv',
    filters: { time_range: '7d', actions: actionList('csv_inside', 'csv_outside') }
  });

  assert.equal(result.success, true, `CSV export must succeed: ${result.error || ''}`);
  assert.equal(result.total_records, 1);
  assert.match(result.data, new RegExp(`${PREFIX}_csv_inside`));
  assert.doesNotMatch(result.data, new RegExp(`${PREFIX}_csv_outside`));
  assert.match(result.filename, /\.csv$/);
});

test('BR8-01: aggregation counts the same rows a plain export returns', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_agg_win`, actor: ALICE, offset: '-20 minutes' });
  await insert(d1, { action: `${PREFIX}_agg_win`, actor: ALICE, offset: '-25 minutes' });
  await insert(d1, { action: `${PREFIX}_agg_stale`, actor: ALICE, offset: '-9 days' });

  const actions = actionList('agg_win', 'agg_stale');
  const result = await service.export({
    format: 'json',
    filters: { time_range: '7d', actions },
    aggregation: { group_by: ['action'], metrics: ['count'] }
  });

  assert.equal(
    result.success,
    true,
    `an aggregated 7d window must not fail: ${result.error || ''} ${result.message || ''}`
  );
  assert.deepEqual(
    result.data,
    [{ action: `${PREFIX}_agg_win`, count: 2 }],
    'only the two rows inside the window may be counted'
  );
});

test('BR8-01: aggregated CSV honours the window too', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_aggcsv`, actor: ALICE, offset: '-20 minutes' });
  await insert(d1, { action: `${PREFIX}_aggcsv_old`, actor: ALICE, offset: '-9 days' });

  const result = await service.export({
    format: 'csv',
    filters: { time_range: '7d', actions: actionList('aggcsv', 'aggcsv_old') },
    aggregation: { group_by: ['action'], metrics: ['count'] }
  });

  assert.equal(result.success, true, `aggregated CSV must succeed: ${result.error || ''}`);
  assert.match(result.data, /action,count/);
  assert.match(result.data, new RegExp(`${PREFIX}_aggcsv,1`));
  assert.doesNotMatch(result.data, new RegExp(`${PREFIX}_aggcsv_old`));
});

test('BR8-01: hours and minutes windows survive export() as well', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_m30`, actor: ALICE, offset: '-30 minutes' });
  await insert(d1, { action: `${PREFIX}_h3`, actor: ALICE, offset: '-3 hours' });
  const actions = actionList('m30', 'h3');

  const in45m = await service.export({ format: 'json', filters: { time_range: '45m', actions } });
  const in6h = await service.export({ format: 'json', filters: { time_range: '6h', actions } });

  assert.equal(in45m.success, true, `45m must succeed: ${in45m.error || ''}`);
  assert.deepEqual(in45m.data.map((row) => row.action), [`${PREFIX}_m30`]);
  assert.equal(in6h.success, true, `6h must succeed: ${in6h.error || ''}`);
  assert.deepEqual(
    in6h.data.map((row) => row.action).sort(),
    [`${PREFIX}_h3`, `${PREFIX}_m30`]
  );
});

// Test-only SQL clock: all statements still execute on real D1/SQLite. Only
// SQLite's reference literal changes; comparisons, modifiers and binds stay real.
function sqlClock(db, reference) {
  assert.match(reference, /^2026-09-28 12:00:0[01]$/);
  return { prepare: sql => db.prepare(sql.replace(/(['"])now\1/g, `'${reference}'`)) };
}

test('BR11-05: controlled second rollover reproduces the historical boundary oracle failure', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert({ db: sqlClock(d1.db, '2026-09-28 12:00:00') },
    { action: `${PREFIX}_rollover`, actor: ALICE, offset: '-2 hours' });
  const moving = new AuditExportService({ DB: sqlClock(d1.db, '2026-09-28 12:00:01') });
  const result = await moving.export({ format: 'json', filters: { time_range: '2h', actions: actionList('rollover') } });
  assert.equal(result.success, true);
  assert.deepEqual(result.data, [], 'one second later the seeded row is older than the cutoff; the old test oracle was wrong');
});

for (const reference of ['2026-09-28 12:00:00', '2026-09-28 12:00:01']) {
  test(`BR8-01/BR11-05: fixed SQL reference ${reference} includes exact/after cutoff and excludes one second before`, async () => {
    await reset();
    const d1 = await d1Promise;
    const fixed = { db: sqlClock(d1.db, reference) };
    // One reference for seed and query. No sleep, broadened window or global clock patch.
    for (const [suffix, offset] of [['before', '-7201 seconds'], ['exact', '-7200 seconds'], ['after', '-7199 seconds']]) {
      await insert(fixed, { action: `${PREFIX}_edge_${suffix}`, actor: ALICE, offset });
    }
    const scoped = new AuditExportService({ DB: fixed.db });
    const result = await scoped.export({ format: 'json', filters: {
      time_range: '2h', actions: actionList('edge_before', 'edge_exact', 'edge_after')
    } });
    assert.equal(result.success, true, `boundary export: ${result.error || ''}`);
    assert.deepEqual(result.data.map(row => row.action).sort(), [`${PREFIX}_edge_after`, `${PREFIX}_edge_exact`]);
  });
}

test('BR8-01: a client cannot smuggle a raw SQLite modifier past validation', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_smuggle`, actor: ALICE });
  const { service: traced, statements } = tracedService(d1);

  // The shape a client would need to send to reach `datetime('now', ?)` with a
  // modifier of their choosing. It must be refused, not normalised.
  const result = await traced.export({
    format: 'json',
    filters: { time_range: '-7 days; DROP TABLE audit_logs--' }
  });

  assert.equal(result.success, false);
  assert.equal(result.error, 'INVALID_EXPORT_FILTER');
  assert.equal(result.statusCode, 400);
  assert.equal(
    readAuditRows(statements),
    false,
    'a refused filter must not read export rows'
  );
});

test('BR8-01: internal filters are not re-parsed, and raw ones are refused at the boundary', async () => {
  // The private builders take normalised input. Handing them raw input is a
  // programming error, and it is now caught where the harm would happen - the
  // exact mistake that produced BR8-01 - instead of surfacing as a 500.
  assert.throws(
    () => service.buildExportWhere({ time_range: '7d', limit: 10 }),
    /normalizeExportFilters/,
    'a raw time_range must not reach the shared WHERE builder'
  );

  // The normalised form is accepted, and the modifier is still bound.
  const fragment = service.buildExportWhere({ time_range: '-7 days', limit: 10 });
  assert.match(fragment.sql, /julianday\(timestamp\) >= julianday\("now", \?\)/);
  assert.deepEqual(fragment.params, ['-7 days']);
});

test('BR8-02: the published ceiling is accepted and one step above it is refused', async () => {
  // At the boundary: a range the contract publishes is a range the service
  // offers, so it must reach the store rather than being refused by a rule the
  // client was never told about.
  const atBoundary = ['3650d', '87600h', '5256000m'];
  for (const value of atBoundary) {
    const normalized = service.normalizeExportFilters({ time_range: value });
    assert.ok(
      normalized.time_range.startsWith('-'),
      `${value} is published as supported, so it must normalise`
    );
  }

  const result = await service.export({ format: 'json', filters: { time_range: '3650d' } });
  assert.equal(
    result.success,
    true,
    `the published maximum must be exportable: ${result.error || ''} ${result.message || ''}`
  );
  assert.ok(Array.isArray(result.data));

  // One step above each ceiling is a caller error, and the message names the
  // ceiling so the client can see which rule it broke.
  for (const value of ['3651d', '87601h', '5256001m']) {
    const outcome = await service.export({ format: 'json', filters: { time_range: value } });
    assert.equal(outcome.success, false, `${value} is above the published ceiling`);
    assert.equal(outcome.error, 'INVALID_EXPORT_FILTER', `${value} is a caller error, not a fault`);
    assert.equal(outcome.statusCode, 400, `${value} must be a 400, never a 200 or a 500`);
    assert.match(outcome.message, /at most/, `${value} must be told the ceiling`);
  }
});

test('BR8-02: a cutoff SQLite cannot render is refused, and never becomes an empty success', async () => {
  await reset();
  const d1 = await d1Promise;
  await insert(d1, { action: `${PREFIX}_huge`, actor: ALICE });
  const { service: traced, statements } = tracedService(d1);

  // The value that produced the empty success: a safe integer, so it passed the
  // old check, but a modifier SQLite renders as NULL. The domain check now
  // catches it, and the representability probe is the backstop behind that.
  const huge = await traced.export({ format: 'json', filters: { time_range: '9007199254740991d' } });

  assert.equal(huge.success, false, 'a cutoff the store cannot render must not report success');
  assert.equal(huge.error, 'INVALID_EXPORT_FILTER');
  assert.equal(huge.statusCode, 400);
  assert.equal(huge.data, undefined, 'a refusal carries no rows');
  assert.equal(readAuditRows(statements), false, 'no export row may be read for a refused cutoff');

  // The probe itself, on the same engine: this is the fact the refusal rests on.
  const { results } = await d1.db
    .prepare('SELECT datetime(\'now\', ?) AS cut')
    .bind('-9007199254740991 days')
    .all();
  assert.equal(results[0].cut, null, 'precondition: SQLite returns NULL for that modifier');
});

test('BR8-02: a value inside the published domain that SQLite still cannot render is refused', () => {
  // The domain check and the store check are two different things, and this
  // proves the second one is not merely a re-run of the first: a binding that
  // reports "not representable" for an in-domain modifier must still be refused,
  // because the guarantee is "no unrepresentable cutoff becomes a success",
  // not "the domain is small enough".
  const refusing = new AuditExportService({
    DB: {
      prepare: (sql) => ({
        bind: () => ({
          first: async () => (sql.includes('datetime(\'now\', ?)') ? { representable: 0 } : { representable: 0 })
        })
      })
    }
  });

  return refusing.export({ format: 'json', filters: { time_range: '7d' } }).then((result) => {
    assert.equal(result.success, false);
    assert.equal(result.error, 'INVALID_EXPORT_FILTER');
    assert.equal(result.statusCode, 400);
  });
});

test('BR8-02: a store that is down for the cutoff check is a 503, not a bad filter', async () => {
  const down = new AuditExportService({
    DB: {
      prepare: () => ({
        bind: () => ({ first: async () => { throw new Error('D1_ERROR: database is unavailable'); } })
      })
    }
  });

  const result = await down.export({ format: 'json', filters: { time_range: '7d' } });

  assert.equal(result.success, false);
  assert.equal(result.error, 'DB_UNAVAILABLE', 'a dependency fault is not a caller error');
  assert.equal(result.statusCode, 503);
});

test('BR8-02: invalid time_range values are refused before any export row is read', async () => {
  await reset();
  const d1 = await d1Promise;
  const { service: traced, statements } = tracedService(d1);

  const invalid = [
    '0d', '0h', '0m',            // no window at all
    '7w', '7', 'd7', '-7d',      // wrong unit or shape
    '7.5d', '1e3d', '', '  ',    // not a whole number
    '3651d', '87601h', '5256001m', // above the published ceiling
    '9007199254740991d',         // safe integer, unrepresentable cutoff
    '  7d  ',                   // padded, valid
    7,                          // a number, not a range string
    {}                          // an object, not a range string
  ];
  for (const value of invalid) {
    if (value === '  7d  ') {
      continue; // listed to make the padding case explicit below
    }
    const result = await traced.export({ format: 'json', filters: { time_range: value } });
    assert.equal(result.success, false, `time_range ${JSON.stringify(value)} must be refused`);
    assert.equal(result.error, 'INVALID_EXPORT_FILTER', `${JSON.stringify(value)} is a caller error`);
    assert.equal(result.statusCode, 400, `${JSON.stringify(value)} must be a 400`);
  }

  assert.equal(
    readAuditRows(statements),
    false,
    'not one refused time_range may read an export row'
  );

  // `null` and an absent key both mean "no window", which is the long-standing
  // contract for this filter and is what the capabilities advertise. Stated here
  // so a later reader does not assume it was an oversight.
  for (const absent of [{ time_range: null }, {}]) {
    const result = await traced.export({ format: 'json', filters: absent });
    assert.equal(result.success, true, `${JSON.stringify(absent)} means no window, not a bad one`);
  }

  // Padding around a valid range is still the same range, not a new refusal.
  const padded = await traced.export({ format: 'json', filters: { time_range: '  7d  ' } });
  assert.equal(padded.success, true, `surrounding whitespace must be tolerated: ${padded.error || ''}`);
});

test('BR8-02: the ceiling is published, so a client can read it instead of guessing', () => {
  const capabilities = service.getCapabilities();

  assert.deepEqual(
    capabilities.time_range_max,
    { d: 3650, h: 87600, m: 5256000 },
    'the advertised ceiling must be the one that is enforced'
  );
  assert.deepEqual(
    Object.keys(capabilities.time_range_units).sort(),
    Object.keys(capabilities.time_range_max).sort(),
    'a unit with no ceiling, or a ceiling with no unit, is a contract hole'
  );
  assert.equal(capabilities.time_range_max_is, 'refused_above');
});

for (const aggregate of [false, true]) {
  test(`T7: mixed timestamp formats honor the same millisecond cutoff (aggregate=${aggregate})`, async () => {
    await reset();
    const d1 = await d1Promise;
    for (const format of ['sqlite', 'iso', 'offset']) {
      for (const [suffix, clock] of [['before', '11:58:59.999'], ['exact', '11:59:00.000'], ['after', '11:59:00.001']]) {
        const timestamp = format === 'sqlite' ? `2026-09-28 ${clock}`
          : `2026-09-28T${clock}${format === 'iso' ? 'Z' : '+00:00'}`;
        await d1.db.prepare('INSERT INTO audit_logs (action, actor_role, status, actor_email, timestamp) VALUES (?, ?, ?, ?, ?)')
          .bind(`${PREFIX}_mixed_${format}_${suffix}`, 'user', 'SUCCESS', ALICE, timestamp).run();
      }
    }
    const scoped = new AuditExportService({ DB: sqlClock(d1.db, '2026-09-28 12:00:00') });
    const filters = { time_range: '1m', actions: ['sqlite', 'iso', 'offset'].flatMap(format => ['before', 'exact', 'after'].map(suffix => `${PREFIX}_mixed_${format}_${suffix}`)) };
    const result = await scoped.export({ format: 'json', filters, ...(aggregate ? { aggregation: { group_by: ['action'], metrics: ['count'] } } : {}) });
    assert.equal(result.success, true, result.error);
    assert.equal(result.data.length, 6);
    assert.ok(result.data.every(row => !row.action.endsWith('_before')));
  });
}
