import { isIP } from 'node:net';

const LOOPBACK_HOSTS = new Set(['127.0.0.1', 'localhost', '::1', '0.0.0.0', '[::1]']);

export class UnsafeEnvironmentError extends Error {
  constructor(message) {
    super(message);
    this.name = 'UnsafeEnvironmentError';
  }
}

export function assertLoopbackUrl(value) {
  let url;
  try {
    url = new URL(value);
  } catch {
    throw new UnsafeEnvironmentError(`Base URL is not a valid URL: ${String(value)}`);
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new UnsafeEnvironmentError(`Refusing non-http(s) base URL protocol: ${url.protocol}`);
  }
  if (url.hostname.includes('workers.dev') || url.hostname.endsWith('.workers.dev')) {
    throw new UnsafeEnvironmentError('Refusing to run tests against a deployed workers.dev host');
  }
  if (!LOOPBACK_HOSTS.has(url.hostname)) {
    throw new UnsafeEnvironmentError(`Refusing non-loopback base URL host: ${url.hostname}`);
  }
  return url;
}

export function assertLocalBinding(name, value) {
  if (value === undefined || value === null || value === '') {
    return;
  }
  if (typeof value === 'object') {
    return;
  }
  const asString = String(value);
  if (/^https?:\/\//i.test(asString)) {
    assertLoopbackUrl(asString);
    return;
  }
  if ((name === 'DB' || name === 'KV' || name === 'D1') && isIP(asString) === 0 && !/^local|:memory:|\.sqlite/i.test(asString)) {
    throw new UnsafeEnvironmentError(`Refusing remote ${name} binding in local regression tests`);
  }
  if (isIP(asString) && !LOOPBACK_HOSTS.has(asString)) {
    throw new UnsafeEnvironmentError(`Refusing non-loopback host for ${name}: ${asString}`);
  }
}

export const FAKE_SECRETS = Object.freeze({
  JWT_SECRET: 'test-jwt-secret-marker-DO-NOT-USE',
  EMAIL_PROVIDER_API_KEY: 'test-mail-key-marker-DO-NOT-USE',
  BCRYPT_SALT: 'test-bcrypt-salt-marker-DO-NOT-USE',
  REFRESH_TOKEN_PEPPER: 'test-pepper-marker-DO-NOT-USE'
});

export const FAKE_PASSWORD = 'Fake-Password-MARKER-9f2c';

export function createTestEnv(overrides = {}) {
  const kvStore = new Map();
  const kv = {
    async get(key, type) {
      if (!kvStore.has(key)) {
        return null;
      }
      const raw = kvStore.get(key);
      if (type === 'json') {
        return JSON.parse(raw);
      }
      if (type === 'arrayBuffer') {
        return new TextEncoder().encode(raw).buffer;
      }
      return raw;
    },
    async getWithMetadata(key, type) {
      const value = await kv.get(key, type);
      return value === null ? null : { value, metadata: null };
    },
    async put(key, value) {
      kvStore.set(key, typeof value === 'string' ? value : JSON.stringify(value));
    },
    async delete(key) {
      kvStore.delete(key);
    },
    async list({ prefix = '' } = {}) {
      return {
        keys: [...kvStore.keys()]
          .filter((key) => key.startsWith(prefix))
          .map((key) => ({ name: key })),
        list_complete: true,
        cursor: ''
      };
    }
  };

  const env = {
    ENVIRONMENT: 'test',
    ENV: 'test',
    DEBUG: '',
    DB: null,
    KV: kv,
    // KVConfigService reads env.CONFIG_KV (not env.KV). Without this binding the
    // fake store is invisible to config resolution and every test would silently
    // exercise the "no KV" path.
    CONFIG_KV: kv,
    ...FAKE_SECRETS,
    ...overrides
  };

  assertTestEnv(env);
  env.__kvStore = kvStore;
  return env;
}

export function assertTestEnv(env) {
  for (const [name, value] of Object.entries(env || {})) {
    if (name.startsWith('__')) {
      continue;
    }
    assertLocalBinding(name, value);
  }
}

/**
 * Load the translation catalogue once per test process. Route-level error
 * responses go through i18n, so any HTTP test needs this to be initialized.
 */
let i18nPromise = null;
export function initTestI18n() {
  if (!i18nPromise) {
    i18nPromise = import('../../../src/i18n/index.js').then((module) => module.initI18n());
  }
  return i18nPromise;
}

/**
 * Write a raw value into the fake KV binding used by a test env.
 * Returns the env so callers can seed several keys in one expression.
 */
export async function seedKv(env, key, value) {
  const kv = env && env.CONFIG_KV;
  if (!kv || typeof kv.put !== 'function') {
    throw new UnsafeEnvironmentError('Test env has no fake CONFIG_KV binding to seed');
  }
  await kv.put(key, value);
  return env;
}

export function getLoopbackBaseUrl(value = process.env.BACKEND_TEST_BASE_URL) {
  return assertLoopbackUrl(value || 'http://127.0.0.1:8788');
}

/**
 * Records everything written to the worker log sink (console/debug) so tests can
 * assert that no secret marker leaked into logs.
 */
export function captureLogs() {
  const lines = [];
  const original = {
    log: console.log,
    info: console.info,
    warn: console.warn,
    error: console.error,
    debug: console.debug
  };
  // Only the sinks the application really uses are captured. `debug` writes to
  // stderr and console.* is stubbed above, so process.stdout is left untouched:
  // under `node --test` the runner streams its own protocol through stdout and
  // replacing that write function silently drops test results.
  const originalStderrWrite = process.stderr.write;
  const sink = (...args) => {
    lines.push(args.map((arg) => (typeof arg === 'string' ? arg : safeStringify(arg))).join(' '));
  };
  for (const key of Object.keys(original)) {
    console[key] = sink;
  }
  process.stderr.write = sink;
  return {
    lines,
    get text() {
      return lines.join('\n');
    },
    restore() {
      for (const [key, fn] of Object.entries(original)) {
        console[key] = fn;
      }
      process.stderr.write = originalStderrWrite;
    }
  };
}

export function safeStringify(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

export function assertNoMarker(text, marker, label = 'output') {
  if (typeof text === 'string' && text.includes(marker)) {
    throw new Error(`Secret marker "${marker}" leaked into ${label}`);
  }
}
