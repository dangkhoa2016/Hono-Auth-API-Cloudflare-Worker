# Upgrade, verification and release

English | [Tiếng Việt](UPGRADE_RELEASE.vi.md)

This is an operational checklist, not evidence that a release has occurred. The package version `1.0.0` alone does not identify a verified deployment. Record a commit and actual check results for each deployment.

## Prepare and verify the candidate

1. Record the exact source commit, Node 24 version, npm version and lockfile. Install with `npm ci --ignore-scripts --no-audit --no-fund`.
2. Run `npm run lint:check && npm run test:node`. Keep output and failure details. These cover canonical regression/integration tests, including local D1 migration and Worker checks; they do not run every legacy root-level test or external adapter.
3. Check changed docs, links and script names. Review [capabilities](CAPABILITIES.md), migration files and client impact. A successful parse/lint is not a remote integration check.
4. Prepare separate staging resources/secrets. Confirm the Cloudflare account, Worker, D1 database and optional KV namespace in ignored `wrangler.toml`. Configure deployed variables and secrets as described in [Wrangler](WRANGLER_CONFIG_GUIDE.md).

## Migrations and compatibility

Apply the full append-only sequence in [migrations](../migrations), currently `0001_initial.sql` through `0012_session_revocation.sql`. Do not edit migrations already applied to a shared database or substitute fixture reset SQL. Verify applied/pending migrations against the selected environment before making changes.

| Migration | Upgrade effect |
| --- | --- |
| `0011_preserve_audit_archive.sql` | Adds archive metadata, provenance flags and restore bookkeeping. Old archive rows remain explicitly incomplete; missing metadata cannot be reconstructed. |
| `0012_session_revocation.sql` | Adds `users.auth_version`, refresh-token version/consume/grace fields and indexes for rotation/revocation. Current session code requires these fields. |

Back up or export the target data using the platform's operational facilities and verify the recovery procedure before remote migrations. Rehearse on a representative staging copy. Migration success alone is not proof that an old Worker and new schema are compatible.

Session changes require compatible clients. Store the replacement access **and refresh** token pair after a successful refresh; coordinate concurrent refresh attempts rather than continually replaying the consumed token. Handle 401 and session-revoked/missing-version errors by re-authenticating. Handle 429 with the supplied retry guidance. Test password change, logout-all and role changes against existing sessions.

`AUTH_VERSION_ENFORCEMENT` accepts `observe` and `enforce`. `observe` temporarily tolerates tokens without an `auth_version` claim; tokens with a mismatched version are rejected in either mode. Set a valid ISO deadline in `AUTH_VERSION_ENFORCEMENT_EXPIRES_AT` for the transition; after that deadline legacy tokens are rejected. The defaults (`observe` with an empty deadline) do not create a bounded rollout by themselves. Move to `enforce` after the client/active-session transition. Coordinate refresh-token behavior and re-login requirements with deployed clients before enforcing.

Clients must also handle unsupported incident/alert/export options and the archive statistics HTTP 503 contract. Do not turn an unsupported result into a success toast, containment claim or empty chart. Never retry an ambiguous mutation automatically; establish its outcome first.

## Staging, then production

After the review and recovery preparation above, these existing scripts target remote resources:

```bash
npm run db:migrate:staging
npm run deploy:staging
```

Verify staging health/API info, login and refresh with rotated pairs, permissions, revocation, audit query/export, archive statistics and explicitly unsupported actions. Check actual console/webhook outcomes where enabled; email alert delivery remains unavailable even if transactional account email works. Record request IDs and observed status codes. A missing credential or skipped adapter check must be recorded as unverified.

Use a production change window appropriate to the application. Validate schema/code ordering in staging, apply required migrations before activating code that reads the new fields, and coordinate any old Worker traffic during the transition. After selecting the production account/resources and configuring its secrets:

```bash
npm run db:migrate:prod
npm run deploy:prod
```

Production is the default Wrangler target. Repeat the focused smoke checks and monitor real failures. If verification fails, stop promotion and investigate. Additive migrations do not provide an automatic downgrade: choose a tested compatible Worker rollback or a forward repair; do not delete columns or reset shared data as a routine rollback.

## History and release evidence

The repository contains an imported baseline and a curated Git history. Original author dates retained in that history describe source provenance; they do not prove that work was authored in the visible import interval, independently tested at each intermediate commit, or deployed on those dates. Formatting, imported material and later implementation changes should be read in their stated scope. Historical document update dates and old “complete/enterprise/production-ready” statements are retained reference material, not release evidence.

For an actual release, keep a record of the commit, verified checks, migration state, environment, deployment identifier, client compatibility notes, known limits and recovery plan. Create a release/tag only for an actual reviewed release under the project's publishing policy; this guide invents no previous releases or tags. Do not infer a release from a package version, rewritten commit date or this checklist.
