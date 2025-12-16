#!/usr/bin/env node

/**
 * Test Dynamic i18n Endpoints in API Responses
 * Updated to use fully dynamic language system
 */

console.log('🌍 Testing Dynamic i18n Endpoints API Responses');
console.log('==============================================\n');

// Import dynamic language functions
import { getSupportedLanguagesSync, getSupportedLanguages, initI18n } from '../../src/i18n/config.js';

async function testI18nEndpoints() {
  try {
    // Initialize i18n system first
    console.log('🔍 Initializing i18n system...');
    await initI18n();

    // Get supported languages dynamically
    console.log('🔍 Discovering supported languages...');
    const languagesAsync = await getSupportedLanguages();
    const languagesSync = getSupportedLanguagesSync();

    console.log('   ✅ Languages (async):', languagesAsync);
    console.log('   ✅ Languages (sync):', languagesSync);

    const testLanguages = languagesAsync.length > 0 ? languagesAsync : languagesSync;

    console.log(`\n📋 Test Plan for ${testLanguages.length} languages:`);
    console.log('1. Start server: npm run dev');

    testLanguages.forEach((lang, index) => {
      console.log(`${index + 2}. Test ${lang}: curl "http://localhost:8788/api?lang=${lang}"`);
    });

    console.log(`${testLanguages.length + 2}. Test auto-detection: curl -H "Accept-Language: ${testLanguages[1] || 'vi'}" "http://localhost:8788/api"`);

    console.log('\n🎯 Expected Results:');
    console.log('✅ Each language should return localized endpoint descriptions');
    console.log('✅ All languages should be in supported_languages array');
    console.log('✅ Fallback to English for invalid language codes');

    return testLanguages;
  } catch (error) {
    console.error('❌ Error testing i18n endpoints:', error.message);
    return ['en']; // Fallback
  }
}

// Run the test
testI18nEndpoints().then(languages => {
  console.log(`\n🎉 Test plan generated for ${languages.length} languages!`);
  console.log('🚀 Run "npm run dev" and test the endpoints above.');
});
console.log('    }');
console.log('  }');
console.log('}');

console.log('');
console.log('📝 Vietnamese Response:');
console.log('{');
console.log('  "endpoints": {');
console.log('    "auth": {');
console.log('      "POST /api/auth/login": "Đăng nhập bằng email và mật khẩu"');
console.log('    }');
console.log('  }');
console.log('}');

console.log('');
console.log('🚀 Commands to Test:');
console.log('# Start server');
console.log('npm run dev');
console.log('');
console.log('# Test in separate terminal');
console.log('curl http://localhost:8788/ | jq .endpoints.auth');
console.log('curl -H "Accept-Language: vi" http://localhost:8788/ | jq .endpoints.auth');
console.log('');
console.log('✅ If both show different languages, i18n is working correctly!');
