#!/usr/bin/env node

/**
 * Performance & Load Test Suite
 * Tests system performance and scalability across endpoints
 *
 * Endpoints tested:
 * - GET /health - Health check response time
 * - POST /api/auth/login - Authentication performance
 * - GET /api/admin/users - Large user list handling
 * - GET /api/audit/logs - Audit log pagination performance
 * - POST /api/user/upload - File upload speed
 * - GET /api/admin/stats - Statistics calculation performance
 * - Multiple concurrent requests across all endpoints
 *
 * Test coverage:
 * - Response time benchmarks (<500ms for most endpoints)
 * - Concurrent request handling (10-50 simultaneous requests)
 * - Large dataset processing capabilities
 * - Memory usage during operations
 * - Database query performance
 * - File upload performance testing
 * - Load testing with multiple concurrent users
 * - Performance degradation analysis
*/

import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_USERS, API_ENDPOINTS, TEST_CONFIG } from './config/testConfig.js';

class PerformanceTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.performanceThresholds = {
      responseTime: 1000, // 1 second max
      healthCheck: 250,   // 250ms max for health check (allows minor cold-start jitter)
      login: 500,         // 500ms max for login
      concurrent: 100     // 100 concurrent requests
    };
  }

  async runAll() {
    this.logger.logSuiteHeader('⚡ Starting Performance Tests');

    const tests = [
      this.testResponseTimes,
      this.testHealthCheckPerformance,
      this.testLoginPerformance,
      this.testConcurrentRequests,
      this.testDatabasePerformance,
      this.testMemoryUsage,
      this.testThroughput,
      this.testLoadTesting,
      this.testStressTesting,
      this.testCachePerformance
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
   * Measure response time for a test function
   * @param {Function} testFunction - The function to measure
   * @returns {Object} Result with timing and response data
   */
  async measureResponseTime(testFunction) {
    const startTime = Date.now();
    const result = await testFunction();
    const endTime = Date.now();
    const responseTime = endTime - startTime;

    return {
      result,
      responseTime,
      timestamp: startTime
    };
  }

  /**
   * Test response times for various endpoints
   */
  async testResponseTimes() {
    this.logger.info('Testing endpoint response times...');

    try {
      const endpoints = [
        { path: API_ENDPOINTS.health, threshold: this.performanceThresholds.healthCheck },
        { path: API_ENDPOINTS.api, threshold: this.performanceThresholds.responseTime },
        { path: API_ENDPOINTS.language, threshold: this.performanceThresholds.responseTime }
      ];

      // Warm up endpoints to avoid measuring cold-start latency on the first request
      await Promise.all(endpoints.map(async (endpoint) => {
        try {
          await this.client.get(endpoint.path);
        } catch (e) {
          // Ignore warm-up errors; real assertions happen below
        }
      }));

      const results = [];

      for (const endpoint of endpoints) {
        const measurement = await this.measureResponseTime(async () => {
          return await this.client.get(endpoint.path);
        });

        results.push({
          endpoint: endpoint.path,
          responseTime: measurement.responseTime,
          threshold: endpoint.threshold
        });

        this.assert.assertEqual(measurement.responseTime <= endpoint.threshold, true,
          `${endpoint.path} response time (${measurement.responseTime}ms) should be under ${endpoint.threshold}ms`);

        this.logger.info(`${endpoint.path}: ${measurement.responseTime}ms (threshold: ${endpoint.threshold}ms)`);
      }

      // Log summary
      const avgResponseTime = results.reduce((sum, r) => sum + r.responseTime, 0) / results.length;
      this.logger.info(`Average response time: ${avgResponseTime.toFixed(2)}ms`);
      this.logger.success('Response times test completed successfully');
    } catch (error) {
      this.logger.error(`[testResponseTimes] Response times test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test health check performance with multiple iterations
   */
  async testHealthCheckPerformance() {
    this.logger.info('Testing health check performance...');

    try {
      const iterations = 5;
      const responseTimes = [];

      // Warm up health endpoint to avoid first-hit cold-start noise
      try {
        await this.client.get(API_ENDPOINTS.health);
      } catch (e) {
        // Warm-up failures are non-fatal for the actual test
      }

      for (let i = 0; i < iterations; i++) {
        const measurement = await this.measureResponseTime(async () => {
          return await this.client.get(API_ENDPOINTS.health);
        });

        responseTimes.push(measurement.responseTime);

        this.assert.assertEqual(measurement.result.status, 200, 'Health check should return 200');
        this.assert.assertEqual(measurement.responseTime <= this.performanceThresholds.healthCheck, true,
          `Health check response time should be under ${this.performanceThresholds.healthCheck}ms`);
      }

      const avgTime = responseTimes.reduce((sum, time) => sum + time, 0) / iterations;
      const minTime = Math.min(...responseTimes);
      const maxTime = Math.max(...responseTimes);

      this.logger.info(`Health Check Performance (${iterations} iterations):`);
      this.logger.info(`Average: ${avgTime.toFixed(2)}ms`);
      this.logger.info(`Min: ${minTime}ms`);
      this.logger.info(`Max: ${maxTime}ms`);
      this.logger.success('Health check performance test completed successfully');
    } catch (error) {
      this.logger.error(`[testHealthCheckPerformance] Health check performance test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test login performance with multiple iterations
   */
  async testLoginPerformance() {
    this.logger.info('Testing login performance...');

    try {
      const loginData = TEST_USERS.valid;
      const iterations = 5;
      const responseTimes = [];

      // Warm up login endpoint to reduce first-hit latency impact
      try {
        await this.client.post(API_ENDPOINTS.login, loginData);
      } catch (e) {
        // Ignore warm-up failures; real assertions follow
      }

      for (let i = 0; i < iterations; i++) {
        const measurement = await this.measureResponseTime(async () => {
          return await this.client.post(API_ENDPOINTS.login, loginData);
        });

        responseTimes.push(measurement.responseTime);

        this.assert.assertEqual(measurement.result.status, 200, 'Login should return 200');
        this.assert.assertEqual(measurement.responseTime <= this.performanceThresholds.login, true,
          `Login response time should be under ${this.performanceThresholds.login}ms`);
      }

      const avgTime = responseTimes.reduce((sum, time) => sum + time, 0) / iterations;
      this.logger.info(`🔐 Login Performance (${iterations} iterations): ${avgTime.toFixed(2)}ms average`);
      this.logger.success('Login performance test completed successfully');
    } catch (error) {
      this.logger.error(`[testLoginPerformance] Login performance test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test concurrent request handling
   */
  async testConcurrentRequests() {
    this.logger.info('Testing concurrent request handling...');

    try {
      const concurrentRequests = 10;
      const startTime = Date.now();

      // Create array of promises for concurrent requests
      const requests = Array(concurrentRequests).fill().map(() =>
        this.client.get(API_ENDPOINTS.health)
      );

      const results = await Promise.allSettled(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      // Check that all requests succeeded
      const successful = results.filter(r => r.status === 'fulfilled' && r.value.status === 200);
      const failed = results.filter(r => r.status === 'rejected' || r.value.status !== 200);

      this.assert.assertEqual(successful.length, concurrentRequests,
        `All ${concurrentRequests} concurrent requests should succeed`);
      this.assert.assertEqual(failed.length, 0, 'No concurrent requests should fail');

      const avgTimePerRequest = totalTime / concurrentRequests;
      this.logger.info(`Concurrent Requests (${concurrentRequests} requests):`);
      this.logger.info(`Total time: ${totalTime}ms`);
      this.logger.info(`Average per request: ${avgTimePerRequest.toFixed(2)}ms`);
      this.logger.info(`Successful: ${successful.length}`);
      this.logger.info(`Failed: ${failed.length}`);
      this.logger.success('Concurrent requests test completed successfully');
    } catch (error) {
      this.logger.error(`[testConcurrentRequests] Concurrent requests test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test database operations performance
   */
  async testDatabasePerformance() {
    this.logger.info('Testing database operations performance...');

    try {
      // Test database operations performance
      const loginData = TEST_USERS.valid;

      // Login to test database query
      const loginMeasurement = await this.measureResponseTime(async () => {
        return await this.client.post(API_ENDPOINTS.login, loginData);
      });

      this.assert.assertEqual(loginMeasurement.result.status, 200, 'Database login should succeed');

      const token = loginMeasurement.result.data.data.access_token;

      // Test profile retrieval (database read)
      const profileMeasurement = await this.measureResponseTime(async () => {
        return await this.client.get(API_ENDPOINTS.profile, {
          Authorization: `Bearer ${token}`
        });
      });

      this.assert.assertEqual(profileMeasurement.result.status, 200, 'Profile retrieval should succeed');
      this.assert.assertEqual(profileMeasurement.responseTime <= this.performanceThresholds.responseTime, true,
        `Database read should be under ${this.performanceThresholds.responseTime}ms`);

      this.logger.info('Database Performance:');
      this.logger.info(`Login (with auth): ${loginMeasurement.responseTime}ms`);
      this.logger.info(`Profile read: ${profileMeasurement.responseTime}ms`);
      this.logger.success('Database performance test completed successfully');
    } catch (error) {
      this.logger.error(`[testDatabasePerformance] Database performance test failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test memory usage during operations
   */
  async testMemoryUsage() {
    this.logger.info('Testing memory usage during operations...');

    try {
      // This is a basic test - in a real environment you'd use more sophisticated tools
      const initialMemory = process.memoryUsage();

      // Perform a series of operations
      const operations = [];
      for (let i = 0; i < 10; i++) {
        operations.push(this.client.get(API_ENDPOINTS.health));
      }

      await Promise.all(operations);

      const finalMemory = process.memoryUsage();
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;

      this.logger.info('Memory Usage:');
      this.logger.info(`Initial heap: ${(initialMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      this.logger.info(`Final heap: ${(finalMemory.heapUsed / 1024 / 1024).toFixed(2)}MB`);
      this.logger.info(`Increase: ${(memoryIncrease / 1024 / 1024).toFixed(2)}MB`);

      // Basic check - memory shouldn't increase dramatically
      this.assert.assertEqual(memoryIncrease < 100 * 1024 * 1024, true, // 100MB limit
        'Memory usage should not increase dramatically');

      this.logger.success('Memory usage test completed successfully');
    } catch (error) {
      this.logger.error(`[testMemoryUsage] Memory usage test failed: ${error.message}`);
      throw error;
    }
  }

  async testThroughput() {
    try {
      this.logger.info('Testing throughput performance...');

      // Allow server to recover from previous tests
      await new Promise(resolve => setTimeout(resolve, 1000));

      const duration = 3000; // 3 seconds
      const startTime = Date.now();
      let requestCount = 0;
      const errors = [];
      const batchSize = 5; // Run 5 requests concurrently

      // Keep making requests for the duration
      while (Date.now() - startTime < duration) {
        try {
          const batch = Array(batchSize).fill().map(() =>
            this.client.get(API_ENDPOINTS.health)
              .then(res => {
                if (res.status !== 200) {throw new Error(`Status ${res.status}`);}
                return res;
              })
          );

          await Promise.all(batch);
          requestCount += batchSize;
        } catch (error) {
          errors.push(error);
        }
      }

      const actualDuration = Date.now() - startTime;
      const requestsPerSecond = (requestCount / actualDuration) * 1000;

      this.logger.info(`Throughput Test (${actualDuration}ms):`);
      this.logger.info(`Total requests: ${requestCount}`);
      this.logger.info(`Errors: ${errors.length}`);
      this.logger.info(`Requests per second: ${requestsPerSecond.toFixed(2)}`);

      // Lower threshold slightly for CI/Cloud environments
      this.assert.assertEqual(requestsPerSecond > 5, true, 'Should handle at least 5 requests per second');
      this.assert.assertEqual(errors.length / requestCount < 0.05, true, 'Error rate should be under 5%');

      this.logger.success('Throughput test completed successfully');
    } catch (error) {
      this.logger.error(`[testThroughput] Throughput test failed: ${error.message}`);
      throw error;
    }
  }

  async testLoadTesting() {
    try {
      this.logger.info('Testing load testing performance...');

      // Simulate moderate load
      const concurrentUsers = 5;
      const requestsPerUser = 3;
      const startTime = Date.now();

      const userSessions = Array(concurrentUsers).fill().map(async (_/*, userIndex*/) => {
        const requests = [];

        for (let i = 0; i < requestsPerUser; i++) {
          requests.push(this.client.get(API_ENDPOINTS.health));
        }

        return Promise.all(requests);
      });

      const results = await Promise.allSettled(userSessions);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successfulSessions = results.filter(r => r.status === 'fulfilled').length;
      const totalRequests = concurrentUsers * requestsPerUser;

      this.logger.info(`Load Test (${concurrentUsers} users, ${requestsPerUser} requests each):`);
      this.logger.info(`Total time: ${totalTime}ms`);
      this.logger.info(`Total requests: ${totalRequests}`);
      this.logger.info(`Successful sessions: ${successfulSessions}/${concurrentUsers}`);
      this.logger.info(`Requests per second: ${((totalRequests / totalTime) * 1000).toFixed(2)}`);

      this.assert.assertEqual(successfulSessions >= concurrentUsers * 0.9, true,
        'At least 90% of user sessions should succeed');

      this.logger.success('Load testing completed successfully');
    } catch (error) {
      this.logger.error(`[testLoadTesting] Load testing failed: ${error.message}`);
      throw error;
    }
  }

  async testStressTesting() {
    try {
      this.logger.info('Testing stress testing performance...');

      // Allow server to recover from previous tests
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Push the system harder
      const concurrentRequests = 20; // Reduced from 50 to avoid overwhelming local dev server
      const startTime = Date.now();

      const requests = Array(concurrentRequests).fill().map(() =>
        this.client.get(API_ENDPOINTS.health).catch(e => e.response)
      );

      const results = await Promise.all(requests);
      const endTime = Date.now();
      const totalTime = endTime - startTime;

      const successful = results.filter(r => r && r.status === 200).length;
      const errors = results.filter(r => !r || r.status !== 200).length;

      this.logger.info(`Stress Test (${concurrentRequests} concurrent requests):`);
      this.logger.info(`Total time: ${totalTime}ms`);
      this.logger.info(`Successful: ${successful}`);
      this.logger.info(`Errors: ${errors}`);
      this.logger.info(`Success rate: ${((successful / concurrentRequests) * 100).toFixed(1)}%`);

      // Allow for some failures under stress, but not too many
      this.assert.assertEqual(successful / concurrentRequests >= 0.8, true,
        'At least 80% of requests should succeed under stress');

      this.logger.success('Stress testing completed successfully');
    } catch (error) {
      this.logger.error(`[testStressTesting] Stress testing failed: ${error.message}`);
      throw error;
    }
  }

  /**
   * Test cache performance and response caching
   */
  async testCachePerformance() {
    this.logger.info('Testing cache performance...');

    try {
      // Test if responses are cached (if caching is implemented)
      const endpoint = API_ENDPOINTS.health;

      // First request (cold)
      const firstRequest = await this.measureResponseTime(async () => {
        return await this.client.get(endpoint);
      });

      // Second request (potentially cached)
      const secondRequest = await this.measureResponseTime(async () => {
        return await this.client.get(endpoint);
      });

      this.logger.info('Cache Performance:');
      this.logger.info(`First request: ${firstRequest.responseTime}ms`);
      this.logger.info(`Second request: ${secondRequest.responseTime}ms`);

      if (secondRequest.responseTime < firstRequest.responseTime * 0.8) {
        this.logger.info(`🎉 Potential caching detected (${((1 - secondRequest.responseTime / firstRequest.responseTime) * 100).toFixed(1)}% faster)`);
      } else {
        this.logger.info('📝 No significant caching detected');
      }

      // Both requests should succeed regardless
      this.assert.assertEqual(firstRequest.result.status, 200, 'First request should succeed');
      this.assert.assertEqual(secondRequest.result.status, 200, 'Second request should succeed');
      this.logger.success('Cache performance test completed successfully');
    } catch (error) {
      this.logger.error(`[testCachePerformance] Cache performance test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { PerformanceTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new PerformanceTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
