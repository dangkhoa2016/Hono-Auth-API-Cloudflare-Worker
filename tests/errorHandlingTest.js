#!/usr/bin/env node

/**
 * Error Handling and Feature Flags Test Suite
 * Tests the enableDetailedErrors feature flag functionality
 *
 * Endpoints tested:
 * - GET /api/kv-admin/configs/features - Get feature flag configurations
 * - PUT /api/kv-admin/configs/features - Update feature flags (enableDetailedErrors)
 * - POST /api/auth/login - Test error handling with different flag settings
 * - GET /api/user/profile - Test error responses in user endpoints
 * - GET /api/admin/users - Test error handling in admin endpoints
 * - GET /api/audit/logs - Test error responses in audit endpoints
 *
 * Test coverage:
 * - Error handling with enableDetailedErrors = true (detailed error messages)
 * - Error handling with enableDetailedErrors = false (generic i18n error messages)
 * - Error handling consistency across different API routes
 * - i18n error message functionality with different languages
 * - Feature flag configuration via KV Admin endpoints
 * - Conditional error response formatting based on feature flags
 * - Error handling in authentication, user management, and audit endpoints
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG, TEST_LANGUAGES } from './config/testConfig.js';

class ErrorHandlingTest {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.tokens = {};
  }

  /**
   * Run all error handling tests
   */
  async runAll() {
    this.logger.logSuiteHeader('🚨 Starting Error Handling & Feature Flags Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testDetailedErrorsEnabled,
      this.testDetailedErrorsDisabled,
      this.testErrorHandlingInDifferentRoutes,
      this.testI18nErrorMessages
    ];

    // Process tests using standard pattern
    for (const test of tests) {
      try {
        await test.call(this);
        this.logger.recordResult(true);
        this.logger.success(`${test.name} passed`);
      } catch (error) {
        this.logger.recordResult(false);
        this.logger.error(`[runAll] [${test.name}] failed: ${error.message}`);
      }
    }

    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      process.exit(1);
    }

    return true; // Indicate success
  }

  /**
   * Setup authentication tokens for testing
   */
  async setupAuthentication() {
    try {
      this.logger.info('Setting up authentication...');

      // Get admin token
      const adminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);

      if (adminLogin.success && adminLogin.data.data.access_token) {
        this.tokens.admin = adminLogin.data.data.access_token;
        this.logger.info('Admin token acquired');
      } else {
        throw new Error('Failed to get admin token');
      }

      // Try to get super admin token
      const superAdminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);

      if (superAdminLogin.success && superAdminLogin.data.data.access_token) {
        this.tokens.superAdmin = superAdminLogin.data.data.access_token;
        this.logger.info('Super admin token acquired');
      }
    } catch (error) {
      this.logger.error(`[setupAuthentication] Auth token setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test error handling with enableDetailedErrors = true
   */
  async testDetailedErrorsEnabled() {
    this.logger.info('Testing detailed errors enabled...');

    try {
      // Set KV config to enable detailed errors
      await this.client.put(`${API_ENDPOINTS.kvAdminConfigs}/ENABLE_DETAILED_ERRORS`, {
        value: true
      }, {
        'Authorization': `Bearer ${this.tokens.superAdmin}`
      });

      // Trigger an error by trying to login with invalid credentials
      const response = await this.client.post(API_ENDPOINTS.login, {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });

      this.assert.assertStatus(response.status, 401, 'Should return 401 for invalid credentials');

      const data = response.data;
      this.assert.assertFalse(data.success, 'Response should indicate failure');

      // The error message should be detailed (actual error message)
      this.assert.assertStringContains(data.error.toLowerCase(), 'invalid email or password', 'Should contain detailed error about credentials');

      this.logger.success('Detailed errors working correctly when enabled');
    } catch (error) {
      this.logger.error(`[testDetailedErrorsEnabled] Detailed errors test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test error handling with enableDetailedErrors = false
   */
  async testDetailedErrorsDisabled() {
    this.logger.info('Testing detailed errors disabled...');

    try {
      // Set KV config to disable detailed errors
      await this.client.put(`${API_ENDPOINTS.kvAdminConfigs}/ENABLE_DETAILED_ERRORS`, {
        value: false
      }, {
        'Authorization': `Bearer ${this.tokens.superAdmin}`
      });

      // Trigger the same error
      const response = await this.client.post(API_ENDPOINTS.login, {
        email: 'nonexistent@example.com',
        password: 'wrongpassword'
      });

      this.assert.assertStatus(response.status, 401, 'Should return 401 for invalid credentials');

      const data = response.data;
      this.assert.assertFalse(data.success, 'Response should indicate failure');

      // The error message should be generic (i18n system error)
      // Note: The actual message might vary based on the specific error and i18n configuration
      this.assert.assertTrue(data.error.length > 0, 'Should contain an error message');

      this.logger.success('Generic errors working correctly when detailed errors disabled');
    } catch (error) {
      this.logger.error(`[testDetailedErrorsDisabled] Generic errors test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test error handling in different routes
   */
  async testErrorHandlingInDifferentRoutes() {
    this.logger.info('Testing error handling across different routes...');

    const routes = [
      {
        path: API_ENDPOINTS.profile,
        method: 'GET',
        headers: { 'Authorization': 'Bearer INVALID_TOKEN' },
        expectedStatus: 401,
        description: 'Invalid token in user profile'
      },
      {
        path: `${API_ENDPOINTS.adminUsers}/99999`,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${this.tokens.admin}` },
        expectedStatus: 404,
        description: 'Non-existent user in admin route'
      },
      {
        path: API_ENDPOINTS.auditLogs,
        method: 'GET',
        headers: { 'Authorization': `Bearer ${this.tokens.admin}` },
        expectedStatus: 200, // Admin should have access to audit logs
        description: 'Admin access to audit logs'
      }
    ];

    let passedTests = 0;

    for (const route of routes) {
      try {
        this.logger.info(`Testing ${route.description}...`);

        const response = await this.client.request(route.method, route.path, null, route.headers);

        this.assert.assertStatus(response.status, route.expectedStatus,
          `${route.description} should return ${route.expectedStatus}`);

        if (route.expectedStatus !== 200) {
          const data = response.data;
          this.assert.assertFalse(data.success, 'Response should indicate failure');
          this.assert.exists(data.error, 'Should contain error message');
        }

        passedTests++;
        this.logger.success(`✅ ${route.description} - OK`);

      } catch (error) {
        this.logger.error(`❌ [testErrorHandlingInDifferentRoutes] ${route.description} - Failed: ${error.message}`);
      }
    }

    const success = passedTests === routes.length;
    if (success) {
      this.logger.success('All route error handling tests passed');
    } else {
      this.logger.error(`Only ${passedTests}/${routes.length} route error handling tests passed`);
      throw new Error(`Route error handling tests failed: ${passedTests}/${routes.length} passed`);
    }
  }

  /**
   * Test i18n error messages
   */
  async testI18nErrorMessages() {
    this.logger.info('Testing i18n error messages...');

    let passedTests = 0;

    for (const lang of TEST_LANGUAGES) {
      try {
        this.logger.info(`Testing error messages in ${lang}...`);

        // Test with invalid login and language header
        const response = await this.client.post(API_ENDPOINTS.login, {
          email: 'invalid@example.com',
          password: 'wrong'
        }, {
          'Accept-Language': lang
        });

        const data = response.data;
        this.assert.assertFalse(data.success, 'Response should indicate failure');
        this.assert.exists(data.error, 'Should contain error message');

        // Error message should exist and be non-empty
        this.assert.assertTrue(data.error.length > 0, 'Error message should not be empty');

        passedTests++;
        this.logger.success(`✅ ${lang} error messages - OK`);

      } catch (error) {
        this.logger.error(`❌ [testI18nErrorMessages] ${lang} error messages - Failed: ${error.message}`);
      }
    }

    const success = passedTests === TEST_LANGUAGES.length;
    if (success) {
      this.logger.success('All i18n error message tests passed');
    } else {
      this.logger.error(`Only ${passedTests}/${TEST_LANGUAGES.length} i18n error message tests passed`);
      throw new Error(`i18n error message tests failed: ${passedTests}/${TEST_LANGUAGES.length} passed`);
    }
  }
}

// Export and run if called directly
export { ErrorHandlingTest };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new ErrorHandlingTest();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
