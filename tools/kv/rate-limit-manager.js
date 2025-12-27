import { getPlatformProxy } from 'wrangler';
import { KVConfigService } from '../../src/services/kvConfigService.js';
import { parseArgs } from 'node:util';

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      action: { type: 'string', short: 'a' }, // clean, seed, prune-time
      prefix: { type: 'string', short: 'p', default: 'ratelimit:' },
      count: { type: 'string', short: 'c', default: '10' },
      attempts: { type: 'string', default: '1' },
      start: { type: 'string' }, // timestamp
      end: { type: 'string' }, // timestamp
      env: { type: 'string', default: 'test' },
      'dry-run': { type: 'boolean', default: false }
    },
    allowPositionals: true
  });

  const action = values.action || positionals[0];

  if (!action) {
    console.error('Error: Action is required (clean, seed, prune-time)');
    console.log('Usage:');
    console.log('  node tools/kv/rate-limit-manager.js clean --prefix "ratelimit:" --env development --dry-run');
    console.log('  node tools/kv/rate-limit-manager.js seed --count 10 --prefix "ratelimit:test:" --env test');
    console.log('  node tools/kv/rate-limit-manager.js prune-time --start 1700000000000 --end 1710000000000 --env staging --dry-run');
    console.log('  node tools/kv/rate-limit-manager.js prune-time --start "2024-01-01T00:00:00Z" --end "2024-01-02T00:00:00Z" --env staging');
    console.log('  Options:');
    console.log('    --env <env>    Environment to use (development, test, staging). Default: test');
    console.log('    --dry-run      Simulate deletion without actually deleting keys');
    console.log('    --start, --end Timestamp (ms) or ISO date string for prune-time');
    process.exit(1);
  }

  console.log(`Initializing KV connection for environment: ${values.env}...`);
  
  // Load environment-specific variables
  // Note: getPlatformProxy automatically loads .dev.vars.{env} if it exists and matches the environment
  const { env } = await getPlatformProxy({ 
    configPath: 'wrangler.toml', 
    environment: values.env 
  });
  
  if (!env.CONFIG_KV) {
    console.error('Error: CONFIG_KV binding not found in environment');
    process.exit(1);
  }

  const kvService = new KVConfigService(env);

  try {
    switch (action) {
      case 'clean':
        await cleanRateLimits(kvService, values.prefix, values['dry-run']);
        break;
      case 'seed':
        await seedRateLimits(kvService, values.prefix, parseInt(values.count), parseInt(values.attempts));
        break;
      case 'prune-time':
        if (!values.start || !values.end) {
          console.error('Error: --start and --end are required for prune-time (timestamp or ISO date string)');
          process.exit(1);
        }
        
        const startTime = parseTimestamp(values.start);
        const endTime = parseTimestamp(values.end);
        
        console.log(`Pruning range: ${new Date(startTime).toISOString()} (${startTime}) to ${new Date(endTime).toISOString()} (${endTime})`);
        
        await pruneRateLimitsByTime(kvService, values.prefix, startTime, endTime, values['dry-run']);
        break;
      default:
        console.error(`Error: Unknown action "${action}"`);
        process.exit(1);
    }
  } catch (error) {
    console.error('Operation failed:', error);
    process.exit(1);
  } finally {
    process.exit(0);
  }
}

async function cleanRateLimits(kvService, prefix, dryRun = false) {
  console.log(`Cleaning keys with prefix: "${prefix}"...${dryRun ? ' (DRY RUN)' : ''}`);
  let cursor = null;
  let deletedCount = 0;

  do {
    const list = await kvService.listRaw({ prefix, cursor });
    cursor = list.cursor;

    if (list.keys.length > 0) {
      console.log(`Found ${list.keys.length} keys in current batch...`);
      for (const key of list.keys) {
        if (dryRun) {
          console.log(`[DRY RUN] Would delete: ${key.name}`);
        } else {
          await kvService.deleteRaw(key.name);
        }
        deletedCount++;
      }
    }
  } while (cursor);

  console.log(`Successfully ${dryRun ? 'identified' : 'deleted'} ${deletedCount} keys.`);
}

async function seedRateLimits(kvService, prefix, count, attempts) {
  console.log(`Seeding ${count} rate limit keys with prefix "${prefix}"...`);
  
  for (let i = 0; i < count; i++) {
    const timestamp = Date.now();
    const key = `${prefix}seed:${i}:${timestamp}`;
    const value = {
      attempts: attempts,
      firstAttempt: timestamp,
      lastAttempt: timestamp,
      metadata: { reason: "seed_test", index: i }
    };

    await kvService.putRaw(key, JSON.stringify(value), { expirationTtl: 86400 }); // 1 day TTL
    if ((i + 1) % 10 === 0) process.stdout.write('.');
  }
  console.log(`\nSuccessfully created ${count} keys.`);
}

async function pruneRateLimitsByTime(kvService, prefix, start, end, dryRun = false) {
  console.log(`Pruning keys with prefix "${prefix}" created between ${start} and ${end}...${dryRun ? ' (DRY RUN)' : ''}`);
  let cursor = null;
  let deletedCount = 0;
  let checkedCount = 0;

  do {
    const list = await kvService.listRaw({ prefix, cursor });
    cursor = list.cursor;

    for (const key of list.keys) {
      checkedCount++;
      try {
        const value = await kvService.getRaw(key.name, 'json');
        
        // Check if value has timestamp properties
        if (value && (value.firstAttempt || value.lastAttempt)) {
          const timestamp = value.firstAttempt || value.lastAttempt;
          
          if (timestamp >= start && timestamp <= end) {
            if (dryRun) {
              console.log(`[DRY RUN] Would delete: ${key.name} (timestamp: ${timestamp})`);
            } else {
              await kvService.deleteRaw(key.name);
            }
            deletedCount++;
          }
        }
      } catch (e) {
        console.warn(`Failed to process key ${key.name}: ${e.message}`);
      }
    }
    process.stdout.write(`Checked ${checkedCount} keys, ${dryRun ? 'found' : 'deleted'} ${deletedCount}...\r`);
  } while (cursor);

  console.log(`\nSuccessfully ${dryRun ? 'identified' : 'deleted'} ${deletedCount} keys out of ${checkedCount} checked.`);
}

function parseTimestamp(input) {
  // Check if input is purely numeric (timestamp)
  if (/^\d+$/.test(input)) {
    return parseInt(input, 10);
  }
  
  // Try parsing as date string
  const date = new Date(input);
  if (!isNaN(date.getTime())) {
    return date.getTime();
  }
  
  throw new Error(`Invalid date format: "${input}". Please use timestamp (ms) or ISO date string.`);
}

main().catch(console.error);
