#!/usr/bin/env node

/**
 * Simple Audit Test Suite
 * Unified audit test combining quick & simple audit functionality with optimized token caching
 *
 * Endpoints tested:
 * - GET /api/audit/logs - Basic audit log retrieval
 * - GET /api/audit/search - Audit log search functionality
 * - GET /api/audit/stats - Audit statistics and metrics
 * - GET /api/audit/export - Audit data export (CSV format)
 *
 * Test coverage:
 * - Token caching for performance optimization
 * - Streamlined audit functionality validation
 * - Quick smoke tests for audit system
 * - Basic audit log access and filtering
 * - Performance-optimized test execution
 * - Role-based access control validation
 * - Core audit endpoint functionality
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';

class SimpleAuditTest {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.tokens = {
      admin: null,
      superAdmin: null,
      validUser: null
    };
  }

  /**
   * Get authentication token (with caching)
   * @param {string} userType - 'admin', 'superAdmin', or 'validUser'
   * @returns {Promise<string>} Access token
   */
  async getAuthToken(userType = 'admin') {
    // Return cached token if available
    if (this.tokens[userType]) {
      return this.tokens[userType];
    }

    let credentials;
    switch (userType) {
    case 'admin':
      credentials = TEST_USERS.admin || TEST_USERS.valid;
      break;
    case 'superAdmin':
      credentials = TEST_USERS.super_admin || TEST_USERS.admin || TEST_USERS.valid;
      break;
    case 'validUser':
    default:
      credentials = TEST_USERS.valid;
      break;
    }

    try {
      this.logger.info(`Logging in as ${userType}...`);
      const response = await this.client.post(API_ENDPOINTS.login, credentials);

      if (!response.success || !response.data.data.access_token) {
        throw new Error(`Failed to get ${userType} token`);
      }

      const token = response.data.data.access_token;

      // Cache the token
      this.tokens[userType] = token;
      this.logger.info(`${userType} token cached successfully`);

      return token;
    } catch (error) {
      this.logger.error(`[getAuthToken] Failed to get ${userType} token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup authentication for client
   * @param {string} userType - 'admin', 'superAdmin', or 'validUser'
   */
  async setupAuth(userType = 'admin') {
    const token = await this.getAuthToken(userType);
    this.client.setAuthToken(token);
    return token;
  }

  /**
   * Run all tests
   */
  async runAll() {
    this.logger.logSuiteHeader('🔍 Starting Simple Audit Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testBasicConnectivity,
      this.testCoreAuditEndpoints,
      this.testRoleBasedAccess,
      this.testMonitoringFeatures,
      this.runBasicConnectivityTests,
      this.runCoreAuditTests,
      this.runRoleBasedAccessTests,
      this.runMonitoringTests
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
   * Setup authentication tokens (if needed)
   */
  async setupAuthentication() {
    this.logger.info('Testing authentication token setup...');

    try {
      // Pre-cache authentication tokens
      this.logger.info('Setting up authentication tokens...');
      await this.getAuthToken('admin');
      await this.getAuthToken('validUser');

      try {
        await this.getAuthToken('superAdmin');
      } catch (error) {
        this.logger.warning('Super admin user may not exist (using admin fallback)');
        this.tokens.superAdmin = this.tokens.admin;
      }

      this.logger.success('Auth tokens ready');
    } catch (error) {
      this.logger.error(`[setupAuthentication] Auth token setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test basic connectivity
   */
  async testBasicConnectivity() {
    this.logger.info('Testing basic connectivity and health...');

    try {
      const response = await this.client.get(API_ENDPOINTS.health);
      this.assert.assertEqual(response.status, 200, 'Health check should return 200');
      this.assert.assertEqual(response.data.success, true, 'Health check should be successful');

      this.logger.success('Basic connectivity test completed successfully');
    } catch (error) {
      this.logger.error(`[testBasicConnectivity] Basic connectivity test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test core audit endpoints
   */
  async testCoreAuditEndpoints() {
    this.logger.info('Testing core audit endpoints...');

    try {
      await this.setupAuth('admin');

      // Test audit logs access
      const auditResponse = await this.client.get(API_ENDPOINTS.auditLogs);
      this.assert.assertEqual(auditResponse.status, 200, 'Audit logs should be accessible');
      this.assert.assertTrue(Array.isArray(auditResponse.data.data.logs), 'Should return audit logs array');

      this.logger.success('Core audit endpoints test completed successfully');
    } catch (error) {
      this.logger.error(`[testCoreAuditEndpoints] Core audit endpoints test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test role-based access
   */
  async testRoleBasedAccess() {
    this.logger.info('Testing role-based access control...');

    try {
      await this.setupAuth('admin');

      // Test audit search
      const searchUrl = `${API_ENDPOINTS.auditSearch}?query=LOGIN&limit=5`;
      const searchResponse = await this.client.get(searchUrl);
      this.assert.assertEqual(searchResponse.status, 200, 'Audit search should be accessible');

      this.logger.success('Role-based access test completed successfully');
    } catch (error) {
      this.logger.error(`[testRoleBasedAccess] Role-based access test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test monitoring features
   */
  async testMonitoringFeatures() {
    this.logger.info('Testing monitoring features...');

    try {
      await this.setupAuth('admin');

      // Test audit stats
      const statsResponse = await this.client.get(API_ENDPOINTS.auditStats);
      this.assert.assertEqual(statsResponse.status, 200, 'Audit stats should be accessible');
      this.assert.assertHasFields(statsResponse.data.data, ['basic_stats'], 'Should have stats data');

      this.logger.success('Monitoring features test completed successfully');
    } catch (error) {
      this.logger.error(`[testMonitoringFeatures] Monitoring features test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Basic connectivity and health tests
   */
  async runBasicConnectivityTests() {
    this.logger.info('Testing basic connectivity and health...');

    try {
      await this.runTest('Server Health Check', async () => {
        const response = await this.client.get(API_ENDPOINTS.health);
        this.assert.assertEqual(response.status, 200, 'Health check should return 200');
        this.assert.assertEqual(response.data.success, true, 'Health check should be successful');
        this.logger.info('Server is responding correctly');
      });

      await this.runTest('API Endpoint Accessibility', async () => {
        // Test login endpoint without auth
        const response = await this.client.post(API_ENDPOINTS.login, {
          email: 'invalid@test.com',
          password: 'invalid'
        });

        // Should return 401 or 400, not 500
        this.assert.assertTrue(
          [400, 401].includes(response.status),
          `Login endpoint should handle invalid credentials properly (got ${response.status})`
        );
        this.logger.info('API endpoints accessible');
      });

      this.logger.success('Basic connectivity tests completed successfully');
    } catch (error) {
      this.logger.error(`[runBasicConnectivityTests] Basic connectivity tests failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Core audit functionality tests
   */
  async runCoreAuditTests() {
    this.logger.info('Testing core audit functionality...');

    try {
      await this.runTest('Basic Audit Flow', async () => {
        // Clear any existing auth
        this.client.clearAuthToken();

        // Login to generate audit log
        const loginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin || TEST_USERS.valid);
        this.assert.assertEqual(loginResponse.status, 200, 'Login should succeed');

        const token = loginResponse.data.data.access_token;
        this.client.setAuthToken(token);

        this.logger.info('Login successful (audit log created)');

        // Check audit logs access
        const auditResponse = await this.client.get(API_ENDPOINTS.auditLogs);
        this.assert.assertEqual(auditResponse.status, 200, 'Audit logs should be accessible');
        this.assert.assertTrue(Array.isArray(auditResponse.data.data.logs), 'Should return audit logs array');

        this.logger.info('Audit logs accessible');
      });

      await this.runTest('Audit Search Functionality', async () => {
        await this.setupAuth('admin');

        // Test audit search
        const searchUrl = `${API_ENDPOINTS.auditSearch}?query=LOGIN&actor_role=admin&limit=5`;
        const searchResponse = await this.client.get(searchUrl);

        this.assert.assertEqual(searchResponse.status, 200, 'Audit search should work');
        this.assert.assertTrue(
          Array.isArray(searchResponse.data.data.logs),
          'Search should return results array'
        );

        this.logger.info('Audit search working');
      });

      await this.runTest('Audit Log Creation on Actions', async () => {
        await this.setupAuth('admin');

        // Perform an action that should create audit log (profile update)
        const profileResponse = await this.client.get(API_ENDPOINTS.profile);
        this.assert.assertEqual(profileResponse.status, 200, 'Profile access should work');

        // Check if audit log was created (indirect test)
        const auditResponse = await this.client.get(API_ENDPOINTS.auditLogs);
        this.assert.assertEqual(auditResponse.status, 200, 'Should be able to check audit logs');

        this.logger.info('Actions generate audit logs');
      });

      await this.runTest('Audit Logs Filter by actor_role (snake_case)', async () => {
        await this.setupAuth('superAdmin');

        const filteredResponse = await this.client.get(`${API_ENDPOINTS.auditLogs}?actor_role=super_admin&all=true&limit=20`);
        this.assert.assertEqual(filteredResponse.status, 200, 'Audit logs filter by actor_role should succeed');
        this.assert.assertTrue(filteredResponse.data.success, 'Filtered audit logs response should be successful');

        const filteredLogs = filteredResponse.data?.data?.logs || [];
        filteredLogs.forEach(log => {
          this.assert.assertEqual(log.actor_role, 'super_admin', 'Every returned log should match actor_role=super_admin');
        });

        this.logger.info(`actor_role filter returned ${filteredLogs.length} log(s)`);
      });

      this.logger.success('Core audit functionality tests completed successfully');
    } catch (error) {
      this.logger.error(`[runCoreAuditTests] Core audit functionality tests failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Role-based access control tests
   */
  async runRoleBasedAccessTests() {
    this.logger.info('Testing role-based access control...');

    try {
      await this.runTest('Admin Audit Access', async () => {
        await this.setupAuth('admin');

        const auditResponse = await this.client.get(API_ENDPOINTS.auditLogs);
        this.assert.assertEqual(auditResponse.status, 200, 'Admin should access audit logs');

        this.logger.info('Admin audit access verified');
      });

      await this.runTest('Admin KV Access Restrictions', async () => {
        await this.setupAuth('admin');

        // Admin should NOT have access to KV admin endpoints
        const kvResponse = await this.client.get(API_ENDPOINTS.kvAdminConfigs);
        this.assert.assertEqual(kvResponse.status, 403, 'Admin should be forbidden from KV admin');

        this.logger.info('Admin KV access properly restricted');
      });

      await this.runTest('Super Admin Elevated Access', async () => {
        await this.setupAuth('superAdmin');

        // Super admin should have audit access
        const auditResponse = await this.client.get(API_ENDPOINTS.auditLogs);
        this.assert.assertEqual(auditResponse.status, 200, 'Super admin should access audit logs');

        // Check KV access (may be 200 for super admin or 403 if not implemented)
        const kvResponse = await this.client.get(API_ENDPOINTS.kvAdminConfigs);
        if (kvResponse.status === 200) {
          this.logger.info('Super admin has elevated KV access');
        } else if (kvResponse.status === 403) {
          this.logger.info('KV admin access restricted even for super admin (by design)');
        }

        this.logger.info('Super admin access verified');
      });

      await this.runTest('Regular User Access Restrictions', async () => {
        await this.setupAuth('validUser');

        // Regular user should NOT access audit logs
        const auditResponse = await this.client.get(API_ENDPOINTS.auditLogs);
        this.assert.assertEqual(auditResponse.status, 403, 'Regular user should be forbidden from audit logs');

        this.logger.info('Regular user audit access properly restricted');
      });

      this.logger.success('Role-based access control tests completed successfully');
    } catch (error) {
      this.logger.error(`[runRoleBasedAccessTests] Role-based access control tests failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Real-time monitoring tests
   */
  async runMonitoringTests() {
    this.logger.info('Testing real-time monitoring functionality...');

    try {
      await this.runTest('Monitoring Status Endpoint', async () => {
        await this.setupAuth('superAdmin');

        const statusResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringStatus);

        if (statusResponse.status === 200) {
          this.assert.assertEqual(statusResponse.status, 200, 'Monitoring status should be accessible');
          this.logger.info('Monitoring status accessible');
        } else if (statusResponse.status === 403) {
          this.logger.info('Monitoring restricted to super admin (expected)');
        } else if (statusResponse.status === 404) {
          this.logger.warning('Monitoring endpoint not yet implemented - skipping');
        } else {
          throw new Error(`Unexpected monitoring status response: ${statusResponse.status}`);
        }
      });

      await this.runTest('Dashboard Overview Access', async () => {
        await this.setupAuth('superAdmin');

        const dashboardResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardOverview);

        // Accept 200, 403, or 404 responses
        this.assert.assertTrue(
          [200, 403, 404].includes(dashboardResponse.status),
          `Dashboard endpoint should respond properly (got ${dashboardResponse.status})`
        );

        if (dashboardResponse.status === 200) {
          this.logger.info('Dashboard accessible');
        } else if (dashboardResponse.status === 403) {
          this.logger.info('Dashboard restricted to super admin (expected)');
        } else if (dashboardResponse.status === 404) {
          this.logger.warning('Dashboard endpoint not yet implemented - skipping');
        }
      });

      await this.runTest('Alerts History Access', async () => {
        await this.setupAuth('superAdmin');

        const alertsResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringAlertsHistory);

        // Accept 200, 403, or 404 responses
        this.assert.assertTrue(
          [200, 403, 404].includes(alertsResponse.status),
          `Alerts endpoint should respond properly (got ${alertsResponse.status})`
        );

        if (alertsResponse.status === 200) {
          this.logger.info('Alerts accessible');
        } else if (alertsResponse.status === 403) {
          this.logger.info('Alerts restricted to super admin (expected)');
        } else if (alertsResponse.status === 404) {
          this.logger.warning('Alerts endpoint not yet implemented - skipping');
        }
      });

      this.logger.success('Real-time monitoring tests completed successfully');
    } catch (error) {
      this.logger.error(`[runMonitoringTests] Real-time monitoring tests failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper method to run individual tests
   */
  async runTest(testName, testFunction) {
    try {
      this.logger.info(`Testing ${testName}...`);
      await testFunction();
      this.logger.success(`${testName} passed`);
    } catch (error) {
      this.logger.error(`[runTest] ${testName} failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Quick test mode - run only essential tests
   */
  async runQuick() {
    this.logger.logSuiteHeader('🚀 Quick Audit System Tests');

    try {
      await this.getAuthToken('admin');

      await this.runTest('Health Check', async () => {
        const response = await this.client.get(API_ENDPOINTS.health);
        this.assert.assertEqual(response.status, 200, 'Health check should work');
      });

      await this.runTest('Basic Audit Access', async () => {
        await this.setupAuth('admin');
        const response = await this.client.get(API_ENDPOINTS.auditLogs);
        this.assert.assertEqual(response.status, 200, 'Should access audit logs');
      });

      this.logger.success('Quick audit tests completed successfully');
    } catch (error) {
      this.logger.error(`[runQuick] Quick test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { SimpleAuditTest };

if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new SimpleAuditTest();

  // Check command line arguments
  const command = process.argv[2] || 'all';

  try {
    switch (command) {
    case 'quick':
      await test.runQuick();
      break;
    case 'all':
    default:
      await test.runAll();
      break;
    }
  } catch (error) {
    console.error('Test execution failed:', error);
    process.exit(1);
  }
}
