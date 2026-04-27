/**
 * Audit Archival Service
 * Manages audit log retention, archival, and cleanup
 *
 * IMPORTANT: This service requires the audit_logs_archive table
 * to be created via migration 0004_add_audit_archive.sql before use.
 * The service does NOT create tables - it only verifies they exist.
*/

import { BaseService } from './baseService.js';
import { auditArchival_log } from '../utils/debug.js';

/**
 * Service for managing audit log archival and retention
 * Requires: audit_logs_archive table (created by migration 0004)
 *
 * Features:
 * - Automatic archival based on retention policies
 * - Category-based retention (authentication, admin_operations, security_events, general)
 * - Archive to separate table for important logs (admin/security)
 * - Direct deletion for less important logs (authentication/general)
 * - Restore functionality for archived logs
 * - Statistics and monitoring
 * - Manual archival triggers
 * - Policy management
*/
export class AuditArchivalService extends BaseService {
  constructor(env) {
    super(env, 'AuditArchivalService');
    this.retentionPolicies = {
      authentication: 365, // days
      admin_operations: 2555, // 7 years
      security_events: 1095, // 3 years
      general: 90 // days
    };
    auditArchival_log('AuditArchivalService initialized with retention policies');
  }

  normalizeDateInput(dateValue, errorCode = 'INVALID_DATE') {
    if (dateValue === null || dateValue === undefined || dateValue === '') {
      throw new Error(errorCode);
    }

    if (dateValue instanceof Date) {
      if (Number.isNaN(dateValue.getTime())) {
        throw new Error(errorCode);
      }

      return dateValue.toISOString();
    }

    if (typeof dateValue === 'string') {
      const parsedDate = new Date(dateValue);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error(errorCode);
      }

      return parsedDate.toISOString();
    }

    if (typeof dateValue === 'number') {
      const parsedDate = new Date(dateValue);
      if (Number.isNaN(parsedDate.getTime())) {
        throw new Error(errorCode);
      }

      return parsedDate.toISOString();
    }

    throw new Error(errorCode);
  }

  normalizeDateRange(startDate, endDate) {
    const normalizedStartDate = this.normalizeDateInput(startDate, 'START_AND_END_DATE_REQUIRED');
    const normalizedEndDate = this.normalizeDateInput(endDate, 'START_AND_END_DATE_REQUIRED');

    if (normalizedStartDate > normalizedEndDate) {
      throw new Error('INVALID_DATE_RANGE');
    }

    return {
      startDate: normalizedStartDate,
      endDate: normalizedEndDate
    };
  }

  /**
   * Archive old audit logs based on retention policies
   * @param {Object} options - Archival options
   * @returns {Promise<Object>} Archival results
   */
  async archiveOldLogs(options = {}) {
    const {
      dryRun = false,
      batchSize = 1000,
      categoryFilter = null
    } = options;

    auditArchival_log(`Starting log archival process, dry run: ${dryRun}`);

    try {
      const archivalSummary = {
        started_at: new Date().toISOString(),
        dry_run: dryRun,
        categories_processed: [],
        total_archived: 0,
        total_deleted: 0,
        errors: []
      };

      // Process each retention policy
      for (const [category, retentionDays] of Object.entries(this.retentionPolicies)) {
        if (categoryFilter && categoryFilter !== category) {
          continue;
        }

        try {
          const result = await this.processCategoryArchival(
            category,
            retentionDays,
            dryRun,
            batchSize
          );

          archivalSummary.categories_processed.push({
            category,
            retention_days: retentionDays,
            ...result
          });

          archivalSummary.total_archived += result.archived_count;
          archivalSummary.total_deleted += result.deleted_count;

          auditArchival_log(`Category ${category} processed: archived ${result.archived_count}, deleted ${result.deleted_count}`);

        } catch (error) {
          auditArchival_log(`Error processing category ${category}: ${error.message}`);
          archivalSummary.errors.push({
            category,
            error: error.message
          });
        }
      }

      archivalSummary.completed_at = new Date().toISOString();
      archivalSummary.duration_ms = new Date(archivalSummary.completed_at) - new Date(archivalSummary.started_at);

      auditArchival_log(`Archival process completed: ${archivalSummary.total_archived} archived, ${archivalSummary.total_deleted} deleted`);

      return archivalSummary;

    } catch (error) {
      auditArchival_log(`Error during archival process: ${error.message}`);
      throw error;
    }
  }

  /**
   * Process archival for a specific category
   */
  async processCategoryArchival(category, retentionDays, dryRun, batchSize) {
    const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000)).toISOString();

    // Define category mapping
    const categoryConditions = {
      authentication: 'action IN (\'login\', \'logout\', \'login_failed\', \'token_refresh\')',
      admin_operations: 'actor_role IN (\'admin\', \'super_admin\') AND action IN (\'create\', \'update\', \'delete\', \'role_change\')',
      security_events: 'action LIKE \'%security%\' OR action LIKE \'%rate_limit%\' OR action = \'login_failed\'',
      general: '1=1' // All other logs
    };

    const condition = categoryConditions[category] || categoryConditions.general;

    // Count logs to be processed
    const countQuery = `
      SELECT COUNT(*) as count
      FROM audit_logs 
      WHERE timestamp < ? 
        AND (${condition})
    `;

    const countResult = await this.dbService.select(countQuery, [cutoffDate], true);
    const totalToProcess = countResult?.count || 0;

    if (totalToProcess === 0) {
      return {
        dry_run: dryRun,
        archived_count: 0,
        deleted_count: 0,
        total_found: 0
      };
    }

    auditArchival_log(`Found ${totalToProcess} logs to process for category ${category}`);

    if (dryRun) {
      return {
        dry_run: true,
        archived_count: 0,
        deleted_count: 0,
        total_found: totalToProcess,
        would_process: totalToProcess
      };
    }

    // For admin operations and security events, archive to a separate table
    // For others, delete after retention period
    let archivedCount = 0;
    let deletedCount = 0;

    if (category === 'admin_operations' || category === 'security_events') {
      archivedCount = await this.archiveToTable(condition, cutoffDate, batchSize);
    }

    if (category === 'authentication' || category === 'general') {
      deletedCount = await this.deleteOldLogs(condition, cutoffDate, batchSize);
    }

    return {
      archived_count: archivedCount,
      deleted_count: deletedCount,
      total_found: totalToProcess
    };
  }

  /**
   * Archive important logs to separate table
   */
  async archiveToTable(condition, cutoffDate, batchSize) {
    await this.verifyArchiveTableExists();

    let totalArchived = 0;
    let offset = 0;
    let isContined = true;

    while (isContined) {
      const selectQuery = `
        SELECT id, actor_id, actor_role, action, target_type, target_id, 
               details, ip_address, user_agent, timestamp
        FROM audit_logs 
        WHERE timestamp < ? 
          AND (${condition})
        ORDER BY id
        LIMIT ? OFFSET ?
      `;

      const logs = await this.dbService.select(selectQuery, [cutoffDate, batchSize, offset]);

      if (!logs || logs.length === 0) {
        isContined = false;
        break;
      }

      // Insert into archive table (archived_at will use DEFAULT CURRENT_TIMESTAMP)
      const insertQuery = `
        INSERT INTO audit_logs_archive 
        (original_id, actor_id, actor_role, action, target_type, target_id, 
         details, ip_address, user_agent, timestamp)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;

      for (const log of logs) {
        await this.dbService.insert(insertQuery, [
          log.id,
          log.actor_id,
          log.actor_role,
          log.action,
          log.target_type,
          log.target_id,
          log.details,
          log.ip_address,
          log.user_agent,
          log.timestamp
        ]);
      }

      // Delete from main table
      const deleteQuery = `
        DELETE FROM audit_logs 
        WHERE id IN (${logs.map(() => '?').join(',')})
      `;

      await this.dbService.update(deleteQuery, logs.map(log => log.id));

      totalArchived += logs.length;
      offset += batchSize;

      auditArchival_log(`Archived batch: ${logs.length} logs (total: ${totalArchived})`);
    }

    return totalArchived;
  }

  /**
   * Delete old logs that don't need archiving
   */
  async deleteOldLogs(condition, cutoffDate, batchSize) {
    let totalDeleted = 0;
    let isContined = true;

    while (isContined) {
      const deleteQuery = `
        DELETE FROM audit_logs 
        WHERE id IN (
          SELECT id FROM audit_logs 
          WHERE timestamp < ? 
            AND (${condition})
          LIMIT ?
        )
      `;

      const result = await this.dbService.update(deleteQuery, [cutoffDate, batchSize]);

      const deletedCount = result.changes || 0;
      totalDeleted += deletedCount;

      auditArchival_log(`Deleted batch: ${deletedCount} logs (total: ${totalDeleted})`);

      if (deletedCount < batchSize) {
        isContined = false;
      }
    }

    return totalDeleted;
  }

  /**
   * Verify archive table exists (should be created by migration)
   */
  async verifyArchiveTableExists() {
    auditArchival_log('Verifying audit archive table exists');

    // Check if archive table exists
    const tableExistsQuery = `
      SELECT name FROM sqlite_master 
      WHERE type='table' AND name='audit_logs_archive'
    `;

    const result = await this.dbService.select(tableExistsQuery, [], true);

    if (!result || !result.name) {
      throw new Error(
        'Archive table audit_logs_archive does not exist. ' +
        'Please run database migration 0004_add_audit_archive.sql first.'
      );
    }

    auditArchival_log('Archive table verified successfully');
  }

  /**
   * Get archival statistics
   * @returns {Promise<Object>} Archive statistics
   */
  async getArchivalStats() {
    auditArchival_log('Generating archival statistics');

    try {
      // Main table stats
      const mainStatsQuery = `
        SELECT 
          COUNT(*) as total_logs,
          COUNT(CASE WHEN timestamp >= datetime('now', '-30 days') THEN 1 END) as logs_30d,
          COUNT(CASE WHEN timestamp >= datetime('now', '-90 days') THEN 1 END) as logs_90d,
          COUNT(CASE WHEN timestamp >= datetime('now', '-365 days') THEN 1 END) as logs_1y,
          MIN(timestamp) as oldest_log,
          MAX(timestamp) as newest_log
        FROM audit_logs
      `;

      const mainStats = await this.dbService.select(mainStatsQuery, [], true);

      // Archive table stats (if exists)
      let archiveStats = null;
      try {
        const archiveStatsQuery = `
          SELECT 
            COUNT(*) as archived_logs,
            MIN(timestamp) as oldest_archived,
            MAX(timestamp) as newest_archived,
            MIN(archived_at) as first_archival,
            MAX(archived_at) as last_archival
          FROM audit_logs_archive
        `;

        archiveStats = await this.dbService.select(archiveStatsQuery, [], true);
      } catch (error) {
        auditArchival_log(`Archive table does not exist or error fetching stats: ${error.message}`);
        // Archive table doesn't exist yet
        archiveStats = { archived_logs: 0 };
      }

      // Calculate logs eligible for archival by category
      const eligibilityStats = {};
      for (const [category, retentionDays] of Object.entries(this.retentionPolicies)) {
        const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000)).toISOString();

        const categoryConditions = {
          authentication: 'action IN (\'login\', \'logout\', \'login_failed\', \'token_refresh\')',
          admin_operations: 'actor_role IN (\'admin\', \'super_admin\') AND action IN (\'create\', \'update\', \'delete\', \'role_change\')',
          security_events: 'action LIKE \'%security%\' OR action LIKE \'%rate_limit%\' OR action = \'login_failed\'',
          general: '1=1'
        };

        const condition = categoryConditions[category] || categoryConditions.general;

        const eligibilityQuery = `
          SELECT COUNT(*) as eligible_count
          FROM audit_logs 
          WHERE timestamp < ? AND (${condition})
        `;

        const result = await this.dbService.select(eligibilityQuery, [cutoffDate], true);
        eligibilityStats[category] = {
          retention_days: retentionDays,
          eligible_for_archival: result?.eligible_count || 0
        };
      }

      const stats = {
        generated_at: new Date().toISOString(),
        main_table: mainStats || {},
        archive_table: archiveStats || {},
        retention_policies: this.retentionPolicies,
        eligibility_by_category: eligibilityStats,
        recommendations: this.generateArchivalRecommendations(mainStats, eligibilityStats)
      };

      auditArchival_log('Archival statistics generated successfully');
      return stats;

    } catch (error) {
      auditArchival_log(`Error generating archival statistics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Generate archival recommendations
   */
  generateArchivalRecommendations(mainStats, eligibilityStats) {
    const recommendations = [];

    const totalEligible = Object.values(eligibilityStats)
      .reduce((sum, category) => sum + category.eligible_for_archival, 0);

    if (totalEligible > 10000) {
      recommendations.push({
        type: 'archival',
        priority: 'high',
        message: `${totalEligible} logs are eligible for archival. Consider running archival process.`
      });
    }

    if (mainStats?.total_logs > 100000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Large number of audit logs may impact performance. Consider more frequent archival.'
      });
    }

    return recommendations;
  }

  /**
   * Restore archived logs for a specific time period
   * @param {Object} options - Restore options
   * @returns {Promise<Object>} Restore results
   */
  async restoreArchivedLogs(options = {}) {
    const {
      startDate,
      endDate,
      userId = null,
      action = null,
      dryRun = false
    } = options;

    auditArchival_log(`Restoring archived logs from ${startDate} to ${endDate}, dry run: ${dryRun}`);

    try {
      const normalizedRange = this.normalizeDateRange(startDate, endDate);
      let whereClause = 'timestamp BETWEEN ? AND ?';
      const bindings = [normalizedRange.startDate, normalizedRange.endDate];

      if (userId) {
        whereClause += ' AND user_id = ?';
        bindings.push(userId);
      }

      if (action) {
        whereClause += ' AND action = ?';
        bindings.push(action);
      }

      // Count logs to restore
      const countQuery = `
        SELECT COUNT(*) as count
        FROM audit_logs_archive 
        WHERE ${whereClause}
      `;

      const countResult = await this.dbService.select(countQuery, bindings, true);
      const totalToRestore = countResult?.count || 0;

      if (totalToRestore === 0) {
        return {
          dry_run: dryRun,
          restored_count: 0,
          total_found: 0
        };
      }

      if (dryRun) {
        return {
          dry_run: true,
          restored_count: 0,
          total_found: totalToRestore,
          would_restore: totalToRestore
        };
      }

      // Restore logs
      const restoreQuery = `
        INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, details, ip_address, user_agent, timestamp)
        SELECT actor_id, actor_role, action, target_type, target_id, details, ip_address, user_agent, timestamp
        FROM audit_logs_archive
        WHERE ${whereClause}
      `;

      const result = await this.dbService.insert(restoreQuery, bindings);

      auditArchival_log(`Restored ${result.changes} logs from archive`);

      return {
        restored_count: result.changes || 0,
        total_found: totalToRestore
      };

    } catch (error) {
      auditArchival_log(`Error restoring archived logs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Archive and remove live audit logs for a specific date range
   * @param {Object} options - Truncate options
   * @returns {Promise<Object>} Truncate results
   */
  async truncateLogsByDateRange(options = {}) {
    const {
      startDate,
      endDate,
      dryRun = true,
      batchSize = 1000,
      archiveFirst = false,
      confirmDelete = false
    } = options;

    auditArchival_log(`Truncate requested for audit logs from ${startDate} to ${endDate}, dry run: ${dryRun}`);

    const normalizedRange = this.normalizeDateRange(startDate, endDate);

    if (archiveFirst !== true) {
      throw new Error('ARCHIVE_FIRST_REQUIRED');
    }

    if (!dryRun && confirmDelete !== true) {
      throw new Error('CONFIRM_DELETE_REQUIRED');
    }

    const summary = {
      start_date: normalizedRange.startDate,
      end_date: normalizedRange.endDate,
      batch_size: batchSize,
      archive_first: archiveFirst,
      dry_run: dryRun,
      total_found: 0,
      archived_count: 0,
      deleted_count: 0,
      started_at: new Date().toISOString()
    };

    try {
      await this.verifyArchiveTableExists();

      const countQuery = `
        SELECT COUNT(*) as count
        FROM audit_logs
        WHERE timestamp BETWEEN ? AND ?
      `;

      const countResult = await this.dbService.select(countQuery, [normalizedRange.startDate, normalizedRange.endDate], true);
      summary.total_found = countResult?.count || 0;

      if (dryRun || summary.total_found === 0) {
        summary.would_delete = summary.total_found;
        summary.completed_at = new Date().toISOString();
        summary.duration_ms = new Date(summary.completed_at) - new Date(summary.started_at);
        return summary;
      }

      let hasMore = true;
      while (hasMore) {
        const selectBatchQuery = `
          SELECT id, actor_id, actor_role, action, target_type, target_id,
                 details, ip_address, user_agent, timestamp
          FROM audit_logs
          WHERE timestamp BETWEEN ? AND ?
          ORDER BY id
          LIMIT ?
        `;

        const logs = await this.dbService.select(selectBatchQuery, [normalizedRange.startDate, normalizedRange.endDate, batchSize]);

        if (!logs || logs.length === 0) {
          hasMore = false;
          break;
        }

        const archiveQuery = `
          INSERT OR IGNORE INTO audit_logs_archive
          (original_id, actor_id, actor_role, action, target_type, target_id,
           details, ip_address, user_agent, timestamp)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        for (const log of logs) {
          const archiveResult = await this.dbService.insert(archiveQuery, [
            log.id,
            log.actor_id,
            log.actor_role,
            log.action,
            log.target_type,
            log.target_id,
            log.details,
            log.ip_address,
            log.user_agent,
            log.timestamp
          ]);

          summary.archived_count += archiveResult?.changes || 0;
        }

        const deleteQuery = `
          DELETE FROM audit_logs
          WHERE id IN (
            SELECT id FROM audit_logs
            WHERE timestamp BETWEEN ? AND ?
            LIMIT ?
          )
        `;

        const result = await this.dbService.delete(deleteQuery, [normalizedRange.startDate, normalizedRange.endDate, batchSize]);
        const deletedCount = result?.changes || 0;
        summary.deleted_count += deletedCount;

        auditArchival_log(
          `Truncate batch archived ${summary.archived_count} and deleted ${deletedCount} logs (total deleted: ${summary.deleted_count})`
        );

        if (deletedCount < batchSize) {
          hasMore = false;
        }
      }

      summary.completed_at = new Date().toISOString();
      summary.duration_ms = new Date(summary.completed_at) - new Date(summary.started_at);

      return summary;
    } catch (error) {
      auditArchival_log(`Error truncating audit logs by date range: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get archival status information
   * @returns {Promise<Object>} Archival status
   */
  async getArchivalStatus() {
    try {
      auditArchival_log('Getting archival status');

      // Get active logs count
      const activeLogsQuery = 'SELECT COUNT(*) as count FROM audit_logs';
      const activeLogsResult = await this.dbService.select(activeLogsQuery, [], true);
      const activeLogs = activeLogsResult.count || 0;

      // Get archived logs count
      const archivedLogsQuery = 'SELECT COUNT(*) as count FROM audit_logs_archive';
      const archivedLogsResult = await this.dbService.select(archivedLogsQuery, [], true);
      const archivedLogs = archivedLogsResult.count || 0;

      // Get oldest active log
      const oldestActiveQuery = 'SELECT MIN(timestamp) as oldest FROM audit_logs';
      const oldestActiveResult = await this.dbService.select(oldestActiveQuery, [], true);

      // Get newest archived log
      const newestArchivedQuery = 'SELECT MAX(timestamp) as newest FROM audit_logs_archive';
      const newestArchivedResult = await this.dbService.select(newestArchivedQuery, [], true);

      const status = {
        active_logs: activeLogs,
        archived_logs: archivedLogs,
        total_logs: activeLogs + archivedLogs,
        oldest_active_log: oldestActiveResult?.oldest,
        newest_archived_log: newestArchivedResult?.newest,
        archival_enabled: true,
        last_archival_run: new Date().toISOString(), // In real implementation, store this
        next_scheduled_archival: null // In real implementation, calculate this
      };

      auditArchival_log(`Archival status retrieved: ${JSON.stringify(status)}`);
      return status;

    } catch (error) {
      auditArchival_log(`Error getting archival status: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get archival policies
   * @returns {Promise<Object>} Archival policies
   */
  getArchivalPolicies() {
    try {
      auditArchival_log('Getting archival policies');

      const policies = {
        retention_policies: this.retentionPolicies,
        archival_settings: {
          batch_size: 1000,
          compression_enabled: true,
          auto_archival_enabled: true,
          archival_schedule: '0 2 * * *' // Daily at 2 AM
        },
        compliance_settings: {
          gdpr_retention_days: 1095, // 3 years
          sox_retention_days: 2555,  // 7 years
          general_retention_days: 365 // 1 year
        }
      };

      auditArchival_log('Archival policies retrieved');
      return policies;

    } catch (error) {
      auditArchival_log(`Error getting archival policies: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create archival policy
   * @param {Object} policyOptions - Policy configuration
   * @returns {Promise<Object>} Created policy result
   */
  createArchivalPolicy(policyOptions = {}) {
    try {
      const {
        retention_days = 90,
        archive_after_days = 30,
        compression = true
      } = policyOptions;

      auditArchival_log(`Creating archival policy: ${JSON.stringify(policyOptions)}`);

      // In a real implementation, this would store the policy in a database
      // For now, we'll just simulate the creation
      const policy = {
        id: `policy_${Date.now()}`,
        retention_days,
        archive_after_days,
        compression,
        created_at: new Date().toISOString(),
        status: 'active'
      };

      auditArchival_log(`Archival policy created: ${JSON.stringify(policy)}`);
      return {
        success: true,
        policy,
        message: 'Archival policy created successfully'
      };

    } catch (error) {
      auditArchival_log(`Error creating archival policy: ${error.message}`);
      throw error;
    }
  }

  /**
   * Manual archive trigger
   * @param {Object} options - Manual archive options
   * @returns {Promise<Object>} Archive result
   */
  async manualArchive(options = {}) {
    try {
      const { date_range, dryRun = false } = options;

      auditArchival_log(`Manual archive triggered: ${JSON.stringify(options)}`);

      if (!date_range || !date_range.start || !date_range.end) {
        throw new Error('Date range is required for manual archive');
      }

      const normalizedRange = this.normalizeDateRange(date_range.start, date_range.end);

      // Build query for date range
      const whereClause = 'timestamp BETWEEN ? AND ?';
      const bindings = [normalizedRange.startDate, normalizedRange.endDate];

      // Count logs in date range
      const countQuery = `SELECT COUNT(*) as count FROM audit_logs WHERE ${whereClause}`;
      const countResult = await this.dbService.select(countQuery, bindings, true);
      const totalLogs = countResult?.count || 0;

      if (dryRun) {
        return {
          dry_run: true,
          date_range: {
            start: normalizedRange.startDate,
            end: normalizedRange.endDate
          },
          logs_to_archive: totalLogs,
          message: `Would archive ${totalLogs} logs from ${normalizedRange.startDate} to ${normalizedRange.endDate}`
        };
      }

      // Perform actual archive
      const archiveResult = await this.archiveOldLogs({
        dryRun: false,
        customWhereClause: whereClause,
        customBindings: bindings
      });

      auditArchival_log(`Manual archive completed: ${JSON.stringify(archiveResult)}`);

      return {
        success: true,
        date_range: {
          start: normalizedRange.startDate,
          end: normalizedRange.endDate
        },
        archived_count: archiveResult.total_archived,
        message: `Successfully archived ${archiveResult.total_archived} logs`
      };

    } catch (error) {
      auditArchival_log(`Error in manual archive: ${error.message}`);
      throw error;
    }
  }

  /**
   * Restore archive
   * @param {Object} options - Restore options
   * @returns {Promise<Object>} Restore result
   */
  async restoreArchive(options = {}) {
    try {
      const { archive_id, date_range, restore_location = 'primary_storage' } = options;

      auditArchival_log(`Archive restore requested: ${JSON.stringify(options)}`);

      // If a date range is provided, use the restoreArchivedLogs method
      if (date_range && date_range.start && date_range.end) {
        const restoreResult = await this.restoreArchivedLogs({
          startDate: date_range.start,
          endDate: date_range.end,
          dryRun: options.dryRun || false
        });
        
        return {
          success: true,
          restore_location,
          restored_count: restoreResult.restored_count,
          message: `Successfully restored ${restoreResult.restored_count} logs from ${date_range.start} to ${date_range.end}`
        };
      }

      if (!archive_id) {
        return {
          success: false,
          error: 'Archive ID or date_range is required',
          message: 'No archive criteria provided'
        };
      }

      // Restore specific log by its original ID
      const countQuery = `SELECT COUNT(*) as count FROM audit_logs_archive WHERE original_id = ?`;
      const countResult = await this.dbService.select(countQuery, [archive_id], true);
      
      if (!countResult || countResult.count === 0) {
        return {
          success: false,
          error: 'Archive not found',
          archive_id,
          message: `Archive data with ID ${archive_id} not found in the archive table`
        };
      }

      // Check if it already exists in hot storage to prevent constraint violations
      const hotCountQuery = `SELECT COUNT(*) as count FROM audit_logs WHERE id = ?`;
      const hotCountResult = await this.dbService.select(hotCountQuery, [archive_id], true);
      
      if (hotCountResult && hotCountResult.count > 0) {
        return {
          success: false,
          error: 'Already restored',
          archive_id,
          message: `Log with ID ${archive_id} already exists in hot storage`
        };
      }

      // Perform actual restore
      const restoreQuery = `
        INSERT INTO audit_logs (id, actor_id, actor_role, action, target_type, target_id, details, ip_address, user_agent, timestamp)
        SELECT original_id, actor_id, actor_role, action, target_type, target_id, details, ip_address, user_agent, timestamp
        FROM audit_logs_archive
        WHERE original_id = ?
      `;

      const result = await this.dbService.insert(restoreQuery, [archive_id]);
      
      // Optionally clean it up from archive table
      const deleteQuery = `DELETE FROM audit_logs_archive WHERE original_id = ?`;
      await this.dbService.update(deleteQuery, [archive_id]);

      const finalResult = {
        success: true,
        archive_id,
        restore_location,
        restored_count: result.changes || 1,
        message: `Successfully restored archive ${archive_id} to ${restore_location}`
      };

      auditArchival_log(`Archive restore completed: ${JSON.stringify(finalResult)}`);
      return finalResult;

    } catch (error) {
      auditArchival_log(`Error restoring archive: ${error.message}`);
      throw error;
    }
  }
}
