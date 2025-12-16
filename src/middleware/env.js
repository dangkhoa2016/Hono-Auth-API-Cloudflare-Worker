/**
 * Environment middleware - Add environment config to context
*/

import { getEnvConfig } from '../utils/dynamicConfig.js';

/**
 * Middleware to add environment configuration to Hono context
*/
export const envMiddleware = async (c, next) => {
  const envConfig = await getEnvConfig(c.env);

  // Add env config to context
  c.set('environment', envConfig);

  await next();
};
