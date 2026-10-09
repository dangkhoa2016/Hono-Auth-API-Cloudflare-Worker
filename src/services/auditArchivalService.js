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
import {
  buildArchiveSelection,
  buildCategoryPredicate,
  buildCutoffProtectionPredicate,
  buildSelectionPredicate,
  resolveRetentionPolicy,
  retentionCategories,
  CATEGORY_CONFIG_KEYS,
  CATEGORY_FALLBACK_DAYS,
  MAX_PAGE_ROWS,
  UNKNOWN_ACTOR_ROLE
} from './auditRetentionPolicy.js';

/**
 * One representative action per category, used to resolve that category's
 * duration without inspecting a real event.
 */
/**
 * Statement budget for one `batch()`. Each INSERT has a SQL assertion; the
 * final DELETE also has an assertion, all inside the same transaction.
 *
 * Exceeding it is not a tuning problem: D1 rejects the whole request, and a
 * rejected batch means nothing was written, so a page larger than this would
 * simply fail every archival run.
 */
export const MAX_STATEMENTS_PER_TRANSACTION = 100;

/** Two statements per row, plus DELETE and its assertion. */
export const MAX_ROWS_PER_TRANSACTION = Math.floor((MAX_STATEMENTS_PER_TRANSACTION - 2) / 2);

/**
 * Split a page into transaction-sized chunks. Every chunk copies exactly the rows
 * it then deletes, so a failure part-way through leaves the earlier chunks
 * consistent and the remaining rows in hot storage for the next attempt.
 * @param {Array} logs - Rows to archive
 * @returns {Array<Array>} Chunks of at most `MAX_ROWS_PER_TRANSACTION` rows
 */
export function chunkForTransaction(logs) {
  const chunks = [];
  for (let i = 0; i < logs.length; i += MAX_ROWS_PER_TRANSACTION) {
    chunks.push(logs.slice(i, i + MAX_ROWS_PER_TRANSACTION));
  }
  return chunks;
}

/**
 * Require the immediately preceding audit write to change exactly count rows.
 * @param {number} count - Required number of changes
 * @returns {{query: string, params: number[]}} SQL transaction assertion
 */
// SQLite's changes() counts the preceding write, excluding trigger writes.
// The false CASE branch deliberately raises SQLite's documented integer
// overflow error. D1 then rolls back the entire batch, including earlier
// successful copies. No schema mutation or guard row is needed.
// https://www.sqlite.org/lang_corefunc.html (abs, changes)
function assertAuditWriteCount(count) {
  return {
    query: 'SELECT CASE WHEN changes() = ? THEN 1 ELSE abs(-9223372036854775808) END AS archive_write_verified',
    params: [count]
  };
}

const CATEGORY_SAMPLE = Object.freeze({
  general: 'unknown_action',
  sensitive: 'password_change',
  administrative: 'user_role_change',
  compliance: 'data_export'
});

/**
 * Service for managing audit log archival and retention
 * Requires: audit_logs_archive table (created by migration 0004)
 *
 * Features:
 * - Automatic archival based on the shared retention policy
 * - Category-based retention: the longest window an event matches always wins
 * - Every archived row is copied and deleted in one transaction
 * - Restore functionality for archived logs, preserving ids and metadata
 * - Statistics and monitoring
 * - Manual archival triggers
 * - Policy management
*/
export class AuditArchivalService extends BaseService {
  constructor(env) {
    super(env, 'AuditArchivalService');
    // Fallback windows only, reported for visibility. The durations an event
    // actually gets are resolved per event by the policy module, which also
    // reads configuration.
    this.retentionPolicies = { ...CATEGORY_FALLBACK_DAYS };
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
      categoryFilter = null,
      now = new Date()
    } = options;

    // A filter the policy does not know is refused here. Filtering it away
    // instead would report a successful run that archived nothing at all.
    if (categoryFilter !== null && categoryFilter !== undefined && !retentionCategories().includes(categoryFilter)) {
      throw new RangeError(`unknown retention category: ${categoryFilter}`);
    }

    auditArchival_log(`Starting log archival process, dry run: ${dryRun}`);

    const config = await this.loadRetentionConfig();
    const archivalSummary = {
      started_at: new Date(now).toISOString(),
      dry_run: dryRun,
      categories_processed: [],
      total_archived: 0,
      total_deleted: 0,
      total_found: 0,
      errors: []
    };

    // Longest retention first. A category is only ever visited after the ones
    // that keep data longer have had their chance, so no row is deleted by a
    // shorter schedule that ran later.
    const categories = retentionCategories()
      .filter((category) => !categoryFilter || categoryFilter === category)
      .sort((a, b) => config.daysFor(b, now) - config.daysFor(a, now));

    for (const category of categories) {
      const sample = { action: category === 'general' ? 'unknown_action' : CATEGORY_SAMPLE[category] };
      try {
        const policy = resolveRetentionPolicy(sample, config.values, new Date(now));
        const result = await this.processCategoryArchival(
          category,
          policy.days,
          dryRun,
          batchSize,
          new Date(now),
          config.values
        );

        archivalSummary.categories_processed.push({
          category,
          retention_days: policy.days,
          policy_source: policy.source,
          matches: policy.categories,
          ...result
        });

        archivalSummary.total_archived += result.archived_count;
        archivalSummary.total_deleted += result.deleted_count;
        archivalSummary.total_found += result.total_found;
      } catch (error) {
        auditArchival_log(`Error processing category ${category}: ${error.message}`);
        archivalSummary.errors.push({ category, error: error.message });
      }
    }

    archivalSummary.completed_at = new Date().toISOString();
    archivalSummary.duration_ms = new Date(archivalSummary.completed_at) - new Date(archivalSummary.started_at);

    auditArchival_log(
      `Archival process completed: ${archivalSummary.total_archived} archived, ${archivalSummary.total_deleted} deleted`
    );
    return archivalSummary;
  }

  /**
   * The configured durations, keyed by config key.
   *
   * A category with no usable configured value keeps its documented fallback, so
   * a key that is missing or unreadable never shortens a window here.
   * @returns {Promise<Object>} Durations by config key
   */
  async loadRetentionConfigValues() {
    const { values } = await this.loadRetentionConfig();
    return values;
  }

  /**
   * Read the retention configuration through the shared resolver.
   *
   * Values come from T4's resolver, so a `false`/`0`/empty setting is honoured
   * as written and an unusable one is reported instead of silently shortening a
   * retention window.
   * @returns {Promise<{values: Object, daysFor: (category: string) => number}>} Config accessor
   */
  async loadRetentionConfig() {
    const { KVConfigService } = await import('./kvConfigService.js');
    const service = new KVConfigService(this.env);
    const values = {};
    for (const key of Object.values(CATEGORY_CONFIG_KEYS)) {
      const raw = await service.get(key, null, false);
      if (raw !== null && raw !== undefined) {
        values[key] = raw;
      }
    }
    return {
      values,
      daysFor: (category, now = new Date()) => {
        const policy = resolveRetentionPolicy(
          { action: CATEGORY_SAMPLE[category] ?? 'unknown_action' },
          values,
          now
        );
        return policy.days;
      }
    };
  }

  /**
   * Columns copied from `audit_logs` into the archive.
   *
   * Migration 0011 added the columns that 0004 never had; archiving without them
   * lost the actor email, the request id, the before/after values and the
   * status, so a restore could not reproduce the row.
   */
  static ARCHIVE_SOURCE_COLUMNS = Object.freeze([
    'actor_id', 'actor_email', 'action', 'target_type', 'target_id', 'target_identifier',
    'request_id', 'details', 'old_values', 'new_values', 'status', 'error_message',
    'ip_address', 'user_agent', 'timestamp'
  ]);

  /**
   * Build the parameter list for one archive insert.
   *
   * `actor_role` is NOT NULL in the archive but nullable in the source, so a
   * missing role is stored as a sentinel and flagged. Anything else that cannot
   * be represented is stored as NULL with `metadata_complete = 0`.
   *
   * @param {Object} log - Row from `audit_logs`
   * @returns {Array} Bound parameters
   */
  buildArchiveParams(log) {
    const syntheticRole = log.actor_role === null || log.actor_role === undefined;
    return [
      log.id,
      log.actor_id ?? null,
      syntheticRole ? UNKNOWN_ACTOR_ROLE : log.actor_role,
      log.actor_email ?? null,
      log.action,
      log.target_type ?? null,
      log.target_id ?? null,
      log.target_identifier ?? null,
      log.request_id ?? null,
      log.details ?? null,
      log.old_values ?? null,
      log.new_values ?? null,
      log.status ?? null,
      log.error_message ?? null,
      log.ip_address ?? null,
      log.user_agent ?? null,
      log.timestamp,
      syntheticRole ? 1 : 0
    ];
  }

  /**
   * Copy exactly the selected row versions and delete them in one transaction.
   * A changed/deleted source row, ignored insert or ignored delete must abort
   * before commit; checking response counts afterwards cannot undo data loss.
   *
   * @param {Object[]} logs - Selected rows, at most MAX_ROWS_PER_TRANSACTION
   * @returns {Promise<{archived: number, deleted: number}>} Verified counts
   */
  async copyChunk(logs) {
    const fields = ['id', 'actor_role', ...AuditArchivalService.ARCHIVE_SOURCE_COLUMNS];
    const insertQuery = `
      INSERT INTO audit_logs_archive
      (original_id, actor_id, actor_role, actor_email, action, target_type, target_id,
       target_identifier, request_id, details, old_values, new_values, status,
       error_message, ip_address, user_agent, timestamp, metadata_complete,
       actor_role_synthetic)
      SELECT ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?
      WHERE EXISTS (SELECT 1 FROM audit_logs WHERE ${fields.map(field => `${field} IS ?`).join(' AND ')})
    `;
    const entries = logs.flatMap(log => [
      { query: insertQuery, params: [...this.buildArchiveParams(log), ...fields.map(field => log[field] ?? null)] },
      assertAuditWriteCount(1)
    ]);
    const ids = logs.map(log => log.id);
    const deleteIndex = entries.length;
    entries.push({
      query: `DELETE FROM audit_logs WHERE id IN (${ids.map(() => '?').join(', ')})`,
      params: ids
    }, assertAuditWriteCount(ids.length));

    const results = await this.dbService.batch(entries);
    const insertChanges = logs.reduce((total, _log, index) => total + (results[index * 2]?.meta?.changes ?? 0), 0);
    const deleted = results[deleteIndex]?.meta?.changes ?? 0;
    // Response validation supplements the SQL assertions; it is not the
    // mechanism that provides rollback.
    if (insertChanges !== logs.length || deleted !== logs.length) {
      throw new Error(
        `Archive transaction mismatch: copied ${insertChanges}/${logs.length}, deleted ${deleted}/${logs.length}`
      );
    }
    return { archived: insertChanges, deleted };
  }

  /**
   * Process archival for one category using the shared retention policy.
   * @param {string} category - Retention category
   * @param {number} retentionDays - Days from the policy
   * @param {boolean} dryRun - Preview only
   * @param {number} batchSize - Rows per transaction
   * @param {Date} [now] - Current time, injectable for tests
   * @param {Object} [configValues] - Retention configuration captured for this sweep
   * @returns {Promise<Object>} Category result
   */
  async processCategoryArchival(category, retentionDays, dryRun, batchSize, now = new Date(), configValues = null) {
    const cutoffDate = new Date(now.getTime() - retentionDays * 86400000).toISOString();
    // Automatic retention selects everything strictly older than the cutoff.
    // Manual ranges remain inclusive. Mark this internal selection only after
    // validation so callers cannot change the manual-range contract.
    const selection = {
      ...buildArchiveSelection(
        { startDate: cutoffDate, endDate: cutoffDate, batchSize, dryRun },
        { canReadAll: true },
        now
      ),
      olderThan: true
    };
    // General already excludes every protected category. Repeating those
    // matchers adds no protection and can exceed D1's bound-parameter limit.
    const protection = category === 'general' ? null : buildCutoffProtectionPredicate(
      cutoffDate, now, configValues ?? await this.loadRetentionConfigValues()
    );

    const totalToProcess = await this.countArchivable(category, selection, protection);

    if (totalToProcess === 0) {
      return { dry_run: dryRun, archived_count: 0, deleted_count: 0, total_found: 0, retention_days: retentionDays };
    }

    if (dryRun) {
      return {
        dry_run: true,
        archived_count: 0,
        deleted_count: 0,
        total_found: totalToProcess,
        would_process: totalToProcess,
        retention_days: retentionDays
      };
    }

    const result = await this.runArchival(selection, category, protection);
    return {
      dry_run: false,
      archived_count: result.archived,
      deleted_count: result.deleted,
      total_found: result.selected,
      retention_days: retentionDays,
      batches: result.batches
    };
  }

  /**
   * Count the rows a selection would archive, using the same predicate the
   * execution uses. The category narrows the set; a `general` category is not a
   * blanket `1=1`, it is everything the other categories did not claim.
   * @param {string|null} category - Retention category or null for all
   * @param {Object} selection - Validated selection
   * @returns {Promise<number>} Row count
   */
  async countArchivable(category, selection, extra = null) {
    const { sql, params } = buildSelectionPredicate(selection);
    const fragments = [category ? this.categoryPredicate(category) : null, extra]
      .filter((fragment) => fragment && fragment.sql);
    const extraParams = fragments.flatMap((fragment) => fragment.params);
    const row = await this.dbService.select(
      `SELECT COUNT(*) as count FROM audit_logs WHERE ${sql}${fragments.map((f) => ` AND (${f.sql})`).join('')}`,
      [...params, ...extraParams],
      true
    );
    return row?.count || 0;
  }

  /**
   * Build the category predicate from the shared policy module.
   *
   * The old implementation passed SQL fragments between categories and ended
   * with `general: '1=1'`, so the general sweep deleted security and compliance
   * events that an earlier category was supposed to keep. The fragment now comes
   * from the same matcher `resolveRetentionPolicy` uses, and a general sweep
   * only takes what the protected categories did not claim.
   * @param {string} category - Retention category
   * @returns {{sql: string, params: Array}} Fragment and bound parameters
   */
  categoryPredicate(category) {
    return buildCategoryPredicate(category);
  }

  /**
   * Run an archival selection to completion.
   * @param {Object} selection - Validated selection
   * @param {string|null} category - Retention category, or null for a plain range
   * @param {{sql: string, params: Array}} [extra] - Additional predicate, such as
   *   the per-category retention protection
   * @returns {Promise<{archived: number, deleted: number, selected: number, batches: number}>} Totals
   */
  async runArchival(selection, category = null, extra = null) {
    let archived = 0;
    let deleted = 0;
    let selected = 0;
    let batches = 0;
    let cursor = selection.cursorAfterId;
    const predicate = category ? this.categoryPredicate(category) : { sql: '', params: [] };
    const fragments = [predicate, extra].filter((fragment) => fragment && fragment.sql);
    const extraParams = fragments.flatMap((fragment) => fragment.params);

    for (;;) {
      // Keyset pagination: `id > cursor` ordered by id. An OFFSET would skip rows
      // as soon as the previous batch deleted them.
      const page = { ...selection, cursorAfterId: cursor };
      const { sql, params } = buildSelectionPredicate(page);
      const logs = await this.dbService.select(
        `SELECT id, actor_id, actor_email, actor_role, action, target_type, target_id,
                target_identifier, request_id, details, old_values, new_values, status,
                error_message, ip_address, user_agent, timestamp
         FROM audit_logs
         WHERE ${sql}${fragments.map((fragment) => ` AND (${fragment.sql})`).join('')}
         ORDER BY id
         LIMIT ?`,
        [...params, ...extraParams, page.limit]
      );

      if (!logs || logs.length === 0) {
        break;
      }

      // A page larger than one transaction is split. Each chunk is atomic on its
      // own, so a failure stops the sweep with the copied rows already deleted
      // and the untouched rows still in hot storage.
      for (const chunk of chunkForTransaction(logs)) {
        const result = await this.copyChunk(chunk);
        archived += result.archived;
        deleted += result.deleted;
        batches += 1;
        auditArchival_log(`Archived batch ${batches}: ${result.archived} copied, ${result.deleted} deleted`);
      }
      selected += logs.length;
      cursor = logs[logs.length - 1].id;

      if (logs.length < selection.limit) {
        break;
      }
    }

    return { archived, deleted, selected, batches };
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
          COUNT(CASE WHEN julianday(timestamp) >= julianday('now', '-30 days') THEN 1 END) as logs_30d,
          COUNT(CASE WHEN julianday(timestamp) >= julianday('now', '-90 days') THEN 1 END) as logs_90d,
          COUNT(CASE WHEN julianday(timestamp) >= julianday('now', '-365 days') THEN 1 END) as logs_1y,
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

      // Eligibility per category, using the same predicate the sweep uses. The
      // previous version carried hand-written SQL fragments here, including a
      // `general: 1=1` that counted security and compliance events as eligible
      // for deletion on the shortest schedule.
      const eligibilityStats = {};
      for (const category of retentionCategories()) {
        const retentionDays = CATEGORY_FALLBACK_DAYS[category];
        const cutoffDate = new Date(Date.now() - (retentionDays * 24 * 60 * 60 * 1000)).toISOString();
        const predicate = this.categoryPredicate(category);

        const eligibilityQuery = `
          SELECT COUNT(*) as eligible_count
          FROM audit_logs
          WHERE julianday(timestamp) < julianday(?)${predicate.sql ? ` AND (${predicate.sql})` : ''}
        `;

        const result = await this.dbService.select(
          eligibilityQuery,
          [cutoffDate, ...predicate.params],
          true
        );
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

    const normalizedRange = this.normalizeDateRange(startDate, endDate);
    const whereClause = ['julianday(timestamp) >= julianday(?)', 'julianday(timestamp) <= julianday(?)'];
    const bindings = [normalizedRange.startDate, normalizedRange.endDate];

    // The archive column is `actor_id`; the old query filtered on `user_id`,
    // which does not exist, so filtering by user always threw.
    if (userId) {
      whereClause.push('actor_id = ?');
      bindings.push(userId);
    }
    if (action) {
      whereClause.push('action = ?');
      bindings.push(action);
    }

    const predicate = whereClause.join(' AND ');
    const countResult = await this.dbService.select(
      `SELECT COUNT(*) as count FROM audit_logs_archive WHERE ${predicate}`,
      bindings,
      true
    );
    const totalToRestore = countResult?.count || 0;

    if (totalToRestore === 0) {
      return { dry_run: dryRun, restored_count: 0, total_found: 0, conflicts: 0, incomplete_metadata: 0 };
    }

    if (dryRun) {
      return {
        dry_run: true,
        restored_count: 0,
        total_found: totalToRestore,
        would_restore: totalToRestore,
        conflicts: 0,
        incomplete_metadata: 0
      };
    }

    const rows = await this.dbService.select(
      `SELECT * FROM audit_logs_archive WHERE ${predicate} ORDER BY original_id`,
      bindings
    );

    const result = { restored_count: 0, total_found: totalToRestore, conflicts: 0, incomplete_metadata: 0 };

    // Each row is restored on its own: one conflicting event must not abort the
    // restore of the others, and the conflict is reported rather than resolved
    // by overwriting either copy.
    for (const row of rows) {
      const outcome = await this.restoreOne(row);
      if (outcome === 'restored') {
        result.restored_count += 1;
      } else if (outcome === 'conflict') {
        result.conflicts += 1;
      } else if (outcome === 'incomplete') {
        result.incomplete_metadata += 1;
      }
    }

    result.metadata_note =
      'Rows archived before migration 0011 have no status, actor email or before/after values. ' +
      'Those fields stay NULL and are reported instead of being invented.';

    auditArchival_log(`Restored ${result.restored_count} logs, ${result.conflicts} conflicts`);
    return result;
  }

  /**
   * Restore one archived row, preserving its id and metadata.
   *
   * A row whose id already exists in hot storage is a conflict when the content
   * differs and a no-op when it is identical, so restoring twice never creates a
   * second copy of the same event.
   *
   * @param {Object} row - Row from `audit_logs_archive`
   * @returns {Promise<'restored'|'already_present'|'conflict'|'incomplete'>} Outcome
   */
  async restoreOne(row) {
    const existing = await this.dbService.select('SELECT * FROM audit_logs WHERE id = ?', [row.original_id], true);

    if (existing) {
      return this.sameAuditEvent(existing, row) ? 'already_present' : 'conflict';
    }

    const syntheticRole = row.actor_role_synthetic === 1;
    const restoreQuery = `
      INSERT INTO audit_logs
      (id, actor_id, actor_role, actor_email, action, target_type, target_id,
       target_identifier, request_id, details, old_values, new_values, status,
       error_message, ip_address, user_agent, timestamp)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    // Both statements in one transaction: the row is marked as restored only if
    // it actually came back, and the archive copy is never dropped.
    await this.dbService.batch([
      {
        query: restoreQuery,
        params: [
          row.original_id,
          row.actor_id ?? null,
          syntheticRole ? null : row.actor_role,
          row.actor_email ?? null,
          row.action,
          row.target_type ?? null,
          row.target_id ?? null,
          row.target_identifier ?? null,
          row.request_id ?? null,
          row.details ?? null,
          row.old_values ?? null,
          row.new_values ?? null,
          row.status ?? null,
          row.error_message ?? null,
          row.ip_address ?? null,
          row.user_agent ?? null,
          row.timestamp
        ]
      },
      assertAuditWriteCount(1),
      {
        query: 'UPDATE audit_logs_archive SET restored_at = ?, restored_original_id = ? WHERE original_id = ?',
        params: [new Date().toISOString(), row.original_id, row.original_id]
      },
      assertAuditWriteCount(1)
    ]);

    return row.metadata_complete === 1 ? 'restored' : 'incomplete';
  }

  /**
   * Compare an archived row with the hot row of the same id.
   * @param {Object} hot - Row from `audit_logs`
   * @param {Object} archived - Row from `audit_logs_archive`
   * @returns {boolean} True when the two describe the same event
   */
  sameAuditEvent(hot, archived) {
    const fields = [
      'actor_id', 'actor_email', 'action', 'target_type', 'target_id', 'target_identifier',
      'request_id', 'details', 'old_values', 'new_values', 'error_message',
      'ip_address', 'user_agent', 'timestamp', 'status'
    ];
    return fields.every((field) => {
      const left = hot[field] ?? null;
      const right = archived[field] ?? null;
      if (left === null || right === null) {
        return left === right;
      }
      if (left instanceof Date || right instanceof Date) {
        return new Date(left).toISOString() === new Date(right).toISOString();
      }
      return String(left) === String(right);
    }) && (hot.actor_role ?? null) === (archived.actor_role_synthetic === 1 ? null : archived.actor_role);
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
      batchSize = 1000,
      archiveFirst = true,
      dryRun = false,
      confirmDelete = false,
      now = new Date()
    } = options;

    auditArchival_log(`Truncate requested for audit logs from ${startDate} to ${endDate}, dry run: ${dryRun}`);

    if (archiveFirst !== true) {
      throw new Error('ARCHIVE_FIRST_REQUIRED');
    }
    if (!dryRun && confirmDelete !== true) {
      throw new Error('CONFIRM_DELETE_REQUIRED');
    }

    // One validated selection. The preview and the execution below read the same
    // start, end and batch size, so a preview cannot drift from what runs.
    const selection = buildArchiveSelection(
      { startDate, endDate, batchSize, dryRun },
      { canReadAll: true },
      now
    );

    // Each category's own window still protects its rows, even when the caller
    // names a range. The preview and the execution below use this same fragment,
    // so the count a caller sees is the count the sweep acts on.
    const protection = buildCutoffProtectionPredicate(selection.endDate, now, await this.loadRetentionConfigValues());

    const summary = {
      start_date: selection.startDate,
      end_date: selection.endDate,
      batch_size: selection.limit,
      archive_first: archiveFirst,
      dry_run: selection.dryRun,
      total_found: 0,
      archived_count: 0,
      deleted_count: 0,
      // Declared here so a preview and an execution answer with the same shape;
      // a caller must not have to tell them apart to read the field.
      protected_by_policy: protection.protectedCategories,
      started_at: new Date(now).toISOString()
    };

    try {
      await this.verifyArchiveTableExists();
      summary.total_found = await this.countArchivable(null, selection, protection);

      if (selection.dryRun || summary.total_found === 0) {
        summary.would_delete = summary.total_found;
        summary.preview_is_estimate = !selection.dryRun
          ? false
          : 'Rows written after this preview are not included; re-run the preview against a fresh selection.';
        summary.completed_at = new Date().toISOString();
        summary.duration_ms = new Date(summary.completed_at) - new Date(summary.started_at);
        return summary;
      }

      const result = await this.runArchival(selection, null, protection);
      summary.archived_count = result.archived;
      summary.deleted_count = result.deleted;
      summary.batches = result.batches;

      // The execution may only ever remove what it copied. `runArchival` already
      // fails the transaction on a mismatch; this states the invariant in the
      // result the route returns.
      if (summary.archived_count !== summary.deleted_count) {
        throw new Error(
          `Truncate aborted: copied ${summary.archived_count} rows but deleted ${summary.deleted_count}`
        );
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

      // Reported from the policy module so the documented windows and the ones
      // the sweep applies cannot drift. The previous response listed three
      // figures (1095/2555/365) that matched nothing in the code.
      const policies = {
        retention_policies: { ...CATEGORY_FALLBACK_DAYS },
        retention_config_keys: { ...CATEGORY_CONFIG_KEYS },
        archival_settings: {
          batch_size: MAX_PAGE_ROWS,
          max_rows_per_transaction: MAX_ROWS_PER_TRANSACTION,
          max_statements_per_transaction: MAX_STATEMENTS_PER_TRANSACTION,
          compression_enabled: false,
          auto_archival_enabled: true,
          archival_schedule: '0 2 * * *' // Daily at 2 AM
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

      // Restore the specific log by its original id.
      const archivedRow = await this.dbService.select(
        'SELECT * FROM audit_logs_archive WHERE original_id = ?',
        [archive_id],
        true
      );

      if (!archivedRow) {
        return {
          success: false,
          error: 'Archive not found',
          archive_id,
          message: `Archive data with ID ${archive_id} not found in the archive table`
        };
      }

      const outcome = await this.restoreOne(archivedRow);

      if (outcome === 'conflict') {
        // The hot row keeps its own content and the archive copy is untouched:
        // neither version is overwritten to make the conflict disappear.
        return {
          success: false,
          error: 'Restore conflict',
          archive_id,
          outcome,
          message: `A different audit event already occupies ID ${archive_id}; both copies were kept`
        };
      }

      const finalResult = {
        success: true,
        archive_id,
        restore_location,
        outcome,
        restored_count: outcome === 'already_present' ? 0 : 1,
        metadata_complete: archivedRow.metadata_complete === 1,
        message: outcome === 'already_present'
          ? `Archive ${archive_id} was already restored; the existing row was left in place`
          : `Successfully restored archive ${archive_id} to ${restore_location}`
      };

      auditArchival_log(`Archive restore completed: ${JSON.stringify(finalResult)}`);
      return finalResult;

    } catch (error) {
      auditArchival_log(`Error restoring archive: ${error.message}`);
      throw error;
    }
  }
}
