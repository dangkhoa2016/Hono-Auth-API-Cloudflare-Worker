# Verification guide

English | [Tiếng Việt](TEST_GUIDE.vi.md)

The canonical automated entry points match [Backend quality CI](../.github/workflows/backend-quality.yml). Run them with Node 24 from the repository root:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run lint:check && npm run test:node
```

`lint:check` rejects warnings in its configured paths. `test:node` discovers `tests/regression/*.test.mjs` and `tests/integration/*.test.mjs`; use the actual package script for the maintained invocation. The integration suites include disposable local D1/Worker behavior and migration upgrades. They need no remote account secrets. The lockfile and Node major should match CI; tests that exercise Wrangler/workerd require a platform supported by those installed tools.

For focused diagnosis, `npm run test:regression` runs regression tests only. Prefer a focused existing test while investigating, then run the canonical checks for the final candidate. Preserve actual results; do not equate the number of test files with coverage.

## Optional live-server tests

Historical interactive/root-level suites use a running API and test fixtures. They are separate from the canonical Node checks and may need environment configuration. Follow [setup](SETUP_GUIDE.md) for an isolated test server. Inspect [package scripts](../package.json) and [test configuration](../tests/config) before running them. Some scripts reset local test data; many old commands call Yarn internally even when started by npm. Do not assume `npm test` is CI: it starts an interactive menu and prepares fixtures.

For example, `npm run test:unified:help` displays the unified runner's modes without claiming those modes were run. Never run fixture initialization or destructive suites against staging/production data. Historical test counts, performance tables and “100% coverage” assertions are not maintained verification evidence.

The HTTP test helper must not replay a mutation by default after a transport error. Retry a read only under an explicit bounded policy; use opt-in mutation retry solely when the operation and test scenario make repeated execution safe. A timeout is not proof that a mutation did not execute.

## Operational evidence

Local checks do not prove remote bindings, provider credentials, recipient delivery, webhook acknowledgement, production latency or legal compliance. Use the [capability contract](CAPABILITIES.md) and [upgrade/release checklist](UPGRADE_RELEASE.md) to select staging smoke checks and record skipped/unavailable integrations. Do not report a skipped check as passing.
