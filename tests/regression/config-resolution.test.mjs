/**
 * T4/B11: one resolver for dynamic config + KV, with an explicit distinction
 * between "missing" and "false/0/empty", type validation, published precedence,
 * and secret-safe comparison output.
 *
 * These tests are red on purpose until `src/utils/configResolver.js` and the
 * kv-admin routes honour the contract.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createTestEnv, initTestI18n, seedKv, captureLogs, assertNoMarker, FAKE_SECRETS } from './helpers/local-env.mjs';
import { Hono } from 'hono';
import kvAdmin from '../../src/routes/kvAdmin.js';
import { kvConfigMiddleware } from '../../src/middleware/kvConfig.js';

const SECRET_MARKER = FAKE_SECRETS.EMAIL_PROVIDER_API_KEY;

/**
 * A scripted D1 stub: only the user lookup used by authMiddleware is answered.
 */
function createScriptedDatabase(userRow) {
  return {
    prepare(sql) {
      const statement = {
        sql,
        bind() { return statement; },
        first() {
          return /user/i.test(sql) ? userRow : null;
        },
        all() { return { results: [] }; },
        run() { return { success: true, meta: { changes: 0, last_row_id: 0 } }; }
      };
      return statement;
    },
    batch() { return []; }
  };
}

const SUPER_ADMIN_ROW = {
  id: 1,
  user_id: 1,
  full_name: 'Root',
  email: 'root@example.invalid',
  role: 'super_admin',
  status: 'active',
  auth_version: 1
};

async function issueSuperAdminToken(env) {
  const { TokenService } = await import('../../src/services/tokenService.js');
  const jwtConfig = await new TokenService(env).getJwtConfig();
  const { createTokenPayload, signToken } = await import('../../src/utils/jwt.js');
  const payload = await createTokenPayload(
    {
      sub: 'user:1',
      iss: jwtConfig.issuer,
      aud: Array.isArray(jwtConfig.audience) ? jwtConfig.audience[0] : jwtConfig.audience,
      user_id: 1,
      full_name: 'Root',
      email: 'root@example.invalid',
      role: 'super_admin',
      auth_version: 1,
      jti: 'jti-kv-admin-fixture',
      scope: 'user:basic'
    },
    'access',
    env
  );
  return await signToken(payload, FAKE_SECRETS.JWT_SECRET);
}

async function buildKvAdminApp(env) {
  await initTestI18n();
  const app = new Hono();
  app.use('*', kvConfigMiddleware);
  app.route('/api/kv-admin', kvAdmin);
  const token = await issueSuperAdminToken(env);
  return {
    get(path) {
      return app.request(`http://127.0.0.1/api/kv-admin${path}`, {
        headers: { Authorization: `Bearer ${token}` }
      }, env);
    }
  };
}

// ---------------------------------------------------------------------------
// parseConfigValue: missing vs false vs 0 vs empty vs invalid
// ---------------------------------------------------------------------------

test('B11: an unset key is "missing", not false and not empty string', async () => {
  const { parseConfigValue } = await import('../../src/utils/configResolver.js');

  for (const raw of [undefined, null, '']) {
    const result = parseConfigValue('RATE_LIMIT_DISABLED', raw);
    assert.equal(result.status, 'missing', `${JSON.stringify(raw)} must be missing, not ${result.status}`);
  }
});

test('B11: the string "false" resolves to boolean false, never truthy', async () => {
  const { parseConfigValue } = await import('../../src/utils/configResolver.js');

  for (const raw of ['false', 'FALSE', 'False', '0', false, 0]) {
    const result = parseConfigValue('RATE_LIMIT_DISABLED', raw);
    assert.equal(result.status, 'ok', `${JSON.stringify(raw)} should be a valid bool`);
    assert.strictEqual(result.value, false, `${JSON.stringify(raw)} must be false, not ${JSON.stringify(result.value)}`);
  }

  for (const raw of ['true', 'TRUE', '1', true, 1]) {
    const result = parseConfigValue('RATE_LIMIT_DISABLED', raw);
    assert.strictEqual(result.value, true, `${JSON.stringify(raw)} must be true`);
  }
});

test('B11: a bool key with an unparseable value is invalid, not silently enabled', async () => {
  const { parseConfigValue } = await import('../../src/utils/configResolver.js');

  for (const raw of ['maybe', 'yes', 'no', 'on', 'off', '2', 'enabled']) {
    const result = parseConfigValue('RATE_LIMIT_DISABLED', raw);
    assert.equal(result.status, 'invalid', `${JSON.stringify(raw)} must be invalid`);
    assert.equal(result.value, undefined, `${JSON.stringify(raw)} must not yield a value`);
  }
});

test('B11: numeric keys parse and clamp, and reject non-numeric junk', async () => {
  const { parseConfigValue } = await import('../../src/utils/configResolver.js');

  assert.strictEqual(parseConfigValue('RATE_LIMIT_MAX_ATTEMPTS', '42').value, 42);
  assert.strictEqual(parseConfigValue('RATE_LIMIT_MAX_ATTEMPTS', 7).value, 7);

  assert.equal(parseConfigValue('RATE_LIMIT_MAX_ATTEMPTS', 'abc').status, 'invalid');
  assert.equal(parseConfigValue('RATE_LIMIT_MAX_ATTEMPTS', true).status, 'invalid');
  assert.equal(parseConfigValue('RATE_LIMIT_MAX_ATTEMPTS', {}).status, 'invalid');

  // Registry clamp keeps a hostile or typo value inside the documented range.
  const high = parseConfigValue('SECURITY_HIGH_RISK_THRESHOLD', '100000');
  assert.ok(high.value <= 100, `expected SECURITY_HIGH_RISK_THRESHOLD to clamp to <=100, got ${high.value}`);

  const low = parseConfigValue('SECURITY_HIGH_RISK_THRESHOLD', '-5');
  assert.ok(low.value >= 1, `expected SECURITY_HIGH_RISK_THRESHOLD to clamp to >=1, got ${low.value}`);
});

test('B11: 0 is a real value for a numeric key and is not treated as missing', async () => {
  const { parseConfigValue } = await import('../../src/utils/configResolver.js');
  const result = parseConfigValue('RATE_LIMIT_LOCKOUT_DURATION', '0');
  assert.equal(result.status, 'ok');
  assert.strictEqual(result.value, 0);
});

test('B11: string keys keep their value, including "false" as text', async () => {
  const { parseConfigValue } = await import('../../src/utils/configResolver.js');
  assert.strictEqual(parseConfigValue('CORS_ORIGIN', 'false').value, 'false');
  assert.strictEqual(parseConfigValue('APP_NAME', 'Hono Auth API').value, 'Hono Auth API');
});

// ---------------------------------------------------------------------------
// resolveConfigKey: published precedence
// ---------------------------------------------------------------------------

function kvReader(store) {
  return {
    get(key) {
      // The resolver always addresses KV by its prefixed real key.
      const realKey = String(key).replace(/^hono-auth-api:/, '');
      return store.has(realKey) ? store.get(realKey) : null;
    }
  };
}

test('B11: precedence is KV > env > default and the source is reported', async () => {
  const { resolveConfigKey } = await import('../../src/utils/configResolver.js');

  const env = createTestEnv({ APP_NAME: 'FromEnv', RATE_LIMIT_MAX_ATTEMPTS: 3 });

  assert.deepStrictEqual(
    await resolveConfigKey('APP_NAME', env, kvReader(new Map([['APP_NAME', 'FromKv']]))),
    { key: 'APP_NAME', source: 'kv', value: 'FromKv' }
  );
  assert.deepStrictEqual(
    await resolveConfigKey('APP_NAME', env, kvReader(new Map())),
    { key: 'APP_NAME', source: 'env', value: 'FromEnv' }
  );
  assert.deepStrictEqual(
    await resolveConfigKey('RATE_LIMIT_MAX_ATTEMPTS', env, kvReader(new Map())),
    { key: 'RATE_LIMIT_MAX_ATTEMPTS', source: 'env', value: 3 }
  );
  assert.deepStrictEqual(
    await resolveConfigKey('CORS_ORIGIN', env, kvReader(new Map())),
    { key: 'CORS_ORIGIN', source: 'default', value: '*' }
  );
});

test('B11: a key outside KV_CONFIG_KEYS can never be overridden through KV', async () => {
  const { resolveConfigKey } = await import('../../src/utils/configResolver.js');

  const env = createTestEnv({ ENVIRONMENT: 'test' });
  const resolved = await resolveConfigKey(
    'ENVIRONMENT',
    env,
    kvReader(new Map([['ENVIRONMENT', 'pwned']]))
  );

  assert.equal(resolved.source, 'env');
  assert.equal(resolved.value, 'test', 'KV must not override a non-KV key');
});

test('B11: preferKV=false inverts the order but still respects KV_CONFIG_KEYS', async () => {
  const { resolveConfigKey } = await import('../../src/utils/configResolver.js');

  const env = createTestEnv({ APP_NAME: 'FromEnv' });
  const store = new Map([['APP_NAME', 'FromKv']]);

  assert.equal((await resolveConfigKey('APP_NAME', env, kvReader(store), { preferKV: false })).source, 'env');
  assert.equal((await resolveConfigKey('ENVIRONMENT', env, kvReader(new Map([['ENVIRONMENT', 'pwned']])), { preferKV: false })).source, 'env');
});

test('B11: an invalid value on a security setting is refused, not silently applied', async () => {
  const { resolveConfigKey } = await import('../../src/utils/configResolver.js');

  const env = createTestEnv({ RATE_LIMIT_DISABLED: 'maybe' });
  await assert.rejects(
    () => resolveConfigKey('RATE_LIMIT_DISABLED', env, kvReader(new Map())),
    (error) => {
      assert.equal(error.code, 'INVALID_CONFIG_VALUE');
      assert.equal(error.statusCode, 422);
      return true;
    },
    'a non-parsable security toggle must surface as a contract error, never default to enabled'
  );
});

test('B11: an invalid value on a non-security setting falls back and says so', async () => {
  const { resolveConfigKey } = await import('../../src/utils/configResolver.js');

  const env = createTestEnv({ AUDIT_DEFAULT_PAGE_SIZE: 'lots' });
  const resolved = await resolveConfigKey('AUDIT_DEFAULT_PAGE_SIZE', env, kvReader(new Map()));
  assert.equal(resolved.source, 'default');
  assert.strictEqual(resolved.value, 50);
});

// ---------------------------------------------------------------------------
// buildConfigComparison: secret-safe output
// ---------------------------------------------------------------------------

test('B11: comparison output never carries a raw value for any key', async () => {
  const { buildConfigComparison } = await import('../../src/utils/configResolver.js');

  const env = createTestEnv({ APP_NAME: 'MyApp', EMAIL_PROVIDER_API_KEY: SECRET_MARKER });
  await seedKv(env, 'APP_NAME', '"FromKv"');

  const { comparison, summary } = await buildConfigComparison({
    keys: ['APP_NAME', 'EMAIL_PROVIDER_API_KEY', 'RATE_LIMIT_DISABLED', 'CORS_ORIGIN'],
    env,
    kv: { get(key) { return env.CONFIG_KV.get(key.replace(/^hono-auth-api:/, '')); } }
  });

  assertNoMarker(JSON.stringify(comparison), SECRET_MARKER, 'env-comparison body');
  assertNoMarker(JSON.stringify(summary), SECRET_MARKER, 'env-comparison summary');

  for (const [key, entry] of Object.entries(comparison)) {
    for (const forbidden of ['env', 'kv', 'default', 'value']) {
      assert.equal(
        entry[forbidden],
        undefined,
        `${key}.${forbidden} would leak the raw value; expected only configured/masked/source`
      );
    }
    assert.ok(['kv', 'env', 'default'].includes(entry.source), `${key} has an unusable source: ${entry.source}`);
  }

  assert.equal(comparison.EMAIL_PROVIDER_API_KEY.sensitive, true);
  assert.equal(comparison.EMAIL_PROVIDER_API_KEY.masked.env, '***MASKED***');
  assert.equal(comparison.EMAIL_PROVIDER_API_KEY.configured.env, true);
  assert.equal(comparison.APP_NAME.configured.kv, true);
  assert.equal(comparison.APP_NAME.source, 'kv');
});

test('B11: comparison source reflects presence, not truthiness', async () => {
  const { buildConfigComparison } = await import('../../src/utils/configResolver.js');

  const env = createTestEnv({ RATE_LIMIT_DISABLED: 'false', EMAIL_FROM_NAME: '', RATE_LIMIT_MAX_ATTEMPTS: '0' });
  const { comparison, summary } = await buildConfigComparison({
    keys: ['RATE_LIMIT_DISABLED', 'EMAIL_FROM_NAME', 'RATE_LIMIT_MAX_ATTEMPTS'],
    env,
    kv: { get() { return null; } }
  });

  assert.equal(comparison.RATE_LIMIT_DISABLED.source, 'env', '"false" is present in env and must win over default');
  assert.equal(comparison.RATE_LIMIT_DISABLED.configured.env, true);
  assert.equal(comparison.EMAIL_FROM_NAME.source, 'env', 'an empty-string env override is still an override');
  assert.equal(comparison.EMAIL_FROM_NAME.configured.env, true);
  assert.equal(comparison.RATE_LIMIT_MAX_ATTEMPTS.source, 'env', '0 is a real env override');
  assert.equal(comparison.RATE_LIMIT_MAX_ATTEMPTS.configured.env, true);
  assert.equal(summary.fromEnv, 3);
});

test('B11: comparison never reports a value hash that could be probed', async () => {
  const { buildConfigComparison } = await import('../../src/utils/configResolver.js');

  const env = createTestEnv({ EMAIL_PROVIDER_API_KEY: SECRET_MARKER });
  const { comparison } = await buildConfigComparison({
    keys: ['EMAIL_PROVIDER_API_KEY'],
    env,
    kv: { get() { return null; } }
  });

  const entry = comparison.EMAIL_PROVIDER_API_KEY;
  assert.deepStrictEqual(Object.keys(entry).sort(), ['configured', 'masked', 'sensitive', 'source']);
  assert.doesNotMatch(JSON.stringify(entry), /[0-9a-f]{16,}/i, 'no digest may be exposed for a secret');
});

// ---------------------------------------------------------------------------
// HTTP: the real kv-admin routes
// ---------------------------------------------------------------------------

test('B11: GET /api/kv-admin/configs/env-comparison does not leak the mail API key', async () => {
  const env = createTestEnv({ DB: createScriptedDatabase(SUPER_ADMIN_ROW), APP_NAME: 'MyApp' });
  const client = await buildKvAdminApp(env);

  const response = await client.get('/configs/env-comparison');
  assert.equal(response.status, 200, `expected 200, got ${response.status}`);
  const raw = await response.text();

  assertNoMarker(raw, SECRET_MARKER, 'env-comparison response body');
  const body = JSON.parse(raw);
  assert.equal(body.success, true);
  assert.equal(body.data.comparison.EMAIL_PROVIDER_API_KEY.sensitive, true);
  assert.equal(body.data.comparison.EMAIL_PROVIDER_API_KEY.configured.env, true);
  assert.equal(body.data.comparison.EMAIL_PROVIDER_API_KEY.masked.env, '***MASKED***');
  assert.equal(typeof body.data.summary.sensitive, 'number');
});

test('B11: GET /api/kv-admin/configs/env-comparison reports source by presence', async () => {
  const env = createTestEnv({
    DB: createScriptedDatabase(SUPER_ADMIN_ROW),
    RATE_LIMIT_DISABLED: 'false',
    // An empty-string override is still an override; truthiness would drop it.
    EMAIL_FROM_NAME: ''
  });
  await seedKv(env, 'hono-auth-api:APP_NAME', '"FromKv"');
  const client = await buildKvAdminApp(env);

  const body = await (await client.get('/configs/env-comparison')).json();
  assert.equal(body.data.comparison.RATE_LIMIT_DISABLED.source, 'env');
  assert.equal(body.data.comparison.EMAIL_FROM_NAME.source, 'env', 'an empty-string env override must not be reported as default');
  assert.equal(body.data.comparison.APP_NAME.source, 'kv');
  assert.equal(body.data.summary.fromKV, 1);
});

test('B11: GET /api/kv-admin/configs does not leak secret values either', async () => {
  const env = createTestEnv({ DB: createScriptedDatabase(SUPER_ADMIN_ROW) });
  await seedKv(env, 'hono-auth-api:EMAIL_PROVIDER_API_KEY', JSON.stringify(SECRET_MARKER));
  const client = await buildKvAdminApp(env);

  const raw = await (await client.get('/configs')).text();
  assertNoMarker(raw, SECRET_MARKER, 'GET /configs response body');
});

test('B11: GET /api/kv-admin/configs/:key does not write a raw secret to the log', async () => {
  const env = createTestEnv({ DB: createScriptedDatabase(SUPER_ADMIN_ROW) });
  await seedKv(env, 'hono-auth-api:EMAIL_PROVIDER_API_KEY', JSON.stringify(SECRET_MARKER));
  const client = await buildKvAdminApp(env);

  const { configureDebugNamespaces } = await import('../../src/utils/debug.js');
  const logs = captureLogs();
  try {
    configureDebugNamespaces('hono-auth-api:*');
    const response = await client.get('/configs/EMAIL_PROVIDER_API_KEY');
    assert.equal(response.status, 200, `expected 200, got ${response.status}`);
    assertNoMarker(logs.text, SECRET_MARKER, 'kv-admin log output');
  } finally {
    configureDebugNamespaces('');
    logs.restore();
  }
});

// ---------------------------------------------------------------------------
// Missing vs unavailable: an unreachable binding is not an unset key
// ---------------------------------------------------------------------------

/**
 * A KV binding whose reads always fail, to tell an outage apart from a miss.
 * @param {string} reason - Error message to raise
 * @returns {Object} KV-like binding
 */
function createUnreachableKv(reason = 'KV_ERROR: binding unreachable') {
  let reads = 0;
  return {
    reads: () => reads,
    async get() {
      reads += 1;
      throw new Error(reason);
    },
    async list() {
      reads += 1;
      throw new Error(reason);
    },
    async put() { throw new Error(reason); },
    async delete() { throw new Error(reason); }
  };
}

test('B11: an unreachable KV is not reported as a missing security setting', async () => {
  const { getDynamicConfig } = await import('../../src/utils/dynamicConfig.js');
  const { ConfigDependencyUnavailableError } = await import('../../src/utils/serviceErrors.js');
  const kv = createUnreachableKv();
  const env = createTestEnv({ CONFIG_KV: kv, RATE_LIMIT_DISABLED: false });

  // `RATE_LIMIT_DISABLED` gates a security control. Falling back to the default
  // here would report "the operator configured this" when nothing was read.
  await assert.rejects(
    () => getDynamicConfig(env, 'RATE_LIMIT_DISABLED'),
    (error) => {
      assert.ok(error instanceof ConfigDependencyUnavailableError, `expected a typed outage, got ${error?.constructor?.name}: ${error?.message}`);
      assert.equal(error.code, 'CONFIG_UNAVAILABLE');
      assert.equal(error.statusCode, 503);
      return true;
    }
  );
  assert.ok(kv.reads() > 0, 'the binding must actually have been read');
});

test('B11: a non-security key falls back on an outage, and the log says outage', async () => {
  const { getDynamicConfig } = await import('../../src/utils/dynamicConfig.js');
  const kv = createUnreachableKv();
  const env = createTestEnv({ CONFIG_KV: kv });
  const { configureDebugNamespaces } = await import('../../src/utils/debug.js');

  const capture = captureLogs();
  let value;
  try {
    configureDebugNamespaces('hono-auth-api:*');
    value = await getDynamicConfig(env, 'AUTO_ACTIVATE_USER_ON_REGISTER', false);
  } finally {
    configureDebugNamespaces('');
    capture.restore();
  }

  assert.equal(value, false, 'a non-security setting may keep its default during an outage');
  assert.match(
    capture.text,
    /Config dependency unavailable/i,
    `the fallback must be recorded as an outage, not as "not set": ${capture.text.slice(0, 400)}`
  );
});

test('B11: a KV read that succeeds with null is still a missing key, not an outage', async () => {
  const { getDynamicConfig } = await import('../../src/utils/dynamicConfig.js');
  const env = createTestEnv({
    CONFIG_KV: { async get() { return null; } },
    RATE_LIMIT_DISABLED: false
  });

  // Control case for the test above: no throw, no outage, the env layer wins.
  const value = await getDynamicConfig(env, 'RATE_LIMIT_DISABLED', true);
  assert.equal(value, false, 'a genuine miss must fall through to env without raising');
});

test('B11: KVConfigService shares the published parser instead of its own copy', async () => {
  const { KVConfigService } = await import('../../src/services/kvConfigService.js');
  const service = new KVConfigService(createTestEnv({ CONFIG_KV: { async get() { return null; } } }));

  // One parser, one answer: the same raw values the resolver accepts.
  assert.equal(service.parseValue('false', 'RATE_LIMIT_DISABLED'), false);
  assert.equal(service.parseValue('0', 'RATE_LIMIT_DISABLED'), false);
  assert.equal(service.parseValue('1', 'RATE_LIMIT_DISABLED'), true);
  assert.equal(service.parseValue('false', 'DEBUG'), 'false', 'a text key keeps "false" as text');
  assert.equal(service.parseValue('', 'DEBUG'), '', 'an empty text value is a value, not a miss');
});

test('B11: KVConfigService does not turn an unreachable binding into an empty configuration set', async () => {
  const { KVConfigService } = await import('../../src/services/kvConfigService.js');
  const { ConfigDependencyUnavailableError } = await import('../../src/utils/serviceErrors.js');
  const service = new KVConfigService(createTestEnv({ CONFIG_KV: createUnreachableKv() }));

  // `{}` would tell the comparison endpoint that nothing is configured.
  await assert.rejects(
    () => service.getAll(),
    (error) => {
      assert.ok(error instanceof ConfigDependencyUnavailableError, `got ${error?.constructor?.name}: ${error?.message}`);
      return true;
    }
  );
});

test('B11: KVConfigService boolean settings never fall back to truthiness', async () => {
  const { KVConfigService } = await import('../../src/services/kvConfigService.js');
  const stored = { 'hono-auth-api:AUDIT_AUTO_ARCHIVE_ENABLED': JSON.stringify('false') };
  const service = new KVConfigService(createTestEnv({
    CONFIG_KV: {
      async get(key) { return stored[key] ?? null; },
      async list() { return { keys: [] }; }
    }
  }));

  assert.equal(
    await service.getBooleanConfig('AUDIT_AUTO_ARCHIVE_ENABLED'),
    false,
    'the stored string "false" must be false'
  );

  // The control case for the truthiness bug: a non-empty string that is not a
  // boolean literal must be false, never `Boolean(value) === true`.
  stored['hono-auth-api:AUDIT_AUTO_ARCHIVE_ENABLED'] = JSON.stringify('yes');
  service.clearCache();
  assert.equal(
    await service.getBooleanConfig('AUDIT_AUTO_ARCHIVE_ENABLED'),
    false,
    'an unparseable string must not enable a setting'
  );

  stored['hono-auth-api:AUDIT_AUTO_ARCHIVE_ENABLED'] = JSON.stringify('true');
  service.clearCache();
  assert.equal(
    await service.getBooleanConfig('AUDIT_AUTO_ARCHIVE_ENABLED'),
    true,
    'the stored string "true" must still enable the setting'
  );
});
