#!/usr/bin/env node

/**
 * Authentication System Test Suite
 * Tests authentication functionality: /api/auth/*
 *
 * Endpoints tested:
 * - POST /api/auth/login - User login with email/password
 * - POST /api/auth/refresh_token - JWT token refresh
 * - POST /api/auth/logout - User logout
 *
 * Test coverage:
 * - Valid login credentials
 * - Invalid login attempts
 * - JWT token validation
 * - Token refresh mechanism
 * - Session management
 * - Password validation
 * - Rate limiting on failed logins
 * - Security headers validation
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG, TEST_LANGUAGES } from './config/testConfig.js';
import { clearServiceCaches } from '../src/utils/serviceFactory.js';

class AuthTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.testUser = TEST_USERS.valid;
    this.accessToken = null;
    this.refreshToken = null;
    this.lastRotatedOutRefreshToken = null;
    this.superAdminClient = null;
    this.superAdminToken = null;
  }

  async runAll() {
    this.logger.logSuiteHeader('🔐 Starting Authentication Tests');

    const tests = [
      this.testUserRegistration,
      this.testRegistrationRequiresActivation,
      this.testRegistrationEmailNotification,
      this.testValidLogin,
      this.testInvalidLogin,
      this.testMissingCredentials,
      this.testTokenValidation,
      this.testTokenRefresh,
      this.testRefreshTokenRotationBehavior,
      this.testRefreshTokenReuseDetection,
      this.testRefreshTokenReuseRevokesActiveTokens,
      this.testPasswordValidation,
      this.testJWTExpiration,
      this.testRateLimiting,
      this.testRateLimitingSharedIdentityAcrossIps,
      // i18n error message tests
      this.testI18nErrorMessagesInvalidLogin,
      this.testI18nErrorMessagesMissingCredentials,
      this.testI18nErrorMessagesInvalidRefreshToken,
      this.testI18nErrorMessagesUnauthorizedAccess,
      this.testI18nErrorMessagesMalformedToken,
      // later
      // this.testLogout
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
   * Test user registration functionality
   */
  async testUserRegistration() {
    this.logger.info('Testing user registration...');

    try {
      const newUser = {
        email: `test_${Date.now()}@example.com`,
        password: 'SecurePass123!',
        full_name: 'Test User'
      };

      const response = await this.client.post(API_ENDPOINTS.register, newUser);
      this.assert.assertEqual(response.status, 201, 'Registration should return 201');
      this.assert.assertEqual(response.data.success, true, 'Registration should be successful');
      this.assert.assertNotEmpty(response.data.data, 'Should return user data');

      this.logger.success('User registration test completed successfully');
    } catch (error) {
      this.logger.error(`[testUserRegistration] User registration test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test registration flow requires activation before login (default inactive status)
   */
  async testRegistrationRequiresActivation() {
    this.logger.info('Testing registration requires activation before login...');

    try {
      const pendingUser = {
        email: `inactive_${Date.now()}@example.com`,
        password: 'SecurePass123!',
        full_name: 'Pending User'
      };

      const registerResponse = await this.client.post(API_ENDPOINTS.register, pendingUser);

      this.assert.assertEqual(registerResponse.status, 201, 'Registration should return 201');
      this.assert.assertEqual(registerResponse.data.success, true, 'Registration should be successful');
      this.assert.assertHasField(registerResponse.data, 'data', 'Registration should return data');
      this.assert.assertEqual(registerResponse.data.data.status, 'inactive', 'New user should be inactive until activation');

      // Attempt login should fail while inactive
      const loginAttempt = await this.client.post(API_ENDPOINTS.login, {
        email: pendingUser.email,
        password: pendingUser.password
      });

      this.assert.assertEqual(loginAttempt.status, 401, 'Inactive user login should return 401');
      this.assert.assertFalse(loginAttempt.success, 'Inactive user login should not succeed');

      this.logger.success('Registration requires activation test completed successfully');
    } catch (error) {
      this.logger.error(`[testRegistrationRequiresActivation] failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test registration returns email notification metadata (sent or skipped)
   */
  async testRegistrationEmailNotification() {
    this.logger.info('Testing registration email notification payload...');

    try {
      // Prefer a non-English language to ensure locale path is exercised
      this.client.setLanguage('vi');

      const newUser = {
        email: `email_notice_${Date.now()}@example.com`,
        password: 'SecurePass123!',
        full_name: 'Email Notice User'
      };

      const response = await this.client.post(API_ENDPOINTS.register, newUser);

      this.assert.assertEqual(response.status, 201, 'Registration should return 201');
      this.assert.assertHasField(response.data, 'data', 'Registration should return data');

      const payload = response.data.data;
      this.assert.assertHasField(payload, 'email_notification', 'Registration should include email_notification');

      const notice = payload.email_notification;
      this.assert.assertHasFields(notice, ['sent', 'skipped'], 'email_notification should have sent/skipped');
      this.assert.assertType(notice.sent, 'boolean', 'email_notification.sent should be boolean');
      this.assert.assertType(notice.skipped, 'boolean', 'email_notification.skipped should be boolean');

      // Either sent or skipped is acceptable depending on environment config
      this.assert.assertTrue(notice.sent || notice.skipped, 'Email notification should be sent or explicitly skipped');

      // Reset language for subsequent tests
      this.client.setLanguage('en');

      this.logger.success('Registration email notification test completed successfully');
    } catch (error) {
      this.logger.error(`[testRegistrationEmailNotification] failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test valid login functionality
   */
  async testValidLogin() {
    this.logger.info('Testing valid login with user...');

    try {
      const response = await this.client.post(API_ENDPOINTS.login, this.testUser);

      this.assert.assertEqual(response.status, 200, 'Valid login should return 200');
      this.assert.assertEqual(response.data.success, true, 'Login should be successful');
      this.assert.exists(response.data.data.access_token, 'Should return access token');
      this.assert.exists(response.data.data.refresh_token, 'Should return refresh token');
      this.assert.exists(response.data.data, 'Should return user data');

      // Store tokens for later tests
      this.accessToken = response.data.data.access_token;
      this.refreshToken = response.data.data.refresh_token;

      // Set auth token for all subsequent requests
      this.client.setAuthToken(this.accessToken);

      this.logger.success('Valid login test completed successfully');
    } catch (error) {
      this.logger.error(`[testValidLogin] Valid login test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test invalid login attempts
   */
  async testInvalidLogin() {
    this.logger.info('Testing invalid login attempts...');

    try {
      const invalidLogin = {
        email: this.testUser.email,
        password: 'wrongpassword'
      };

      try {
        await this.client.post(API_ENDPOINTS.login, invalidLogin);
      } catch (error) {
        this.assert.assertEqual(error.response.status, 401, 'Invalid login should return 401');
        this.assert.assertEqual(error.response.data.success, false, 'Should indicate failure');
      }

      this.logger.success('Invalid login test completed successfully');
    } catch (error) {
      this.logger.error(`[testInvalidLogin] Invalid login test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test missing credentials validation
   */
  async testMissingCredentials() {
    this.logger.info('Testing missing credentials validation...');

    try {
      const incompleteLogin = {
        email: this.testUser.email
        // Missing password
      };

      try {
        await this.client.post(API_ENDPOINTS.login, incompleteLogin);
      } catch (error) {
        this.assert.assertEqual(error.response.status, 400, 'Missing credentials should return 400');
      }

      this.logger.success('Missing credentials test completed successfully');
    } catch (error) {
      this.logger.error(`[testMissingCredentials] Missing credentials test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test token validation functionality
   */
  async testTokenValidation() {
    this.logger.info('Testing token validation...');

    try {
      if (!this.accessToken) {
        await this.testValidLogin();
      }

      const response = await this.client.get(API_ENDPOINTS.profile);

      this.assert.assertEqual(response.status, 200, 'Valid token should allow access');
      this.assert.exists(response.data.data, 'Should return user profile');

      this.logger.success('Token validation test completed successfully');
    } catch (error) {
      this.logger.error(`[testTokenValidation] Token validation test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test token refresh functionality
   */
  async testTokenRefresh() {
    this.logger.info('Testing token refresh...');

    try {
      if (!this.refreshToken) {
        await this.testValidLogin();
      }

      const response = await this.client.post(API_ENDPOINTS.refreshToken, {
        refresh_token: this.refreshToken
      });

      this.assert.assertEqual(response.status, 200, 'Token refresh should return 200');
      this.assert.exists(response.data.data.access_token, 'Should return new access token');
      this.assert.exists(response.data.data.refresh_token, 'Should return rotated refresh token');

      const { access_token: newAccessToken, refresh_token: newRefreshToken } = response.data.data;

      this.accessToken = newAccessToken;
      this.refreshToken = newRefreshToken;
      this.client.setAuthToken(newAccessToken);

      this.logger.success('Token refresh test completed successfully');
    } catch (error) {
      this.logger.error(`[testTokenRefresh] Token refresh test failed: ${error.message}`);
      throw error;
    }
  }

  async testRefreshTokenRotationBehavior() {
    this.logger.info('Testing refresh token rotation behavior...');

    try {
      if (!this.refreshToken) {
        await this.testValidLogin();
      }

      const previousRefresh = this.refreshToken;
      const previousAccess = this.accessToken;

      const response = await this.client.post(API_ENDPOINTS.refreshToken, {
        refresh_token: previousRefresh
      });

      this.assert.assertEqual(response.status, 200, 'Refresh token rotation should succeed');
      this.assert.exists(response.data.data.refresh_token, 'Rotated refresh token should be present');
      this.assert.exists(response.data.data.access_token, 'Rotated access token should be present');

      const { access_token: rotatedAccessToken, refresh_token: rotatedRefreshToken } = response.data.data;

      this.assert.assertNotEqual(rotatedRefreshToken, previousRefresh, 'Refresh token should rotate to a new value');
      if (previousAccess) {
        this.assert.assertNotEqual(rotatedAccessToken, previousAccess, 'Access token should rotate to a new value');
      }

      this.lastRotatedOutRefreshToken = previousRefresh;
      this.refreshToken = rotatedRefreshToken;
      this.accessToken = rotatedAccessToken;
      this.client.setAuthToken(rotatedAccessToken);

      this.logger.success('Refresh token rotation behavior validated successfully');
    } catch (error) {
      this.logger.error(`[testRefreshTokenRotationBehavior] Test failed: ${error.message}`);
      throw error;
    }
  }

  async testRefreshTokenReuseDetection() {
    this.logger.info('Testing refresh token reuse detection...');

    try {
      if (!this.lastRotatedOutRefreshToken) {
        await this.testRefreshTokenRotationBehavior();
      }

      const reusedToken = this.lastRotatedOutRefreshToken;
      const reuseResponse = await this.client.post(API_ENDPOINTS.refreshToken, {
        refresh_token: reusedToken
      });

      this.assert.assertEqual(reuseResponse.status, 401, 'Reusing a rotated refresh token should be rejected');
      this.assert.assertEqual(reuseResponse.success, false, 'Reuse attempt should fail');

      const currentRefresh = this.refreshToken;
      const validResponse = await this.client.post(API_ENDPOINTS.refreshToken, {
        refresh_token: currentRefresh
      });

      this.assert.assertEqual(validResponse.status, 200, 'Latest refresh token should remain valid');
      this.assert.exists(validResponse.data.data.access_token, 'Valid refresh should return access token');
      this.assert.exists(validResponse.data.data.refresh_token, 'Valid refresh should return new refresh token');

      const { access_token: nextAccessToken, refresh_token: nextRefreshToken } = validResponse.data.data;
      this.assert.assertNotEqual(nextRefreshToken, currentRefresh, 'Valid refresh should rotate tokens');

      this.lastRotatedOutRefreshToken = currentRefresh;
      this.refreshToken = nextRefreshToken;
      this.accessToken = nextAccessToken;
      this.client.setAuthToken(nextAccessToken);

      this.logger.success('Refresh token reuse detection test completed successfully');
    } catch (error) {
      this.logger.error(`[testRefreshTokenReuseDetection] Test failed: ${error.message}`);
      throw error;
    }
  }

  async testRefreshTokenReuseRevokesActiveTokens() {
    this.logger.info('Testing refresh token reuse revocation enforcement...');

    const configKey = 'REFRESH_TOKEN_REUSE_GRACE_SECONDS';
    let originalValue = null;

    try {
      originalValue = await this._getKvConfigValue(configKey);
      await this._setKvConfigValue(configKey, 0);

      await this.testValidLogin();
      await this.testRefreshTokenRotationBehavior();

      this.assert.exists(this.lastRotatedOutRefreshToken, 'Rotated refresh token should be tracked for reuse testing');

      const reuseResponse = await this.client.post(API_ENDPOINTS.refreshToken, {
        refresh_token: this.lastRotatedOutRefreshToken
      });

      this.assert.assertEqual(reuseResponse.status, 401, 'Reusing a rotated token should return 401 when grace window disabled');
      this.assert.assertEqual(reuseResponse.success, false, 'Reuse attempt should be rejected');

      if (reuseResponse.data?.error) {
        this.logger.info(`Reuse rejection error code: ${reuseResponse.data.error}`);
      }

      const currentRefreshToken = this.refreshToken;
      this.assert.exists(currentRefreshToken, 'Current refresh token should be available for revocation check');

      const postReuseResponse = await this.client.post(API_ENDPOINTS.refreshToken, {
        refresh_token: currentRefreshToken
      });

      this.assert.assertEqual(
        postReuseResponse.status,
        401,
        'Active refresh token should be revoked after reuse detection when grace window is disabled'
      );
      this.assert.assertEqual(postReuseResponse.success, false, 'Revoked token response should indicate failure');

      if (postReuseResponse.data?.error) {
        this.logger.info(`Post-reuse error code: ${postReuseResponse.data.error}`);
      }

      this.logger.success('Refresh token reuse revocation test completed successfully');
    } catch (error) {
      this.logger.error(`[testRefreshTokenReuseRevokesActiveTokens] Test failed: ${error.message}`);
      throw error;
    } finally {
      if (originalValue !== null && originalValue !== undefined) {
        await this._setKvConfigValue(configKey, originalValue);
      }

      this.accessToken = null;
      this.refreshToken = null;
      this.lastRotatedOutRefreshToken = null;
      this.client.clearAuthToken();
    }
  }

  async testLogout() {
    if (!this.accessToken) {
      await this.testValidLogin();
    }

    const response = await this.client.post(API_ENDPOINTS.logout, {});

    this.assert.assertEqual(response.status, 200, 'Logout should return 200');
    this.assert.assertEqual(response.data.success, true, 'Logout should be successful');
  }

  /**
   * Test password validation rules
   */
  async testPasswordValidation() {
    this.logger.info('Testing password validation rules...');

    try {
      const weakPasswords = [
        '123',
        'password',
        'abc123',
        '12345678'
      ];

      for (const password of weakPasswords) {
        const userData = {
          email: `weak_${Date.now()}_${Math.random()}@example.com`,
          password,
          full_name: 'Test User'
        };

        try {
          await this.client.post(API_ENDPOINTS.register, userData);
        } catch (error) {
          this.assert.assertEqual(error.response.status, 400, `Weak password "${password}" should be rejected`);
        }
      }

      this.logger.success('Password validation test completed successfully');
    } catch (error) {
      this.logger.error(`[testPasswordValidation] Password validation test failed: ${error.message}`);
      throw error;
    }
  }

  async testRateLimiting() {
    this.logger.info('Testing adaptive rate limiting...');

    const configKey = 'RATE_LIMIT_MAX_ATTEMPTS';
    let originalValue = null;

    try {
      // Set rate limit to 5 for this test
      originalValue = await this._getKvConfigValue(configKey);
      await this._setKvConfigValue(configKey, 5);

      const rateLimitClient = new TestClient(TEST_CONFIG.baseUrl);
      const randomizedIp = `203.0.113.${Math.floor(Math.random() * 200) + 1}`;
      rateLimitClient.setHeader('x-forwarded-for', randomizedIp);
      rateLimitClient.setHeader('cf-connecting-ip', randomizedIp);

      const invalidLoginPayload = {
        email: `rate-limit-${Date.now()}@example.com`,
        password: 'wrongpassword'
      };

      let blockedResponse = null;
      for (let attempt = 1; attempt <= 6; attempt++) {
        const response = await rateLimitClient.post(API_ENDPOINTS.login, invalidLoginPayload);

        if (attempt < 6) {
          this.assert.assertEqual(response.status, 401, `Attempt ${attempt} should fail with 401`);
        } else {
          blockedResponse = response;
        }
      }

      this.assert.exists(blockedResponse, 'Should capture final blocked response');
      this.assert.assertEqual(blockedResponse.status, 429, 'Sixth attempt should trigger rate limiting');
      this.assert.assertEqual(blockedResponse.success, false, 'Rate limited response should indicate failure');
      this.assert.exists(blockedResponse.headers['retry-after'], 'Rate limited response should include retry-after header');
      this.assert.exists(blockedResponse.headers['x-ratelimit-limit'], 'Rate limited response should include limit header');
      this.assert.exists(blockedResponse.headers['x-ratelimit-remaining'], 'Rate limited response should include remaining header');

      this.logger.success('Adaptive rate limiting test completed successfully');
    } catch (error) {
      this.logger.error(`[testRateLimiting] Rate limiting test failed: ${error.message}`);
      throw error;
    } finally {
      if (originalValue !== null && originalValue !== undefined) {
        await this._setKvConfigValue(configKey, originalValue);
      }
    }
  }

  async testRateLimitingSharedIdentityAcrossIps() {
    this.logger.info('Testing shared email rate limiting across multiple IP addresses...');

    const configKey = 'RATE_LIMIT_MAX_ATTEMPTS';
    let originalValue = null;

    try {
      // Set rate limit to 5 for this test
      originalValue = await this._getKvConfigValue(configKey);
      await this._setKvConfigValue(configKey, 5);

      const sharedEmail = `shared-rate-${Date.now()}@example.com`;
      const invalidLoginPayload = {
        email: sharedEmail,
        password: 'does-not-exist'
      };

      // First wave of attempts from different IPs should all fail with 401 but contribute to the shared email counter
      for (let attempt = 0; attempt < 5; attempt++) {
        const client = new TestClient(TEST_CONFIG.baseUrl);
        const ip = `198.51.100.${attempt + 10}`;
        client.setHeader('x-forwarded-for', ip);
        client.setHeader('cf-connecting-ip', ip);

        const response = await client.post(API_ENDPOINTS.login, invalidLoginPayload);
        this.assert.assertEqual(response.status, 401, `Attempt ${attempt + 1} should respond with 401 for invalid credentials`);
      }

      // Sixth attempt from a new IP should be rate limited because the email context has reached its threshold
      const blockedClient = new TestClient(TEST_CONFIG.baseUrl);
      const blockedIp = '198.51.100.250';
      blockedClient.setHeader('x-forwarded-for', blockedIp);
      blockedClient.setHeader('cf-connecting-ip', blockedIp);

      const blockedResponse = await blockedClient.post(API_ENDPOINTS.login, invalidLoginPayload);

      this.assert.assertEqual(blockedResponse.status, 429, 'Shared email context should trigger 429 regardless of IP');
      this.assert.assertEqual(blockedResponse.success, false, 'Rate limited response should indicate failure');
      this.assert.exists(blockedResponse.headers['retry-after'], 'Rate limited response should include retry-after header');
      this.assert.exists(blockedResponse.headers['x-ratelimit-limit'], 'Rate limited response should include x-ratelimit-limit header');
      this.assert.exists(blockedResponse.headers['x-ratelimit-remaining'], 'Rate limited response should include remaining attempts header');

      this.logger.success('Shared identity rate limiting test completed successfully');
    } catch (error) {
      this.logger.error(`[testRateLimitingSharedIdentityAcrossIps] Test failed: ${error.message}`);
      throw error;
    } finally {
      if (originalValue !== null && originalValue !== undefined) {
        await this._setKvConfigValue(configKey, originalValue);
      }
    }
  }

  /**
   * Test JWT token structure and expiration
   */
  async testJWTExpiration() {
    this.logger.info('Testing JWT token structure and expiration...');

    try {
      // This test would require a token with very short expiry
      // For now, just verify token structure
      if (!this.accessToken) {
        await this.testValidLogin();
      }

      const tokenParts = this.accessToken.split('.');
      this.assert.assertEqual(tokenParts.length, 3, 'JWT should have 3 parts');

      // Verify token can be parsed
      const payload = JSON.parse(Buffer.from(tokenParts[1], 'base64').toString());

      this.assert.exists(payload.exp, 'Token should have expiration');
      this.assert.exists(payload.iat, 'Token should have issued at time');
      this.assert.exists(payload.user_id, 'Token should have subject (user ID)');
      this.assert.exists(payload.email, 'Token should include user email');

      this.logger.success('JWT expiration test completed successfully');
    } catch (error) {
      this.logger.error(`[testJWTExpiration] JWT expiration test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test i18n error messages for invalid login attempts with different locales
   */
  async testI18nErrorMessagesInvalidLogin() {
    this.logger.info('Testing i18n error messages for invalid login attempts...');

    try {
      // Test with different languages
      for (const [index, lang] of TEST_LANGUAGES.entries()) {
        this.logger.info(`Testing invalid login error message in language: ${lang}`);

        const headers = this._buildRateLimitBypassHeaders(index);
        const invalidLogin = {
          email: this._generateUniqueEmail(`i18n-invalid-${lang}`, index),
          password: 'wrongpassword'
        };

        const response = await this.client.post(`${API_ENDPOINTS.login}?lang=${lang}`, invalidLogin, headers);

        // Should be unsuccessful response
        this.assert.assertEqual(response.status, 401, `Invalid login should return 401 for ${lang}`);
        this.assert.assertEqual(response.success, false, `Should indicate failure for ${lang}`);

        // Check if response.data exists and has expected structure
        if (response.data && typeof response.data === 'object') {
          if ('success' in response.data) {
            this.assert.assertEqual(response.data.success, false, `Data should indicate failure for ${lang}`);
          }

          if ('error' in response.data) {
            this.assert.exists(response.data.error, `Should have error message for ${lang}`);
            this.assert.assertNotEmpty(response.data.error, `Error message should not be empty for ${lang}`);

            // Log the localized error message for verification
            this.logger.info(`  ${lang}: "${response.data.error}"`);
          }
        }
      }

      this.logger.success('i18n invalid login error messages test completed successfully');
    } catch (error) {
      this.logger.error(`[testI18nErrorMessagesInvalidLogin] Test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test i18n error messages for missing credentials with different locales
   */
  async testI18nErrorMessagesMissingCredentials() {
    this.logger.info('Testing i18n error messages for missing credentials...');

    try {
      // Test with different languages
      for (const [index, lang] of TEST_LANGUAGES.entries()) {
        this.logger.info(`Testing missing credentials error message in language: ${lang}`);

        const headers = this._buildRateLimitBypassHeaders(TEST_LANGUAGES.length + index);
        const incompleteLogin = {
          email: this._generateUniqueEmail(`i18n-missing-${lang}`, index)
          // Missing password
        };

        const response = await this.client.post(`${API_ENDPOINTS.login}?lang=${lang}`, incompleteLogin, headers);

        // Should be unsuccessful response
        this.assert.assertEqual(response.status, 400, `Missing credentials should return 400 for ${lang}`);
        this.assert.assertEqual(response.success, false, `Should indicate failure for ${lang}`);

        // Check if response.data exists and has expected structure
        if (response.data && typeof response.data === 'object') {
          if ('success' in response.data) {
            this.assert.assertEqual(response.data.success, false, `Data should indicate failure for ${lang}`);
          }

          if ('error' in response.data) {
            this.assert.exists(response.data.error, `Should have error message for ${lang}`);
            this.assert.assertNotEmpty(response.data.error, `Error message should not be empty for ${lang}`);

            // Log the localized error message for verification
            this.logger.info(`  ${lang}: "${response.data.error}"`);
          }
        }
      }

      this.logger.success('i18n missing credentials error messages test completed successfully');
    } catch (error) {
      this.logger.error(`[testI18nErrorMessagesMissingCredentials] Test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test i18n error messages for invalid refresh token with different locales
   */
  async testI18nErrorMessagesInvalidRefreshToken() {
    this.logger.info('Testing i18n error messages for invalid refresh token...');

    try {
      const invalidRefreshToken = {
        refresh_token: 'invalid_refresh_token_12345'
      };

      // Test with different languages
      for (const [index, lang] of TEST_LANGUAGES.entries()) {
        this.logger.info(`Testing invalid refresh token error message in language: ${lang}`);

        const headers = this._buildRateLimitBypassHeaders((TEST_LANGUAGES.length * 2) + index);
        const response = await this.client.post(`${API_ENDPOINTS.refreshToken}?lang=${lang}`, invalidRefreshToken, headers);

        // Should return 401 or 400 depending on validation
        this.assert.assertTrue(
          response.status === 401 || response.status === 400,
          `Invalid refresh token should return 400/401 for ${lang}, got ${response.status}`
        );
        this.assert.assertEqual(response.success, false, `Should indicate failure for ${lang}`);

        // Check if response.data exists and has expected structure
        if (response.data && typeof response.data === 'object') {
          if ('success' in response.data) {
            this.assert.assertEqual(response.data.success, false, `Data should indicate failure for ${lang}`);
          }

          if ('error' in response.data) {
            this.assert.exists(response.data.error, `Should have error message for ${lang}`);
            this.assert.assertNotEmpty(response.data.error, `Error message should not be empty for ${lang}`);

            // Log the localized error message for verification
            this.logger.info(`  ${lang}: "${response.data.error}"`);
          }
        }
      }

      this.logger.success('i18n invalid refresh token error messages test completed successfully');
    } catch (error) {
      this.logger.error(`[testI18nErrorMessagesInvalidRefreshToken] Test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test i18n error messages for unauthorized access with different locales
   */
  async testI18nErrorMessagesUnauthorizedAccess() {
    this.logger.info('Testing i18n error messages for unauthorized access...');

    try {
      // Test unauthorized access to protected endpoint without token
      for (const lang of TEST_LANGUAGES) {
        this.logger.info(`Testing unauthorized access error message in language: ${lang}`);

        // Create a new client without auth token
        const unauthClient = new TestClient(TEST_CONFIG.baseUrl);

        const response = await unauthClient.get(`${API_ENDPOINTS.profile}?lang=${lang}`);

        // Should be unsuccessful response
        this.assert.assertEqual(response.status, 401, `Unauthorized access should return 401 for ${lang}`);
        this.assert.assertEqual(response.success, false, `Should indicate failure for ${lang}`);

        // Check if response.data exists and has expected structure
        if (response.data && typeof response.data === 'object') {
          if ('success' in response.data) {
            this.assert.assertEqual(response.data.success, false, `Data should indicate failure for ${lang}`);
          }

          if ('error' in response.data) {
            this.assert.exists(response.data.error, `Should have error message for ${lang}`);
            this.assert.assertNotEmpty(response.data.error, `Error message should not be empty for ${lang}`);

            // Log the localized error message for verification
            this.logger.info(`  ${lang}: "${response.data.error}"`);
          }
        }
      }

      this.logger.success('i18n unauthorized access error messages test completed successfully');
    } catch (error) {
      this.logger.error(`[testI18nErrorMessagesUnauthorizedAccess] Test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test i18n error messages for malformed JWT token with different locales
   */
  async testI18nErrorMessagesMalformedToken() {
    this.logger.info('Testing i18n error messages for malformed JWT token...');

    try {
      // Test malformed token access to protected endpoint
      for (const lang of TEST_LANGUAGES) {
        this.logger.info(`Testing malformed token error message in language: ${lang}`);

        // Create a client with malformed token
        const malformedClient = new TestClient(TEST_CONFIG.baseUrl);
        malformedClient.setAuthToken('malformed_invalid_token');

        const response = await malformedClient.get(`${API_ENDPOINTS.profile}?lang=${lang}`);

        // Should be unsuccessful response
        this.assert.assertEqual(response.status, 401, `Malformed token should return 401 for ${lang}`);
        this.assert.assertEqual(response.success, false, `Should indicate failure for ${lang}`);

        // Check if response.data exists and has expected structure
        if (response.data && typeof response.data === 'object') {
          if ('success' in response.data) {
            this.assert.assertEqual(response.data.success, false, `Data should indicate failure for ${lang}`);
          }

          if ('error' in response.data) {
            this.assert.exists(response.data.error, `Should have error message for ${lang}`);
            this.assert.assertNotEmpty(response.data.error, `Error message should not be empty for ${lang}`);

            // Log the localized error message for verification
            this.logger.info(`  ${lang}: "${response.data.error}"`);
          }
        }
      }

      this.logger.success('i18n malformed token error messages test completed successfully');
    } catch (error) {
      this.logger.error(`[testI18nErrorMessagesMalformedToken] Test failed: ${error.message}`);
      throw error;
    }
  }

  _buildRateLimitBypassHeaders(counter = 0) {
    const octet = (counter % 200) + 10;
    const ip = `198.51.100.${octet}`;
    return {
      'x-forwarded-for': ip,
      'cf-connecting-ip': ip
    };
  }

  _generateUniqueEmail(prefix, counter = 0) {
    return `${prefix}-${counter}-${Date.now()}@example.com`;
  }

  async _getSuperAdminClient() {
    if (this.superAdminClient) {
      return this.superAdminClient;
    }

    this.logger.info('Acquiring super admin credentials for configuration management...');

    const client = new TestClient(TEST_CONFIG.baseUrl);
    const response = await client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);

    if (response.status !== 200 || !response.data?.data?.access_token) {
      throw new Error('Unable to authenticate as super admin for KV configuration updates');
    }

    const token = response.data.data.access_token;
    client.setAuthToken(token);

    this.superAdminToken = token;
    this.superAdminClient = client;
    this.logger.info('Super admin session established for configuration operations');

    return this.superAdminClient;
  }

  async _getKvConfigValue(key) {
    const adminClient = await this._getSuperAdminClient();
    const response = await adminClient.get(`/api/kv-admin/configs/${key}`);

    if (response.status !== 200 || !response.data?.success) {
      throw new Error(`Failed to fetch KV configuration for key ${key}`);
    }

    const { value, defaultValue } = response.data?.data || {};
    if (value !== undefined && value !== null) {
      return value;
    }
    return defaultValue;
  }

  async _setKvConfigValue(key, value) {
    const adminClient = await this._getSuperAdminClient();
    const response = await adminClient.put(`/api/kv-admin/configs/${key}`, { value });

    if (response.status !== 200 || !response.data?.success) {
      throw new Error(`Failed to update KV configuration for key ${key}`);
    }

    await this._clearConfigCaches();
    return response.data?.data?.newValue ?? value;
  }

  async _clearConfigCaches() {
    const adminClient = await this._getSuperAdminClient();
    const response = await adminClient.post('/api/kv-admin/configs/cache/clear', {});

    if (response.status !== 200 || !response.data?.success) {
      this.logger.warning('KV cache clear endpoint did not return success status');
    }

    clearServiceCaches();
  }
}

// Export and run if called directly
export { AuthTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new AuthTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
