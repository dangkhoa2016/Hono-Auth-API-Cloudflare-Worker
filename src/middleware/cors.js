import { cors } from 'hono/cors';
import { getCorsSettings } from '../utils/dynamicConfig.js';
import { corsMiddleware_log } from '../utils/debug.js';

/**
 * CORS middleware for Hono applications
*/
export const corsMiddleware = async (c, next) => {
  const corsConfig = await getCorsSettings(c.env);
  corsMiddleware_log(`Applying CORS middleware with config: ${JSON.stringify(corsConfig)}`);

  const dynamicCors = cors(corsConfig);
  return dynamicCors(c, next);
};
