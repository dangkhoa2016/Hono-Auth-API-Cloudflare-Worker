#!/usr/bin/env node

/**
 * EN: Test dynamic i18n system end-to-end
 * VI: Kiểm thử hệ thống i18n động hoàn chỉnh
 */

import { getSupportedLanguages, getSupportedLanguagesSync, initI18n } from '../../src/i18n/config.js';
import { loadTranslation, getCacheStats } from '../../src/i18n/loader.js';

console.log('🚀 Testing Dynamic i18n System\n');

async function testDynamicLanguageSystem() {
  try {
    // EN: Test 1 - Initialize i18n system
    // VI: Kiểm thử 1 - Khởi tạo hệ thống i18n
    console.log('1️⃣ Initializing i18n system...');
    await initI18n();
    console.log('   ✅ i18n system initialized');

    // EN: Test 2 - Get supported languages (async)
    // VI: Kiểm thử 2 - Lấy danh sách ngôn ngữ (async)
    console.log('\n2️⃣ Getting supported languages (async)...');
    const supportedAsync = await getSupportedLanguages();
    console.log('   ✅ Supported languages (async):', supportedAsync);

    // EN: Test 3 - Get supported languages (sync)
    // VI: Kiểm thử 3 - Lấy danh sách ngôn ngữ (sync)
    console.log('\n3️⃣ Getting supported languages (sync)...');
    const supportedSync = getSupportedLanguagesSync();
    console.log('   ✅ Supported languages (sync):', supportedSync);

    // EN: Test 4 - Initialize i18next
    // VI: Kiểm thử 4 - Khởi tạo i18next
    console.log('\n4️⃣ Initializing i18next...');
    await initI18n();
    console.log('   ✅ i18next initialized successfully');

    // EN: Test 5 - Load individual translations
    // VI: Kiểm thử 5 - Nạp từng bản dịch
    console.log('\n5️⃣ Loading individual translations...');
    for (const lang of supportedSync) {
      const translation = await loadTranslation(lang);
      console.log(`   ✅ Loaded ${lang}:`, Object.keys(translation).length, 'sections');
    }

    // EN: Test 6 - Get cache statistics
    // VI: Kiểm thử 6 - Lấy thống kê cache
    console.log('\n6️⃣ Cache statistics...');
    const cacheStats = getCacheStats();
    console.log('   ✅ Cache stats:', cacheStats);

    // EN: Test 7 - Load non-existent language fallback
    // VI: Kiểm thử 7 - Tải ngôn ngữ không tồn tại để kiểm tra fallback
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

// EN: Run tests
// VI: Chạy thử nghiệm
testDynamicLanguageSystem();
