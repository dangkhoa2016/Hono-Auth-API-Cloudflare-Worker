import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n } from '../regression/helpers/local-env.mjs';
import { createUserService } from '../../src/utils/serviceFactory.js';

let local, env, app, actor, target, service, headers, targetTokens;
const oldPassword = 'Original-fixture-91!';
const newPassword = ' New-fixture-37! ';
test.before(async () => {
  local = await startD1();
  await initTestI18n();
  app = (await import('../../src/index.js')).default;
});
test.after(async () => { await local?.dispose(); });
test.beforeEach(async () => {
  for (const name of ['deny_reset_audit', 'deny_reset_revoke', 'ignore_reset_write', 'ignore_reset_audit', 'ignore_reset_revoke']) {
    await local.db.prepare(`DROP TRIGGER IF EXISTS ${name}`).run();
  }
  await local.db.prepare('DELETE FROM audit_logs').run();
  await local.db.prepare('DELETE FROM refresh_tokens').run();
  await local.db.prepare('DELETE FROM users').run();
  env = createTestEnv({ DB: local.db, RATE_LIMIT_DISABLED: 'true', BCRYPT_SALT_ROUNDS: '4' });
  const hash = await bcrypt.hash(oldPassword, 4);
  const seed = async (email, role) => {
    const r = await local.db.prepare('INSERT INTO users (full_name,email,password,role,status) VALUES (?,?,?,?,?)')
      .bind('Reset fixture', email, hash, role, 'active').run();
    return { user_id: r.meta.last_row_id, role, auth_version: 1 };
  };
  actor = await seed('actor@example.invalid', 'admin');
  target = await seed('target@example.invalid', 'user');
  const login = async email => {
    const r = await app.request('http://127.0.0.1/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password: oldPassword })
    }, env);
    assert.equal(r.status, 200);
    return (await r.json()).data;
  };
  const tokens = await login('actor@example.invalid');
  targetTokens = await login('target@example.invalid');
  headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${tokens.access_token}` };
  service = createUserService(env);
});
const row = () => local.db.prepare('SELECT * FROM users WHERE id=?').bind(target.user_id).first();
const request = (body = { newPassword, confirmPassword: newPassword }, id = target.user_id, customHeaders = headers) =>
  app.request(`http://127.0.0.1/api/admin/users/${id}/reset-password`, {
    method: 'POST', headers: customHeaders, body: JSON.stringify(body)
  }, env);

test('admin reset preserves whitespace, revokes all target sessions and records a credential-free audit atomically', async () => {
  const before = await row();
  const response = await request();
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  const after = await row();
  assert.equal(await bcrypt.compare(newPassword, after.password), true);
  assert.equal(await bcrypt.compare(newPassword.trim(), after.password), false);
  assert.equal(after.auth_version, before.auth_version + 1);
  const sessions = (await local.db.prepare('SELECT * FROM refresh_tokens WHERE user_id=?').bind(target.user_id).all()).results;
  assert.ok(sessions.length);
  assert.ok(sessions.every(s => s.revoked === 1 && s.revocation_reason === 'ADMIN_PASSWORD_RESET'));
  const audit = (await local.db.prepare('SELECT * FROM audit_logs WHERE action=\'ADMIN_PASSWORD_RESET\'').all()).results;
  assert.equal(audit.length, 1);
  assert.equal(audit[0].actor_id, actor.user_id);
  assert.equal(String(audit[0].target_id), String(target.user_id));
  for (const secret of [oldPassword, newPassword, after.password, before.password]) {
    assert.equal(JSON.stringify(audit).includes(secret), false);
    assert.equal(JSON.stringify(body).includes(secret), false);
  }
  const oldAccess = await app.request('http://127.0.0.1/api/user/profile', {
    headers: { Authorization: `Bearer ${targetTokens.access_token}` }
  }, env);
  assert.equal(oldAccess.status, 401);
  const refresh = await app.request('http://127.0.0.1/api/auth/refresh_token', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: targetTokens.refresh_token })
  }, env);
  assert.equal(refresh.status, 401);
  assert.equal((await app.request('http://127.0.0.1/api/user/profile', { headers }, env)).status, 200);
});

test('anonymous, ordinary user, self, peers and higher roles cannot reset a credential', async () => {
  assert.equal((await request(undefined, target.user_id, { 'Content-Type': 'application/json' })).status, 401);
  assert.equal((await request(undefined, actor.user_id)).status, 403);
  for (const role of ['admin', 'super_admin']) {
    await local.db.prepare('UPDATE users SET role=? WHERE id=?').bind(role, target.user_id).run();
    assert.equal((await request()).status, 403);
    assert.equal(await bcrypt.compare(oldPassword, (await row()).password), true);
  }
  await local.db.prepare('UPDATE users SET role=\'user\' WHERE id=?').bind(actor.user_id).run();
  assert.equal((await request()).status, 403);
});

test('super admin can reset an admin but cannot reset another super admin', async () => {
  await local.db.prepare('UPDATE users SET role=\'super_admin\' WHERE id=?').bind(actor.user_id).run();
  await local.db.prepare('UPDATE users SET role=\'admin\' WHERE id=?').bind(target.user_id).run();
  assert.equal((await request()).status, 200);
  await local.db.prepare('UPDATE users SET role=\'super_admin\' WHERE id=?').bind(target.user_id).run();
  assert.equal((await request()).status, 403);
});

test('invalid identifiers, missing targets and invalid passwords are rejected without mutation', async () => {
  for (const id of ['1tail', '0', '-1', '1.5']) {assert.equal((await request(undefined, id)).status, 400);}
  assert.equal((await request(undefined, 999999)).status, 404);
  const before = await row();
  for (const body of [
    {}, { newPassword: 'short', confirmPassword: 'short' },
    { newPassword, confirmPassword: 'different' },
    { newPassword: 'é'.repeat(37), confirmPassword: 'é'.repeat(37) },
    { newPassword: 'x'.repeat(73), confirmPassword: 'x'.repeat(73) },
    { newPassword: { nested: newPassword }, confirmPassword: newPassword },
    { newPassword, confirmPassword: newPassword, role: 'super_admin' }
  ]) {assert.equal((await request(body)).status, 400);}
  assert.deepEqual(await row(), before);
});

for (const [trigger, sql] of [
  ['deny_reset_audit', 'BEFORE INSERT ON audit_logs WHEN NEW.action=\'ADMIN_PASSWORD_RESET\' BEGIN SELECT RAISE(ABORT,\'audit unavailable\'); END'],
  ['deny_reset_revoke', 'BEFORE UPDATE ON refresh_tokens WHEN NEW.revocation_reason=\'ADMIN_PASSWORD_RESET\' BEGIN SELECT RAISE(ABORT,\'revoke unavailable\'); END'],
  ['ignore_reset_audit', 'BEFORE INSERT ON audit_logs WHEN NEW.action=\'ADMIN_PASSWORD_RESET\' BEGIN SELECT RAISE(IGNORE); END'],
  ['ignore_reset_revoke', 'BEFORE UPDATE ON refresh_tokens WHEN NEW.revocation_reason=\'ADMIN_PASSWORD_RESET\' BEGIN SELECT RAISE(IGNORE); END'],
  ['ignore_reset_write', 'BEFORE UPDATE OF password ON users BEGIN SELECT RAISE(IGNORE); END']
]) {test(`transaction rolls back password, version, refresh revocation and audit when ${trigger}`, async () => {
  const before = await row();
  await local.db.prepare(`CREATE TRIGGER ${trigger} ${sql}`).run();
  assert.ok((await request()).status >= 400);
  assert.deepEqual(await row(), before);
  assert.equal((await local.db.prepare('SELECT revoked FROM refresh_tokens WHERE user_id=?').bind(target.user_id).first()).revoked, 0);
  assert.equal((await local.db.prepare('SELECT count(*) AS n FROM audit_logs WHERE action=\'ADMIN_PASSWORD_RESET\'').first()).n, 0);
});}

for (const race of ['target promotion', 'actor demotion', 'actor revocation', 'target password replacement']) {
  test(`authorization and password compare-and-swap reject ${race} at transaction time`, async () => {
    const batch = service.dbService.batch.bind(service.dbService);
    service.dbService.batch = async entries => {
      if (race === 'target promotion') {await local.db.prepare('UPDATE users SET role=\'super_admin\' WHERE id=?').bind(target.user_id).run();}
      if (race === 'actor demotion') {await local.db.prepare('UPDATE users SET role=\'user\' WHERE id=?').bind(actor.user_id).run();}
      if (race === 'actor revocation') {await local.db.prepare('UPDATE users SET auth_version=auth_version+1 WHERE id=?').bind(actor.user_id).run();}
      if (race === 'target password replacement') {await local.db.prepare('UPDATE users SET password=? WHERE id=?').bind(await bcrypt.hash('Concurrent-password-9!', 4), target.user_id).run();}
      return batch(entries);
    };
    const result = await service.resetPasswordByAdmin(target.user_id, newPassword, actor);
    assert.equal(result.success, false);
    assert.equal(await bcrypt.compare(newPassword, (await row()).password), false);
    assert.equal((await row()).auth_version, 1);
  });
}
