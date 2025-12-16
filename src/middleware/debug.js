import { debugMiddleware_log, debug } from '../utils/debug.js';

/**
 * Debug configuration middleware
 * Configures debug patterns based on environment and KV settings
 * Only enables debug in development/test environments
*/
export const debugConfigMiddleware = async (c, next) => {
  // Get debug patterns from environment variable in cloudflare KV
  const setting = await c.kvConfig.get('DEBUG');
  if (!setting || setting.toLowerCase() === 'none') {
    debugMiddleware_log('No debug patterns set, disabling debug');
    debug.disable();
  } else {
    debugMiddleware_log(`Enabling debug patterns: ${setting}`);
    debug.enable(setting);
  }

  await next();
};
