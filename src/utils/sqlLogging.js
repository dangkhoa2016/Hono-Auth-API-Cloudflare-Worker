/**
 * SQL logging helpers.
 *
 * Dropping bound parameters is not enough to make a query log safe: the query
 * text itself can carry a credential (a literal interpolated into the string, a
 * URL fragment, a value echoed back by the driver) and a driver error message
 * usually repeats whatever it rejected. These helpers reduce a statement to the
 * information that is safe to persist — the operation, the statement count and
 * the bind-parameter count — so a sensitive-data sink never has to decide on its
 * own whether a given string is safe.
 */

const SQL_VERBS = ['select', 'insert', 'update', 'delete', 'upsert', 'replace', 'with', 'begin', 'commit', 'rollback'];

const LEADING_TRIVIA = /^(?:\s|--[^\n]*\n|\/\*[\s\S]*?\*\/\s)*/;

/**
 * Classify a statement by its leading verb.
 * @param {string} query - SQL text
 * @returns {string} Lower-case verb, or `other` when it cannot be determined
 */
function classifyStatement(query) {
  if (typeof query !== 'string') {
    return 'unknown';
  }
  const withoutComments = query.replace(LEADING_TRIVIA, '').trimStart().toLowerCase();
  const verb = withoutComments.split(/[\s(]+/, 1)[0] || '';
  return SQL_VERBS.includes(verb) ? verb : 'other';
}

/**
 * Build a log-safe identifier for a statement.
 * @param {string} query - SQL text (never included in the result)
 * @param {Array} params - Bound parameters
 * @returns {string} e.g. `select, 1 statement, 2 params`
 */
export function describeQuery(query, params = []) {
  const bindCount = Array.isArray(params) ? params.length : 0;
  return `${classifyStatement(query)}, 1 statement, ${bindCount} params`;
}

/**
 * Reduce a database error to a category that is safe to log.
 * D1/Miniflare surface the offending statement inside the error message, so the
 * message is deliberately dropped and only the error class plus a stable
 * category is kept.
 * @param {Error} error - Driver error
 * @returns {string} e.g. `ServiceUnavailableError (db_error)`
 */
export function describeDatabaseError(error) {
  if (!error) {
    return 'unknown error';
  }
  const name = typeof error.name === 'string' && error.name.length > 0 ? error.name : 'Error';
  // Some drivers only set `constructor.name`; prefer whichever is a real class
  // name and never fall back to echoing the message.
  const safeName = /^[A-Za-z_$][A-Za-z0-9_$]{0,63}$/.test(name) ? name : 'Error';
  return `${safeName} (db_error)`;
}
