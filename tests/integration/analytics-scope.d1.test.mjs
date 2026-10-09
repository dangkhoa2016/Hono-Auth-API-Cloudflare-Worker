import test from 'node:test';
import assert from 'node:assert/strict';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n } from '../regression/helpers/local-env.mjs';
import { AuditAnalyticsService } from '../../src/services/auditAnalyticsService.js';
import { TokenService } from '../../src/services/tokenService.js';
import { Hono } from 'hono';
import routes from '../../src/routes/advancedAudit.js';
let d1, env, admin, superAdmin;
test.before(async () => {
  await initTestI18n(); d1 = await startD1(); env = createTestEnv({ DB: d1.db });
  const users = [];
  for (const role of ['admin', 'super_admin']) {
    const email = `analytics-${role}@example.invalid`;
    const result = await d1.db.prepare('INSERT INTO users (full_name,email,password,role,status,auth_version) VALUES (?,?,?,?,?,?)').bind(role, email, 'fake-hash', role, 'active', 1).run();
    const user = { id: result.meta.last_row_id, email, full_name: role, role, status: 'active', auth_version: 1 }; users.push(user);
    await d1.db.prepare('INSERT INTO audit_logs (actor_id,actor_role,action,status,ip_address,details,timestamp) VALUES (?,?,?,?,?,?,CURRENT_TIMESTAMP)').bind(user.id, role, `login_${role}_marker`, 'FAILURE', role === 'admin' ? '192.0.2.1' : '192.0.2.2', '{}').run();
  }
  [admin, superAdmin] = users;
  await d1.db.prepare('INSERT INTO audit_logs (actor_role,action,status,details,timestamp) VALUES (NULL,?,?,?,CURRENT_TIMESTAMP)').bind('system_marker', 'SUCCESS', '{}').run();
});
test.after(async () => { await d1?.dispose(); });
for (const method of ['getSecurityAnalytics', 'getUserBehaviorAnalytics', 'getPerformanceAnalytics']) {
  test(`T3: ${method} isolates admin after super-admin on one service`, async () => {
    const service = new AuditAnalyticsService(env);
    const elevated = await service[method]({}, superAdmin);
    assert.match(JSON.stringify(elevated), /super_admin_marker|192\.0\.2\.2/);
    const limited = await service[method]({}, admin);
    assert.doesNotMatch(JSON.stringify(limited), /super_admin_marker|192\.0\.2\.2/);
    assert.match(JSON.stringify(limited), /admin_marker|192\.0\.2\.1/);
    const omitted = await service[method]();
    assert.doesNotMatch(JSON.stringify(omitted), /super_admin_marker|192\.0\.2\.2/);
  });
}
test('T3: client role filter cannot widen analytics service scope', async () => {
  const service = new AuditAnalyticsService(env);
  const denied = await service.getUserBehaviorAnalytics({ actorRole: 'super_admin', scope: { canReadAll: true }, principal: superAdmin }, admin);
  assert.deepEqual(denied.behavior_summary.activity_patterns, []);
  assert.deepEqual(denied.behavior_summary.actions_by_role, []);
  const allowed = await service.getUserBehaviorAnalytics({ actorRole: 'super_admin' }, superAdmin);
  assert.equal(allowed.behavior_summary.activity_patterns.length, 1);
  const injection = await service.getUserBehaviorAnalytics({ actorRole: 'super_admin\' OR 1=1 --' }, superAdmin);
  assert.deepEqual(injection.behavior_summary.activity_patterns, []);
});
test('T3: restricted performance keeps system rows and excludes super-admin aggregates', async () => {
  const service = new AuditAnalyticsService(env);
  const full = await service.getPerformanceAnalytics({}, superAdmin);
  const limited = await service.getPerformanceAnalytics({}, admin);
  assert.equal(full.performance_summary.database_size.total_records - limited.performance_summary.database_size.total_records, 1);
  assert.ok(limited.performance_summary.action_frequency.some(row => row.action === 'system_marker'));
});

for (const role of ['admin', 'super_admin']) {
  test(`T3: authenticated ${role} behavior HTTP honors server principal`, async () => {
    const user = role === 'admin' ? admin : superAdmin;
    const pair = await new TokenService(env).issueTokenPair(user, {}, { skipQuota: true });
    const app = new Hono(); app.route('/api/advanced-audit', routes);
    const response = await app.request('/api/advanced-audit/analytics/behavior?actorRole=super_admin', { headers: { authorization: `Bearer ${pair.accessToken}` } }, env);
    assert.equal(response.status, 200);
    const body = await response.json();
    const rows = body.data.behavior_summary.activity_patterns;
    assert.equal(rows.length, role === 'admin' ? 0 : 1);
    if (rows.length) {assert.equal(rows[0].actor_role, 'super_admin');}
  });
}

for (const endpoint of ['analytics', 'analytics/security']) {
  test(`T3: admin ${endpoint} excludes super-admin facts before aggregation`, async () => {
    const pair = await new TokenService(env).issueTokenPair(admin, {}, { skipQuota: true });
    const app = new Hono(); app.route('/api/advanced-audit', routes);
    const response = await app.request(`/api/advanced-audit/${endpoint}`, { headers: { authorization: `Bearer ${pair.accessToken}` } }, env);
    assert.equal(response.status, 200);
    assert.doesNotMatch(await response.text(), /super_admin_marker|192\.0\.2\.2/);
  });
}
