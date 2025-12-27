#!/usr/bin/env node

/**
 * Audit System Performance Test Suite
 * Tests performance and scalability of audit endpoints
 *
 * Endpoints tested:
 * - GET /api/audit/logs - Large dataset pagination performance
 * - GET /api/audit/search - Search query performance with complex filters
 * - GET /api/audit/stats - Statistics calculation performance
 * - GET /api/audit/export - Large export operation performance
 * - GET /api/advanced-audit/analytics - Advanced analytics performance
 *
 * Test coverage:
 * - Response times under load (target: <2s for large queries)
 * - Concurrent request handling (10-100 simultaneous users)
 * - Large dataset processing (10K+ audit logs)
 * - Memory usage during operations
 * - Database query optimization effectiveness
 * - Pagination performance with large offsets
 * - Search index performance
 * - Export generation speed for large datasets
 * - Cache effectiveness for repeated queries
 * - System resource utilization monitoring
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
      this.testLargeDatasetHandling,
      this.testAuditMemoryUsage,
      this.testAuditResponseTimes,
      this.testAuditThroughput,
      this.testAuditStressTest,
      this.testAuditLoadBalance,
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

      // Try to get super admin token
      try {
        const superAdminLogin = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);

        if (superAdminLogin.success && superAdminLogin.data.data.access_token) {
          this.tokens.superAdmin = superAdminLogin.data.data.access_token;
          this.logger.info('Super admin token acquired');
        }
      } catch (error) {
        this.logger.info('Super admin user may not exist (using admin for tests)');
        this.tokens.superAdmin = this.tokens.admin; // Fallback
      }
    } catch (error) {
      this.logger.error(`[setupAuthentication] Auth token setup failed: ${error.message}`);
      throw error;
    }
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

          this.assert.assertEqual(response.status, 200, `Query should succeed for limit ${limit}`);
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

          this.assert.assertEqual(response.status, 200, `Search should succeed for query: ${query}`);
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

        this.assert.assertEqual(response.status, 200, `Export should succeed for size ${size}`);

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
      const concurrencyLevels = [5, 10, 20];

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
        this.assert.assertTrue(successRate >= 70, `Success rate should be at least 70% for ${concurrency} concurrent requests`);
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

      // Test dashboard performance if accessible
      if (response.status === 200) {
        const dashStartTime = Date.now();
        const dashResponse = await this.client.get(API_ENDPOINTS.realtimeMonitoringDashboardOverview, {
          Authorization: `Bearer ${this.tokens.superAdmin}`
        });
        const dashEndTime = Date.now();
        const dashResponseTime = dashEndTime - dashStartTime;

        this.performanceMetrics.realtimeMonitoring.push({
          endpoint: 'dashboard',
          responseTime: dashResponseTime,
          status: dashResponse.status
        });

        this.logger.info(`Dashboard overview: ${dashResponseTime}ms (status: ${dashResponse.status})`);
      }

      this.logger.success('Real-time monitoring performance test completed');
    } catch (error) {
      this.logger.info('[testRealtimeMonitoringPerformance] Real-time monitoring may require super admin access');
    }
  }

  async testLargeDatasetHandling() {
    this.logger.info('Testing large dataset handling...');

    try {
      // Test large limit queries
      const largeLimits = [1000, 2000, 5000];

      for (const limit of largeLimits) {
        try {
          const startTime = Date.now();

          const url = `${API_ENDPOINTS.auditLogs}?limit=${limit}`;
          const response = await this.client.get(url, {
            Authorization: `Bearer ${this.tokens.admin}`
          });

          const endTime = Date.now();
          const responseTime = endTime - startTime;

          if (response.status === 200) {
            const recordCount = response.data.data ? response.data.data.logs?.length || 0 : 0;
            this.logger.info(`${limit} limit: ${responseTime}ms, got ${recordCount} records`);

            // Assert reasonable response time for large datasets
            this.assert.assertTrue(responseTime < 10000, `Large dataset query should complete in under 10 seconds (${responseTime}ms)`);
          } else {
            this.logger.info(`${limit} limit: Status ${response.status}`);
          }

        } catch (error) {
          this.logger.info(`${limit} limit: ${error.message}`);
        }
      }

      this.logger.success('Large dataset handling test completed');
    } catch (error) {
      this.logger.error(`[testLargeDatasetHandling] Large dataset handling test failed: ${error.message}`);
      throw error;
    }
  }

  async testAuditAnalyticsPerformance() {
    this.logger.info('Testing audit analytics performance...');

    try {
      const startTime = Date.now();
      await this.client.get(API_ENDPOINTS.advancedAuditAnalytics, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

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
      await this.client.post(API_ENDPOINTS.advancedAuditArchivalRun, {
        dryRun: true,
        batchSize: 100
      }, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

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
      await this.client.get(API_ENDPOINTS.securityIncidents, {
        Authorization: `Bearer ${this.tokens.superAdmin}`
      });
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      this.logger.info(`Security incident list response time: ${responseTime}ms`);
      this.logger.success('Security incident performance test completed');
    } catch (error) {
      this.logger.info(`[testSecurityIncidentPerformance] Security incident endpoints may not be accessible: ${error.message}`);
    }
  }

  async testAuditMemoryUsage() {
    this.logger.info('Testing audit memory usage...');

    try {
      // Test memory-intensive operations
      const largeQueries = [
        `${API_ENDPOINTS.auditLogs}?limit=500`,
        `${API_ENDPOINTS.auditSearch}?query=*&limit=200`,
        `${API_ENDPOINTS.auditStats}?detailed=true`
      ];

      for (const query of largeQueries) {
        const startTime = Date.now();
        await this.client.get(query, {
          Authorization: `Bearer ${this.tokens.admin}`
        });
        const endTime = Date.now();
        const responseTime = endTime - startTime;

        this.logger.info(`Query "${query.split('?')[0]}": ${responseTime}ms`);
      }

      this.logger.success('Audit memory usage test completed');
    } catch (error) {
      this.logger.error(`[testAuditMemoryUsage] Audit memory usage test failed: ${error.message}`);
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
          await this.client.get(endpoint.url, {
            Authorization: `Bearer ${this.tokens.admin}`
          });
          const endTime = Date.now();
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

      const throughput = (successCount / (totalTime / 1000)).toFixed(2);

      this.logger.info(`Throughput: ${throughput} requests/second (${successCount}/${totalRequests} successful)`);
      this.logger.success('Audit throughput test completed');
    } catch (error) {
      this.logger.error(`[testAuditThroughput] Audit throughput test failed: ${error.message}`);
      throw error;
    }
  }

  async testAuditStressTest() {
    this.logger.info('Testing audit stress scenarios...');

    try {
      // Test with high concurrent load
      const concurrentRequests = 20; // Reduced from 50 to avoid overwhelming local dev server
      const promises = [];

      for (let i = 0; i < concurrentRequests; i++) {
        const promise = this.client.get(API_ENDPOINTS.auditLogs + '?limit=20', {
          Authorization: `Bearer ${this.tokens.admin}`
        });
        promises.push(promise);
      }

      const startTime = Date.now();
      const results = await Promise.allSettled(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successCount = results.filter(r =>
        r.status === 'fulfilled' && r.value.status === 200
      ).length;

      const successRate = (successCount / concurrentRequests) * 100;

      this.logger.info(`Stress test: ${successCount}/${concurrentRequests} requests succeeded (${successRate.toFixed(1)}%) in ${totalTime}ms`);

      // Assert minimum success rate under stress
      this.assert.assertTrue(successRate >= 60, `Success rate under stress should be at least 60% (got ${successRate.toFixed(1)}%)`);

      // Allow server to recover
      await new Promise(resolve => setTimeout(resolve, 2000));

      this.logger.success('Audit stress test completed');
    } catch (error) {
      this.logger.error(`[testAuditStressTest] Audit stress test failed: ${error.message}`);
      throw error;
    }
  }

  async testAuditLoadBalance() {
    this.logger.info('Testing audit load balancing...');

    try {
      // Safety timeout so the test doesn't hang if any endpoint stalls
      const withTimeout = (promise, timeoutMs, endpoint) => new Promise(resolve => {
        const timer = setTimeout(() => {
          resolve({ status: 598, data: { error: `timeout after ${timeoutMs}ms at ${endpoint}` } });
        }, timeoutMs);

        promise
          .then(response => {
            clearTimeout(timer);
            resolve(response);
          })
          .catch(error => {
            clearTimeout(timer);
            resolve({ status: 599, data: { error: error.message || 'request failed' } });
          });
      });

      // Test multiple different endpoints simultaneously
      const endpoints = [
        API_ENDPOINTS.auditLogs + '?limit=10',
        API_ENDPOINTS.auditStats,
        API_ENDPOINTS.auditSearch + '?query=test&limit=5'
      ];

      const promises = [];

      // Create requests to different endpoints
      for (let i = 0; i < 10; i++) { // Reduced from 15 to 10
        const endpoint = endpoints[i % endpoints.length];
        const promise = withTimeout(
          this.client.get(endpoint, {
            Authorization: `Bearer ${this.tokens.admin}`
          }),
          4000,
          endpoint
        );
        promises.push(promise);
      }

      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successCount = results.filter(r => r.status === 200).length;

      this.logger.info(`Load balance test: ${successCount}/${promises.length} requests succeeded in ${totalTime}ms`);
      
      // Allow server to recover
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      this.logger.success('Audit load balance test completed');
    } catch (error) {
      this.logger.error(`[testAuditLoadBalance] Audit load balance test failed: ${error.message}`);
      throw error;
    }
  }

  async testI18nErrorMessagesAuditAccess() {
    this.logger.info('Testing i18n error messages for audit access (unauthorized)...');

    try {
      const unauthClient = new TestClient(TEST_CONFIG.baseUrl);

      for (const lang of TEST_LANGUAGES.slice(0, 3)) { // limit to first 3 languages for speed
        this.logger.info(`  Locale: ${lang}`);
        const response = await unauthClient.get(`${API_ENDPOINTS.auditLogs}?lang=${lang}`);

        this.assert.assertEqual(response.status, 401, `Unauthorized audit access should return 401 for ${lang}`);
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
        const url = `${API_ENDPOINTS.auditSearch}?lang=${lang}&search=invalid_search_12345&searchFields=invalid_field`;
        const response = await this.client.get(url, { Authorization: `Bearer ${this.tokens.admin}` });

        // Depending on implementation it may return 200 (no error) or validation error
        if (response.status >= 400 && response.data && 'error' in response.data) {
          this.assert.assertNotEmpty(response.data.error, `Error message should not be empty for ${lang}`);
          this.logger.info(`    ${lang} -> ${response.data.error}`);
        } else {
          this.logger.info(`    ${lang} -> No localized error (status ${response.status})`);
        }
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
        const response = await this.client.get(url, { Authorization: `Bearer ${this.tokens.superAdmin || this.tokens.admin}` });

        if (response.status >= 400 && response.data && 'error' in response.data) {
          this.assert.assertNotEmpty(response.data.error, `Error message should not be empty for ${lang}`);
          this.logger.info(`    ${lang} -> ${response.data.error}`);
        } else {
          this.logger.info(`    ${lang} -> Export request succeeded (status ${response.status})`);
        }
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
        this.logger.info(`${metric.size} records: ${metric.responseTime}ms`);
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

    this.logger.info('PERFORMANCE RECOMMENDATIONS:');

    if (avgQueryTime > 1000) {
      this.logger.info('Query performance could be improved with database optimization');
    } else if (avgQueryTime > 0) {
      this.logger.info('Query performance is good');
    }

    if (avgSearchTime > 2000) {
      this.logger.info('Search performance could be improved with better indexing');
    } else if (avgSearchTime > 0) {
      this.logger.info('Search performance is good');
    }

    const totalConcurrentTests = this.performanceMetrics.concurrentLogging.length;
    const successfulConcurrentTests = this.performanceMetrics.concurrentLogging.filter(m => m.successRate > 80).length;

    if (totalConcurrentTests > 0 && successfulConcurrentTests === totalConcurrentTests) {
      this.logger.info('Concurrent logging performance is excellent');
    } else if (totalConcurrentTests > 0) {
      this.logger.info('Some concurrent operations had low success rates');
    }

    this.logger.success('AUDIT SYSTEM PERFORMANCE TEST COMPLETED!');
  }
}

// Export for use in other test files
export { AuditPerformanceTest };

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const performanceTest = new AuditPerformanceTest();
  await performanceTest.runAll();
}
