import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { once } from 'node:events';
import { SecurityIncidentResponseService } from '../../src/services/securityIncidentResponseService.js';
import { AlertSystemService } from '../../src/services/alertSystemService.js';
import { createTestEnv, captureLogs } from './helpers/local-env.mjs';
import { configureDebugNamespaces } from '../../src/utils/debug.js';

const incident = {
  id: 'local-incident', type: 'brute_force_login', severity: 'critical',
  metadata: { sourceIp: '127.0.0.1', actorId: 1, attemptCount: 20 }
};
const alert = { id: 'local-alert', title: 'Local verification', message: 'Fixture', severity: 'high' };

test('supported log actions emit redacted operational events while debug tracing is disabled', async () => {
  configureDebugNamespaces('');
  const logs = captureLogs();
  try {
    const engine = new SecurityIncidentResponseService(createTestEnv()).getResponseEngine();
    engine.responseActions.get('log_alert').handler({ ...incident, metadata: { password: 'private-incident-marker' } }, {});
    const manager = new AlertSystemService(createTestEnv()).getChannelManager();
    await manager.sendAlert({ ...alert, data: { password: 'private-alert-marker' } }, ['console']);
  } finally {
    logs.restore();
  }
  assert.ok(logs.text.includes('local-incident'), 'incident log must actually be emitted');
  assert.ok(logs.text.includes('local-alert'), 'console alert must actually be emitted');
  assert.equal(logs.text.includes('private-incident-marker'), false);
  assert.equal(logs.text.includes('private-alert-marker'), false);
});

test('explicitly addressed disabled channels cannot report successful delivery', async () => {
  const manager = new AlertSystemService(createTestEnv()).getChannelManager();
  manager.toggleChannel('console', false);
  const result = await manager.sendAlert(alert, ['console']);
  assert.equal(result[0].success, false);
  assert.equal(result[0].code, 'ALERT_CHANNEL_DISABLED');
});

test('a failing operational log sink is not counted as completed delivery', async () => {
  const original = console.info;
  const service = new AlertSystemService(createTestEnv());
  try {
    console.info = () => {throw new Error('Local sink unavailable');};
    const result = await service.getChannelManager().sendAlert(alert, ['console']);
    assert.equal(result[0].success, false);
    assert.equal(service.getChannelManager().getChannelStats().channels.find(channel => channel.id === 'console').stats.successCount, 0);
  } finally {
    console.info = original;
  }
});

for (const action of ['block_ip', 'disable_user', 'escalate', 'notify_admin', 'quarantine']) {
  test(`incident ${action} refuses execution without an implemented adapter`, () => {
    const engine = new SecurityIncidentResponseService(createTestEnv()).getResponseEngine();
    assert.throws(() => engine.responseActions.get(action).handler(incident, {}), {
      code: 'UNSUPPORTED_INCIDENT_ACTION', statusCode: 422
    });
    assert.equal(engine.responseActions.get(action).executionCount, 0);
  });
}

test('automatic response counts completed actions without claiming unsupported containment', async () => {
  const engine = new SecurityIncidentResponseService(createTestEnv()).getResponseEngine();
  const result = await engine.executeResponse(incident);
  assert.equal(result.actionsExecuted, 1);
  assert.equal(result.results[0].actionsExecuted, 1);
  assert.equal(result.results[0].status, 'partial');
  const unavailable = result.results[0].actions.filter(action => !action.success);
  assert.equal(unavailable.length, 3);
  assert.ok(unavailable.every(action => action.code === 'UNSUPPORTED_INCIDENT_ACTION'));
  assert.ok(unavailable.every(action => action.status === 'unsupported'));
});

test('default alert delivery uses supported channels only', async () => {
  const manager = new AlertSystemService(createTestEnv()).getChannelManager();
  const results = await manager.sendAlert(alert);
  assert.deepEqual(results.map(result => result.channelId), ['console']);
  assert.equal(results[0].success, true);
});

for (const channel of ['email', 'kv_storage']) {
  test(`${channel} delivery reports unsupported instead of an unperformed successful send`, async () => {
    const manager = new AlertSystemService(createTestEnv()).getChannelManager();
    manager.updateChannelConfig('email', { toEmails: ['fixture@example.invalid'] });
    const results = await manager.sendAlert(alert, [channel]);
    assert.equal(results.length, 1);
    assert.equal(results[0].success, false);
    assert.equal(results[0].code, 'UNSUPPORTED_ALERT_CHANNEL');
    assert.equal(manager.getChannelStats().channels.find(item => item.id === channel).stats.successCount, 0);
  });
}

test('unknown requested alert channels produce an explicit failed result', async () => {
  const manager = new AlertSystemService(createTestEnv()).getChannelManager();
  const results = await manager.sendAlert(alert, ['does-not-exist']);
  assert.equal(results.length, 1);
  assert.equal(results[0].success, false);
  assert.equal(results[0].code, 'UNKNOWN_ALERT_CHANNEL');
});

test('manual alert with no completed delivery is rejected', async () => {
  const service = new AlertSystemService(createTestEnv());
  await assert.rejects(service.sendManualAlert(alert, ['kv_storage']), {
    code: 'UNSUPPORTED_ALERT_CHANNEL', statusCode: 422
  });
});

test('supported webhook delivery reaches the configured receiver before reporting success', async (t) => {
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
  const manager = new AlertSystemService(createTestEnv()).getChannelManager();
  manager.updateChannelConfig('webhook', { url: `http://127.0.0.1:${server.address().port}`, timeout: 2000 });
  manager.toggleChannel('webhook', true);
  const result = await manager.sendAlert(alert, ['webhook']);
  assert.equal(result[0].success, true);
  assert.equal(received.length, 1);
  assert.ok(JSON.stringify(received[0]).includes('Local verification'));
});
