
import { getPlatformProxy } from 'wrangler';
import { KVConfigService } from '../src/services/kvConfigService.js';

async function resetRateLimits() {
  const { env } = await getPlatformProxy({ configPath: 'wrangler.toml', environment: 'test' });
  const kvService = new KVConfigService(env);

  let kvReset = false;
  if (kvService.kv) {
    console.log('Resetting rate limits in KV...');
    const list = await kvService.listRaw({ prefix: 'ratelimit:' });
    console.log(`Found ${list.keys.length} rate limit keys`);

    for (const key of list.keys) {
      await kvService.deleteRaw(key.name);
    }

    kvReset = true;
    console.log('KV rate limits reset successfully');
  } else {
    console.warn('CONFIG_KV not found in environment, skipping KV reset');
  }

  let dbReset = false;
  if (env.DB) {
    console.log('Clearing rate limit tables in D1...');
    try {
      await env.DB.prepare('DELETE FROM rate_limit_counters').run();
      await env.DB.prepare('DELETE FROM failed_login_limits').run();
      dbReset = true;
      console.log('D1 rate limit tables cleared');
    } catch (dbError) {
      console.error('Failed to clear D1 rate limit tables:', dbError.message || dbError);
    }
  } else {
    console.warn('DB binding not found in environment, skipping D1 reset');
  }

  if (!kvReset && !dbReset) {
    console.error('No rate limit storage was reset (missing CONFIG_KV and DB bindings)');
    process.exit(1);
  }

  process.exit(0);
}

resetRateLimits().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
