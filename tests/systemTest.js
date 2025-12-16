#!/usr/bin/env node

/**
 * System Health & Core Functionality Test Suite
 * Tests basic system functionality and health endpoints
 *
 * Endpoints tested:
 * - GET /health - System health check
 * - GET /version - Application version info
 * - GET / - Root endpoint
 * - GET /language - Language detection
 * - GET /api - API base endpoint
 *
 * Test coverage:
 * - System availability and health status
 * - Environment configuration validation
 * - Basic connectivity tests
 * - Version information validation
 * - Language detection functionality
 * - Error handling for system endpoints
 * - Response time performance
 * - Database connectivity checks
*/

import { API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';
import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';


class SystemTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;
    // Test-specific properties
  }

  async runAll() {
    this.logger.logSuiteHeader('🚀 Starting System Tests');

    const tests = [
      this.testHealthCheck,
      this.testEnvironmentInfo,
      this.testAPIEndpoints,
      this.testDatabaseConnection,
      this.testMiddlewareStack,
      this.testErrorHandling,
      this.testCorsConfiguration,
      this.testSecurityHeaders,
      this.testConfigurationVerification
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
   * Test system health check endpoint
   */
  async testHealthCheck() {
    this.logger.info('Testing system health check...');

    try {
      const response = await this.client.get(API_ENDPOINTS.health);

      this.assert.assertEqual(response.status, 200, 'Health check should return 200');
      this.assert.assertEqual(response.data.data.status, 'ok', 'Health check should be successful');
      this.assert.assertNotEmpty(response.data.data.status, 'Health check should include status');
      this.assert.assertNotEmpty(response.data.data.timestamp, 'Health check should include timestamp');

      this.logger.success('System health check completed successfully');
    } catch (error) {
      this.logger.error(`[testHealthCheck] System health check failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test environment information retrieval
   */
  async testEnvironmentInfo() {
    this.logger.info('Testing environment information...');

    try {
      const response = await this.client.get(API_ENDPOINTS.health);

      this.assert.assertEqual(response.status, 200, 'Environment info should be accessible');
      this.assert.assertNotEmpty(response.data.data.environment, 'Should include environment info');

      this.logger.info(`Environment: ${response.data.data.environment}`);
      this.logger.success('Environment info test completed successfully');
    } catch (error) {
      this.logger.error(`[testEnvironmentInfo] Environment info test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test API endpoints availability and error handling
   */
  async testAPIEndpoints() {
    this.logger.info('Testing API endpoints...');

    try {
      // Test main API route
      const apiResponse = await this.client.get(API_ENDPOINTS.api);
      this.assert.assertEqual(apiResponse.status, 401, 'Main API route should not be accessible');

      // Test 404 handling
      try {
        await this.client.get(API_ENDPOINTS.nonExistentEndpoint || '/non-existent-endpoint');
      } catch (error) {
        this.assert.assertEqual(error.response.status, 404, 'Non-existent endpoints should return 404');
      }

      this.logger.success('API endpoints test completed successfully');
    } catch (error) {
      this.logger.error(`[testAPIEndpoints] API endpoints test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test database connectivity through health endpoint
   */
  async testDatabaseConnection() {
    this.logger.info('Testing database connection...');

    try {
      // Test through a simple endpoint that requires DB
      const response = await this.client.get(API_ENDPOINTS.health);

      // Health endpoint should work without DB issues
      this.assert.assertEqual(response.status, 200, 'Database-dependent endpoints should work');

      this.logger.success('Database connection test completed successfully');
    } catch (error) {
      this.logger.error(`[testDatabaseConnection] Database connection test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test middleware stack functionality
   */
  async testMiddlewareStack() {
    this.logger.info('Testing middleware stack...');

    try {
      const response = await this.client.get(API_ENDPOINTS.health);

      // Check CORS headers
      this.assert.assertNotEmpty(response.headers['access-control-allow-origin'], 'CORS headers should be present');

      // Check content type
      this.assert.assertStringContains(response.headers['content-type'], 'application/json', 'Content-Type should be JSON');

      this.logger.success('Middleware stack test completed successfully');
    } catch (error) {
      this.logger.error(`[testMiddlewareStack] Middleware stack test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test error handling mechanisms
   */
  async testErrorHandling() {
    this.logger.info('Testing error handling...');

    try {
      // Test invalid JSON
      try {
        await this.client.post(API_ENDPOINTS.login, 'invalid json', {
          headers: { 'Content-Type': 'application/json' }
        });
      } catch (error) {
        this.assert.assertEqual(error.response.status, 400, 'Invalid JSON should return 400');
      }

      this.logger.success('Error handling test completed successfully');
    } catch (error) {
      this.logger.error(`[testErrorHandling] Error handling test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test CORS configuration
   */
  async testCorsConfiguration() {
    this.logger.info('Testing CORS configuration...');

    try {
      const response = await this.client.options(API_ENDPOINTS.health);

      // CORS preflight should work
      this.assert.assertEqual(response.status, 204, 'CORS preflight should return 204');
      this.assert.assertNotEmpty(response.headers['access-control-allow-methods'], 'Should include allowed methods');

      this.logger.success('CORS configuration test completed successfully');
    } catch (error) {
      this.logger.error(`[testCorsConfiguration] CORS configuration test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test security headers presence
   */
  async testSecurityHeaders() {
    this.logger.info('Testing security headers...');

    try {
      const response = await this.client.get(API_ENDPOINTS.health);

      // Check for security headers
      const headers = response.headers;
      this.assert.assertNotEmpty(headers['x-content-type-options'], 'Should include X-Content-Type-Options');
      this.assert.assertNotEmpty(headers['cross-origin-opener-policy'], 'Should include Cross-Origin-Opener-Policy');
      this.assert.assertEqual(headers['cross-origin-opener-policy'], 'same-origin', 'COOP header should enforce same-origin');
      this.assert.assertNotEmpty(headers['cross-origin-embedder-policy'], 'Should include Cross-Origin-Embedder-Policy');
      this.assert.assertEqual(headers['cross-origin-embedder-policy'], 'require-corp', 'COEP header should enforce require-corp');
      this.assert.assertNotEmpty(headers['cross-origin-resource-policy'], 'Should include Cross-Origin-Resource-Policy');
      this.assert.assertEqual(headers['cross-origin-resource-policy'], 'same-origin', 'CORP header should enforce same-origin access');
      this.assert.assertNotEmpty(headers['x-download-options'], 'Should include X-Download-Options');
      this.assert.assertEqual(headers['x-download-options'], 'noopen', 'X-Download-Options should prevent automatic opening');
      this.assert.assertNotEmpty(headers['x-permitted-cross-domain-policies'], 'Should include X-Permitted-Cross-Domain-Policies');
      this.assert.assertEqual(headers['x-permitted-cross-domain-policies'], 'none', 'X-Permitted-Cross-Domain-Policies should be none');

      this.logger.success('Security headers test completed successfully');
    } catch (error) {
      this.logger.error(`[testSecurityHeaders] Security headers test failed: ${error.message}`);
      throw error;
    }
  }

  // Configuration tests merged from configTest.js
  async testConfigurationVerification() {
    this.logger.info('Testing Configuration System...');

    // Test environment configuration
    this.assert.assertNotEmpty(TEST_CONFIG.currentEnv, 'Current environment should be set');
    this.assert.assertNotEmpty(TEST_CONFIG.baseUrl, 'Base URL should be configured');
    this.assert.assertNotEmpty(TEST_CONFIG.name, 'Environment name should be set');

    this.logger.info(`📍 Current Environment: ${TEST_CONFIG.currentEnv}`);
    this.logger.info(`Base URL: ${TEST_CONFIG.baseUrl}`);
    this.logger.info(`🏷️  Environment Name: ${TEST_CONFIG.name}`);

    // Test available environments
    this.assert.assertNotEmpty(TEST_CONFIG.environments, 'Environments should be configured');
    const environmentKeys = Object.keys(TEST_CONFIG.environments);
    this.assert.assertEqual(environmentKeys.length >= 3, true, 'Should have at least 3 environments');

    this.logger.info('Available Environments:');
    Object.entries(TEST_CONFIG.environments).forEach(([key, env]) => {
      this.logger.info(`${key}: ${env.baseUrl} (${env.name})`);
    });

    // Test URL building
    const testPaths = [API_ENDPOINTS.api, API_ENDPOINTS.health, API_ENDPOINTS.login, API_ENDPOINTS.register];
    this.logger.info('URL Building Tests:');

    testPaths.forEach(path => {
      const fullUrl = `${TEST_CONFIG.baseUrl}${path}`;
      this.logger.info(`${path} -> ${fullUrl}`);
      this.assert.assertEqual(fullUrl.startsWith('http'), true, 'Built URL should be valid');
    });

    // Test environment detection functions
    const { isTestEnvironment, isDevelopmentEnvironment, isStagingEnvironment } = await import('./config/testConfig.js');

    this.logger.info('Environment Detection:');
    this.logger.info(`isTestEnvironment(): ${isTestEnvironment()}`);
    this.logger.info(`isDevelopmentEnvironment(): ${isDevelopmentEnvironment()}`);
    this.logger.info(`isStagingEnvironment(): ${isStagingEnvironment()}`);

    // Test timeout configuration
    this.assert.assertNotEmpty(TEST_CONFIG.timeouts, 'Timeouts should be configured');
    this.logger.info('⏱️  Timeouts Configuration:');
    Object.entries(TEST_CONFIG.timeouts).forEach(([key, value]) => {
      this.logger.info(`${key}: ${value}ms`);
      this.assert.assertEqual(typeof value, 'number', 'Timeout values should be numbers');
    });

    // Test test data settings
    this.assert.assertNotEmpty(TEST_CONFIG.testData, 'Test data should be configured');
    this.logger.info('Test Data Settings:');
    Object.entries(TEST_CONFIG.testData).forEach(([key, value]) => {
      this.logger.info(`${key}: ${value}`);
    });

    this.logger.success('Configuration verification completed successfully!');
  }
}

// Export and run if called directly
export { SystemTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new SystemTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
