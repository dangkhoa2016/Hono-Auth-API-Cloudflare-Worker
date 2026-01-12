#!/usr/bin/env node

/**
 * Email Provider Header Tests
 * Verifies that email service correctly applies provider-specific headers.
 *
 * Scenarios:
 * - Default Authorization header (e.g. Bearer token)
 * - Custom Authentication header (e.g. X-Api-Key)
 *
 * Test coverage:
 * - Email Service instantiation
 * - HTTP request mocking (fetch)
 * - Header validation
 * - Environment configuration overrides
 */

import { EmailService } from '../src/services/emailService.js';
import { initI18n } from '../src/i18n/index.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TestLogger } from './utils/testLogger.js';

class EmailProviderHeaderTests {
  constructor() {
    this.logger = new TestLogger();
    this.assert = TestAssertions;

    this.baseEnv = null;
    this.user = {
      id: 42,
      email: 'user@example.com',
      full_name: 'Test User',
      activation_token: 'dummy_token'
    };

    // Store original fetch to restore later
    this.originalFetch = global.fetch;
    this.fetchCalls = [];
  }

  async runAll() {
    this.logger.logSuiteHeader('📧 Email Provider Header Tests');

    try {
      this.logger.info('Initializing test environment...');
      await initI18n();
      this.setupBaseEnv();

      // Mock fetch globally for the tests
      this.mockFetch();

      const tests = [
        this.testDefaultAuthHeader,
        this.testCustomAuthHeader
      ];

      for (const test of tests) {
        try {
          await test.call(this);
          this.logger.recordResult(true);
        } catch (error) {
          this.logger.error(`Test step failed: ${error.message}`);
          this.logger.recordResult(false);
        }
      }

    } catch (error) {
      this.logger.error(`Suite execution failed: ${error.message}`);
    } finally {
      this.restoreFetch();
    }

    this.logger.logSummary();
    if (this.logger.failCount > 0) {
      process.exit(1);
    }
  }

  setupBaseEnv() {
    const kvStub = {
      get: async () => null,
      put: async () => null,
      delete: async () => null,
      list: async () => ({ keys: [] })
    };

    this.baseEnv = {
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
  }

  mockFetch() {
    this.fetchCalls = [];
    global.fetch = async (url, options) => {
      this.fetchCalls.push({ url, options });
      return {
        ok: true,
        status: 202,
        text: async () => ''
      };
    };
    this.logger.info('Global fetch mocked');
  }

  restoreFetch() {
    if (this.originalFetch) {
      global.fetch = this.originalFetch;
      this.logger.info('Global fetch restored');
    }
  }

  /**
   * Helper to run a specific configuration scenario
   */
  async runScenario(name, envOverrides, expectedHeaderOverride) {
    this.logger.info(`Testing Scenario: ${name}`);

    // Clear calls for this run
    this.fetchCalls = [];

    const emailService = new EmailService({ ...this.baseEnv, ...envOverrides });

    const result = await emailService.sendRegistrationConfirmation(
      this.user,
      { locale: 'en', ipAddress: '203.0.113.10' }
    );

    this.assert.assertTrue(result.success, `${name} - email send should succeed`);

    const provider = envOverrides.EMAIL_PROVIDER || this.baseEnv.EMAIL_PROVIDER;
    this.assert.assertEqual(result.provider, provider, `${name} - provider should propagate`);
    this.assert.assertEqual(this.fetchCalls.length, 1, `${name} - fetch should be called once`);

    const { url, options } = this.fetchCalls[0];
    const endpoint = envOverrides.EMAIL_PROVIDER_ENDPOINT || this.baseEnv.EMAIL_PROVIDER_ENDPOINT;

    this.assert.assertEqual(url, endpoint, `${name} - should call configured endpoint`);
    this.assert.assertHasField(options, 'headers', `${name} - headers should be set`);

    const headers = options.headers;
    const expectedHeaderName = expectedHeaderOverride?.name
        || envOverrides.EMAIL_PROVIDER_AUTH_HEADER
        || this.baseEnv.EMAIL_PROVIDER_AUTH_HEADER
        || 'Authorization';

    const expectedAuthValue = expectedHeaderOverride?.value
        || envOverrides.EMAIL_PROVIDER_API_KEY
        || this.baseEnv.EMAIL_PROVIDER_API_KEY;

    this.assert.assertEqual(
      headers[expectedHeaderName],
      expectedAuthValue,
      `${name} - provider auth header should be applied`
    );

    if (expectedHeaderName !== 'Authorization') {
      this.assert.assertTrue(
        !headers.Authorization,
        `${name} - default Authorization header should not be set when custom header provided`
      );
    } else if (expectedHeaderOverride?.value && envOverrides.EMAIL_PROVIDER_API_KEY) {
      this.assert.assertTrue(!headers['X-Api-Key'], `${name} - should not set custom header when using Authorization`);
    }

    this.assert.assertEqual(headers['content-type'], 'application/json', `${name} - content type should be JSON`);

    const payload = JSON.parse(options.body);
    this.assert.assertEqual(payload.from.email, this.baseEnv.EMAIL_FROM_ADDRESS, `${name} - from address should match config`);
    this.assert.assertEqual(payload.personalizations[0].to[0].email, this.user.email, `${name} - recipient email should match`);

    this.logger.success(`${name} verified successfully`);
  }

  async testDefaultAuthHeader() {
    await this.runScenario(
      'Default auth header',
      {
        EMAIL_PROVIDER: 'google',
        EMAIL_PROVIDER_API_KEY: 'Bearer test-key'
      }
    );
  }

  async testCustomAuthHeader() {
    await this.runScenario(
      'Custom auth header',
      {
        EMAIL_PROVIDER: 'yandex',
        EMAIL_PROVIDER_API_KEY: 'key-123',
        EMAIL_PROVIDER_AUTH_HEADER: 'X-Api-Key'
      }
    );
  }
}

// Export and run if called directly
export { EmailProviderHeaderTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new EmailProviderHeaderTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
