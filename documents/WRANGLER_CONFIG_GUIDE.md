# Wrangler environments and secrets

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](WRANGLER_CONFIG_GUIDE.vi.md)

Copy [wrangler.toml.example](../wrangler.toml.example) to ignored `wrangler.toml` for local setup. This template is an environment skeleton, not a complete deployment configuration. It includes D1 bindings and assets; configure optional KV separately. The [local smoke fixture](../tests/fixtures/wrangler.local-smoke.toml) is test-only and must not be deployed.

| Environment | Selector | Resources | Commands |
| --- | --- | --- | --- |
| Development | `--env development` | Local D1; port 8787 | `npm run db:migrate`, `npm run dev` |
| Test | `--env test` | Separate local D1; port 8788 | `npm run db:migrate:test`, `npm run dev:test` |
| Staging | `--env staging` | Dedicated remote D1/bindings; remote dev port 8789 | `npm run db:migrate:staging`, `npm run deploy:staging` |
| Production | Default; no named env | Production remote D1/bindings | `npm run db:migrate:prod`, `npm run deploy:prod` |

Both `deploy` and `deploy:prod` deploy the **default production** environment. `dev:staging` uses `--remote`; it can access real staging data. Use a separate staging account/database/namespace where appropriate, and verify selected account, Worker name and database ID before remote writes. Named environments need their own bindings; do not assume root bindings are inherited.

Use the maintained template compatibility date (`2025-06-01`) and flags. The application uses `WeakRef`; older compatibility settings such as `2024-01-01` can start a Worker that returns HTTP 500 for requests.

## Configuration versus secrets

- `wrangler.toml`: Worker/binding names, resource IDs, compatibility options and nonsecret deployment variables. Resource IDs identify resources; they are not authentication secrets. This project keeps the operational file ignored because it is specific to the operator.
- `.dev.vars.development`, `.dev.vars.test`, `.dev.vars.staging`: ignored local Wrangler variables. Templates contain placeholders. There is no production `.dev.vars.example`; do not invent one or treat a local file as deployed configuration.
- Deployed secrets: set via Wrangler secret commands for the exact target environment. `.dev.vars.*` does not provision deployed secrets. Use `npm run secret:put:staging` or `npm run secret:put:prod` for JWT; for another provider secret use the target explicitly, for example `npx wrangler secret put EMAIL_PROVIDER_API_KEY --env staging`.
- Nonsecret deployment settings: configure `[vars]` for the default environment and `[env.staging.vars]` for staging as needed. Set `ENV`, `APP_URL`, allowed CORS origins and email policy for each target. Disable broad debug output and detailed errors outside active troubleshooting.
- `APP_URL` is the backend origin used by account-email API links. Set the environment-only `FRONTEND_URL` to the frontend home URL for the button on activation result pages. Use HTTPS in deployments; HTTP is accepted only for localhost, 127.0.0.1 and IPv6 loopback. Missing or invalid values fall back to `/` on the backend. Do not include credentials, a query or a fragment. This setting does not change the activation API or automatically redirect the browser.

Generate different strong JWT secrets per environment. Keep provider keys and credentials out of source, command arguments, logs and editable KV settings. Keep rate limiting enabled in staging/production unless testing a deliberately isolated scenario. Templates may contain permissive development/test values; review them individually.

`CONFIG_KV` is optional for ordinary environment/default config reads; KV administration requires it. Add it under each target's own KV binding configuration. A configured-but-unreachable binding is an error. Flags such as `AUDIT_ENABLE_REAL_TIME_MONITORING` do not add background execution; consult [capabilities](CAPABILITIES.md).

Follow [setup](SETUP_GUIDE.md) for local commands and [upgrade/release](UPGRADE_RELEASE.md) for remote migration ordering, compatibility and evidence. Never use fixture reset SQL on staging or production.


## Domains and DNS

When a Worker directly serves a hostname, use a [Custom Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) to provision DNS and TLS. A [Route](https://developers.cloudflare.com/workers/configuration/routing/routes/) requires an existing proxied DNS record for the hostname; a route alone does not prove that the hostname resolves. Preserve the target environment's domain/route setup when redeploying.

After deployment, check public DNS, HTTPS, `/health`, CORS from the frontend origin and account-email URLs. A deployed Worker does not prove that DNS or email works. Do not open real activation tokens just to test routing. See [transactional email](MANUAL_SEND_EMAIL_GUIDE.md).
