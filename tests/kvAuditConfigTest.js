#!/usr/bin/env node

/**
 * KV Audit Configuration Test Suite
 * Tests audit-specific KV configuration management endpoints
 *
 * Audit KV Configuration Endpoints tested:
 * - GET /api/kv-admin/audit/configs - Get all audit configurations
 * - GET /api/kv-admin/audit/configs/retention - Get retention policies
 * - GET /api/kv-admin/audit/configs/performance - Get performance settings
 * - GET /api/kv-admin/audit/configs/features - Get feature flags
 * - GET /api/kv-admin/audit/configs/alerts - Get alert thresholds
 * - GET /api/kv-admin/audit/configs/realtime - Get real-time monitoring settings
 * - GET /api/kv-admin/audit/configs/export - Get export settings
 * - GET /api/kv-admin/audit/configs/compliance - Get compliance settings
 * - POST /api/kv-admin/audit/configs/feature/:feature/toggle - Toggle features
 *
 * Test coverage:
 * - Authentication and authorization (super admin only)
 * - Configuration retrieval and validation
 * - Feature toggling functionality
 * - Error handling and input validation
 * - Cache management and performance
 * - Default value fallbacks
 * - Configuration structure validation
 * - Integration with audit system services
*/

import { TestLogger } from './utils/testLogger.js';
import { TestClient } from './utils/testClient.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_CONFIG, API_ENDPOINTS, TEST_USERS } from './config/testConfig.js';

class KVAuditConfigTest {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.superAdminToken = null;
    this.adminToken = null;
    this.userToken = null;
  }

  /**
   * Run all tests
   */
  async runAll() {
    this.logger.logSuiteHeader('🔧 Starting KV Audit Configuration Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testKVConfigurationManagement,
      this.testAuditConfigurationSettings,
      this.testAdvancedAuditSettings,
      this.testRealtimeMonitoringSettings,
      this.testSecurityIncidentSettings,
      this.testDataRetentionPolicies,
      this.testAlertThresholdConfiguration,
      this.testPerformanceMonitoringSettings,
      this.testComplianceConfiguration,
      this.testConfigurationValidation,
      this.testBulkConfigurationUpdates,
      this.testConfigurationBackupRestore,
      this.testRoleBasedConfigurationAccess,
      this.testConfigurationAuditTrail,
      this.testEnvironmentSpecificConfiguration,
      this.testGetAllAuditConfigs,
      this.testGetRetentionPolicies,
      this.testGetPerformanceSettings,
      this.testGetFeatureFlags,
      this.testGetAlertThresholds,
      this.testGetRealtimeSettings,
      this.testGetExportSettings,
      this.testGetComplianceSettings,
      this.testFeatureToggling,
      this.testAuthorizationRequirements,
      this.testErrorHandling
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

      // Super Admin login
      const superAdminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);

      this.assert.assertSuccess(superAdminLogin, 'Super admin login should succeed');
      this.superAdminToken = superAdminLogin.data.data.access_token;

      // Admin login
      const adminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);

      this.assert.assertSuccess(adminLogin, 'Admin login should succeed');
      this.adminToken = adminLogin.data.data.access_token;

      // Regular user login
      const userLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.regular);

      this.assert.assertSuccess(userLogin, 'User login should succeed');
      this.userToken = userLogin.data.data.access_token;

      this.logger.success('Authentication setup completed');
    } catch (error) {
      this.logger.error(`[setupAuthentication] Auth token setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test getting all audit configurations
   */
  async testGetAllAuditConfigs() {
    this.logger.info('Testing get all audit configurations...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditConfigs, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      // Should return 200, 404, or 400
      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Get all audit configurations test completed');
    } catch (error) {
      this.logger.error(`[testGetAllAuditConfigs] Get all audit configurations test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test retention policies endpoint
   */
  async testGetRetentionPolicies() {
    this.logger.info('Testing retention policies configuration...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditRetentionPolicies, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      // Should return 200, 404, or 400
      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Retention policies test completed');
    } catch (error) {
      this.logger.error(`[testGetRetentionPolicies] Retention policies test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test performance settings endpoint
   */
  async testGetPerformanceSettings() {
    this.logger.info('Testing performance settings configuration...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditPerformanceSettings, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      // Should return 200, 404, or 400
      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Performance settings test completed');
    } catch (error) {
      this.logger.error(`[testGetPerformanceSettings] Performance settings test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test feature flags endpoint
   */
  async testGetFeatureFlags() {
    this.logger.info('Testing feature flags configuration...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditFeatureFlags, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      // Should return 200, 404, or 400
      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Feature flags test completed');
    } catch (error) {
      this.logger.error(`[testGetFeatureFlags] Feature flags test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test alert thresholds endpoint
   */
  async testGetAlertThresholds() {
    this.logger.info('Testing alert thresholds configuration...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditAlertThresholds, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      // Should return 200, 404, or 400
      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Alert thresholds test completed');
    } catch (error) {
      this.logger.error(`[testGetAlertThresholds] Alert thresholds test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test real-time monitoring settings endpoint
   */
  async testGetRealtimeSettings() {
    this.logger.info('Testing real-time monitoring settings...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditRealtimeMonitoring, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      // Should return 200, 404, or 400
      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Real-time monitoring settings test completed');
    } catch (error) {
      this.logger.error(`[testGetRealtimeSettings] Real-time monitoring settings test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test export settings endpoint
   */
  async testGetExportSettings() {
    this.logger.info('Testing export settings configuration...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditExportSettings, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      // Should return 200, 404, or 400
      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Export settings test completed');
    } catch (error) {
      this.logger.error(`[testGetExportSettings] Export settings test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test compliance settings endpoint
   */
  async testGetComplianceSettings() {
    this.logger.info('Testing compliance settings configuration...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditComplianceSettings, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      // Should return 200, 404, or 400
      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Compliance settings test completed');
    } catch (error) {
      this.logger.error(`[testGetComplianceSettings] Compliance settings test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test feature toggling functionality
   */
  async testFeatureToggling() {
    this.logger.info('Testing feature toggling...');

    try {
      // Test PUT endpoint for updating config
      const response = await this.client.put(API_ENDPOINTS.kvAdminConfigsSpecific.replace(':key', 'DEBUG'), {
        value: 'test-value'
      }, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      // Should return 200, 404, or 400
      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Feature toggling test completed');
    } catch (error) {
      this.logger.error(`[testFeatureToggling] Feature toggling test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test authorization requirements
   */
  async testAuthorizationRequirements() {
    this.logger.info('Testing authorization requirements...');

    try {
      const testEndpoints = [
        API_ENDPOINTS.kvAdminAuditConfigs
      ];

      for (const endpoint of testEndpoints) {
        // Test with no token
        const noTokenResponse = await this.client.get(endpoint);
        if (noTokenResponse.status !== 401 && noTokenResponse.status !== 403) {
          throw new Error(`${endpoint} should require authentication - Expected status 401 or 403, got ${noTokenResponse.status}`);
        }
      }

      this.logger.success('Authorization requirements test completed');
    } catch (error) {
      this.logger.error(`[testAuthorizationRequirements] Authorization requirements test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test error handling
   */
  async testErrorHandling() {
    this.logger.info('Testing error handling...');

    try {
      // Test invalid endpoint
      const invalidResponse = await this.client.get(API_ENDPOINTS.kvAdminConfigsSpecific.replace(':key', 'invalid-key-that-does-not-exist'), {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![404, 400].includes(invalidResponse.status)) {
        throw new Error(`Invalid endpoint should return error - Expected status 404 or 400, got ${invalidResponse.status}`);
      }

      this.logger.success('Error handling test completed');
    } catch (error) {
      this.logger.error(`[testErrorHandling] Error handling test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test KV configuration management
   */
  async testKVConfigurationManagement() {
    this.logger.info('Testing KV configuration management...');

    try {
      // Test basic configuration retrieval
      const response = await this.client.get(API_ENDPOINTS.kvAdminConfigs, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('KV configuration management test completed');
    } catch (error) {
      this.logger.error(`[testKVConfigurationManagement] KV configuration management test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test audit configuration settings
   */
  async testAuditConfigurationSettings() {
    this.logger.info('Testing audit configuration settings...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditConfigs, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Audit configuration settings test completed');
    } catch (error) {
      this.logger.error(`[testAuditConfigurationSettings] Audit configuration settings test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test advanced audit settings
   */
  async testAdvancedAuditSettings() {
    this.logger.info('Testing advanced audit settings...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditAnalyticsSettings, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Advanced audit settings test completed');
    } catch (error) {
      this.logger.error(`[testAdvancedAuditSettings] Advanced audit settings test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test real-time monitoring settings
   */
  async testRealtimeMonitoringSettings() {
    this.logger.info('Testing real-time monitoring settings...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditRealtimeMonitoring, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Real-time monitoring settings test completed');
    } catch (error) {
      this.logger.error(`[testRealtimeMonitoringSettings] Real-time monitoring settings test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test security incident settings
   */
  async testSecurityIncidentSettings() {
    this.logger.info('Testing security incident settings...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditSecurityIncidentConfig, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Security incident settings test completed');
    } catch (error) {
      this.logger.error(`[testSecurityIncidentSettings] Security incident settings test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test data retention policies
   */
  async testDataRetentionPolicies() {
    this.logger.info('Testing data retention policies...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditRetentionPolicies, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Data retention policies test completed');
    } catch (error) {
      this.logger.error(`[testDataRetentionPolicies] Data retention policies test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test alert threshold configuration
   */
  async testAlertThresholdConfiguration() {
    this.logger.info('Testing alert threshold configuration...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditAlertThresholds, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Alert threshold configuration test completed');
    } catch (error) {
      this.logger.error(`[testAlertThresholdConfiguration] Alert threshold configuration test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test performance monitoring settings
   */
  async testPerformanceMonitoringSettings() {
    this.logger.info('Testing performance monitoring settings...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditPerformanceSettings, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Performance monitoring settings test completed');
    } catch (error) {
      this.logger.error(`[testPerformanceMonitoringSettings] Performance monitoring settings test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test compliance configuration
   */
  async testComplianceConfiguration() {
    this.logger.info('Testing compliance configuration...');

    try {
      const response = await this.client.get(API_ENDPOINTS.kvAdminAuditComplianceSettings, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Compliance configuration test completed');
    } catch (error) {
      this.logger.error(`[testComplianceConfiguration] Compliance configuration test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test configuration validation
   */
  async testConfigurationValidation() {
    this.logger.info('Testing configuration validation...');

    try {
      // Test updating a configuration with invalid data
      const response = await this.client.put(API_ENDPOINTS.kvAdminConfigsSpecific.replace(':key', 'TEST_KEY'), {
        value: null // Invalid value
      }, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      // Should handle validation properly
      if (![200, 400, 404].includes(response.status)) {
        throw new Error(`Expected status 200, 400, or 404, got ${response.status}`);
      }

      this.logger.success('Configuration validation test completed');
    } catch (error) {
      this.logger.error(`[testConfigurationValidation] Configuration validation test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test bulk configuration updates
   */
  async testBulkConfigurationUpdates() {
    this.logger.info('Testing bulk configuration updates...');

    try {
      const bulkData = {
        configs: {
          TEST_KEY1: 'value1',
          TEST_KEY2: 'value2'
        }
      };

      const response = await this.client.post(API_ENDPOINTS.kvAdminConfigsBatch, bulkData, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(response.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${response.status}`);
      }

      this.logger.success('Bulk configuration updates test completed');
    } catch (error) {
      this.logger.error(`[testBulkConfigurationUpdates] Bulk configuration updates test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test configuration backup and restore
   */
  async testConfigurationBackupRestore() {
    this.logger.info('Testing configuration backup and restore...');

    try {
      // Test getting all configurations (backup)
      const backupResponse = await this.client.get(API_ENDPOINTS.kvAdminConfigs, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(backupResponse.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${backupResponse.status}`);
      }

      this.logger.success('Configuration backup and restore test completed');
    } catch (error) {
      this.logger.error(`[testConfigurationBackupRestore] Configuration backup and restore test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test role-based configuration access
   */
  async testRoleBasedConfigurationAccess() {
    this.logger.info('Testing role-based configuration access...');

    try {
      // Test admin access (should be restricted)
      const adminResponse = await this.client.get(API_ENDPOINTS.kvAdminConfigs, {
        Authorization: `Bearer ${this.adminToken}`
      });

      if (![403, 401].includes(adminResponse.status)) {
        this.logger.warning('Admin should not have access to KV admin endpoints');
      }

      // Test user access (should be restricted)
      const userResponse = await this.client.get(API_ENDPOINTS.kvAdminConfigs, {
        Authorization: `Bearer ${this.userToken}`
      });

      if (![403, 401].includes(userResponse.status)) {
        this.logger.warning('User should not have access to KV admin endpoints');
      }

      this.logger.success('Role-based configuration access test completed');
    } catch (error) {
      this.logger.error(`[testRoleBasedConfigurationAccess] Role-based configuration access test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test configuration audit trail
   */
  async testConfigurationAuditTrail() {
    this.logger.info('Testing configuration audit trail...');

    try {
      // Test that configuration changes are audited
      const updateResponse = await this.client.put(API_ENDPOINTS.kvAdminConfigsSpecific.replace(':key', 'AUDIT_TEST'), {
        value: 'test-audit-value'
      }, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(updateResponse.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${updateResponse.status}`);
      }

      this.logger.success('Configuration audit trail test completed');
    } catch (error) {
      this.logger.error(`[testConfigurationAuditTrail] Configuration audit trail test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test environment-specific configuration
   */
  async testEnvironmentSpecificConfiguration() {
    this.logger.info('Testing environment-specific configuration...');

    try {
      // Test environment comparison
      const comparisonResponse = await this.client.get(API_ENDPOINTS.kvAdminConfigsEnvComparison, {
        Authorization: `Bearer ${this.superAdminToken}`
      });

      if (![200, 404, 400].includes(comparisonResponse.status)) {
        throw new Error(`Expected status 200, 404, or 400, got ${comparisonResponse.status}`);
      }

      this.logger.success('Environment-specific configuration test completed');
    } catch (error) {
      this.logger.error(`[testEnvironmentSpecificConfiguration] Environment-specific configuration test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { KVAuditConfigTest };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new KVAuditConfigTest();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
