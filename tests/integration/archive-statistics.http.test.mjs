import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n } from '../regression/helpers/local-env.mjs';

let local;
let env;
let app;
let headers;
test.before(async () => {
  local = await startD1();
  await initTestI18n();
  env = createTestEnv({ DB: local.db });
  app = (await import('../../src/index.js')).default;
  const password = 'Local-http-fixture-8q!';
  await local.db.prepare('UPDATE users SET full_name=?,email=?,password=?,role=?,status=? WHERE id=1')
    .bind('Capability fixture', 'capability@example.invalid', await bcrypt.hash(password, 4), 'super_admin', 'active').run();
  const login = await app.request('http://127.0.0.1/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'capability@example.invalid', password })
  }, env);
  assert.equal(login.status, 200);
  headers = { Authorization: `Bearer ${(await login.json()).data.access_token}`, 'Content-Type': 'application/json' };
});
test.after(async () => {await local?.dispose();});

test('archive statistics deadline is explicit and cannot look like an empty successful report', async (t) => {
  const nativeTimeout = globalThis.setTimeout;
  let targeted = 0;
  const fault = {
    prepare(sql) {
      const statement = local.db.prepare(sql);
      if (/SELECT/i.test(sql) && /audit_logs|audit_logs_archive/i.test(sql)) {
        const stalled = {
          bind: () => stalled,
          all: () => {targeted++; return new Promise(() => {});},
          first: () => {targeted++; return new Promise(() => {});},
          run: (...args) => statement.run(...args)
        };
        return stalled;
      }
      return statement;
    },
    batch: (...args) => local.db.batch(...args)
  };
  // Advance the public route deadline without a production-only test setting.
  globalThis.setTimeout = (callback, ms, ...args) => nativeTimeout(callback, ms === 5000 ? 20 : ms, ...args);
  t.after(() => {globalThis.setTimeout = nativeTimeout;});
  const response = await app.request('http://127.0.0.1/api/advanced-audit/archive?action=stats', { headers }, { ...env, DB: fault });
  assert.ok(targeted > 0, 'the statistics store was actually reached after authentication');
  assert.equal(response.status, 503, JSON.stringify(await response.clone().json()));
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'ARCHIVE_STATS_TIMEOUT');
  assert.equal(body.data, undefined);
  assert.equal(typeof body.requestId, 'string');
});
