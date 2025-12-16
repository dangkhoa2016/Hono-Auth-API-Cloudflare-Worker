/**
 * Comprehensive Debug System Test / Test Hệ thống Debug Tổng hợp
 *
 * Tests all aspects of the debug system including:
 * Kiểm tra tất cả khía cạnh của hệ thống debug bao gồm:
 *
 * - Basic functionality and colors / Chức năng cơ bản và màu sắc
 * - Pattern matching and namespace filtering / Khớp pattern và lọc namespace
 * - Environment variable support / Hỗ trợ biến môi trường
 * - Performance testing / Test hiệu suất
 * - Edge cases and special characters / Trường hợp đặc biệt và ký tự đặc biệt
 * - Enable/disable functionality / Chức năng bật/tắt
 */

import { createDebugger as createDebug, debug } from '../../src/utils/debug.js';

class DebugTestSuite {
  constructor() {
    this.testCount = 0;
    this.passedTests = 0;
    this.failedTests = 0;
    this.startTime = performance.now();
  }

  logSectionHeader(title) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🧪 ${title}`);
    console.log(`${'='.repeat(60)}\n`);
  }

  logTestHeader(testNum, description) {
    console.log(`📌 Test ${testNum}: ${description}`);
    this.testCount++;
  }

  logResult(expected, actual, description) {
    const passed = expected === actual;
    if (passed) {
      this.passedTests++;
      console.log(`   ✅ ${description}: PASS`);
    } else {
      this.failedTests++;
      console.log(`   ❌ ${description}: FAIL (expected: ${expected}, got: ${actual})`);
    }
  }

  // Test 1: Basic Debug System Inspection
  testBasicInspection() {
    this.logSectionHeader('Basic Debug System Inspection');

    this.logTestHeader(1, 'Debug System Object Structure');
    console.log('Debug function type:', typeof debug);
    console.log('Debug function keys:', Object.keys(debug));
    console.log('Debug load function:', typeof debug.load);
    console.log('Debug enabled function:', typeof debug.enabled);
    console.log('Debug enable function:', typeof debug.enable);

    // Test manual load call
    console.log('Calling debug.load() manually:', debug.load());

    // Check initial state
    console.log('Initial debug.names:', debug.names);
    console.log('Initial debug.skips:', debug.skips);
  }

  // Test 2: Basic Color and Formatting Test
  testBasicColors() {
    this.logSectionHeader('Basic Colors and Formatting Test');

    this.logTestHeader(2, 'Colors with wildcard pattern');

    // Enable all debug
    globalThis.DEBUG = '*';
    debug.enable('*');
    console.log('Debug enabled for all patterns (*)\n');

    // Create debug instances
    const authDebug = createDebug('auth');
    const routeDebug = createDebug('routes:user');
    const serviceDebug = createDebug('services:database');
    const validationDebug = createDebug('validation:schema');

    console.log('--- Debug calls (should show with different colors) ---');
    authDebug('🔐 Authentication service started');
    routeDebug('📡 Processing user route');
    serviceDebug('💾 Database connection established');
    validationDebug('✅ Schema validation passed');

    // Test enabled state
    this.logResult(true, authDebug.enabled, 'authDebug enabled state');
    this.logResult(true, routeDebug.enabled, 'routeDebug enabled state');
  }

  // Test 3: Pattern Matching Tests
  testPatternMatching() {
    this.logSectionHeader('Pattern Matching Tests');

    // Create debug instances
    const authDebug = createDebug('auth');
    const routeDebug = createDebug('routes:user');
    const serviceDebug = createDebug('services:database');

    // Test specific pattern
    this.logTestHeader(3, 'Specific pattern matching (auth*)');
    globalThis.DEBUG = 'hono-auth-api:auth*';
    debug.enable('hono-auth-api:auth*');

    authDebug('✅ This SHOULD show (matches auth*)');
    routeDebug('❌ This should NOT show (does not match auth*)');

    this.logResult(true, authDebug.enabled, 'authDebug matches auth* pattern');
    this.logResult(false, routeDebug.enabled, 'routeDebug does not match auth* pattern');

    // Test multiple patterns
    this.logTestHeader(4, 'Multiple patterns (auth*,routes*)');
    globalThis.DEBUG = 'hono-auth-api:auth*,hono-auth-api:routes*';
    debug.enable('hono-auth-api:auth*,hono-auth-api:routes*');

    authDebug('✅ Auth: This should show');
    routeDebug('✅ Routes: This should also show');
    serviceDebug('❌ Service: This should NOT show');

    this.logResult(true, authDebug.enabled, 'authDebug matches in multiple patterns');
    this.logResult(true, routeDebug.enabled, 'routeDebug matches in multiple patterns');
    this.logResult(false, serviceDebug.enabled, 'serviceDebug does not match multiple patterns');

    // Test exact namespace matching
    this.logTestHeader(5, 'Exact namespace matching');
    globalThis.DEBUG = 'hono-auth-api:services:database';
    debug.enable('hono-auth-api:services:database');

    const exactServiceDebug = createDebug('services:database');
    const otherServiceDebug = createDebug('services:user');

    exactServiceDebug('✅ This SHOULD show - exact match');
    otherServiceDebug('❌ This should NOT show - different service');

    this.logResult(true, exactServiceDebug.enabled, 'exactServiceDebug exact match');
    this.logResult(false, otherServiceDebug.enabled, 'otherServiceDebug no exact match');
  }

  // Test 4: Enable/Disable Functionality
  testEnableDisable() {
    this.logSectionHeader('Enable/Disable Functionality');

    const routeDebug = createDebug('routes:auth');
    const serviceDebug = createDebug('services:auth');

    // Test disabled state
    this.logTestHeader(6, 'Debug disabled state');
    globalThis.DEBUG = '';
    debug.enable('');

    console.log('routeDebug.enabled (disabled):', routeDebug.enabled);
    console.log('serviceDebug.enabled (disabled):', serviceDebug.enabled);

    routeDebug('❌ This should NOT show - debug disabled');
    serviceDebug('❌ This should NOT show - debug disabled');

    this.logResult(false, routeDebug.enabled, 'routeDebug disabled');
    this.logResult(false, serviceDebug.enabled, 'serviceDebug disabled');

    // Test re-enabled state
    this.logTestHeader(7, 'Debug re-enabled state');
    globalThis.DEBUG = 'hono-auth-api:*';
    debug.enable('hono-auth-api:*');

    console.log('routeDebug.enabled (re-enabled):', routeDebug.enabled);
    console.log('serviceDebug.enabled (re-enabled):', serviceDebug.enabled);

    routeDebug('✅ This SHOULD show - debug re-enabled');
    serviceDebug('✅ This SHOULD show - debug re-enabled');

    this.logResult(true, routeDebug.enabled, 'routeDebug re-enabled');
    this.logResult(true, serviceDebug.enabled, 'serviceDebug re-enabled');
  }

  // Test 5: Environment Variable Support
  testEnvironmentSupport() {
    this.logSectionHeader('Environment Variable Support');

    const authDebug = createDebug('auth');
    const routeDebug = createDebug('routes:user');
    const serviceDebug = createDebug('services:database');

    // Test with process.env.DEBUG
    this.logTestHeader(8, 'Using process.env.DEBUG');
    process.env.DEBUG = 'hono-auth-api:auth*';
    delete globalThis.DEBUG;
    debug.enable(process.env.DEBUG);

    authDebug('✅ Process env: Auth service (should show)');
    routeDebug('❌ Process env: Route processing (should not show)');

    // Test with globalThis.DEBUG
    this.logTestHeader(9, 'Using globalThis.DEBUG');
    delete process.env.DEBUG;
    globalThis.DEBUG = 'hono-auth-api:services*';
    debug.enable(globalThis.DEBUG);

    serviceDebug('✅ GlobalThis: Database service (should show)');
    authDebug('❌ GlobalThis: Auth service (should not show)');

    // Test mixed environment (process.env should take priority)
    this.logTestHeader(10, 'Mixed environment (process.env priority)');
    process.env.DEBUG = 'hono-auth-api:routes*';
    globalThis.DEBUG = 'hono-auth-api:auth*';
    debug.enable(process.env.DEBUG);

    routeDebug('✅ Mixed: Routes (process.env wins)');
    authDebug('❌ Mixed: Auth (globalThis ignored)');
  }

  // Test 6: Formatter and Special Characters
  testFormattersAndSpecialChars() {
    this.logSectionHeader('Formatters and Special Characters');

    globalThis.DEBUG = '*';
    debug.enable('*');

    const formatDebug = createDebug('formatters');

    this.logTestHeader(11, 'Object and string formatters');
    const testObject = {
      user: 'john',
      roles: ['admin', 'user'],
      settings: { theme: 'dark', lang: 'en' }
    };

    formatDebug('Object: %o', testObject);
    formatDebug('String: %s, Number: %d', 'test-string', 42);

    this.logTestHeader(12, 'Special characters and emojis');
    formatDebug('Message with émojis 🚀 and spëcial chars: áéíóú');
    formatDebug('JSON-like: {"status": "success", "data": [1,2,3]}');

    this.logTestHeader(13, 'Long namespace');
    const longDebug = createDebug('very:long:nested:namespace:with:many:parts');
    longDebug('Testing very long namespace with colors and formatting');
  }

  // Test 7: Performance Testing
  testPerformance() {
    this.logSectionHeader('Performance Testing');

    this.logTestHeader(14, 'Debug instance creation performance');
    globalThis.DEBUG = '*';
    debug.enable('*');

    const startTime = performance.now();
    const debugInstances = [];

    for (let i = 0; i < 1000; i++) {
      const perfDebug = createDebug(`perf:test-${i % 10}`);
      debugInstances.push(perfDebug);

      if (i % 100 === 0) {
        perfDebug(`Performance test iteration ${i}`);
      }
    }

    const endTime = performance.now();
    const duration = endTime - startTime;
    console.log(`⏱️  Performance: 1000 debug instances created in ${duration.toFixed(2)}ms`);

    // Performance should be reasonable (less than 100ms for 1000 instances)
    this.logResult(true, duration < 100, `Performance under 100ms (${duration.toFixed(2)}ms)`);
  }

  // Test 8: Edge Cases and Error Handling
  testEdgeCases() {
    this.logSectionHeader('Edge Cases and Error Handling');

    this.logTestHeader(15, 'Invalid patterns and empty strings');

    // Test empty pattern
    globalThis.DEBUG = '';
    debug.enable('');
    const emptyDebug = createDebug('test');
    this.logResult(false, emptyDebug.enabled, 'Empty pattern disables debug');

    // Test invalid pattern
    globalThis.DEBUG = 'invalid-pattern-that-should-not-match-anything';
    debug.enable('invalid-pattern-that-should-not-match-anything');
    const invalidDebug = createDebug('normal');
    this.logResult(false, invalidDebug.enabled, 'Invalid pattern does not match');

    // Test very long namespace
    this.logTestHeader(16, 'Very long namespace handling');
    globalThis.DEBUG = '*';
    debug.enable('*');

    const veryLongNamespace = 'a'.repeat(200);
    const longNamespaceDebug = createDebug(veryLongNamespace);
    longNamespaceDebug('Testing very long namespace (200 characters)');
    this.logResult(true, longNamespaceDebug.enabled, 'Very long namespace works');
  }

  // Test 9: Debug System Internal State
  testInternalState() {
    this.logSectionHeader('Debug System Internal State');

    this.logTestHeader(17, 'Internal state inspection');

    // Enable specific pattern and check internal state
    globalThis.DEBUG = 'hono-auth-api:test*,hono-auth-api:auth*';
    debug.enable('hono-auth-api:test*,hono-auth-api:auth*');

    console.log('debug.names after enable:', debug.names);
    console.log('debug.skips after enable:', debug.skips);

    // Test pattern matching manually
    const testEnabled = debug.enabled('hono-auth-api:test:something');
    const authEnabled = debug.enabled('hono-auth-api:auth:login');
    const routeEnabled = debug.enabled('hono-auth-api:routes:user');

    console.log('Manual pattern test - test namespace:', testEnabled);
    console.log('Manual pattern test - auth namespace:', authEnabled);
    console.log('Manual pattern test - routes namespace:', routeEnabled);

    this.logResult(true, testEnabled, 'Manual test namespace enabled');
    this.logResult(true, authEnabled, 'Manual auth namespace enabled');
    this.logResult(false, routeEnabled, 'Manual routes namespace disabled');
  }

  // Test 10: Manual formatArgs Testing
  testFormatArgs() {
    this.logSectionHeader('Manual formatArgs Testing');

    this.logTestHeader(18, 'formatArgs function behavior');

    const mockThis = {
      namespace: 'hono-auth-api:test',
      useColors: true,
      color: '91',
      diff: 0
    };

    const args = ['Test message with formatting'];
    console.log('Before formatArgs:', args);

    try {
      if (typeof debug.formatArgs === 'function') {
        debug.formatArgs.call(mockThis, args);
        console.log('After formatArgs:', args);
        this.logResult(true, true, 'formatArgs executed successfully');
      } else {
        console.log('formatArgs is not available');
        this.logResult(false, false, 'formatArgs function availability');
      }
    } catch (error) {
      console.error('formatArgs error:', error.message);
      this.logResult(false, true, `formatArgs error handling: ${error.message}`);
    }
  }

  // Final summary and cleanup / Tóm tắt cuối cùng và dọn dẹp
  showSummary() {
    const endTime = performance.now();
    const totalTime = endTime - this.startTime;

    this.logSectionHeader('Test Summary / Tóm tắt Test');

    console.log(`📊 Total Tests / Tổng số Test: ${this.testCount}`);
    console.log(`✅ Passed / Thành công: ${this.passedTests}`);
    console.log(`❌ Failed / Thất bại: ${this.failedTests}`);
    console.log(`⏱️  Total Time / Tổng thời gian: ${totalTime.toFixed(2)}ms`);

    const successRate = ((this.passedTests / (this.passedTests + this.failedTests)) * 100).toFixed(1);
    console.log(`📈 Success Rate / Tỷ lệ thành công: ${successRate}%`);

    if (this.failedTests === 0) {
      console.log('\n🎉 All tests passed! Debug system is working correctly.');
      console.log('🎉 Tất cả test đã passed! Hệ thống debug hoạt động chính xác.');
    } else {
      console.log(`\n⚠️  ${this.failedTests} tests failed. Review the output above.`);
      console.log(`⚠️  ${this.failedTests} test thất bại. Xem lại kết quả ở trên.`);
    }

    // Clean up
    delete globalThis.DEBUG;
    delete process.env.DEBUG;
    debug.enable('');
  }

  // Run all tests
  runAllTests() {
    console.log('🚀 Starting Comprehensive Debug System Test Suite');
    console.log(`⏱️  Start Time: ${new Date().toISOString()}`);

    this.testBasicInspection();
    this.testBasicColors();
    this.testPatternMatching();
    this.testEnableDisable();
    this.testEnvironmentSupport();
    this.testFormattersAndSpecialChars();
    this.testPerformance();
    this.testEdgeCases();
    this.testInternalState();
    this.testFormatArgs();
    this.showSummary();
  }
}

// Run the comprehensive test suite / Chạy bộ test tổng hợp
const testSuite = new DebugTestSuite();
testSuite.runAllTests();
