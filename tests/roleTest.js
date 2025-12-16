#!/usr/bin/env node

/**
 * Role-Based Access Control (RBAC) Test Suite
 * Tests role-based authorization across all endpoints
 *
 * Endpoints tested (by role access level):
 * - /api/auth/* - All roles (registration, login, logout)
 * - /api/user/* - User+ roles (profile, settings, password change)
 * - /api/admin/* - Admin+ roles (user management, stats, dashboard)
 * - /api/kv-admin/* - Super admin only (system configuration)
 * - /api/audit/* - Admin+ roles (audit logs, search, export)
 * - /api/advanced-audit/* - Super admin preferred (analytics, compliance)
 * - /api/realtime-monitoring/* - Super admin only (monitoring, alerts)
 * - /api/security-incident/* - Admin+ roles (incident management)
 *
 * Test coverage:
 * - Cross-endpoint role validation across all API routes
 * - Permission hierarchy enforcement (user < admin < super_admin)
 * - Role-specific access control validation
 * - Role boundary enforcement and unauthorized access prevention
 * - Privilege escalation prevention and security testing
 * - Role-based data filtering and access restrictions
 * - Interactive role test menu for individual role testing
 * - Automated sequential execution of all role test suites
*/

import { createInterface } from 'readline';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { TestLogger } from './utils/testLogger.js';
import { TestClient } from './utils/testClient.js';
import { TestAssertions } from './utils/testAssertions.js';
import { TEST_CONFIG } from './config/testConfig.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

class RoleTests {
  constructor() {
    // Initialize in standard order
    this.logger = new TestLogger();
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;

    // Test-specific properties
    this.rolesPath = join(__dirname);
    this.availableRoles = {
      '1': {
        name: 'Regular User Role tests',
        description: 'Test Regular User Role permissions and functionality',
        file: 'regularUserTest.js'
      },
      '2': {
        name: 'Admin User Role tests',
        description: 'Test Admin User Role permissions and functionality',
        file: 'adminUserTest.js'
      },
      '3': {
        name: 'Super Admin User Role tests',
        description: 'Test Super Admin User Role permissions and functionality',
        file: 'superAdminUserTest.js'
      },
      'a': {
        name: 'All Role Tests',
        description: 'Run all role-based tests sequentially',
        file: 'all'
      }
    };
  }

  async runAll() {
    this.logger.logSuiteHeader('👥 Role-Based Access Control (RBAC) Tests');

    if (process.argv.includes('--interactive') || process.argv.includes('-i')) {
      return this.runInteractive();
    }

    // Run all role tests by default
    const result = await this.runAllRoleTests();

    this.logger.logSummary();

    if (this.logger.failCount > 0) {
      process.exit(1);
    } else {
      process.exit(0);
    }

    return result;
  }

  async runAllRoleTests() {
    this.logger.info('Running all role-based tests...');

    const roleFiles = ['regularUserTest.js', 'adminUserTest.js', 'superAdminUserTest.js'];

    for (const roleFile of roleFiles) {
      this.logger.info(`📋 Running ${roleFile}...`);

      try {
        const testPath = join(this.rolesPath, roleFile);
        execSync(`node "${testPath}"`, {
          stdio: 'inherit',
          cwd: this.rolesPath
        });
        this.logger.recordResult(true);
        this.logger.success(`${roleFile} completed successfully`);
      } catch (error) {
        this.logger.recordResult(false);
        this.logger.error(`${roleFile} failed with exit code: ${error.status}`);
      }
    }

    return true;
  }

  displayRoleMenu() {
    this.logger.info('\n' + '='.repeat(60));
    this.logger.info('👥 ROLE-BASED TESTS MENU');
    this.logger.info('='.repeat(60));
    this.logger.info('');

    Object.entries(this.availableRoles).forEach(([key, role]) => {
      const keyDisplay = key.padEnd(3);
      const nameDisplay = role.name.padEnd(25);
      this.logger.info(`  ${keyDisplay} - ${nameDisplay} ${role.description}`);
    });

    this.logger.info('');
    this.logger.info('  x   - Exit');
    this.logger.info('');
    this.logger.info('='.repeat(60));
  }

  runRoleTest(roleFile) {
    if (roleFile === 'all') {
      return this.runAllRoleTests();
    }

    const testPath = join(this.rolesPath, roleFile);
    this.logger.info(`\n🚀 Running ${roleFile}...\n`);

    try {
      execSync(`node "${testPath}"`, {
        stdio: 'inherit',
        cwd: this.rolesPath
      });
      this.logger.success(`\n✅ ${roleFile} completed successfully!\n`);
    } catch (error) {
      this.logger.error(`\n❌ ${roleFile} failed with exit code: ${error.status}\n`);
    }
  }

  askForRoleSelection() {
    rl.question('Select a role test (enter number/letter): ', (answer) => {
      const selection = answer.toLowerCase().trim();

      if (selection === 'x') {
        this.logger.info('\n👋 Goodbye!\n');
        rl.close();
        process.exit(0);
        return;
      }

      const role = this.availableRoles[selection];
      if (role) {
        this.logger.info(`\n📋 Selected: ${role.name}`);
        this.logger.info(`📝 Description: ${role.description}\n`);

        rl.question('Do you want to run this role test? (y/n): ', (confirm) => {
          if (confirm.toLowerCase() === 'y' || confirm.toLowerCase() === 'yes') {
            this.runRoleTest(role.file);
          }

          // Return to menu
          setTimeout(() => {
            this.displayRoleMenu();
            this.askForRoleSelection();
          }, 1000);
        });
      } else {
        this.logger.error('\n❌ Invalid selection. Please try again.\n');
        this.askForRoleSelection();
      }
    });
  }

  async runInteractive() {
    this.logger.info('🔧 Role-Based Test Suite');
    this.logger.info('📍 Environment: ' + TEST_CONFIG.currentEnv);
    this.logger.info('🌐 API Base URL: ' + TEST_CONFIG.baseUrl);

    this.displayRoleMenu();
    this.askForRoleSelection();

    // Handle cleanup
    process.on('SIGINT', () => {
      this.logger.info('\n\n👋 Role test menu interrupted. Goodbye!\n');
      rl.close();
      process.exit(0);
    });
  }

  async testRolePermissions() {
    this.logger.info('🔐 Testing role permissions...');

    // Basic role permission tests
    const roleTests = [
      this.testRegularUserRolePermissions,
      this.testAdminUserRolePermissions,
      this.testSuperAdminUserRolePermissions,
      this.testRoleInheritance,
      this.testRoleRestrictions
    ];

    let passed = 0;
    let failed = 0;

    for (const test of roleTests) {
      try {
        await test.call(this);
        passed++;
        this.logger.success(`✅ ${test.name} passed`);
      } catch (error) {
        failed++;
        this.logger.error(`[testRolePermissions] ${test.name} failed: ${error.message}`);
      }
    }

    this.logger.info('\n📊 Role Permission Tests Summary:');
    this.logger.info(`   ✅ Passed: ${passed}`);
    this.logger.info(`   ❌ Failed: ${failed}`);
    this.logger.info(`   📈 Success Rate: ${((passed / (passed + failed)) * 100).toFixed(1)}%`);

    return failed === 0;
  }

  async testRegularUserRolePermissions() {
    this.logger.info('Testing user role permissions...');
    // This would test basic user permissions
    // For now, just verify the role test file exists
    const userRoleTestPath = join(this.rolesPath, 'userRoleTests.js');
    try {
      await import(userRoleTestPath);
      this.logger.info('Regular User Role test file exists and is loadable');
    } catch (error) {
      this.logger.error(`[testRegularUserRolePermissions] failed: ${error.message}`);
      throw new Error('Regular User Role test file is missing or invalid');
    }
  }

  async testAdminUserRolePermissions() {
    this.logger.info('Testing admin role permissions...');
    // This would test admin permissions
    const adminRoleTestPath = join(this.rolesPath, 'adminRoleTests.js');
    try {
      await import(adminRoleTestPath);
      this.logger.info('Admin User Role test file exists and is loadable');
    } catch (error) {
      this.logger.error(`[testAdminUserRolePermissions] failed: ${error.message}`);
      throw new Error('Admin User Role test file is missing or invalid');
    }
  }

  async testSuperAdminUserRolePermissions() {
    this.logger.info('Testing Super Admin User Role permissions...');
    // This would test Super Admin permissions
    const superAdminRoleTestPath = join(this.rolesPath, 'superAdminRoleTests.js');
    try {
      await import(superAdminRoleTestPath);
      this.logger.info('Super Admin User Role test file exists and is loadable');
    } catch (error) {
      this.logger.error(`[testSuperAdminUserRolePermissions] failed: ${error.message}`);
      throw new Error('Super Admin User Role test file is missing or invalid');
    }
  }

  async testRoleInheritance() {
    this.logger.info('Testing role inheritance...');
    // Test that higher roles inherit lower role permissions
    // This is a placeholder for actual inheritance testing
    this.logger.info('Role inheritance testing placeholder - implement based on your role system');
  }

  async testRoleRestrictions() {
    this.logger.info('Testing role restrictions...');
    // Test that roles are properly restricted
    // This is a placeholder for actual restriction testing
    this.logger.info('Role restriction testing placeholder - implement based on your role system');
  }
}

// Run tests if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const roleTests = new RoleTests();
  roleTests.runAll().catch(error => {
    console.error('Test execution failed:', error);
    process.exit(1);
  });
}

export { RoleTests };
