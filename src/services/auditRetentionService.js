import { BaseService } from './baseService.js';
import { auditRetentionService_log } from '../utils/debug.js';
import { createKvConfigService } from '../utils/serviceFactory.js';
import {
  createAuditRetentionI18nSchemas
} from '../schemas/auditRetention.js';

const AUDIT_RETENTION_POLICY_KEY = 'audit_retention_policy';
import { getDefaultLanguage } from '../i18n/config.js';

// Cache TTL for schema caching
const CACHE_TTL = 300000; // 5 minutes

// Default policy configuration
const DEFAULT_POLICY = {
  audit_log_retention_days: 365,
  user_data_retention_days: 2555, // ~7 years
  version: '1.0'
};

// Cleanup operation constants
const ESTIMATED_RECORD_SIZE_KB = 0.5;
const BATCH_SIZE = 1000;

/**
 * Audit Retention Service
 * Manages data retention policies and cleanup operations for audit logs
*/
export class AuditRetentionService extends BaseService {
  constructor(env) {
    super(env, 'AuditRetentionService');
    this.kvConfig = createKvConfigService(env);
    this.schemaCache = new Map();
    auditRetentionService_log('AuditRetentionService initialized');
  }

  /**
   * Get schema with caching and i18n support
   * @param {string} schemaType - Type of schema ('retention', 'cleanup', 'update')
   * @param {string} lang - Language code
   * @returns {Object} Zod schema
   */
  getSchema(schemaType, lang = 'en') {
    const cacheKey = `${schemaType}:${lang}`;

    // Check cache first
    const cached = this.schemaCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
      return cached.schema;
    }

    let schema;

    try {
      // Always use i18n schemas for consistency
      const i18nSchemas = createAuditRetentionI18nSchemas(lang);
      switch (schemaType) {
      case 'retention':
        schema = i18nSchemas.auditRetentionPolicySchema;
        break;
      case 'cleanup':
        schema = i18nSchemas.cleanupSimulationSchema;
        break;
      case 'update':
        schema = i18nSchemas.retentionPolicyUpdateSchema;
        break;
      default:
        throw new Error(`Unknown schema type: ${schemaType}`);
      }
    } catch (error) {
      auditRetentionService_log(`Failed to load i18n schema for ${lang}, falling back to default language: ${error.message}`);
      const defaultLang = getDefaultLanguage();
      if (lang !== defaultLang) {
        return this.getSchema(schemaType, defaultLang);
      }
      throw new Error(`Failed to load schema for type: ${schemaType}, language: ${lang}`);
    }

    // Cache the schema
    this.schemaCache.set(cacheKey, {
      schema,
      timestamp: Date.now()
    });

    return schema;
  }

  /**
   * Validate data using appropriate schema
   * @param {string} schemaType - Type of schema to use
   * @param {Object} data - Data to validate
   * @param {string} lang - Language code for error messages
   * @returns {Object} Validation result
   */
  validateData(schemaType, data, lang = 'en') {
    try {
      const schema = this.getSchema(schemaType, lang);
      const validatedData = schema.parse(data);

      return {
        success: true,
        data: validatedData,
        errors: null
      };
    } catch (error) {
      auditRetentionService_log(`Validation failed for ${schemaType}: ${error.message}`);

      if (error.errors) {
        // Zod validation error
        return {
          success: false,
          data: null,
          errors: error.errors,
          message: error.errors.map(err => `${err.path.join('.')}: ${err.message}`).join(', ')
        };
      }

      return {
        success: false,
        data: null,
        errors: [{ message: error.message }],
        message: error.message
      };
    }
  }

  /**
   * Get current retention policy with schema validation
   * @param {string} lang - Language code for validation
   * @returns {Promise<Object>} Current retention policy settings
   */
  async getRetentionPolicy(lang = 'en') {
    auditRetentionService_log('Getting current retention policy');

    try {
      // Try to get policy from KV store first
      let policy = null;
      if (this.kvConfig) {
        const kvPolicy = await this.kvConfig.get(AUDIT_RETENTION_POLICY_KEY);
        if (kvPolicy) {
          policy = typeof kvPolicy === 'string' ? JSON.parse(kvPolicy) : kvPolicy;
        }
      }

      // Use default policy if not found
      if (!policy) {
        policy = {
          ...DEFAULT_POLICY,
          last_updated: new Date().toISOString(),
          created_by: 'system'
        };
      }

      // Validate the policy using schema
      const validation = this.validateData('retention', policy, lang);
      if (!validation.success) {
        auditRetentionService_log(`Policy validation failed: ${validation.message}`);
        // Still return the policy but with validation warnings
        return {
          success: true,
          policy,
          validation_warnings: validation.errors,
          message: 'Retention policy retrieved with validation warnings'
        };
      }

      auditRetentionService_log(`Retrieved retention policy: ${JSON.stringify(validation.data)}`);
      return {
        success: true,
        policy: validation.data,
        message: 'Retention policy retrieved successfully'
      };

    } catch (error) {
      auditRetentionService_log(`Error getting retention policy: ${error.message}`);
      return {
        success: false,
        error: error.message,
        policy: null
      };
    }
  }

  /**
   * Set new retention policy with schema validation
   * @param {Object} policy - New retention policy settings
   * @param {string} lang - Language code for validation
   * @returns {Promise<Object>} Operation result
   */
  async setRetentionPolicy(policy, lang = 'en') {
    auditRetentionService_log(`Setting new retention policy: ${JSON.stringify(policy)}`);

    try {
      // Validate policy using schema
      const validation = this.validateData('retention', policy, lang);
      if (!validation.success) {
        auditRetentionService_log(`Validation error setting retention policy: ${validation.message}`);
        return {
          success: false,
          error: `Validation failed: ${validation.message}`,
          policy: null,
          validation_errors: validation.errors
        };
      }

      const validatedPolicy = validation.data;

      // Get current policy
      const currentPolicyResult = await this.getRetentionPolicy(lang);
      const currentPolicy = currentPolicyResult.policy || {};

      // Merge with current policy
      const newPolicy = {
        ...currentPolicy,
        ...validatedPolicy,
        last_updated: new Date().toISOString(),
        version: (parseFloat(currentPolicy.version || '1.0') + 0.1).toFixed(1)
      };

      // Validate the merged policy
      const finalValidation = this.validateData('retention', newPolicy, lang);
      if (!finalValidation.success) {
        auditRetentionService_log(`Final validation failed: ${finalValidation.message}`);
        return {
          success: false,
          error: `Final validation failed: ${finalValidation.message}`,
          policy: null,
          validation_errors: finalValidation.errors
        };
      }

      // Save to KV store if available
      if (this.kvConfig) {
        await this.kvConfig.set(AUDIT_RETENTION_POLICY_KEY, finalValidation.data);
      }

      auditRetentionService_log('Retention policy updated successfully');
      return {
        success: true,
        policy: finalValidation.data,
        message: 'Retention policy updated successfully'
      };

    } catch (error) {
      auditRetentionService_log(`Error setting retention policy: ${error.message}`);
      return {
        success: false,
        error: error.message,
        policy: null
      };
    }
  }

  /**
   * Update retention policy using update schema
   * @param {Object} updates - Partial updates to apply
   * @param {string} lang - Language code for validation
   * @returns {Promise<Object>} Operation result
   */
  async updateRetentionPolicy(updates, lang = 'en') {
    auditRetentionService_log(`Updating retention policy: ${JSON.stringify(updates)}`);

    try {
      // Validate updates using update schema
      const validation = this.validateData('update', updates, lang);
      if (!validation.success) {
        return {
          success: false,
          error: `Update validation failed: ${validation.message}`,
          validation_errors: validation.errors
        };
      }

      // Get current policy
      const currentResult = await this.getRetentionPolicy(lang);
      if (!currentResult.success) {
        return currentResult;
      }

      // Apply updates
      const updatedPolicy = {
        ...currentResult.policy,
        ...validation.data,
        last_updated: new Date().toISOString()
      };

      // Set the updated policy (this will validate the complete policy)
      return await this.setRetentionPolicy(updatedPolicy, lang);

    } catch (error) {
      auditRetentionService_log(`Error updating retention policy: ${error.message}`);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Simulate cleanup operation without actual deletion
   * @param {Object} options - Cleanup simulation options
   * @param {string} lang - Language code for validation
   * @returns {Promise<Object>} Simulation results
   */
  async simulateCleanup(options = {}, lang = 'en') {
    auditRetentionService_log('Simulating cleanup operation');

    try {
      // Validate cleanup options using schema
      const cleanupOptions = {
        dry_run: true,
        ...options
      };

      const validation = this.validateData('cleanup', cleanupOptions, lang);
      if (!validation.success) {
        return {
          success: false,
          error: `Cleanup options validation failed: ${validation.message}`,
          validation_errors: validation.errors
        };
      }

      const policyResult = await this.getRetentionPolicy(lang);
      if (!policyResult.success) {
        return policyResult;
      }

      const policy = policyResult.policy;

      const results = {
        audit_logs: { eligible: 0, affected_records: 0 },
        user_data: { eligible: 0, affected_records: 0 },
        total_space_freed: '0 MB',
        simulation: true,
        options: validation.data
      };

      // Simulate audit logs cleanup
      if (policy.audit_log_retention_days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - policy.audit_log_retention_days);

        const auditLogsQuery = `
          SELECT COUNT(*) as count 
          FROM audit_logs 
          WHERE timestamp < ?
        `;

        const auditLogsResult = await this.dbService.select(auditLogsQuery, [cutoffDate.toISOString()]);
        results.audit_logs.eligible = auditLogsResult[0]?.count || 0;
        results.audit_logs.affected_records = results.audit_logs.eligible;
      }

      // Simulate user data cleanup (if applicable)
      if (policy.user_data_retention_days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - policy.user_data_retention_days);

        // This is a simulation - in reality, you'd need to define what "old user data" means
        results.user_data.eligible = 0; // Placeholder
        results.user_data.affected_records = 0;
      }

      // Estimate space freed using constant
      const totalRecords = results.audit_logs.affected_records + results.user_data.affected_records;
      const estimatedSizeKB = Math.round(totalRecords * ESTIMATED_RECORD_SIZE_KB);
      results.total_space_freed = estimatedSizeKB > 1024 ?
        `${(estimatedSizeKB / 1024).toFixed(1)} MB` :
        `${estimatedSizeKB} KB`;

      auditRetentionService_log(`Cleanup simulation completed: ${JSON.stringify(results)}`);
      return {
        dry_run: true,
        success: true,
        simulation_results: results,
        message: 'Cleanup simulation completed successfully'
      };

    } catch (error) {
      auditRetentionService_log(`Error simulating cleanup: ${error.message}`);
      return {
        success: false,
        dry_run: true,
        error: error.message,
        simulation_results: null
      };
    }
  }

  /**
   * Run actual cleanup operation with full schema validation
   * @param {boolean} dryRun - Whether to perform actual deletion or just simulation
   * @param {Object} options - Additional cleanup options
   * @param {string} lang - Language code for error messages
   * @returns {Promise<Object>} Cleanup results
   */
  async runCleanup(dryRun = true, options = {}, lang = 'en') {
    auditRetentionService_log(`Running cleanup operation (dryRun: ${dryRun})`);

    try {
      // Validate cleanup options using schema with i18n support
      const cleanupOptions = {
        dry_run: dryRun,
        ...options
      };

      const validation = this.validateData('cleanup', cleanupOptions, lang);
      if (!validation.success) {
        auditRetentionService_log(`Cleanup validation error: ${validation.message}`);
        return {
          success: false,
          error: `Validation failed: ${validation.message}`,
          validation_errors: validation.errors
        };
      }

      const validatedOptions = validation.data;

      // If dry run, return simulation with validated options
      if (validatedOptions.dry_run) {
        return await this.simulateCleanup(validatedOptions, lang);
      }

      // Get validated retention policy
      const policyResult = await this.getRetentionPolicy(lang);
      if (!policyResult.success) {
        return policyResult;
      }

      const policy = policyResult.policy;

      const results = {
        audit_logs: { deleted: 0, errors: 0 },
        user_data: { deleted: 0, errors: 0 },
        total_space_freed: '0 MB',
        dry_run: false,
        timestamp: new Date().toISOString(),
        options: validatedOptions,
        policy_applied: {
          audit_log_retention_days: policy.audit_log_retention_days,
          user_data_retention_days: policy.user_data_retention_days
        }
      };

      // Actual audit logs cleanup with batch processing
      if (policy.audit_log_retention_days) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - policy.audit_log_retention_days);

        try {
          // Process in batches to avoid overwhelming the database
          let totalDeleted = 0;
          let hasMore = true;

          while (hasMore) {
            const deleteQuery = `
              DELETE FROM audit_logs 
              WHERE timestamp < ? 
              LIMIT ?
            `;

            const deleteResult = await this.dbService.run(
              deleteQuery,
              [cutoffDate.toISOString(), BATCH_SIZE]
            );

            const deleted = deleteResult.changes || 0;
            totalDeleted += deleted;

            auditRetentionService_log(`Deleted batch: ${deleted} records`);

            // If we deleted fewer than the batch size, we're done
            hasMore = deleted >= BATCH_SIZE;
          }

          results.audit_logs.deleted = totalDeleted;
          auditRetentionService_log(`Total deleted audit log records: ${totalDeleted}`);
        } catch (error) {
          results.audit_logs.errors = 1;
          auditRetentionService_log(`Error deleting audit logs: ${error.message}`);
        }
      }

      // User data cleanup placeholder
      // This would require careful implementation based on business rules

      // Calculate estimated space freed using constants
      const totalDeleted = results.audit_logs.deleted + results.user_data.deleted;
      const estimatedSizeKB = Math.round(totalDeleted * ESTIMATED_RECORD_SIZE_KB);
      results.total_space_freed = estimatedSizeKB > 1024 ?
        `${(estimatedSizeKB / 1024).toFixed(1)} MB` :
        `${estimatedSizeKB} KB`;

      // Log the cleanup operation for audit trail
      if (totalDeleted > 0) {
        await this.logCleanupOperation(policy, results);
      }

      auditRetentionService_log(`Cleanup operation completed: ${JSON.stringify(results)}`);
      return {
        success: true,
        dry_run: false,
        cleanup_results: results,
        message: 'Cleanup operation completed successfully'
      };

    } catch (error) {
      auditRetentionService_log(`Error running cleanup: ${error.message}`);
      return {
        dry_run: dryRun,
        success: false,
        error: error.message,
        cleanup_results: null
      };
    }
  }

  /**
   * Log cleanup operation for audit trail
   * @param {Object} policy - Retention policy used
   * @param {Object} results - Cleanup results
   * @returns {Promise<void>}
   */
  async logCleanupOperation(policy, results) {
    try {
      const auditEntry = {
        action: 'data_retention_cleanup',
        actor_id: 0, // System operation
        actor_type: 'system',
        resource: 'audit_logs',
        resource_id: null,
        details: JSON.stringify({
          policy: policy,
          results: results,
          automated: true
        }),
        ip_address: 'system',
        user_agent: 'AuditRetentionService',
        timestamp: new Date().toISOString()
      };

      await this.dbService.run(`
        INSERT INTO audit_logs (action, actor_id, actor_type, resource, resource_id, details, ip_address, user_agent, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        auditEntry.action,
        auditEntry.actor_id,
        auditEntry.actor_type,
        auditEntry.resource,
        auditEntry.resource_id,
        auditEntry.details,
        auditEntry.ip_address,
        auditEntry.user_agent,
        auditEntry.timestamp
      ]);

      auditRetentionService_log('Cleanup operation logged to audit trail');
    } catch (error) {
      auditRetentionService_log(`Error logging cleanup operation: ${error.message}`);
    }
  }
}
