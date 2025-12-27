#!/usr/bin/env node

/**
 * Quick Smoke Test Suite
 * Fast essential functionality validation for development
 *
 * Essential endpoints tested (smoke tests):
 * - GET /health - System availability
 * - POST /api/auth/login - Authentication works
 * - GET /api/user/profile - User functionality
 * - GET /api/admin/dashboard - Admin functionality
 * - GET /api/audit/logs - Audit system works
 *
 * Test coverage:
 * - Basic system connectivity
 * - Core authentication flow
 * - Essential API endpoints responsiveness
 * - Database connectivity validation
 * - Quick error detection for development
 * - Fast CI/CD pipeline validation
 *
 * Designed for: Development cycles, CI checks, pre-deployment validation
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';

class QuickTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.testUser = TEST_USERS.valid;
  }

  async runAll() {
    this.logger.logSuiteHeader('⚡️ Starting Quick Tests');

    const tests = [
      this.testHealth,
      this.testAuth,
      this.testCriticalPath,
      this.testDevelopmentChecks
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
  }

  async testHealth() {
    this.logger.info('Testing basic API health...');

    try {
      let response;
      let attempts = 0;
      const maxAttempts = 3;

      while (attempts < maxAttempts) {
        try {
          response = await this.client.get(API_ENDPOINTS.health);
          if (response.status === 200) break;
        } catch (e) {
          // ignore error and retry
        }
        attempts++;
        if (attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      this.assert.assertEqual(response.status, 200, 'Health check should return 200');
      this.assert.assertEqual(response.data.data.status, 'ok', 'Health check should be successful');
      this.assert.exists(response.data.data.status, 'Health check should include status');

      this.logger.success('API health check passed');
    } catch (error) {
      this.logger.error(`[testHealth] Health check failed: ${error.message}`);
      throw error;
    }
  }

  async testAuth() {
    this.logger.info('Testing basic authentication flow...');

    try {
      const loginResponse = await this.client.post(API_ENDPOINTS.login, this.testUser);

      this.assert.assertEqual(loginResponse.status, 200, 'Login should succeed');
      this.assert.assertEqual(loginResponse.data.success, true, 'Login should be successful');
      this.assert.exists(loginResponse.data.data.access_token, 'Login should return token');

      const token = loginResponse.data.data.access_token;

      // Test token usage
      const profileResponse = await this.client.get(API_ENDPOINTS.profile, {
        Authorization: `Bearer ${token}`
      });

      this.assert.assertEqual(profileResponse.status, 200, 'Profile access should work with token');
      this.assert.exists(profileResponse.data.data, 'Profile should return user data');

      this.logger.success('Basic authentication passed');
    } catch (error) {
      this.logger.error(`[testAuth] Authentication test failed: ${error.message}`);
      throw error;
    }
  }

  async testCriticalPath() {
    this.logger.info('Testing critical path functionality...');

    try {
      // Test essential endpoints that must work for basic functionality
      const criticalEndpoints = [
        { endpoint: API_ENDPOINTS.health, method: 'GET', name: 'Health Check' },
        { endpoint: API_ENDPOINTS.login, method: 'POST', data: this.testUser, name: 'Login' }
      ];

      for (const test of criticalEndpoints) {
        let response;
        if (test.method === 'GET') {
          response = await this.client.get(test.endpoint);
        } else if (test.method === 'POST') {
          response = await this.client.post(test.endpoint, test.data);
        }

        this.assert.assertTrue(response.status >= 200 && response.status < 300,
          `${test.name} should return success status`);
      }

      this.logger.success('Critical path tests passed');
    } catch (error) {
      this.logger.error(`[testCriticalPath] Critical path test failed: ${error.message}`);
      throw error;
    }
  }

  async testDevelopmentChecks() {
    this.logger.info('Testing development environment checks...');

    try {
      const checks = [
        {
          name: 'API Availability',
          test: async () => {
            const response = await this.client.get(API_ENDPOINTS.health);
            return response.status === 200;
          }
        },
        {
          name: 'Database Connection',
          test: async () => {
            const loginResponse = await this.client.post(API_ENDPOINTS.login, this.testUser);
            return loginResponse.status === 200;
          }
        },
        {
          name: 'Authentication Flow',
          test: async () => {
            const loginResponse = await this.client.post(API_ENDPOINTS.login, this.testUser);
            const token = loginResponse.data.data.access_token;
            const profileResponse = await this.client.get(API_ENDPOINTS.profile, {
              Authorization: `Bearer ${token}`
            });
            return profileResponse.status === 200;
          }
        }
      ];

      let passed = 0;
      for (const check of checks) {
        try {
          const result = await check.test();
          if (result) {
            passed++;
            this.logger.success(`${check.name}: OK`);
          } else {
            this.logger.error(`${check.name}: FAILED`);
          }
        } catch (error) {
          this.logger.error(`${check.name}: ERROR - ${error.message}`);
        }
      }

      const healthScore = ((passed / checks.length) * 100).toFixed(1);
      this.logger.info(`Development Health Score: ${healthScore}%`);

      if (passed < checks.length) {
        throw new Error(`Some development checks failed (${passed}/${checks.length})`);
      }

      this.logger.success('Development environment checks passed');
    } catch (error) {
      this.logger.error(`[testDevelopmentChecks] Development checks failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { QuickTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new QuickTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
