/**
 * T5/B05/B06/B07: archival, truncation and restore on a real D1 database.
 *
 * The in-process stubs used elsewhere can only prove which SQL string was
 * built. They cannot catch the failure modes that matter here: a constraint
 * violation that aborts a transaction, a batch that D1 rolls back, an OFFSET
 * that skips rows after a delete, or a column that does not exist. Those need
 * the real schema, so this file runs against Miniflare with `migrations/*.sql`
 * applied.
 *
 * The gate for this file is "0 rows lost": every row that leaves hot storage is
 * present in the archive with the same content, and a failure leaves both sides
 * untouched.
 */
import { test, before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { startD1, applyMigrations, tableColumns } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n } from '../regression/helpers/local-env.mjs';
import {
  buildArchiveSelection,
  buildCategoryPredicate,
  resolveRetentionPolicy,
  retentionCategories,
  validateRetentionDays
} from '../../src/services/auditRetentionPolicy.js';
import {
  chunkForTransaction,
  MAX_ROWS_PER_TRANSACTION,
  MAX_STATEMENTS_PER_TRANSACTION
} from '../../src/services/auditArchivalService.js';

let d1;
let AuditArchivalService;
let env;

/** Fixed "now" so cutoffs are deterministic. */
const NOW = new Date('2026-09-27T12:00:00.000Z');

let nextUserId = 0;

/**
 * Create a user so an audit row can reference it.
 *
 * `audit_logs.actor_id` has a foreign key to `users(id)`, so a row cannot be
 * seeded with an arbitrary actor id.
 * @param {string} [label] - Used to build a unique email
 * @returns {Promise<number>} The new user id
 */
async function seedUser(label = 'u') {
  nextUserId += 1;
  const email = `actor-${label}-${nextUserId}@example.invalid`;
  await d1.db.prepare('INSERT INTO users (full_name, email, password) VALUES (?, ?, ?)').bind(label, email, 'x').run();
  const { results } = await d1.db.prepare('SELECT last_insert_rowid() AS id').all();
  return Number(results[0].id);
}

/**
 * Insert an audit row, defaulting to something the general category owns.
 * @param {Object} [overrides] - Column overrides
 * @returns {Promise<number>} The new id
 */
async function seedLog(overrides = {}) {
  const row = {
    action: 'debug_ping',
    actor_id: null,
    actor_email: null,
    actor_role: 'system',
    target_type: null,
    target_id: null,
    target_identifier: null,
    request_id: null,
    details: null,
    old_values: null,
    new_values: null,
    status: 'SUCCESS',
    error_message: null,
    ip_address: null,
    user_agent: null,
    timestamp: new Date(NOW.getTime() - 400 * 86400000).toISOString(),
    ...overrides
  };
  await d1.db.prepare(
    `INSERT INTO audit_logs (action, actor_id, actor_email, actor_role, target_type, target_id,
       target_identifier, request_id, details, old_values, new_values, status, error_message,
       ip_address, user_agent, timestamp)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    row.action, row.actor_id, row.actor_email, row.actor_role, row.target_type, row.target_id,
    row.target_identifier, row.request_id, row.details, row.old_values, row.new_values,
    row.status, row.error_message, row.ip_address, row.user_agent, row.timestamp
  ).run();
  const { results } = await d1.db.prepare('SELECT last_insert_rowid() AS id').all();
  return Number(results[0].id);
}

/**
 * Read every audit row, ordered, for comparison.
 * @returns {Promise<Object[]>} Rows
 */
async function readLogs() {
  const { results } = await d1.db.prepare('SELECT * FROM audit_logs ORDER BY id').all();
  return results;
}

/**
 * Read every archive row, ordered by the original id.
 * @returns {Promise<Object[]>} Rows
 */
async function readArchive() {
  const { results } = await d1.db.prepare('SELECT * FROM audit_logs_archive ORDER BY original_id').all();
  return results;
}

/**
 * A service bound to the real database.
 * @returns {AuditArchivalService} Service under test
 */
function service() {
  return new AuditArchivalService(env);
}

/**
 * An isolated database, so an upgrade test never shares state with the suite's
 * main instance. Without a `persist` path every `startD1` call lands on the same
 * named database, which would apply 0001 twice.
 * @returns {Promise<{db: Object, dispose: Function}>} Instance plus its own temp dir
 */
async function isolatedD1(options) {
  const dir = await mkdtemp(join(tmpdir(), 'audit-upgrade-'));
  const instance = await startD1({ ...options, persist: join(dir, 'db.sqlite') });
  return {
    db: instance.db,
    async dispose() {
      await instance.dispose();
      await rm(dir, { recursive: true, force: true });
    }
  };
}

/**
 * An ISO timestamp the given number of days before the fixed clock.
 * @param {number} days - Days before `NOW`
 * @returns {string} ISO timestamp
 */
function daysBefore(days) {
  return new Date(NOW.getTime() - days * 86400000).toISOString();
}

/**
 * A range covering everything seeded so far.
 * @returns {Object} Selection input
 */
function wideRange() {
  return {
    startDate: new Date(NOW.getTime() - 5000 * 86400000).toISOString(),
    endDate: NOW.toISOString()
  };
}

before(async () => {
  await initTestI18n();
  d1 = await startD1();
  ({ AuditArchivalService } = await import('../../src/services/auditArchivalService.js'));
  env = createTestEnv({ DB: d1.db, CONFIG_KV: { async get() { return null; }, async list() { return { keys: [] }; } } });
});

after(async () => {
  await d1?.dispose();
});

beforeEach(async () => {
  await d1.db.prepare('DELETE FROM audit_logs').run();
  await d1.db.prepare('DELETE FROM audit_logs_archive').run();
});

test('T5: automatic category archival keeps the exact cutoff and newer rows, across pages', async () => {
  const oldIds = [];
  for (let i = 0; i < 3; i += 1) {
    oldIds.push(await seedLog({ timestamp: '2026-06-29T11:59:59.000Z' }));
  }
  const keptIds = [
    await seedLog({ timestamp: '2026-06-29T12:00:00.000Z' }),
    await seedLog({ timestamp: '2026-06-29T12:00:01.000Z' }),
    await seedLog({ timestamp: '2026-09-27T12:00:00.000Z' })
  ];
  const archival = new AuditArchivalService(env);
  const options = { categoryFilter: 'general', batchSize: 2, now: NOW };
  const before = await readLogs();
  const preview = await archival.archiveOldLogs({ ...options, dryRun: true });
  assert.deepEqual(preview.errors, []);
  assert.equal(preview.total_found, 3);
  assert.deepEqual(await readLogs(), before, 'preview must not mutate either table');
  assert.deepEqual(await readArchive(), []);
  const result = await archival.archiveOldLogs({ ...options, dryRun: false });
  assert.deepEqual(result.errors, []);
  assert.equal(result.total_archived, 3);
  assert.deepEqual((await readLogs()).map(row => row.id), keptIds,
    'the 90-day cutoff is a lower retention boundary, not the start of a range to delete');
  assert.deepEqual((await readArchive()).map(row => row.original_id).sort((a, b) => a - b), oldIds);
});

test('T5: automatic category archival cannot bypass an overlapping longer policy', async () => {
  const protectedId = await seedLog({ action: 'data_export', target_type: 'security_event', timestamp: daysBefore(400) });
  const expiredId = await seedLog({ action: 'data_export', target_type: 'security_event', timestamp: daysBefore(3000) });
  const archival = new AuditArchivalService(env);
  const options = { categoryFilter: 'sensitive', now: NOW };
  const preview = await archival.archiveOldLogs({ ...options, dryRun: true });
  assert.deepEqual(preview.errors, []);
  assert.equal(preview.total_found, 1, '365-day category must respect the matching 2555-day policy');
  const result = await archival.archiveOldLogs({ ...options, dryRun: false });
  assert.deepEqual(result.errors, []);
  assert.equal(result.total_archived, 1);
  assert.deepEqual((await readLogs()).map(row => row.id), [protectedId]);
  assert.deepEqual((await readArchive()).map(row => row.original_id), [expiredId]);
});

for (const sample of [
  { label: 'uppercase action', fields: { action: 'DATA_EXPORT', timestamp: daysBefore(400) }, category: 'compliance' },
  { label: 'padded action', fields: { action: '  data_export  ', timestamp: daysBefore(400) }, category: 'compliance' },
  { label: 'padded target', fields: { target_type: '  CREDENTIAL  ', timestamp: daysBefore(200) }, category: 'sensitive' }
]) {
  test(`T5: category SQL preserves retention for ${sample.label}`, async () => {
    const id = await seedLog(sample.fields);
    const before = await readLogs();
    const archival = service();
    const preview = await archival.archiveOldLogs({ categoryFilter: 'general', dryRun: true, now: NOW });
    assert.deepEqual(preview.errors, []);
    assert.equal(preview.total_found, 0);
    const result = await archival.archiveOldLogs({ categoryFilter: 'general', dryRun: false, now: NOW });
    assert.deepEqual(result.errors, []);
    assert.equal(result.total_archived, 0);
    assert.deepEqual(await readLogs(), before);
    assert.deepEqual(await readArchive(), []);
    const predicate = buildCategoryPredicate(sample.category);
    const selected = await d1.db.prepare(`SELECT id FROM audit_logs WHERE ${predicate.sql}`).bind(...predicate.params).all();
    assert.deepEqual(selected.results.map(row => row.id), [id], 'the protected category must own the same row');
  });
}

// ---------------------------------------------------------------------------
// Schema: the archive can hold everything the hot table holds
// ---------------------------------------------------------------------------

test('T5: the archive table carries every column the hot table does', async () => {
  const archiveColumns = await tableColumns(d1.db, 'audit_logs_archive');
  const hotColumns = await tableColumns(d1.db, 'audit_logs');

  for (const column of ['actor_email', 'target_identifier', 'request_id', 'old_values', 'new_values', 'status', 'error_message']) {
    assert.ok(archiveColumns.includes(column), `audit_logs_archive must keep ${column}`);
    assert.ok(hotColumns.includes(column), `audit_logs must have ${column}`);
  }
  for (const column of ['metadata_complete', 'actor_role_synthetic', 'restored_at', 'restored_original_id']) {
    assert.ok(archiveColumns.includes(column), `provenance column ${column} is missing`);
  }

  // The restore and the audit lookup both filter on these; without the indexes
  // an archive sweep is a full table scan.
  const { results: indexes } = await d1.db.prepare('PRAGMA index_list(audit_logs_archive)').all();
  const names = indexes.map((row) => row.name);
  for (const index of ['idx_archive_status', 'idx_archive_request_id', 'idx_archive_restored_at']) {
    assert.ok(names.includes(index), `index ${index} is missing; got ${names.join(', ')}`);
  }
});

test('T5: migration 0011 does not rewrite the migrations it builds on', async () => {
  // 0003/0004 may already be deployed; this suite must not have changed them.
  const { readFile } = await import('node:fs/promises');
  const three = await readFile(new URL('../../migrations/0003_add_audit_logs.sql', import.meta.url), 'utf8');
  const four = await readFile(new URL('../../migrations/0004_add_audit_archive.sql', import.meta.url), 'utf8');
  assert.match(three, /CREATE TABLE IF NOT EXISTS audit_logs/);
  assert.match(four, /UNIQUE\(original_id\)/, 'the original_id uniqueness must remain for conflict detection');
});

// ---------------------------------------------------------------------------
// Upgrade path: a database that is already on 0010
// ---------------------------------------------------------------------------

test('T5: migration 0011 upgrades a populated 0010 database without touching its rows', async () => {
  const legacy = await isolatedD1({ migrate: false });
  try {
    const applied = await applyMigrations(legacy.db, { upTo: 10 });
    assert.ok(applied.length > 0);
    assert.ok(applied.some((name) => name.startsWith('0010')), '0010 must be in the prefix');
    assert.ok(!applied.some((name) => name.startsWith('0011')), '0011 must not be in the prefix');

    // The columns 0011 adds do not exist yet at this revision.
    const before = await tableColumns(legacy.db, 'audit_logs_archive');
    for (const column of ['status', 'actor_email', 'metadata_complete', 'actor_role_synthetic', 'restored_at']) {
      assert.ok(!before.includes(column), `${column} must not exist before 0011`);
    }

    // Two archived rows and one hot row, in the 0004 shape.
    await legacy.db.prepare(
      'INSERT INTO audit_logs (action, actor_role, status, timestamp) VALUES (?, ?, ?, ?)'
    ).bind('legacy_hot', 'system', 'SUCCESS', '2024-01-01T00:00:00.000Z').run();
    await legacy.db.prepare(
      'INSERT INTO audit_logs_archive (original_id, actor_id, actor_role, action, timestamp) VALUES (?, ?, ?, ?, ?)'
    ).bind(1, 5, 'admin', 'legacy_a', '2024-01-01T00:00:00.000Z').run();
    await legacy.db.prepare(
      'INSERT INTO audit_logs_archive (original_id, actor_id, actor_role, action, timestamp) VALUES (?, ?, ?, ?, ?)'
    ).bind(2, null, 'user', 'legacy_b', '2024-01-02T00:00:00.000Z').run();

    // Snapshot the whole table as it stands just before the upgrade. The
    // earlier migrations seed sample rows too, so a single row is not enough.
    const hotBefore = (await legacy.db.prepare('SELECT id, action FROM audit_logs ORDER BY id').all())
      .results.map((row) => [row.id, row.action]);

    const upgraded = await applyMigrations(legacy.db, { from: 10 });
    assert.ok(upgraded.some((name) => name.startsWith('0011')), '0011 must run in the upgrade pass');

    // Every row is still there, with its content intact.
    const archive = (await legacy.db.prepare('SELECT * FROM audit_logs_archive ORDER BY original_id').all()).results;
    assert.equal(archive.length, 2);
    assert.equal(archive[0].action, 'legacy_a');
    assert.equal(archive[1].action, 'legacy_b');
    assert.equal(archive[0].actor_id, 5);
    assert.equal(archive[1].actor_id, null);

    // The new columns are readable and say honestly that the data is incomplete.
    for (const row of archive) {
      assert.equal(row.status, null, 'an archived status must not be invented during the upgrade');
      assert.equal(row.metadata_complete, 0);
      assert.equal(row.actor_role_synthetic, 0, 'a real role must not be flagged as synthetic');
      assert.equal(row.restored_at, null);
    }
    // The earlier migrations insert sample rows of their own, so the whole
    // table is compared rather than a single row: none of it may change.
    const hotAfter = (await legacy.db.prepare('SELECT id, action, status, details, timestamp FROM audit_logs ORDER BY id').all()).results;
    for (const [id, action] of hotBefore) {
      const still = hotAfter.find((row) => row.id === id);
      assert.ok(still, `row ${id} must survive the upgrade`);
      assert.equal(still.action, action, `row ${id} must not be rewritten`);
    }
    assert.ok(hotAfter.some((row) => row.action === 'legacy_hot'), 'the row this test inserted must survive');

    // The only rows the upgrade may add are the migrations' own audit entries.
    // The suffix keeps growing, so this is counted per migration rather than
    // pinned to one: what matters is that nothing else appears.
    const known = new Set(hotBefore.map(([id]) => id));
    const added = hotAfter.filter((row) => !known.has(row.id));
    const appliedSuffix = upgraded.length;
    assert.equal(added.length, appliedSuffix, 'the upgrade must not add rows beyond one audit entry per migration');
    for (const row of added) {
      assert.equal(row.action, 'database_migration', `row ${row.id} must be a migration entry`);
    }
    const entry = added.find((row) => JSON.parse(row.details).migration === '0011_preserve_audit_archive');
    assert.ok(entry, '0011 must leave an audit entry naming itself');

    // That entry has to describe what actually happened. Counting the columns
    // before and after catches a stale claim in the migration's own log.
    const after = await tableColumns(legacy.db, 'audit_logs_archive');
    const details = JSON.parse(entry.details);
    assert.equal(details.migration, '0011_preserve_audit_archive');
    assert.equal(
      details.columns_added,
      after.length - before.length,
      'the migration must report how many columns it actually added'
    );
    assert.equal(details.indexes_added, 3, 'the migration adds three indexes');
  } finally {
    await legacy.dispose();
  }
});

test('T5: applying 0011 twice is refused, so a replay cannot corrupt the archive', async () => {
  const twice = await isolatedD1({ migrate: true });
  try {
    // The schema is already at 0011, so a second pass has nothing to add. The
    // failure is expected: a silent no-op here would hide a half-applied
    // migration, and a destructive re-run could drop the added columns.
    await assert.rejects(
      () => applyMigrations(twice.db, { from: 10 }),
      /duplicate column name: actor_email/i
    );
  } finally {
    await twice.dispose();
  }
});

// ---------------------------------------------------------------------------
// B07: metadata and a null actor_role
// ---------------------------------------------------------------------------

test('T5: archiving keeps every field, including status and the actor email', async () => {
  const id = await seedLog({
    action: 'user_update',
    actor_id: await seedUser('meta'),
    actor_email: 'user@example.invalid',
    target_type: 'user',
    target_identifier: 'user@example.invalid',
    request_id: 'req-001',
    details: '{"after":1}',
    old_values: '{"name":"old"}',
    new_values: '{"name":"new"}',
    status: 'FAILED',
    error_message: 'validation failed',
    ip_address: '203.0.113.7',
    user_agent: 'agent/1.0',
    timestamp: '2025-01-02T03:04:05.000Z'
  });

  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
  const result = await service().runArchival(selection);

  assert.deepEqual(result, { archived: 1, deleted: 1, selected: 1, batches: 1 });
  const [archived] = await readArchive();
  assert.equal(archived.original_id, id);
  assert.equal(archived.status, 'FAILED', 'status must not be invented as SUCCESS');
  assert.equal(archived.error_message, 'validation failed');
  assert.equal(archived.actor_email, 'user@example.invalid');
  assert.equal(archived.target_identifier, 'user@example.invalid');
  assert.equal(archived.request_id, 'req-001');
  assert.equal(archived.old_values, '{"name":"old"}');
  assert.equal(archived.new_values, '{"name":"new"}');
  assert.equal(archived.metadata_complete, 1);
  assert.equal(await readLogs().then((rows) => rows.length), 0);
});

test('T5: a row without an actor_role is archived with a flagged sentinel, not dropped', async () => {
  await seedLog({ action: 'system_tick', actor_role: null });

  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
  await service().runArchival(selection);

  const [archived] = await readArchive();
  assert.equal(archived.actor_role, 'UNKNOWN');
  assert.equal(archived.actor_role_synthetic, 1, 'the sentinel must be distinguishable from a real role');

  // The restore must turn the sentinel back into a genuine NULL.
  const restored = await service().restoreOne(archived);
  assert.equal(restored, 'restored');
  const [hot] = await readLogs();
  assert.equal(hot.actor_role, null, 'a synthetic role must not come back as a real one');
});

// ---------------------------------------------------------------------------
// B05: a duplicate id aborts the transaction instead of losing the row
// ---------------------------------------------------------------------------

test('T5: a duplicate original_id fails the batch and keeps the hot row', async () => {
  const id = await seedLog({ action: 'user_delete' });
  // A pre-existing archive entry for the same id, with different content.
  await d1.db.prepare(
    `INSERT INTO audit_logs_archive (original_id, actor_id, actor_role, action, timestamp, metadata_complete)
     VALUES (?, ?, ?, ?, ?, 1)`
  ).bind(id, 999, 'super_admin', 'stale_copy', '2020-01-01T00:00:00.000Z').run();

  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);

  // The whole batch is rejected: nothing is deleted, so nothing can be lost.
  await assert.rejects(() => service().runArchival(selection), /UNIQUE|constraint/i);

  const hot = await readLogs();
  assert.equal(hot.length, 1, 'the hot row must survive a failed archive');
  assert.equal(hot[0].id, id);
  const archive = await readArchive();
  assert.equal(archive.length, 1);
  assert.equal(archive[0].action, 'stale_copy', 'the pre-existing archive copy must be untouched');
});

test('T5: a failure in the middle of a batch loses no row', async () => {
  const ids = [];
  for (let i = 0; i < 4; i += 1) {
    ids.push(await seedLog({ action: `debug_ping_${i}` }));
  }
  // Rows 2 and 3 collide with archive entries; rows 1 and 4 are fine.
  for (const id of [ids[1], ids[2]]) {
    await d1.db.prepare(
      `INSERT INTO audit_logs_archive (original_id, actor_id, actor_role, action, timestamp, metadata_complete)
       VALUES (?, ?, ?, ?, ?, 1)`
    ).bind(id, null, 'system', 'stale', '2020-01-01T00:00:00.000Z').run();
  }

  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 4 }, { canReadAll: true }, NOW);
  await assert.rejects(() => service().runArchival(selection), /UNIQUE|constraint/i);

  assert.equal((await readLogs()).length, 4, 'all four hot rows must survive');
  assert.equal((await readArchive()).length, 2, 'only the pre-existing archive rows remain');
});

for (const operation of ['INSERT', 'DELETE']) {
  test(`T5: a silent ${operation} no-op rolls back the whole archive chunk`, async () => {
    const first = await seedLog({ action: 'debug_ping_first' });
    const second = await seedLog({ action: 'debug_ping_second' });
    const before = await readLogs();
    const table = operation === 'INSERT' ? 'audit_logs_archive' : 'audit_logs';
    const key = operation === 'INSERT' ? 'NEW.original_id' : 'OLD.id';
    await d1.db.prepare(`CREATE TRIGGER archive_noop BEFORE ${operation} ON ${table}
      WHEN ${key} = ${second} BEGIN SELECT RAISE(IGNORE); END`).run();
    try {
      const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
      await assert.rejects(() => service().runArchival(selection));
      assert.deepEqual(await readLogs(), before, 'both selected hot rows must survive unchanged');
      assert.deepEqual(await readArchive(), [], 'the first copy must also roll back');
      assert.notEqual(first, second);
    } finally {
      await d1.db.prepare('DROP TRIGGER archive_noop').run();
    }
  });
}

test('T5: a changed selected row aborts its chunk before any stale metadata is archived', async () => {
  await seedLog({ action: 'debug_ping_first' });
  const id = await seedLog({ action: 'debug_ping_second', details: 'before' });
  const selected = await readLogs();
  // A deterministic write between selection and the archive transaction.
  await d1.db.prepare('UPDATE audit_logs SET details = ? WHERE id = ?').bind('after', id).run();
  const before = await readLogs();
  await assert.rejects(() => service().copyChunk(selected));
  assert.deepEqual(await readLogs(), before);
  assert.deepEqual(await readArchive(), []);
});

test('T5: the delete only ever names the ids that were just copied', async () => {
  const archivedIds = [];
  for (let i = 0; i < 3; i += 1) {
    archivedIds.push(await seedLog({ action: `debug_ping_${i}` }));
  }

  const archival = service();
  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
  await archival.runArchival(selection);

  // A row written after the copy, inside the same range: it must be untouched,
  // because the delete is driven by the id list and not by a re-read of the range.
  const late = await seedLog({ action: 'debug_ping_late', timestamp: '2025-06-01T00:00:00.000Z' });

  const hot = await readLogs();
  assert.deepEqual(hot.map((row) => row.id), [late]);
  assert.deepEqual((await readArchive()).map((row) => row.original_id), archivedIds);
});

// ---------------------------------------------------------------------------
// B07: batching and keyset pagination
// ---------------------------------------------------------------------------

test('T5: 4 rows with batch size 2 are all processed, none skipped', async () => {
  const ids = [];
  for (let i = 0; i < 4; i += 1) {
    ids.push(await seedLog({ action: `debug_ping_${i}` }));
  }

  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 2 }, { canReadAll: true }, NOW);
  const result = await service().runArchival(selection);

  assert.equal(result.selected, 4);
  assert.equal(result.batches, 2);
  assert.equal(result.archived, 4);
  assert.equal(result.deleted, 4);
  assert.deepEqual((await readArchive()).map((row) => row.original_id), ids);
  assert.equal((await readLogs()).length, 0);
});

test('T5: a page larger than one D1 transaction is split, not truncated', async () => {
  // Each row needs an INSERT and an assertion; DELETE has its own assertion.
  // 101 rows cross two transaction boundaries under the 100-statement budget.
  const total = 101;
  const ids = [];
  for (let i = 0; i < total; i += 1) {
    ids.push(await seedLog({ action: 'debug_ping' }));
  }

  const result = await service().runArchival(
    buildArchiveSelection({ ...wideRange(), batchSize: total }, { canReadAll: true }, NOW)
  );

  assert.equal(result.archived, total, 'every row must be archived, not just the first transaction');
  assert.equal(result.deleted, total);
  assert.equal(result.batches, 3, '101 rows need three transactions');
  assert.equal((await readLogs()).length, 0);
  assert.deepEqual((await readArchive()).map((row) => row.original_id), ids);
});

test('T5: the chunk size never exceeds what a D1 batch accepts', () => {
  const rows = Array.from({ length: MAX_ROWS_PER_TRANSACTION * 3 + 1 }, (_, i) => i);
  const chunks = chunkForTransaction(rows);

  assert.equal(chunks.length, 4);
  for (const chunk of chunks) {
    // Each write has an assertion inside the same transaction.
    assert.ok(chunk.length * 2 + 2 <= MAX_STATEMENTS_PER_TRANSACTION, `chunk of ${chunk.length} exceeds the statement limit`);
  }
  assert.deepEqual(chunks.flat(), rows, 'chunking must not drop or reorder a row');
  assert.deepEqual(chunkForTransaction([]), []);
});

test('T5: a page size past the service limit is refused, not silently clamped', () => {
  assert.throws(
    () => buildArchiveSelection({ ...wideRange(), batchSize: 1001 }, {}, NOW),
    RangeError
  );
  assert.equal(buildArchiveSelection({ ...wideRange(), batchSize: 1000 }, {}, NOW).limit, 1000);
});

test('T5: the request schemas accept exactly what the service accepts', async () => {
  // The routes validated up to 10000 while the service refused anything over
  // 1000, so a request between the two passed validation and then failed as a
  // server error. Validation and the service have to agree.
  const { createTruncateQuerySchema, createArchivalQuerySchema } = await import('../../src/schemas/advancedAudit.js');
  const truncateQuerySchema = createTruncateQuerySchema('en');
  const archivalQuerySchema = createArchivalQuerySchema('en');
  const range = { startDate: wideRange().startDate, endDate: wideRange().endDate, archiveFirst: true, dryRun: true };

  assert.equal(truncateQuerySchema.parse({ ...range, batchSize: 1000 }).batchSize, 1000);
  assert.equal(truncateQuerySchema.safeParse({ ...range, batchSize: 1001 }).success, false);
  assert.equal(truncateQuerySchema.safeParse({ ...range, batchSize: 10000 }).success, false);

  assert.equal(archivalQuerySchema.parse({ dryRun: true, batchSize: 1000 }).batchSize, 1000);
  assert.equal(archivalQuerySchema.safeParse({ dryRun: true, batchSize: 1001 }).success, false);
});

test('T5: a categoryFilter the policy knows is accepted, and one it does not is refused', async () => {
  // The old enum named four fixed windows (authentication, admin_operations,
  // security_events, general) that no longer exist. A filter naming one of them
  // would have validated and then silently archived nothing, because the sweep
  // iterates the policy's own categories.
  const { createArchivalQuerySchema } = await import('../../src/schemas/advancedAudit.js');
  const archivalQuerySchema = createArchivalQuerySchema('en');

  for (const category of ['general', 'sensitive', 'administrative', 'compliance']) {
    assert.equal(archivalQuerySchema.parse({ dryRun: true, categoryFilter: category }).categoryFilter, category);
    assert.ok(retentionCategories().includes(category), `${category} must be a real category`);
  }

  for (const stale of ['authentication', 'admin_operations', 'security_events']) {
    assert.equal(
      archivalQuerySchema.safeParse({ dryRun: true, categoryFilter: stale }).success,
      false,
      `${stale} is no longer a category and must not be accepted`
    );
  }
});

test('T5: a categoryFilter that matches nothing real is refused before any row is touched', async () => {
  const archival = service();
  await assert.rejects(
    () => archival.archiveOldLogs({ dryRun: true, categoryFilter: 'security_events' }),
    /unknown retention category/,
    'a category outside the policy must not quietly archive nothing'
  );
});

test('T5: keyset pagination drains the range without skipping a row', async () => {
  // Ascending timestamps so a range can address a prefix of the set. An OFFSET
  // based page would re-read rows that the previous batch already deleted and
  // stop early, leaving rows in hot storage.
  const ids = [];
  for (let i = 0; i < 6; i += 1) {
    ids.push(await seedLog({
      action: `debug_ping_${i}`,
      timestamp: new Date(Date.UTC(2025, 0, 1 + i)).toISOString()
    }));
  }
  const archival = service();

  const result = await archival.runArchival(
    buildArchiveSelection(
      { startDate: '2025-01-01T00:00:00.000Z', endDate: '2026-01-01T00:00:00.000Z', batchSize: 2 },
      { canReadAll: true },
      NOW
    )
  );

  assert.equal(result.batches, 3, 'two rows per batch, three batches');
  assert.equal(result.archived, 6);
  assert.equal(result.deleted, 6);
  assert.equal((await readLogs()).length, 0, 'no row may be left behind');
  assert.deepEqual((await readArchive()).map((row) => row.original_id), ids);
});

test('T5: each page resumes from the previous page, never from the start', async () => {
  // The drain test above proves the outcome; this one pins the mechanism. A
  // replayed page can hide behind rows that were already deleted, so the only
  // way to know the cursor advanced is to read it out of the executed SQL.
  const ids = [];
  for (let i = 0; i < 6; i += 1) {
    ids.push(await seedLog({
      action: `debug_ping_${i}`,
      timestamp: new Date(Date.UTC(2025, 0, 1 + i)).toISOString()
    }));
  }

  const archival = service();
  const cursors = [];
  const realSelect = archival.dbService.select.bind(archival.dbService);
  archival.dbService.select = (query, params, firstOnly) => {
    if (/FROM audit_logs\b/.test(query) && /id > \?/.test(query)) {
      cursors.push(params[2]);
    }
    return realSelect(query, params, firstOnly);
  };

  await archival.runArchival(
    buildArchiveSelection(
      { startDate: '2025-01-01T00:00:00.000Z', endDate: '2026-01-01T00:00:00.000Z', batchSize: 2 },
      { canReadAll: true },
      NOW
    )
  );

  // Three pages of two, then the terminating query that finds nothing.
  assert.deepEqual(
    cursors,
    [0, ids[1], ids[3], ids[5]],
    'each page must start after the last id the previous page archived'
  );
});

test('T5: resuming from a cursor continues after the archived prefix', async () => {
  const ids = [];
  for (let i = 0; i < 6; i += 1) {
    ids.push(await seedLog({
      action: `debug_ping_${i}`,
      timestamp: new Date(Date.UTC(2025, 0, 1 + i)).toISOString()
    }));
  }
  const archival = service();

  // First pass over the first two days only.
  const prefix = await archival.runArchival(
    buildArchiveSelection(
      { startDate: '2025-01-01T00:00:00.000Z', endDate: '2025-01-02T00:00:00.000Z', batchSize: 10 },
      { canReadAll: true },
      NOW
    )
  );
  assert.equal(prefix.archived, 2);
  assert.deepEqual((await readArchive()).map((row) => row.original_id), [ids[0], ids[1]]);

  // Second pass resumes after the last archived id instead of restarting at
  // offset zero, so nothing is archived twice.
  const rest = await archival.runArchival(
    buildArchiveSelection(
      {
        startDate: '2025-01-01T00:00:00.000Z',
        endDate: '2026-01-01T00:00:00.000Z',
        batchSize: 4,
        cursorAfterId: ids[1]
      },
      { canReadAll: true },
      NOW
    )
  );

  assert.equal(rest.archived, 4, 'the remaining four rows must still be found');
  assert.equal((await readLogs()).length, 0);
  assert.deepEqual((await readArchive()).map((row) => row.original_id), ids);

  // A third pass over the same range is a no-op: the cursor is past everything.
  const again = await archival.runArchival(
    buildArchiveSelection(
      { startDate: '2025-01-01T00:00:00.000Z', endDate: '2026-01-01T00:00:00.000Z', batchSize: 4, cursorAfterId: ids[5] },
      { canReadAll: true },
      NOW
    )
  );
  assert.equal(again.archived, 0);
  assert.equal(again.batches, 0);
});

test('T5: a stale archive copy still in hot storage fails loudly instead of duplicating', async () => {
  // Two sweeps racing on the same row: one process copies the row but its
  // delete has not landed. The second sweep must refuse rather than write a
  // second copy or remove the row whose archive entry it could not verify.
  const id = await seedLog({ action: 'debug_ping_race' });
  await d1.db.prepare(
    `INSERT INTO audit_logs_archive (original_id, actor_id, actor_role, action, timestamp, metadata_complete)
     VALUES (?, ?, ?, ?, ?, 1)`
  ).bind(id, null, 'system', 'debug_ping_race', '2020-01-01T00:00:00.000Z').run();

  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
  await assert.rejects(() => service().runArchival(selection), /UNIQUE|constraint/i);

  const hot = await readLogs();
  assert.equal(hot.length, 1, 'the hot row must survive a refused sweep');
  assert.equal(hot[0].id, id);
  assert.equal((await readArchive()).length, 1, 'no second archive copy may appear');
});

test('T5: a range outside the selection is never touched', async () => {
  const inside = await seedLog({ action: 'debug_ping_inside', timestamp: '2025-01-01T00:00:00.000Z' });
  const before = await seedLog({ action: 'debug_ping_before', timestamp: '2020-01-01T00:00:00.000Z' });
  const after = await seedLog({ action: 'debug_ping_after', timestamp: NOW.toISOString() });

  const selection = buildArchiveSelection(
    { startDate: '2024-06-01T00:00:00.000Z', endDate: '2025-06-01T00:00:00.000Z', batchSize: 10 },
    { canReadAll: true },
    NOW
  );
  await service().runArchival(selection);

  assert.deepEqual((await readLogs()).map((row) => row.id).sort((a, b) => a - b), [before, after].sort((a, b) => a - b));
  assert.deepEqual((await readArchive()).map((row) => row.original_id), [inside]);
});

test('T5: boundary timestamps are included and the range is inclusive', async () => {
  const start = '2025-01-01T00:00:00.000Z';
  const end = '2025-02-01T00:00:00.000Z';
  const atStart = await seedLog({ action: 'at_start', timestamp: start });
  const atEnd = await seedLog({ action: 'at_end', timestamp: end });
  const before = await seedLog({ action: 'before', timestamp: '2024-12-31T23:59:59.999Z' });
  const after = await seedLog({ action: 'after', timestamp: '2025-02-01T00:00:00.001Z' });

  const selection = buildArchiveSelection({ startDate: start, endDate: end, batchSize: 10 }, { canReadAll: true }, NOW);
  await service().runArchival(selection);

  assert.deepEqual((await readArchive()).map((row) => row.original_id).sort((a, b) => a - b), [atStart, atEnd].sort((a, b) => a - b));
  assert.deepEqual((await readLogs()).map((row) => row.id).sort((a, b) => a - b), [before, after].sort((a, b) => a - b));
});

// ---------------------------------------------------------------------------
// B06: the general category must not swallow protected events
// ---------------------------------------------------------------------------

test('T5: a general sweep never removes a security, admin or compliance event', async () => {
  const protectedIds = [
    await seedLog({ action: 'password_change', timestamp: '2025-01-01T00:00:00.000Z' }),
    await seedLog({ action: 'logout_all', timestamp: '2025-01-01T00:00:00.000Z' }),
    await seedLog({ action: 'user_delete', timestamp: '2025-01-01T00:00:00.000Z' }),
    await seedLog({ action: 'data_export', timestamp: '2025-01-01T00:00:00.000Z' }),
    await seedLog({ action: 'login_failed', status: 'SECURITY_EVENT', timestamp: '2025-01-01T00:00:00.000Z' }),
    await seedLog({ action: 'debug_ping', target_type: 'credential', timestamp: '2025-01-01T00:00:00.000Z' })
  ];
  const generalId = await seedLog({ action: 'debug_ping', timestamp: '2025-01-01T00:00:00.000Z' });

  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
  await service().runArchival(selection, 'general');

  const hot = (await readLogs()).map((row) => row.id);
  for (const id of protectedIds) {
    assert.ok(hot.includes(id), `${id} must not be removed by a general sweep`);
  }
  assert.ok(!hot.includes(generalId), 'the general row should have been archived');
});

test('T5: a security event resolves to a longer retention than a debug line', async () => {
  const config = { AUDIT_DEFAULT_RETENTION_DAYS: 30, AUDIT_SENSITIVE_RETENTION_DAYS: 365 };
  const general = resolveRetentionPolicy({ action: 'debug_ping' }, config);
  const security = resolveRetentionPolicy({ action: 'password_change' }, config);

  assert.equal(general.days, 30);
  assert.equal(security.days, 365);
  assert.ok(security.cutoff < general.cutoff, 'a longer retention must produce an earlier cutoff');
});

test('T5: overlapping categories keep the longest retention', async () => {
  const config = { AUDIT_SENSITIVE_RETENTION_DAYS: 400, AUDIT_COMPLIANCE_RETENTION_DAYS: 2000 };
  const both = resolveRetentionPolicy({ action: 'data_export', target_type: 'security_event' }, config);

  assert.ok(both.categories.length > 1, 'the event must match more than one category');
  assert.equal(both.category, 'compliance');
  assert.equal(both.days, 2000, 'the longer window must win so nothing is deleted early');
});

test('T5: an unusable configured duration is refused instead of shortening retention', async () => {
  for (const value of ['abc', 0, -5, 1.5, 99999]) {
    assert.equal(validateRetentionDays(value, 'sensitive').valid, false, `${value} must be rejected`);
  }
  assert.equal(validateRetentionDays(365, 'sensitive').days, 365);

  const { InvalidConfigValueError } = await import('../../src/utils/serviceErrors.js');
  assert.throws(
    () => resolveRetentionPolicy({ action: 'password_change' }, { AUDIT_SENSITIVE_RETENTION_DAYS: 'soon' }),
    (error) => error instanceof InvalidConfigValueError
  );
});

// ---------------------------------------------------------------------------
// dry-run and execute share one predicate
// ---------------------------------------------------------------------------

test('T5: a dry run and the execution agree on the same range', async () => {
  const ids = [];
  for (let i = 0; i < 3; i += 1) {
    ids.push(await seedLog({ action: `debug_ping_${i}` }));
  }
  const archival = service();

  const preview = await archival.truncateLogsByDateRange({ ...wideRange(), dryRun: true });
  assert.equal(preview.would_delete, 3);
  assert.equal(preview.archived_count, 0);
  assert.equal((await readLogs()).length, 3, 'a preview must not delete anything');

  const executed = await archival.truncateLogsByDateRange({
    ...wideRange(),
    dryRun: false,
    confirmDelete: true,
    batchSize: 2
  });

  assert.equal(executed.total_found, preview.would_delete, 'preview and execution must count the same rows');
  assert.equal(executed.archived_count, 3);
  assert.equal(executed.deleted_count, 3);
  assert.deepEqual((await readArchive()).map((row) => row.original_id), ids);
});

test('T5: truncation refuses to run without archiveFirst and confirmation', async () => {
  const archival = service();
  await assert.rejects(
    () => archival.truncateLogsByDateRange({ ...wideRange(), archiveFirst: false, confirmDelete: true }),
    /ARCHIVE_FIRST_REQUIRED/
  );
  await assert.rejects(
    () => archival.truncateLogsByDateRange({ ...wideRange(), archiveFirst: true, confirmDelete: false }),
    /CONFIRM_DELETE_REQUIRED/
  );
});

test('T5: an invalid range is refused before anything is queried', () => {
  assert.throws(() => buildArchiveSelection({ startDate: 'nope', endDate: 'also-nope' }, {}, NOW), TypeError);
  assert.throws(
    () => buildArchiveSelection({ startDate: '2026-01-02T00:00:00.000Z', endDate: '2026-01-01T00:00:00.000Z' }, {}, NOW),
    RangeError
  );
  assert.throws(
    () => buildArchiveSelection({ startDate: '2026-01-01T00:00:00.000Z', endDate: '2026-01-02T00:00:00.000Z', batchSize: 5000 }, {}, NOW),
    RangeError
  );
  assert.throws(
    () => buildArchiveSelection({ startDate: '2026-01-01T00:00:00.000Z', endDate: '2026-01-02T00:00:00.000Z', category: '1=1' }, {}, NOW),
    RangeError
  );
});

// ---------------------------------------------------------------------------
// B08: the retention cleanup goes through the same archive-then-delete path
// ---------------------------------------------------------------------------

test('T5: a retention cleanup archives before it deletes, and its preview agrees', async () => {
  const { AuditRetentionService } = await import('../../src/services/auditRetentionService.js');
  const old = await seedLog({ action: 'debug_ping', timestamp: daysBefore(400) });
  const recent = await seedLog({ action: 'debug_ping', timestamp: daysBefore(3) });

  const retention = new AuditRetentionService(env);

  const preview = await retention.auditLogCleanup(90, { dryRun: true });
  assert.equal(preview.total_found, 1, 'only the row older than the window is eligible');
  assert.equal(preview.deleted_count ?? 0, 0, 'a preview deletes nothing');

  const executed = await retention.auditLogCleanup(90, { dryRun: false });
  assert.equal(executed.total_found, preview.total_found, 'preview and execution must count the same rows');
  assert.equal(executed.archived_count, 1);
  assert.equal(executed.deleted_count, 1);

  const hot = await readLogs();
  assert.deepEqual(hot.map((row) => row.id), [recent], 'the recent row must survive');
  assert.deepEqual((await readArchive()).map((row) => row.original_id), [old]);
});

test('T5: a retention cleanup leaves a security event inside the window alone', async () => {
  const { AuditRetentionService } = await import('../../src/services/auditRetentionService.js');
  await seedLog({ action: 'password_change', timestamp: daysBefore(200) });
  const retention = new AuditRetentionService(env);

  // 200 days old and inside a 90-day window? No: it is outside the window, so a
  // plain cutoff would remove it. The general predicate must not, because the
  // sensitive window is 365 days.
  const outcome = await retention.auditLogCleanup(90, { dryRun: true });
  assert.equal(outcome.total_found, 0, 'a security event is not eligible on the general schedule');
  assert.equal((await readLogs()).length, 1);
});

test('T5: the executed sweep also leaves the protected event in place', async () => {
  // The preview and the execution are separate code paths. Checking only the
  // count would let a sweep report one number and archive another.
  const protectedId = await seedLog({ action: 'password_change', timestamp: daysBefore(200) });
  const generalId = await seedLog({ action: 'debug_ping', timestamp: daysBefore(200) });

  const archival = service();
  const range = {
    startDate: new Date(0).toISOString(),
    endDate: daysBefore(90)
  };

  const executed = await archival.truncateLogsByDateRange({
    ...range,
    batchSize: 10,
    archiveFirst: true,
    confirmDelete: true
  });

  assert.equal(executed.total_found, 1, 'only the general row is eligible');
  assert.equal(executed.archived_count, 1);
  assert.equal(executed.deleted_count, 1);

  const hot = (await readLogs()).map((row) => row.id);
  assert.deepEqual(hot, [protectedId], 'the security event must still be in hot storage');
  assert.deepEqual((await readArchive()).map((row) => row.original_id), [generalId]);
});

test('T5: a preview and an execution report the same protected categories', async () => {
  // A caller has to be able to read one field to know what the policy held back,
  // and the shape must not depend on whether the call was a dry run.
  const archival = service();
  const range = { startDate: new Date(0).toISOString(), endDate: daysBefore(90) };
  // One clock for both calls, so any difference in the answer is a real
  // difference in the two code paths and not the wall clock moving underneath.
  const clock = { now: NOW };

  const preview = await archival.truncateLogsByDateRange({
    ...range,
    ...clock,
    batchSize: 10,
    archiveFirst: true,
    confirmDelete: true,
    dryRun: true
  });
  const executed = await archival.truncateLogsByDateRange({
    ...range,
    ...clock,
    batchSize: 10,
    archiveFirst: true,
    confirmDelete: true
  });

  for (const result of [preview, executed]) {
    assert.ok(Array.isArray(result.protected_by_policy), 'every answer must carry the list');
    assert.ok(
      result.protected_by_policy.some((entry) => entry.category === 'sensitive'),
      `sensitive must be reported as protected, got ${JSON.stringify(result.protected_by_policy)}`
    );
  }
  assert.deepEqual(
    preview.protected_by_policy,
    executed.protected_by_policy,
    'the same policy must produce the same list either way'
  );
});

test('T5: a protected event past its own window becomes eligible again', async () => {
  // Protection is per row, not per category: a security event older than the
  // sensitive window is no longer held back, and refusing to archive it would
  // make the archive grow without bound.
  const expired = await seedLog({ action: 'password_change', timestamp: daysBefore(400) });
  const archival = service();

  const result = await archival.truncateLogsByDateRange({
    startDate: new Date(0).toISOString(),
    endDate: daysBefore(90),
    batchSize: 10,
    archiveFirst: true,
    confirmDelete: true
  });

  assert.equal(result.total_found, 1);
  assert.equal(result.deleted_count, 1);
  assert.equal((await readLogs()).length, 0);
  assert.deepEqual((await readArchive()).map((row) => row.original_id), [expired]);
});

test('T5: an unusable retention window is refused before any query', async () => {
  const { AuditRetentionService } = await import('../../src/services/auditRetentionService.js');
  const retention = new AuditRetentionService(env);

  for (const days of [0, -1, Number.NaN, '90']) {
    await assert.rejects(() => retention.auditLogCleanup(days, { dryRun: true }), RangeError);
  }
});

// ---------------------------------------------------------------------------
// Restore: id preserved, idempotent, conflict reported
// ---------------------------------------------------------------------------

test('T5: a restore brings the row back with the same id and every field', async () => {
  const original = {
    action: 'kv_config_update',
    actor_id: await seedUser('restore'),
    actor_email: 'admin@example.invalid',
    actor_role: 'admin',
    target_type: 'KV_CONFIG',
    target_id: 'DEBUG',
    target_identifier: 'DEBUG',
    request_id: 'req-9',
    details: '{"after":"x"}',
    old_values: '{"before":"y"}',
    new_values: '{"after":"x"}',
    status: 'SUCCESS',
    error_message: null,
    ip_address: '198.51.100.2',
    user_agent: 'agent/2',
    timestamp: '2025-05-05T05:05:05.000Z'
  };
  const id = await seedLog(original);

  const archival = service();
  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
  await archival.runArchival(selection);
  const result = await archival.restoreArchive({ archive_id: id });

  assert.equal(result.success, true);
  assert.equal(result.outcome, 'restored');
  const [hot] = await readLogs();
  for (const [field, value] of Object.entries(original)) {
    assert.equal(hot[field], value, `${field} must survive the round trip`);
  }
  assert.equal(hot.id, id, 'the original id must be preserved');
});

for (const operation of ['INSERT', 'UPDATE']) {
  test(`T5: an ignored restore ${operation} leaves hot and archive tables unchanged`, async () => {
    const id = await seedLog();
    const archival = service();
    await archival.runArchival(buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW));
    const hotBefore = await readLogs();
    const archiveBefore = await readArchive();
    const table = operation === 'INSERT' ? 'audit_logs' : 'audit_logs_archive';
    await d1.db.prepare(`CREATE TRIGGER restore_noop BEFORE ${operation} ON ${table}
      BEGIN SELECT RAISE(IGNORE); END`).run();
    try {
      await assert.rejects(() => archival.restoreOne(archiveBefore.find(row => row.original_id === id)));
      assert.deepEqual(await readLogs(), hotBefore);
      assert.deepEqual(await readArchive(), archiveBefore);
    } finally {
      await d1.db.prepare('DROP TRIGGER restore_noop').run();
    }
  });
}

test('T5: restoring twice is a no-op, not a second copy', async () => {
  const id = await seedLog({ action: 'debug_ping', actor_role: 'system' });
  const archival = service();
  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
  await archival.runArchival(selection);

  const first = await archival.restoreArchive({ archive_id: id });
  const second = await archival.restoreArchive({ archive_id: id });

  assert.equal(first.outcome, 'restored');
  assert.equal(second.outcome, 'already_present');
  assert.equal(second.restored_count, 0);
  assert.equal((await readLogs()).length, 1, 'a second restore must not duplicate the event');
  assert.equal((await readArchive()).length, 1, 'the archive copy is kept, not deleted on restore');
});

test('T5: a different event occupying the same id is a conflict and both copies survive', async () => {
  const id = await seedLog({ action: 'debug_ping' });
  const archival = service();
  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
  await archival.runArchival(selection);

  // Someone recreates the id with different content.
  await d1.db.prepare(
    'INSERT INTO audit_logs (id, action, actor_role, status, timestamp) VALUES (?, ?, ?, ?, ?)'
  ).bind(id, 'unrelated_event', 'system', 'SUCCESS', '2026-01-01T00:00:00.000Z').run();

  const result = await archival.restoreArchive({ archive_id: id });
  assert.equal(result.success, false);
  assert.equal(result.error, 'Restore conflict');
  assert.equal((await readLogs()).length, 1);
  assert.equal((await readArchive()).length, 1, 'the archive copy must not be removed on a conflict');
});

for (const field of ['actor_email', 'request_id', 'old_values', 'new_values', 'error_message', 'details']) {
  test(`T5: restore treats changed ${field}, including literal null, as a conflict`, async () => {
    const id = await seedLog();
    const archival = service();
    const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
    await archival.runArchival(selection);
    assert.equal((await archival.restoreArchive({ archive_id: id })).outcome, 'restored');
    // Literal text "null" is an audit value, not SQL NULL. The field names above
    // are fixed test cases, never request-controlled SQL identifiers.
    await d1.db.prepare(`UPDATE audit_logs SET ${field} = ? WHERE id = ?`).bind('null', id).run();
    const hotBefore = await readLogs();
    const archiveBefore = await readArchive();
    const result = await archival.restoreArchive({ archive_id: id });
    assert.equal(result.success, false);
    assert.equal(result.error, 'Restore conflict');
    assert.deepEqual(await readLogs(), hotBefore);
    assert.deepEqual(await readArchive(), archiveBefore);
  });
}

test('T5: a range restore reports conflicts without aborting the whole batch', async () => {
  const free = await seedLog({ action: 'debug_ping_free' });
  const taken = await seedLog({ action: 'debug_ping_taken' });
  const archival = service();
  const selection = buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW);
  await archival.runArchival(selection);

  await d1.db.prepare(
    'INSERT INTO audit_logs (id, action, actor_role, status, timestamp) VALUES (?, ?, ?, ?, ?)'
  ).bind(taken, 'unrelated_event', 'system', 'SUCCESS', '2026-01-01T00:00:00.000Z').run();

  const result = await archival.restoreArchivedLogs({
    startDate: wideRange().startDate,
    endDate: wideRange().endDate
  });

  assert.equal(result.restored_count, 1);
  assert.equal(result.conflicts, 1);
  assert.ok((await readLogs()).some((row) => row.id === free), 'the free row is restored');
});

test('T5: a legacy archive row is restored with its missing metadata reported, not invented', async () => {
  // Exactly the shape migration 0004 could produce: no status, no email, no
  // before/after values, and metadata_complete left at its 0 default.
  await d1.db.prepare(
    `INSERT INTO audit_logs_archive (original_id, actor_id, actor_role, action, timestamp)
     VALUES (?, ?, ?, ?, ?)`
  ).bind(4242, null, 'system', 'legacy_event', '2025-02-02T00:00:00.000Z').run();
  const id = 4242;

  const archival = service();
  const restored = await archival.restoreOne(await archival.dbService.select(
    'SELECT * FROM audit_logs_archive WHERE original_id = ?', [id], true
  ));
  assert.equal(restored, 'incomplete');

  const [hot] = await readLogs();
  assert.equal(hot.status, null, 'a missing status must stay missing, never become SUCCESS');
  assert.equal(hot.actor_email, null);
  assert.equal(hot.old_values, null);
});

test('T5: filtering a restore by user uses the archive column that exists', async () => {
  const userId = await seedUser('filter');
  await seedLog({ action: 'debug_ping', actor_id: userId, actor_role: 'user' });
  const archival = service();

  // Archive first: the restore reads `audit_logs_archive`.
  await archival.runArchival(
    buildArchiveSelection({ ...wideRange(), batchSize: 10 }, { canReadAll: true }, NOW)
  );
  assert.equal((await readLogs()).length, 0);

  const result = await archival.restoreArchivedLogs({
    startDate: wideRange().startDate,
    endDate: wideRange().endDate,
    userId
  });
  assert.equal(result.total_found, 1, 'the userId filter must not throw on a non-existent column');
  assert.equal(result.restored_count, 1);
});

for (const [format, timestamp] of [
  ['SQLite', value => value.replace('T', ' ').replace('Z', '')],
  ['ISO', value => value],
  ['offset', value => value.replace('Z', '+00:00')]
]) {
  test(`T5: automatic retention compares ${format} timestamps as instants`, async () => {
    const expired = await seedLog({ timestamp: timestamp('2026-06-29T11:59:59.999Z') });
    const kept = [];
    for (const value of ['2026-06-29T12:00:00.000Z', '2026-06-29T12:00:00.001Z', '2026-06-29T23:59:59.999Z']) {
      kept.push(await seedLog({ timestamp: timestamp(value) }));
    }
    const archival = new AuditArchivalService(env);
    const options = { categoryFilter: 'general', now: NOW };
    const preview = await archival.archiveOldLogs({ ...options, dryRun: true });
    assert.equal(preview.total_found, 1);
    const result = await archival.archiveOldLogs({ ...options, dryRun: false });
    assert.deepEqual(result.errors, []);
    assert.equal(result.total_archived, 1);
    assert.deepEqual((await readLogs()).map(row => row.id), kept);
    assert.deepEqual((await readArchive()).map(row => row.original_id), [expired]);
  });
}

test('T5: mixed-format manual archive and restore use inclusive instant boundaries', async () => {
  const selected = [];
  const kept = [];
  for (const [clock, inside] of [['11:59:59.999', false], ['12:00:00.000', true], ['12:00:00.001', true], ['12:00:00.002', false]]) {
    for (const stamp of [`2025-01-01 ${clock}`, `2025-01-01T${clock}Z`, `2025-01-01T${clock}+00:00`]) {
      const id = await seedLog({ timestamp: stamp });
      (inside ? selected : kept).push(id);
    }
  }
  const range = { startDate: '2025-01-01T12:00:00.000Z', endDate: '2025-01-01T12:00:00.001Z' };
  const archival = service();
  await archival.runArchival(buildArchiveSelection(range, { canReadAll: true }, NOW));
  assert.deepEqual((await readArchive()).map(row => row.original_id).sort((a, b) => a - b), selected);
  assert.deepEqual((await readLogs()).map(row => row.id), kept);
  const restored = await archival.restoreArchivedLogs(range);
  assert.equal(restored.restored_count, selected.length);
  assert.equal((await readLogs()).length, selected.length + kept.length);
  assert.ok((await readArchive()).every(row => row.restored_at));
});
