import { BaseService } from '../services/baseService.js';
import { serviceConfig_log } from '../utils/debug.js';

/**
 * @typedef {Object} ConfigNamespace
 * @property {Map<string, BaseService>} instances - Services built for one env
 * @property {Map<string, *>} configCache - Config values for this env
 * @property {Map<string, number>} cacheTimestamps - Write time per config key
 * @property {number} generation - Bumped by `invalidateEnv` for this env
 * @property {Object} generationToken - Identity of the last global invalidation seen
 */

/**
 * Centralized Service Configuration Manager
 *
 * Owns config caching across services. One namespace per environment object, so
 * services in the same env share values (same KV binding) and services in
 * different envs never do.
 *
 * Two earlier designs are what this replaced, and both are worth remembering:
 *
 * 1. Instance identity keyed by a hash of ENV/DEBUG/JWT_SECRET. That ignored the
 *    DB binding, so a second environment in one isolate silently reused services
 *    wired to the first environment's database. It then moved to a Symbol
 *    stamped onto the env object, which threw `TypeError: Cannot define
 *    property` on a frozen or sealed env. A WeakMap keyed by the env object gives
 *    the same per-object identity while writing nothing onto the caller.
 *
 * 2. A module-level `Map<string, service>` of instances. That map is a *strong*
 *    registry: every service holds its `env`, so one Map retained every env this
 *    isolate ever saw, forever. Instances now live inside the namespace their env
 *    keys, so they are reachable exactly as long as the caller keeps the env
 *    alive. Enumeration for statistics and for invalidation goes through
 *    `WeakRef`, which observes those namespaces without owning them.
 */
export class ServiceConfigManager {
  constructor() {
    // Per-environment config cache namespaces, keyed by the env object identity.
    // A-04: this used to be one `_globalCache` Map handed to every BaseService
    // in the isolate, so the second environment read the first environment's
    // values and timestamps (A -> B -> A returned B's config). Namespacing by
    // env keeps the intended sharing *within* one env while isolating across
    // envs. WeakMap so a discarded env is collectable.
    this._envNamespaces = new WeakMap();
    this._namespaceCount = 0;
    this._sharedNamespace = null;
    this._cacheTimeout = 5 * 60 * 1000; // 5 minutes

    // Global invalidation signal. `clearAllCache` bumps the counter and swaps the
    // token; every namespace compares the token it last acknowledged. This is
    // what makes invalidation reach a namespace the manager cannot enumerate —
    // BT4-01, where a pre-warm filled a namespace and handed out no instance, so
    // there was no instance for a walk-over to find.
    this.globalGeneration = 0;
    this._generationToken = {};

    // Weak enumeration of materialized namespaces. A strong Set here would
    // reinstate the BT4-02 leak through ns.instances -> service.env.
    this._namespaceRefs = [];

    serviceConfig_log('ServiceConfigManager initialized');
  }

  /**
   * Drop namespace references whose target has been collected.
   *
   * Called before every enumeration so the list does not grow without bound in
   * an isolate that churns through environments.
   * @returns {Array<ConfigNamespace>} Live namespaces
   */
  _liveNamespaces() {
    const live = [];
    const kept = [];
    for (const ref of this._namespaceRefs) {
      const namespace = ref.deref();
      if (namespace) {
        live.push(namespace);
        kept.push(ref);
      }
    }
    this._namespaceRefs = kept;
    return live;
  }

  /**
   * Remember a namespace for later enumeration, weakly.
   * @param {ConfigNamespace} namespace - Namespace to track
   */
  _track(namespace) {
    if (!this._namespaceRefs.some((ref) => ref.deref() === namespace)) {
      this._namespaceRefs.push(new WeakRef(namespace));
    }
  }

  /**
   * Get the config cache namespace belonging to one environment.
   *
   * Services in the same env deliberately share values and timestamps, because
   * they read the same KV binding. Services in different envs never do.
   * @param {Object} env - Environment context
   * @returns {ConfigNamespace} Namespace for this env
   */
  _namespaceFor(env) {
    if (!env || typeof env !== 'object') {
      // Nothing to key on. Keep one namespace so callers that pass no env still
      // get caching, kept separate from every real env.
      if (!this._sharedNamespace) {
        this._sharedNamespace = this._createNamespace();
      }
      this._track(this._sharedNamespace);
      return this._sharedNamespace;
    }
    let namespace = this._envNamespaces.get(env);
    if (!namespace) {
      namespace = this._createNamespace();
      this._envNamespaces.set(env, namespace);
      this._namespaceCount += 1;
    }
    this._track(namespace);
    this._consumeGlobalInvalidation(namespace);
    return namespace;
  }

  /**
   * Build an empty namespace already acknowledging the current generation.
   * @returns {ConfigNamespace} Fresh namespace
   */
  _createNamespace() {
    return {
      instances: new Map(),
      configCache: new Map(),
      cacheTimestamps: new Map(),
      generation: 0,
      generationToken: this._generationToken
    };
  }

  /**
   * Drop a namespace's values if a global invalidation happened since it last
   * looked.
   *
   * This is lazy on purpose. `clearAllCache` cannot enumerate an env it has
   * already dropped, so instead of trying, it leaves a token behind and the
   * namespace clears itself the next time anybody touches it.
   * @param {ConfigNamespace} namespace - Namespace to reconcile
   * @returns {number} Entries removed by this reconciliation
   */
  _consumeGlobalInvalidation(namespace) {
    if (namespace.generationToken === this._generationToken) {
      return 0;
    }
    const removed = this._clearNamespace(namespace);
    namespace.generationToken = this._generationToken;
    return removed;
  }

  /**
   * Empty one namespace in place.
   *
   * The Maps are cleared, never replaced: a caller that kept a service instance
   * from before the invalidation holds these exact Map objects, and swapping
   * them out would leave that retained service reading the stale ones forever.
   * @param {ConfigNamespace} namespace - Namespace to empty
   * @returns {number} Config entries removed
   */
  _clearNamespace(namespace) {
    const cleared = namespace.configCache.size;
    namespace.configCache.clear();
    namespace.cacheTimestamps.clear();
    for (const instance of namespace.instances.values()) {
      // Clear KVConfigService's own cache, which is not part of the namespace.
      if (typeof instance.clearCache === 'function') {
        instance.clearCache();
      }
    }
    return cleared;
  }

  /**
   * Wire a service to its environment's config cache namespace.
   * @param {BaseService} service - Service instance
   * @param {Object} env - Environment context
   */
  _attachNamespace(service, env) {
    if (!(service instanceof BaseService)) {
      return;
    }
    const namespace = this._namespaceFor(env);
    service._configNamespace = namespace;
    service._configCache = namespace.configCache;
    service._cacheTimestamps = namespace.cacheTimestamps;
  }

  /**
   * Get or create service instance with optimized config
   * @param {string} serviceName - Name of the service
   * @param {Function} serviceClass - Service class constructor
   * @param {Object} env - Environment context
   * @returns {Object} Service instance
   */
  getServiceInstance(serviceName, serviceClass, env) {
    const namespace = this._namespaceFor(env);
    let instance = namespace.instances.get(serviceName);

    if (!instance) {
      instance = new serviceClass(env);
      // BaseService instances are wired to their *own env's* cache namespace,
      // not one cache shared by the whole isolate.
      this._attachNamespace(instance, env);
      namespace.instances.set(serviceName, instance);
      serviceConfig_log(`${serviceName}: Created new instance scoped to its environment`);
    }

    return instance;
  }

  /**
   * Pre-warm configurations for better performance
   * @param {Object} env - Environment context
   * @param {Array<string>} configKeys - Config keys to pre-warm
   */
  async preWarmConfigs(env, configKeys = []) {
    serviceConfig_log(`Pre-warming ${configKeys.length} configurations`);

    const namespace = this._namespaceFor(env);
    const tempService = new BaseService(env, 'PreWarmer');
    tempService._configNamespace = namespace;
    tempService._configCache = namespace.configCache;
    tempService._cacheTimestamps = namespace.cacheTimestamps;

    try {
      await tempService.getBulkConfigs(configKeys);
      serviceConfig_log(`Successfully pre-warmed ${configKeys.length} configurations`);
    } catch (error) {
      // A partial pre-warm must not be treated as a valid warm namespace. The
      // entries that did land are simply left to the normal TTL and
      // invalidation rules; nothing here marks the namespace as complete.
      serviceConfig_log(`Error pre-warming configs: ${error.message}`);
    }
  }

  /**
   * Invalidate the config cache of one environment.
   *
   * Bumps that namespace's own generation, so a fetch already in flight for
   * this env is refused by the cache, and empties it. Other environments are
   * untouched.
   * @param {Object} env - Environment context
   * @returns {number} Config entries cleared
   */
  invalidateEnv(env) {
    const namespace = this._namespaceFor(env);
    namespace.generation += 1;
    const cleared = this._clearNamespace(namespace);
    serviceConfig_log(`Invalidated ${cleared} config entries for one environment`);
    return cleared;
  }

  /**
   * Clear all cached configurations.
   *
   * Clears every namespace this manager can still reach, and — for the ones it
   * cannot, because the env is gone — leaves a global token behind so the next
   * access to them empties them too. The returned count is therefore the number
   * of entries physically removed *now*, not an upper bound; entries in a
   * namespace nobody touches again are never counted, because there is nothing
   * left to remove.
   * @returns {number} Number of config entries cleared
   */
  clearAllCache() {
    this.globalGeneration += 1;
    this._generationToken = {};

    let cleared = 0;
    for (const namespace of this._liveNamespaces()) {
      cleared += this._clearNamespace(namespace);
      namespace.generationToken = this._generationToken;
    }

    // Namespaces are tracked weakly, so the list is emptied rather than kept.
    // The namespaces themselves may still be alive through a caller's env; if so
    // the token above is what tells them to clear.
    this._namespaceRefs = [];

    serviceConfig_log(`Cleared ${cleared} config entries, KV config caches and BaseService caches`);
    return cleared;
  }

  /**
   * How many namespaces are alive right now.
   *
   * Always `null`. Enumerating live namespaces exactly would mean holding them
   * strongly, which is the BT4-02 leak; a WeakRef list reports namespaces that
   * have not been collected, which is a different and much weaker statement.
   * @returns {null} Always null — see above
   */
  liveNamespaceCount() {
    return null;
  }

  /**
   * Get cache statistics.
   *
   * Aggregated over the namespaces still reachable from this manager. Fields are
   * a snapshot, not a live view: a namespace collected after the call is simply
   * absent from the numbers.
   * @returns {Object} Cache statistics
   */
  getCacheStats() {
    // Union, not a concatenation: two envs caching the same setting key is one
    // distinct key, and `globalCacheSize` still counts each entry separately.
    const cacheKeys = new Set();
    let globalCacheSize = 0;
    let serviceInstances = 0;
    let cachedEntriesSnapshot = 0;

    for (const namespace of this._liveNamespaces()) {
      globalCacheSize += namespace.configCache.size;
      serviceInstances += namespace.instances.size;
      for (const cacheKey of namespace.configCache.keys()) {
        cacheKeys.add(cacheKey);
      }
    }

    cachedEntriesSnapshot = globalCacheSize;

    return {
      globalCacheSize,
      serviceInstances,
      cacheNamespaces: this._namespaceRefs.length,
      // Cumulative count of env objects this manager has been handed. Not a live
      // env count: a WeakMap cannot be enumerated and this counter is not reset
      // when an env is dropped.
      trackedEnvs: this._namespaceCount,
      // Whether the numbers above were sampled before or after the most recent
      // clearAllCache(). Callers that poll can use it to detect a stale snapshot.
      generation: this.globalGeneration,
      cachedEntriesSnapshot,
      liveNamespaceCount: this.liveNamespaceCount(),
      cacheKeys: [...cacheKeys]
    };
  }
}

// Singleton instance
export const serviceConfigManager = new ServiceConfigManager();
