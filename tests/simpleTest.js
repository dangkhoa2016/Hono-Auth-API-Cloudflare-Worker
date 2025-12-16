#!/usr/bin/env node

/**
 * Simple Test Suite
 * Basic functionality tests for quick validation
 *
 * Endpoints tested:
 * - GET / - Root endpoint
 * - GET /api - API info endpoint
 * - GET /health - Health check endpoint
 *
 * Test coverage:
 * - Basic connectivity
 * - API availability
 * - Health check functionality
 * - Response format validation
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';

class SimpleTest {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.baseUrl = TEST_CONFIG.baseUrl;
  }

  /**
   * Run all tests
   */
  async runAll() {
    this.logger.logSuiteHeader('🧪 Starting Simple Test Suite');

    const tests = [
      this.testRootEndpoint,
      this.testAPIEndpoint,
      this.testHealthEndpoint,
      this.testConnectivity
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

  /**
   * Test root endpoint connectivity
   */
  async testRootEndpoint() {
    this.logger.info('Testing root endpoint connectivity...');

    try {
      this.logger.info(`Base URL: ${this.baseUrl}`);
      const response = await this.client.get('/');

      this.assert.assertEqual(response.status, 200, 'Root endpoint should be accessible');
      this.assert.exists(response.data, 'Should return response data');

      this.logger.info(`Response status: ${response.status}`);
      this.logger.info(`Response data: ${JSON.stringify(response.data)}`);
      this.logger.success('Root endpoint test completed successfully');
    } catch (error) {
      this.logger.error(`[testRootEndpoint] Root endpoint test failed: ${error.message}`);
      if (error.response) {
        this.logger.error(`Response status: ${error.response.status}`);
        this.logger.error(`Response data: ${JSON.stringify(error.response.data)}`);
      }
      throw error;
    }
  }

  /**
   * Test API info endpoint
   */
  async testAPIEndpoint() {
    this.logger.info('Testing API info endpoint...');

    try {
      const response = await this.client.get(API_ENDPOINTS.api);

      this.assert.assertEqual(response.status, 401, 'Main API route should not be accessible');

      this.logger.info(`API status: ${response.data.status}`);
      this.logger.success('API info endpoint test completed successfully');
    } catch (error) {
      this.logger.error(`[testAPIEndpoint] API info endpoint test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test health check endpoint
   */
  async testHealthEndpoint() {
    this.logger.info('Testing health check endpoint...');

    try {
      const response = await this.client.get(API_ENDPOINTS.health);

      this.assert.assertEqual(response.status, 200, 'Health endpoint should be accessible');
      this.assert.exists(response.data, 'Should return health data');

      // Check for common health response fields
      if (response.data.status) {
        this.assert.assertEqual(response.data.status, 'healthy', 'Service should be healthy');
      }

      this.logger.info(`Health status: ${response.data.status || 'OK'}`);
      this.logger.success('Health check test completed successfully');
    } catch (error) {
      this.logger.error(`[testHealthEndpoint] Health check test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test basic connectivity and response times
   */
  async testConnectivity() {
    this.logger.info('Testing basic connectivity and response times...');

    try {
      const startTime = Date.now();
      const response = await this.client.get('/');
      const responseTime = Date.now() - startTime;

      this.assert.assertEqual(response.status, 200, 'Should connect successfully');
      this.assert.assertEqual(responseTime < 5000, true, 'Response time should be under 5 seconds');

      this.logger.info(`Response time: ${responseTime}ms`);
      this.logger.info(`Connection: ${response.status === 200 ? 'SUCCESS' : 'FAILED'}`);
      this.logger.success('Connectivity test completed successfully');
    } catch (error) {
      this.logger.error(`[testConnectivity] Connectivity test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { SimpleTest };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new SimpleTest();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
