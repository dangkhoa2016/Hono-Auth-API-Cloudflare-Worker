import test from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import auth from '../../src/routes/auth.js';
import { UserService } from '../../src/services/userService.js';
import { createTestEnv, initTestI18n } from './helpers/local-env.mjs';

await initTestI18n();

// These are rendered href targets only; all HTTP requests stay on app.request.
function renderingEnv(FRONTEND_URL) {
  return { ...createTestEnv(), FRONTEND_URL };
}

async function page(env, path = '/api/auth/activate') {
  const app = new Hono();
  app.route('/api/auth', auth);
  const response = await app.request('http://localhost' + path, {}, env);
  return { response, html: await response.text() };
}

for (const [name, result, status] of [
  ['activated', { success: true }, 200],
  ['already active', { success: true, alreadyActive: true }, 200],
  ['invalid token', { success: false, error: 'INVALID_TOKEN' }, 400],
  ['disabled', { success: false, error: 'DISABLED_BY_ADMIN' }, 403],
  ['server error', null, 500]
]) {
  test(`activation ${name} links to configured frontend home`, async t => {
    t.mock.method(UserService.prototype, 'activateByToken', async token => {
      assert.equal(token, 'FAKE_ACTIVATION_TOKEN');
      if (!result) {throw new Error('FAKE_SERVICE_FAILURE');}
      return result;
    });
    const env = renderingEnv('https://client.example.invalid/');
    const { response, html } = await page(env, '/api/auth/activate?token=FAKE_ACTIVATION_TOKEN');
    assert.equal(response.status, status);
    assert.ok(html.includes('href="https://client.example.invalid/" class="btn"'));
    assert.ok(!html.includes('href="/login"'));
    assert.ok(!html.includes('FAKE_ACTIVATION_TOKEN'));
  });
}

test('missing activation token uses frontend home and never calls activation', async t => {
  t.mock.method(UserService.prototype, 'activateByToken', () => assert.fail('missing token must not activate'));
  const { response, html } = await page(renderingEnv('https://client.example.invalid'));
  assert.equal(response.status, 400);
  assert.ok(html.includes('href="https://client.example.invalid/" class="btn"'));
});

test('missing or unsafe frontend URL falls back to backend root', async () => {
  for (const FRONTEND_URL of [undefined, '', '/login', '//evil.invalid', 'javascript:alert(1)', 'https://user:pass@example.invalid', 'https://example.invalid"onclick="x', 'https://example.invalid/?token=private', 'https://example.invalid/#private', 'http://public.example.invalid']) {
    const { html } = await page(renderingEnv(FRONTEND_URL));
    assert.ok(html.includes('href="/" class="btn"'));
  }
});

test('frontend URL supports an explicit base path and local development', async () => {
  for (const [FRONTEND_URL, expected] of [
    ['https://client.example.invalid/app', 'https://client.example.invalid/app/'],
    ['http://localhost:8080', 'http://localhost:8080/'],
    ['http://127.0.0.1:8080/', 'http://127.0.0.1:8080/'],
    ['http://[::1]:8080/', 'http://[::1]:8080/']
  ]) {
    const { html } = await page(renderingEnv(FRONTEND_URL));
    assert.ok(html.includes(`href="${expected}" class="btn"`));
  }
});
