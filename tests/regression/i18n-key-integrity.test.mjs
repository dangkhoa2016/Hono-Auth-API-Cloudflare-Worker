/**
 * Every literal translation key an error path asks for has to exist in every
 * shipped locale.
 *
 * This is here because of a specific, already-fixed defect. The audit routes
 * built their failure reason with `t(c, 'error.unknown')`, and there is no
 * `error` namespace in any of the seven locales. `t` throws on a missing key
 * rather than returning it, so every one of those handlers threw a
 * MissingTranslationError from inside its own catch block. The outer catch
 * asked for the same missing key, threw again, and the client received Hono's
 * bare "Internal Server Error" with a 500 -- which is how a database outage on
 * the export route came to be reported as a 500 the client was blamed for.
 *
 * Checking the keys by hand does not hold: the same wrong pattern appeared 28
 * times across the two audit route files. These tests check the key space
 * instead, so the class cannot come back unnoticed.
 *
 * Scope note: this covers the two audit route files that the export contract
 * lives in. Several other route files still reference keys that do not exist
 * (see the finding recorded in the handoff); they are left alone here because
 * fixing them is a separate change with its own translations, and this test is
 * not the place to quietly widen its own scope.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..', '..');
const LOCALES = ['en', 'vi', 'de', 'fr', 'es', 'ja', 'th'];
const AUDIT_ROUTE_FILES = ['src/routes/audit.js', 'src/routes/advancedAudit.js'];

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
 * `tSuccess` prefixes its argument with `success.`, so the literal written at
 * the call site is not the key that is looked up. Resolving the real key is
 * what keeps this test from reporting a clean file as broken.
 */
const KEY_CALL = /\bt(Error|Success)?\(\s*c\s*,\s*'([a-zA-Z][a-zA-Z0-9_.]*)'/g;

function literalKeys(source) {
  const found = [];
  for (const match of source.matchAll(KEY_CALL)) {
    const kind = match[1] || 't';
    found.push(kind === 'Success' ? `success.${match[2]}` : match[2]);
  }
  return found;
}

test('every locale actually carries the keys the audit routes ask for', async () => {
  const perFile = new Map();

  for (const relative of AUDIT_ROUTE_FILES) {
    perFile.set(relative, literalKeys(readFileSync(join(ROOT, relative), 'utf8')));
  }

  const missing = [];
  for (const [relative, keys] of perFile) {
    for (const key of new Set(keys)) {
      const absentIn = [];
      for (const code of LOCALES) {
        if (lookup(await loadLocale(code), key) === undefined) {
          absentIn.push(code);
        }
      }
      if (absentIn.length > 0) {
        missing.push(`${relative}: "${key}" is absent from ${absentIn.join(', ')}`);
      }
    }
  }

  assert.deepEqual(
    missing,
    [],
    'a key that no locale has makes `t` throw, and a handler that throws from its own catch turns a translated failure into a bare 500'
  );
});

test('the reason the audit error paths fall back to exists in every locale', async () => {
  // This is the key the 28 `error.unknown` fallbacks were changed to. If it is
  // ever renamed or dropped, every audit error path breaks at once, so it is
  // worth a test of its own rather than relying on the sweep above.
  for (const code of LOCALES) {
    assert.notEqual(
      lookup(await loadLocale(code), 'system.serverError'),
      undefined,
      `locale "${code}" has no system.serverError for audit error paths to fall back to`
    );
  }
});

test('no source file asks for the error namespace, which no locale defines', () => {
  // The original defect in its shortest form. A grep rather than a sweep,
  // because it must also catch a key that is written dynamically in a file the
  // sweep does not read.
  const offenders = [];
  for (const relative of AUDIT_ROUTE_FILES) {
    const source = readFileSync(join(ROOT, relative), 'utf8');
    if (/'error\.[a-zA-Z]/.test(source)) {
      offenders.push(relative);
    }
  }
  assert.deepEqual(
    offenders,
    [],
    'the `error` namespace does not exist in any locale; use a key that does, such as system.serverError'
  );
});
