import test from 'node:test';
import assert from 'node:assert/strict';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv } from '../regression/helpers/local-env.mjs';
import { SecurityIncidentResponseService } from '../../src/services/securityIncidentResponseService.js';

let local;
let service;
test.before(async () => {
  local = await startD1();
  service = new SecurityIncidentResponseService(createTestEnv({ DB: local.db }));
});
test.after(async () => {await local?.dispose();});

test('automatic logging and unsupported actions leave the stored incident detected', async () => {
  const result = await service.processThreat({
    type: 'brute_force_login', severity: 'critical', description: 'Local capability verification',
    sourceIp: '127.0.0.1', attemptCount: 20
  });
  const row = await local.db.prepare('SELECT status, tags FROM security_incidents WHERE id = ?').bind(result.incident.id).first();
  assert.equal(row.status, 'detected');
  assert.deepEqual(JSON.parse(row.tags), ['automated', 'threat_detection']);
  const actions = await local.db.prepare('SELECT action_type, action_status, result FROM incident_response_actions WHERE incident_id = ?').bind(result.incident.id).all();
  assert.equal(actions.results.find(action => action.action_type === 'block_ip').action_status, 'failed');
  assert.equal(JSON.parse(actions.results.find(action => action.action_type === 'block_ip').result).code, 'UNSUPPORTED_INCIDENT_ACTION');
  assert.equal(result.responseResults.actionsExecuted, 1);
});

test('manual refusal is recorded as failed without changing the target user', async () => {
  const id = 'local-manual-incident';
  await local.db.prepare('INSERT INTO security_incidents (id, type, severity, status, title, description, metadata, detected_at, updated_at) VALUES (?, \'privilege_escalation\', \'high\', \'detected\', \'Fixture\', \'Local fixture\', ?, datetime(\'now\'), datetime(\'now\'))').bind(id, JSON.stringify({ actorId: 1 })).run();
  const before = await local.db.prepare('SELECT status FROM users WHERE id = 1').first();
  const result = await service.executeManualResponse(id, [{ action: 'disable_user' }]);
  assert.equal(result.success, false);
  assert.equal(result.statusCode, 422);
  assert.equal(result.actionsExecuted, 0);
  assert.equal(result.results[0].actionsExecuted, 0);
  assert.equal(result.results[0].actions[0].code, 'UNSUPPORTED_INCIDENT_ACTION');
  const after = await local.db.prepare('SELECT status FROM users WHERE id = 1').first();
  assert.equal(after.status, before.status);
});
