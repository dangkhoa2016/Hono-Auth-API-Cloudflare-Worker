import { DatabaseService } from '../../src/services/databaseService.js';
import { getPlatformProxy } from 'wrangler';

(async () => {
//   const { env: { DB } } = await getPlatformProxy({ environment: 'test' });
  const { env: { DB } } = await getPlatformProxy({ environment: 'development' });
  const databaseService = new DatabaseService(DB);

  // Example get a user by ID
  console.log('Getting user with ID 1');
  let result = await databaseService.select('SELECT * FROM users WHERE id = ?', [1]);
  console.log(result);

  // Example call getDatabaseInfo method
  console.log('Getting database info');
  result = await databaseService.getDatabaseInfo();
  console.log(result);

  // Example call execute method
  console.log('Executing query to get users with role "admin" or "user"');
  result = await databaseService.execute('select * from users where role in (?, ?)', ['admin', 'user']);
  console.log(result);

  process.exit(0);
})().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
