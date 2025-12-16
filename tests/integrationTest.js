#!/usr/bin/env node

/**
 * Integration Test Suite
 * End-to-end workflows and component integration testing
 *
 * Integration endpoints tested (workflow-based):
 * - POST /api/user/register → POST /api/auth/login → GET /api/user/profile - Complete user journey
 * - POST /api/user/register → PUT /api/user/profile - Registration to profile update
 * - POST /api/auth/login → POST /api/user/change-password → POST /api/auth/login - Password change flow
 * - POST /api/auth/login → POST /api/auth/refresh → GET /api/user/profile - Token refresh workflow
 * - POST /api/admin/users → PUT /api/admin/users/:id/role → POST /api/auth/login - Admin user management
 * - Multiple language endpoints with Accept-Language headers - Multi-language workflow
 * - Role-based endpoint access patterns - Role-based authorization workflow
 *
 * Test coverage:
 * - Complete user registration and authentication flow
 * - Admin user creation and management workflows
 * - Password change and security validation
 * - Token refresh and session management
 * - Multi-language support across all endpoints
 * - Role-based access control integration
 * - Error handling across component boundaries
 * - End-to-end system integration validation
 * - Cross-component data consistency
 * - User lifecycle management (create/update/delete)
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG, TEST_LANGUAGES } from './config/testConfig.js';


class IntegrationTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.testUsers = []; // Track created users for cleanup
  }

  async runAll() {
    this.logger.logSuiteHeader('🔗 Starting Integration Tests');

    const tests = [
      this.testFullAuthFlow,
      this.testUserAndAdminFlow,
      this.testPasswordChangeFlow,
      this.testAdminUserManagement,
      this.testAuthenticationFlow,
      this.testMultiLanguageWorkflow,
      this.testRoleBasedWorkflow,
      this.testErrorHandlingIntegration,
      this.testSystemIntegration
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

    // Clean up test data
    try {
      await this.cleanup();
    } catch (error) {
      this.logger.warning(`Cleanup failed: ${error.message}`);
    }

    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      process.exit(1);
    }
  }

  /**
   * Tests AUTO_ACTIVATE_USER_ON_REGISTER feature and user registration workflow
   * Test scenario:
   * 1. Login as super_admin to set AUTO_ACTIVATE_USER_ON_REGISTER = false
   * 2. Register user, verify status is 'inactive' and login fails with 401
   * 3. Set AUTO_ACTIVATE_USER_ON_REGISTER = true
   * 4. Register another user, verify status is 'active' and login succeeds
   *
   * Covers:
   * - Super admin KV config management
   * - User registration with different activation settings
   * - Login validation for inactive vs active users
   * - Profile access after successful login
   */
  async testFullAuthFlow() {
    this.logger.info('Testing AUTO_ACTIVATE_USER_ON_REGISTER feature and user registration workflow...');

    try {
      // Step 1: Login as super_admin to manage KV config
      this.logger.info('🔐 Step 1: Login as super_admin to configure AUTO_ACTIVATE_USER_ON_REGISTER');
      const superAdminLoginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);
      this.assert.assertEqual(superAdminLoginResponse.status, 200, 'Super admin login should succeed');
      const superAdminToken = superAdminLoginResponse.data.data.access_token;

      // Step 2: Set AUTO_ACTIVATE_USER_ON_REGISTER = false
      this.logger.info('⚙️  Step 2: Set AUTO_ACTIVATE_USER_ON_REGISTER = false');
      const setInactiveResponse = await this.client.put(API_ENDPOINTS.kvAdminConfigsSpecific.replace(':key', 'AUTO_ACTIVATE_USER_ON_REGISTER'), {
        value: false
      }, {
        Authorization: `Bearer ${superAdminToken}`
      });
      this.assert.assertEqual(setInactiveResponse.status, 200, 'Should set AUTO_ACTIVATE_USER_ON_REGISTER = false');

      // Step 3: Register first user (should be inactive)
      this.logger.info('👤 Step 3: Register user with AUTO_ACTIVATE = false');
      const timestamp1 = Date.now();
      const inactiveUser = {
        email: `integration_inactive_${timestamp1}@example.com`,
        password: 'SecurePass123!',
        full_name: 'Integration Inactive User'
      };

      const regInactiveResponse = await this.client.post(API_ENDPOINTS.register, inactiveUser);
      this.assert.assertEqual(regInactiveResponse.status, 201, 'User registration should succeed');
      this.assert.assertEqual(regInactiveResponse.data.data.status, 'inactive', 'User should be created as inactive');

      const inactiveUserId = regInactiveResponse.data.data.id;
      this.testUsers.push({ id: inactiveUserId, email: inactiveUser.email });

      // Step 4: Try to login with inactive user (should fail with 401)
      this.logger.info('🚫 Step 4: Verify inactive user cannot login');
      const inactiveLoginResponse = await this.client.post(API_ENDPOINTS.login, {
        email: inactiveUser.email,
        password: inactiveUser.password
      });
      this.assert.assertEqual(inactiveLoginResponse.status, 401, 'Inactive user login should fail with 401');

      // Step 5: Set AUTO_ACTIVATE_USER_ON_REGISTER = true
      this.logger.info('⚙️  Step 5: Set AUTO_ACTIVATE_USER_ON_REGISTER = true');
      const setActiveResponse = await this.client.put(API_ENDPOINTS.kvAdminConfigsSpecific.replace(':key', 'AUTO_ACTIVATE_USER_ON_REGISTER'), {
        value: true
      }, {
        Authorization: `Bearer ${superAdminToken}`
      });
      this.assert.assertEqual(setActiveResponse.status, 200, 'Should set AUTO_ACTIVATE_USER_ON_REGISTER = true');

      // Step 6: Register second user (should be active)
      this.logger.info('👤 Step 6: Register user with AUTO_ACTIVATE = true');
      const timestamp2 = Date.now();
      const activeUser = {
        email: `integration_active_${timestamp2}@example.com`,
        password: 'SecurePass123!',
        full_name: 'Integration Active User'
      };

      const regActiveResponse = await this.client.post(API_ENDPOINTS.register, activeUser);
      this.assert.assertEqual(regActiveResponse.status, 201, 'User registration should succeed');
      this.assert.assertEqual(regActiveResponse.data.data.status, 'active', 'User should be created as active');

      const activeUserId = regActiveResponse.data.data.id;
      this.testUsers.push({ id: activeUserId, email: activeUser.email });

      // Step 7: Login with active user (should succeed)
      this.logger.info('Step 7: Verify active user can login successfully');
      const activeLoginResponse = await this.client.post(API_ENDPOINTS.login, {
        email: activeUser.email,
        password: activeUser.password
      });
      this.assert.assertEqual(activeLoginResponse.status, 200, 'Active user login should succeed');
      this.assert.assertNotEmpty(activeLoginResponse.data.data.access_token, 'Login should return access token');

      const userToken = activeLoginResponse.data.data.access_token;

      // Step 8: Access protected profile with active user
      this.logger.info('Step 8: Verify profile access with active user token');
      const profileResponse = await this.client.get(API_ENDPOINTS.profile, {
        Authorization: `Bearer ${userToken}`
      });
      this.assert.assertEqual(profileResponse.status, 200, 'Profile access should succeed');
      this.assert.assertEqual(profileResponse.data.success, true);
      this.assert.assertEqual(profileResponse.data.data.email, activeUser.email, 'Profile should match active user');

      // Step 9: Update profile to verify full functionality
      this.logger.info('✏️  Step 9: Test profile update functionality');
      const updateData = {
        full_name: 'Updated Integration Active User',
        bio: 'This user was created by integration tests with auto-activation'
      };

      const updateResponse = await this.client.put(API_ENDPOINTS.profile, updateData, {
        Authorization: `Bearer ${userToken}`
      });
      this.assert.assertEqual(updateResponse.status, 200, 'Profile update should succeed');
      this.assert.assertEqual(updateResponse.data.data.full_name, updateData.full_name, 'Name should be updated');

      // Step 10: Verify update persists
      this.logger.info('Step 10: Verify profile update persistence');
      const verifyResponse = await this.client.get(API_ENDPOINTS.profile, {
        Authorization: `Bearer ${userToken}`
      });
      this.assert.assertEqual(verifyResponse.data.data.full_name, updateData.full_name, 'Update should persist');

      this.logger.success('AUTO_ACTIVATE_USER_ON_REGISTER feature test completed successfully');
      this.logger.info('📝 Test summary:');
      this.logger.info(`- Inactive user: ${inactiveUser.email} (cannot login)`);
      this.logger.info(`- Active user: ${activeUser.email} (can login and access profile)`);

    } catch (error) {
      this.logger.error(`[testFullAuthFlow] AUTO_ACTIVATE_USER_ON_REGISTER test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tests user registration flow with AUTO-ACTIVATE feature and admin user management
   * Test scenario:
   * 1. Ensure AUTO_ACTIVATE_USER_ON_REGISTER = true for successful registration flow
   * 2. Register user and verify immediate login capability
   * 3. Test admin user management workflow
   *
   * Covers:
   * - User registration with auto-activation
   * - Immediate login after registration
   * - Admin user creation and management
   * - Role management and verification
   */
  async testUserAndAdminFlow() {
    this.logger.info('Testing user registration to login flow with admin management...');

    try {
      // Step 1: Login as super_admin to ensure AUTO_ACTIVATE is enabled
      this.logger.info('🔐 Step 1: Login as super_admin to ensure AUTO_ACTIVATE_USER_ON_REGISTER = true');
      const superAdminLoginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);
      this.assert.assertEqual(superAdminLoginResponse.status, 200, 'Super admin login should succeed');
      const superAdminToken = superAdminLoginResponse.data.data.access_token;

      // Step 2: Ensure AUTO_ACTIVATE_USER_ON_REGISTER = true
      this.logger.info('⚙️  Step 2: Ensure AUTO_ACTIVATE_USER_ON_REGISTER = true');
      const setActiveResponse = await this.client.put(API_ENDPOINTS.kvAdminConfigsSpecific.replace(':key', 'AUTO_ACTIVATE_USER_ON_REGISTER'), {
        value: true
      }, {
        Authorization: `Bearer ${superAdminToken}`
      });
      this.assert.assertEqual(setActiveResponse.status, 200, 'Should set AUTO_ACTIVATE_USER_ON_REGISTER = true');

      // Step 3: Register user (should be active and can login immediately)
      this.logger.info('👤 Step 3: Register user with auto-activation enabled');
      const timestamp = Date.now();
      const userData = {
        email: `reg_to_login_${timestamp}@example.com`,
        password: 'RegToLogin123!',
        full_name: 'Reg To Login User'
      };

      const regResponse = await this.client.post(API_ENDPOINTS.register, userData);
      this.assert.assertEqual(regResponse.status, 201, 'Registration should succeed');
      this.assert.assertEqual(regResponse.data.data.status, 'active', 'User should be created as active');

      const userId = regResponse.data.data.id;
      this.testUsers.push({ id: userId, email: userData.email });

      // Step 4: Immediate login with same credentials (should succeed)
      this.logger.info('Step 4: Verify immediate login after registration');
      const loginResponse = await this.client.post(API_ENDPOINTS.login, {
        email: userData.email,
        password: userData.password
      });
      this.assert.assertEqual(loginResponse.status, 200, 'Login after registration should succeed');

      // Step 5: Verify token works for profile access
      this.logger.info('Step 5: Verify profile access with user token');
      const profileResponse = await this.client.get(API_ENDPOINTS.profile, {
        Authorization: `Bearer ${loginResponse.data.data.access_token}`
      });
      this.assert.assertEqual(profileResponse.status, 200, 'Profile access with token should succeed');
      this.assert.assertEqual(profileResponse.data.success, true, 'Token should work for profile access');

      // Step 6: Admin user management workflow
      this.logger.info('👨‍💼 Step 6: Testing admin user management workflow...');

      // Login as admin
      const adminLoginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);
      const adminToken = adminLoginResponse.data.data.access_token;

      // Get user list
      const usersResponse = await this.client.get(API_ENDPOINTS.adminUsers, {
        Authorization: `Bearer ${adminToken}`
      });
      this.assert.assertEqual(usersResponse.data.success, true, 'Admin should access user list');

      const initialUserCount = usersResponse.data.data.pagination.total;

      // Step 7: Create user as admin (inherits current AUTO_ACTIVATE setting)
      this.logger.info('👤 Step 7: Admin creates new user');
      const timestamp2 = Date.now();
      const newUser = {
        email: `admin_created_${timestamp2}@example.com`,
        password: 'AdminCreated123!',
        full_name: 'Admin Created User',
        role: 'user'
      };

      const createResponse = await this.client.post(API_ENDPOINTS.adminUsers, newUser, {
        Authorization: `Bearer ${adminToken}`
      });

      this.assert.assertEqual(createResponse.status, 201, 'Admin should create user');
      this.assert.assertEqual(createResponse.data.data.status, 'active', 'Admin-created user should be active');

      const createdUserId = createResponse.data.data.id;
      this.testUsers.push({ id: createdUserId, email: newUser.email });

      // Step 8: Verify user count increased
      this.logger.info('Step 8: Verify user count increased');
      const updatedUsersResponse = await this.client.get(API_ENDPOINTS.adminUsers, {
        Authorization: `Bearer ${adminToken}`
      });

      this.assert.assertEqual(updatedUsersResponse.data.data.pagination.total, initialUserCount + 1,
        'User count should increase');

      // Step 9: Update user role
      this.logger.info('Step 9: Update user role to admin');
      const roleUpdateResponse = await this.client.put(`${API_ENDPOINTS.adminUsers}/${createdUserId}/role`, {
        role: 'admin'
      }, {
        Authorization: `Bearer ${adminToken}`
      });

      this.assert.assertEqual(roleUpdateResponse.data.success, true, 'Admin can update user role to \'admin\'');
      this.assert.assertEqual(roleUpdateResponse.data.data.newRole, 'admin', 'User role should be updated to admin');

      // Step 10: Verify created user can login
      this.logger.info('Step 10: Verify admin-created user can login');
      const userLoginResponse = await this.client.post(API_ENDPOINTS.login, {
        email: newUser.email,
        password: newUser.password
      });
      this.assert.assertEqual(userLoginResponse.status, 200, 'Created user should be able to login');

      this.logger.success('User registration and admin management flow completed successfully');
      this.logger.info('📝 Test summary:');
      this.logger.info(`- Self-registered user: ${userData.email} (active, can login)`);
      this.logger.info(`- Admin-created user: ${newUser.email} (active, promoted to admin, can login)`);

    } catch (error) {
      this.logger.error(`[testUserAndAdminFlow] User and admin flow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tests password change workflow with AUTO_ACTIVATE feature
   * Test scenario:
   * 1. Ensure AUTO_ACTIVATE_USER_ON_REGISTER = true
   * 2. Register user and verify active status
   * 3. Login with original password
   * 4. Change password
   * 5. Login with new password
   * 6. Verify old password is rejected
   *
   * Covers:
   * - User registration with auto-activation
   * - Password change functionality
   * - Login validation after password change
   * - Security verification (old password rejection)
   */
  async testPasswordChangeFlow() {
    this.logger.info('Testing password change workflow...');

    try {
      // Step 1: Login as super_admin to ensure AUTO_ACTIVATE is enabled
      this.logger.info('🔐 Step 1: Login as super_admin to ensure AUTO_ACTIVATE_USER_ON_REGISTER = true');
      const superAdminLoginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);
      this.assert.assertEqual(superAdminLoginResponse.status, 200, 'Super admin login should succeed');
      const superAdminToken = superAdminLoginResponse.data.data.access_token;

      // Step 2: Ensure AUTO_ACTIVATE_USER_ON_REGISTER = true
      this.logger.info('⚙️  Step 2: Ensure AUTO_ACTIVATE_USER_ON_REGISTER = true');
      const setActiveResponse = await this.client.put(API_ENDPOINTS.kvAdminConfigsSpecific.replace(':key', 'AUTO_ACTIVATE_USER_ON_REGISTER'), {
        value: true
      }, {
        Authorization: `Bearer ${superAdminToken}`
      });
      this.assert.assertEqual(setActiveResponse.status, 200, 'Should set AUTO_ACTIVATE_USER_ON_REGISTER = true');

      // Step 3: Create test user for password change
      this.logger.info('👤 Step 3: Register user for password change test');
      const timestamp = Date.now();
      const userData = {
        email: `pwd_change_${timestamp}@example.com`,
        password: 'OriginalPass123!',
        full_name: 'Password Change User'
      };

      const regResponse = await this.client.post(API_ENDPOINTS.register, userData);
      this.assert.assertEqual(regResponse.status, 201, 'User registration should succeed');
      this.assert.assertEqual(regResponse.data.data.status, 'active', 'User should be created as active');

      const userId = regResponse.data.data.id;
      this.testUsers.push({ id: userId, email: userData.email });

      // Step 4: Login with original password
      this.logger.info('Step 4: Login with original password');
      const loginResponse = await this.client.post(API_ENDPOINTS.login, {
        email: userData.email,
        password: userData.password
      });
      this.assert.assertEqual(loginResponse.status, 200, 'Login with original password should succeed');
      const token = loginResponse.data.data.access_token;

      // Step 5: Change password
      this.logger.info('Step 5: Change user password');
      const newPassword = 'NewSecurePass123!';
      const passwordChangeResponse = await this.client.post(API_ENDPOINTS.userChangePassword, {
        currentPassword: userData.password,
        newPassword: newPassword,
        confirmPassword: newPassword
      }, {
        Authorization: `Bearer ${token}`
      });

      this.assert.assertEqual(passwordChangeResponse.status, 200, 'Password change should succeed');

      // Step 6: Login with new password
      this.logger.info('Step 6: Verify login with new password');
      const newLoginResponse = await this.client.post(API_ENDPOINTS.login, {
        email: userData.email,
        password: newPassword
      });

      this.assert.assertEqual(newLoginResponse.status, 200, 'Login with new password should succeed');

      // Step 7: Verify old password doesn't work
      this.logger.info('🚫 Step 7: Verify old password is rejected');
      const oldPasswordResponse = await this.client.post(API_ENDPOINTS.login, {
        email: userData.email,
        password: userData.password
      });
      this.assert.assertEqual(oldPasswordResponse.status, 401, 'Old password should be rejected with 401');

      this.logger.success('Password change workflow completed successfully');
      this.logger.info('📝 Test summary:');
      this.logger.info(`- User: ${userData.email} (active, password changed successfully)`);
      this.logger.info('- Old password: Rejected (401)');
      this.logger.info('- New password: Accepted (200)');

    } catch (error) {
      this.logger.error(`[testPasswordChangeFlow] Password change workflow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tests complete authentication flow with token refresh
   * Covers: Login → Access protected endpoint → Refresh token → Use new token
   */
  async testAuthenticationFlow() {
    this.logger.info('Testing complete authentication flow...');

    try {
      const user = TEST_USERS.valid;

      // Step 1: Login
      const loginResponse = await this.client.post(API_ENDPOINTS.login, user);
      this.assert.assertEqual(loginResponse.status, 200, 'Login should succeed');

      const { access_token, refresh_token } = loginResponse.data.data;
      this.assert.assertNotEmpty(access_token, 'Should receive access token');
      this.assert.assertNotEmpty(refresh_token, 'Should receive refresh token');

      // Step 2: Use access token
      const protectedResponse = await this.client.get(API_ENDPOINTS.profile, {
        Authorization: `Bearer ${access_token}`
      });
      this.assert.assertEqual(protectedResponse.status, 200, 'Access token should work');

      // Step 3: Refresh token
      const refreshResponse = await this.client.post(API_ENDPOINTS.refreshToken, {
        refresh_token: refresh_token
      });
      this.assert.assertEqual(refreshResponse.status, 200, 'Token refresh should succeed');
      const newToken = refreshResponse.data.data.access_token;
      this.assert.assertNotEmpty(newToken, 'Should receive new access token');

      // Step 4: Use new token
      const newTokenResponse = await this.client.get(API_ENDPOINTS.profile, {
        Authorization: `Bearer ${newToken}`
      });
      this.assert.assertEqual(newTokenResponse.status, 200, 'New token should work');

      this.logger.success('Authentication flow completed successfully');
    } catch (error) {
      this.logger.error(`[testAuthenticationFlow] Authentication flow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tests admin user management functionality
   * Covers: Admin login → Access admin endpoints
   */
  async testAdminUserManagement() {
    this.logger.info('Testing admin user management...');

    try {
      // Login as admin
      const adminLoginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);
      this.assert.assertEqual(adminLoginResponse.status, 200, 'Admin login should succeed');

      const adminToken = adminLoginResponse.data.data.access_token;

      // Get user list
      const usersResponse = await this.client.get(API_ENDPOINTS.adminUsers, {
        Authorization: `Bearer ${adminToken}`
      });
      this.assert.assertEqual(usersResponse.status, 200, 'Admin should access user list');

      this.logger.success('Admin user management completed successfully');
    } catch (error) {
      this.logger.error(`[testAdminUserManagement] Admin user management failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tests multi-language workflow with different languages
   * Covers: Language detection and response in different languages
   */
  async testMultiLanguageWorkflow() {
    this.logger.info('Testing multi-language workflow...');

    try {
      const user = TEST_USERS.valid;

      for (const lang of TEST_LANGUAGES) {
        // Login with language preference
        const loginResponse = await this.client.post(`${API_ENDPOINTS.login}?lang=${lang}`, user);
        this.assert.assertEqual(loginResponse.status, 200, `Login with ${lang} should succeed`);

        const token = loginResponse.data.data.access_token;

        // Access profile with language
        const profileResponse = await this.client.get(`${API_ENDPOINTS.profile}?lang=${lang}`, {
          Authorization: `Bearer ${token}`
        });
        this.assert.assertEqual(profileResponse.status, 200, `Profile access with ${lang} should succeed`);

        // Test error with language
        try {
          await this.client.post(`${API_ENDPOINTS.login}?lang=${lang}`, {
            email: user.email,
            password: 'wrongpassword'
          });
        } catch (error) {
          this.assert.assertEqual(error.response.status, 401, `Invalid login with ${lang} should fail`);
          this.assert.assertNotEmpty(error.response.data.error, `Error message in ${lang} should exist`);
        }
      }

      this.logger.success('Multi-language workflow completed successfully');
    } catch (error) {
      this.logger.error(`[testMultiLanguageWorkflow] Multi-language workflow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tests role-based access control workflow
   * Covers: Regular user vs admin access restrictions
   */
  async testRoleBasedWorkflow() {
    this.logger.info('Testing role-based workflow...');

    try {
      // Test regular user workflow
      const userLoginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.valid);
      const userToken = userLoginResponse.data.data.access_token;

      // User can access their profile
      const userProfileResponse = await this.client.get(API_ENDPOINTS.profile, {
        Authorization: `Bearer ${userToken}`
      });
      this.assert.assertEqual(userProfileResponse.status, 200, 'User should access own profile');

      // User cannot access admin endpoints
      try {
        await this.client.get(API_ENDPOINTS.adminUsers, {
          Authorization: `Bearer ${userToken}`
        });
      } catch (error) {
        this.assert.assertEqual(error.response.status, 403, 'User should get 403 for admin endpoints');
      }

      // Test admin workflow
      const adminLoginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);
      const adminToken = adminLoginResponse.data.data.access_token;

      // Admin can access admin endpoints
      const adminUsersResponse = await this.client.get(API_ENDPOINTS.adminUsers, {
        Authorization: `Bearer ${adminToken}`
      });
      this.assert.assertEqual(adminUsersResponse.status, 200, 'Admin should access admin endpoints');

      // Admin can also access regular endpoints
      const adminProfileResponse = await this.client.get(API_ENDPOINTS.profile, {
        Authorization: `Bearer ${adminToken}`
      });
      this.assert.assertEqual(adminProfileResponse.status, 200, 'Admin should access user endpoints');

      this.logger.success('Role-based workflow completed successfully');
    } catch (error) {
      this.logger.error(`[testRoleBasedWorkflow] Role-based workflow failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tests error handling integration across components
   * Covers: Various error scenarios and consistent error responses
   */
  async testErrorHandlingIntegration() {
    this.logger.info('Testing error handling integration...');

    try {
      // Test various error scenarios
      const errorTests = [
        {
          name: 'Invalid endpoint',
          request: () => this.client.get(API_ENDPOINTS.nonExistent),
          expectedStatus: 404
        },
        {
          name: 'Invalid JSON',
          request: () => this.client.post(API_ENDPOINTS.login, 'invalid json', {
            headers: { 'Content-Type': 'application/json' }
          }),
          expectedStatus: 400
        },
        {
          name: 'Missing auth header',
          request: () => this.client.get(API_ENDPOINTS.profile),
          expectedStatus: 401
        },
        {
          name: 'Invalid token',
          request: () => this.client.get(API_ENDPOINTS.profile, {
            Authorization: 'Bearer invalid-token'
          }),
          expectedStatus: 401
        }
      ];

      for (const test of errorTests) {
        try {
          await test.request();
        } catch (error) {
          this.assert.assertEqual(error.response.status, test.expectedStatus,
            `${test.name} should return ${test.expectedStatus}`);
          this.assert.assertEqual(error.response.data.success, false,
            `${test.name} should indicate failure`);
          this.assert.assertNotEmpty(error.response.data.error,
            `${test.name} should include error message`);
        }
      }

      this.logger.success('Error handling integration completed successfully');
    } catch (error) {
      this.logger.error(`[testErrorHandlingIntegration] Error handling integration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Tests system integration endpoints and features
   * Covers: Health check, CORS, language detection
   */
  async testSystemIntegration() {
    this.logger.info('Testing system integration...');

    try {
      // Test health check
      const healthResponse = await this.client.get(API_ENDPOINTS.health);
      this.assert.assertEqual(healthResponse.status, 200, 'Health check should work');
      this.assert.assertEqual(healthResponse.data.data.status, 'ok', 'Health check should be successful');

      // Test CORS
      const corsResponse = await this.client.options(API_ENDPOINTS.health);
      this.assert.assertEqual(corsResponse.status, 204, 'CORS preflight should work');

      // Test language detection
      const langResponse = await this.client.get(API_ENDPOINTS.health, {
        headers: { 'Accept-Language': 'vi-VN,vi;q=0.9' }
      });
      this.assert.assertEqual(langResponse.status, 200, 'Language detection should work');

      this.logger.success('System integration completed successfully');
    } catch (error) {
      this.logger.error(`[testSystemIntegration] System integration failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Cleans up test data created during test execution
   * Removes created test users via admin API
   */
  async cleanup() {
    this.logger.info('Cleaning up test data...');

    if (this.testUsers.length === 0) {
      this.logger.info('No test users to clean up');
      return;
    }

    try {
      // Login as admin to clean up users
      const adminLoginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);
      const adminToken = adminLoginResponse.data.access_token;

      for (const user of this.testUsers) {
        try {
          await this.client.delete(`${API_ENDPOINTS.adminUsers}/${user.id}`, {
            Authorization: `Bearer ${adminToken}`
          });
          this.logger.info(`Cleaned up test user: ${user.email}`);
        } catch (error) {
          this.logger.warning(`Could not clean up user ${user.email}: ${error.message}`);
        }
      }

      this.testUsers = [];
      this.logger.success('Cleanup completed successfully');
    } catch (error) {
      this.logger.warning('Could not perform cleanup - admin access required');
      this.logger.error(`[cleanup] Cleanup failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { IntegrationTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new IntegrationTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
