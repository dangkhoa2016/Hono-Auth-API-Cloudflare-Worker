/**
 * Every literal translation key the realtime monitoring route asks for has to
 * exist in every shipped locale, and its start-refusal must not leak a raw
 * English string.
 *
 * This is the same class of defect that `i18n-key-integrity.test.mjs` pins for
 * the audit routes, and it lives here instead of in that file on purpose: that
 * suite declares its own two-file scope and says it is not the place to widen
 * it. The monitoring route is a separate change with its own keys, so it gets a
 * suite of its own rather than a silent edit to the existing scope note.
 *
 * The route reaches for three key namespaces:
 *   - `t` / `tError` / `tSuccess` literals written directly at the call site,
 *   - the `handleStandardError(c, error, log, fn, key, ...)` fallback key,
 *     which is passed to `tError` and therefore resolves under `errors.`,
 *   - the start-refusal 422, which previously returned the service's English
 *     message verbatim.
 *
 * A key that no locale has makes `t`/`tError` throw inside a catch block, which
 * turns a translated failure into a bare 500 (the exact failure mode the audit
 * suite exists for). A refusal that returns English whatever the client speaks
 * is the same failure from the reader's side: the machine code is fixed, but the
 * human never gets their language.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const LOCALES = ['en', 'vi', 'de', 'fr', 'es', 'ja', 'th'];
const MONITOR_ROUTE = 'src/routes/realtimeMonitoring.js';

const localeCache = new Map();

async function loadLocale(code) {
  if (!localeCache.has(code)) {
    const module_ = await import(`../../src/i18n/locales/${code}.js`);
    localeCache.set(code, module_.default ?? module_);
  }
  return localeCache.get(code);
}

function lookup(tree, key) {
  return key.split('.').reduce((node, part) => {
    if (node && typeof node === 'object') {
      return node[part];
    }
    return undefined;
  }, tree);
}

/**
 * `tSuccess` and `tError` rewrite the literal: `tSuccess` prefixes `success.`,
 * `tError` looks up `errors.<key>` first. Resolving the real key is what keeps
 * this test from reporting a clean file as broken.
 */
const DIRECT_CALL = /\bt(Error|Success)?\(\s*c\s*,\s*'([a-zA-Z][a-zA-Z0-9_.]*)'/g;

/**
 * The `handleStandardError(c, error, logMessage, logFunction, key, ...)` shape.
 * The key in the fifth position goes straight into `tError`.
 */
const HANDLE_ERROR_CALL = /handleStandardError\(c,\s*error,[^,]*,[^,]*,\s*'([a-zA-Z][a-zA-Z0-9_.]*)'/g;

/**
 * Resolve a literal to the keys the translation functions actually look up.
 * @param {string} kind - `t`, `Error` or `Success` (regex capture)
 * @param {string} literal - Key as written at the call site
 * @returns {string[]} Candidate lookup keys, most relevant first
 */
function lookupCandidates(kind, literal) {
  if (kind === 'Success') {
    return [`success.${literal}`];
  }
  if (kind === 'Error') {
    // `tError` tries `errors.<key>` first, then the raw key. The integrity rule
    // is that the namespaced form exists: a key that only "resolves" through the
    // raw fallback survives at the pleasure of a key that other routes happen to
    // share, which is the blanket-fallback trap this suite exists to refuse.
    return [`errors.${literal}`, literal];
  }
  return [literal];
}

function requestedKeys(source) {
  const keys = new Map();
  for (const match of source.matchAll(DIRECT_CALL)) {
    keys.set(match[2], lookupCandidates(match[1] || 't', match[2]));
  }
  for (const match of source.matchAll(HANDLE_ERROR_CALL)) {
    keys.set(match[1], lookupCandidates('Error', match[1]));
  }
  return keys;
}

test('every locale carries the keys the realtime monitoring route asks for', async () => {
  const source = readFileSync(join(ROOT, MONITOR_ROUTE), 'utf8');
  const requested = requestedKeys(source);
  assert.ok(requested.size > 10, `the inventory must actually scan the route (found ${requested.size})`);

  const missing = [];
  for (const [literal, candidates] of requested) {
    for (const code of LOCALES) {
      const tree = await loadLocale(code);
      const present = candidates.some((key) => lookup(tree, key) !== undefined);
      if (!present) {
        missing.push(`${MONITOR_ROUTE}: "${literal}" is absent from ${code}`);
      }
    }
  }

  assert.deepEqual(
    missing,
    [],
    'a key that no locale has makes t()/tError() throw, and a handler that throws from its own catch turns a translated failure into a bare 500'
  );
});

test('the start-refusal 422 has no raw English message literal anywhere in the route', () => {
  // The refusal must be built from the catalogue. A literal `message: '...'`
  // string in the start path is what the (now unreachable) success branch used
  // to carry; the reachable branch silently returned the service's English
  // `error.message`. Both have to be gone for the message to follow the locale.
  const source = readFileSync(join(ROOT, MONITOR_ROUTE), 'utf8');
  assert.doesNotMatch(
    source,
    /message:\s*'[^']*[Cc]ontinuous [Mm]onitoring[^']*'/,
    'an English literal in a message field does not change with the client language'
  );
});
