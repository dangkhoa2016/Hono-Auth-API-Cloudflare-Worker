# Debug Test Suite - Organized
📖 **Language**: English | [Tiếng Việt](./README_vi.md)

## Overview

This directory contains a comprehensive debug system testing suite that has been organized from multiple individual debug test files into a single organized test file.

## Main Files

### `comprehensive_debug_test.js` 
Comprehensive test file containing all debug tests organized into 18 different test cases:

1. **Basic System Inspection** - Basic debug system structure checks
2. **Basic Colors** - Basic color and formatting tests
3. **Pattern Matching** - Various pattern matching tests
4. **Enable/Disable** - Debug enable/disable functionality tests  
5. **Environment Support** - Environment variable support tests
6. **Formatters** - Formatter and special character tests
7. **Performance** - Performance tests when creating multiple debug instances
8. **Edge Cases** - Edge case scenario tests
9. **Internal State** - Debug system internal state tests
10. **formatArgs** - formatArgs function tests

### `run_comprehensive_test.sh`
Runner script for easy test execution.

## Usage

### Running Comprehensive Tests
```bash
# From project root directory
node tools/debug_log/comprehensive_debug_test.js

# Or use runner script
bash tools/debug_log/run_comprehensive_test.sh
```

### Running from package.json
You can add this script to `package.json`:
```json
{
  "scripts": {
    "tool:debug": "node tools/debug_log/comprehensive_debug_test.js",
    "tool:debug:run": "bash tools/debug_log/run_comprehensive_test.sh"
  }
}
```

## Test Results

The test suite will display:
- ✅ Passed tests in green
- ❌ Failed tests in red  
- 📊 Summary with total tests, pass/fail rate
- ⏱️ Execution time
- 🎨 Debug output with different colors for each namespace

## Benefits of Consolidation

1. **Better Organization** - All tests in one structured file
2. **Easier Maintenance** - Only need to maintain 1 file instead of multiple files
3. **Better Reporting** - Comprehensive summary report with statistics
4. **Performance Tracking** - Execution time measurements
5. **Standardized Output** - Consistent output format
6. **Error Handling** - Better error handling with try/catch

## Running Specific Tests

In the future, it can be extended to run specific tests:
```javascript
// Can add command line arguments
const args = process.argv.slice(2);
if (args.includes('--colors-only')) {
  testSuite.testBasicColors();
} else if (args.includes('--patterns-only')) {
  testSuite.testPatternMatching();
} else {
  testSuite.runAllTests();
}
```

## Integration with Project

This debug test suite is part of the Hono Auth Worker project's comprehensive testing framework. It validates the debug logging system used throughout the application.

**Related NPM Scripts:**
- `npm run tool:debug` - Run debug tests
- `npm run tool:debug:run` - Run with shell script

**Debug Namespaces Used in Project:**
- `hono-auth-api:*` - All debug output
- `hono-auth-api:routes:*` - Route-specific logging  
- `hono-auth-api:services:*` - Service layer logging
- `hono-auth-api:validation:*` - Validation logging
- `hono-auth-api:i18n:*` - i18n system logging

## 🌍 Language Support

This documentation is available in multiple languages:
- **English**: [README.md](./README.md) (this file)
- **Tiếng Việt**: [README_vi.md](./README_vi.md)
