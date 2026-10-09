import test from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import translations from '../../src/routes/translations.js';
import { createTestEnv, initTestI18n } from './helpers/local-env.mjs';
import { i18nTestUtils } from '../../src/utils/i18nDemo.js';
import { MissingTranslationError } from '../../src/i18n/service.js';
import { createI18nMiddleware } from '../../src/middleware/i18n.js';

await initTestI18n();
const app = new Hono();
app.use('*', createI18nMiddleware);
app.route('/api/translations', translations);

for (const suffix of ['', '/validate', '/section/system']) {
  test(`unsupported translation language returns 404: ${suffix || 'root'}`, async () => {
    const response = await app.request(`/api/translations/zz-unknown${suffix}`, {}, createTestEnv());
    assert.equal(response.status, 404);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.data, undefined);
  });
}
for (const section of ['missing-section', 'constructor', '__proto__', 'toString']) {
  test(`non-resource section returns 404: ${section}`, async () => {
    const response = await app.request(`/api/translations/en/section/${section}`, {}, createTestEnv());
    assert.equal(response.status, 404);
    assert.equal((await response.json()).success, false);
  });
}
test('supported section returns requested Vietnamese resource', async () => {
  const response = await app.request('/api/translations/vi/section/system', {}, createTestEnv());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.data.language, 'vi');
  assert.equal(body.data.section, 'system');
  assert.equal(body.data.translations.success, 'Hoàn thành thao tác thành công');
});
test('supported validation reports requested language', async () => {
  const response = await app.request('/api/translations/en/validate', {}, createTestEnv());
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.language, 'en');
});

for (const [route, field, item] of [
  ['plurals', 'counts', 1], ['formatting', 'testCases', { value: 1 }], ['context', 'contexts', 'admin']
]) {
  for (const [name, body] of [
    ['malformed JSON', '{'],
    ['null body', 'null'],
    ['wrong collection type', JSON.stringify({ key: 'system.success', [field]: 'wrong' })],
    ['oversized collection', JSON.stringify({ key: 'system.success', [field]: Array(101).fill(item) })]
  ]) {
    test(`${route} rejects ${name} as 400`, async () => {
      const response = await app.request(`/api/translations/test/${route}`, {
        method: 'POST', headers: { 'content-type': 'application/json' }, body
      }, createTestEnv());
      assert.equal(response.status, 400);
      assert.equal((await response.json()).success, false);
    });
  }
}
test('context endpoint selects role-specific messages', async () => {
  const response = await app.request('/api/translations/test/context', {
    method: 'POST', headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ key: 'roles.displayName', contexts: ['admin', 'user'] })
  }, createTestEnv());
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.deepEqual(body.data.results.map(row => row.result), ['Administrator', 'User']);
});
test('context demo selects distinct admin credentials message', async () => {
  const response = await app.request('/api/translations/demo/context', {}, createTestEnv());
  assert.equal(response.status, 200);
  const rows = (await response.json()).data.examples;
  assert.notEqual(rows.find(row => row.context === 'admin').invalidCredentials,
    rows.find(row => row.context === 'user').invalidCredentials);
});
for (const [route, payload, expected] of [
  ['plurals', { key: 'formatting.filesSize', counts: [1, 2], params: { size: 32 } }, 2],
  ['formatting', { key: 'numbers.count', testCases: [{ value: 10 }, { value: 20 }] }, 2]
]) {
  test(`${route} accepts valid cases`, async () => {
    const response = await app.request(`/api/translations/test/${route}`, {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(payload)
    }, createTestEnv());
    assert.equal(response.status, 200);
    const results = (await response.json()).data.results;
    assert.equal(results.length, expected);
    assert.ok(results.every(row => typeof row.result === 'string' && !row.result.includes('{{')));
  });
}
for (const route of ['errors', 'enhanced']) {
  test(`${route} demo renders without missing interpolation or invalid dates`, async () => {
    const response = await app.request(`/api/translations/demo/${route}`, {}, createTestEnv());
    assert.equal(response.status, 200);
    const text = await response.text();
    assert.doesNotMatch(text, /Invalid Date|\{\{/);
  });
}

for (const [route, cases] of [
  ['plurals', { counts: [1] }],
  ['formatting', { testCases: [{}] }],
  ['context', { contexts: ['admin'] }]
]) {
  for (const [name, key] of [['missing key', 'not.a.real.translation'], ['missing value', 'numbers.count']]) {
    test(`${route} reports ${name} as client input error`, async () => {
      const response = await app.request(`/api/translations/test/${route}`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key, ...cases })
      }, createTestEnv());
      assert.equal(response.status, 400);
      const body = await response.json();
      assert.equal(body.success, false);
      assert.equal(body.data, undefined);
    });
  }
}

for (const [route, method, cases] of [
  ['plurals', 'testPluralization', { counts: [1] }],
  ['formatting', 'testFormatting', { testCases: [{}] }],
  ['context', 'testContextual', { contexts: ['admin'] }]
]) {
  for (const [name, error] of [
    ['unexpected failure', new Error('Internal failure')],
    ['internal translation failure', new MissingTranslationError('en', 'success.operation.completed')]
  ]) {
    test(`${route} preserves 500 for ${name}`, async (t) => {
      t.mock.method(i18nTestUtils, method, () => { throw error; });
      const response = await app.request(`/api/translations/test/${route}`, {
        method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: 'system.success', ...cases })
      }, createTestEnv());
      assert.equal(response.status, 500);
      assert.equal((await response.json()).success, false);
    });
  }
}
