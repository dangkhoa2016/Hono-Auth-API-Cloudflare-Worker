/**
 * CSV rendering shared by every audit export path.
 *
 * There is one implementation on purpose. When each export service carried its
 * own escaping rules, `/api/audit/export` and `/api/advanced-audit/export-advanced`
 * disagreed about line endings and formula handling, and a fix to one left the
 * other serving the defect.
 */

/** A leading character that makes a spreadsheet evaluate the cell as a formula. */
const FORMULA_PREFIXES = ['=', '+', '-', '@', '\t', '\r'];

/**
 * Column order for a result set.
 *
 * Taken from every row rather than the first one: a header list derived from the
 * first row silently truncates whenever that row lacks a column the others have.
 * @param {Array} rows - Result rows
 * @returns {Array} Ordered column names
 */
export function csvHeaders(rows) {
  const seen = new Set();
  for (const row of rows) {
    for (const key of Object.keys(row || {})) {
      seen.add(key);
    }
  }
  return [...seen];
}

/**
 * Renders one CSV field.
 * @param {*} value - Field value
 * @returns {string} The rendered field
 */
export function csvCell(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'object') {
    return csvCell(JSON.stringify(value));
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    // `value || ''` would have turned 0 and false into blanks.
    return String(value);
  }

  let text = String(value);
  if (FORMULA_PREFIXES.includes(text[0])) {
    text = `'${text}`;
  }
  // A bare \n has to be quoted too: unquoted, a spreadsheet splits the field
  // into two rows and the value silently becomes two different facts.
  if (/[",\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

/**
 * Renders rows as a CSV document.
 * @param {Array} rows - Result rows
 * @param {Array} [headers] - Column order; derived from the rows when omitted
 * @returns {string} The CSV document, CRLF delimited
 */
export function renderCsv(rows, headers) {
  const list = Array.isArray(rows) ? rows : [];
  const columns = Array.isArray(headers) && headers.length > 0 ? headers : csvHeaders(list);

  if (list.length === 0) {
    return '';
  }

  const lines = [columns.map((column) => csvCell(column)).join(',')];
  for (const row of list) {
    lines.push(columns.map((column) => csvCell(row?.[column])).join(','));
  }

  // RFC 4180 line endings: a single \n is ambiguous for a spreadsheet that opens
  // the file with the CRLF convention.
  return lines.join('\r\n');
}
