import assert from 'node:assert/strict';
import test from 'node:test';
import { signToken, verifyToken } from '../src/utils/jwt.js';

test('verifies a token signed with the local HS256 configuration', async () => {
  const secret = 'jwt-verification-test-secret';
  const payload = {
    user_id: 42,
    jti: 'jwt-verification-test',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 60
  };

  const token = await signToken(payload, secret);
  const verified = await verifyToken(token, secret);

  assert.equal(verified?.user_id, payload.user_id);
  assert.equal(verified?.jti, payload.jti);
});
