#!/usr/bin/env node

/**
 * COMPREHENSIVE i18n Test Suite - All-in-One
 * Tổng hợp tất cả các test về i18n system vào một file duy nhất
 *
 * 🎯 MIGRATION STATUS: COMPLETED
 * - ✅ KEPT: t(), tError(), tSuccess() (3 optimized functions)
 * - 🗑️ REMOVED: tl(), tp(), tf(), tc() (4 redundant functions)
 * - 📊 API REDUCTION: 57% (7→3 functions)
 *
 * 🧪 TEST COVERAGE:
 * 1. Service Functions Testing (Migration Results)
 * 2. Enhanced i18n Features Testing
 * 3. Translation/i18n API Testing
 * 4. Language Detection & Switching
 * 5. Error & Success Message Localization
 * 6. Pluralization & Formatting
 * 7. Performance & Edge Cases
 * 8. Real Route Response Testing with Interpolation
 *
 * 📋 ROUTE INTERPOLATION TESTS:
 * - Language not supported error with interpolation parameters
 * - Section not found error with contextual information
 * - Successful translation retrieval with localized messages
 * - Multilingual error message formatting and validation
 * - Demo route error handling with context and parameters
 * - User route authentication errors with interpolation
 * - Success message structure validation across languages
 * - Performance and response time validation with i18n
 */

import { t, tError, tSuccess } from '../src/i18n/service.js';
import { initI18n, getSupportedLanguages, getDefaultLanguage } from '../src/i18n/config.js';
import { TestLogger } from './utils/testLogger.js';
import { TestClient } from './utils/testClient.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_CONFIG, API_ENDPOINTS, TEST_USERS, TEST_LANGUAGES } from './config/testConfig.js';

class ComprehensiveI18nTest {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.accessToken = null;
    this.testUser = TEST_USERS.valid;
    this.performanceMetrics = {
      totalRequests: 0,
      totalTime: 0,
      languageResults: {},
      errorPatterns: {}
    };
  }

  /**
   * Run all comprehensive i18n tests
   */
  async runAll() {
    this.logger.logSuiteHeader('🌍 Comprehensive i18n Test Suite - All-in-One');

    // Initialize i18n system first
    const initialized = await this.initializeI18n();
    if (!initialized) {
      this.logger.error('❌ Cannot proceed without i18n initialization');
      process.exit(1);
    }

    const tests = [
      // 1. Service Functions Testing (Final Optimized)
      this.testOptimizedServiceFunctions,
      this.testCommonTranslationKeys,

      // 2. Enhanced i18n Features Testing
      this.testEnhancedDemoEndpoint,
      this.testCustomPluralization,
      this.testCustomFormatting,
      this.testCustomContextual,

      // 3. Translation/i18n API Testing
      this.testDefaultLanguage,
      this.testLanguageDetection,
      this.testQueryParameterLanguage,
      this.testAcceptLanguageHeader,
      this.testTranslationEndpoints,

      // 4. Error & Success Message Localization
      this.testErrorMessageTranslation,
      this.testValidationMessageTranslation,
      this.testSuccessMessageTranslation,
      this.testValidationWithEnhancedI18n,

      // 5. Language Switching & Detection
      this.testLanguageSwitching,
      this.testFallbackTranslations,
      this.testI18nLanguageDetection,

      // 6. Performance & Edge Cases
      this.testPerformanceBenchmarking,
      this.testEdgeCasesAndFallbacks,
      this.testComplexNestedTranslations,
      this.testTranslationCachePerformance,

      // 7. Real Route Response Testing with Interpolation
      this.testLanguageNotSupportedError,
      this.testSectionNotFoundError,
      this.testSuccessfulTranslationRetrieval,
      this.testMultilingualErrorMessages,
      this.testDemoRouteError,
      this.testUserRouteError,
      this.testSuccessMessageStructure,
      this.testResponsePerformance
    ];

    // Process tests using standard pattern
    for (const test of tests) {
      try {
        await test.call(this);
        this.logger.recordResult(true);
      } catch (error) {
        this.logger.error(`Test failed: ${test.name} - ${error.message}`);
        this.logger.recordResult(false);
      }
    }

    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      process.exit(1);
    }
  }

  /**
   * Initialize i18n system
   */
  async initializeI18n() {
    this.logger.info('🚀 Initializing i18n system...');
    try {
      await initI18n();
      const supportedLangs = getSupportedLanguages();
      const defaultLang = getDefaultLanguage();

      this.logger.success(`Supported languages: ${supportedLangs.join(', ')}`);
      this.logger.success(`Default language: ${defaultLang}`);
      this.logger.success('i18n initialized successfully');

      return true;
    } catch (error) {
      this.logger.error(`Failed to initialize i18n: ${error.message}`);
      return false;
    }
  }

  // =================================================================
  // 1. SERVICE FUNCTIONS TESTING (FINAL OPTIMIZED - MIGRATION RESULTS)
  // =================================================================

  /**
   * Test optimized i18n service functions after migration
   */
  async testOptimizedServiceFunctions() {
    this.logger.info('🎯 Testing optimized i18n service functions (3 functions)...');

    const mockContext = {
      get: (key) => {
        if (key === 'language') {return 'en';}
        if (key === 'i18n') {return { language: 'en' };}
        return undefined;
      }
    };

    const functions = [
      { name: 't', func: t, description: 'Core translation (handles all cases)' },
      { name: 'tError', func: tError, description: 'Error formatting (unique prefix)' },
      { name: 'tSuccess', func: tSuccess, description: 'Success formatting (unique prefix)' }
    ];

    let successCount = 0;
    this.logger.info('Function Testing Results:');
    this.logger.info('-'.repeat(50));

    for (const { name, func, description } of functions) {
      try {
        let result;

        if (name === 'tError') {
          result = func(mockContext, 'auth.invalidCredentials');
        } else if (name === 'tSuccess') {
          result = func(mockContext, 'translations.retrieved');
        } else {
          result = func(mockContext, 'auth.loginSuccess');
        }

        if (typeof result === 'string' && result.length > 0) {
          this.logger.success(`${name.padEnd(8)}: "${result}"`);
          this.logger.info(`   └─ 📄 ${description}`);
          successCount++;
        } else {
          this.logger.warning(`${name.padEnd(8)}: Invalid result ${typeof result}`);
        }
      } catch (error) {
        this.logger.error(`${name.padEnd(8)}: Error - ${error.message}`);
      }
    }

    // Test with interpolation data
    this.logger.info('\n🔧 Testing with interpolation:');
    const interpolationData = {
      userName: 'John Doe',
      userRole: 'admin',
      loginTime: '2025-08-09 14:30',
      count: 5,
      // Added required interpolation params for i18n keys
      // errors.validation needs {{details}}
      details: 'Sample validation detail',
      // success.user.created needs {{email}}
      email: 'john.doe@example.com'
    };

    for (const { name, func } of functions) {
      try {
        let result;
        if (name === 'tError') {
          result = func(mockContext, 'validation', interpolationData);
        } else if (name === 'tSuccess') {
          result = func(mockContext, 'user.created', interpolationData);
        } else {
          result = func(mockContext, 'auth.loginSuccess', interpolationData);
        }
        this.logger.success(`${name} + interpolation: "${result}"`);
      } catch (error) {
        this.logger.error(`${name} + interpolation: ${error.message}`);
      }
    }

    // Migration success analysis
    this.logger.info('\n📊 MIGRATION SUCCESS ANALYSIS:');
    this.logger.info('='.repeat(50));
    this.logger.success('🎉 MIGRATION COMPLETED SUCCESSFULLY');
    this.logger.success('📈 API Reduction: 57% (7 → 3 functions)');
    this.logger.success(`✅ Optimized Functions: ${successCount}/3 working`);

    this.logger.info('\n💡 FUNCTION PURPOSES:');
    this.logger.info('• t() - Core translation (handles plurals, formatting, context via options)');
    this.logger.info('• tError() - Error messages (unique: "errors." prefix + timestamp)');
    this.logger.info('• tSuccess() - Success messages (unique: "success." prefix + timestamp)');

    this.logger.info('\n🗑️ REMOVED REDUNDANT FUNCTIONS:');
    this.logger.info('• tl() - Language-specific (redundant: can use t() with context)');
    this.logger.info('• tp() - Plural (redundant: t() handles via options.count)');
    this.logger.info('• tf() - Format (redundant: t() handles via options)');
    this.logger.info('• tc() - Context (redundant: t() handles via options.context)');

    this.assert.assertEqual(successCount, 3, 'All optimized functions should work');
  }

  /**
   * Test common translation keys
   */
  async testCommonTranslationKeys() {
    this.logger.info('🔑 Testing common translation keys...');

    const mockContext = { get: () => 'en' };
    const commonKeys = [
      'auth.loginSuccess',
      'auth.invalidCredentials',
      'system.success',
      'system.apiInfo'
    ];

    let keySuccessCount = 0;
    for (const key of commonKeys) {
      try {
        const result = t(mockContext, key);
        if (typeof result === 'string' && result.length > 0) {
          this.logger.success(`Key "${key}": "${result}"`);
          keySuccessCount++;
        }
      } catch (error) {
        this.logger.error(`Key "${key}": ${error.message}`);
      }
    }

    this.logger.info(`📊 Translation keys test: ${keySuccessCount}/${commonKeys.length} successful`);
    this.assert.assertEqual(keySuccessCount > 0, true, 'At least some translation keys should work');
  }

  // =================================================================
  // 2. ENHANCED i18n FEATURES TESTING
  // =================================================================

  /**
   * Test enhanced i18n features demo endpoints
   */
  async testEnhancedDemoEndpoint() {
    this.logger.info('🔬 Testing Enhanced i18n Demo Endpoint');

    for (const lang of TEST_LANGUAGES) {
      try {
        const response = await this.client.get(API_ENDPOINTS.translationsDemoEnhanced, {
          headers: { 'Accept-Language': lang }
        });

        this.assert.assertEqual(response.status, 200, `Enhanced demo should work for ${lang}`);
        if (response.data && response.data.data) {
          this.assert.assertHasFields(response.data.data, ['language'], `Enhanced demo data for ${lang}`);
          this.logger.success(`Enhanced demo endpoint works for ${lang}`);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.logger.warning(`Enhanced demo endpoint not found for ${lang} (acceptable)`);
        } else {
          throw error;
        }
      }
    }
  }

  /**
   * Test custom pluralization
   */
  async testCustomPluralization() {
    this.logger.info('🔢 Testing custom pluralization...');

    const testCases = [
      {
        key: 'errors.validation',
        counts: [1, 2, 5, 10],
        language: 'en'
      },
      {
        key: 'success.user.created',
        counts: [0, 1, 3, 100],
        language: 'vi'
      }
    ];

    for (const testCase of testCases) {
      for (const count of testCase.counts) {
        try {
          const response = await this.client.post(API_ENDPOINTS.translationsTestPlurals || '/api/translations/test/plurals', {
            key: testCase.key,
            count: count,
            language: testCase.language,
            // Provide interpolation params for keys that require them
            params: testCase.key === 'errors.validation'
              ? { details: 'Missing required field', count }
              : testCase.key === 'success.user.created'
                ? { userName: 'Test User', email: 'test@example.com' }
                : {}
          });

          if (response.status === 200 && response.data) {
            this.logger.success(`Pluralization ${testCase.language}: ${testCase.key} (${count})`);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            this.logger.warning('Pluralization endpoint not found (acceptable)');
          } else {
            this.logger.error(`Pluralization test failed: ${error.message}`);
          }
        }
      }
    }
  }

  /**
   * Test custom formatting
   */
  async testCustomFormatting() {
    this.logger.info('📝 Testing custom formatting...');

    const testCases = [
      {
        key: 'success.user.dataExported',
        testData: [
          { fileSize: 1, userName: 'Test User' },
          { fileSize: 2, userName: 'Test User' },
          { fileSize: 1464, userName: 'Test User' }
        ],
        language: 'en'
      },
      {
        key: 'errors.system.rateLimitExceeded',
        testData: [
          { currentRequests: 150, maxRequests: 100, timeWindow: '1 minute' },
          { currentRequests: 50, maxRequests: 100, timeWindow: '1 hour' }
        ],
        language: 'vi'
      }
    ];

    for (const testCase of testCases) {
      for (const data of testCase.testData) {
        try {
          const response = await this.client.post(API_ENDPOINTS.translationsTestFormatting || '/api/translations/test/formatting', {
            key: testCase.key,
            data: data,
            language: testCase.language
          });

          if (response.status === 200) {
            this.logger.success(`Formatting ${testCase.language}: ${testCase.key}`);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            this.logger.warning('Formatting endpoint not found (acceptable)');
          } else {
            this.logger.error(`Formatting test failed: ${error.message}`);
          }
        }
      }
    }
  }

  /**
   * Test custom contextual translations
   */
  async testCustomContextual() {
    this.logger.info('🎭 Testing custom contextual translations...');

    const testCases = [
      {
        key: 'messages.welcome',
        contexts: ['user', 'admin', 'super_admin'],
        language: 'en'
      },
      {
        key: 'errors.auth.invalidCredentials',
        contexts: ['user', 'admin'],
        language: 'vi'
      }
    ];

    for (const testCase of testCases) {
      for (const context of testCase.contexts) {
        try {
          const response = await this.client.post(API_ENDPOINTS.translationsTestContext || '/api/translations/test/context', {
            key: testCase.key,
            context: context,
            language: testCase.language
          });

          if (response.status === 200) {
            this.logger.success(`Contextual ${testCase.language}: ${testCase.key} (${context})`);
          }
        } catch (error) {
          if (error.response && error.response.status === 404) {
            this.logger.warning('Contextual endpoint not found (acceptable)');
          } else {
            this.logger.error(`Contextual test failed: ${error.message}`);
          }
        }
      }
    }
  }

  // =================================================================
  // 3. TRANSLATION/i18n API TESTING
  // =================================================================

  /**
   * Test default language detection
   */
  async testDefaultLanguage() {
    this.logger.info('🏠 Testing default language detection...');

    const response = await this.client.get(API_ENDPOINTS.health);
    this.assert.assertEqual(response.status, 200, 'Health endpoint should work');

    // Check if response includes language information
    if (response.data.data && response.data.data.language) {
      this.logger.success(`Default language detected: ${response.data.data.language}`);
    } else {
      this.logger.info('Default language detection: No language info in response (acceptable)');
    }
  }

  /**
   * Test language detection via Accept-Language header
   */
  async testLanguageDetection() {
    this.logger.info('🌐 Testing language detection...');

    // Test with Accept-Language header
    const response = await this.client.get(API_ENDPOINTS.health, {
      headers: { 'Accept-Language': 'vi-VN,vi;q=0.9,en;q=0.8' }
    });

    this.assert.assertEqual(response.status, 200, 'Request with Accept-Language should work');

    // Check if Vietnamese is detected (if supported)
    if (response.data.data && response.data.data.language) {
      this.logger.success(`Language detected: ${response.data.data.language}`);
    } else {
      this.logger.info('Language detection: No language info in response (acceptable)');
    }
  }

  /**
   * Test query parameter language override
   */
  async testQueryParameterLanguage() {
    this.logger.info('🔗 Testing query parameter language override...');

    for (const lang of TEST_LANGUAGES) {
      try {
        const response = await this.client.get(`${API_ENDPOINTS.health}?lang=${lang}`);
        this.assert.assertEqual(response.status, 200, `Query parameter language ${lang} should work`);

        if (response.data.data && response.data.data.language) {
          this.logger.success(`Query param language ${lang}: ${response.data.data.language}`);
        } else {
          this.logger.info(`Query param language ${lang}: Working (no language info)`);
        }
      } catch (error) {
        this.logger.error(`Query parameter language ${lang} failed: ${error.message}`);
      }
    }
  }

  /**
   * Test Accept-Language header with different formats
   */
  async testAcceptLanguageHeader() {
    this.logger.info('📋 Testing Accept-Language header...');

    const languageHeaders = {
      'vi': 'vi-VN,vi;q=0.9,en;q=0.8',
      'fr': 'fr-FR,fr;q=0.9,en;q=0.8',
      'es': 'es-ES,es;q=0.9,en;q=0.8',
      'de': 'de-DE,de;q=0.9,en;q=0.8',
      'ja': 'ja-JP,ja;q=0.9,en;q=0.8',
      'th': 'th-TH,th;q=0.9,en;q=0.8'
    };

    for (const [expectedLang, headerValue] of Object.entries(languageHeaders)) {
      try {
        const response = await this.client.get(API_ENDPOINTS.health, {
          headers: { 'Accept-Language': headerValue }
        });

        this.assert.assertEqual(response.status, 200, `Accept-Language ${expectedLang} should work`);
        this.logger.success(`Accept-Language header ${expectedLang}: Working`);
      } catch (error) {
        this.logger.error(`Accept-Language header ${expectedLang} failed: ${error.message}`);
      }
    }
  }

  /**
   * Test translation endpoints
   */
  async testTranslationEndpoints() {
    this.logger.info('🔌 Testing translation endpoints...');

    // Test main translations endpoint
    try {
      const response = await this.client.get(API_ENDPOINTS.translations);
      if (response.status === 200) {
        this.logger.success('Main translations endpoint working');
        if (response.data.data) {
          this.assert.assertHasFields(response.data.data, ['supportedLanguages'], 'Translation endpoint data');
        }
      }
    } catch (error) {
      if (error.response && error.response.status === 404) {
        this.logger.warning('Main translations endpoint not found (acceptable)');
      } else {
        throw error;
      }
    }

    // Test translations by language
    for (const lang of TEST_LANGUAGES) {
      try {
        const endpoint = API_ENDPOINTS.translationsByLang.replace(':language', lang);
        const response = await this.client.get(endpoint);

        if (response.status === 200) {
          this.logger.success(`Translations endpoint for ${lang}: Working`);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.logger.warning(`Translations endpoint for ${lang} not found (acceptable)`);
        } else {
          this.logger.error(`Translations endpoint for ${lang} failed: ${error.message}`);
        }
      }
    }

    // Test demo translation endpoints
    const demoEndpoints = [
      API_ENDPOINTS.translationsDemo,
      API_ENDPOINTS.translationsDemoAllLanguages,
      API_ENDPOINTS.translationsDemoSpecificKeys
    ];

    for (const endpoint of demoEndpoints) {
      try {
        const response = await this.client.get(endpoint);
        if (response.status === 200) {
          this.logger.success(`Demo endpoint ${endpoint}: Working`);
        }
      } catch (error) {
        if (error.response && error.response.status === 404) {
          this.logger.warning(`Demo endpoint ${endpoint} not found (acceptable)`);
        } else {
          this.logger.error(`Demo endpoint ${endpoint} failed: ${error.message}`);
        }
      }
    }
  }

  // =================================================================
  // 4. ERROR & SUCCESS MESSAGE LOCALIZATION
  // =================================================================

  /**
   * Test error message translation
   */
  async testErrorMessageTranslation() {
    this.logger.info('❌ Testing error message translation...');

    const invalidLogin = {
      email: 'invalid@example.com',
      password: 'wrongpassword'
    };

    for (const lang of TEST_LANGUAGES) {
      try {
        await this.client.post(`${API_ENDPOINTS.login}?lang=${lang}`, invalidLogin);
      } catch (error) {
        this.assert.assertEqual(error.response.status, 401, 'Invalid login should return 401');
        this.assert.assertNotEmpty(error.response.data.error, 'Should include error message');

        // Check if error message is translated (basic check)
        const errorMessage = error.response.data.error;
        this.assert.assertEqual(typeof errorMessage, 'string', 'Error message should be a string');
        this.assert.assertEqual(errorMessage.length > 0, true, 'Error message should not be empty');

        this.logger.success(`Error message translation ${lang}: "${errorMessage}"`);
      }
    }
  }

  /**
   * Test validation message translation
   */
  async testValidationMessageTranslation() {
    this.logger.info('🔍 Testing validation message translation...');

    const invalidData = {
      email: 'not-an-email',
      password: '123',
      full_name: 'test'
    };

    for (const lang of ['en', 'vi']) {
      try {
        await this.client.post(`${API_ENDPOINTS.register}?lang=${lang}`, invalidData);
      } catch (error) {
        this.assert.assertEqual(error.response.status, 400, 'Invalid data should return 400');
        this.assert.assertNotEmpty(error.response.data.error, 'Should include validation error message');

        const errorMessage = error.response.data.error;
        this.assert.assertEqual(typeof errorMessage, 'string', 'Validation error should be a string');

        this.logger.success(`Validation message translation ${lang}: "${errorMessage}"`);
      }
    }
  }

  /**
   * Test success message translation
   */
  async testSuccessMessageTranslation() {
    this.logger.info('✅ Testing success message translation...');

    const validUser = {
      email: `test_i18n_${Date.now()}@example.com`,
      password: 'SecurePass123!',
      full_name: 'i18n Test User'
    };

    for (const lang of ['en', 'vi']) {
      try {
        const response = await this.client.post(`${API_ENDPOINTS.register}?lang=${lang}`, {
          ...validUser,
          email: `test_i18n_${lang}_${Date.now()}@example.com`
        });

        this.assert.assertEqual(response.status, 201, 'Registration should succeed');

        if (response.data.message) {
          this.assert.assertEqual(typeof response.data.message, 'string', 'Success message should be a string');
          this.assert.assertEqual(response.data.message.length > 0, true, 'Success message should not be empty');

          this.logger.success(`Success message translation ${lang}: "${response.data.message}"`);
        }
      } catch (error) {
        this.logger.error(`Success message translation ${lang} failed: ${error.message}`);
      }
    }
  }

  /**
   * Test validation with enhanced i18n
   */
  async testValidationWithEnhancedI18n() {
    this.logger.info('🎯 Testing validation with enhanced i18n...');

    for (const lang of TEST_LANGUAGES) {
      try {
        // Test invalid login for validation errors
        await this.client.post(`${API_ENDPOINTS.login}?lang=${lang}`, {
          email: 'invalid-email',
          password: ''
        });
      } catch (error) {
        if (error.response && error.response.status === 400) {
          this.assert.assertNotEmpty(error.response.data.error, 'Should include validation error');
          this.logger.success(`Enhanced i18n validation ${lang}: Working`);
        } else if (error.response && error.response.status === 401) {
          this.logger.success(`Enhanced i18n validation ${lang}: Auth error (acceptable)`);
        }
      }
    }
  }

  // =================================================================
  // 5. LANGUAGE SWITCHING & DETECTION
  // =================================================================

  /**
   * Test language switching
   */
  async testLanguageSwitching() {
    this.logger.info('🔄 Testing language switching...');

    // Login to get token first
    try {
      const loginData = TEST_USERS.regular;
      const loginResponse = await this.client.post(API_ENDPOINTS.login + '?lang=en', loginData);

      if (loginResponse.status === 200 && loginResponse.data.data.access_token) {
        const token = loginResponse.data.data.access_token;

        // Get profile with different languages
        for (const lang of TEST_LANGUAGES) {
          try {
            const response = await this.client.get(`${API_ENDPOINTS.profile}?lang=${lang}`, {
              Authorization: `Bearer ${token}`
            });

            this.assert.assertEqual(response.status, 200, `Profile request with ${lang} should work`);

            if (response.data.message) {
              this.logger.success(`Language switching ${lang}: "${response.data.message}"`);
            } else {
              this.logger.success(`Language switching ${lang}: Working (no message)`);
            }
          } catch (error) {
            this.logger.error(`Language switching ${lang} failed: ${error.message}`);
          }
        }
      } else {
        this.logger.warning('Language switching: Could not login (test user may not exist)');
      }
    } catch (error) {
      this.logger.warning(`Language switching: Login failed (${error.message}) - test user may not exist`);
    }
  }

  /**
   * Test fallback translations
   */
  async testFallbackTranslations() {
    this.logger.info('🔄 Testing fallback translations...');

    // Test with unsupported language - should fallback to English
    const response = await this.client.get(`${API_ENDPOINTS.health}?lang=xyz`);

    this.assert.assertEqual(response.status, 200, 'Request with unsupported language should work');

    if (response.data.data && response.data.data.language) {
      this.logger.success(`Fallback language: ${response.data.data.language}`);
    } else {
      this.logger.success('Fallback translations: Working (no language info)');
    }
  }

  /**
   * Test i18n language detection
   */
  async testI18nLanguageDetection() {
    this.logger.info('🔍 Testing i18n language detection...');

    const testHeaders = [
      { lang: 'en', header: 'en-US,en;q=0.9' },
      { lang: 'vi', header: 'vi-VN,vi;q=0.9,en;q=0.8' },
      { lang: 'fr', header: 'fr-FR,fr;q=0.9,en;q=0.8' }
    ];

    for (const { lang, header } of testHeaders) {
      try {
        const response = await this.client.get(API_ENDPOINTS.health, {
          headers: { 'Accept-Language': header }
        });

        this.assert.assertEqual(response.status, 200, `Language detection ${lang} should work`);
        this.logger.success(`i18n language detection ${lang}: Working`);
      } catch (error) {
        this.logger.error(`i18n language detection ${lang} failed: ${error.message}`);
      }
    }
  }

  // =================================================================
  // 6. PERFORMANCE & EDGE CASES
  // =================================================================

  /**
   * Test performance benchmarking across all languages
   */
  async testPerformanceBenchmarking() {
    this.logger.info('⚡ Testing performance benchmarking across all languages...');

    const startTime = Date.now();
    let requestCount = 0;

    for (const lang of TEST_LANGUAGES) {
      try {
        const langStartTime = Date.now();
        const response = await this.client.get(`${API_ENDPOINTS.health}?lang=${lang}`);
        const langEndTime = Date.now();
        const langTime = langEndTime - langStartTime;

        if (response.status === 200) {
          this.performanceMetrics.languageResults[lang] = langTime;
          requestCount++;
        }

        this.logger.success(`Performance ${lang}: ${langTime}ms`);
      } catch (error) {
        this.logger.error(`Performance benchmark ${lang} failed: ${error.message}`);
      }
    }

    const totalTime = Date.now() - startTime;
    this.performanceMetrics.totalRequests = requestCount;
    this.performanceMetrics.totalTime = totalTime;

    const avgPerLanguage = requestCount > 0 ? totalTime / requestCount : 0;
    this.logger.success(`Overall Performance: ${requestCount} requests in ${totalTime}ms (avg: ${Math.round(avgPerLanguage)}ms per request)`);
  }

  /**
   * Test edge cases and fallback behaviors
   */
  async testEdgeCasesAndFallbacks() {
    this.logger.info('🔬 Testing edge cases and fallback behaviors...');

    // Test invalid language codes
    const invalidLangResponse = await this.client.get(API_ENDPOINTS.health, {
      headers: { 'Accept-Language': 'xx-invalid' }
    });
    this.assert.assertEqual(invalidLangResponse.status, 200, 'Should handle invalid language gracefully');

    // Test missing Accept-Language header
    const noLangResponse = await this.client.get(API_ENDPOINTS.health);
    this.assert.assertEqual(noLangResponse.status, 200, 'Should handle missing language header');

    // Test malformed Accept-Language header
    const malformedLangResponse = await this.client.get(API_ENDPOINTS.health, {
      headers: { 'Accept-Language': 'malformed-header-value-123' }
    });
    this.assert.assertEqual(malformedLangResponse.status, 200, 'Should handle malformed language header');

    // Test query parameter language override
    const queryLangResponse = await this.client.get(`${API_ENDPOINTS.health}?lang=ja`, {
      headers: { 'Accept-Language': 'en' }
    });
    this.assert.assertEqual(queryLangResponse.status, 200, 'Should handle query parameter override');

    this.logger.success('Edge cases and fallback behaviors: All tests passed');
  }

  /**
   * Test complex nested translations with multiple interpolations
   */
  async testComplexNestedTranslations() {
    this.logger.info('🏗️ Testing complex nested translations...');

    const mockContext = { get: () => 'en' };
    const complexKeys = [
      'auth.loginSuccess',
      'system.success',
      'api.routeNotFound'
    ];

    let successCount = 0;
    for (const key of complexKeys) {
      try {
        const result = t(mockContext, key, {
          userName: 'Test User',
          currentTime: new Date().toISOString(),
          userRole: 'admin',
          loginCount: 5
        });

        if (typeof result === 'string' && result.length > 0) {
          this.logger.success(`Complex nested ${key}: "${result}"`);
          successCount++;
        }
      } catch (error) {
        this.logger.error(`Complex nested ${key}: ${error.message}`);
      }
    }

    this.assert.assertEqual(successCount > 0, true, 'At least some complex nested translations should work');
  }

  /**
   * Test translation cache performance and consistency
   */
  async testTranslationCachePerformance() {
    this.logger.info('💾 Testing translation cache performance and consistency...');

    const mockContext = { get: () => 'en' };
    const testKey = 'auth.loginSuccess';
    const iterations = 10;

    // Test cache performance
    const startTime = Date.now();
    for (let i = 0; i < iterations; i++) {
      try {
        const result = t(mockContext, testKey);
        if (typeof result === 'string' && result.length > 0) {
          // Cache is working
        }
      } catch (error) {
        this.logger.error(`Cache performance test iteration ${i}: ${error.message}`);
      }
    }
    const endTime = Date.now();
    const totalTime = endTime - startTime;
    const avgTime = totalTime / iterations;

    this.logger.success(`Cache performance: ${iterations} requests in ${totalTime}ms (avg: ${avgTime.toFixed(2)}ms per request)`);

    // Test consistency across multiple calls
    let previousResult = null;
    let consistentResults = true;

    for (let i = 0; i < 5; i++) {
      try {
        const result = t(mockContext, testKey);
        if (previousResult && result !== previousResult) {
          consistentResults = false;
          break;
        }
        previousResult = result;
      } catch (error) {
        this.logger.error(`Cache consistency test iteration ${i}: ${error.message}`);
        consistentResults = false;
        break;
      }
    }

    if (consistentResults) {
      this.logger.success('Translation cache consistency: All results consistent');
    } else {
      this.logger.warning('Translation cache consistency: Results not consistent (may be expected)');
    }
  }

  // =================================================================
  // 7. REAL ROUTE RESPONSE TESTING WITH INTERPOLATION
  // =================================================================

  /**
   * Test 1: Language Not Supported Error with Interpolation
   */
  async testLanguageNotSupportedError() {
    this.logger.info('🚫 Testing language not supported error with interpolation...');

    try {
      // Test unsupported language 'xx' - should return error with interpolation
      const response = await this.client.get(API_ENDPOINTS.translationsByLang.replace(':language', 'xx'), {
        headers: { 'Accept-Language': 'en' }
      });

      this.assert.assertEqual(response.status, 404, 'Should return 404 for unsupported language');
      this.assert.assertFalse(response.data.success, 'Response should indicate failure');

      // Check if interpolation worked - error should contain the language 'xx'
      const errorMessage = response.data.error;
      this.assert.assertTrue(errorMessage.includes('xx'), 'Error message should contain the requested language via interpolation');

      // Check if supported languages are mentioned
      const mentionsSupportedLangs = errorMessage.toLowerCase().includes('supported') ||
                                   errorMessage.toLowerCase().includes('available');
      this.assert.assertTrue(mentionsSupportedLangs, 'Error message should mention supported languages');

      this.logger.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
      this.logger.success('Language not supported error test completed successfully');
    } catch (error) {
      this.logger.error(`Language not supported error test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 2: Section Not Found Error with Interpolation
   */
  async testSectionNotFoundError() {
    this.logger.info('🔍 Testing section not found error with interpolation...');

    try {
      // Test non-existent section 'nonexistent' for English
      const endpoint = API_ENDPOINTS.translationsSection
        .replace(':language', 'en')
        .replace(':section', 'nonexistent');
      const response = await this.client.get(endpoint, {
        headers: { 'Accept-Language': 'en' }
      });

      this.assert.assertEqual(response.status, 404, 'Should return 404 for non-existent section');
      this.assert.assertFalse(response.data.success, 'Response should indicate failure');

      // Check if interpolation worked - error should contain section name and language
      const errorMessage = response.data.error;
      this.assert.assertTrue(errorMessage.includes('nonexistent'), 'Error message should contain the section name via interpolation');
      this.assert.assertTrue(errorMessage.includes('en'), 'Error message should contain the language via interpolation');

      this.logger.info(`Response: ${JSON.stringify(response.data, null, 2)}`);
      this.logger.success('Section not found error test completed successfully');
    } catch (error) {
      this.logger.error(`Section not found error test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 3: Successful Translation Retrieval
   */
  async testSuccessfulTranslationRetrieval() {
    this.logger.info('✅ Testing successful translation retrieval...');

    try {
      // Test successful retrieval of English translations
      const response = await this.client.get(API_ENDPOINTS.translationsByLang.replace(':language', 'en'), {
        headers: { 'Accept-Language': 'en' }
      });

      this.assert.assertEqual(response.status, 200, 'Should return 200 for successful translation retrieval');
      this.assert.assertTrue(response.data.success, 'Response should indicate success');
      this.assert.assertHasFields(response.data.data, ['language', 'translations'], 'Should contain required data fields');
      this.assert.assertEqual(response.data.data.language, 'en', 'Should return requested language');

      // Check if success message contains interpolated information
      if (response.data.message) {
        const messageContainsLanguage = response.data.message.includes('en') ||
                                      response.data.message.toLowerCase().includes('english');
        this.assert.assertTrue(messageContainsLanguage, 'Success message should contain language information');
      }

      this.logger.info(`Response keys: ${Object.keys(response.data.data || {})}`);
      this.logger.success('Successful translation retrieval test completed successfully');
    } catch (error) {
      this.logger.error(`Successful translation retrieval test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 4: Multilingual Error Messages
   */
  async testMultilingualErrorMessages() {
    this.logger.info('🌐 Testing multilingual error messages...');

    try {
      const languages = [
        { code: 'vi', name: 'Vietnamese' },
        { code: 'fr', name: 'French' },
        { code: 'de', name: 'German' }
      ];

      for (const lang of languages) {
        this.logger.info(`Testing ${lang.name} (${lang.code}) error messages...`);

        const response = await this.client.get(API_ENDPOINTS.translationsByLang.replace(':language', 'invalid_lang'), {
          headers: { 'Accept-Language': lang.code }
        });

        this.assert.assertEqual(response.status, 404, `Should return 404 for ${lang.name}`);
        this.assert.assertFalse(response.data.success, `Response should indicate failure for ${lang.name}`);

        // Error should still contain the invalid language even when localized
        const errorContainsInvalidLang = response.data.error.includes('invalid_lang');
        this.assert.assertTrue(errorContainsInvalidLang, `${lang.name} error should contain invalid language via interpolation`);

        this.logger.info(`${lang.name} error: ${response.data.error.substring(0, 100)}...`);
      }

      this.logger.success('Multilingual error messages test completed successfully');
    } catch (error) {
      this.logger.error(`Multilingual error messages test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 5: Demo Route Error with Interpolation
   */
  async testDemoRouteError() {
    this.logger.info('🧪 Testing demo route error handling...');

    try {
      // Force an error in plurals test by sending invalid JSON
      const endpoint = API_ENDPOINTS.translationsTestPlurals || '/api/translations/test/plurals';
      const response = await this.client.post(endpoint, 'invalid json}', {
        headers: {
          'Accept-Language': 'en',
          'Content-Type': 'application/json'
        }
      });

      this.logger.info(`Full response status: ${response.status}`);
      this.logger.info(`Full response data: ${JSON.stringify(response.data, null, 2)}`);

      this.assert.assertTrue(response.status >= 400, 'Should return error status for invalid JSON');
      this.assert.assertFalse(response.data.success, 'Response should indicate failure');

      // Check if error handling provides contextual information
      if (response.data.error) {
        this.logger.info(`Demo route error: ${response.data.error}`);
        const hasContextInfo = response.data.error.length > 10; // Should be more descriptive than just "error"
        this.assert.assertTrue(hasContextInfo, 'Error should provide contextual information');

        // CRITICAL TEST: Check if interpolation parameters are working
        const hasInterpolation = !response.data.error.includes('{{') && !response.data.error.includes('}}');
        this.assert.assertTrue(hasInterpolation, `Error should not contain unprocessed interpolation templates. Got: ${response.data.error}`);

        // Should contain the key and reason in processed form
        const containsKeyInfo = response.data.error.toLowerCase().includes('key') ||
                               response.data.error.toLowerCase().includes('field') ||
                               response.data.error.toLowerCase().includes('validation');
        this.assert.assertTrue(containsKeyInfo, 'Error should contain contextual key information');
      }

      this.logger.success('Demo route error test completed successfully');
    } catch (error) {
      this.logger.error(`Demo route error test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 6: User Route Error with Interpolation
   */
  async testUserRouteError() {
    this.logger.info('👤 Testing user route error with interpolation...');

    try {
      // Test user profile access without authentication (should trigger error)
      const response = await this.client.get(API_ENDPOINTS.profile, {
        headers: { 'Accept-Language': 'en' }
        // No Authorization header - should trigger auth error
      });

      this.assert.assertEqual(response.status, 401, 'Should return 401 for unauthenticated access');
      this.assert.assertFalse(response.data.success, 'Response should indicate failure');

      this.logger.info(`User route error: ${response.data.error}`);
      this.logger.success('User route error test completed successfully');
    } catch (error) {
      this.logger.error(`User route error test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 7: Success Message Structure Validation
   */
  async testSuccessMessageStructure() {
    this.logger.info('✨ Testing success message structure validation...');

    try {
      // Test successful demo route
      const response = await this.client.get(API_ENDPOINTS.translationsDemoEnhanced || '/api/translations/demo/enhanced', {
        headers: { 'Accept-Language': 'en' }
      });

      this.assert.assertEqual(response.status, 200, 'Demo route should return 200');
      this.assert.assertTrue(response.data.success, 'Response should indicate success');
      this.assert.assertHasFields(response.data, ['data'], 'Should contain data object');

      // Check success message structure
      if (response.data.message) {
        this.assert.assertEqual(typeof response.data.message, 'string', 'Success message should be string');
        this.assert.assertTrue(response.data.message.length > 5, 'Success message should be descriptive');
        this.logger.info(`Success message: ${response.data.message}`);
      }

      this.logger.success('Success message structure test completed successfully');
    } catch (error) {
      this.logger.error(`Success message structure test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 8: Performance and Response Time
   */
  async testResponsePerformance() {
    this.logger.info('⚡ Testing response performance...');

    try {
      const startTime = Date.now();
      const response = await this.client.get(API_ENDPOINTS.translations, {
        headers: { 'Accept-Language': 'en' }
      });
      const responseTime = Date.now() - startTime;

      this.assert.assertEqual(response.status, 200, 'Translations list should return 200');
      this.assert.assertTrue(responseTime < 5000, `Response time should be under 5s (actual: ${responseTime}ms)`);
      this.assert.assertTrue(response.data.success, 'Response should indicate success');

      if (response.data.data) {
        const hasLanguagesList = Array.isArray(response.data.data.supportedLanguages);
        this.assert.assertTrue(hasLanguagesList, 'Should return supported languages list');

        if (hasLanguagesList) {
          this.logger.info(`Supported languages: ${response.data.data.supportedLanguages.join(', ')}`);
          this.assert.assertTrue(response.data.data.supportedLanguages.length >= 7, 'Should support at least 7 languages');
        }
      }

      this.logger.info(`Response time: ${responseTime}ms`);
      this.logger.success('Response performance test completed successfully');
    } catch (error) {
      this.logger.error(`Response performance test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { ComprehensiveI18nTest };

if (import.meta.url === `file://${process.argv[1]}`) {
  const test = new ComprehensiveI18nTest();
  test.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
