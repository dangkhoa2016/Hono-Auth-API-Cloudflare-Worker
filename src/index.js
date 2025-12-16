import { Hono } from 'hono';
import { corsMiddleware } from './middleware/cors.js';
import { securityMiddleware } from './middleware/security.js';
import { envMiddleware } from './middleware/env.js';
import { kvConfigMiddleware } from './middleware/kvConfig.js';
import { debugConfigMiddleware } from './middleware/debug.js';
import { securityConfigGuardMiddleware } from './middleware/securityConfigGuard.js';
// later use
// import { servicesMiddleware } from './utils/serviceContext.js';
import { createI18nMiddleware } from './middleware/i18n.js';
import { errorHandler, notFoundHandler } from './middleware/error.js';

// Import route groups for modular structure
import { authSubApp, adminSubApp, auditSubApp, demoSubApp, coreSubApp } from './routes/routeGroups.js';

import { initI18n } from './i18n/index.js';
import { app_log, server_log, i18n_log } from './utils/debug.js';

const app = new Hono();

app_log('Hono Auth API starting up...');

// Initialize i18next
try {
  await initI18n();
  i18n_log('i18next initialized successfully');
} catch (error) {
  i18n_log(`Failed to initialize i18next: ${error.message}`);
  // Continue without i18n in case of error
}


// Global middleware
app.use('*', createI18nMiddleware); // Enhanced i18n middleware with Hono + Cloudflare

app.use('*', envMiddleware);
app.use('*', securityConfigGuardMiddleware);
app.use('*', kvConfigMiddleware);
app.use('*', debugConfigMiddleware);

app.use('*', securityMiddleware);
app.use('*', corsMiddleware);
// later use
// app.use('*', servicesMiddleware);


// Routes - organized by sub-applications
app_log('Setting up routes...');

// Core API routes (favicon, health, version)
app.route('/', coreSubApp);

// Authentication and user management
app.route('/api', authSubApp);

// Administration (admin + kv-admin)
app.route('/api', adminSubApp);

// Audit and security monitoring
app.route('/api', auditSubApp);

// Demo and development routes
app.route('/api', demoSubApp);

// Error handlers
app.notFound(notFoundHandler);
app.onError(errorHandler);

server_log('Hono Auth API setup complete with i18next integration');

export default app;
