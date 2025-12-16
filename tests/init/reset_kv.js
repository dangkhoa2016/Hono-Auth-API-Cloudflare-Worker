import { experimental_readRawConfig, getPlatformProxy } from 'wrangler';
import { createKvConfigService } from '../../src/utils/serviceFactory.js';
import { readFile } from 'fs/promises';

const configFile = 'wrangler.toml';
const kv_binding = 'CONFIG_KV';
const kv_json_file = './tests/init/kv_config.json';

async function resetKVNamespace() {
  const { env } = await getPlatformProxy({ configPath: configFile, environment: 'test' });
  const kvConfigService = createKvConfigService(env);
  const jsonString = await readFile(kv_json_file, 'utf-8');
  const kvDataArray = JSON.parse(jsonString);
  for (const item of kvDataArray) {
    console.log(`Setting key: ${item.key} with value: ${item.value}`);
    await kvConfigService.set(item.key, item.value);
  }
  console.log(`KV namespace ${kv_binding} has been reset with data from ${kv_json_file}.`);

  const allKeys = await kvConfigService.getAll();
  console.log('All keys in KV namespace after reset:', allKeys);
}

(async () => {
  const env = 'test';
  const  { rawConfig } = await experimental_readRawConfig(configFile);
  if (!rawConfig.env[env].kv_namespaces) {
    console.log('No KV namespaces found in the configuration.');
    process.exit(0);
  }

  const kvNamespace = rawConfig.env[env].kv_namespaces.find(kv => kv.binding === kv_binding);
  if (kvNamespace)
  { await resetKVNamespace(); }
  else
  { console.log(`KV namespace with binding ${kv_binding} not found.`); }

  process.exit(0);
})().catch(err => {
  console.error('Error resetting KV namespaces:', err);
  process.exit(1);
});
