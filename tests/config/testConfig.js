/**
 * Test Configuration & Test Data
 * Centralized configuration for test environment settings and test data
*/

// Environment-specific configurations
const TEST_ENVIRONMENTS = {
  development: {
    baseUrl: 'http://localhost:8787',
    name: 'Development'
  },
  test: {
    baseUrl: 'http://localhost:8788',
    name: 'Test'
  },
  staging: {
    baseUrl: 'http://localhost:8789',
    name: 'Staging'
  }
};

// Current test environment (default to test)
const CURRENT_ENV = process.env.TEST_ENV || 'test';

// Get current configuration
const getCurrentConfig = () => {
  const config = TEST_ENVIRONMENTS[CURRENT_ENV];
  if (!config) {
    throw new Error(`Unknown test environment: ${CURRENT_ENV}`);
  }
  return config;
};

// Test Users Data
export const TEST_USERS = {
  valid: {
    email: 'test-user@example.com',
    password: 'password123'
  },
  regular: {
    email: 'test-user@example.com',
    password: 'password123'
  },
  admin: {
    email: 'test-admin@example.com',
    password: 'password123'
  },
  super_admin: {
    email: 'test-superadmin@example.com',
    password: 'password123'
  },

  invalid: {
    email: 'wrong@example.com',
    password: 'wrongpass'
  },

  invalidEmail: {
    email: 'invalid-email',
    password: 'password123'
  },

  emptyFields: {
    email: '',
    password: ''
  },

  // Extended test users
  specialChars: {
    email: 'test+special@example.com',
    password: 'pass@word#123!'
  },

  longPassword: {
    email: 'test-user@example.com',
    password: 'a'.repeat(100)
  },

  sqlInjection: {
    email: 'test-user@example.com\'; DROP TABLE users; --',
    password: 'password123'
  },

  whitespace: {
    email: '   test-user@example.com   ',
    password: '   password123   '
  },

  unicodeChars: {
    email: 'tëst@ëxämplë.com',
    password: 'pässwörd123'
  }
};

// API Endpoints
export const API_ENDPOINTS = {
  api: '/api',
  health: '/health',
  version: '/version',
  root: '/',
  language: '/language',

  // Auth endpoints
  login: '/api/auth/login',
  refreshToken: '/api/auth/refresh_token',
  logout: '/api/auth/logout',
  logoutAll: '/api/auth/logout-all',

  // User endpoints
  register: '/api/user/register',
  profile: '/api/user/profile',
  me: '/api/user/me',
  userUpload: '/api/user/upload',
  userChangePassword: '/api/user/change-password',

  // Admin endpoints
  adminDashboard: '/api/admin/dashboard',
  adminUsers: '/api/admin/users',
  adminStats: '/api/admin/stats',
  adminSettings: '/api/admin/settings',
  adminBackup: '/api/admin/backup',
  adminSystemHealth: '/api/admin/system-health',

  // KV Admin endpoints
  kvAdminConfigs: '/api/kv-admin/configs',
  kvAdminConfigsDefaults: '/api/kv-admin/configs/defaults',
  kvAdminConfigsEnvComparison: '/api/kv-admin/configs/env-comparison',
  kvAdminConfigsSpecific: '/api/kv-admin/configs/:key',
  kvAdminConfigsBatch: '/api/kv-admin/configs/batch',
  kvAdminConfigsCacheClear: '/api/kv-admin/configs/cache/clear',

  // KV Admin Audit Configuration endpoints
  kvAdminAuditConfigs: '/api/kv-admin/audit/configs',
  kvAdminAuditRetentionPolicies: '/api/kv-admin/audit/configs/retention',
  kvAdminAuditPerformanceSettings: '/api/kv-admin/audit/configs/performance',
  kvAdminAuditFeatureFlags: '/api/kv-admin/audit/configs/features',
  kvAdminAuditAlertThresholds: '/api/kv-admin/audit/configs/alerts',
  kvAdminAuditRealtimeMonitoring: '/api/kv-admin/audit/configs/realtime',
  kvAdminAuditExportSettings: '/api/kv-admin/audit/configs/export',
  kvAdminAuditAnalyticsSettings: '/api/kv-admin/audit/configs/analytics',
  kvAdminAuditSecurityIncidentConfig: '/api/kv-admin/audit/configs/security-incident',
  kvAdminAuditComplianceSettings: '/api/kv-admin/audit/configs/compliance',
  kvAdminAuditFeatureToggle: '/api/kv-admin/audit/configs/feature/:feature/toggle',

  // Translation endpoints
  translations: '/api/translations',
  translationsByLang: '/api/translations/:language',
  translationsValidate: '/api/translations/:language/validate',
  translationsSection: '/api/translations/:language/section/:section',
  translationsDemo: '/api/translations/demo',
  translationsDemoAllLanguages: '/api/translations/demo/all-languages',
  translationsDemoSpecificKeys: '/api/translations/demo/specific-keys',
  translationsTestDynamic: '/api/translations/test-dynamic',

  // Enhanced i18n demo endpoints
  translationsDemoEnhanced: '/api/translations/demo/enhanced',
  translationsDemoPlurals: '/api/translations/demo/plurals',
  translationsDemoFormatting: '/api/translations/demo/formatting',
  translationsDemoContext: '/api/translations/demo/context',
  translationsDemoCustom: '/api/translations/demo/custom',
  translationsTestPlurals: '/api/translations/test/plurals',
  translationsTestFormatting: '/api/translations/test/formatting',
  translationsTestContext: '/api/translations/test/context',
  translationsTestCustom: '/api/translations/test/custom',

  // Translation specific endpoints for validation testing
  translationsValidateSpecific: '/api/translations/ja/validate',

  // Demo endpoints
  zodDemo: '/api/zod_demo',
  zodDemoRegister: '/api/zod_demo/register',
  zodDemoSearch: '/api/zod_demo/search',
  zodDemoUpload: '/api/zod_demo/upload',

  // Audit endpoints
  auditLogs: '/api/audit/logs',
  auditSearch: '/api/audit/search',
  auditStats: '/api/audit/stats',
  auditSystemHealth: '/api/audit/system-health',
  auditExport: '/api/audit/export',
  auditActions: '/api/audit/actions',

  // Advanced Audit endpoints
  advancedAuditAnalytics: '/api/advanced-audit/analytics',
  advancedAuditArchive: '/api/advanced-audit/archive',
  advancedAuditCompliance: '/api/advanced-audit/compliance',
  advancedAuditExport: '/api/advanced-audit/export-advanced',
  advancedAuditRetention: '/api/advanced-audit/retention',

  // Advanced Audit - Analytics specific endpoints
  advancedAuditAnalyticsSecurity: '/api/advanced-audit/analytics/security',
  advancedAuditAnalyticsBehavior: '/api/advanced-audit/analytics/behavior',
  advancedAuditAnalyticsPerformance: '/api/advanced-audit/analytics/performance',

  // Advanced Audit - Compliance endpoints
  advancedAuditComplianceReport: '/api/advanced-audit/compliance/report',

  // Advanced Audit - Archival specific endpoints
  advancedAuditArchivalStats: '/api/advanced-audit/archival/stats',
  advancedAuditArchivalRun: '/api/advanced-audit/archival/run',
  advancedAuditArchivalRestore: '/api/advanced-audit/archival/restore',

  // Advanced Audit - Middleware endpoints
  advancedAuditMiddlewareStats: '/api/advanced-audit/middleware/stats',
  advancedAuditInvalidEndpoint: '/api/advanced-audit/invalid-endpoint',

  // Advanced Audit - Additional (legacy / alternate) endpoints used in certain tests
  // Note: These may represent legacy or intentionally invalid paths for negative/i18n testing
  advancedAuditSecurityAnalysis: '/api/advanced-audit/security-analysis', // (Test-only / i18n error path)
  advancedAuditComplianceReportLegacy: '/api/advanced-audit/compliance-report', // Legacy/typo form of compliance report
  advancedAuditArchivalStatsHyphen: '/api/advanced-audit/archival-stats', // Hyphen variant for error scenario

  // Real-time Monitoring endpoints
  realtimeMonitoring: '/api/realtime-monitoring',  // Base realtime monitoring endpoint
  realtimeMonitoringEvents: '/api/realtime-monitoring/events/recent',
  realtimeMonitoringDashboard: '/api/realtime-monitoring/dashboard/live',
  realtimeMonitoringAlertsConfig: '/api/realtime-monitoring/alerts/configure',
  realtimeMonitoringIncidentsCreate: '/api/realtime-monitoring/incidents/create',
  realtimeMonitoringIncidentsList: '/api/realtime-monitoring/incidents/list',
  realtimeMonitoringStart: '/api/realtime-monitoring/monitoring/start',
  realtimeMonitoringStop: '/api/realtime-monitoring/monitoring/stop',
  realtimeMonitoringStatus: '/api/realtime-monitoring/monitoring/status',
  realtimeMonitoringThreats: '/api/realtime-monitoring/monitoring/threats',
  realtimeMonitoringAnalyze: '/api/realtime-monitoring/monitoring/analyze',
  realtimeMonitoringSimulate: '/api/realtime-monitoring/monitoring/simulate',
  realtimeMonitoringAlertsStatus: '/api/realtime-monitoring/alerts/status',
  realtimeMonitoringAlertsHistory: '/api/realtime-monitoring/alerts/history',
  realtimeMonitoringAlertsSend: '/api/realtime-monitoring/alerts/send',
  realtimeMonitoringAlertsRules: '/api/realtime-monitoring/alerts/rules',
  realtimeMonitoringAlertsChannels: '/api/realtime-monitoring/alerts/channels',
  realtimeMonitoringAlertsTest: '/api/realtime-monitoring/alerts/test',
  realtimeMonitoringDashboardOverview: '/api/realtime-monitoring/dashboard/overview',
  realtimeMonitoringDashboardRealtime: '/api/realtime-monitoring/dashboard/realtime',
  realtimeMonitoringDashboardTimeline: '/api/realtime-monitoring/dashboard/timeline',
  realtimeMonitoringDashboardSecurity: '/api/realtime-monitoring/dashboard/security',
  realtimeMonitoringDashboardPerformance: '/api/realtime-monitoring/dashboard/performance',
  realtimeMonitoringDashboardExport: '/api/realtime-monitoring/dashboard/export',
  realtimeMonitoringDashboardCache: '/api/realtime-monitoring/dashboard/cache',
  realtimeMonitoringDashboardHealth: '/api/realtime-monitoring/dashboard/health',
  realtimeMonitoringThreatResolveSpecific: '/api/realtime-monitoring/monitoring/threats/123/resolve',

  // Security Incident endpoints
  securityIncidents: '/api/security-incident/incidents',  // Base security incidents endpoint
  securityIncidentGet: '/api/security-incident/incidents/:id',
  securityIncidentUpdateStatus: '/api/security-incident/incidents/:id/status',
  securityIncidentResponse: '/api/security-incident/incidents/:id/response',
  securityIncidentStatistics: '/api/security-incident/statistics',
  securityIncidentStatus: '/api/security-incident/status',
  securityIncidentSimulate: '/api/security-incident/simulate',

  // Utility endpoints
  nonExistent: '/api/non-existent',
  nonExistentEndpoint: '/api/non-existent-endpoint',
  bulkOperation: '/api/bulk-operation'
};

// Expected Response Structures
export const EXPECTED_RESPONSES = {
  health: {
    status: 200,
    hasFields: ['success', 'data'],
    dataFields: ['status', 'timestamp']
  },

  login: {
    status: 200,
    hasFields: ['success', 'data'],
    dataFields: ['access_token', 'refresh_token', 'user']
  },

  profile: {
    status: 200,
    hasFields: ['success', 'data'],
    dataFields: ['id', 'full_name', 'email', 'status', 'created_at']
  },

  translations: {
    status: 200,
    hasFields: ['success', 'data'],
    dataFields: ['supportedLanguages', 'translations', 'totalLanguages']
  },

  audit: {
    status: 200,
    hasFields: ['success', 'data'],
    dataFields: ['logs', 'pagination', 'total']
  },

  auditStats: {
    status: 200,
    hasFields: ['success', 'data'],
    dataFields: ['total_events', 'recent_activity', 'top_actions']
  },

  auditSearch: {
    status: 200,
    hasFields: ['success', 'data'],
    dataFields: ['logs', 'pagination', 'total', 'search_query']
  },

  realtimeMonitoring: {
    status: 200,
    hasFields: ['success', 'data'],
    dataFields: ['monitoring_id', 'status', 'started_at']
  },

  error: {
    hasFields: ['success', 'error'],
    errorFields: ['success', 'error']
  }
};

// Test Languages
export const TEST_LANGUAGES = ['en', 'vi', 'fr', 'es', 'de', 'ja', 'th'];

// Test Tokens for Security Testing
export const TEST_TOKENS = {
  expired: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoxLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6MTYwMDAwMDAwMX0.invalid',
  malformed: 'malformed_token',
  invalid: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.invalid.signature',
  empty: '',
  null: null
};

// Export configuration
export const TEST_CONFIG = {
  // Current environment settings
  ...getCurrentConfig(),

  // All available environments
  environments: TEST_ENVIRONMENTS,

  // Current environment name
  currentEnv: CURRENT_ENV,

  // Helper methods
  getEnvironmentUrl: (env = CURRENT_ENV) => {
    const envConfig = TEST_ENVIRONMENTS[env];
    if (!envConfig) {
      throw new Error(`Unknown environment: ${env}`);
    }
    return envConfig.baseUrl;
  },

  // Test timeouts and limits
  timeouts: {
    request: 10000,      // 10 seconds
    longRequest: 30000,  // 30 seconds
    setup: 60000         // 1 minute
  },

  // Test data settings
  testData: {
    maxRetries: 3,
    cleanupOnExit: true,
    preserveTestUsers: false
  }
};

// Named exports for specific use cases
export const { baseUrl, name: environmentName } = getCurrentConfig();
export const { timeouts, testData } = TEST_CONFIG;

// Helper function to build full URLs
export const buildUrl = (endpoint = '') => {
  const config = getCurrentConfig();
  return `${config.baseUrl}${endpoint}`;
};

// Environment check helpers
export const isTestEnvironment = () => CURRENT_ENV === 'test';
export const isDevelopmentEnvironment = () => CURRENT_ENV === 'development';
export const isStagingEnvironment = () => CURRENT_ENV === 'staging';


// Test script when run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  console.log('🔧 Current Configuration:');
  console.log('📍 Environment:', TEST_CONFIG.currentEnv);
  console.log('🌐 Base URL:', TEST_CONFIG.baseUrl);
  console.log('🏷️  Name:', TEST_CONFIG.name);
  console.log('🚀 All Environments:', Object.keys(TEST_CONFIG.environments));
  console.log('⏱️  Timeouts:', TEST_CONFIG.timeouts);

  console.log('\n👥 Test Users Available:');
  console.log('  Regular User:', TEST_USERS.regular.email);
  console.log('  Admin User:', TEST_USERS.admin.email);
  console.log('  Super Admin:', TEST_USERS.super_admin.email);

  console.log('\n🌐 API Endpoints Count:', Object.keys(API_ENDPOINTS).length);
  console.log('  Auth endpoints: 3');
  console.log('  User endpoints: 5');
  console.log('  Admin endpoints: 7');
  console.log('  Translation endpoints: 8');

  console.log('\n🌍 Test Languages:', TEST_LANGUAGES);

  console.log('\n🧪 Test buildUrl():');
  console.log('  /api ->', buildUrl(API_ENDPOINTS.api));
  console.log('  /health ->', buildUrl(API_ENDPOINTS.health));

  console.log('\n🔍 Environment Checks:');
  console.log('  isTestEnvironment():', isTestEnvironment());
  console.log('  isDevelopmentEnvironment():', isDevelopmentEnvironment());
  console.log('  isStagingEnvironment():', isStagingEnvironment());
}
