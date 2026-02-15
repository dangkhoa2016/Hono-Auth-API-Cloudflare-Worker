#!/usr/bin/env node

/**
 * Quick Cache Invalidation Verification Test
 * 
 * A simplified test that quickly verifies the core cache invalidation fix:
 * - Update a config value
 * - Immediately read it back
 * - Verify the new value is returned (not the cached old value)
 * 
 * This is the minimal test to prove the fix works
 */

import { TestLogger } from './utils/testLogger.js';
import { TestClient } from './utils/testClient.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_CONFIG, TEST_USERS, API_ENDPOINTS } from './config/testConfig.js';

class QuickCacheTest {
  constructor() {
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;
    this.superAdminToken = '';
  }

  async run() {
    this.logger.logSuiteHeader('⚡ Quick Cache Invalidation Verification');

    try {
      await this.setupAuth();
      
      // The CRITICAL test - update and immediately verify
      await this.testCoreFixWorks();
      
      this.logger.logSummary();
      process.exit(0);
    } catch (error) {
      this.logger.error(`Test failed: ${error.message}`);
      this.logger.logSummary();
      process.exit(1);
    }
  }

  async setupAuth() {
    this.logger.info('Authenticating...');
    const response = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);
    
    if (!response.success || !response.data?.data?.access_token) {
      throw new Error('Failed to authenticate');
    }
    
    this.superAdminToken = response.data.data.access_token;
    this.logger.success('Authenticated as super_admin');
  }

  async testCoreFixWorks() {
    this.logger.section('Core Fix Verification');
    this.logger.info('🧪 Testing: Update config → Immediately read back → Verify cache was invalidated');
    
    const key = 'APP_URL';
    const endpoint = `${API_ENDPOINTS.kvAdminConfigsSpecific}`.replace(':key', key);
    const testValue = `https://cache-test-${Date.now()}.com`;
    const headers = { 'Authorization': `Bearer ${this.superAdminToken}` };

    try {
      // Step 1: Clear cache first
      this.logger.info('  1️⃣ Clearing all caches...');
      await this.client.post(API_ENDPOINTS.kvAdminConfigsCacheClear, {}, { ...headers });
      this.logger.success('   ✓ Cache cleared');

      // Step 2: Get original value
      this.logger.info('  2️⃣ Getting original value...');
      const originalResponse = await this.client.get(endpoint, headers);
      const originalValue = originalResponse.data?.data?.value;
      this.logger.info(`   Original value: ${originalValue}`);

      // Step 3: Update to new value
      this.logger.info(`  3️⃣ Updating to new value: ${testValue}`);
      const updateResponse = await this.client.put(endpoint, { value: testValue }, { ...headers });
      this.assert.assertSuccess(updateResponse, 'Update config');
      this.logger.success(`   ✓ Update successful`);

      // Step 4: IMMEDIATELY get the value back (this is where bug would show)
      this.logger.info('  4️⃣ Getting value immediately after update (CRITICAL TEST)...');
      const updatedResponse = await this.client.get(endpoint, headers);
      const updatedValue = updatedResponse.data?.data?.value;
      this.logger.info(`   Retrieved value: ${updatedValue}`);

      // Step 5: Verify - THIS IS THE CRITICAL ASSERTION
      if (updatedValue !== testValue) {
        throw new Error(
          `❌ CACHE NOT INVALIDATED!\n` +
          `   Expected: "${testValue}"\n` +
          `   Got:      "${updatedValue}"\n` +
          `   This means the old value is still cached!`
        );
      }

      this.logger.recordResult(true);
      this.logger.success('✅ CACHE INVALIDATION WORKS CORRECTLY!');
      this.logger.info(`   ✓ New value is correctly returned immediately: ${updatedValue}`);
      
      return true;
    } catch (error) {
      this.logger.recordResult(false);
      throw error;
    }
  }
}

// Run the quick test
const test = new QuickCacheTest();
test.run().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
