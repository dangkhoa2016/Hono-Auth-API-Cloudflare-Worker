/**
 * Schema Definitions - Centralized schema name and category definitions
 * Single source of truth for all schema names, categories, and validator mappings
 */

/**
 * Schema category mappings - groups schemas by their creator functions
 * Each category maps to a creator function and contains related schema names with validator mappings
 * Single source of truth for schemas, categories, and validator mappings
 */
export const SCHEMA_CATEGORIES = {
  auth: {
    creatorModule: './auth.js',
    creatorFunction: 'createAuthI18nSchemas',
    schemas: {
      loginSchema: { validatorName: 'login', defaultTarget: 'json' },
      refreshTokenSchema: { validatorName: 'refreshToken', defaultTarget: 'json' },
      logoutSchema: { validatorName: 'logout', defaultTarget: 'json' },
      logoutAllSchema: { validatorName: 'logoutAll', defaultTarget: 'json' },
      passwordResetRequestSchema: { validatorName: 'passwordReset', defaultTarget: 'json' },
      passwordResetConfirmSchema: { validatorName: 'passwordResetConfirm', defaultTarget: 'json' }
    }
  },

  user: {
    creatorModule: './user.js',
    creatorFunction: 'createUserI18nSchemas',
    schemas: {
      updateUserSchema: { validatorName: 'updateUser', defaultTarget: 'json' },
      changePasswordSchema: { validatorName: 'changePassword', defaultTarget: 'json' },
      updateProfileSchema: { validatorName: 'updateProfile', defaultTarget: 'json' },
      createUserSchema: { validatorName: 'createUser', defaultTarget: 'json' },
      updateUserWithoutRoleSchema: { validatorName: 'updateUserWithoutRole', defaultTarget: 'json' },
      userListQuerySchema: { validatorName: 'userListQuery', defaultTarget: 'query' },
      registerUserSchema: { validatorName: 'register', defaultTarget: 'json' }
    }
  },

  admin: {
    creatorModule: './admin.js',
    creatorFunction: 'createAdminI18nSchemas',
    schemas: {
      roleChangeSchema: { validatorName: 'roleChange', defaultTarget: 'json' },
      adminStatsQuerySchema: { validatorName: 'adminStats', defaultTarget: 'query' },
      systemHealthSchema: { validatorName: 'systemHealth', defaultTarget: 'query' },
      createAdminUserSchema: { validatorName: 'createAdminUser', defaultTarget: 'json' },
      adminUserUpdateSchema: { validatorName: 'adminUserUpdate', defaultTarget: 'json' }
    }
  },

  audit: {
    creatorModule: './audit.js',
    creatorFunction: 'createAuditI18nSchemas',
    schemas: {
      auditQuerySchema: { validatorName: 'auditQuery', defaultTarget: 'query' },
      auditSearchSchema: { validatorName: 'auditSearch', defaultTarget: 'query' },
      auditExportSchema: { validatorName: 'auditExport', defaultTarget: 'query' }
    }
  },

  advancedAudit: {
    creatorModule: './advancedAudit.js',
    creatorFunction: 'createAdvancedAuditI18nSchemas',
    schemas: {
      analyticsQuerySchema: { validatorName: 'analyticsQuery', defaultTarget: 'query' },
      archivalQuerySchema: { validatorName: 'archivalQuery', defaultTarget: 'json' },
      restoreQuerySchema: { validatorName: 'restoreQuery', defaultTarget: 'json' },
      truncateQuerySchema: { validatorName: 'truncateQuery', defaultTarget: 'json' },
      performanceQuerySchema: { validatorName: 'performanceQuery', defaultTarget: 'query' },
      complianceReportSchema: { validatorName: 'complianceReport', defaultTarget: 'json' },
      alertConfigSchema: { validatorName: 'alertConfig', defaultTarget: 'json' },
      complianceQuerySchema: { validatorName: 'complianceQuery', defaultTarget: 'query' }
    }
  },

  auditRetention: {
    creatorModule: './auditRetention.js',
    creatorFunction: 'createAuditRetentionI18nSchemas',
    schemas: {
      auditRetentionPolicySchema: { validatorName: 'retentionPolicy', defaultTarget: 'json' },
      cleanupSimulationSchema: { validatorName: 'cleanupSimulation', defaultTarget: 'json' },
      retentionPolicyUpdateSchema: { validatorName: 'retentionPolicyUpdate', defaultTarget: 'json' },
      advancedCleanupSchema: { validatorName: 'advancedCleanup', defaultTarget: 'json' }
    }
  },

  realtimeMonitoring: {
    creatorModule: './realtimeMonitoring.js',
    creatorFunction: 'createRealtimeMonitoringSchemas',
    schemas: {
      monitoringConfigSchema: { validatorName: 'monitoringConfig', defaultTarget: 'json' },
      alertRuleSchema: { validatorName: 'alertRule', defaultTarget: 'json' },
      alertChannelSchema: { validatorName: 'alertChannel', defaultTarget: 'json' },
      threatResolutionSchema: { validatorName: 'threatResolution', defaultTarget: 'json' },
      timeRangeSchema: { validatorName: 'timeRange', defaultTarget: 'json' },
      manualAlertSchema: { validatorName: 'manualAlert', defaultTarget: 'json' },
      dashboardExportSchema: { validatorName: 'dashboardExport', defaultTarget: 'json' }
    }
  },

  securityIncident: {
    creatorModule: './securityIncident.js',
    creatorFunction: 'createSecurityIncidentI18nSchemas',
    schemas: {
      createIncidentSchema: { validatorName: 'createIncident', defaultTarget: 'json' },
      updateStatusSchema: { validatorName: 'updateIncidentStatus', defaultTarget: 'json' },
      manualResponseSchema: { validatorName: 'manualResponse', defaultTarget: 'json' }
    }
  },

  kv: {
    creatorModule: './kv.js',
    creatorFunction: 'createKvI18nSchemas',
    schemas: {
      configUpdateSchema: { validatorName: 'configUpdate', defaultTarget: 'json' },
      configBatchUpdateSchema: { validatorName: 'configBatchUpdate', defaultTarget: 'json' }
    }
  },

  demo: {
    creatorModule: './zodDemo.js',
    creatorFunction: 'createZodDemoSchemas',
    schemas: {
      userRegistrationSchema: { validatorName: 'userRegistration', defaultTarget: 'json' },
      searchSchema: { validatorName: 'search', defaultTarget: 'query' },
      fileUploadSchema: { validatorName: 'fileUpload', defaultTarget: 'json' },
      advancedValidationSchema: { validatorName: 'advancedValidation', defaultTarget: 'json' }
    }
  }
};

/**
 * Generate validator mappings from SCHEMA_CATEGORIES
 * Eliminates duplication by deriving from single source of truth
 */
function generateValidatorMappings() {
  const mappings = {};

  for (const categoryData of Object.values(SCHEMA_CATEGORIES)) {
    for (const [schemaName, schemaConfig] of Object.entries(categoryData.schemas)) {
      mappings[schemaConfig.validatorName] = {
        schema: schemaName,
        defaultTarget: schemaConfig.defaultTarget
      };
    }
  }

  return mappings;
}

/**
 * Validator convenience method mappings - GENERATED from SCHEMA_CATEGORIES
 * No longer manually maintained - automatically derived from schema definitions
 */
export const VALIDATOR_MAPPINGS = generateValidatorMappings();

/**
 * Utility functions for schema definitions
 */

/**
 * Get all available schema names from all categories
 * @returns {Array<string>} Array of all schema names
 */
export function getAllSchemaNames() {
  const allSchemas = [];
  for (const category of Object.values(SCHEMA_CATEGORIES)) {
    allSchemas.push(...Object.keys(category.schemas));
  }
  return allSchemas;
}

/**
 * Get category for a specific schema name
 * @param {string} schemaName - Schema name to find
 * @returns {string|null} Category name or null if not found
 */
export function getCategoryForSchema(schemaName) {
  for (const [categoryName, categoryData] of Object.entries(SCHEMA_CATEGORIES)) {
    if (Object.prototype.hasOwnProperty.call(categoryData.schemas, schemaName)) {
      return categoryName;
    }
  }
  return null;
}

/**
 * Get creator function info for a schema
 * @param {string} schemaName - Schema name
 * @returns {Object|null} Creator function info or null if not found
 */
export function getCreatorForSchema(schemaName) {
  const category = getCategoryForSchema(schemaName);
  if (!category) {return null;}

  const categoryData = SCHEMA_CATEGORIES[category];
  return {
    category,
    module: categoryData.creatorModule,
    function: categoryData.creatorFunction
  };
}

/**
 * Get all available validator method names
 * @returns {Array<string>} Array of validator method names
 */
export function getAllValidatorMethods() {
  return Object.keys(VALIDATOR_MAPPINGS);
}

/**
 * Get schema name for a validator method
 * @param {string} methodName - Validator method name
 * @returns {string|null} Schema name or null if not found
 */
export function getSchemaForValidator(methodName) {
  const mapping = VALIDATOR_MAPPINGS[methodName];
  return mapping ? mapping.schema : null;
}

/**
 * Get default target for a validator method
 * @param {string} methodName - Validator method name
 * @returns {string} Default target ('json', 'query', etc.) or 'json' as fallback
 */
export function getDefaultTargetForValidator(methodName) {
  const mapping = VALIDATOR_MAPPINGS[methodName];
  return mapping ? mapping.defaultTarget : 'json';
}

/**
 * Validate schema name exists in definitions
 * @param {string} schemaName - Schema name to validate
 * @returns {boolean} True if schema exists
 */
export function isValidSchemaName(schemaName) {
  return getAllSchemaNames().includes(schemaName);
}

/**
 * Validate validator method name exists
 * @param {string} methodName - Validator method name to validate
 * @returns {boolean} True if validator method exists
 */
export function isValidValidatorMethod(methodName) {
  return Object.prototype.hasOwnProperty.call(VALIDATOR_MAPPINGS, methodName);
}

/**
 * Get schema statistics
 * @returns {Object} Statistics about schemas and validators
 */
export function getSchemaStats() {
  const categories = Object.keys(SCHEMA_CATEGORIES);
  const totalSchemas = getAllSchemaNames().length;
  const totalValidators = Object.keys(VALIDATOR_MAPPINGS).length;

  const categoryStats = {};
  for (const [categoryName, categoryData] of Object.entries(SCHEMA_CATEGORIES)) {
    categoryStats[categoryName] = Object.keys(categoryData.schemas).length;
  }

  return {
    totalCategories: categories.length,
    totalSchemas,
    totalValidators,
    categories: categoryStats,
    averageSchemasPerCategory: Math.round(totalSchemas / categories.length)
  };
}
