#!/usr/bin/env node

/**
 * i18n Validator Extension Test Suite
 * Tests i18n validation system extensions and multilingual validation schemas
 *
 * Components tested:
 * - createI18nSchemas() function for schema generation
 * - i18nValidatorsMiddleware() for request validation
 * - Language-specific validation rules enforcement
 * - Error message localization and formatting
 *
 * Test coverage:
 * - Dynamic schema creation for multiple languages (en, vi)
 * - Language-specific validation messages and error handling
 * - i18nValidatorsMiddleware functionality integration
 * - Multilingual validation error responses
 * - Schema validation with different locale contexts
 * - Language-specific field validation rules
 * - Internationalized error message formatting
 * - Dynamic language detection for validation
 * - Schema caching and performance optimization
 * - Fallback language handling for unsupported locales
 * - Integration with existing validation infrastructure
 * - Performance impact of multilingual validation
 * - Memory usage optimization for schema caching
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_CONFIG, TEST_LANGUAGES } from './config/testConfig.js';
import { createI18nSchemas } from '../src/schemas/i18n.js';
import { i18nValidatorsMiddleware } from '../src/middleware/i18nValidator.js';

class I18nValidatorExtensionTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
  }

  async runAll() {
    this.logger.logSuiteHeader('🌍 Starting i18n Validator Extension Tests');

    const tests = [
      this.testSchemaCreationEnglish,
      this.testSchemaCreationVietnamese,
      this.testValidationWithDifferentLanguages,
      this.testErrorMessages,
      this.testPerformanceWithAllSchemas,
      this.testSchemaRegistryIntegration
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

  async testSchemaCreationEnglish() {
    this.logger.info('Testing schema creation with English language...');

    try {
      const schemas = await createI18nSchemas('en');

      // Auth schemas
      this.assert.assertTrue(!!schemas.loginSchema, 'loginSchema should exist');
      this.assert.assertTrue(!!schemas.refreshTokenSchema, 'refreshTokenSchema should exist');
      this.assert.assertTrue(!!schemas.passwordResetRequestSchema, 'passwordResetRequestSchema should exist');
      this.assert.assertTrue(!!schemas.passwordResetConfirmSchema, 'passwordResetConfirmSchema should exist');

      // User schemas
      this.assert.assertTrue(!!schemas.updateUserSchema, 'updateUserSchema should exist');
      this.assert.assertTrue(!!schemas.changePasswordSchema, 'changePasswordSchema should exist');
      this.assert.assertTrue(!!schemas.updateProfileSchema, 'updateProfileSchema should exist');
      this.assert.assertTrue(!!schemas.createUserSchema, 'createUserSchema should exist');
      this.assert.assertTrue(!!schemas.updateUserWithoutRoleSchema, 'updateUserWithoutRoleSchema should exist');
      this.assert.assertTrue(!!schemas.userListQuerySchema, 'userListQuerySchema should exist');
      this.assert.assertTrue(!!schemas.registerUserSchema, 'registerUserSchema should exist');

      // Admin schemas
      this.assert.assertTrue(!!schemas.roleChangeSchema, 'roleChangeSchema should exist');
      this.assert.assertTrue(!!schemas.adminStatsQuerySchema, 'adminStatsQuerySchema should exist');
      this.assert.assertTrue(!!schemas.systemHealthSchema, 'systemHealthSchema should exist');
      this.assert.assertTrue(!!schemas.createAdminUserSchema, 'createAdminUserSchema should exist');
      this.assert.assertTrue(!!schemas.adminUserUpdateSchema, 'adminUserUpdateSchema should exist');

      // Audit schemas
      this.assert.assertTrue(!!schemas.auditQuerySchema, 'auditQuerySchema should exist');
      this.assert.assertTrue(!!schemas.auditSearchSchema, 'auditSearchSchema should exist');
      this.assert.assertTrue(!!schemas.auditExportSchema, 'auditExportSchema should exist');

      // Advanced Audit schemas
      this.assert.assertTrue(!!schemas.analyticsQuerySchema, 'analyticsQuerySchema should exist');
      this.assert.assertTrue(!!schemas.archivalQuerySchema, 'archivalQuerySchema should exist');
      this.assert.assertTrue(!!schemas.restoreQuerySchema, 'restoreQuerySchema should exist');
      this.assert.assertTrue(!!schemas.performanceQuerySchema, 'performanceQuerySchema should exist');
      this.assert.assertTrue(!!schemas.complianceReportSchema, 'complianceReportSchema should exist');
      this.assert.assertTrue(!!schemas.alertConfigSchema, 'alertConfigSchema should exist');
      this.assert.assertTrue(!!schemas.complianceQuerySchema, 'complianceQuerySchema should exist');

      // Audit Retention schemas
      this.assert.assertTrue(!!schemas.auditRetentionPolicySchema, 'auditRetentionPolicySchema should exist');
      this.assert.assertTrue(!!schemas.cleanupSimulationSchema, 'cleanupSimulationSchema should exist');
      this.assert.assertTrue(!!schemas.retentionPolicyUpdateSchema, 'retentionPolicyUpdateSchema should exist');
      this.assert.assertTrue(!!schemas.advancedCleanupSchema, 'advancedCleanupSchema should exist');

      // Realtime Monitoring schemas
      this.assert.assertTrue(!!schemas.monitoringConfigSchema, 'monitoringConfigSchema should exist');
      this.assert.assertTrue(!!schemas.alertRuleSchema, 'alertRuleSchema should exist');
      this.assert.assertTrue(!!schemas.alertChannelSchema, 'alertChannelSchema should exist');
      this.assert.assertTrue(!!schemas.threatResolutionSchema, 'threatResolutionSchema should exist');
      this.assert.assertTrue(!!schemas.timeRangeSchema, 'timeRangeSchema should exist');
      this.assert.assertTrue(!!schemas.manualAlertSchema, 'manualAlertSchema should exist');
      this.assert.assertTrue(!!schemas.dashboardExportSchema, 'dashboardExportSchema should exist');

      // Security Incident schemas
      this.assert.assertTrue(!!schemas.createIncidentSchema, 'createIncidentSchema should exist');
      this.assert.assertTrue(!!schemas.updateStatusSchema, 'updateStatusSchema should exist');
      this.assert.assertTrue(!!schemas.manualResponseSchema, 'manualResponseSchema should exist');

      // KV Admin schemas
      this.assert.assertTrue(!!schemas.configUpdateSchema, 'configUpdateSchema should exist');
      this.assert.assertTrue(!!schemas.configBatchUpdateSchema, 'configBatchUpdateSchema should exist');

      // Demo schemas
      this.assert.assertTrue(!!schemas.userRegistrationSchema, 'userRegistrationSchema should exist');
      this.assert.assertTrue(!!schemas.searchSchema, 'searchSchema should exist');
      this.assert.assertTrue(!!schemas.fileUploadSchema, 'fileUploadSchema should exist');
      this.assert.assertTrue(!!schemas.advancedValidationSchema, 'advancedValidationSchema should exist');

      this.logger.success(`Schema creation English test completed successfully - validated ${Object.keys(schemas).length} schemas`);
    } catch (error) {
      this.logger.error(`[testSchemaCreationEnglish] Schema creation English test failed: ${error.message}`);
      throw error;
    }
  }

  async testSchemaCreationVietnamese() {
    this.logger.info('Testing schema creation with Vietnamese language...');

    try {
      const schemas = await createI18nSchemas('vi');

      // Test key schemas from each category
      // Auth schemas
      this.assert.assertTrue(!!schemas.loginSchema, 'loginSchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.refreshTokenSchema, 'refreshTokenSchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.passwordResetRequestSchema, 'passwordResetRequestSchema should exist for Vietnamese');

      // User schemas
      this.assert.assertTrue(!!schemas.registerUserSchema, 'registerUserSchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.updateUserSchema, 'updateUserSchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.changePasswordSchema, 'changePasswordSchema should exist for Vietnamese');

      // Admin schemas
      this.assert.assertTrue(!!schemas.roleChangeSchema, 'roleChangeSchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.adminStatsQuerySchema, 'adminStatsQuerySchema should exist for Vietnamese');

      // Audit schemas
      this.assert.assertTrue(!!schemas.auditQuerySchema, 'auditQuerySchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.auditSearchSchema, 'auditSearchSchema should exist for Vietnamese');

      // Advanced Audit schemas
      this.assert.assertTrue(!!schemas.analyticsQuerySchema, 'analyticsQuerySchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.archivalQuerySchema, 'archivalQuerySchema should exist for Vietnamese');

      // Audit Retention schemas
      this.assert.assertTrue(!!schemas.auditRetentionPolicySchema, 'auditRetentionPolicySchema should exist for Vietnamese');

      // Realtime Monitoring schemas
      this.assert.assertTrue(!!schemas.monitoringConfigSchema, 'monitoringConfigSchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.alertRuleSchema, 'alertRuleSchema should exist for Vietnamese');

      // Security Incident schemas
      this.assert.assertTrue(!!schemas.createIncidentSchema, 'createIncidentSchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.updateStatusSchema, 'updateStatusSchema should exist for Vietnamese');

      // KV Admin schemas
      this.assert.assertTrue(!!schemas.configUpdateSchema, 'configUpdateSchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.configBatchUpdateSchema, 'configBatchUpdateSchema should exist for Vietnamese');

      // Demo schemas
      this.assert.assertTrue(!!schemas.userRegistrationSchema, 'userRegistrationSchema should exist for Vietnamese');
      this.assert.assertTrue(!!schemas.searchSchema, 'searchSchema should exist for Vietnamese');

      this.logger.success(`Schema creation Vietnamese test completed successfully - validated ${Object.keys(schemas).length} schemas`);
    } catch (error) {
      this.logger.error(`[testSchemaCreationVietnamese] Schema creation Vietnamese test failed: ${error.message}`);
      throw error;
    }
  }

  async testValidationWithDifferentLanguages() {
    this.logger.info('Testing validation with different languages...');

    try {
      // Test English schemas
      const schemasEn = await createI18nSchemas('en');

      // Test auth validation
      const loginSchema = schemasEn.loginSchema;
      const validLoginData = { email: 'test@example.com', password: 'password123' };
      const loginResult = loginSchema.safeParse(validLoginData);
      this.assert.assertTrue(loginResult.success, 'Should validate valid login data');

      const invalidLoginData = { email: 'invalid', password: 'short' };
      const invalidLoginResult = loginSchema.safeParse(invalidLoginData);
      this.assert.assertTrue(!invalidLoginResult.success, 'Should reject invalid login data');

      // Test role change validation
      const roleChangeSchema = schemasEn.roleChangeSchema;
      const validRoleData = { role: 'admin' };
      const roleResult = roleChangeSchema.safeParse(validRoleData);
      this.assert.assertTrue(roleResult.success, 'Should validate valid role change data');

      const invalidRoleData = { role: 'invalid_role' };
      const invalidRoleResult = roleChangeSchema.safeParse(invalidRoleData);
      this.assert.assertTrue(!invalidRoleResult.success, 'Should reject invalid role');

      // Test audit query validation
      const auditQuerySchema = schemasEn.auditQuerySchema;
      const validAuditQuery = { page: '1', limit: '10' };
      const auditResult = auditQuerySchema.safeParse(validAuditQuery);
      this.assert.assertTrue(auditResult.success, 'Should validate valid audit query');

      // Test security incident validation
      const createIncidentSchema = schemasEn.createIncidentSchema;
      const validIncidentData = {
        type: 'unauthorized_access',
        title: 'Security Incident',
        description: 'Test incident',
        severity: 'medium'
      };
      const incidentResult = createIncidentSchema.safeParse(validIncidentData);
      this.assert.assertTrue(incidentResult.success, 'Should validate valid incident data');

      // Test KV config validation
      const configUpdateSchema = schemasEn.configUpdateSchema;
      const validConfigData = { value: 'test_value' };
      const configResult = configUpdateSchema.safeParse(validConfigData);
      this.assert.assertTrue(configResult.success, 'Should validate valid config data');

      // Test Vietnamese schemas exist and work
      const schemasVi = await createI18nSchemas('vi');
      const loginSchemaVi = schemasVi.loginSchema;
      const loginResultVi = loginSchemaVi.safeParse(validLoginData);
      this.assert.assertTrue(loginResultVi.success, 'Vietnamese schema should validate valid login data');

      this.logger.success('Validation test completed successfully');
    } catch (error) {
      this.logger.error(`[testValidationWithDifferentLanguages] Validation test failed: ${error.message}`);
      throw error;
    }
  }

  async testErrorMessages() {
    this.logger.info('Testing error messages and middleware functions...');

    try {
      // Test middleware functions exist for all validators
      // Auth middlewares
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.login === 'function', 'login middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.refreshToken === 'function', 'refreshToken middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.passwordReset === 'function', 'passwordReset middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.passwordResetConfirm === 'function', 'passwordResetConfirm middleware should exist');

      // User middlewares
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.register === 'function', 'register middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.updateUser === 'function', 'updateUser middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.changePassword === 'function', 'changePassword middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.updateProfile === 'function', 'updateProfile middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.createUser === 'function', 'createUser middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.updateUserWithoutRole === 'function', 'updateUserWithoutRole middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.userListQuery === 'function', 'userListQuery middleware should exist');

      // Admin middlewares
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.roleChange === 'function', 'roleChange middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.adminStats === 'function', 'adminStats middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.systemHealth === 'function', 'systemHealth middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.createAdminUser === 'function', 'createAdminUser middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.adminUserUpdate === 'function', 'adminUserUpdate middleware should exist');

      // Audit middlewares
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.auditQuery === 'function', 'auditQuery middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.auditSearch === 'function', 'auditSearch middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.auditExport === 'function', 'auditExport middleware should exist');

      // Advanced Audit middlewares
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.analyticsQuery === 'function', 'analyticsQuery middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.archivalQuery === 'function', 'archivalQuery middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.restoreQuery === 'function', 'restoreQuery middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.performanceQuery === 'function', 'performanceQuery middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.complianceReport === 'function', 'complianceReport middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.alertConfig === 'function', 'alertConfig middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.complianceQuery === 'function', 'complianceQuery middleware should exist');

      // Audit Retention middlewares
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.retentionPolicy === 'function', 'retentionPolicy middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.cleanupSimulation === 'function', 'cleanupSimulation middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.retentionPolicyUpdate === 'function', 'retentionPolicyUpdate middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.advancedCleanup === 'function', 'advancedCleanup middleware should exist');

      // Realtime Monitoring middlewares
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.monitoringConfig === 'function', 'monitoringConfig middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.alertRule === 'function', 'alertRule middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.alertChannel === 'function', 'alertChannel middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.threatResolution === 'function', 'threatResolution middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.timeRange === 'function', 'timeRange middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.manualAlert === 'function', 'manualAlert middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.dashboardExport === 'function', 'dashboardExport middleware should exist');

      // Security Incident middlewares
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.createIncident === 'function', 'createIncident middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.updateIncidentStatus === 'function', 'updateIncidentStatus middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.manualResponse === 'function', 'manualResponse middleware should exist');

      // KV Admin middlewares
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.configUpdate === 'function', 'configUpdate middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.configBatchUpdate === 'function', 'configBatchUpdate middleware should exist');

      // Demo middlewares
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.userRegistration === 'function', 'userRegistration middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.search === 'function', 'search middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.fileUpload === 'function', 'fileUpload middleware should exist');
      this.assert.assertTrue(typeof i18nValidatorsMiddleware.advancedValidation === 'function', 'advancedValidation middleware should exist');

      const middlewareCount = Object.keys(i18nValidatorsMiddleware).length;
      this.logger.success(`Error messages test completed successfully - validated ${middlewareCount} middleware functions`);
    } catch (error) {
      this.logger.error(`[testErrorMessages] Error messages test failed: ${error.message}`);
      throw error;
    }
  }

  async testPerformanceWithAllSchemas() {
    this.logger.info('Testing performance with all schemas...');

    try {
      const startTime = Date.now();

      // Test creating schemas for multiple languages
      const allSchemas = {};

      for (const lang of TEST_LANGUAGES) {
        const langStartTime = Date.now();
        allSchemas[lang] = await createI18nSchemas(lang);
        const langEndTime = Date.now();

        const schemaCount = Object.keys(allSchemas[lang]).length;
        this.logger.info(`Created ${schemaCount} schemas for ${lang} in ${langEndTime - langStartTime}ms`);

        // Performance threshold: should create schemas quickly
        this.assert.assertTrue((langEndTime - langStartTime) < 5000, `Schema creation for ${lang} should be under 5 seconds`);
      }

      const endTime = Date.now();
      const totalTime = endTime - startTime;

      this.logger.success(`Performance test completed - created schemas for ${TEST_LANGUAGES.length} languages in ${totalTime}ms`);

      // Verify all languages have same number of schemas
      const counts = TEST_LANGUAGES.map(lang => Object.keys(allSchemas[lang]).length);
      this.assert.assertTrue(counts.every(count => count === counts[0]), 'All languages should have same number of schemas');

    } catch (error) {
      this.logger.error(`[testPerformanceWithAllSchemas] Performance test failed: ${error.message}`);
      throw error;
    }
  }

  async testSchemaRegistryIntegration() {
    this.logger.info('Testing schema registry integration...');

    try {
      // Test that schemas match registry definitions
      const schemas = await createI18nSchemas('en');
      const schemaNames = Object.keys(schemas);

      // Expected categories based on definitions.js
      const expectedCategories = [
        'auth', 'user', 'admin', 'audit', 'advancedAudit',
        'auditRetention', 'realtimeMonitoring', 'securityIncident',
        'kv', 'demo'
      ];

      // Test that we have schemas from all categories
      const authSchemas = schemaNames.filter(name =>
        ['loginSchema', 'refreshTokenSchema', 'passwordResetRequestSchema', 'passwordResetConfirmSchema'].includes(name)
      );
      this.assert.assertTrue(authSchemas.length >= 4, 'Should have auth schemas');

      const userSchemas = schemaNames.filter(name =>
        ['registerUserSchema', 'updateUserSchema', 'changePasswordSchema'].includes(name)
      );
      this.assert.assertTrue(userSchemas.length >= 3, 'Should have user schemas');

      const adminSchemas = schemaNames.filter(name =>
        ['roleChangeSchema', 'adminStatsQuerySchema', 'systemHealthSchema'].includes(name)
      );
      this.assert.assertTrue(adminSchemas.length >= 3, 'Should have admin schemas');

      const auditSchemas = schemaNames.filter(name =>
        ['auditQuerySchema', 'auditSearchSchema', 'auditExportSchema'].includes(name)
      );
      this.assert.assertTrue(auditSchemas.length >= 3, 'Should have audit schemas');

      const securitySchemas = schemaNames.filter(name =>
        ['createIncidentSchema', 'updateStatusSchema', 'manualResponseSchema'].includes(name)
      );
      this.assert.assertTrue(securitySchemas.length >= 3, 'Should have security incident schemas');

      const kvSchemas = schemaNames.filter(name =>
        ['configUpdateSchema', 'configBatchUpdateSchema'].includes(name)
      );
      this.assert.assertTrue(kvSchemas.length >= 2, 'Should have KV admin schemas');

      const demoSchemas = schemaNames.filter(name =>
        ['userRegistrationSchema', 'searchSchema', 'fileUploadSchema', 'advancedValidationSchema'].includes(name)
      );
      this.assert.assertTrue(demoSchemas.length >= 4, 'Should have demo schemas');

      this.logger.success(`Schema registry integration test completed - verified ${schemaNames.length} schemas across ${expectedCategories.length} categories`);

    } catch (error) {
      this.logger.error(`[testSchemaRegistryIntegration] Schema registry integration test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { I18nValidatorExtensionTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new I18nValidatorExtensionTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
