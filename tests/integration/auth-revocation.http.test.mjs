/**
 * T2 / B03 / R5: a revocation that cannot be confirmed must never be reported
 * as a successful logout.
 *
 * The earlier coverage injected the fault at `first()`, so execution could stop
 * before the UPDATE and the assertion accepted `[401, 503]`. That never proved
 * the write path. These tests:
 *   - mount the real production auth router (same mount shape as src/index.js),
 *   - serve every precondition read faithfully, including the real
 *     `TokenService.hashToken` digest, so `validateRefreshToken` passes and the
 *     request actually reaches the revocation write,
 *   - fail exactly the revoke statement and count every attempt,
 *   - assert one exact status and machine code, with a 200 control case.
 * Only the D1 binding is fault-injected.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { Hono } from 'hono';
import { createTestEnv, initTestI18n, FAKE_SECRETS } from '../regression/helpers/local-env.mjs';
import { createTokenPayload, signToken } from '../../src/utils/jwt.js';
import { TokenService } from '../../src/services/tokenService.js';

const USER_ID = 'user-revoke-fixture';
const ACCESS_JTI = 'jti-access-revoke-fixture';
const REFRESH_JTI = 'jti-refresh-revoke-fixture';

/**
 * The single write logout depends on, keyed by one jti. Distinct from the
 * defensive family revoke, which is keyed by user_id and is issued when reuse is
 * detected, so the two can be told apart.
 */
const REVOKE_WRITE = /^\s*UPDATE\s+refresh_tokens\s+SET\s+revoked\b[\s\S]*WHERE\s+jti\s*=/i;
const FAMILY_REVOKE_WRITE = /^\s*UPDATE\s+refresh_tokens\s+SET\s+revoked\b[\s\S]*WHERE\s+user_id\s*=/i;

/**
 * The revocation UPDATE is issued exactly once: `DatabaseService.update` passes
 * `attempts: 1`, so a thrown write is not replayed (a write must never be
 * retried blindly). Asserting the count also guards the attempt budget itself.
 */
const WRITE_ATTEMPTS_ON_THROW = 1;

/** `expires_at` is compared with `new Date(...)`, so it must be ISO, not epoch. */
const FUTURE = '2100-01-01T00:00:00Z';

function userRow(overrides = {}) {
  return {
    id: USER_ID,
    user_id: USER_ID,
    email: 'revoke-fixture@example.invalid',
    password_hash: 'scrypt$FAKE-SALT$FAKE-HASH-MARKER',
    role: 'user',
    status: 'active',
    is_active: 1,
    email_verified: 1,
    auth_version: 1,
    ...overrides
  };
}

/**
 * Mint access/refresh tokens carrying the claims TokenService issues, so issuer,
 * audience and subject enforcement cannot reject the fixture and mask the
 * dependency failure under test.
 * @param {Object} env - Environment supplying the JWT config
 * @returns {Promise<Object>} Access, own refresh and foreign refresh tokens
 */
async function issueTokens(env) {
  const jwtConfig = await new TokenService(env).getJwtConfig();
  const audience = Array.isArray(jwtConfig.audience) ? jwtConfig.audience[0] : jwtConfig.audience;

  const mint = async (tokenType, jti, userId = USER_ID) => signToken(
    await createTokenPayload(
      {
        sub: `user:${userId}`,
        iss: jwtConfig.issuer,
        aud: audience,
        user_id: userId,
        full_name: 'Revoke Fixture',
        auth_version: 1,
        jti,
        scope: 'user:basic'
      },
      tokenType,
      env
    ),
    FAKE_SECRETS.JWT_SECRET
  );

  return {
    accessToken: await mint('access', ACCESS_JTI),
    refreshToken: await mint('refresh', REFRESH_JTI),
    foreignRefreshToken: await mint('refresh', 'jti-foreign-refresh', 'someone-else')
  };
}

/**
 * D1 stub that serves reads faithfully and controls write outcomes.
 * Every statement is recorded so a test can assert which write ran, how many
 * times, and what it returned.
 *
 * @param {Object} options - Fixture and fault configuration
 * @param {Array<{jti: string, token: string, userId: string, state?: string}>} options.records -
 *   Refresh-token rows to serve. The stored `token_hash` comes from the real
 *   `TokenService.hashToken`, because `validateRefreshToken` compares digests and
 *   a mismatch is reported as REFRESH_TOKEN_REUSED, which would hide the
 *   revocation write these tests exist to reach.
 * @param {boolean} [options.failRevokeWrite] - Throw on the revoke UPDATE
 * @param {boolean} [options.ambiguousRevokeWrite] - Reply with no affected rows
 * @param {number} [options.revokeChanges] - Affected rows the write reports
 * @param {boolean} [options.accessTokenBlacklisted] - Blacklist lookup hits
 * @returns {Object} Fake D1 binding with a `calls` log
 */
function createLogoutDatabase(options) {
  const {
    records,
    failRevokeWrite = false,
    ambiguousRevokeWrite = false,
    revokeChanges = 1,
    accessTokenBlacklisted = false
  } = options;

  const byJti = new Map(records.map((record) => [record.jti, record]));
  const calls = [];
  const isWrite = (sql) => /^\s*(UPDATE|INSERT|DELETE|REPLACE|UPSERT)/i.test(sql);

  return {
    calls,
    /** @returns {Array<Object>} Every write statement, in execution order */
    writes() {
      return calls.filter((call) => call.kind === 'write');
    },
    /** @returns {Array<Object>} Attempts against the jti-scoped revoke UPDATE */
    revokeAttempts() {
      return calls.filter((call) => isWrite(call.sql) && REVOKE_WRITE.test(call.sql));
    },
    /** @returns {Array<Object>} Attempts against the user-scoped family revoke */
    familyRevokeAttempts() {
      return calls.filter((call) => isWrite(call.sql) && FAMILY_REVOKE_WRITE.test(call.sql));
    },
    prepare(sql) {
      const write = isWrite(sql);
      const call = { sql: sql.replace(/\s+/g, ' ').trim(), kind: write ? 'write' : 'read' };
      calls.push(call);

      const statement = {
        bind(...params) {
          call.params = params;
          return statement;
        },
        async first() {
          if (/token_blacklist/i.test(sql)) {
            call.outcome = accessTokenBlacklisted ? 'blacklisted' : 'clean';
            return accessTokenBlacklisted
              ? { jti: ACCESS_JTI, user_id: USER_ID, expires_at: FUTURE }
              : null;
          }

          if (/refresh_tokens/i.test(sql)) {
            // Both reads are keyed by jti, which is the only bound parameter.
            const record = byJti.get(String(call.params?.[0]));
            call.outcome = record ? 'refresh-row' : 'refresh-missing';

            // `validateRefreshToken` selects the full record (it names
            // token_hash); `revokeRefreshToken` asks a narrow follow-up
            // "is it already revoked" question. Serve each faithfully.
            if (/token_hash/i.test(sql)) {
              if (!record) {
                return null;
              }
              return {
                id: `refresh-row-${record.jti}`,
                user_id: record.userId,
                jti: record.jti,
                token_hash: await TokenService.hashToken(record.token),
                issued_at: '2026-09-01T00:00:00Z',
                expires_at: FUTURE,
                revoked: record.state === 'revoked' ? 1 : 0,
                revoked_at: record.state === 'revoked' ? '2026-09-02T00:00:00Z' : null,
                revocation_reason: record.state === 'revoked' ? 'USER_LOGOUT' : null,
                replaced_by: null,
                reuse_detected_at: null,
                reuse_ip: null,
                reuse_user_agent: null
              };
            }
            return {
              revoked: record?.state === 'revoked' ? 1 : 0,
              revocation_reason: record?.state === 'revoked' ? 'USER_LOGOUT' : null
            };
          }

          return userRow();
        },
        async all() {
          return { results: [] };
        },
        async run() {
          const revoke = write && REVOKE_WRITE.test(sql);

          if (revoke && failRevokeWrite) {
            call.outcome = 'threw';
            throw new Error('D1 write rejected: injected revoke outage');
          }
          if (revoke && ambiguousRevokeWrite) {
            // D1 replied, but without affected-row information.
            call.outcome = 'ambiguous';
            return { success: true };
          }
          call.outcome = 'ok';
          return { success: true, meta: { changes: write ? revokeChanges : 0, last_row_id: 1 } };
        }
      };
      return statement;
    },
    batch() {
      return [];
    }
  };
}

/**
 * Build a ready-to-drive logout scenario.
 * Tokens are minted first because the stub's `token_hash` must match the token
 * the request will present.
 * @param {Object} [dbOptions] - Fault options forwarded to `createLogoutDatabase`
 * @param {Function} [mutateRecords] - Adjust the served refresh-token rows
 * @returns {Promise<Object>} app, env, tokens and the D1 call log
 */
async function setupLogoutScenario(dbOptions = {}, mutateRecords) {
  await initTestI18n();

  // Token minting needs the JWT config but never touches the database.
  const tokens = await issueTokens(createTestEnv());

  let records = [
    { jti: REFRESH_JTI, token: tokens.refreshToken, userId: USER_ID },
    { jti: 'jti-foreign-refresh', token: tokens.foreignRefreshToken, userId: 'someone-else' }
  ];
  if (mutateRecords) {
    records = mutateRecords(records) || records;
  }

  const db = createLogoutDatabase({ records, ...dbOptions });
  const env = createTestEnv({ DB: db });

  const authRoutes = (await import('../../src/routes/auth.js')).default;
  const authSubApp = new Hono();
  authSubApp.route('/auth', authRoutes);
  const app = new Hono();
  app.route('/api', authSubApp);

  return { app, env, db, tokens, records };
}

/**
 * Mount the production auth router with the same shape as `src/index.js`.
 * @returns {Promise<Hono>} App serving /api/auth/*
 */
async function mountProductionAuthRouter() {
  const authRoutes = (await import('../../src/routes/auth.js')).default;
  const authSubApp = new Hono();
  authSubApp.route('/auth', authRoutes);
  const app = new Hono();
  app.route('/api', authSubApp);
  return app;
}

function logoutRequest(accessToken, refreshToken) {
  return {
    method: 'POST',
    headers: { 'content-type': 'application/json', Authorization: `Bearer ${accessToken}` },
    body: JSON.stringify({ refresh_token: refreshToken })
  };
}

async function postLogout(app, env, accessToken, refreshToken) {
  const response = await app.request(
    'http://127.0.0.1/api/auth/logout',
    logoutRequest(accessToken, refreshToken),
    env
  );
  return { response, body: await response.json() };
}

test('T2: the production auth router exposes the logout and auth entry points', async () => {
  // Guards every test below: if the router stops exporting /logout, the other
  // assertions could pass without ever reaching production code.
  const app = await mountProductionAuthRouter();
  const paths = app.routes.map((route) => `${route.method} ${route.path}`);
  assert.ok(
    paths.includes('POST /api/auth/logout'),
    `the production router must expose POST /api/auth/logout, got:\n${paths.join('\n')}`
  );
  assert.ok(paths.includes('POST /api/auth/login'), 'the production router must expose login');
  assert.ok(paths.includes('POST /api/auth/refresh_token'), 'the production router must expose refresh_token');
  assert.ok(paths.includes('POST /api/auth/logout-all'), 'the production router must expose logout-all');
});

test('T2/R5: an outage on the revoke write returns exactly 503 DB_UNAVAILABLE', async () => {
  const { app, env, db, tokens } = await setupLogoutScenario({ failRevokeWrite: true });

  const { response, body } = await postLogout(app, env, tokens.accessToken, tokens.refreshToken);

  // Precondition: the fault must have landed on the revocation write itself.
  const attempts = db.revokeAttempts();
  assert.equal(
    attempts.length,
    WRITE_ATTEMPTS_ON_THROW,
    `expected ${WRITE_ATTEMPTS_ON_THROW} revoke attempts, got ${attempts.length}: ${JSON.stringify(db.writes().map((c) => c.sql))}`
  );
  assert.ok(
    attempts.every((attempt) => attempt.outcome === 'threw'),
    'the revocation write must be the statement that failed'
  );

  assert.equal(response.status, 503, `expected exactly 503, got ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(body.code, 'DB_UNAVAILABLE', `expected DB_UNAVAILABLE, got ${JSON.stringify(body)}`);
  assert.equal(body.success, false, 'a failed revocation must not be reported as a successful logout');
  assert.notEqual(body.data?.success, true, 'the envelope must not claim logout succeeded');
});

test('T2/R5: a confirmed revoke returns 200 (control case)', async () => {
  // Without this control, a handler that always returned 503 would satisfy the
  // test above.
  const { app, env, db, tokens } = await setupLogoutScenario();

  const { response, body } = await postLogout(app, env, tokens.accessToken, tokens.refreshToken);

  const attempts = db.revokeAttempts();
  assert.equal(attempts.length, 1, `precondition: the revoke UPDATE must run once, got ${attempts.length}`);
  assert.equal(attempts[0].outcome, 'ok');
  assert.equal(response.status, 200, `expected 200 on the happy path, got ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(body.success, true);
});

test('T2/R5: a revoke write that changes zero rows is not a confirmed logout', async () => {
  const { app, env, db, tokens } = await setupLogoutScenario({ revokeChanges: 0 });

  const { response, body } = await postLogout(app, env, tokens.accessToken, tokens.refreshToken);

  const attempts = db.revokeAttempts();
  assert.equal(attempts.length, 1, 'precondition: the revoke UPDATE must have been attempted');
  assert.equal(attempts[0].outcome, 'ok', 'the write succeeded, it simply matched no row');

  assert.equal(
    response.status,
    503,
    `an unconfirmed revocation must be 503, got ${response.status}: ${JSON.stringify(body)}`
  );
  assert.equal(body.code, 'DB_UNAVAILABLE');
  assert.notEqual(body.success, true, '0 changed rows must never be reported as a successful logout');
});

test('T2/R5: a revoke write with no affected-row information is not confirmed', async () => {
  const { app, env, db, tokens } = await setupLogoutScenario({ ambiguousRevokeWrite: true });

  const { response, body } = await postLogout(app, env, tokens.accessToken, tokens.refreshToken);

  const attempts = db.revokeAttempts();
  assert.equal(attempts.length, 1, `an unconfirmed write must not be replayed, got ${attempts.length} attempts`);
  assert.notEqual(body.success, true, `an unconfirmed write must not report success: ${JSON.stringify(body)}`);
  assert.equal(response.status, 503, `expected 503, got ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(body.code, 'DB_UNAVAILABLE');
});

test('T2/R5: an already-revoked refresh token is refused and triggers a family revoke', async () => {
  // Logout does not attempt an idempotent re-revoke. `validateRefreshToken`
  // refuses a revoked token with 401 REFRESH_TOKEN_REVOKED and, as a defensive
  // measure, revokes the whole family of still-active tokens for that user.
  const { app, env, db, tokens } = await setupLogoutScenario(
    { revokeChanges: 0 },
    (records) => records.map((record) => (
      record.jti === REFRESH_JTI ? { ...record, state: 'revoked' } : record
    ))
  );

  const { response, body } = await postLogout(app, env, tokens.accessToken, tokens.refreshToken);

  assert.equal(
    response.status,
    401,
    `an already-revoked token must be refused, got ${response.status}: ${JSON.stringify(body)}`
  );
  assert.equal(body.code, 'REFRESH_TOKEN_REVOKED', `expected REFRESH_TOKEN_REVOKED, got ${JSON.stringify(body)}`);
  assert.equal(
    db.revokeAttempts().length,
    0,
    'logout must not attempt an idempotent re-revoke of the presented token'
  );
  assert.equal(
    db.familyRevokeAttempts().length,
    1,
    'reuse detection must revoke the remaining active tokens of that user exactly once'
  );
});

test('T2/R5: an invalid access token is 401 and never reaches the revoke write', async () => {
  await initTestI18n();
  const db = createLogoutDatabase({ records: [] });
  const env = createTestEnv({ DB: db });
  const app = await mountProductionAuthRouter();

  const { response, body } = await postLogout(app, env, 'not-a-valid-jwt-token', 'also-not-valid');

  assert.equal(response.status, 401, `an invalid token must be 401, got ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(db.revokeAttempts().length, 0, 'an unauthenticated request must not attempt a revocation write');
});

test('T2/R5: a blacklisted access token is 401 and never reaches the revoke write', async () => {
  const { app, env, db, tokens } = await setupLogoutScenario({ accessTokenBlacklisted: true });

  const { response, body } = await postLogout(app, env, tokens.accessToken, tokens.refreshToken);

  assert.equal(
    response.status,
    401,
    `a blacklisted access token must be rejected, got ${response.status}: ${JSON.stringify(body)}`
  );
  assert.equal(db.revokeAttempts().length, 0, 'a rejected request must not attempt a revocation write');
});

test('T2/R5: a refresh token belonging to another user is 401 without a write', async () => {
  const { app, env, db, tokens } = await setupLogoutScenario();

  const { response, body } = await postLogout(app, env, tokens.accessToken, tokens.foreignRefreshToken);

  assert.equal(response.status, 401, `a cross-user logout must be rejected, got ${response.status}: ${JSON.stringify(body)}`);
  assert.equal(db.revokeAttempts().length, 0, 'a mismatched refresh token must not trigger a revocation write');
});

test('T2/R5: a service error keeps its own status through resolveErrorStatus', async () => {
  const { resolveErrorStatus } = await import('../../src/utils/errorHandler.js');
  const { ServiceError, ServiceUnavailableError, ConflictError, UnsupportedOptionError } = await import('../../src/utils/serviceErrors.js');

  const clientError = new ServiceError('token is not usable', 'TOKEN_INVALID');
  clientError.statusCode = 401;

  // A dependency outage must win over anything a caller asks for: this is the
  // difference between "your session expired" and "the database is down".
  assert.equal(
    resolveErrorStatus(new ServiceUnavailableError('db down'), 401),
    503,
    'a DB outage must not be downgraded to 401'
  );
  assert.equal(resolveErrorStatus(new ServiceUnavailableError('db down'), 500), 503);

  // A rotation race must keep its 409 even when the caller asked for 401;
  // otherwise the machine code and the HTTP status disagree.
  assert.equal(
    resolveErrorStatus(new ConflictError(), 401),
    409,
    'a rotation conflict must not be reported as 401'
  );
  assert.equal(resolveErrorStatus(new UnsupportedOptionError(), 401), 422);

  // A domain error that declares a 4xx keeps it.
  assert.equal(resolveErrorStatus(clientError, 500), 401);
  assert.equal(resolveErrorStatus(clientError, 401), 401);

  // An explicit extraFields.status is the highest-precedence override.
  assert.equal(resolveErrorStatus(new ServiceUnavailableError('db down'), 401, { status: 502 }), 502);

  // A non-service error falls back to the requested status.
  assert.equal(resolveErrorStatus(new Error('boom'), 418), 418);
  assert.equal(resolveErrorStatus(new Error('boom'), 'nonsense'), 500);
});
