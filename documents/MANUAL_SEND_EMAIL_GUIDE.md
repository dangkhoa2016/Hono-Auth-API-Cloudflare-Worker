# Transactional account email and Brevo checks

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](MANUAL_SEND_EMAIL_GUIDE_vi.md)

This guide covers registration activation and email-address verification. It does not enable the unsupported email alert adapter described in [capabilities](CAPABILITIES.md).

## Configure the selected environment

Use ignored `.dev.vars.development` for local testing and deployed Worker variables/secrets for remote environments. Wrangler local files do not provision deployed secrets. See [Wrangler configuration](WRANGLER_CONFIG_GUIDE.md).

| Setting | Brevo value / purpose |
| --- | --- |
| `EMAIL_PROVIDER` | `brevo` |
| `EMAIL_ENABLED` | `true` to permit outbound transactional email |
| `EMAIL_CONFIRMATION_ENABLED` | `true` for registration confirmation |
| `EMAIL_PROVIDER_ENDPOINT` | `https://api.brevo.com/v3/smtp/email` |
| `EMAIL_PROVIDER_AUTH_HEADER` | `api-key` |
| `EMAIL_PROVIDER_API_KEY` | Provider secret; store outside Git and editable KV |
| `EMAIL_FROM_ADDRESS` | Sender verified with the provider for your domain |
| `EMAIL_FROM_NAME` | Public sender display name |
| `APP_URL` | Backend origin serving activation and email-verification APIs |
| `FRONTEND_URL` | Environment-only frontend home URL for the activation result button |

Enter provider keys through secret input, for example `npx wrangler secret put EMAIL_PROVIDER_API_KEY --env staging`; omit the named environment only for the intended default production target. Do not paste secrets into command arguments, logs or KV administration. Keep local secret files ignored. Remove stale provider-key overrides from editable KV rather than relying on variable precedence to hide them.

KV values take precedence over environment settings for ordinary configuration. Check for old `APP_URL`, disabled email flags or stale sender/provider values in the selected namespace. KV administration JSON-encodes strings; the resolver decodes that storage layer once while supporting legacy raw strings. For example, `APP_URL=https://api.example.com` must point to the backend, not a frontend-only host.

## Verify and preview locally

After configuring the local development bindings and variables:

```bash
node tools/emails/emailSendTesterCli.js --verify --env development
node tools/emails/emailSendTesterCli.js --send --to preview@example.com --name "Preview User" --locale en --base-url https://api.example.com --preview --env development
```

The CLI uses Wrangler's platform proxy, defaults to `development` and is not an inspection of the deployed Worker's effective secrets. `--verify` checks configuration presence; it does not authenticate with Brevo or prove delivery. `--preview` builds content without a provider send, but output contains the generated activation link: use fake data and do not publish it. Its random token is not attached to a registered database user and cannot test activation end to end.

A real CLI send removes `--preview` and requires a recipient you control plus valid provider configuration. It sends a test email; it does not register or activate a real user. Explicitly choose the environment and recipient. Avoid the legacy `--api-key` option because command arguments can expose secrets. Debug results report key presence and provider status without returning the provider body, but CLI output can still contain recipient/configuration metadata and must remain private.

## Diagnose a registration email

1. Confirm the exact backend environment, effective email flags, sender and `APP_URL`. A registration success message or healthy Worker does not prove provider acceptance or inbox delivery; inspect the registration result's `email_notification` and private server/provider diagnostics.
2. Verify the Brevo key is active, the sender/domain is verified and sending is permitted in that provider account. Check provider events, suppression/bounce status and the recipient's spam folder. A configured key being present is not evidence that it is valid.
3. Activation links use `/api/auth/activate`; email-change links use `/api/user/verify-email`. Links are built with the URL API to avoid duplicate slashes and encode tokens. Invalid or credential-bearing base URLs are rejected. The activation result button uses validated environment `FRONTEND_URL`, falling back to backend `/`; it does not transfer the token to the frontend or automatically redirect.
4. Both templates use solid table-cell colors for header and action buttons; gradients are optional decoration. Preview both languages with gradients disabled. A browser preview does not certify every Outlook/mail-client version.

Do not include real activation/verification tokens, passwords, recipient details or provider keys in screenshots, issue reports or public logs. Test real activation only with a deliberately provisioned test account; opening a real link can consume its token.
