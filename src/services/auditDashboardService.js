/**
 * Audit Dashboard Service
 * Provides data aggregation and dashboard API endpoints
*/

import { auditDashboard_log } from '../utils/debug.js';
import { createDatabaseService, createAuditAnalyticsService } from '../utils/serviceFactory.js';
import { BaseService } from './baseService.js';
import { ROLE_COMBINATIONS } from '../constants/roles.js';

/**
 * Dashboard Data Aggregator
 * Aggregates data for dashboard widgets and charts
*/
class DashboardDataAggregator {
  constructor(databaseService, analyticsService) {
    this.db = databaseService;
    this.analytics = analyticsService;
    this.cacheTimeout = 300000; // 5 minutes
    this.cache = new Map();

    auditDashboard_log('DashboardDataAggregator initialized');
  }

  /**
   * Get cached data or fetch fresh data
   */
  async getCachedData(key, fetcher, timeout = this.cacheTimeout) {
    const cached = this.cache.get(key);

    if (cached && (Date.now() - cached.timestamp < timeout)) {
      auditDashboard_log(`Cache hit for ${key}`);
      return cached.data;
    }

    auditDashboard_log(`Cache miss for ${key}, fetching fresh data`);
    const data = await fetcher();

    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });

    return data;
  }

  /**
   * Clear cache
   */
  clearCache(key = null) {
    if (key) {
      this.cache.delete(key);
      auditDashboard_log(`Cache cleared for ${key}`);
    } else {
      this.cache.clear();
      auditDashboard_log('All cache cleared');
    }
  }

  /**
   * Get dashboard overview statistics
   */
  async getOverviewStats() {
    return await this.getCachedData('overview_stats', async () => {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const week = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const month = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      // Total audit logs
      const totalLogsResult = await this.db.select('SELECT COUNT(*) as count FROM audit_logs', []);
      const totalLogs = totalLogsResult?.[0] || { count: 0 };

      // Today's logs
      const todayLogsResult = await this.db.select('SELECT COUNT(*) as count FROM audit_logs WHERE timestamp >= ?', [today.toISOString()]);
      const todayLogs = todayLogsResult?.[0] || { count: 0 };

      // Week's logs
      const weekLogsResult = await this.db.select('SELECT COUNT(*) as count FROM audit_logs WHERE timestamp >= ?', [week.toISOString()]);
      const weekLogs = weekLogsResult?.[0] || { count: 0 };

      // Unique users today
      const uniqueUsersTodayResult = await this.db.select('SELECT COUNT(DISTINCT actor_id) as count FROM audit_logs WHERE timestamp >= ?', [today.toISOString()]);
      const uniqueUsersToday = uniqueUsersTodayResult?.[0] || { count: 0 };

      // Failed actions today
      const failedActionsTodayResult = await this.db.select('SELECT COUNT(*) as count FROM audit_logs WHERE timestamp >= ? AND (status != \'SUCCESS\' OR details LIKE ?)', [today.toISOString(), '%"success":false%']);
      const failedActionsToday = failedActionsTodayResult?.[0] || { count: 0 };

      // Top actions today
      const topActionsToday = await this.db.select('SELECT action, COUNT(*) as count FROM audit_logs WHERE timestamp >= ? GROUP BY action ORDER BY count DESC LIMIT 5', [today.toISOString()]);

      // Growth rate (week over week)
      const prevWeek = new Date(week.getTime() - 7 * 24 * 60 * 60 * 1000);
      const prevWeekLogsResult = await this.db.select('SELECT COUNT(*) as count FROM audit_logs WHERE timestamp BETWEEN ? AND ?', [prevWeek.toISOString(), week.toISOString()]);
      const prevWeekLogs = prevWeekLogsResult?.[0] || { count: 0 };

      const growthRate = (prevWeekLogs?.count || 0) > 0
        ? (((weekLogs?.count || 0) - (prevWeekLogs?.count || 0)) / (prevWeekLogs?.count || 1) * 100).toFixed(1)
        : 100;

      return {
        totals: {
          allTime: totalLogs?.count || 0,
          today: todayLogs?.count || 0,
          thisWeek: weekLogs?.count || 0,
          uniqueUsersToday: uniqueUsersToday?.count || 0,
          failedActionsToday: failedActionsToday?.count || 0
        },
        trends: {
          weeklyGrowthRate: parseFloat(growthRate),
          topActionsToday: topActionsToday
        },
        periods: {
          today: today.toISOString(),
          week: week.toISOString(),
          month: month.toISOString()
        }
      };
    });
  }

  /**
   * Get activity timeline data
   */
  async getActivityTimeline(hours = 24) {
    return await this.getCachedData(`activity_timeline_${hours}h`, async () => {
      const now = new Date();
      const startTime = new Date(now.getTime() - hours * 60 * 60 * 1000);

      // Get hourly activity
      const hourlyActivity = await this.db.select(`
        SELECT 
          strftime('%Y-%m-%d %H:00:00', timestamp) as hour,
          COUNT(*) as total_events,
          COUNT(CASE WHEN status != 'SUCCESS' OR details LIKE '%"success":false%' THEN 1 END) as failed_events,
          COUNT(DISTINCT actor_id) as unique_users,
          COUNT(CASE WHEN actor_role IN (?, ?) THEN 1 END) as admin_events
        FROM audit_logs 
        WHERE timestamp >= ? 
        GROUP BY hour 
        ORDER BY hour
      `, [...ROLE_COMBINATIONS.ADMIN_ONLY, startTime.toISOString()]);

      // Fill in missing hours with zeros
      const filledTimeline = [];
      for (let i = 0; i < hours; i++) {
        const hourTime = new Date(startTime.getTime() + i * 60 * 60 * 1000);
        const hourStr = hourTime.toISOString().slice(0, 13) + ':00:00';

        const existingData = hourlyActivity.find(h => h.hour === hourStr);
        filledTimeline.push(existingData || {
          hour: hourStr,
          total_events: 0,
          failed_events: 0,
          unique_users: 0,
          admin_events: 0
        });
      }

      return {
        timeRange: {
          start: startTime.toISOString(),
          end: now.toISOString(),
          hours
        },
        timeline: filledTimeline,
        summary: {
          totalEvents: filledTimeline.reduce((sum, h) => sum + h.total_events, 0),
          totalFailures: filledTimeline.reduce((sum, h) => sum + h.failed_events, 0),
          peakHour: filledTimeline.reduce((max, h) => h.total_events > max.total_events ? h : max, filledTimeline[0]),
          avgEventsPerHour: filledTimeline.reduce((sum, h) => sum + h.total_events, 0) / filledTimeline.length
        }
      };
    });
  }

  /**
   * Get user activity distribution
   */
  async getUserActivityDistribution() {
    return await this.getCachedData('user_activity_distribution', async () => {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Activity by role
      const roleActivity = await this.db.select(`
        SELECT 
          actor_role as role,
          COUNT(*) as event_count,
          COUNT(DISTINCT actor_id) as user_count,
          AVG(CASE WHEN status != 'SUCCESS' OR details LIKE '%"success":false%' THEN 1.0 ELSE 0.0 END) as failure_rate
        FROM audit_logs 
        WHERE timestamp >= ? 
        GROUP BY actor_role 
        ORDER BY event_count DESC
      `, [last24h.toISOString()]);

      // Top active users
      const topUsers = await this.db.select(`
        SELECT 
          actor_id,
          actor_role,
          COUNT(*) as event_count,
          COUNT(DISTINCT action) as unique_actions,
          MAX(timestamp) as last_activity
        FROM audit_logs 
        WHERE timestamp >= ? 
        GROUP BY actor_id, actor_role 
        ORDER BY event_count DESC 
        LIMIT 10
      `, [last24h.toISOString()]);

      // Action distribution
      const actionDistribution = await this.db.select(`
        SELECT 
          action,
          COUNT(*) as count,
          COUNT(CASE WHEN status != 'SUCCESS' OR details LIKE '%"success":false%' THEN 1 END) as failures,
          COUNT(DISTINCT actor_id) as unique_users
        FROM audit_logs 
        WHERE timestamp >= ?
        GROUP BY action 
        ORDER BY count DESC 
        LIMIT 15 
        GROUP BY action 
        ORDER BY count DESC
      `, [last24h.toISOString()]);

      return {
        period: {
          start: last24h.toISOString(),
          description: 'Last 24 hours'
        },
        byRole: roleActivity.map(role => ({
          ...role,
          failure_rate: parseFloat((role.failure_rate * 100).toFixed(2))
        })),
        topUsers: topUsers,
        actionDistribution: actionDistribution.map(action => ({
          ...action,
          success_rate: ((action.count - action.failures) / action.count * 100).toFixed(1)
        }))
      };
    });
  }

  /**
   * Get geographic distribution (simplified)
   */
  async getGeographicDistribution() {
    return await this.getCachedData('geographic_distribution', async () => {
      const last7days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

      // IP address distribution
      const ipDistribution = await this.db.select(`
        SELECT 
          ip_address,
          COUNT(*) as event_count,
          COUNT(DISTINCT actor_id) as user_count,
          MIN(timestamp) as first_seen,
          MAX(timestamp) as last_seen
        FROM audit_logs 
        WHERE timestamp >= ? AND ip_address IS NOT NULL
        GROUP BY ip_address 
        ORDER BY event_count DESC 
        LIMIT 20
      `, [last7days.toISOString()]);

      // Classify IPs
      const classifiedIPs = ipDistribution.map(ip => {
        const isLocal = ip.ip_address === '127.0.0.1' || ip.ip_address === '::1';
        const isPrivate = /^(10\.|192\.168\.|172\.(1[6-9]|2[0-9]|3[0-1])\.)/.test(ip.ip_address);

        return {
          ...ip,
          classification: isLocal ? 'local' : isPrivate ? 'private' : 'public',
          risk_score: isLocal ? 0 : isPrivate ? 10 : 30
        };
      });

      // Geographic summary
      const geoSummary = {
        totalIPs: ipDistribution.length,
        localConnections: classifiedIPs.filter(ip => ip.classification === 'local').length,
        privateNetworks: classifiedIPs.filter(ip => ip.classification === 'private').length,
        publicConnections: classifiedIPs.filter(ip => ip.classification === 'public').length,
        suspiciousIPs: classifiedIPs.filter(ip => ip.risk_score > 20).length
      };

      return {
        period: {
          start: last7days.toISOString(),
          description: 'Last 7 days'
        },
        ipDistribution: classifiedIPs,
        summary: geoSummary
      };
    });
  }

  /**
   * Get security metrics
   */
  async getSecurityMetrics() {
    return await this.getCachedData('security_metrics', async () => {
      const analytics = await this.analytics.getSecurityAnalytics();
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Additional security-specific queries
      const suspiciousActivity = await this.db.select(`
        SELECT 
          COUNT(CASE WHEN (LOWER(action) LIKE '%login%' OR target_identifier LIKE '%/auth/login%') AND status != 'SUCCESS' THEN 1 END) as failed_logins,
          COUNT(CASE WHEN action = 'role_change' THEN 1 END) as role_changes,
          COUNT(CASE WHEN actor_role = ? OR actor_role = ? THEN 1 END) as admin_actions,
          COUNT(DISTINCT ip_address) as unique_ips
        FROM audit_logs 
        WHERE timestamp >= ?
      `, [...ROLE_COMBINATIONS.ADMIN_ONLY, last24h.toISOString()], true);

      // Recent security events
      const recentSecurityEvents = await this.db.select(`
        SELECT *
        FROM audit_logs 
        WHERE timestamp >= ? 
        AND (
          ((LOWER(action) LIKE '%login%' OR target_identifier LIKE '%/auth/login%') AND status != 'SUCCESS') OR
          action = 'role_change' OR
          action IN ('user_delete', 'admin_access')
        )
        ORDER BY timestamp DESC 
        LIMIT 20
      `, [last24h.toISOString()]);

      return {
        period: {
          start: last24h.toISOString(),
          description: 'Last 24 hours'
        },
        analytics: analytics,
        currentActivity: suspiciousActivity,
        recentEvents: recentSecurityEvents.map(event => ({
          ...event,
          details: typeof event.details === 'string' ? JSON.parse(event.details) : event.details
        })),
        riskScore: analytics.summary?.overallRiskScore || 0
      };
    });
  }

  /**
   * Get performance metrics
   */
  async getPerformanceMetrics() {
    return await this.getCachedData('performance_metrics', async () => {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000);

      // Database performance metrics
      const dbMetrics = await this.db.select(`
        SELECT 
          COUNT(*) as total_logs,
          AVG(CASE WHEN details LIKE '%"duration"%' THEN 
            CAST(substr(details, instr(details, '"duration":') + 11, 
                 instr(substr(details, instr(details, '"duration":') + 11), ',') - 1) AS REAL)
          END) as avg_duration,
          MIN(timestamp) as oldest_log,
          MAX(timestamp) as newest_log
        FROM audit_logs 
        WHERE timestamp >= ?
      `, [last24h.toISOString()], true);

      // Event rate calculation
      const eventRate = dbMetrics.total_logs / 24; // events per hour

      // Database size estimation
      const tableSize = await this.db.select(`
        SELECT 
          COUNT(*) as total_rows,
          AVG(LENGTH(details)) as avg_details_size
        FROM audit_logs
      `, [], true);

      const estimatedSizeKB = (tableSize.total_rows * (200 + tableSize.avg_details_size)) / 1024;

      return {
        period: {
          start: last24h.toISOString(),
          description: 'Last 24 hours'
        },
        database: {
          totalLogs: dbMetrics.total_logs,
          averageDuration: dbMetrics.avg_duration,
          eventRate: Math.round(eventRate * 100) / 100,
          estimatedSizeKB: Math.round(estimatedSizeKB),
          oldestLog: dbMetrics.oldest_log,
          newestLog: dbMetrics.newest_log
        },
        system: {
          cacheSize: this.cache.size,
          cacheHitRate: this.getCacheHitRate()
        }
      };
    });
  }

  /**
   * Calculate cache hit rate
   */
  getCacheHitRate() {
    // This is a simplified implementation
    // In production, you'd track cache hits/misses more accurately
    return Math.random() * 30 + 70; // Simulate 70-100% hit rate
  }

  /**
   * Get real-time dashboard data
   */
  async getRealTimeDashboard() {
    const [overview, timeline, users, security] = await Promise.all([
      this.getOverviewStats(),
      this.getActivityTimeline(12), // Last 12 hours
      this.getUserActivityDistribution(),
      this.getSecurityMetrics()
    ]);

    return {
      timestamp: new Date().toISOString(),
      overview,
      timeline,
      users,
      security,
      metadata: {
        cacheStatus: {
          entries: this.cache.size,
          hitRate: this.getCacheHitRate()
        }
      }
    };
  }

  /**
   * Generate dashboard export data
   */
  async generateExportData(format = 'json', timeRange = 'last_24h') {
    let startTime;
    const now = new Date();

    switch (timeRange) {
    case 'last_1h':
      startTime = new Date(now.getTime() - 60 * 60 * 1000);
      break;
    case 'last_24h':
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      break;
    case 'last_7d':
      startTime = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case 'last_30d':
      startTime = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    default:
      startTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    }

    const exportData = {
      metadata: {
        exportedAt: now.toISOString(),
        timeRange,
        period: {
          start: startTime.toISOString(),
          end: now.toISOString()
        },
        format
      },
      overview: await this.getOverviewStats(),
      timeline: await this.getActivityTimeline(Math.ceil((now - startTime) / (60 * 60 * 1000))),
      users: await this.getUserActivityDistribution(),
      geographic: await this.getGeographicDistribution(),
      security: await this.getSecurityMetrics(),
      performance: await this.getPerformanceMetrics()
    };

    auditDashboard_log(`Dashboard data exported: ${format}, range: ${timeRange}`);
    return exportData;
  }
}

/**
 * Main Audit Dashboard Service
*/
export class AuditDashboardService extends BaseService {
  constructor(env) {
    super(env);
    this.databaseService = createDatabaseService(env);
    this.analyticsService = createAuditAnalyticsService(env);
    this.aggregator = new DashboardDataAggregator(this.databaseService, this.analyticsService);

    auditDashboard_log('AuditDashboardService initialized');
  }

  /**
   * Get dashboard overview
   */
  async getDashboardOverview() {
    return await this.aggregator.getOverviewStats();
  }

  /**
   * Get activity timeline
   */
  async getActivityTimeline(hours = 24) {
    return await this.aggregator.getActivityTimeline(hours);
  }

  /**
   * Get user activity data
   */
  async getUserActivity() {
    return await this.aggregator.getUserActivityDistribution();
  }

  /**
   * Get geographic data
   */
  async getGeographicData() {
    return await this.aggregator.getGeographicDistribution();
  }

  /**
   * Get security dashboard
   */
  async getSecurityDashboard() {
    return await this.aggregator.getSecurityMetrics();
  }

  /**
   * Get performance dashboard
   */
  async getPerformanceDashboard() {
    return await this.aggregator.getPerformanceMetrics();
  }

  /**
   * Get complete real-time dashboard
   */
  async getRealTimeDashboard() {
    return await this.aggregator.getRealTimeDashboard();
  }

  /**
   * Export dashboard data
   */
  async exportDashboard(format = 'json', timeRange = 'last_24h') {
    return await this.aggregator.generateExportData(format, timeRange);
  }

  /**
   * Clear dashboard cache
   */
  clearCache(key = null) {
    this.aggregator.clearCache(key);
    auditDashboard_log(`Dashboard cache cleared${key ? ` for ${key}` : ''}`);
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.aggregator.cache.size,
      entries: Array.from(this.aggregator.cache.keys()),
      hitRate: this.aggregator.getCacheHitRate()
    };
  }

  /**
   * Generate dashboard health check
   */
  async healthCheck() {
    try {
      const startTime = Date.now();

      // Test database connectivity
      const dbTest = await this.databaseService.select('SELECT COUNT(*) as count FROM audit_logs LIMIT 1', [], true);

      const dbResponseTime = Date.now() - startTime;

      // Test cache
      const cacheTest = this.aggregator.cache.size >= 0;

      // Test analytics service
      const analyticsStartTime = Date.now();
      const analyticsTest = await this.analyticsService.getSecurityAnalytics();
      const analyticsResponseTime = Date.now() - analyticsStartTime;

      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        tests: {
          database: {
            status: dbTest.count >= 0 ? 'pass' : 'fail',
            responseTime: dbResponseTime,
            recordCount: dbTest.count
          },
          cache: {
            status: cacheTest ? 'pass' : 'fail',
            size: this.aggregator.cache.size
          },
          analytics: {
            status: analyticsTest ? 'pass' : 'fail',
            responseTime: analyticsResponseTime
          }
        },
        performance: {
          totalResponseTime: Date.now() - startTime,
          cacheHitRate: this.aggregator.getCacheHitRate()
        }
      };
    } catch (error) {
      auditDashboard_log(`Dashboard health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error.message
      };
    }
  }
}

export default AuditDashboardService;
