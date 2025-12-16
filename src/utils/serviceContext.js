import { serviceContext_log } from './debug.js';
import { createRateLimitService } from './serviceFactory.js';

/**
 * Middleware to inject services with context into Hono context
*/
export function servicesMiddleware(c, next) {
  try {
    // Create rate limit service using env bindings
    c.rateLimitService = createRateLimitService(c.env);
    serviceContext_log('Services with context injected into Hono context');
  } catch (error) {
    serviceContext_log(`Error initializing rate limit service: ${error.message}`);
    throw error;
  }

  next();
}
