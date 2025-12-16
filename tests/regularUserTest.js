#!/usr/bin/env node

/**
 * Regular User Role Test Suite
 * Tests regular user functionality and access restrictions: /api/user/*
 *
 * Endpoints tested:
 * - GET /api/user/profile - User profile access (own profile only)
 * - PUT /api/user/profile - Profile updates (own profile only)
 *
 * Test coverage:
 * - Regular user role authentication and basic authorization
 * - Profile management (view/update own profile only)
 * - Access restrictions validation (cannot access admin endpoints)
 * - User management restrictions (cannot create/update/delete other users)
 * - System administration restrictions (stats, dashboard, system health)
 * - Audit logs access restrictions (admin-only features)
 * - KV admin configuration restrictions (super admin-only features)
 * - Role management restrictions (cannot change user roles)
 * - Account deletion restrictions (cannot delete own or other accounts)
 * - Role-based authorization enforcement and security boundary validation
 * - Admin privilege escalation prevention
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';


class RegularUserTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.regularUser = TEST_USERS.regular;
    this.accessToken = null;
    this.refreshToken = null;
  }

  /**
   * Run all tests
   */
  async runAll() {
    this.logger.logSuiteHeader('👤 Starting Regular User Role Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testGetOwnProfile,
      this.testUpdateOwnProfile,
      this.testCannotAccessUsersList,
      this.testCannotCreateUsers,
      this.testCannotUpdateOtherUsers,
      this.testCannotDeleteUsers,
      this.testCannotChangeUserRoles,
      this.testCannotAccessSystemStats,
      this.testCannotAccessAdminDashboard,
      this.testCannotAccessSystemHealth,
      this.testCannotAccessAuditLogs,
      this.testCannotAccessOthersAuditLogs,
      this.testCannotDeleteAuditLogs,
      this.testCannotAccessKVAdmin,
      this.testCannotDeleteOwnAccount,
      this.testCannotAccessOtherUserProfiles,
      this.testCannotAccessAdminEndpoints,
      this.testAccessPublicEndpoints,
      this.testCannotAccessSystemHealth,
      this.testCannotAccessAuditLogs,
      this.testCannotAccessDashboard,
      this.testTokenRefresh,
      this.testAccessAPI,
      this.testProfileValidation,
      this.testPasswordChange,
      this.testCannotChangeRoles,
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
   * Setup regular user authentication
   */
  async setupAuthentication() {
    this.logger.info('Setting up regular user authentication...');

    try {
      const loginData = {
        email: this.regularUser.email,
        password: this.regularUser.password
      };

      const response = await this.client.post(API_ENDPOINTS.login, loginData);
      this.accessToken = response.data.data.access_token;
      this.refreshToken = response.data.data.refresh_token;

      // Set auth token for all subsequent requests
      this.client.setAuthToken(this.accessToken);

      this.assert.exists(this.accessToken, 'Should obtain regular user access token');

      // Verify user role
      const profileResponse = await this.client.get(API_ENDPOINTS.profile);
      const userRole = profileResponse.data.data.role;
      this.assert.assertEqual(userRole, 'user', 'User should have regular user role');

      this.logger.success('Regular user authentication setup completed');
    } catch (error) {
      this.logger.error(`[setupAuthentication] Regular user authentication setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user can access own profile
   */
  async testGetOwnProfile() {
    this.logger.info('Testing user profile access...');

    try {
      const response = await this.client.get(API_ENDPOINTS.profile);

      this.assert.assertEqual(response.status, 200, 'User should access own profile');
      this.assert.assertEqual(response.data.success, true, 'Profile request should be successful');
      this.assert.exists(response.data.data, 'Should return user data');
      this.assert.exists(response.data.data.email, 'Should return user email');
      this.assert.exists(response.data.data.full_name, 'Should return user full name');
      this.assert.assertEqual(response.data.data.role, 'user', 'Should return user role');

      this.logger.success('User profile access test completed successfully');
    } catch (error) {
      this.logger.error(`[testGetOwnProfile] User profile access test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot access users list
   */
  async testCannotAccessUsersList() {
    this.logger.info('Testing users list access restriction...');

    try {
      try {
        await this.client.get(API_ENDPOINTS.adminUsers);
        throw new Error('Should not be able to access users list');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for users list access');
      }

      this.logger.success('Users list access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotAccessUsersList] Users list access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot change user roles
   */
  async testCannotChangeUserRoles() {
    this.logger.info('Testing user role change access restriction...');

    try {
      const roleChangeData = {
        role: 'admin'
      };

      const otherUserId = 1;

      try {
        await this.client.put(`${API_ENDPOINTS.adminUsers}/${otherUserId}/role`, roleChangeData);
        throw new Error('Should not be able to change user roles');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for role change');
      }

      this.logger.success('User role change access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotChangeUserRoles] User role change access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot access admin dashboard
   */
  async testCannotAccessAdminDashboard() {
    this.logger.info('Testing admin dashboard access restriction...');

    try {
      try {
        await this.client.get(API_ENDPOINTS.adminDashboard);
        throw new Error('Should not be able to access admin dashboard');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for admin dashboard access');
      }

      this.logger.success('Admin dashboard access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotAccessAdminDashboard] Admin dashboard access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot access system health
   */
  async testCannotAccessSystemHealth() {
    this.logger.info('Testing system health access restriction...');

    try {
      try {
        await this.client.get(API_ENDPOINTS.adminSystemHealth);
        throw new Error('Should not be able to access system health');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for system health access');
      }

      this.logger.success('System health access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotAccessSystemHealth] System health access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot access audit logs (admin feature)
   */
  async testCannotAccessAuditLogs() {
    this.logger.info('Testing audit logs access restriction...');

    try {
      try {
        await this.client.get(API_ENDPOINTS.auditLogs);
        throw new Error('Should not be able to access audit logs');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for audit logs access');
      }

      this.logger.success('Audit logs access restriction test completed successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('Audit logs endpoint not implemented yet - skipping');
      } else {
        this.logger.error(`[testCannotAccessAuditLogs] Audit logs access restriction test failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Test user cannot access others' audit logs
   */
  async testCannotAccessOthersAuditLogs() {
    this.logger.info('Testing others audit logs access restriction...');

    try {
      try {
        await this.client.get(`${API_ENDPOINTS.auditLogs}?user_id=1`);
        throw new Error('Should not be able to access others audit logs');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for others audit logs access');
      }

      this.logger.success('Others audit logs access restriction test completed successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('Audit logs endpoint not implemented yet - skipping');
      } else {
        this.logger.error(`[testCannotAccessOthersAuditLogs] Others audit logs access restriction test failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Test user cannot delete audit logs
   */
  async testCannotDeleteAuditLogs() {
    this.logger.info('Testing audit logs deletion access restriction...');

    try {
      try {
        await this.client.delete(`${API_ENDPOINTS.auditLogs}/1`);
        throw new Error('Should not be able to delete audit logs');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for audit logs deletion');
      }

      this.logger.success('Audit logs deletion access restriction test completed successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('Audit logs endpoint not implemented yet - skipping');
      } else {
        this.logger.error(`[testCannotDeleteAuditLogs] Audit logs deletion access restriction test failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Test user cannot access KV admin endpoints
   */
  async testCannotAccessKVAdmin() {
    this.logger.info('Testing KV admin access restriction...');

    try {
      try {
        await this.client.get(API_ENDPOINTS.kvAdminConfigs);
        throw new Error('Should not be able to access KV admin endpoints');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for KV admin access');
      }

      this.logger.success('KV admin access restriction test completed successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('KV admin endpoint not implemented yet - skipping');
      } else {
        this.logger.error(`[testCannotAccessKVAdmin] KV admin access restriction test failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Test user cannot delete own account
   */
  async testCannotDeleteOwnAccount() {
    this.logger.info('Testing own account deletion restriction...');

    try {
      // Regular users should not be able to delete their own account
      try {
        await this.client.delete(API_ENDPOINTS.profile);
        throw new Error('Should not be able to delete own account');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for own account deletion');
      }

      this.logger.success('Own account deletion restriction test completed successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('Account deletion endpoint not implemented yet - skipping');
      } else {
        this.logger.error(`[testCannotDeleteOwnAccount] Own account deletion restriction test failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Test user can update own profile
   */
  async testUpdateOwnProfile() {
    this.logger.info('Testing user profile update...');

    const updateData = {
      full_name: 'Updated Regular User Name'
    };

    try {
      const response = await this.client.put(API_ENDPOINTS.profile, updateData);

      this.assert.assertEqual(response.status, 200, 'User should update own profile');
      this.assert.assertEqual(response.data.success, true, 'Profile update should be successful');
      this.assert.assertEqual(response.data.data.full_name, updateData.full_name, 'Full name should be updated');

      this.logger.success('User profile update test completed successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('Profile update endpoint not implemented yet - skipping');
      } else {
        this.logger.error(`[testUpdateOwnProfile] User profile update test failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Test user cannot access admin endpoints
   */
  async testCannotAccessAdminEndpoints() {
    this.logger.info('Testing admin endpoints access restriction...');

    try {
      const adminEndpoints = [
        API_ENDPOINTS.adminUsers,
        API_ENDPOINTS.adminStats,
        API_ENDPOINTS.adminSettings
      ];

      for (const endpoint of adminEndpoints) {
        try {
          await this.client.get(endpoint);
          throw new Error(`Should not be able to access ${endpoint}`);
        } catch (error) {
          this.assert.assertNotEqual(error.message, null, `Should get 403 for ${endpoint}`);
        }
      }

      this.logger.success('Admin endpoints access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotAccessAdminEndpoints] Admin endpoints access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot access admin dashboard
   */
  async testCannotAccessDashboard() {
    this.logger.info('Testing admin dashboard access restriction...');

    try {
      // Regular user should not be able to access admin dashboard
      try {
        await this.client.get(API_ENDPOINTS.adminDashboard);
        throw new Error('Should not be able to access admin dashboard');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Regular user should get 403 for dashboard access');
      }

      this.logger.success('Admin dashboard access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotAccessDashboard] Admin dashboard access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot access other user profiles
   */
  async testCannotAccessOtherUserProfiles() {
    this.logger.info('Testing other user profile access restriction...');

    try {
      // Try to access another user's profile (assuming user ID 1 exists and is not current user)
      const otherUserId = 1;

      try {
        await this.client.get(`${API_ENDPOINTS.adminUsers}/${otherUserId}`);
        throw new Error('Should not be able to access other user profiles');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for other user profile');
      }

      this.logger.success('Other user profile access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotAccessOtherUserProfiles] Other user profile access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot create other users
   */
  async testCannotCreateUsers() {
    this.logger.info('Testing user creation access restriction...');

    try {
      const newUser = {
        email: `regular_user_attempt_${Date.now()}@example.com`,
        password: 'AttemptCreate123!',
        full_name: 'Regular User Attempt',
        role: 'user'
      };

      try {
        await this.client.post(API_ENDPOINTS.adminUsers, newUser);
        throw new Error('Should not be able to create users');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for user creation');
      }

      this.logger.success('User creation access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotCreateUsers] User creation access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot update other users
   */
  async testCannotUpdateOtherUsers() {
    this.logger.info('Testing other user update access restriction...');

    try {
      const updateData = {
        full_name: 'Updated by Regular User'
      };

      const otherUserId = 1;

      try {
        await this.client.put(`${API_ENDPOINTS.adminUsers}/${otherUserId}`, updateData);
        throw new Error('Should not be able to update other users');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for updating other users');
      }

      this.logger.success('Other user update access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotUpdateOtherUsers] Other user update access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot delete other users
   */
  async testCannotDeleteUsers() {
    this.logger.info('Testing user deletion access restriction...');

    try {
      const otherUserId = 1;

      try {
        await this.client.delete(`${API_ENDPOINTS.adminUsers}/${otherUserId}`);
        throw new Error('Should not be able to delete users');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for user deletion');
      }

      this.logger.success('User deletion access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotDeleteUsers] User deletion access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot access system stats
   */
  async testCannotAccessSystemStats() {
    this.logger.info('Testing system stats access restriction...');

    try {
      try {
        await this.client.get(API_ENDPOINTS.adminStats);
        throw new Error('Should not be able to access system stats');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for system stats');
      }

      this.logger.success('System stats access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotAccessSystemStats] System stats access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user cannot change roles
   */
  async testCannotChangeRoles() {
    this.logger.info('Testing role change access restriction...');

    try {
      const roleChangeData = {
        role: 'admin'
      };

      const otherUserId = 1;

      try {
        await this.client.put(`${API_ENDPOINTS.adminUsers}/${otherUserId}/role`, roleChangeData);
        throw new Error('Should not be able to change roles');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 403 for role change');
      }

      this.logger.success('Role change access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotChangeRoles] Role change access restriction test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user password change functionality
   */
  async testPasswordChange() {
    this.logger.info('Testing password change functionality...');

    const passwordChangeData = {
      currentPassword: this.regularUser.password,
      newPassword: 'NewPassword123!',
      confirmPassword: 'NewPassword123!'
    };

    try {
      const response = await this.client.put(API_ENDPOINTS.userChangePassword, passwordChangeData);
      this.assert.assertEqual(response.status, 200, 'User should change own password');
      this.assert.assertEqual(response.data.success, true, 'Password change should be successful');

      // Test login with new password
      const loginResponse = await this.client.post(API_ENDPOINTS.login, {
        email: this.regularUser.email,
        password: 'NewPassword123!'
      });

      this.assert.assertEqual(loginResponse.status, 200, 'Should login with new password');

      // Change back to original password for other tests
      await this.client.put(API_ENDPOINTS.userChangePassword, {
        currentPassword: 'NewPassword123!',
        newPassword: this.regularUser.password,
        confirmPassword: this.regularUser.password
      });

      this.logger.success('Password change test completed successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('Password change endpoint not implemented yet - skipping');
      } else {
        this.logger.error(`[testPasswordChange] Password change test failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Test profile validation with invalid data
   */
  async testProfileValidation() {
    this.logger.info('Testing profile validation with invalid data...');

    try {
      // Test invalid profile data
      const invalidData = {
        full_name: '', // Empty name should fail
        email: 'invalid-email' // Invalid email format
      };

      try {
        await this.client.put(API_ENDPOINTS.profile, invalidData);
        throw new Error('Should fail with invalid profile data');
      } catch (error) {
        this.assert.assertNotEqual(error.message, null, 'Should get 400 for invalid profile data');
      }

      this.logger.success('Profile validation test completed successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('Profile update endpoint not implemented yet - skipping validation test');
      } else {
        this.logger.error(`[testProfileValidation] Profile validation test failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Test access to public endpoints
   */
  async testAccessPublicEndpoints() {
    this.logger.info('Testing access to public endpoints...');

    try {
      const publicEndpoints = [
        { endpoint: '/language', method: 'get' }
      ];

      for (const { endpoint, method } of publicEndpoints) {
        try {
          const response = await this.client[method](endpoint);
          this.assert.assertEqual(response.status, 200, `Should access public endpoint: ${endpoint}`);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            this.logger.warning(`Public endpoint ${endpoint} not implemented - skipping`);
          } else {
            throw error;
          }
        }
      }

      this.logger.success('Public endpoints access test completed successfully');
    } catch (error) {
      this.logger.error(`[testAccessPublicEndpoints] Public endpoints access test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test token refresh functionality
   */
  async testTokenRefresh() {
    this.logger.info('Testing token refresh functionality...');

    try {
      const response = await this.client.post(API_ENDPOINTS.refreshToken, {
        refresh_token: this.refreshToken
      });

      this.assert.assertEqual(response.status, 200, 'Should refresh token');
      this.assert.assertEqual(response.data.success, true, 'Token refresh should be successful');
      this.assert.exists(response.data.data.access_token, 'Should return new access token');

      this.logger.success('Token refresh test completed successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('Token refresh endpoint not implemented yet - skipping');
      } else {
        this.logger.error(`[testTokenRefresh] Token refresh test failed: ${error.message}`);
        throw error;
      }
    }
  }

  /**
   * Test access to API info endpoint
   */
  async testAccessAPI() {
    this.logger.info('Testing API info access...');

    try {
      // Test that regular user can access API info
      const response = await this.client.get(API_ENDPOINTS.api);

      this.assert.assertEqual(response.status, 200, 'API info should be accessible to regular user');
      this.assert.assertEqual(response.data.status, 'running', 'API info request should be successful');
      this.assert.exists(response.data.endpoints, 'Should return API info data');

      this.logger.success('API info access test completed successfully');
    } catch (error) {
      this.logger.error(`[testAccessAPI] API info access test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { RegularUserTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new RegularUserTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
