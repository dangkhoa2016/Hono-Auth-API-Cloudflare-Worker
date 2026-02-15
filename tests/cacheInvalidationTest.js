#!/usr/bin/env node

/**
 * Cache Invalidation Comprehensive Test Suite
 * 
 * Tests to verify that KV configuration cache is properly invalidated 
 * after updates, ensuring frontend always gets latest values
 * 
 * Issues being tested:
 * 1. KVConfigService cache not invalidating after SET
 * 2. BaseService config cache persisting after updates
 * 3. Multiple service instances holding stale cache
 * 4. Cache invalidation for related keys
 * 
 * Test scenarios:
 * - Single key update and cache invalidation
 * - Batch updates and cache clearing
 * - Cache invalidation persistence across requests
 * - Service cache isolation and clearing
 * - Real-time config updates for frontend
 * - Cache behavior on DELETE (reset to default)
 * - Concurrent cache updates
 */

import { TestLogger } from './utils/testLogger.js';
import { TestClient } from './utils/testClient.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_CONFIG, TEST_USERS, API_ENDPOINTS } from './config/testConfig.js';

class CacheInvalidationTests {
  constructor() {
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    this.superAdminToken = '';
    this.testResults = [];
    
    // Configuration keys to test
    this.testKeys = {
      'APP_URL': { type: 'string', testValue: 'https://test-cache-123.com' },
      'APP_NAME': { type: 'string', testValue: 'Test App Cache 123' },
      'RATE_LIMIT_DISABLED': { type: 'boolean', testValue: true },
      'DEFAULT_PAGE_SIZE': { type: 'number', testValue: 42 }
    };
  }

  async runAll() {
    this.logger.logSuiteHeader('🔄 Starting Cache Invalidation Tests');

    try {
      await this.setupAuthentication();
      this.logger.success('Authentication completed successfully');
    } catch (error) {
      this.logger.error(`[runAll] Authentication setup failed: ${error.message}`);
      throw error;
    }

    const tests = [
      this.testCacheClearBeforeTests,
      this.testSingleKeyUpdateCacheInvalidation,
      this.testGetValueAfterUpdate,
      this.testMultipleUpdatesInSequence,
      this.testBatchUpdateCacheInvalidation,
      this.testResetConfigCacheInvalidation,
      this.testCachePersistenceAcrossRequests,
      this.testConcurrentUpdates,
      this.testAppUrlSpecificCase,
      this.testCacheConsistencyWithKV,
      this.testClearCacheEndpoint,
      this.testCachePerformance
    ];

    for (const test of tests) {
      const testName = test.name;
      try {
        await test.call(this);
        this.logger.recordResult(true);
        this.logger.success(`✅ ${testName} passed`);
      } catch (error) {
        this.logger.recordResult(false);
        this.logger.error(`❌ ${testName} failed: ${error.message}`);
        this.testResults.push({
          test: testName,
          status: 'failed',
          error: error.message
        });
      }
    }

    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      this.logger.section('💔 Failed Tests Summary');
      this.testResults.forEach(result => {
        if (result.status === 'failed') {
          this.logger.error(`  - ${result.test}: ${result.error}`);
        }
      });
      process.exit(1);
    }
  }

  async setupAuthentication() {
    this.logger.info('Setting up authentication...');

    try {
      const superAdminRes = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);
      if (!superAdminRes.success || !superAdminRes.data?.data?.access_token) {
        throw new Error('Failed to get super_admin token');
      }
      this.superAdminToken = superAdminRes.data.data.access_token;
      this.logger.success('Super Admin authenticated');
    } catch (error) {
      throw new Error(`Authentication failed: ${error.message}`);
    }
  }

  /**
   * Test 1: Clear all cache before starting tests
   */
  async testCacheClearBeforeTests() {
    this.logger.info('🧹 Clearing all cache before tests...');

    try {
      const response = await this.client.post(API_ENDPOINTS.kvAdminConfigsCacheClear,
        {},
        { 'Authorization': `Bearer ${this.superAdminToken}` }
      );

      this.assert.assertSuccess(response, 'Clear cache');
      this.logger.success('Cache cleared successfully');
    } catch (error) {
      this.logger.error(`[testCacheClearBeforeTests] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 2: Update single key and verify cache is invalidated
   * This tests the core issue: KVConfigService.set() must invalidate cache
   */
  async testSingleKeyUpdateCacheInvalidation() {
    this.logger.info('🔑 Testing single key update and cache invalidation...');

    try {
      const key = 'APP_NAME';
      const testValue = `Test Cache ${Date.now()}`;
      const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);

      // Get current value
      const getBeforeResponse = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      const originalValue = getBeforeResponse.data?.data?.value;
      this.logger.info(`Original value: ${originalValue}`);

      // Update the value
      const updateResponse = await this.client.put(endpoint,
        { value: testValue },
        { 'Authorization': `Bearer ${this.superAdminToken}` }
      );
      this.assert.assertSuccess(updateResponse, 'Update config');
      this.logger.info(`Updated ${key} to: ${testValue}`);

      // CRITICAL: Get value immediately after update
      // This tests if cache was invalidated properly
      const getAfterResponse = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });

      const updatedValue = getAfterResponse.data?.data?.value;
      this.logger.info(`Value after update: ${updatedValue}`);

      if (updatedValue !== testValue) {
        throw new Error(
          `Cache not invalidated! Expected "${testValue}" but got "${updatedValue}"`
        );
      }

      this.logger.success(`✓ Cache properly invalidated - got correct value: ${testValue}`);
    } catch (error) {
      this.logger.error(`[testSingleKeyUpdateCacheInvalidation] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 3: Verify GET after update returns fresh value (not cached)
   */
  async testGetValueAfterUpdate() {
    this.logger.info('📖 Testing GET returns fresh value after update...');

    try {
      const key = 'RATE_LIMIT_DISABLED';
      const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);
      const testValue = true;

      // Update to value 1
      await this.client.put(endpoint,
        { value: testValue },
        { 'Authorization': `Bearer ${this.superAdminToken}` }
      );
      this.logger.info(`Set ${key} to: ${testValue}`);

      // First GET
      const get1 = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      const value1 = get1.data?.data?.value;
      this.logger.info(`First GET: ${value1}`);

      // Update to opposite value
      const newValue = false;
      await this.client.put(endpoint,
        { value: newValue },
        { 'Authorization': `Bearer ${this.superAdminToken}` }
      );
      this.logger.info(`Set ${key} to: ${newValue}`);

      // Second GET - must get new value
      const get2 = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      const value2 = get2.data?.data?.value;
      this.logger.info(`Second GET: ${value2}`);

      if (value2 !== newValue) {
        throw new Error(
          `Expected fresh value ${newValue} but got ${value2} from cache`
        );
      }

      this.logger.success('✓ GET properly returns fresh values, not from cache');
    } catch (error) {
      this.logger.error(`[testGetValueAfterUpdate] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 4: Multiple sequential updates all properly invalidate cache
   */
  async testMultipleUpdatesInSequence() {
    this.logger.info('🔄 Testing multiple sequential updates...');

    try {
      const key = 'DEFAULT_PAGE_SIZE';
      const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);
      const values = [10, 20, 30, 40, 50];

      for (const value of values) {
        // Update
        await this.client.put(endpoint,
          { value },
          { 'Authorization': `Bearer ${this.superAdminToken}` }
        );

        // Verify immediately
        const getResponse = await this.client.get(endpoint, {
          'Authorization': `Bearer ${this.superAdminToken}`
        });
        const retrievedValue = getResponse.data?.data?.value;

        if (retrievedValue !== value) {
          throw new Error(
            `Sequence update failed at value ${value}: got ${retrievedValue}`
          );
        }

        this.logger.info(`✓ Update #${values.indexOf(value) + 1}: ${value} verified`);
      }

      this.logger.success('✓ All sequential updates properly invalidated cache');
    } catch (error) {
      this.logger.error(`[testMultipleUpdatesInSequence] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 5: Batch updates properly clear cache for all updated keys
   */
  async testBatchUpdateCacheInvalidation() {
    this.logger.info('📦 Testing batch update cache invalidation...');

    try {
      const batchConfigs = [
        { key: 'APP_NAME', value: `Batch Test ${Date.now()}` },
        { key: 'RATE_LIMIT_DISABLED', value: false },
        { key: 'DEFAULT_PAGE_SIZE', value: 99 }
      ];

      // Execute batch update
      const batchResponse = await this.client.post(API_ENDPOINTS.kvAdminConfigsBatch,
        { configs: batchConfigs },
        { 'Authorization': `Bearer ${this.superAdminToken}` }
      );
      this.assert.assertSuccess(batchResponse, 'Batch update');

      // Verify each updated key returns fresh value
      for (const config of batchConfigs) {
        const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', config.key);
        const getResponse = await this.client.get(endpoint, {
          'Authorization': `Bearer ${this.superAdminToken}`
        });

        const retrievedValue = getResponse.data?.data?.value;
        if (retrievedValue !== config.value) {
          throw new Error(
            `Batch update cache not invalidated for ${config.key}: ` +
            `expected ${config.value} but got ${retrievedValue}`
          );
        }

        this.logger.info(`✓ ${config.key}: ${retrievedValue} verified`);
      }

      this.logger.success('✓ Batch update properly invalidated all caches');
    } catch (error) {
      this.logger.error(`[testBatchUpdateCacheInvalidation] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 6: Reset (DELETE) properly invalidates cache
   */
  async testResetConfigCacheInvalidation() {
    this.logger.info('🔄 Testing DELETE/reset cache invalidation...');

    try {
      const key = 'APP_URL';
      const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);
      const testValue = 'https://custom-test-url-cache.com';

      // Set custom value
      await this.client.put(endpoint,
        { value: testValue },
        { 'Authorization': `Bearer ${this.superAdminToken}` }
      );

      // Verify custom value
      let getResponse = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      if (getResponse.data?.data?.value !== testValue) {
        throw new Error('Failed to set custom value');
      }
      this.logger.info(`Set to custom value: ${testValue}`);

      // Reset to default
      const deleteResponse = await this.client.delete(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      this.assert.assertSuccess(deleteResponse, 'Reset config');

      // Verify reset to default (cache must be invalidated)
      getResponse = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      const resetValue = getResponse.data?.data?.value;
      const defaultValue = deleteResponse.data?.data?.defaultValue;

      if (resetValue !== defaultValue) {
        throw new Error(
          `Cache not invalidated after reset! Got ${resetValue}, expected ${defaultValue}`
        );
      }

      this.logger.success(`✓ Reset properly invalidated cache - back to default: ${defaultValue}`);
    } catch (error) {
      this.logger.error(`[testResetConfigCacheInvalidation] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 7: Cache invalidation persists across multiple subsequent requests
   */
  async testCachePersistenceAcrossRequests() {
    this.logger.info('🔁 Testing cache invalidation persistence...');

    try {
      const key = 'APP_NAME';
      const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);
      const testValue = `Persistent Test ${Date.now()}`;

      // Update value
      await this.client.put(endpoint,
        { value: testValue },
        { 'Authorization': `Bearer ${this.superAdminToken}` }
      );

      // Make 5 GET requests and verify all return new value
      for (let i = 0; i < 5; i++) {
        const response = await this.client.get(endpoint, {
          'Authorization': `Bearer ${this.superAdminToken}`
        });
        const value = response.data?.data?.value;

        if (value !== testValue) {
          throw new Error(
            `Request #${i + 1} returned cached value: ${value}, expected ${testValue}`
          );
        }

        this.logger.info(`✓ Request #${i + 1}: got correct value`);
      }

      this.logger.success('✓ All requests returned fresh values, no cache stale data');
    } catch (error) {
      this.logger.error(`[testCachePersistenceAcrossRequests] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 8: Concurrent updates properly handle cache invalidation
   */
  async testConcurrentUpdates() {
    this.logger.info('⚡ Testing concurrent updates...');

    try {
      const key = 'DEFAULT_PAGE_SIZE';
      const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);
      const values = [11, 22, 33, 44, 55];

      // Send all update requests concurrently
      const updatePromises = values.map(value =>
        this.client.put(endpoint,
          { value },
          { 'Authorization': `Bearer ${this.superAdminToken}` }
        )
      );

      await Promise.all(updatePromises);
      this.logger.info('All concurrent updates completed');

      // Get final value
      const getResponse = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      const finalValue = getResponse.data?.data?.value;

      // Final value should be one of the sent values
      if (!values.includes(finalValue)) {
        throw new Error(
          `Final value ${finalValue} is not in expected values: ${values.join(', ')}`
        );
      }

      this.logger.success(`✓ Concurrent updates handled correctly, final value: ${finalValue}`);
    } catch (error) {
      this.logger.error(`[testConcurrentUpdates] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 9: APP_URL specific case (the original issue reported)
   */
  async testAppUrlSpecificCase() {
    this.logger.info('🌐 Testing APP_URL specific case (original issue)...');

    try {
      const key = 'APP_URL';
      const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);
      const testValue = 'https://test-app-123.example.com';

      // Update APP_URL
      const updateResponse = await this.client.put(endpoint,
        { value: testValue },
        { 'Authorization': `Bearer ${this.superAdminToken}` }
      );
      this.assert.assertSuccess(updateResponse, 'Update APP_URL');
      this.logger.info(`Updated APP_URL to: ${testValue}`);

      // Get all configs (like frontend would)
      const allConfigsResponse = await this.client.get(API_ENDPOINTS.kvAdminConfigs, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      this.assert.assertSuccess(allConfigsResponse, 'Get all configs');

      const appUrlInAll = allConfigsResponse.data?.data?.configs?.APP_URL;
      if (appUrlInAll !== testValue) {
        throw new Error(
          `APP_URL not updated in all configs! Expected ${testValue}, got ${appUrlInAll}`
        );
      }

      // Get specific APP_URL
      const specificResponse = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      const appUrlSpecific = specificResponse.data?.data?.value;

      if (appUrlSpecific !== testValue) {
        throw new Error(
          `APP_URL not returned correctly! Expected ${testValue}, got ${appUrlSpecific}`
        );
      }

      this.logger.success(`✓ APP_URL properly updated in all config reads: ${testValue}`);
    } catch (error) {
      this.logger.error(`[testAppUrlSpecificCase] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 10: Cache consistency between KV and API responses
   */
  async testCacheConsistencyWithKV() {
    this.logger.info('📊 Testing cache consistency with KV...');

    try {
      const key = 'RATE_LIMIT_DISABLED';
      const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);

      // Get all configs
      const allResponse = await this.client.get(API_ENDPOINTS.kvAdminConfigs, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });

      const valueFromAll = allResponse.data?.data?.configs?.[key];

      // Get specific config
      const specificResponse = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });

      const valueFromSpecific = specificResponse.data?.data?.value;

      if (valueFromAll !== valueFromSpecific) {
        throw new Error(
          `Cache consistency broken! All configs: ${valueFromAll}, ` +
          `Specific: ${valueFromSpecific}`
        );
      }

      this.logger.success(`✓ Cache consistent across all config retrieval methods`);
    } catch (error) {
      this.logger.error(`[testCacheConsistencyWithKV] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 11: Clear cache endpoint works correctly
   */
  async testClearCacheEndpoint() {
    this.logger.info('🧹 Testing clear cache endpoint...');

    try {
      const key = 'APP_NAME';
      const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);
      const testValue = `Cache Clear Test ${Date.now()}`;

      // Set a value
      await this.client.put(endpoint,
        { value: testValue },
        { 'Authorization': `Bearer ${this.superAdminToken}` }
      );

      // Get it
      let getResponse = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      if (getResponse.data?.data?.value !== testValue) {
        throw new Error('Failed to set test value');
      }

      // Clear cache
      const clearResponse = await this.client.post(API_ENDPOINTS.kvAdminConfigsCacheClear,
        {},
        { 'Authorization': `Bearer ${this.superAdminToken}` }
      );
      this.assert.assertSuccess(clearResponse, 'Clear cache');

      // Get again - should still be the fresh value from KV
      getResponse = await this.client.get(endpoint, {
        'Authorization': `Bearer ${this.superAdminToken}`
      });
      const valueAfterClear = getResponse.data?.data?.value;

      if (valueAfterClear !== testValue) {
        throw new Error(
          `After cache clear, got wrong value: ${valueAfterClear}, expected ${testValue}`
        );
      }

      this.logger.success('✓ Clear cache endpoint works and doesn\'t lose data');
    } catch (error) {
      this.logger.error(`[testClearCacheEndpoint] ${error.message}`);
      throw error;
    }
  }

  /**
   * Test 12: Cache invalidation performance
   */
  async testCachePerformance() {
    this.logger.info('⏱️ Testing cache invalidation performance...');

    try {
      const key = 'DEFAULT_PAGE_SIZE';
      const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);
      const iterations = 10;
      const times = [];

      for (let i = 0; i < iterations; i++) {
        const startUpdate = Date.now();
        await this.client.put(endpoint,
          { value: 50 + i },
          { 'Authorization': `Bearer ${this.superAdminToken}` }
        );
        const updateTime = Date.now() - startUpdate;

        const startGet = Date.now();
        await this.client.get(endpoint, {
          'Authorization': `Bearer ${this.superAdminToken}`
        });
        const getTime = Date.now() - startGet;

        times.push({ update: updateTime, get: getTime });
        this.logger.info(`Iteration ${i + 1}: Update ${updateTime}ms, Get ${getTime}ms`);
      }

      const avgUpdate = times.reduce((sum, t) => sum + t.update, 0) / times.length;
      const avgGet = times.reduce((sum, t) => sum + t.get, 0) / times.length;

      this.logger.success(
        `✓ Cache invalidation performance acceptable ` +
        `(Avg Update: ${avgUpdate}ms, Avg Get: ${avgGet}ms)`
      );
    } catch (error) {
      this.logger.error(`[testCachePerformance] ${error.message}`);
      throw error;
    }
  }
}

// Run tests
const testSuite = new CacheInvalidationTests();
testSuite.runAll().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
