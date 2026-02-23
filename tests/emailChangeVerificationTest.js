#!/usr/bin/env node

/**
 * Email Change Verification Test Suite
 *
 * Scenario:
 * 1. Register a new user and activate account.
 * 2. Login to get authentication token.
 * 3. Request Email Change via PUT /profile.
 * 4. Verify API response indicates pending verification.
 * 5. Clear pending email change via DELETE /pending-email.
 * 6. Request email change again.
 * 7. Retrieve verification token from local DB.
 * 8. Verify Email Change via GET /verify-email.
 * 9. Verify user profile reflects new email.
 *
 * Test coverage:
 * - User Registration and Activation
 * - Authentication
 * - Profile Update (Email Change Request)
 * - Pending Email Change Deletion
 * - Database Direct Access (Token Retrieval)
 * - Email Verification Endpoint
 * - Profile State Validation
 */

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';
import { DatabaseService } from '../src/services/databaseService.js';
import { getPlatformProxy } from 'wrangler';

class EmailChangeVerificationTests {
  constructor() {
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;
    this.dbService = null;

    this.testUser = {
      email: `emailchange-${Date.now()}@example.com`,
      password: 'password123',
      full_name: 'Email Change Tester'
    };

    this.newEmail = `changed-${Date.now()}@example.com`;
    this.authToken = null;
    this.userId = null;
  }

  /**
   * Run all tests
   */
  async runAll() {
    this.logger.logSuiteHeader('📧 Email Change Verification Tests');

    this.logger.info('Initializing test environment...');
    try {
      // Initialize DB Service
      // Match environment with testConfig.js default
      const proxyOptions = { environment: 'test' };

      const { env } = await getPlatformProxy(proxyOptions);
      this.dbService = new DatabaseService(env);

      this.logger.info('DatabaseService initialized for environment: test');

      await this.setupTestEnvironment();
      this.logger.success('Test environment setup completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] Environment setup failed: ${error.message}`);
      if (error.response) {
        console.error('Response status:', error.response.status);
        console.error('Response data:', JSON.stringify(error.response.data, null, 2));
      }
      process.exit(1);
    }

    const tests = [
      this.testRequestEmailChange,
      this.testClearPendingEmailChange,
      this.testClearPendingEmailChangeAgainShouldFail,
      this.testRequestEmailChangeAgain,
      this.testVerifyEmailChange,
      this.testValidateFinalState
    ];

    // Process tests using standard pattern
    for (const test of tests) {
      try {
        await test.call(this);
        this.logger.recordResult(true);
      } catch (error) {
        this.logger.error(`Test step failed: ${error.message}`);
        this.logger.recordResult(false);
        // In a scenario test, failure usually means we should stop
        break;
      }
    }

    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }
  }

  /**
   * Setup user and authentication
   */
  async setupTestEnvironment() {
    this.logger.info('1. Registering and Authenticating User');

    // Register
    const regRes = await this.client.post(API_ENDPOINTS.register, this.testUser);
    this.assert.assertStatus(regRes.status, 201, 'Registration failed');
    this.userId = regRes.data.data.id;
    this.logger.success(`User registered: ${this.userId}`);

    // Activate User
    try {
      const activationToken = await this.getActivationTokenFromDB(this.testUser.email);
      this.logger.info(`Activation token retrieved: ${activationToken ? activationToken.substring(0, 10) + '...' : 'null'}`);

      if (activationToken) {
        const activateRes = await this.client.get(`${API_ENDPOINTS.activate}?token=${activationToken}`);
        this.assert.assertStatus(activateRes.status, 200, 'Activation failed');
        this.logger.success('User activated successfully');
      } else {
        this.logger.warning('No activation token found. User might be auto-activated.');
      }
    } catch (e) {
      this.logger.warning(`Activation step failed or skipped: ${e.message}`);
      // Proceed to login, as user might be active or auto-activated
    }

    // Login
    const loginRes = await this.client.post(API_ENDPOINTS.login, {
      email: this.testUser.email,
      password: this.testUser.password
    });
    this.assert.assertStatus(loginRes.status, 200, 'Login failed');
    this.authToken = loginRes.data.data.access_token;
    this.client.setAuthToken(this.authToken);
    this.logger.success('User authenticated');
  }

  /**
   * Test: Request Email Change
   */
  async testRequestEmailChange() {
    this.logger.info(`2. Requesting Email Change to: ${this.newEmail}`);

    const res = await this.client.put(API_ENDPOINTS.profile, {
      email: this.newEmail
    });

    this.assert.assertStatus(res.status, 200, 'Profile update request failed');

    const data = res.data.data;
    // Verify response structure
    this.assert.assertEqual(data.emailVerificationPending, true, 'emailVerificationPending should be true');
    this.assert.assertEqual(data.new_email, this.newEmail, 'new_email should match requested email');
    this.assert.assertEqual(data.email, this.testUser.email, 'Current email should NOT change yet');

    this.logger.success('Email change requested successfully');
  }

  /**
   * Test: Verify Email Change
   */
  async testVerifyEmailChange() {
    this.logger.info('5. Verifying Email Change');

    // Retrieve token from DB
    const token = await this.getVerificationTokenFromDB(this.testUser.email);
    this.assert.exists(token, 'Verification token retrieved from DB');
    this.logger.info(`Token retrieved: ${token.substring(0, 10)}...`);

    const verifyUrl = `${API_ENDPOINTS.verifyEmail}?token=${token}`;
    const res = await this.client.get(verifyUrl);

    this.assert.assertStatus(res.status, 200, 'Verification request failed');
    this.assert.assertEqual(res.data.data.email, this.newEmail, 'Response should confirm new email');

    this.logger.success('Email verified API call successful');
  }

  /**
   * Test: Validate Final Profile State
   */
  async testValidateFinalState() {
    this.logger.info('6. Validating Final Profile State');

    // Get Profile using the token (which should still be valid, as user ID hasn't changed)
    const res = await this.client.get(API_ENDPOINTS.profile);

    this.assert.assertStatus(res.status, 200, 'Get profile failed');
    this.assert.assertEqual(res.data.data.email, this.newEmail, 'Profile email should be updated');
    this.assert.assertEqual(res.data.data.new_email, null, 'new_email should be cleared');

    this.logger.success('Final profile state validated');
  }

  /**
   * Test: Clear pending email change
   */
  async testClearPendingEmailChange() {
    this.logger.info('3. Clearing Pending Email Change');

    const clearRes = await this.client.delete(API_ENDPOINTS.clearPendingEmail);
    this.assert.assertStatus(clearRes.status, 200, 'Clear pending email request failed');

    const data = clearRes.data.data;
    this.assert.assertEqual(data.emailVerificationPending, false, 'emailVerificationPending should be false after clear');
    this.assert.assertEqual(data.new_email, null, 'new_email should be null after clear');
    this.assert.assertEqual(data.email, this.testUser.email, 'Primary email should remain unchanged after clear');

    // Ensure verification token is removed in DB
    const tokenAfterClear = await this.getVerificationTokenFromDB(this.testUser.email, false);
    this.assert.assertEqual(tokenAfterClear, null, 'Verification token should be cleared from DB');

    this.logger.success('Pending email change cleared successfully');
  }

  /**
   * Test: Request email change again after clearing
   */
  async testRequestEmailChangeAgain() {
    this.logger.info(`4. Re-requesting Email Change to: ${this.newEmail}`);

    const res = await this.client.put(API_ENDPOINTS.profile, {
      email: this.newEmail
    });

    this.assert.assertStatus(res.status, 200, 'Second profile update request failed');

    const data = res.data.data;
    this.assert.assertEqual(data.emailVerificationPending, true, 'emailVerificationPending should be true after re-request');
    this.assert.assertEqual(data.new_email, this.newEmail, 'new_email should match requested email after re-request');
    this.assert.assertEqual(data.email, this.testUser.email, 'Current email should still be old email before verify');

    this.logger.success('Email change re-requested successfully');
  }

  /**
   * Test: Clear pending email change again should fail
   */
  async testClearPendingEmailChangeAgainShouldFail() {
    this.logger.info('3.1. Clearing Pending Email Change Again (Expect 400)');

    const clearRes = await this.client.delete(API_ENDPOINTS.clearPendingEmail);
    this.assert.assertStatus(clearRes.status, 400, 'Second clear pending email request should fail with 400');

    this.logger.success('Second clear pending email request correctly returned 400');
  }

  /**
   * Helper: Get verification token from DB
   */
  async getVerificationTokenFromDB(email, shouldThrowIfMissing = true) {
    try {
      this.logger.info('Querying database for verification token...');

      const result = await this.dbService.select(
        'SELECT email_verification_token FROM users WHERE email = ?',
        [email],
        true
      );

      if (result && result.email_verification_token) {
        return result.email_verification_token;
      }

      if (shouldThrowIfMissing) {
        this.logger.error(`Token query result: ${JSON.stringify(result)}`);
        throw new Error('Token not found in query result');
      }

      return null;
    } catch (error) {
      this.logger.error(`Failed to query DB: ${error.message}`);
      if (shouldThrowIfMissing) {
        throw error;
      }
      return null;
    }
  }

  /**
   * Helper: Get activation token from DB
   */
  async getActivationTokenFromDB(email) {
    try {
      this.logger.info('Querying database for activation token...');

      const result = await this.dbService.select(
        'SELECT activation_token FROM users WHERE email = ?',
        [email],
        true
      );

      if (result && result.activation_token) {
        return result.activation_token;
      }

      this.logger.error(`Activation token query result for ${email}: ${JSON.stringify(result)}`);
      throw new Error('Activation token not found in query result');
    } catch (error) {
      this.logger.error(`Failed to query DB for activation token: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { EmailChangeVerificationTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new EmailChangeVerificationTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
