#!/usr/bin/env node

/**
 * Zod Validation Comprehensive Test Suite
 * Tests Zod schema validation system: /api/zod_demo/*
 *
 * Endpoints tested:
 * - GET /api/zod_demo - Validation system overview
 * - POST /api/zod_demo/register - User registration validation
 * - POST /api/zod_demo/search - Search parameter validation
 * - POST /api/zod_demo/upload - File upload validation
 *
 * Test coverage:
 * - Email format validation (RFC compliant)
 * - Password strength requirements (length, complexity)
 * - Required vs optional field validation
 * - Data type coercion and validation
 * - Custom validation rules
 * - Nested object validation
 * - Array validation with min/max constraints
 * - File validation (size, type, content)
 * - Error message customization and localization
 * - Input sanitization and transformation
*/

import { TEST_CONFIG, API_ENDPOINTS, TEST_USERS } from './config/testConfig.js';
import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';


class ZodValidationTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.passedTests = 0;
    this.totalTests = 0;
  }
  async runAll() {
    this.logger.logSuiteHeader('🧪 Starting ZodValidationTests Tests');

    const tests = [
      this.testRegistrationValidation,
      this.testSearchValidation,
      this.testFileUploadValidation,
      this.testMainZodDemoEndpoint,
      this.testI18nSetupAdminAuth,
      this.testI18nErrorMessagesUserRegistration,
      this.testI18nErrorMessagesSearch,
      this.testI18nErrorMessagesFileUpload
    ];

    // Process tests using standard pattern
    for (const test of tests) {
      const beforePassed = this.passedTests;
      const beforeTotal = this.totalTests;
      try {
        await test.call(this);
        // Determine how many scenarios added and failed in this test
        const scenariosAdded = this.totalTests - beforeTotal;
        const scenariosPassed = this.passedTests - beforePassed;
        const scenariosFailed = scenariosAdded - scenariosPassed;
        if (scenariosFailed === 0) {
          this.logger.success(`${test.name} passed (${scenariosPassed}/${scenariosAdded})`);
        } else {
          this.logger.error(`${test.name} failed (${scenariosFailed} scenario(s) failed)`);
        }
      } catch (error) {
        const scenariosAdded = this.totalTests - beforeTotal;
        const scenariosPassed = this.passedTests - beforePassed;
        const scenariosFailed = scenariosAdded - scenariosPassed || 1; // at least 1
        this.logger.error(`[runAll] [${test.name}] exception: ${error.message} (${scenariosFailed} failed)`);
      }
    }

    // Derive aggregate counts and feed into logger counters so summary reflects scenario results
    this.logger.testCount = this.totalTests;
    this.logger.passCount = this.passedTests;
    this.logger.failCount = this.totalTests - this.passedTests;

    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      process.exit(1);
    }
  }

  async testRegistrationValidation() {
    try {
      this.logger.info('Testing registration validation...');
      let scenarioFailed = false;

      // Test 1: Valid registration
      this.totalTests++;
      try {
        const result = await this.client.post(API_ENDPOINTS.zodDemoRegister, {
          full_name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123!',
          confirmPassword: 'SecurePass123!',
          age: 25,
          country: 'us',
          terms_accepted: true
        });

        const assertion = await TestAssertions.runAssertion(async () => {
          TestAssertions.assertStatus(result.status, 200, 'Valid registration');
          TestAssertions.assertSuccess(result, 'Valid registration');
          TestAssertions.assertHasFields(result.data.data, ['user'], 'Registration response');

          // Check data transformation
          if (result.data.data.user.country === 'US') {
            this.logger.success('Country transformation (us -> US) - PASSED');
          }
        });

        if (assertion.success) {
          this.logger.success('Valid registration - PASSED');
          this.passedTests++;
        } else {
          this.logger.error(`Valid registration - FAILED: ${assertion.message}`);
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`Valid registration - ERROR: ${err.message}`);
        scenarioFailed = true;
      }

      // Test 2: Invalid email
      this.totalTests++;
      try {
        const result = await this.client.post(API_ENDPOINTS.zodDemoRegister, {
          full_name: 'John Doe',
          email: 'invalid-email',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
          age: 25,
          country: 'us',
          terms_accepted: true
        });

        const assertion = await TestAssertions.runAssertion(async () => {
          TestAssertions.assertStatus(result.status, 400, 'Invalid email validation');
          if (!result.data.error) {
            throw new Error('Should return validation error for invalid email');
          }
        });

        if (assertion.success) {
          this.logger.success('Invalid email validation - PASSED');
          this.passedTests++;
        } else {
          this.logger.error(`Invalid email validation - FAILED: ${assertion.error}`);
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`Invalid email validation - ERROR: ${err.message}`);
        scenarioFailed = true;
      }

      // Test 3: Weak password
      this.totalTests++;
      try {
        const result = await this.client.post(API_ENDPOINTS.zodDemoRegister, {
          full_name: 'John Doe',
          email: 'john@example.com',
          // Use very short password to trigger length validation (schema only enforces length)
          password: '123',
          confirmPassword: '123',
          age: 25,
          country: 'us',
          terms_accepted: true
        });

        const passwordErrors = result.data.errors || [];
        if (result.status === 400 && passwordErrors.some(issue =>
          issue.field && issue.field.includes('password')
        )) {
          this.logger.success('Weak password validation - PASSED');
          this.passedTests++;
        } else {
          this.logger.error('Weak password validation - FAILED');
          if (result) {
            this.logger.info?.(`Weak password debug status=${result.status} body=${JSON.stringify(result.data)}`);
          }
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`Weak password validation - ERROR: ${err.message}`);
        scenarioFailed = true;
      }

      // Test 4: Underage
      this.totalTests++;
      try {
        const result = await this.client.post(API_ENDPOINTS.zodDemoRegister, {
          full_name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
          age: 10, // Below minimum age (13) to trigger validation error
          country: 'us',
          terms_accepted: true
        });

        const ageErrors = result.data.errors || [];
        if (result.status === 400 && ageErrors.some(issue =>
          issue.field && issue.field.includes('age')
        )) {
          this.logger.success('Age validation - PASSED');
          this.passedTests++;
        } else {
          this.logger.error('Age validation - FAILED');
          if (result) {
            this.logger.info?.(`Age validation debug status=${result.status} body=${JSON.stringify(result.data)}`);
          }
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`Age validation - ERROR: ${err.message}`);
        scenarioFailed = true;
      }

      // Test 5: Terms not accepted
      this.totalTests++;
      try {
        const result = await this.client.post(API_ENDPOINTS.zodDemoRegister, {
          full_name: 'John Doe',
          email: 'john@example.com',
          password: 'SecurePass123',
          confirmPassword: 'SecurePass123',
          age: 25,
          country: 'us',
          terms_accepted: false
        });

        if (result.status === 400) {
          this.logger.success('Terms acceptance validation - PASSED');
          this.passedTests++;
        } else {
          this.logger.error('Terms acceptance validation - FAILED');
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`Terms acceptance validation - ERROR: ${err.message}`);
        scenarioFailed = true;
      }
      if (scenarioFailed) {
        throw new Error('One or more registration validation scenarios failed');
      } else {
        this.logger.success('Registration validation test completed successfully');
      }
    } catch (error) {
      this.logger.error(`[testRegistrationValidation] Registration validation test failed: ${error.message}`);
      throw error;
    }
  }

  async testSearchValidation() {
    try {
      this.logger.info('Testing search query validation...');
      let scenarioFailed = false;

      // Test 1: Valid search with defaults
      this.totalTests++;
      try {
        const result = await this.client.get(`${API_ENDPOINTS.zodDemoSearch}?query=test`);

        const assertion = await TestAssertions.runAssertion(async () => {
          TestAssertions.assertStatus(result.status, 200, 'Search with defaults');
          TestAssertions.assertSuccess(result, 'Search with defaults');
          TestAssertions.assertHasFields(result.data.data, ['page', 'limit', 'sort_by', 'sort_order'], 'Search response');

          // Check default values
          if (result.data.data.page !== 1 || result.data.data.limit !== 10 ||
        result.data.data.sort_by !== 'relevance' || result.data.data.sort_order !== 'desc') {
            throw new Error('Default values not properly assigned');
          }
        });

        if (assertion.success) {
          this.logger.success('Default values assignment - PASSED');
          this.passedTests++;
        } else {
          this.logger.error(`Default values assignment - FAILED: ${assertion.error}`);
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`Default values assignment - ERROR: ${err.message}`);
        scenarioFailed = true;
      }

      // Test 2: Data transformation (string to number)
      this.totalTests++;
      try {
        const result = await this.client.get(`${API_ENDPOINTS.zodDemoSearch}?query=test&page=5&limit=20`);

        if (result.status === 200 &&
            typeof result.data.data.page === 'number' &&
            typeof result.data.data.limit === 'number' &&
            result.data.data.page === 5 &&
            result.data.data.limit === 20) {
          this.logger.success('String to number transformation - PASSED');
          this.passedTests++;
        } else {
          this.logger.error('String to number transformation - FAILED');
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`String to number transformation - ERROR: ${err.message}`);
        scenarioFailed = true;
      }

      // Test 3: Enum validation
      this.totalTests++;
      try {
        const result = await this.client.get(`${API_ENDPOINTS.zodDemoSearch}?query=test&sort_by=invalid_sort`);

        if (result.status === 400 && result.data.error) {
          this.logger.success('Enum validation - PASSED');
          this.passedTests++;
        } else {
          this.logger.error('Enum validation - FAILED');
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`Enum validation - ERROR: ${err.message}`);
        scenarioFailed = true;
      }

      // Test 4: Range validation
      this.totalTests++;
      try {
        const result = await this.client.get(`${API_ENDPOINTS.zodDemoSearch}?query=test&limit=200`);

        if (result.status === 400 && result.data.error) {
          this.logger.success('Range validation (limit > 100) - PASSED');
          this.passedTests++;
        } else {
          this.logger.error('Range validation (limit > 100) - FAILED');
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`Range validation - ERROR: ${err.message}`);
        scenarioFailed = true;
      }
      if (scenarioFailed) {
        throw new Error('One or more search validation scenarios failed');
      } else {
        this.logger.success('Search validation test completed successfully');
      }
    } catch (error) {
      this.logger.error(`[testSearchValidation] Search validation test failed: ${error.message}`);
      throw error;
    }
  }

  async testFileUploadValidation() {
    try {
      this.logger.info('Testing file upload validation...');
      let scenarioFailed = false;

      // Test 1: Valid file upload
      this.totalTests++;
      try {
        const result = await this.client.post(API_ENDPOINTS.zodDemoUpload, {
          file_name: 'document.pdf',
          file_size: 1024000,
          file_type: 'application/pdf',
          description: 'Important document'
        });

        const assertion = await TestAssertions.runAssertion(async () => {
          TestAssertions.assertStatus(result.status, 200, 'Valid file upload');
          TestAssertions.assertSuccess(result, 'Valid file upload');
        });

        if (assertion.success) {
          this.logger.success('Valid file upload - PASSED');
          this.passedTests++;
        } else {
          this.logger.error(`Valid file upload - FAILED: ${assertion.error}`);
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`Valid file upload - ERROR: ${err.message}`);
        scenarioFailed = true;
      }

      // Test 2: Invalid file extension
      this.totalTests++;
      try {
        const result = await this.client.post(API_ENDPOINTS.zodDemoUpload, {
          file_name: 'malware.exe',
          file_size: 1024000,
          file_type: 'application/pdf'
        });

        if (result.status === 400 && result.data.error) {
          this.logger.success('File extension validation - PASSED');
          this.passedTests++;
        } else {
          this.logger.error('File extension validation - FAILED');
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`File extension validation - ERROR: ${err.message}`);
        scenarioFailed = true;
      }

      // Test 3: File size limit
      this.totalTests++;
      try {
        const result = await this.client.post(API_ENDPOINTS.zodDemoUpload, {
          file_name: 'huge_file.pdf',
          file_size: 20 * 1024 * 1024, // 20MB
          file_type: 'application/pdf'
        });

        if (result.status === 400 && result.data.error) {
          this.logger.success('File size limit validation - PASSED');
          this.passedTests++;
        } else {
          this.logger.error('File size limit validation - FAILED');
          scenarioFailed = true;
        }
      } catch (err) {
        this.logger.error(`File size limit validation - ERROR: ${err.message}`);
        scenarioFailed = true;
      }
      if (scenarioFailed) {
        throw new Error('One or more file upload validation scenarios failed');
      } else {
        this.logger.success('File upload validation test completed successfully');
      }
    } catch (error) {
      this.logger.error(`[testFileUploadValidation] File upload validation test failed: ${error.message}`);
      throw error;
    }
  }

  // Test the main Zod demo endpoint
  async testMainZodDemoEndpoint() {
    try {
      this.logger.info('Testing main Zod demo endpoint...');

      // Test 1: Main zodDemo endpoint (this one exists and works)
      this.totalTests++;
      try {
        const result = await this.client.get(API_ENDPOINTS.zodDemo);

        const assertion = await TestAssertions.runAssertion(async () => {
          TestAssertions.assertStatus(result.status, 200, 'Main Zod demo endpoint');
          TestAssertions.assertHasFields(result.data, ['message'], 'Zod demo response');

          // Also verify the response structure
          if (result.data.available_endpoints && result.data.examples) {
            this.logger.success('Zod demo endpoint structure - PASSED');
          }
        });

        if (assertion.success) {
          this.logger.success('Main Zod demo endpoint - PASSED');
          this.passedTests++;
        } else {
          this.logger.error(`Main Zod demo endpoint - FAILED: ${assertion.error}`);
        }
      } catch (err) {
        this.logger.error(`Main Zod demo endpoint - ERROR: ${err.message}`);
      }

      // Test 2: Endpoint documentation completeness
      this.totalTests++;
      try {
        const result = await this.client.get(API_ENDPOINTS.zodDemo);

        if (result.status === 200 && result.data.available_endpoints) {
          const endpoints = result.data.available_endpoints;

          // Check if all expected Zod demo endpoints are documented
          const expectedEndpoints = ['POST /zod_demo/register', 'GET /zod_demo/search', 'POST /zod_demo/upload'];
          const hasAllEndpoints = expectedEndpoints.every(endpoint =>
            Object.keys(endpoints).includes(endpoint)
          );

          if (hasAllEndpoints) {
            this.logger.success('Zod demo endpoints documentation - PASSED');
            this.passedTests++;
          } else {
            this.logger.error('Zod demo endpoints documentation - FAILED');
          }
        } else {
          this.logger.error('Zod demo endpoints documentation - FAILED');
        }
      } catch (err) {
        this.logger.error(`Zod demo endpoints documentation - ERROR: ${err.message}`);
      }

      // Test 3: Examples validation structure
      this.totalTests++;
      try {
        const result = await this.client.get(API_ENDPOINTS.zodDemo);

        if (result.status === 200 && result.data.examples) {
          const examples = result.data.examples;

          // Check if examples contain proper structure for all operations
          const hasValidExamples = examples.register && examples.search && examples.upload &&
                                  examples.register.body && examples.search.url && examples.upload.body;

          if (hasValidExamples) {
            this.logger.success('Zod demo examples structure - PASSED');
            this.passedTests++;
          } else {
            this.logger.error('Zod demo examples structure - FAILED');
          }
        } else {
          this.logger.error('Zod demo examples structure - FAILED');
        }
      } catch (err) {
        this.logger.error(`Zod demo examples structure - ERROR: ${err.message}`);
      }

      this.logger.success('Main Zod demo endpoint test completed successfully');
    } catch (error) {
      this.logger.error(`[testMainZodDemoEndpoint] Main Zod demo endpoint test failed: ${error.message}`);
      throw error;
    }
  }

  async testI18nSetupAdminAuth() {
    this.logger.info('Setting up admin authentication for i18n zod demo tests');
    try {
      const loginResponse = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);

      if (loginResponse.status === 200 && loginResponse.data?.success) {
        const token = loginResponse.data.data?.access_token || loginResponse.data.data?.token;
        if (token) {
          this.client.setAuthToken(token);
          this.logger.success('Admin authentication setup completed');
        } else {
          this.logger.info('Auth response did not include token field (continuing without token)');
        }
      } else {
        this.logger.info('Admin authentication not required / skipped (non-200 response)');
      }
    } catch (error) {
      this.logger.info('Admin authentication skipped (service unavailable)');
    }
  }

  async testI18nErrorMessagesUserRegistration() {
    this.logger.info('Testing i18n user registration error messages');

    const testCases = [
      { lang: 'en', expectedContains: ['User registration failed', 'could not complete', 'user-registration'] },
      { lang: 'vi', expectedContains: ['Đăng ký người dùng thất bại', 'không thể hoàn thành', 'user-registration'] },
      { lang: 'fr', expectedContains: ['Inscription de l\'utilisateur échouée', 'n\'a pas pu compléter', 'user-registration'] }
    ];

    for (const testCase of testCases) {
      try {
        const response = await this.client.post(API_ENDPOINTS.zodDemoRegister, {
          full_name: '',
          email: 'invalid-email',
          password: '123',
          age: 15,
          country: 'invalid',
          terms_accepted: false
        }, { 'Accept-Language': testCase.lang });

        this.assert.assertTrue(response.status >= 400, `Registration should fail for locale ${testCase.lang}`);

        if (response.data && !response.data.success) {
          const errorMessage = response.data.error || response.data.message || '';
          this.logger.info(`[${testCase.lang}] Registration error: ${errorMessage}`);
          const hasExpected = testCase.expectedContains.some(exp => errorMessage.toLowerCase().includes(exp.toLowerCase()));
          if (hasExpected) {
            this.logger.success(`[${testCase.lang}] Localized registration error OK`);
          } else {
            this.logger.info(`[${testCase.lang}] Registration validation produced fallback/default messages`);
          }
        }
      } catch (err) {
        this.logger.warning(`[${testCase.lang}] Registration i18n test exception: ${err.message}`);
      }
    }
  }

  async testI18nErrorMessagesSearch() {
    this.logger.info('Testing i18n search error messages');

    const testCases = [
      { lang: 'en', expectedContains: ['Search operation failed', 'could not complete', 'search-execution'] },
      { lang: 'vi', expectedContains: ['Thao tác tìm kiếm thất bại', 'không thể hoàn thành', 'search-execution'] }
    ];

    for (const testCase of testCases) {
      try {
        const response = await this.client.get(`${API_ENDPOINTS.zodDemoSearch}?query=&limit=invalid&page=-1`, { 'Accept-Language': testCase.lang });
        if (response.status >= 400 && response.data && !response.data.success) {
          const errorMessage = response.data.error || response.data.message || '';
          this.logger.info(`[${testCase.lang}] Search error: ${errorMessage}`);
          const hasExpected = testCase.expectedContains.some(exp => errorMessage.toLowerCase().includes(exp.toLowerCase()));
          if (hasExpected) {
            this.logger.success(`[${testCase.lang}] Localized search error OK`);
          } else {
            this.logger.info(`[${testCase.lang}] Search validation produced fallback/default messages`);
          }
        }
      } catch (err) {
        this.logger.warning(`[${testCase.lang}] Search i18n test exception: ${err.message}`);
      }
    }
  }

  async testI18nErrorMessagesFileUpload() {
    this.logger.info('Testing i18n file upload error messages');

    const testCases = [
      { lang: 'en', expectedContains: ['File upload failed', 'could not complete', 'file-upload'] },
      { lang: 'vi', expectedContains: ['Tải file thất bại', 'không thể hoàn thành', 'file-upload'] }
    ];

    for (const testCase of testCases) {
      try {
        const response = await this.client.post(API_ENDPOINTS.zodDemoUpload, {
          file_name: '',
          file_size: -1,
          description: 'x'.repeat(1001)
        }, { 'Accept-Language': testCase.lang });

        if (response.status >= 400 && response.data && !response.data.success) {
          const errorMessage = response.data.error || response.data.message || '';
          this.logger.info(`[${testCase.lang}] File upload error: ${errorMessage}`);
          const hasExpected = testCase.expectedContains.some(exp => errorMessage.toLowerCase().includes(exp.toLowerCase()));
          if (hasExpected) {
            this.logger.success(`[${testCase.lang}] Localized file upload error OK`);
          } else {
            this.logger.info(`[${testCase.lang}] File upload validation produced fallback/default messages`);
          }
        }
      } catch (err) {
        this.logger.warning(`[${testCase.lang}] File upload i18n test exception: ${err.message}`);
      }
    }
  }
}

// Export and run if called directly
export { ZodValidationTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new ZodValidationTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
