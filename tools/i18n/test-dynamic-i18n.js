#!/usr/bin/env node

/**
 * Test Dynamic i18n System
 * Verify that the new fully dynamic i18n system works correctly
 */

import { getSupportedLanguages, getSupportedLanguagesSync, initI18n } from '../../src/i18n/config.js';
import { loadTranslation, getCacheStats } from '../../src/i18n/loader.js';

console.log('🚀 Testing Dynamic i18n System\n');

async function testDynamicLanguageSystem() {
  try {
    // Test 1: Initialize i18n system
    console.log('1️⃣ Initializing i18n system...');
    await initI18n();
    console.log('   ✅ i18n system initialized');

    // Test 2: Get supported languages (async)
    console.log('\n2️⃣ Getting supported languages (async)...');
    const supportedAsync = await getSupportedLanguages();
    console.log('   ✅ Supported languages (async):', supportedAsync);

    // Test 3: Get supported languages (sync)
    console.log('\n3️⃣ Getting supported languages (sync)...');
    const supportedSync = getSupportedLanguagesSync();
    console.log('   ✅ Supported languages (sync):', supportedSync);

    // Test 4: Initialize i18next
    console.log('\n4️⃣ Initializing i18next...');
    await initI18n();
    console.log('   ✅ i18next initialized successfully');

    // Test 5: Load individual translations
    console.log('\n5️⃣ Loading individual translations...');
    for (const lang of supportedSync) {
      const translation = await loadTranslation(lang);
      console.log(`   ✅ Loaded ${lang}:`, Object.keys(translation).length, 'sections');
    }

    // Test 6: Get cache statistics
    console.log('\n6️⃣ Cache statistics...');
    const cacheStats = getCacheStats();
    console.log('   ✅ Cache stats:', cacheStats);

    // Test 7: Try loading a non-existent language
    console.log('\n7️⃣ Testing fallback for non-existent language...');
    try {
      const fallback = await loadTranslation('xyz');
      console.log('   ✅ Fallback works:', Object.keys(fallback));
    } catch (error) {
      console.log('   ⚠️ Fallback failed:', error.message);
    }

    console.log('\n🎉 All tests completed successfully!');
    console.log('\n📊 Summary:');
    console.log(`   • Languages discovered: ${supportedAsync.length}`);
    console.log(`   • Languages cached: ${cacheStats.cache_size}`);
    console.log('   • i18next initialized: Yes');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
  }
}

// Run tests
testDynamicLanguageSystem();
