import { UserService } from '../../src/services/userService.js';
import { getPlatformProxy } from 'wrangler';
import { fileURLToPath } from 'node:url';

(async () => {
  const configPath = fileURLToPath(new URL('../../wrangler.toml', import.meta.url));
  const { env } = await getPlatformProxy({ configPath, environment: 'test' });
  // const { env } = await getPlatformProxy({ configPath, environment: 'development' });

  if (!env?.DB) {
    throw new Error('D1 binding DB is missing from getPlatformProxy environment');
  }

  const { env: { DB } } = await getPlatformProxy({ environment: 'test' });

  const userService = new UserService(DB);
  // get all users
  const users = await userService.getUsers();
  console.log('All users:', users);

  // find user by ID
  const user = await userService.findById(1);
  console.log('User with ID 1:', user);

  // create a new user
  const newUser = await userService.create({
    email: 'test_usage@local.test',
    password: 'password123',
    full_name: 'Test User',
    role: 'super_admin',
    status: 'inactive',
  });
  console.log('New user created:', newUser);

  // update the user
  let result = await userService.update(newUser.id, {
    full_name: 'Updated Test User',
    status: 'active',
  });
  console.log('Updated user result:', result);

  // change role of the user
  result = await userService.changeUserRole(newUser.id, 'admin');
  console.log('Role changed result:', result);

  // change password of the user
  result = await userService.updatePassword(newUser.id, 'newpassword123');
  console.log('Password changed result:', result);

  // delete the user
  result = await userService.delete(newUser.id);
  console.log('Deleted user result:', result);

  // find user by email
  const userByEmail = await userService.findByEmail('super@admin.user');
  console.log('User by email:', userByEmail);

  // get system stats
  const stats = await userService.getSystemStats();
  console.log('System stats:', stats);

  // get dashboard
  const dashboard = await userService.getDashboardData();
  console.log('Dashboard data:', dashboard);

  process.exit(0);
})().catch(err => {
  console.error('Error in user service usage:', err);
});
