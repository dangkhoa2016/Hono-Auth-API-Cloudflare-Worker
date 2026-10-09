/**
 * T4/B11/A-04 — config cache and service instance isolation across environments.
 *
 * A-04 was: every BaseService instance was handed one shared `_globalCache`, so
 * the second environment in an isolate read the *first* environment's config.
 * Instance identity had already moved off a secret-derived hash, but the config
 * values and their timestamps were still global.
 *
 * These tests read real config through BaseService with a real KV binding, not a
 * fake class that skips timestamps, because the bug lives in the cache layer.
 */
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';

import { createTestEnv, initTestI18n, seedKv } from './helpers/local-env.mjs';
import { BaseService } from '../../src/services/baseService.js';
import { ServiceConfigManager, serviceConfigManager } from '../../src/utils/serviceConfigManager.js';
import { createUserService, invalidateServiceCaches } from '../../src/utils/serviceFactory.js';

await initTestI18n();

const CONFIG_KEY = 'FEATURE_FLAG_UNDER_TEST';

/**
 * Build an env whose KV binding returns a different value per env object.
 * @param {string} value - The value this env's KV reports
 * @returns {Promise<Object>} Test env
 */
async function envWithConfig(value) {
  const env = createTestEnv({ ENVIRONMENT: 'test', ENV: 'test', DEBUG: '' });
  await seedKv(env, `hono-auth-api:${CONFIG_KEY}`, value);
  return env;
}

/**
 * A concrete BaseService that reads one key through the production cache path.
 */
class ProbeService extends BaseService {
  constructor(env) {
    super(env, 'ProbeService');
  }

  /**
   * Read the probe key through `_getCachedConfig`.
   * @returns {Promise<string>} The configured value
   */
  read() {
    return this._getCachedConfig(CONFIG_KEY, async () => {
      const store = this.env.CONFIG_KV;
      const raw = await store.get(`hono-auth-api:${CONFIG_KEY}`);
      return raw === null ? 'MISSING' : raw;
    });
  }
}

/**
 * Obtain a probe service the way production does, through the manager.
 *
 * Constructing BaseService directly would skip the bug: the constructor gives
 * every service its own Map, and only `getServiceInstance` swaps in the shared
 * one. The isolation guarantee has to be asserted on the real path.
 * @param {Object} env - Test env
 * @returns {ProbeService} Service instance for this env
 */
function probeFor(env) {
  return serviceConfigManager.getServiceInstance('ProbeService', ProbeService, env);
}

beforeEach(() => {
  serviceConfigManager.clearAllCache();
});

test('A-04: two envs with the same ENV/DEBUG do not share config values (A->B->A)', async () => {
  const envA = await envWithConfig('VALUE_A');
  const envB = await envWithConfig('VALUE_B');

  const serviceA = probeFor(envA);
  const serviceB = probeFor(envB);

  assert.notEqual(serviceA, serviceB, 'the two envs must not share one instance');
  assert.equal(await serviceA.read(), 'VALUE_A', 'A must resolve its own value');
  assert.equal(await serviceB.read(), 'VALUE_B', 'B must not read the value A already cached');
  assert.equal(await serviceA.read(), 'VALUE_A', 'A must still read A after B ran');
});

test('A-04: instances for different envs are different objects', () => {
  const envA = createTestEnv();
  const envB = createTestEnv();

  const first = serviceConfigManager.getServiceInstance('ProbeA', ProbeService, envA);
  const same = serviceConfigManager.getServiceInstance('ProbeA', ProbeService, envA);
  const other = serviceConfigManager.getServiceInstance('ProbeA', ProbeService, envB);

  assert.equal(first, same, 'the same env object must reuse its instance');
  assert.notEqual(first, other, 'a different env object must not reuse the instance');
});

test('A-04: cache timestamps are isolated per env', async () => {
  const envA = await envWithConfig('VALUE_A');
  const envB = await envWithConfig('VALUE_B');

  const serviceA = probeFor(envA);
  const serviceB = probeFor(envB);

  await serviceA.read();
  await serviceB.read();

  // Both entries must be tracked separately; a single shared timestamp map is
  // what let one env's TTL refresh or expiry leak into another's.
  const stampsA = [...serviceA._cacheTimestamps.entries()];
  const stampsB = [...serviceB._cacheTimestamps.entries()];

  assert.equal(stampsA.length, 1, `expected one A timestamp, got ${JSON.stringify(stampsA)}`);
  assert.equal(stampsB.length, 1, `expected one B timestamp, got ${JSON.stringify(stampsB)}`);
  assert.notEqual(
    serviceA._configCache,
    serviceB._configCache,
    'two envs must not be handed the same config cache object'
  );
});

test('A-04: a frozen env does not throw', () => {
  const env = Object.freeze(createTestEnv({ ENVIRONMENT: 'test', ENV: 'test' }));

  // A Symbol stamped onto env, or any property write, throws on a frozen object.
  // Identity has to live outside the env object.
  assert.doesNotThrow(() => {
    serviceConfigManager.getServiceInstance('FrozenProbe', ProbeService, env);
  });
});

test('A-04: a sealed env does not throw', () => {
  const env = Object.seal(createTestEnv({ ENVIRONMENT: 'test', ENV: 'test' }));

  assert.doesNotThrow(() => {
    serviceConfigManager.getServiceInstance('SealedProbe', ProbeService, env);
  });
});

test('A-04: pre-warming one env does not populate another env cache', async () => {
  const envA = await envWithConfig('VALUE_A');
  const envB = await envWithConfig('VALUE_B');

  await serviceConfigManager.preWarmConfigs(envA, [CONFIG_KEY]);

  const serviceB = probeFor(envB);
  assert.equal(await serviceB.read(), 'VALUE_B', 'B must not inherit a pre-warmed value from A');
});

test('A-04: clearing one env does not clear another env', async () => {
  const envA = await envWithConfig('VALUE_A');
  const envB = await envWithConfig('VALUE_B');

  const serviceA = probeFor(envA);
  const serviceB = probeFor(envB);

  await serviceA.read();
  await serviceB.read();

  serviceA.clearConfigCache();

  assert.equal(await serviceB.read(), 'VALUE_B', 'B cache must survive clearing A');
  assert.equal(await serviceA.read(), 'VALUE_A', 'A must re-resolve its own value');
});

test('A-04: clearAllCache semantics are explicit and still isolate afterwards', async () => {
  const envA = await envWithConfig('VALUE_A');
  const envB = await envWithConfig('VALUE_B');

  const serviceA = probeFor(envA);
  const serviceB = probeFor(envB);

  await serviceA.read();
  await serviceB.read();
  serviceConfigManager.clearAllCache();

  assert.equal(await serviceA.read(), 'VALUE_A');
  assert.equal(await serviceB.read(), 'VALUE_B');
});

test('A-04: the shared manager instance used by the factory is also isolated', async () => {
  const envA = await envWithConfig('VALUE_A');
  const envB = await envWithConfig('VALUE_B');

  const userA = createUserService(envA);
  const userB = createUserService(envB);

  assert.notEqual(userA, userB, 'the factory must not hand the same service to two envs');
  assert.notEqual(
    userA._configCache,
    userB._configCache,
    'factory-built services must not share one config cache'
  );
});

test('A-04: a fresh manager does not inherit another manager state', async () => {
  const envA = await envWithConfig('VALUE_A');
  const other = new ServiceConfigManager();

  const before = new ProbeService(envA);
  await before.read();

  const after = new ProbeService(envA);
  assert.equal(await after.read(), 'VALUE_A');
  assert.equal(
    other.getCacheStats().serviceInstances,
    0,
    'a new manager must expose its own state without a global singleton leaking in'
  );
});

/*
 * ---------------------------------------------------------------------------
 * BT4-01..BT4-03 (master v4 §F.2) — các lỗi còn lại sau A-04.
 *
 * A-04 đã tách values/timestamps/instances theo env và chuyển identity ra khỏi
 * object `env`. Ba lỗi dưới đây vẫn còn và tái hiện được trên source thật:
 * namespace chỉ được pre-warm thì không ai clear được, registry instance giữ
 * env vĩnh viễn, và counter clear trả sai giá trị.
 * ---------------------------------------------------------------------------
 */

/**
 * Count how many times the probe value was actually read from the KV backend.
 *
 * Cache assertions that only compare returned strings are weak: if the second
 * read never reached the backend at all the test still passes. This counter is
 * the non-vacuity check — an "invalidated" read that still reports zero backend
 * fetches did not re-resolve anything.
 *
 * `cacheKey` defaults to the probe key. Pre-warm tests pass a key that
 * `getBulkConfigs` actually understands, because pre-warming an unknown key is a
 * documented no-op and would leave the namespace empty.
 * @param {string} [cacheKey] - Config cache key this probe reads
 * @returns {{CountingProbeService: Function, fetchCount: Function}} Probe class and its counter
 */
function makeCountingProbeService(cacheKey = CONFIG_KEY) {
  let fetches = 0;
  class CountingProbeService extends BaseService {
    constructor(env) {
      super(env, 'CountingProbeService');
    }

    /**
     * Read the probe key through the production cache path, counting backend reads.
     * @returns {Promise<*>} The configured value
     */
    read() {
      return this._getCachedConfig(cacheKey, async () => {
        fetches += 1;
        if (cacheKey !== CONFIG_KEY) {
          return `FETCHED_${fetches}`;
        }
        const raw = await this.env.CONFIG_KV.get(`hono-auth-api:${CONFIG_KEY}`);
        return raw === null ? 'MISSING' : raw;
      });
    }
  }
  return { CountingProbeService, fetchCount: () => fetches };
}

/**
 * Assert a read is served from cache without touching the backend.
 * @param {Object} params - Probe bookkeeping
 * @param {Function} params.fetchCount - Backend read counter
 * @param {number} params.expected - Expected counter value
 * @param {string} params.message - Failure message
 */
function assertBackendReads(params, expected, message) {
  assert.equal(params.fetchCount(), expected, message);
}

test('BT4-01: a namespace populated only by pre-warm is invalidated by clearAllCache', async () => {
  const env = await envWithConfig('OLD');
  // 'jwt' is a key `getBulkConfigs` resolves, so pre-warm really fills the cache.
  const { CountingProbeService, fetchCount } = makeCountingProbeService('jwt');

  // Pre-warm creates and fills the namespace, but hands out no instance, so the
  // manager has no way to reach that namespace when it clears.
  await serviceConfigManager.preWarmConfigs(env, ['jwt']);

  serviceConfigManager.clearAllCache();

  // The service is created only after the invalidation.
  const service = serviceConfigManager.getServiceInstance('CountingProbe', CountingProbeService, env);
  assert.equal(await service.read(), 'FETCHED_1', 'a pre-warm-only namespace must not survive clearAllCache');
  assertBackendReads({ fetchCount }, 1, 'the read must have gone to the backend rather than to stale cache');
});

test('BT4-01: pre-warm still warms a namespace that is not invalidated', async () => {
  const env = await envWithConfig('OLD');
  const { CountingProbeService, fetchCount } = makeCountingProbeService('jwt');

  await serviceConfigManager.preWarmConfigs(env, ['jwt']);

  // Control for the test above: same pre-warm, no invalidation. The service must
  // reuse the pre-warmed value, otherwise the fix would be "never cache".
  const service = serviceConfigManager.getServiceInstance('WarmProbe', CountingProbeService, env);
  const value = await service.read();

  assert.equal(typeof value, 'object', 'precondition: the pre-warmed jwt config must be present');
  assertBackendReads({ fetchCount }, 0, 'a pre-warmed key must be served from cache');
});

test('BT4-01: invalidateEnv clears a pre-warm-only namespace for that env only', async () => {
  const envA = await envWithConfig('OLD_A');
  const envB = await envWithConfig('OLD_B');
  const probeA = makeCountingProbeService('jwt');
  const probeB = makeCountingProbeService('jwt');

  await serviceConfigManager.preWarmConfigs(envA, ['jwt']);
  await serviceConfigManager.preWarmConfigs(envB, ['jwt']);

  // Neither env has an instance yet, so this is still a pre-warm-only namespace.
  serviceConfigManager.invalidateEnv(envA);

  const serviceA = serviceConfigManager.getServiceInstance('ScopedA', probeA.CountingProbeService, envA);
  const serviceB = serviceConfigManager.getServiceInstance('ScopedB', probeB.CountingProbeService, envB);

  assert.equal(await serviceA.read(), 'FETCHED_1');
  assertBackendReads(probeA, 1, 'A must re-fetch after its own invalidation');
  await serviceB.read();
  assertBackendReads(probeB, 0, 'B must be untouched by A invalidation');
});

test('BT4-02: an instance handed out before clearAllCache observes the invalidation', async () => {
  const env = await envWithConfig('OLD');
  const { CountingProbeService, fetchCount } = makeCountingProbeService();

  // The caller keeps this reference; it is not the manager that holds it.
  const heldInstance = serviceConfigManager.getServiceInstance('HeldInstance', CountingProbeService, env);
  assert.equal(await heldInstance.read(), 'OLD');
  assert.equal(fetchCount(), 1);

  await seedKv(env, `hono-auth-api:${CONFIG_KEY}`, 'NEW');
  serviceConfigManager.clearAllCache();

  // Reusing the old reference must not resurrect the stale Map it captured.
  assert.equal(await heldInstance.read(), 'NEW', 'a retained instance must observe the invalidation');
  assert.equal(fetchCount(), 2, 'the retained instance must re-fetch from the backend');
});

test('BT4-02: the manager keeps no strong registry of env objects', () => {
  const env = createTestEnv({ ENVIRONMENT: 'test', ENV: 'test' });
  serviceConfigManager.getServiceInstance('RegistryProbe', ProbeService, env);

  // The instance map must live inside the WeakMap-keyed namespace, not in a
  // module-level Map that outlives the env. `globalGeneration` is deliberately
  // public: it is the invalidation signal every namespace must consult.
  assert.equal(typeof serviceConfigManager.globalGeneration, 'number');
  assert.equal(
    Object.prototype.hasOwnProperty.call(serviceConfigManager, '_instances'),
    false,
    'a strong Map keyed by service name would retain every env this isolate ever saw'
  );
  assert.equal(serviceConfigManager.liveNamespaceCount(), null, 'a live count would require a strong registry');
});

test('BT4-02: the same env object still reuses one instance and a different env does not', async () => {
  const envA = await envWithConfig('VALUE_A');
  const envB = await envWithConfig('VALUE_B');

  const first = serviceConfigManager.getServiceInstance('ReuseProbe', ProbeService, envA);
  const again = serviceConfigManager.getServiceInstance('ReuseProbe', ProbeService, envA);
  const other = serviceConfigManager.getServiceInstance('ReuseProbe', ProbeService, envB);

  assert.equal(first, again, 'same env must reuse its instance');
  assert.notEqual(first, other, 'a different env must not reuse the instance');
  assert.equal(await first.read(), 'VALUE_A');
  assert.equal(await other.read(), 'VALUE_B');
});

test('BT4-03: clearAllCache returns the number of entries it actually removed', async () => {
  const envA = await envWithConfig('VALUE_A');
  const envB = await envWithConfig('VALUE_B');

  const serviceA = probeFor(envA);
  const serviceB = probeFor(envB);

  await serviceA.read();
  await serviceB.read();

  const cleared = serviceConfigManager.clearAllCache();
  assert.equal(cleared, 2, `expected 2 entries cleared, got ${cleared}`);
  assert.equal(serviceConfigManager.clearAllCache(), 0, 'a second clear has nothing left to remove');
});

test('BT4-03: two services sharing one namespace are not counted twice', async () => {
  const env = await envWithConfig('VALUE_A');

  const first = serviceConfigManager.getServiceInstance('CountProbeA', ProbeService, env);
  const second = serviceConfigManager.getServiceInstance('CountProbeB', ProbeService, env);

  await first.read();
  await second.read();

  assert.equal(
    serviceConfigManager.clearAllCache(),
    1,
    'one shared namespace with one key must be reported as one entry'
  );
});

test('BT4-03: getCacheStats reports what it can actually see and refuses to invent the rest', async () => {
  const env = await envWithConfig('VALUE_A');
  probeFor(env);
  await probeFor(env).read();

  const stats = serviceConfigManager.getCacheStats();
  assert.equal(stats.globalCacheSize, 1);
  assert.deepEqual(stats.cacheKeys, [CONFIG_KEY]);
  assert.equal(stats.serviceInstances, 1);
  assert.equal(typeof stats.trackedEnvs, 'number', 'trackedEnvs is a cumulative counter, not a live count');
  assert.equal(typeof stats.generation, 'number');
  assert.equal(
    stats.liveNamespaceCount,
    null,
    'a WeakMap cannot be enumerated; returning a number here would be a fabricated stat'
  );

  serviceConfigManager.clearAllCache();
  const afterClear = serviceConfigManager.getCacheStats();
  assert.equal(afterClear.globalCacheSize, 0, 'the snapshot must not keep reporting cleared entries');
  assert.ok(afterClear.generation > stats.generation, 'clearAllCache must advance the generation');
});

test('BT4-05: a fetch pending across clearAllCache is not stored as fresh cache', async () => {
  const env = await envWithConfig('OLD');

  let releaseFetch;
  const gate = new Promise((resolve) => {
    releaseFetch = resolve;
  });

  class SlowProbeService extends BaseService {
    constructor(env_) {
      super(env_, 'SlowProbeService');
    }

    /**
     * Read through the production cache path, holding the fetch open.
     *
     * The backend value is captured *before* the pause, so the request really is
     * carrying a pre-invalidation answer when the world moves underneath it.
     * @returns {Promise<string>} The configured value
     */
    read() {
      return this._getCachedConfig(CONFIG_KEY, async () => {
        const raw = await this.env.CONFIG_KV.get(`hono-auth-api:${CONFIG_KEY}`);
        await gate;
        return raw === null ? 'MISSING' : raw;
      });
    }
  }

  const service = serviceConfigManager.getServiceInstance('SlowProbe', SlowProbeService, env);

  // Start the read. It is now parked inside the fetch with the OLD value source.
  const inFlight = service.read();
  // The world changes underneath it, then the cache is invalidated.
  await seedKv(env, `hono-auth-api:${CONFIG_KEY}`, 'NEW');
  serviceConfigManager.clearAllCache();
  releaseFetch();

  assert.equal(await inFlight, 'OLD', 'the in-flight request keeps the value it read');
  assert.equal(
    serviceConfigManager.getCacheStats().globalCacheSize,
    0,
    'a fetch that spanned an invalidation must not repopulate the cache'
  );

  // The next read has to go back to the backend rather than trust the stale fill.
  assert.equal(await service.read(), 'NEW', 'the next read must not observe the invalidated fetch result');
});

test('BT4-05: an ordinary fetch is still cached when no invalidation intervened', async () => {
  const env = await envWithConfig('OLD');
  const { CountingProbeService, fetchCount } = makeCountingProbeService();
  const service = serviceConfigManager.getServiceInstance('SteadyProbe', CountingProbeService, env);

  assert.equal(await service.read(), 'OLD');
  assert.equal(await service.read(), 'OLD');
  assert.equal(fetchCount(), 1, 'a second read inside the TTL must come from cache');
  assert.equal(serviceConfigManager.getCacheStats().globalCacheSize, 1);
});

test('BT4-05: the cache guard is inert for a directly constructed service', async () => {
  // BaseService is also constructed outside the manager (pre-warm, ad-hoc tools).
  // Those instances have no namespace, so no generation guard may apply.
  const env = await envWithConfig('OLD');
  const direct = new ProbeService(env);

  assert.equal(await direct.read(), 'OLD');
  assert.equal(await direct.read(), 'OLD');
  assert.equal(direct._configNamespace, null);
});

test('BT4-03: getCacheStats().cacheKeys is a union, not one entry per namespace', async () => {
  const first = await envWithConfig('ONE');
  const second = await envWithConfig('TWO');
  const { CountingProbeService, fetchCount } = makeCountingProbeService();

  await serviceConfigManager.getServiceInstance('UnionProbeA', CountingProbeService, first).read();
  await serviceConfigManager.getServiceInstance('UnionProbeB', CountingProbeService, second).read();

  const stats = serviceConfigManager.getCacheStats();
  assert.equal(stats.globalCacheSize, 2, 'both namespaces hold an entry');
  assert.equal(
    stats.cacheKeys.length,
    1,
    `the same config key cached in two envs is one distinct key, got ${JSON.stringify(stats.cacheKeys)}`
  );
  assert.equal(fetchCount(), 2, 'each env still fetched for itself');
});

test('BT4-03: invalidateServiceCaches(env) drops one env without touching the others', async () => {
  const first = await envWithConfig('ONE');
  const second = await envWithConfig('TWO');
  const { CountingProbeService, fetchCount } = makeCountingProbeService();

  const a = serviceConfigManager.getServiceInstance('TargetedProbeA', CountingProbeService, first);
  const b = serviceConfigManager.getServiceInstance('TargetedProbeB', CountingProbeService, second);
  assert.equal(await a.read(), 'ONE');
  assert.equal(await b.read(), 'TWO');
  assert.equal(fetchCount(), 2);

  const result = invalidateServiceCaches(first);
  assert.equal(typeof result.clearedEntries, 'number', 'the caller learns how much was dropped');
  assert.ok(result.clearedEntries >= 1, `expected the target env to be cleared, got ${result.clearedEntries}`);
  assert.equal(
    serviceConfigManager.getCacheStats().globalCacheSize,
    1,
    'the untouched environment must keep its cached value'
  );

  // A rebuilt environment object is a different environment: identity, not content.
  assert.deepEqual(invalidateServiceCaches({ ...first }), { clearedEntries: 0 });
});
