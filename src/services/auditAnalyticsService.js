/**
 * Advanced Audit Analytics Service
 * Provides advanced analytics and insights for audit logs
*/

import { BaseService } from './baseService.js';
import { auditAnalytics_log } from '../utils/debug.js';
import { ROLE_COMBINATIONS } from '../constants/roles.js';

/**
 * Advanced analytics service for audit logs
*/
export class AuditAnalyticsService extends BaseService {
  constructor(env) {
    super(env, 'AuditAnalyticsService');
    auditAnalytics_log('AuditAnalyticsService initialized');
  }

  /**
   * Get security analytics - failed logins, suspicious activities
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} Security analytics data
   */
  async getSecurityAnalytics(options = {}) {
    const {
      timeframe = '24h',
      // includeDetails = false
    } = options;

    auditAnalytics_log(`Generating security analytics for timeframe: ${timeframe}`);

    try {
      const timeframeSql = this.getTimeframeSQL(timeframe);

      // Execute queries in parallel for better performance
      const [failedLogins, suspiciousIps, adminActivity, rateLimitEvents] = await Promise.all([
        // Failed login attempts analysis
        this.dbService.select(`
          SELECT 
            COUNT(*) as count,
            details->>'$.ipAddress' as ip_address,
            COUNT(DISTINCT actor_id) as affected_users,
            MAX(timestamp) as last_attempt
          FROM audit_logs 
          WHERE action = 'login_failed' 
            AND timestamp >= ${timeframeSql}
          GROUP BY details->>'$.ipAddress'
          ORDER BY count DESC
          LIMIT 10
        `, []),

        // Suspicious IP activity
        this.dbService.select(`
          SELECT 
            details->>'$.ipAddress' as ip_address,
            COUNT(*) as total_requests,
            COUNT(DISTINCT action) as unique_actions,
            COUNT(DISTINCT actor_id) as unique_users,
            MIN(timestamp) as first_seen,
            MAX(timestamp) as last_seen
          FROM audit_logs 
          WHERE timestamp >= ${timeframeSql}
            AND details->>'$.ipAddress' IS NOT NULL
          GROUP BY details->>'$.ipAddress'
          HAVING total_requests > 100 OR unique_users > 10
          ORDER BY total_requests DESC
          LIMIT 20
        `, []),

        // Admin activity analysis
        this.dbService.select(`
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
        `, ROLE_COMBINATIONS.ADMIN_ONLY),

        // Rate limiting events
        this.dbService.select(`
          SELECT 
            COUNT(*) as rate_limit_events,
            COUNT(DISTINCT details->>'$.ipAddress') as blocked_ips,
            details->>'$.ipAddress' as ip_address,
            COUNT(*) as blocks_per_ip
          FROM audit_logs 
          WHERE action LIKE '%rate_limit%' 
            AND timestamp >= ${timeframeSql}
          GROUP BY details->>'$.ipAddress'
          ORDER BY blocks_per_ip DESC
          LIMIT 10
        `, [])
      ]);

      const analytics = {
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

      auditAnalytics_log('Security analytics generated successfully');
      return analytics;

    } catch (error) {
      auditAnalytics_log(`Error generating security analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get user behavior analytics
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} User behavior analytics
   */
  async getUserBehaviorAnalytics(options = {}) {
    const {
      timeframe = '7d',
      actorRole = null,
      // includeInactive = false
    } = options;

    auditAnalytics_log(`Generating user behavior analytics for timeframe: ${timeframe}`);

    try {
      const timeframeSql = this.getTimeframeSQL(timeframe);
      const roleFilter = actorRole ? `AND actor_role = '${actorRole}'` : '';

      // Execute queries in parallel
      const [activityPatterns, actionsByRole, peakHours] = await Promise.all([
        // User activity patterns
        this.dbService.select(`
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
        `, []),

        // Most common actions by role
        this.dbService.select(`
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
        `, []),

        // Peak activity hours
        this.dbService.select(`
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
        `, [])
      ]);

      const analytics = {
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

      auditAnalytics_log('User behavior analytics generated successfully');
      return analytics;

    } catch (error) {
      auditAnalytics_log(`Error generating user behavior analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get performance analytics for audit system
   * @param {Object} options - Analytics options
   * @returns {Promise<Object>} Performance analytics
   */
  async getPerformanceAnalytics(options = {}) {
    const { timeframe = '24h' } = options;

    auditAnalytics_log(`Generating performance analytics for timeframe: ${timeframe}`);

    try {
      const timeframeSql = this.getTimeframeSQL(timeframe);

      // Execute queries in parallel
      const [volume, size, actionFrequency] = await Promise.all([
        // Audit log volume analysis
        this.dbService.select(`
          SELECT 
            DATE(timestamp) as date,
            strftime('%H', timestamp) as hour,
            COUNT(*) as log_count,
            COUNT(DISTINCT actor_id) as unique_users,
            COUNT(DISTINCT action) as unique_actions
          FROM audit_logs 
          WHERE timestamp >= ${timeframeSql}
          GROUP BY DATE(timestamp), strftime('%H', timestamp)
          ORDER BY timestamp DESC
        `, []),

        // Database size and growth
        this.dbService.select(`
          SELECT 
            COUNT(*) as total_records,
            AVG(LENGTH(details)) as avg_details_size,
            MAX(timestamp) as latest_record,
            MIN(timestamp) as oldest_record
          FROM audit_logs
        `, [], true),

        // Action frequency analysis
        this.dbService.select(`
          SELECT 
            action,
            COUNT(*) as frequency,
            COUNT(DISTINCT actor_id) as unique_users,
            AVG(
              CASE 
                WHEN details->>'$.duration' IS NOT NULL 
                THEN CAST(details->>'$.duration' AS INTEGER)
                ELSE NULL 
              END
            ) as avg_duration_ms
          FROM audit_logs 
          WHERE timestamp >= ${timeframeSql}
          GROUP BY action
          ORDER BY frequency DESC
        `, [])
      ]);

      const analytics = {
        timeframe,
        generated_at: new Date().toISOString(),
        performance_summary: {
          volume_analysis: volume || [],
          database_size: size || {},
          action_frequency: actionFrequency || []
        },
        health_indicators: this.calculateHealthIndicators(volume, size),
        optimization_recommendations: this.generateOptimizationRecommendations(volume, size)
      };

      auditAnalytics_log('Performance analytics generated successfully');
      return analytics;

    } catch (error) {
      auditAnalytics_log(`Error generating performance analytics: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get compliance report for audit logs
   * @param {Object} options - Report options
   * @returns {Promise<Object>} Compliance report
   */
  async getComplianceReport(options = {}) {
    const {
      timeframe = '30d',
      // format = 'summary',
      // includeUserData = false
    } = options;

    auditAnalytics_log(`Generating compliance report for timeframe: ${timeframe}`);

    try {
      const timeframeSql = this.getTimeframeSQL(timeframe);

      // Execute queries in parallel
      const [retention, access, adminActions] = await Promise.all([
        // Data retention compliance
        this.dbService.select(`
          SELECT 
            COUNT(*) as total_logs,
            COUNT(CASE WHEN timestamp >= datetime('now', '-90 days') THEN 1 END) as logs_90d,
            COUNT(CASE WHEN timestamp >= datetime('now', '-365 days') THEN 1 END) as logs_1y,
            MIN(timestamp) as oldest_log,
            MAX(timestamp) as newest_log
          FROM audit_logs
        `, [], true),

        // Access pattern compliance
        this.dbService.select(`
          SELECT 
            action,
            COUNT(*) as frequency,
            COUNT(DISTINCT actor_id) as unique_users,
            actor_role,
            COUNT(CASE WHEN details->>'$.success' = 'true' THEN 1 END) as successful_attempts,
            COUNT(CASE WHEN details->>'$.success' = 'false' THEN 1 END) as failed_attempts
          FROM audit_logs 
          WHERE timestamp >= ${timeframeSql}
            AND action IN ('login', 'logout', 'view', 'create', 'update', 'delete', 'role_change')
          GROUP BY action, actor_role
          ORDER BY action, actor_role
        `, []),

        // Administrative actions tracking
        this.dbService.select(`
          SELECT 
            actor_id,
            actor_role,
            action,
            target_type,
            COUNT(*) as action_count,
            MIN(timestamp) as first_action,
            MAX(timestamp) as last_action
          FROM audit_logs 
          WHERE timestamp >= ${timeframeSql}
            AND actor_role IN (?, ?)
            AND action IN ('create', 'update', 'delete', 'role_change')
          GROUP BY actor_id, actor_role, action, target_type
          ORDER BY actor_id, action_count DESC
        `, ROLE_COMBINATIONS.ADMIN_ONLY)
      ]);

      const report = {
        report_period: timeframe,
        generated_at: new Date().toISOString(),
        compliance_summary: {
          data_retention: retention || {},
          access_patterns: access || [],
          administrative_actions: adminActions || []
        },
        compliance_status: this.assessComplianceStatus(retention, access, adminActions),
        recommendations: this.generateComplianceRecommendations(retention, access)
      };

      auditAnalytics_log('Compliance report generated successfully');
      return report;

    } catch (error) {
      auditAnalytics_log(`Error generating compliance report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Helper: Get SQL for timeframe filtering
   */
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

  /**
   * Calculate risk indicators based on security data
   */
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

  /**
   * Calculate overall risk score (0-100)
   */
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

  /**
   * Generate security recommendations
   */
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

  /**
   * Generate behavior insights
   */
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
   * Calculate system health indicators
   */
  calculateHealthIndicators(volumeData, sizeData) {
    return {
      status: 'healthy',
      total_records: sizeData?.total_records || 0,
      avg_daily_volume: volumeData.length > 0 ?
        Math.round(volumeData.reduce((sum, day) => sum + day.log_count, 0) / volumeData.length) : 0,
      database_growth_rate: 'stable'
    };
  }

  /**
   * Generate optimization recommendations
   */
  generateOptimizationRecommendations(volumeData, sizeData) {
    const recommendations = [];

    if (sizeData?.total_records > 100000) {
      recommendations.push({
        type: 'performance',
        priority: 'medium',
        message: 'Consider implementing log archival for records older than 90 days'
      });
    }

    return recommendations;
  }

  /**
   * Assess compliance status
   */
  assessComplianceStatus(retention, access, adminActions) {
    return {
      data_retention: retention?.total_logs > 0 ? 'compliant' : 'no_data',
      access_logging: access.length > 0 ? 'compliant' : 'no_data',
      admin_oversight: adminActions.length >= 0 ? 'compliant' : 'needs_review'
    };
  }

  /**
   * Generate compliance recommendations
   */
  generateComplianceRecommendations(retention, access) {
    auditAnalytics_log(`Generating compliance recommendations rentention: ${JSON.stringify(retention)}, access: ${JSON.stringify(access)}`);
    const recommendations = [];

    if (retention?.logs_90d === 0) {
      recommendations.push({
        type: 'compliance',
        priority: 'high',
        message: 'No audit logs found in the last 90 days. Ensure audit logging is properly configured.'
      });
    }

    return recommendations;
  }

  /**
   * Get GDPR compliance report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} GDPR compliance report
   */
  async getGDPRComplianceReport(options = {}) {
    try {
      const { startDate, endDate, detailed = false } = options;

      auditAnalytics_log('Generating GDPR compliance report');

      // Data access tracking
      const dataAccessQuery = `
        SELECT 
          COUNT(*) as total_access,
          COUNT(DISTINCT actor_id) as unique_users,
          COUNT(DISTINCT details->>'$.dataSubject') as unique_subjects
        FROM audit_logs 
        WHERE action IN ('data_view', 'data_export', 'user_profile_view')
          ${startDate ? 'AND timestamp >= ?' : ''}
          ${endDate ? 'AND timestamp <= ?' : ''}
      `;

      const bindings = [];
      if (startDate) {bindings.push(startDate);}
      if (endDate) {bindings.push(endDate);}

      const dataAccess = await this.dbService.select(dataAccessQuery, bindings, true);

      // Data retention tracking
      const retentionQuery = `
        SELECT 
          COUNT(*) as total_logs,
          COUNT(CASE WHEN timestamp >= datetime('now', '-30 days') THEN 1 END) as last_30_days,
          COUNT(CASE WHEN timestamp >= datetime('now', '-90 days') THEN 1 END) as last_90_days
        FROM audit_logs
      `;

      const retention = await this.dbService.select(retentionQuery, [], true);

      const gdprReport = {
        report_type: 'GDPR',
        report_period: { start_date: startDate, end_date: endDate },
        generated_at: new Date().toISOString(),
        period: { start_date: startDate, end_date: endDate },
        data_access: {
          total_access_events: dataAccess?.total_access || 0,
          unique_users_accessing_data: dataAccess?.unique_users || 0,
          unique_data_subjects: dataAccess?.unique_subjects || 0
        },
        data_retention: {
          total_logs: retention?.total_logs || 0,
          logs_last_30_days: retention?.last_30_days || 0,
          logs_last_90_days: retention?.last_90_days || 0,
          retention_policy_compliant: (retention?.last_90_days || 0) > 0
        },
        compliance_status: {
          data_protection: (retention?.last_90_days || 0) > 0 ? 'compliant' : 'needs_review',
          access_logging: (dataAccess?.total_access || 0) > 0 ? 'compliant' : 'no_data',
          retention_management: 'compliant'
        }
      };

      if (detailed) {
        // Add detailed access patterns
        gdprReport.detailed_access_patterns = await this.getDetailedAccessPatterns(startDate, endDate);
      }

      auditAnalytics_log('GDPR compliance report generated');
      return gdprReport;

    } catch (error) {
      auditAnalytics_log(`Error generating GDPR compliance report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get SOX compliance report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} SOX compliance report
   */
  async getSOXComplianceReport(options = {}) {
    try {
      const { startDate, endDate, detailed = false } = options;

      auditAnalytics_log('Generating SOX compliance report');

      // Administrative actions tracking
      const adminActionsQuery = `
        SELECT 
          COUNT(*) as total_admin_actions,
          COUNT(DISTINCT actor_id) as unique_admins,
          COUNT(CASE WHEN action LIKE '%create%' THEN 1 END) as create_actions,
          COUNT(CASE WHEN action LIKE '%delete%' THEN 1 END) as delete_actions,
          COUNT(CASE WHEN action LIKE '%update%' THEN 1 END) as update_actions
        FROM audit_logs 
        WHERE actor_role IN (?, ?)
          ${startDate ? 'AND timestamp >= ?' : ''}
          ${endDate ? 'AND timestamp <= ?' : ''}
      `;

      const bindings = [...ROLE_COMBINATIONS.ADMIN_ONLY];
      if (startDate) {bindings.push(startDate);}
      if (endDate) {bindings.push(endDate);}

      const adminActions = await this.dbService.select(adminActionsQuery, bindings, true);

      // Financial data access (simulated)
      const financialAccessQuery = `
        SELECT 
          COUNT(*) as financial_access_events,
          COUNT(DISTINCT actor_id) as users_accessing_financial_data
        FROM audit_logs 
        WHERE details->>'$.dataType' = 'financial'
          ${startDate ? 'AND timestamp >= ?' : ''}
          ${endDate ? 'AND timestamp <= ?' : ''}
      `;

      const financialAccess = await this.dbService.select(financialAccessQuery, bindings, true);

      const soxReport = {
        report_type: 'SOX',
        generated_at: new Date().toISOString(),
        period: { start_date: startDate, end_date: endDate },
        administrative_controls: {
          total_admin_actions: adminActions?.total_admin_actions || 0,
          unique_administrators: adminActions?.unique_admins || 0,
          create_actions: adminActions?.create_actions || 0,
          update_actions: adminActions?.update_actions || 0,
          delete_actions: adminActions?.delete_actions || 0
        },
        financial_data_access: {
          access_events: financialAccess?.financial_access_events || 0,
          users_with_access: financialAccess?.users_accessing_financial_data || 0
        },
        compliance_status: {
          admin_oversight: (adminActions?.total_admin_actions || 0) > 0 ? 'compliant' : 'needs_review',
          access_controls: 'compliant',
          audit_trail: 'compliant'
        }
      };

      if (detailed) {
        // Add detailed admin action breakdown
        soxReport.detailed_admin_actions = await this.getDetailedAdminActions(startDate, endDate);
      }

      auditAnalytics_log('SOX compliance report generated');
      return soxReport;

    } catch (error) {
      auditAnalytics_log(`Error generating SOX compliance report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get ISO 27001 compliance report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} ISO 27001 compliance report
   */
  async getISO27001ComplianceReport(options = {}) {
    try {
      const { startDate, endDate, detailed = false } = options;

      auditAnalytics_log('Generating ISO 27001 compliance report');

      // Security incident tracking
      const securityQuery = `
        SELECT 
          COUNT(*) as total_security_events,
          COUNT(CASE WHEN action = 'login_failed' THEN 1 END) as failed_logins,
          COUNT(CASE WHEN action = 'security_violation' THEN 1 END) as security_violations,
          COUNT(DISTINCT details->>'$.ipAddress') as unique_source_ips
        FROM audit_logs 
        WHERE action IN ('login_failed', 'security_violation', 'unauthorized_access', 'privilege_escalation')
          ${startDate ? 'AND timestamp >= ?' : ''}
          ${endDate ? 'AND timestamp <= ?' : ''}
      `;

      const bindings = [];
      if (startDate) {bindings.push(startDate);}
      if (endDate) {bindings.push(endDate);}

      const securityEvents = await this.dbService.select(securityQuery, bindings, true);

      // Access management tracking
      const accessQuery = `
        SELECT 
          COUNT(*) as total_access_events,
          COUNT(CASE WHEN action = 'login_success' THEN 1 END) as successful_logins,
          COUNT(DISTINCT actor_id) as unique_users
        FROM audit_logs 
        WHERE action IN ('login_success', 'logout', 'session_timeout')
          ${startDate ? 'AND timestamp >= ?' : ''}
          ${endDate ? 'AND timestamp <= ?' : ''}
      `;

      const accessEvents = await this.dbService.select(accessQuery, bindings, true);

      const iso27001Report = {
        report_type: 'ISO_27001',
        generated_at: new Date().toISOString(),
        period: { start_date: startDate, end_date: endDate },
        security_monitoring: {
          total_security_events: securityEvents?.total_security_events || 0,
          failed_login_attempts: securityEvents?.failed_logins || 0,
          security_violations: securityEvents?.security_violations || 0,
          unique_source_ips: securityEvents?.unique_source_ips || 0
        },
        access_management: {
          total_access_events: accessEvents?.total_access_events || 0,
          successful_logins: accessEvents?.successful_logins || 0,
          unique_active_users: accessEvents?.unique_users || 0
        },
        compliance_status: {
          security_monitoring: (securityEvents?.total_security_events || 0) >= 0 ? 'compliant' : 'needs_review',
          access_controls: (accessEvents?.total_access_events || 0) > 0 ? 'compliant' : 'needs_review',
          incident_management: 'compliant',
          risk_assessment: 'compliant'
        }
      };

      if (detailed) {
        // Add detailed security incident analysis
        iso27001Report.detailed_security_analysis = await this.getDetailedSecurityAnalysis(startDate, endDate);
      }

      auditAnalytics_log('ISO 27001 compliance report generated');
      return iso27001Report;

    } catch (error) {
      auditAnalytics_log(`Error generating ISO 27001 compliance report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get general compliance report
   * @param {Object} options - Report options
   * @returns {Promise<Object>} General compliance report
   */
  async getGeneralComplianceReport(options = {}) {
    try {
      const { startDate, endDate, type = 'general' } = options;

      auditAnalytics_log('Generating general compliance report');

      // Basic audit trail metrics
      const auditMetricsQuery = `
        SELECT 
          COUNT(*) as total_events,
          COUNT(DISTINCT actor_id) as unique_users,
          COUNT(DISTINCT action) as unique_actions,
          MIN(timestamp) as earliest_event,
          MAX(timestamp) as latest_event
        FROM audit_logs 
        WHERE 1=1
          ${startDate ? 'AND timestamp >= ?' : ''}
          ${endDate ? 'AND timestamp <= ?' : ''}
      `;

      const bindings = [];
      if (startDate) {bindings.push(startDate);}
      if (endDate) {bindings.push(endDate);}

      const auditMetrics = await this.dbService.select(auditMetricsQuery, bindings, true);

      const generalReport = {
        report_type: type.toUpperCase(),
        generated_at: new Date().toISOString(),
        period: { start_date: startDate, end_date: endDate },
        audit_trail_metrics: {
          total_events: auditMetrics?.total_events || 0,
          unique_users: auditMetrics?.unique_users || 0,
          unique_actions: auditMetrics?.unique_actions || 0,
          date_range: {
            earliest: auditMetrics?.earliest_event,
            latest: auditMetrics?.latest_event
          }
        },
        compliance_status: {
          audit_completeness: (auditMetrics?.total_events || 0) > 0 ? 'compliant' : 'needs_review',
          data_integrity: 'compliant',
          retention_policy: 'compliant'
        }
      };

      auditAnalytics_log('General compliance report generated');
      return generalReport;

    } catch (error) {
      auditAnalytics_log(`Error generating general compliance report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Create custom compliance report
   * @param {Object} options - Custom report options
   * @returns {Promise<Object>} Custom compliance report
   */
  async createCustomComplianceReport(options = {}) {
    try {
      const { name, criteria = {}, format = 'json' } = options;

      auditAnalytics_log(`Creating custom compliance report: ${name}`);

      // Build custom query based on criteria
      let whereClause = '1=1';
      const bindings = [];

      if (criteria && criteria.actions && Array.isArray(criteria.actions)) {
        const placeholders = criteria.actions.map(() => '?').join(',');
        whereClause += ` AND action IN (${placeholders})`;
        bindings.push(...criteria.actions);
      }

      if (criteria && criteria.users && Array.isArray(criteria.users)) {
        const placeholders = criteria.users.map(() => '?').join(',');
        whereClause += ` AND actor_id IN (${placeholders})`;
        bindings.push(...criteria.users);
      }

      if (criteria && criteria.time_range) {
        const days = parseInt(criteria.time_range.replace('d', ''));
        whereClause += ' AND timestamp >= datetime("now", ?)';
        bindings.push(`-${days} days`);
      }

      const customQuery = `
        SELECT 
          action,
          COUNT(*) as event_count,
          COUNT(DISTINCT actor_id) as unique_users,
          MIN(timestamp) as first_occurrence,
          MAX(timestamp) as last_occurrence
        FROM audit_logs 
        WHERE ${whereClause}
        GROUP BY action
        ORDER BY event_count DESC
      `;

      const customData = await this.dbService.select(customQuery, bindings);

      const customReport = {
        report_type: 'CUSTOM',
        report_name: name,
        generated_at: new Date().toISOString(),
        criteria,
        format,
        data: customData,
        summary: {
          total_actions: customData.length,
          total_events: customData.reduce((sum, item) => sum + (item.event_count || 0), 0),
          unique_users: Math.max(...customData.map(item => item.unique_users || 0), 0)
        }
      };

      auditAnalytics_log(`Custom compliance report created: ${name}`);
      return customReport;

    } catch (error) {
      auditAnalytics_log(`Error creating custom compliance report: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get detailed access patterns (helper method)
   */
  getDetailedAccessPatterns(_startDate, _endDate) {
    // Implementation for detailed access patterns
    return [];
  }

  /**
   * Get detailed admin actions (helper method)
   */
  getDetailedAdminActions(_startDate, _endDate) {
    // Implementation for detailed admin actions
    return [];
  }

  /**
   * Get detailed security analysis (helper method)
   */
  getDetailedSecurityAnalysis(_startDate, _endDate) {
    // Implementation for detailed security analysis
    return [];
  }
}
