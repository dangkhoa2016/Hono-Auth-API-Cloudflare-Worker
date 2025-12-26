import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorization.js';
import { DEFAULT_CONFIGS, KV_CONFIG_KEYS, isValidKVKey, getAllKVKeys } from '../constants/kvKeys.js';
import { kvAdminRoutes_log } from '../utils/debug.js';
import { ROLE_COMBINATIONS } from '../constants/roles.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { t, tError, tSuccess } from '../i18n/index.js';
import { clearServiceCaches } from '../utils/serviceFactory.js';

const kvAdmin = new Hono();

// Middleware: only super_admin can access
kvAdmin.use('*', authMiddleware);
kvAdmin.use('*', requireRole(ROLE_COMBINATIONS.SUPER_ADMIN_ONLY));
// Apply auto middleware for KV admin routes
kvAdmin.use('*', unifiedMiddlewares.auto());

/**
 * GET /api/kv-admin/configs - Get all configurations
*/

kvAdmin.get('/configs', async (c) => {
  try {
    const configs = await c.kvConfig.getAll();

    // Merge with default configs and only show allowed keys
    const result = {};
    for (const key of KV_CONFIG_KEYS) {
      result[key] = configs[key] !== undefined ? configs[key] : DEFAULT_CONFIGS[key];
    }

    kvAdminRoutes_log(`Retrieved all configs: ${Object.keys(result).length} items`);
    return c.json({
      success: true,
      data: {
        configs: result,
        allowedKeys: KV_CONFIG_KEYS,
        defaults: DEFAULT_CONFIGS
      },
      message: tSuccess(c, 'kv.configs.retrieved', {
        actor: c.get('user')?.fullName || 'System',
        configCount: Object.keys(result).length,
        allowedKeys: KV_CONFIG_KEYS.length
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to retrieve KV configurations', kvAdminRoutes_log, 'kvAdmin.configsRetrieveFailed', {
      actor: c.get('user')?.fullName || 'System',
      reason: error.message,
      operation: 'getConfigs'
    });
  }
});

/**
 * GET /api/kv-admin/configs/defaults - Get default configurations
*/
kvAdmin.get('/configs/defaults', (c) => {
  const allowedDefaults = {};
  for (const key of KV_CONFIG_KEYS) {
    allowedDefaults[key] = DEFAULT_CONFIGS[key];
  }

  return c.json({
    success: true,
    data: {
      defaults: allowedDefaults,
      allowedKeys: KV_CONFIG_KEYS
    },
    message: tSuccess(c, 'kv.configs.defaultsRetrieved', {
      actor: c.get('user')?.fullName || 'System',
      keyCount: KV_CONFIG_KEYS.length
    })
  });
});

/**
 * GET /api/kv-admin/configs/env-comparison - Compare ENV vs KV
*/
kvAdmin.get('/configs/env-comparison', async (c) => {
  try {
    const kvConfigs = await c.kvConfig.getAll();
    const comparison = {};

    for (const key of KV_CONFIG_KEYS) {
      comparison[key] = {
        env: c.env[key] || null,
        kv: kvConfigs[key] !== undefined ? kvConfigs[key] : null,
        default: DEFAULT_CONFIGS[key] || null,
        source: kvConfigs[key] !== undefined ? 'kv' : (c.env[key] ? 'env' : 'default')
      };
    }

    return c.json({
      success: true,
      data: {
        comparison,
        summary: {
          total: Object.keys(comparison).length,
          fromKV: Object.values(comparison).filter(v => v.source === 'kv').length,
          fromEnv: Object.values(comparison).filter(v => v.source === 'env').length,
          fromDefault: Object.values(comparison).filter(v => v.source === 'default').length
        }
      },
      message: tSuccess(c, 'kv.configs.comparisonRetrieved', {
        actor: c.get('user')?.fullName || 'System',
        kvCount: Object.values(comparison).filter(v => v.source === 'kv').length,
        envCount: Object.values(comparison).filter(v => v.source === 'env').length,
        defaultCount: Object.values(comparison).filter(v => v.source === 'default').length
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to compare ENV vs KV configurations', kvAdminRoutes_log, 'kvAdmin.configsCompareFailed', {
      actor: c.get('user')?.fullName || 'System',
      reason: error.message,
      operation: 'compareConfigs'
    });
  }
});

/**
 * GET /api/kv-admin/configs/:key - Get specific configuration
*/
kvAdmin.get('/configs/:key', async (c) => {
  const key = c.req.param('key');

  // Check if the key is allowed
  if (!isValidKVKey(key)) {
    return c.json({
      success: false,
      error: tError(c, 'kv.invalidKey', { key, validKeys: getAllKVKeys().join(', ') })
    }, 400);
  }

  try {
    const value = await c.kvConfig.get(key, DEFAULT_CONFIGS[key]);
    kvAdminRoutes_log(`Retrieved config: ${key} = ${value}`);

    return c.json({
      success: true,
      data: {
        key,
        value,
        defaultValue: DEFAULT_CONFIGS[key],
        isDefault: value === DEFAULT_CONFIGS[key]
      },
      message: tSuccess(c, 'kv.configs.configRetrieved', {
        actor: c.get('user')?.fullName || 'System',
        key,
        value: String(value),
        isDefault: value === DEFAULT_CONFIGS[key] ? 'true' : 'false'
      })
    });
  } catch (error) {
    const key = c.req.param('key');
    return await handleStandardError(c, error, 'Failed to retrieve KV configuration', kvAdminRoutes_log, 'kvAdmin.configRetrieveFailed', {
      actor: c.get('user')?.fullName || 'System',
      reason: error.message,
      operation: 'getConfig',
      key: key
    });
  }
});

/**
 * PUT /api/kv-admin/configs/:key - Update configuration
*/
kvAdmin.put('/configs/:key', i18nValidatorsMiddleware.configUpdate('json'), async (c) => {
  const key = c.req.param('key');
  const { value } = c.req.valid('json');

  // Check if the key is allowed
  if (!isValidKVKey(key)) {
    return c.json({
      success: false,
      error: tError(c, 'kv.invalidKey', { key, validKeys: getAllKVKeys().join(', ') })
    }, 400);
  }

  try {
    const oldValue = await c.kvConfig.get(key, DEFAULT_CONFIGS[key]);
    const success = await c.kvConfig.set(key, value);

    if (!success) {
      return await handleStandardError(c, new Error('KV_UPDATE_FAILED'), 'KV config update failed', kvAdminRoutes_log, 'kvAdmin.configUpdateFailed', {
        operation: 'updateConfig',
        key,
        reason: 'Set returned false'
      }, 500);
    }

    // Auto-clear service caches to ensure new value is used immediately
    clearServiceCaches();
    kvAdminRoutes_log(`Config updated: ${key} = ${value} (was: ${oldValue}) - service caches cleared`);

    return c.json({
      success: true,
      data: {
        key,
        oldValue,
        newValue: value,
        cacheCleared: true
      },
      message: tSuccess(c, 'kv.adminConfigUpdated', {
        actor: c.get('user')?.fullName || 'System',
        key,
        oldValue: oldValue || 'null',
        newValue: value
      })
    });
  } catch (error) {
    const key = c.req.param('key');
    return await handleStandardError(c, error, 'Failed to update KV configuration', kvAdminRoutes_log, 'kvAdmin.configUpdateFailed', {
      actor: c.get('user')?.fullName || 'System',
      reason: error.message,
      operation: 'updateConfig',
      key: key
    });
  }
});

/**
 * POST /api/kv-admin/configs/batch - Update multiple configurations
*/
kvAdmin.post('/configs/batch', i18nValidatorsMiddleware.configBatchUpdate('json'), async (c) => {
  const { configs } = c.req.valid('json');

  const results = {};
  const errors = {};

  // configs is an array of {key, value, description?} objects
  for (let i = 0; i < configs.length; i++) {
    const configItem = configs[i];
    const { key, value } = configItem;

    // Check if the key is allowed
    if (!isValidKVKey(key)) {
      errors[key] = tError(c, 'kv.invalidKey', { key, validKeys: getAllKVKeys().join(', ') });
      continue;
    }

    try {
      const oldValue = await c.kvConfig.get(key, DEFAULT_CONFIGS[key]);
      const success = await c.kvConfig.set(key, value);

      if (success) {
        results[key] = { oldValue, newValue: value, status: 'updated' };
        kvAdminRoutes_log(`Batch update: ${key} = ${value} (was: ${oldValue})`);
      } else {
        errors[key] = tError(c, 'updateFailed', { key });
      }
    } catch (error) {
      errors[key] = error.message;
      kvAdminRoutes_log(`Batch update error for ${key}: ${error.message}`);
    }
  }

  // Auto-clear service caches if any config was updated successfully
  const updatedCount = Object.keys(results).length;
  if (updatedCount > 0) {
    clearServiceCaches();
    kvAdminRoutes_log(`Batch update completed: ${updatedCount} configs updated - service caches cleared`);
  }

  return c.json({
    success: Object.keys(errors).length === 0,
    data: {
      updated: results,
      errors: errors,
      summary: {
        total: configs.length,
        updated: updatedCount,
        failed: Object.keys(errors).length
      },
      cacheCleared: updatedCount > 0
    },
    message: tSuccess(c, 'kv.batchConfigUpdated', {
      actor: c.get('user')?.fullName || 'System',
      updatedCount: Object.keys(results).length,
      totalCount: configs.length,
      failedCount: Object.keys(errors).length
    })
  });
});

/**
 * DELETE /api/kv-admin/configs/:key - Delete configuration (reset to default)
*/
kvAdmin.delete('/configs/:key', async (c) => {
  const key = c.req.param('key');

  // Check if the key is allowed
  if (!isValidKVKey(key)) {
    return c.json({
      success: false,
      error: tError(c, 'kv.invalidKey', { key, validKeys: getAllKVKeys().join(', ') })
    }, 400);
  }

  try {
    const oldValue = await c.kvConfig.get(key, DEFAULT_CONFIGS[key]);
    const success = await c.kvConfig.delete(key);

    if (!success) {
      return await handleStandardError(c, new Error('KV_RESET_FAILED'), 'KV config reset failed', kvAdminRoutes_log, 'kvAdmin.configResetFailed', {
        operation: 'resetConfig',
        key,
        reason: 'Delete returned false'
      }, 500);
    }

    // Auto-clear service caches to ensure default value is used immediately
    clearServiceCaches();
    kvAdminRoutes_log(`Config reset to default: ${key} (was: ${oldValue}) - service caches cleared`);

    return c.json({
      success: true,
      data: {
        key,
        oldValue,
        defaultValue: DEFAULT_CONFIGS[key],
        cacheCleared: true
      },
      message: tSuccess(c, 'kv.adminConfigReset', {
        actor: c.get('user')?.fullName || 'System',
        key,
        oldValue: oldValue || 'null',
        defaultValue: DEFAULT_CONFIGS[key] || 'null'
      })
    });
  } catch (error) {
    const key = c.req.param('key');
    return await handleStandardError(c, error, 'Failed to reset KV configuration to default', kvAdminRoutes_log, 'kvAdmin.configResetFailed', {
      actor: c.get('user')?.fullName || 'System',
      reason: error.message,
      operation: 'resetConfig',
      key: key
    });
  }
});

/**
 * POST /api/kv-admin/configs/cache/clear - Clear cache
*/
kvAdmin.post('/configs/cache/clear', async (c) => {
  try {
    c.kvConfig.clearCache();
    clearServiceCaches();
    kvAdminRoutes_log('Config cache cleared by admin');

    return c.json({
      success: true,
      data: {},
      message: tSuccess(c, 'kv.adminCacheCleared', {
        actor: c.get('user')?.fullName || 'System'
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to clear KV configuration cache', kvAdminRoutes_log, 'kvAdmin.cacheClearFailed', {
      actor: c.get('user')?.fullName || 'System',
      reason: error.message,
      operation: 'clearCache'
    });
  }
});

// ==========================================================================
// AUDIT SYSTEM CONFIGURATION ENDPOINTS
// ==========================================================================

/**
 * GET /api/kv-admin/audit/configs - Get all audit configurations
*/
kvAdmin.get('/audit/configs',
  // auto middleware handles
  async (c) => {
    try {
      const allConfigs = await c.kvConfig.getAllAuditConfigurations();

      kvAdminRoutes_log('Retrieved all audit configurations');
      return c.json({
        success: true,
        data: allConfigs,
        message: tSuccess(c, 'kv.auditConfigsRetrieved', {
          actor: c.get('user')?.fullName || 'System',
          configCount: Object.keys(allConfigs).length
        })
      });
    } catch (error) {
      return await handleStandardError(c, error, 'Failed to retrieve audit configurations', kvAdminRoutes_log, 'kvAdmin.auditConfigsRetrieveFailed', {
        actor: c.get('user')?.fullName || 'System',
        reason: error.message,
        operation: 'getAuditConfigs'
      });
    }
  }
);

/**
 * GET /api/kv-admin/audit/configs/retention - Get retention policies
*/
kvAdmin.get('/audit/configs/retention',
  // auto
  async (c) => {
    try {
      const retentionPolicies = await c.kvConfig.getRetentionPolicies();

      return c.json({
        success: true,
        data: retentionPolicies,
        message: tSuccess(c, 'kv.auditRetentionRetrieved', {
          actor: c.get('user')?.fullName || 'System',
          policyCount: Object.keys(retentionPolicies).length
        })
      });
    } catch (error) {
      return await handleStandardError(c, error, 'Failed to retrieve retention policies', kvAdminRoutes_log, 'kvAdmin.retentionPoliciesRetrieveFailed', {
        actor: c.get('user')?.fullName || 'System',
        reason: error.message,
        operation: 'getRetentionPolicies'
      });
    }
  }
);

/**
 * GET /api/kv-admin/audit/configs/performance - Get performance settings
*/
kvAdmin.get('/audit/configs/performance',
  // auto
  async (c) => {
    try {
      const performanceSettings = await c.kvConfig.getPerformanceSettings();

      return c.json({
        success: true,
        data: performanceSettings,
        message: tSuccess(c, 'kv.auditPerformanceRetrieved', {
          actor: c.get('user')?.fullName || 'System',
          settingCount: Object.keys(performanceSettings).length
        })
      });
    } catch (error) {
      return await handleStandardError(c, error, 'Failed to retrieve performance settings', kvAdminRoutes_log, 'kvAdmin.performanceSettingsRetrieveFailed', {
        actor: c.get('user')?.fullName || 'System',
        reason: error.message,
        operation: 'getPerformanceSettings'
      });
    }
  }
);

/**
 * GET /api/kv-admin/audit/configs/features - Get feature flags
*/
kvAdmin.get('/audit/configs/features',
  // auto
  async (c) => {
    try {
      const featureFlags = await c.kvConfig.getFeatureFlags();

      return c.json({
        success: true,
        data: featureFlags
      });
    } catch (error) {
      return await handleStandardError(c, error, 'Failed to retrieve feature flags', kvAdminRoutes_log, 'kvAdmin.featureFlagsRetrieveFailed', {
        actor: c.get('user')?.fullName || 'System',
        reason: error.message,
        operation: 'getFeatureFlags'
      });
    }
  }
);

/**
 * GET /api/kv-admin/audit/configs/alerts - Get alert thresholds
*/
kvAdmin.get('/audit/configs/alerts',
  // auto
  async (c) => {
    try {
      const alertThresholds = await c.kvConfig.getAlertThresholds();

      return c.json({
        success: true,
        data: alertThresholds
      });
    } catch (error) {
      return await handleStandardError(c, error, 'Failed to retrieve alert thresholds', kvAdminRoutes_log, 'kvAdmin.alertThresholdsRetrieveFailed', {
        actor: c.get('user')?.fullName || 'System',
        reason: error.message,
        operation: 'getAlertThresholds'
      });
    }
  }
);

/**
 * GET /api/kv-admin/audit/configs/realtime - Get real-time monitoring settings
*/
kvAdmin.get('/audit/configs/realtime',
  // auto
  async (c) => {
    try {
      const realtimeSettings = await c.kvConfig.getRealtimeMonitoringSettings();

      return c.json({
        success: true,
        data: realtimeSettings
      });
    } catch (error) {
      return await handleStandardError(c, error, 'Failed to retrieve realtime settings', kvAdminRoutes_log, 'kvAdmin.realtimeSettingsRetrieveFailed', {
        actor: c.get('user')?.fullName || 'System',
        reason: error.message,
        operation: 'getRealtimeSettings'
      });
    }
  }
);

/**
 * GET /api/kv-admin/audit/configs/export - Get export settings
*/
kvAdmin.get('/audit/configs/export',
  // auto
  async (c) => {
    try {
      const exportSettings = await c.kvConfig.getExportSettings();

      return c.json({
        success: true,
        data: exportSettings
      });
    } catch (error) {
      return await handleStandardError(c, error, 'Failed to retrieve export settings', kvAdminRoutes_log, 'kvAdmin.exportSettingsRetrieveFailed', {
        actor: c.get('user')?.fullName || 'System',
        reason: error.message,
        operation: 'getExportSettings'
      });
    }
  }
);

/**
 * GET /api/kv-admin/audit/configs/compliance - Get compliance settings
*/
kvAdmin.get('/audit/configs/compliance',
  // auto
  async (c) => {
    try {
      const complianceSettings = await c.kvConfig.getComplianceSettings();

      return c.json({
        success: true,
        data: complianceSettings
      });
    } catch (error) {
      return await handleStandardError(c, error, 'Failed to retrieve compliance settings', kvAdminRoutes_log, 'kvAdmin.complianceSettingsRetrieveFailed', {
        actor: c.get('user')?.fullName || 'System',
        reason: error.message,
        operation: 'getComplianceSettings'
      });
    }
  }
);

/**
 * POST /api/kv-admin/audit/configs/feature/:feature/toggle - Toggle a feature
*/
kvAdmin.post('/audit/configs/feature/:feature/toggle',
  // auto
  async (c) => {
    try {
      const feature = c.req.param('feature');

      // Map feature names to actual KV keys
      const featureKeyMap = {
        'enableRealTimeMonitoring': 'AUDIT_ENABLE_REAL_TIME_MONITORING',
        'enableAdvancedAnalytics': 'AUDIT_ENABLE_ADVANCED_ANALYTICS',
        'enableExport': 'AUDIT_ENABLE_EXPORT',
        'enableArchival': 'AUDIT_ENABLE_ARCHIVAL',
        'enableComplianceReporting': 'AUDIT_ENABLE_COMPLIANCE_REPORTING',
        'enablePerformanceMonitoring': 'AUDIT_ENABLE_PERFORMANCE_MONITORING'
      };

      const key = featureKeyMap[feature];

      // Check if feature exists
      if (!key || !isValidKVKey(key)) {
        return c.json({
          success: false,
          error: t(c, 'kv.featureNotFound')
        }, 400);
      }

      // Get request body
      const body = await c.req.json();
      const { enabled } = body;

      if (typeof enabled !== 'boolean') {
        return c.json({
          success: false,
          error: t(c, 'kv.invalidFeatureValue')
        }, 400);
      }

      // Get current value
      const currentValue = await c.kvConfig.get(key, DEFAULT_CONFIGS[key]);
      const currentBool = typeof currentValue === 'boolean' ? currentValue :
        typeof currentValue === 'string' ? currentValue.toLowerCase() === 'true' :
          Boolean(currentValue);

      // Set new value
      await c.kvConfig.set(key, enabled.toString());

      kvAdminRoutes_log(`Set audit feature ${feature}: ${currentBool} -> ${enabled}`);

      return c.json({
        success: true,
        data: {
          feature,
          previousValue: currentBool,
          newValue: enabled,
          message: tSuccess(c, 'kv.featureToggled', {
            feature,
            status: enabled ? tSuccess(c, 'kv.status.enabled') || 'enabled' : tSuccess(c, 'kv.status.disabled') || 'disabled'
          })
        }
      });
    } catch (error) {
      const feature = c.req.param('feature');
      return await handleStandardError(c, error, 'Failed to toggle audit feature', kvAdminRoutes_log, 'kvAdmin.featureToggleFailed', {
        actor: c.get('user')?.fullName || 'System',
        reason: error.message,
        operation: 'toggleFeature',
        feature: feature
      });
    }
  }
);

export default kvAdmin;
