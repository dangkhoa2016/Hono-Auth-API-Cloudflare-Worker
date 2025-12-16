import { query_log, dbError_log } from '../utils/debug.js';
import { getFeatureFlags } from '../utils/dynamicConfig.js';

/**
 * Base Database Service to handle all database operations
 * Independent service with direct database access
*/
export class DatabaseService {
  constructor(env) {
    this.env = env;
    this.database = env.DB;
    query_log('DatabaseService initialized');
  }

  /**
   * Execute SELECT query with prepared statement and retry logic
   * @param {string} query - SQL SELECT query
   * @param {Array} params - Parameters to bind
   * @param {boolean} firstOnly - Return first record instead of array
   * @returns {Promise<Object|Array|null>} Query result
   */
  async select(query, params = [], firstOnly = false) {
    const featureFlags = await getFeatureFlags(this.env);
    if (featureFlags.logSqlQueries) {
      query_log(`Executing SELECT query: ${query}, params: ${JSON.stringify(params)}`);
    }

    return this.executeWithRetry(async () => {
      const statement = this.database.prepare(query);

      let result;
      if (firstOnly) {
        result = params.length > 0
          ? await statement.bind(...params).first()
          : await statement.first();
        if (featureFlags.logSqlQueries) {
          query_log(`SELECT query completed, found: ${result ? 'record' : 'no record'}`);
        }
        return result;
      } else {
        const queryResult = params.length > 0
          ? await statement.bind(...params).all()
          : await statement.all();
        if (featureFlags.logSqlQueries) {
          query_log(`SELECT query completed, found: ${queryResult.results?.length || 0} records`);
        }
        return queryResult.results || [];
      }
    }, `SELECT query error: ${query}`, firstOnly ? null : []);
  }

  /**
   * Execute INSERT query with prepared statement and retry logic
   * @param {string} query - SQL INSERT query
   * @param {Array} params - Parameters to bind
   * @returns {Promise<Object|null>} Insert result with meta info
   */
  async insert(query, params = []) {
    const featureFlags = await getFeatureFlags(this.env);
    if (featureFlags.logSqlQueries) {
      query_log(`Executing INSERT query: ${query}, params: ${JSON.stringify(params)}`);
    }

    return this.executeWithRetry(async () => {
      const statement = this.database.prepare(query);

      const result = params.length > 0
        ? await statement.bind(...params).run()
        : await statement.run();

      if (result.success) {
        if (featureFlags.logSqlQueries) {
          query_log(`INSERT query completed successfully, inserted ID: ${result.meta?.last_row_id}`);
        }
        return {
          success: true,
          insertId: result.meta?.last_row_id,
          changes: result.meta?.changes,
          meta: result.meta
        };
      } else {
        if (featureFlags.logSqlQueries) {
          query_log('INSERT query failed');
        }
        return null;
      }
    }, `INSERT query error: ${query}`, null);
  }

  /**
   * Execute UPDATE query with prepared statement and retry logic
   * @param {string} query - SQL UPDATE query
   * @param {Array} params - Parameters to bind
   * @returns {Promise<Object|null>} Update result
   */
  async update(query, params = []) {
    const featureFlags = await getFeatureFlags(this.env);
    if (featureFlags.logSqlQueries) {
      query_log(`Executing UPDATE query: ${query}, params: ${JSON.stringify(params)}`);
    }

    return this.executeWithRetry(async () => {
      const statement = this.database.prepare(query);

      const result = params.length > 0
        ? await statement.bind(...params).run()
        : await statement.run();

      if (result.success) {
        if (featureFlags.logSqlQueries) {
          query_log(`UPDATE query completed successfully, affected rows: ${result.meta?.changes}`);
        }
        return {
          success: true,
          changes: result.meta?.changes,
          meta: result.meta
        };
      } else {
        if (featureFlags.logSqlQueries) {
          query_log('UPDATE query failed');
        }
        return null;
      }
    }, `UPDATE query error: ${query}`, null);
  }

  /**
   * Execute DELETE query with prepared statement and retry logic
   * @param {string} query - SQL DELETE query
   * @param {Array} params - Parameters to bind
   * @returns {Promise<Object|null>} Delete result
   */
  async delete(query, params = []) {
    const featureFlags = await getFeatureFlags(this.env);
    if (featureFlags.logSqlQueries) {
      query_log(`Executing DELETE query: ${query}, params: ${JSON.stringify(params)}`);
    }

    return this.executeWithRetry(async () => {
      const statement = this.database.prepare(query);

      const result = params.length > 0
        ? await statement.bind(...params).run()
        : await statement.run();

      if (result.success) {
        query_log(`DELETE query completed successfully, affected rows: ${result.meta?.changes}`);
        return {
          success: true,
          changes: result.meta?.changes,
          meta: result.meta
        };
      } else {
        query_log('DELETE query failed');
        return null;
      }
    }, `DELETE query error: ${query}`, null);
  }

  /**
   * Execute UPSERT (INSERT OR UPDATE) query with prepared statement
   * @param {string} query - SQL UPSERT query
   * @param {Array} params - Parameters to bind
   * @returns {Promise<Object|null>} Upsert result
   */
  async upsert(query, params = []) {
    const featureFlags = await getFeatureFlags(this.env);
    if (featureFlags.logSqlQueries) {
      query_log(`Executing UPSERT query: ${query}, params: ${JSON.stringify(params)}`);
    }

    try {
      const statement = this.database.prepare(query);

      const result = params.length > 0
        ? await statement.bind(...params).run()
        : await statement.run();

      if (result.success) {
        query_log(`UPSERT query completed successfully, changes: ${result.meta?.changes}`);
        return {
          success: true,
          insertId: result.meta?.last_row_id,
          changes: result.meta?.changes,
          meta: result.meta
        };
      } else {
        query_log('UPSERT query failed');
        return null;
      }
    } catch (error) {
      dbError_log(`UPSERT query error: ${error.message}, query: ${query}`);
      return null;
    }
  }

  /**
   * Execute custom query with prepared statement (for special cases)
   * @param {string} query - SQL query
   * @param {Array} params - Parameters to bind
   * @param {string} method - Method to call (first, all, run)
   * @returns {Promise<any>} Query result
   */
  async execute(query, params = [], method = 'run') {
    const featureFlags = await getFeatureFlags(this.env);
    if (featureFlags.logSqlQueries) {
      query_log(`Executing custom query: ${query}, params: ${JSON.stringify(params)}, method: ${method}`);
    }

    try {
      const statement = this.database.prepare(query);

      let result;
      switch (method.toLowerCase()) {
      case 'first':
        result = params.length > 0
          ? await statement.bind(...params).first()
          : await statement.first();
        break;
      case 'all':
        result = params.length > 0
          ? await statement.bind(...params).all()
          : await statement.all();
        break;
      case 'run':
      default:
        result = params.length > 0
          ? await statement.bind(...params).run()
          : await statement.run();
        break;
      }

      query_log(`Custom query completed successfully with method: ${method}`);
      return result;
    } catch (error) {
      dbError_log(`Custom query error: ${error.message}, query: ${query}`);
      return null;
    }
  }

  /**
   * Check database connection
   * @returns {Promise<boolean>} True if database is working normally
   */
  async healthCheck() {
    try {
      const result = await this.select('SELECT 1 as health_check', [], true);
      const isHealthy = result && result.health_check === 1;
      query_log(`Database health check: ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`);
      return isHealthy;
    } catch (error) {
      dbError_log(`Database health check failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get database metadata information
   * @returns {Promise<Object>} Database metadata
   */
  async getDatabaseInfo() {
    try {
      // Get list of tables
      const tables = await this.select(
        'SELECT name FROM sqlite_master WHERE type=\'table\' AND name NOT LIKE \'sqlite_%\'',
        []
      );

      // Get SQLite version
      // const version = await this.select('SELECT sqlite_version() as version', [], true);
      const version = null;

      const info = {
        version: version?.version || 'unknown',
        tables: tables.map(t => t.name),
        tableCount: tables.length
      };

      query_log(`Database info retrieved: ${JSON.stringify(info)}`);
      return info;
    } catch (error) {
      dbError_log(`Error getting database info: ${error.message}`);
      return {
        version: 'unknown',
        tables: [],
        tableCount: 0
      };
    }
  }

  /**
   * Get comprehensive database performance metrics
   * @param {Object} metricsConfig - Configuration for metrics (e.g., time ranges)
   * @param {number} metricsConfig.recentHours - Time range for recent activity (default: 24)
   * @param {Object} securityConfig - Security configuration for performance thresholds
   * @param {number} securityConfig.performanceGoodThreshold - Threshold for good performance in milliseconds
   * @returns {Promise<Object>} Database performance metrics
   */
  async getDatabaseMetrics(metricsConfig = {}, securityConfig = {}) {
    try {
      const startTime = Date.now();

      // Test query performance
      const testQueryResult = await this.select('SELECT COUNT(*) as count FROM users', [], true);
      const queryResponseTime = Date.now() - startTime;

      // Get table statistics
      const tableStats = await this.select(`
        SELECT 
          name as table_name,
          (SELECT COUNT(*) FROM sqlite_master WHERE type='index' AND tbl_name=m.name) as index_count
        FROM sqlite_master m 
        WHERE type='table' AND name NOT LIKE 'sqlite_%'
      `);

      // Get user table statistics
      const userStats = await this.select(`
        SELECT 
          COUNT(*) as total_records,
          COUNT(CASE WHEN status = 'active' THEN 1 END) as active_users,
          COUNT(CASE WHEN created_at >= datetime('now', '-24 hours') THEN 1 END) as recent_users_24h,
          COUNT(CASE WHEN updated_at >= datetime('now', '-1 hour') THEN 1 END) as recent_activity_1h
        FROM users
      `, [], true);

      // Get failed login attempts statistics (configurable time range)
      const recentHours = metricsConfig.recentHours || 24;

      // Get failed login attempts statistics (configurable time range)
      const securityStats = await this.select(`
        SELECT 
          COALESCE(SUM(attempts_count), 0) as total_failed_attempts,
          COALESCE(SUM(CASE WHEN last_attempt_at >= datetime('now', '-${recentHours} hours') THEN attempts_count ELSE 0 END), 0) as recent_failures_1h,
          COALESCE(COUNT(DISTINCT CASE WHEN context LIKE 'auth:ip%' THEN identifier END), 0) as unique_ips_with_failures
        FROM rate_limit_counters
        WHERE context LIKE 'auth:%'
      `, [], true);
      const metrics = {
        performance: {
          queryResponseTime: `${queryResponseTime}ms`,
          isResponsive: queryResponseTime < securityConfig.performanceGoodThreshold,
          testQuerySuccess: testQueryResult?.count !== undefined
        },
        database: {
          tables: tableStats,
          totalTables: tableStats.length,
          totalIndexes: tableStats.reduce((sum, table) => sum + (table.index_count || 0), 0)
        },
        users: {
          totalRecords: userStats?.total_records || 0,
          activeUsers: userStats?.active_users || 0,
          recentUsers24h: userStats?.recent_users_24h || 0,
          recentActivity1h: userStats?.recent_activity_1h || 0
        },
        security: {
          totalFailedAttempts: securityStats?.total_failed_attempts || 0,
          recentFailures1h: securityStats?.recent_failures_1h || 0,
          uniqueIpsWithFailures: securityStats?.unique_ips_with_failures || 0
        }
      };

      query_log('Database metrics retrieved successfully');
      return metrics;
    } catch (error) {
      dbError_log(`Error getting database metrics: ${error.message}`);
      return {
        performance: {
          queryResponseTime: 'unknown',
          isResponsive: false,
          testQuerySuccess: false
        },
        database: {
          tables: [],
          totalTables: 0,
          totalIndexes: 0
        },
        users: {
          totalRecords: 0,
          activeUsers: 0,
          recentUsers24h: 0,
          recentActivity1h: 0
        },
        security: {
          totalFailedAttempts: 0,
          recentFailures1h: 0,
          uniqueIpsWithFailures: 0
        }
      };
    }
  }

  /**
   * Helper method to build dynamic WHERE clause
   * @param {Object} conditions - Object with conditions
   * @param {Array} allowedFields - Array of allowed filter fields
   * @returns {Object} { whereClause, params }
   */
  buildWhereClause(conditions = {}, allowedFields = []) {
    const whereParts = [];
    const params = [];

    Object.entries(conditions).forEach(([field, value]) => {
      if (allowedFields.length === 0 || allowedFields.includes(field)) {
        if (value !== undefined && value !== null && value !== '') {
          if (Array.isArray(value)) {
            // Handle IN clause
            const placeholders = value.map(() => '?').join(',');
            whereParts.push(`${field} IN (${placeholders})`);
            params.push(...value);
          } else if (typeof value === 'string' && value.includes('%')) {
            // Handle LIKE clause
            whereParts.push(`${field} LIKE ?`);
            params.push(value);
          } else {
            // Handle equality
            whereParts.push(`${field} = ?`);
            params.push(value);
          }
        }
      }
    });

    const whereClause = whereParts.length > 0 ? `WHERE ${whereParts.join(' AND ')}` : '';

    query_log(`Built WHERE clause: ${whereClause}, params: ${JSON.stringify(params)}`);

    return { whereClause, params };
  }

  /**
   * Helper method to build dynamic UPDATE SET clause
   * @param {Object} updateData - Object with data to update
   * @param {Array} allowedFields - Array of allowed update fields
   * @returns {Object} { setClause, params }
   */
  buildSetClause(updateData = {}, allowedFields = []) {
    const setParts = [];
    const params = [];

    Object.entries(updateData).forEach(([field, value]) => {
      if (allowedFields.length === 0 || allowedFields.includes(field)) {
        if (value !== undefined) {
          setParts.push(`${field} = ?`);
          params.push(value);
        }
      }
    });

    const setClause = setParts.join(', ');

    query_log(`Built SET clause: ${setClause}, params: ${JSON.stringify(params)}`);

    return { setClause, params };
  }

  /**
   * Execute database operation with retry logic
   * @param {Function} operation - Async operation to execute
   * @param {string} errorMessage - Error message prefix
   * @param {*} fallbackValue - Value to return on failure
   * @param {number} maxRetries - Maximum number of retries
   * @returns {Promise<*>} Operation result or fallback value
   */
  async executeWithRetry(operation, errorMessage, fallbackValue, maxRetries = 3) {
    const baseDelay = 100; // 100ms

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        query_log(`Database operation attempt ${attempt}/${maxRetries}`);
        const result = await operation();
        return result; // Success
      } catch (error) {
        dbError_log(`${errorMessage} (attempt ${attempt}/${maxRetries}): ${error.message}`);

        if (attempt === maxRetries) {
          dbError_log(`All database operation attempts failed, returning fallback value`);
          return fallbackValue; // All retries failed
        }

        // Exponential backoff
        const delay = baseDelay * Math.pow(2, attempt - 1);
        query_log(`Waiting ${delay}ms before retry ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
}
