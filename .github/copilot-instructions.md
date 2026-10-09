# Hono Auth Worker: repository instructions

## Scope and references

- This is a JavaScript ES-module API using Hono, Cloudflare Workers, D1, optional KV, JWT and i18next. Use Node.js 24 for repository tooling.
- Read the [README](../README.md), [Vietnamese README](../README.vi.md) and [contribution guide](CONTRIBUTING.md) for this checkout. Follow their linked capability and verification contracts where available.
- Derive behavior from source and executed checks. Imported comments, package versions and historical readiness claims are not deployment evidence.
- Do not describe placeholders or log-only actions as completed external operations. Use structured unsupported/failure/partial outcomes as appropriate.

## Implementation

- Keep changes focused. Reuse routes, services, schemas, role constants and configuration resolution rather than duplicating them.
- Validate requests with existing Zod/i18n conventions. Preserve machine codes, HTTP status and request correlation.
- Follow the role policy and derive access scope from authenticated server context, not caller-controlled filters.
- Use registered typed configuration; distinguish missing configuration from dependency failure and retain meaningful false/zero values.
- Keep migrations append-only. Test populated-schema upgrades and preserve user, session and audit data.
- Use conditional writes/transactions for credentials, tokens, archives and rate budgets. Do not blindly retry ambiguous mutations.
- Keep operational outcomes distinct from opt-in diagnostics. Redact sensitive values before logging; never emit credentials or raw Authorization headers.
- Locale resources are explicit shipped catalogs. Keep language selection/placeholders consistent; do not assume arbitrary filesystem discovery.
- Write comments explaining contracts/invariants. Remove conversational scratch notes and unsupported completeness claims.

## Verification

- Reproduce behavior defects with a failing test first. Assert real outcomes and failure behavior, not merely response shape or source text.
- Prefer isolated helpers under `tests/regression/helpers/` and canonical tests under `tests/regression/` and `tests/integration/`.
- Use fake credentials and loopback services. Never reset shared databases or send notifications to real recipients without authorization.
- Run complete verification from the README for this revision. Baseline automated gates are `npm run lint:check` and `npm run test:node` after `npm ci --ignore-scripts --no-audit --no-fund`.
- Do not claim legacy/live-server suites, remote adapters, throughput targets or production behavior were verified unless those checks ran.
- For docs/config edits check paths, commands and syntax. Human prose does not require implementation-mirroring tests.

## Change reporting

- Describe the problem, resulting behavior, actual checks and material limits; report unverified items accurately.
- Use descriptive commit subjects and bullet bodies. Separate formatting and unrelated operational changes when useful.
- Preserve original author metadata during authorized history edits. Never fabricate a timeline or rewrite published history without maintainer authorization.
- Keep credentials/local environment files out of Git. A code edit does not authorize production deployment or messages to third parties.
