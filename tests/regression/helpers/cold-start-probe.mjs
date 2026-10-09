/**
 * Cold-start acceptance probe for T1/B01/B02/R1.
 *
 * This runs as its own child process on purpose. The Worker logs at *import*
 * time (`app_log('Hono Auth API starting up...')` in `src/index.js`), so a test
 * file that has already imported the app cannot observe cold-start output. It
 * would also have to hijack `process.stdout.write` to catch it, which the Node
 * test runner's own reporting depends on.
 *
 * Everything the probe prints goes to stdout/stderr and is asserted by
 * `logging-redaction.test.mjs`. The only marker-free line the parent may trust
 * is the SENTINEL line, which is written to fd 3-style JSON on a single line.
 *
 * Contract: exit 0 and a parseable SENTINEL line means the app really booted and
 * served requests. Anything else is a failure, never a silent pass.
 */
import { startD1 } from './d1-local.mjs';
import { createTestEnv, initTestI18n, seedKv, FAKE_SECRETS } from './local-env.mjs';

const SENTINEL = 'COLD_START_RESULT ';
const FAKE_BEARER = 'fa1e-fake-bearer-token-marker-DO-NOT-USE';

// The parent runs this probe twice: once with DEBUG off and once with DEBUG on.
// R1 requires the capture in both states, and turning debug on is the case where
// a leaky sink is most likely to print a value.
const probeDebug = process.env.PROBE_DEBUG ?? '';

await initTestI18n();

const d1 = await startD1();
const env = createTestEnv({
  // Production-like, and crucially an empty DEBUG: the guide requires a cold
  // start with debug off, not with debug on.
  ENVIRONMENT: 'production',
  ENV: 'production',
  DEBUG: probeDebug,
  DB: d1.db,
  JWT_SECRET: FAKE_SECRETS.JWT_SECRET,
  EMAIL_PROVIDER_API_KEY: FAKE_SECRETS.EMAIL_PROVIDER_API_KEY,
  REFRESH_TOKEN_PEPPER: FAKE_SECRETS.REFRESH_TOKEN_PEPPER,
  BCRYPT_SALT: FAKE_SECRETS.BCRYPT_SALT
});

await seedKv(env, 'hono-auth-api:feature-flags', JSON.stringify({ enableAdvancedSearch: true }));
// debugConfigMiddleware resolves DEBUG through KV config, so seeding env.DEBUG
// alone leaves every namespace disabled and the capture proves nothing.
await seedKv(env, 'hono-auth-api:config:DEBUG', probeDebug);
await seedKv(env, 'hono-auth-api:DEBUG', probeDebug);

// Cold start: importing the default export builds the real middleware chain and
// the real route groups, and emits the startup logs under test.
const { default: app } = await import('../../../src/index.js');

const health = await app.request('/health', {}, env);

// Exercise the auth path with a marker bearer token so the redaction rules run
// in the production router, not just in a unit helper. `GET /api/user/me` is
// auth-protected, so this reaches the Authorization-header logging code.
const guarded = await app.request(
  '/api/user/me',
  { headers: { Authorization: `Bearer ${FAKE_BEARER}` } },
  env
);

// A 404 exercises notFoundHandler, another place a request URL can be logged.
const missing = await app.request('/api/does-not-exist', {}, env);

const result = {
  debug: probeDebug,
  health: health.status,
  guarded: guarded.status,
  missing: missing.status,
  healthBody: (await health.text()).slice(0, 200)
};

// Written last so anything logged during the requests above is already flushed.
process.stdout.write(`${SENTINEL}${JSON.stringify(result)}\n`);

await d1.dispose();
