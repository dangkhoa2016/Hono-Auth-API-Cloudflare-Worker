#!/usr/bin/env node

import { EmailService } from '../src/services/emailService.js';
import { initI18n } from '../src/i18n/index.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TestLogger } from './utils/testLogger.js';

async function runScenario(name, envOverrides, user, logger, baseEnv, originalFetch, expectedHeaderOverride) {
  const calls = [];
  global.fetch = async (url, options) => {
    calls.push({ url, options });
    return {
      ok: true,
      status: 202,
      text: async () => ''
    };
  };

  const emailService = new EmailService({ ...baseEnv, ...envOverrides });
  const result = await emailService.sendRegistrationConfirmation(
    user,
    { locale: 'en', ipAddress: '203.0.113.10' }
  );

  TestAssertions.assertTrue(result.success, `${name} - email send should succeed`);
  TestAssertions.assertEqual(
    result.provider,
    envOverrides.EMAIL_PROVIDER || baseEnv.EMAIL_PROVIDER,
    `${name} - provider should propagate`
  );
  TestAssertions.assertEqual(calls.length, 1, `${name} - fetch should be called once`);

  const { url, options } = calls[0];
  TestAssertions.assertEqual(
    url,
    envOverrides.EMAIL_PROVIDER_ENDPOINT || baseEnv.EMAIL_PROVIDER_ENDPOINT,
    `${name} - should call configured endpoint`
  );

  TestAssertions.assertHasField(options, 'headers', `${name} - headers should be set`);
  const headers = options.headers;

  const expectedHeaderName = expectedHeaderOverride?.name
    || envOverrides.EMAIL_PROVIDER_AUTH_HEADER
    || baseEnv.EMAIL_PROVIDER_AUTH_HEADER
    || 'Authorization';
  const expectedAuthValue = expectedHeaderOverride?.value
    || envOverrides.EMAIL_PROVIDER_API_KEY
    || baseEnv.EMAIL_PROVIDER_API_KEY;

  TestAssertions.assertEqual(
    headers[expectedHeaderName],
    expectedAuthValue,
    `${name} - provider auth header should be applied`
  );

  if (expectedHeaderName !== 'Authorization') {
    TestAssertions.assertTrue(
      !headers.Authorization,
      `${name} - default Authorization header should not be set when custom header provided`
    );
  } else if (expectedHeaderOverride?.value && envOverrides.EMAIL_PROVIDER_API_KEY) {
    // If we intentionally expect Authorization, ensure no stray custom header
    TestAssertions.assertTrue(!headers['X-Api-Key'], `${name} - should not set custom header when using Authorization`);
  }

  TestAssertions.assertEqual(headers['content-type'], 'application/json', `${name} - content type should be JSON`);

  const payload = JSON.parse(options.body);
  TestAssertions.assertEqual(payload.from.email, baseEnv.EMAIL_FROM_ADDRESS, `${name} - from address should match config`);
  TestAssertions.assertEqual(payload.personalizations[0].to[0].email, user.email, `${name} - recipient email should match`);
  TestAssertions.assertStringContains(payload.content[0].value, 'Welcome to', `${name} - plain text content should be present`);
  TestAssertions.assertStringContains(payload.content[1].value, '<p', `${name} - html content should be present`);

  logger.success(`${name} passed`);
  global.fetch = originalFetch;
}

async function run() {
  const logger = new TestLogger();
  logger.logSuiteHeader('📧 Email Provider Header Tests');

  await initI18n();

  const kvStub = {
    get: async () => null,
    put: async () => null,
    delete: async () => null,
    list: async () => ({ keys: [] })
  };

  const baseEnv = {
    CONFIG_KV: kvStub,
    EMAIL_ENABLED: 'true',
    EMAIL_CONFIRMATION_ENABLED: 'true',
    EMAIL_FROM_ADDRESS: 'no-reply@example.com',
    EMAIL_FROM_NAME: 'Hono Auth API',
    APP_NAME: 'Hono Auth API',
    EMAIL_PROVIDER: 'mailchannels',
    EMAIL_PROVIDER_ENDPOINT: 'https://example.com/send',
    EMAIL_PROVIDER_AUTH_HEADER: 'Authorization'
  };

  const user = {
    id: 42,
    email: 'user@example.com',
    full_name: 'Test User'
  };

  const originalFetch = global.fetch;

  try {
    await runScenario(
      'Default auth header',
      {
        EMAIL_PROVIDER: 'google',
        EMAIL_PROVIDER_API_KEY: 'Bearer test-key'
      },
      user,
      logger,
      baseEnv,
      originalFetch
    );

    await runScenario(
      'Custom auth header',
      {
        EMAIL_PROVIDER: 'yandex',
        EMAIL_PROVIDER_API_KEY: 'key-123',
        EMAIL_PROVIDER_AUTH_HEADER: 'X-Api-Key'
      },
      user,
      logger,
      baseEnv,
      originalFetch
    );

    logger.success('All email provider header tests passed');
  } catch (error) {
    logger.error(`Email provider header tests failed: ${error.message}`);
    process.exit(1);
  } finally {
    global.fetch = originalFetch;
  }
}

run();
