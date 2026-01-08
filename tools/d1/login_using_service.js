import { AuthService } from '../../src/services/authService.js';
import { getPlatformProxy } from 'wrangler';
import { createKvConfigService } from '../../src/utils/serviceFactory.js';

// test env credentials
const userEmail = 'test-superadmin@example.com';
const userPassword = 'password123';

// development env credentials
// const userEmail = 'super@admin.local';
// const userPassword = 'password123';



(async () => {
  const { env } = await getPlatformProxy({ environment: 'test' });
  // const { env } = await getPlatformProxy({ environment: 'development' });
  const kvConfig = createKvConfigService(env);
  // disable rate limiting for testing
  await kvConfig.set('RATE_LIMIT_DISABLED', 'true');

  const authService = new AuthService(env);

  const loginResult = await authService.login(userEmail, userPassword, null);
  if (!loginResult.success) {
    console.error('Login failed:', loginResult);
    process.exit(1);
  }
  console.log('Login successful:', loginResult.data);

  // refresh the user token
  const refreshResult = await authService.refreshToken(loginResult.data.refresh_token);
  if (!refreshResult.success) {
    console.error('Refresh token failed:', refreshResult);
    process.exit(1);
  }

  console.log('Refresh token successful:', refreshResult.data);

  // try to fetch the user profile
  const url = 'http://localhost:8788/api/user/profile';
  const headers = {
    'Authorization': `Bearer ${refreshResult.data.access_token}`
  };
  const response = await fetch(url, { headers });
  if (!response.ok) {
    console.error('Failed to fetch user profile:', response.status, await response.text());
    process.exit(1);
  }

  const userProfile = await response.json();
  console.log('User profile fetched successfully:', userProfile);
  process.exit(0);
})().catch(err => {
  console.error('Error in login using service:', err);
  process.exit(1);
});
