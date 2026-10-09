/**
 * B03/R5: a database outage on a security path must surface as HTTP 503 with
 * the DB_UNAVAILABLE machine code, never as 401. These tests drive the real
 * Hono app, the real auth middleware and the real services; only the D1
 * binding is fault-injected.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createTestEnv, initTestI18n, FAKE_SECRETS } from '../regression/helpers/local-env.mjs';
import { Hono } from 'hono';
import { authMiddleware } from '../../src/middleware/auth.js';
import { handleStandardError } from '../../src/utils/errorHandler.js';
import { serviceErrorFromResult } from '../../src/utils/serviceErrors.js';
import { AuthService } from '../../src/services/authService.js';
import { createTokenPayload, signToken } from '../../src/utils/jwt.js';

const USER_ID = 42;

/**
 * D1 stub with per-query behaviour so a test can decide which statement fails.
 */
function createScriptedDatabase(script) {
  return {
    prepare(sql) {
      const statement = {
        sql,
        bind() { return statement; },
        first() {
          return script.first ? script.first(sql) : null;
        },
        all() {
          return { results: script.all ? script.all(sql) : [] };
        },
        run() {
          if (script.run) {
            return script.run(sql);
          }
          return { success: true, meta: { changes: 1, last_row_id: 1 } };
        }
      };
      return statement;
    },
    batch() { return []; }
  };
}

const OUTAGE = () => { throw new Error('D1_ERROR: database is overloaded'); };

// An outage is an outage of the whole binding, not of one statement method. The
// admission path is a single conditional `INSERT ... RETURNING`, which D1 answers
// through `all()`, so a stub that only fails `first()` would report an empty
// result set and read as "the guard did not match" - a refusal, not an outage.
const OUTAGE_DB = () => createScriptedDatabase({ first: OUTAGE, all: OUTAGE, run: OUTAGE });

function userRow(overrides = {}) {
  return {
    id: USER_ID,
    user_id: USER_ID,
    full_name: 'Test User',
    email: 'user@example.invalid',
    role: 'user',
    status: 'active',
    auth_version: 1,
    ...overrides
  };
}

async function buildProtectedApp() {
  await initTestI18n();
  const app = new Hono();
  let protectedHandlerRuns = 0;

  app.use('/api/protected', authMiddleware);
  app.get('/api/protected', (c) => {
    protectedHandlerRuns += 1;
    return c.json({ ok: true });
  });

  return { app, protectedHandlerRuns: () => protectedHandlerRuns };
}

/**
 * Mint a token with the same claims TokenService issues, so issuer, audience and
 * subject enforcement cannot reject the fixture for the wrong reason and mask
 * the dependency failure under test.
 */
async function issueToken(env, tokenType = 'access', overrides = {}) {
  const { TokenService } = await import('../../src/services/tokenService.js');
  const jwtConfig = await new TokenService(env).getJwtConfig();
  const payload = await createTokenPayload(
    {
      sub: `user:${USER_ID}`,
      iss: jwtConfig.issuer,
      aud: Array.isArray(jwtConfig.audience) ? jwtConfig.audience[0] : jwtConfig.audience,
      user_id: USER_ID,
      full_name: 'Test User',
      email: 'user@example.invalid',
      role: 'user',
      auth_version: 1,
      jti: 'jti-http-fixture',
      scope: 'user:basic',
      ...overrides
    },
    tokenType,
    env
  );
  return signToken(payload, FAKE_SECRETS.JWT_SECRET);
}

test('B03/R5: blacklist lookup outage returns 503 DB_UNAVAILABLE and never reaches the handler', async () => {
  const env = createTestEnv({
    DB: createScriptedDatabase({ first: OUTAGE })
  });
  const { app, protectedHandlerRuns } = await buildProtectedApp();
  const accessToken = await issueToken(env);

  const response = await app.request(
    'http://127.0.0.1/api/protected',
    { headers: { Authorization: `Bearer ${accessToken}` } },
    env
  );
  const body = await response.json();

  assert.equal(response.status, 503, `expected 503, got ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(body.code, 'DB_UNAVAILABLE', 'the machine code must survive to the client');
  assert.equal(protectedHandlerRuns(), 0, 'a protected handler must not run when auth could not be decided');
});

test('B03/R5: user lookup outage after a clean blacklist check returns 503, not 401', async () => {
  const env = createTestEnv({
    DB: createScriptedDatabase({
      first(sql) {
        // Blacklist table answers, the users table is down.
        if (/token_blacklist/i.test(sql)) {
          return null;
        }
        return OUTAGE();
      }
    })
  });
  const { app, protectedHandlerRuns } = await buildProtectedApp();
  const accessToken = await issueToken(env);

  const response = await app.request(
    'http://127.0.0.1/api/protected',
    { headers: { Authorization: `Bearer ${accessToken}` } },
    env
  );
  const body = await response.json();

  assert.equal(response.status, 503, `expected 503, got ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(body.code, 'DB_UNAVAILABLE');
  assert.equal(protectedHandlerRuns(), 0);
});

test('B03/R5: a genuinely missing user is still 401', async () => {
  const env = createTestEnv({
    DB: createScriptedDatabase({ first: () => null })
  });
  const { app, protectedHandlerRuns } = await buildProtectedApp();
  const accessToken = await issueToken(env);

  const response = await app.request(
    'http://127.0.0.1/api/protected',
    { headers: { Authorization: `Bearer ${accessToken}` } },
    env
  );
  const body = await response.json();

  assert.equal(response.status, 401, `expected 401, got ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(protectedHandlerRuns(), 0);
});

test('B03/R5: a real user row lets the request through', async () => {
  const env = createTestEnv({
    DB: createScriptedDatabase({
      first(sql) {
        if (/token_blacklist/i.test(sql)) {
          return null;
        }
        return userRow();
      }
    })
  });
  const { app, protectedHandlerRuns } = await buildProtectedApp();
  const accessToken = await issueToken(env);

  const response = await app.request(
    'http://127.0.0.1/api/protected',
    { headers: { Authorization: `Bearer ${accessToken}` } },
    env
  );

  assert.equal(response.status, 200);
  assert.equal(protectedHandlerRuns(), 1);
});

test('B03/R5: login reports a dependency outage as 503 DB_UNAVAILABLE with a machine code', async () => {
  const env = createTestEnv({ DB: OUTAGE_DB() });
  const authService = new AuthService(env);

  const result = await authService.login('user@example.invalid', 'irrelevant-password', {});

  assert.equal(result.success, false);
  assert.equal(result.error, 'DB_UNAVAILABLE', `expected DB_UNAVAILABLE, got ${result.error}`);
  assert.equal(result.statusCode, 503);

  // The route envelope keeps code + status instead of reducing it to a message.
  const app = new Hono();
  app.post('/login', (c) => handleStandardError(
    c,
    serviceErrorFromResult(result, 'LOGIN_FAILED'),
    'Login service error',
    () => {},
    'auth.loginFailed',
    {},
    result.statusCode || 500
  ));

  const response = await app.request('http://127.0.0.1/login', { method: 'POST' }, env);
  const body = await response.json();
  assert.equal(response.status, 503);
  assert.equal(body.code, 'DB_UNAVAILABLE');
});

test('B03/R5: refresh reports a dependency outage as 503 DB_UNAVAILABLE', async () => {
  const env = createTestEnv({ DB: OUTAGE_DB() });
  const authService = new AuthService(env);

  // A structurally valid refresh token is required, otherwise JWT verification
  // fails first and the database outage is never reached.
  const refreshToken = await issueToken(env, 'refresh', { jti: 'jti-refresh-fixture' });
  const result = await authService.refreshToken(refreshToken, {});

  assert.equal(result.success, false);
  assert.equal(result.error, 'DB_UNAVAILABLE', `expected DB_UNAVAILABLE, got ${result.error}`);
  assert.equal(result.statusCode, 503);
});

test('B03/R5: logout does not report 200 when the revocation write cannot be confirmed', async () => {
  const env = createTestEnv({
    DB: createScriptedDatabase({
      first(sql) {
        if (/token_blacklist/i.test(sql)) {
          return null;
        }
        return OUTAGE();
      }
    })
  });
  const authService = new AuthService(env);
  const accessToken = await issueToken(env);

  const refreshToken = await issueToken(env, 'refresh', { jti: 'jti-refresh-fixture' });
  const result = await authService.logout(refreshToken, accessToken, {});

  assert.equal(result.success, false, 'an unconfirmed revocation must not be reported as a successful logout');
  assert.ok(
    [401, 503].includes(result.statusCode),
    `expected 401 or 503, got ${result.statusCode}`
  );
});

test('B03/R5: a route catch block turns a user-lookup outage into 503, not 404', async () => {
  const env = createTestEnv({ DB: OUTAGE_DB() });
  const { UserService } = await import('../../src/services/userService.js');
  const userService = new UserService(env);

  const app = new Hono();
  app.get('/api/user/me', async (c) => {
    try {
      const userDetails = await userService.findById(USER_ID);
      if (!userDetails) {
        return await handleStandardError(c, new Error('NOT_FOUND'), 'Get user profile - not found', () => {}, 'user.notFound', { userName: 'User' }, 404);
      }
      return c.json({ ok: true });
    } catch (error) {
      return await handleStandardError(c, error, 'Failed to retrieve user profile', () => {}, 'user.notFound', { userName: 'User' });
    }
  });

  const response = await app.request('http://127.0.0.1/api/user/me', {}, env);
  const body = await response.json();

  assert.equal(response.status, 503, `expected 503, got ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(body.code, 'DB_UNAVAILABLE');
});

test('B03/R5: a missing user row is still a 404 for ordinary reads', async () => {
  const env = createTestEnv({ DB: createScriptedDatabase({ first: () => null }) });
  const { UserService } = await import('../../src/services/userService.js');
  const userService = new UserService(env);

  const app = new Hono();
  app.get('/api/user/me', async (c) => {
    try {
      const userDetails = await userService.findById(USER_ID);
      if (!userDetails) {
        return await handleStandardError(c, new Error('NOT_FOUND'), 'Get user profile - not found', () => {}, 'user.notFound', { userName: 'User' }, 404);
      }
      return c.json({ ok: true });
    } catch (error) {
      return await handleStandardError(c, error, 'Failed to retrieve user profile', () => {}, 'user.notFound', { userName: 'User' });
    }
  });

  const response = await app.request('http://127.0.0.1/api/user/me', {}, env);
  assert.equal(response.status, 404, 'an empty result must keep its own semantics');
});

test('B03/R5: client-supplied status fields cannot downgrade a dependency outage', async () => {
  await initTestI18n();
  const env = createTestEnv({ DB: OUTAGE_DB() });
  const authService = new AuthService(env);

  // A real outage on the dependency, so the only thing under test is status
  // resolution: a client that injects a success-looking or client-error status
  // into any body/query/header must not be able to change the answer.
  const result = await authService.login('user@example.invalid', 'irrelevant-password', {});
  assert.equal(result.statusCode, 503, 'precondition: the dependency outage is a 503');

  const app = new Hono();
  app.post('/api/auth/login', async (c) => {
    const body = await c.req.json();
    return await handleStandardError(
      c,
      serviceErrorFromResult(result, 'LOGIN_FAILED'),
      'Login service error',
      () => {},
      'auth.loginFailed',
      // Route-level status comes from server metadata, never from the body.
      result.statusCode || 500,
      body
    );
  });

  const response = await app.request('http://127.0.0.1/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 200, statusCode: 200, success: true, code: 'OK' })
  }, env);
  const body = await response.json();

  assert.equal(response.status, 503, `client input downgraded the outage: ${JSON.stringify(body)}`);
  assert.equal(body.code, 'DB_UNAVAILABLE');
  assert.notEqual(body.success, true, 'a client body must not make an outage look successful');
});

test('B03/R5: resolveErrorStatus ignores an untrusted status override for infrastructure errors', async () => {
  const { resolveErrorStatus } = await import('../../src/utils/errorHandler.js');
  const { ServiceUnavailableError } = await import('../../src/utils/serviceErrors.js');

  // Trusted server metadata may still express an intended status, but a
  // 5xx/503 must never be silently rewritten into a success or a client error
  // by a status that came from request data.
  assert.equal(resolveErrorStatus(new ServiceUnavailableError('db down'), 503, { status: 200 }), 503);
  assert.equal(resolveErrorStatus(new ServiceUnavailableError('db down'), 503, { status: 401 }), 503);
  assert.equal(resolveErrorStatus(new ServiceUnavailableError('db down'), 503, { status: 'nonsense' }), 503);
});
