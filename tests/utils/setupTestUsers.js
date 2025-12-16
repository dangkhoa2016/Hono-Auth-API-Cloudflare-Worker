/**
 * Setup Test Users with Different Roles
 * Creates test users for role-based testing
*/

import { API_ENDPOINTS, TEST_USERS, TEST_CONFIG } from '../config/testConfig.js';
import { TestClient } from './testClient.js';
import { TestLogger } from './testLogger.js';

class TestUserSetup {
  constructor() {
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.logger = new TestLogger();
    this.createdUsers = [];
  }

  /**
   * Setup all test users for role-based testing
   */
  async setupAllTestUsers() {
    this.logger.logHeader('🛠️  SETTING UP ROLE-BASED TEST USERS');

    try {
      // Step 1: Login as existing Super Admin (if exists) or use first user
      const superAdminToken = await this.getOrCreateSuperAdminToken();

      if (!superAdminToken) {
        this.logger.error('Cannot setup test users without Super Admin access');
        return null;
      }

      // Step 2: Create test users for each role
      const testUsers = await this.createTestUsers(superAdminToken);

      // Step 3: Verify roles and get tokens
      const tokens = await this.getTokensForTestUsers(testUsers);

      this.logger.success('Test user setup complete!');
      return tokens;

    } catch (error) {
      this.logger.error(`Failed to setup test users: ${error.message}`);
      return null;
    }
  }

  /**
   * Get or create Super Admin token
   */
  async getOrCreateSuperAdminToken() {
    this.logger.info('Looking for Super Admin access...');

    try {
      // Try to login with default credentials
      const loginResult = await this.client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);

      if (loginResult.success && loginResult.data.success) {
        const token = loginResult.data.data.access_token;
        this.client.setAuthToken(token);

        // Check if this user has Super Admin privileges
        const profileResult = await this.client.get(API_ENDPOINTS.me);
        if (profileResult.success && profileResult.data.success) {
          const userRole = profileResult.data.data.role;

          if (userRole === 'super_admin') {
            this.logger.success('Found existing Super Admin user');
            return token;
          } else {
            this.logger.warning(`User has role: ${userRole}, not super_admin`);
            // Try to promote this user to super_admin using database
            return await this.promoteToSuperAdmin(profileResult.data.data.id, token);
          }
        }
      }

      // If no existing Super Admin, we need to create one or use database access
      this.logger.warning('No existing Super Admin found, will use limited setup');
      return null;

    } catch (error) {
      this.logger.error(`Error getting Super Admin token: ${error.message}`);
      return null;
    }
  }

  /**
   * Attempt to promote user to Super Admin (requires database access)
   */
  async promoteToSuperAdmin(userId, currentToken) {
    this.logger.info('Attempting to promote user to super_admin...');

    // This would typically require direct database access
    // For now, we'll just note this limitation
    this.logger.warning('Manual super_admin promotion required via database');
    this.logger.info('💡 Run: UPDATE users SET role = "super_admin" WHERE id = ?');

    return currentToken; // Return current token anyway for limited testing
  }

  /**
   * Create test users for different roles
   */
  async createTestUsers(superAdminToken) {
    this.logger.info('👥 Creating test users for different roles...');

    this.client.setAuthToken(superAdminToken);

    const testUsers = {
      regular_user: {
        full_name: 'Test Regular User',
        email: `test-user-${Date.now()}@example.com`,
        password: 'password123',
        role: 'user',
        status: 'active'
      },
      admin_user: {
        full_name: 'Test Admin User',
        email: `test-admin-${Date.now()}@example.com`,
        password: 'password123',
        role: 'admin',
        status: 'active'
      },
      super_admin_user: {
        full_name: 'Test Super Admin User',
        email: `test-super-admin-${Date.now()}@example.com`,
        password: 'password123',
        role: 'super_admin',
        status: 'active'
      }
    };

    const createdUsers = {};

    // Create each test user
    for (const [roleName, userData] of Object.entries(testUsers)) {
      try {
        const result = await this.client.post(API_ENDPOINTS.adminUsers, userData);

        if (result.success && result.data.success) {
          createdUsers[roleName] = {
            ...result.data.data,
            password: userData.password // Store password for login
          };
          this.createdUsers.push(result.data.data.id);
          this.logger.success(`Created ${roleName}: ${userData.email}`);
        } else {
          this.logger.error(`Failed to create ${roleName}: ${result.data?.error || 'Unknown error'}`);
        }
      } catch (error) {
        this.logger.error(`Error creating ${roleName}: ${error.message}`);
      }
    }

    return createdUsers;
  }

  /**
   * Get authentication tokens for test users
   */
  async getTokensForTestUsers(testUsers) {
    this.logger.info('Getting authentication tokens for test users...');

    const tokens = {};

    for (const [roleName, userData] of Object.entries(testUsers)) {
      try {
        const loginResult = await this.client.post(API_ENDPOINTS.login, {
          email: userData.email,
          password: userData.password
        });

        if (loginResult.success && loginResult.data.success) {
          tokens[roleName] = {
            access_token: loginResult.data.data.access_token,
            refresh_token: loginResult.data.data.refresh_token,
            user_id: userData.id,
            email: userData.email,
            role: userData.role
          };
          this.logger.success(`Got token for ${roleName}`);
        } else {
          this.logger.error(`Failed to get token for ${roleName}`);
        }
      } catch (error) {
        this.logger.error(`Error getting token for ${roleName}: ${error.message}`);
      }
    }

    return tokens;
  }

  /**
   * Cleanup created test users
   */
  async cleanup(superAdminToken) {
    if (!superAdminToken || this.createdUsers.length === 0) {
      return;
    }

    this.logger.info('Cleaning up test users...');
    this.client.setAuthToken(superAdminToken);

    let cleanedCount = 0;
    for (const userId of this.createdUsers) {
      try {
        const result = await this.client.delete(API_ENDPOINTS.adminUsers + `s/${userId}`);
        if (result.success) {
          cleanedCount++;
        }
      } catch (error) {
        this.logger.warning(`Failed to cleanup user ${userId}`);
      }
    }

    this.logger.success(`Cleaned up ${cleanedCount}/${this.createdUsers.length} test users`);
  }

  /**
   * Display test user information
   */
  displayTestUserInfo(tokens) {
    this.logger.info('(empty message)');
    this.logger.info('📋 TEST USER INFORMATION:');
    this.logger.info('─'.repeat(50), 'info');

    for (const [roleName, tokenData] of Object.entries(tokens)) {
      this.logger.info(`${roleName.toUpperCase()}:`);
      this.logger.info(`Email: ${tokenData.email}`);
      this.logger.info(`Role: ${tokenData.role}`);
      this.logger.info(`User ID: ${tokenData.user_id}`);
      this.logger.info(`Token: ${tokenData.access_token.substring(0, 20)}...`);
      this.logger.info('(empty message)');
    }

    this.logger.info('💡 Use these tokens for role-based testing');
    this.logger.info('🔐 Save these credentials for future test runs');
  }

  /**
   * Save test user info to file
   */
  async saveTestUserInfo(tokens) {
    const fs = await import('fs');
    const path = await import('path');

    const testUserData = {
      created_at: new Date().toISOString(),
      users: tokens
    };

    const filePath = path.join(process.cwd(), 'tests', 'test-users.json');

    try {
      fs.writeFileSync(filePath, JSON.stringify(testUserData, null, 2));
      this.logger.success(`Test user info saved to: ${filePath}`);
    } catch (error) {
      this.logger.warning(`Could not save test user info: ${error.message}`);
    }
  }
}

// Export for use in other scripts
export { TestUserSetup };

// Main execution if run directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const setup = new TestUserSetup();

  setup.setupAllTestUsers()
    .then(async (tokens) => {
      if (tokens && Object.keys(tokens).length > 0) {
        setup.displayTestUserInfo(tokens);
        await setup.saveTestUserInfo(tokens);
        setup.logger.info('\n✅ Test user setup completed successfully!');
        setup.logger.info('💡 You can now run role-based tests with proper user credentials.');
      } else {
        setup.logger.info('\n❌ Test user setup failed or incomplete.');
        setup.logger.info('💡 Check your Super Admin access and try again.');
        process.exit(1);
      }
    })
    .catch((error) => {
      setup.logger.error('❌ Test user setup failed:', error);
      process.exit(1);
    });
}
