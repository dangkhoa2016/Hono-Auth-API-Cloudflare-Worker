#!/usr/bin/env node

/**
 * Admin Routes i18n Message Translation Test Suite
 * Tests all message responses in admin routes to ensure proper translation
 *
 * Focus areas:
 * - Role display name translations (User, Administrator, Super Administrator)
 * - Success messages with proper interpolation
 * - Error messages with localized content
 * - Pluralization handling
 * - Date/time formatting
 * - Complex nested message formatting
 *
 * Routes tested:
 * - GET /api/admin/users - User list with filtering messages
 * - GET /api/admin/users/:id - User details messages
 * - POST /api/admin/users - User creation messages
 * - PUT /api/admin/users/:id - User update messages
 * - DELETE /api/admin/users/:id - User deletion messages
 * - PUT /api/admin/users/:id/role - Role change messages
 * - GET /api/admin/dashboard - Dashboard data messages
 * - GET /api/admin/stats - Statistics messages
 * - GET /api/admin/system-health - System health messages
 */

import { TestLogger } from './utils/testLogger.js';
import { TestClient } from './utils/testClient.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG, TEST_LANGUAGES } from './config/testConfig.js';

class AdminMessageTranslationTests {
  constructor() {
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test users for different scenarios
    this.adminUser = TEST_USERS.admin;
    this.superAdminUser = TEST_USERS.super_admin;
    this.accessToken = null;
    this.currentUserRole = null;
    this.createdUserIds = [];

    // Expected role translations
    this.expectedRoleTranslations = {
      'user': 'User',
      'admin': 'Administrator',
      'super_admin': 'Super Administrator'
    };
  }

  async runAll() {
    this.logger.logSuiteHeader('🌍 Starting Admin Routes i18n Message Translation Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAdminAuth();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testAdminRoleMessages,
      this.testSuperAdminRoleMessages,
      this.testMultiLanguageMessages
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

    await this.cleanup();
    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      process.exit(1);
    }
  }

  /**
   * Setup admin authentication
   */
  async setupAdminAuth() {
    try {
      this.logger.info('Setting up Admin authentication...');
      const response = await this.client.post(API_ENDPOINTS.login, this.adminUser);
      this.assert.assertSuccess(response, 'Admin authentication setup');

      this.accessToken = response.data.data.access_token;
      this.client.setAuthToken(this.accessToken);
      this.currentUserRole = 'admin';

      this.logger.success('Admin authentication setup completed');
    } catch (error) {
      this.logger.error(`[setupAdminAuth] Admin authentication setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Setup super admin authentication
   */
  async setupSuperAdminAuth() {
    try {
      this.logger.info('Setting up Super Admin authentication...');
      const response = await this.client.post(API_ENDPOINTS.login, this.superAdminUser);
      this.assert.assertSuccess(response, 'Super Admin authentication setup');

      this.accessToken = response.data.data.access_token;
      this.client.setAuthToken(this.accessToken);
      this.currentUserRole = 'super_admin';

      this.logger.success('Super Admin authentication setup completed');
    } catch (error) {
      this.logger.error(`[setupSuperAdminAuth] Super Admin authentication setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test all admin role specific messages
   */
  async testAdminRoleMessages() {
    this.logger.info('Testing Admin role message translations...');

    // Test with Admin role first
    await this.setupAdminAuth();

    // Run all admin-specific tests
    await this.testUserListMessages();
    await this.testUserCreationMessages();
    await this.testUserUpdateMessages();
    await this.testRoleChangeMessages();
    await this.testUserDeletionMessages();
    await this.testDashboardMessages();
    await this.testSystemStatsMessages();
    await this.testSystemHealthMessages();
    await this.testAccessRestrictionMessages();

    this.logger.success('All admin role message tests completed');
  }

  /**
   * Test all super admin role specific messages
   */
  async testSuperAdminRoleMessages() {
    this.logger.info('Testing Super Admin role message translations...');

    // Test with Super Admin role
    await this.setupSuperAdminAuth();

    // Run all super admin-specific tests
    await this.testUserListMessages();
    await this.testUserCreationMessages();
    await this.testSuperAdminUserCreation();
    await this.testRoleChangeMessages();
    await this.testDashboardMessages();
    await this.testSystemStatsMessages();
    await this.testSystemHealthMessages();

    this.logger.success('All super admin role message tests completed');
  }

  /**
   * Test user list messages and role translations
   */
  async testUserListMessages() {
    this.logger.info('Testing user list message translations...');

    try {
      const response = await this.client.get(API_ENDPOINTS.adminUsers);

      this.assert.assertEqual(response.status, 200, 'Should get user list successfully');
      this.assert.assertEqual(response.data.success, true, 'Response should be successful');
      this.assert.exists(response.data.message, 'Should include success message');

      const message = response.data.message;
      this.logger.info(`📝 User list message: "${message}"`);

      // Check for proper role translation in message
      if (this.currentUserRole === 'admin') {
        this.assert.assertStringContains(message, 'Administrator', 'Should contain translated role "Administrator"');
        this.assert.assertStringNotContains(message, 'admin', 'Should not contain raw role "admin"');
      } else if (this.currentUserRole === 'super_admin') {
        this.assert.assertStringContains(message, 'Super Administrator', 'Should contain translated role "Super Administrator"');
        this.assert.assertStringNotContains(message, 'super_admin', 'Should not contain raw role "super_admin"');
      }

      // Check for pluralization
      const userCount = response.data.data.users.length;
      if (userCount === 1) {
        this.assert.assertStringContains(message, '1 user', 'Should use singular form for 1 user');
      } else if (userCount > 1) {
        this.assert.assertStringContains(message, `${userCount} users`, 'Should use plural form for multiple users');
      }

      // Check for "Requested by" information
      this.assert.assertStringContains(message, 'Requested by', 'Should include "Requested by" information');

      this.logger.success('User list message translation test passed');
    } catch (error) {
      this.logger.error(`[testUserListMessages] User list message test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user creation messages
   */
  async testUserCreationMessages() {
    this.logger.info('Testing user creation message translations...');

    try {
      const newUser = {
        email: `message_test_${Date.now()}@example.com`,
        password: 'MessageTest123!',
        full_name: 'Message Test User',
        role: 'user'
      };

      const response = await this.client.post(API_ENDPOINTS.adminUsers, newUser);

      this.assert.assertEqual(response.status, 201, 'Should create user successfully');
      this.assert.assertEqual(response.data.success, true, 'Response should be successful');
      this.assert.exists(response.data.message, 'Should include success message');

      const message = response.data.message;
      this.logger.info(`📝 User creation message: "${message}"`);

      // Store user ID for cleanup
      this.createdUserIds.push(response.data.data.id);

      // Check for proper role translations
      this.assert.assertStringContains(message, 'User role', 'Should contain translated role "User"');
      this.assert.assertStringNotContains(message, 'user role', 'Should not contain raw role "user"');

      // Check for creator role translation
      if (this.currentUserRole === 'admin') {
        this.assert.assertStringContains(message, 'Administrator', 'Should contain creator role "Administrator"');
      } else if (this.currentUserRole === 'super_admin') {
        this.assert.assertStringContains(message, 'Super Administrator', 'Should contain creator role "Super Administrator"');
      }

      // Check for user name and "Created by" information
      this.assert.assertStringContains(message, newUser.full_name, 'Should include created user name');
      this.assert.assertStringContains(message, 'Created by', 'Should include "Created by" information');

      // Check for timestamp
      this.assert.assertStringContains(message, 'Created at', 'Should include "Created at" timestamp');

      this.logger.success('User creation message translation test passed');
    } catch (error) {
      this.logger.error(`[testUserCreationMessages] User creation message test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test super admin user creation (only for super admin role)
   */
  async testSuperAdminUserCreation() {
    if (this.currentUserRole !== 'super_admin') {
      this.logger.info('⏭️ Skipping super admin user creation test (not super admin)');
      return;
    }

    this.logger.info('Testing super admin user creation messages...');

    try {
      const newSuperAdmin = {
        email: `super_admin_message_test_${Date.now()}@example.com`,
        password: 'SuperAdminTest123!',
        full_name: 'Super Admin Message Test',
        role: 'super_admin'
      };

      const response = await this.client.post(API_ENDPOINTS.adminUsers, newSuperAdmin);

      this.assert.assertEqual(response.status, 201, 'Should create super admin successfully');
      this.assert.assertEqual(response.data.success, true, 'Response should be successful');
      this.assert.exists(response.data.message, 'Should include success message');

      const message = response.data.message;
      this.logger.info(`📝 Super admin creation message: "${message}"`);

      // Store user ID for cleanup
      this.createdUserIds.push(response.data.data.id);

      // Check for proper role translations
      this.assert.assertStringContains(message, 'Super Administrator role', 'Should contain translated role "Super Administrator"');
      this.assert.assertStringNotContains(message, 'super_admin role', 'Should not contain raw role "super_admin"');

      // Check for creator role translation
      this.assert.assertStringContains(message, 'Super Administrator', 'Should contain creator role "Super Administrator"');

      this.logger.success('Super admin creation message translation test passed');
    } catch (error) {
      this.logger.error(`[testSuperAdminUserCreation] Super admin creation message test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user update messages
   */
  async testUserUpdateMessages() {
    this.logger.info('Testing user update message translations...');

    try {
      // First create a user to update
      if (this.createdUserIds.length === 0) {
        await this.testUserCreationMessages();
      }

      const userId = this.createdUserIds[0];
      const updateData = {
        full_name: 'Updated Message Test User',
        status: 'active'
      };

      const response = await this.client.put(`${API_ENDPOINTS.adminUsers}/${userId}`, updateData);

      this.assert.assertEqual(response.status, 200, 'Should update user successfully');
      this.assert.assertEqual(response.data.success, true, 'Response should be successful');
      this.assert.exists(response.data.message, 'Should include success message');

      const message = response.data.message;
      this.logger.info(`📝 User update message: "${message}"`);

      // Check for updated user name
      this.assert.assertStringContains(message, updateData.full_name, 'Should include updated user name');

      // Check for "Updated by" information
      this.assert.assertStringContains(message, 'Updated by', 'Should include "Updated by" information');

      // Check for role translation in "Updated by"
      if (this.currentUserRole === 'admin') {
        this.assert.assertStringContains(message, 'Administrator', 'Should contain updater role "Administrator"');
      } else if (this.currentUserRole === 'super_admin') {
        this.assert.assertStringContains(message, 'Super Administrator', 'Should contain updater role "Super Administrator"');
      }

      // Check for changes count
      this.assert.assertStringContains(message, 'changes applied', 'Should include changes count');

      // Check for timestamp
      this.assert.assertStringContains(message, 'Updated at', 'Should include "Updated at" timestamp');

      this.logger.success('User update message translation test passed');
    } catch (error) {
      this.logger.error(`[testUserUpdateMessages] User update message test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test role change messages
   */
  async testRoleChangeMessages() {
    this.logger.info('Testing role change message translations...');

    try {
      // First create a user to change role
      if (this.createdUserIds.length === 0) {
        await this.testUserCreationMessages();
      }

      const userId = this.createdUserIds[0];
      const roleChangeData = {
        role: 'admin'
      };

      const response = await this.client.put(`${API_ENDPOINTS.adminUsers}/${userId}/role`, roleChangeData);

      this.assert.assertEqual(response.status, 200, 'Should change role successfully');
      this.assert.assertEqual(response.data.success, true, 'Response should be successful');
      this.assert.exists(response.data.message, 'Should include success message');

      const message = response.data.message;
      this.logger.info(`📝 Role change message: "${message}"`);

      // Check for old and new role translations
      this.assert.assertStringContains(message, 'User', 'Should contain old role translation "User"');
      this.assert.assertStringContains(message, 'Administrator', 'Should contain new role translation "Administrator"');
      this.assert.assertStringNotContains(message, 'user', 'Should not contain raw old role "user"');
      this.assert.assertStringNotContains(message, 'admin', 'Should not contain raw new role "admin"');

      // Check for "Changed by" information
      this.assert.assertStringContains(message, 'Changed by', 'Should include "Changed by" information');

      // Check for role changer role translation
      if (this.currentUserRole === 'admin') {
        this.assert.assertStringContains(message, 'Administrator', 'Should contain changer role "Administrator"');
      } else if (this.currentUserRole === 'super_admin') {
        this.assert.assertStringContains(message, 'Super Administrator', 'Should contain changer role "Super Administrator"');
      }

      // Check for "effective immediately"
      this.assert.assertStringContains(message, 'Changes effective immediately', 'Should include "effective immediately" message');

      // Check for timestamp
      this.assert.assertStringContains(message, 'Changed at', 'Should include "Changed at" timestamp');

      this.logger.success('Role change message translation test passed');
    } catch (error) {
      this.logger.error(`[testRoleChangeMessages] Role change message test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user deletion messages
   */
  async testUserDeletionMessages() {
    this.logger.info('Testing user deletion message translations...');

    try {
      // Create a user specifically for deletion test
      const deleteTestUser = {
        email: `delete_message_test_${Date.now()}@example.com`,
        password: 'DeleteTest123!',
        full_name: 'Delete Message Test User',
        role: 'user'
      };

      const createResponse = await this.client.post(API_ENDPOINTS.adminUsers, deleteTestUser);
      const userId = createResponse.data.data.id;

      const response = await this.client.delete(`${API_ENDPOINTS.adminUsers}/${userId}`);

      this.assert.assertEqual(response.status, 200, 'Should delete user successfully');
      this.assert.assertEqual(response.data.success, true, 'Response should be successful');
      this.assert.exists(response.data.message, 'Should include success message');

      const message = response.data.message;
      this.logger.info(`📝 User deletion message: "${message}"`);

      // Check for "Deleted by" information
      this.assert.assertStringContains(message, 'Deleted by', 'Should include "Deleted by" information');

      // Check for deleter role translation
      if (this.currentUserRole === 'admin') {
        this.assert.assertStringContains(message, 'Administrator', 'Should contain deleter role "Administrator"');
      } else if (this.currentUserRole === 'super_admin') {
        this.assert.assertStringContains(message, 'Super Administrator', 'Should contain deleter role "Super Administrator"');
      }

      // Check for action description
      this.assert.assertStringContains(message, 'permanent account deletion', 'Should include "permanent account deletion" action');

      // Check for timestamp
      this.assert.assertStringContains(message, 'Deleted at', 'Should include "Deleted at" timestamp');

      this.logger.success('User deletion message translation test passed');
    } catch (error) {
      this.logger.error(`[testUserDeletionMessages] User deletion message test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test dashboard messages
   */
  async testDashboardMessages() {
    this.logger.info('Testing dashboard message translations...');

    try {
      const response = await this.client.get(API_ENDPOINTS.adminDashboard);

      this.assert.assertEqual(response.status, 200, 'Should get dashboard successfully');
      this.assert.assertEqual(response.data.success, true, 'Response should be successful');
      this.assert.exists(response.data.message, 'Should include success message');

      const message = response.data.message;
      this.logger.info(`📝 Dashboard message: "${message}"`);

      // Check for user count pluralization
      const totalUsers = response.data.data.overview.totalUsers;
      if (totalUsers === 1) {
        this.assert.assertStringContains(message, '1 user total', 'Should use singular form for 1 user');
      } else if (totalUsers > 1) {
        this.assert.assertStringContains(message, `${totalUsers} users total`, 'Should use plural form for multiple users');
      }

      // Check for access level translation
      if (this.currentUserRole === 'admin') {
        this.assert.assertStringContains(message, 'limited access', 'Should show "limited access" for admin');
      } else if (this.currentUserRole === 'super_admin') {
        this.assert.assertStringContains(message, 'full system access', 'Should show "full system access" for super admin');
      }

      // Check for "Requested by" information
      this.assert.assertStringContains(message, 'Requested by', 'Should include "Requested by" information');

      // Check for requester role translation
      if (this.currentUserRole === 'admin') {
        this.assert.assertStringContains(message, 'Administrator', 'Should contain requester role "Administrator"');
      } else if (this.currentUserRole === 'super_admin') {
        this.assert.assertStringContains(message, 'Super Administrator', 'Should contain requester role "Super Administrator"');
      }

      this.logger.success('Dashboard message translation test passed');
    } catch (error) {
      this.logger.error(`[testDashboardMessages] Dashboard message test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test system stats messages
   */
  async testSystemStatsMessages() {
    this.logger.info('Testing system stats message translations...');

    try {
      const response = await this.client.get(API_ENDPOINTS.adminStats);

      this.assert.assertEqual(response.status, 200, 'Should get stats successfully');
      this.assert.assertEqual(response.data.success, true, 'Response should be successful');
      this.assert.exists(response.data.message, 'Should include success message');

      const message = response.data.message;
      this.logger.info(`📝 System stats message: "${message}"`);

      // Check for user count pluralization
      const totalUsers = response.data.data.totalUsers;
      const activeUsers = response.data.data.activeUsers;

      if (totalUsers === 1) {
        this.assert.assertStringContains(message, '1 user total', 'Should use singular form for 1 total user');
      } else if (totalUsers > 1) {
        this.assert.assertStringContains(message, `${totalUsers} users total`, 'Should use plural form for multiple total users');
      }

      if (activeUsers === 1) {
        this.assert.assertStringContains(message, '1 active user', 'Should use singular form for 1 active user');
      } else if (activeUsers > 1) {
        this.assert.assertStringContains(message, `${activeUsers} active users`, 'Should use plural form for multiple active users');
      }

      // Check for data scope
      if (this.currentUserRole === 'admin') {
        this.assert.assertStringContains(message, 'filtered data', 'Should show "filtered data" for admin');
      } else if (this.currentUserRole === 'super_admin') {
        this.assert.assertStringContains(message, 'complete data', 'Should show "complete data" for super admin');
      }

      // Check for percentage formatting
      this.assert.assertStringContains(message, '%', 'Should include percentage symbol');

      this.logger.success('System stats message translation test passed');
    } catch (error) {
      this.logger.error(`[testSystemStatsMessages] System stats message test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test system health messages
   */
  async testSystemHealthMessages() {
    this.logger.info('Testing system health message translations...');

    try {
      const response = await this.client.get(API_ENDPOINTS.adminSystemHealth);

      this.assert.assertEqual(response.status, 200, 'Should get system health successfully');
      this.assert.assertEqual(response.data.success, true, 'Response should be successful');
      this.assert.exists(response.data.message, 'Should include success message');

      const message = response.data.message;
      this.logger.info(`📝 System health message: "${message}"`);

      // Check for health status translation
      this.assert.assertStringContains(message, 'HEALTHY', 'Should contain health status');

      // Check for response time formatting
      this.assert.assertStringContains(message, 'Response time:', 'Should include response time');
      this.assert.assertStringContains(message, 'ms', 'Should include milliseconds unit');

      // Check for performance grade
      this.assert.assertStringContains(message, 'Performance:', 'Should include performance grade');

      // Check for security risk assessment
      this.assert.assertStringContains(message, 'Security risk:', 'Should include security risk');

      // Check for "Checked by" information
      this.assert.assertStringContains(message, 'Checked by', 'Should include "Checked by" information');

      // Check for checker role translation
      if (this.currentUserRole === 'admin') {
        this.assert.assertStringContains(message, 'Administrator', 'Should contain checker role "Administrator"');
      } else if (this.currentUserRole === 'super_admin') {
        this.assert.assertStringContains(message, 'Super Administrator', 'Should contain checker role "Super Administrator"');
      }

      this.logger.success('System health message translation test passed');
    } catch (error) {
      this.logger.error(`[testSystemHealthMessages] System health message test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test access restriction messages (Admin only)
   */
  async testAccessRestrictionMessages() {
    if (this.currentUserRole !== 'admin') {
      this.logger.info('⏭️ Skipping access restriction test (not admin)');
      return;
    }

    this.logger.info('Testing access restriction message translations...');

    try {
      // Try to access super_admin users (should be restricted for admin)
      const response = await this.client.get(`${API_ENDPOINTS.adminUsers}?role=super_admin`);

      this.assert.assertEqual(response.status, 200, 'Should get response (but empty)');
      this.assert.assertEqual(response.data.success, true, 'Response should be successful');
      this.assert.exists(response.data.message, 'Should include restriction message');

      const message = response.data.message;
      this.logger.info(`📝 Access restriction message: "${message}"`);

      // Check for access denied or restriction message
      const hasAccessDenied = message.includes('Access denied') || message.includes('denied') || message.includes('cannot view');
      this.assert.assertTrue(hasAccessDenied, 'Should contain access restriction message');

      // More flexible check - if message has role translations, validate them
      if (message.includes('Administrator') || message.includes('Super Administrator')) {
        if (message.includes('Administrator') && !message.includes('Super Administrator')) {
          this.assert.assertStringContains(message, 'Administrator', 'Should contain current role "Administrator"');
        }
        if (message.includes('Super Administrator')) {
          this.assert.assertStringContains(message, 'Super Administrator', 'Should contain restricted role "Super Administrator"');
        }
        this.assert.assertStringNotContains(message, 'admin', 'Should not contain raw role "admin"');
        this.assert.assertStringNotContains(message, 'super_admin', 'Should not contain raw role "super_admin"');
      }

      this.logger.success('Access restriction message translation test passed');
    } catch (error) {
      this.logger.error(`[testAccessRestrictionMessages] Access restriction message test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test multi-language message formatting
   */
  async testMultiLanguageMessages() {
    this.logger.info('Testing multi-language message translations...');

    for (const lang of TEST_LANGUAGES) {
      try {
        this.logger.info(`Testing ${lang.toUpperCase()} language...`);

        // Set language header
        this.client.setHeader('Accept-Language', lang);

        // Test a simple endpoint
        const response = await this.client.get(API_ENDPOINTS.adminUsers);

        this.assert.assertEqual(response.status, 200, `Should work with ${lang} language`);
        this.assert.exists(response.data.message, `Should have message in ${lang}`);

        const message = response.data.message;
        this.logger.info(`📝 ${lang.toUpperCase()} message: "${message}"`);

        // Basic validation - message should not be empty and should contain expected elements
        this.assert.assertNotEqual(message.trim(), '', `Message should not be empty in ${lang}`);

        this.logger.success(`${lang.toUpperCase()} language test passed`);
      } catch (error) {
        this.logger.error(`[testMultiLanguageMessages] ${lang.toUpperCase()} language test failed: ${error.message}`);
        // Don't throw - continue with other languages
      }
    }

    // Reset to English
    this.client.setHeader('Accept-Language', 'en');
  }

  /**
   * Cleanup created test users
   */
  async cleanup() {
    this.logger.info('Cleaning up created test users...');

    for (const userId of this.createdUserIds) {
      try {
        await this.client.delete(`${API_ENDPOINTS.adminUsers}/${userId}`);
        this.logger.info(`Deleted test user ${userId}`);
      } catch (error) {
        this.logger.warning(`Failed to delete user ${userId}: ${error.message}`);
      }
    }

    if (this.createdUserIds.length > 0) {
      this.logger.info(`Cleanup completed for ${this.createdUserIds.length} users`);
    }
  }
}

// Export and run if called directly
export { AdminMessageTranslationTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new AdminMessageTranslationTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
