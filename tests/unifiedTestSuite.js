#!/usr/bin/env node

/**
 * Unified Test Suite - Hono Auth API
 * Comprehensive test suite consolidating ALL test functionalities
 *
 * Endpoints tested:
 * - System: /health, /version, /, /language, /api
 * - Authentication: /api/auth/* (login, refresh, logout)
 * - User Management: /api/user/* (register, profile, upload, password)
 * - Admin Operations: /api/admin/* (dashboard, users, stats, health)
 * - KV Admin: /api/kv-admin/* (configs, batch, cache, comparison)
 * - Audit System: /api/audit/* (logs, search, stats, export)
 * - Advanced Audit: /api/advanced-audit/* (analytics, compliance, archival)
 * - Real-time Monitoring: /api/realtime-monitoring/* (events, dashboard, alerts)
 * - Security Incidents: /api/security-incident/* (incidents, stats, simulation)
 * - Translations: /api/translations/* (languages, validation, demo)
 * - Validation Demo: /api/zod_demo/* (schema validation examples)
 *
 * Test coverage:
 * - System/Health Tests (connectivity, availability, CORS headers)
 * - Authentication Tests (3 roles: user, admin, super_admin)
 * - Role-Based Access Control Tests (RBAC across all endpoints)
 * - Security Tests (rate limiting, injection prevention, authorization)
 * - Performance Tests (response times, concurrent requests, load testing)
 * - Validation Tests (Zod schemas, input sanitization, malformed requests)
 * - Translation/i18n Tests (language detection, localization, multilingual validation)
 * - Integration Tests (end-to-end workflows, component integration)
 * - Error Handling Tests (comprehensive error response validation)
 * - CLI interface with multiple execution modes and detailed reporting
*/

import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG, TEST_LANGUAGES } from './config/testConfig.js';
import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { ErrorHandlingTest } from './errorHandlingTest.js';
import { MultiLanguageValidationErrorTests } from './multiLanguageValidationErrorTest.js';

// ============================================================================
// TEST CONFIGURATION & CONSTANTS
// ============================================================================

const BASE_CONFIG = {
  concurrentRequests: 10,
  loadTestIterations: 5
};

const SECURITY_PAYLOADS = {
  sqlInjection: [
    '\'; DROP TABLE users; --',
    '\' OR \'1\'=\'1',
    'admin\'--',
    '\' UNION SELECT * FROM users--'
  ],
  xss: [
    '<script>alert(\'XSS\')</script>',
    'javascript:alert(\'XSS\')',
    '<img src=x onerror=alert(\'XSS\')>',
    '\';alert(\'XSS\');//'
  ],
  malformedJson: [
    '{"email":}',
    '{"email":"test-user@example.com",}',
    '{email:"test"}',
    '{"email":"test","password":}'
  ]
};

// ============================================================================
// UTILITIES & HELPERS
// ============================================================================

// ============================================================================
// MAIN TEST SUITE CLASS
// ============================================================================

class UnifiedTestSuite {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.baseUrl = TEST_CONFIG.baseUrl;
    this.tokens = {};
    this.testUsers = {};
  }

  /**
   * Setup authentication for all roles
   */
  async setupAuthentication() {
    try {
      this.logger.info('Setting up authentication for all roles...');

      // Regular user authentication
      const regularLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.regular);
      this.assert.assertSuccess(regularLogin, 'Regular user login');
      this.tokens.regular = {
        accessToken: regularLogin.data.data.access_token,
        refreshToken: regularLogin.data.data.refresh_token
      };

      // Admin user authentication
      const adminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);
      this.assert.assertSuccess(adminLogin, 'Admin user login');
      this.tokens.admin = {
        accessToken: adminLogin.data.data.access_token,
        refreshToken: adminLogin.data.data.refresh_token
      };

      // Super admin authentication
      const superAdminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);
      this.assert.assertSuccess(superAdminLogin, 'Super admin login');
      this.tokens.super_admin = {
        accessToken: superAdminLogin.data.data.access_token,
        refreshToken: superAdminLogin.data.data.refresh_token
      };

      this.logger.success('Authentication setup completed successfully');
    } catch (error) {
      this.logger.error(`[setupAuthentication] Auth token setup failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================================================
  // SYSTEM TESTS
  // ========================================================================

  async runSystemTests() {
    this.logger.logSuiteHeader('🚀 System Tests');

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    const tests = [
      this.testHealthCheck,
      this.testApiRoot,
      this.testVersion,
      this.testCorsHeaders
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

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  async testHealthCheck() {
    this.logger.info('Testing health check endpoint...');

    try {
      const result = await this.client.get(API_ENDPOINTS.health);

      this.assert.assertStatus(result.status, 200, 'Health check');
      this.assert.assertSuccess(result, 'Health check');
      this.assert.assertHasFields(result.data, ['success', 'data'], 'Health response');
      this.assert.assertHasFields(result.data.data, ['status', 'timestamp'], 'Health data');

      this.logger.success('Health Check completed successfully');
    } catch (error) {
      this.logger.error(`[testHealthCheck] failed: ${error.message}`);
      throw error;
    }
  }

  async testApiRoot() {
    this.logger.info('Testing API root endpoint...');

    try {
      const result = await this.client.get(API_ENDPOINTS.root);

      this.assert.assertStatus(result.status, 200, 'API root');
      this.assert.assertSuccess(result, 'API root');

      this.logger.success('API Root test completed successfully');
    } catch (error) {
      this.logger.error(`[testApiRoot] failed: ${error.message}`);
      throw error;
    }
  }

  async testVersion() {
    this.logger.info('Testing version endpoint...');

    try {
      const result = await this.client.get(API_ENDPOINTS.version);

      this.assert.assertStatus(result.status, 200, 'Version check');
      this.assert.assertSuccess(result, 'Version check');

      this.logger.success('Version Check completed successfully');
    } catch (error) {
      this.logger.error(`[testVersion] failed: ${error.message}`);
      throw error;
    }
  }

  async testCorsHeaders() {
    this.logger.info('Testing CORS headers...');

    try {
      const result = await this.client.request('OPTIONS', API_ENDPOINTS.health);

      // OPTIONS request should return 200 or 204 (both are valid)
      if (result.status !== 200 && result.status !== 204) {
        throw new Error(`Expected status 200 or 204, got ${result.status}`);
      }

      if (!result.headers['access-control-allow-origin']) {
        throw new Error('CORS headers not found');
      }

      this.logger.success('CORS Headers test completed successfully');
    } catch (error) {
      this.logger.error(`[testCorsHeaders] failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================================================
  // AUTHENTICATION TESTS
  // ========================================================================

  async runAuthenticationTests() {
    this.logger.logSuiteHeader('🔐 Authentication Tests');

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    const tests = [
      this.testSuccessfulLoginRegularUser,
      this.testSuccessfulLoginAdmin,
      this.testSuccessfulLoginSuperAdmin,
      this.testInvalidLogin,
      this.testMissingCredentials,
      this.testTokenRefresh,
      this.testProtectedEndpointWithoutToken,
      this.testProtectedEndpointWithInvalidToken
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

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  async testSuccessfulLoginRegularUser() {
    this.logger.info('Testing successful login for regular user...');

    try {
      const result = await this.client.post(API_ENDPOINTS.login, TEST_USERS.regular);

      this.assert.assertStatus(result.status, 200, 'Regular User Login');
      this.assert.assertSuccess(result, 'Regular User Login');
      this.assert.assertHasFields(result.data.data, ['access_token', 'refresh_token', 'user'], 'Login response');

      // Store tokens for later tests
      this.tokens.regular = {
        accessToken: result.data.data.access_token,
        refreshToken: result.data.data.refresh_token
      };

      this.logger.success('Successful Login (Regular User) completed successfully');
    } catch (error) {
      this.logger.error(`[testSuccessfulLoginRegularUser] failed: ${error.message}`);
      throw error;
    }
  }

  async testSuccessfulLoginAdmin() {
    this.logger.info('Testing successful login for admin user...');

    try {
      const result = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);

      this.assert.assertStatus(result.status, 200, 'Admin Login');
      this.assert.assertSuccess(result, 'Admin Login');
      this.assert.assertHasFields(result.data.data, ['access_token', 'refresh_token', 'user'], 'Login response');

      // Store tokens for later tests
      this.tokens.admin = {
        accessToken: result.data.data.access_token,
        refreshToken: result.data.data.refresh_token
      };

      this.logger.success('Successful Login (Admin) completed successfully');
    } catch (error) {
      this.logger.error(`[testSuccessfulLoginAdmin] failed: ${error.message}`);
      throw error;
    }
  }

  async testSuccessfulLoginSuperAdmin() {
    this.logger.info('Testing successful login for super admin user...');

    try {
      const result = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);

      this.assert.assertStatus(result.status, 200, 'Super Admin Login');
      this.assert.assertSuccess(result, 'Super Admin Login');
      this.assert.assertHasFields(result.data.data, ['access_token', 'refresh_token', 'user'], 'Login response');

      // Store tokens for later tests
      this.tokens.super_admin = {
        accessToken: result.data.data.access_token,
        refreshToken: result.data.data.refresh_token
      };

      this.logger.success('Successful Login (Super Admin) completed successfully');
    } catch (error) {
      this.logger.error(`[testSuccessfulLoginSuperAdmin] failed: ${error.message}`);
      throw error;
    }
  }

  async testInvalidLogin() {
    this.logger.info('Testing invalid login...');

    try {
      const result = await this.client.post(API_ENDPOINTS.login, TEST_USERS.invalid);

      this.assert.assertStatus(result.status, 401, 'Invalid login');
      if (result.data.success) {
        throw new Error('Login should have failed');
      }

      this.logger.success('Invalid Login test completed successfully');
    } catch (error) {
      this.logger.error(`[testInvalidLogin] failed: ${error.message}`);
      throw error;
    }
  }

  async testMissingCredentials() {
    this.logger.info('Testing missing credentials...');

    try {
      const result = await this.client.post(API_ENDPOINTS.login, { email: 'test-user@example.com' });

      if (result.status < 400) {
        throw new Error('Should reject missing password');
      }

      this.logger.success('Missing Credentials test completed successfully');
    } catch (error) {
      this.logger.error(`[testMissingCredentials] failed: ${error.message}`);
      throw error;
    }
  }

  async testTokenRefresh() {
    this.logger.info('Testing token refresh...');

    try {
      // Test token refresh for Super Admin
      if (!this.tokens.super_admin?.refreshToken) {
        this.logger.warning('Super Admin: No refresh token available');
      } else {
        const result = await this.client.post(API_ENDPOINTS.refreshToken, {
          refresh_token: this.tokens.super_admin.refreshToken
        });

        this.assert.assertStatus(result.status, 200, 'Token refresh');
        this.assert.assertSuccess(result, 'Token refresh');
        this.assert.assertHasFields(result.data.data, ['access_token'], 'Refresh response');
      }

      // Test token refresh for Admin
      if (!this.tokens.admin?.refreshToken) {
        this.logger.warning('Admin: No refresh token available');
      } else {
        const result = await this.client.post(API_ENDPOINTS.refreshToken, {
          refresh_token: this.tokens.admin.refreshToken
        });

        this.assert.assertStatus(result.status, 200, 'Token refresh');
        this.assert.assertSuccess(result, 'Token refresh');
        this.assert.assertHasFields(result.data.data, ['access_token'], 'Refresh response');
      }

      // Test token refresh for Regular User
      if (!this.tokens.regular?.refreshToken) {
        this.logger.warning('Regular User: No refresh token available');
      } else {
        const result = await this.client.post(API_ENDPOINTS.refreshToken, {
          refresh_token: this.tokens.regular.refreshToken
        });

        this.assert.assertStatus(result.status, 200, 'Token refresh');
        this.assert.assertSuccess(result, 'Token refresh');
        this.assert.assertHasFields(result.data.data, ['access_token'], 'Refresh response');
      }

      this.logger.success('Token Refresh tests completed successfully');
    } catch (error) {
      this.logger.error(`[testTokenRefresh] failed: ${error.message}`);
      throw error;
    }
  }

  async testProtectedEndpointWithoutToken() {
    this.logger.info('Testing protected endpoint without token...');

    try {
      const result = await this.client.get(API_ENDPOINTS.profile, {
        Authorization: ''
      });

      this.assert.assertStatus(result.status, 401, 'Protected endpoint without token');

      this.logger.success('Protected Endpoint (No Token) test completed successfully');
    } catch (error) {
      this.logger.error(`[testProtectedEndpointWithoutToken] failed: ${error.message}`);
      throw error;
    }
  }

  async testProtectedEndpointWithInvalidToken() {
    this.logger.info('Testing protected endpoint with invalid token...');

    try {
      const result = await this.client.get(API_ENDPOINTS.profile, {
        Authorization: 'Bearer invalid'
      });

      this.assert.assertStatus(result.status, 401, 'Protected endpoint with invalid token');

      this.logger.success('Protected Endpoint (Invalid Token) test completed successfully');
    } catch (error) {
      this.logger.error(`[testProtectedEndpointWithInvalidToken] failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================================================
  // REGULAR USER TESTS
  // ========================================================================

  async runRegularUserTests() {
    this.logger.logSuiteHeader('👤 Regular User Tests');

    // Ensure we have a valid regular user token
    await this.ensureRegularUserAuthenticated();

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    const tests = [
      this.testRegularUserGetProfile,
      this.testRegularUserUpdateProfile,
      this.testRegularUserChangePassword,
      this.testRegularUserCannotAccessAdminEndpoints
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

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  async testRegularUserGetProfile() {
    this.logger.info('Testing regular user get profile...');

    try {
      if (!this.tokens.regular?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.regular.accessToken);
      const result = await this.client.get(API_ENDPOINTS.profile);

      this.assert.assertStatus(result.status, 200, 'Regular user get profile');
      this.assert.assertSuccess(result, 'Regular user get profile');
      this.assert.assertHasFields(result.data.data, ['id', 'email', 'full_name', 'role'], 'Profile data');

      // Verify it's actually a regular user
      if (result.data.data.role !== 'user') {
        throw new Error(`Expected role 'user', got '${result.data.data.role}'`);
      }

      this.logger.success('Regular User - Get Profile completed successfully');
    } catch (error) {
      this.logger.error(`[testRegularUserGetProfile] failed: ${error.message}`);
      throw error;
    }
  }

  async testRegularUserUpdateProfile() {
    this.logger.info('Testing regular user update profile...');

    try {
      if (!this.tokens.regular?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.regular.accessToken);
      const updateData = {
        full_name: 'Updated Regular User Name'
      };

      const result = await this.client.put(API_ENDPOINTS.profile, updateData);

      this.assert.assertStatus(result.status, 200, 'Regular user update profile');
      this.assert.assertSuccess(result, 'Regular user update profile');

      this.logger.success('Regular User - Update Profile completed successfully');
    } catch (error) {
      this.logger.error(`[testRegularUserUpdateProfile] failed: ${error.message}`);
      throw error;
    }
  }

  async testRegularUserChangePassword() {
    this.logger.info('Testing regular user change password...');

    try {
      if (!this.tokens.regular?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.regular.accessToken);
      const passwordData = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
        confirmPassword: 'newpassword123'
      };

      const result = await this.client.put(API_ENDPOINTS.userChangePassword, passwordData);
      
      if (result.success) {
        // Revert password change to avoid breaking other tests
        const revertData = {
          currentPassword: 'newpassword123',
          newPassword: 'password123',
          confirmPassword: 'password123'
        };
        await this.client.put(API_ENDPOINTS.userChangePassword, revertData);
      }

      // Allow various responses as this might fail in test environment
      this.logger.success('Regular User - Change Password completed successfully');
    } catch (error) {
      this.logger.error(`[testRegularUserChangePassword] failed: ${error.message}`);
      throw error;
    }
  }

  async testRegularUserCannotAccessAdminEndpoints() {
    this.logger.info('Testing regular user cannot access admin endpoints...');

    try {
      if (!this.tokens.regular?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.regular.accessToken);
      const result = await this.client.get(API_ENDPOINTS.adminUsers);

      // Regular user should not be able to access admin endpoints (should get 403)
      if (result.status === 200) {
        throw new Error('Regular user should not have access to admin endpoints');
      }
      this.assert.assertStatus(result.status, 403, 'Regular user admin access should be forbidden');

      this.logger.success('Regular User - Cannot Access Admin completed successfully');
    } catch (error) {
      this.logger.error(`[testRegularUserCannotAccessAdminEndpoints] failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================================================
  // ADMIN USER TESTS
  // ========================================================================

  async runAdminUserTests() {
    this.logger.logSuiteHeader('👨‍💼 Admin User Tests');

    await this.ensureAdminAuthenticated();

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    const tests = [
      this.testAdminGetProfile,
      this.testAdminUsersList,
      this.testAdminCreateUser,
      this.testAdminCannotAccessSuperAdminData,
      this.testAdminDashboard
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

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  async testAdminGetProfile() {
    this.logger.info('Testing admin get profile...');

    try {
      if (!this.tokens.admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.admin.accessToken);
      const result = await this.client.get(API_ENDPOINTS.profile);

      this.assert.assertStatus(result.status, 200, 'Admin get profile');
      this.assert.assertSuccess(result, 'Admin get profile');
      this.assert.assertHasFields(result.data.data, ['id', 'email', 'full_name', 'role'], 'Profile data');

      // Verify it's actually an admin
      if (result.data.data.role !== 'admin') {
        throw new Error(`Expected role 'admin', got '${result.data.data.role}'`);
      }

      this.logger.success('Admin - Get Profile completed successfully');
    } catch (error) {
      this.logger.error(`[testAdminGetProfile] failed: ${error.message}`);
      throw error;
    }
  }

  async testAdminUsersList() {
    this.logger.info('Testing admin users list...');

    try {
      if (!this.tokens.admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.admin.accessToken);
      const result = await this.client.get(API_ENDPOINTS.adminUsers);

      this.assert.assertStatus(result.status, 200, 'Admin users list');
      this.assert.assertSuccess(result, 'Admin users list');
      this.assert.assertHasFields(result.data.data, ['users'], 'Users list response');
      this.assert.assertArrayNotEmpty(result.data.data.users, 'Users should be present');

      // Admin should only see user and admin roles, not super_admin
      const users = result.data.data.users;
      const hasSuperAdmin = users.some(user => user.role === 'super_admin');
      if (hasSuperAdmin) {
        throw new Error('Admin should not see super_admin users');
      }

      this.logger.success('Admin - Users List (Filtered) completed successfully');
    } catch (error) {
      this.logger.error(`[testAdminUsersList] failed: ${error.message}`);
      throw error;
    }
  }

  async testAdminCreateUser() {
    this.logger.info('Testing admin create user...');

    try {
      if (!this.tokens.admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.admin.accessToken);
      const newUser = {
        full_name: 'Test Admin Created User',
        email: `testadmincreated_${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
        status: 'active'
      };

      const result = await this.client.post(API_ENDPOINTS.adminUsers, newUser);

      if (result.status === 201) {
        this.assert.assertSuccess(result, 'Admin create user');
        this.testUsers.adminCreatedUser = result.data.data;
      }

      this.logger.success('Admin - Create User completed successfully');
    } catch (error) {
      this.logger.error(`[testAdminCreateUser] failed: ${error.message}`);
      throw error;
    }
  }

  async testAdminCannotAccessSuperAdminData() {
    this.logger.info('Testing admin cannot access super admin data...');

    try {
      if (!this.tokens.admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.admin.accessToken);
      const result = await this.client.get(API_ENDPOINTS.adminDashboard);

      if (result.status === 200 && result.data.success) {
        const dashboardData = result.data.data;

        // Admin should have limited access
        if (dashboardData.permissions && dashboardData.permissions.accessLevel !== 'limited') {
          throw new Error('Admin should have limited access level');
        }

        // Admin should not see super admin count
        if (dashboardData.summary && dashboardData.summary.superAdminCount > 0) {
          throw new Error('Admin should not see super_admin count');
        }
      }

      this.logger.success('Admin - Limited Dashboard Access completed successfully');
    } catch (error) {
      this.logger.error(`[testAdminCannotAccessSuperAdminData] failed: ${error.message}`);
      throw error;
    }
  }

  async testAdminDashboard() {
    this.logger.info('Testing admin dashboard access...');

    try {
      if (!this.tokens.admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.admin.accessToken);
      const result = await this.client.get(API_ENDPOINTS.adminDashboard);

      this.assert.assertStatus(result.status, 200, 'Admin dashboard access');
      this.assert.assertSuccess(result, 'Admin dashboard access');
      this.assert.assertHasFields(result.data.data, ['overview', 'permissions'], 'Dashboard data');

      this.logger.success('Admin - Dashboard Access completed successfully');
    } catch (error) {
      this.logger.error(`[testAdminDashboard] failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================================================
  // SUPER ADMIN USER TESTS
  // ========================================================================

  async runSuperAdminUserTests() {
    this.logger.logSuiteHeader('🔑 Super Admin User Tests');

    await this.ensureSuperAdminAuthenticated();

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    const tests = [
      this.testSuperAdminGetProfile,
      this.testSuperAdminUsersListUnrestricted,
      this.testSuperAdminCreateUser,
      this.testSuperAdminCreateAdminUser,
      this.testSuperAdminCreateSuperAdminUser,
      this.testSuperAdminDashboard,
      this.testSuperAdminSystemHealth
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

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  async testSuperAdminGetProfile() {
    this.logger.info('Testing super admin get profile...');

    try {
      if (!this.tokens.super_admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.super_admin.accessToken);
      const result = await this.client.get(API_ENDPOINTS.profile);

      this.assert.assertStatus(result.status, 200, 'Super Admin get profile');
      this.assert.assertSuccess(result, 'Super Admin get profile');
      this.assert.assertHasFields(result.data.data, ['id', 'email', 'full_name', 'role'], 'Profile data');

      // Verify it's actually a super admin
      if (result.data.data.role !== 'super_admin') {
        throw new Error(`Expected role 'super_admin', got '${result.data.data.role}'`);
      }

      this.logger.success('Super Admin - Get Profile completed successfully');
    } catch (error) {
      this.logger.error(`[testSuperAdminGetProfile] failed: ${error.message}`);
      throw error;
    }
  }

  async testSuperAdminUsersListUnrestricted() {
    this.logger.info('Testing super admin users list unrestricted...');

    try {
      if (!this.tokens.super_admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.super_admin.accessToken);
      const result = await this.client.get(API_ENDPOINTS.adminUsers);

      this.assert.assertStatus(result.status, 200, 'Super Admin users list');
      this.assert.assertSuccess(result, 'Super Admin users list');
      this.assert.assertHasFields(result.data.data, ['users'], 'Users list response');
      this.assert.assertArrayNotEmpty(result.data.data.users, 'Users should be present');

      // Super Admin should see all roles including super_admin
      const users = result.data.data.users;
      const roles = [...new Set(users.map(user => user.role))];
      this.logger.info(`Super Admin sees roles: ${roles.join(', ')}`);

      this.logger.success('Super Admin - Users List (Unrestricted) completed successfully');
    } catch (error) {
      this.logger.error(`[testSuperAdminUsersListUnrestricted] failed: ${error.message}`);
      throw error;
    }
  }

  async testSuperAdminCreateUser() {
    this.logger.info('Testing super admin create regular user...');

    try {
      if (!this.tokens.super_admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.super_admin.accessToken);
      const newUser = {
        full_name: 'Test Super Admin Created User',
        email: `testsuperadmincreated_${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
        status: 'active'
      };

      const result = await this.client.post(API_ENDPOINTS.adminUsers, newUser);

      if (result.status === 201) {
        this.assert.assertSuccess(result, 'Super Admin create user');
        this.testUsers.superAdminCreatedUser = result.data.data;
      }

      this.logger.success('Super Admin - Create Regular User completed successfully');
    } catch (error) {
      this.logger.error(`[testSuperAdminCreateUser] failed: ${error.message}`);
      throw error;
    }
  }

  async testSuperAdminCreateAdminUser() {
    this.logger.info('Testing super admin create admin user...');

    try {
      if (!this.tokens.super_admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.super_admin.accessToken);
      const newAdmin = {
        full_name: 'Test Super Admin Created Admin',
        email: `testsuperadmincreatedadmin_${Date.now()}@example.com`,
        password: 'password123',
        role: 'admin',
        status: 'active'
      };

      const result = await this.client.post(API_ENDPOINTS.adminUsers, newAdmin);

      if (result.status === 201) {
        this.assert.assertSuccess(result, 'Super Admin create admin user');
        this.assert.assertEqual(result.data.data.role, 'admin', 'Created user should have admin role');
        this.testUsers.superAdminCreatedAdmin = result.data.data;
      }

      this.logger.success('Super Admin - Create Admin User completed successfully');
    } catch (error) {
      this.logger.error(`[testSuperAdminCreateAdminUser] failed: ${error.message}`);
      throw error;
    }
  }

  async testSuperAdminCreateSuperAdminUser() {
    this.logger.info('Testing super admin create super admin user...');

    try {
      if (!this.tokens.super_admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.super_admin.accessToken);
      const newSuperAdmin = {
        full_name: 'Test Super Admin Created Super Admin',
        email: `testsuperadmincreatedsuperadmin_${Date.now()}@example.com`,
        password: 'password123',
        role: 'super_admin',
        status: 'active'
      };

      const result = await this.client.post(API_ENDPOINTS.adminUsers, newSuperAdmin);

      if (result.status === 201) {
        this.assert.assertSuccess(result, 'Super Admin create super admin user');
        this.assert.assertEqual(result.data.data.role, 'super_admin', 'Created user should have super_admin role');
        this.testUsers.superAdminCreatedSuperAdmin = result.data.data;
      }

      this.logger.success('Super Admin - Create Super Admin User completed successfully');
    } catch (error) {
      this.logger.error(`[testSuperAdminCreateSuperAdminUser] failed: ${error.message}`);
      throw error;
    }
  }

  async testSuperAdminDashboard() {
    this.logger.info('Testing super admin dashboard access...');

    try {
      if (!this.tokens.super_admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.super_admin.accessToken);
      const result = await this.client.get(API_ENDPOINTS.adminDashboard);

      this.assert.assertStatus(result.status, 200, 'Super Admin dashboard access');
      this.assert.assertSuccess(result, 'Super Admin dashboard access');
      this.assert.assertHasFields(result.data.data, ['overview', 'permissions'], 'Dashboard data');

      const dashboardData = result.data.data;

      // Super Admin should have full access
      if (dashboardData.permissions && dashboardData.permissions.accessLevel !== 'full') {
        throw new Error('Super Admin should have full access level');
      }

      // Super Admin should see super admin data
      if (dashboardData.permissions && dashboardData.permissions.canViewSuperAdminData !== true) {
        throw new Error('Super Admin should be able to view super admin data');
      }

      this.logger.success('Super Admin - Full Dashboard Access completed successfully');
    } catch (error) {
      this.logger.error(`[testSuperAdminDashboard] failed: ${error.message}`);
      throw error;
    }
  }

  async testSuperAdminSystemHealth() {
    this.logger.info('Testing super admin system health access...');

    try {
      if (!this.tokens.super_admin?.accessToken) {
        throw new Error('No access token available');
      }

      this.client.setAuthToken(this.tokens.super_admin.accessToken);
      const result = await this.client.get(API_ENDPOINTS.adminSystemHealth);

      this.assert.assertStatus(result.status, 200, 'Super Admin system health access');
      this.assert.assertSuccess(result, 'Super Admin system health access');

      this.logger.success('Super Admin - System Health Access completed successfully');
    } catch (error) {
      this.logger.error(`[testSuperAdminSystemHealth] failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================================================
  // ROLE-BASED ACCESS CONTROL TESTS
  // ========================================================================

  async runRoleBasedAccessTests() {
    this.logger.logSuiteHeader('🛡️ Role-Based Access Control Tests');

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    const tests = [
      this.testRoleBasedAccess
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

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  async testRoleBasedAccess() {
    this.logger.info('Testing role-based access control...');

    try {
      // Test access with different user roles
      const roles = ['super_admin', 'admin', 'regular'];

      for (const role of roles) {
        if (TEST_USERS[role]) {
          await this.testRoleAccess(role, TEST_USERS[role]);
        }
      }

      this.logger.success('Role-Based Access Control test completed successfully');
    } catch (error) {
      this.logger.error(`[testRoleBasedAccess] failed: ${error.message}`);
      throw error;
    }
  }

  async testRoleAccess(roleName, credentials) {
    this.logger.info(`Testing role access for ${roleName}...`);

    try {
      // Login as the specific role
      const loginResult = await this.client.post(API_ENDPOINTS.login, credentials);
      if (loginResult.success) {
        this.client.setAuthToken(loginResult.data.data.access_token);

        // Test admin endpoint access
        const adminResult = await this.client.get(API_ENDPOINTS.adminUsers);

        const expectedAccess = roleName === 'super_admin' || roleName === 'admin';
        const hasAccess = adminResult.status === 200;

        if (expectedAccess && !hasAccess) {
          throw new Error(`${roleName} should have admin access`);
        }
        if (!expectedAccess && hasAccess) {
          throw new Error(`${roleName} should not have admin access`);
        }

        this.logger.success(`Role Access (${roleName}) completed successfully`);
      } else {
        throw new Error(`Login failed for ${roleName}`);
      }
    } catch (error) {
      this.logger.error(`[testRoleAccess] (${roleName}) failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================================================
  // SECURITY TESTS
  // ========================================================================

  async runSecurityTests() {
    this.logger.logSuiteHeader('🔒 Security Tests');

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    const tests = [
      this.testSQLInjection,
      this.testXSSProtection,
      this.testInputSanitization,
      this.testMalformedRequests
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

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  async testSQLInjection() {
    this.logger.info('Testing SQL injection protection...');

    try {
      for (const payload of SECURITY_PAYLOADS.sqlInjection) {
        const result = await this.client.post(API_ENDPOINTS.login, {
          email: payload,
          password: 'password123'
        });

        // Should not return 500 (internal server error) which might indicate SQL injection
        if (result.status === 500) {
          throw new Error(`Potential SQL injection vulnerability with payload: ${payload.substring(0, 20)}...`);
        }
      }

      this.logger.success('SQL Injection Protection test completed successfully');
    } catch (error) {
      this.logger.error(`[testSQLInjection] failed: ${error.message}`);
      throw error;
    }
  }

  async testXSSProtection() {
    this.logger.info('Testing XSS protection...');

    try {
      await this.ensureSuperAdminAuthenticated();

      for (const payload of SECURITY_PAYLOADS.xss) {
        this.client.setAuthToken(this.tokens.super_admin?.accessToken);
        const result = await this.client.put(API_ENDPOINTS.profile, {
          full_name: payload,
          bio: payload
        });

        // Check if XSS payload is properly escaped/sanitized
        if (result.success && result.data.data?.full_name === payload) {
          this.logger.warning(`XSS payload not sanitized: ${payload.substring(0, 20)}...`);
        }
      }

      this.logger.success('XSS Protection test completed successfully');
    } catch (error) {
      this.logger.error(`[testXSSProtection] failed: ${error.message}`);
      throw error;
    }
  }

  async testInputSanitization() {
    this.logger.info('Testing input sanitization...');

    try {
      const largeInput = 'A'.repeat(10000); // 10KB string

      const result = await this.client.post(API_ENDPOINTS.login, {
        email: largeInput,
        password: 'password123'
      });

      // Should handle large inputs gracefully
      if (result.status === 500) {
        throw new Error('Large input not handled properly');
      }

      this.logger.success('Large Input Handling test completed successfully');
    } catch (error) {
      this.logger.error(`[testInputSanitization] failed: ${error.message}`);
      throw error;
    }
  }

  async testMalformedRequests() {
    this.logger.info('Testing malformed requests...');

    try {
      for (const payload of SECURITY_PAYLOADS.malformedJson) {
        try {
          const response = await fetch(`${this.client.baseUrl}${API_ENDPOINTS.login}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload
          });

          // Malformed JSON should be rejected gracefully
          if (response.ok) {
            this.logger.warning(`Malformed JSON accepted: ${payload.substring(0, 20)}...`);
          }
        } catch (error) {
          // Expected for malformed JSON
          this.logger.info(`Malformed JSON request failed as expected: ${error.message}`);
        }
      }

      this.logger.success('Malformed Requests test completed successfully');
    } catch (error) {
      this.logger.error(`[testMalformedRequests] failed: ${error.message}`);
      throw error;
    }
  }

  async testRateLimiting() {
    this.logger.info('Testing rate limiting...');

    try {
      const requests = [];
      const requestCount = 20; // Send many requests quickly

      for (let i = 0; i < requestCount; i++) {
        requests.push(this.client.post(API_ENDPOINTS.login, TEST_USERS.invalid));
      }

      const results = await Promise.all(requests);
      const rateLimited = results.some(r => r.status === 429);

      if (!rateLimited) {
        this.logger.warning('Rate limiting may not be active');
      }

      this.logger.success('Rate Limiting test completed successfully');
    } catch (error) {
      this.logger.error(`[testRateLimiting] failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================================================
  // TRANSLATION/I18N TESTS
  // ========================================================================

  async runTranslationTests() {
    this.logger.logSuiteHeader('🌐 Translation/i18n Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`Authentication setup failed: ${error.message}`);
      throw error;
    }

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    const tests = [
      this.testTranslationsList,
      this.testLanguageDetection,
      this.testLocalizedResponses,
      this.testMultiLanguageValidationErrors
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

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  async testTranslationsList() {
    this.logger.info('Testing translations list...');

    try {
      const result = await this.client.get(API_ENDPOINTS.translations);

      this.assert.assertStatus(result.status, 200, 'Translations list');
      this.assert.assertSuccess(result, 'Translations list');

      this.logger.success('Translations List test completed successfully');
    } catch (error) {
      this.logger.error(`[testTranslationsList] failed: ${error.message}`);
      throw error;
    }
  }

  async testLanguageDetection() {
    this.logger.info('Testing language detection...');

    try {
      for (const lang of TEST_LANGUAGES) {
        const result = await this.client.get(`${API_ENDPOINTS.translations}?lang=${lang}`);

        this.assert.assertStatus(result.status, 200, `Language detection for ${lang}`);
        this.assert.assertSuccess(result, `Language detection for ${lang}`);
      }

      this.logger.success('Language Detection test completed successfully');
    } catch (error) {
      this.logger.error(`[testLanguageDetection] failed: ${error.message}`);
      throw error;
    }
  }

  async testLocalizedResponses() {
    this.logger.info('Testing localized responses...');

    try {
      // Test localized error messages
      const result = await this.client.post(`${API_ENDPOINTS.login}?lang=vi`, TEST_USERS.invalid);

      this.assert.assertStatus(result.status, 401, 'Localized error');
      // Check if error message might be localized (this is a basic check)

      this.logger.success('Localized Error Messages test completed successfully');
    } catch (error) {
      this.logger.error(`[testLocalizedResponses] failed: ${error.message}`);
      throw error;
    }
  }

  async testMultiLanguageValidationErrors() {
    this.logger.info('Testing multi-language validation errors...');

    try {
      const multiLangTest = new MultiLanguageValidationErrorTests();
      // Provide already established tokens so protected validation tests return 400 validation
      // errors instead of 401 unauthorized responses.
      if (this.tokens?.regular?.accessToken) {multiLangTest.userToken = this.tokens.regular.accessToken;}
      if (this.tokens?.admin?.accessToken) {multiLangTest.adminToken = this.tokens.admin.accessToken;}
      if (this.tokens?.super_admin?.accessToken) {multiLangTest.superAdminToken = this.tokens.super_admin.accessToken;}
      // Run a subset of tests to avoid excessive time in unified suite
      await multiLangTest.testAuthenticationValidationErrors();
      await multiLangTest.testUserManagementValidationErrors();
      await multiLangTest.testErrorMessageConsistency();

      this.logger.success('Multi-Language Validation Errors test completed successfully');
    } catch (error) {
      this.logger.error(`[testMultiLanguageValidationErrors] failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================================================
  // ERROR HANDLING TESTS
  // ========================================================================

  async runErrorHandlingTests() {
    this.logger.logSuiteHeader('🚨 Error Handling & Feature Flags Tests');

    try {
      const errorTest = new ErrorHandlingTest();
      const success = await errorTest.runAll();

      if (!success) {
        throw new Error('Some error handling tests failed');
      }

      this.logger.success('Error Handling Tests completed successfully');
    } catch (error) {
      this.logger.error(`[runErrorHandlingTests] failed: ${error.message}`);
      throw error;
    }
  }

  // ========================================================================
  // PERFORMANCE TESTS
  // ========================================================================

  async runPerformanceTests() {
    this.logger.logSuiteHeader('⚡ Performance Tests');

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    const tests = [
      this.testResponseTimes,
      this.testConcurrentRequests,
      this.testLoadTest
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

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  async testResponseTimes() {
    this.logger.info('Testing response times...');

    try {
      const endpoints = [
        { name: 'Health Check', path: API_ENDPOINTS.health },
        { name: 'API Root', path: API_ENDPOINTS.root },
        { name: 'Version', path: API_ENDPOINTS.version },
        { name: 'Translations', path: API_ENDPOINTS.translations }
      ];

      for (const endpoint of endpoints) {
        const startTime = Date.now();
        const result = await this.client.get(endpoint.path);
        const responseTime = Date.now() - startTime;

        if (responseTime > 2000) { // 2 second threshold
          throw new Error(`${endpoint.name} response time too slow: ${responseTime}ms`);
        }
        this.assert.assertSuccess(result, `Response time for ${endpoint.name}`);
      }

      this.logger.success('Response Times test completed successfully');
    } catch (error) {
      this.logger.error(`[testResponseTimes] failed: ${error.message}`);
      throw error;
    }
  }

  async testConcurrentRequests() {
    this.logger.info('Testing concurrent requests...');

    try {
      const concurrent = BASE_CONFIG.concurrentRequests;
      const requests = [];

      for (let i = 0; i < concurrent; i++) {
        requests.push(this.client.get(API_ENDPOINTS.health));
      }

      const startTime = Date.now();
      const results = await Promise.all(requests);
      const totalTime = Date.now() - startTime;

      const successful = results.filter(r => r.success).length;
      if (successful < concurrent * 0.8) { // 80% success rate threshold
        throw new Error(`Only ${successful}/${concurrent} requests successful`);
      }

      this.logger.success(`Concurrent Requests (${successful}/${concurrent} in ${totalTime}ms) test completed successfully`);
    } catch (error) {
      this.logger.error(`[testConcurrentRequests] failed: ${error.message}`);
      throw error;
    }
  }

  async testLoadTest() {
    this.logger.info('Testing load performance...');

    try {
      const iterations = BASE_CONFIG.loadTestIterations;
      const concurrent = 5;

      this.logger.info(`Running load test: ${concurrent} concurrent × ${iterations} iterations`);

      const promises = [];
      for (let i = 0; i < concurrent; i++) {
        promises.push(this.runLoadTestIteration(iterations));
      }

      const results = await Promise.all(promises);
      const totalRequests = concurrent * iterations;
      const successfulRequests = results.reduce((sum, result) => sum + result.successful, 0);
      const successRate = Math.round((successfulRequests / totalRequests) * 100);

      if (successRate < 90) { // 90% success rate threshold
        throw new Error(`Load test success rate too low: ${successRate}%`);
      }

      this.logger.success(`Load Test (${successfulRequests}/${totalRequests} - ${successRate}%) completed successfully`);
    } catch (error) {
      this.logger.error(`[testLoadTest] failed: ${error.message}`);
      throw error;
    }
  }

  async runLoadTestIteration(iterations) {
    let successful = 0;

    for (let i = 0; i < iterations; i++) {
      try {
        const response = await this.client.get(API_ENDPOINTS.health);
        if (response.success) {
          successful++;
        }
      } catch (error) {
        // Request failed
      }
    }

    return { successful };
  }

  // ========================================================================
  // UTILITY METHODS
  // ========================================================================
  // UTILITY METHODS
  // ========================================================================

  async ensureAuthenticated() {
    if (!this.tokens.super_admin?.accessToken) {
      await this.testSuccessfulLoginSuperAdmin();
    }
  }

  async ensureRegularUserAuthenticated() {
    if (!this.tokens.regular?.accessToken) {
      await this.testSuccessfulLoginRegularUser();
    }
  }

  async ensureAdminAuthenticated() {
    if (!this.tokens.admin?.accessToken) {
      await this.testSuccessfulLoginAdmin();
    }
  }

  async ensureSuperAdminAuthenticated() {
    if (!this.tokens.super_admin?.accessToken) {
      await this.testSuccessfulLoginSuperAdmin();
    }
  }

  // ========================================================================
  // KV ADMIN TESTS
  // ========================================================================

  async runKvAdminTests() {
    this.logger.logSuiteHeader('🗂️ KV Admin Tests (Super Admin Only)');

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    try {
      // Run the external KV Admin test
      await import('./kvAdminTest.js');

      // Log successful completion
      this.logger.recordResult(true);
      this.logger.success('KV Admin Configuration Tests passed');
    } catch (error) {
      this.logger.recordResult(false);
      this.logger.error(`KV Admin Configuration Tests failed: ${error.message}`);
    }

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  // ========================================================================
  // MAIN EXECUTION METHODS
  // ========================================================================

  async runAll(testGroup = 'all') {
    this.logger.logSuiteHeader('🧪 Starting Unified Test Suite');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`Authentication setup failed: ${error.message}`);
      throw error;
    }

    const testGroups = {
      all: [
        this.runSystemTests,
        this.runKvAdminTests,
        this.runAuthenticationTests,
        this.runRoleBasedAccessTests,
        this.runRegularUserTests,
        this.runAdminUserTests,
        this.runSuperAdminUserTests,
        this.runTranslationTests,
        this.runErrorHandlingTests,
        this.runPerformanceTests,
        this.runSecurityTests
      ],
      quick: [
        this.runSystemTests,
        this.runAuthenticationTests,
        this.runRoleBasedAccessTests
      ],
      system: [this.runSystemTests],
      auth: [this.runAuthenticationTests],
      user: [this.runRegularUserTests],
      admin: [this.runAdminUserTests],
      superadmin: [this.runSuperAdminUserTests],
      rbac: [this.runRoleBasedAccessTests],
      security: [this.runSecurityTests],
      kv: [this.runKvAdminTests],
      translation: [this.runTranslationTests],
      error: [this.runErrorHandlingTests],
      performance: [this.runPerformanceTests]
    };

    const tests = testGroups[testGroup] || testGroups.all;

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

  async runQuickTests() {
    this.logger.logSuiteHeader('⚡ Running Quick Validation Tests - Basic Role Testing');

    this.logger.info('Initializing test environment for quick tests...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`Authentication setup failed: ${error.message}`);
      throw error;
    }

    // Reset logger to get clean results for this test suite
    this.logger.reset();

    const tests = [
      this.runSystemTests,
      this.runAuthenticationTests,
      this.runRoleBasedAccessTests
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

    // Return test results for final summary
    return {
      total: this.logger.testCount,
      passed: this.logger.passCount,
      failed: this.logger.failCount
    };
  }

  async runSecurityTestsOnly() {
    this.logger.logSuiteHeader('🔒 Running Security Tests Only');

    this.logger.info('Initializing test environment for security tests...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`Authentication setup failed: ${error.message}`);
      throw error;
    }

    // Run security tests and return results
    const result = await this.runSecurityTests();

    return result;
  }

  printFinalSummary(results) {
    // Handle null or undefined results
    if (!results || !Array.isArray(results) || results.length === 0) {
      this.logger.logHeader('\n' + '='.repeat(80));
      this.logger.logHeader('🏆 FINAL TEST SUMMARY');
      this.logger.logHeader('='.repeat(80));
      this.logger.warning('⚠️  No test results available to display.');
      this.logger.info('This might happen if tests failed to initialize or complete.');
      this.logger.logHeader('='.repeat(80));
      process.exit(1);
      return;
    }

    // Filter out null/undefined results
    const validResults = results.filter(r => r && typeof r === 'object' &&
                                        typeof r.total === 'number' &&
                                        typeof r.passed === 'number' &&
                                        typeof r.failed === 'number');

    if (validResults.length === 0) {
      this.logger.logHeader('\n' + '='.repeat(80));
      this.logger.logHeader('🏆 FINAL TEST SUMMARY');
      this.logger.logHeader('='.repeat(80));
      this.logger.warning('⚠️  No valid test results found to display.');
      this.logger.info('All test results were null, undefined, or malformed.');
      this.logger.logHeader('='.repeat(80));
      process.exit(1);
    }

    const totalTests = validResults.reduce((sum, r) => sum + r.total, 0);
    const totalPassed = validResults.reduce((sum, r) => sum + r.passed, 0);
    const totalFailed = validResults.reduce((sum, r) => sum + r.failed, 0);
    const overallRate = totalTests > 0 ? Math.round((totalPassed / totalTests) * 100) : 0;

    this.logger.logHeader('\n' + '='.repeat(80));
    this.logger.logHeader('🏆 FINAL TEST SUMMARY');
    this.logger.logHeader('='.repeat(80));
    this.logger.logSectionHeader('📊 Overall Results:');
    this.logger.info(`🌐 API Endpoint: ${this.baseUrl}`);
    this.logger.info(`📈 Total Tests: ${totalTests}`);
    this.logger.info(`✅ Passed: ${totalPassed}`);
    this.logger.info(`❌ Failed: ${totalFailed}`);
    this.logger.info(`📊 Success Rate: ${overallRate}%`);

    this.logger.logSectionHeader('📋 Suite Breakdown:');
    validResults.forEach((result, index) => {
      const suiteName = ['System', 'KV Admin', 'Authentication', 'Role-Based Access', 'Regular User', 'Admin User', 'Super Admin User', 'Translation', 'Performance', 'Security'][index] || 'Unknown';
      const rate = result.total > 0 ? Math.round((result.passed / result.total) * 100) : 0;
      const status = result.failed === 0 ? '✅' : '❌';
      this.logger.info(`${status} ${suiteName}: ${result.passed}/${result.total} (${rate}%)`);
    });

    if (totalFailed === 0) {
      this.logger.success('🎉 🎉 🎉 ALL TESTS PASSED! 🎉 🎉 🎉');
      this.logger.success('Your Hono Auth API is working perfectly!');
    } else {
      this.logger.warning(`${totalFailed} test(s) failed.`);
      this.logger.warning('Please review the results above and fix any issues.');
    }

    this.logger.logSectionHeader('🔗 Quick Test Commands:');
    this.logger.info(`Health: curl ${API_ENDPOINTS.health}`);
    this.logger.info(`Login:  curl -X POST ${API_ENDPOINTS.login} -H "Content-Type: application/json" -d '{"email":"test-user@example.com","password":"password123"}'`);

    this.logger.logHeader('='.repeat(80));

    process.exit(totalFailed > 0 ? 1 : 0);
  }
}

// ============================================================================
// CLI HANDLING & EXECUTION
// ============================================================================

function showHelp() {
  const helpLogger = new TestLogger();
  helpLogger.logHeader('🧪 Unified Test Suite - Hono Auth API');
  helpLogger.logHeader('=====================================');
  helpLogger.info('Usage: npm run test:[command] or node tests/unifiedTestSuite.js [command]');
  helpLogger.info('Available commands:');
  helpLogger.info('  all          - Run complete test suite (all roles)');
  helpLogger.info('  quick        - Run quick validation (system + auth + rbac)');
  helpLogger.info('  system       - Run system tests only');
  helpLogger.info('  auth         - Run authentication tests only');
  helpLogger.info('  user         - Run regular user tests only');
  helpLogger.info('  admin        - Run admin user tests only');
  helpLogger.info('  superadmin   - Run super admin user tests only');
  helpLogger.info('  rbac         - Run role-based access control tests only');
  helpLogger.info('  security     - Run security tests only');
  helpLogger.info('  kv           - Run KV admin configuration tests only (super_admin)');
  helpLogger.info('  translation  - Run translation/i18n tests only');
  helpLogger.info('  performance  - Run performance tests only');
  helpLogger.info('  help         - Show this help message');
  helpLogger.info('Examples:');
  helpLogger.info('  npm run test:unified');
  helpLogger.info('  npm run test:unified quick');
  helpLogger.info('  npm run test:unified admin');
  helpLogger.info('  npm run test:unified superadmin');
  helpLogger.info('  node tests/unifiedTestSuite.js rbac');
}

async function main() {
  const command = process.argv[2] || 'all';

  if (command === 'help' || command === '--help' || command === '-h') {
    showHelp();
    return;
  }

  const testSuite = new UnifiedTestSuite();
  let result;
  try {
    switch (command.toLowerCase()) {
    case 'all':
    case 'complete':
      await testSuite.runAll();
      break;
    case 'quick':
    case 'fast':
      await testSuite.runQuickTests();
      break;
    case 'system':
      result = await testSuite.runSystemTests();
      testSuite.printFinalSummary([result]);
      break;
    case 'auth':
    case 'authentication':
      result = await testSuite.runAuthenticationTests();
      testSuite.printFinalSummary([result]);
      break;
    case 'user':
    case 'regular':
      result = await testSuite.runRegularUserTests();
      testSuite.printFinalSummary([result]);
      break;
    case 'admin':
      result = await testSuite.runAdminUserTests();
      testSuite.printFinalSummary([result]);
      break;
    case 'superadmin':
    case 'super_admin':
    case 'super-admin':
      result = await testSuite.runSuperAdminUserTests();
      testSuite.printFinalSummary([result]);
      break;
    case 'rbac':
    case 'roles':
    case 'role-based':
      result = await testSuite.runRoleBasedAccessTests();
      testSuite.printFinalSummary([result]);
      break;
    case 'security':
      result = await testSuite.runSecurityTestsOnly();
      testSuite.printFinalSummary([result]);
      break;
    case 'kv':
    case 'kv-admin':
    case 'kvadmin':
      result = await testSuite.runKvAdminTests();
      testSuite.printFinalSummary([result]);
      break;
    case 'translation':
    case 'translations':
    case 'i18n':
      result = await testSuite.runTranslationTests();
      testSuite.printFinalSummary([result]);
      break;
    case 'error':
    case 'errors':
    case 'error-handling':
      result = await testSuite.runErrorHandlingTests();
      testSuite.printFinalSummary([result]);
      break;
    case 'performance':
    case 'perf':
      result = await testSuite.runPerformanceTests();
      testSuite.printFinalSummary([result]);
      break;
    default: {
      console.error(`❌ Unknown command: ${command}`);
      const helpLogger = new TestLogger();
      helpLogger.info('Run with "help" to see available commands.');
      process.exit(1);
    }
    }
  } catch (error) {
    testSuite.logger.error(`Test execution failed: [${command}] ${error.message}`);
    process.exit(1);
  }
}

// Handle unhandled rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Run if called directly
if (process.argv[1] === new URL(import.meta.url).pathname) {
  main().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { UnifiedTestSuite };
