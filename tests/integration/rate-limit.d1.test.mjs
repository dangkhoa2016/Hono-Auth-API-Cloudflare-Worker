/**
 * T9 / BR8-04 - the rate limiter must be an admission, not a hint.
 *
 * Before this suite the limiter was three operations that could be interleaved:
 * `checkRateLimit()` read a counter, the route decided, and
 * `recordFailedAttempt()` wrote the counter later. Two requests could both read
 * `attempts = limit - 1` and both proceed. A D1 error returned `allowed: true`,
 * and the middleware's catch block called `next()`, so a storage outage looked
 * exactly like a clean request. Nothing here asserted any of that, because the
 * in-process D1 stubs only record which SQL string was built.
 *
 * Every scenario below runs against real D1 (workerd/SQLite) with the real
 * migrations, and asserts the properties that actually matter:
 *   - admission is decided by the statement that writes the counter,
 *   - a denied admission leaves the counter row byte-identical,
 *   - a broken store is a 503, never a free pass,
 *   - KV is not in the decision path, so a stale KV entry cannot over-admit,
 *   - one login request consumes one IP unit, not two,
 *   - a successful login does not hand an attacker a fresh IP budget.
 *
 * Boundary cases use offsets measured in minutes against an hour-long window, so
 * a slow or fast machine cannot make them flaky. There is no `sleep()` here:
 * a test that passes because it waited is not a boundary test.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import bcrypt from 'bcryptjs';

import { Hono } from 'hono';
import { startD1 } from '../regression/helpers/d1-local.mjs';
import { createTestEnv, initTestI18n, FAKE_SECRETS } from '../regression/helpers/local-env.mjs';
import { RateLimitService } from '../../src/services/rateLimitService.js';

/** Long enough that a slow machine cannot cross it mid-test. */
const WINDOW_SECONDS = 3600;
/** Slack on each side of the window edge, in seconds. */
const EDGE_SLACK_SECONDS = 600;
const ISO = (unixSeconds) => new Date(unixSeconds * 1000).toISOString();

let d1Promise;
let env;

/**
 * Fresh service bound to the real D1 instance.
 * @returns {RateLimitService} Service under test
 */
function service(dbBinding = env.DB) {
  return new RateLimitService(createTestEnv({ DB: dbBinding }));
}

/**
 * @returns {Promise<Array<Object>>} Counter rows, for assertions on persisted state
 */
async function counterRows(context, identifier, db = env.DB) {
  const result = await db
    .prepare('SELECT context, identifier, attempts_count, first_attempt_at, last_attempt_at FROM rate_limit_counters WHERE context = ? AND identifier = ?')
    .bind(context, identifier)
    .all();
  return result.results;
}

test.before(async () => {
  const d1 = await startD1();
  d1Promise = Promise.resolve(d1);
  await initTestI18n();
  env = createTestEnv({ DB: d1.db });
});

test.after(async () => {
  const d1 = await d1Promise;
  if (d1) {
    await d1.dispose();
  }
});

test.beforeEach(async () => {
  await env.DB.prepare('DELETE FROM rate_limit_counters').run();
});

test('T9: 100 parallel admissions on one key and window admit exactly the limit', async () => {
  const rateLimit = service();
  const limit = 10;
  const options = { context: 'auth:ip', limit, windowSeconds: WINDOW_SECONDS };

  const outcomes = await Promise.all(Array.from({ length: 100 }, () => rateLimit.admitRequest('203.0.113.7', options)));

  const allowed = outcomes.filter((outcome) => outcome.allowed);
  const denied = outcomes.filter((outcome) => !outcome.allowed);

  assert.equal(allowed.length, limit, 'a read-then-write limiter would admit every caller that read the same count');
  assert.equal(denied.length, 100 - limit);
  assert.ok(denied.every((outcome) => outcome.retryAfterSeconds > 0), 'a denial has to say when to come back');

  // The persisted counter is the number of admissions, not the number of writes
  // that happened to land: it must never exceed the limit, and it must be
  // exactly the limit because every request was accounted for.
  const [row] = await counterRows('auth:ip', '203.0.113.7');
  assert.equal(row.attempts_count, limit);

  // The counter each admission reports has to be its own. Two requests reporting
  // the same number means the result was read back outside the admission.
  const reported = allowed.map((outcome) => outcome.attempts).sort((x, y) => x - y);
  assert.deepEqual(reported, Array.from({ length: limit }, (_, index) => index + 1));
});

test('T9: a denied admission leaves the counter row untouched, so a denial cannot extend the window', async () => {
  const rateLimit = service();
  const options = { context: 'auth:ip', limit: 1, windowSeconds: WINDOW_SECONDS };

  assert.equal((await rateLimit.admitRequest('198.51.100.4', options)).allowed, true);
  const before = (await counterRows('auth:ip', '198.51.100.4'))[0];

  for (let i = 0; i < 5; i += 1) {
    const denied = await rateLimit.admitRequest('198.51.100.4', options);
    assert.equal(denied.allowed, false, `request ${i + 1} of the denial run must not be admitted`);
  }

  const after = (await counterRows('auth:ip', '198.51.100.4'))[0];
  assert.deepEqual(after, before, 'a denial that moved last_attempt_at would hold the window open forever under load');
});

test('T9: keys and contexts are independent budgets', async () => {
  const rateLimit = service();
  const base = { context: 'auth:ip', limit: 2, windowSeconds: WINDOW_SECONDS };

  assert.equal((await rateLimit.admitRequest('192.0.2.1', base)).allowed, true);
  assert.equal((await rateLimit.admitRequest('192.0.2.1', base)).allowed, true);
  assert.equal((await rateLimit.admitRequest('192.0.2.1', base)).allowed, false, 'the same key is exhausted');

  assert.equal(
    (await rateLimit.admitRequest('192.0.2.2', base)).allowed,
    true,
    'a different identifier must not inherit another identifier’s budget'
  );
  assert.equal(
    (await rateLimit.admitRequest('192.0.2.1', { ...base, context: 'auth:refresh:ip' })).allowed,
    true,
    'the same identifier under a different context is a different budget'
  );
  assert.equal(
    (await rateLimit.admitRequest('192.0.2.1', { ...base, limit: 1 })).allowed,
    false,
    'the tighter policy on a shared key has to win, not the more permissive one'
  );
  assert.equal(
    (await rateLimit.admitRequest('192.0.2.1', { ...base, limit: 9 })).allowed,
    true,
    'a looser limit is a different policy and the counter it sees is already partly spent'
  );
});

test('T9: the window edge is honoured on both sides without a sleep', async () => {
  const rateLimit = service();
  const now = Math.floor(Date.now() / 1000);
  const options = { context: 'auth:ip', limit: 1, windowSeconds: WINDOW_SECONDS };

  await env.DB
    .prepare(`INSERT INTO rate_limit_counters
                (context, identifier, attempts_count, first_attempt_at, last_attempt_at, created_at, updated_at)
              VALUES (?, ?, 1, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind('auth:ip', '203.0.113.30', ISO(now - WINDOW_SECONDS + EDGE_SLACK_SECONDS), ISO(now))
    .run();

  assert.equal(
    (await rateLimit.admitRequest('203.0.113.30', options)).allowed,
    false,
    'a window with 10 minutes left must still deny'
  );

  await env.DB.prepare('DELETE FROM rate_limit_counters').run();
  await env.DB
    .prepare(`INSERT INTO rate_limit_counters
                (context, identifier, attempts_count, first_attempt_at, last_attempt_at, created_at, updated_at)
              VALUES (?, ?, 1, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind('auth:ip', '203.0.113.31', ISO(now - WINDOW_SECONDS - EDGE_SLACK_SECONDS), ISO(now))
    .run();

  const afterExpiry = await rateLimit.admitRequest('203.0.113.31', options);
  assert.equal(afterExpiry.allowed, true, 'a window that ended 10 minutes ago must start over');
  assert.equal(afterExpiry.attempts, 1, 'the new window starts from this request, not from the old total');
});

test('T9: a counter row written by an older migration shape is still readable', async () => {
  const rateLimit = service();
  const now = Math.floor(Date.now() / 1000);
  // `CURRENT_TIMESTAMP` shape, i.e. what a seeded or upgraded database holds,
  // as opposed to the ISO strings the current code writes.
  await env.DB
    .prepare(`INSERT INTO rate_limit_counters
                (context, identifier, attempts_count, first_attempt_at, last_attempt_at, created_at, updated_at)
              VALUES (?, ?, 1, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind('auth:ip', '203.0.113.40', '2020-01-01 00:00:00', '2020-01-01 00:00:00')
    .run();

  const outcome = await rateLimit.admitRequest('203.0.113.40', {
    context: 'auth:ip',
    limit: 5,
    windowSeconds: WINDOW_SECONDS
  });

  assert.equal(outcome.allowed, true, 'a long-expired window must reset regardless of the timestamp format');
  void now;
});

test('T9: a store that cannot answer is not a free pass, and is not retried behind the caller', async () => {
  const d1 = await d1Promise;
  let admissionAttempts = 0;

  const wrapStatement = (statement, sql) => {
    const isTarget = /rate_limit_counters/i.test(sql) && /INSERT/i.test(sql);
    if (isTarget) {
      const target = {
        bind: () => target,
        all: async () => { admissionAttempts += 1; throw new Error('D1_ERROR: store unreachable'); },
        first: async () => { throw new Error('D1_ERROR: store unreachable'); },
        run: async () => { throw new Error('D1_ERROR: store unreachable'); }
      };
      return target;
    }
    return {
      bind: (...params) => wrapStatement(statement.bind(...params), sql),
      all: (...args) => statement.all(...args),
      first: (...args) => statement.first(...args),
      run: (...args) => statement.run(...args)
    };
  };

  const rateLimit = service({ prepare: (sql) => wrapStatement(d1.db.prepare(sql), sql) });

  const outcome = await rateLimit.admitRequest('203.0.113.50', {
    context: 'auth:ip',
    limit: 5,
    windowSeconds: 60
  }).then(
    (value) => ({ value }),
    (error) => ({ error })
  );

  assert.ok(outcome.error, 'a failure must be raised, never returned as allowed:true');
  assert.equal(outcome.value, undefined, 'there is no partial answer to take from a failed admission');
  assert.equal(
    admissionAttempts,
    1,
    'an admission is a write; replaying it would silently consume a second unit of the budget'
  );
});

test('T9: a D1 rejection is reported as DB_UNAVAILABLE', async () => {
  const d1 = await d1Promise;
  const wrapStatement = (statement, sql) => {
    const isTarget = /rate_limit_counters/i.test(sql) && /INSERT/i.test(sql);
    if (isTarget) {
      const target = {
        bind: () => target,
        all: async () => { throw new Error('D1_ERROR: simulated outage'); },
        first: async () => { throw new Error('D1_ERROR: simulated outage'); },
        run: async () => { throw new Error('D1_ERROR: simulated outage'); }
      };
      return target;
    }
    return {
      bind: (...params) => wrapStatement(statement.bind(...params), sql),
      all: (...args) => statement.all(...args),
      first: (...args) => statement.first(...args),
      run: (...args) => statement.run(...args)
    };
  };

  const rateLimit = service({ prepare: (sql) => wrapStatement(d1.db.prepare(sql), sql) });

  await assert.rejects(
    () => rateLimit.admitRequest('203.0.113.51', { context: 'auth:ip', limit: 5, windowSeconds: 60 }),
    (error) => {
      assert.equal(error.code, 'DB_UNAVAILABLE', 'the HTTP layer maps this to 503 by code');
      assert.equal(error.statusCode, 503);
      return true;
    }
  );
});

test('T9: KV is not part of the admission, so a broken or stale KV cannot over-admit', async () => {
  const d1 = await d1Promise;
  const kvCalls = { get: 0, put: 0, delete: 0 };

  // Hostile only where a rate-limit counter would live. Answering configuration
  // lookups with a lie as well would fail config resolution before the limiter
  // was ever reached, which would prove nothing about the counter path.
  const hostileKv = {
    get: async (key) => {
      if (key.startsWith('ratelimit:')) {
        kvCalls.get += 1;
        // A stale entry claiming the budget is empty, which is what a cached
        // limiter would act on.
        return { attempts: 0, firstAttempt: Date.now(), lastAttempt: Date.now() };
      }
      return null;
    },
    getWithMetadata: async (key) => ({ value: await hostileKv.get(key), metadata: null }),
    put: async (key) => {
      if (key.startsWith('ratelimit:')) {
        kvCalls.put += 1;
        throw new Error('KV is down');
      }
    },
    delete: async (key) => {
      if (key.startsWith('ratelimit:')) {
        kvCalls.delete += 1;
      }
    },
    list: async () => ({ keys: [], list_complete: true, cursor: '' })
  };

  const rateLimit = new RateLimitService(createTestEnv({ DB: d1.db, KV: hostileKv, CONFIG_KV: hostileKv }));
  const options = { context: 'auth:ip', limit: 2, windowSeconds: WINDOW_SECONDS };

  const outcomes = [];
  for (let i = 0; i < 6; i += 1) {
    outcomes.push(await rateLimit.admitRequest('203.0.113.60', options));
  }

  assert.equal(outcomes.filter((outcome) => outcome.allowed).length, 2, 'the limit holds with a hostile KV present');
  const [row] = await counterRows('auth:ip', '203.0.113.60');
  assert.equal(row.attempts_count, 2);
  assert.equal(kvCalls.put, 0, 'no counter write may go to KV');
  assert.equal(kvCalls.get, 0, 'no counter read may come from KV');
  assert.equal(kvCalls.delete, 0, 'no counter release may go to KV');
});

test('T9: an identifier that cannot be parsed shares one budget instead of bypassing the limiter', async () => {
  const rateLimit = service();
  const options = { context: 'auth:ip', limit: 2, windowSeconds: WINDOW_SECONDS };

  for (const unparsable of ['', '   ', 'unknown', 'UNKNOWN', null, undefined]) {
    await rateLimit.admitRequest(unparsable, options);
  }

  const remaining = await rateLimit.admitRequest('unknown ', options);
  assert.equal(remaining.allowed, false, 'each unusable identifier getting its own budget is a bypass');

  const buckets = await env.DB
    .prepare('SELECT identifier, attempts_count FROM rate_limit_counters WHERE context = ?')
    .bind('auth:ip')
    .all();
  assert.equal(buckets.results.length, 1, 'unusable identifiers collapse into a single documented bucket');
  assert.equal(buckets.results[0].attempts_count, 2);
});

test('T9: disabling rate limiting is an explicit, published skip, not a silent pass', async () => {
  const disabledEnv = createTestEnv({ DB: env.DB, RATE_LIMIT_DISABLED: 'true' });
  const rateLimit = new RateLimitService(disabledEnv);

  for (let i = 0; i < 20; i += 1) {
    const outcome = await rateLimit.admitRequest('203.0.113.70', { context: 'auth:ip', limit: 1, windowSeconds: 60 });
    assert.equal(outcome.allowed, true);
  }

  const last = await rateLimit.admitRequest('203.0.113.70', { context: 'auth:ip', limit: 1, windowSeconds: 60 });
  assert.equal(last.skipped, true, 'a caller has to be able to tell a skip from an admission');
  assert.equal(last.reason, 'rate_limiting_disabled');
  assert.equal((await counterRows('auth:ip', '203.0.113.70')).length, 0, 'a skip must not consume budget');
});

test('T9: option precedence is explicit - options win, config fills the rest', async () => {
  const configuredEnv = createTestEnv({
    DB: env.DB,
    RATE_LIMIT_MAX_ATTEMPTS: '2',
    RATE_LIMIT_LOCKOUT_DURATION: '30'
  });
  const rateLimit = new RateLimitService(configuredEnv);

  const fromConfig = await rateLimit.admitRequest('203.0.113.80', { context: 'auth:ip' });
  assert.equal(fromConfig.limit, 2, 'maxAttempts comes from config when no limit is passed');
  assert.equal(fromConfig.windowSeconds, 30 * 60, 'lockoutDuration is minutes and becomes the window');

  const explicit = await rateLimit.admitRequest('203.0.113.81', {
    context: 'auth:ip',
    limit: 7,
    windowSeconds: 120
  });
  assert.equal(explicit.limit, 7);
  assert.equal(explicit.windowSeconds, 120);
});

test('T9: one login request reserves the IP budget once, not once per layer', async () => {
  const { createAuthService } = await import('../../src/utils/serviceFactory.js');
  const authService = createAuthService(createTestEnv({ DB: env.DB }));
  const IP = '198.51.100.90';
  const EMAIL = 'double-reserve@example.invalid';

  // `admitIp: false` is what the route passes, because `strictRateLimitMiddleware`
  // has already reserved this request's unit of the shared per-IP budget.
  // Precondition: no such user, so the login ends in INVALID_CREDENTIALS and
  // nothing is released behind our back.
  const failed = await authService.login(EMAIL, 'irrelevant', IP, { admitIp: false });
  assert.equal(failed.error, 'INVALID_CREDENTIALS');

  const rows = await env.DB
    .prepare('SELECT context, identifier, attempts_count FROM rate_limit_counters ORDER BY context')
    .all();
  assert.deepEqual(
    rows.results.map((row) => row.context),
    ['auth:email'],
    'the IP budget belongs to the middleware that already reserved it'
  );
  assert.equal(rows.results[0].attempts_count, 1, 'one request must cost one unit, not two');

  // A caller that does not say the IP was reserved gets the safe answer by
  // default, so a future route cannot accidentally skip the shared budget.
  const defaultService = createAuthService(createTestEnv({ DB: env.DB }));
  const other = await defaultService.login(EMAIL, 'irrelevant', '198.51.100.91', {});
  assert.equal(other.error, 'INVALID_CREDENTIALS');

  const ipRows = await env.DB
    .prepare('SELECT context, attempts_count FROM rate_limit_counters WHERE context = ? AND identifier = ?')
    .bind('auth:ip', '198.51.100.91')
    .all();
  assert.equal(ipRows.results.length, 1, 'without the flag, the service reserves the IP budget itself');
  assert.equal(ipRows.results[0].attempts_count, 1);
});

test('T9: through the real route, the shared IP budget is spent once per request', async () => {
  const { createTestEnv: makeEnv } = await import('../regression/helpers/local-env.mjs');
  const d1 = await d1Promise;

  // `maxAttempts: 1` is below the floor the strict limiter enforces, so the
  // shared budget allows 3 requests. The login service's own IP admission, if it
  // also ran, would use the configured 1 and refuse the *second* request. The
  // effective limit a client can observe is therefore a direct readout of how
  // many times one request was charged.
  const routeEnv = makeEnv({ DB: d1.db, RATE_LIMIT_MAX_ATTEMPTS: '1', RATE_LIMIT_LOCKOUT_DURATION: '1' });
  const authRoutes = (await import('../../src/routes/auth.js')).default;
  const app = new Hono();
  app.route('/api', authRoutes);

  const send = (email) => app.request(
    'http://127.0.0.1/api/login',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'cf-connecting-ip': '198.51.100.111' },
      body: JSON.stringify({ email, password: 'irrelevant' })
    },
    routeEnv
  );

  // A distinct email per request, so the per-account budget is never the reason
  // a request is refused and the shared IP budget is the only thing under test.
  const statuses = [];
  for (let i = 0; i < 4; i += 1) {
    statuses.push((await send(`nobody-${i}@example.invalid`)).status);
  }

  assert.deepEqual(
    statuses,
    [401, 401, 401, 429],
    'three requests fit the shared budget; a fourth is refused, and nothing is refused earlier'
  );

  const [row] = await counterRows('auth:ip', '198.51.100.111');
  assert.equal(row.attempts_count, 3, 'three admitted requests must have cost three units, not six');
});

test('T9: a successful login does not hand back the shared IP budget', async () => {
  const { createTestEnv: makeEnv } = await import('../regression/helpers/local-env.mjs');
  const { createAuthService } = await import('../../src/utils/serviceFactory.js');
  const d1 = await d1Promise;

  const IP = '198.51.100.99';
  const EMAIL = 'budget-holder@example.invalid';
  const PASSWORD = 'Correct-Horse-Battery-1';
  const passwordHash = await bcrypt.hash(PASSWORD, 4);

  await env.DB
    .prepare(`INSERT INTO users (id, email, password, full_name, role, status, auth_version, created_at, updated_at)
              VALUES (?, ?, ?, ?, 'user', 'active', 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`)
    .bind(4242, EMAIL, passwordHash, 'Budget Holder')
    .run();

  // The account's own budget is spent by failed attempts, then released by the
  // success. The shared per-IP budget is spent by the request itself, and the
  // success must not touch it - otherwise one valid account is a way to keep the
  // per-IP window empty and guess other accounts from the same address forever.
  const authService = createAuthService(makeEnv({ DB: d1.db, BCRYPT_SALT_ROUNDS: '4' }));

  const emailCount = async () => {
    const rows = await env.DB
      .prepare('SELECT attempts_count FROM rate_limit_counters WHERE context = ? AND identifier = ?')
      .bind('auth:email', EMAIL)
      .all();
    return rows.results[0]?.attempts_count ?? 0;
  };
  const ipCount = async () => {
    const rows = await env.DB
      .prepare('SELECT attempts_count FROM rate_limit_counters WHERE context = ? AND identifier = ?')
      .bind('auth:ip', IP)
      .all();
    return rows.results[0]?.attempts_count ?? 0;
  };

  assert.equal(await emailCount(), 0, 'precondition: the account budget starts empty');
  assert.equal(await ipCount(), 0, 'precondition: the shared budget starts empty');

  for (let i = 0; i < 3; i += 1) {
    await authService.login(EMAIL, 'wrong-password', IP, { admitIp: false });
  }
  assert.equal(await emailCount(), 3, 'failed logins are accounted for against the account');

  const success = await authService.login(EMAIL, PASSWORD, IP, { admitIp: false });
  assert.equal(success.success, true, `precondition: the fixture credentials are correct (${success.error || 'ok'})`);

  assert.equal(await emailCount(), 0, 'the account budget is released on success');
  assert.equal(
    await ipCount(),
    0,
    'a shared IP budget must not be cleared by one account logging in, or a valid account becomes a free pass'
  );

  // Now the same assertion with the shared budget actually spent. This is the
  // case that matters: with no units spent, releasing one is a no-op and the
  // assertion above would pass even if the release were unconditional.
  await env.DB
    .prepare('INSERT INTO rate_limit_counters (context, identifier, attempts_count, first_attempt_at, last_attempt_at, created_at, updated_at) VALUES (?, ?, 4, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)')
    .bind('auth:ip', IP, ISO(Math.floor(Date.now() / 1000)), ISO(Math.floor(Date.now() / 1000)))
    .run();
  assert.equal(await ipCount(), 4, 'precondition: the shared budget is spent');

  const second = await authService.login(EMAIL, PASSWORD, IP, { admitIp: false });
  assert.equal(second.success, true, 'precondition: the account can still log in');

  assert.equal(
    await ipCount(),
    4,
    'a successful login must not clear a shared IP budget that was already spent'
  );
});

test('T9: over the limit the route answers 429 with Retry-After and never reaches the handler', async () => {
  const { strictRateLimitMiddleware } = await import('../../src/middleware/rateLimit.js');
  const { unifiedMiddlewares } = await import('../../src/middleware/unifiedRequestMiddleware.js');
  const d1 = await d1Promise;

  // `maxAttempts: 1` is below the floor the strict limiter enforces, so this also
  // pins that a misconfigured value cannot quietly switch the control off.
  const rateLimitEnv = createTestEnv({ DB: d1.db, RATE_LIMIT_MAX_ATTEMPTS: '1', RATE_LIMIT_LOCKOUT_DURATION: '1' });

  let handlerCalls = 0;
  const app = new Hono();
  // Same order as the real auth router: correlation id first, then the limiter.
  app.use('*', unifiedMiddlewares.auto());
  app.use('*', strictRateLimitMiddleware);
  app.post('/probe', (c) => {
    handlerCalls += 1;
    return c.json({ reached: true });
  });

  const send = () => app.request(
    'http://127.0.0.1/probe',
    { method: 'POST', headers: { 'cf-connecting-ip': '198.51.100.120' } },
    rateLimitEnv
  );

  const responses = [await send(), await send(), await send(), await send()];

  assert.equal(responses[0].status, 200);
  assert.equal(responses[1].status, 200);
  assert.equal(responses[2].status, 200);
  assert.equal(responses[3].status, 429, 'the limit has to reach the client, not just the log');
  assert.equal(handlerCalls, 3, 'a denied request must not reach the protected handler');

  const limited = responses[3];
  const retryAfter = limited.headers.get('Retry-After');
  assert.ok(retryAfter && Number(retryAfter) > 0, 'a 429 without Retry-After is not actionable');
  assert.equal(limited.headers.get('X-RateLimit-Remaining'), '0');
  assert.equal(limited.headers.get('X-RateLimit-Limit'), '3', 'the floor is what the client is told');

  const body = await limited.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'RATE_LIMIT_EXCEEDED');
  void FAKE_SECRETS;
});

test('T9: an outage before admission is a 503 and the protected handler never runs', async () => {
  const { strictRateLimitMiddleware } = await import('../../src/middleware/rateLimit.js');
  const { unifiedMiddlewares } = await import('../../src/middleware/unifiedRequestMiddleware.js');
  const d1 = await d1Promise;
  let admissionAttempts = 0;

  const wrapStatement = (statement, sql) => {
    const isTarget = /rate_limit_counters/i.test(sql) && /INSERT/i.test(sql);
    const target = {
      bind: () => target,
      all: async () => { admissionAttempts += 1; throw new Error('D1_ERROR: simulated outage'); },
      first: async () => { throw new Error('D1_ERROR: simulated outage'); },
      run: async () => { throw new Error('D1_ERROR: simulated outage'); }
    };
    if (isTarget) {
      return target;
    }
    return {
      bind: (...params) => wrapStatement(statement.bind(...params), sql),
      all: (...args) => statement.all(...args),
      first: (...args) => statement.first(...args),
      run: (...args) => statement.run(...args)
    };
  };

  const brokenEnv = createTestEnv({ DB: { prepare: (sql) => wrapStatement(d1.db.prepare(sql), sql) } });

  let handlerCalls = 0;
  const app = new Hono();
  app.use('*', unifiedMiddlewares.auto());
  app.use('*', strictRateLimitMiddleware);
  app.post('/probe', (c) => {
    handlerCalls += 1;
    return c.json({ reached: true });
  });

  const response = await app.request(
    'http://127.0.0.1/probe',
    { method: 'POST', headers: { 'cf-connecting-ip': '198.51.100.130' } },
    brokenEnv
  );

  assert.equal(admissionAttempts, 1);
  assert.equal(response.status, 503, 'an admission that could not be made is not a permitted request');
  assert.equal(handlerCalls, 0, 'the handler ran, so the outage was converted into a pass');

  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'DB_UNAVAILABLE');
  assert.equal(typeof body.requestId, 'string');
  assert.ok(body.requestId.length > 0, 'a 503 the operator has to correlate needs a request id');
});
