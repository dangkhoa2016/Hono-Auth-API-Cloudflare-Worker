#!/usr/bin/env node

/**
 * Suspended User Token Test Suite
 * specific test to verify that a suspended user's token is immediately invalidated or rejected.
 * 
 * Scenario:
 * 1. An active user logs in and gets a valid token.
 * 2. An admin suspends the user account.
 * 3. The user allows to access a protected endpoint using the old token.
 * 4. System should deny access.
 */

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';

class SuspendedUserTokenTests {
  constructor() {
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Unique user for this test to avoid conflicts
    this.victimUser = {
      email: `victim-${Date.now()}@example.com`,
      password: 'password123',
      full_name: 'Victim User'
    };

    this.adminUser = TEST_USERS.admin;

    this.victimId = null;
    this.victimToken = null;
    this.adminToken = null;
  }

  async runAll() {
    this.logger.logSuiteHeader('🚫 Suspended User Token Tests');

    try {
      // Setup phase
      await this.setupAdmin();
      await this.setupVictim();

      // Verification phase
      await this.testTokenWorksBeforeSuspension();
      await this.suspendVictim();
      await this.testTokenFailsAfterSuspension();

      this.logger.success('Suspended User Token Test Suite Completed Successfully');
    } catch (error) {
      this.logger.error(`Suspended User Test Failed: ${error.message}`);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      // Cleanup attempt
      try { await this.cleanup(); } catch (e) { /* ignore cleanup errors */ }

      process.exit(1);
    } finally {
      await this.cleanup();
    }
  }

  async setupAdmin() {
    this.logger.info('1. Authenticating as Admin');
    const res = await this.client.post(API_ENDPOINTS.login, this.adminUser);

    this.assert.assertStatus(res.status, 200, 'Admin login failed');
    this.adminToken = res.data.data.access_token;
    this.assert.exists(this.adminToken, 'Admin token missing');

    this.logger.success('Admin authenticated');
  }

  async setupVictim() {
    this.logger.info('2. Creating and Authenticating Victim User');

    // 2a. Create via Admin to ensure Active status
    this.client.setAuthToken(this.adminToken);
    const createRes = await this.client.post(API_ENDPOINTS.adminUsers, {
      ...this.victimUser,
      role: 'user',
      status: 'active'
    });

    if (createRes.status !== 201) {
      throw new Error(`Victim creation failed: ${createRes.status} ${JSON.stringify(createRes.data)}`);
    }
    this.logger.info('Victim created via Admin API');

    // 2b. Login
    this.client.setAuthToken(null);
    const loginRes = await this.client.post(API_ENDPOINTS.login, {
      email: this.victimUser.email,
      password: this.victimUser.password
    });

    this.assert.assertStatus(loginRes.status, 200, 'Victim login failed');
    this.victimToken = loginRes.data.data.access_token;
    this.victimId = loginRes.data.data.user.id;

    this.assert.exists(this.victimToken, 'Victim token missing');
    this.assert.exists(this.victimId, 'Victim ID missing');

    this.logger.success(`Victim authenticated (ID: ${this.victimId})`);
  }

  async testTokenWorksBeforeSuspension() {
    this.logger.info('3. Verifying Token Works Before Suspension');

    // Use a fresh client or set token
    this.client.setAuthToken(this.victimToken);

    const res = await this.client.get(API_ENDPOINTS.profile);
    this.assert.assertStatus(res.status, 200, 'Profile access failed for active user');

    this.logger.success('Token works correctly for active user');
  }

  async suspendVictim() {
    this.logger.info('4. Suspending Victim User');

    // Switch to Admin
    this.client.setAuthToken(this.adminToken);

    const updatePayload = {
      status: 'suspended'
    };

    const res = await this.client.put(`${API_ENDPOINTS.adminUsers}/${this.victimId}`, updatePayload);
    this.assert.assertStatus(res.status, 200, 'Failed to suspend user');
    this.assert.assertEqual(res.data.data.status, 'suspended', 'User status not updated to suspended');

    this.logger.success(`User ${this.victimId} suspended successfully`);
  }

  async testTokenFailsAfterSuspension() {
    this.logger.info('5. Verifying Token Fails After Suspension');

    // Switch back to Victim token
    this.client.setAuthToken(this.victimToken);

    // Try to access profile
    const res = await this.client.get(API_ENDPOINTS.profile);

    // We expect 403 Forbidden (or 401 Unauthorized) depending on implementation
    if (res.status === 403 || res.status === 401) {
      this.logger.success(`Access denied as expected (Status: ${res.status})`);
    } else {
      this.logger.error(`Security Flaw: Suspended user can still access API. Status: ${res.status}`);
      throw new Error('Suspended user token is still valid!');
    }
  }

  async cleanup() {
    if (this.adminToken && this.victimId) {
      this.logger.info('Cleaning up: Deleting victim user');
      this.client.setAuthToken(this.adminToken);
      // Try to delete, ignore if fails (it's just cleanup)
      await this.client.delete(`${API_ENDPOINTS.adminUsers}/${this.victimId}`).catch(() => { });
    }
  }
}

// Execute
if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new SuspendedUserTokenTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
