import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n } from '../regression/helpers/local-env.mjs';
import { createAlertSystemService } from '../../src/utils/serviceFactory.js';

let local;
let env;
let app;
let headers;
test.before(async () => {
  local = await startD1();
  await initTestI18n();
  env = createTestEnv({ DB: local.db });
  app = (await import('../../src/index.js')).default;
  const password = 'Local-http-fixture-8q!';
  await local.db.prepare('UPDATE users SET full_name=?,email=?,password=?,role=?,status=? WHERE id=1')
    .bind('Capability fixture', 'capability@example.invalid', await bcrypt.hash(password, 4), 'super_admin', 'active').run();
  const login = await app.request('http://127.0.0.1/api/auth/login', {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'capability@example.invalid', password })
  }, env);
  assert.equal(login.status, 200);
  headers = { Authorization: `Bearer ${(await login.json()).data.access_token}`, 'Content-Type': 'application/json' };
});
test.after(async () => {await local?.dispose();});

test('incident status exposes resolved database statistics alongside execution capabilities', async () => {
  const expected = await local.db.prepare('SELECT COUNT(*) AS total FROM security_incidents').first();
  const response = await app.request('http://127.0.0.1/api/security-incident/status', { headers }, env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.data.incidents.total, expected.total);
  assert.equal(body.data.capabilities.automaticContainment, false);
});

test('a manual unavailable alert is an HTTP422 refusal instead of a sent confirmation', async () => {
  const response = await app.request('http://127.0.0.1/api/realtime-monitoring/alerts/send', {
    method: 'POST', headers, body: JSON.stringify({ title: 'Fixture', message: 'Local only', severity: 'high', channels: ['kv_storage'] })
  }, env);
  assert.equal(response.status, 422);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'UNSUPPORTED_ALERT_CHANNEL');
});

test('omitting manual alert channels uses the enabled supported default', async () => {
  const response = await app.request('http://127.0.0.1/api/realtime-monitoring/alerts/send', {
    method: 'POST', headers, body: JSON.stringify({ title: 'Default channel', message: 'Local only', severity: 'high' })
  }, env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, true);
  assert.ok(body.data.sendResults.some(result => result.channelId === 'console' && result.success));
});

test('creating an unsupported custom email adapter cannot bypass delivery refusal', async () => {
  const response = await app.request('http://127.0.0.1/api/realtime-monitoring/alerts/channels', {
    method: 'POST', headers, body: JSON.stringify({ name: 'Unavailable email', type: 'email', enabled: true, config: { toEmails: ['fixture@example.invalid'] } })
  }, env);
  assert.equal(response.status, 422);
  assert.equal((await response.json()).code, 'UNSUPPORTED_ALERT_CHANNEL');
});

test('a custom webhook reports delivery only after its real receiver accepts the alert', async (t) => {
  const received = [];
  const server = createServer(async (request, response) => {
    let body = '';
    for await (const chunk of request) {body += chunk;}
    received.push(JSON.parse(body));
    response.writeHead(204).end();
  });
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const created = await app.request('http://127.0.0.1/api/realtime-monitoring/alerts/channels', {
    method: 'POST', headers, body: JSON.stringify({ name: 'Local webhook', type: 'webhook', enabled: true, config: { url: `http://127.0.0.1:${server.address().port}` } })
  }, env);
  assert.equal(created.status, 200);
  const id = (await created.json()).data.channelId;
  t.after(() => createAlertSystemService(env).getChannelManager().removeChannel(id));
  const sent = await app.request('http://127.0.0.1/api/realtime-monitoring/alerts/send', {
    method: 'POST', headers, body: JSON.stringify({ title: 'Receiver fixture', message: 'Local only', severity: 'high', channels: [id] })
  }, env);
  assert.equal(sent.status, 200);
  assert.equal((await sent.json()).success, true);
  assert.equal(received.length, 1);
});

test('alert-system test preserves partial delivery failures through both response envelopes', async (t) => {
  const server = createServer((_request, response) => {response.writeHead(503).end();});
  server.listen(0, '127.0.0.1');
  await once(server, 'listening');
  t.after(() => new Promise(resolve => server.close(resolve)));
  const manager = createAlertSystemService(env).getChannelManager();
  manager.updateChannelConfig('webhook', { url: `http://127.0.0.1:${server.address().port}`, timeout: 1000 });
  manager.toggleChannel('webhook', true);
  t.after(() => manager.toggleChannel('webhook', false));
  const response = await app.request('http://127.0.0.1/api/realtime-monitoring/alerts/test', { method: 'POST', headers }, env);
  assert.equal(response.status, 200);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.data.success, false);
});

test('single unsupported manual incident action is an HTTP422 refusal with its stored outcome', async () => {
  const id = 'http-incident-fixture';
  await local.db.prepare('INSERT INTO security_incidents (id,type,severity,status,title,description,metadata,detected_at,updated_at) VALUES (?,\'privilege_escalation\',\'high\',\'detected\',\'Fixture\',\'Local fixture\',\'{}\',datetime(\'now\'),datetime(\'now\'))').bind(id).run();
  const response = await app.request(`http://127.0.0.1/api/security-incident/incidents/${id}/response`, {
    method: 'POST', headers, body: JSON.stringify({ action: 'block_ip', params: { duration: 3600 } })
  }, env);
  assert.equal(response.status, 422);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'UNSUPPORTED_INCIDENT_ACTION');
  assert.equal(body.data.actionsExecuted, 0);
});

