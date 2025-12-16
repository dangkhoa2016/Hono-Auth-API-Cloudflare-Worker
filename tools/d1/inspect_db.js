import { getPlatformProxy } from 'wrangler';
import crypto from 'crypto';

// sql query for inspect
const inspectQueries = [{
  name: 'List all tables',
  query: 'SELECT * FROM sqlite_master WHERE type=\'table\';'
}, {
  name: 'List all users',
  query: 'SELECT * FROM users;'
}, {
  name: 'List all failed_login_limits',
  query: 'SELECT * FROM failed_login_limits;'
}, {
  name: 'List all users with \'super_admin\' role',
  query: 'SELECT * FROM users WHERE role = \'super_admin\';'
}, {
  name: 'List all users with \'admin\' role',
  query: 'SELECT * FROM users WHERE role = \'admin\';'
}, {
  name: 'List all users with \'user\' role',
  query: 'SELECT * FROM users WHERE role = \'user\';'
}, {
  name: 'List all users with \'inactive\' status',
  query: 'SELECT * FROM users WHERE status = \'inactive\';'
}, {
  name: 'List all users with \'active\' status',
  query: 'SELECT * FROM users WHERE status = \'active\';'
}, {
  name: 'List all users with \'suspended\' status',
  query: 'SELECT * FROM users WHERE status = \'suspended\';'
}, {
  name: 'List all users created in the last 30 days',
  query: 'SELECT * FROM users WHERE created_at >= datetime(\'now\', \'-30 days\');'
}, {
  name: 'List all users updated in the last 30 days',
  query: 'SELECT * FROM users WHERE updated_at >= datetime(\'now\', \'-30 days\');'
}, {
  name: 'List all users with a specific email domain',
  query: 'SELECT * FROM users WHERE email LIKE \'%@example.com\';'
}];


function durableObjectNamespaceIdFromName(name) {
  const uniqueKey = 'miniflare-D1DatabaseObject';
  const key = crypto.createHash('sha256').update(uniqueKey).digest();
  const nameHmac = crypto.createHmac('sha256', key).update(name).digest().subarray(0, 16);
  const hmac = crypto.createHmac('sha256', key).update(nameHmac).digest().subarray(0, 16);
  return Buffer.concat([nameHmac, hmac]).toString('hex');
}

async function inspectDatabase(db) {
  for (const { name, query } of inspectQueries) {
    console.log(`\nExecuting: ${name}:\n${query}`);
    try {
      const result = await db.prepare(query).run();
      console.log(result);
    } catch (error) {
      console.log(`Error executing query "${name}":`, error);
    }
  }
}

(async () => {
  const { env } = await getPlatformProxy({ environment: 'test' });
  // const { env } = await getPlatformProxy({ environment: 'dev' });
  // console.log( env );
  /* output:
  {
    JWT_SECRET: 'your-test-jwt-secret-here',
    API_BASE_URL: 'http://localhost:8788',
    DEBUG: 'hono-auth-api:*',
    RATE_LIMIT_DISABLED: 'true',
    ENV: 'test',
    DB: ProxyStub { name: 'D1Database', poisoned: false }
  }
  */

  await inspectDatabase(env.DB);

  const database_file_name = durableObjectNamespaceIdFromName('test-placeholder');
  // const database_file_name = durableObjectNamespaceIdFromName('staging-placeholder');
  console.log('database_file_name', database_file_name); // 2cdad356b38b8e67ffa79607c843dcd2668ae8ee839d4ceab73d36a9238b96c2
  process.exit();

})();
