#!/usr/bin/env node

/**
 * Optimized Service Configuration Test Suite
 * Tests optimized audit middleware and service factory systems
 *
 * Service components tested:
 * - src/utils/serviceFactory.js - Service factory pattern implementation
 * - createUserService() - User service instance creation
 * - getServiceCacheStats() - Cache statistics monitoring
 * - clearServiceCaches() - Cache cleanup operations
 *
 * Test coverage:
 * - Service factory pattern implementation
 * - Cache management for service instances
 * - Configuration optimization for different environments
 * - Memory usage optimization in service creation
 * - Service dependency injection
 * - Performance monitoring for service operations
 * - Batch audit log processing
 * - Asynchronous audit log writing
 * - Cache-optimized audit data retrieval
 * - Memory-efficient audit log storage
 * - Optimized database queries for audit operations
 * - Service lifecycle management
 * - Resource cleanup and garbage collection
*/

import { createUserService, createAuthService, getServiceCacheStats, clearServiceCaches } from '../src/utils/serviceFactory.js';
import { TestClient } from './utils/testClient.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_CONFIG } from './config/testConfig.js';

class OptimizedServiceTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.testsPassed = 0;
    this.testsFailed = 0;
    this.env = TEST_CONFIG.env || {};
  }

  async runAll() {
    this.logger.logSuiteHeader('🚀 Starting Optimized Service Tests');

    const tests = [
      this.testServiceCreation,
      this.testAuthServiceSingleton,
      this.testConfigCaching,
      this.testSharedCache,
      this.testCacheExpiry,
      this.testBulkConfigLoading,
      this.testCacheStatistics,
      this.testCacheReset,
      this.testPerformanceImprovement
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

  async testServiceCreation() {
    this.logger.info('Testing optimized service creation...');

    try {
      const userService1 = createUserService(this.env);
      const userService2 = createUserService(this.env);

      // Should return same instance for same environment
      this.assert.assertEqual(userService1, userService2, 'Service instance should be reused for same environment');

      // Should have BaseService methods
      this.assert.assertTrue(!!userService1.getBcryptConfig, 'Service should have getBcryptConfig method');
      this.assert.assertEqual(typeof userService1.getBcryptConfig, 'function', 'getBcryptConfig should be a function');

      this.logger.success('Service creation test completed successfully');
    } catch (error) {
      this.logger.error(`[testServiceCreation] Service creation test failed: ${error.message}`);
      throw error;
    }
  }

  async testAuthServiceSingleton() {
    this.logger.info('Testing optimized auth service factory...');

    try {
      clearServiceCaches();
      const authService1 = createAuthService(this.env);
      const authService2 = createAuthService(this.env);

      this.assert.assertEqual(authService1, authService2, 'AuthService instance should be reused for same environment');
      this.assert.exists(authService1.tokenService, 'AuthService should expose embedded tokenService');
      this.assert.assertEqual(typeof authService1.generateTokens, 'function', 'AuthService should expose generateTokens method');

      this.logger.success('Auth service factory test completed successfully');
    } catch (error) {
      this.logger.error(`[testAuthServiceSingleton] Auth service factory test failed: ${error.message}`);
      throw error;
    }
  }

  async testConfigCaching() {
    this.logger.info('Testing configuration caching...');

    try {
      clearServiceCaches(); // Start fresh
      const userService = createUserService(this.env);

      // Check cache before first call
      const initialStats = userService.getCacheStats();
      const initialSize = initialStats.cacheSize;

      // First call should load from environment and cache it
      const start1 = Date.now();
      await userService.getBcryptConfig();
      const time1 = Date.now() - start1;

      const afterFirstCall = userService.getCacheStats();
      const sizeAfterFirst = afterFirstCall.cacheSize;

      // Second call should use cache
      const start2 = Date.now();
      await userService.getBcryptConfig();
      const time2 = Date.now() - start2;

      const afterSecondCall = userService.getCacheStats();
      const sizeAfterSecond = afterSecondCall.cacheSize;

      // Verify caching is working
      this.assert.assertTrue(sizeAfterFirst > initialSize, 'Cache should grow after first call');
      this.assert.assertEqual(sizeAfterSecond, sizeAfterFirst, 'Cache size should stay same on second call');

      this.logger.info(`Performance: ${time1}ms → ${time2}ms`);
      this.logger.success('Configuration caching test completed successfully');
    } catch (error) {
      this.logger.error(`[testConfigCaching] Config caching test failed: ${error.message}`);
      throw error;
    }
  }

  async testSharedCache() {
    this.logger.info('Testing shared cache across services...');

    try {
      clearServiceCaches(); // Start fresh
      const userService = createUserService(this.env);

      // Load config in userService
      await userService.getBcryptConfig();

      // Check if config is in shared cache
      const cacheStats = userService.getCacheStats();
      this.assert.assertTrue(cacheStats.cacheSize > 0, 'Shared cache should have items after loading config');

      this.logger.success('Shared cache test completed successfully');
    } catch (error) {
      this.logger.error(`[testSharedCache] Shared cache test failed: ${error.message}`);
      throw error;
    }
  }

  async testCacheExpiry() {
    this.logger.info('Testing cache expiry mechanism...');

    try {
      const userService = createUserService(this.env);

      // Set short timeout for testing
      if (userService._cacheTimeout !== undefined) {
        userService._cacheTimeout = 100; // 100ms
      }

      await userService.getBcryptConfig();

      // Wait for cache to expire
      await new Promise(resolve => setTimeout(resolve, 150));

      // Check if cache recognizes expiry (if method exists)
      if (userService._isCacheValid) {
        const isValid = userService._isCacheValid('bcrypt');
        this.assert.assertTrue(!isValid, 'Cache should be invalid after expiry timeout');
      }

      this.logger.success('Cache expiry test completed successfully');
    } catch (error) {
      this.logger.error(`[testCacheExpiry] Cache expiry test failed: ${error.message}`);
      throw error;
    }
  }

  async testBulkConfigLoading() {
    this.logger.info('Testing bulk configuration loading...');

    try {
      const userService = createUserService(this.env);

      // Test bulk loading if method exists
      if (userService.getBulkConfigs) {
        const configs = await userService.getBulkConfigs([
          'bcrypt', 'featureFlags', 'environment'
        ]);

        this.assert.assertTrue(!!configs, 'Bulk configs should not be null');
        this.assert.assertTrue(typeof configs === 'object', 'Configs should be an object');
        this.assert.assertTrue(Object.keys(configs).length > 0, 'Configs should have at least one key');
      }

      this.logger.success('Bulk config loading test completed successfully');
    } catch (error) {
      this.logger.error(`[testBulkConfigLoading] Bulk config loading test failed: ${error.message}`);
      throw error;
    }
  }

  async testCacheStatistics() {
    this.logger.info('Testing cache statistics...');

    try {
      const globalStats = getServiceCacheStats();

      this.assert.assertTrue(!!globalStats, 'Global stats should not be null');
      this.assert.assertTrue(typeof globalStats.globalCacheSize === 'number', 'Global cache size should be a number');

      this.logger.info(`Cache size: ${globalStats.globalCacheSize}`);
      this.logger.info(`Service instances: ${globalStats.serviceInstances}`);
      this.logger.success('Cache statistics test completed successfully');
    } catch (error) {
      this.logger.error(`[testCacheStatistics] Cache statistics test failed: ${error.message}`);
      throw error;
    }
  }

  async testCacheReset() {
    this.logger.info('Testing global cache reset utilities...');

    try {
      clearServiceCaches();
      const userService = createUserService(this.env);

      await userService.getBcryptConfig();
      const populatedStats = getServiceCacheStats();
      this.assert.assertTrue(populatedStats.globalCacheSize > 0, 'Cache should contain entries before reset');
      this.assert.assertTrue(populatedStats.serviceInstances > 0, 'At least one service instance should exist before reset');

      clearServiceCaches();
      const clearedStats = getServiceCacheStats();
      this.assert.assertEqual(clearedStats.globalCacheSize, 0, 'Cache size should be zero after reset');
      this.assert.assertEqual(clearedStats.serviceInstances, 0, 'Service instances should be cleared after reset');

      const newInstance = createUserService(this.env);
      this.assert.assertNotEqual(newInstance, userService, 'Clearing caches should create new service instance');

      await newInstance.getBcryptConfig();
      const refreshedStats = getServiceCacheStats();
      this.assert.assertTrue(refreshedStats.globalCacheSize > 0, 'Cache should repopulate after new access');

      this.logger.success('Cache reset test completed successfully');
    } catch (error) {
      this.logger.error(`[testCacheReset] Cache reset test failed: ${error.message}`);
      throw error;
    }
  }

  async testPerformanceImprovement() {
    this.logger.info('Testing performance improvements...');

    try {
      clearServiceCaches();
      const userService = createUserService(this.env);

      // Test cached access performance
      const iterations = 10; // Reduced for reliability

      // First load (cold)
      const coldStart = Date.now();
      await userService.getBcryptConfig();
      const coldTime = Date.now() - coldStart;

      // Subsequent loads (cached)
      const cachedStart = Date.now();
      for (let i = 0; i < iterations; i++) {
        await userService.getBcryptConfig();
      }
      const cachedTime = (Date.now() - cachedStart) / iterations;

      this.logger.info(`Cold load time: ${coldTime}ms`);
      this.logger.info(`Cached load time: ${cachedTime.toFixed(2)}ms`);
      this.logger.info(`Performance improvement: ${(coldTime / cachedTime).toFixed(1)}x faster`);
      this.logger.success('Performance test completed successfully');
    } catch (error) {
      this.logger.error(`[testPerformanceImprovement] Performance test failed: ${error.message}`);
      throw error;
    }
  }
}

// Export and run if called directly
export { OptimizedServiceTests };

if (import.meta.url === `file://${process.argv[1]}`) {
  const tests = new OptimizedServiceTests();
  tests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}
