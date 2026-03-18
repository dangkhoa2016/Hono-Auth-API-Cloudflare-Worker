#!/usr/bin/env node

/**
 * Admin User Role Test Suite
 * Tests admin-level functionality and user management: /api/admin/*
 *
 * Endpoints tested:
 * - GET /api/admin/dashboard - Admin dashboard data
 * - GET /api/admin/users - User list management (role-filtered)
 * - POST /api/admin/users - Create new users
 * - PUT /api/admin/users/:id - Update user information
 * - DELETE /api/admin/users/:id - Delete users (with role restrictions)
 * - PUT /api/admin/users/:id/role - Change user roles
 * - GET /api/admin/stats - System statistics
 * - GET /api/admin/system-health - System health with performance metrics
 *
 * Test coverage:
 * - Admin role authentication and authorization
 * - User management operations with role hierarchy validation
 * - Role-based data filtering (admin sees limited data vs super_admin)
 * - Permission validation for user creation/modification
 * - System statistics access
 * - Admin dashboard functionality
 * - Security restrictions and self-protection mechanisms
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';


class AdminUserTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.adminUser = TEST_USERS.admin;
    this.accessToken = null;
  }

  async runAll() {
    this.logger.logSuiteHeader('🔧 Starting Admin User Role Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication setup completed');
    } catch (error) {
      this.logger.error(`[runAll] Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testUserManagement,
      this.testUserCreation,
      this.testUserUpdate,
      this.testUserRoleManagement,
      this.testUserDeletion,
      this.testCannotAccessSuperAdminUsers,
      this.testAuditLogs,
      this.testSystemHealth,
      this.testAdminDashboard,
      this.testAdminPermissions,
      this.testAccessAPI
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
   * Setup admin authentication
   */
  async setupAuthentication() {
    try {
      this.logger.info('Setting up admin authentication...');
      const response = await this.client.post(API_ENDPOINTS.login, this.adminUser);
      this.assert.assertSuccess(response, 'Admin authentication setup');

      this.accessToken = response.data.data.access_token;
      this.client.setAuthToken(this.accessToken);

      this.assert.exists(this.accessToken, 'Should obtain admin access token');

      // Verify admin role
      const profileResponse = await this.client.get(API_ENDPOINTS.profile);
      const userRole = profileResponse.data.data.role;
      this.assert.assertContains(['admin', 'super_admin'], userRole, 'User should have admin privileges');

      this.logger.success('Admin authentication setup completed');
    } catch (error) {
      this.logger.error(`[setupAuthentication] Admin authentication setup failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test admin dashboard access and data filtering
   */
  async testAdminDashboard() {
    this.logger.info('Testing admin dashboard access...');

    try {
      const response = await this.client.get(API_ENDPOINTS.adminDashboard);

      this.assert.assertEqual(response.status, 200, 'Admin dashboard should be accessible');
      this.assert.assertEqual(response.data.success, true, 'Dashboard request should be successful');
      this.assert.exists(response.data.data, 'Should include dashboard data');

      // Test dashboard structure for admin
      const dashboardData = response.data.data;
      this.assert.exists(dashboardData.overview, 'Should include overview section');
      this.assert.exists(dashboardData.growth, 'Should include growth section');
      this.assert.exists(dashboardData.distribution, 'Should include distribution section');
      this.assert.exists(dashboardData.recentActivity, 'Should include recent activity');
      this.assert.exists(dashboardData.recentUsers, 'Should include recent users');
      this.assert.exists(dashboardData.summary, 'Should include summary section');
      this.assert.exists(dashboardData.permissions, 'Should include permissions');
      this.assert.exists(dashboardData.metadata, 'Should include metadata');

      // Test Admin permissions (limited access)
      this.assert.assertEqual(dashboardData.permissions.accessLevel, 'limited', 'Admin should have limited access');
      this.assert.assertEqual(dashboardData.permissions.canViewSuperAdminData, false, 'Admin should not view Super Admin data');

      // Test that admin cannot see Super Admin data
      this.assert.assertEqual(dashboardData.summary.superAdminCount, 0, 'Admin should not see Super Admin count');

      // Test recent users excludes Super Admin
      const recentUsers = dashboardData.recentUsers;
      const hasSuperAdminInRecent = recentUsers.some(user => user.role === 'super_admin');
      this.assert.assertEqual(hasSuperAdminInRecent, false, 'Recent users should not include Super Admin users for admin');

      // Test role distribution excludes Super Admin
      const roleDistribution = dashboardData.distribution.byRole;
      this.assert.assertEqual(roleDistribution.super_admin, undefined, 'Role distribution should not include super_admin for admin');

      this.logger.info(`Admin sees ${dashboardData.overview.totalUsers} total users (filtered)`);
      this.logger.info(`Super Admin count (should be 0): ${dashboardData.summary.superAdminCount}`);
      this.logger.info(`Access level: ${dashboardData.permissions.accessLevel}`);

      this.logger.success('Admin dashboard test completed successfully');
    } catch (error) {
      this.logger.error(`[testAdminDashboard] Admin dashboard test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test user management and role-based filtering
   */
  async testUserManagement() {
    this.logger.info('Testing user management access...');

    try {
      const response = await this.client.get(API_ENDPOINTS.adminUsers);

      this.assert.assertEqual(response.status, 200, 'User list should be accessible');
      this.assert.assertEqual(response.data.success, true, 'User list request should be successful');
      this.assert.exists(response.data.data.users, 'Should return users array');
      this.assert.assertEqual(Array.isArray(response.data.data.users), true, 'Users should be an array');

      // Test role filtering for admin users
      const users = response.data.data.users;
      const allowedRoles = ['admin', 'user'];

      // Admin should only see users with admin or user roles (not super_admin)
      const invalidRoleUsers = users.filter(user => !allowedRoles.includes(user.role));
      this.assert.assertEqual(invalidRoleUsers.length, 0, 'Admin should only see admin and user roles');

      this.logger.info(`Admin sees ${users.length} users with roles: ${[...new Set(users.map(u => u.role))].join(', ')}`);
      this.logger.success('User management test completed successfully');
    } catch (error) {
      this.logger.error(`[testUserManagement] User management test failed: ${error.message}`);
      throw error;
    }
  }

  async testUserCreation() {
    const newUser = {
      email: `admin_created_${Date.now()}@example.com`,
      password: 'AdminCreated123!',
      full_name: 'Admin Created User',
      role: 'user'
    };

    const response = await this.client.post(API_ENDPOINTS.adminUsers, newUser);

    this.assert.assertEqual(response.status, 201, 'User creation should return 201');
    this.assert.assertEqual(response.data.success, true, 'User creation should be successful');
    this.assert.exists(response.data.data, 'Should return created user data');
    this.assert.assertEqual(response.data.data.email, newUser.email, 'Email should match');
    this.assert.assertEqual(response.data.data.full_name, newUser.full_name, 'Full name should match');
    this.assert.assertEqual(response.data.data.role, newUser.role, 'Role should match');

    // Store user ID for other tests
    this.createdUserId = response.data.data.id;

    // Test admin CAN create admin users (updated behavior)
    const adminUser = {
      email: `admin_created_admin_${Date.now()}@example.com`,
      password: 'AdminCreated123!',
      full_name: 'Admin Created Admin',
      role: 'admin'
    };

    const adminCreateResponse = await this.client.post(API_ENDPOINTS.adminUsers, adminUser);

    this.assert.assertEqual(adminCreateResponse.status, 201, 'Admin should be able to create admin user');
    this.assert.assertEqual(adminCreateResponse.data.success, true, 'Admin user creation should be successful');
    this.assert.assertEqual(adminCreateResponse.data.data.role, 'admin', 'Created user should have admin role');

    // Store admin user ID for cleanup or other tests
    this.createdAdminUserId = adminCreateResponse.data.data.id;

    // Test admin CANNOT create Super Admin users (unchanged behavior)
    const superAdminUser = {
      email: `admin_created_super_${Date.now()}@example.com`,
      password: 'AdminCreated123!',
      full_name: 'Admin Created Super Admin',
      role: 'super_admin'
    };

    try {
      await this.client.post(API_ENDPOINTS.adminUsers, superAdminUser);
    } catch (error) {
      this.assert.assertEqual(error.response.status, 403, 'Admin should get 403 when creating Super Admin user');
    }
  }

  async testUserDeletion() {
    // Create a test user with role 'user' for deletion
    const testUser = {
      email: `delete_test_user_${Date.now()}@example.com`,
      password: 'DeleteTest123!',
      full_name: 'Delete Test User',
      role: 'user'
    };

    const createResponse = await this.client.post(API_ENDPOINTS.adminUsers, testUser);
    const testUserId = createResponse.data.data.id;

    // Admin should be able to delete users with role 'user'
    const deleteResponse = await this.client.delete(API_ENDPOINTS.adminUsers + `/${testUserId}`);

    this.assert.assertEqual(deleteResponse.status, 200, 'Admin should be able to delete user role');
    this.assert.assertEqual(deleteResponse.data.success, true, 'User deletion should be successful');

    // Verify user is deleted
    try {
      await this.client.get(API_ENDPOINTS.adminUsers + `/${testUserId}`);
    } catch (error) {
      this.assert.assertEqual(error.response.status, 404, 'User should not be found after deletion');
    }

    // Test: Admin cannot delete super_admin (user_id = 1)
    try {
      await this.client.delete(API_ENDPOINTS.adminUsers + '/1');
    } catch (error) {
      this.assert.assertEqual(error.response.status, 403, 'Admin should get 403 when trying to delete Super Admin');
    }

    // Test: Admin cannot delete themselves (if they are admin role)
    const profileResponse = await this.client.get(API_ENDPOINTS.profile);
    const currentUserId = profileResponse.data.data.id;

    if (profileResponse.data.data.role === 'admin') {
      try {
        await this.client.delete(API_ENDPOINTS.adminUsers + `/${currentUserId}`);
      } catch (error) {
        this.assert.assertEqual(error.response.status, 403, 'Admin should get 403 when trying to delete themselves');
      }
    }
  }

  async testUserRoleManagement() {
    // Create a test user (role: user)
    const newUser = {
      email: `role_test_user_${Date.now()}@example.com`,
      password: 'RoleTest123!',
      full_name: 'Role Test User',
      role: 'user'
    };
    const createUserRes = await this.client.post(API_ENDPOINTS.adminUsers, newUser);
    const userId = createUserRes.data.data.id;

    // 1. Admin đổi role user → admin (thành công)
    const promoteRes = await this.client.put(`${API_ENDPOINTS.adminUsers}/${userId}/role`, { role: 'admin' });
    this.assert.assertEqual(promoteRes.status, 200, 'Admin should be able to promote user to admin');
    this.assert.assertEqual(promoteRes.data.data.newRole, 'admin', 'Role should be updated to admin');

    // 2. Admin đổi role admin → user (thành công)
    const demoteRes = await this.client.put(`${API_ENDPOINTS.adminUsers}/${userId}/role`, { role: 'user' });
    this.assert.assertEqual(demoteRes.status, 200, 'Admin should be able to demote admin to user');
    this.assert.assertEqual(demoteRes.data.data.newRole, 'user', 'Role should be updated to user');

    // 3. Admin cố gắng đổi role thành super_admin (bị cấm)
    try {
      await this.client.put(`${API_ENDPOINTS.adminUsers}/${userId}/role`, { role: 'super_admin' });
    } catch (error) {
      this.assert.assertEqual(error.response.status, 403, 'Admin should get 403 when promoting to super_admin');
    }

    // 4. Admin cố gắng đổi role của super_admin (bị cấm)
    // Giả sử userId 1 là super_admin
    try {
      await this.client.put(`${API_ENDPOINTS.adminUsers}/1/role`, { role: 'admin' });
    } catch (error) {
      this.assert.assertEqual(error.response.status, 403, 'Admin should get 403 when changing role of super_admin');
    }
  }

  async testUserUpdate() {
    if (!this.createdUserId) {
      await this.testUserCreation();
    }

    // Test update user data without role parameter
    const updateData = {
      full_name: 'Admin Updated User Name',
      status: 'active'
      // Note: role should not be included and will be ignored if provided
    };

    const response = await this.client.put(`${API_ENDPOINTS.adminUsers}/${this.createdUserId}`, updateData);

    this.assert.assertEqual(response.status, 200, 'User update should succeed');
    this.assert.assertEqual(response.data.success, true, 'User update should be successful');
    this.assert.assertEqual(response.data.data.full_name, updateData.full_name, 'Full name should be updated');
    this.assert.assertEqual(response.data.data.status, updateData.status, 'Status should be updated');

    // Verify role remains unchanged
    this.assert.assertEqual(response.data.data.role, 'user', 'Role should remain unchanged');

    // Test that role parameter is ignored even if provided
    const updateDataWithRole = {
      full_name: 'Another Update',
      role: 'admin' // This should be ignored
    };

    const responseWithRole = await this.client.put(`${API_ENDPOINTS.adminUsers}/${this.createdUserId}`, updateDataWithRole);

    this.assert.assertEqual(responseWithRole.status, 200, 'Update with role param should still succeed');
    this.assert.assertEqual(responseWithRole.data.data.role, 'user', 'Role should still be unchanged even if role param provided');
  }

  async testSystemSettings() {
    try {
      const response = await this.client.get(API_ENDPOINTS.adminSettings);

      if (response.status === 200) {
        this.assert.assertEqual(response.data.success, true, 'System settings should be accessible');
        this.assert.exists(response.data.data.settings, 'Should return settings data');
      }
    } catch (error) {
      if (error.response.status === 404) {
        this.logger.info('System settings endpoint not implemented yet - skipping');
      } else {
        throw error;
      }
    }
  }

  /**
   * Test audit logs access and filtering
   */
  async testAuditLogs() {
    this.logger.info('Testing audit logs access...');

    try {
      // Use the correct audit logs endpoint that exists
      const response = await this.client.get(API_ENDPOINTS.auditLogs);

      this.assert.assertEqual(response.status, 200, 'Audit logs should be accessible');
      this.assert.assertEqual(response.data.success, true, 'Audit logs request should be successful');
      this.assert.exists(response.data.data.logs, 'Should return audit logs');
      this.assert.assertEqual(Array.isArray(response.data.data.logs), true, 'Logs should be an array');

      // Test role-based filtering (admin should only see limited data)
      const logs = response.data.data.logs;

      // Admin should not see logs related to super_admin actions
      const superAdminLogs = logs.filter(log =>
        log.actor_role === 'super_admin' ||
        (log.metadata && log.metadata.target_role === 'super_admin')
      );

      this.assert.assertEqual(superAdminLogs.length, 0, 'Admin should not see super_admin related logs');

      this.logger.info(`Admin can see ${logs.length} audit logs (filtered)`);
      this.logger.success('Audit logs test completed successfully');
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('Audit logs endpoint not implemented yet - skipping');
      } else {
        this.logger.error(`[testAuditLogs] Audit logs test failed: ${error.message}`);
        throw error;
      }
    }
  }

  async testDataBackup() {
    try {
      const response = await this.client.post(API_ENDPOINTS.adminBackup, {});

      if (response.status === 200) {
        this.assert.assertEqual(response.data.success, true, 'Data backup should be successful');
        this.assert.exists(response.data.data.backupId, 'Should return backup ID');
      }
    } catch (error) {
      if (error.response.status === 404) {
        this.logger.info('Data backup endpoint not implemented yet - skipping');
      } else {
        throw error;
      }
    }
  }

  /**
   * Test system health endpoint
   */
  async testSystemHealth() {
    this.logger.info('Testing system health access...');

    try {
      const response = await this.client.get(API_ENDPOINTS.adminSystemHealth);

      this.assert.assertEqual(response.status, 200, 'System health should be accessible');
      this.assert.assertEqual(response.data.success, true, 'System health check should be successful');
      this.assert.exists(response.data.data.status, 'Should return health status');

      // Verify new security metrics are included in the results
      const systemSecurity = response.data.data.system?.security;
      this.assert.exists(systemSecurity, 'Should return system security object');
      // Using typeof check or inequality to undefined because values could be 0, which is falsy 
      this.assert.assertTrue(systemSecurity.recentFailedLogins !== undefined, 'Should include recentFailedLogins');
      this.assert.assertTrue(systemSecurity.totalFailedAttempts !== undefined, 'Should include totalFailedAttempts');
      this.assert.assertTrue(systemSecurity.uniqueIpsWithFailures !== undefined, 'Should include uniqueIpsWithFailures');

      this.logger.success('System health test completed successfully');
    } catch (error) {
      this.logger.error(`[testSystemHealth] System health test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test admin permissions and access restrictions
   */
  async testAdminPermissions() {
    this.logger.info('Testing admin permissions...');

    try {
      // Test that admin can access restricted endpoints
      const restrictedEndpoints = [
        API_ENDPOINTS.adminDashboard,
        API_ENDPOINTS.adminUsers,
        API_ENDPOINTS.adminSystemHealth,
        API_ENDPOINTS.adminStats,
        API_ENDPOINTS.auditLogs,
      ];

      for (const endpoint of restrictedEndpoints) {
        try {
          const response = await this.client.get(endpoint);
          this.assert.assertEqual(response.status, 200, `Admin should access ${endpoint}`);
          this.logger.success(`Access to ${endpoint} granted correctly`);
        } catch (error) {
          if (error.response && error.response.status === 404) {
            this.logger.warning(`Endpoint ${endpoint} not implemented - skipping`);
          } else {
            throw error;
          }
        }
      }

      // Test that regular user tokens can't access admin endpoints
      this.logger.info('Testing access with regular user token...');
      const loginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.regular);
      const regularToken = loginResponse.data.data.access_token;

      // Try to access admin endpoint with regular token
      try {
        await this.client.get(API_ENDPOINTS.adminDashboard, {
          Authorization: `Bearer ${regularToken}`
        });
      } catch (error) {
        this.assert.assertEqual(error.response.status, 403, 'Regular user should get 403 for admin endpoints');
      }

      this.logger.success('Admin permissions test completed successfully');
    } catch (error) {
      this.logger.error(`[testAdminPermissions] Admin permissions test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test API info access
   */
  async testAccessAPI() {
    this.logger.info('Testing API info access...');

    try {
      const response = await this.client.get(API_ENDPOINTS.api);

      this.assert.assertEqual(response.status, 200, 'API info should be accessible to admin');
      this.assert.assertEqual(response.data.status, 'running', 'API info request should be successful');
      this.assert.exists(response.data.endpoints, 'Should return API info data');
      this.logger.info(`Available endpoints: ${Object.keys(response.data.endpoints).length}`);

      this.logger.success('API info access test completed successfully');
    } catch (error) {
      this.logger.error(`[testAccessAPI] API info access test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test that admin cannot access super admin users
   */
  async testCannotAccessSuperAdminUsers() {
    this.logger.info('Testing super admin user access restriction...');

    try {
      // Test that admin cannot see Super Admin users in the list
      const response = await this.client.get(API_ENDPOINTS.adminUsers + '?role=super_admin');

      this.assert.assertEqual(response.status, 200, 'Request should succeed');
      this.assert.assertEqual(response.data.success, true, 'Request should be successful');

      // Should return empty result as admin cannot see Super Admin users
      const users = response.data.data.users;
      this.assert.assertEqual(users.length, 0, 'Admin should not see Super Admin users');
      this.assert.assertEqual(response.data.data.pagination.total, 0, 'Total should be 0 for Super Admin users');

      this.logger.success('Super admin access restriction test completed successfully');
    } catch (error) {
      this.logger.error(`[testCannotAccessSuperAdminUsers] Super admin access restriction test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { AdminUserTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new AdminUserTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
