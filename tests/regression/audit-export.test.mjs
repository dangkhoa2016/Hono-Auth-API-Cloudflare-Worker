/**
 * T7 / B09 - the export service must not claim more than it does.
 *
 * The three claims under test: a format is real, an option is applied, and a
 * failure is a failure. Each one was previously a success response that a
 * caller could not distinguish from a working export.
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { startD1 } from './helpers/d1-local.mjs';
import { AuditExportService } from '../../src/services/auditExportService.js';
import { AUDIT_EXPORT_EFFECTIVE } from '../../src/constants/kvKeys.js';

let d1Promise;
let env;

test.before(async () => {
  const d1 = await startD1();
  d1Promise = Promise.resolve(d1);
  env = { DB: d1.db };
});

test.after(async () => {
  const d1 = await d1Promise;
  if (d1) {
    await d1.dispose();
  }
});

/**
 * Rows for this suite only. The migrations seed audit_logs of their own, so the
 * fixtures are namespaced and every export in these tests is filtered to them;
 * counting the whole table would be counting other people's data.
 */
const FIXTURE_ACTION = 'b09_fixture_login';

async function seedLogs() {
  const d1 = await d1Promise;
  // Each test owns its fixtures: the previous test's rows would otherwise be
  // counted here.
  await d1.db
    .prepare('DELETE FROM audit_logs WHERE action LIKE ?')
    .bind(`${FIXTURE_ACTION}%`)
    .run();
  const rows = [
    [`${FIXTURE_ACTION}_ok`, 'user', 'SUCCESS', 'a@example.test', '2026-09-20T10:00:00.000Z'],
    [`${FIXTURE_ACTION}_failed`, 'user', 'FAILURE', 'b@example.test', '2026-09-20T11:00:00.000Z'],
    [`${FIXTURE_ACTION}_admin`, 'admin', 'SUCCESS', 'c@example.test', '2026-09-20T12:00:00.000Z']
  ];
  for (const row of rows) {
    await d1.db
      .prepare(
        `INSERT INTO audit_logs (action, actor_role, status, actor_email, timestamp)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind(...row)
      .run();
  }
  return rows.length;
}


/**
 * Minimal RFC 4180 reader, so the assertions look at cells rather than at
 * comma-split fragments of a row.
 * @param {string} csv - The document
 * @returns {Array} Rows of cells
 */
function parseCsv(csv) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let i = 0; i < csv.length; i += 1) {
    const char = csv[i];

    if (inQuotes) {
      if (char === '"') {
        if (csv[i + 1] === '"') {
          cell += '"';
          i += 1;
        } else {
          inQuotes = false;
        }
      } else {
        cell += char;
      }
      continue;
    }

    if (char === '"') {
      inQuotes = true;
    } else if (char === ',') {
      row.push(cell);
      cell = '';
    } else if (char === '\r' && csv[i + 1] === '\n') {
      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      i += 1;
    } else {
      cell += char;
    }
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }
  return rows;
}

function headerIndex(csv, column) {
  return parseCsv(csv)[0].indexOf(column);
}

function cellOf(csv, rowIndex, column) {
  const [header, ...body] = parseCsv(csv);
  const at = header.indexOf(column);
  return { header, value: body[rowIndex][at], found: at !== -1 };
}

const FIXTURE_ACTIONS = [
  `${FIXTURE_ACTION}_ok`,
  `${FIXTURE_ACTION}_failed`,
  `${FIXTURE_ACTION}_admin`
];

function service() {
  return new AuditExportService(env);
}

// ---------------------------------------------------------------------------
// A format that is not implemented must be refused, not faked
// ---------------------------------------------------------------------------

test('B09: the format list only advertises formats that produce real bytes', async () => {
  const capabilities = service().getCapabilities();

  assert.deepEqual(
    [...capabilities.formats].sort(),
    ['csv', 'json'],
    'only the two formats that emit real content may be advertised'
  );
  assert.equal(capabilities.excel, false, 'Excel is not implemented and must not be advertised');
  assert.equal(capabilities.pdf, false, 'PDF is not implemented and must not be advertised');
  assert.equal(capabilities.encryption, false, 'no encryption is implemented and must not be advertised');
  assert.equal(capabilities.compression, false, 'no compression is implemented and must not be advertised');
});

test('B09: asking for Excel is refused rather than answered with a string', async () => {
  const result = await service().export({ format: 'excel' });

  assert.equal(result.success, false);
  assert.equal(result.error, 'UNSUPPORTED_EXPORT_OPTION');
  assert.equal(result.statusCode, 422);
  assert.equal(result.data, undefined, 'no data is handed back at all');
  assert.match(result.message, /excel/i, 'the refusal names the option that was refused');
  assert.match(result.message, /json|csv/i, 'and says what is available instead');
});

test('B09: asking for PDF is refused', async () => {
  const result = await service().export({ format: 'pdf' });

  assert.equal(result.success, false);
  assert.equal(result.error, 'UNSUPPORTED_EXPORT_OPTION');
  assert.equal(result.statusCode, 422);
});

test('B09: an unknown format is refused and is not guessed at', async () => {
  const result = await service().export({ format: 'sqlite' });

  assert.equal(result.success, false);
  assert.equal(result.error, 'UNSUPPORTED_EXPORT_OPTION');
  assert.equal(result.statusCode, 422);
  assert.equal(result.data, undefined);
});

// ---------------------------------------------------------------------------
// An option that is not applied must not be reported as applied
// ---------------------------------------------------------------------------

test('B09: encryption is refused, and no plaintext is returned wearing an encrypted label', async () => {
  const result = await service().export({ format: 'json', options: { encrypt: true } });

  assert.equal(result.success, false, 'an option that does nothing cannot be accepted');
  assert.equal(result.error, 'UNSUPPORTED_EXPORT_OPTION');
  assert.equal(result.statusCode, 422);

  const serialised = JSON.stringify(result);
  assert.doesNotMatch(serialised, /"encrypted":\s*true/, 'nothing may claim to be encrypted');
  assert.doesNotMatch(serialised, /AES/i, 'and no algorithm may be named');
  assert.doesNotMatch(serialised, /example\.test/, 'no audit content leaks into a refusal');
});

test('B09: compression is refused rather than reported with an invented ratio', async () => {
  const result = await service().export({ format: 'json', options: { compress: true } });

  assert.equal(result.success, false);
  assert.equal(result.error, 'UNSUPPORTED_EXPORT_OPTION');
  assert.doesNotMatch(JSON.stringify(result), /compression_ratio/i);
});

// ---------------------------------------------------------------------------
// A failure is a failure
// ---------------------------------------------------------------------------

test('B09: a database failure is reported as a failure, not as an empty export', async () => {
  const broken = { DB: { prepare: () => { throw new Error('D1 unavailable'); } } };
  const result = await new AuditExportService(broken).export({ format: 'json' });

  assert.equal(result.success, false, 'an export that ran no query is not a successful empty export');
  assert.notEqual(result.statusCode, 200);
  assert.equal(result.data, undefined);
  assert.equal(result.total_records, undefined);
  assert.doesNotMatch(JSON.stringify(result), /"success":\s*true/);
});

test('B09: a failure carries a request id and no database internals', async () => {
  const broken = { DB: { prepare: () => { throw new Error('D1_ERROR: no such table: audit_logs_secret at /srv/app/private/x.sql line 9'); } } };
  const result = await new AuditExportService(broken).export({ format: 'csv' });

  assert.equal(result.success, false);
  assert.ok(result.requestId, 'a caller can quote this in a support request');
  assert.doesNotMatch(JSON.stringify(result), /no such table/, 'the raw driver message is not echoed back');
  assert.doesNotMatch(JSON.stringify(result), /\/srv\/app/, 'nor is a filesystem path');
});

test('B09: an ordinary failure is sanitised too, not just an outage', async () => {
  // A different branch from the dependency case, with a message that names an
  // internal path. Neither shape may reach the client.
  const broken = {
    DB: {
      prepare: () => {
        throw new Error('near "SECRET": syntax error in /srv/app/queries/export.sql');
      }
    }
  };
  const result = await new AuditExportService(broken).export({ format: 'json' });

  assert.equal(result.success, false);
  assert.equal(result.statusCode, 500, 'an unexpected failure is a 500, not an outage');
  assert.equal(result.error, 'EXPORT_FAILED');
  assert.doesNotMatch(JSON.stringify(result), /\/srv\/app/, 'no path is echoed');
  assert.doesNotMatch(JSON.stringify(result), /SECRET/, 'no identifier is echoed');
  assert.equal(result.message, 'The export could not be produced.');
});

test('B09: every refusal carries a request id', async () => {
  for (const request of [
    { format: 'excel' },
    { format: 'pdf' },
    { format: 'json', options: { encrypt: true } },
    { format: 'json', options: { compress: true } },
    { format: 'json', filters: { limit: 99999 } }
  ]) {
    const result = await service().export(request);
    assert.equal(result.success, false, `${JSON.stringify(request)} is refused`);
    assert.ok(
      typeof result.requestId === 'string' && result.requestId.length > 0,
      `a refusal of ${JSON.stringify(request)} must carry a request id`
    );
  }
});

test('B09: a caller-supplied request id is the one that comes back', async () => {
  const result = await service().export({ format: 'excel', requestId: 'trace-abc-123' });
  assert.equal(result.requestId, 'trace-abc-123', 'a caller correlating its own logs keeps its id');
});

// ---------------------------------------------------------------------------
// A real export really contains the data
// ---------------------------------------------------------------------------

test('B09: a JSON export carries the rows it selected', async () => {
  await seedLogs();
  const result = await service().export({ format: 'json', filters: { actions: FIXTURE_ACTIONS } });

  assert.equal(result.success, true);
  assert.equal(result.total_records, 3);
  assert.equal(result.data.length, 3);

  const actions = result.data.map((row) => row.action).sort();
  assert.deepEqual(actions, [`${FIXTURE_ACTION}_admin`, `${FIXTURE_ACTION}_failed`, `${FIXTURE_ACTION}_ok`]);
  // size describes the bytes actually delivered, metadata included, and counts
  // bytes rather than characters.
  const delivered = { metadata: result.metadata, data: result.data };
  assert.equal(
    result.size,
    Buffer.byteLength(JSON.stringify(delivered), 'utf8'),
    'size must count the delivered bytes, not characters'
  );
});

test('B09: a CSV export has a header row and one line per record', async () => {
  await seedLogs();
  const result = await service().export({ format: 'csv', filters: { actions: FIXTURE_ACTIONS } });

  assert.equal(result.success, true);
  const lines = result.data.split('\n');
  assert.ok(lines[0].startsWith('id,'), 'the header names the columns');
  assert.equal(lines.length, 4, 'a header plus three records');
  for (const line of lines) {
    assert.equal(line.includes('a@example.test') || line.includes('b@example.test') || line.includes('c@example.test') || !line.includes('@'), true);
  }
  assert.equal(result.total_records, 3);
});

test('B09: an export that genuinely matched nothing is a success with no rows', async () => {
  const result = await service().export({ format: 'json', filters: { actions: ['nothing_matches_this'] } });

  assert.equal(result.success, true, 'an empty result is a legitimate answer');
  assert.equal(result.total_records, 0);
  assert.deepEqual(result.data, []);
});

test('B09: an empty result is distinguishable from a failure', async () => {
  const empty = await service().export({ format: 'json', filters: { actions: ['nothing_matches_this'] } });
  const broken = await new AuditExportService({ DB: { prepare: () => { throw new Error('down'); } } })
    .export({ format: 'json' });

  assert.equal(empty.success, true);
  assert.equal(broken.success, false);
  assert.notEqual(empty.error, broken.error);
});

// ---------------------------------------------------------------------------
// CSV safety
// ---------------------------------------------------------------------------

test('B09: a value containing a delimiter, a quote or a newline stays one field', async () => {
  const d1 = await d1Promise;
  await d1.db
    .prepare('DELETE FROM audit_logs WHERE action LIKE ?')
    .bind('b09_csv%')
    .run();
  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, status, details, timestamp)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind('b09_csv_hostile', 'user', 'SUCCESS', 'a,b "quoted"\nsecond line', '2026-09-20T10:00:00.000Z')
    .run();

  const result = await service().export({ format: 'csv', filters: { actions: ['b09_csv_hostile'] } });

  assert.equal(result.success, true);
  const dataLine = result.data.split('\r\n')[1];
  assert.match(dataLine, /"a,b ""quoted""\nsecond line"/, 'the commas, quotes and newline are escaped as one field');
});

test('B09: a value containing only a newline still stays one field', async () => {
  const d1 = await d1Promise;
  await d1.db
    .prepare('DELETE FROM audit_logs WHERE action LIKE ?')
    .bind('b09_newline%')
    .run();
  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, status, error_message, timestamp)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind('b09_newline_row', 'user', 'FAILURE', 'first line\nsecond line', '2026-09-20T10:00:00.000Z')
    .run();

  const result = await service().export({ format: 'csv', filters: { actions: ['b09_newline_row'] } });

  // No comma, no quote, no carriage return: only the bare \n would split this
  // if it were not quoted. Asserted on the raw text rather than by reading the
  // document back, because a forgiving reader hides exactly this defect - it
  // joins the two halves again and reports one intact row.
  const rawRow = result.data.split('\r\n')[1];
  assert.ok(
    rawRow.includes('"first line\nsecond line"'),
    `the field must be quoted, got ${JSON.stringify(rawRow)}`
  );
  assert.equal(cellOf(result.data, 0, 'error_message').value, 'first line\nsecond line');
  assert.equal(result.data.split('\r\n').length, 2, 'and the document still has one record');
});

test('B09: a value a spreadsheet would evaluate is neutralised', async () => {
  const d1 = await d1Promise;
  await d1.db
    .prepare('DELETE FROM audit_logs WHERE action LIKE ?')
    .bind('b09_formula%')
    .run();
  const payloads = ['=1+1', '+cmd', '-2+3', '@SUM(A1)'];
  for (const payload of payloads) {
    await d1.db
      .prepare(
        `INSERT INTO audit_logs (action, actor_role, status, details, timestamp)
         VALUES (?, ?, ?, ?, ?)`
      )
      .bind('b09_formula_row', 'user', 'SUCCESS', payload, '2026-09-20T10:00:00.000Z')
      .run();
  }

  const result = await service().export({ format: 'csv', filters: { actions: ['b09_formula_row'] } });

  // Ordered by timestamp, and every fixture shares one, so the rows are matched
  // by value rather than by position.
  const cells = parseCsv(result.data).slice(1).map((row) => row[headerIndex(result.data, 'details')]);
  assert.equal(cells.length, payloads.length);
  for (const payload of payloads) {
    assert.ok(
      cells.includes(`'${payload}`),
      `a cell beginning with =, +, - or @ must be neutralised, got ${JSON.stringify(cells)}`
    );
  }
  for (const cell of cells) {
    assert.ok(cell.startsWith('\''), `every formula cell is guarded, got ${cell}`);
  }
});

test('B09: a zero and a false are written, not blanked', () => {
  const exporter = service();

  // Asserted on the renderer because this schema cannot hold a stored zero:
  // actor_id is a foreign key, so 0 is unreachable in a row. The old renderer
  // used `value || ''`, which turns 0 and false into blank cells.
  assert.equal(exporter._csvCell(0), '0', 'a zero count is a value, not an absence');
  assert.equal(exporter._csvCell(false), 'false');
  assert.equal(exporter._csvCell(null), '', 'null is an absence and is written as an empty cell');
  assert.equal(exporter._csvCell(undefined), '');
  assert.equal(exporter._csvCell(''), '');
  assert.equal(exporter._csvCell('plain'), 'plain');
});

test('B09: size counts bytes, so non-ASCII text is not undercounted', async () => {
  const d1 = await d1Promise;
  await d1.db
    .prepare('DELETE FROM audit_logs WHERE action LIKE ?')
    .bind('b09_utf8%')
    .run();
  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, user_agent, status, timestamp)
       VALUES (?, ?, ?, ?, ?)`
    )
    .bind('b09_utf8_row', 'user', 'Mozilla/5.0 (Nguyễn Thị Ánh)', 'SUCCESS', '2026-09-20T10:00:00.000Z')
    .run();

  const result = await service().export({ format: 'csv', filters: { actions: ['b09_utf8_row'] } });

  // Each of those characters is three bytes. Counting characters would report a
  // size a third smaller than the file the client actually writes.
  assert.ok(
    result.size > result.data.length,
    `byte length must exceed character length for non-ASCII, got ${result.size} vs ${result.data.length}`
  );
  assert.equal(result.size, Buffer.byteLength(result.data, 'utf8'));
  assert.equal(cellOf(result.data, 0, 'user_agent').value, 'Mozilla/5.0 (Nguyễn Thị Ánh)');
});

test('B09: a real row keeps every column aligned', async () => {
  const d1 = await d1Promise;
  await d1.db
    .prepare('DELETE FROM audit_logs WHERE action LIKE ?')
    .bind('b09_align%')
    .run();
  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, actor_email, status, details, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind('b09_align_row', 'user', 'a@example.test', 'SUCCESS', null, '2026-09-20T10:00:00.000Z')
    .run();

  const result = await service().export({ format: 'csv', filters: { actions: ['b09_align_row'] } });
  const rows = parseCsv(result.data);

  // Every row has the same width, including the one with a null column.
  for (const row of rows) {
    assert.equal(row.length, rows[0].length, 'a null value must not shorten a row');
  }
  assert.equal(rows.length, 2, 'a header and one record');
  assert.equal(cellOf(result.data, 0, 'details').value, '', 'the null column is empty, and the rest still lines up');
  assert.equal(cellOf(result.data, 0, 'actor_email').value, 'a@example.test');
});

test('B09: a limit past the ceiling is refused rather than truncated', async () => {
  const result = await service().export({ format: 'json', filters: { limit: 50000 } });

  assert.equal(result.success, false);
  assert.equal(result.error, 'INVALID_EXPORT_FILTER');
  assert.equal(result.statusCode, 400);
  assert.match(result.message, /10000/);
});

test('B09: a malformed time range is refused before any query runs', async () => {
  const exploding = {
    DB: {
      prepare: () => {
        throw new Error('the query should never have been built');
      }
    }
  };
  const result = await new AuditExportService(exploding).export({ format: 'json', filters: { time_range: 'soon' } });

  assert.equal(result.success, false);
  assert.equal(result.error, 'INVALID_EXPORT_FILTER');
  assert.equal(result.statusCode, 400);
});

test('B09: an aggregation export groups and counts', async () => {
  const result = await service().export({
    format: 'csv',
    filters: { actions: FIXTURE_ACTIONS },
    aggregation: { group_by: ['action'], metrics: ['count'] }
  });

  assert.equal(result.success, true);
  const lines = result.data.split('\r\n');
  assert.equal(lines[0], 'action,count');
  for (const line of lines.slice(1)) {
    assert.match(line, /^b09_fixture_login_\w+,1$/, 'each fixture action appears once with a count of 1');
  }
});

// ---------------------------------------------------------------------------
// B09 again, from the other side: `/api/audit/export` is a different service and
// a different code path. It shipped its own format switch and its own CSV
// escaping, so fixing only the advanced route left the overclaim in place.
// ---------------------------------------------------------------------------

test('B09: GET /api/audit/export refuses a format it cannot produce', async () => {
  const d1 = await d1Promise;
  const { AuditLogService } = await import('../../src/services/auditLogService.js');
  const service = new AuditLogService({ DB: d1.db });

  // `excel` was the documented default in AUDIT_EXPORT_ALLOWED_FORMATS. The
  // route had no writer for it: the switch fell through to its `json` arm and
  // served a JSON body under a `.excel` filename.
  const result = await service.exportLogs({ format: 'excel' }, { id: 1, role: 'admin' });

  assert.equal(result.success, false);
  assert.equal(result.statusCode, 422);
  assert.equal(result.error, 'UNSUPPORTED_EXPORT_OPTION');
  assert.deepEqual(result.supported_formats, ['json', 'csv']);
  assert.doesNotMatch(JSON.stringify(result), /\.xlsx?/, 'nothing is offered as Excel');
  assert.ok(result.message.includes('excel'), 'the caller is told which format was rejected');
});

test('B09: GET /api/audit/export still produces both formats it does support', async () => {
  const d1 = await d1Promise;
  const { AuditLogService } = await import('../../src/services/auditLogService.js');
  const service = new AuditLogService({ DB: d1.db });

  for (const format of ['csv', 'json']) {
    const result = await service.exportLogs({ format, maxRecords: 5 }, { id: 1, role: 'admin' });
    assert.equal(result.success, true, `${format} is supported`);
    assert.equal(result.data.format, format);
    assert.ok(typeof result.data.content === 'string');
  }
});

test('B09: GET /api/audit/export escapes CSV the same way as the advanced route', async () => {
  const d1 = await d1Promise;
  await d1.db.prepare('DELETE FROM audit_logs WHERE action LIKE ?').bind('b09_audit%').run();
  await d1.db
    .prepare(
      `INSERT INTO audit_logs (action, actor_role, target_identifier, status, error_message, timestamp)
       VALUES (?, ?, ?, ?, ?, ?)`
    )
    .bind('b09_audit_row', 'user', '=cmd|calc', 'FAILURE', 'comma, quote " and\nnewline', '2026-09-20T10:00:00.000Z')
    .run();

  const { AuditLogService } = await import('../../src/services/auditLogService.js');
  // Filtered by action: the fixture only holds the most recent N rows, so an
  // unfiltered export would pass on the neighbouring tests' data instead.
  const result = await new AuditLogService({ DB: d1.db })
    .exportLogs(
      { format: 'csv', includeDetails: true, maxRecords: 5, action: 'b09_audit_row' },
      { id: 1, role: 'admin' }
    );

  const content = result.data.content;
  assert.ok(content.includes('b09_audit_row'), `the fixture row was exported: ${JSON.stringify(content.slice(0, 200))}`);
  assert.ok(content.includes('"comma, quote "" and\nnewline"'), `CRLF/escape defect: ${JSON.stringify(content)}`);
  assert.ok(content.includes('\'=cmd|calc'), 'a formula is neutralised here too');
  assert.ok(
    content.split('\r\n').every((line) => !line.startsWith('=cmd')),
    'no line starts with a bare ='
  );
});

test('B09: the export settings no longer advertise a capability that does not exist', async () => {
  // KVConfigService reads env.CONFIG_KV, so this needs the fake binding rather
  // than a null env.
  const { createTestEnv } = await import('./helpers/local-env.mjs');
  const { createKvConfigService } = await import('../../src/utils/serviceFactory.js');
  const settings = await createKvConfigService(createTestEnv()).getExportSettings();

  assert.deepEqual(settings.allowedFormats, ['json', 'csv'], 'excel is not offered');
  assert.equal(settings.compressionEnabled, false, 'compression is not offered');
  assert.equal(settings.allowedFormats.includes('excel'), false);
});

test('BT6-03/B09: the settings endpoint reports the limits the export path enforces', async () => {
  const { createTestEnv } = await import('./helpers/local-env.mjs');
  const { createKvConfigService } = await import('../../src/utils/serviceFactory.js');
  const settings = await createKvConfigService(createTestEnv()).getExportSettings();
  const capabilities = service().getCapabilities();

  // A settings screen that reads 120000 here and 5000 there cannot be used to
  // reason about an export, and the operator cannot tell which one is real.
  assert.equal(
    settings.maxRecords,
    capabilities.max_records,
    'the published record ceiling must be the one the service refuses to exceed'
  );
  assert.equal(settings.timeoutMs, AUDIT_EXPORT_EFFECTIVE.TIMEOUT_MS, 'the published timeout is the one the route waits');
  assert.equal(
    settings.storedSettings.applied,
    false,
    'the stored keys are reported for what they are: not enforced'
  );
  assert.notEqual(
    settings.storedSettings.timeoutMs,
    settings.timeoutMs,
    'precondition: the stored key and the enforced value genuinely differ, so this test has teeth'
  );
});

test('BT6-03/B09: a stored export limit is not mistaken for one that applies', async () => {
  const { createTestEnv } = await import('./helpers/local-env.mjs');
  const { createKvConfigService } = await import('../../src/utils/serviceFactory.js');

  // Write a limit the operator would expect to widen the export.
  const configured = createTestEnv();
  const kvConfig = createKvConfigService(configured);
  await kvConfig.set('AUDIT_EXPORT_MAX_RECORDS', 50000);
  await kvConfig.set('AUDIT_EXPORT_TIMEOUT_MS', 300000);

  const settings = await createKvConfigService(configured).getExportSettings();
  assert.equal(
    settings.storedSettings.maxRecords,
    50000,
    'what the operator set is still readable back'
  );
  assert.equal(
    settings.maxRecords,
    AUDIT_EXPORT_EFFECTIVE.MAX_RECORDS,
    'but the advertised ceiling stays the enforced one rather than the stored one'
  );

  // And the service still refuses past the enforced ceiling, not the stored one.
  const overStoredCeiling = AUDIT_EXPORT_EFFECTIVE.MAX_RECORDS + 1;
  const result = await service().export({ format: 'json', filters: { limit: overStoredCeiling } });
  assert.equal(result.success, false, 'a limit past the enforced ceiling is still refused');
  assert.equal(result.statusCode, 400);
});

test('B09: the shared CSV renderer is what both export services use', async () => {
  const { renderCsv } = await import('../../src/utils/csv.js');
  const rows = [
    { a: 'plain', b: 0, c: false },
    { a: 'has,comma', b: -1, c: true }
  ];
  const csv = renderCsv(rows);

  assert.equal(csv, 'a,b,c\r\nplain,0,false\r\n"has,comma",-1,true');
  assert.equal(renderCsv([]), '');
});

// ---------------------------------------------------------------------------
// The same refusals, over HTTP. A service test cannot see the status code a
// route actually sends, so both mutations below survived until this existed.
// ---------------------------------------------------------------------------

test('B09: the route answers 422 for a format it cannot produce', async () => {
  const d1 = await d1Promise;
  const { Hono } = await import('hono');
  const { createTestEnv, initTestI18n, FAKE_SECRETS } = await import('./helpers/local-env.mjs');
  const auditRoutes = (await import('../../src/routes/audit.js')).default;

  await initTestI18n();
  const env = createTestEnv({ DB: d1.db });
  const { TokenService } = await import('../../src/services/tokenService.js');
  const jwtConfig = await new TokenService(env).getJwtConfig();
  const { createTokenPayload, signToken } = await import('../../src/utils/jwt.js');
  const payload = await createTokenPayload(
    {
      sub: 'user:1',
      iss: jwtConfig.issuer,
      aud: Array.isArray(jwtConfig.audience) ? jwtConfig.audience[0] : jwtConfig.audience,
      user_id: 1,
      full_name: 'Root',
      email: 'root@example.invalid',
      role: 'super_admin',
      auth_version: 1,
      jti: 'jti-b09-export-fixture',
      scope: 'user:basic'
    },
    'access',
    env
  );
  const token = await signToken(payload, FAKE_SECRETS.JWT_SECRET);

  await d1.db
    .prepare('UPDATE users SET role = ?, status = ?, auth_version = 1 WHERE id = 1')
    .bind('super_admin', 'active')
    .run();

  const app = new Hono();
  app.route('/api/audit', auditRoutes);
  const get = (path) => app.request(`http://127.0.0.1/api/audit${path}`, {
    headers: { Authorization: `Bearer ${token}` }
  }, env);

  const refused = await get('/export?format=excel');
  assert.equal(refused.status, 422, 'a format with no writer is the caller\'s mistake');
  const body = await refused.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'UNSUPPORTED_EXPORT_OPTION');
  assert.deepEqual(body.supported_formats, ['json', 'csv']);
  assert.equal(refused.headers.get('Content-Disposition'), null, 'nothing is offered as a download');

  // And a supported format still comes back as a real file.
  const csv = await get('/export?format=csv');
  assert.equal(csv.status, 200);
  assert.equal(csv.headers.get('Content-Type'), 'text/csv');
  assert.match(csv.headers.get('Content-Disposition') || '', /attachment; filename="audit_logs_[\d-]+\.csv"/);
});

// ---------------------------------------------------------------------------
// BT5-01 / BT5-05 - the refusal has to be correlatable, and the advertised
// capability has to exist over HTTP.
//
// The contract promises two things this file could not previously prove: that
// every export error carries a `requestId`, and that
// `GET /api/advanced-audit/capabilities` is the source of truth a UI reads
// before offering an option. The service generated a requestId and threw it
// away on the way out, and the capabilities route was documented but never
// mounted.
// ---------------------------------------------------------------------------

/**
 * Initialise i18n once for the whole file. The routers below translate their
 * error messages, so a request that reaches a handler needs this to have run;
 * re-initialising per test would only repeat work.
 * @returns {Promise<void>} Resolves when i18n is ready
 */
let i18nReady;
function initI18nOnce() {
  i18nReady = i18nReady || (async () => {
    const { initTestI18n } = await import('./helpers/local-env.mjs');
    await initTestI18n();
  })();
  return i18nReady;
}

/**
 * The env the HTTP tests sign tokens with and send requests through.
 *
 * `createTestEnv` supplies the JWT config the auth middleware needs; the bare
 * `{ DB }` used by the service-level tests is enough to reach D1 but not enough
 * to pass authentication, so a request that dies at auth would prove nothing
 * about the export contract.
 * @returns {Promise<Object>} Test env bound to this suite's D1
 */
let httpEnvReady;
function httpEnv() {
  httpEnvReady = httpEnvReady || (async () => {
    const { createTestEnv } = await import('./helpers/local-env.mjs');
    const d1 = await d1Promise;
    return createTestEnv({ DB: d1.db });
  })();
  return httpEnvReady;
}

/**
 * A signed super_admin token for a given user id/role.
 * @param {Object} options - Override the fixture identity
 * @returns {Promise<string>} Bearer token
 */
async function superAdminToken({ userId = 1, role = 'super_admin', jti = 'jti-bt5-export' } = {}) {
  const tokenEnv = await httpEnv();
  const { TokenService } = await import('../../src/services/tokenService.js');
  const jwtConfig = await new TokenService(tokenEnv).getJwtConfig();
  const { createTokenPayload, signToken } = await import('../../src/utils/jwt.js');
  const { FAKE_SECRETS } = await import('./helpers/local-env.mjs');
  const payload = await createTokenPayload(
    {
      sub: `user:${userId}`,
      iss: jwtConfig.issuer,
      aud: Array.isArray(jwtConfig.audience) ? jwtConfig.audience[0] : jwtConfig.audience,
      user_id: userId,
      full_name: 'Root',
      email: 'root@example.invalid',
      role,
      auth_version: 1,
      jti,
      scope: 'user:basic'
    },
    'access',
    tokenEnv
  );
  return signToken(payload, FAKE_SECRETS.JWT_SECRET);
}

/**
 * A signed access token for a specific account.
 *
 * The role in the payload is whatever the caller passes, on purpose: the point
 * of the authorisation tests is to find out which one the server actually
 * trusts, so the fixture must be able to present a role the database
 * disagrees with.
 * @param {number} userId - Account id
 * @param {string} role - Role claim to put in the token
 * @param {string} jti - Token id
 * @returns {Promise<string>} Bearer token
 */
async function tokenFor(userId, role, jti) {
  const tokenEnv = await httpEnv();
  const { TokenService } = await import('../../src/services/tokenService.js');
  const jwtConfig = await new TokenService(tokenEnv).getJwtConfig();
  const { createTokenPayload, signToken } = await import('../../src/utils/jwt.js');
  const { FAKE_SECRETS } = await import('./helpers/local-env.mjs');
  const payload = await createTokenPayload(
    {
      sub: `user:${userId}`,
      iss: jwtConfig.issuer,
      aud: Array.isArray(jwtConfig.audience) ? jwtConfig.audience[0] : jwtConfig.audience,
      user_id: userId,
      full_name: `Fixture ${userId}`,
      email: `fixture-${userId}@example.invalid`,
      role,
      auth_version: 1,
      jti,
      scope: 'user:basic'
    },
    'access',
    tokenEnv
  );
  return signToken(payload, FAKE_SECRETS.JWT_SECRET);
}

/**
 * Mount the audit routers on a bare Hono app and return request helpers.
 *
 * `get`/`post` require a token. A helper that quietly sent `Bearer undefined`
 * would turn a missing fixture into a 401 that reads like a passing assertion
 * about authorisation, which is the mistake §H.3.1 calls out by name.
 * @returns {Promise<Object>} app plus get/post bound to loopback
 */
async function mountRouters() {
  const { Hono } = await import('hono');
  const routerEnv = await httpEnv();
  const auditRoutes = (await import('../../src/routes/audit.js')).default;
  const advancedRoutes = (await import('../../src/routes/advancedAudit.js')).default;
  const app = new Hono();
  app.route('/api/audit', auditRoutes);
  app.route('/api/advanced-audit', advancedRoutes);
  const send = (path, init = {}) => app.request(`http://127.0.0.1${path}`, init, routerEnv);
  const bearer = (token, where) => {
    if (typeof token !== 'string' || token.length === 0) {
      throw new Error(
        `test fixture error: ${where} needs a signed bearer token, got ${typeof token}. ` +
        'A missing token would otherwise surface as a 401 that looks like a passing authorisation assertion.'
      );
    }
    return `Bearer ${token}`;
  };
  return {
    app,
    send,
    get: (path, token) => send(path, { headers: { Authorization: bearer(token, `GET ${path}`) } }),
    post: (path, token, body) => send(path, {
      method: 'POST',
      headers: { Authorization: bearer(token, `POST ${path}`), 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
  };
}

test('BT5-01: a refused export carries a non-empty requestId', async () => {
  await initI18nOnce();
  const d1 = await d1Promise;
  await d1.db
    .prepare('UPDATE users SET role = ?, status = ?, auth_version = 1 WHERE id = 1')
    .bind('super_admin', 'active')
    .run();

  const token = await superAdminToken();
  const { get } = await mountRouters();

  const refused = await get('/api/audit/export?format=excel', token);
  assert.equal(refused.status, 422);

  const body = await refused.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'UNSUPPORTED_EXPORT_OPTION');
  assert.equal(
    typeof body.requestId,
    'string',
    'an operator cannot quote a correlation id that the body does not carry'
  );
  assert.ok(body.requestId.length > 0, 'an empty requestId is not a correlation id');
  assert.equal(
    refused.headers.get('Content-Disposition'),
    null,
    'a refusal must not arrive dressed as a download'
  );

  // The id in the body is the one the middleware minted for this request, so
  // the header a client already reads and the body agree.
  const headerId = refused.headers.get('X-Request-ID');
  if (headerId) {
    assert.equal(body.requestId, headerId, 'body and header must not name two different requests');
  }
});

test('BT5-01: the advanced export refusal is correlatable the same way', async () => {
  await initI18nOnce();
  const d1 = await d1Promise;
  await d1.db
    .prepare('UPDATE users SET role = ?, status = ?, auth_version = 1 WHERE id = 1')
    .bind('super_admin', 'active')
    .run();

  const token = await superAdminToken();
  const { post } = await mountRouters();

  const refused = await post('/api/advanced-audit/export-advanced', token, { format: 'pdf' });
  assert.equal(refused.status, 422);

  const body = await refused.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'UNSUPPORTED_EXPORT_OPTION');
  assert.equal(typeof body.requestId, 'string');
  assert.ok(body.requestId.length > 0);
});

test('BT5-05: the capabilities route exists and reports only real formats', async () => {
  await initI18nOnce();
  const d1 = await d1Promise;
  await d1.db
    .prepare('UPDATE users SET role = ?, status = ?, auth_version = 1 WHERE id = 1')
    .bind('super_admin', 'active')
    .run();

  const token = await superAdminToken();
  const { get } = await mountRouters();

  const response = await get('/api/advanced-audit/capabilities', token);
  assert.equal(response.status, 200, 'a UI needs this endpoint to hide what the backend cannot do');

  const body = await response.json();
  assert.equal(body.success, true);

  const capabilities = body.data;
  assert.equal(typeof capabilities, 'object');
  assert.notEqual(capabilities, null);
  assert.ok(!Array.isArray(capabilities), 'capabilities is an object, not a list');

  // Exactly the two formats, in exactly the published order, as plain strings.
  //
  // This deliberately does *not* normalise first. An earlier version mapped
  // each entry through `typeof entry === 'string' ? entry : entry.id`, which
  // accepted an array of `{ id, mimeType, ... }` objects -- so changing the
  // writer list to objects would have kept the test green while the shape a
  // client switches on had changed underneath it. The contract publishes
  // `formats: string[]`, so the assertion has to be the string array itself.
  assert.deepEqual(capabilities.formats, ['json', 'csv']);
  for (const format of capabilities.formats) {
    assert.equal(typeof format, 'string', `format entries must be strings, got ${typeof format}`);
  }

  assert.equal(capabilities.excel, false);
  assert.equal(capabilities.pdf, false);
  assert.equal(capabilities.encryption, false);
  assert.equal(capabilities.compression, false);

  // `max_records` is only useful if it is the number the exporter actually
  // enforces, so this is checked as a positive integer and cross-checked
  // against the service that does the enforcing.
  assert.equal(Number.isInteger(capabilities.max_records), true);
  assert.ok(capabilities.max_records > 0);
  const { AuditExportService: ServiceForLimit } = await import('../../src/services/auditExportService.js');
  const limit = new ServiceForLimit({ DB: d1.db }).getCapabilities().max_records;
  assert.equal(
    capabilities.max_records,
    limit,
    'the advertised ceiling must be the ceiling the export path enforces'
  );
});

test('BT6-01: an object-shaped format list would be a contract break, and the shape test says so', async () => {
  // Guards the assertion above against being "helpfully" relaxed later: this is
  // the exact shape change that the removed normalisation used to absorb.
  const mutated = { formats: [{ id: 'json' }, { id: 'csv' }] };
  assert.notDeepEqual(mutated.formats, ['json', 'csv']);
  assert.throws(() => assert.deepEqual(mutated.formats, ['json', 'csv']));
});

test('BT5-05: the capabilities route is not readable by a non super_admin', async () => {
  await initI18nOnce();
  const d1 = await d1Promise;
  await d1.db
    .prepare('UPDATE users SET role = ?, status = ?, auth_version = 1 WHERE id = 1')
    .bind('super_admin', 'active')
    .run();

  const token = await superAdminToken();
  const { get } = await mountRouters();
  const before = await get('/api/advanced-audit/capabilities', token);
  assert.equal(before.status, 200, 'precondition: the super_admin can read it');

  // Real non-admin rows, not tokens that merely claim to be admins. Role is
  // read from the database on every request, so a `user` claim on an account
  // the database calls super_admin is correctly ignored - which would make
  // this assertion pass for the wrong reason.
  const d1User = await d1Promise;
  await d1User.db
    .prepare(
      `INSERT INTO users (id, full_name, email, password, status, role, auth_version)
       VALUES (?, ?, ?, ?, 'active', 'user', 1)
       ON CONFLICT(id) DO UPDATE SET role = 'user', status = 'active', auth_version = 1`
    )
    .bind(4711, 'Plain User', 'plain-user@example.invalid', 'FAKE-PASSWORD-MARKER')
    .run();
  await d1User.db
    .prepare(
      `INSERT INTO users (id, full_name, email, password, status, role, auth_version)
       VALUES (?, ?, ?, ?, 'active', 'admin', 1)
       ON CONFLICT(id) DO UPDATE SET role = 'admin', status = 'active', auth_version = 1`
    )
    .bind(4712, 'Plain Admin', 'plain-admin@example.invalid', 'FAKE-PASSWORD-MARKER')
    .run();

  const userToken = await tokenFor(4711, 'user', 'jti-bt5-capabilities-user');
  const adminToken = await tokenFor(4712, 'admin', 'jti-bt5-capabilities-admin');

  const deniedUser = await get('/api/advanced-audit/capabilities', userToken);
  assert.equal(deniedUser.status, 403, 'capabilities are an administrative read');

  const deniedAdmin = await get('/api/advanced-audit/capabilities', adminToken);
  assert.equal(
    deniedAdmin.status,
    403,
    'admin is not super_admin, even though admin may read other audit data'
  );
});

test('BT6-01: a role in the token does not raise the role the database records', async () => {
  await initI18nOnce();
  const d1 = await d1Promise;
  await d1.db
    .prepare('UPDATE users SET role = ?, status = ?, auth_version = 1 WHERE id = 1')
    .bind('super_admin', 'active')
    .run();

  // The account below is a plain `user` row. The token claims super_admin,
  // which is exactly the shape an attacker would present. If authorisation read
  // the claim, this would answer 200 and hand over the capability list.
  await d1.db
    .prepare(
      `INSERT INTO users (id, full_name, email, password, status, role, auth_version)
       VALUES (?, ?, ?, ?, 'active', 'user', 1)
       ON CONFLICT(id) DO UPDATE SET role = 'user', status = 'active', auth_version = 1`
    )
    .bind(4713, 'Claiming Root', 'claiming-root@example.invalid', 'FAKE-PASSWORD-MARKER')
    .run();

  const forged = await tokenFor(4713, 'super_admin', 'jti-bt6-forged-role');
  const { get } = await mountRouters();

  const response = await get('/api/advanced-audit/capabilities', forged);
  assert.equal(
    response.status,
    403,
    'the signed role claim must not be able to raise the role stored for the account'
  );
});

test('BT6-01: capabilities needs a credential at all', async () => {
  await initI18nOnce();
  const { send } = await mountRouters();

  // Deliberately not `get(...)`: there is no token here, and the helper now
  // refuses to invent a `Bearer undefined`.
  const anonymous = await send('/api/advanced-audit/capabilities');
  assert.equal(
    anonymous.status,
    401,
    'no credential is a missing credential, not a forbidden one'
  );

  const body = await anonymous.json();
  assert.equal(body.success, false);
  assert.ok(!JSON.stringify(body).includes('formats'), 'a refusal must not leak the capability list');
});

test('BT5-05: a refused advanced export says what is actually available', async () => {
  await initI18nOnce();
  const d1 = await d1Promise;
  await d1.db
    .prepare('UPDATE users SET role = ?, status = ?, auth_version = 1 WHERE id = 1')
    .bind('super_admin', 'active')
    .run();

  const token = await superAdminToken();
  const { post } = await mountRouters();

  const refused = await post('/api/advanced-audit/export-advanced', token, {
    format: 'json',
    options: { encrypt: true }
  });
  assert.equal(refused.status, 422);

  const body = await refused.json();
  assert.equal(body.success, false);
  assert.equal(body.code, 'UNSUPPORTED_EXPORT_OPTION');
  assert.equal(typeof body.requestId, 'string');
  assert.ok(body.requestId.length > 0);

  // The refusal names the real options so a client can correct itself without
  // a second round trip.
  const options = body.availableOptions;
  assert.equal(typeof options, 'object', 'the refusal must publish what is usable');
  assert.equal(options.encrypt, false);
  assert.equal(options.compress, false);
  assert.equal(options.compression, false);
});
