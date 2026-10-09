import test from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import { initI18n, loadLanguage, i18next } from '../../src/i18n/config.js';
import { detectLanguage, tl, MissingInterpolationError } from '../../src/i18n/service.js';

await initI18n();
await loadLanguage('vi');
const cases = [
  ['explicit English beats header', '?lang=en', { 'Accept-Language': 'vi' }, 'en'],
  ['English cookie beats header', '', { Cookie: 'language=en', 'Accept-Language': 'vi' }, 'en'],
  ['zero quality language is excluded', '', { 'Accept-Language': 'vi;q=0,en;q=1' }, 'en'],
  ['quality ordering is preserved', '', { 'Accept-Language': 'vi;q=0.2,en;q=0.9' }, 'en'],
  ['regional header is normalized', '', { 'Accept-Language': 'VI-vn' }, 'vi'],
  ['query overrides cookie', '?lang=vi', { Cookie: 'language=en' }, 'vi']
];
for (const [name, query, headers, expected] of cases) {
  test(name, async () => {
    const app = new Hono();
    app.get('/', async c => c.json({ language: await detectLanguage(c) }));
    const response = await app.request(`http://local.invalid/${query}`, { headers });
    assert.equal(response.status, 200);
    assert.equal((await response.json()).language, expected);
  });
}
for (const [name, query, expected] of [
  ['explicit English beats geolocation', '?lang=en', 'en'],
  ['geolocation remains a fallback', '', 'vi']
]) {
  test(name, async () => {
    const app = new Hono();
    app.get('/', async c => {
      c.req.cf = { country: 'VN' };
      return c.json({ language: await detectLanguage(c) });
    });
    assert.equal((await (await app.request(`http://local.invalid/${query}`)).json()).language, expected);
  });
}
for (const value of [undefined, null]) {
  test(`formatted date rejects ${value}`, () => {
    assert.throws(() => tl('vi', 'dates.createdAt', { date: value }), MissingInterpolationError);
  });
}
test('provided date formats successfully', () => {
  const result = tl('vi', 'dates.createdAt', { date: '2026-10-04T12:00:00Z' });
  assert.match(result, /2026/);
  assert.doesNotMatch(result, /Invalid Date|\{\{/);
});
test('selected context validates its own placeholders', () => {
  i18next.addResource('vi', 'translation', 'reviewProbe_context_admin', '{{when, datetime}}');
  i18next.addResource('vi', 'translation', 'reviewProbe', 'Plain');
  assert.equal(tl('vi', 'reviewProbe'), 'Plain');
  assert.throws(() => tl('vi', 'reviewProbe', { context: 'admin' }), MissingInterpolationError);
});
