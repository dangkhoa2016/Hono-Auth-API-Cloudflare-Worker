/**
 * Audit Routes Definitions
 * Register all audit logging and monitoring routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

/**
 * Basic audit routes with metadata
*/
const AUDIT_ROUTES = [
  {
    method: 'GET',
    path: '/api/audit/logs',
    metadata: {
      category: 'audit',
      i18nKey: 'endpoints.audit.logs',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Get audit logs with filtering and pagination'
    }
  },
  {
    method: 'GET',
    path: '/api/audit/search',
    metadata: {
      category: 'audit',
      i18nKey: 'endpoints.audit.search',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Search audit logs by criteria'
    }
  },
  {
    method: 'GET',
    path: '/api/audit/stats',
    metadata: {
      category: 'audit',
      i18nKey: 'endpoints.audit.stats',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Audit system statistics and metrics'
    }
  },
  {
    method: 'GET',
    path: '/api/audit/export',
    metadata: {
      category: 'audit',
      i18nKey: 'endpoints.audit.export',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Export audit logs in various formats'
    }
  },
  {
    method: 'DELETE',
    path: '/api/audit/logs/:id',
    metadata: {
      category: 'audit',
      i18nKey: 'endpoints.audit.logs',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Delete a single audit log by id'
    }
  }
];

/**
 * Advanced audit routes with metadata
*/
const ADVANCED_AUDIT_ROUTES = [
  {
    method: 'GET',
    path: '/api/advanced-audit/analytics',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.analytics',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Advanced audit analytics and insights'
    }
  },
  {
    method: 'GET',
    path: '/api/advanced-audit/analytics/security',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.analyticsSecurity',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Security-focused audit analytics'
    }
  },
  {
    method: 'GET',
    path: '/api/advanced-audit/analytics/behavior',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.analyticsBehavior',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'User behavior analytics from audit data'
    }
  },
  {
    method: 'GET',
    path: '/api/advanced-audit/analytics/performance',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.analyticsPerformance',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Performance analytics from audit data'
    }
  },
  {
    method: 'GET',
    path: '/api/advanced-audit/compliance',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.compliance',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Compliance reporting and validation'
    }
  },
  {
    method: 'GET',
    path: '/api/advanced-audit/compliance/report',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.complianceReport',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Generate compliance reports'
    }
  },
  {
    method: 'GET',
    path: '/api/advanced-audit/archival',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.archival',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Audit data archival management'
    }
  },
  {
    method: 'GET',
    path: '/api/advanced-audit/archival/stats',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.archivalStats',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Archival system statistics'
    }
  },
  {
    method: 'POST',
    path: '/api/advanced-audit/archival/run',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.archivalRun',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Execute audit data archival process'
    }
  },
  {
    method: 'POST',
    path: '/api/advanced-audit/archival/restore',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.archivalRestore',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Restore archived audit data'
    }
  },
  {
    method: 'GET',
    path: '/api/advanced-audit/middleware/stats',
    metadata: {
      category: 'advanced_audit',
      i18nKey: 'endpoints.advanced_audit.middlewareStats',
      permissions: PERMISSION_PRESETS.ADMIN,
      description: 'Audit middleware performance statistics'
    }
  }
];

/**
 * Register all audit routes
*/
export function registerAuditRoutes() {
  registerRoutes('audit', AUDIT_ROUTES);
  registerRoutes('advanced_audit', ADVANCED_AUDIT_ROUTES);
}

// Auto-register when imported
registerAuditRoutes();
