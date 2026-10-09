import test, { after } from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';

import { initI18n } from '../../src/i18n/index.js';
import { createI18nMiddleware } from '../../src/middleware/i18n.js';
import { authMiddleware } from '../../src/middleware/auth.js';
import { createUserService, createTokenService } from '../../src/utils/serviceFactory.js';
import { getSessionRevocationSettings } from '../../src/utils/dynamicConfig.js';
import { DatabaseService } from '../../src/services/databaseService.js';
import { startD1 } from './helpers/d1-local.mjs';

const JWT_SECRET = 'session-lifecycle-test-secret-value-32chars';

/**
 * The env under test. KV is present, because a session-revocation bug that only
 * exists on the cache path cannot be found by a test that never caches.
 */
function envFor(d1, extra = {}) {
  return {
    DB: d1.db,
    ...(d1.kv ? { CONFIG_KV: d1.kv } : {}),
    JWT_SECRET,
    RATE_LIMIT_DISABLED: 'true',
    ENABLE_DETAILED_ERRORS: 'false',
    ...extra
  };
}

let emailCounter = 0;

async function seedUser(db, overrides = {}) {
  // One Miniflare instance for the file: a fresh one per test costs seconds and
  // buys nothing, because the users below are already distinct rows.
  emailCounter += 1;
  const row = {
    full_name: 'Session Subject',
    email: `session-${emailCounter}@example.test`,
    password: 'not-a-real-hash',
    role: 'user',
    status: 'active',
    auth_version: 1,
    ...overrides
  };
  const result = await db
    .prepare(
      'INSERT INTO users (full_name, email, password, role, status, auth_version) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .bind(row.full_name, row.email, row.password, row.role, row.status, row.auth_version)
    .run();
  const id = Number(result.meta.last_row_id);
  return { id, ...row };
}

// The error path renders a translated message, and a missing translation
// throws. Without initI18n the auth middleware's own 401 turns into an opaque
// 500 that hides the very code under test.
await initI18n();

/**
 * The middleware under test, with the route it guards. Built per test so one
 * test's `c.set` values cannot reach another.
 */
function appGuarding() {
  const app = new Hono();
  app.use('*', createI18nMiddleware);
  app.use('/guarded', authMiddleware);
  // The key the production middleware sets, so the test reads what a route
  // would read.
  app.get('/guarded', (c) =>
    c.json({
      user_id: c.get('accessPayload')?.user_id,
      role: c.get('user')?.role
    })
  );
  return app;
}

function authHeader(token) {
  return { Authorization: `Bearer ${token}` };
}

/**
 * Waits for the middleware's cache write to land and returns what it wrote.
 *
 * The middleware fires the write without awaiting it, so a test that assumes
 * the cache is warm is racing. Polling and then asserting the entry exists means
 * a test cannot pass by never having touched the cache at all.
 */
async function waitForCachedUser(d1, userId, { timeoutMs = 2000 } = {}) {
  const key = `user:cache:${userId}`;
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const raw = await d1.kv.get(key);
    if (raw !== null) {
      return JSON.parse(raw);
    }
    await new Promise((resolve) => setTimeout(resolve, 10));
  }
  return null;
}

// One instance for the file, created before any test body runs; every test
// awaits this same promise. A fresh Miniflare per test costs seconds and buys
// nothing, because every test seeds its own user row.
const d1Promise = startD1({ kv: true });
after(async () => (await d1Promise).dispose());

test('T6: findById reports the auth version the revocation check needs', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { auth_version: 4 });
  const found = await createUserService(envFor(d1)).findById(user.id);

  assert.ok(found, 'the user must be found');
  assert.equal(
    Number(found.auth_version),
    4,
    'a revocation check cannot run on a field the lookup never selects'
  );
});

test('T6: a cached user at a newer version still rejects the older token', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { auth_version: 1 });
  const env = envFor(d1);
  const app = appGuarding();

  // Mint under version 1: the claim is what the middleware compares, so the
  // test states the version explicitly instead of trusting issuance.
  const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });
  const payload = JSON.parse(
    Buffer.from(tokens.accessToken.split('.')[1], 'base64url').toString('utf8')
  );
  payload.auth_version = 1;
  const assertRequest = app.request('/guarded', { headers: authHeader(tokens.accessToken) }, env);

  // First request populates the cache at version 1.
  assert.equal((await assertRequest).status, 200, 'the token is valid before any revocation');
  const cached = await waitForCachedUser(d1, user.id);
  assert.ok(cached, 'the cache must be warm, or this test proves nothing');
  assert.equal(
    cached.auth_version,
    undefined,
    'the cache must not hold the version, or a stale copy could decide revocation'
  );

  // Now the authoritative row moves to 2 (logout-all, password change, role
  // change). The cache cannot help, because it never held the field.
  await d1.db.prepare('UPDATE users SET auth_version = 2 WHERE id = ?').bind(user.id).run();

  const afterRevoke = await app.request('/guarded', { headers: authHeader(tokens.accessToken) }, env);
  const body = await afterRevoke.json();

  assert.equal(
    afterRevoke.status,
    401,
    'a cached user row must not outlive the revocation it no longer reflects'
  );
  assert.equal(body.code, 'SESSION_REVOKED');
  assert.equal(payload.auth_version, 1, 'the token was minted under version 1');
});

test('T6: a cache miss at a newer version rejects the older token too', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { auth_version: 1 });
  const env = envFor(d1);
  const app = appGuarding();

  const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });

  // This user's row has never been cached, so the request below takes the
  // cache-miss path: the same decision must come out of the database.
  const cachedBefore = await d1.kv.get(`user:cache:${user.id}`);
  assert.equal(cachedBefore, null, 'the cache must be cold for this test to mean anything');

  await d1.db.prepare('UPDATE users SET auth_version = 2 WHERE id = ?').bind(user.id).run();

  const response = await app.request('/guarded', { headers: authHeader(tokens.accessToken) }, env);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.code, 'SESSION_REVOKED');
});

test('T6: a deactivated user is rejected on the very next request', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { status: 'active' });
  const env = envFor(d1);
  const app = appGuarding();

  const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });

  assert.equal((await app.request('/guarded', { headers: authHeader(tokens.accessToken) }, env)).status, 200);

  await d1.db.prepare('UPDATE users SET status = \'suspended\' WHERE id = ?').bind(user.id).run();

  const response = await app.request('/guarded', { headers: authHeader(tokens.accessToken) }, env);
  const body = await response.json();

  assert.equal(response.status, 401, 'a cached "active" must not survive a suspension');
  assert.ok(body.error, 'an error body is required so a client can tell 401 from a redirect');
});

test('T6: a downgraded role is not served from the cache', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { role: 'admin' });
  const env = envFor(d1);
  const app = appGuarding();

  const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });

  const before = await app.request('/guarded', { headers: authHeader(tokens.accessToken) }, env);
  assert.equal(before.status, 200);
  assert.equal((await before.json()).role, 'admin');

  await d1.db.prepare('UPDATE users SET role = \'user\' WHERE id = ?').bind(user.id).run();

  const after = await app.request('/guarded', { headers: authHeader(tokens.accessToken) }, env);
  const body = await after.json();

  assert.equal(after.status, 200, 'a downgrade does not invalidate the session itself');
  assert.equal(
    body.role,
    'user',
    'authorization must read the authoritative role, not the cached one'
  );
});

test('T6: a token minted under version 1 stops working after the version moves', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { auth_version: 1 });
  const env = envFor(d1);
  const app = appGuarding();

  const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });

  const issued = JSON.parse(
    Buffer.from(tokens.accessToken.split('.')[1], 'base64url').toString('utf8')
  );
  assert.equal(
    Number(issued.auth_version),
    1,
    'issuance must record which version the token belongs to'
  );

  await d1.db.prepare('UPDATE users SET auth_version = 2 WHERE id = ?').bind(user.id).run();

  const response = await app.request('/guarded', { headers: authHeader(tokens.accessToken) }, env);
  assert.equal(response.status, 401);
  assert.equal((await response.json()).code, 'SESSION_REVOKED');
});

test('T6: a token with no version claim is refused once enforcement is on', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { auth_version: 1 });
  // Enforcement is a deliberate step, so the test turns it on explicitly rather
  // than relying on whatever the default happens to be.
  const env = envFor(d1, { AUTH_VERSION_ENFORCEMENT: 'enforce' });
  const app = appGuarding();

  const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });

  // Strip the claim the way a token minted before the rollout would look. The
  // middleware must not fall back to "assume it is current".
  const stripped = await reissueWithoutVersionClaim(tokens.accessToken);
  assert.equal(stripped.auth_version, undefined, 'the claim really is absent');

  const response = await app.request('/guarded', { headers: authHeader(stripped.token) }, env);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(
    body.code,
    'TOKEN_MISSING_AUTH_VERSION',
    'a versionless token needs its own published code, not a generic invalid'
  );
});

/**
 * Re-signs a token payload with the claim removed, using the same secret the
 * service signs with. This is what a token minted before the version claim
 * existed looks like: a valid signature, and nothing to compare.
 */
async function reissueWithoutVersionClaim(token) {
  const { signToken } = await import('../../src/utils/jwt.js');
  const decoded = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  delete decoded.auth_version;
  return {
    token: await signToken(decoded, JWT_SECRET),
    auth_version: decoded.auth_version
  };
}

test('T6: the transition state tolerates a versionless token but not a stale one', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { auth_version: 1 });
  // The default: tokens minted before the claim existed keep working while an
  // operator watches. A token that carries a stale version is a different case.
  const env = envFor(d1, { AUTH_VERSION_ENFORCEMENT: 'observe' });
  const app = appGuarding();

  const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });
  const legacy = await reissueWithoutVersionClaim(tokens.accessToken);

  const tolerated = await app.request('/guarded', { headers: authHeader(legacy.token) }, env);
  assert.equal(tolerated.status, 200, 'the transition window exists so old tokens still work');

  await d1.db.prepare('UPDATE users SET auth_version = 2 WHERE id = ?').bind(user.id).run();
  const stale = await app.request('/guarded', { headers: authHeader(tokens.accessToken) }, env);
  assert.equal(
    stale.status,
    401,
    'a token with a version that no longer matches is revoked in every mode'
  );
});

test('T6: an expired transition window is enforcement', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { auth_version: 1 });
  // The point of a deadline is that somebody has to act on it: after it passes,
  // "observe" stops being a choice.
  const env = envFor(d1, {
    AUTH_VERSION_ENFORCEMENT: 'observe',
    AUTH_VERSION_ENFORCEMENT_EXPIRES_AT: '2020-01-01T00:00:00.000Z'
  });
  const app = appGuarding();

  const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });
  const legacy = await reissueWithoutVersionClaim(tokens.accessToken);

  const response = await app.request('/guarded', { headers: authHeader(legacy.token) }, env);
  const body = await response.json();

  assert.equal(response.status, 401);
  assert.equal(body.code, 'TOKEN_MISSING_AUTH_VERSION');
});

test('T6: a token ahead of the row is refused too', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { auth_version: 5 });
  const env = envFor(d1);
  const app = appGuarding();

  const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });

  // The row moving backwards happens on a restore from backup, or when a token
  // is minted against a replica that is ahead. Either way the token is not
  // something this database has ever vouched for.
  await d1.db.prepare('UPDATE users SET auth_version = 2 WHERE id = ?').bind(user.id).run();

  const response = await app.request('/guarded', { headers: authHeader(tokens.accessToken) }, env);
  const body = await response.json();

  assert.equal(response.status, 401, 'a version ahead of the row is as suspect as one behind it');
  assert.equal(body.code, 'SESSION_REVOKED');
});

test('T6: an unusable mode neither locks everyone out nor reads as valid', async () => {
  const d1 = await d1Promise;

  const user = await seedUser(d1.db, { auth_version: 1 });
  const env = envFor(d1, { AUTH_VERSION_ENFORCEMENT: 'maybe' });
  const app = appGuarding();

  const settings = await getSessionRevocationSettings(env);
  assert.equal(settings.valid, false, 'a value outside the published set must be reported');
  assert.equal(settings.mode, 'observe', 'and must fall back to the transition state');

  const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });
  const legacy = await reissueWithoutVersionClaim(tokens.accessToken);

  const tolerated = await app.request('/guarded', { headers: authHeader(legacy.token) }, env);
  assert.equal(
    tolerated.status,
    200,
    'a typo in the setting must not evict every session holding a legacy token'
  );
});

test('T6: the security read is the one that asks for the primary', async () => {
  const d1 = await d1Promise;
  const user = await seedUser(d1.db, { auth_version: 1 });

  const calls = [];
  const proto = DatabaseService.prototype;
  const originalSelect = proto.select;
  const originalAuthoritative = proto.selectAuthoritative;
  proto.select = function recordingSelect(...args) {
    calls.push('select');
    return originalSelect.apply(this, args);
  };
  proto.selectAuthoritative = function recordingAuthoritative(...args) {
    calls.push('selectAuthoritative');
    return originalAuthoritative.apply(this, args);
  };

  try {
    await createUserService(envFor(d1)).findSecurityState(user.id);
  } finally {
    proto.select = originalSelect;
    proto.selectAuthoritative = originalAuthoritative;
  }

  // Miniflare runs a single node, so no test here can observe replica lag. That
  // is exactly why the read has to be pinned by an assertion instead of trusted.
  assert.deepEqual(
    calls,
    ['selectAuthoritative'],
    'role, status and version must not be read through a session that may lag'
  );
});

test('T6: every authoritative read starts a fresh first-primary session', async () => {
  const d1 = await d1Promise;

  const asked = [];
  const database = {
    withSession: (mode) => {
      asked.push(mode);
      return { prepare: (sql) => d1.db.prepare(sql) };
    }
  };
  const service = new DatabaseService({ DB: database });

  await service.selectAuthoritative('SELECT id FROM users WHERE id = ?', [1], true);

  await service.selectAuthoritative('SELECT id FROM users WHERE id = ?', [1], true);

  assert.deepEqual(asked, ['first-primary', 'first-primary'],
    'first-primary only pins the first query; reusing that session can read a lagging replica');
});

test('T6: issuance refuses a user row without a usable version', async () => {
  const d1 = await d1Promise;
  const env = envFor(d1);
  const tokenService = createTokenService(env);

  for (const authVersion of [undefined, null, 0, -1, 'two', Number.NaN]) {
    await assert.rejects(
      () =>
        tokenService.issueTokenPair(
          { id: 42, full_name: 'X', email: 'x@y.z', role: 'user', auth_version: authVersion },
          {},
          { skipQuota: true }
        ),
      /auth_version/,
      `a version of ${JSON.stringify(authVersion)} must not mint a token`
    );
  }
});

for (const version of [0, -1, 'broken']) {
  test(`T6: unusable stored auth version ${version} cannot authorize a protected request`, async () => {
    const d1 = await d1Promise;
    const user = await seedUser(d1.db);
    const env = envFor(d1);
    const tokens = await createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });
    await d1.db.prepare('UPDATE users SET auth_version = ? WHERE id = ?').bind(version, user.id).run();
    const response = await appGuarding().request('/guarded', { headers: authHeader(tokens.accessToken) }, env);
    assert.equal(response.status, 503, 'unusable security state cannot be treated as current');
    assert.equal((await response.json()).code, 'DB_UNAVAILABLE');
  });
}
