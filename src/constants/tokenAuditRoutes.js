/**
 * Token Audit Routes Definitions
 * Register all token audit management routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

const TOKEN_AUDIT_ROUTES = [
  {
    method: 'GET',
    path: '/api/admin/token-audit',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.tokenAuditList',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'List token audit logs with pagination and search'
    }
  },
  {
    method: 'GET',
    path: '/api/admin/token-audit/:id',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.tokenAuditDetails',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get token audit log details'
    }
  },
  {
    method: 'PUT',
    path: '/api/admin/token-audit/:id',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.tokenAuditUpdate',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Update a token audit log entry'
    }
  },
  {
    method: 'POST',
    path: '/api/admin/token-audit/bulk-delete',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.tokenAuditBulkDelete',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Bulk delete token audit log entries'
    }
  },
  {
    method: 'DELETE',
    path: '/api/admin/token-audit/:id',
    metadata: {
      category: 'admin',
      i18nKey: 'endpoints.admin.tokenAuditDelete',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Delete a token audit log entry'
    }
  }
];

registerRoutes('admin', TOKEN_AUDIT_ROUTES);
