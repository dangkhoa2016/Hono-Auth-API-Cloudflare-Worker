import test from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import { createSchemaBuilder, ValidationPatterns } from '../../src/schemas/base.js';
import { i18nValidatorsMiddleware } from '../../src/middleware/i18nValidator.js';
import { loadLanguage } from '../../src/i18n/config.js';
import { AuditRetentionService } from '../../src/services/auditRetentionService.js';
import { createTestEnv, initTestI18n } from './helpers/local-env.mjs';

await initTestI18n();
await loadLanguage('vi');

for (const [language, requiredEmail, formatMessage] of [
  ['en', 'Email address is required', /Format must be one of: csv, json/],
  ['vi', 'Địa chỉ email là bắt buộc', /Định dạng phải là một trong: csv, json/]
]) {
  test(`${language}: omitted account email retains its localized required-field error`, () => {
    const result = createSchemaBuilder(language).email().safeParse(undefined);
    assert.equal(result.success, false);
    assert.equal(result.error.issues[0].message, requiredEmail);
  });

  test(`${language}: unsupported export format retains its localized allowlist`, () => {
    const result = createSchemaBuilder(language).enum(['csv', 'json'], 'format').safeParse('pdf');
    assert.equal(result.success, false);
    assert.match(result.error.issues[0].message, formatMessage);
  });

  test(`${language}: invalid login retains field details through the real validator middleware`, async () => {
    const app = new Hono();
    app.use('*', async (c, next) => {
      c.set('language', language);
      await next();
    });
    app.post('/login', i18nValidatorsMiddleware.login(), c => c.json({ accepted: true }));
    const response = await app.request('/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}'
    }, createTestEnv());
    assert.equal(response.status, 400);
    const body = await response.json();
    assert.equal(body.success, false);
    assert.equal(body.errorCount, 2);
    assert.deepEqual(body.errors.map(error => error.field).sort(), ['email', 'password']);
    assert.equal(body.errors.find(error => error.field === 'email').message, requiredEmail);
  });
}

test('record metadata accepts arbitrary string keys and validates every value', () => {
  const builder = createSchemaBuilder('en');
  const schema = builder.record(builder.number('days', 1, 365, true), 'metadata');
  assert.deepEqual(schema.parse({ primary: 30, secondary: 60 }), { primary: 30, secondary: 60 });
  const rejected = schema.safeParse({ primary: 'not-a-number' });
  assert.equal(rejected.success, false);
  assert.deepEqual(rejected.error.issues[0].path, ['primary']);
});

test('malformed account email reports a native format issue instead of an undefined issue code', () => {
  const rejected = createSchemaBuilder('en').email().safeParse('not-an-email');
  assert.equal(rejected.success, false);
  assert.equal(rejected.error.issues[0].code, 'invalid_format');
  assert.equal(rejected.error.issues[0].format, 'email');
});

test('search filters preserve nested JSON values under arbitrary string keys', () => {
  const data = { filters: { enabled: true, details: { role: 'user' }, ids: [1, 2] } };
  assert.deepEqual(ValidationPatterns.createSearchSchema().parse(data), data);
});

test('retention validation preserves the failing field rather than an opaque exception message', () => {
  const service = new AuditRetentionService(createTestEnv());
  const rejected = service.validateData('update', { days: 0 }, 'en');
  assert.equal(rejected.success, false);
  assert.equal(rejected.data, null);
  assert.ok(rejected.errors.some(error => error.path?.join('.') === 'days'));
  assert.match(rejected.message, /days:/);
});
