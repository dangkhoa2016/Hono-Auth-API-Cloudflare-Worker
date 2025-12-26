📖 **Language**: English | [Tiếng Việt](./MANUAL_SEND_EMAIL_GUIDE_vi.md)

# Email Test Guide

This guide explains how to test outbound email using the helper CLI `tools/emails/emailSendTesterCli.js` and how to set the required configuration for Brevo.

## Prerequisites (Brevo)
- Set KV for development (example values):
	- EMAIL_PROVIDER=brevo
	- EMAIL_ENABLED=true
	- EMAIL_CONFIRMATION_ENABLED=true
	- EMAIL_PROVIDER_ENDPOINT=https://api.brevo.com/v3/smtp/email
	- EMAIL_PROVIDER_AUTH_HEADER=api-key
	- EMAIL_PROVIDER_API_KEY=<your_brevo_api_key>
	- EMAIL_FROM_ADDRESS=no-reply@hono-api-cloudflare-worker.dangkhoa.dev
	- EMAIL_FROM_NAME=Contact from Hono API

Example commands:
```
node tools/kv/kv-config-manager.js set EMAIL_PROVIDER "brevo" --env development
node tools/kv/kv-config-manager.js set EMAIL_ENABLED true --env development
node tools/kv/kv-config-manager.js set EMAIL_CONFIRMATION_ENABLED true --env development
node tools/kv/kv-config-manager.js set EMAIL_PROVIDER_ENDPOINT "https://api.brevo.com/v3/smtp/email" --env development
node tools/kv/kv-config-manager.js set EMAIL_PROVIDER_AUTH_HEADER "api-key" --env development
node tools/kv/kv-config-manager.js set EMAIL_PROVIDER_API_KEY "xkeysib-..." --env development
node tools/kv/kv-config-manager.js set EMAIL_FROM_ADDRESS "no-reply@hono-api-cloudflare-worker.dangkhoa.dev" --env development
node tools/kv/kv-config-manager.js set EMAIL_FROM_NAME "Contact from Hono API" --env development
```

## CLI Usage
- Help: `node tools/emails/emailSendTesterCli.js -h`
- Verify config: `node tools/emails/emailSendTesterCli.js --verify`
- Send with preview (skip provider call):
```
node tools/emails/emailSendTesterCli.js --send --to you@example.com --name "Your Name" --locale vi --ip 203.0.113.10 --preview
```
- Send real with debug:
```
node tools/emails/emailSendTesterCli.js --send --to you@example.com --name "Your Name" --locale vi --ip 203.0.113.10 --base-url https://your-app.com --debug
```
- Override auth header or API key per run:
```
node tools/emails/emailSendTesterCli.js --send --to you@example.com --auth-header api-key --api-key xkeysib-... --debug
```

## Short flags
- `-h` help, `-v` verify, `-s` send, `-d` debug.

## Notes
- When using Brevo, `EMAIL_PROVIDER_API_KEY` is mandatory. Debug mode will print endpoint, auth header, API key presence, and provider response body on failure.
