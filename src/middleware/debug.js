import { debugMiddleware_log, configureDebugNamespaces } from '../utils/debug.js';

/**
 * Debug configuration middleware
 * Configures debug patterns from the resolved DEBUG setting.
 * An empty setting, 'none' and 'off' all mean logging is disabled.
 */
export const debugConfigMiddleware = async (c, next) => {
  let setting = '';
  try {
    setting = await c.kvConfig.get('DEBUG');
  } catch (error) {
    debugMiddleware_log(`Unable to resolve DEBUG setting, keeping debug disabled: ${error.message}`);
    setting = '';
  }

  const result = configureDebugNamespaces(setting);
  debugMiddleware_log(result.enabled
    ? `Enabling debug namespaces: ${result.namespaces.join(',')}`
    : 'No debug patterns set, debugging disabled');

  await next();
};
