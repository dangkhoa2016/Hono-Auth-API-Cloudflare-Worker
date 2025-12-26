#!/usr/bin/env node

/**
 * Email Content Localization Test
 * Verifies registration email content is localized for Vietnamese locale.
 */

import { EmailService } from '../src/services/emailService.js';
import { initI18n } from '../src/i18n/index.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TestLogger } from './utils/testLogger.js';

async function run() {
  const logger = new TestLogger();
  logger.logSuiteHeader('📧 Email Content Localization Test');

  try {
    // Ensure i18n is initialized so tl() has resources
    await initI18n();

    const kvStub = {
      get: async () => null,
      put: async () => null,
      delete: async () => null,
      list: async () => ({ keys: [] })
    };

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
      full_name: 'Người Dùng Mới'
    }, {
      locale: 'vi',
      ipAddress: '203.0.113.10',
      preview: true // skip real send, capture content
    });

    TestAssertions.assertTrue(result.success, 'Email preview should succeed');
    TestAssertions.assertHasField(result, 'preview', 'Preview payload should exist');

    const { subject, plainText, htmlBody } = result.preview;
    TestAssertions.assertType(subject, 'string', 'Subject should be string');
    TestAssertions.assertType(plainText, 'string', 'Plain text should be string');
    TestAssertions.assertType(htmlBody, 'string', 'HTML body should be string');

    // Key Vietnamese phrases to ensure localization applied
    TestAssertions.assertTrue(subject.includes('Kích hoạt tài khoản'), 'Subject should be Vietnamese');
    TestAssertions.assertTrue(plainText.includes('Chào mừng bạn đến với'), 'Plain text should include Vietnamese welcome');
    TestAssertions.assertTrue(htmlBody.includes('Địa chỉ IP:'), 'HTML should include Vietnamese IP label');

    logger.success('Email content localization (vi) passed');
  } catch (error) {
    logger.error(`Email content localization test failed: ${error.message}`);
    process.exit(1);
  }
}

run();
