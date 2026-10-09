/**
 * BR8-04 / Q3 - the monitoring route's contract over HTTP, through the real
 * auth, request-id and i18n middleware, in the set of locales it ships.
 *
 * `tests/regression/monitoring-capabilities.test.mjs` pins the service side and
 * one English 422 over HTTP. This suite covers the gaps that one request cannot
 * see: that the refusal message follows the client's language instead of the
 * service's raw English; that the body request id is the same string the client
 * can find in the `X-Request-ID` response header; that a request which sends no
 * id still receives one; and that the full RBAC matrix - user, admin, super
 * admin and no token at all - keeps the status and dashboard routes alive
 * instead of rejecting everything because one mode is unsupported.
 *
 * The middleware is not faked. The router is mounted under the same i18n pass
 * the real app applies at `app.use('*', createI18nMiddleware)`, then through
 * the router's own `authMiddleware` + `unifiedMiddlewares.auto()` (which is
 * where the request id is minted). Locale is chosen with the real header the
 * production language detector reads, `Accept-Language`.
 */
import test from 'node:test';
import assert from 'node:assert/strict';

import { Hono } from 'hono';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n, FAKE_SECRETS } from '../regression/helpers/local-env.mjs';
import { createTokenPayload, signToken } from '../../src/utils/jwt.js';
import { TokenService } from '../../src/services/tokenService.js';

const LOCALES = ['en', 'vi', 'de', 'fr', 'es', 'ja', 'th'];
const ROOT_ID = 1;
const ADMIN_ID = 2;
const USER_ID = 3;

let d1Promise;
let env;

function lookup(tree, key) {
  return key.split('.').reduce((node, part) => (node && typeof node === 'object' ? node[part] : undefined), tree);
}

async function localeCatalog(code) {
  const module_ = await import(`../../src/i18n/locales/${code}.js`);
  return module_.default ?? module_;
}

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
 * Mount the production router exactly as the app does: the i18n pass first, then
 * the router, whose own middleware stack performs auth and request-id minting.
 */
async function mount() {
  const { createI18nMiddleware } = await import('../../src/middleware/i18n.js');
  const realtimeRoutes = (await import('../../src/routes/realtimeMonitoring.js')).default;
  const app = new Hono();
  app.use('*', createI18nMiddleware);
  app.route('/api/realtime-monitoring', realtimeRoutes);

  const send = (path, init = {}) => app.request(`http://127.0.0.1${path}`, init, env);
  return {
    send,
    get: (path, token, headers = {}) => send(path, {
      headers: { Authorization: `Bearer ${token}`, ...headers }
    }),
    post: (path, token, body = {}, headers = {}) => send(path, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...headers
      },
      body: JSON.stringify(body)
    })
  };
}

function watchIntervals() {
  const realSetInterval = globalThis.setInterval;
  const clear = globalThis.clearInterval;
  const armed = [];
  globalThis.setInterval = function patched(fn, ms, ...rest) {
    armed.push(ms);
    return realSetInterval(fn, ms, ...rest);
  };
  globalThis.clearInterval = clear;
  return {
    get count() {
      return armed.length;
    },
    restore() {
      globalThis.setInterval = realSetInterval;
    }
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

test('BR8-04: the start refusal is a 422 in the client language and arms no timer', async () => {
  const { post } = await mount();
  const token = await accessToken(ROOT_ID, 'super_admin', 'jti-br804-locales');
  const watcher = watchIntervals();

  const ENGLISH_SOURCE = 'Continuous monitoring is not supported on this deployment';
  const MESSAGE_KEY = 'errors.realtimeMonitoring.monitoring.unsupportedMode';

  try {
    for (const code of LOCALES) {
      const catalogue = await localeCatalog(code);
      const expected = lookup(catalogue, MESSAGE_KEY);
      assert.ok(typeof expected === 'string' && expected.length > 0, `catalogue has a message for ${code}`);

      const response = await post(
        '/api/realtime-monitoring/monitoring/start',
        token,
        { intervalMs: 5000 },
        { 'Accept-Language': code }
      );

      assert.equal(response.status, 422, `start must be refused for ${code}`);
      const body = await response.json();
      assert.equal(body.success, false);
      assert.equal(body.code, 'UNSUPPORTED_MONITORING_MODE', 'the machine code must not vary with the locale');
      assert.equal(
        body.message,
        expected,
        `the refusal message must be the ${code} catalogue string, not the service's English`
      );
      assert.ok(
        code === 'en' || !body.message.includes(ENGLISH_SOURCE),
        `no non-English locale may leak the service's raw English ("${code}")`
      );
    }
  } finally {
    watcher.restore();
  }

  assert.equal(watcher.count, 0, 'no interval may be armed on the way to any of the 422s');
});

test('BR8-04: the 422 correlates - body requestId equals the X-Request-ID response header', async () => {
  const { post } = await mount();
  const token = await accessToken(ROOT_ID, 'super_admin', 'jti-br804-correlation');

  const response = await post('/api/realtime-monitoring/monitoring/start', token, { intervalMs: 5000 });
  assert.equal(response.status, 422);

  const body = await response.json();
  const headerId = response.headers.get('X-Request-ID');
  assert.ok(typeof headerId === 'string' && headerId.length > 0, 'a response to a correlated client must carry X-Request-ID');
  assert.equal(body.requestId, headerId, 'the client reads the same id from body and header');
});

test('BR8-04: a request that sends no request id still receives one', async () => {
  const { post } = await mount();
  const token = await accessToken(ROOT_ID, 'super_admin', 'jti-br804-no-request-id');

  const response = await post('/api/realtime-monitoring/monitoring/start', token, { intervalMs: 5000 });
  assert.equal(response.status, 422);

  const body = await response.json();
  assert.ok(typeof body.requestId === 'string', 'the middleware mints a request id even when the client sends none');
  assert.ok(body.requestId.length > 0);
});

test('BR8-04: RBAC matrix - only super admin may start, admin may read, no blanket 422', async () => {
  const { get, post, send } = await mount();
  const superToken = await accessToken(ROOT_ID, 'super_admin', 'jti-br804-rbac-root');
  const adminToken = await accessToken(ADMIN_ID, 'admin', 'jti-br804-rbac-admin');
  const userToken = await accessToken(USER_ID, 'user', 'jti-br804-rbac-user');

  const statusOf = async (token) => (token ? await get('/api/realtime-monitoring/monitoring/status', token) : await send('/api/realtime-monitoring/monitoring/status'));

  assert.equal((await statusOf()).status, 401, 'no token is a 401, not a monitoring-mode 422');
  assert.equal((await statusOf(userToken)).status, 403, 'a plain user cannot read monitoring');
  assert.equal((await post('/api/realtime-monitoring/monitoring/start', userToken)).status, 403);

  const adminStatus = await statusOf(adminToken);
  assert.equal(adminStatus.status, 200, 'an admin keeps reading status');
  assert.equal((await post('/api/realtime-monitoring/monitoring/start', adminToken)).status, 403, 'only a super admin may ask to start');
  assert.equal((await get('/api/realtime-monitoring/dashboard/health', adminToken)).status, 200, 'the dashboard stays up for admins');

  const rootStatus = await statusOf(superToken);
  assert.equal(rootStatus.status, 200, 'a super admin keeps reading status');
  const rootBody = await rootStatus.json();
  assert.equal(rootBody.data.capabilities.continuousMonitoring, false, 'what a super admin reads agrees with the capability');

  const refused = await post('/api/realtime-monitoring/monitoring/start', superToken, { intervalMs: 5000 });
  assert.equal(refused.status, 422, 'an authorized start is still refused with the honest mode');
});
