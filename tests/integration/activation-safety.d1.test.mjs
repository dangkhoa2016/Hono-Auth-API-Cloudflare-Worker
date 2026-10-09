import test from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import authRoutes from '../../src/routes/auth.js';
import { UserService } from '../../src/services/userService.js';
import { initI18n } from '../../src/i18n/index.js';
import { createI18nMiddleware } from '../../src/middleware/i18n.js';
import { startD1 } from '../regression/helpers/d1-local.mjs';

let d1;
let sequence = 0;
test.before(async () => { d1 = await startD1(); await initI18n(); });
test.after(async () => { await d1?.dispose(); });
const env = () => ({ DB: d1.db, RATE_LIMIT_DISABLED: 'true', APP_NAME: 'Activation <Demo> & Co' });
async function seed(overrides = {}) {
  sequence += 1;
  const row = {
    email: `activation-${sequence}@example.test`,
    name: 'Activation Subject',
    token: `local-activation-fixture-${sequence}`,
    expires: '2099-01-01T00:00:00.000Z',
    ...overrides
  };
  const result = await d1.db.prepare(`INSERT INTO users
    (full_name,email,password,status,activation_token,activation_token_expires_at,disabled_by_admin)
    VALUES (?,?,'local-unused-hash','inactive',?,?,0)`)
    .bind(row.name, row.email, row.token, row.expires).run();
  return { ...row, id: Number(result.meta.last_row_id) };
}
async function stored(id) {
  return d1.db.prepare('SELECT status,disabled_by_admin,activation_token,activated_at FROM users WHERE id=?').bind(id).first();
}

test('T6: activation page renders stored user data and app name as text', async () => {
  const user = await seed({ name: '<img src=x onerror="alert(1)"> & User' });
  const app = new Hono();
  app.use('*', createI18nMiddleware);
  app.route('/auth', authRoutes);
  const pending = [];
  const response = await app.request(`/auth/activate?token=${user.token}`, {}, env(), {
    waitUntil(promise) { pending.push(promise); }, passThroughOnException() {}
  });
  await Promise.all(pending);
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.ok(!html.includes('<img src=x'), 'stored name must not create an HTML element');
  assert.ok(html.includes('&lt;img src=x onerror=&quot;alert(1)&quot;&gt; &amp; User'));
  assert.ok(html.includes('Activation &lt;Demo&gt; &amp; Co'));
  assert.equal((await stored(user.id)).status, 'active', 'escaping must preserve successful activation');
});

for (const mutation of ['disable', 'reissue', 'consume']) {
  test(`T6: activation cannot overwrite a concurrent ${mutation}`, async () => {
    const user = await seed();
    const service = new UserService(env());
    const original = service.findByActivationToken.bind(service);
    service.findByActivationToken = async token => {
      const snapshot = await original(token);
      if (mutation === 'disable') {
        await d1.db.prepare('UPDATE users SET disabled_by_admin=1 WHERE id=?').bind(user.id).run();
      } else if (mutation === 'reissue') {
        await d1.db.prepare('UPDATE users SET activation_token=? WHERE id=?').bind('replacement-local-fixture', user.id).run();
      } else {
        await d1.db.prepare('UPDATE users SET status=\'active\',activation_token=NULL,activated_at=\'2026-01-01T00:00:00.000Z\' WHERE id=?').bind(user.id).run();
      }
      return snapshot;
    };
    const result = await service.activateByToken(user.token);
    assert.equal(result.success, false, 'a stale snapshot cannot authorize a write');
    const row = await stored(user.id);
    if (mutation === 'disable') {
      assert.equal(row.status, 'inactive'); assert.equal(row.disabled_by_admin, 1); assert.equal(row.activation_token, user.token);
    } else if (mutation === 'reissue') {
      assert.equal(row.status, 'inactive'); assert.equal(row.activation_token, 'replacement-local-fixture');
    } else {
      assert.equal(row.activated_at, '2026-01-01T00:00:00.000Z'); assert.equal(row.activation_token, null);
    }
  });
}

for (const expires of ['not-a-date', '2026-01-01T00:00:00.000Z']) {
  test(`T6: activation rejects invalid or exactly expired timestamp (${expires})`, async t => {
    t.mock.timers.enable({ apis: ['Date'], now: Date.parse('2026-01-01T00:00:00.000Z') });
    const user = await seed({ expires });
    const before = await stored(user.id);
    const result = await new UserService(env()).activateByToken(user.token);
    assert.equal(result.success, false);
    assert.equal(result.error, 'TOKEN_EXPIRED');
    assert.deepEqual(await stored(user.id), before);
  });
}

test('T6: valid activation consumes its token once', async () => {
  const user = await seed();
  const service = new UserService(env());
  assert.equal((await service.activateByToken(user.token)).success, true);
  assert.equal((await stored(user.id)).activation_token, null);
  assert.equal((await service.activateByToken(user.token)).success, false);
});
