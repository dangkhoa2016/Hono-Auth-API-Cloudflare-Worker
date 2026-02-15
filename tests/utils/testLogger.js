/**
 * Test Logger
 * Utilities for formatted test output
*/

class TestLogger {
  constructor() {
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  /**
   * Log test suite header
   */
  logSuiteHeader(suiteName) {
    console.log(`\n🧪 ${suiteName}`);
    console.log('='.repeat(suiteName.length + 3));
  }

  /**
   * Log main header
   */
  logHeader(headerText) {
    console.log(`\n${headerText}`);
    console.log('='.repeat(headerText.length));
  }

  /**
   * Log section header
   */
  logSectionHeader(sectionText) {
    console.log(`\n${sectionText}`);
    console.log('-'.repeat(sectionText.length));
  }

  /**
   * Log custom message
   */
  logMessage(message, type = 'info') {
    const icons = {
      info: 'ℹ️',
      success: '✅',
      error: '❌',
      warning: '⚠️',
      highlight: '🚀'
    };

    console.log(`${icons[type] || icons.info} ${message}`);
  }

  /**
   * Log test summary
   */
  logSummary() {
    console.log('\n📊 Test Summary');
    console.log('================');
    console.log(`Total Tests: ${this.testCount}`);
    console.log(`Passed: ${this.passCount}`);
    console.log(`Failed: ${this.failCount}`);
    console.log(`Success Rate: ${((this.passCount / this.testCount) * 100).toFixed(1)}%`);

    if (this.failCount === 0) {
      console.log('\n🎉 All tests passed!');
    } else {
      console.log(`\n⚠️  ${this.failCount} test(s) failed`);
    }
  }

  /**
   * Record test result
   */
  recordResult(passed) {
    // Increment total test count
    this.testCount++;
    if (passed) {
      this.passCount++;
    } else {
      this.failCount++;
    }
  }

  /**
   * Reset counters
   */
  reset() {
    this.testCount = 0;
    this.passCount = 0;
    this.failCount = 0;
  }

  info(message) {
    this.logMessage(message, 'info');
  }
  success(message) {
    this.logMessage(message, 'success');
  }
  error(message) {
    this.logMessage(message, 'error');
  }
  warning(message) {
    this.logMessage(message, 'warning');
  }

  /**
   * Log section header
   */
  section(sectionText) {
    this.logSectionHeader(sectionText);
  }
}

export { TestLogger };
