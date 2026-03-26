/**
 * KV Admin Routes Definitions
 * Register all KV configuration management routes with metadata
*/

import { registerRoutes } from './routeRegistry.js';
import { PERMISSION_PRESETS } from './roles.js';

/**
 * KV Admin routes with metadata (Super Admin only)
 * Updated to reflect implemented endpoints under /api/kv-admin/configs and audit config suite.
*/
const KV_ADMIN_ROUTES = [
  // Core KV Config management
  {
    method: 'GET',
    path: '/api/kv-admin/configs',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.configs',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get all KV configuration entries'
    }
  },
  {
    method: 'GET',
    path: '/api/kv-admin/configs/defaults',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.configsDefaults',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get default configuration values'
    }
  },
  {
    method: 'GET',
    path: '/api/kv-admin/configs/env-comparison',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.configsEnvComparison',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Compare ENV vs KV configuration values'
    }
  },
  {
    method: 'GET',
    path: '/api/kv-admin/configs/:key',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.configGet',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get value for a specific configuration key'
    }
  },
  {
    method: 'PUT',
    path: '/api/kv-admin/configs/:key',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.configUpdate',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Update value for a specific configuration key'
    }
  },
  {
    method: 'POST',
    path: '/api/kv-admin/configs/batch',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.configsBatch',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Batch update multiple configuration keys'
    }
  },
  {
    method: 'DELETE',
    path: '/api/kv-admin/configs/:key',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.configDelete',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Reset a configuration key to default (delete from KV)'
    }
  },
  {
    method: 'POST',
    path: '/api/kv-admin/configs/cache/clear',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.configsCacheClear',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Clear configuration cache'
    }
  },

  // Audit system configuration (under KV Admin)
  {
    method: 'GET',
    path: '/api/kv-admin/audit/configs',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.audit.configs',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get all audit system configuration values'
    }
  },
  {
    method: 'GET',
    path: '/api/kv-admin/audit/configs/retention',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.audit.retention',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get audit retention policies'
    }
  },
  {
    method: 'GET',
    path: '/api/kv-admin/audit/configs/performance',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.audit.performance',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get audit performance settings'
    }
  },
  {
    method: 'GET',
    path: '/api/kv-admin/audit/configs/features',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.audit.features',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get audit feature flags'
    }
  },
  {
    method: 'GET',
    path: '/api/kv-admin/audit/configs/alerts',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.audit.alerts',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get audit alert thresholds'
    }
  },
  {
    method: 'GET',
    path: '/api/kv-admin/audit/configs/realtime',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.audit.realtime',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get real-time monitoring settings'
    }
  },
  {
    method: 'GET',
    path: '/api/kv-admin/audit/configs/export',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.audit.export',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get audit export settings'
    }
  },
  {
    method: 'GET',
    path: '/api/kv-admin/audit/configs/compliance',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.audit.compliance',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Get audit compliance settings'
    }
  },
  {
    method: 'POST',
    path: '/api/kv-admin/audit/configs/feature/:feature/toggle',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.audit.featureToggle',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Toggle an audit feature flag'
    }
  },

  // Rate limit KV management
  {
    method: 'GET',
    path: '/api/kv-admin/rate-limits',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.rateLimits',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'List KV-backed rate limit keys and metadata'
    }
  },
  {
    method: 'POST',
    path: '/api/kv-admin/rate-limits/clean',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.rateLimitsClean',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Delete rate limit keys by prefix'
    }
  },
  {
    method: 'POST',
    path: '/api/kv-admin/rate-limits/seed',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.rateLimitsSeed',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Seed KV rate limit keys for testing'
    }
  },
  {
    method: 'POST',
    path: '/api/kv-admin/rate-limits/prune-time',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.rateLimitsPruneTime',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Delete rate limit keys within a time range'
    }
  },
  {
    method: 'POST',
    path: '/api/kv-admin/rate-limits/batch-delete',
    metadata: {
      category: 'kv_admin',
      i18nKey: 'endpoints.kv_admin.rateLimitsBatchDelete',
      permissions: PERMISSION_PRESETS.SUPER_ADMIN,
      description: 'Batch delete specific rate limit keys'
    }
  }
];

/**
 * Register all KV admin routes
*/
export function registerKvAdminRoutes() {
  registerRoutes('kv_admin', KV_ADMIN_ROUTES);
}

// Auto-register when imported
registerKvAdminRoutes();
