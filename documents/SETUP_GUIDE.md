# Local setup

English | [Tiếng Việt](SETUP_GUIDE.vi.md)

Use Node.js 24 (the CI major version), npm and the committed `package-lock.json`. The lockfile pins dependencies; `npm ci` reproduces it without updating it. With nvm installed, run from the repository root:

```bash
nvm install 24
nvm use 24
npm ci --ignore-scripts --no-audit --no-fund
cp wrangler.toml.example wrangler.toml
cp .dev.vars.development.example .dev.vars.development
```

Generate a local secret with `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"` and place it in `JWT_SECRET` in `.dev.vars.development`. Use a different secret for every environment. The copied placeholder is not a usable deployment secret. Keep `.dev.vars.*` and `wrangler.toml` out of version control.

Set `DEBUG = ""` and `ENABLE_DETAILED_ERRORS = "false"` unless actively debugging. Keep email disabled for a first local run (`EMAIL_ENABLED = "false"`). Activation email requires separately configured provider credentials and an appropriate `APP_URL`; registration alone does not demonstrate email delivery. Review the complete [configuration example](../.dev.vars.complete.example) for supported settings, and the [capability guide](CAPABILITIES.md) for flags that do not provide a missing adapter.

Use the maintained template compatibility date (`2025-06-01`) and flags. The application uses `WeakRef`; older compatibility settings such as `2024-01-01` can start a Worker that returns HTTP 500 for requests.

## Local storage and server

The [Wrangler template](../wrangler.toml.example) includes separate D1 development/test bindings with local placeholders; real Cloudflare database IDs are unnecessary for these local commands:

```bash
npm run db:migrate
npm run dev
```

Wrangler stores local state under `.wrangler/`. Development listens on port 8787. Check the API info response with `curl http://localhost:8787/`. Migrations create the schema; they are separate from fixture resets.

For a separate local live-test database:

```bash
cp .dev.vars.test.example .dev.vars.test
npm run db:migrate:test
npm run dev:test
```

Set a distinct test `JWT_SECRET` before starting; test listens on port 8788. The `RATE_LIMIT_DISABLED` setting in the test example is for isolated tests. Do not copy it into staging or production unchanged.

`setup:dev` runs migrations and executes `tests/init/reset.sql`; `setup:test` also prepares test state. Inspect these scripts before using them on existing local data. Neither is needed for the minimal manual setup above.

## Optional KV configuration

The template does not bind `CONFIG_KV`. Ordinary config reads can use environment/default values without KV; KV administration needs a configured binding. If using KV, add a separate `CONFIG_KV` namespace to each named environment in your ignored `wrangler.toml`. Bindings are environment-specific. Never point local tests at production resources.

`npm run test:kv:setup` targets the **test** environment and writes fixture config. It is not a development bootstrap step. A configured but unreachable KV binding is an availability failure, not a reason to silently accept stale/default security settings. Keep JWT and provider secrets in environment secret storage; do not put them in editable KV configuration.

## Verification and remote environments

```bash
npm run verify
```

The Node integration suites provision their own disposable local fixtures. No remote deployment credentials are needed for canonical checks. See [testing](TEST_GUIDE.md), [Wrangler configuration](WRANGLER_CONFIG_GUIDE.md) and [upgrade/release](UPGRADE_RELEASE.md) for staging and production. `dev:staging` uses remote resources and is separate from local development.
