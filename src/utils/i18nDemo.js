/**
 * Enhanced i18n Demo with Advanced Features
 * Showcasing pluralization, formatting, and context features
*/

import { t, tError, tSuccess } from '../i18n/index.js';
import { i18n_log } from './debug.js';
import { getAllRoles } from '../constants/roles.js';

/**
 * Demo class for testing enhanced i18n features
 */
export class I18nDemo {
  /**
   * Demo plural translations
   * @param {Object} c - Hono context
   * @returns {Object} Demo results
   */
  static pluralsDemo(c) {
    const examples = [];

    // Test different counts for pluralization
    const counts = [0, 1, 2, 5, 10, 100];

    counts.forEach(count => {
      examples.push({
        count,
        // Provide interpolation data correctly (single options object) including count
        validationErrors: t(c, 'errors.validation', { details: 'Missing required field', count }),
        usersCreated: t(c, 'success.user.created', { userName: 'Demo User', email: 'demo@example.com', count }),
        filesProcessed: t(c, 'formatting.filesSize', { size: count * 1024, count })
      });
    });

    return {
      title: 'Pluralization Demo',
      examples,
      notes: 'Notice how messages change based on count values'
    };
  }

  /**
   * Demo formatting with interpolation
   * @param {Object} c - Hono context
   * @returns {Object} Demo results
   */
  static formattingDemo(c) {
    const now = new Date();
    const examples = [];

    // Number formatting
    examples.push({
      type: 'numbers',
      data: [
        { value: 12345.67, formatted: t(c, 'formatting.currency', { amount: 12345.67 }) },
        { value: 85.5, formatted: t(c, 'formatting.percentage', { value: 85.5 }) },
        { value: 1500000, formatted: t(c, 'success.user.dataExported', { userName: 'Demo User', fileSize: Math.round(1500000 / 1024) }) }
      ]
    });

    // Date/time formatting
    examples.push({
      type: 'datetime',
      data: [
        { value: now.toISOString(), formatted: t(c, 'success.auth.tokenRefreshed', { refreshTime: now }) },
        // Added missing userName interpolation param for inactive user error
        { value: now.toISOString(), formatted: t(c, 'errors.user.inactive', { userName: 'Demo User', date: now }) },
        { value: now.toISOString(), formatted: t(c, 'success.admin.maintenanceScheduled', { maintenanceDate: now, maintenanceTime: now }) }
      ]
    });

    // String formatting
    examples.push({
      type: 'strings',
      data: [
        { value: 'john doe', formatted: t(c, 'success.user.updated', { userName: 'john doe', updatedFields: 'name, email' }) },
        { value: 'user@example.com', formatted: t(c, 'success.user.emailVerified', { userName: 'Demo User', email: 'user@example.com' }) },
        { value: 'api_service', formatted: t(c, 'errors.network.connectionFailed', { service: 'API_SERVICE', reason: 'timeout' }) }
      ]
    });

    return {
      title: 'Formatting Demo',
      examples,
      notes: 'Demonstrates number, date/time, and string formatting features'
    };
  }

  /**
   * Demo contextual translations
   * @param {Object} c - Hono context
   * @returns {Object} Demo results
   */
  static contextDemo(c) {
    const contexts = getAllRoles();
    const examples = [];

    contexts.forEach(context => {
      examples.push({
        context,
        welcome: t(c, 'zodDemo.title', context),
        dataAccess: t(c, 'zodDemo.searchResultTitle', context),
        invalidCredentials: t(c, 'errors.auth.invalidCredentials', context)
      });
    });

    return {
      title: 'Contextual Translation Demo',
      examples,
      notes: 'Shows how messages adapt based on user context/role'
    };
  }

  /**
   * Demo error messages with enhanced features
   * @param {Object} c - Hono context
   * @returns {Object} Demo results
   */
  static errorMessagesDemo(c) {
    const examples = [];

    // System errors with details
    examples.push({
      type: 'system_errors',
      data: [
        { error: tError(c, 'system', { error: 'Database connection timeout' }) },
        { error: tError(c, 'system.rateLimited', { currentRequests: 150, maxRequests: 100, timeWindow: '1 minute' }) },
        { error: tError(c, 'system.resourceExhausted', { resource: 'memory', usage: 95 }) }
      ]
    });

    // User errors with context
    examples.push({
      type: 'user_errors',
      data: [
        { error: tError(c, 'user', { count: 3 }) },
        { error: tError(c, 'user.bulkOperationFailed', { failedCount: 3, totalCount: 10, count: 3 }) },
        { error: tError(c, 'user.activationFailed', { userName: 'Demo User', reason: 'email not verified' }) }
      ]
    });

    // Auth errors with timing
    examples.push({
      type: 'auth_errors',
      data: [
        { error: tError(c, 'auth.failed', { count: 5 }) },
        { error: tError(c, 'auth.unauthorized', { resource: 'Dashboard' }) },
        { error: tError(c, 'auth.sessionExpired', { time: new Date() }) }
      ]
    });

    return {
      title: 'Enhanced Error Messages Demo',
      examples,
      notes: 'Error messages with plurals, formatting, and rich context'
    };
  }

  /**
   * Demo success messages with enhanced features
   * @param {Object} c - Hono context
   * @returns {Object} Demo results
   */
  static successMessagesDemo(c) {
    const examples = [];

    // Operation success with metrics
    examples.push({
      type: 'operations',
      data: [
        { message: tSuccess(c, 'operation.completed', { operationType: 'batch_process', duration: 1250 }) },
        { message: tSuccess(c, 'operation.batchProcessed', { successCount: 100, totalCount: 105 }) },
        { message: tSuccess(c, 'user.bulkOperationSuccess', { successCount: 47, totalCount: 50 }) }
      ]
    });

    // Admin operations with detailed info
    examples.push({
      type: 'admin_operations',
      data: [
        { message: tSuccess(c, 'admin.reportCreated', { recordCount: 1247 }) },
        { message: tSuccess(c, 'admin.backupCompleted', { backupSize: 512, duration: 45 }) },
        { message: tSuccess(c, 'admin.systemHealthy', { status: 'optimal', uptime: 99.9 }) }
      ]
    });

    return {
      title: 'Enhanced Success Messages Demo',
      examples,
      notes: 'Success messages with metrics, formatting, and detailed information'
    };
  }

  /**
   * Complete demo of all enhanced i18n features
   * @param {Object} c - Hono context
   * @returns {Object} Complete demo results
   */
  static completeDemo(c) {
    const language = c.get('language') || 'en';

    i18n_log(`Running complete i18n demo for language: ${language}`);

    return {
      language,
      timestamp: new Date().toISOString(),
      demos: {
        plurals: this.pluralsDemo(c),
        formatting: this.formattingDemo(c),
        context: this.contextDemo(c),
        errorMessages: this.errorMessagesDemo(c),
        successMessages: this.successMessagesDemo(c)
      },
      summary: {
        message: t(c, 'success.operation.completed', {
          operationType: 'i18n_demo',
          duration: 250
        }),
        userProfileMessage: t(c, 'success.user.profileUpdated', {
          userName: 'Demo User',
          fieldsCount: 5
        }),
        features: [
          'Pluralization with _other suffix',
          'Number, date, and string formatting',
          'Contextual translations with _context suffix',
          'Enhanced error messages with interpolation',
          'Rich success messages with metrics',
          'Multi-language support with consistent API'
        ]
      }
    };
  }
}

/**
 * Utility functions for testing i18n features
 */
export const i18nTestUtils = {
  /**
   * Test pluralization for a given key and range of counts
   * @param {Object} c - Hono context
   * @param {string} key - Translation key
   * @param {Array<number>} counts - Array of counts to test
   * @param {Object} params - Additional parameters for interpolation
   * @returns {Array} Test results
   */
  testPluralization(c, key, counts = [0, 1, 2, 5, 10], params = {}) {
    return counts.map(count => ({
      count,
      result: t(c, key, { ...params, count })
    }));
  },

  /**
   * Test formatting for a given key with different values
   * @param {Object} c - Hono context
   * @param {string} key - Translation key
   * @param {Array<Object>} testCases - Array of test case objects
   * @returns {Array} Test results
   */
  testFormatting(c, key, testCases) {
    return testCases.map(testCase => ({
      input: testCase,
      result: t(c, key, testCase)
    }));
  },

  /**
   * Test contextual translations
   * @param {Object} c - Hono context
   * @param {string} key - Base translation key
   * @param {Array<string>} contexts - Array of contexts to test
   * @returns {Array} Test results
   */
  testContextual(c, key, contexts) {
    return contexts.map(context => ({
      context,
      result: t(c, key, context)
    }));
  }
};
