import test from 'node:test';
import assert from 'node:assert/strict';
import { EmailService, buildRegistrationEmailContent, buildEmailChangeVerificationContent } from '../../src/services/emailService.js';
import { KVConfigService } from '../../src/services/kvConfigService.js';
import { resolveConfigKey } from '../../src/utils/configResolver.js';
import { getAppSettings, getEmailSettings } from '../../src/utils/dynamicConfig.js';
import { createTestEnv, initTestI18n } from './helpers/local-env.mjs';

await initTestI18n();

for (const [key, value] of [
  ['APP_URL', 'https://api.example.invalid/'],
  ['APP_NAME', 'An "example" application'],
  ['EMAIL_ENABLED', 'false'],
  ['RATE_LIMIT_LOCKOUT_DURATION', '0'],
  ['DEBUG', '']
]) {
  test(`stored configuration round-trips JSON-encoded ${key}`, async () => {
    const env = createTestEnv();
    const service = new KVConfigService(env);
    assert.equal(await service.set(key, value), true);
    const expected = await service.get(key, null, false);
    const resolved = await resolveConfigKey(key, env, env.CONFIG_KV);
    assert.equal(resolved.source, 'kv');
    assert.equal(resolved.value, expected);
  });
}

test('configuration decoding preserves literal environment text and unencoded KV text', async () => {
  const env = createTestEnv({ APP_NAME: '"Literal environment name"' });
  assert.equal((await resolveConfigKey('APP_NAME', env)).value, env.APP_NAME);
  for (const value of ['false', '1e2', '{"literal":true}', 'unfinished "quote']) {
    await env.CONFIG_KV.put('hono-auth-api:APP_NAME', value);
    assert.equal((await resolveConfigKey('APP_NAME', env, env.CONFIG_KV)).value, value);
  }
});

const templates = [
  { name: 'registration', build: buildRegistrationEmailContent, field: 'activationUrl', path: '/api/auth/activate' },
  { name: 'email change', build: buildEmailChangeVerificationContent, field: 'verificationUrl', path: '/api/user/verify-email' }
];
const fakeUser = {
  email: 'user@example.invalid', new_email: 'new@example.invalid', full_name: 'Local Preview',
  activation_token: 'FAKE+token/&="value', email_verification_token: 'FAKE+token/&="value'
};

for (const template of templates) {
  for (const locale of ['en', 'vi']) {
    test(`${template.name} ${locale} uses one canonical backend link in text and both anchors`, async () => {
      const content = await template.build({ user: fakeUser, context: { locale }, baseUrl: 'https://api.example.invalid/' });
      const url = new URL(content[template.field]);
      assert.equal(url.origin, 'https://api.example.invalid');
      assert.equal(url.pathname, template.path);
      assert.equal(url.searchParams.get('token'), fakeUser.activation_token);
      assert.equal(url.searchParams.size, 1);
      assert.ok(content.plainText.includes(url.href));
      const anchors = [...content.htmlBody.matchAll(/<a\b[^>]*\bhref="([^"]*)"/g)].map(match => match[1]);
      assert.deepEqual(anchors, [url.href, url.href]);
    });
  }

  test(`${template.name} rejects unusable account email origins`, async () => {
    for (const baseUrl of [
      'javascript:alert(1)',
      'file:///tmp/example',
      '/relative',
      'https://user:password@example.invalid',
      '"https://api.example.invalid/"',
      'https://example.invalid"onclick="alert(1)',
      'https://example.invalid%22onclick=%22alert(1)',
      'https://example.invalid\'quoted',
      'https://example.invalid&quot;onclick=alert(1)'
    ]) {
      await assert.rejects(() => template.build({ user: fakeUser, context: { locale: 'en' }, baseUrl }), /Invalid account email base URL/);
    }
  });

  test(`${template.name} supports local IPv4/IPv6 and internationalized backend origins`, async () => {
    for (const baseUrl of ['http://localhost:8787/', 'http://127.0.0.1:8787/', 'http://[::1]:8787/', 'https://münchen.example.invalid/']) {
      const content = await template.build({ user: fakeUser, context: { locale: 'en' }, baseUrl });
      assert.equal(new URL(content[template.field]).origin, new URL(baseUrl).origin);
      assert.equal(new URL(content[template.field]).pathname, template.path);
    }
  });

  test(`${template.name} preserves its dark header and action background without gradients`, async () => {
    const content = await template.build({ user: fakeUser, context: { locale: 'en' }, baseUrl: 'https://api.example.invalid' });
    // Simulate an email client dropping unsupported gradient declarations.
    const fallback = content.htmlBody.replace(/background-image:\s*linear-gradient\([^;]*\);?/gi, '');
    const header = fallback.match(/<td\b([^>]*)>\s*<h1\b([^>]*)>/);
    assert.ok(header, 'header is a table cell with a title');
    assert.match(header[1], /bgcolor="#4338ca"/);
    assert.match(header[1], /background-color:\s*#4338ca/);
    assert.match(header[2], /color:\s*#ffffff/);
    const action = fallback.match(/<td\b([^>]*)>\s*<a\b[^>]*href=/);
    assert.ok(action, 'action has a table-cell background fallback');
    assert.match(action[1], /bgcolor="#4338ca"/);
    assert.match(action[1], /background-color:\s*#4338ca/);
  });

  test(`${template.name} preview reads serialized KV configuration and never sends a message`, async t => {
    const env = createTestEnv({ EMAIL_ENABLED: 'true', EMAIL_CONFIRMATION_ENABLED: 'true', EMAIL_FROM_ADDRESS: 'sender@example.invalid' });
    const kv = new KVConfigService(env);
    await kv.set('APP_URL', 'https://api.example.invalid/');
    await kv.set('APP_NAME', 'Local Account Preview');
    assert.equal((await getAppSettings(env)).url, 'https://api.example.invalid/');
    assert.equal((await getEmailSettings(env)).appUrl, 'https://api.example.invalid/');
    t.mock.method(globalThis, 'fetch', () => assert.fail('email preview must not contact a provider'));
    const service = new EmailService(env);
    const context = { preview: true, locale: 'vi' };
    const result = template.name === 'registration'
      ? await service.sendRegistrationConfirmation(fakeUser, context)
      : await service.sendEmailChangeVerification(fakeUser, context);
    assert.equal(result.success, true);
    assert.equal(result.skipped, true);
    assert.equal(new URL(result.preview[template.field]).pathname, template.path);
  });
}
