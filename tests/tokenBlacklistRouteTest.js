#!/usr/bin/env node

/**
 * Token Blacklist Management Test Suite
 * Tests for Super Admin functionality to manage blacklisted tokens
 *
 * Endpoints tested:
 * - POST /api/admin/token-blacklist - Create manually blacklisted token
 * - GET /api/admin/token-blacklist - List blacklisted tokens with pagination & search
 * - GET /api/admin/token-blacklist/:id - Get detailed info for a blacklisted token
 * - DELETE /api/admin/token-blacklist/:id - Remove a token from blacklist
 * - POST /api/admin/token-blacklist/bulk-delete - Batch removal of blacklisted tokens
 *
 * Test coverage:
 * - Super Admin authentication verification
 * - CRUD operations for token blacklist
 * - Search and pagination functionality
 * - Detailed view with user and usage statistics association
 * - Bulk deletion logic
 * - Verification of deletion (404 checks)
 */

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, TEST_CONFIG, API_ENDPOINTS } from './config/testConfig.js';

class TokenBlacklistTests {
  constructor() {
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;
    this.superAdmin = TEST_USERS.super_admin;
    this.accessToken = null;
    this.createdTokenId = null;
  }

  async runAll() {
    this.logger.logSuiteHeader('🚫 Token Blacklist Route Tests');

    try {
      await this.setupAuthentication();
      await this.testCreateBlacklistEntryAutoDetectFail();
      await this.testCreateBlacklistEntryInvalidUserId();
      await this.testCreateBlacklistEntryAutoDetectSuccess();
      await this.testCreateBlacklistEntry();
      await this.testListBlacklistTokens();
      await this.testGetBlacklistEntry();
      await this.testBulkDelete();
      await this.testDeleteBlacklistEntry();
      this.logger.success('Token Blacklist Tests Completed');
    } catch (error) {
      this.logger.error(`Token Blacklist Tests Failed: ${error.message}`);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      process.exit(1);
    }
  }

  async setupAuthentication() {
    try {
      this.logger.info('Authenticating as Super Admin...');
      const loginRes = await this.client.post(API_ENDPOINTS.login, {
        email: this.superAdmin.email,
        password: this.superAdmin.password
      });

      if (!loginRes.data.success) {
        throw new Error('Login failed: ' + JSON.stringify(loginRes.data));
      }

      // console.log('Login Response Data Structure:', JSON.stringify(loginRes.data, null, 2));

      this.accessToken = loginRes.data.data.token || loginRes.data.data.access_token;
      if (!this.accessToken) {
        throw new Error('Token not found in login response');
      }
      // console.log('Got Access Token:', this.accessToken.substring(0, 20) + '...');

      this.client.setAuthToken(this.accessToken);
      this.logger.success('Authentication successful');
    } catch (error) {
      throw new Error(`Auth setup failed: ${error.message}`);
    }
  }

  async testCreateBlacklistEntryAutoDetectFail() {
    this.logger.logSectionHeader('POST /api/admin/token-blacklist - Auto Detect Fails (Missing UserID & Unknown JTI)');

    const dummyJti = `unknown-jti-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    const payload = {
      jti: dummyJti,
      expiresAt: expiresAt,
      reason: 'Should Fail Auto Detect'
    };

    const res = await this.client.post(API_ENDPOINTS.adminTokenBlacklist, payload);

    this.assert.assertStatus(res.status, 500, 'Should return 500 due to Error thrown in route');
    this.assert.assertTrue(res.data.success === false, 'Response success should be false');
    
    // Dependent on `enableDetailedErrors` feature flag, the actual string might be masked
    this.assert.assertTrue(typeof res.data.error === 'string' && res.data.error.length > 0, 'Error should be a non-empty string');
    if (res.data.error.includes('User ID')) {
       this.logger.success('Detailed error message received correctly');
    }

    this.logger.success('Auto Detect Fail Check passed');
  }

  async testCreateBlacklistEntryInvalidUserId() {
    this.logger.logSectionHeader('POST /api/admin/token-blacklist - Invalid User ID');

    const dummyJti = `invalid-user-jti-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    const invalidUserId = 999999; // Very likely does not exist

    const payload = {
      jti: dummyJti,
      expiresAt: expiresAt,
      userId: invalidUserId,
      reason: 'Should Fail Invalid User'
    };

    const res = await this.client.post(API_ENDPOINTS.adminTokenBlacklist, payload);

    this.assert.assertStatus(res.status, 500, 'Should return 500 due to Error thrown in service');
    this.assert.assertTrue(res.data.success === false, 'Response success should be false');
    this.assert.assertTrue(typeof res.data.error === 'string' && res.data.error.length > 0, 'Error should be a non-empty string');
    if (res.data.error.includes('does not exist in the database')) {
      this.logger.success('Detailed error message received correctly');
    }

    this.logger.success('Invalid User ID Fail Check passed');
  }

  async testCreateBlacklistEntryAutoDetectSuccess() {
    this.logger.logSectionHeader('POST /api/admin/token-blacklist - Auto Detect Success');

    // 1. Create a dummy login to get a real token and JTI in the audit logs
    const loginRes = await this.client.post(API_ENDPOINTS.login, {
      email: TEST_USERS.admin.email, // using admin just to not log out super_admin
      password: TEST_USERS.admin.password
    });
    
    if (!loginRes.data.success) {
      throw new Error('Failed to create dummy login for auto-detect test');
    }

    const dummyToken = loginRes.data.data.token || loginRes.data.data.access_token;
    
    // Parse JWT to extract JTI (naive base64 decode)
    const payloadBase64 = dummyToken.split('.')[1];
    const payloadStr = Buffer.from(payloadBase64, 'base64').toString('utf-8');
    const payloadObj = JSON.parse(payloadStr);
    const realJti = payloadObj.jti;

    if (!realJti) {
      throw new Error('No JTI found in the dummy login token');
    }

    // 2. Blacklist without providing userId
    const expiresAt = new Date(Date.now() + 3600000).toISOString();
    const payload = {
      jti: realJti,
      expiresAt: expiresAt,
      reason: 'Auto Detect Test'
    };

    const res = await this.client.post(API_ENDPOINTS.adminTokenBlacklist, payload);

    if (res.status !== 201) {
      console.log('Auto Detect Success failed with status:', res.status);
      console.log('Response body:', res.data);
    }

    this.assert.assertStatus(res.status, 201, 'Should return 201 Created');
    this.assert.assertTrue(res.data.success, 'Response success should be true');

    this.logger.success('Auto Detect Success Check passed');
  }

  async testCreateBlacklistEntry() {
    this.logger.logSectionHeader('POST /api/admin/token-blacklist - Create Entry');

    // We need a dummy JTI. In real world we would use a real token, but for blacklist test any string works
    const dummyJti = `test-jti-${Date.now()}`;
    const expiresAt = new Date(Date.now() + 3600000).toISOString();

    // We assume user ID 2 exists (Alice or Bob from seeds)
    const userId = 2;

    const payload = {
      jti: dummyJti,
      expiresAt: expiresAt,
      userId: userId,
      reason: 'Test Blacklist'
    };

    const res = await this.client.post(API_ENDPOINTS.adminTokenBlacklist, payload);

    if (res.status !== 201) {
      console.log('Create failed with status:', res.status);
      console.log('Response body:', JSON.stringify(res.data, null, 2));
    }

    this.assert.assertStatus(res.status, 201, 'Should return 201 Created');
    this.assert.assertTrue(res.data.success, 'Response success should be true');

    this.logger.success('Create Blacklist Entry Check passed');

    // Store jti for lookup in next tests if needed, though we search by list usually
    this.createdJti = dummyJti;
  }

  async testListBlacklistTokens() {
    this.logger.logSectionHeader('GET /api/admin/token-blacklist - List Tokens');

    const res = await this.client.get(`${API_ENDPOINTS.adminTokenBlacklist}?page=1&limit=10&search=test-jti`);

    if (res.status !== 200) {
      console.log('List failed with status:', res.status);
      console.log('Response body:', JSON.stringify(res.data, null, 2));
    }

    this.assert.assertStatus(res.status, 200, 'Should return 200 OK');
    this.assert.assertTrue(res.data.success, 'Response success should be true');
    this.assert.assertTrue(Array.isArray(res.data.data.items), 'Items should be an array');
    this.assert.assertTrue(res.data.data.items.length > 0, 'Should find the created token');

    const item = res.data.data.items[0];
    this.assert.assertEqual(item.jti, this.createdJti, 'JTI should match');
    this.assert.assertTrue(item.user_email !== undefined, 'Should include user_email override');
    this.assert.assertTrue(item.usage_count !== undefined, 'Should include usage_count');

    this.createdTokenId = item.id;
    this.logger.success('List Tokens Check passed');
  }

  async testGetBlacklistEntry() {
    this.logger.logSectionHeader(`GET /api/admin/token-blacklist/${this.createdTokenId} - Get Details`);

    if (!this.createdTokenId) {
      throw new Error('Skipping test: No created token ID');
    }

    const res = await this.client.get(`${API_ENDPOINTS.adminTokenBlacklist}/${this.createdTokenId}`);

    this.assert.assertStatus(res.status, 200, 'Should return 200 OK');
    this.assert.assertTrue(res.data.success, 'Response success should be true');
    this.assert.assertEqual(res.data.data.id, this.createdTokenId, 'ID should match');
    this.assert.assertEqual(res.data.data.jti, this.createdJti, 'JTI should match');

    this.logger.success('Get Details Check passed');
  }

  async testDeleteBlacklistEntry() {
    this.logger.logSectionHeader(`DELETE /api/admin/token-blacklist/${this.createdTokenId} - Delete Entry`);

    if (!this.createdTokenId) {return;}

    const res = await this.client.delete(`${API_ENDPOINTS.adminTokenBlacklist}/${this.createdTokenId}`);

    this.assert.assertStatus(res.status, 200, 'Should return 200 OK');
    this.assert.assertTrue(res.data.success, 'Response success should be true');

    // Verify it is gone
    const checkRes = await this.client.get(`${API_ENDPOINTS.adminTokenBlacklist}/${this.createdTokenId}`);

    if (checkRes.status !== 404) {
      console.log('Delete Check failed with status:', checkRes.status);
      console.log('Response body:', JSON.stringify(checkRes.data, null, 2));
    }

    this.assert.assertStatus(checkRes.status, 404, 'Should return 404 after deletion');

    this.logger.success('Delete Entry Check passed');
  }

  async testBulkDelete() {
    this.logger.logSectionHeader('POST /api/admin/token-blacklist/bulk-delete - Bulk Delete');

    // Create 2 items
    const id1 = await this.createHelper(`bulk-1-${Date.now()}`);
    const id2 = await this.createHelper(`bulk-2-${Date.now()}`);

    const payload = {
      ids: [id1, id2]
    };

    const res = await this.client.post(API_ENDPOINTS.adminTokenBlacklistBulkDelete, payload);
    this.assert.assertStatus(res.status, 200, 'Should return 200 OK');
    this.assert.assertTrue(res.data.success, 'Response success should be true');
    this.assert.assertEqual(res.data.data.deleted_sub_count, 2, 'Should delete 2 items');

    this.logger.success('Bulk Delete Check passed');
  }

  async createHelper(jti) {
    const payload = {
      jti: jti,
      expiresAt: new Date(Date.now() + 3600000).toISOString(),
      userId: 2,
      reason: 'Bulk Test'
    };
    await this.client.post(API_ENDPOINTS.adminTokenBlacklist, payload);
    // We need to fetch it back to get ID as create only returns success boolean currently
    // So we search for it
    const listRes = await this.client.get(`${API_ENDPOINTS.adminTokenBlacklist}?search=${jti}`);
    return listRes.data.data.items[0].id;
  }
}

// Run tests
const tests = new TokenBlacklistTests();
tests.runAll();
