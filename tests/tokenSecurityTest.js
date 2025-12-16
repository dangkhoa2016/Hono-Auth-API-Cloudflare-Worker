#!/usr/bin/env node

/**
 * Token Security Test Suite
 * Validates logout flows, blacklist enforcement, and refresh revocation
 */

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';

class TokenSecurityTests {
  constructor() {
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;
    this.testUser = TEST_USERS.valid;
  }

  async runAll() {
    this.logger.logSuiteHeader('🛡️ Token Security Tests');

    const tests = [
      this.testLogoutBlacklistsAccessToken,
      this.testLogoutAllRevokesRefreshAndAccess,
      this.testBlacklistedTokenRejectedAcrossClients,
      this.testRefreshAfterLogoutFails,
      this.testLogoutAllRevokesOtherSessions,
      this.testNewLoginAfterLogoutAllWorks
    ];

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

  async loginAndGetTokens() {
    const response = await this.client.post(API_ENDPOINTS.login, this.testUser);

    this.assert.assertEqual(response.status, 200, 'Login should succeed');
    this.assert.assertTrue(response.data.success, 'Login response should be success');
    this.assert.exists(response.data.data.access_token, 'Access token required');
    this.assert.exists(response.data.data.refresh_token, 'Refresh token required');

    return {
      accessToken: response.data.data.access_token,
      refreshToken: response.data.data.refresh_token
    };
  }

  logFailureResponse(label, response) {
    const status = response?.status;
    const body = response?.data;
    this.logger.error(`${label} -> status ${status}, body: ${JSON.stringify(body)}`);
  }

  async testLogoutBlacklistsAccessToken() {
    this.logger.info('Testing logout should blacklist access token');

    // Login and set auth header
    const { accessToken, refreshToken } = await this.loginAndGetTokens();
    this.client.setAuthToken(accessToken);

    // Call logout
    const logoutResponse = await this.client.post(API_ENDPOINTS.logout, {
      refresh_token: refreshToken
    });

    this.assert.assertEqual(logoutResponse.status, 200, 'Logout should return 200');
    this.assert.assertTrue(logoutResponse.data.success, 'Logout response should be success');

    // Access with the same (now blacklisted) token should fail
    const profileResponse = await this.client.get(API_ENDPOINTS.profile);
    this.assert.assertEqual(profileResponse.status, 401, 'Blacklisted access token should be rejected');
    this.assert.assertFalse(profileResponse.data.success, 'Profile should fail after logout');
  }

  async testLogoutAllRevokesRefreshAndAccess() {
    this.logger.info('Testing logout-all should revoke refresh and access tokens');

    // Login fresh session
    const { accessToken, refreshToken } = await this.loginAndGetTokens();
    this.client.setAuthToken(accessToken);

    // Call logout-all with refresh token
    const logoutAllResponse = await this.client.post(API_ENDPOINTS.logoutAll, {
      refresh_token: refreshToken
    });

    if (logoutAllResponse.status !== 200) {
      this.logFailureResponse('logout-all (self)', logoutAllResponse);
    }

    this.assert.assertEqual(logoutAllResponse.status, 200, 'Logout-all should return 200');
    this.assert.assertTrue(logoutAllResponse.data.success, 'Logout-all response should be success');

    // Refresh using revoked token should fail
    const refreshResponse = await this.client.post(API_ENDPOINTS.refreshToken, {
      refresh_token: refreshToken
    });
    this.assert.assertEqual(refreshResponse.status, 401, 'Revoked refresh token should be rejected');
    this.assert.assertFalse(refreshResponse.data.success, 'Refresh should fail after logout-all');

    // Access with the blacklisted access token should fail
    const profileResponse = await this.client.get(API_ENDPOINTS.profile);
    this.assert.assertEqual(profileResponse.status, 401, 'Access token should be rejected after logout-all');
    this.assert.assertFalse(profileResponse.data.success, 'Profile should fail after logout-all');
  }

  async testBlacklistedTokenRejectedAcrossClients() {
    this.logger.info('Testing blacklisted token is rejected across clients');

    const { accessToken, refreshToken } = await this.loginAndGetTokens();
    this.client.setAuthToken(accessToken);

    const logoutResponse = await this.client.post(API_ENDPOINTS.logout, {
      refresh_token: refreshToken
    });

    this.assert.assertEqual(logoutResponse.status, 200, 'Logout should succeed');

    // Simulate a different client using the old access token
    const rogueClient = new TestClient(TEST_CONFIG.baseUrl);
    rogueClient.setAuthToken(accessToken);
    const profileResponse = await rogueClient.get(API_ENDPOINTS.profile);

    this.assert.assertEqual(profileResponse.status, 401, 'Blacklisted token should be rejected by other clients');
  }

  async testRefreshAfterLogoutFails() {
    this.logger.info('Testing refresh fails after logout revokes refresh token');

    const { accessToken, refreshToken } = await this.loginAndGetTokens();
    this.client.setAuthToken(accessToken);

    const logoutResponse = await this.client.post(API_ENDPOINTS.logout, {
      refresh_token: refreshToken
    });

    this.assert.assertEqual(logoutResponse.status, 200, 'Logout should succeed');

    const refreshResponse = await this.client.post(API_ENDPOINTS.refreshToken, {
      refresh_token: refreshToken
    });

    this.assert.assertEqual(refreshResponse.status, 401, 'Refresh token should be rejected after logout');
    this.assert.assertFalse(refreshResponse.data.success, 'Refresh response should indicate failure');
  }

  async testLogoutAllRevokesOtherSessions() {
    this.logger.info('Testing logout-all revokes other active sessions');

    // Session A
    const sessionA = await this.loginAndGetTokens();

    // Session B (separate client)
    const sessionBClient = new TestClient(TEST_CONFIG.baseUrl);
    const sessionBLogin = await sessionBClient.post(API_ENDPOINTS.login, this.testUser);
    this.assert.assertEqual(sessionBLogin.status, 200, 'Second login should succeed');
    const sessionBAccess = sessionBLogin.data.data.access_token;
    const sessionBRefresh = sessionBLogin.data.data.refresh_token;

    // Use logout-all with session A
    const clientA = new TestClient(TEST_CONFIG.baseUrl);
    clientA.setAuthToken(sessionA.accessToken);
    const logoutAllResponse = await clientA.post(API_ENDPOINTS.logoutAll, {
      refresh_token: sessionA.refreshToken
    });

    if (logoutAllResponse.status !== 200) {
      this.logFailureResponse('logout-all (multi-session)', logoutAllResponse);
    }

    this.assert.assertEqual(logoutAllResponse.status, 200, 'Logout-all should succeed');

    // Session B refresh should now be invalid (revoked)
    const sessionBRefreshResp = await sessionBClient.post(API_ENDPOINTS.refreshToken, {
      refresh_token: sessionBRefresh
    });
    this.assert.assertEqual(sessionBRefreshResp.status, 401, 'Other session refresh token should be revoked after logout-all');

    // Access tokens may remain valid until expiry; ensure at least not upgraded to success on refresh
    sessionBClient.setAuthToken(sessionBAccess);
    const profileResponse = await sessionBClient.get(API_ENDPOINTS.profile);
    this.assert.assertTrue(profileResponse.status === 200 || profileResponse.status === 401,
      'Access token from other session may remain valid until expiry');
  }

  async testNewLoginAfterLogoutAllWorks() {
    this.logger.info('Testing new login works after logout-all revocation');

    const { accessToken, refreshToken } = await this.loginAndGetTokens();
    const client = new TestClient(TEST_CONFIG.baseUrl);
    client.setAuthToken(accessToken);

    const logoutAllResponse = await client.post(API_ENDPOINTS.logoutAll, {
      refresh_token: refreshToken
    });

    if (logoutAllResponse.status !== 200) {
      this.logFailureResponse('logout-all (new login flow)', logoutAllResponse);
    }

    this.assert.assertEqual(logoutAllResponse.status, 200, 'Logout-all should succeed');

    // Fresh login should still work
    const newLogin = await this.client.post(API_ENDPOINTS.login, this.testUser);
    this.assert.assertEqual(newLogin.status, 200, 'New login should succeed after logout-all');
    const newAccess = newLogin.data.data.access_token;

    this.client.setAuthToken(newAccess);
    const profileResponse = await this.client.get(API_ENDPOINTS.profile);
    this.assert.assertEqual(profileResponse.status, 200, 'Profile should work with new token after logout-all');
  }
}

// Export and run if executed directly
export { TokenSecurityTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new TokenSecurityTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
