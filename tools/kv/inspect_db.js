import { execSync } from 'child_process';
import { getPlatformProxy } from 'wrangler';
import crypto from 'crypto';
import { KVConfigService } from '../../src/services/kvConfigService.js';

// sql query for inspect
const inspectQuery = `
  SELECT * FROM _mf_entries;
`;


function durableObjectNamespaceIdFromName(name) {
  const uniqueKey = 'miniflare-KVNamespaceObject';
  const key = crypto.createHash('sha256').update(uniqueKey).digest();
  const nameHmac = crypto.createHmac('sha256', key).update(name).digest().subarray(0, 16);
  const hmac = crypto.createHmac('sha256', key).update(nameHmac).digest().subarray(0, 16);
  return Buffer.concat([nameHmac, hmac]).toString('hex');
}

async function inspectkeys(kvService) {
  const results = await kvService.listRaw();
  console.log('KV Namespace keys:', results.keys);
  if (!results || Object.keys(results).length === 0) {
    console.log('No keys found in the KV Namespace.');
    return;
  }

  console.log('Inspecting KV Namespace:', results);
  for (const item of results.keys) {
    console.log(`Getting value for key: ${item.name}`);
    const value = await kvService.getRaw(item.name);
    console.log(`Value: ${value}`);

    console.log(`Inspecting key: ${item.name}`);
    const json = await kvService.getWithMetadataRaw(item.name);
    console.log('Metadata:', json);
  }
}


function executeCommand(command) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: ['inherit', 'pipe', 'pipe']
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
}

function inspectDatabase(file_name) {
  const result = executeCommand(`sqlite3 .wrangler/state/v3/kv/miniflare-KVNamespaceObject/${file_name}.sqlite -cmd "${inspectQuery}" ".exit"`);
  if (result.success) {
    console.log('Database inspection output:');
    console.log(result.output);
  } else {
    console.error('Error inspecting database:', result.error);
    if (result.stderr) {
      console.error('Stderr:', result.stderr);
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
    DEBUG: 'hono-auth-api:*',
    RATE_LIMIT_DISABLED: 'true',
    AUTO_ACTIVATE_USER_ON_REGISTER: 'true',
    ENV: 'test',
    DB: ProxyStub { name: 'D1Database', poisoned: false },
    CONFIG_KV: ProxyStub { name: 'KvNamespace', poisoned: false },
    ASSETS: ProxyStub { name: 'Fetcher', poisoned: false }
  }
  */

  const kvService = new KVConfigService(env);
  await inspectkeys(kvService);
  console.log('----------------------');

  const database_file_name = durableObjectNamespaceIdFromName('config-kv-test');
  console.log('database_file_name', database_file_name); // 869fd78369035ef4544283d99190ba16fd3d6f77afd148ca966e38ffbcb096de
  console.log('----------------------');

  console.log('Inspecting database file:', database_file_name);
  console.log('----------------------');
  inspectDatabase(database_file_name);

  process.exit();

})();
