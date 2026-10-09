/**
 * T7 / BT6-03 - the export contract over HTTP, including the failure paths the
 * service-level tests in `tests/regression/audit-export.test.mjs` cannot see.
 *
 * The service tests assert what `AuditExportService.export()` returns. Every
 * scenario here asserts what a client actually receives: the status code, the
 * machine code, the correlation id, and what is *absent* from the body. Two of
 * these (a dependency outage, and a slow store) had no HTTP coverage at all,
 * which is why "a failure carries a request id" could be claimed from a
 * response nobody was reading.
 *
 * Faults are injected at the D1 binding, not inside the handler, so the auth
 * lookup that must succeed really does run first. A test that broke auth and
 * called the 401 an export failure would prove nothing.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n, FAKE_SECRETS } from '../regression/helpers/local-env.mjs';

let d1Promise;
let httpEnv;

const SUPER_ADMIN_ID = 1;
const FAKE_DRIVER_MARKER = 'FAKE_DRIVER_PATH_MARKER_do-not-leak';

/** How long the route is willing to wait before calling an export a timeout. */
const ROUTE_EXPORT_TIMEOUT_MS = 5000;

test.before(async () => {
  const d1 = await startD1();
  d1Promise = Promise.resolve(d1);
  await initTestI18n();
  httpEnv = createTestEnv({ DB: d1.db });
});

test.after(async () => {
  const d1 = await d1Promise;
  if (d1) {
    await d1.dispose();
  }
});

/**
 * Wrap the real D1 binding so that statements matching `pattern` fail, and
 * count how many times they were reached.
 *
 * Everything else is delegated untouched, so authentication and authorisation
 * read the same rows they always do. A counter is returned because "the export
 * failed" is only meaningful if the query the export depends on was actually
 * attempted - otherwise an auth failure looks like an export failure.
 * @param {Object} db - Real D1 binding
 * @param {RegExp} pattern - SQL pattern to fail on
 * @param {string} [message] - Error message to throw
 * @returns {Object} Wrapped binding plus a call counter
 */
function failingOn(db, pattern, message = `D1_ERROR: simulated outage ${FAKE_DRIVER_MARKER}`) {
  const state = { attempts: 0, queries: [] };

  // The SQL is taken from the `prepare` argument. Miniflare's prepared
  // statement object does not expose a readable `sql` field, so reading it back
  // from the statement silently matches nothing and the fault never lands.
  const wrapStatement = (statement, sql) => {
    const isTarget = pattern.test(sql);
    const fail = () => {
      state.attempts += 1;
      state.queries.push(sql);
      return async () => {
        throw new Error(message);
      };
    };
    const statement_ = {
      bind: (...params) => (isTarget ? statement_ : wrapStatement(statement.bind(...params), sql)),
      all: (...args) => (isTarget ? fail()() : statement.all(...args)),
      first: (...args) => (isTarget ? fail()() : statement.first(...args)),
      run: (...args) => (isTarget ? fail()() : statement.run(...args)),
      raw: (...args) => statement.raw(...args)
    };
    return statement_;
  };

  const wrapped = {
    prepare: (sql) => wrapStatement(db.prepare(sql), sql),
    batch: async (statements) => db.batch(statements),
    exec: async (sql) => db.exec(sql),
    dump: async () => db.dump()
  };
  return { db: wrapped, state };
}

/**
 * Watch the deadline the route arms for its own export, using only the public
 * timer API.
 *
 * This replaces an assertion on the handle's `_destroyed` field. That field is
 * an internal detail of Node's timer implementation, not part of the API, so a
 * Node upgrade could rename or drop it and leave the test failing for a reason
 * that has nothing to do with this code. `hasRef()` is no substitute: it still
 * reports true for a timer that has already been cleared, so it would have
 * passed whether or not the route did the cleanup.
 *
 * What the route is required to do is settle the handle it armed, and the only
 * way to settle a timer is `clearTimeout`. So the watcher records the handles
 * created for the deadline delay and the ones passed to `clearTimeout`, and also
 * notes if the callback ever ran. That is a statement about the behaviour rather
 * than about a field name, and it holds across Node versions.
 *
 * @param {number} delay - The delay the route uses for its export deadline
 * @returns {Object} Watcher with `armed`, `settled`, `fired` and `restore()`
 */
function watchDeadline(delay) {
  const realSetTimeout = globalThis.setTimeout;
  const realClearTimeout = globalThis.clearTimeout;
  const armed = new Set();
  const settled = new Set();
  let fired = 0;

  globalThis.setTimeout = function patched(fn, ms, ...rest) {
    const handle = realSetTimeout((...args) => {
      if (armed.has(handle)) {
        fired += 1;
      }
      return fn(...args);
    }, ms, ...rest);
    if (ms === delay) {
      armed.add(handle);
    }
    return handle;
  };

  globalThis.clearTimeout = function patched(handle) {
    if (armed.has(handle)) {
      settled.add(handle);
    }
    return realClearTimeout(handle);
  };

  return {
    get armed() {
      return armed.size;
    },
    get settled() {
      return settled.size;
    },
    get fired() {
      return fired;
    },
    restore() {
      globalThis.setTimeout = realSetTimeout;
      globalThis.clearTimeout = realClearTimeout;
    }
  };
}

/**
 * A D1 binding whose export query never settles, so the route's own deadline is
 * what ends the request.
 * @param {Object} db - Real D1 binding
 * @returns {Object} Wrapped binding plus a call counter
 */
function hangingOn(db, pattern) {
  const state = { attempts: 0 };
  const never = new Promise(() => {});

  const wrapStatement = (statement, sql) => {
    const isTarget = pattern.test(sql);
    if (isTarget) {
      state.attempts += 1;
    }
    const target = { bind: () => target, all: () => never, first: () => never, run: () => never };
    return {
      bind: (...params) => (isTarget ? target : wrapStatement(statement.bind(...params), sql)),
      all: () => (isTarget ? never : statement.all()),
      first: () => (isTarget ? never : statement.first()),
      run: () => (isTarget ? never : statement.run())
    };
  };

  return { db: { prepare: (sql) => wrapStatement(db.prepare(sql), sql) }, state };
}

/** A signed super_admin access token for the seeded root account. */
async function superAdminToken(jti = 'jti-bt6-export-contract') {
  const { TokenService } = await import('../../src/services/tokenService.js');
  const jwtConfig = await new TokenService(httpEnv).getJwtConfig();
  const { createTokenPayload, signToken } = await import('../../src/utils/jwt.js');
  const payload = await createTokenPayload(
    {
      sub: `user:${SUPER_ADMIN_ID}`,
      iss: jwtConfig.issuer,
      aud: Array.isArray(jwtConfig.audience) ? jwtConfig.audience[0] : jwtConfig.audience,
      user_id: SUPER_ADMIN_ID,
      full_name: 'Root',
      email: 'root@example.invalid',
      role: 'super_admin',
      auth_version: 1,
      jti,
      scope: 'user:basic'
    },
    'access',
    httpEnv
  );
  return signToken(payload, FAKE_SECRETS.JWT_SECRET);
}

/**
 * Mount the production routers on a bare Hono app against a chosen DB binding.
 * @param {Object} [dbBinding] - D1 binding to expose as env.DB
 * @returns {Promise<Object>} Request helpers
 */
async function mount(dbBinding) {
  const { Hono } = await import('hono');
  const advancedRoutes = (await import('../../src/routes/advancedAudit.js')).default;
  const auditRoutes = (await import('../../src/routes/audit.js')).default;
  const localEnv = dbBinding ? createTestEnv({ DB: dbBinding }) : httpEnv;
  const app = new Hono();
  app.route('/api/audit', auditRoutes);
  app.route('/api/advanced-audit', advancedRoutes);
  const send = (path, init = {}) => app.request(`http://127.0.0.1${path}`, init, localEnv);
  return {
    send,
    get: (path, token, headers = {}) => send(path, {
      headers: { Authorization: `Bearer ${token}`, ...headers }
    }),
    post: (path, token, body, headers = {}) => send(path, {
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

async function seedRoot() {
  const d1 = await d1Promise;
  await d1.db
    .prepare('UPDATE users SET role = ?, status = ?, auth_version = 1 WHERE id = ?')
    .bind('super_admin', 'active', SUPER_ADMIN_ID)
    .run();
}

test('BT6-03: a store outage after authentication is a 503 the client can act on', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-outage');
  const d1 = await d1Promise;
  const { db, state } = failingOn(d1.db, /FROM\s+audit_logs/i);
  const { post } = await mount(db);

  const response = await post('/api/advanced-audit/export-advanced', token, { format: 'json' });

  assert.equal(
    state.attempts,
    1,
    'precondition: the export query was reached, so this is an export failure and not an auth failure'
  );
  assert.equal(response.status, 503, 'a dependency that cannot answer is not a caller error');

  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'DB_UNAVAILABLE');
  assert.equal(typeof body.requestId, 'string');
  assert.ok(body.requestId.length > 0);
  assert.ok(!JSON.stringify(body).includes(FAKE_DRIVER_MARKER), 'driver detail must not reach the client');
  assert.equal(body.data, undefined, 'an outage must not answer with an empty result');
  assert.equal(
    response.headers.get('Content-Disposition'),
    null,
    'an outage must not arrive dressed as a download'
  );
});

test('BT6-03: an unexpected exporter fault is a 500 with no internal detail', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-unexpected');
  const d1 = await d1Promise;
  // Not matching the outage pattern, so the service must classify it as an
  // ordinary failure rather than dressing it up as a dependency problem.
  const { db, state } = failingOn(
    d1.db,
    /FROM\s+audit_logs/i,
    `SyntaxError: near "FAKE": ${FAKE_DRIVER_MARKER}`
  );
  const { post } = await mount(db);

  const response = await post('/api/advanced-audit/export-advanced', token, { format: 'json' });

  assert.equal(state.attempts, 1, 'precondition: the export query was reached');
  assert.equal(response.status, 500);

  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'EXPORT_FAILED');
  assert.equal(typeof body.requestId, 'string');
  const serialised = JSON.stringify(body);
  assert.ok(!serialised.includes(FAKE_DRIVER_MARKER), 'no driver text may reach the client');
  assert.ok(!/near\s+"FAKE"/.test(serialised), 'no raw SQL fragment may reach the client');
  assert.equal(body.data, undefined, 'a failure must not answer with an empty result');
});

test('BT6-03: a store that never answers is a 504, and the deadline is cleaned up either way', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-timeout');
  const d1 = await d1Promise;
  const { db, state } = hangingOn(d1.db, /FROM\s+audit_logs/i);
  const { post } = await mount(db);

  // Watch the route's own deadline handle. The point is not the elapsed time:
  // it is that a handle created for the deadline is no longer referenced once
  // the request is finished, on the success path *and* when the exporter
  // throws. A timer that survives a rejected export keeps the request (and, in
  // workerd, the isolate) alive for the rest of its window.
  const deadline = watchDeadline(ROUTE_EXPORT_TIMEOUT_MS);

  let response;
  try {
    response = await post('/api/advanced-audit/export-advanced', token, { format: 'json' });
  } finally {
    deadline.restore();
  }

  assert.equal(state.attempts, 1, 'precondition: the export query was reached and hung');
  assert.equal(response.status, 504, 'a timeout is a failure, and says which failure it is');

  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'EXPORT_TIMEOUT');
  assert.equal(typeof body.requestId, 'string');
  assert.ok(body.requestId.length > 0);
  assert.equal(body.data, undefined, 'a timeout must not answer with an empty result');
  assert.equal(
    response.headers.get('Content-Disposition'),
    null,
    'a timeout must not arrive dressed as a download'
  );

  assert.equal(deadline.armed, 1, 'precondition: the route armed exactly one deadline');
  assert.equal(
    deadline.settled,
    1,
    'the deadline must be settled once the request is answered, or it outlives the response'
  );
  assert.equal(deadline.fired, 1, 'precondition: the deadline did fire, once, to end the request');
});

test('BT6-03: no export deadline outlives a failure the route has already answered', async () => {
  await seedRoot();
  const d1 = await d1Promise;
  const token = await superAdminToken('jti-bt6-deadline-sweep');

  // Four shapes the route can answer after the deadline is armed: a refusal
  // that needs no query, a store outage, an unexpected fault, and a store that
  // never answers. In every case the request is finished, so the handle the
  // route armed for its own deadline must not still be referenced - a surviving
  // handle keeps the event loop (and, in workerd, the request context) alive
  // for the rest of its window after the client already has its answer.
  const cases = [
    {
      name: '422 refusal',
      expect: 422,
      run: (helpers) => helpers.post('/api/advanced-audit/export-advanced', token, { format: 'pdf' })
    },
    {
      name: '503 outage',
      expect: 503,
      run: async () => {
        const faulted = failingOn(d1.db, /FROM\s+audit_logs/i);
        const wrapped = await mount(faulted.db);
        return wrapped.post('/api/advanced-audit/export-advanced', token, { format: 'json' });
      }
    },
    {
      name: '500 unexpected fault',
      expect: 500,
      run: async () => {
        const faulted = failingOn(d1.db, /FROM\s+audit_logs/i, `SyntaxError: ${FAKE_DRIVER_MARKER}`);
        const wrapped = await mount(faulted.db);
        return wrapped.post('/api/advanced-audit/export-advanced', token, { format: 'json' });
      }
    },
    {
      name: '504 timeout',
      expect: 504,
      run: async () => {
        const stalled = hangingOn(d1.db, /FROM\s+audit_logs/i);
        const wrapped = await mount(stalled.db);
        return wrapped.post('/api/advanced-audit/export-advanced', token, { format: 'json' });
      }
    }
  ];

  for (const scenario of cases) {
    const deadline = watchDeadline(ROUTE_EXPORT_TIMEOUT_MS);

    let response;
    try {
      response = await scenario.run(await mount());
    } finally {
      deadline.restore();
    }

    assert.equal(response.status, scenario.expect, `${scenario.name}: unexpected status`);
    assert.equal(deadline.armed, 1, `${scenario.name}: precondition, one deadline armed`);
    assert.equal(
      deadline.settled,
      1,
      `${scenario.name}: the deadline must be settled by the time the answer is sent, or it pins the request open for another ${ROUTE_EXPORT_TIMEOUT_MS}ms`
    );
  }
});

test('BT6-03: the refusal body carries the allowlisted metadata and nothing else', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-allowlist');
  const { post } = await mount();

  const refused = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    options: { encrypt: true }
  });
  assert.equal(refused.status, 422);

  const body = await refused.json();
  assert.deepEqual(
    Object.keys(body).sort(),
    ['availableOptions', 'code', 'error', 'message', 'requestId', 'success'],
    'the refusal publishes exactly the agreed fields, so a new service field cannot appear by accident'
  );
  assert.deepEqual(
    Object.keys(body.availableOptions).sort(),
    ['compress', 'compression', 'encrypt', 'include_charts', 'multiple_sheets', 'pivot_tables']
  );
  for (const value of Object.values(body.availableOptions)) {
    assert.equal(value, false, 'an option with no implementation is published as false, never true');
  }
});

test('BT6-03: an option set to false is not a request for it', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-option-false');
  const { post } = await mount();

  // `false` means "do not encrypt", which is the only thing this backend can
  // do. Refusing it would tell a client that it cannot ask for the default.
  const response = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    options: { encrypt: false, compress: false, compression: false }
  });

  assert.equal(response.status, 200, 'declining an unimplemented option is not asking for it');
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.format, 'json');
  assert.equal(body.data.code, undefined);
});

test('BT6-03: a correlation id is minted by the server, not taken from a caller header', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-requestid');
  const { post } = await mount();

  // `cf-ray` is the only header the export route will fall back to. A caller
  // that controls it controls the id a client will log, print and quote, so
  // what the server mints has to stay the server's own.
  const hostile = 'x'.repeat(4096);
  const response = await post(
    '/api/advanced-audit/export-advanced',
    token,
    { format: 'pdf' },
    { 'cf-ray': hostile }
  );

  assert.equal(response.status, 422);
  const body = await response.json();
  assert.equal(typeof body.requestId, 'string');
  assert.ok(body.requestId.length > 0);
  assert.notEqual(
    body.requestId,
    hostile,
    'a caller-supplied header must not become the correlation id'
  );
  assert.ok(
    body.requestId.length <= 128,
    `an unbounded id is a log-injection vector; got ${body.requestId.length} characters`
  );
});

test('BT6-03: the export ceiling the capabilities route publishes is the one enforced', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-limit');
  const { get, post } = await mount();

  const capabilities = await (await get('/api/advanced-audit/capabilities', token)).json();
  const advertised = capabilities.data.max_records;
  assert.equal(Number.isInteger(advertised), true);

  // One over the advertised ceiling must be refused by name, not clamped. A
  // clamp is invisible to the client: it asked for N+1 rows and got N of them
  // and had no way to notice.
  const refused = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    filters: { limit: advertised + 1 }
  });
  assert.equal(refused.status, 400);
  const body = await refused.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'INVALID_EXPORT_FILTER');
  assert.match(body.message, new RegExp(`at most ${advertised}`));
});

test('BT6-03: a JSON export over HTTP parses, and a CSV export arrives as a file', async () => {
  await seedRoot();
  const d1 = await d1Promise;
  await d1.db
    .prepare('DELETE FROM audit_logs WHERE action LIKE ?')
    .bind('bt6_fixture%')
    .run();
  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, status, actor_email, timestamp)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind('bt6_fixture_login', 'user', 'SUCCESS', 'u@example.invalid', '2026-09-20T10:00:00.000Z')
    .run();

  const token = await superAdminToken('jti-bt6-formats');
  const { get, post } = await mount();

  // The advanced route wraps the payload in the success envelope.
  const advancedJson = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    filters: { actions: ['bt6_fixture_login'] }
  });
  assert.equal(advancedJson.status, 200);
  const jsonEnvelope = await advancedJson.json();
  assert.equal(jsonEnvelope.success, true);
  assert.equal(jsonEnvelope.data.format, 'json');
  // The route hands the payload on already parsed, so a string here would mean
  // the client was asked to parse its own body twice.
  const rows = jsonEnvelope.data.data;
  assert.ok(Array.isArray(rows), `expected an array, got ${typeof rows}`);
  assert.equal(rows.length, 1);
  assert.equal(rows[0].action, 'bt6_fixture_login');
  assert.equal(jsonEnvelope.data.total_records, 1);

  // The audit route answers with the file itself, not an envelope.
  const auditCsv = await get('/api/audit/export?format=csv', token);
  assert.equal(auditCsv.status, 200);
  assert.equal(auditCsv.headers.get('Content-Type'), 'text/csv');
  const csv = await auditCsv.text();
  assert.ok(csv.includes('bt6_fixture_login'), 'the CSV must contain the row it selected');
  assert.match(auditCsv.headers.get('Content-Disposition') || '', /attachment; filename="audit_logs_[\d-]+\.csv"/);

  // A query that genuinely matched nothing is still a success.
  const emptyAdvanced = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    filters: { actions: ['bt6_fixture_absent'] }
  });
  assert.equal(emptyAdvanced.status, 200);
  const emptyBody = await emptyAdvanced.json();
  assert.equal(emptyBody.success, true, 'no matches is a successful export');
  assert.equal(emptyBody.data.total_records, 0);
  assert.deepEqual(emptyBody.data.data, []);
});

test('BT6-03: a refusal body and the response header name the same correlation id', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-id-agreement');
  const { get } = await mount();

  const response = await get('/api/audit/export?format=excel', token);

  assert.equal(response.status, 422);
  const body = await response.json();
  const headerId = response.headers.get('X-Request-ID');
  assert.equal(typeof headerId, 'string', 'the request id belongs in the response headers');
  assert.ok(headerId.length > 0);
  assert.equal(
    body.requestId,
    headerId,
    'two ids for one request would send an operator to the wrong log line'
  );
});

test('BT6-03: an export with no format asked for defaults to JSON', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-default-format');
  const { get } = await mount();

  // The default is a contract, not an implementation detail: a client that
  // omits the parameter should not have to know which one it gets.
  const response = await get('/api/audit/export', token);
  assert.equal(response.status, 200);
  assert.equal(
    response.headers.get('Content-Type'),
    'application/json',
    'the format nobody asked for is the documented default'
  );
  const body = await response.json();
  assert.ok(Array.isArray(body.data ?? body), 'a default export still answers with rows');
});

test('BT6-03: the reported size is the payload in bytes, not the envelope', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-size');
  const { post } = await mount();

  const response = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    filters: { actions: ['bt6_fixture_login'] }
  });
  assert.equal(response.status, 200);
  const body = await response.json();

  // The advanced route wraps the payload in a success envelope, so the size a
  // client sees describes the document the service produced - the rows with
  // their metadata - not the response it arrived in, which also carries the
  // envelope and the id. Reassembling that document is the client's job, and
  // this is what pins the two apart.
  const document = JSON.stringify({ metadata: body.data.metadata, data: body.data.data });
  assert.equal(
    body.data.size,
    Buffer.byteLength(document, 'utf8'),
    'size must be the byte length of the exported document, metadata included'
  );
  assert.notEqual(
    body.data.size,
    Buffer.byteLength(JSON.stringify(body), 'utf8'),
    'precondition: the envelope is a different size, so this is not accidentally self-consistent'
  );
});

test('BT6-03: the GET export route reports an outage as an outage too', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bt6-get-outage');
  const d1 = await d1Promise;
  const { db, state } = failingOn(d1.db, /FROM\s+audit_logs/i);
  const { get } = await mount(db);

  const response = await get('/api/audit/export?format=json', token);

  // This used to assert 500 with the comment "recorded as the export failure
  // this route reports today". That froze the bug rather than the contract: a
  // store that cannot answer is not a caller error, and every other export
  // route already answers 503 with a machine code. The expectation below is
  // the safe behaviour, so it fails on the code as it was.
  assert.ok(state.attempts >= 1, 'precondition: the export query was reached');
  assert.equal(response.status, 503, 'a dependency that cannot answer is not a caller error');

  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'DB_UNAVAILABLE', 'the client needs a machine code, not only a status');
  assert.equal(typeof body.requestId, 'string', 'a failure must be correlatable from the body');
  assert.ok(body.requestId.length > 0);
  assert.ok(!JSON.stringify(body).includes(FAKE_DRIVER_MARKER), 'driver detail must not reach the client');
  assert.equal(body.data, undefined, 'an outage must not answer with an empty result');
});

/**
 * Count how many export queries actually run, letting each one succeed.
 *
 * The outage helper counts *failed* attempts. This one counts *completed*
 * statements, which is what "the request was refused before the store was
 * touched" has to be measured with: a counter that only moves on failure would
 * read zero both when the query never ran and when it ran and happened to
 * succeed, and only the first of those is the behaviour being claimed.
 * @param {Object} db - Real D1 binding
 * @param {RegExp} pattern - SQL pattern to count
 * @returns {Object} Wrapped binding plus a call counter
 */
function countingOn(db, pattern) {
  const state = { attempts: 0, queries: [] };

  const wrapStatement = (statement, sql) => {
    const isTarget = pattern.test(sql);
    return {
      bind: (...params) => (isTarget ? wrapStatement(statement.bind(...params), sql) : wrapStatement(statement.bind(...params), sql)),
      all: (...args) => {
        if (isTarget) {
          state.attempts += 1;
          state.queries.push(sql);
        }
        return statement.all(...args);
      },
      first: (...args) => {
        if (isTarget) {
          state.attempts += 1;
          state.queries.push(sql);
        }
        return statement.first(...args);
      },
      run: (...args) => {
        if (isTarget) {
          state.attempts += 1;
          state.queries.push(sql);
        }
        return statement.run(...args);
      }
    };
  };

  const wrapped = {
    prepare: (sql) => wrapStatement(db.prepare(sql), sql),
    batch: async (statements) => db.batch(statements),
    exec: async (sql) => db.exec(sql),
    dump: async () => db.dump()
  };
  return { db: wrapped, state };
}

test('BP7-01: a metric carrying a SQL expression is refused before the export query runs', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-01-metric');
  const d1 = await d1Promise;
  const { db, state } = countingOn(d1.db, /FROM\s+audit_logs/i);
  const { post } = await mount(db);

  const response = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    aggregation: { group_by: ['action'], metrics: ['count, (SELECT 424242) AS reviewer_injected'] }
  });

  assert.equal(
    state.attempts,
    0,
    'precondition: a refused request must not reach the store at all'
  );
  assert.equal(response.status, 400, 'an unknown metric is the caller\'s mistake, not a server fault');

  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'INVALID_EXPORT_FILTER');
  assert.equal(body.data, undefined, 'a refusal must not answer with an empty result');
  assert.equal(
    response.headers.get('Content-Disposition'),
    null,
    'a refusal must not arrive dressed as a download'
  );

  const header = response.headers.get('X-Request-ID');
  if (header) {
    assert.equal(body.requestId, header, 'body and header must quote the same correlation id');
  }
  assert.ok(!/424242|reviewer_injected/.test(JSON.stringify(body)), 'no part of the expression may be echoed');
});

test('BP7-01: a group column outside the schema is refused rather than silently dropped', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-01-group');
  const { post } = await mount();

  const response = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    aggregation: { group_by: ['action; DROP TABLE audit_logs'], metrics: ['count'] }
  });

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.equal(body.code, 'INVALID_EXPORT_FILTER');
});

test('BP7-01: the documented metrics still work, so the allowlist is not just a refusal', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-01-valid');
  const { post } = await mount();

  const response = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    aggregation: { group_by: ['action'], metrics: ['count', 'first_occurrence', 'last_occurrence'] }
  });

  assert.equal(response.status, 200, 'precondition: the three documented metrics are accepted');
  const body = await response.json();
  assert.equal(body.success, true);
  assert.ok(Array.isArray(body.data.data));
});

test('BP7-04: a body that is not JSON is a client error, not an unfiltered export', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-04-malformed');
  const d1 = await d1Promise;
  const { db, state } = countingOn(d1.db, /FROM\s+audit_logs/i);
  const { send } = await mount(db);

  const response = await send('/api/advanced-audit/export-advanced', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: '{invalid-json'
  });

  assert.equal(
    state.attempts,
    0,
    'a payload that could not be read must not be answered with the whole table'
  );
  assert.equal(response.status, 400, 'a payload the server cannot read is the caller\'s mistake');

  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'INVALID_EXPORT_FILTER');
  assert.equal(body.data, undefined);
  assert.equal(response.headers.get('Content-Disposition'), null);
});

test('BP7-04: a JSON body of the wrong shape is refused', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-04-shape');
  const d1 = await d1Promise;
  const { db, state } = countingOn(d1.db, /FROM\s+audit_logs/i);
  const { send } = await mount(db);

  const bodies = [
    ['null', 'null'],
    ['an array', '[]'],
    ['a string', '"export"'],
    ['a number', '12345'],
    ['a boolean', 'true']
  ];

  for (const [label, raw] of bodies) {
    const response = await send('/api/advanced-audit/export-advanced', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: raw
    });

    assert.equal(state.attempts, 0, `precondition: ${label} must not reach the store`);
    assert.equal(response.status, 400, `${label} is not a request body this endpoint can use`);
    const body = await response.json();
    assert.equal(body.code, 'INVALID_EXPORT_FILTER', `a machine code is required for ${label}`);
    assert.equal(body.data, undefined, `${label} must not answer with data`);
  }
});

test('BP7-04: a field of the wrong type is refused instead of throwing', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-04-types');
  const d1 = await d1Promise;
  const { db, state } = countingOn(d1.db, /FROM\s+audit_logs/i);
  const { send } = await mount(db);

  const cases = [
    { format: 123 },
    { format: ['json'] },
    { format: { name: 'json' } },
    { filters: 'actions=LOGIN' },
    { filters: 42 },
    { filters: [] },
    { options: 'encrypt=true' },
    { aggregation: 'count' },
    { aggregation: [] }
  ];

  for (const payload of cases) {
    const response = await send('/api/advanced-audit/export-advanced', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    assert.equal(
      state.attempts,
      0,
      `precondition: ${JSON.stringify(payload)} must be refused before the store`
    );
    assert.equal(
      response.status,
      400,
      `${JSON.stringify(payload)} must be a client error, not a 500 from a type confusion`
    );
    const body = await response.json();
    assert.equal(body.code, 'INVALID_EXPORT_FILTER');
    assert.equal(body.data, undefined);
    assert.equal(
      typeof body.requestId,
      'string',
      `a refusal for ${JSON.stringify(payload)} must be correlatable`
    );
  }
});

test('BP7-04: an internal detail from a refused request never reaches the client', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-04-no-leak');
  const { send } = await mount();

  const response = await send('/api/advanced-audit/export-advanced', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ filters: { time_range: `${FAKE_DRIVER_MARKER}` } })
  });

  assert.equal(response.status, 400);
  const body = await response.json();
  assert.ok(
    !JSON.stringify(body).includes(FAKE_DRIVER_MARKER),
    'the value the caller sent must not be echoed back into the error'
  );
});

test('BP7-04: an unsupported but well-formed format is still 422, not 400', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-04-unsupported');
  const { post } = await mount();

  const response = await post('/api/advanced-audit/export-advanced', token, { format: 'xlsx' });

  assert.equal(
    response.status,
    422,
    'a format the service understands but cannot produce is a different answer from a broken request'
  );
  const body = await response.json();
  assert.equal(body.code, 'UNSUPPORTED_EXPORT_OPTION');
});

test('BP7-04: an empty body is still the default export, which malformed JSON is not', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-04-empty');
  const { send } = await mount();

  const response = await send('/api/advanced-audit/export-advanced', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: ''
  });

  assert.equal(response.status, 200, 'an empty body means "no filters", which the endpoint supports');
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.format, 'json');
});

test('BP7-04: an oversized payload is refused with a correlation id', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-04-oversize');
  const { send } = await mount();

  const response = await send('/api/advanced-audit/export-advanced', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ format: 'json', padding: 'x'.repeat(51000) })
  });

  assert.equal(response.status, 413);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(typeof body.requestId, 'string', 'a size refusal must still be correlatable');
});

test('BP7-04: a rejected body is not read before the role check', async () => {
  await seedRoot();
  const d1 = await d1Promise;
  const { db, state } = countingOn(d1.db, /FROM\s+audit_logs/i);
  const { send } = await mount(db);

  // No Authorization header at all: a payload the server cannot parse must not
  // become a way around the role check, so the refusal has to come from the
  // guard and not from the body handler.
  const response = await send('/api/advanced-audit/export-advanced', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: '{invalid-json'
  });

  assert.ok([401, 403].includes(response.status), 'an unauthenticated request is refused first');
  assert.equal(state.attempts, 0, 'no export query may run for a request that never authenticated');
});

test('BP7-04: an internal fault anywhere in the request path does not put its message in the response', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-bp7-04-internal');
  const d1 = await d1Promise;

  // A binding that throws when it is read. Where in the request this happens
  // is not the point of the test: the point is the outer guarantee, that an
  // exception carrying a technical detail never has that detail copied into
  // the response. The route handler additionally refuses to interpolate
  // `error.message` into its translated reason, but with the body now
  // validated up front that catch is no longer reachable by a bad payload, so
  // this asserts the guarantee rather than the specific line.
  const { createTestEnv } = await import('../regression/helpers/local-env.mjs');
  const throwing = createTestEnv({ DB: d1.db });
  const env = new Proxy(throwing, {
    get(target, property) {
      if (property === 'DB') {
        throw new Error(`binding unavailable: ${FAKE_DRIVER_MARKER}`);
      }
      return target[property];
    }
  });

  const advancedRoutes = (await import('../../src/routes/advancedAudit.js')).default;
  const { Hono } = await import('hono');
  const app = new Hono();
  app.route('/api/advanced-audit', advancedRoutes);

  const response = await app.request('http://127.0.0.1/api/advanced-audit/export-advanced', {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ format: 'json' })
  }, env);

  const text = await response.text();
  assert.equal(response.status, 500, 'an unexpected internal fault is a server error');
  assert.ok(
    !text.includes(FAKE_DRIVER_MARKER),
    'the internal message must not appear in the response, whatever the error-detail setting is'
  );
  assert.ok(
    !/binding unavailable/.test(text),
    'nor may any part of the internal message be paraphrased into it'
  );
});

/*
 * ---------------------------------------------------------------------------
 * BR8-01 / BR8-02 - the request that is supposed to work.
 *
 * Every other case in this file is a refusal. That is a real gap, not a stylistic
 * one: a valid `time_range` was failing as `EXPORT_FAILED`/500 through this very
 * route, and a suite made of refusals cannot notice that the success path is
 * broken. The tests below therefore go in with real auth, a real super_admin
 * token, real audit rows, and assert the bytes that come back.
 *
 * `countingOn` is used where the point is that a rejection happened early; the
 * positive cases use the plain binding so nothing about the export is stubbed.
 * ---------------------------------------------------------------------------
 */

const HTTP_PREFIX = 'br801_http';
const HTTP_ALICE = 'br801_alice@example.invalid';
const HTTP_BOB = 'br801_bob@example.invalid';

/**
 * Seed audit rows whose timestamps SQLite computes relative to now, so the
 * fixture and the cutoff under test come from one clock.
 * @param {Object} d1 - The D1 instance
 * @returns {Promise<void>} Resolves once the rows are committed
 */
async function seedWindowRows(d1) {
  const insert = (action, actor, offset) => d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, status, actor_email, timestamp)
       VALUES (?, 'user', 'SUCCESS', ?, datetime('now', ?))`
    )
    .bind(action, actor, offset)
    .run();

  await insert(`${HTTP_PREFIX}_in_30m`, HTTP_ALICE, '-30 minutes');
  await insert(`${HTTP_PREFIX}_in_3h`, HTTP_ALICE, '-3 hours');
  await insert(`${HTTP_PREFIX}_out_9d`, HTTP_BOB, '-9 days');
}

test('BR8-01: over HTTP a valid time_range returns 200 and only the rows in the window', async () => {
  await seedRoot();
  const d1 = await d1Promise;
  await d1.db.prepare('DELETE FROM audit_logs WHERE action LIKE ?').bind(`${HTTP_PREFIX}%`).run();
  await seedWindowRows(d1);
  const token = await superAdminToken('jti-br801-http-7d');
  const { post } = await mount();

  const response = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    filters: {
      time_range: '7d',
      actions: [`${HTTP_PREFIX}_in_30m`, `${HTTP_PREFIX}_in_3h`, `${HTTP_PREFIX}_out_9d`]
    }
  });

  assert.equal(
    response.status,
    200,
    `a valid 7d window must succeed over HTTP: ${await response.clone().text()}`
  );
  const body = await response.json();
  assert.equal(body.success, true);
  assert.equal(body.data.total_records, 2, 'two of the three seeded rows are inside seven days');
  assert.deepEqual(
    body.data.data.map((row) => row.action).sort(),
    [`${HTTP_PREFIX}_in_30m`, `${HTTP_PREFIX}_in_3h`],
    'the nine day old row must not be in the export'
  );
  assert.equal(
    body.data.metadata.filters_applied.time_range,
    '-7 days',
    'the response reports the window it actually applied'
  );
  assert.equal(
    response.headers.get('Content-Disposition'),
    null,
    'the JSON export is a JSON body, not a download'
  );
});

test('BR8-01: over HTTP the hours and minutes windows are three different answers', async () => {
  await seedRoot();
  const token = await superAdminToken('jti-br801-http-windows');
  const { post } = await mount();
  const actions = [`${HTTP_PREFIX}_in_30m`, `${HTTP_PREFIX}_in_3h`, `${HTTP_PREFIX}_out_9d`];
  const names = async (timeRange) => {
    const response = await post('/api/advanced-audit/export-advanced', token, {
      format: 'json',
      filters: { time_range: timeRange, actions }
    });
    assert.equal(response.status, 200, `${timeRange} must succeed: ${await response.clone().text()}`);
    const body = await response.json();
    return body.data.data.map((row) => row.action).sort();
  };

  assert.deepEqual(await names('45m'), [`${HTTP_PREFIX}_in_30m`], 'a 45 minute window excludes the 3 hour row');
  assert.deepEqual(
    await names('6h'),
    [`${HTTP_PREFIX}_in_30m`, `${HTTP_PREFIX}_in_3h`],
    'a 6 hour window excludes the 9 day row'
  );
  assert.deepEqual(
    await names('7d'),
    [`${HTTP_PREFIX}_in_30m`, `${HTTP_PREFIX}_in_3h`],
    'a 7 day window still excludes the 9 day row: widening the window is not "everything"'
  );
});

test('BR8-01: over HTTP a CSV export contains the windowed rows and not the rest', async () => {
  await seedRoot();

  const token = await superAdminToken('jti-br801-http-csv');
  const { post } = await mount();

  const response = await post('/api/advanced-audit/export-advanced', token, {
    format: 'csv',
    filters: {
      time_range: '7d',
      actions: [`${HTTP_PREFIX}_in_30m`, `${HTTP_PREFIX}_out_9d`]
    }
  });

  assert.equal(response.status, 200, `CSV must succeed: ${await response.clone().text()}`);
  const body = await response.json();
  assert.equal(body.data.format, 'csv');
  assert.equal(body.data.total_records, 1);
  assert.match(body.data.data, new RegExp(`${HTTP_PREFIX}_in_30m`));
  assert.doesNotMatch(body.data.data, new RegExp(`${HTTP_PREFIX}_out_9d`));
  assert.match(body.data.filename, /^audit_export_.*\.csv$/);
});

test('BR8-01: over HTTP an aggregated export counts the same rows', async () => {
  await seedRoot();
  const d1 = await d1Promise;
  await d1.db.prepare('DELETE FROM audit_logs WHERE action LIKE ?').bind(`${HTTP_PREFIX}%`).run();
  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, status, actor_email, timestamp)
       VALUES (?, 'user', 'SUCCESS', ?, datetime('now', ?))`
    )
    .bind(`${HTTP_PREFIX}_agg`, HTTP_ALICE, '-20 minutes')
    .run();
  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, status, actor_email, timestamp)
       VALUES (?, 'user', 'SUCCESS', ?, datetime('now', ?))`
    )
    .bind(`${HTTP_PREFIX}_agg`, HTTP_ALICE, '-25 minutes')
    .run();
  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, status, actor_email, timestamp)
       VALUES (?, 'user', 'SUCCESS', ?, datetime('now', ?))`
    )
    .bind(`${HTTP_PREFIX}_agg_stale`, HTTP_BOB, '-9 days')
    .run();

  const token = await superAdminToken('jti-br801-http-agg');
  const { post } = await mount();
  const actions = [`${HTTP_PREFIX}_agg`, `${HTTP_PREFIX}_agg_stale`];

  const aggregated = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    filters: { time_range: '7d', actions },
    aggregation: { group_by: ['action'], metrics: ['count'] }
  });
  const plain = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    filters: { time_range: '7d', actions }
  });

  assert.equal(aggregated.status, 200, `aggregated export must succeed: ${await aggregated.clone().text()}`);
  assert.equal(plain.status, 200, `plain export must succeed: ${await plain.clone().text()}`);

  const grouped = (await aggregated.json()).data.data;
  const rows = (await plain.json()).data.data;

  assert.deepEqual(grouped, [{ action: `${HTTP_PREFIX}_agg`, count: 2 }]);
  assert.equal(
    grouped.reduce((sum, group) => sum + group.count, 0),
    rows.length,
    'the aggregate must count exactly the rows the plain export returns'
  );
});

test('BR8-02: over HTTP a cutoff the store cannot represent is a 400, not an empty 200', async () => {
  await seedRoot();
  const d1 = await d1Promise;
  const { db, state } = countingOn(d1.db, /FROM\s+audit_logs/i);
  const token = await superAdminToken('jti-br802-http-huge');
  const { post } = await mount(db);

  const response = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    filters: { time_range: '9007199254740991d' }
  });

  assert.equal(response.status, 400, 'a cutoff that cannot be rendered is a caller error');
  assert.equal(
    state.attempts,
    0,
    'no export row may be read for a cutoff the store cannot compute'
  );
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'INVALID_EXPORT_FILTER');
  assert.equal(body.data, undefined, 'a refusal must not answer with an empty result');
  assert.equal(typeof body.requestId, 'string', 'a refusal must be correlatable');
  assert.equal(
    response.headers.get('Content-Disposition'),
    null,
    'a refusal must not arrive dressed as a download'
  );
});

test('BR8-02: over HTTP the published ceiling is accepted and one step above is refused', async () => {
  await seedRoot();
  const d1 = await d1Promise;
  const { db, state } = countingOn(d1.db, /FROM\s+audit_logs/i);
  const token = await superAdminToken('jti-br802-http-ceiling');
  const { post, get } = await mount(db);

  // The capabilities route is how a client learns the ceiling, so the number it
  // publishes is the number the export endpoint enforces.
  const capabilities = await get('/api/advanced-audit/capabilities', token);
  assert.equal(capabilities.status, 200);
  const published = (await capabilities.json()).data;

  const attemptsBefore = state.attempts;

  const atCeiling = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    filters: { time_range: `${published.time_range_max.d}d` }
  });
  assert.equal(atCeiling.status, 200, `the published maximum must work: ${await atCeiling.clone().text()}`);
  assert.ok(
    state.attempts > attemptsBefore,
    'precondition: the export query really ran for the accepted range'
  );

  const overCeiling = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    filters: { time_range: `${published.time_range_max.d + 1}d` }
  });
  assert.equal(overCeiling.status, 400, 'one step above the published ceiling must be refused');
  const body = await overCeiling.json();
  assert.equal(body.code, 'INVALID_EXPORT_FILTER');
  assert.match(body.message, /at most/, 'the refusal names the ceiling the client can read');
});
