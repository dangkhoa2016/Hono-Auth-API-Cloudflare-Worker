import { DatabaseService } from '../../src/services/databaseService.js';
import { getPlatformProxy } from 'wrangler';
import { fileURLToPath } from 'node:url';

(async () => {
  const configPath = fileURLToPath(new URL('../../wrangler.toml', import.meta.url));
  const { env } = await getPlatformProxy({ configPath, environment: 'test' });
  // const { env } = await getPlatformProxy({ configPath, environment: 'development' });

  if (!env?.DB) {
    throw new Error('D1 binding DB is missing from getPlatformProxy environment');
  }

  const databaseService = new DatabaseService(env);

  // Example get a user by ID
  console.log('Getting user with ID 1');
  let result = await databaseService.select('SELECT * FROM users WHERE id = ?', [1]);
  console.log(result);

  // reset superadmin user password
  const defaultPassword = 'password123';
  console.log(`Resetting superadmin user password to "${defaultPassword}"`);
  result = await databaseService.execute('UPDATE users SET password = ? WHERE role = ?', [defaultPassword, 'superadmin'], 'run');
  console.log(result);
  process.exit(0);
})().catch((error) => {
  console.error('Error:', error);
  process.exit(1);
});
