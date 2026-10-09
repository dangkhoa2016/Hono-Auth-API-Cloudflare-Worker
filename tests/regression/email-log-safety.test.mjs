import test from 'node:test';
import assert from 'node:assert/strict';
import { EmailService } from '../../src/services/emailService.js';
import { initI18n } from '../../src/i18n/index.js';
import { configureDebugNamespaces } from '../../src/utils/debug.js';
import { captureLogs } from './helpers/local-env.mjs';

await initI18n();
const apiMarker = 'local-only-provider-key-marker';
const tokenMarker = 'local-only-email-token-marker';
const opaqueMarker = 'local-only-opaque-provider-marker';
for (const kind of ['registration', 'email-change']) {
  for (const outcome of ['success', 'rejection', 'transport']) {
    test(`T1: ${kind} ${outcome} logs omit credentials and provider content`, async t => {
      const service = new EmailService({});
      service.getEmailConfig = async () => ({
        enabled: true, confirmationEnabled: true, provider: 'brevo',
        providerEndpoint: 'https://provider.example.invalid/send',
        fromAddress: 'sender@example.invalid', providerApiKey: apiMarker, providerAuthHeader: 'api-key'
      });
      let calls = 0;
      t.mock.method(globalThis, 'fetch', async (_url, options) => {
        calls += 1;
        assert.equal(options.headers['api-key'], apiMarker, 'provider still receives its credential');
        assert.ok(options.body.includes(tokenMarker), 'email still contains intended token link');
        if (outcome === 'transport') {throw new Error(opaqueMarker);}
        return new Response(outcome === 'rejection' ? opaqueMarker : '', { status: outcome === 'rejection' ? 400 : 202 });
      });
      const user = { email: 'user@example.invalid', new_email: 'new@example.invalid', full_name: 'Local User', activation_token: tokenMarker, email_verification_token: tokenMarker };
      configureDebugNamespaces('hono-auth-api:*');
      const capture = captureLogs();
      let result;
      try {
        result = kind === 'registration'
          ? await service.sendRegistrationConfirmation(user, { debug: true, locale: 'en', userAgent: opaqueMarker })
          : await service.sendEmailChangeVerification(user, { locale: 'en' });
      } finally { capture.restore(); configureDebugNamespaces(''); }
      assert.equal(calls, 1);
      assert.equal(result.success, outcome === 'success');
      for (const marker of [apiMarker, tokenMarker, opaqueMarker]) {
        assert.equal(capture.text.includes(marker), false, 'sensitive marker must not reach log sink');
        assert.equal(JSON.stringify(result.debug || {}).includes(marker), false, 'debug result must not reflect provider content');
      }
    });
  }
}
