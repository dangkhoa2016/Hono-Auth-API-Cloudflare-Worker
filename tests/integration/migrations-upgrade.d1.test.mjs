import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, mkdir, readdir, copyFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { getPlatformProxy } from 'wrangler';
const exec = promisify(execFile);
const migrations = fileURLToPath(new URL('../../migrations/', import.meta.url));
const cli = fileURLToPath(new URL('../../node_modules/wrangler/bin/wrangler.js', import.meta.url));

test('S6 Wrangler local migrations: fresh, populated 0010 upgrade, preserved rows and recorded rerun', { timeout: 150000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'r12-migrations-'));
  let proxy;
  try {
    for (const upgrade of [false, true]) {
      const dir = join(root, upgrade ? 'upgrade' : 'fresh');
      const sqlDir = join(dir, 'migrations');
      await mkdir(sqlDir, { recursive: true });
      const config = join(dir, 'wrangler.json');
      const persist = join(dir, 'state');
      await writeFile(config, JSON.stringify({ name: 'r12-migration-test', compatibility_date: '2025-06-01',
        d1_databases: [{ binding: 'DB', database_name: 'r12-test', database_id: '00000000-0000-0000-0000-000000000012', migrations_dir: sqlDir }] }));
      const files = (await readdir(migrations)).filter(n => n.endsWith('.sql')).sort();
      for (const name of files.filter(n => !upgrade || Number.parseInt(n) <= 10)) {
        await copyFile(join(migrations, name), join(sqlDir, name));
      }
      const apply = async () => {
        const env = { ...process.env, CI: 'true', WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_API_TOKEN: '', CLOUDFLARE_API_KEY: '' };
        delete env.NODE_TEST_CONTEXT;
        return exec(process.execPath, [cli, 'd1', 'migrations', 'apply', 'r12-test', '--local', '--config', config, '--persist-to', persist],
          { env, timeout: 40000, maxBuffer: 4 * 1024 * 1024 });
      };
      const connect = () => getPlatformProxy({ configPath: config, envFiles: [], persist: { path: join(persist, 'v3') }, remoteBindings: false });
      await apply();
      proxy = await connect();
      const db = proxy.env.DB;
      const count = await db.prepare('SELECT COUNT(*) AS n FROM d1_migrations').first('n');
      assert.equal(count, upgrade ? 10 : files.length);
      const before = {};
      if (upgrade) {
        await db.prepare('INSERT INTO users(id,full_name,email,password,role,status) VALUES(991,\'Upgrade Fixture\',\'upgrade@example.invalid\',\'fake-unused-hash\',\'user\',\'active\')').run();
        await db.prepare('INSERT INTO audit_logs(action,actor_id,actor_role,status) VALUES(\'upgrade-marker\',991,\'user\',\'SUCCESS\')').run();
        await db.prepare('INSERT INTO audit_logs_archive(original_id,actor_id,actor_role,action,timestamp) VALUES(991,991,\'user\',\'upgrade-marker\',\'2026-01-01\')').run();
        await db.prepare('INSERT INTO refresh_tokens(user_id,token_hash,jti,issued_at,expires_at) VALUES(991,\'fake-unused-hash\',\'upgrade-jti\',\'2026-01-01\',\'2027-01-01\')').run();
        await db.prepare('INSERT INTO security_incidents(id,type,severity,status,title,description,detected_at,updated_at) VALUES(\'upgrade-marker\',\'test\',\'low\',\'detected\',\'fixture\',\'fixture\',\'2026-01-01\',\'2026-01-01\')').run();
        for (const table of ['users', 'audit_logs', 'audit_logs_archive', 'refresh_tokens', 'security_incidents']) {
          before[table] = (await db.prepare(`SELECT * FROM ${table} ORDER BY id`).all()).results;
        }
      }
      await proxy.dispose();
      proxy = null;
      for (const name of files) { await copyFile(join(migrations, name), join(sqlDir, name)); }
      if (upgrade) { await apply(); }
      proxy = await connect();
      const after = proxy.env.DB;
      for (const [table, rows] of Object.entries(before)) {
        for (const row of rows) {
          const actual = await after.prepare(`SELECT * FROM ${table} WHERE id = ?`).bind(row.id).first();
          assert.ok(actual, `${table} row preserved`);
          for (const [key, value] of Object.entries(row)) { assert.deepEqual(actual[key], value, `${table}.${key} preserved`); }
        }
      }
      for (const table of ['users', 'refresh_tokens']) {
        const columns = (await after.prepare(`PRAGMA table_info(${table})`).all()).results.map(r => r.name);
        assert.ok(columns.includes('auth_version'));
      }
      if (upgrade) {
        assert.equal(await after.prepare('SELECT auth_version FROM users WHERE id=991').first('auth_version'), 1);
        const token = await after.prepare('SELECT * FROM refresh_tokens WHERE jti=\'upgrade-jti\'').first();
        assert.equal(token.auth_version, 1);
        assert.equal(token.consumed_at, null);
        assert.equal(token.rotation_grace_until, null);
        const archive = await after.prepare('SELECT * FROM audit_logs_archive WHERE original_id=991').first();
        assert.equal(archive.metadata_complete, 0);
        assert.equal(archive.status, null);
      }
      const indexes = (await after.prepare('SELECT name FROM sqlite_master WHERE type=\'index\'').all()).results.map(r => r.name);
      for (const name of ['idx_archive_status', 'idx_archive_restored_at', 'idx_refresh_tokens_replaced_by_unique', 'idx_refresh_tokens_consumed']) {
        assert.ok(indexes.includes(name), name);
      }
      const migrationRows = (await after.prepare('SELECT * FROM d1_migrations ORDER BY id').all()).results;
      assert.equal(migrationRows.length, files.length);
      const auditCount = await after.prepare('SELECT COUNT(*) AS n FROM audit_logs').first('n');
      await proxy.dispose();
      proxy = null;
      await apply();
      proxy = await connect();
      assert.deepEqual((await proxy.env.DB.prepare('SELECT * FROM d1_migrations ORDER BY id').all()).results, migrationRows);
      assert.equal(await proxy.env.DB.prepare('SELECT COUNT(*) AS n FROM audit_logs').first('n'), auditCount, 'rerun must not repeat migration audit writes');
      await proxy.dispose();
      proxy = null;
    }
  } finally {
    if (proxy) { await proxy.dispose(); }
    await rm(root, { recursive: true, force: true });
  }
});
