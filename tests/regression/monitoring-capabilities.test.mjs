/**
 * T9 / BR8-04 - monitoring must advertise what it can actually do.
 *
 * `AuditMonitoringService.startMonitoring()` set `monitoringActive = true`,
 * armed a `setInterval` and returned `true`; the route turned that into a 200
 * with a `startedAt` timestamp. Nothing was polling - a Worker isolate has no
 * long-lived timer, the interval dies with the request that armed it, and a new
 * isolate starts with `monitoringActive = false` again. So the 200 was a claim
 * about a subsystem that does not exist, and it was the *only* claim: the status
 * route reported `isActive` from the same in-memory flag.
 *
 * These tests pin the honest contract:
 *   - every fresh instance advertises `continuousMonitoring: false`,
 *   - start is refused with `UNSUPPORTED_MONITORING_MODE` and arms no timer,
 *   - the refusal is visible over HTTP as a 422 carrying a request id,
 *   - status and dashboard keep working, and keep enforcing RBAC.
 *
 * The "no timer was armed" assertion watches the public timer API rather than
 * reading a private handle, so it stays a statement about behaviour instead of
 * about a field name that a Node upgrade could rename.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { Hono } from 'hono';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n, FAKE_SECRETS } from '../regression/helpers/local-env.mjs';
import { createTokenPayload, signToken } from '../../src/utils/jwt.js';
import { TokenService } from '../../src/services/tokenService.js';
import { AuditMonitoringService } from '../../src/services/auditMonitoringService.js';

const ROOT_ID = 1;
const ADMIN_ID = 2;
const USER_ID = 3;

let d1Promise;
let env;

/**
 * Record every interval a test arms, without changing what the timers do.
 *
 * A handle is captured at the moment `setInterval` is called, so a test can ask
 * "was any interval created at all" - which is the whole point. A cleared timer
 * would still be visible here, so this cannot be satisfied by cleaning up after
 * the fact.
 * @returns {Object} Watcher with `count`, `delays` and `restore()`
 */
function watchIntervals() {
  const realSetInterval = globalThis.setInterval;
  const realClearInterval = globalThis.clearInterval;
  const armed = [];

  globalThis.setInterval = function patched(fn, ms, ...rest) {
    armed.push(ms);
    return realSetInterval(fn, ms, ...rest);
  };
  globalThis.clearInterval = function patched(handle, ...rest) {
    return realClearInterval(handle, ...rest);
  };

  return {
    get count() {
      return armed.length;
    },
    get delays() {
      return [...armed];
    },
    restore() {
      globalThis.setInterval = realSetInterval;
      globalThis.clearInterval = realClearInterval;
    }
  };
}

/**
 * @param {number} userId - User the token speaks for
 * @param {string} role - Role the token claims
 * @param {string} jti - Token id
 * @returns {Promise<string>} Signed access token
 */
async function accessToken(userId, role, jti) {
  const jwtConfig = await new TokenService(env).getJwtConfig();
  const audience = Array.isArray(jwtConfig.audience) ? jwtConfig.audience[0] : jwtConfig.audience;
  return signToken(
    await createTokenPayload(
      {
        sub: `user:${userId}`,
        iss: jwtConfig.issuer,
        aud: audience,
        user_id: userId,
        full_name: `Fixture ${role}`,
        email: `${role}-fixture@example.invalid`,
        role,
        auth_version: 1,
        jti,
        scope: 'user:basic'
      },
      'access',
      env
    ),
    FAKE_SECRETS.JWT_SECRET
  );
}

/**
 * Mount the real monitoring router against the test env.
 * @returns {Promise<Object>} Request helper
 */
async function mount() {
  const realtimeRoutes = (await import('../../src/routes/realtimeMonitoring.js')).default;
  const app = new Hono();
  app.route('/api/realtime', realtimeRoutes);
  return {
    get: (path, token) => app.request(
      `http://127.0.0.1${path}`,
      { headers: { Authorization: `Bearer ${token}` } },
      env
    ),
    post: (path, token, body = {}) => app.request(
      `http://127.0.0.1${path}`,
      {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      },
      env
    )
  };
}

test.before(async () => {
  const d1 = await startD1();
  d1Promise = Promise.resolve(d1);
  await initTestI18n();
  env = createTestEnv({ DB: d1.db });

  const upsert = d1.db.prepare(`INSERT INTO users (id, email, password, full_name, role, status, auth_version, created_at, updated_at)
                                VALUES (?, ?, 'scrypt$FAKE$FAKE', ?, ?, 'active', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                                ON CONFLICT(id) DO UPDATE SET role = excluded.role, status = 'active', auth_version = 1`);
  for (const [id, role] of [[ROOT_ID, 'super_admin'], [ADMIN_ID, 'admin'], [USER_ID, 'user']]) {
    await upsert.bind(id, `${role}-fixture@example.invalid`, `Fixture ${role}`, role).run();
  }
});

test.after(async () => {
  const d1 = await d1Promise;
  if (d1) {
    await d1.dispose();
  }
});

test('T9: two fresh instances both advertise continuousMonitoring: false', () => {
  const first = new AuditMonitoringService(env);
  const second = new AuditMonitoringService(env);

  for (const instance of [first, second]) {
    const capabilities = instance.getCapabilities();
    assert.equal(capabilities.continuousMonitoring, false, 'an instance that cannot poll must not imply it can');
    assert.equal(typeof capabilities.continuousMonitoring, 'boolean', 'the flag has to be explicit, not absent');
  }
});

test('T9: startMonitoring is refused, arms no timer and leaves the service inactive', async () => {
  const instance = new AuditMonitoringService(env);
  const watcher = watchIntervals();

  try {
    await assert.rejects(
      () => instance.startMonitoring(5000),
      (error) => {
        assert.equal(error.code, 'UNSUPPORTED_MONITORING_MODE', 'the code is the contract, not the wording');
        assert.equal(error.statusCode, 422);
        return true;
      }
    );
  } finally {
    watcher.restore();
  }

  assert.equal(watcher.count, 0, 'a refused start must not arm a timer it will never run');
  assert.equal(instance.monitoringActive, false, 'a refused start must not report itself active');
  assert.equal(instance.monitoringInterval, null, 'a refused start must not leave a handle behind');
  assert.equal(instance.stopMonitoring(), false, 'there is nothing to stop');
});

test('T9: the status snapshot agrees with the capability', async () => {
  const instance = new AuditMonitoringService(env);
  await assert.rejects(() => instance.startMonitoring());

  const stats = instance.getMonitoringStats();
  assert.equal(stats.monitoring.active, false);
  assert.equal(stats.capabilities.continuousMonitoring, false, 'the snapshot is where an operator looks first');
  assert.equal(stats.monitoring.lastProcessedId, 0, 'nothing was ever polled, so nothing was processed');
});

test('T9: POST /monitoring/start is a 422 that names the reason and correlates', async () => {
  const { post } = await mount();
  const token = await accessToken(ROOT_ID, 'super_admin', 'jti-t9-start-refused');
  const watcher = watchIntervals();

  let response;
  try {
    response = await post('/api/realtime/monitoring/start', token, { intervalMs: 5000 });
  } finally {
    watcher.restore();
  }

  assert.equal(response.status, 422, 'claiming a monitoring loop that cannot exist is a client-visible contract change');
  assert.equal(watcher.count, 0, 'no interval may be scheduled on the way to a 422');

  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'UNSUPPORTED_MONITORING_MODE');
  assert.equal(typeof body.requestId, 'string');
  assert.ok(body.requestId.length > 0, 'an operator has to be able to correlate the refusal with a log line');
  assert.equal(body.data?.startedAt, undefined, 'a refused start must not report a start time');
});

test('T9: monitoring status stays readable and advertises the truth over HTTP', async () => {
  const { get } = await mount();
  const token = await accessToken(ROOT_ID, 'super_admin', 'jti-t9-status-root');
  const response = await get('/api/realtime/monitoring/status', token);

  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.capabilities.continuousMonitoring, false);
  assert.equal(body.data.monitoring.active, false);
});

test('T9: the dashboard survives a monitoring mode that does not exist', async () => {
  const { get } = await mount();
  const token = await accessToken(ROOT_ID, 'super_admin', 'jti-t9-dashboard-root');

  const health = await get('/api/realtime/dashboard/health', token);
  assert.equal(health.status, 200, 'the dashboard is query-based and must keep working');
  const healthBody = await health.json();
  assert.equal(healthBody.success, true);
});

test('T9: RBAC still guards monitoring, and a refused route cannot be used as an open door', async () => {
  const { get, post } = await mount();
  const userToken = await accessToken(USER_ID, 'user', 'jti-t9-rbac-user');
  const adminToken = await accessToken(ADMIN_ID, 'admin', 'jti-t9-rbac-admin');

  assert.equal((await get('/api/realtime/monitoring/status', userToken)).status, 403, 'a plain user cannot read monitoring');
  assert.equal((await post('/api/realtime/monitoring/start', userToken)).status, 403);
  assert.equal((await post('/api/realtime/monitoring/start', adminToken)).status, 403, 'only a super admin may ask to start');

  const asAdmin = await get('/api/realtime/monitoring/status', adminToken);
  assert.equal(asAdmin.status, 200, 'an admin can read status');
});
