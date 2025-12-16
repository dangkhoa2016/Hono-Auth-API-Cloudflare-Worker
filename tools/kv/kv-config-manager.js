#!/usr/bin/env node

/**
 * Universal Cloudflare KV Configuration Management Tool
 * Usage: node tools/kv/kv-config-manager.js <action> [key] [value] [options]
 * 
 * Actions:
 *   get <key>              - Get value of a specific key
 *   set <key> <value>      - Set value for a specific key
 *   delete <key>           - Delete a specific key
 *   list                   - List all KV configurations
 *   status                 - Show general KV status
 *   enable <key>           - Set key to 'true' (for boolean configs)
 *   disable <key>          - Set key to 'false' (for boolean configs)
 * 
 * Options:
 *   --env <environment>    - Specify environment (default: test)
 *   --type <type>         - Specify value type: string, boolean, number, json
 * 
 * Examples:
 *   node tools/kv/kv-config-manager.js get ENABLE_RESPONSE_BODY_CAPTURE
 *   node tools/kv/kv-config-manager.js set LOG_SQL_QUERIES true --type boolean
 *   node tools/kv/kv-config-manager.js enable RATE_LIMIT_DISABLED
 *   node tools/kv/kv-config-manager.js list --env dev
 */

import { getPlatformProxy } from 'wrangler';
import { createKvConfigService } from '../../src/utils/serviceFactory.js';

// Parse command line arguments
const args = process.argv.slice(2);
const action = args[0] || 'status';
const key = args[1];
const value = args[2];

// Parse options
const options = {
  env: 'test',
  type: 'auto'
};

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--env' && args[i + 1]) {
    options.env = args[i + 1];
  }
  if (args[i] === '--type' && args[i + 1]) {
    options.type = args[i + 1];
  }
}

// Convert value based on type
function convertValue(val, type) {
  if (!val) return val;
  
  switch (type) {
  case 'boolean':
    return val.toLowerCase() === 'true';
  case 'number':
    return Number(val);
  case 'json':
    try {
      return JSON.parse(val);
    } catch (e) {
      throw new Error(`Invalid JSON value: ${val}`);
    }
  case 'auto':
    // Auto-detect type
    if (val.toLowerCase() === 'true' || val.toLowerCase() === 'false') {
      return val.toLowerCase() === 'true';
    }
    if (!isNaN(val) && !isNaN(parseFloat(val))) {
      return Number(val);
    }
    if (val.startsWith('{') || val.startsWith('[')) {
      try {
        return JSON.parse(val);
      } catch (e) {
        return val; // Return as string if JSON parse fails
      }
    }
    return val; // Return as string
  default:
    return val; // Return as string
  }
}

async function manageKvConfig(action, key, value, options) {
  try {
    // Get environment
    const { env } = await getPlatformProxy({ environment: options.env });
    const kvConfig = createKvConfigService(env);

    console.log('🔧 Universal KV Configuration Management Tool');
    console.log('=============================================');
    console.log(`🌍 Environment: ${options.env}`);
    console.log('');

    switch (action.toLowerCase()) {
    case 'get':
      if (!key) {
        console.error('❌ Error: Key is required for get action');
        console.log('💡 Usage: node tools/kv/kv-config-manager.js get <key>');
        process.exit(1);
      }
      const currentValue = await kvConfig.get(key);
      console.log(`📋 KV Configuration:`);
      console.log(`🔑 Key: ${key}`);
      console.log(`📊 Value: ${currentValue !== null ? JSON.stringify(currentValue) : 'null'}`);
      console.log(`📝 Type: ${typeof currentValue}`);
      break;

    case 'set':
      if (!key || value === undefined) {
        console.error('❌ Error: Key and value are required for set action');
        console.log('� Usage: node tools/kv/kv-config-manager.js set <key> <value> [--type <type>]');
        process.exit(1);
      }
      const convertedValue = convertValue(value, options.type);
      const oldValue = await kvConfig.get(key);
      await kvConfig.set(key, convertedValue);
      console.log(`✅ KV Configuration Updated:`);
      console.log(`🔑 Key: ${key}`);
      console.log(`📊 Old Value: ${oldValue !== null ? JSON.stringify(oldValue) : 'null'}`);
      console.log(`📊 New Value: ${JSON.stringify(convertedValue)}`);
      console.log(`📝 Type: ${typeof convertedValue}`);
      break;

    case 'delete':
      if (!key) {
        console.error('❌ Error: Key is required for delete action');
        console.log('💡 Usage: node tools/kv/kv-config-manager.js delete <key>');
        process.exit(1);
      }
      const valueToDelete = await kvConfig.get(key);
      await kvConfig.delete(key);
      console.log(`🗑️ KV Configuration Deleted:`);
      console.log(`🔑 Key: ${key}`);
      console.log(`📊 Deleted Value: ${valueToDelete !== null ? JSON.stringify(valueToDelete) : 'null'}`);
      break;

    case 'enable':
      if (!key) {
        console.error('❌ Error: Key is required for enable action');
        console.log('💡 Usage: node tools/kv/kv-config-manager.js enable <key>');
        process.exit(1);
      }
      const currentEnableValue = await kvConfig.get(key, false);
      const isCurrentlyEnabled = typeof currentEnableValue === 'boolean' ? currentEnableValue :
        typeof currentEnableValue === 'string' ? currentEnableValue.toLowerCase() === 'true' :
          Boolean(currentEnableValue);
      
      if (isCurrentlyEnabled) {
        console.log(`⚠️  ${key} is already ENABLED`);
      } else {
        await kvConfig.set(key, true);
        console.log(`✅ ${key} has been ENABLED`);
      }
      console.log(`� Key: ${key}`);
      console.log(`📊 Status: ${isCurrentlyEnabled ? 'ENABLED' : 'DISABLED'} → ENABLED`);
      break;

    case 'disable':
      if (!key) {
        console.error('❌ Error: Key is required for disable action');
        console.log('💡 Usage: node tools/kv/kv-config-manager.js disable <key>');
        process.exit(1);
      }
      const currentDisableValue = await kvConfig.get(key, true);
      const isCurrentlyDisabled = typeof currentDisableValue === 'boolean' ? !currentDisableValue :
        typeof currentDisableValue === 'string' ? currentDisableValue.toLowerCase() === 'false' :
          !Boolean(currentDisableValue);
      
      if (isCurrentlyDisabled) {
        console.log(`⚠️  ${key} is already DISABLED`);
      } else {
        await kvConfig.set(key, false);
        console.log(`❌ ${key} has been DISABLED`);
      }
      console.log(`🔑 Key: ${key}`);
      console.log(`📊 Status: ${isCurrentlyDisabled ? 'DISABLED' : 'ENABLED'} → DISABLED`);
      break;

    case 'list':
      console.log('� Available KV Configuration Keys:');
      console.log('   Common keys you might want to manage:');
      console.log('   - ENABLE_RESPONSE_BODY_CAPTURE (boolean)');
      console.log('   - LOG_SQL_QUERIES (boolean)');
      console.log('   - RATE_LIMIT_DISABLED (boolean)');
      console.log('   - AUTO_ACTIVATE_USER_ON_REGISTER (boolean)');
      console.log('   - JWT_EXPIRY_SECONDS (number)');
      console.log('   - REFRESH_TOKEN_EXPIRY_SECONDS (number)');
      console.log('');
      console.log('💡 Use "get <key>" to check current values');
      break;

    case 'status':
    default:
      console.log('📋 KV Configuration Tool Status');
      console.log('💡 Available Actions:');
      console.log('   get <key>              - Get value of a specific key');
      console.log('   set <key> <value>      - Set value for a specific key');
      console.log('   delete <key>           - Delete a specific key');
      console.log('   enable <key>           - Set key to true (for boolean configs)');
      console.log('   disable <key>          - Set key to false (for boolean configs)');
      console.log('   list                   - List common KV configuration keys');
      console.log('   status                 - Show this help message');
      console.log('');
      console.log('💡 Options:');
      console.log('   --env <environment>    - Specify environment (default: test)');
      console.log('   --type <type>         - Specify value type: string, boolean, number, json, auto');
      console.log('');
      console.log('🔐 Security Note:');
      console.log('   - This tool modifies production KV configurations');
      console.log('   - Only super_admin users should use this tool');
      console.log('   - Changes take effect immediately');
      break;
    }

    console.log('');
    console.log('🎯 Related API Endpoints:');
    console.log('   GET  /api/kv-admin/configs         # List all configurations');
    console.log('   GET  /api/kv-admin/configs/<key>   # Get specific configuration');
    console.log('   PUT  /api/kv-admin/configs/<key>   # Update configuration');
    console.log('   DELETE /api/kv-admin/configs/<key> # Delete configuration');
    console.log('');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(`💡 Make sure wrangler is configured and you have access to the [${options.env}] environment`);
    process.exit(1);
  }
}

// Validate action
const validActions = ['get', 'set', 'delete', 'enable', 'disable', 'list', 'status'];
if (!validActions.includes(action.toLowerCase())) {
  console.error(`❌ Invalid action: ${action}`);
  console.error(`💡 Valid actions: ${validActions.join(', ')}`);
  process.exit(1);
}

// Run the tool
manageKvConfig(action, key, value, options);
