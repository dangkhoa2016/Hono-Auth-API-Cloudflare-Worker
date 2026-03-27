// src/services/auditLogService.js
import { BaseService } from './baseService.js';
import { createKvConfigService } from '../utils/serviceFactory.js';
import { auditService_log, error_log } from '../utils/debug.js';
import { ROLES } from '../constants/roles.js';
import {
  buildAuditWhereClause,
  safeParseAuditJSON,
  generateAuditRequestId,
  getClientIP,
  sanitizeAuditDetails
} from '../utils/auditHelpers.js';

/**
 * Unified Audit Service - Comprehensive audit logging and analytics service
 * Features:
 * - Full audit trail for all operations
 * - Role-based filtering (admin vs super_admin)
 * - Advanced search with full-text capabilities
 * - Analytics and insights
 * - Export functionality with restrictions
 * - KV config audit support
 * - Dynamic configuration via KV storage
 * - Performance caching for read operations
*/
export class AuditLogService extends BaseService {
  constructor(env) {
    super(env, 'AuditLogService');
    // Initialize audit configuration service
    this.kvConfig = createKvConfigService(env);
    // Initialize cache for performance
    this.cache = new Map();
    this.cacheTTL = 5 * 60 * 1000; // 5 minutes
  }

  /**
   * Get cached data with TTL
   * @param {string} key - Cache key
   * @returns {any} Cached data or null
   */
  getCached(key) {
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      auditService_log(`Cache hit for key: ${key}`);
      return cached.data;
    }
    if (cached) {
      this.cache.delete(key);
      auditService_log(`Cache expired for key: ${key}`);
    }
    return null;
  }

  /**
   * Set cached data
   * @param {string} key - Cache key
   * @param {any} data - Data to cache
   */
  setCached(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
    auditService_log(`Cached data for key: ${key}`);
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
    auditService_log('Audit cache cleared');
  }

  /**
   * Log an audit event with dynamic configuration
   * @param {Object} auditEvent - Audit event details
   * @param {Object} context - Request context (c from Hono)
   */
  async log(auditEvent, context = null) {
    try {
      // Check if audit logging is enabled via configuration
      const featureFlags = await this.kvConfig.getFeatureFlags();
      if (!featureFlags.enableAuditLogging) {
        auditService_log('Audit logging disabled via configuration');
        return { success: true, disabled: true };
      }

      const timestamp = new Date().toISOString();
      const requestId = auditEvent.request_id || generateAuditRequestId();

      const auditEntry = {
        ...auditEvent,
        request_id: requestId,
        // Use data from auditEvent if available, otherwise from context
        ip_address: auditEvent.ip_address || (context ? getClientIP(context) : null),
        user_agent: auditEvent.user_agent || (context ? context.req.header('User-Agent') : null),
        timestamp,
        status: auditEvent.status || 'SUCCESS'
      };

      // Get performance settings for data sanitization level
      const performanceSettings = await this.kvConfig.getPerformanceSettings();
      const sanitizationLevel = performanceSettings.dataSanitizationLevel || 'standard';

      // Apply dynamic sanitization based on configuration
      auditEntry.details = sanitizeAuditDetails(auditEntry.details, sanitizationLevel);
      auditEntry.old_values = sanitizeAuditDetails(auditEntry.old_values, sanitizationLevel);
      auditEntry.new_values = sanitizeAuditDetails(auditEntry.new_values, sanitizationLevel);

      // Check if we should batch this entry based on performance settings
      if (performanceSettings.enableBatchProcessing) {
        return await this.batchLog(auditEntry);
      }

      // Standard synchronous logging
      const result = await this.dbService.insert(
        `INSERT INTO audit_logs (
          action, actor_id, actor_role, actor_email,
          target_type, target_id, target_identifier,
          ip_address, user_agent, request_id,
          details, old_values, new_values,
          status, error_message, timestamp
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          auditEntry.action || null,
          auditEntry.actor_id || null,
          auditEntry.actor_role || null,
          auditEntry.actor_email || null,
          auditEntry.target_type || null,
          auditEntry.target_id || null,
          auditEntry.target_identifier || null,
          auditEntry.ip_address || null,
          auditEntry.user_agent || null,
          auditEntry.request_id || null,
          JSON.stringify(auditEntry.details || {}),
          JSON.stringify(auditEntry.old_values || {}),
          JSON.stringify(auditEntry.new_values || {}),
          auditEntry.status || 'SUCCESS',
          auditEntry.error_message || null,
          auditEntry.timestamp || new Date().toISOString()
        ]
      );

      auditService_log(`Audit log created: ${auditEntry.action} by ${auditEntry.actor_id || 'system'}`);
      return { success: true, id: result.meta.last_row_id };
    } catch (error) {
      error_log(`Failed to create audit log: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Search audit logs with advanced filtering and full-text search
   * Enhanced with role-based filtering and dynamic configuration
   */
  async searchLogs(searchParams = {}) {
    try {
      // Check cache first
      const cacheKey = `search_${JSON.stringify(searchParams)}`;
      const cachedResult = this.getCached(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      // Get dynamic configuration for search limits and performance
      const performanceSettings = await this.kvConfig.getPerformanceSettings();
      const featureFlags = await this.kvConfig.getFeatureFlags();

      const {
        query,           // Search query for full-text search
        action,
        actor_id,
        actor_role,
        target_type,
        start_date,
        end_date,
        status,
        ip_address,
        exclude_super_admin = false,
        exclude_super_admin_actions = false,
        page = 1,
        limit = Math.min(searchParams.limit || 50, performanceSettings.maxQueryResultLimit || 1000),
        sort_by = 'timestamp',
        sort_order = 'DESC'
      } = searchParams;

      // Check if advanced search features are enabled
      if (!featureFlags.enableAdvancedSearch && query) {
        return {
          success: false,
          error: 'Advanced search is disabled via configuration'
        };
      }

      // Build dynamic WHERE clause using shared utility
      const { whereClause, params } = buildAuditWhereClause({
        action,
        actor_id,
        actor_role,
        target_type,
        start_date,
        end_date,
        status,
        ip_address,
        exclude_super_admin,
        exclude_super_admin_actions
      });

      // Add full-text search if query provided
      let finalWhereClause = whereClause;
      const finalParams = [...params];

      if (query && query.trim()) {
        const searchTerm = `%${query.trim()}%`;
        const searchCondition = `(
          action LIKE ? OR
          actor_email LIKE ? OR
          target_identifier LIKE ? OR
          details LIKE ? OR
          error_message LIKE ?
        )`;
        finalWhereClause = whereClause
          ? `${whereClause} AND ${searchCondition}`
          : `WHERE ${searchCondition}`;
        finalParams.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
      }

      const offset = (page - 1) * limit;

      // Get total count for pagination
      const countResult = await this.dbService.select(
        `SELECT COUNT(*) as total FROM audit_logs ${finalWhereClause}`,
        finalParams,
        true
      );

      // Get search results
      const logs = await this.dbService.select(
        `SELECT
          id, action, actor_id, actor_role, actor_email,
          target_type, target_id, target_identifier,
          ip_address, user_agent, request_id,
          details, old_values, new_values,
          status, error_message, timestamp
        FROM audit_logs
        ${finalWhereClause}
        ORDER BY ${sort_by} ${sort_order}
        LIMIT ? OFFSET ?`,
        [...finalParams, limit, offset]
      );

      const result = {
        success: true,
        data: {
          logs: logs.map(log => ({
            ...log,
            details: safeParseAuditJSON(log.details),
            old_values: safeParseAuditJSON(log.old_values),
            new_values: safeParseAuditJSON(log.new_values),
            highlighted: query ? this.highlightSearchTerms(log, query) : null
          })),
          pagination: {
            total: countResult.total,
            page,
            limit,
            totalPages: Math.ceil(countResult.total / limit)
          },
          search_info: {
            query: query || '',
            total_results: countResult.total,
            filters_applied: {
              exclude_super_admin,
              exclude_super_admin_actions
            }
          }
        }
      };

      // Cache the result
      this.setCached(cacheKey, result);

      return result;
    } catch (error) {
      error_log(`Failed to search audit logs: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audit logs with filtering and pagination
   * Enhanced with role-based filtering and caching
   */
  async getLogs(filters = {}, pagination = {}) {
    try {
      // Check cache first
      const cacheKey = `logs_${JSON.stringify(filters)}_${JSON.stringify(pagination)}`;
      const cachedResult = this.getCached(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const { whereClause, params } = buildAuditWhereClause(filters);
      const {
        page = 1,
        limit = 50,
        sort_by = 'timestamp',
        sort_order = 'DESC'
      } = pagination;

      const offset = (page - 1) * limit;

      // Get total count
      const countResult = await this.dbService.select(
        `SELECT COUNT(*) as total FROM audit_logs ${whereClause}`,
        params,
        true
      );

      // Get audit logs
      const logs = await this.dbService.select(
        `SELECT
          id, action, actor_id, actor_role, actor_email,
          target_type, target_id, target_identifier,
          ip_address, user_agent, request_id,
          details, old_values, new_values,
          status, error_message, timestamp
        FROM audit_logs
        ${whereClause}
        ORDER BY ${sort_by} ${sort_order}
        LIMIT ? OFFSET ?`,
        [...params, limit, offset]
      );

      const result = {
        success: true,
        data: {
          logs: logs.map(log => ({
            ...log,
            details: safeParseAuditJSON(log.details),
            old_values: safeParseAuditJSON(log.old_values),
            new_values: safeParseAuditJSON(log.new_values)
          })),
          pagination: {
            total: countResult.total,
            page,
            limit,
            totalPages: Math.ceil(countResult.total / limit)
          },
          filters_applied: filters
        }
      };

      // Cache the result
      this.setCached(cacheKey, result);

      return result;
    } catch (error) {
      error_log(`Failed to get audit logs: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get audit statistics with role-based filtering and caching
   */
  async getAuditStats(options = {}) {
    try {
      // Check cache first
      const cacheKey = `stats_${JSON.stringify(options)}`;
      const cachedResult = this.getCached(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const { exclude_super_admin = false } = options;
      const roleFilter = exclude_super_admin ? 'WHERE actor_role != \'super_admin\'' : '';

      // Basic statistics
      const basicStats = await this.dbService.select(`
        SELECT
          COUNT(*) as total_events,
          COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as successful_events,
          COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_events,
          COUNT(CASE WHEN status = 'ERROR' THEN 1 END) as error_events,
          COUNT(CASE WHEN status = 'SECURITY_EVENT' THEN 1 END) as security_events
        FROM audit_logs ${roleFilter}
      `, [], true);

      // Action statistics
      const actionStats = await this.dbService.select(`
        SELECT action, COUNT(*) as count
        FROM audit_logs ${roleFilter}
        GROUP BY action
        ORDER BY count DESC
        LIMIT 10
      `);

      // Recent activity (last 24 hours)
      const recentActivity = await this.dbService.select(`
        SELECT
          COUNT(*) as events_24h,
          COUNT(CASE WHEN LOWER(action) LIKE '%login%' THEN 1 END) as login_events_24h,
          COUNT(CASE WHEN target_type = 'admin' OR LOWER(action) LIKE '%admin%' THEN 1 END) as admin_events_24h,
          COUNT(CASE WHEN target_identifier LIKE '%/kv-admin/%' OR LOWER(action) LIKE '%kv%' THEN 1 END) as kv_events_24h
        FROM audit_logs
        WHERE timestamp >= datetime('now', '-24 hours') ${exclude_super_admin ? 'AND actor_role != \'super_admin\'' : ''}
      `, [], true);

      const result = {
        success: true,
        data: {
          basic_stats: basicStats,
          action_stats: actionStats,
          recent_activity: recentActivity,
          filtered_for_role: exclude_super_admin ? ROLES.ADMIN : ROLES.SUPER_ADMIN
        }
      };

      // Cache the result
      this.setCached(cacheKey, result);

      return result;
    } catch (error) {
      error_log(`Failed to get audit stats: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get security analytics - failed logins, suspicious activities
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} Security analytics data
   */
  async getSecurityAnalytics(options = {}) {
    try {
      // Check cache first
      const cacheKey = `security_analytics_${JSON.stringify(options)}`;
      const cachedResult = this.getCached(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const {
        timeframe = '24h'
      } = options;

      const timeframeSql = this.getTimeframeSQL(timeframe);

      // Failed login attempts analysis
      const failedLoginsQuery = `
        SELECT
          COUNT(*) as count,
          ip_address,
          COUNT(DISTINCT actor_id) as affected_users,
          MAX(timestamp) as last_attempt
        FROM audit_logs
        WHERE (LOWER(action) LIKE '%login%' OR target_identifier LIKE '%/auth/login%') AND status != 'SUCCESS'
          AND timestamp >= ${timeframeSql}
        GROUP BY ip_address
        ORDER BY count DESC
        LIMIT 10
      `;

      const failedLogins = await this.dbService.select(failedLoginsQuery, []);

      // Suspicious IP activity
      const suspiciousIpQuery = `
        SELECT
          ip_address,
          COUNT(*) as total_requests,
          COUNT(DISTINCT action) as unique_actions,
          COUNT(DISTINCT actor_id) as unique_users,
          MIN(timestamp) as first_seen,
          MAX(timestamp) as last_seen
        FROM audit_logs
        WHERE timestamp >= ${timeframeSql}
          AND ip_address IS NOT NULL
        GROUP BY ip_address
        HAVING total_requests > 100 OR unique_users > 10
        ORDER BY total_requests DESC
        LIMIT 20
      `;

      const suspiciousIps = await this.dbService.select(suspiciousIpQuery, []);

      // Admin activity analysis
      const adminActivityQuery = `
        SELECT
          actor_role,
          action,
          COUNT(*) as count,
          COUNT(DISTINCT actor_id) as unique_admins
        FROM audit_logs
        WHERE actor_role IN (?, ?)
          AND timestamp >= ${timeframeSql}
        GROUP BY actor_role, action
        ORDER BY count DESC
      `;

      const adminActivity = await this.dbService.select(adminActivityQuery, ['admin', 'super_admin']);

      // Rate limiting events
      const rateLimitQuery = `
        SELECT
          COUNT(*) as rate_limit_events,
          COUNT(DISTINCT ip_address) as blocked_ips,
          ip_address,
          COUNT(*) as blocks_per_ip
        FROM audit_logs
        WHERE action LIKE '%rate_limit%'
          AND timestamp >= ${timeframeSql}
        GROUP BY ip_address
        ORDER BY blocks_per_ip DESC
        LIMIT 10
      `;

      const rateLimitEvents = await this.dbService.select(rateLimitQuery, []);

      const result = {
        timeframe,
        generated_at: new Date().toISOString(),
        security_summary: {
          failed_logins: failedLogins || [],
          suspicious_ips: suspiciousIps || [],
          admin_activity: adminActivity || [],
          rate_limit_events: rateLimitEvents || []
        },
        risk_indicators: this.calculateRiskIndicators(failedLogins, suspiciousIps),
        recommendations: this.generateSecurityRecommendations(failedLogins, suspiciousIps)
      };

      // Cache the result
      this.setCached(cacheKey, result);

      auditService_log('Security analytics generated successfully');
      return result;

    } catch (error) {
      auditService_log(`Error generating security analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user behavior analytics
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} User behavior analytics
   */
  async getUserBehaviorAnalytics(options = {}) {
    try {
      // Check cache first
      const cacheKey = `behavior_analytics_${JSON.stringify(options)}`;
      const cachedResult = this.getCached(cacheKey);
      if (cachedResult) {
        return cachedResult;
      }

      const {
        timeframe = '7d',
        actorRole = null
      } = options;

      const timeframeSql = this.getTimeframeSQL(timeframe);
      const roleFilter = actorRole ? `AND actor_role = '${actorRole}'` : '';

      // User activity patterns
      const activityPatternsQuery = `
        SELECT
          actor_id,
          actor_role,
          COUNT(*) as total_actions,
          COUNT(DISTINCT action) as unique_actions,
          COUNT(DISTINCT DATE(timestamp)) as active_days,
          MIN(timestamp) as first_activity,
          MAX(timestamp) as last_activity,
          AVG(
            CASE
              WHEN strftime('%H', timestamp) BETWEEN '09' AND '17' THEN 1
              ELSE 0
            END
          ) * 100 as business_hours_percentage
        FROM audit_logs
        WHERE timestamp >= ${timeframeSql}
          ${roleFilter}
          AND actor_id IS NOT NULL
        GROUP BY actor_id, actor_role
        ORDER BY total_actions DESC
        LIMIT 50
      `;

      const activityPatterns = await this.dbService.select(activityPatternsQuery, []);

      // Most common actions by role
      const actionsByRoleQuery = `
        SELECT
          actor_role,
          action,
          COUNT(*) as count,
          COUNT(DISTINCT actor_id) as unique_users
        FROM audit_logs
        WHERE timestamp >= ${timeframeSql}
          ${roleFilter}
          AND actor_id IS NOT NULL
        GROUP BY actor_role, action
        ORDER BY actor_role, count DESC
      `;

      const actionsByRole = await this.dbService.select(actionsByRoleQuery, []);

      // Peak activity hours
      const peakHoursQuery = `
        SELECT
          strftime('%H', timestamp) as hour,
          COUNT(*) as activity_count,
          COUNT(DISTINCT actor_id) as unique_users
        FROM audit_logs
        WHERE timestamp >= ${timeframeSql}
          ${roleFilter}
          AND actor_id IS NOT NULL
        GROUP BY strftime('%H', timestamp)
        ORDER BY activity_count DESC
      `;

      const peakHours = await this.dbService.select(peakHoursQuery, []);

      const result = {
        timeframe,
        actor_role_filter: actorRole,
        generated_at: new Date().toISOString(),
        behavior_summary: {
          activity_patterns: activityPatterns || [],
          actions_by_role: actionsByRole || [],
          peak_hours: peakHours || []
        },
        insights: this.generateBehaviorInsights(activityPatterns, actionsByRole, peakHours)
      };

      // Cache the result
      this.setCached(cacheKey, result);

      auditService_log('User behavior analytics generated successfully');
      return result;

    } catch (error) {
      auditService_log(`Error generating user behavior analytics: ${error.message}`);
      throw error;
    }
  }

  // Helper methods for analytics
  getTimeframeSQL(timeframe) {
    const timeframeMap = {
      '1h': 'datetime(\'now\', \'-1 hour\')',
      '24h': 'datetime(\'now\', \'-1 day\')',
      '7d': 'datetime(\'now\', \'-7 days\')',
      '30d': 'datetime(\'now\', \'-30 days\')',
      '90d': 'datetime(\'now\', \'-90 days\')',
      '1y': 'datetime(\'now\', \'-1 year\')'
    };
    return timeframeMap[timeframe] || timeframeMap['24h'];
  }

  calculateRiskIndicators(failedLogins, suspiciousIps) {
    const highRiskThresholds = {
      failedLoginsPerIp: 50,
      requestsPerIp: 1000,
      uniqueUsersPerIp: 20
    };

    return {
      high_risk_ips: suspiciousIps.filter(ip =>
        ip.total_requests > highRiskThresholds.requestsPerIp ||
        ip.unique_users > highRiskThresholds.uniqueUsersPerIp
      ).length,
      brute_force_attempts: failedLogins.filter(login =>
        login.count > highRiskThresholds.failedLoginsPerIp
      ).length,
      risk_score: this.calculateOverallRiskScore(failedLogins, suspiciousIps)
    };
  }

  calculateOverallRiskScore(failedLogins, suspiciousIps) {
    let score = 0;

    // Failed login weight
    const totalFailedLogins = failedLogins.reduce((sum, item) => sum + item.count, 0);
    score += Math.min(totalFailedLogins / 10, 30);

    // Suspicious IP weight
    score += Math.min(suspiciousIps.length * 2, 40);

    // High activity IPs weight
    const highActivityIps = suspiciousIps.filter(ip => ip.total_requests > 500).length;
    score += Math.min(highActivityIps * 5, 30);

    return Math.round(Math.min(score, 100));
  }

  generateSecurityRecommendations(failedLogins, suspiciousIps) {
    const recommendations = [];

    if (failedLogins.length > 5) {
      recommendations.push({
        type: 'security',
        priority: 'high',
        message: 'High number of failed login attempts detected. Consider implementing stronger rate limiting.'
      });
    }

    if (suspiciousIps.length > 10) {
      recommendations.push({
        type: 'security',
        priority: 'medium',
        message: 'Multiple suspicious IP addresses detected. Review and consider IP blocking.'
      });
    }

    return recommendations;
  }

  generateBehaviorInsights(activityPatterns, actionsByRole, peakHours) {
    const insights = [];

    if (peakHours.length > 0) {
      const peakHour = peakHours[0];
      insights.push(`Peak activity occurs at ${peakHour.hour}:00 with ${peakHour.activity_count} actions`);
    }

    const totalActions = activityPatterns.reduce((sum, user) => sum + user.total_actions, 0);
    if (totalActions > 0) {
      insights.push(`Average actions per active user: ${Math.round(totalActions / activityPatterns.length)}`);
    }

    return insights;
  }

  /**
   * Highlight search terms in audit log entries
   */
  highlightSearchTerms(log, query) {
    const highlight = (text, term) => {
      if (!text || !term) {return text;}
      const regex = new RegExp(`(${term})`, 'gi');
      return text.replace(regex, '<mark>$1</mark>');
    };

    return {
      action: highlight(log.action, query),
      actor_email: highlight(log.actor_email, query),
      target_identifier: highlight(log.target_identifier, query),
      error_message: highlight(log.error_message, query)
    };
  }

  /**
   * Batch processing for high-volume audit logging
   */
  async batchLog(auditEntry) {
    try {
      const performanceSettings = await this.kvConfig.getPerformanceSettings();
      const batchSize = performanceSettings.batchProcessingSize || 10;

      // Initialize batch if it doesn't exist
      if (!this.batchQueue) {
        this.batchQueue = [];
        this.batchTimer = null;
      }

      // Add entry to batch
      this.batchQueue.push(auditEntry);
      auditService_log(`Added entry to batch queue. Queue size: ${this.batchQueue.length}`);

      // Process batch if it reaches the configured size
      if (this.batchQueue.length >= batchSize) {
        return await this.processBatch();
      }

      // Set timer to process batch after configured interval
      const batchInterval = performanceSettings.batchProcessingInterval || 5000;
      if (!this.batchTimer) {
        this.batchTimer = setTimeout(async () => {
          if (this.batchQueue.length > 0) {
            await this.processBatch();
          }
        }, batchInterval);
      }

      return { success: true, batched: true, queueSize: this.batchQueue.length };
    } catch (error) {
      error_log(`Failed to batch audit log: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Process batch of audit entries
   */
  async processBatch() {
    try {
      if (!this.batchQueue || this.batchQueue.length === 0) {
        return { success: true, processed: 0 };
      }

      const batch = [...this.batchQueue];
      this.batchQueue = [];

      if (this.batchTimer) {
        clearTimeout(this.batchTimer);
        this.batchTimer = null;
      }

      // Prepare batch insert statement
      const placeholders = batch.map(() => '(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').join(', ');
      const values = batch.flatMap(entry => [
        entry.action || null,
        entry.actor_id || null,
        entry.actor_role || null,
        entry.actor_email || null,
        entry.target_type || null,
        entry.target_id || null,
        entry.target_identifier || null,
        entry.ip_address || null,
        entry.user_agent || null,
        entry.request_id || null,
        JSON.stringify(entry.details || {}),
        JSON.stringify(entry.old_values || {}),
        JSON.stringify(entry.new_values || {}),
        entry.status || 'SUCCESS',
        entry.error_message || null,
        entry.timestamp || new Date().toISOString()
      ]);

      const result = await this.dbService.insert(
        `INSERT INTO audit_logs (
          action, actor_id, actor_role, actor_email,
          target_type, target_id, target_identifier,
          ip_address, user_agent, request_id,
          details, old_values, new_values,
          status, error_message, timestamp
        ) VALUES ${placeholders}`,
        values
      );

      auditService_log(`Batch processed: ${batch.length} audit entries`);
      return { success: true, processed: batch.length, insertId: result.meta.last_row_id };
    } catch (error) {
      error_log(`Failed to process audit log batch: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate CSV format for export
   */
  generateCSV(data) {
    if (data.length === 0) {return '';}

    const headers = Object.keys(data[0]);
    const csvContent = [
      headers.join(','),
      ...data.map(row =>
        headers.map(header => {
          const rawValue = row[header];
          const value = rawValue === null || rawValue === undefined
            ? ''
            : typeof rawValue === 'object'
              ? JSON.stringify(rawValue)
              : String(rawValue);

          // Escape CSV values
          if (value.includes(',') || value.includes('"') || value.includes('\n')) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        }).join(',')
      )
    ].join('\n');

    return csvContent;
  }

  normalizeExportOptions(exportOptions = {}) {
    const format = exportOptions.format || 'csv';
    const filters = exportOptions.filters || {
      action: exportOptions.action,
      actor_id: exportOptions.userId,
      actor_role: exportOptions.actorRole,
      target_type: exportOptions.entityType,
      start_date: exportOptions.startDate,
      end_date: exportOptions.endDate,
      search: exportOptions.search
    };

    return {
      format,
      filters,
      include_sensitive: exportOptions.include_sensitive ?? exportOptions.includeDetails ?? false,
      exclude_super_admin: exportOptions.exclude_super_admin ?? false,
      exclude_super_admin_actions: exportOptions.exclude_super_admin_actions ?? false,
      max_records: exportOptions.max_records ?? exportOptions.maxRecords ?? exportOptions.limit ?? 10000
    };
  }

  /**
   * Export audit logs with role-based restrictions
   */
  async exportLogs(exportOptions = {}) {
    try {
      const {
        format,
        filters,
        include_sensitive,
        exclude_super_admin,
        exclude_super_admin_actions,
        max_records
      } = this.normalizeExportOptions(exportOptions);

      // Get logs with applied filters
      const result = await this.getLogs(
        { ...filters, exclude_super_admin, exclude_super_admin_actions },
        { page: 1, limit: max_records }
      );

      if (!result.success) {
        return result;
      }

      // Format data for export
      const exportData = result.data.logs.map(log => {
        const exportLog = {
          id: log.id,
          timestamp: log.timestamp,
          action: log.action,
          actor_email: log.actor_email,
          actor_role: log.actor_role,
          target_type: log.target_type,
          target_identifier: log.target_identifier,
          status: log.status,
          ip_address: log.ip_address
        };

        // Include sensitive data only if allowed
        if (include_sensitive) {
          exportLog.details = log.details;
          exportLog.old_values = log.old_values;
          exportLog.new_values = log.new_values;
          exportLog.error_message = log.error_message;
        }

        return exportLog;
      });

      // Generate export based on format
      let exportContent;
      if (format === 'csv') {
        exportContent = this.generateCSV(exportData);
      } else {
        exportContent = JSON.stringify(exportData, null, 2);
      }

      return {
        success: true,
        data: {
          content: exportContent,
          format,
          record_count: exportData.length,
          export_metadata: {
            exported_at: new Date().toISOString(),
            include_sensitive,
            exclude_super_admin,
            total_available: result.data.pagination.total
          }
        }
      };
    } catch (error) {
      error_log(`Failed to export audit logs: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Check audit log health and integrity with dynamic thresholds
   */
  async checkAuditHealth() {
    try {
      // Get alert thresholds from configuration
      const alertSettings = await this.kvConfig.getAlertThresholds();

      // Check table existence
      const tableCheck = await this.dbService.select(
        'SELECT name FROM sqlite_master WHERE type=\'table\' AND name=\'audit_logs\'',
        [],
        true
      );

      if (!tableCheck) {
        return {
          success: true,
          data: {
            table_exists: false,
            message: 'Audit logs table not found - migrations may not have run yet',
            health_status: 'warning'
          }
        };
      }

      // Check recent entries
      const recentCount = await this.dbService.select(
        'SELECT COUNT(*) as count FROM audit_logs WHERE timestamp >= datetime(\'now\', \'-1 hour\')',
        [],
        true
      );

      // Check for errors using configured threshold
      const errorCount = await this.dbService.select(
        'SELECT COUNT(*) as count FROM audit_logs WHERE status = \'ERROR\' AND timestamp >= datetime(\'now\', \'-24 hours\')',
        [],
        true
      );

      // Use existing threshold fields that actually exist in alert configuration
      const errorThreshold = alertSettings.suspiciousActivityThreshold || 10;
      const healthStatus = errorCount.count > errorThreshold ? 'critical' :
        errorCount.count > (errorThreshold / 2) ? 'warning' : 'healthy';

      return {
        success: true,
        data: {
          table_exists: true,
          recent_entries: recentCount.count || 0,
          recent_errors: errorCount.count || 0,
          error_threshold: errorThreshold,
          health_status: healthStatus,
          config_integration: true
        }
      };
    } catch (error) {
      error_log(`Audit health check failed: ${error.message}`);
      return {
        success: true,
        data: {
          table_exists: false,
          health_status: 'warning',
          error: error.message,
          message: 'Health check completed with warnings'
        }
      };
    }
  }

  /**
   * Automatic cleanup of old audit logs based on retention policy
   */
  async cleanupOldLogs() {
    try {
      const retentionPolicies = await this.kvConfig.getRetentionPolicies();

      // Get retention period (default 90 days)
      const retentionDays = retentionPolicies.auditLogRetentionDays || 90;

      // Check if cleanup is enabled
      if (!retentionPolicies.enableAutoCleanup) {
        auditService_log('Automatic cleanup is disabled via configuration');
        return { success: true, disabled: true };
      }

      // Calculate cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      const cutoffIso = cutoffDate.toISOString();

      // First, count logs to be deleted
      const countResult = await this.dbService.select(
        'SELECT COUNT(*) as count FROM audit_logs WHERE timestamp < ?',
        [cutoffIso],
        true
      );

      const logsToDelete = countResult.count;
      if (logsToDelete === 0) {
        auditService_log('No old audit logs to cleanup');
        return { success: true, deleted: 0 };
      }

      // Archive logs before deletion if archiving is enabled
      if (retentionPolicies.enableArchiving) {
        await this.archiveOldLogs(cutoffIso);
      }

      // Delete old logs
      await this.dbService.delete(
        'DELETE FROM audit_logs WHERE timestamp < ?',
        [cutoffIso]
      );

      auditService_log(`Cleaned up ${logsToDelete} old audit logs older than ${retentionDays} days`);

      return {
        success: true,
        deleted: logsToDelete,
        cutoff_date: cutoffIso,
        retention_days: retentionDays
      };
    } catch (error) {
      error_log(`Failed to cleanup old audit logs: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Archive old audit logs to audit_logs_archive table
   */
  async archiveOldLogs(cutoffDate) {
    try {
      // Check if archive table exists, create if not
      await this.dbService.execute(`
        CREATE TABLE IF NOT EXISTS audit_logs_archive (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          action TEXT,
          actor_id INTEGER,
          actor_role TEXT,
          actor_email TEXT,
          target_type TEXT,
          target_id INTEGER,
          target_identifier TEXT,
          ip_address TEXT,
          user_agent TEXT,
          request_id TEXT,
          details TEXT,
          old_values TEXT,
          new_values TEXT,
          status TEXT DEFAULT 'SUCCESS',
          error_message TEXT,
          timestamp TEXT,
          archived_at TEXT DEFAULT (datetime('now'))
        )
      `);

      // Copy logs to archive
      const archiveResult = await this.dbService.execute(`
        INSERT INTO audit_logs_archive (
          action, actor_id, actor_role, actor_email,
          target_type, target_id, target_identifier,
          ip_address, user_agent, request_id,
          details, old_values, new_values,
          status, error_message, timestamp
        )
        SELECT
          action, actor_id, actor_role, actor_email,
          target_type, target_id, target_identifier,
          ip_address, user_agent, request_id,
          details, old_values, new_values,
          status, error_message, timestamp
        FROM audit_logs WHERE timestamp < ?
      `, [cutoffDate]);

      auditService_log(`Archived ${archiveResult.meta.changes} audit logs before deletion`);
      return { success: true, archived: archiveResult.meta.changes };
    } catch (error) {
      error_log(`Failed to archive old audit logs: ${error.message}`);
      throw error;
    }
  }

  /**
   * Delete a single audit log by ID
   * @param {number} id
   */
  async deleteLogById(id) {
    try {
      const existing = await this.dbService.select(
        'SELECT id FROM audit_logs WHERE id = ?',
        [id],
        true
      );
      if (!existing) {
        return { success: false, notFound: true };
      }
      await this.dbService.delete('DELETE FROM audit_logs WHERE id = ?', [id]);
      return { success: true, deleted: 1 };
    } catch (error) {
      error_log(`Failed to delete audit log ${id}: ${error.message}`);
      return { success: false, error: error.message };
    }
  }
}
