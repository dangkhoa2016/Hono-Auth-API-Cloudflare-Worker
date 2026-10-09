import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { getPlatformProxy, unstable_dev } from 'wrangler';
import bcrypt from 'bcryptjs';
import { applyMigrations } from '../regression/helpers/d1-local.mjs';

const config = fileURLToPath(new URL('../fixtures/wrangler.local-smoke.toml', import.meta.url));
const entry = fileURLToPath(new URL('../../src/index.js', import.meta.url));

test('S6 actual Worker: login, protected profile, audit/export, revoke and isolated D1 outage', { timeout: 120000 }, async () => {
  const root = await mkdtemp(join(tmpdir(), 'r12-worker-'));
  let proxy;
  let worker;
  const start = () => unstable_dev(entry, {
    config, envFiles: [], ip: '127.0.0.1', port: 0, inspectorPort: 0,
    local: true, persist: true, persistTo: root, logLevel: 'error',
    experimental: { disableExperimentalWarning: true, disableDevRegistry: true, watch: false, forceLocal: true }
  });
  const connect = () => getPlatformProxy({ configPath: config, envFiles: [], persist: { path: join(root, 'v3') }, remoteBindings: false });
  try {
    proxy = await connect();
    await applyMigrations(proxy.env.DB);
    const password = 'Local-only-fixture-7y!';
    await proxy.env.DB.prepare('INSERT INTO users (full_name,email,password,role,status) VALUES (?,?,?,?,?)')
      .bind('Local Smoke', 'r12-smoke@example.invalid', await bcrypt.hash(password, 4), 'super_admin', 'active').run();
    await proxy.dispose();
    proxy = null;
    worker = await start();
    assert.equal(worker.address, '127.0.0.1');
    assert.ok(worker.port > 0);
    const request = (path, options = {}) => worker.fetch(`http://127.0.0.1:${worker.port}${path}`, options);
    const login = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'r12-smoke@example.invalid', password }) });
    assert.equal(login.status, 200, 'actual Worker login');
    const payload = await login.json();
    assert.equal(typeof payload.data.access_token, 'string');
    const headers = { Authorization: `Bearer ${payload.data.access_token}`, 'Content-Type': 'application/json' };
    assert.equal((await request('/api/user/me', { headers })).status, 200, 'protected route');
    const audit = await request('/api/audit/logs?limit=10&page=1', { headers });
    assert.equal(audit.status, 200, 'actual audit route');
    const exported = await request('/api/advanced-audit/export-advanced', { method: 'POST', headers,
      body: JSON.stringify({ format: 'json', filters: { time_range: '7d' } }) });
    assert.equal(exported.status, 200, 'actual export route');
    const revoke = await request('/api/auth/logout-all', { method: 'POST', headers, body: JSON.stringify({ refresh_token: payload.data.refresh_token }) });
    assert.equal(revoke.status, 200, 'revocation');
    assert.equal((await request('/api/user/me', { headers })).status, 401, 'revoked session must fail');
    await worker.stop();
    worker = null;
    proxy = await connect();
    // Destroy only this test's admission table: an actual storage failure, no product debug endpoint.
    await proxy.env.DB.prepare('DROP TABLE rate_limit_counters').run();
    await proxy.dispose();
    proxy = null;
    worker = await start();
    const fault = await request('/api/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'r12-smoke@example.invalid', password }) });
    assert.equal(fault.status, 503, 'D1 outage must fail closed before login');
    const faultBody = await fault.json();
    assert.equal(faultBody.success, false);
  } finally {
    if (worker) { await worker.stop(); }
    if (proxy) { await proxy.dispose(); }
    await rm(root, { recursive: true, force: true });
  }
});
