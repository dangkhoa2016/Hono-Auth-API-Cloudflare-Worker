import test, { before, after, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { Readable, Writable } from 'node:stream';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { mkdtemp, writeFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { getPlatformProxy } from 'wrangler';
import { startD1, applyMigrations } from '../regression/helpers/d1-local.mjs';
import * as service from '../../tools/database/superadminPasswordReset.js';

let local;
let firstId;
let secondId;
let ordinaryId;
const password = 'Local-reset-fixture-47!';
const originalHash = await bcrypt.hash('Original-fixture-91!', 4);

before(async () => { local = await startD1(); });
after(async () => { await local?.dispose(); });
beforeEach(async () => {
  await local.db.prepare('DROP TRIGGER IF EXISTS prevent_password_update').run();
  await local.db.prepare('DELETE FROM refresh_tokens').run();
  await local.db.prepare('DELETE FROM users').run();
  const insert = async (email, role) => {
    const result = await local.db.prepare('INSERT INTO users (full_name, email, password, role) VALUES (?, ?, ?, ?)')
      .bind('Password Reset Fixture', email, originalHash, role).run();
    return result.meta.last_row_id;
  };
  firstId = await insert('first@example.invalid', 'super_admin');
  secondId = await insert('second@example.invalid', 'super_admin');
  ordinaryId = await insert('ordinary@example.invalid', 'admin');
});

async function rows() {
  return (await local.db.prepare('SELECT * FROM users ORDER BY id').all()).results;
}

async function reset(options) {
  return service.resetSuperAdminPassword(local.db, options);
}

for (const selector of ['email', 'userId']) {
  test(`reset by ${selector} changes exactly the selected super_admin to a working bcrypt credential`, async () => {
    const beforeRows = await rows();
    const result = await reset({ [selector]: selector === 'email' ? 'first@example.invalid' : firstId, password });
    const afterRows = await rows();
    const target = afterRows.find((row) => row.id === firstId);
    assert.notEqual(target.password, password);
    assert.notEqual(target.password, originalHash);
    assert.equal(await bcrypt.compare(password, target.password), true);
    assert.equal(await bcrypt.compare('Original-fixture-91!', target.password), false);
    assert.equal(target.auth_version, beforeRows.find(row => row.id === firstId).auth_version + 1,
      'a password reset must also invalidate already issued access tokens');
    assert.deepEqual(result, { userId: firstId }, 'return only noncredential operation metadata');
    assert.deepEqual(afterRows.filter((row) => row.id !== firstId), beforeRows.filter((row) => row.id !== firstId));
  });
}

test('missing and wrong-role accounts fail without changing any account', async () => {
  const beforeRows = await rows();
  for (const selector of [{ email: 'missing@example.invalid' }, { userId: secondId + 1000 }, { userId: ordinaryId }]) {
    await assert.rejects(() => reset({ ...selector, password }), /not found|super.admin/i);
    assert.deepEqual(await rows(), beforeRows);
  }
});

test('case-ambiguous email targets fail without changing either super_admin', async () => {
  await local.db.prepare('INSERT INTO users (full_name,email,password,role) VALUES (?,?,?,?)')
    .bind('Ambiguous Fixture', 'FIRST@example.invalid', originalHash, 'super_admin').run();
  const beforeRows = await rows();
  await assert.rejects(() => reset({ email: 'first@example.invalid', password }), /ambiguous|exactly one/i);
  assert.deepEqual(await rows(), beforeRows);
});

test('an email reassigned after selection cannot reset its former owner', async () => {
  const raced = {
    prepare: (...args) => local.db.prepare(...args),
    async batch(statements) {
      await local.db.prepare('UPDATE users SET email=? WHERE id=?').bind('moved@example.invalid', firstId).run();
      await local.db.prepare('UPDATE users SET email=? WHERE id=?').bind('first@example.invalid', secondId).run();
      return local.db.batch(statements);
    }
  };
  await assert.rejects(() => service.resetSuperAdminPassword(raced, { email: 'first@example.invalid', password }), /did not complete|exactly one/i);
  const current = await rows();
  assert.ok(current.every(row => row.password === originalHash));
  assert.ok(current.every(row => row.auth_version === 1));
});

test('invalid passwords and selectors fail before any account changes', async () => {
  const beforeRows = await rows();
  for (const options of [
    { password }, { email: 'first@example.invalid', userId: firstId, password },
    { userId: 0, password }, { userId: -1, password }, { userId: 1.5, password },
    { userId: '1 OR 1=1', password }, { email: '', password }, { email: 'invalid', password },
    { userId: firstId, password: '' }, { userId: firstId, password: '12345' },
    { userId: firstId, password: 'x'.repeat(101) }, { userId: firstId, password: null }
  ]) {
    await assert.rejects(() => reset(options), /password|email|user.id|selector|exactly one/i);
    assert.deepEqual(await rows(), beforeRows);
  }
});

test('a blocked update cannot report successful password reset', async () => {
  await local.db.prepare('CREATE TRIGGER prevent_password_update BEFORE UPDATE OF password ON users BEGIN SELECT RAISE(IGNORE); END').run();
  const beforeRows = await rows();
  await assert.rejects(() => reset({ userId: firstId, password }), /exactly one|changed|update/i);
  assert.deepEqual(await rows(), beforeRows);
});

test('password reset revokes only the selected account refresh credentials', async () => {
  for (const id of [firstId, secondId]) {
    await local.db.prepare('INSERT INTO refresh_tokens(user_id,token_hash,jti,issued_at,expires_at) VALUES (?,?,?,datetime(\'now\'),datetime(\'now\',\'+1 day\'))')
      .bind(id, 'local-fixture-hash', `local-refresh-${id}`).run();
  }
  await reset({ userId: firstId, password });
  const target = await local.db.prepare('SELECT revoked,revocation_reason FROM refresh_tokens WHERE user_id=?').bind(firstId).first();
  const other = await local.db.prepare('SELECT revoked FROM refresh_tokens WHERE user_id=?').bind(secondId).first();
  assert.equal(target.revoked, 1);
  assert.equal(target.revocation_reason, 'PASSWORD_RESET');
  assert.equal(other.revoked, 0);
});

test('failed session revocation rolls back the password and access-token version together', async () => {
  await local.db.prepare('INSERT INTO refresh_tokens(user_id,token_hash,jti,issued_at,expires_at) VALUES (?,?,?,datetime(\'now\'),datetime(\'now\',\'+1 day\'))')
    .bind(firstId, 'local-fixture-hash', 'local-rollback-refresh').run();
  await local.db.prepare('CREATE TRIGGER reject_reset_revocation BEFORE UPDATE OF revoked ON refresh_tokens BEGIN SELECT RAISE(ABORT,\'local fixture refusal\'); END').run();
  const beforeRows = await rows();
  try {
    await assert.rejects(() => reset({ userId: firstId, password }), /did not complete/i);
    assert.deepEqual(await rows(), beforeRows);
    const token = await local.db.prepare('SELECT revoked FROM refresh_tokens WHERE user_id=?').bind(firstId).first();
    assert.equal(token.revoked, 0);
  } finally {
    await local.db.prepare('DROP TRIGGER reject_reset_revocation').run();
  }
});

test('local command accepts stdin credentials, emits no credential, and disposes its real D1 resource', async () => {
  const commandDb = await startD1();
  let output = '';
  let disposed = false;
  const stdinPassword = 'Local-é-reset-fixture-47!';
  const encoded = Buffer.from(`${stdinPassword}\n`);
  try {
    const inserted = await commandDb.db.prepare('INSERT INTO users (full_name,email,password,role) VALUES (?,?,?,?)')
      .bind('Command Fixture', 'command@example.invalid', originalHash, 'super_admin').run();
    const createProxy = async (options) => {
      assert.equal(options.remoteBindings, false);
      assert.equal(options.environment, 'test');
      return { env: commandDb.env, async dispose() {
        const target = await commandDb.db.prepare('SELECT password FROM users WHERE id = ?').bind(inserted.meta.last_row_id).first();
        assert.equal(await bcrypt.compare(stdinPassword, target.password), true);
        await commandDb.dispose();
        disposed = true;
      } };
    };
    await service.runLocalPasswordReset({
      args: ['--env', 'test', '--user-id', String(inserted.meta.last_row_id)], env: {},
      // Split inside é's UTF-8 encoding to catch per-chunk string corruption.
      stdin: Readable.from([encoded.subarray(0, 7), encoded.subarray(7)]),
      stdout: new Writable({ write(chunk, encoding, callback) { output += chunk.toString(); callback(); } }),
      createProxy
    });
    assert.match(output, /password reset/i);
    assert.equal(output.includes(stdinPassword), false);
    assert.equal(output.includes(originalHash), false);
    await assert.rejects(async () => commandDb.db.prepare('SELECT 1').first(), /disposed|poisoned/i);
  } finally {
    if (!disposed) { await commandDb.dispose(); }
  }
});

test('failed command accepts an environment credential, emits no success, and disposes local D1', async () => {
  const commandDb = await startD1();
  let disposed = false;
  let output = '';
  const beforeRows = (await commandDb.db.prepare('SELECT * FROM users ORDER BY id').all()).results;
  try {
    await assert.rejects(() => service.runLocalPasswordReset({
      args: ['--env', 'development', '--email', 'missing@example.invalid'],
      env: { RESET_SUPERADMIN_PASSWORD: password }, stdin: Readable.from([]),
      stdout: new Writable({ write(chunk, encoding, callback) { output += chunk.toString(); callback(); } }),
      createProxy: async () => ({ env: commandDb.env, async dispose() {
        assert.deepEqual((await commandDb.db.prepare('SELECT * FROM users ORDER BY id').all()).results, beforeRows);
        await commandDb.dispose();
        disposed = true;
      } })
    }), /not found/i);
    assert.equal(output, '');
    await assert.rejects(async () => commandDb.db.prepare('SELECT 1').first(), /disposed|poisoned/i);
  } finally {
    if (!disposed) { await commandDb.dispose(); }
  }
});

test('CLI import has no side effects and rejected password arguments never appear in output', () => {
  const entry = new URL('../../tools/database/reset_superadmin_user_password.js', import.meta.url);
  const imported = spawnSync(process.execPath, ['--input-type=module', '-e', `await import(${JSON.stringify(entry.href)})`], { encoding: 'utf8' });
  assert.equal(imported.status, 0, imported.stderr);
  assert.equal(imported.stdout + imported.stderr, '');
  const rejected = spawnSync(process.execPath, [fileURLToPath(entry), '--env', 'test', '--user-id', '1', '--password', password], { encoding: 'utf8' });
  assert.equal(rejected.status, 1);
  assert.match(rejected.stderr, /password reset failed/i);
  assert.equal((rejected.stdout + rejected.stderr).includes(password), false);
});

test('local command rejects remote environments and password arguments before opening any database', async () => {
  const createProxy = () => { assert.fail('invalid command must not open a database'); };
  for (const args of [
    ['--env', 'production', '--user-id', '1'], ['--env', 'staging', '--user-id', '1'],
    ['--env', 'test', '--user-id', '1', '--password', password],
    ['--env', 'test'], ['--user-id', '1'], ['--env', 'test', '--user-id', '0']
  ]) {
    await assert.rejects(() => service.runLocalPasswordReset({
      args, env: { RESET_SUPERADMIN_PASSWORD: password }, stdin: Readable.from([]), createProxy
    }));
  }
});

test('actual CLI resets only its selected account in isolated persisted Wrangler D1', { timeout: 30000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'password-reset-cli-'));
  const configPath = join(root, 'wrangler.toml');
  let proxy;
  const connect = () => getPlatformProxy({
    configPath, environment: 'test', remoteBindings: false, envFiles: [],
    persist: { path: join(root, '.wrangler/state/v3') }
  });
  try {
    await writeFile(configPath, `name = "password-reset-local-fixture"
compatibility_date = "2025-06-01"
[[env.test.d1_databases]]
binding = "DB"
database_name = "password-reset-local-fixture"
database_id = "00000000-0000-0000-0000-000000000025"
`);
    proxy = await connect();
    await applyMigrations(proxy.env.DB);
    await proxy.env.DB.prepare('INSERT INTO users (full_name,email,password,role) VALUES (?,?,?,?)')
      .bind('Actual CLI Fixture', 'cli@example.invalid', originalHash, 'super_admin').run();
    const beforeRows = (await proxy.env.DB.prepare('SELECT * FROM users ORDER BY id').all()).results;
    await proxy.dispose();
    proxy = null;
    const entry = fileURLToPath(new URL('../../tools/database/reset_superadmin_user_password.js', import.meta.url));
    const command = spawnSync(process.execPath, [entry, '--config', configPath, '--env', 'test', '--email', 'cli@example.invalid'], {
      cwd: root, encoding: 'utf8', timeout: 15000,
      env: { PATH: process.env.PATH, WRANGLER_SEND_METRICS: 'false', RESET_SUPERADMIN_PASSWORD: password }
    });
    assert.equal(command.status, 0, command.stderr);
    assert.match(command.stdout, /password reset completed/i);
    assert.equal((command.stdout + command.stderr).includes(password), false);
    assert.equal((command.stdout + command.stderr).includes(originalHash), false);
    proxy = await connect();
    const afterRows = (await proxy.env.DB.prepare('SELECT * FROM users ORDER BY id').all()).results;
    const target = afterRows.find((row) => row.email === 'cli@example.invalid');
    assert.equal(await bcrypt.compare(password, target.password), true);
    assert.deepEqual(afterRows.filter((row) => row.id !== target.id), beforeRows.filter((row) => row.id !== target.id));
  } finally {
    if (proxy) { await proxy.dispose(); }
    await rm(root, { recursive: true, force: true });
  }
});
