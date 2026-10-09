import test from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import admin from '../../src/routes/admin.js';
import kvAdmin from '../../src/routes/kvAdmin.js';
import { KVConfigService } from '../../src/services/kvConfigService.js';
import { loadLanguage } from '../../src/i18n/config.js';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n } from '../regression/helpers/local-env.mjs';

let d1;
let targetId;
const duplicateEmail = 'i18n-existing@example.test';
test.before(async () => {
  await initTestI18n();
  d1 = await startD1();
  for (const email of [duplicateEmail, 'i18n-target@example.test']) {
    const row = await d1.db.prepare('INSERT INTO users (full_name,email,password,status,role) VALUES (\'I18n Fixture\',?,\'unused-local-hash\',\'active\',\'user\')')
      .bind(email).run();
    targetId = Number(row.meta.last_row_id);
  }
});
test.after(async () => { await d1?.dispose(); });

// Exercise the production handler and services with real D1. Authentication
// and input validation are supplied fixtures here, not claims of this test.
function mountHandler(router, method, path, language, body, kvConfig) {
  const handler = router.routes.filter(r => r.method === method && r.path === path).at(-1).handler;
  const app = new Hono();
  app.use('*', async (c, next) => {
    c.set('language', language);
    c.set('user', { user_id: 9000, role: 'super_admin', fullName: 'I18n Admin' });
    c.req.addValidatedData('json', body);
    c.kvConfig = kvConfig;
    await next();
  });
  app.on(method, path, handler);
  return app;
}

for (const language of ['en', 'vi', 'de', 'fr', 'es', 'ja', 'th']) {
  for (const method of ['POST', 'PUT']) {
    test(`OOS-01 ${language}: admin ${method} duplicate email preserves 409 and translated detail`, async () => {
      await loadLanguage(language);
      const env = createTestEnv({ DB: d1.db });
      const body = { email: duplicateEmail, full_name: 'I18n Fixture', role: 'user' };
      const route = method === 'POST' ? '/users' : '/users/:id';
      const app = mountHandler(admin, method, route, language, body);
      const response = await app.request(method === 'POST' ? '/users' : `/users/${targetId}`, { method }, env);
      assert.equal(response.status, 409);
      const result = await response.json();
      assert.equal(result.success, false);
      assert.match(result.error, /i18n-existing@example\.test/);
      assert.doesNotMatch(result.error, /\{\{|MissingTranslation|user\.email.*Suggestion/);
      const row = await d1.db.prepare('SELECT email FROM users WHERE id=?').bind(targetId).first();
      assert.equal(row.email, 'i18n-target@example.test', 'a rejected mutation leaves the existing account unchanged');
    });
  }
  test(`OOS-01 ${language}: KV batch write failure identifies the failed configuration`, async () => {
    await loadLanguage(language);
    const env = createTestEnv();
    env.CONFIG_KV.put = async () => { throw new Error('local-fixture-write-failed'); };
    const kvConfig = new KVConfigService(env);
    const body = { configs: [{ key: 'APP_NAME', value: 'Local fixture' }] };
    const app = mountHandler(kvAdmin, 'POST', '/configs/batch', language, body, kvConfig);
    const response = await app.request('/configs/batch', { method: 'POST' }, env);
    assert.equal(response.status, 200);
    const result = await response.json();
    assert.equal(result.success, false);
    assert.deepEqual(result.data.summary, { total: 1, updated: 0, failed: 1 });
    assert.deepEqual(result.data.updated, {});
    assert.match(result.data.errors.APP_NAME, /APP_NAME/);
    assert.doesNotMatch(result.data.errors.APP_NAME, /\{\{|local-fixture-write-failed/);
    assert.equal(result.data.cacheCleared, false);
  });
}
