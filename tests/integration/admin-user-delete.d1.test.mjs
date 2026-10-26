import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n } from '../regression/helpers/local-env.mjs';
import { createUserService } from '../../src/utils/serviceFactory.js';

let local, env, app, actor, target, actorTokens, targetTokens, auditId;
const password = 'Local-deletion-fixture-9!';
test.before(async () => {
  local = await startD1();
  await initTestI18n();
  app = (await import('../../src/index.js')).default;
});
test.after(async () => { await local?.dispose(); });
test.beforeEach(async () => {
  await local.db.prepare('DROP TRIGGER IF EXISTS refuse_fixture_deletion').run();
  await local.db.prepare('DELETE FROM audit_logs').run();
  await local.db.prepare('DELETE FROM refresh_tokens').run();
  await local.db.prepare('DELETE FROM users').run();
  env = createTestEnv({ DB: local.db, RATE_LIMIT_DISABLED: 'true', BCRYPT_SALT_ROUNDS: '4' });
  const hash = await bcrypt.hash(password, 4);
  async function seed(email, role) {
    const result = await local.db.prepare('INSERT INTO users (full_name,email,password,role,status) VALUES (?,?,?,?,?)')
      .bind('Deletion fixture', email, hash, role, 'active').run();
    return { id: result.meta.last_row_id, email, role };
  }
  actor = await seed('actor@example.invalid', 'admin');
  target = await seed('target@example.invalid', 'user');
  async function login(email) {
    const response = await app.request('http://127.0.0.1/api/auth/login', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, password })
    }, env);
    assert.equal(response.status, 200);
    return (await response.json()).data;
  }
  actorTokens = await login(actor.email);
  targetTokens = await login(target.email);
  const audit = await local.db.prepare('INSERT INTO audit_logs (action,actor_id,actor_role,actor_email,details) VALUES (?,?,?,?,?)')
    .bind('LOGIN', target.id, target.role, target.email, '{"fixture":true}').run();
  auditId = audit.meta.last_row_id;
  await env.CONFIG_KV.put('user:cache:' + target.id, JSON.stringify(target));
});
const headers = tokens => ({ Authorization: `Bearer ${tokens.access_token}` });
const remove = (id = target.id, tokens = actorTokens) => app.request(`http://127.0.0.1/api/admin/users/${id}`, {
  method: 'DELETE', headers: tokens ? headers(tokens) : {}
}, env);

test('admin HTTP deletion removes a signed-in account and its sessions while preserving historical audit metadata', async () => {
  const response = await remove();
  assert.equal(response.status, 200);
  assert.equal((await response.json()).success, true);
  assert.equal(await local.db.prepare('SELECT id FROM users WHERE id=?').bind(target.id).first(), null);
  assert.equal((await local.db.prepare('SELECT count(*) AS n FROM refresh_tokens WHERE user_id=?').bind(target.id).first()).n, 0);
  const audit = await local.db.prepare('SELECT * FROM audit_logs WHERE id=?').bind(auditId).first();
  assert.equal(audit.actor_id, null);
  assert.equal(audit.actor_email, target.email);
  assert.equal(audit.actor_role, 'user');
  assert.equal(audit.details, '{"fixture":true}');
  assert.equal(await env.CONFIG_KV.get('user:cache:' + target.id), null);
  assert.equal((await app.request('http://127.0.0.1/api/user/profile', { headers: headers(targetTokens) }, env)).status, 401);
  const refresh = await app.request('http://127.0.0.1/api/auth/refresh_token', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: targetTokens.refresh_token })
  }, env);
  assert.equal(refresh.status, 401);
  assert.equal((await app.request('http://127.0.0.1/api/user/profile', { headers: headers(actorTokens) }, env)).status, 200);
  assert.equal((await remove()).status, 404);
});

for (const behavior of ['ABORT', 'IGNORE']) {test(`a ${behavior} user deletion rolls back session removal and audit detachment`, async () => {
  await local.db.prepare(`CREATE TRIGGER refuse_fixture_deletion BEFORE DELETE ON users
    BEGIN SELECT RAISE(${behavior}${behavior === 'ABORT' ? ', \'fixture deletion refused\'' : ''}); END`).run();
  assert.equal((await remove()).status, 500);
  assert.ok(await local.db.prepare('SELECT id FROM users WHERE id=?').bind(target.id).first());
  assert.equal((await local.db.prepare('SELECT revoked FROM refresh_tokens WHERE user_id=?').bind(target.id).first()).revoked, 0);
  assert.equal((await local.db.prepare('SELECT actor_id FROM audit_logs WHERE id=?').bind(auditId).first()).actor_id, target.id);
  assert.equal((await app.request('http://127.0.0.1/api/user/profile', { headers: headers(targetTokens) }, env)).status, 200);
});}

test('anonymous users, ordinary users, self deletion and higher-role deletion remain refused', async () => {
  assert.equal((await remove(target.id, null)).status, 401);
  assert.equal((await remove(actor.id, targetTokens)).status, 403);
  assert.equal((await remove(actor.id)).status, 403);
  await local.db.prepare('UPDATE users SET role=? WHERE id=?').bind('super_admin', target.id).run();
  assert.equal((await remove()).status, 403);
  assert.ok(await local.db.prepare('SELECT id FROM users WHERE id=?').bind(target.id).first());
});

test('a cache failure after the committed deletion must not report that the account still exists', async () => {
  const service = createUserService(env);
  service.invalidateUserCache = async () => { throw new Error('Fixture cache unavailable'); };
  const result = await service.deleteUserByAdmin(target.id, { user_id: actor.id, role: 'admin' });
  assert.equal(result.success, true);
  assert.equal(await local.db.prepare('SELECT id FROM users WHERE id=?').bind(target.id).first(), null);
  assert.equal((await app.request('http://127.0.0.1/api/user/profile', { headers: headers(targetTokens) }, env)).status, 401);
});
