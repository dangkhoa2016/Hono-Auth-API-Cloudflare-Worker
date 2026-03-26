import { Hono } from 'hono';
import { authMiddleware } from '../middleware/auth.js';
import { requireRole } from '../middleware/authorization.js';
import { DEFAULT_CONFIGS, KV_CONFIG_KEYS, isValidKVKey } from '../constants/kvKeys.js';
import { kvAdminRoutes_log } from '../utils/debug.js';
import { ROLE_COMBINATIONS } from '../constants/roles.js';
import { unifiedMiddlewares } from '../middleware/unifiedRequestMiddleware.js';
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';
import { handleStandardError } from '../utils/errorHandler.js';
import { t, tError, tSuccess } from '../i18n/index.js';
import { clearServiceCaches } from '../utils/serviceFactory.js';

function buildRateLimitMetadataFromValue(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const embeddedMetadata = value.metadata && typeof value.metadata === 'object' && !Array.isArray(value.metadata)
    ? value.metadata
    : {};

  const rateLimitMetadata = {
    type: 'rate_limit',
    attempts: value.attempts,
    firstAttempt: value.firstAttempt,
    lastAttempt: value.lastAttempt,
    ...embeddedMetadata
  };

  const normalizedMetadata = Object.fromEntries(
    Object.entries(rateLimitMetadata).filter(([, fieldValue]) => fieldValue !== undefined && fieldValue !== null)
  );

  return Object.keys(normalizedMetadata).length > 0 ? normalizedMetadata : null;
}

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
      error: tError(c, 'kv.invalidKey', { key })
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
      error: tError(c, 'kv.invalidKey', { key })
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
      errors[key] = tError(c, 'kv.invalidKey', { key });
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
      error: tError(c, 'kv.invalidKey', { key })
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
          error: t(c, 'errors.kv.featureNotFound')
        }, 400);
      }

      // Get request body
      const body = await c.req.json();
      const { enabled } = body;

      if (typeof enabled !== 'boolean') {
        return c.json({
          success: false,
          error: t(c, 'errors.kv.invalidFeatureValue')
        }, 400);
      }

      // Get current value
      const currentValue = await c.kvConfig.get(key, DEFAULT_CONFIGS[key]);
      const currentBool = typeof currentValue === 'boolean' ? currentValue :
        typeof currentValue === 'string' ? currentValue.toLowerCase() === 'true' :
          Boolean(currentValue);

      // Set new value
      await c.kvConfig.set(key, enabled.toString());

      // Auto-clear service caches to ensure new value is used immediately
      clearServiceCaches();

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

// ==========================================================================
// RATE LIMIT MANAGEMENT ENDPOINTS
// ==========================================================================

/**
 * GET /api/kv-admin/rate-limits - List rate limit keys
 */
kvAdmin.get('/rate-limits', async (c) => {
  try {
    const prefix = c.req.query('prefix') || '';
    const limit = parseInt(c.req.query('limit') || '100', 10);
    const cursor = c.req.query('cursor');

    const kvService = c.kvConfig;

    const options = { limit };
    if (prefix) {
      options.prefix = prefix;
    }
    if (cursor) {
      options.cursor = cursor;
    }

    const list = await kvService.listRaw(options);

    const keysInfo = await Promise.all(list.keys.map(async (key) => {
      try {
        const valueStr = await kvService.getRaw(key.name);
        let value = valueStr;
        try {
          if (valueStr && typeof valueStr === 'string' && (valueStr.startsWith('{') || valueStr.startsWith('['))) {
            value = JSON.parse(valueStr);
          }
        } catch (e) {
          // Keep as string if parsing fails
        }

        return {
          name: key.name,
          expiration: key.expiration,
          metadata: key.metadata || buildRateLimitMetadataFromValue(value),
          value: value
        };
      } catch (e) {
        return {
          name: key.name,
          error: 'Failed to retrieve value'
        };
      }
    }));

    kvAdminRoutes_log(`Listed rate limits: ${list.keys.length} keys`);

    return c.json({
      success: true,
      data: {
        keys: keysInfo,
        list_complete: list.list_complete,
        cursor: list.cursor
      },
      message: tSuccess(c, 'kv.rateLimit.listed', {
        count: keysInfo.length
      }) || 'Listed rate limit keys successfully'
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to list rate limits', kvAdminRoutes_log, 'kvAdmin.rateLimitListFailed');
  }
});

/**
 * POST /api/kv-admin/rate-limits/clean - Clean rate limit keys
 */
kvAdmin.post('/rate-limits/clean', async (c) => {
  try {
    const { prefix, dryRun = false } = await c.req.json();

    if (!prefix) {
      return c.json({ success: false, error: 'Prefix is required' }, 400);
    }

    const kvService = c.kvConfig;
    let cursor = null;
    let deletedCount = 0;
    const affectedKeys = [];

    do {
      const list = await kvService.listRaw({ prefix, cursor });
      cursor = list.cursor;

      for (const key of list.keys) {
        if (dryRun) {
          affectedKeys.push(key.name);
        } else {
          await kvService.deleteRaw(key.name);
          affectedKeys.push(key.name);
        }
        deletedCount++;
      }
    } while (cursor);

    kvAdminRoutes_log(`Clean rate limits (dryRun=${dryRun}): ${deletedCount} keys with prefix ${prefix}`);

    return c.json({
      success: true,
      data: {
        prefix,
        dryRun,
        deletedCount,
        affectedKeys: affectedKeys.length > 100 ? affectedKeys.slice(0, 100).concat(['...more']) : affectedKeys
      },
      message: tSuccess(c, dryRun ? 'kv.rateLimit.cleanDryRun' : 'kv.rateLimit.cleaned', {
        count: deletedCount,
        prefix
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to clean rate limits', kvAdminRoutes_log, 'kvAdmin.rateLimitCleanFailed');
  }
});

/**
 * POST /api/kv-admin/rate-limits/seed - Seed rate limit keys
 */
kvAdmin.post('/rate-limits/seed', async (c) => {
  try {
    const { prefix, count = 10, attempts = 1 } = await c.req.json();

    if (!prefix) {
      return c.json({ success: false, error: 'Prefix is required' }, 400);
    }

    const kvService = c.kvConfig;
    const createdKeys = [];

    for (let i = 0; i < count; i++) {
      const timestamp = Date.now();
      const key = `${prefix}seed:${i}:${timestamp}`;
      const value = {
        attempts: attempts,
        firstAttempt: timestamp,
        lastAttempt: timestamp,
        metadata: { reason: 'seed_api', index: i }
      };

      await kvService.putRaw(key, JSON.stringify(value), {
        expirationTtl: 86400,
        metadata: {
          type: 'rate_limit',
          source: 'seed_api',
          prefix,
          index: i,
          attempts,
          firstAttempt: timestamp,
          lastAttempt: timestamp,
          reason: 'seed_api'
        }
      });
      createdKeys.push(key);
    }

    kvAdminRoutes_log(`Seeded rate limits: ${count} keys with prefix ${prefix}`);

    return c.json({
      success: true,
      data: {
        prefix,
        count,
        createdKeys: createdKeys.length > 100 ? createdKeys.slice(0, 100).concat(['...more']) : createdKeys
      },
      message: tSuccess(c, 'kv.rateLimit.seeded', {
        count,
        prefix
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to seed rate limits', kvAdminRoutes_log, 'kvAdmin.rateLimitSeedFailed');
  }
});

/**
 * POST /api/kv-admin/rate-limits/prune-time - Prune rate limits by time
 */
kvAdmin.post('/rate-limits/prune-time', async (c) => {
  try {
    const { prefix, start, end, dryRun = false } = await c.req.json();

    if (!prefix || !start || !end) {
      return c.json({ success: false, error: 'Prefix, start, and end are required' }, 400);
    }

    // Helper to parse timestamp
    const parseTimestamp = (input) => {
      if (typeof input === 'number') {return input;}
      if (/^\d+$/.test(input)) {return parseInt(input, 10);}
      const date = new Date(input);
      if (!isNaN(date.getTime())) {return date.getTime();}
      throw new Error(`Invalid date format: "${input}"`);
    };

    let startTime, endTime;
    try {
      startTime = parseTimestamp(start);
      endTime = parseTimestamp(end);
    } catch (e) {
      return c.json({ success: false, error: e.message }, 400);
    }

    const kvService = c.kvConfig;
    let cursor = null;
    let deletedCount = 0;
    let checkedCount = 0;
    const affectedKeys = [];

    do {
      const list = await kvService.listRaw({ prefix, cursor });
      cursor = list.cursor;

      for (const key of list.keys) {
        checkedCount++;
        try {
          const value = await kvService.getRaw(key.name, 'json');

          if (value && (value.firstAttempt || value.lastAttempt)) {
            const timestamp = value.firstAttempt || value.lastAttempt;

            if (timestamp >= startTime && timestamp <= endTime) {
              if (dryRun) {
                affectedKeys.push({ key: key.name, timestamp });
              } else {
                await kvService.deleteRaw(key.name);
                affectedKeys.push({ key: key.name, timestamp });
              }
              deletedCount++;
            }
          }
        } catch (e) {
          kvAdminRoutes_log(`Failed to process key ${key.name}: ${e.message}`);
        }
      }
    } while (cursor);

    kvAdminRoutes_log(`Prune rate limits (dryRun=${dryRun}): ${deletedCount} keys pruned`);

    return c.json({
      success: true,
      data: {
        prefix,
        range: { start: new Date(startTime).toISOString(), end: new Date(endTime).toISOString() },
        dryRun,
        checkedCount,
        deletedCount,
        affectedKeys: affectedKeys.length > 100 ? affectedKeys.slice(0, 100).concat(['...more']) : affectedKeys
      },
      message: tSuccess(c, dryRun ? 'kv.rateLimit.pruneDryRun' : 'kv.rateLimit.pruned', {
        count: deletedCount,
        prefix
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to prune rate limits', kvAdminRoutes_log, 'kvAdmin.rateLimitPruneFailed');
  }
});

/**
 * POST /api/kv-admin/rate-limits/batch-delete - Batch delete rate limit keys
 */
kvAdmin.post('/rate-limits/batch-delete', async (c) => {
  try {
    const { keys, dryRun = false } = await c.req.json();

    if (!Array.isArray(keys) || keys.length === 0) {
      return c.json({ success: false, error: 'Keys array is required and cannot be empty' }, 400);
    }

    const kvService = c.kvConfig;
    const results = [];
    let deletedCount = 0;
    let failedCount = 0;

    for (const key of keys) {
      try {
        if (dryRun) {
          results.push({ key, status: 'dry-run' });
          deletedCount++;
        } else {
          await kvService.deleteRaw(key);
          results.push({ key, status: 'deleted' });
          deletedCount++;
        }
      } catch (error) {
        results.push({ key, status: 'failed', error: error.message });
        failedCount++;
      }
    }

    kvAdminRoutes_log(`Batch delete rate limits (dryRun=${dryRun}): ${deletedCount} keys processed`);

    return c.json({
      success: true,
      data: {
        dryRun,
        deletedCount,
        failedCount,
        results: results.length > 100 ? results.slice(0, 100).concat(['...more']) : results
      },
      message: tSuccess(c, dryRun ? 'kv.rateLimit.batchDeleteDryRun' : 'kv.rateLimit.batchDeleted', {
        count: deletedCount,
        failed: failedCount
      })
    });
  } catch (error) {
    return await handleStandardError(c, error, 'Failed to batch delete rate limits', kvAdminRoutes_log, 'kvAdmin.rateLimitBatchDeleteFailed');
  }
});

export default kvAdmin;
