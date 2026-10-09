import { test } from 'node:test';
import assert from 'node:assert/strict';

import { createTestEnv } from './helpers/local-env.mjs';
import { ServiceUnavailableError } from '../../src/utils/serviceErrors.js';
import { DatabaseService } from '../../src/services/databaseService.js';
import { TokenBlacklistService } from '../../src/services/tokenBlacklistService.js';

function createFailingDatabase({ failWrites = true } = {}) {
  const calls = { select: 0, run: 0 };
  return {
    calls,
    prepare(sql) {
      return {
        sql,
        bind(..._params) {
          return this;
        },
        async first() {
          calls.select += 1;
          throw new Error('D1_ERROR: connection reset');
        },
        async all() {
          calls.select += 1;
          throw new Error('D1_ERROR: connection reset');
        },
        async run() {
          calls.run += 1;
          if (failWrites) {
            throw new Error('D1_ERROR: write rejected');
          }
          return { success: true, meta: { changes: 0, last_row_id: 0 } };
        }
      };
    },
    batch: async () => {
      throw new Error('D1_ERROR: batch rejected');
    }
  };
}

function createStubDatabase(resultFactory) {
  return {
    prepare() {
      return {
        bind() { return this; },
        async first() { return resultFactory.first(); },
        async all() { return { results: resultFactory.all() }; },
        async run() { return { success: true, meta: resultFactory.run() }; }
      };
    }
  };
}

test('B03: a failing SELECT raises DB_UNAVAILABLE instead of returning null/[]', async () => {
  const env = createTestEnv({ DB: createFailingDatabase() });
  const db = new DatabaseService(env);

  await assert.rejects(
    () => db.select('SELECT 1', [], true),
    (error) => {
      assert.ok(error instanceof ServiceUnavailableError, `expected ServiceUnavailableError, got ${error.name}`);
      assert.equal(error.code, 'DB_UNAVAILABLE');
      assert.equal(error.statusCode, 503);
      return true;
    }
  );

  await assert.rejects(
    () => db.select('SELECT 1 FROM audit_logs'),
    (error) => error.code === 'DB_UNAVAILABLE'
  );
});

test('B03: a read that genuinely has no row still returns null', async () => {
  const env = createTestEnv({ DB: createStubDatabase({
    first: () => null,
    all: () => [],
    run: () => ({ changes: 0 })
  }) });
  const db = new DatabaseService(env);

  assert.equal(await db.select('SELECT 1 FROM users WHERE id = ?', [404], true), null);
  assert.deepEqual(await db.select('SELECT 1 FROM users'), []);
});

test('B03: a write that cannot be confirmed raises DB_UNAVAILABLE', async () => {
  const env = createTestEnv({ DB: createFailingDatabase() });
  const db = new DatabaseService(env);

  for (const call of [
    () => db.insert('INSERT INTO audit_logs (action) VALUES (?)', ['x']),
    () => db.update('UPDATE users SET role = ? WHERE id = ?', ['admin', 1]),
    () => db.delete('DELETE FROM users WHERE id = ?', [1]),
    () => db.upsert('INSERT INTO kv (k, v) VALUES (?, ?) ON CONFLICT(k) DO UPDATE SET v = excluded.v', ['a', 'b'])
  ]) {
    await assert.rejects(call, (error) => error.code === 'DB_UNAVAILABLE');
  }
});

test('B03: blacklist lookup failure is fail-closed, not "not blacklisted"', async () => {
  const env = createTestEnv({ DB: createFailingDatabase() });
  const service = new TokenBlacklistService(env);

  await assert.rejects(
    () => service.isBlacklisted('jti-marker'),
    (error) => {
      assert.equal(error.code, 'DB_UNAVAILABLE');
      return true;
    }
  );
});

test('B03: a missing blacklist row is not an error', async () => {
  const env = createTestEnv({ DB: createStubDatabase({
    first: () => null,
    all: () => [],
    run: () => ({ changes: 0 })
  }) });
  const service = new TokenBlacklistService(env);
  assert.equal(await service.isBlacklisted('jti-marker'), false);
});

test('B03: an existing blacklist row blocks the token', async () => {
  const env = createTestEnv({ DB: createStubDatabase({
    first: () => ({ jti: 'jti-marker' }),
    all: () => [],
    run: () => ({ changes: 0 })
  }) });
  const service = new TokenBlacklistService(env);
  assert.equal(await service.isBlacklisted('jti-marker'), true);
});

test('B03: revoke only reports success when the write is confirmed', async () => {
  const { TokenService } = await import('../../src/services/tokenService.js');

  const confirmedEnv = createTestEnv({ DB: createStubDatabase({
    first: () => null,
    all: () => [],
    run: () => ({ changes: 1 })
  }) });
  const confirmed = new TokenService(confirmedEnv);
  const okResult = await confirmed.revokeRefreshToken('jti-marker');
  assert.equal(okResult.revoked, true, 'confirmed write must report revoked');

  const ambiguousEnv = createTestEnv({ DB: createStubDatabase({
    first: () => null,
    all: () => [],
    run: () => ({ changes: 0 })
  }) });
  const ambiguous = new TokenService(ambiguousEnv);
  const ambiguousResult = await ambiguous.revokeRefreshToken('jti-marker');
  assert.equal(ambiguousResult.revoked, false, 'zero affected rows must not claim success');
  assert.equal(ambiguousResult.reason, 'NOT_REVOKED');

  const failingEnv = createTestEnv({ DB: createFailingDatabase() });
  const failing = new TokenService(failingEnv);
  await assert.rejects(
    () => failing.revokeRefreshToken('jti-marker'),
    (error) => error.code === 'DB_UNAVAILABLE'
  );
});

test('B03: transient read errors are retried, writes are not blindly retried', async () => {
  let attempts = 0;
  const flaky = {
    prepare() {
      return {
        bind() { return this; },
        async first() {
          attempts += 1;
          if (attempts < 3) {
            throw new Error('D1_ERROR: transient');
          }
          return { jti: 'jti-marker' };
        },
        async all() { return { results: [] }; },
        async run() { return { success: true, meta: { changes: 1 } }; }
      };
    }
  };
  const env = createTestEnv({ DB: flaky });
  const service = new TokenBlacklistService(env);
  assert.equal(await service.isBlacklisted('jti-marker'), true);
  assert.equal(attempts, 3, 'read must be retried up to the transient budget');

  let writeAttempts = 0;
  const writeFails = {
    prepare() {
      return {
        bind() { return this; },
        async first() { return null; },
        async all() { return { results: [] }; },
        async run() {
          writeAttempts += 1;
          throw new Error('D1_ERROR: ambiguous write');
        }
      };
    }
  };
  const writeEnv = createTestEnv({ DB: writeFails });
  const writeDb = new DatabaseService(writeEnv);
  await assert.rejects(() => writeDb.update('UPDATE users SET role = ? WHERE id = ?', ['admin', 1]));
  assert.equal(writeAttempts, 1, 'an ambiguous write must not be replayed blindly');
});
