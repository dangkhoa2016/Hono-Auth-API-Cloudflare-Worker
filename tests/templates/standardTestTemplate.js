#!/usr/bin/env node

/**
 * Standard Test Template
 * Standard template for all test files
 *
 * Standard rules:
 * 1. Initialize class in order: logger, client, assert, other properties
 * 2. Use this.logger[(<type>)] for consistent logging
 * 3. Use this.assert.* for consistent assertions
 * 4. Handle errors and return results in standard format
 * 5. Use consistent try-catch pattern in runAll()
*/

// import { TestClient } from './utils/testClient.js';
// import { TestLogger } from './utils/testLogger.js';
// import { TestAssertions } from './utils/testAssertions.js';
// import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';
import { TestClient } from '../utils/testClient.js';
import { TestLogger } from '../utils/testLogger.js';
import { TestAssertions } from '../utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from '../config/testConfig.js';

class StandardTestTemplate {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.testUser = TEST_USERS.valid;
    this.accessToken = null;
  }

  /**
   * Run all tests
   */
  async runAll() {
    this.logger.logSuiteHeader('🧪 Starting [Test Name] Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testExample1,
      this.testExample2,
      // ... add other tests
    ];

    // Process tests using standard pattern
    for (const test of tests) {
      try {
        await test.call(this);
        this.logger.recordResult(true);
        this.logger.success(`${test.name} passed`);
      } catch (error) {
        this.logger.recordResult(false);
        this.logger.error(`[${test.name}] failed: ${error.message}`);
      }
    }

    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      process.exit(1);
    }
  }

  /**
   * Setup authentication (if needed)
   */
  async setupAuthentication() {
    try {
      this.logger.info('Setting up authentication...');
      const response = await this.client.post(API_ENDPOINTS.login, this.testUser);
      this.assert.assertSuccess(response, 'Authentication setup');

      this.accessToken = response.data.data.access_token;
      this.client.setAuthToken(this.accessToken);

      this.logger.success('Authentication setup completed');
    } catch (error) {
      this.logger.error(`[setupAuthentication] Auth token setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test example 1
   */
  async testExample1() {
    this.logger.info('Testing example functionality 1...');

    try {
      const response = await this.client.get(API_ENDPOINTS.health);

      // Use assertions in standard way
      this.assert.assertStatus(response.status, 200, 'Health check');
      this.assert.assertSuccess(response, 'Health check response');

      this.logger.success('Test Example1 completed successfully');
    } catch (error) {
      this.logger.error(`[testExample1] failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test example 2
   */
  async testExample2() {
    this.logger.info('Testing example functionality 2...');

    try {
      const response = await this.client.get(API_ENDPOINTS.version);

      // Standard assertions
      this.assert.assertStatus(response.status, 200, 'Version check');
      this.assert.assertHasFields(response.data.data, ['version', 'name'], 'Version response');

      this.logger.success('Test Example2 completed successfully');
    } catch (error) {
      this.logger.error(`[testExample2] failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { StandardTestTemplate };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new StandardTestTemplate();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
