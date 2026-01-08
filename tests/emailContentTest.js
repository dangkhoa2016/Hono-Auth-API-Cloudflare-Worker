#!/usr/bin/env node

/**
 * Email Content Localization Test
 * Verifies registration email content is localized for Vietnamese locale.
 *
 * Test coverage:
 * - Email Service instantiation with mocks
 * - i18n initialization
 * - Registration email generation (preview mode)
 * - Content localization verification (Subject, Body, HTML)
 */

import { EmailService } from '../src/services/emailService.js';
import { initI18n } from '../src/i18n/index.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TestLogger } from './utils/testLogger.js';

class EmailContentLocalizationTests {
  constructor() {
    this.logger = new TestLogger();
    this.assert = TestAssertions;
  }

  async runAll() {
    this.logger.logSuiteHeader('📧 Email Content Localization Test');

    try {
      this.logger.info('Initializing test environment...');
      await initI18n();
      this.logger.info('i18n initialized');

      const tests = [
        this.testVietnameseRegistrationEmail
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
      this.logger.error(`Setup failed: ${error.message}`);
      process.exit(1);
    }

    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      process.exit(1);
    }
  }

  /**
   * Test: Verify Vietnamese email content
   */
  async testVietnameseRegistrationEmail() {
    this.logger.info('Testing Vietnamese Registration Email Content...');

    // Mock KV
    const kvStub = {
      get: async () => null,
      put: async () => null,
      delete: async () => null,
      list: async () => ({ keys: [] })
    };

    // Environment configuration
    const env = {
      CONFIG_KV: kvStub,
      EMAIL_ENABLED: 'true',
      EMAIL_CONFIRMATION_ENABLED: 'true',
      EMAIL_FROM_ADDRESS: 'no-reply@example.com',
      EMAIL_FROM_NAME: 'Hono Auth API',
      APP_NAME: 'Hono Auth API'
    };

    const emailService = new EmailService(env);

    const result = await emailService.sendRegistrationConfirmation({
      id: 1,
      email: 'user@example.com',
      full_name: 'Người Dùng Mới',
      activation_token: 'dummy_token_123'
    }, {
      locale: 'vi',
      ipAddress: '203.0.113.10',
      preview: true // skip real send, capture content
    });

    this.assert.assertTrue(result.success, 'Email preview should succeed');
    this.assert.assertHasField(result, 'preview', 'Preview payload should exist');

    const { subject, plainText, htmlBody } = result.preview;
    this.assert.assertType(subject, 'string', 'Subject should be string');
    this.assert.assertType(plainText, 'string', 'Plain text should be string');
    this.assert.assertType(htmlBody, 'string', 'HTML body should be string');

    // Key Vietnamese phrases to ensure localization applied
    this.assert.assertTrue(subject.includes('Kích hoạt tài khoản'), 'Subject should be Vietnamese');
    this.assert.assertTrue(plainText.includes('Chào mừng bạn đến với'), 'Plain text should include Vietnamese welcome');
    this.assert.assertTrue(htmlBody.includes('Địa chỉ IP:'), 'HTML should include Vietnamese IP label');

    this.logger.success('Vietnamese localization verified successfully');
  }
}

// Export and run if called directly
export { EmailContentLocalizationTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new EmailContentLocalizationTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
