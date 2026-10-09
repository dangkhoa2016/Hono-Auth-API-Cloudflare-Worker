/**
 * T6 / B08 - refresh rotation and session revocation against real D1.
 *
 * These run against Miniflare's SQLite rather than a stub because the property
 * under test is a storage property: a conditional consume that either wins or
 * writes nothing. A fake repository would be asserting the mock, not the code.
 *
 * Per-IP throttling is switched off for this file. The refresh policy is a real
 * 10 requests / 600 s per address, and these tests deliberately fire up to 20
 * requests from one address to race a single token. That is not the property
 * under test - rotation is - and before the admission path became atomic the
 * limiter simply lost the race and let all 20 through, so the suite was passing
 * for the wrong reason. The throttling behaviour is asserted on its own in
 * tests/integration/rate-limit.d1.test.mjs.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTokenService, createUserService, createAuthService } from '../../src/utils/serviceFactory.js';

const JWT_SECRET = 'test-secret-that-is-long-enough-for-hs256-signing-abc';
let d1Promise;
let env;

test.before(async () => {
  const d1 = await startD1();
  d1Promise = Promise.resolve(d1);
  env = {
    DB: d1.db,
    JWT_SECRET,
    JWT_ISSUER: 'test',
    JWT_AUDIENCE: 'test-client',
    RATE_LIMIT_DISABLED: 'true'
  };
});

test.after(async () => {
  const d1 = await d1Promise;
  if (d1) {
    await d1.dispose();
  }
});

async function seedUser(overrides = {}) {
  const d1 = await d1Promise;
  const email = overrides.email || `race-${Math.random().toString(16).slice(2)}@example.test`;
  const result = await d1.db
    .prepare(
      `INSERT INTO users (full_name, email, password, role, status, auth_version, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`
    )
    .bind(
      overrides.full_name || 'Race User',
      email,
      'not-a-real-hash',
      overrides.role || 'user',
      overrides.status || 'active',
      overrides.auth_version ?? 1
    )
    .run();
  const id = Number(result.meta.last_row_id);
  return { id, email, full_name: 'Race User', role: overrides.role || 'user', status: overrides.status || 'active', auth_version: overrides.auth_version ?? 1 };
}

async function issueFor(user) {
  return createTokenService(env).issueTokenPair(user, {}, { skipQuota: true });
}

async function rotationAttempts(user, refreshToken, count) {
  const authService = createAuthService(env);
  return Promise.all(
    Array.from({ length: count }, () => authService.refreshToken(refreshToken, { ipAddress: '10.0.0.1', userAgent: 'race-test' }))
  );
}

/**
 * Read the rotation lineage of a token pair *by identity*, never by row order.
 *
 * The predecessor is the row whose `jti` is the one that was issued to the
 * caller, and the successor is the row named by that row's `replaced_by`. The
 * order the rows come back in is not consulted, and cannot be: `created_at` is
 * written with `CURRENT_TIMESTAMP`, which has one-second resolution, so a token
 * that is issued and rotated inside the same second leaves two rows with an
 * identical `created_at` and `ORDER BY created_at` decides nothing.
 *
 * Reading `lineage[0]` as the predecessor therefore worked only while the two
 * writes happened to straddle a second boundary. When they did not, the query
 * returned the successor first and the assertion "row 0 is revoked" failed with
 * 0 - a failure in the *reading* of the lineage, not in the rotation. That is
 * why the lookup is by jti and by the `replaced_by` link, and why the tie case
 * is exercised deliberately below instead of being left to timing.
 *
 * @param {Object} d1 - The D1 instance
 * @param {number} userId - The user whose lineage is wanted
 * @param {string} predecessorJti - jti of the token that was issued first
 * @returns {Promise<{rows: Array, predecessor: Object|null, successor: Object|null}>}
 *   Every row, plus the two rows identified by lineage. `predecessor`/`successor`
 *   are null when the lineage cannot be resolved, and the diagnostic string then
 *   names what is in the table.
 */
async function readLineageByIdentity(d1, userId, predecessorJti) {
  const rows = (await d1.db
    .prepare(
      `SELECT jti, revoked, consumed_at, replaced_by, rotation_grace_until, created_at
         FROM refresh_tokens
        WHERE user_id = ?`
    )
    .bind(userId)
    .all()).results;

  const predecessor = rows.find((row) => row.jti === predecessorJti) || null;
  const successor = predecessor?.replaced_by
    ? rows.find((row) => row.jti === predecessor.replaced_by) || null
    : null;

  return { rows, predecessor, successor, diagnostic: describeLineage(rows, predecessorJti) };
}

/**
 * A printable description of the lineage rows for a failure message.
 *
 * Deliberately narrow: jti, timestamp and rotation markers only. A token, a
 * hash or a secret in a test diagnostic is a secret in a log file, and these
 * diagnostics are exactly the kind of thing that ends up pasted into a report.
 * @param {Array} rows - Lineage rows
 * @param {string} predecessorJti - jti of the token that was issued first
 * @returns {string} One line per row
 */
function describeLineage(rows, predecessorJti) {
  if (rows.length === 0) {
    return 'no refresh_tokens rows for this user';
  }
  return rows.map((row, index) => (
    `[${index}] jti=${row.jti === predecessorJti ? 'ORIGINAL' : 'other'}`
    + ` created_at=${row.created_at} revoked=${row.revoked}`
    + ` consumed_at=${row.consumed_at ?? 'null'}`
    + ` replaced_by=${row.replaced_by ?? 'null'}`
  )).join(' ; ');
}

test('T6: twenty concurrent refreshes mint exactly one successor', async () => {
  const d1 = await d1Promise;
  const user = await seedUser();
  const pair = await issueFor(user);

  const results = await rotationAttempts(user, pair.refreshToken, 20);

  const winners = results.filter((r) => r.success);
  const conflicts = results.filter((r) => !r.success && r.error === 'REFRESH_ALREADY_ROTATED');

  assert.equal(winners.length, 1, 'exactly one caller may own the successor');
  assert.equal(conflicts.length, 19, 'the rest must be told to retry, not logged out');

  // A loser must never leave a usable token behind, in the response or in the
  // table. Both are checked because the second one is the one that leaks.
  for (const loser of results.filter((r) => !r.success)) {
    assert.equal(loser.data, undefined, 'a loser gets no token material');
    assert.ok(loser.statusCode === 409 || loser.statusCode === 401);
  }

  const live = (await d1.db
    .prepare('SELECT COUNT(*) AS c FROM refresh_tokens WHERE user_id = ? AND revoked = 0')
    .bind(user.id)
    .first()).c;
  assert.equal(live, 1, 'the table must hold one live refresh token, not twenty');

  // Identity, not position. `describeLineage` is the diagnostic: it names the
  // markers and the timestamps, so a failure says which link is missing instead
  // of only reporting a boolean.
  const { rows, predecessor, successor, diagnostic } = await readLineageByIdentity(
    d1,
    user.id,
    pair.refreshTokenPayload.jti
  );
  assert.equal(rows.length, 2, `the original plus one successor, and no orphans -- ${diagnostic}`);
  assert.ok(predecessor, `the token that was issued must still be in the table -- ${diagnostic}`);
  assert.equal(
    predecessor.jti,
    pair.refreshTokenPayload.jti,
    `the predecessor is the row for the jti that was issued -- ${diagnostic}`
  );
  assert.equal(predecessor.revoked, 1, `the predecessor must be revoked -- ${diagnostic}`);
  assert.ok(predecessor.consumed_at, `the predecessor is marked consumed, not merely revoked -- ${diagnostic}`);
  assert.ok(successor, `replaced_by must name a row that exists -- ${diagnostic}`);
  assert.equal(
    successor.jti,
    predecessor.replaced_by,
    'the predecessor points at the successor it was replaced by'
  );
  assert.equal(successor.revoked, 0, `the successor is the live one -- ${diagnostic}`);

  // The winner's successor is itself a working token, and rotating it moves the
  // chain on rather than breaking it.
  const second = await createAuthService(env).refreshToken(winners[0].data.refresh_token, { ipAddress: '10.0.0.1' });
  assert.equal(second.success, true, 'the successor must remain usable');
  assert.notEqual(second.data.refresh_token, winners[0].data.refresh_token);
});

test('T6: two lineage rows written in the same second are still ordered by identity', async () => {
  const d1 = await d1Promise;
  const user = await seedUser();
  const pair = await issueFor(user);

  const results = await rotationAttempts(user, pair.refreshToken, 20);
  const winners = results.filter((r) => r.success);
  assert.equal(winners.length, 1, 'precondition: one winner');

  // The tie the previous version of this suite could not survive. `created_at`
  // is written with `CURRENT_TIMESTAMP` on both the issue and the rotation, and
  // that function has one-second resolution, so a rotation that completes inside
  // the second the token was issued in leaves the two rows indistinguishable by
  // `created_at`. It is pinned here rather than left to timing: waiting for the
  // clock to cooperate would make this test pass on a slow machine and fail on a
  // fast one for a reason that has nothing to do with rotation.
  await d1.db
    .prepare('UPDATE refresh_tokens SET created_at = \'2020-01-01 00:00:00\' WHERE user_id = ?')
    .bind(user.id)
    .run();

  const tied = (await d1.db
    .prepare('SELECT created_at FROM refresh_tokens WHERE user_id = ?')
    .bind(user.id)
    .all()).results;
  assert.equal(
    new Set(tied.map((row) => row.created_at)).size,
    1,
    'precondition: every row now shares one created_at, so ORDER BY created_at cannot rank them'
  );

  // Reading by timestamp order is still possible - it just says nothing about
  // which row is which, and this is the read the old assertions used. It is kept
  // as an explicit demonstration rather than left implicit, because its result
  // depends on the query plan and can change between SQLite builds. Nothing here
  // asserts on it: there is no correct answer to assert.
  const byTimestamp = (await d1.db
    .prepare('SELECT jti, revoked, consumed_at, replaced_by FROM refresh_tokens WHERE user_id = ? ORDER BY created_at')
    .bind(user.id)
    .all()).results;
  assert.equal(byTimestamp.length, 2, 'precondition: the same two rows come back either way');
  assert.notEqual(
    byTimestamp[0].jti,
    byTimestamp[1].jti,
    'precondition: the two rows are distinct, only their order is undefined'
  );
  const positional = (await d1.db
    .prepare('SELECT COUNT(*) AS c FROM refresh_tokens WHERE user_id = ? AND revoked = 0')
    .bind(user.id)
    .first()).c;
  assert.equal(positional, 1, 'the live row is identifiable by its state, which does not depend on order');

  // What matters is the lineage, and it is decided by the jti and the link.
  const { rows, predecessor, successor, diagnostic } = await readLineageByIdentity(
    d1,
    user.id,
    pair.refreshTokenPayload.jti
  );
  assert.equal(rows.length, 2, `-- ${diagnostic}`);
  assert.equal(predecessor.revoked, 1, `a tie must not change which row is the predecessor -- ${diagnostic}`);
  assert.ok(predecessor.consumed_at, `a tie must not hide the consume marker -- ${diagnostic}`);
  assert.ok(successor, `replaced_by must still resolve with equal timestamps -- ${diagnostic}`);
  assert.equal(successor.revoked, 0, `the successor is still the live row -- ${diagnostic}`);

  // And the live successor is still usable, so the tie was only ever a reading
  // problem and not a corrupted chain.
  const second = await createAuthService(env).refreshToken(winners[0].data.refresh_token, { ipAddress: '10.0.0.1' });
  assert.equal(second.success, true, 'a tied lineage still rotates to a working successor');
});


test('T6: a race never takes the whole family down with it', async () => {
  const user = await seedUser();
  const pair = await issueFor(user);

  const results = await rotationAttempts(user, pair.refreshToken, 5);
  const conflicts = results.filter((r) => r.error === 'REFRESH_ALREADY_ROTATED');

  assert.equal(conflicts.length, 4);
  for (const conflict of conflicts) {
    assert.equal(conflict.statusCode, 409, 'a normal race is a conflict, not a security event');
  }

  // The winner's session must still be alive: losing a race is not grounds for
  // revoking a session the user is actively using.
  const rows = (await (await d1Promise).db
    .prepare('SELECT COUNT(*) AS c FROM refresh_tokens WHERE user_id = ? AND revoked = 0')
    .bind(user.id)
    .first()).c;
  assert.equal(rows, 1);
});

test('T6: replaying a consumed token after the grace window kills the family', async () => {
  const d1 = await d1Promise;
  const user = await seedUser();
  const pair = await issueFor(user);

  const first = await createAuthService(env).refreshToken(pair.refreshToken, { ipAddress: '10.0.0.1' });
  assert.equal(first.success, true);
  const successorToken = first.data.refresh_token;

  // Move the window into the past to stand in for waiting it out.
  await d1.db
    .prepare(
      `UPDATE refresh_tokens
          SET rotation_grace_until = datetime('now', '-1 second')
        WHERE user_id = ?`
    )
    .bind(user.id)
    .run();

  const replay = await createAuthService(env).refreshToken(pair.refreshToken, { ipAddress: '10.0.0.1' });
  assert.equal(replay.success, false);
  assert.equal(replay.statusCode, 401, 'past the window this is a replay, not a race');
  assert.equal(replay.error, 'REFRESH_TOKEN_REUSE');

  const live = (await d1.db
    .prepare('SELECT COUNT(*) AS c FROM refresh_tokens WHERE user_id = ? AND revoked = 0')
    .bind(user.id)
    .first()).c;
  assert.equal(live, 0, 'a genuine reuse revokes the successor too, so the thief and the victim both stop');

  const afterRevocation = await createAuthService(env).refreshToken(successorToken, { ipAddress: '10.0.0.1' });
  assert.equal(afterRevocation.success, false, 'the successor is collateral and must not survive');
});

test('T6: a refresh token older than the row cannot mint a new pair', async () => {
  const d1 = await d1Promise;
  const user = await seedUser();
  const pair = await issueFor(user);

  await d1.db.prepare('UPDATE users SET auth_version = 2 WHERE id = ?').bind(user.id).run();

  const result = await createAuthService(env).refreshToken(pair.refreshToken, { ipAddress: '10.0.0.1' });

  assert.equal(result.success, false);
  assert.equal(result.statusCode, 401);
  assert.equal(result.error, 'SESSION_REVOKED', 'the version bump is what stops it, before any revocation row is read');
});

test('T6: logout-all ends the other devices on their next request', async () => {
  const d1 = await d1Promise;
  const user = await seedUser();
  const laptop = await issueFor(user);
  const phone = await issueFor(user);
  const before = await d1.db.prepare('SELECT auth_version FROM users WHERE id = ?').bind(user.id).first();
  assert.equal(before.auth_version, 1);

  const result = await createAuthService(env).logoutAll(
    user.id,
    laptop.accessTokenPayload,
    { ipAddress: '10.0.0.1' },
    laptop.refreshToken
  );
  assert.equal(result.success, true);
  assert.equal(result.authVersion, 2, 'logout-all advances the version so live access tokens die');

  const after = await d1.db.prepare('SELECT auth_version FROM users WHERE id = ?').bind(user.id).first();
  assert.equal(after.auth_version, 2);

  const live = (await d1.db
    .prepare('SELECT COUNT(*) AS c FROM refresh_tokens WHERE user_id = ? AND revoked = 0')
    .bind(user.id)
    .first()).c;
  assert.equal(live, 0, 'refresh tokens go too, or a device could just refresh its way back in');

  for (const [name, pair] of [['laptop', laptop], ['phone', phone]]) {
    const refreshed = await createAuthService(env).refreshToken(pair.refreshToken, { ipAddress: '10.0.0.1' });
    assert.equal(refreshed.success, false, `${name} cannot come back with an old refresh token`);
    assert.equal(refreshed.statusCode, 401);
  }
});

test('T6: changing the password ends every session, the caller included', async () => {
  const d1 = await d1Promise;
  const user = await seedUser();
  await issueFor(user);
  await issueFor(user);

  const userService = createUserService(env);
  const result = await userService.changePassword(user.id, 'not-a-real-hash', 'a-brand-new-password-9');

  // The seeded row holds a placeholder hash, so the honest answer is that the
  // current password did not verify. That still has to be a refusal.
  assert.equal(result.success, false, 'a wrong current password changes nothing');

  const unchanged = await d1.db.prepare('SELECT auth_version FROM users WHERE id = ?').bind(user.id).first();
  assert.equal(unchanged.auth_version, 1, 'a refused change must not bump the version');

  const realUser = await seedUser({ email: `pw-${Math.random().toString(16).slice(2)}@example.test` });
  const bcrypt = (await import('bcryptjs')).default;
  const password = 'the-original-password-42';
  await d1.db
    .prepare('UPDATE users SET password = ? WHERE id = ?')
    .bind(await bcrypt.hash(password, 4), realUser.id)
    .run();
  const session = await issueFor(realUser);

  const changed = await userService.changePassword(realUser.id, password, 'the-new-password-43');
  assert.equal(changed.success, true);
  assert.equal(changed.reauthRequired, true, 'the caller is told plainly that its session is over');

  const bumped = await d1.db.prepare('SELECT auth_version FROM users WHERE id = ?').bind(realUser.id).first();
  assert.equal(bumped.auth_version, 2);

  const live = (await d1.db
    .prepare('SELECT COUNT(*) AS c FROM refresh_tokens WHERE user_id = ? AND revoked = 0')
    .bind(realUser.id)
    .first()).c;
  assert.equal(live, 0);

  const reused = await createAuthService(env).refreshToken(session.refreshToken, { ipAddress: '10.0.0.1' });
  assert.equal(reused.success, false, 'the old session cannot refresh itself back to life');
});

test('T6: deactivating a user kills the live session and the refresh path', async () => {
  const d1 = await d1Promise;
  const user = await seedUser();
  const pair = await issueFor(user);

  await d1.db
    .prepare('UPDATE users SET status = ? WHERE id = ?')
    .bind('suspended', user.id)
    .run();

  const refreshed = await createAuthService(env).refreshToken(pair.refreshToken, { ipAddress: '10.0.0.1' });
  assert.equal(refreshed.success, false, 'a suspended user cannot refresh');
  assert.equal([401, 403].includes(refreshed.statusCode), true);
});

test('T6: deleting a user leaves no session that still authenticates', async () => {
  const user = await seedUser();
  const pair = await issueFor(user);

  const deleted = await createUserService(env).delete(user.id);
  assert.equal(deleted, true, 'deleting a user with a live session must not be refused by a foreign key');

  const refreshed = await createAuthService(env).refreshToken(pair.refreshToken, { ipAddress: '10.0.0.1' });
  assert.equal(refreshed.success, false, 'a deleted user is not a user');

  const state = await createUserService(env).findSecurityState(user.id);
  assert.equal(state, null, 'the authoritative read reports the absence rather than throwing');
});

test('T6: retrying inside the window is a conflict, not a compromise', async () => {
  const d1 = await d1Promise;
  const user = await seedUser();
  const pair = await issueFor(user);

  const first = await createAuthService(env).refreshToken(pair.refreshToken, { ipAddress: '10.0.0.1' });
  assert.equal(first.success, true);

  // The client retried after a timeout, so the row is already consumed and the
  // request arrives through validation, not through the rotation race.
  const retry = await createAuthService(env).refreshToken(pair.refreshToken, { ipAddress: '10.0.0.1' });
  assert.equal(retry.success, false);
  assert.equal(retry.error, 'REFRESH_ALREADY_ROTATED', 'a retry inside the window is a conflict');
  assert.equal(retry.statusCode, 409);

  const live = (await d1.db
    .prepare('SELECT COUNT(*) AS c FROM refresh_tokens WHERE user_id = ? AND revoked = 0')
    .bind(user.id)
    .first()).c;
  assert.equal(live, 1, 'the winner keeps its session; a retry must not punish it');
});

test('T6: a logged-out token is dead at once, window or not', async () => {
  const user = await seedUser();
  const pair = await issueFor(user);

  await createAuthService(env).logoutAll(user.id, pair.accessTokenPayload, { ipAddress: '10.0.0.1' }, pair.refreshToken);

  const replay = await createAuthService(env).refreshToken(pair.refreshToken, { ipAddress: '10.0.0.1' });
  assert.equal(replay.success, false);
  assert.notEqual(replay.statusCode, 409, 'a logout is not a race, and must not invite a retry');
  assert.equal(replay.statusCode, 401);
});

test('T6: a revocation failure rolls back the password and preserves the previous session state', async () => {
  const d1 = await d1Promise;
  const user = await seedUser();
  const bcrypt = (await import('bcryptjs')).default;
  const password = 'atomic-password-before-42';
  const hash = await bcrypt.hash(password, 4);
  await d1.db.prepare('UPDATE users SET password = ? WHERE id = ?').bind(hash, user.id).run();
  await issueFor(user);
  const before = await d1.db.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first();
  const tokensBefore = (await d1.db.prepare('SELECT * FROM refresh_tokens WHERE user_id = ? ORDER BY id').bind(user.id).all()).results;
  await d1.db.prepare(`CREATE TRIGGER password_revoke_fault BEFORE UPDATE ON refresh_tokens
    WHEN OLD.user_id = ${user.id} BEGIN SELECT RAISE(ABORT, 'test revocation fault'); END`).run();
  try {
    const result = await createUserService(env).changePassword(user.id, password, 'atomic-password-after-43');
    assert.equal(result.success, false);
    assert.deepEqual(await d1.db.prepare('SELECT * FROM users WHERE id = ?').bind(user.id).first(), before,
      'a failed password change must not install a new hash while old sessions remain live');
    assert.deepEqual((await d1.db.prepare('SELECT * FROM refresh_tokens WHERE user_id = ? ORDER BY id').bind(user.id).all()).results, tokensBefore);
  } finally {
    await d1.db.prepare('DROP TRIGGER password_revoke_fault').run();
  }
});

test('T6: with the window off, the loser is treated as a replay even in the same millisecond', async (t) => {
  const d1 = await d1Promise;
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
  const tightEnv = { ...env, REFRESH_TOKEN_REUSE_GRACE_SECONDS: '0' };
  const user = await seedUser();
  const pair = await createTokenService(tightEnv).issueTokenPair(user, {}, { skipQuota: true });

  const first = await createTokenService(tightEnv).rotateRefreshToken({
    record: await d1.db.prepare('SELECT * FROM refresh_tokens WHERE jti = ?').bind(pair.refreshTokenPayload.jti).first(),
    user,
    metadata: {}
  });
  assert.equal(first.rotated, true);

  // No grace means the second caller is indistinguishable from a thief, so the
  // conservative answer wins: the family goes down rather than letting a
  // stolen token keep refreshing.
  const replay = await createTokenService(tightEnv).rotateRefreshToken({
    record: await d1.db.prepare('SELECT * FROM refresh_tokens WHERE jti = ?').bind(pair.refreshTokenPayload.jti).first(),
    user,
    metadata: {}
  });
  assert.equal(replay.rotated, false);

  const { race } = await createTokenService(tightEnv).classifyRotationLoss(
    await d1.db.prepare('SELECT * FROM refresh_tokens WHERE jti = ?').bind(pair.refreshTokenPayload.jti).first()
  );
  assert.equal(race, false, 'a zero window leaves no grace to claim');
});

test('T6: deleting a user keeps the audit trail', async () => {
  const d1 = await d1Promise;
  const user = await seedUser();
  const pair = await issueFor(user);

  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_id, actor_role, actor_email, timestamp)
       VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)`
    )
    .bind('login', user.id, 'user', user.email)
    .run();

  assert.equal(await createUserService(env).delete(user.id), true);

  const remaining = (await d1.db
    .prepare('SELECT action, actor_id, actor_role, actor_email FROM audit_logs WHERE action = ? AND actor_email = ?')
    .bind('login', user.email)
    .all()).results;
  assert.equal(remaining.length, 1, 'the record of what happened outlives the account');
  assert.equal(remaining[0].actor_id, null, 'only the dangling reference is dropped');
  assert.equal(remaining[0].actor_role, 'user', 'the trail still says who did it');

  const refreshed = await createAuthService(env).refreshToken(pair.refreshToken, { ipAddress: '10.0.0.1' });
  assert.equal(refreshed.success, false, 'and the session is gone regardless');
});

test('T6: concurrent issuance enforces the configured active refresh quota with tied timestamps', async (t) => {
  const d1 = await d1Promise;
  const user = await seedUser();
  t.mock.timers.enable({ apis: ['Date'], now: Date.now() });
  const quotaEnv = { ...env, MAX_REFRESH_TOKENS_PER_USER: '2' };
  const issued = await Promise.all(Array.from({ length: 20 }, () => createTokenService(quotaEnv).issueTokenPair(user)));
  const { results } = await d1.db.prepare('SELECT jti, revoked, revocation_reason FROM refresh_tokens WHERE user_id = ?').bind(user.id).all();
  assert.equal(issued.length, 20);
  assert.equal(results.length, 20);
  assert.equal(results.filter(row => row.revoked === 0).length, 2);
  assert.ok(results.filter(row => row.revoked === 1).every(row => row.revocation_reason === 'QUOTA_EXCEEDED'));
});

for (const policy of [
  { mode: 'enforce', deadline: '', allowed: false },
  { mode: 'observe', deadline: '2020-01-01T00:00:00.000Z', allowed: false },
  { mode: 'observe', deadline: '', allowed: true }
]) {
  test(`T6: versionless refresh follows ${policy.mode} policy with deadline ${policy.deadline || 'unset'}`, async () => {
    const d1 = await d1Promise;
    const user = await seedUser();
    const pair = await issueFor(user);
    const { signToken } = await import('../../src/utils/jwt.js');
    const { TokenService } = await import('../../src/services/tokenService.js');
    const payload = JSON.parse(Buffer.from(pair.refreshToken.split('.')[1], 'base64url').toString('utf8'));
    delete payload.auth_version;
    const legacy = await signToken(payload, JWT_SECRET);
    await d1.db.prepare('UPDATE refresh_tokens SET token_hash = ? WHERE jti = ?')
      .bind(await TokenService.hashToken(legacy), payload.jti).run();
    const before = (await d1.db.prepare('SELECT * FROM refresh_tokens WHERE user_id = ? ORDER BY id').bind(user.id).all()).results;
    const policyEnv = { ...env, AUTH_VERSION_ENFORCEMENT: policy.mode, AUTH_VERSION_ENFORCEMENT_EXPIRES_AT: policy.deadline };
    const result = await createAuthService(policyEnv).refreshToken(legacy, { ipAddress: '10.0.0.1' });
    assert.equal(result.success, policy.allowed);
    if (!policy.allowed) {
      assert.equal(result.statusCode, 401);
      assert.equal(result.error, 'TOKEN_MISSING_AUTH_VERSION');
      assert.deepEqual((await d1.db.prepare('SELECT * FROM refresh_tokens WHERE user_id = ? ORDER BY id').bind(user.id).all()).results, before);
    }
  });
}
