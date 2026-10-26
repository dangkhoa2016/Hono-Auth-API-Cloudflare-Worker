import test from 'node:test';
import assert from 'node:assert/strict';
import { Hono } from 'hono';
import { createUnifiedRequestMiddleware } from '../../src/middleware/unifiedRequestMiddleware.js';
import { configureDebugNamespaces } from '../../src/utils/debug.js';
import { captureLogs, createTestEnv } from './helpers/local-env.mjs';

test('malformed reset credential JSON cannot leak parser source excerpts into debug logs', async () => {
  const app = new Hono();
  app.use('*', createUnifiedRequestMiddleware('admin', null, null, { enableAudit: false }));
  app.post('/api/admin/users/:id/reset-password', c => c.json({ success: false }, 400));
  const marker = 'Q7x9';
  configureDebugNamespaces('hono-auth-api:*');
  const capture = captureLogs();
  let response;
  try {
    response = await app.request('http://127.0.0.1/api/admin/users/2/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: `{"newPassword": ${marker}, "confirmPassword":"other"}`
    }, createTestEnv());
  } finally {
    capture.restore();
    configureDebugNamespaces('');
  }
  assert.equal(response.status, 400);
  assert.match(capture.text, /Error parsing request body/);
  assert.equal(capture.text.includes(marker), false, 'JSON parser diagnostics can contain raw credential fragments');
});
