#!/usr/bin/env node

/**
 * Audit endpoint performance smoke checks against an explicitly prepared API.
 * Measures bounded queries, CSV exports, and small concurrent request batches.
 * These checks do not seed a large dataset or measure Worker memory, distributed
 * load balancing, sustained load capacity, or cache effectiveness.
 */

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG, TEST_LANGUAGES } from './config/testConfig.js';

class AuditPerformanceTest {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    // Measure first attempts so retries cannot hide endpoint failures or latency.
    this.client.defaultOptions.retries = 0;
    this.responseTimeLimitMs = 2000;
    this.batchTimeLimitMs = 10000;
    this.assert = TestAssertions;

    // Test-specific properties
    this.tokens = {};
    this.performanceMetrics = {
      auditLogQuery: [],
      auditSearch: [],
      auditExport: [],
      concurrentLogging: [],
      realtimeMonitoring: []
    };
  }

  /**
   * Run all performance tests
   */
  async runAll() {
    this.logger.logSuiteHeader('⚡ Starting Audit Performance Tests');

    this.logger.info('Initializing test environment...');
    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testAuditLogQueryPerformance,
      this.testConcurrentAuditLogging,
      this.testAuditSearchPerformance,
      this.testAuditExportPerformance,
      this.testAuditAnalyticsPerformance,
      this.testAuditArchivalPerformance,
      this.testRealtimeMonitoringPerformance,
      this.testSecurityIncidentPerformance,
      this.testAuditPageSizeSmoke,
      this.testAuditQuerySmoke,
      this.testAuditResponseTimes,
      this.testAuditThroughput,
      this.testAuditConcurrentSmoke,
      this.testAuditMixedEndpointSmoke,
      this.testI18nErrorMessagesAuditAccess,
      this.testI18nErrorMessagesAuditSearch,
      this.testI18nErrorMessagesAuditExport
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

    this.generatePerformanceReport();
    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      process.exit(1);
    }
  }

  /**
   * Setup authentication tokens
   */
  async setupAuthentication() {
    try {
      this.logger.info('Setting up authentication...');

      // Get admin token
      const adminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);

      if (adminLogin.success && adminLogin.data.data.access_token) {
        this.tokens.admin = adminLogin.data.data.access_token;
        this.logger.info('Admin token acquired');
      } else {
        throw new Error('Failed to get admin token');
      }

      const superAdminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);
      this.assert.assertEqual(superAdminLogin.status, 200, 'Super admin setup login should succeed');
      this.assert.assertNotEmpty(superAdminLogin.data.data?.access_token, 'super admin access token');
      this.tokens.superAdmin = superAdminLogin.data.data.access_token;
    } catch (error) {
      this.logger.error(`[setupAuthentication] Auth token setup failed: ${error.message}`);
      throw error;
    }
  }

  assertPerformance(response, responseTime, context, limitMs = this.responseTimeLimitMs) {
    this.assert.assertEqual(response.status, 200, `${context} should succeed on its first attempt`);
    this.assert.assertSuccess(response, context);
    this.assert.assertTrue(responseTime < limitMs, `${context} should finish under ${limitMs}ms (${responseTime}ms)`);
  }

  async testAuditLogQueryPerformance() {
    this.logger.info('Testing audit log query performance...');

    try {
      const iterations = 10;
      const limits = [10, 50, 100];

      for (const limit of limits) {
        const times = [];

        for (let i = 0; i < iterations; i++) {
          const startTime = Date.now();

          const url = `${API_ENDPOINTS.auditLogs}?limit=${limit}&page=1`;
          const response = await this.client.get(url, {
            Authorization: `Bearer ${this.tokens.admin}`
          });

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          this.assertPerformance(response, responseTime, `Query limit ${limit}`);
          times.push(responseTime);
        }

        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const maxTime = Math.max(...times);
        const minTime = Math.min(...times);

        this.performanceMetrics.auditLogQuery.push({
          limit,
          avgTime,
          maxTime,
          minTime,
          iterations
        });

        this.logger.info(`Limit ${limit}: Avg ${avgTime.toFixed(1)}ms, Max ${maxTime}ms, Min ${minTime}ms`);
      }

      this.logger.success('Audit log query performance test completed');
    } catch (error) {
      this.logger.error(`[testAuditLogQueryPerformance] Audit log query performance test failed: ${error.message}`);
      throw error;
    }
  }

  async testAuditSearchPerformance() {
    this.logger.info('Testing audit search performance...');

    try {
      const searchQueries = [
        'LOGIN',
        'SUCCESS',
        'admin',
        'USER_CREATE',
        'failed'
      ];

      for (const query of searchQueries) {
        const times = [];
        const iterations = 5;

        for (let i = 0; i < iterations; i++) {
          const startTime = Date.now();

          const url = `${API_ENDPOINTS.auditSearch}?query=${encodeURIComponent(query)}&limit=50`;
          const response = await this.client.get(url, {
            Authorization: `Bearer ${this.tokens.admin}`
          });

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          this.assertPerformance(response, responseTime, `Search query ${query}`);
          times.push(responseTime);
        }

        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        const maxTime = Math.max(...times);

        this.performanceMetrics.auditSearch.push({
          query,
          avgTime,
          maxTime,
          iterations
        });

        this.logger.info(`Query "${query}": Avg ${avgTime.toFixed(1)}ms, Max ${maxTime}ms`);
      }

      this.logger.success('Audit search performance test completed');
    } catch (error) {
      this.logger.error(`[testAuditSearchPerformance] Audit search performance test failed: ${error.message}`);
      throw error;
    }
  }

  async testAuditExportPerformance() {
    this.logger.info('Testing audit export performance...');

    try {
      const exportSizes = [10, 50, 100];

      for (const size of exportSizes) {
        const startTime = Date.now();

        // Use GET request with query parameters and super_admin token
        const url = `${API_ENDPOINTS.auditExport}?format=csv&limit=${size}`;
        const response = await this.client.get(url, {
          Authorization: `Bearer ${this.tokens.superAdmin}` // Export requires super_admin role
        });

        const endTime = Date.now();
        const responseTime = endTime - startTime;

        this.assertPerformance(response, responseTime, `CSV export limit ${size}`, this.batchTimeLimitMs);
        this.assert.assertTrue(response.headers['content-type']?.includes('text/csv'), 'CSV export should identify its format');
        this.assert.assertType(response.data, 'string', 'CSV export should deliver text');

        this.performanceMetrics.auditExport.push({
          size,
          responseTime
        });

        this.logger.info(`Export ${size} records: ${responseTime}ms`);
      }

      this.logger.success('Audit export performance test completed');
    } catch (error) {
      this.logger.error(`[testAuditExportPerformance] Audit export performance test failed: ${error.message}`);
      throw error;
    }
  }

  async testConcurrentAuditLogging() {
    this.logger.info('Testing concurrent audit logging...');

    try {
      // Small concurrent login smoke batches; no sustained-load claim.
      const concurrencyLevels = [2, 5, 10];

      for (const concurrency of concurrencyLevels) {
        const startTime = Date.now();
        const promises = [];

        // Create concurrent login requests (which create audit logs)
        for (let i = 0; i < concurrency; i++) {
          const promise = this.client.post(API_ENDPOINTS.login, TEST_USERS.admin);
          promises.push(promise);
        }

        const results = await Promise.allSettled(promises);
        const endTime = Date.now();
        const totalTime = endTime - startTime;

        const successCount = results.filter(r =>
          r.status === 'fulfilled' && r.value.status === 200
        ).length;

        const successRate = (successCount / concurrency) * 100;

        this.performanceMetrics.concurrentLogging.push({
          concurrency,
          totalTime,
          successCount,
          successRate
        });

        this.logger.info(`${concurrency} concurrent: ${totalTime}ms, ${successCount}/${concurrency} success (${successRate.toFixed(1)}%)`);

        // Assert minimum success rate
        this.assert.assertEqual(successCount, concurrency, 'Every concurrent login smoke request should succeed');
        this.assert.assertTrue(totalTime < this.batchTimeLimitMs, 'Concurrent login smoke should finish within the batch budget');
      }

      this.logger.success('Concurrent audit logging test completed');
    } catch (error) {
      this.logger.error(`[testConcurrentAuditLogging] Concurrent audit logging test failed: ${error.message}`);
      throw error;
    }
  }

  async testRealtimeMonitoringPerformance() {
    this.logger.info('Testing real-time monitoring performance...');

    try {
      // Test monitoring status response time
      const startTime = Date.now();
      const response = await this.client.get(API_ENDPOINTS.realtimeMonitoringStatus, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.performanceMetrics.realtimeMonitoring.push({
        endpoint: 'status',
        responseTime,
        status: response.status
      });

      this.logger.info(`Monitoring status: ${responseTime}ms (status: ${response.status})`);

      this.assertPerformance(response, responseTime, 'Monitoring status');
      const dashStartTime = Date.now();
      const dashResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardOverview, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });
      const dashResponseTime = Date.now() - dashStartTime;
      this.assertPerformance(dashResponse, dashResponseTime, 'Dashboard overview');
      this.performanceMetrics.realtimeMonitoring.push({
        endpoint: 'dashboard',
        responseTime: dashResponseTime,
        status: dashResponse.status
      });
      this.logger.info(`Dashboard overview: ${dashResponseTime}ms (status: ${dashResponse.status})`);

      this.logger.success('Real-time monitoring performance test completed');
    } catch (error) {
      this.logger.error(`[testRealtimeMonitoringPerformance] ${error.message}`);
      throw error;
    }
  }

  async testAuditPageSizeSmoke() {
    this.logger.info('Testing supported audit page sizes with existing records...');
    for (const limit of [10, 50, 100]) {
      const startTime = Date.now();
      const response = await this.client.get(`${API_ENDPOINTS.auditLogs}?limit=${limit}`, {
        Authorization: `Bearer ${this.tokens.admin}`
      });
      const responseTime = Date.now() - startTime;
      this.assertPerformance(response, responseTime, `Audit page size ${limit}`);
      const logs = response.data.data?.logs;
      this.assert.assertTrue(Array.isArray(logs), 'Audit page should contain a logs array');
      this.assert.assertTrue(logs.length <= limit, 'Returned records should respect the requested page size');
      this.logger.info(`Page limit ${limit}: ${responseTime}ms, got ${logs.length} records`);
    }
  }

  async testAuditAnalyticsPerformance() {
    this.logger.info('Testing audit analytics performance...');

    try {
      const startTime = Date.now();
      const response = await this.client.get(API_ENDPOINTS.advancedAuditAnalytics, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.assertPerformance(response, responseTime, 'Analytics');
      this.logger.info(`Analytics response time: ${responseTime}ms`);
      this.logger.success('Audit analytics performance test completed');
    } catch (error) {
      this.logger.error(`[testAuditAnalyticsPerformance] Audit analytics performance test failed: ${error.message}`);
      throw error;
    }
  }

  async testAuditArchivalPerformance() {
    this.logger.info('Testing audit archival performance...');

    try {
      const startTime = Date.now();
      const response = await this.client.post(API_ENDPOINTS.advancedAuditArchivalRun, {
        dryRun: true,
        batchSize: 100
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.assertPerformance(response, responseTime, 'Archival dry run', this.batchTimeLimitMs);
      this.logger.info(`Archival dry run response time: ${responseTime}ms`);
      this.logger.success('Audit archival performance test completed');
    } catch (error) {
      this.logger.error(`[testAuditArchivalPerformance] Audit archival performance test failed: ${error.message}`);
      throw error;
    }
  }

  async testSecurityIncidentPerformance() {
    this.logger.info('Testing security incident performance...');

    try {
      const startTime = Date.now();
      const response = await this.client.get(API_ENDPOINTS.securityIncidents, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.assertPerformance(response, responseTime, 'Security incident list');
      this.logger.info(`Security incident list response time: ${responseTime}ms`);
      this.logger.success('Security incident performance test completed');
    } catch (error) {
      this.logger.error(`[testSecurityIncidentPerformance] ${error.message}`);
      throw error;
    }
  }

  async testAuditQuerySmoke() {
    this.logger.info('Testing audit query smoke latency...');

    try {
      // These requests measure HTTP latency, not Worker memory usage.
      const largeQueries = [
        `${API_ENDPOINTS.auditLogs}?limit=100`,
        `${API_ENDPOINTS.auditSearch}?query=*&limit=100`,
        `${API_ENDPOINTS.auditStats}?detailed=true`
      ];

      for (const query of largeQueries) {
        const startTime = Date.now();
        const response = await this.client.get(query, {
          Authorization: `Bearer ${this.tokens.admin}`
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        this.assertPerformance(response, responseTime, `Query ${query}`);
        this.logger.info(`Query "${query.split('?')[0]}": ${responseTime}ms`);
      }

      this.logger.success('Audit query smoke completed');
    } catch (error) {
      this.logger.error(`[testAuditQuerySmoke] Audit query smoke failed: ${error.message}`);
      throw error;
    }
  }

  async testAuditResponseTimes() {
    this.logger.info('Testing audit response times...');

    try {
      const endpoints = [
        { name: 'Audit Logs', url: API_ENDPOINTS.auditLogs },
        { name: 'Audit Stats', url: API_ENDPOINTS.auditStats },
        { name: 'Audit Search', url: `${API_ENDPOINTS.auditSearch}?query=test&limit=10` }
      ];

      for (const endpoint of endpoints) {
        const times = [];
        const iterations = 5;

        for (let i = 0; i < iterations; i++) {
          const startTime = Date.now();
          const response = await this.client.get(endpoint.url, {
            Authorization: `Bearer ${this.tokens.admin}`
          });
          const endTime = Date.now();
          this.assertPerformance(response, endTime - startTime, endpoint.name);
          times.push(endTime - startTime);
        }

        const avgTime = times.reduce((sum, time) => sum + time, 0) / times.length;
        this.logger.info(`${endpoint.name}: ${avgTime.toFixed(1)}ms average`);
      }

      this.logger.success('Audit response times test completed');
    } catch (error) {
      this.logger.error(`[testAuditResponseTimes] Audit response times test failed: ${error.message}`);
      throw error;
    }
  }

  async testAuditThroughput() {
    this.logger.info('Testing audit throughput...');

    try {
      const requestsPerSecond = 10;
      const duration = 3; // seconds
      const totalRequests = requestsPerSecond * duration;

      const startTime = Date.now();
      const promises = [];

      for (let i = 0; i < totalRequests; i++) {
        const promise = this.client.get(API_ENDPOINTS.auditLogs + '?limit=10', {
          Authorization: `Bearer ${this.tokens.admin}`
        });
        promises.push(promise);

        // Add small delay between requests
        if (i < totalRequests - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 / requestsPerSecond));
        }
      }

      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successCount = results.filter(r =>
        r.status === 'fulfilled' && r.value.status === 200
      ).length;

      const throughput = (successCount * 1000 / Math.max(totalTime, 1)).toFixed(2);
      this.assert.assertEqual(successCount, totalRequests, 'Every paced throughput smoke request should succeed');
      this.assert.assertTrue(totalTime < duration * 1000 + this.responseTimeLimitMs,
        'Paced smoke should complete within the send window plus one response budget');

      this.logger.info(`Throughput: ${throughput} requests/second (${successCount}/${totalRequests} successful)`);
      this.logger.success('Audit throughput test completed');
    } catch (error) {
      this.logger.error(`[testAuditThroughput] Audit throughput test failed: ${error.message}`);
      throw error;
    }
  }

  async testAuditConcurrentSmoke() {
    this.logger.info('Testing five concurrent audit requests (smoke)...');
    const concurrentRequests = 5;
    const startTime = Date.now();
    const promises = Array.from({ length: concurrentRequests }, () =>
      this.client.get(API_ENDPOINTS.auditLogs + '?limit=20', {
        Authorization: `Bearer ${this.tokens.admin}`
      })
    );
    const results = await Promise.allSettled(promises);
    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
    this.logger.info(`Concurrent smoke: ${successCount}/${concurrentRequests} succeeded in ${totalTime}ms`);
    this.assert.assertEqual(successCount, concurrentRequests, 'Every concurrent audit smoke request should succeed');
    this.assert.assertTrue(totalTime < this.batchTimeLimitMs, 'Concurrent audit smoke should finish within the batch budget');
  }

  async testAuditMixedEndpointSmoke() {
    this.logger.info('Testing mixed audit endpoints concurrently (smoke)...');
    const endpoints = [
      API_ENDPOINTS.auditLogs + '?limit=10',
      API_ENDPOINTS.auditStats,
      API_ENDPOINTS.auditSearch + '?query=test&limit=5'
    ];
    const requestCount = 10;
    const startTime = Date.now();
    const promises = Array.from({ length: requestCount }, (_, i) =>
      this.client.get(endpoints[i % endpoints.length], {
        Authorization: `Bearer ${this.tokens.admin}`
      }, { timeoutMs: this.responseTimeLimitMs, retries: 0 })
    );
    const results = await Promise.allSettled(promises);
    const totalTime = Date.now() - startTime;
    const successCount = results.filter(r => r.status === 'fulfilled' && r.value.status === 200).length;
    this.logger.info(`Mixed endpoint smoke: ${successCount}/${requestCount} succeeded in ${totalTime}ms`);
    this.assert.assertEqual(successCount, requestCount, 'Every mixed endpoint smoke request should succeed');
    this.assert.assertTrue(totalTime < this.batchTimeLimitMs, 'Mixed endpoint smoke should finish within the batch budget');
  }

  async testI18nErrorMessagesAuditAccess() {
    this.logger.info('Testing i18n error messages for audit access (unauthorized)...');

    try {
      const unauthClient = new TestClient(this.client.baseUrl);
      unauthClient.defaultOptions.retries = 0;

      for (const lang of TEST_LANGUAGES.slice(0, 3)) { // limit to first 3 languages for speed
        this.logger.info(`  Locale: ${lang}`);
        const response = await unauthClient.get(`${API_ENDPOINTS.auditLogs}?lang=${lang}`);

        this.assert.assertEqual(response.status, 401, `Unauthorized audit access should return 401 for ${lang}`);
        this.assert.exists(response.data.error, `Should have error message for ${lang}`);

        if (response.data && typeof response.data === 'object' && 'error' in response.data) {
          this.assert.exists(response.data.error, `Should have error message for ${lang}`);
          this.assert.assertNotEmpty(response.data.error, `Error message should not be empty for ${lang}`);
          this.logger.info(`    ${lang} -> ${response.data.error}`);
        }
      }

      this.logger.success('i18n audit access error messages verified');
    } catch (error) {
      this.logger.error(`[testI18nErrorMessagesAuditAccess] Failed: ${error.message}`);
      throw error;
    }
  }

  async testI18nErrorMessagesAuditSearch() {
    this.logger.info('Testing i18n error messages for audit search...');

    try {
      if (!this.tokens.admin) {
        await this.setupAuthentication();
      }

      for (const lang of TEST_LANGUAGES.slice(0, 3)) {
        this.logger.info(`  Locale: ${lang}`);
        const url = `${API_ENDPOINTS.auditSearch}?lang=${lang}&limit=101`;
        const response = await this.client.get(url, { Authorization: `Bearer ${this.tokens.admin}` });

        this.assert.assertEqual(response.status, 400, `Invalid search page size should return 400 for ${lang}`);
        this.assert.assertNotEmpty(response.data.error, `Error message for ${lang}`);
        this.logger.info(`    ${lang} -> ${response.data.error}`);
      }

      this.logger.success('i18n audit search error messages processed');
    } catch (error) {
      this.logger.error(`[testI18nErrorMessagesAuditSearch] Failed: ${error.message}`);
      throw error;
    }
  }

  async testI18nErrorMessagesAuditExport() {
    this.logger.info('Testing i18n error messages for audit export...');

    try {
      if (!this.tokens.admin) {
        await this.setupAuthentication();
      }

      for (const lang of TEST_LANGUAGES.slice(0, 3)) {
        this.logger.info(`  Locale: ${lang}`);
        const url = `${API_ENDPOINTS.auditExport}?lang=${lang}&format=invalid_format_xyz`;
        const response = await this.client.get(url, { Authorization: `Bearer ${this.tokens.superAdmin}` });

        this.assert.assertEqual(response.status, 422, `Unsupported export format should return 422 for ${lang}`);
        this.assert.assertEqual(response.data.success, false, 'Refused export must not succeed');
        this.assert.assertEqual(response.data.code, 'UNSUPPORTED_EXPORT_OPTION', 'Export refusal should carry a stable code');
        this.assert.assertNotEmpty(response.data.message, `Export refusal message for ${lang}`);
        this.assert.assertEqual(response.data.data, undefined, 'Refused export must not fabricate data');
        this.logger.info(`    ${lang} -> ${response.data.code}`);
      }

      this.logger.success('i18n audit export error messages processed');
    } catch (error) {
      this.logger.error(`[testI18nErrorMessagesAuditExport] Failed: ${error.message}`);
      throw error;
    }
  }

  generatePerformanceReport() {
    this.logger.info('AUDIT SYSTEM PERFORMANCE REPORT');

    // Audit Log Query Performance
    if (this.performanceMetrics.auditLogQuery.length > 0) {
      this.logger.info('AUDIT LOG QUERY PERFORMANCE:');
      this.performanceMetrics.auditLogQuery.forEach(metric => {
        this.logger.info(`Limit ${metric.limit}: ${metric.avgTime.toFixed(1)}ms avg (${metric.minTime}-${metric.maxTime}ms range)`);
      });
    }

    // Search Performance
    if (this.performanceMetrics.auditSearch.length > 0) {
      this.logger.info('AUDIT SEARCH PERFORMANCE:');
      this.performanceMetrics.auditSearch.forEach(metric => {
        this.logger.info(`"${metric.query}": ${metric.avgTime.toFixed(1)}ms avg (max: ${metric.maxTime}ms)`);
      });
    }

    // Export Performance
    if (this.performanceMetrics.auditExport.length > 0) {
      this.logger.info('AUDIT EXPORT PERFORMANCE:');
      this.performanceMetrics.auditExport.forEach(metric => {
        this.logger.info(`Requested limit ${metric.size}: ${metric.responseTime}ms`);
      });
    }

    // Concurrent Logging
    if (this.performanceMetrics.concurrentLogging.length > 0) {
      this.logger.info('CONCURRENT LOGGING PERFORMANCE:');
      this.performanceMetrics.concurrentLogging.forEach(metric => {
        this.logger.info(`${metric.concurrency} concurrent: ${metric.totalTime}ms, ${metric.successRate.toFixed(1)}% success rate`);
      });
    }

    // Real-time Monitoring
    if (this.performanceMetrics.realtimeMonitoring.length > 0) {
      this.logger.info('REAL-TIME MONITORING PERFORMANCE:');
      this.performanceMetrics.realtimeMonitoring.forEach(metric => {
        this.logger.info(`${metric.endpoint}: ${metric.responseTime}ms (status: ${metric.status})`);
      });
    }

    // Performance Summary
    this.logger.info('PERFORMANCE SUMMARY:');

    const avgQueryTime = this.performanceMetrics.auditLogQuery.length > 0
      ? this.performanceMetrics.auditLogQuery.reduce((sum, m) => sum + m.avgTime, 0) / this.performanceMetrics.auditLogQuery.length
      : 0;

    const avgSearchTime = this.performanceMetrics.auditSearch.length > 0
      ? this.performanceMetrics.auditSearch.reduce((sum, m) => sum + m.avgTime, 0) / this.performanceMetrics.auditSearch.length
      : 0;

    if (avgQueryTime > 0) {
      this.logger.info(`Average query time: ${avgQueryTime.toFixed(1)}ms`);
    }

    if (avgSearchTime > 0) {
      this.logger.info(`Average search time: ${avgSearchTime.toFixed(1)}ms`);
    }

    const concurrentRequests = this.performanceMetrics.concurrentLogging.reduce((sum, metric) => sum + metric.concurrency, 0);
    const concurrentSuccesses = this.performanceMetrics.concurrentLogging.reduce((sum, metric) => sum + metric.successCount, 0);
    if (concurrentRequests > 0) {
      this.logger.info(`Concurrent login smoke: ${concurrentSuccesses}/${concurrentRequests} requests succeeded on first attempt`);
    }
    this.logger.info('Smoke sample report complete; results describe this run and its existing dataset.');
  }
}

// Export for use in other test files
export { AuditPerformanceTest };

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const performanceTest = new AuditPerformanceTest();
  await performanceTest.runAll();
}
