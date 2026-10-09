import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { fileURLToPath } from 'node:url';

import {
  captureLogs,
  createTestEnv,
  initTestI18n,
  seedKv,
  FAKE_PASSWORD,
  FAKE_SECRETS,
  assertNoMarker
} from './helpers/local-env.mjs';

import {
  redactSensitiveData,
  sanitizeAuditUrl,
  redactText,
  isSensitiveKey,
  describeAuthScheme
} from '../../src/utils/sensitiveData.js';
import { sanitizeAuditDetails } from '../../src/utils/auditHelpers.js';

const SENTINEL = 'COLD_START_RESULT ';
const FAKE_BEARER_MARKER = 'fa1e-fake-bearer-token-marker-DO-NOT-USE';
const probePath = fileURLToPath(new URL('./helpers/cold-start-probe.mjs', import.meta.url));

const ALL_MARKERS = Object.values(FAKE_SECRETS).concat(FAKE_PASSWORD);

function assertClean(text, label) {
  for (const marker of ALL_MARKERS) {
    assertNoMarker(text, marker, label);
  }
}



test('B01: debug namespaces are not enabled at module import time', async () => {
  const { debug, jwt_log, app_log } = await import('../../src/utils/debug.js');
  assert.equal(debug.enabled(jwt_log.namespace), false, 'debug must be off at import time');
  assert.equal(debug.enabled(app_log.namespace), false, 'debug must be off at import time');
});

test('B01: empty DEBUG and DEBUG=none both mean disabled', async () => {
  const { debug, app_log, configureDebugNamespaces } = await import('../../src/utils/debug.js');

  configureDebugNamespaces('');
  assert.equal(debug.enabled(app_log.namespace), false);

  configureDebugNamespaces('none');
  assert.equal(debug.enabled(app_log.namespace), false);

  configureDebugNamespaces(app_log.namespace);
  assert.equal(debug.enabled(app_log.namespace), true);
  debug.disable();
});

test('B02: nested password fields are redacted at every depth', () => {
  const payload = {
    currentPassword: FAKE_PASSWORD,
    newPassword: FAKE_PASSWORD,
    confirmPassword: FAKE_PASSWORD,
    nested: {
      deeper: {
        password: FAKE_PASSWORD,
        list: [{ refresh_token: FAKE_SECRETS.JWT_SECRET }, { safe: 'value' }]
      }
    },
    email: 'user@example.invalid'
  };

  const redacted = redactSensitiveData(payload);
  assertClean(JSON.stringify(redacted), 'redacted payload');
  assert.equal(redacted.email, 'user@example.invalid', 'non-sensitive fields are preserved');

  const copy = { ...payload };
  redactSensitiveData(copy);
  assert.equal(copy.currentPassword, FAKE_PASSWORD, 'input object must not be mutated');
});

test('B02: audit detail sanitizer redacts nested credentials', () => {
  const details = {
    method: 'POST',
    fullPath: '/api/user/change-password?token=abc123secret',
    requestBody: {
      currentPassword: FAKE_PASSWORD,
      confirmPassword: FAKE_PASSWORD,
      nested: { newPassword: FAKE_PASSWORD }
    },
    authorization: `Bearer ${FAKE_SECRETS.JWT_SECRET}`,
    cookie: `session=${FAKE_SECRETS.JWT_SECRET}`
  };

  for (const level of ['minimal', 'standard', 'strict', 'unknown-level']) {
    const sanitized = sanitizeAuditDetails(details, level);
    assertClean(JSON.stringify(sanitized), `sanitizeAuditDetails(${level})`);
  }
});

test('B02: URL tokens are masked before being copied into audit fields', () => {
  const cases = [
    `/api/user/verify-email?token=${FAKE_SECRETS.JWT_SECRET}`,
    `/api/auth/callback?access_token=${FAKE_SECRETS.JWT_SECRET}&state=abc`,
    `https://api.example.invalid/reset?refresh_token=${FAKE_SECRETS.JWT_SECRET}&page=2`
  ];
  for (const input of cases) {
    const output = sanitizeAuditUrl(input);
    assertClean(output, 'sanitizeAuditUrl');
    assert.ok(/REDACTED/.test(output), `expected redaction marker in ${output}`);
  }
  assert.equal(sanitizeAuditUrl('/api/user/profile'), '/api/user/profile');
});

test('B02: bearer tokens and JWTs inside free text are masked', () => {
  const text = `Authorization: Bearer ${FAKE_SECRETS.JWT_SECRET} and eyJhbGciOiJIUzI1NiJ9.eyJhIjoxfQ.sig`;
  const output = redactText(text);
  assertClean(output, 'redactText');
});

test('B02: redaction handles cycles and depth limits', () => {
  const cyclic = { name: 'root' };
  cyclic.self = cyclic;
  const cyclicOut = redactSensitiveData(cyclic);
  assert.equal(cyclicOut.self, '[CIRCULAR]');

  let deep = { value: 'leaf' };
  for (let i = 0; i < 20; i += 1) {
    deep = { nested: deep };
  }
  const deepOut = JSON.stringify(redactSensitiveData(deep));
  assert.ok(deepOut.includes('[TRUNCATED_DEPTH]'));
});

test('B02: sensitive key detection covers the schema field names in use', () => {
  for (const key of [
    'currentPassword',
    'newPassword',
    'confirmPassword',
    'password',
    'token',
    'refresh_token',
    'authorization',
    'cookie',
    'apiKey',
    'EMAIL_PROVIDER_API_KEY'
  ]) {
    assert.equal(isSensitiveKey(key), true, `${key} must be treated as sensitive`);
  }
  for (const key of ['username', 'email', 'page', 'limit', 'sortBy']) {
    assert.equal(isSensitiveKey(key), false, `${key} must not be treated as sensitive`);
  }
});

/**
 * R1: the remaining log sinks must be verified with real output, not with the
 * assumption that key-based redaction is enough. Opaque bind values (SQL
 * params) and raw headers are the two paths regex redaction cannot cover.
 */

const OPAQUE_BIND_MARKER = 'OPAQUE-BIND-VALUE-MARKER-4b1c';

function createRecordingDatabase() {
  const executed = [];
  return {
    executed,
    prepare(sql) {
      const record = { sql, params: [] };
      executed.push(record);
      const statement = {
        bind(...params) {
          record.params = params;
          return statement;
        },
        async first() { return null; },
        async all() { return { results: [] }; },
        async run() { return { success: true, meta: { changes: 1, last_row_id: 1 } }; }
      };
      return statement;
    }
  };
}

test('R1: SQL logging never emits bind values, only operation metadata', async () => {
  const { configureDebugNamespaces } = await import('../../src/utils/debug.js');
  const db = createRecordingDatabase();
  const env = createTestEnv({ DB: db, LOG_SQL_QUERIES: true, CONFIG_KV: null });

  configureDebugNamespaces('hono-auth-api:database*');
  const capture = captureLogs();
  try {
    const { DatabaseService } = await import('../../src/services/databaseService.js');
    const service = new DatabaseService(env);
    await service.select('SELECT * FROM users WHERE email = ?', [OPAQUE_BIND_MARKER], true);
    await service.insert('INSERT INTO audit_logs (target_identifier) VALUES (?)', [OPAQUE_BIND_MARKER]);
    await service.update('UPDATE users SET full_name = ? WHERE id = ?', [OPAQUE_BIND_MARKER, 1]);
    await service.delete('DELETE FROM users WHERE id = ?', [OPAQUE_BIND_MARKER]);
    await service.upsert('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v', ['k', OPAQUE_BIND_MARKER]);
    await service.buildWhereClause({ email: OPAQUE_BIND_MARKER }, ['email']);
  } finally {
    capture.restore();
    configureDebugNamespaces('');
  }

  assert.ok(db.executed.length >= 5, 'the fake database must actually have been exercised');
  assert.equal(
    capture.text.includes(OPAQUE_BIND_MARKER),
    false,
    `bind value leaked into SQL log output:\n${capture.text}`
  );
  assert.ok(
    /select|operation|query/i.test(capture.text),
    'SQL logging must still record an operation identifier'
  );
});





test('B02: audit sanitizer masks URL, encoded-query and free-text copies of a token', () => {
  const marker = `FAKE-URL-TOKEN-${OPAQUE_BIND_MARKER}`;
  const cases = [
    { fullPath: `/api/user/activate?token=${marker}` },
    { message: `Bearer ${marker}` },
    { target_identifier: `/api/user/activate?token=${marker}` },
    { encoded: `/api/user/activate?token%3D${marker}` },
    { nested: `{"password":"${marker}","keep":"value"}` },
    { malformed: `/api/user/activate?state=%E0%A4%A&token=${marker}` }
  ];

  for (const details of cases) {
    const serialized = JSON.stringify(sanitizeAuditDetails(details));
    assert.equal(serialized.includes(marker), false, `token leaked from ${JSON.stringify(details)}: ${serialized}`);
  }
});

test('B02: request capture uses an allowlist so opaque credentials never reach audit', async () => {
  const { buildAuditRequestMetadata } = await import('../../src/middleware/unifiedRequestMiddleware.js');
  const body = {
    email: 'user@example.invalid',
    currentPassword: FAKE_PASSWORD,
    newPassword: FAKE_PASSWORD,
    confirmPassword: FAKE_PASSWORD,
    customOpaqueField: OPAQUE_BIND_MARKER,
    nested: { anything: FAKE_PASSWORD }
  };

  const metadata = buildAuditRequestMetadata(body);
  const serialized = JSON.stringify(metadata);
  assert.equal(serialized.includes(OPAQUE_BIND_MARKER), false, 'unlisted field value must not be captured');
  assert.equal(serialized.includes(FAKE_PASSWORD), false, 'credentials must not be captured');
  assert.equal(metadata.email, 'user@example.invalid', 'allowlisted business field is preserved');
  assert.equal(metadata.currentPassword, '[REDACTED]', 'credential presence stays visible');
  // Field names are client-controlled, so only the count is kept (A-02).
  assert.equal(metadata.omitted_field_count, 2);
  assert.equal(metadata.omitted_fields, undefined, 'raw client key names must not be recorded');
  assert.equal(body.currentPassword, FAKE_PASSWORD, 'the business request object must not be mutated');
});

test('B02: business handlers still receive the original secrets', async () => {
  const { redactSensitiveData: redact } = await import('../../src/utils/sensitiveData.js');
  const body = { currentPassword: FAKE_PASSWORD, newPassword: FAKE_PASSWORD };
  const sanitized = redact(body);
  assert.equal(sanitized.currentPassword, '[REDACTED]');
  assert.equal(body.currentPassword, FAKE_PASSWORD, 'the request object handed to validation must be untouched');
  assert.equal(body.newPassword, FAKE_PASSWORD);
});

test('B02: non-credential routes keep recursive redaction instead of an allowlist', async () => {
  const { buildAuditRequestMetadata } = await import('../../src/middleware/unifiedRequestMiddleware.js');
  const body = {
    displayName: 'Operations',
    nested: { apiKey: FAKE_SECRETS.EMAIL_PROVIDER_API_KEY, note: 'keep me' },
    customOpaqueField: OPAQUE_BIND_MARKER
  };

  const metadata = buildAuditRequestMetadata(body, { strict: false });
  assert.equal(metadata.displayName, 'Operations', 'non-credential routes must not lose business fields');
  assert.equal(metadata.customOpaqueField, OPAQUE_BIND_MARKER, 'redaction is key-based off the allowlist here');
  assert.equal(metadata.nested.apiKey, '[REDACTED]', 'nested secrets are still redacted');
  assert.equal(metadata.nested.note, 'keep me');
  assert.equal(metadata.omitted_field_count, undefined, 'no allowlist bookkeeping outside credential routes');
});

/**
 * A-01: `describeAuthScheme` copied the client-controlled text before the first
 * space into the log line. A header such as `FAKE_SCHEME_MARKER anything` is
 * rejected with 401, yet the marker still reached the middleware log. Only a
 * known scheme constant may be rendered; everything else is reported as
 * unknown/opaque without echoing client input.
 */

const SCHEME_MARKER = 'FAKE_SCHEME_MARKER';

test('A-01: describeAuthScheme never echoes client-controlled scheme text', () => {
  const cases = [
    `${SCHEME_MARKER} anything`,
    `${SCHEME_MARKER}`,
    `  ${SCHEME_MARKER}  `,
    `${SCHEME_MARKER}\t${SCHEME_MARKER}`,
    `Bearer ${SCHEME_MARKER}`
  ];

  for (const header of cases) {
    const described = describeAuthScheme(header);
    assert.equal(
      described.toLowerCase().includes(SCHEME_MARKER.toLowerCase()),
      false,
      `describeAuthScheme(${JSON.stringify(header)}) leaked the scheme marker: ${described}`
    );
  }
});

test('A-01: describeAuthScheme still distinguishes known and unknown schemes', () => {
  assert.equal(describeAuthScheme('Bearer abc.def.ghi'), 'bearer');
  assert.equal(describeAuthScheme('bearer abc.def.ghi'), 'bearer');
  assert.equal(describeAuthScheme('Basic dXNlcjpwYXNz'), 'basic');
  assert.equal(describeAuthScheme(`Token ${SCHEME_MARKER}`), 'token');
  assert.equal(describeAuthScheme(''), 'absent');
  assert.equal(describeAuthScheme(undefined), 'absent');
  assert.match(describeAuthScheme(SCHEME_MARKER), /^(unknown|opaque)/);
});



/**
 * A-02: strict request metadata copied allowlisted values through
 * pattern-based redaction, which cannot recognise an opaque secret. `code` was
 * allowlisted, top-level arrays fell back to the non-strict recursive path,
 * `fullName` smuggled an arbitrary nested object, and the omitted-field list recorded
 * raw client-controlled key names. Metadata must be validated per endpoint
 * shape instead of recursively copying arbitrary values.
 */

const OPAQUE_METADATA_MARKER = 'FAKE_OPAQUE_MARKER';

test('A-02: strict metadata does not copy an opaque value under an allowlisted key', async () => {
  const { buildAuditRequestMetadata: build } = await import('../../src/middleware/unifiedRequestMiddleware.js');
  const bodies = [
    { code: OPAQUE_METADATA_MARKER },
    { username: { nested: OPAQUE_METADATA_MARKER } },
    { fullName: { arbitrary: OPAQUE_METADATA_MARKER } },
    { email: [OPAQUE_METADATA_MARKER] },
    { role: OPAQUE_METADATA_MARKER }
  ];

  for (const body of bodies) {
    const serialized = JSON.stringify(build(body));
    assert.equal(
      serialized.includes(OPAQUE_METADATA_MARKER),
      false,
      `opaque value survived strict metadata for ${JSON.stringify(body)}: ${serialized}`
    );
  }
});

test('A-02: strict metadata does not echo client-controlled key names', async () => {
  const { buildAuditRequestMetadata: build } = await import('../../src/middleware/unifiedRequestMiddleware.js');
  const body = { [OPAQUE_METADATA_MARKER]: 'value', email: 'user@example.invalid' };

  const metadata = build(body);
  const serialized = JSON.stringify(metadata);
  assert.equal(
    serialized.includes(OPAQUE_METADATA_MARKER),
    false,
    `client key name leaked into the audit metadata: ${serialized}`
  );
  assert.equal(metadata.email, 'user@example.invalid', 'allowlisted business field is preserved');
});

test('A-02: a non-object top-level body is described, not copied', async () => {
  const { buildAuditRequestMetadata: build } = await import('../../src/middleware/unifiedRequestMiddleware.js');
  for (const body of [[OPAQUE_METADATA_MARKER], OPAQUE_METADATA_MARKER, 42, true]) {
    const serialized = JSON.stringify(build(body));
    assert.equal(
      serialized.includes(OPAQUE_METADATA_MARKER),
      false,
      `non-object body leaked an opaque value: ${serialized}`
    );
  }
});

test('A-02: strict metadata records scalar allowlisted business fields unchanged', async () => {
  const { buildAuditRequestMetadata: build } = await import('../../src/middleware/unifiedRequestMiddleware.js');
  const body = {
    email: 'user@example.invalid',
    username: 'user1',
    locale: 'vi',
    currentPassword: FAKE_PASSWORD
  };

  const metadata = build(body);
  assert.equal(metadata.email, 'user@example.invalid');
  assert.equal(metadata.username, 'user1');
  assert.equal(metadata.locale, 'vi');
  assert.equal(metadata.currentPassword, '[REDACTED]', 'credential presence stays visible');
  assert.equal(body.currentPassword, FAKE_PASSWORD, 'the business request object must not be mutated');
});

/**
 * A-03: the encoded-query pattern required a doubled `%3F%3F`/`%3D%3D` prefix, and
 * a malformed percent escape made `safeDecode` return the raw input. A
 * partially malformed path such as `/activate%3Ftoken%3D<marker>%ZZ` therefore
 * kept the credential in clear text through both `redactText` and
 * `sanitizeAuditUrl`.
 */

const ENCODED_MARKER = 'FAKE_ENCODED_MARKER';

test('A-03: encoded query credentials are redacted with single-encoded separators', () => {
  const cases = [
    `/activate%3Ftoken%3D${ENCODED_MARKER}`,
    `/activate%3ftoken%3d${ENCODED_MARKER}`,
    `/activate%3Ftoken%3D${ENCODED_MARKER}%26page%3D2`,
    `/activate%3Fpassword%3D${ENCODED_MARKER}`,
    `/activate%3Fcode%3D${ENCODED_MARKER}`
  ];

  for (const input of cases) {
    for (const [label, output] of [
      ['redactText', redactText(input)],
      ['sanitizeAuditUrl', sanitizeAuditUrl(input)],
      ['redactSensitiveData', JSON.stringify(redactSensitiveData({ path: input }))]
    ]) {
      assert.equal(
        output.includes(ENCODED_MARKER),
        false,
        `${label}(${input}) kept an encoded credential: ${output}`
      );
    }
  }
});

test('A-03: partially malformed percent escapes do not return the raw credential', () => {
  const cases = [
    `/activate%3Ftoken%3D${ENCODED_MARKER}%ZZ`,
    `/activate%3Ftoken%3D${ENCODED_MARKER}%`,
    `/activate%3Ftoken%3D${ENCODED_MARKER}%E0%A4%A`,
    `/activate%3Ftoken%3D${ENCODED_MARKER}%%`,
    `/activate%3Ftoken%3D%ZZ${ENCODED_MARKER}`
  ];

  for (const input of cases) {
    for (const [label, output] of [
      ['redactText', redactText(input)],
      ['sanitizeAuditUrl', sanitizeAuditUrl(input)]
    ]) {
      assert.equal(
        output.includes(ENCODED_MARKER),
        false,
        `${label}(${input}) returned the raw credential after a failed decode: ${output}`
      );
    }
  }
});

test('A-03: double-encoded and JSON-wrapped credentials stay redacted', () => {
  const cases = [
    `/activate%253Ftoken%253D${ENCODED_MARKER}`,
    JSON.stringify({ path: `/activate%3Ftoken%3D${ENCODED_MARKER}` }),
    `prefix {"url":"/activate%3Ftoken%3D${ENCODED_MARKER}"} suffix`
  ];

  for (const input of cases) {
    const output = redactText(input);
    assert.equal(
      output.includes(ENCODED_MARKER),
      false,
      `redactText kept a nested credential: ${output}`
    );
  }
});

test('A-03: ordinary paths and queries are left intact', () => {
  assert.equal(sanitizeAuditUrl('/api/user/profile'), '/api/user/profile');
  assert.equal(sanitizeAuditUrl('/api/audit/logs?page=2&limit=25'), '/api/audit/logs?page=2&limit=25');
  assert.equal(redactText('a perfectly ordinary log line'), 'a perfectly ordinary log line');
});

/**
 * A-05: DatabaseService stopped logging bind values but still logged the full
 * `${query}` text, and DB error messages were logged verbatim. A literal
 * credential inside a query string — or a driver error echoing it — therefore
 * reached the log. Only an operation/query identifier, a bind-parameter count
 * and an error category may be logged.
 */

const SQL_LITERAL_MARKER = 'FAKE_SQL_LITERAL_MARKER';
const SQL_ERROR_MARKER = 'FAKE_SQL_ERROR_MARKER';

test('A-05: SQL logging emits no raw query text, literal or driver error', async () => {
  const { configureDebugNamespaces } = await import('../../src/utils/debug.js');
  const db = createRecordingDatabase();
  const env = createTestEnv({ DB: db, LOG_SQL_QUERIES: true, CONFIG_KV: null });

  configureDebugNamespaces('hono-auth-api:*');
  const capture = captureLogs();
  try {
    const { DatabaseService } = await import('../../src/services/databaseService.js');
    const service = new DatabaseService(env);

    await service.select(`SELECT * FROM users WHERE email = '${SQL_LITERAL_MARKER}'`, [OPAQUE_BIND_MARKER], true);
    await service.insert(`INSERT INTO audit_logs (target_identifier) VALUES ('${SQL_LITERAL_MARKER}')`, [OPAQUE_BIND_MARKER]);
    await service.update(`UPDATE users SET full_name = '${SQL_LITERAL_MARKER}' WHERE id = ?`, [OPAQUE_BIND_MARKER, 1]);
    await service.delete(`DELETE FROM users WHERE id = '${SQL_LITERAL_MARKER}'`, [OPAQUE_BIND_MARKER]);
    await service.execute(`SELECT * FROM t WHERE x = '${SQL_LITERAL_MARKER}'`, [OPAQUE_BIND_MARKER], 'all');
  } finally {
    capture.restore();
    configureDebugNamespaces('');
  }

  for (const marker of [SQL_LITERAL_MARKER, OPAQUE_BIND_MARKER]) {
    assert.equal(
      capture.text.includes(marker),
      false,
      `query literal/bind value leaked into the SQL log:\n${capture.text}`
    );
  }
  assert.ok(capture.text.length > 0, 'the SQL log must still record the operation, not be disabled to pass');
});



/**
 * Run the cold-start probe in its own process.
 *
 * A child process is required, not a convenience: the Worker logs at import
 * time and the Node runner owns stdout, so in-process capture would either miss
 * cold start or corrupt the test report.
 * @param {string} debug - Value for DEBUG, `''` for the disabled case
 * @returns {Promise<{code: number, output: string, result: Object}>} Probe outcome
 */
function runColdStartProbe(debug) {
  return new Promise((resolve, reject) => {
    execFile(
      process.execPath,
      [probePath],
      {
        env: { ...process.env, PROBE_DEBUG: debug },
        timeout: 120000,
        maxBuffer: 16 * 1024 * 1024
      },
      (error, stdout, stderr) => {
        if (error && typeof error.code !== 'number') {
          reject(error);
          return;
        }
        const output = `${stdout}${stderr}`;
        const line = output.split('\n').find((item) => item.startsWith(SENTINEL));
        resolve({
          code: error ? error.code ?? 1 : 0,
          output,
          result: line ? JSON.parse(line.slice(SENTINEL.length)) : null
        });
      }
    );
  });
}
