/**
 * T7 / B10 - the dashboard queries have to run.
 *
 * Every assertion here executes the real SQL against a migrated SQLite
 * database and checks the numbers. Comparing SQL strings would have passed on
 * the query that never parses.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { startD1 } from './helpers/d1-local.mjs';
import { DatabaseService } from '../../src/services/databaseService.js';
import { AuditDashboardService } from '../../src/services/auditDashboardService.js';

const HOUR = 60 * 60 * 1000;

let d1Promise;

test.before(async () => {
  d1Promise = Promise.resolve(await startD1());
});

test.after(async () => {
  const d1 = await d1Promise;
  if (d1) {
    await d1.dispose();
  }
});

async function clearLogs() {
  const d1 = await d1Promise;
  await d1.db.prepare('DELETE FROM audit_logs').run();
}

/**
 * audit_logs.actor_id is a foreign key, so a fixture row that names an actor
 * needs that actor to exist. The dashboard groups by actor_id, so the ids are
 * what make the grouping observable.
 */
async function seedUsers(count) {
  const d1 = await d1Promise;
  const ids = [];
  for (let i = 0; i < count; i += 1) {
    const result = await d1.db
      .prepare(
        `INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
      )
      .bind(`Actor ${i}`, `actor${i}-${Date.now()}@x.test`, 'not-a-hash', i === 0 ? 'user' : 'admin', 'active')
      .run();
    ids.push(Number(result.meta.last_row_id));
  }
  return ids;
}

async function insertLog({ action, actorRole, status, actorId = null, actorEmail = null, ip = null, details = null, hoursAgo = 1 }) {
  const d1 = await d1Promise;
  const timestamp = new Date(Date.now() - hoursAgo * HOUR).toISOString();
  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, status, actor_id, actor_email, ip_address, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
    )
    .bind(action, actorRole, status, actorId, actorEmail, ip, details, timestamp)
    .run();
}

function aggregator() {
  const d1PromiseRef = d1Promise;
  let db = null;
  return {
    async ready() {
      const d1 = await d1PromiseRef;
      if (!db) {
        db = new DatabaseService({ DB: d1.db });
      }
      return new AuditDashboardService({ DB: d1.db }).aggregator;
    }
  };
}

// ---------------------------------------------------------------------------
// The query that does not parse
// ---------------------------------------------------------------------------

test('B10: the user activity distribution query runs and groups', async () => {
  await clearLogs();
  const [alice, bob] = await seedUsers(2);
  await insertLog({ action: 'login', actorRole: 'user', status: 'SUCCESS', actorId: alice, actorEmail: 'a@x.test' });
  await insertLog({ action: 'login', actorRole: 'user', status: 'FAILURE', actorId: alice, actorEmail: 'a@x.test' });
  await insertLog({ action: 'user_delete', actorRole: 'admin', status: 'SUCCESS', actorId: bob, actorEmail: 'b@x.test' });

  const { ready } = aggregator();
  const service = await ready();

  const result = await service.getUserActivityDistribution();

  assert.ok(Array.isArray(result.byRole), 'roles are reported');
  assert.ok(Array.isArray(result.topUsers), 'users are reported');
  assert.ok(Array.isArray(result.actionDistribution), 'actions are reported');

  // The query aliases the grouping column as `role`.
  const roles = Object.fromEntries(result.byRole.map((row) => [row.role, Number(row.event_count)]));
  assert.equal(roles.user, 2, 'the two user events are counted together');
  assert.equal(roles.admin, 1);

  const actions = Object.fromEntries(result.actionDistribution.map((row) => [row.action, Number(row.count)]));
  assert.equal(actions.login, 2);
  assert.equal(actions.user_delete, 1);
});

test('B10: the real time dashboard runs, not just the query underneath it', async () => {
  await clearLogs();
  const [alice] = await seedUsers(1);
  await insertLog({ action: 'login', actorRole: 'user', status: 'SUCCESS', actorId: alice, actorEmail: 'a@x.test' });

  const { ready } = aggregator();
  const service = await ready();

  const result = await service.getRealTimeDashboard();

  assert.ok(result, 'a dashboard is returned rather than a thrown error');
  assert.ok(Object.keys(result).length > 0, 'and it has content');
});

test('B10: an action with failures reports the split it actually has', async () => {
  await clearLogs();
  const [alice, bob] = await seedUsers(2);
  await insertLog({ action: 'login', actorRole: 'user', status: 'SUCCESS', actorId: alice, actorEmail: 'a@x.test' });
  await insertLog({ action: 'login', actorRole: 'user', status: 'FAILURE', actorId: alice, actorEmail: 'a@x.test' });
  await insertLog({ action: 'login', actorRole: 'user', status: 'FAILURE', actorId: bob, actorEmail: 'b@x.test' });

  const { ready } = aggregator();
  const service = await ready();
  const result = await service.getUserActivityDistribution();

  const login = result.actionDistribution.find((row) => row.action === 'login');
  assert.ok(login, 'the action appears');
  assert.equal(Number(login.count), 3, 'three events');
  assert.equal(Number(login.failures), 2, 'two of them failed');
  assert.equal(Number(login.unique_users), 2);
  assert.equal(login.success_rate, '33.3', 'and the rate follows from those numbers');
});

test('B10: the LIMIT 15 really truncates a longer distribution', async () => {
  await clearLogs();
  for (let i = 0; i < 20; i += 1) {
    await insertLog({ action: `bulk_action_${String(i).padStart(2, '0')}`, actorRole: 'user', status: 'SUCCESS' });
  }

  const { ready } = aggregator();
  const service = await ready();
  const result = await service.getUserActivityDistribution();

  assert.equal(
    result.actionDistribution.length,
    15,
    'the query caps at 15 rows and the service does not quietly return 20'
  );
});

test('B10: an empty window is an empty result, not an error', async () => {
  await clearLogs();

  const { ready } = aggregator();
  const service = await ready();
  const result = await service.getUserActivityDistribution();

  assert.deepEqual(result.actionDistribution, []);
  assert.deepEqual(result.topUsers, []);
});

test('B10: every dashboard query in the service executes on the migrated schema', async () => {
  await clearLogs();
  const [alice, bob] = await seedUsers(2);
  await insertLog({ action: 'login', actorRole: 'user', status: 'SUCCESS', actorId: alice, actorEmail: 'a@x.test', ip: '10.0.0.1' });
  await insertLog({ action: 'login_failed', actorRole: 'user', status: 'FAILURE', actorId: alice, actorEmail: 'a@x.test', ip: '10.0.0.1' });
  await insertLog({
    action: 'user_delete',
    actorRole: 'admin',
    status: 'SUCCESS',
    actorId: bob,
    actorEmail: 'b@x.test',
    ip: '10.0.0.2',
    details: JSON.stringify({ target: 'someone' })
  });

  const { ready } = aggregator();
  const service = await ready();

  const queries = [
    'getOverviewStats',
    'getActivityTimeline',
    'getUserActivityDistribution',
    'getGeographicDistribution',
    'getSecurityMetrics',
    'getPerformanceMetrics',
    'getRealTimeDashboard'
  ];

  for (const name of queries) {
    service.clearCache();
    const result = await service[name]();
    assert.ok(result && typeof result === 'object', `${name} returns a result`);
  }
});
