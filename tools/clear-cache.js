
import { TestClient } from '../tests/utils/testClient.js';
import { TEST_USERS, TEST_CONFIG, API_ENDPOINTS } from '../tests/config/testConfig.js';

async function clearCache() {
  console.log('Clearing service caches...');
  const client = new TestClient(TEST_CONFIG.baseUrl);

  try {
    // Login as super admin
    const loginResponse = await client.post(API_ENDPOINTS.login, TEST_USERS.super_admin);
    if (loginResponse.status !== 200) {
      console.error('Failed to login as super admin:', loginResponse.data);
      process.exit(1);
    }

    const token = loginResponse.data.data.access_token;
    client.setAuthToken(token);

    // Clear cache
    const response = await client.post(API_ENDPOINTS.kvAdminConfigsCacheClear, {});

    if (response.status === 200) {
      console.log('Cache cleared successfully');
    } else {
      console.error('Failed to clear cache:', response.data);
      process.exit(1);
    }
  } catch (error) {
    console.error('Error clearing cache:', error.message);
    process.exit(1);
  }
}

clearCache();
