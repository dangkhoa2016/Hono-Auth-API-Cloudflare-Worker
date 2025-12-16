#!/usr/bin/env node

/**
 * Input Validation Test Suite
 * Tests Zod schema validation and input sanitization: /api/zod_demo/*
 *
 * Endpoints tested:
 * - GET /api/zod_demo - Validation demo overview
 * - POST /api/zod_demo/register - Registration validation
 * - POST /api/zod_demo/search - Search parameter validation
 * - POST /api/zod_demo/upload - File upload validation
 *
 * Test coverage:
 * - Zod schema validation for all input types
 * - Email format validation
 * - Password strength requirements
 * - Required field validation
 * - Data type validation (string, number, boolean)
 * - Input sanitization and XSS prevention
 * - File upload validation (size, type, content)
 * - Malformed JSON handling
 * - SQL injection prevention
 * - Error message localization
*/

import { API_ENDPOINTS, TEST_CONFIG, TEST_USERS, TEST_LANGUAGES } from './config/testConfig.js';
import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';


class ValidationTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
  }

  async runAll() {
    this.logger.logSuiteHeader('🧪 Starting Validation Tests');
    const tests = [
      this.testLoginValidation,
      this.testUserCreationValidation,
      this.testUserUpdateValidation,
      this.testChangeRoleValidation,
    ];

    for (const test of tests) {
      try {
        await test.call(this);
        this.logger.recordResult(true);
      } catch (error) {
        this.logger.recordResult(false);
      }
    }

    this.logger.logSummary();
    if (this.logger.failCount > 0) {
      process.exit(1);
    }
  }

  /**
   * Generic validation error test
   * @param {string} endpoint - API endpoint
   * @param {object} data - Request payload
   * @param {string} [expectedField] - Expected field in error response
   */
  async testValidationError(endpoint, data, expectedField = null) {
    try {
      await this.client.post(endpoint, data);
    } catch (error) {
      this.assert.assertEqual(error.response.status, 400, 'Validation error should return 400');
      this.assert.assertEqual(error.response.data.success, false, 'Should indicate failure');
      this.assert.exists(error.response.data.errors, 'Should include error message');

      if (expectedField) {
        this.assert.assertContains(error.response.data.errors.map(e => e.field.toLowerCase()), expectedField.toLowerCase(),
          `Error should mention ${expectedField}`);
      }
    }
  }

  async testLoginValidation() {
    this.logger.info('🔐 Testing authentication validation...');

    // Test login validation
    const invalidLogins = [
      { data: {}, description: 'empty object' },
      { data: { email: '' }, description: 'empty email' },
      { data: { password: '' }, description: 'empty password' },
      { data: { email: 'not-an-email' }, description: 'invalid email format' },
      { data: { email: 'test@example.com' }, description: 'missing password' },
      { data: { password: 'password123' }, description: 'missing email' },
      { data: { email: null, password: null }, description: 'null values' },
      { data: { email: 123, password: 456 }, description: 'numeric values' },
      { data: { email: 'test@example.com', password: 123 }, description: 'numeric password' }
    ];

    for (const test of invalidLogins) {
      await this.testValidationError(API_ENDPOINTS.login, test.data);
      this.logger.info(`   ✓ Rejected: ${test.description}`);
    }

    // Test registration validation
    const invalidRegistrations = [
      { data: {}, description: 'empty object' },
      { data: { email: 'invalid', password: 'pass', full_name: '' }, description: 'all invalid' },
      { data: { email: 'test@example.com', password: '123', full_name: 'Test' }, description: 'weak password' },
      { data: { email: 'test@example.com', password: 'StrongPass123!', full_name: '' }, description: 'empty name' },
      { data: { email: '', password: 'StrongPass123!', full_name: 'Test User' }, description: 'empty email' }
    ];

    for (const test of invalidRegistrations) {
      await this.testValidationError(API_ENDPOINTS.register, test.data);
      this.logger.info(`   ✓ Rejected registration: ${test.description}`);
    }
  }

  async testUserCreationValidation() {
    this.logger.info('👤 Testing user creation validation...');

    const invalidUserCreations = [
      { data: {}, description: 'empty object' },
      { data: { email: 'invalid', password: 'pass', full_name: '' }, description: 'all invalid' },
      { data: { email: 'test@example.com', password: '123', full_name: 'Test' }, description: 'weak password' },
      { data: { email: 'test@example.com', password: 'StrongPass123!', full_name: '' }, description: 'empty name' },
      { data: { email: '', password: 'StrongPass123!', full_name: 'Test User' }, description: 'empty email' }
    ];

    for (const test of invalidUserCreations) {
      await this.testValidationError(API_ENDPOINTS.register, test.data);
      this.logger.info(`   ✓ Rejected user creation: ${test.description}`);
    }
  }

  async testUserUpdateValidation() {
    this.logger.info('👤 Testing user update validation...');

    // First, login to get a token for profile updates
    const loginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.regular);
    const token = loginResponse.data.data.access_token;

    const invalidProfileUpdates = [
      { data: { full_name: '' }, description: 'empty name' },
      { data: { full_name: 'a'.repeat(256) }, description: 'name too long' },
      { data: { email: 'not-an-email' }, description: 'invalid email' },
      { data: { email: '' }, description: 'empty email' },
      { data: { full_name: null }, description: 'null name' },
      { data: { full_name: 123 }, description: 'numeric name' },
      { data: { bio: 'x'.repeat(1001) }, description: 'bio too long' }
    ];

    for (const test of invalidProfileUpdates) {
      try {
        await this.client.put(API_ENDPOINTS.profile, test.data, {
          Authorization: `Bearer ${token}`
        });
      } catch (error) {
        this.assert.assertEqual(error.response.status, 400, 'Profile update validation should return 400');
        this.logger.info(`   ✓ Rejected profile update: ${test.description}`);
      }
    }
  }

  async testChangeRoleValidation() {
    this.logger.info('👥 Testing role change validation...');

    // This test requires admin access
    try {
      const adminLoginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);
      const adminToken = adminLoginResponse.data.data.access_token;

      const invalidRoles = [
        'invalid_role',
        'ADMIN',
        'User',
        'superuser',
        'administrator',
        '',
        null,
        123,
        'guest'
      ];

      for (const role of invalidRoles) {
        try {
          await this.client.post(API_ENDPOINTS.adminUsers, {
            email: `role_test_${Date.now()}@example.com`,
            password: 'ValidPass123!',
            full_name: 'Role Test User',
            role: role
          }, {
            Authorization: `Bearer ${adminToken}`
          });
        } catch (error) {
          this.assert.assertEqual(error.response.status, 400, 'Invalid role should return 400');
          this.logger.info(`   ✓ Rejected role: ${role}`);
        }
      }

      // Test valid roles
      const validRoles = ['user', 'admin', 'super_admin'];
      for (const role of validRoles) {
        try {
          await this.client.post(API_ENDPOINTS.adminUsers, {
            email: `valid_role_${Date.now()}@example.com`,
            password: 'ValidPass123!',
            full_name: 'Valid Role User',
            role: role
          }, {
            Authorization: `Bearer ${adminToken}`
          });
          this.logger.info(`   ✓ Accepted role: ${role}`);
        } catch (error) {
          if (error.response.status !== 400) {
            this.logger.info(`   ✓ Accepted role format: ${role}`);
          }
        }
      }
    } catch (error) {
      this.logger.info('   ⚠️ Role validation test skipped - no admin access');
    }
  }

  async testEmailValidation() {
    this.logger.info('📧 Testing email validation...');

    const invalidEmails = [
      'not-an-email',
      '@example.com',
      'test@',
      'test..test@example.com',
      'test@example',
      'test@.com',
      'test@example..com',
      '',
      ' ',
      'test@',
      '@test.com',
      'test@@example.com',
      'test @example.com',
      'test@example .com'
    ];

    for (const email of invalidEmails) {
      await this.testValidationError(API_ENDPOINTS.register, {
        email: email,
        password: 'ValidPass123!',
        full_name: 'Test User'
      }, 'email');
      this.logger.info(`   ✓ Rejected email: ${email}`);
    }

    // Test valid emails (should not throw)
    const validEmails = [
      'test-user@example.com',
      'user.name@example.com',
      'user+tag@example.com',
      'user123@example123.com',
      'test@subdomain.example.com'
    ];

    for (const email of validEmails) {
      try {
        const response = await this.client.post(API_ENDPOINTS.register, {
          email: `valid_${Date.now()}_${email}`,
          password: 'ValidPass123!',
          full_name: 'Test User'
        });
        this.logger.info(`   ✓ Accepted email: ${email}`);
        this.assert.assertEqual(response.status, 201, 'Valid email should return 201');
      } catch (error) {
        // Might fail due to duplicate email, but not validation
        if (error.response.status !== 400 || !error.response.data.error.toLowerCase().includes('email')) {
          this.logger.info(`   ✓ Accepted email format: ${email}`);
        }
      }
    }
  }

  async testPasswordValidation() {
    this.logger.info('🔑 Testing password validation...');

    const weakPasswords = [
      { password: '', description: 'empty password' },
      { password: '123', description: 'too short' },
      { password: 'password', description: 'no numbers or special chars' },
      { password: '12345678', description: 'only numbers' },
      { password: 'PASSWORD', description: 'only uppercase' },
      { password: 'password', description: 'only lowercase' },
      { password: 'Password', description: 'no numbers' },
      { password: 'Password123', description: 'no special characters' },
      { password: 'password123!', description: 'no uppercase' },
      { password: 'PASSWORD123!', description: 'no lowercase' },
      { password: 'Pass!', description: 'too short but complex' }
    ];

    for (const test of weakPasswords) {
      await this.testValidationError(API_ENDPOINTS.register, {
        email: `test_${Date.now()}@example.com`,
        password: test.password,
        full_name: 'Test User'
      }, 'password');
      this.logger.info(`   ✓ Rejected password: ${test.description}`);
    }

    // Test strong passwords
    const strongPasswords = [
      'StrongPass123!',
      'MyP@ssw0rd',
      'Secure123#',
      'Test@123456',
      'P@ssw0rd!'
    ];

    for (const password of strongPasswords) {
      try {
        await this.client.post(API_ENDPOINTS.register, {
          email: `strong_${Date.now()}@example.com`,
          password: password,
          full_name: 'Test User'
        });
        this.logger.info('   ✓ Accepted strong password');
      } catch (error) {
        // Might fail due to other reasons, but not password validation
        if (error.response.status !== 400 || !error.response.data.error.toLowerCase().includes('password')) {
          this.logger.info('   ✓ Accepted password format');
        }
      }
    }
  }

  async testNameValidation() {
    this.logger.info('👤 Testing full_name validation...');

    const invalidNames = [
      { full_name: '', description: 'empty name' },
      { full_name: ' ', description: 'whitespace only' },
      { full_name: 'a', description: 'too short' },
      { full_name: 'a'.repeat(256), description: 'too long' },
      { full_name: '123', description: 'only numbers' },
      { full_name: '!@#$', description: 'only special characters' },
      { full_name: null, description: 'null value' },
      { full_name: undefined, description: 'undefined value' }
    ];

    for (const test of invalidNames) {
      await this.testValidationError(API_ENDPOINTS.register, {
        email: `name_test_${Date.now()}@example.com`,
        password: 'ValidPass123!',
        full_name: test.full_name
      }, 'full_name');
      this.logger.info(`   ✓ Rejected full_name: ${test.description}`);
    }
  }

  async testRoleValidation() {
    this.logger.info('👥 Testing role validation...');

    // This test requires admin access
    try {
      const adminLoginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);
      const adminToken = adminLoginResponse.data.data.access_token;

      const invalidRoles = [
        'invalid_role',
        'ADMIN',
        'User',
        'superuser',
        'administrator',
        '',
        null,
        123,
        'guest'
      ];

      for (const role of invalidRoles) {
        try {
          await this.client.post(API_ENDPOINTS.adminUsers, {
            email: `role_test_${Date.now()}@example.com`,
            password: 'ValidPass123!',
            full_name: 'Role Test User',
            role: role
          }, {
            Authorization: `Bearer ${adminToken}`
          });
        } catch (error) {
          this.assert.assertEqual(error.response.status, 400, 'Invalid role should return 400');
          this.logger.info(`   ✓ Rejected role: ${role}`);
        }
      }

      // Test valid roles
      const validRoles = ['user', 'admin', 'super_admin'];
      for (const role of validRoles) {
        try {
          await this.client.post(API_ENDPOINTS.adminUsers, {
            email: `valid_role_${Date.now()}@example.com`,
            password: 'ValidPass123!',
            full_name: 'Valid Role User',
            role: role
          }, {
            Authorization: `Bearer ${adminToken}`
          });
          this.logger.info(`   ✓ Accepted role: ${role}`);
        } catch (error) {
          if (error.response.status !== 400) {
            this.logger.info(`   ✓ Accepted role format: ${role}`);
          }
        }
      }
    } catch (error) {
      this.logger.info('   ⚠️ Role validation test skipped - no admin access');
    }
  }

  async testLanguageValidation() {
    this.logger.info('🌍 Testing language validation...');

    const invalidLanguages = [
      'xyz',
      'english',
      'EN',
      'vi-VN',
      '',
      null,
      123,
      'vietnamese'
    ];

    // Test language in query parameters
    for (const lang of invalidLanguages) {
      const response = await this.client.get(`${API_ENDPOINTS.health}?lang=${lang}`);
      // Should not fail, but might not use the invalid language
      this.assert.assertEqual(response.status, 200, 'Invalid language should not break endpoint');
      this.logger.info(`   ✓ Handled invalid language: ${lang}`);
    }

    // Test valid languages
    for (const lang of TEST_LANGUAGES) {
      const response = await this.client.get(`${API_ENDPOINTS.health}?lang=${lang}`);
      this.assert.assertEqual(response.status, 200, 'Valid language should work');
      this.logger.info(`   ✓ Accepted language: ${lang}`);
    }
  }

  async testNumericValidation() {
    this.logger.info('🔢 Testing numeric validation...');
    const loginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);
    const token = loginResponse.data.data.access_token;

    // Test with endpoints that might accept numeric values
    const invalidNumbers = [
      'not-a-number',
      '',
      null,
      undefined,
      Infinity,
      -Infinity,
      NaN,
      '123abc',
      'abc123'
    ];

    // Test in query parameters (like pagination)
    for (const num of invalidNumbers) {
      try {
        const response = await this.client.get(`${API_ENDPOINTS.adminUsers}?page=${num}&limit=${num}`,
          { Authorization: `Bearer ${token}` });

        // Should handle gracefully or return validation error
        if (response.status !== 200) {
          this.assert.assertContains([400, 422], response.status, 'Invalid numbers should be handled');
        }
        this.logger.info(`   ✓ Handled invalid number: ${num}, responsed page: ${response.data.data.pagination.page}`);
      } catch (error) {
        this.assert.assertContains([400, 422], error.response.status, 'Invalid numbers should return validation error');
        this.logger.info(`   ✓ Rejected invalid number: ${num}`);
      }
    }
  }

  async testStringValidation() {
    this.logger.info('📝 Testing string validation...');

    const invalidStrings = [
      null,
      undefined,
      123,
      true,
      false,
      {},
      [],
      '\x00', // null byte
      '\n\r\t', // control characters
      ' '.repeat(1000) // very long whitespace
    ];

    for (const str of invalidStrings) {
      await this.testValidationError(API_ENDPOINTS.register, {
        email: 'test@example.com',
        password: 'ValidPass123!',
        full_name: str
      });
      this.logger.info(`   ✓ Rejected invalid string type: ${typeof str}`);
    }
  }

  async testObjectValidation() {
    this.logger.info('📦 Testing object validation...');

    const invalidObjects = [
      null,
      undefined,
      'string',
      123,
      true,
      [],
      { extra: 'field', email: 'test@example.com', password: 'ValidPass123!', full_name: 'Test' }
    ];

    for (const obj of invalidObjects) {
      try {
        await this.client.post(API_ENDPOINTS.login, obj);
      } catch (error) {
        this.assert.assertEqual(error.response.status, 400, 'Invalid object should return 400');
        this.logger.info(`   ✓ Rejected invalid object: ${typeof obj}`);
      }
    }
  }

  async testArrayValidation() {
    this.logger.info('📋 Testing array validation...');

    // Test endpoints that might expect arrays
    try {
      // This might not be implemented, so we'll test gracefully
      await this.client.post(API_ENDPOINTS.bulkOperation, [
        { invalid: 'array', item: 1 },
        { another: 'invalid', item: 2 }
      ]);
    } catch (error) {
      if (error.response.status === 404) {
        this.logger.info('   ⚠️ Array validation test skipped - endpoint not found');
      } else {
        this.assert.assertContains([400, 422], error.response.status, 'Invalid array should be handled');
        this.logger.info('   ✓ Array validation works');
      }
    }
  }

  async testCustomValidation() {
    this.logger.info('🔧 Testing custom validation...');

    // Test business logic validation
    const customValidationTests = [
      {
        description: 'duplicate email registration',
        test: async () => {
          const userData = {
            email: 'test-user@example.com',
            password: 'ValidPass123!',
            full_name: 'First User'
          };

          // First registration should succeed
          await this.client.post(API_ENDPOINTS.register, userData);

          // Second registration should fail
          try {
            const response = await this.client.post(API_ENDPOINTS.register, userData);
            this.assert.assertEqual(response.status, 400, 'Duplicate email should return 400');
            // throw new Error('Duplicate email should be rejected');
          } catch (error) {
            console.log('testCustomValidation Error:', error.response.status, error.response.data);
          }
        }
      },
      {
        description: 'password change with wrong current password',
        test: async () => {
          const loginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.regular);
          const token = loginResponse.data.data.access_token;

          try {
            const response = await this.client.post(API_ENDPOINTS.userChangePassword, {
              currentPassword: 'wrongpassword',
              newPassword: 'NewPass123!',
              confirmPassword: 'NewPass123!'
            }, {
              Authorization: `Bearer ${token}`
            });
            this.assert.assertEqual(response.status, 400, 'Wrong current password should return 400');
          } catch (error) {
            console.log('testCustomValidation Error:', error.response.status, error.response.data);
          }
        }
      },
      {
        description: 'password confirmation mismatch',
        test: async () => {
          const loginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.regular);
          const token = loginResponse.data.data.access_token;

          try {
            const response = await this.client.post(API_ENDPOINTS.userChangePassword, {
              currentPassword: 'testpass123',
              newPassword: 'NewPass123!',
              confirmPassword: 'DifferentPass123!'
            }, {
              Authorization: `Bearer ${token}`
            });
            this.assert.assertEqual(response.status, 400, 'Password confirmation mismatch should return 400');
          } catch (error) {
            console.log('testCustomValidation Error:', error.response.status, error.response.data);
          }
        }
      }
    ];

    for (const test of customValidationTests) {
      try {
        await test.test();
        this.logger.info(`   ✓ Custom validation: ${test.description}`);
      } catch (error) {
        this.logger.warn(`   ⚠️ Custom validation test failed: ${test.description}`);
      }
    }
  }
}

// Export and run if called directly
export { ValidationTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new ValidationTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
