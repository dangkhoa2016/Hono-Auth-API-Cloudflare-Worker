import { getPlatformProxy } from 'wrangler';
import crypto from 'crypto';

// sql query for inspect
const inspectQueries = [{
  name: 'List all users',
  query: 'SELECT * FROM users;'
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
  const { env } = await getPlatformProxy({ environment: 'development' });
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

  process.exit();

})();
