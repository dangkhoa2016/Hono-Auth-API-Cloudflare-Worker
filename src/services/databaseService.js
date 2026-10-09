import { query_log, dbError_log } from '../utils/debug.js';
import { getFeatureFlags } from '../utils/dynamicConfig.js';
import { ServiceUnavailableError } from '../utils/serviceErrors.js';
import { describeQuery, describeDatabaseError } from '../utils/sqlLogging.js';

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
      query_log(`Executing query: ${describeQuery(query, params)}`);
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
    }, 'SELECT query error', { attempts: 3 });
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
      query_log(`Executing query: ${describeQuery(query, params)}`);
    }

    return this.executeWithRetry(async () => {
      const statement = this.database.prepare(query);

      const result = params.length > 0
        ? await statement.bind(...params).run()
        : await statement.run();

      if (!result || result.success === false) {
        throw new Error('INSERT did not report success');
      }
      if (featureFlags.logSqlQueries) {
        query_log(`INSERT query completed successfully, inserted ID: ${result.meta?.last_row_id}`);
      }
      return {
        success: true,
        insertId: result.meta?.last_row_id,
        changes: result.meta?.changes,
        meta: result.meta
      };
    }, 'INSERT query error', { attempts: 1 });
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
      query_log(`Executing query: ${describeQuery(query, params)}`);
    }

    return this.executeWithRetry(async () => {
      const statement = this.database.prepare(query);

      const result = params.length > 0
        ? await statement.bind(...params).run()
        : await statement.run();

      if (!result || result.success === false) {
        throw new Error('UPDATE did not report success');
      }
      if (featureFlags.logSqlQueries) {
        query_log(`UPDATE query completed successfully, affected rows: ${result.meta?.changes}`);
      }
      return {
        success: true,
        changes: result.meta?.changes,
        meta: result.meta
      };
    }, 'UPDATE query error', { attempts: 1 });
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
      query_log(`Executing query: ${describeQuery(query, params)}`);
    }

    return this.executeWithRetry(async () => {
      const statement = this.database.prepare(query);

      const result = params.length > 0
        ? await statement.bind(...params).run()
        : await statement.run();

      if (!result || result.success === false) {
        throw new Error('DELETE did not report success');
      }
      query_log(`DELETE query completed successfully, affected rows: ${result.meta?.changes}`);
      return {
        success: true,
        changes: result.meta?.changes,
        meta: result.meta
      };
    }, 'DELETE query error', { attempts: 1 });
  }

  /**
   * Run several statements as one D1 batch.
   *
   * D1 executes a batch as a single transaction: if any statement fails, none of
   * them are applied. This is what makes "copy then delete" safe - the rows are
   * either both in the archive and gone from hot storage, or neither changed.
   * Separate `insert()`/`delete()` calls are not a transaction, however they are
   * sequenced.
   *
   * @param {Array<{query: string, params: Array}>} entries - Statements to run
   * @returns {Promise<Array>} Per-statement results, in order
   * @throws {Error} When D1 rejects the batch; nothing is applied
   */
  async batch(entries) {
    if (!Array.isArray(entries) || entries.length === 0) {
      throw new Error('batch requires at least one statement');
    }
    const featureFlags = await getFeatureFlags(this.env);
    if (featureFlags.logSqlQueries) {
      query_log(`Executing batch of ${entries.length} statements`);
    }

    // No retry: a failed batch means a constraint or a conflict, and replaying
    // it could apply a half-understood write. Reads are retried elsewhere.
    let results;
    try {
      const statements = entries.map(({ query, params = [] }) => (
        params.length > 0
          ? this.database.prepare(query).bind(...params)
          : this.database.prepare(query)
      ));
      results = await this.database.batch(statements);
    } catch (error) {
      // Only identifiable infrastructure failures become 503. Constraint and
      // transaction-assertion errors must retain their domain meaning.
      const message = error instanceof Error ? error.message : '';
      if (/^D1_ERROR:/i.test(message)
          && /network connection (?:lost|reset)|database is (?:overloaded|unavailable)|connection (?:reset|refused)|(?:request|query) timed out/i.test(message)
          && !/SQLITE_CONSTRAINT|constraint failed|integer overflow/i.test(message)) {
        throw new ServiceUnavailableError('Database batch dependency is unavailable', { operation: 'BATCH' });
      }
      throw error;
    }
    if (featureFlags.logSqlQueries) {
      query_log(`Batch completed: ${results.length} statements`);
    }
    return results;
  }

  /**
   * Execute UPSERT (INSERT OR UPDATE) query with prepared statement
   * @param {string} query - SQL UPSERT query
   * @param {Array} params - Parameters to bind
   * @returns {Promise<Object|null>} Upsert result with meta info
   */
  async upsert(query, params = []) {
    const featureFlags = await getFeatureFlags(this.env);
    if (featureFlags.logSqlQueries) {
      query_log(`Executing query: ${describeQuery(query, params)}`);
    }

    try {
      const statement = this.database.prepare(query);

      const result = params.length > 0
        ? await statement.bind(...params).run()
        : await statement.run();

      if (!result || result.success === false) {
        throw new Error('UPSERT did not report success');
      }
      query_log(`UPSERT query completed successfully, changes: ${result.meta?.changes}`);
      return {
        success: true,
        insertId: result.meta?.last_row_id,
        changes: result.meta?.changes,
        meta: result.meta
      };
    } catch (error) {
      dbError_log(`UPSERT query error: ${describeDatabaseError(error)}`);
      throw toServiceUnavailable(error, 'UPSERT');
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
      query_log(`Executing query: ${describeQuery(query, params)}, method: ${method}`);
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
      dbError_log(`Custom query error: ${describeDatabaseError(error)}`);
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
      dbError_log(`Database health check failed: ${describeDatabaseError(error)}`);
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
      dbError_log(`Error getting database info: ${describeDatabaseError(error)}`);
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
          COUNT(*) as total_failed_attempts,
          COUNT(CASE WHEN timestamp >= datetime('now', '-${recentHours} hours') THEN 1 END) as recent_failures,
          COUNT(DISTINCT ip_address) as unique_ips_with_failures
        FROM audit_logs
        WHERE (LOWER(action) LIKE '%login%' OR target_identifier LIKE '%/auth/login%') AND status != 'SUCCESS'
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
          recentFailures: securityStats?.recent_failures || 0,
          uniqueIpsWithFailures: securityStats?.unique_ips_with_failures || 0
        }
      };

      query_log('Database metrics retrieved successfully');
      return metrics;
    } catch (error) {
      dbError_log(`Error getting database metrics: ${describeDatabaseError(error)}`);
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
          recentFailures: 0,
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

    query_log(`Built WHERE clause with ${conditions ? Object.keys(conditions).length : 0} condition(s), ${params.length} bound parameters omitted`);

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

    query_log(`Built SET clause with ${updateData ? Object.keys(updateData).length : 0} field(s), ${params.length} bound parameters omitted`);

    return { setClause, params };
  }

  /**
   * Execute a database operation with a bounded attempt budget.
   * `attempts` is the TOTAL number of tries, not the number of extra retries:
   * `attempts: 1` means the statement is issued exactly once. Only reads get a
   * budget above 1; a write is never replayed blindly because a previous
   * attempt may already have been applied.
   * @param {Function} operation - Async operation to execute
   * @param {string} errorMessage - Error message prefix
   * @param {Object} options - `{ attempts }` control object
   * @returns {Promise<*>} Operation result
   * @throws {ServiceUnavailableError} When the database state cannot be determined
   */
  async executeWithRetry(operation, errorMessage, options = {}) {
    const maxAttempts = Number.isInteger(options.attempts) ? options.attempts : 3;
    const baseDelay = 100; // 100ms
    let lastError = null;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        query_log(`Database operation attempt ${attempt}/${maxAttempts}`);
        return await operation();
      } catch (error) {
        lastError = error;
        dbError_log(`${errorMessage} (attempt ${attempt}/${maxAttempts}): ${describeDatabaseError(error)}`);

        if (attempt === maxAttempts) {
          break;
        }

        const delay = baseDelay * Math.pow(2, attempt - 1);
        query_log(`Waiting ${delay}ms before retry ${attempt + 1}`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    dbError_log('All database operation attempts failed, raising DB_UNAVAILABLE');
    throw toServiceUnavailable(lastError, errorMessage);
  }
}

function toServiceUnavailable(error, context) {
  if (error instanceof ServiceUnavailableError) {
    return error;
  }
  const cause = error instanceof Error ? error : new Error(String(error));
  return new ServiceUnavailableError(
    `${context}: database dependency unavailable`,
    { cause: cause.message, operation: context }
  );
}
