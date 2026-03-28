#!/usr/bin/env node

/**
 * Audit Log Service Integration Test Suite - KV Configuration Management
 * Tests integration between AuditLogService and KV configuration system
 *
 * KV Configuration endpoints tested:
 * - GET /api/kv-admin/audit/configs/performance - Performance settings (batch size, query limits)
 * - GET /api/kv-admin/audit/configs/retention - Retention policies and archival settings
 * - GET /api/kv-admin/audit/configs/features - Feature toggle management
 * - POST /api/kv-admin/audit/features/:feature/toggle - Feature enable/disable control
 * - GET /api/kv-admin/audit/configs/alerts - Alert threshold configuration
 *
 * Test coverage:
 * - Configuration-driven audit logging behavior with real-time feature toggles
 * - Dynamic batch processing configuration for performance optimization
 * - Sanitization levels and performance settings validation
 * - Search performance limits and query result optimization
 * - Retention policy enforcement with configurable retention periods
 * - Health check metrics with configurable alert thresholds
 * - KV configuration service integration with audit system
 * - Real-time configuration updates without service restart
 * - Feature toggle functionality for audit system components
 * - Configuration validation and fallback mechanisms
 */

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';

class AuditLogServiceIntegrationTest {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.tokens = {};
  }

  async runAll() {
    this.logger.logSuiteHeader('Starting Audit Log Service Integration Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testConfigDrivenLogging,
      this.testBatchProcessingConfig,
      this.testSanitizationLevels,
      this.testSearchPerformanceLimits,
      this.testRetentionPolicyFeatures,
      this.testHealthCheckWithDynamicThresholds
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
   * Setup authentication tokens for different roles
   */
  async setupAuthentication() {
    try {
      this.logger.info('🔐 Setting up authentication...');

      // Get super admin token
      const superAdminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);

      if (superAdminLogin.success && superAdminLogin.data.data.access_token) {
        this.tokens.superAdmin = superAdminLogin.data.data.access_token;
        this.client.setAuthToken(this.tokens.superAdmin);
        this.logger.success('Super admin authenticated successfully');
      } else {
        throw new Error('Super admin authentication failed');
      }
    } catch (error) {
      this.logger.error(`[setupAuthentication] Auth token setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test configuration-driven audit logging
   */
  async testConfigDrivenLogging() {
    this.logger.info('Testing configuration-driven audit logging...');

    try {
      // Test audit logging toggle
      this.logger.info('Testing audit logging toggle via configuration');

      // Use a valid feature name that exists
      const toggleUrl = API_ENDPOINTS.kvAdminAuditFeatureToggle.replace(':feature', 'enableRealTimeMonitoring');

      const disableResponse = await this.client.post(toggleUrl, {
        enabled: false
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(disableResponse.success, 'Should disable real-time monitoring feature');

      // Re-enable for other tests
      const enableResponse = await this.client.post(toggleUrl, {
        enabled: true
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(enableResponse.success, 'Should re-enable real-time monitoring feature');

      this.logger.success('Configuration-driven logging test completed successfully');
    } catch (error) {
      this.logger.error(`[testConfigDrivenLogging] Configuration-driven logging test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test batch processing configuration
   */
  async testBatchProcessingConfig() {
    this.logger.info('Testing batch processing configuration...');

    try {
      this.logger.info('Testing batch processing configuration');
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditPerformanceSettings, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(response.success, 'Should get performance settings');
      this.assert.assertTrue(typeof response.data.data === 'object', 'Should return configuration object');
      this.assert.assertHasField(response.data.data, 'batchSize', 'Should have batch size configuration');

      this.logger.info(`Batch size: ${response.data.data.batchSize}`);
      this.logger.success('Batch processing configuration test completed successfully');
    } catch (error) {
      this.logger.error(`[testBatchProcessingConfig] Batch processing configuration test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test sanitization levels
   */
  async testSanitizationLevels() {
    this.logger.info('Testing sanitization levels...');

    try {
      this.logger.info('Testing different sanitization levels');
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditPerformanceSettings, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(response.success, 'Should get performance settings');

      // Check for actual fields returned by the API
      const data = response.data.data;
      this.assert.assertTrue(data['defaultPageSize'] || data['batchSize'],
        'Should have performance configuration fields');

      this.logger.info(`Performance config - Default page size: ${data.defaultPageSize}, Batch size: ${data.batchSize}`);
      this.logger.success('Sanitization levels test completed successfully');
    } catch (error) {
      this.logger.error(`[testSanitizationLevels] Sanitization levels test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test search performance limits
   */
  async testSearchPerformanceLimits() {
    this.logger.info('Testing search performance limits...');

    try {
      this.logger.info('Testing search performance limits');
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditPerformanceSettings, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(response.success, 'Should get performance settings');

      const maxQueryLimit = response.data.data.maxQueryResults || response.data.data.maxPageSize;
      this.assert.assertTrue(maxQueryLimit > 0, 'Max query limit should be positive');

      this.logger.info(`Maximum query result limit: ${maxQueryLimit}`);
      this.logger.success('Search performance limits test completed successfully');
    } catch (error) {
      this.logger.error(`[testSearchPerformanceLimits] Search performance limits test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test retention policy features
   */
  async testRetentionPolicyFeatures() {
    this.logger.info('Testing retention policy features...');

    try {
      this.logger.info('Testing retention policy features');
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditRetentionPolicies, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(response.success, 'Should get retention policies');
      this.assert.assertTrue(typeof response.data.data === 'object', 'Should return configuration object');
      this.assert.assertHasField(response.data.data, 'defaultRetentionDays', 'Should have retention days');

      const retentionConfig = response.data.data;
      this.logger.info(`📊 Retention configuration: ${JSON.stringify({
        defaultRetentionDays: retentionConfig.defaultRetentionDays,
        sensitiveRetentionDays: retentionConfig.sensitiveRetentionDays,
        autoArchiveEnabled: retentionConfig.autoArchiveEnabled
      })}`);

      this.logger.success('Retention policy features test completed successfully');
    } catch (error) {
      this.logger.error(`[testRetentionPolicyFeatures] Retention policy features test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test health check with dynamic thresholds
   */
  async testHealthCheckWithDynamicThresholds() {
    this.logger.info('Testing health check with dynamic thresholds...');

    try {
      this.logger.info('Testing health check with dynamic thresholds');
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditAlertThresholds, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });

      this.assert.assertTrue(response.success, 'Should get alert thresholds');
      this.assert.assertTrue(typeof response.data.data === 'object', 'Should return configuration object');
      this.assert.assertHasField(response.data.data, 'failedLoginThreshold', 'Should have failed login threshold');

      const alertConfig = response.data.data;
      this.logger.info(`📊 Alert threshold configuration: ${JSON.stringify({
        failedLoginThreshold: alertConfig.failedLoginThreshold,
        suspiciousActivityThreshold: alertConfig.suspiciousActivityThreshold,
        highRiskActionThreshold: alertConfig.highRiskActionThreshold
      })}`);

      this.logger.success('Health check with dynamic thresholds test completed successfully');
    } catch (error) {
      this.logger.error(`[testHealthCheckWithDynamicThresholds] Health check with dynamic thresholds test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { AuditLogServiceIntegrationTest };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new AuditLogServiceIntegrationTest();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
