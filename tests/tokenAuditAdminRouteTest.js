import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, TEST_CONFIG, API_ENDPOINTS } from './config/testConfig.js';

class TokenAuditAdminTests {
  constructor() {
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;
    this.superAdmin = TEST_USERS.super_admin;
    this.accessToken = null;
    this.testLogId = null;
  }

  async runAll() {
    this.logger.logSuiteHeader('🛡️ Token Audit Admin Route Tests');

    try {
      await this.setupAuthentication();
      await this.testListLogs();
      await this.testGetLogDetails();
      await this.testUpdateLog();
      await this.testDeleteLog();
      this.logger.success('Token Audit Admin Tests Completed');
    } catch (error) {
      this.logger.error(`Token Audit Admin Tests Failed: ${error.message}`);
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
        throw new Error('Login failed');
      }

      this.accessToken = loginRes.data.data.token || loginRes.data.data.access_token;
      this.client.setAuthToken(this.accessToken);
      this.logger.success('Authentication successful');
    } catch (error) {
      throw new Error(`Auth setup failed: ${error.message}`);
    }
  }

  async testListLogs() {
    this.logger.logSectionHeader('GET /api/admin/token-audit - List Logs');

    const res = await this.client.get(`/api/admin/token-audit?page=1&limit=10`);

    this.assert.assertStatus(res.status, 200, 'Should return 200 OK');
    this.assert.assertTrue(res.data.success, 'Response success should be true');
    this.assert.assertTrue(Array.isArray(res.data.data.items), 'Items should be an array');
    this.assert.assertTrue(res.data.data.items.length > 0, 'Should have logs (created by the login just now)');

    this.testLogId = res.data.data.items[0].id;
    this.logger.success('List Logs Check passed');
  }

  async testGetLogDetails() {
    this.logger.logSectionHeader(`GET /api/admin/token-audit/${this.testLogId} - Get Details`);

    if (!this.testLogId) return;

    const res = await this.client.get(`/api/admin/token-audit/${this.testLogId}`);

    this.assert.assertStatus(res.status, 200, 'Should return 200 OK');
    this.assert.assertTrue(res.data.success, 'Response success should be true');
    this.assert.assertEqual(res.data.data.id, this.testLogId, 'ID should match');

    this.logger.success('Get Details Check passed');
  }

  async testUpdateLog() {
    this.logger.logSectionHeader(`PUT /api/admin/token-audit/${this.testLogId} - Update Log`);

    if (!this.testLogId) return;

    const payload = {
      action: 'login_updated',
      errorMessage: 'Updated error message'
    };

    const res = await this.client.put(`/api/admin/token-audit/${this.testLogId}`, payload);

    this.assert.assertStatus(res.status, 200, 'Should return 200 OK');
    this.assert.assertTrue(res.data.success, 'Response success should be true');

    // Verify it updated
    const checkRes = await this.client.get(`/api/admin/token-audit/${this.testLogId}`);
    this.assert.assertEqual(checkRes.data.data.action, 'login_updated', 'Action should be updated');
    this.assert.assertEqual(checkRes.data.data.error_message, 'Updated error message', 'Error message should be updated');

    this.logger.success('Update Log Check passed');
  }

  async testDeleteLog() {
    this.logger.logSectionHeader(`DELETE /api/admin/token-audit/${this.testLogId} - Delete Log`);

    if (!this.testLogId) return;

    const res = await this.client.delete(`/api/admin/token-audit/${this.testLogId}`);

    this.assert.assertStatus(res.status, 200, 'Should return 200 OK');
    this.assert.assertTrue(res.data.success, 'Response success should be true');

    // Verify it is gone
    const checkRes = await this.client.get(`/api/admin/token-audit/${this.testLogId}`);
    this.assert.assertStatus(checkRes.status, 404, 'Should return 404 after deletion');

    this.logger.success('Delete Log Check passed');
  }
}

const tests = new TokenAuditAdminTests();
tests.runAll();
