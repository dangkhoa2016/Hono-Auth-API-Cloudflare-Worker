/**
 * Route Definitions - Central import point
 * Auto-registers all route definitions when imported
*/

// Import all route definitions (they auto-register when imported)
import './systemRoutes.js';
import './authRoutes.js';
import './userRoutes.js';
import './adminRoutes.js';
import './kvAdminRoutes.js';
import './auditRoutes.js';
import './realtimeMonitoringRoutes.js';
import './securityIncidentRoutes.js';
import './translationRoutes.js';

// Re-export registry functions for convenience
export {
  getAllRoutes,
  getRoutesByCategory,
  getRouteMetadata,
  getRouteStats,
  clearRegistry
} from './routeRegistry.js';
