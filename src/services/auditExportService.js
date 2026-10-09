/**
 * Audit Export Service
 *
 * Two formats are implemented and everything else is refused. The previous
 * version answered `success: true` for Excel, PDF, compression and encryption
 * while returning either a placeholder string or plaintext data, so a caller
 * had no way to tell a working export from a fake one.
 */

import { auditExportService_log } from '../utils/debug.js';
import { csvCell, csvHeaders, renderCsv } from '../utils/csv.js';
import { AUDIT_EXPORT_EFFECTIVE } from '../constants/kvKeys.js';

/** Formats this service can actually produce. */
const SUPPORTED_FORMATS = ['json', 'csv'];

/**
 * Options that were accepted and reported as applied without doing anything.
 * They are refused by name so a client learns the truth instead of storing a
 * file it believes is encrypted.
 */
const UNSUPPORTED_OPTIONS = {
  encrypt: 'encryption is not implemented; the response would be plaintext',
  compress: 'compression is not implemented; the bytes are not compressed',
  compression: 'compression is not implemented; the bytes are not compressed',
  include_charts: 'chart data is only available in the Excel export, which is not implemented',
  multiple_sheets: 'multiple sheets are only available in the Excel export, which is not implemented',
  pivot_tables: 'pivot tables are only available in the Excel export, which is not implemented'
};

/**
 * Record ceiling. A larger request is refused rather than quietly truncated.
 *
 * Sourced from AUDIT_EXPORT_EFFECTIVE so the number enforced here, the number
 * the capabilities route publishes, and the number the settings endpoint
 * reports are one value rather than three that can drift apart.
 */
const MAX_RECORDS = AUDIT_EXPORT_EFFECTIVE.MAX_RECORDS;

/**
 * Columns a caller may group by.
 *
 * Grouping is projected straight into the SQL as an identifier, so the set of
 * legal names has to be written down here rather than derived from whatever
 * arrives. A name that is not in this list is refused, not dropped: quietly
 * grouping by `action` instead of the column that was asked for produces a
 * report that looks right and is not.
 */
const AGGREGATION_GROUP_COLUMNS = [
  'action', 'actor_id', 'actor_email', 'actor_role',
  'target_type', 'target_id', 'ip_address'
];

/**
 * Metrics a caller may request, mapped to the SQL that computes them.
 *
 * The value is the whole expression, alias included, so nothing a caller sends
 * is ever placed in the statement. An earlier version interpolated the metric
 * name as a bare alias, which meant a caller could send
 * `"count, (SELECT ...) AS injected"` and have their expression executed. The
 * allowlist is the fix; the map is why the fix does not need a second one.
 */
const AGGREGATION_METRICS = Object.freeze({
  count: 'COUNT(*) AS count',
  first_occurrence: 'MIN(timestamp) AS first_occurrence',
  last_occurrence: 'MAX(timestamp) AS last_occurrence'
});

const DEFAULT_AGGREGATION_GROUP = ['action'];
const DEFAULT_AGGREGATION_METRICS = ['count'];

/**
 * Time-range units, mapped to the modifier SQLite's `datetime()` understands.
 *
 * `datetime('now', '-7 d')` is NULL, not seven days ago: SQLite only accepts
 * the long spellings, so a one-letter unit produced a filter that matched
 * nothing while the export still reported success.
 */
const TIME_RANGE_UNITS = Object.freeze({ d: 'days', h: 'hours', m: 'minutes' });

/** Matches the shape a time range must have before it is parsed properly. */
const TIME_RANGE_SHAPE = /^(\d+)([dhm])$/;

/**
 * The largest range each unit may name, in that unit.
 *
 * `Number.isSafeInteger` is a property of the number, not of the calendar, and
 * passing it was never enough: `9007199254740991d` is a safe integer, so it was
 * accepted and turned into `-9007199254740991 days`, and SQLite's
 * `datetime('now', ?)` answered NULL for it. Every row then compared against
 * NULL, so the export succeeded with nothing in it - a cutoff the database
 * cannot represent looked exactly like a quiet period.
 *
 * These ceilings are ten years, which is comfortably inside the range SQLite
 * renders, and they are published in `getCapabilities()` so the limit is part of
 * the contract rather than a private surprise. A value above the ceiling is a
 * caller error (400) and is refused before any export row is read.
 */
const TIME_RANGE_MAX = Object.freeze({ d: 3650, h: 87600, m: 5256000 });

/**
 * The shape a value must have to be a *normalised* time range.
 *
 * This is the boundary marker between raw caller input (`7d`) and the internal
 * form (`-7 days`). `export()` normalises once and hands the result to the
 * private builders, and this constant is how those builders tell the two apart:
 * feeding `-7 days` back through `normalizeExportFilters()` is what made a valid
 * `7d` request fail as a server fault, so the mistake is now caught at the
 * boundary it happens at instead of surfacing as `EXPORT_FAILED`/500.
 */
const NORMALIZED_TIME_RANGE_SHAPE = /^-\d+ (days|hours|minutes)$/;

/**
 * Check the cutoff against the database rather than trusting the shape.
 *
 * Pinning a published domain removes the values that are absurd, but it cannot
 * promise that SQLite renders every modifier inside that domain. Asking is one
 * extra statement and it is the only way to guarantee the property that
 * actually matters: a cutoff the store cannot represent never becomes a
 * successful empty export.
 */
const CUTOFF_REPRESENTABLE_SQL = 'SELECT datetime(\'now\', ?) IS NOT NULL AS representable';

/**
 * A request the caller got wrong, as opposed to a fault.
 *
 * The distinction decides the status code, so it cannot be carried by a
 * message string: `export()` turns this into 400 and lets every other failure
 * keep its own classification.
 */
class ExportValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ExportValidationError';
    this.code = 'INVALID_EXPORT_FILTER';
  }
}

export class AuditExportService {
  constructor(env) {
    this.env = env;
    this.db = env.DB;
  }

  /**
   * What this service can do, so a client can hide what it cannot have.
   * @returns {Object} Advertised capabilities
   */
  getCapabilities() {
    return {
      formats: [...SUPPORTED_FORMATS],
      charset: 'utf-8',
      csv_line_ending: 'CRLF',
      csv_formula_guard: true,
      max_records: MAX_RECORDS,
      filters: ['time_range', 'actions', 'users', 'limit'],
      // Published from the same allowlists the query builders read, so a client
      // cannot be told to use a name the service will refuse. `max_records` is
      // the ceiling on rows or groups in the response, not a promise about how
      // many rows were scanned to compute an aggregate.
      max_records_is: 'output_cap',
      aggregation: true,
      aggregation_group_by: [...AGGREGATION_GROUP_COLUMNS],
      aggregation_metrics: Object.keys(AGGREGATION_METRICS),
      aggregation_defaults: {
        group_by: [...DEFAULT_AGGREGATION_GROUP],
        metrics: [...DEFAULT_AGGREGATION_METRICS]
      },
      time_range_units: { ...TIME_RANGE_UNITS },
      // Published so a client learns the ceiling before it sends a value that
      // will be refused, and so the number the service enforces is the number
      // the contract states. See TIME_RANGE_MAX for why the domain is pinned.
      time_range_max: { ...TIME_RANGE_MAX },
      time_range_max_is: 'refused_above',
      time_range_cannot_be_empty: true,
      excel: false,
      pdf: false,
      encryption: false,
      compression: false,
      unsupported_options: { ...UNSUPPORTED_OPTIONS }
    };
  }

  /**
   * Runs an export.
   *
   * Validation happens before the query, so an unsupported request costs
   * nothing and cannot leak rows into a refusal.
   * On success `size` is the byte length of the delivered payload: the JSON
   * document with its metadata, or the CSV text. On failure there is no size,
   * because nothing was produced.
   * @param {Object} request - { format, filters, options, aggregation, requestId }
   * @returns {Promise<Object>} An export result, or an explicit refusal
   */
  async export(request = {}) {
    const { filters = {}, options = {}, aggregation = null, requestId = null } = request;
    const format = String(request.format || 'json').toLowerCase();

    if (!SUPPORTED_FORMATS.includes(format)) {
      return this._refuse(
        'UNSUPPORTED_EXPORT_OPTION',
        422,
        `format "${format}" is not supported; use ${SUPPORTED_FORMATS.join(' or ')}`,
        requestId
      );
    }

    const refused = this._refuseUnsupportedOptions(options, requestId);
    if (refused) {
      return refused;
    }

    let filterError = null;
    let normalizedAggregation = null;
    let normalizedFilters = null;
    try {
      // Both normalisations happen before any query is built. `export()` is the
      // service boundary, so it validates for itself rather than relying on the
      // route to have done it: an internal caller gets the same refusal.
      normalizedAggregation = this.normalizeAggregation(aggregation);
      normalizedFilters = this.normalizeExportFilters(filters);
    } catch (error) {
      filterError = error;
    }
    if (filterError) {
      // A caller error is reported as one whatever raised it, so an internal
      // TypeError cannot masquerade as a server fault, and no part of the
      // rejected value is echoed back.
      const message = filterError instanceof ExportValidationError
        ? filterError.message
        : 'The export filters could not be understood.';
      return this._refuse(filterError.code || 'INVALID_EXPORT_FILTER', 400, message, requestId);
    }

    // Validation is complete, but "valid" is not yet "the database can compute
    // this cutoff". Asking here - after validation, before the export query -
    // is what keeps an unrepresentable window from arriving as a 200 with no
    // rows. It is a caller error, so it is answered as one.
    if (normalizedFilters.time_range) {
      let representable = false;
      try {
        representable = await this._cutoffIsRepresentable(normalizedFilters.time_range);
      } catch (error) {
        // The probe needs the store, so a store that is down is a dependency
        // fault, not a bad filter. It is reported below, in the same shape the
        // export query would have reported it.
        auditExportService_log(`Cutoff check failed for ${format} export: ${error.message}`);
        return this._refuse(
          'DB_UNAVAILABLE',
          503,
          'The audit store is unavailable; no export was produced.',
          requestId
        );
      }
      if (!representable) {
        return this._refuse(
          'INVALID_EXPORT_FILTER',
          400,
          'time_range is outside the range the audit store can represent; narrow it and try again',
          requestId
        );
      }
    }

    try {
      // Normalised exactly once, by the block above. The private builders take
      // the normalised form and never re-parse it: re-normalising `-7 days` was
      // what turned a valid `7d` request into EXPORT_FAILED/500.
      const query = normalizedAggregation
        ? this._buildAggregatedQueryNormalized(normalizedFilters, normalizedAggregation)
        : this._buildQueryNormalized(normalizedFilters);
      const result = await this.db.prepare(query.sql).bind(...query.params).all();
      const rows = result.results || [];

      if (format === 'csv') {
        return normalizedAggregation
          ? this._csvResult(rows, normalizedAggregation, 'audit_aggregated_export', requestId)
          : this._csvResult(rows, null, 'audit_export', requestId);
      }
      return this._jsonResult(rows, normalizedFilters, options, requestId);
    } catch (error) {
      // The driver's message can name tables, paths and queries, so it is
      // logged and never returned.
      auditExportService_log(`Error in ${format} export: ${error.message}`);
      const dependencyDown = /D1_|unavailable|ECONNRESET|ETIMEDOUT|timeout|locked/i.test(error.message || '');
      return {
        success: false,
        error: dependencyDown ? 'DB_UNAVAILABLE' : 'EXPORT_FAILED',
        statusCode: dependencyDown ? 503 : 500,
        message: dependencyDown
          ? 'The audit store is unavailable; no export was produced.'
          : 'The export could not be produced.',
        requestId: requestId || this._newRequestId()
      };
    }
  }

  /**
   * Refuses the first option that has no implementation behind it.
   * @param {Object} options - Requested options
   * @param {string|null} requestId - Request id for the response
   * @returns {Object|null} A refusal, or null when every option is supported
   */
  _refuseUnsupportedOptions(options, requestId) {
    for (const [name, reason] of Object.entries(UNSUPPORTED_OPTIONS)) {
      if (options && options[name]) {
        return this._refuse(
          'UNSUPPORTED_EXPORT_OPTION',
          422,
          `option "${name}" is not supported: ${reason}`,
          requestId
        );
      }
    }
    return null;
  }

  _refuse(error, statusCode, message, requestId) {
    return {
      success: false,
      error,
      statusCode,
      message,
      requestId: requestId || this._newRequestId(),
      // A refusal that names only what was wrong leaves the caller to guess
      // what does work. This is derived from the constant above, so it cannot
      // carry anything the service has not already declared unsupported.
      ...(error === 'UNSUPPORTED_EXPORT_OPTION' ? { availableOptions: this._availableOptions() } : {})
    };
  }

  /**
   * The options a client may actually set, built from the refusal table so the
   * two can never drift apart.
   * @returns {Object} Option name to supported flag, all currently false
   */
  _availableOptions() {
    return Object.fromEntries(Object.keys(UNSUPPORTED_OPTIONS).map((name) => [name, false]));
  }

  _newRequestId() {
    const cryptoApi = globalThis.crypto;
    if (cryptoApi?.randomUUID) {
      return cryptoApi.randomUUID();
    }
    return `export-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  /**
   * Turn one `time_range` into a bound SQLite modifier.
   *
   * The value is checked here and only here, then passed as a parameter. The
   * unit is mapped rather than copied, so the modifier is always one SQLite
   * recognises, and a zero, unrepresentable or out-of-domain range is refused
   * rather than quietly meaning "everything" or nothing.
   * @param {string} value - Raw time range such as `7d`
   * @returns {string} A modifier such as `-7 days`
   * @throws {ExportValidationError} When the value is not a range this service offers
   */
  _timeRangeModifier(value) {
    const match = TIME_RANGE_SHAPE.exec(String(value).trim());
    if (!match) {
      throw new ExportValidationError(
        'time_range must look like 7d, 12h or 30m'
      );
    }
    const amount = Number(match[1]);
    // `0d` passes the shape check but means "no lower bound", which is not a
    // range. Number.isSafeInteger also rejects a digit run too long to be a
    // real offset, but it cannot by itself say the offset is a usable one: see
    // the ceiling below.
    if (!Number.isSafeInteger(amount) || amount < 1) {
      throw new ExportValidationError('time_range must be a positive whole number of days, hours or minutes');
    }
    const unit = TIME_RANGE_UNITS[match[2]];
    if (!unit) {
      throw new ExportValidationError('time_range unit must be one of d, h or m');
    }
    // The published domain, per unit. Past this the answer stops being a
    // window and starts being a number SQLite cannot render.
    const ceiling = TIME_RANGE_MAX[match[2]];
    if (amount > ceiling) {
      throw new ExportValidationError(
        `time_range must be at most ${ceiling} ${unit} (${ceiling} ${match[2]})`
      );
    }
    return `-${amount} ${unit}`;
  }

  /**
   * Ask the store whether it can compute this cutoff.
   *
   * The domain check above is the published policy; this is the fact. A modifier
   * the store renders as NULL is refused with a caller error rather than being
   * allowed to match nothing and report success.
   * @param {string} modifier - A modifier produced by `_timeRangeModifier`
   * @returns {Promise<boolean>} True when `datetime('now', modifier)` is a value
   */
  async _cutoffIsRepresentable(modifier) {
    const row = await this.db
      .prepare(CUTOFF_REPRESENTABLE_SQL)
      .bind(modifier)
      .first();
    return row?.representable === 1 || row?.representable === true;
  }

  /**
   * Validate and canonicalise export filters.
   *
   * Both query builders go through this, so `time_range`, `actions`, `users`
   * and `limit` mean the same thing whichever export is running. The earlier
   * pair read the same fields separately and the aggregated query simply did
   * not read two of them.
   * @param {Object} [rawFilters] - Requested filters
   * @returns {Object} Normalised filters with a decided `limit`
   */
  normalizeExportFilters(rawFilters = {}) {
    if (rawFilters === null || typeof rawFilters !== 'object' || Array.isArray(rawFilters)) {
      throw new ExportValidationError('filters must be an object');
    }

    const normalized = {};

    if (rawFilters.time_range !== undefined && rawFilters.time_range !== null) {
      normalized.time_range = this._timeRangeModifier(rawFilters.time_range);
    }

    for (const key of ['actions', 'users']) {
      const value = rawFilters[key];
      if (value === undefined || value === null) {
        continue;
      }
      if (!Array.isArray(value)) {
        throw new ExportValidationError(`${key} must be an array of strings`);
      }
      // An empty list cannot be turned into an `IN ()` clause, and it must not
      // be read as "no filter" either: a caller who sent `users: []` and gets
      // the whole table back has been handed a report they did not ask for.
      if (value.length === 0) {
        throw new ExportValidationError(`${key} must not be empty; omit it to not filter by ${key}`);
      }
      if (value.some((item) => typeof item !== 'string' || item.length === 0)) {
        throw new ExportValidationError(`${key} must contain only non-empty strings`);
      }
      // Duplicates would only widen the parameter list.
      normalized[key] = [...new Set(value)];
    }

    // `Number()` keeps the numeric-string form the GET query has always
    // accepted. What it must not do is coerce something that is not a number
    // at all: `''`, `null` and `[]` all become 0 and are refused below.
    if (rawFilters.limit !== undefined && rawFilters.limit !== null) {
      const limit = Number(rawFilters.limit);
      if (!Number.isInteger(limit) || limit < 1) {
        throw new ExportValidationError('limit must be a positive whole number');
      }
      if (limit > MAX_RECORDS) {
        throw new ExportValidationError(`limit must be at most ${MAX_RECORDS}`);
      }
      normalized.limit = limit;
    } else {
      normalized.limit = MAX_RECORDS;
    }

    return normalized;
  }

  /**
   * Validate and canonicalise an aggregation request.
   *
   * Returns `null` for "no aggregation", which is a different answer from an
   * aggregation that cannot be understood. The two were previously the same
   * thing, which is how an unusable `group_by` ended up as a report grouped by
   * a column nobody asked for.
   * @param {*} value - Requested aggregation
   * @returns {Object|null} Normalised aggregation, or null when absent
   */
  normalizeAggregation(value) {
    if (value === undefined || value === null) {
      return null;
    }
    if (typeof value !== 'object' || Array.isArray(value)) {
      throw new ExportValidationError('aggregation must be an object');
    }

    const groupBy = this._aggregationNameList(
      value.group_by,
      'group_by',
      AGGREGATION_GROUP_COLUMNS,
      DEFAULT_AGGREGATION_GROUP
    );
    const metrics = this._aggregationNameList(
      value.metrics,
      'metrics',
      Object.keys(AGGREGATION_METRICS),
      DEFAULT_AGGREGATION_METRICS
    );

    return { group_by: groupBy, metrics };
  }

  /**
   * Check one aggregation list against its allowlist.
   * @param {*} value - Requested list
   * @param {string} field - Field name, for the error message
   * @param {Array<string>} allowed - Legal names
   * @param {Array<string>} fallback - Used when the field is absent
   * @returns {Array<string>} The names, in request order, without duplicates
   */
  _aggregationNameList(value, field, allowed, fallback) {
    if (value === undefined || value === null) {
      return [...fallback];
    }
    if (!Array.isArray(value)) {
      throw new ExportValidationError(`${field} must be an array of strings`);
    }
    if (value.length === 0) {
      throw new ExportValidationError(`${field} must name at least one of: ${allowed.join(', ')}`);
    }
    for (const name of value) {
      if (typeof name !== 'string' || !allowed.includes(name)) {
        throw new ExportValidationError(
          `${field} must contain only: ${allowed.join(', ')}`
        );
      }
    }
    // First occurrence wins, so the projection order is the one that was asked
    // for and repeated names cannot produce `COUNT(*) AS count, COUNT(*) AS count`.
    return [...new Set(value)];
  }

  /**
   * The WHERE clause shared by both export queries.
   *
   * One builder, so `users`, `actions`, `time_range` and `limit` cannot mean
   * one thing in a plain export and something else in an aggregated one. Every
   * value is bound; no caller-supplied text is placed in the statement.
   *
   * It takes *normalised* filters. A `time_range` in raw form (`7d`) is
   * refused here rather than being bound into `datetime('now', ?)` where SQLite
   * would answer NULL - so the raw/normalized boundary is enforced at the point
   * where mixing them up is actually harmful, rather than documented in a
   * comment and hoped for.
   * @param {Object} filters - Filters already through `normalizeExportFilters`
   * @returns {Object} SQL fragment and its parameters
   * @throws {ExportValidationError} When the filters are not in normalised form
   */
  buildExportWhere(filters) {
    if (filters && filters.time_range && !NORMALIZED_TIME_RANGE_SHAPE.test(filters.time_range)) {
      throw new ExportValidationError(
        'buildExportWhere() needs filters from normalizeExportFilters(), not raw caller input'
      );
    }

    let sql = '';
    const params = [];

    if (filters.time_range) {
      sql += ' AND julianday(timestamp) >= julianday("now", ?)';
      params.push(filters.time_range);
    }

    for (const [key, column] of [['actions', 'action'], ['users', 'actor_email']]) {
      const values = filters[key];
      if (values) {
        sql += ` AND ${column} IN (${values.map(() => '?').join(',')})`;
        params.push(...values);
      }
    }

    return { sql, params };
  }

  _jsonResult(rows, filters, options, requestId) {
    const payload = {
      metadata: {
        export_type: 'json',
        generated_at: new Date().toISOString(),
        total_records: rows.length,
        filters_applied: filters
      },
      data: rows
    };

    if (options && options.include_metadata) {
      payload.metadata.include_metadata = true;
    }

    return {
      success: true,
      format: 'json',
      data: rows,
      total_records: rows.length,
      metadata: payload.metadata,
      size: Buffer.byteLength(JSON.stringify(payload), 'utf8'),
      requestId: requestId || null
    };
  }

  _csvResult(rows, aggregation, prefix, requestId) {
    const headers = aggregation
      ? [...(aggregation.group_by || ['action']), ...(aggregation.metrics || ['count'])]
      : this._csvHeaders(rows);

    const csv = renderCsv(rows, headers);

    return {
      success: true,
      format: 'csv',
      data: csv,
      total_records: rows.length,
      size: Buffer.byteLength(csv, 'utf8'),
      filename: `${prefix}_${new Date().toISOString().split('T')[0]}.csv`,
      metadata: {
        export_type: 'csv',
        charset: 'utf-8',
        columns: headers,
        total_records: rows.length,
        ...(aggregation ? { aggregation_info: aggregation } : {})
      },
      requestId: requestId || null
    };
  }

  /**
   * Column order, taken from every row rather than the first one.
   *
   * A header list derived from the first row silently truncates whenever that
   * row happens to lack a column the others carry.
   * @param {Array} rows - Result rows
   * @returns {Array} Ordered column names
   */
  _csvHeaders(rows) {
    return csvHeaders(rows);
  }

  /**
   * Renders one CSV field.
   *
   * A leading =, +, - or @ makes a spreadsheet evaluate the cell, so a value
   * beginning with one is prefixed with an apostrophe. Numbers are left alone:
   * a negative measurement is not an attack.
   * @param {*} value - Field value
   * @returns {string} The rendered field
   */
  _csvCell(value) {
    return csvCell(value);
  }

  /**
   * Build SQL query based on filters
   *
   * Normalises the filters itself, so a caller reaching the service directly
   * gets the same validation the route does instead of a differently-behaving
   * query path. This is the raw-input entry point: `export()` does not use it,
   * because it has already normalised and would then be normalised twice.
   * @param {Object} filters - Export filters, as a caller sent them
   * @returns {Object} Query object with SQL and parameters
   * @throws {ExportValidationError} When the filters cannot be understood
   */
  buildQuery(filters) {
    return this._buildQueryNormalized(this.normalizeExportFilters(filters));
  }

  /**
   * The query for a plain export, from already-normalised filters.
   *
   * Private on purpose: the point of the split is that exactly one layer
   * parses caller input. Callers that already normalised use this, or use
   * `buildQuery()` and let it normalise once.
   * @param {Object} normalized - Filters from `normalizeExportFilters`
   * @returns {Object} Query object with SQL and parameters
   */
  _buildQueryNormalized(normalized) {
    const where = this.buildExportWhere(normalized);

    const params = [...where.params, normalized.limit];
    return {
      sql: `SELECT * FROM audit_logs WHERE 1=1${where.sql} ORDER BY timestamp DESC LIMIT ?`,
      params
    };
  }

  /**
   * Build aggregated SQL query
   *
   * Group columns and metrics are looked up in their allowlists, so the only
   * text that reaches the statement is a constant from this file. Filters use
   * the same predicate as a plain export, and `limit` caps the number of
   * result groups - it does not cut the rows the aggregates are computed over,
   * so a count still reflects every matching row in its group.
   *
   * Both arguments are raw, and both are normalised exactly once here.
   * @param {Object} filters - Export filters, as a caller sent them
   * @param {Object} aggregation - Aggregation options, as a caller sent them
   * @returns {Object} Aggregated query object
   * @throws {ExportValidationError} When either argument cannot be understood
   */
  buildAggregatedQuery(filters, aggregation) {
    return this._buildAggregatedQueryNormalized(
      this.normalizeExportFilters(filters),
      this.normalizeAggregation(aggregation)
    );
  }

  /**
   * The aggregated query, from already-normalised filters and aggregation.
   * @param {Object} normalizedFilters - Filters from `normalizeExportFilters`
   * @param {Object|null} normalizedAggregation - Aggregation from `normalizeAggregation`
   * @returns {Object} Aggregated query object
   */
  _buildAggregatedQueryNormalized(normalizedFilters, normalizedAggregation) {
    if (normalizedAggregation === null || normalizedAggregation === undefined) {
      throw new ExportValidationError(
        'the aggregated query needs a normalised aggregation, not null'
      );
    }
    const where = this.buildExportWhere(normalizedFilters);

    const groupBy = normalizedAggregation.group_by;
    const metrics = normalizedAggregation.metrics;

    const projection = [
      ...groupBy,
      ...metrics.map((metric) => AGGREGATION_METRICS[metric])
    ];

    // Ordering by `count` when no count was projected would be a reference to
    // a column that is not in the result, so the sort is chosen from what is
    // actually being selected. The group columns are the tie-break either way,
    // which is what makes the order repeatable for the same data.
    const hasCount = metrics.includes('count');
    const orderBy = hasCount
      ? ['count DESC', ...groupBy.map((column) => `${column} ASC`)]
      : groupBy.map((column) => `${column} ASC`);

    const params = [...where.params, normalizedFilters.limit];

    // `buildExportWhere` returns a fragment that already begins with a space;
    // every other part is separated explicitly so a projection ending in a
    // bare identifier cannot run into the next keyword.
    return {
      sql: [
        `SELECT ${projection.join(', ')} `,
        `FROM audit_logs WHERE 1=1${where.sql} `,
        `GROUP BY ${groupBy.join(', ')} `,
        `ORDER BY ${orderBy.join(', ')} `,
        'LIMIT ?'
      ].join(''),
      params
    };
  }
}
