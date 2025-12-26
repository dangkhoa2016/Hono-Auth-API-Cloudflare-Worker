#!/usr/bin/env node

import { getPlatformProxy } from 'wrangler';
import { EmailSendTester } from '../../src/services/emailSendTester.js';
import { initI18n } from '../../src/i18n/index.js';

function parseArgs(argv) {
  const args = {};
  for (let i = 2; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === '-h') {args.help = true; continue;}
    if (arg === '-v') {args.verify = true; continue;}
    if (arg === '-s') {args.send = true; continue;}
    if (arg === '-d') {args.debug = true; continue;}

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const val = argv[i + 1] && !argv[i + 1].startsWith('--') && !argv[i + 1].startsWith('-') ? argv[++i] : true;
      args[key] = val;
    }
  }
  return args;
}

function showHelp() {
  console.log(`
Email Send Tester

Usage:
  node tools/emails/emailSendTesterCli.js --verify [--env development]
  node tools/emails/emailSendTesterCli.js --send --to you@example.com [--name "Your Name"] [--locale en] [--ip 203.0.113.10] [--base-url https://your-app.com] [--preview] [--debug]

Options:
  --verify             Only verify config keys (default action if no --send)
  --send               Send a test registration email
  --to <email>         Recipient email (required when --send)
  --name <name>        Recipient name
  --locale <code>      Locale for email (default: en)
  --ip <ip>            Simulated IP (default: 203.0.113.10)
  --base-url <url>     Activation base URL override
  --auth-header <name> Override auth header name (e.g. api-key)
  --api-key <value>    Override provider API key for this run
  --preview            Preview mode (build content, skip send)
  --debug              Debug mode (include provider response details on failure)
  --env <name>         Environment name for wrangler (default: development)
  --help               Show this help
`);
}

async function main() {
  const args = parseArgs(process.argv);

  if (args.help) {
    showHelp();
    process.exit(0);
  }

  const envName = args.env || 'development';
  const debugMode = Boolean(args.debug);
  const actionSend = Boolean(args.send);
  const actionVerify = !actionSend || Boolean(args.verify);
  const authHeaderOverride = args['auth-header'];
  const apiKeyOverride = args['api-key'];

  await initI18n();

  let proxy;
  let env = {};
  try {
    proxy = await getPlatformProxy({ environment: envName });
    env = proxy.env || {};
  } catch (err) {
    console.error(`⚠️  Platform proxy init note: ${err.message}`);
    env = {};
  }

  // Apply per-run overrides for auth header and API key if provided
  if (authHeaderOverride) {
    env.EMAIL_PROVIDER_AUTH_HEADER = authHeaderOverride;
  }
  if (apiKeyOverride) {
    env.EMAIL_PROVIDER_API_KEY = apiKeyOverride;
  }

  const tester = new EmailSendTester(env, { envName });

  if (actionVerify) {
    const report = await tester.verifySettings();
    console.log('📋 Email config verification:');
    console.log(JSON.stringify(report, null, 2));
    if (report.missing.length > 0) {
      console.error('❌ Missing required settings.');
      await proxy?.dispose?.();
      process.exit(1);
    }
  }

  if (actionSend) {
    if (!args.to) {
      console.error('❌ Missing --to when using --send');
      await proxy?.dispose?.();
      process.exit(1);
    }

    const result = await tester.manuallySendRegistrationConfirmation({
      to: args.to,
      name: args.name,
      locale: args.locale || 'en',
      ipAddress: args.ip || '203.0.113.10',
      baseUrl: args['base-url'],
      preview: Boolean(args.preview),
      debug: debugMode
    });

    console.log('\n📧 Send result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.preview) {
      console.log('');
      console.log('Plain Text Email Content:\n');
      console.log(result.preview?.plainText || '(no preview content)');
      console.log('\n---\n');
      console.log('HTML Email Content:\n');
      console.log(result.preview?.htmlBody || '(no preview content)');
    }

    if (!result.success && result.debug) {
      console.error('\n🔍 Debug details:');
      console.error(JSON.stringify(result.debug, null, 2));
    }

    if (!result.success) {
      await proxy?.dispose?.();
      process.exit(1);
    }
  }

  await proxy?.dispose?.();
  process.exit(0);
}

main().catch((err) => {
  console.error('❌ Unexpected error:', err);
  process.exit(1);
});
