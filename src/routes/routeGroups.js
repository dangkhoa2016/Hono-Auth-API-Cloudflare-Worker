/**
 * Route Groups for Modular Application Structure
 * Groups related routes into sub-applications for better organization
*/

import { Hono } from 'hono';

// Import route definitions
import authRoutes from '../routes/auth.js';
import userRoutes from '../routes/user.js';
import adminRoutes from '../routes/admin.js';
import kvAdminRoutes from '../routes/kvAdmin.js';
import tokenBlacklistRoutes from '../routes/tokenBlacklist.js';
import tokenAuditRoutes from '../routes/tokenAudit.js';
import auditRoutes from '../routes/audit.js';
import advancedAuditRoutes from '../routes/advancedAudit.js';
import realtimeMonitoringRoutes from '../routes/realtimeMonitoring.js';
import securityIncidentRoutes from '../routes/securityIncident.js';
import translationsRoutes from '../routes/translations.js';
import demoZodRoutes from '../routes/zodDemo.js';
import faviconRoutes from '../routes/favicon.js';
import apiRoutes from '../routes/api.js';

/**
 * Authentication & User Management Sub-App
 * Handles login, registration, user profiles, and basic user operations
*/
export const authSubApp = new Hono();
authSubApp.route('/auth', authRoutes);
authSubApp.route('/user', userRoutes);

/**
 * Administration Sub-App
 * Handles admin operations, user management, and KV configuration (super admin only)
*/
export const adminSubApp = new Hono();
adminSubApp.route('/admin', adminRoutes);
adminSubApp.route('/admin/token-blacklist', tokenBlacklistRoutes);
adminSubApp.route('/admin/token-audit', tokenAuditRoutes);
adminSubApp.route('/kv-admin', kvAdminRoutes);

/**
 * Audit & Security Sub-App
 * Handles all audit logging, monitoring, and security incident management
*/
export const auditSubApp = new Hono();
auditSubApp.route('/audit', auditRoutes);
auditSubApp.route('/advanced-audit', advancedAuditRoutes);
auditSubApp.route('/realtime-monitoring', realtimeMonitoringRoutes);
auditSubApp.route('/security-incident', securityIncidentRoutes);

/**
 * Demo & Development Sub-App
 * Handles demonstration routes, translations, and development tools
*/
export const demoSubApp = new Hono();
demoSubApp.route('/translations', translationsRoutes);
demoSubApp.route('/zod_demo', demoZodRoutes);

/**
 * Core API Sub-App
 * Handles root API routes, favicon, and general API endpoints
*/
export const coreSubApp = new Hono();
coreSubApp.route('/', faviconRoutes);
coreSubApp.route('/', apiRoutes);
