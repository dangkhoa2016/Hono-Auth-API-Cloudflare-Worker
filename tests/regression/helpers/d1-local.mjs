/**
 * Real D1 (workerd/SQLite) for tests.
 *
 * The in-process D1 stubs in this suite only prove which SQL string was built.
 * They cannot catch a column that does not exist, a wrong JOIN or a wrong
 * OFFSET. This helper boots Miniflare, applies the real `migrations/*.sql` files
 * and hands back a genuine D1Database binding, so services can be exercised
 * against the same schema production runs on.
 *
 * Everything stays on 127.0.0.1 and in a temporary directory; no remote
 * resource is contacted and no secret is read from the environment.
 */
import { mkdtemp, readFile, readdir, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { fileURLToPath } from 'node:url';

import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

const REPO_ROOT = fileURLToPath(new URL('../../..', import.meta.url));
const MIGRATIONS_DIR = join(REPO_ROOT, 'migrations');

/**
 * Read the migration files in the order D1 applies them.
 * @returns {Promise<Array<{name: string, sql: string}>>} Ordered migrations
 */
async function readMigrations() {
  const entries = await readdir(MIGRATIONS_DIR);
  const files = entries.filter((name) => name.endsWith('.sql')).sort();
  return Promise.all(files.map(async (name) => ({
    name,
    sql: await readFile(join(MIGRATIONS_DIR, name), 'utf8')
  })));
}

// Named so the splitter reads cleanly without fighting the single-quote rule.
const SINGLE_QUOTE = '\'';
const DOUBLE_QUOTE = '"';

/**
 * Split a migration file into individual statements.
 * D1's `exec()` rejects a payload with no statement, so a file that opens with
 * comments cannot be passed whole. Splitting is quote-aware so a `;` inside a
 * string literal or an identifier does not end a statement.
 * @param {string} sql - Migration file contents
 * @returns {string[]} Executable statements, comments removed
 */
export function splitStatements(sql) {
  const statements = [];
  let current = '';
  let inSingle = false;
  let inDouble = false;
  let inLineComment = false;
  let inBlockComment = false;

  for (let i = 0; i < sql.length; i += 1) {
    const char = sql[i];
    const next = sql[i + 1];

    if (inLineComment) {
      if (char === '\n') {
        inLineComment = false;
        current += char;
      }
      continue;
    }
    if (inBlockComment) {
      if (char === '*' && next === '/') {
        inBlockComment = false;
        i += 1;
      }
      continue;
    }
    if (!inSingle && !inDouble) {
      if (char === '-' && next === '-') {
        inLineComment = true;
        i += 1;
        continue;
      }
      if (char === '/' && next === '*') {
        inBlockComment = true;
        i += 1;
        continue;
      }
    }

    current += char;

    if (char === SINGLE_QUOTE && !inDouble) {
      // A doubled quote is an escaped quote, not the end of the literal.
      if (inSingle && next === SINGLE_QUOTE) {
        current += next;
        i += 1;
        continue;
      }
      inSingle = !inSingle;
    } else if (char === DOUBLE_QUOTE && !inSingle) {
      if (inDouble && next === DOUBLE_QUOTE) {
        current += next;
        i += 1;
        continue;
      }
      inDouble = !inDouble;
    }

    if (char === ';' && !inSingle && !inDouble) {
      const statement = current.trim();
      if (statement && statement !== ';') {
        statements.push(statement);
      }
      current = '';
    }
  }

  const tail = current.trim();
  if (tail) {
    statements.push(tail);
  }
  return statements;
}

/**
 * Apply migrations to an already-started database.
 *
 * `startD1` applies everything, which is right for a fresh schema. An upgrade
 * test needs the other order: bring a database up to an older revision, put data
 * in it, then apply the newer migration over the top and check the data. Passing
 * `upTo` stops after the migration whose name starts with that prefix, so the
 * caller controls which revision the database is at before applying the rest.
 *
 * @param {D1Database} db - D1 binding
 * @param {Object} [options] - Options
 * @param {number|string} [options.upTo] - Last revision to apply, inclusive
 * @param {number|string} [options.from] - First revision to apply (exclusive)
 * @returns {Promise<string[]>} Names of the migrations that ran
 */
export async function applyMigrations(db, { upTo, from } = {}) {
  const revision = (value) => {
    const parsed = typeof value === 'number' ? value : Number.parseInt(String(value), 10);
    if (!Number.isInteger(parsed)) {
      throw new TypeError(`migration revision must be a number or a name like '0010', got ${value}`);
    }
    return parsed;
  };
  const last = upTo === undefined ? Number.POSITIVE_INFINITY : revision(upTo);
  const first = from === undefined ? Number.NEGATIVE_INFINITY : revision(from);

  const applied = [];
  for (const migration of await readMigrations()) {
    // The numeric prefix decides the order, not the rest of the file name, so
    // `upTo: 10` includes `0010_add_email_verification.sql`.
    const number = Number.parseInt(migration.name, 10);
    if (number > last || number <= first) {
      continue;
    }
    for (const statement of splitStatements(migration.sql)) {
      try {
        await db.prepare(statement).run();
      } catch (error) {
        throw new Error(
          `migration ${migration.name} failed on real D1: ${error.message}\nstatement: ${statement.slice(0, 200)}`,
          { cause: error }
        );
      }
    }
    applied.push(migration.name);
  }
  return applied;
}

/**
 * Start a real D1 instance with the production schema applied.
 * @param {Object} [options] - Options
 * @param {boolean} [options.migrate] - Apply migrations (default true)
 * @param {string} [options.persist] - Directory for the SQLite file; unique
 *   temporary directory when omitted, so each test file starts clean.
 * @param {boolean} [options.kv] - Also bind a KV namespace as `env.CONFIG_KV`,
 *   the name KVConfigService reads.
 *   Off by default: a test that wants the cache path exercised has to ask for
 *   it, so "the cache was never populated" cannot silently stand in for "the
 *   cache was consulted".
 * @returns {Promise<Object>} Miniflare instance exposing `db`, `kv`, `env` and `dispose`
 */
function kvPersistPath(persistPath) {
  // KV needs its own storage root; sharing the D1 directory would make the two
  // bindings disagree about the persisted path.
  return `${persistPath}-kv`;
}

export async function startD1({ migrate = true, persist, kv = false } = {}) {
  // Without this, every caller that omits `persist` resolves to the same
  // relative storage root ('audit-test-db'), and node:test runs test files in
  // parallel -- so the files opened one SQLite file between them and corrupted
  // each other's rows. That surfaced as an intermittent failure in
  // `audit-archive.d1.test.mjs` and was invisible when the files ran one at a
  // time. Give each instance its own directory unless the caller asked for a
  // specific path.
  const ownTempDir = persist ? null : await mkdtemp(join(tmpdir(), 'd1-local-'));
  const persistPath = persist || ownTempDir;

  const miniflare = new Miniflare(convertV4MiniflareOptions({
    modules: true,
    // The database is only reached through `db`; this stub worker exists because
    // Miniflare requires a script entry point.
    script: 'export default { async fetch() { return new Response("d1-test") } }',
    d1Databases: { DB: persistPath ? `file:${persistPath}` : 'audit-test-db' },
    ...(kv
      ? { kvNamespaces: { CONFIG_KV: kvPersistPath(persistPath) } }
      : {})
  }));

  const db = await miniflare.getD1Database('DB');
  const kvNamespace = kv ? await miniflare.getKVNamespace('CONFIG_KV') : null;

  if (migrate) {
    try {
      await applyMigrations(db);
    } catch (error) {
      await miniflare.dispose();
      throw error;
    }
  }

  return {
    db,
    kv: kvNamespace,
    /** A binding-shaped object the services accept as `env.DB` and `env.CONFIG_KV`. */
    env: { DB: db, ...(kvNamespace ? { CONFIG_KV: kvNamespace } : {}) },
    async dispose() {
      await miniflare.dispose();
      if (ownTempDir) {
        // A directory this call created is this call's to clean up.
        await rm(ownTempDir, { recursive: true, force: true });
        await rm(`${ownTempDir}-kv`, { recursive: true, force: true });
      } else if (persist && !persist.startsWith('/tmp')) {
        await rm(persist, { recursive: true, force: true });
        await rm(`${persist}-kv`, { recursive: true, force: true });
      }
    }
  };
}

/**
 * Assert a table actually has a column, so a schema/default mismatch is reported
 * as a readable failure instead of a raw SQLite error deep in a service.
 * @param {Object} db - D1 binding
 * @param {string} table - Table name
 * @param {string} column - Expected column
 * @returns {Promise<void>} Resolves when the column exists
 */
export async function assertColumnExists(db, table, column) {
  const { results } = await db.prepare(`PRAGMA table_info(${table})`).all();
  const columns = results.map((row) => row.name);
  if (!columns.includes(column)) {
    throw new Error(`${table} has no column ${column}; real columns: ${columns.join(', ')}`);
  }
}

/**
 * List the real column names of a table.
 * @param {Object} db - D1 binding
 * @param {string} table - Table name
 * @returns {Promise<string[]>} Column names
 */
export async function tableColumns(db, table) {
  const { results } = await db.prepare(`PRAGMA table_info(${table})`).all();
  return results.map((row) => row.name);
}

/**
 * Record every statement a service executes against the real database, along
 * with the parameters it was bound with, while still letting the statement run.
 * Used to assert LIMIT/OFFSET and ORDER BY on a live database instead of on a
 * captured string.
 * @param {Object} db - D1 binding
 * @returns {Object} Proxy binding with `statements`, `boundPairs` and the same API
 */
export function traceStatements(db) {
  const statements = [];
  const boundPairs = new Map();

  const record = (sql, params) => {
    statements.push(sql.replace(/\s+/g, ' ').trim());
    if (params && params.length) {
      boundPairs.set(sql.replace(/\s+/g, ' ').trim(), params.map((value) => (
        typeof value === 'bigint' ? Number(value) : value
      )));
    }
  };

  // Chains the real `.bind()` calls so the executed statement matches the
  // parameters, and records the accumulated parameters for assertions.
  // The terminal methods must stay thenable-shaped: production code awaits them,
  // so they hand back a promise resolved from the real D1 call rather than the
  // bare result.
  const wrapWithParams = (statement, sql) => {
    const make = (bound, params) => ({
      bind: (...next) => make(bound.bind(...next), [...params, ...next]),
      run: () => {
        record(sql, params);
        return bound.run();
      },
      first: (column) => {
        record(sql, params);
        return bound.first(column);
      },
      all: () => {
        record(sql, params);
        return bound.all();
      },
      raw: () => {
        record(sql, params);
        return bound.raw();
      }
    });
    return make(statement, []);
  };

  return {
    statements,
    boundPairs,
    prepare: (sql) => wrapWithParams(db.prepare(sql), sql),
    exec: (sql) => db.exec(sql),
    batch: (stmts) => db.batch(stmts),
    withSession: () => db.withSession()
  };
}
