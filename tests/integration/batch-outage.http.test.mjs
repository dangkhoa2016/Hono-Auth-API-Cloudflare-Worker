import test from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import { createTestEnv, initTestI18n, FAKE_SECRETS } from '../regression/helpers/local-env.mjs';
import { TokenService } from '../../src/services/tokenService.js';
import { createTokenPayload, signToken } from '../../src/utils/jwt.js';
import authRoutes from '../../src/routes/auth.js';
import advancedRoutes from '../../src/routes/advancedAudit.js';
await initTestI18n();
function binding({ failBatch = false, role = 'admin' } = {}) {
  const calls = [];
  const user = { id: 7, role, status: 'active', auth_version: 1, email: 'review@example.invalid', full_name: 'Review' };
  const db = { calls, prepare(sql) {
    const item = { sql: sql.replace(/\s+/g, ' ').trim() }; calls.push(item);
    return { bind(...params) { item.params = params; return this; },
      async first() {
        if (/token_blacklist/.test(sql)) {return null;}
        if (/refresh_tokens/.test(sql)) {return { id: 8, user_id: 7, jti: 'review-refresh-jti', token_hash: await TokenService.hashToken(db.refresh), issued_at: '2026-01-01T00:00:00.000Z', expires_at: '2100-01-01T00:00:00.000Z', revoked: 0 };}
        return user;
      },
      async all() {
        if (/FROM audit_logs/.test(sql)) {return { results: [{ actor_id: 99, actor_role: 'super_admin', action: 'ADMIN_PRIVATE_REVIEW_MARKER', total_actions: 1, count: 1, unique_users: 1, activity_count: 1 }] };}
        return { results: [] };
      },
      async run() { return { success: true, meta: { changes: 1 } }; }
    };
  }, async batch(statements) {
    calls.push({ batch: true, size: statements.length });
    if (failBatch) {throw failBatch;}
    return statements.map(() => ({ success: true, meta: { changes: 1 } }));
  } };
  return db;
}
async function setup(options) {
  const db = binding(options); const env = createTestEnv({ DB: db });
  const jwt = await new TokenService(env).getJwtConfig();
  const access = await signToken(await createTokenPayload({ sub: 'user:7', iss: jwt.issuer, aud: Array.isArray(jwt.audience) ? jwt.audience[0] : jwt.audience, user_id: 7, auth_version: 1, role: options.role || 'admin', jti: 'review-jti', scope: 'user:basic' }, 'access', env), FAKE_SECRETS.JWT_SECRET);
  db.refresh = await signToken(await createTokenPayload({ user_id: 7, auth_version: 1, jti: 'review-refresh-jti' }, 'refresh', env), FAKE_SECRETS.JWT_SECRET);
  const app = new Hono(); app.route('/api/auth', authRoutes); app.route('/api/advanced-audit', advancedRoutes);
  return { app, env, db, headers: { authorization: `Bearer ${access}`, 'content-type': 'application/json' } };
}

for (const [name, failure, status, code] of [
  ['success', null, 200, undefined],
  ['network outage', new Error('D1_ERROR: Network connection lost.'), 503, 'DB_UNAVAILABLE'],
  ['overload', new Error('D1_ERROR: database is overloaded'), 503, 'DB_UNAVAILABLE'],
  ['constraint', new Error('D1_ERROR: UNIQUE constraint failed: refresh_tokens.jti: SQLITE_CONSTRAINT'), 500, undefined],
  ['transaction assertion', new Error('D1_ERROR: integer overflow: SQLITE_ERROR'), 500, undefined]
]) {
  test(`T2: authenticated logout-all ${name} preserves batch error contract without replay`, async () => {
    const { app, env, db, headers } = await setup({ failBatch: failure });
    const response = await app.request('/api/auth/logout-all', { method: 'POST', headers, body: JSON.stringify({ refresh_token: db.refresh }) }, env);
    const body = await response.json();
    assert.equal(response.status, status);
    if (code) {assert.equal(body.code, code);}
    else if (failure) {assert.notEqual(body.code, 'DB_UNAVAILABLE');}
    assert.equal(db.calls.filter(call => call.batch).length, 1);
    assert.equal(body.success, !failure);
  });
}
