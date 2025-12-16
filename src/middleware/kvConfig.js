import { createKvConfigService } from '../utils/serviceFactory.js';
import { kvConfigMiddleware_log } from '../utils/debug.js';

/**
 * Middleware used to inject the KV config service into the Hono context
*/
export async function kvConfigMiddleware(c, next) {
  try {
    c.kvConfig = createKvConfigService(c.env);
    kvConfigMiddleware_log('KV config service initialized');
  } catch (error) {
    kvConfigMiddleware_log(`Error initializing KV config service: ${error.message}`);
    throw error;
  }

  await next();
}
