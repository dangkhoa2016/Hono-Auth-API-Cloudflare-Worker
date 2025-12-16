import { getPlatformProxy } from 'wrangler';
import { createTestAdminUsers } from './createTestAdminUsersService.js';
import { createDatabaseService } from '../../src/utils/serviceFactory.js';

(async () => {
  const { env } = await getPlatformProxy({ environment: 'test' });
  await createTestAdminUsers(env.DB);

  // verify results
  const db = await createDatabaseService(env);
  const allUsers = await db.select('SELECT * FROM users');
  console.log('All users in the database:', allUsers);
  process.exit(0);
})().catch((error) => {
  console.error('Error creating test admin users:', error);
  process.exit(1);
});
