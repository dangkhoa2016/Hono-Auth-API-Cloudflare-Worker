import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  captureLogs,
  createTestEnv,
  initTestI18n,
  FAKE_PASSWORD,
  FAKE_SECRETS
} from '../regression/helpers/local-env.mjs';

/**
 * T1 / A-02, A-03: exercise the real request path end to end.
 *
 * The regression suite proves the helpers behave, but the guarantee that
 * matters is at the sink: a credential sent to a credential-bearing route must
 * not survive into the audit row, the middleware log, or the audit service's
 * bound parameters — while the handler that validates the request must still
 * receive the original value untouched.
 */

const OPAQUE_MARKER = 'FAKE_OPAQUE_MARKER';
const ENCODED_MARKER = 'FAKE_ENCODED_MARKER';

/**
 * Recording D1 stub: keeps every statement so a test can assert on the values
 * that would have been persisted.
 */
function createAuditRecordingDatabase() {
  const inserts = [];
  return {
    inserts,
    prepare(sql) {
      const record = { sql, params: [] };
      const statement = {
        bind(...params) {
          record.params = params;
          return statement;
        },
        async first() {
          return null;
        },
        async all() {
          return { results: [] };
        },
        async run() {
          inserts.push(record);
          return { success: true, meta: { changes: 1, last_row_id: inserts.length } };
        }
      };
      return statement;
    }
  };
}

function serializeAllBoundValues(db) {
  return db.inserts
    .map((record) => `${record.sql} :: ${record.params.map((p) => (typeof p === 'string' ? p : JSON.stringify(p))).join('|')}`)
    .join('\n');
}

/**
 * Mount the production unified request middleware on an auth route, plus a
 * handler that stands in for the real validator/handler pair. The handler
 * records the raw body it received so a test can prove the business path is
 * unaffected.
 */
async function mountCredentialRoute(received) {
  const { Hono } = await import('hono');
  const { ROUTE_TYPES } = await import('../../src/constants/routeCategoryMappings.js');
  const { createUnifiedRequestMiddleware } = await import('../../src/middleware/unifiedRequestMiddleware.js');

  const app = new Hono();
  app.use(
    '/api/auth/*',
    createUnifiedRequestMiddleware(ROUTE_TYPES.AUTH, 'auth.password.reset', 'POST /api/auth/password/reset')
  );
  app.post('/api/auth/password/reset', async (c) => {
    // Stands in for the zod validator + AuthService: it must see the original
    // values, not the redacted audit metadata.
    received.push(await c.req.json());
    return c.json({ success: true }, 200);
  });
  return app;
}

test('A-02: a credential route persists no opaque marker in the audit row', async () => {
  const db = createAuditRecordingDatabase();
  const env = createTestEnv({ DB: db });
  const received = [];
  const app = await mountCredentialRoute(received);

  await initTestI18n();

  const body = {
    email: 'user@example.invalid',
    currentPassword: FAKE_PASSWORD,
    newPassword: FAKE_PASSWORD,
    confirmPassword: FAKE_PASSWORD,
    code: OPAQUE_MARKER,
    fullName: { arbitrary: OPAQUE_MARKER },
    customOpaqueField: OPAQUE_MARKER
  };

  const { configureDebugNamespaces } = await import('../../src/utils/debug.js');
  configureDebugNamespaces('hono-auth-api:*');
  const capture = captureLogs();
  let response;
  try {
    response = await app.request(
      'http://127.0.0.1/api/auth/password/reset',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'user-agent': 'regression-test' },
        body: JSON.stringify(body)
      },
      env
    );
  } finally {
    capture.restore();
    configureDebugNamespaces('');
  }

  assert.equal(response.status, 200, 'the route itself must still succeed');
  assert.ok(db.inserts.length > 0, 'precondition: the audit sink must actually have written a row');
  assert.equal(received.length, 1, 'the business handler must have been reached');

  // The handler must see exactly what the client sent.
  assert.equal(received[0].currentPassword, FAKE_PASSWORD);
  assert.equal(received[0].newPassword, FAKE_PASSWORD);
  assert.equal(received[0].confirmPassword, FAKE_PASSWORD);
  assert.equal(received[0].code, OPAQUE_MARKER);

  const persisted = serializeAllBoundValues(db);
  for (const marker of [OPAQUE_MARKER, FAKE_PASSWORD]) {
    assert.equal(
      persisted.includes(marker),
      false,
      `"${marker}" was persisted to the audit row:\n${persisted}`
    );
    assert.equal(
      capture.text.includes(marker),
      false,
      `"${marker}" leaked into the middleware log:\n${capture.text}`
    );
  }

  // The legitimate business field must still be there, otherwise the audit
  // record is useless.
  assert.ok(persisted.includes('user@example.invalid'), 'the allowlisted email must still be audited');
});

test('A-02: a malformed request body on a credential route is described, not copied', async () => {
  const db = createAuditRecordingDatabase();
  const env = createTestEnv({ DB: db });
  const received = [];
  const app = await mountCredentialRoute(received);

  await initTestI18n();

  // A top-level array where an object is expected: the validator must reject it
  // and the audit metadata must describe its shape only.
  const body = [OPAQUE_MARKER, { code: OPAQUE_MARKER }];

  const { configureDebugNamespaces } = await import('../../src/utils/debug.js');
  configureDebugNamespaces('hono-auth-api:*');
  const capture = captureLogs();
  try {
    await app.request(
      'http://127.0.0.1/api/auth/password/reset',
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'user-agent': 'regression-test' },
        body: JSON.stringify(body)
      },
      env
    );
  } finally {
    capture.restore();
    configureDebugNamespaces('');
  }

  const persisted = serializeAllBoundValues(db);
  assert.equal(
    persisted.includes(OPAQUE_MARKER),
    false,
    `a non-object credential body leaked into the audit row:\n${persisted}`
  );
  assert.equal(
    capture.text.includes(OPAQUE_MARKER),
    false,
    `a non-object credential body leaked into the log:\n${capture.text}`
  );
});

test('A-03: an encoded credential in the query string never reaches the audit row', async () => {
  const db = createAuditRecordingDatabase();
  const env = createTestEnv({ DB: db });
  const received = [];
  const app = await mountCredentialRoute(received);

  await initTestI18n();

  const paths = [
    `/api/auth/activate%3Ftoken%3D${ENCODED_MARKER}`,
    `/api/auth/activate%3Ftoken%3D${ENCODED_MARKER}%ZZ`,
    `/api/auth/activate%3Ftoken%3D%ZZ${ENCODED_MARKER}`
  ];

  const { configureDebugNamespaces } = await import('../../src/utils/debug.js');
  configureDebugNamespaces('hono-auth-api:*');
  const capture = captureLogs();
  try {
    for (const path of paths) {
      await app.request(
        `http://127.0.0.1${path}`,
        {
          method: 'POST',
          headers: { 'content-type': 'application/json', 'user-agent': 'regression-test' },
          body: JSON.stringify({ email: 'user@example.invalid' })
        },
        env
      );
    }
  } finally {
    capture.restore();
    configureDebugNamespaces('');
  }

  assert.ok(db.inserts.length >= paths.length, 'precondition: every request must have produced an audit row');
  const persisted = serializeAllBoundValues(db);
  assert.equal(
    persisted.includes(ENCODED_MARKER),
    false,
    `an encoded credential was persisted to the audit row:\n${persisted}`
  );
  assert.equal(
    capture.text.includes(ENCODED_MARKER),
    false,
    `an encoded credential leaked into the middleware log:\n${capture.text}`
  );
});

test('B02: the audit row keeps the real path but never the credential fragment', async () => {
  const db = createAuditRecordingDatabase();
  const env = createTestEnv({ DB: db });
  const received = [];
  const app = await mountCredentialRoute(received);

  await initTestI18n();

  const { configureDebugNamespaces } = await import('../../src/utils/debug.js');
  configureDebugNamespaces('hono-auth-api:*');
  const capture = captureLogs();
  try {
    await app.request(
      `http://127.0.0.1/api/auth/password/reset?token=${FAKE_SECRETS.JWT_SECRET}&page=2`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'user-agent': 'regression-test' },
        body: JSON.stringify({ email: 'user@example.invalid' })
      },
      env
    );
  } finally {
    capture.restore();
    configureDebugNamespaces('');
  }

  const persisted = serializeAllBoundValues(db);
  assert.equal(
    persisted.includes(FAKE_SECRETS.JWT_SECRET),
    false,
    `a query-string token was persisted to the audit row:\n${persisted}`
  );
  assert.ok(
    persisted.includes('/api/auth/password/reset'),
    `the route must still be identifiable in the audit row:\n${persisted}`
  );
  assert.equal(
    capture.text.includes(FAKE_SECRETS.JWT_SECRET),
    false,
    `a query-string token leaked into the middleware log:\n${capture.text}`
  );
});
