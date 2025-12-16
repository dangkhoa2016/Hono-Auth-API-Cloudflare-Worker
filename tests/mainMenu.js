#!/usr/bin/env node

/**
 * Test Suite Main Menu & Test Runner
 * Interactive CLI for selecting and running test suites
 *
 * Available test suites:
 * q. Quick Tests - Fast smoke tests for development
 * s. Simple Tests - Basic functionality tests
 * 1. System Tests - Health checks and basic connectivity
 * 2. Authentication Tests - Login, logout, JWT validation
 * 3. Regular User Role Tests - Regular user functionality
 * 4. Admin User Role Tests - Admin user management
 * 5. Super Admin User Role Tests - Full system access tests
 * 6. Security Tests - XSS, injection, rate limiting
 * 7. Translation Tests - i18n and localization
 * 7a. Admin Message Translation Tests - i18n admin message validation & role translations
 * 8. Role-Based Tests - Role-specific test suites
 * 9. Performance Tests - Load testing and benchmarks
 * 10. Integration Tests - End-to-end workflows
 * 11. Validation Tests - Zod schema validation
 * 12. Zod Validation Tests - Additional validation tests
 * 13. Error Handling Tests - enableDetailedErrors feature flag testing
 * 14. XSS Security Tests - Cross-site scripting protection
 * 15. KV Admin Tests - Configuration management
 * 16. KV Audit Config Tests - KV audit configuration
 * 17. Security Incident Tests - Incident management
 * 18. Audit System Tests - Complete audit functionality
 * 19. Simple Audit Tests - Basic audit functionality
 * 20. Advanced Audit Tests - Analytics, compliance, archival
 * 21. Audit Performance Tests - Audit system performance
 * 22. Audit Log Service Tests - Audit log service integration
 * 23. Archival Service Tests - Data archival and retention
 * 24. Optimized Service Tests - Service optimization
 * 25. Real-time Monitoring Tests - Live monitoring and alerts
 * 26. Alert System Config Tests - Alert system configuration
 * 27. i18n Validator Extension Tests - i18n validator extensions
 * 28. Unified Test Suite - All tests combined
 * 29. Multi-Language Validation Error Tests - Validation error messages in multiple languages
 * 30. Login Message Format Tests - Login success message formatting with user details and timestamps
 *
 * Features:
 * - Interactive test selection
 * - Real-time test execution
 * - Detailed result reporting
 * - Environment-specific testing
*/

import { createInterface } from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TEST_CONFIG } from './config/testConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

// Test context menu options
const testContexts = {
  'q': {
    name: 'Quick Tests',
    description: 'Fast smoke tests for development',
    file: 'quickTest.js'
  },
  's': {
    name: 'Simple Tests',
    description: 'Basic functionality tests',
    file: 'simpleTest.js'
  },
  '1': {
    name: 'System Tests',
    description: 'Core system functionality, health checks, environment tests',
    file: 'systemTest.js'
  },
  '2': {
    name: 'Authentication Tests',
    description: 'Login, logout, JWT tokens, password validation',
    file: 'authTest.js'
  },
  '3': {
    name: 'Regular User Role Tests',
    description: 'Regular user functionality - Limited access, personal profile management only',
    file: 'regularUserTest.js'
  },
  '4': {
    name: 'Admin User Role Tests',
    description: 'Admin functionality - User & dashboard management, limited Super Admin access',
    file: 'adminUserTest.js'
  },
  '5': {
    name: 'Super Admin User Role Tests',
    description: 'Super Admin functionality - Full system control, all users & roles management',
    file: 'superAdminUserTest.js'
  },
  '6': {
    name: 'Security Tests',
    description: 'Rate limiting, input validation, security headers',
    file: 'securityTest.js'
  },
  '7': {
    name: 'Comprehensive i18n Tests',
    description: 'Internationalization, language detection, translations',
    file: 'comprehensiveI18nTest.js'
  },
  '7a': {
    name: 'Admin Message Translation Tests',
    description: 'i18n admin message validation & role translations',
    file: 'adminMessageTranslationTest.js'
  },
  '8': {
    name: 'Role-Based Tests',
    description: 'Role-specific test suites (user, admin, super-admin)',
    file: 'roleTest.js'
  },
  '9': {
    name: 'Performance Tests',
    description: 'Load testing, response times, concurrent requests',
    file: 'performanceTest.js'
  },
  '10': {
    name: 'Integration Tests',
    description: 'End-to-end workflows, component integration',
    file: 'integrationTest.js'
  },
  '11': {
    name: 'Validation Tests',
    description: 'Zod schema validation, input sanitization',
    file: 'validationTest.js'
  },
  '12': {
    name: 'Zod Validation Tests',
    description: 'Additional Zod schema validation tests',
    file: 'zodValidationTest.js'
  },
  '13': {
    name: 'Error Handling Tests',
    description: 'Error handling with enableDetailedErrors feature flag',
    file: 'errorHandlingTest.js'
  },
  '14': {
    name: 'XSS Security Tests',
    description: 'Cross-site scripting (XSS) protection, input validation',
    file: 'xssSecurityTest.js'
  },
  '15': {
    name: 'KV Admin Tests',
    description: 'KV configuration management (super_admin only)',
    file: 'kvAdminTest.js'
  },
  '16': {
    name: 'KV Audit Config Tests',
    description: 'KV audit configuration testing',
    file: 'kvAuditConfigTest.js'
  },
  '17': {
    name: 'Security Incident Tests',
    description: 'Incident detection, response, and management',
    file: 'securityIncidentTest.js'
  },
  '18': {
    name: 'Audit System Tests',
    description: 'Complete audit functionality and logging',
    file: 'auditSystemTest.js'
  },
  '19': {
    name: 'Simple Audit Tests',
    description: 'Basic audit functionality tests',
    file: 'simpleAuditTest.js'
  },
  // Option 20 (Core Audit Tests) removed after merging into auditSystemTest.js
  '20': {
    name: 'Advanced Audit Tests',
    description: 'Analytics, compliance, archival (comprehensive)',
    file: 'advancedAuditComprehensiveTest.js'
  },
  '21': {
    name: 'Audit Performance Tests',
    description: 'Audit system performance and load testing',
    file: 'auditPerformanceTest.js'
  },
  '22': {
    name: 'Audit Log Service Tests',
    description: 'Audit log service integration testing',
    file: 'auditLogServiceIntegrationTest.js'
  },
  '23': {
    name: 'Archival Service Tests',
    description: 'Data archival and retention testing',
    file: 'archivalServiceTest.js'
  },
  '24': {
    name: 'Optimized Service Tests',
    description: 'Service optimization testing',
    file: 'optimizedServiceTest.js'
  },
  '25': {
    name: 'Real-time Monitoring Tests',
    description: 'Live monitoring, alerts, and dashboard',
    file: 'realtimeMonitoringTest.js'
  },
  '26': {
    name: 'Alert System Config Tests',
    description: 'Alert system configuration integration',
    file: 'alertSystemConfigIntegrationTest.js'
  },
  '27': {
    name: 'i18n Validator Extension Tests',
    description: 'Internationalization validator extensions',
    file: 'i18nValidatorExtensionTest.js'
  },
  '28': {
    name: 'Unified Test Suite',
    description: 'All tests combined in comprehensive suite',
    file: 'unifiedTestSuite.js'
  },
  '29': {
    name: 'Multi-Language Validation Error Tests',
    description: 'Validation error messages in Japanese, German, French, Spanish, Thai',
    file: 'multiLanguageValidationErrorTest.js'
  },
  '30': {
    name: 'Login Message Format Tests',
    description: 'Login success message formatting with user details and timestamps',
    file: 'loginMessageFormatTest.js'
  },
};

function displayMenu() {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 HONO AUTH API - TEST SUITE MENU');
  console.log('='.repeat(60));
  console.log();

  Object.entries(testContexts).forEach(([key, context]) => {
    const keyDisplay = key.padEnd(3);
    const nameDisplay = context.name.padEnd(25);
    console.log(`  ${keyDisplay} - ${nameDisplay} ${context.description}`);
  });

  console.log();
  console.log('  x   - Exit');
  console.log();
  console.log('='.repeat(60));
}

function runTest(testFile) {
  const testPath = join(__dirname, testFile);
  console.log(`\n🚀 Running ${testFile}...\n`);

  try {
    // Use spawn for better output streaming
    execSync(`node "${testPath}"`, {
      stdio: 'inherit',
      cwd: __dirname
    });
    console.log(`\n✅ ${testFile} completed successfully!\n`);
  } catch (error) {
    console.error(`\n❌ ${testFile} failed with exit code: ${error.status}\n`);
  }
}

function askForSelection() {
  rl.question('Select a test context (enter number/letter): ', (answer) => {
    const selection = answer.toLowerCase().trim();

    if (selection === 'x') {
      console.log('\n👋 Goodbye!\n');
      rl.close();
      return;
    }

    const context = testContexts[selection];
    if (context) {
      console.log(`\n📋 Selected: ${context.name}`);
      console.log(`📝 Description: ${context.description}\n`);

      rl.question('Do you want to run this test? (y/n): ', (confirm) => {
        if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
          runTest(context.file);
        }

        // Return to menu
        setTimeout(() => {
          displayMenu();
          askForSelection();
        }, 1000);
      });
    } else {
      console.log('\n❌ Invalid selection. Please try again.\n');
      askForSelection();
    }
  });
}

// Main execution
function main() {
  console.log('🔧 Hono Auth API Test Suite');
  console.log('📍 Environment: ' + TEST_CONFIG.currentEnv);
  console.log('🌐 API Base URL: ' + TEST_CONFIG.baseUrl);

  displayMenu();
  askForSelection();
}

// Handle cleanup
process.on('SIGINT', () => {
  console.log('\n\n👋 Test menu interrupted. Goodbye!\n');
  rl.close();
  process.exit(0);
});

main();
