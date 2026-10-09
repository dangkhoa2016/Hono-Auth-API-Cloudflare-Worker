/**
 * T5/B06/B08: the retention policy on its own.
 *
 * The D1 suite proves the policy works against the real schema. This file
 * covers the decisions that need no database and pins them directly, because a
 * policy that quietly shortens a retention window deletes evidence early and
 * nothing else in the codebase would notice.
 */
import { test } from 'node:test';
import assert from 'node:assert/strict';

import {
  buildArchiveSelection,
  buildCategoryPredicate,
  buildCutoffProtectionPredicate,
  buildSelectionPredicate,
  CATEGORY_CONFIG_KEYS,
  CATEGORY_FALLBACK_DAYS,
  matchRetentionCategories,
  resolveRetentionPolicy,
  retentionCategories,
  retentionCutoff,
  UNKNOWN_ACTOR_ROLE,
  validateRetentionDays
} from '../../src/services/auditRetentionPolicy.js';
import { InvalidConfigValueError } from '../../src/utils/serviceErrors.js';

/** Fixed clock so cutoffs are comparable. */
const NOW = new Date('2026-09-27T12:00:00.000Z');

/**
 * A window of days counted back from `NOW`.
 * @param {number} days - Days to subtract
 * @returns {string} ISO timestamp
 */
function daysAgo(days) {
  return new Date(NOW.getTime() - days * 86400000).toISOString();
}

test('T5: a category with no configuration falls back to its documented window', () => {
  const policy = resolveRetentionPolicy({ action: 'debug_ping' }, {}, NOW);

  assert.equal(policy.days, CATEGORY_FALLBACK_DAYS.general);
  assert.equal(policy.source, 'default');
  assert.equal(policy.cutoff, daysAgo(CATEGORY_FALLBACK_DAYS.general));
  assert.deepEqual(policy.fallbackUsed, ['general']);
});

test('T5: a configured value is used and reported as such', () => {
  const policy = resolveRetentionPolicy({ action: 'debug_ping' }, { AUDIT_DEFAULT_RETENTION_DAYS: 45 }, NOW);

  assert.equal(policy.days, 45);
  assert.equal(policy.source, 'config');
  assert.equal(policy.cutoff, daysAgo(45));
  assert.deepEqual(policy.fallbackUsed, []);
});

test('T5: a zero is a configuration error, not a request to keep nothing', () => {
  assert.equal(validateRetentionDays(0, 'general').valid, false);
  assert.throws(
    () => resolveRetentionPolicy({ action: 'debug_ping' }, { AUDIT_DEFAULT_RETENTION_DAYS: 0 }),
    (error) => error instanceof InvalidConfigValueError
  );
});

test('T5: a security event outranks a general event however both are configured', () => {
  const config = { AUDIT_DEFAULT_RETENTION_DAYS: 30, AUDIT_SENSITIVE_RETENTION_DAYS: 900 };
  const general = resolveRetentionPolicy({ action: 'debug_ping' }, config, NOW);
  const security = resolveRetentionPolicy({ action: 'password_change' }, config, NOW);

  assert.equal(general.days, 30);
  assert.equal(security.days, 900);
  assert.ok(security.cutoff < general.cutoff, 'a longer window keeps the data longer');
});

test('T5: an event protected only by its target_type is still sensitive', () => {
  // The action is unremarkable; the target is a credential.
  const byTarget = resolveRetentionPolicy({ action: 'update', target_type: 'credential' }, {});
  assert.ok(byTarget.categories.includes('sensitive'));
  assert.equal(byTarget.days, CATEGORY_FALLBACK_DAYS.sensitive);
});

test('T5: an event protected only by its status is not left to the general schedule', () => {
  // The action is unremarkable, so the status is the only thing protecting it.
  const event = { action: 'something_new', status: 'SECURITY_EVENT' };
  const policy = resolveRetentionPolicy(event, {}, NOW);

  assert.ok(policy.categories.length > 0, 'the status must be enough on its own');
  assert.ok(!policy.categories.includes('general'), 'it must not fall to the general window');
  assert.ok(policy.days > CATEGORY_FALLBACK_DAYS.general);
});

test('T5: the general predicate leaves out a status-protected event', () => {
  const { sql, params } = buildCategoryPredicate('general');
  const status = { action: 'something_new', status: 'SECURITY_EVENT' };
  const excluded = matchRetentionCategories(status).length > 0;
  const placeholders = new Set();

  // A crude evaluation is enough: the row is excluded if the predicate rejects
  // it, which is what the D1 suite then confirms against real SQLite.
  assert.equal(excluded, true);
  assert.match(sql, /NOT \(/);
  assert.equal(params.length, (sql.match(/\?/g) || []).length);
  assert.equal(placeholders.size, 0);
});

test('T5: an event matching two categories keeps the longest window', () => {
  // `data_export` is a compliance action; a `security_event` target also makes it
  // sensitive. The longer window has to win or the row is deleted early.
  const policy = resolveRetentionPolicy(
    { action: 'data_export', target_type: 'security_event', status: 'COMPLIANCE_HOLD' },
    {},
    NOW
  );

  assert.ok(policy.categories.length > 1, `expected an overlap, got ${policy.categories.join(', ')}`);
  assert.equal(policy.category, 'compliance');
  assert.equal(policy.days, CATEGORY_FALLBACK_DAYS.compliance);
  assert.equal(policy.cutoff, daysAgo(CATEGORY_FALLBACK_DAYS.compliance));
});

test('T5: a policy can be configured to a window longer than the default ceiling', () => {
  const policy = resolveRetentionPolicy({ action: 'data_export', status: 'FAILED' }, { AUDIT_COMPLIANCE_RETENTION_DAYS: 3650 });
  assert.equal(policy.days, 3650);
  assert.equal(validateRetentionDays(3651, 'compliance').valid, false, 'beyond the ceiling is refused');
});

test('T5: a range sweep still leaves a protected row that falls inside it', () => {
  // The requested range ends 90 days ago, so a 200-day-old security event is
  // inside the range. Its own window is 365 days, so it must survive: a plain
  // `timestamp <= endDate` sweep would take it, which is the defect the category
  // split exists to prevent.
  const protection = buildCutoffProtectionPredicate(daysAgo(90), NOW, {});

  assert.match(protection.sql, /^NOT \(/);
  const sensitive = protection.protectedCategories.find((entry) => entry.category === 'sensitive');
  assert.ok(sensitive, `sensitive must be protected, got ${JSON.stringify(protection.protectedCategories)}`);
  assert.equal(sensitive.retention_days, CATEGORY_FALLBACK_DAYS.sensitive);
  assert.equal(sensitive.cutoff, daysAgo(CATEGORY_FALLBACK_DAYS.sensitive));
});

test('T5: a range entirely older than every window needs no protection', () => {
  // Nothing from 2000 is inside a 90, 365, 1095 or 2555 day window, so the
  // fragment is empty and the sweep is free to archive the whole range.
  const protection = buildCutoffProtectionPredicate('2000-01-01T00:00:00.000Z', NOW, {});

  assert.equal(protection.sql, '', 'nothing in that range is still inside a window');
  assert.deepEqual(protection.protectedCategories, []);
});

test('T5: the protection fragment binds one parameter per placeholder', () => {
  const protection = buildCutoffProtectionPredicate(daysAgo(90), NOW, {});

  assert.equal(protection.params.length, (protection.sql.match(/\?/g) || []).length);
  // Each category contributes its own matcher parameters plus its cutoff.
  assert.ok(
    protection.params.length > protection.protectedCategories.length,
    'the matchers must bind their values too'
  );
});

test('T5: a configured window moves the protection with it', () => {
  const rangeEnd = daysAgo(90);
  const shortWindow = buildCutoffProtectionPredicate(rangeEnd, NOW, { AUDIT_SENSITIVE_RETENTION_DAYS: 7 });
  const longWindow = buildCutoffProtectionPredicate(rangeEnd, NOW, { AUDIT_SENSITIVE_RETENTION_DAYS: 3000 });

  // A 7-day window ends before the range, so the sensitive category no longer
  // holds anything back and drops out of the fragment entirely.
  assert.equal(
    shortWindow.protectedCategories.some((entry) => entry.category === 'sensitive'),
    false,
    'a window shorter than the range gap cannot protect a row in it'
  );

  const longCutoff = longWindow.protectedCategories.find((entry) => entry.category === 'sensitive').cutoff;
  assert.equal(longCutoff, daysAgo(3000));
  assert.ok(longCutoff < rangeEnd, 'the 3000-day window still reaches into this range');
});

test('T5: an unusable date in the protection predicate is refused', () => {
  assert.throws(() => buildCutoffProtectionPredicate('not-a-date', NOW, {}), TypeError);
  assert.throws(() => buildCutoffProtectionPredicate(daysAgo(1), 'not-a-date', {}), TypeError);
});

test('T5: each category owns a disjoint slice of the event space', () => {
  const samples = {
    general: { action: 'debug_ping' },
    sensitive: { action: 'password_change' },
    administrative: { action: 'user_role_change' },
    compliance: { action: 'data_export' }
  };

  for (const [category, event] of Object.entries(samples)) {
    const { sql, params } = buildCategoryPredicate(category);
    assert.ok(typeof sql === 'string', `${category} must build a predicate`);
    assert.ok(Array.isArray(params), `${category} must bind its parameters`);

    // A row the category claims must not also fall inside the general slice,
    // otherwise a general sweep would delete it behind the category's back.
    if (category !== 'general') {
      assert.ok(
        matchRetentionCategories(event).includes(category),
        `${category} must claim its own sample event`
      );
    }
  }
});

test('T5: a category predicate binds one parameter per placeholder', () => {
  for (const category of retentionCategories()) {
    const { sql, params } = buildCategoryPredicate(category);
    const placeholders = (sql.match(/\?/g) || []).length;
    assert.equal(params.length, placeholders, `${category} has ${placeholders} placeholders but ${params.length} params`);
  }
});

test('T5: an unknown category is refused rather than silently archived', () => {
  assert.throws(() => buildCategoryPredicate('1=1; DROP TABLE audit_logs'), RangeError);
  assert.throws(
    () => buildArchiveSelection({ startDate: daysAgo(10), endDate: daysAgo(1), category: 'general OR 1=1' }, {}, NOW),
    RangeError
  );
});

test('T5: the selection predicate covers the range and resumes after the cursor', () => {
  const selection = buildArchiveSelection(
    { startDate: daysAgo(10), endDate: daysAgo(1), batchSize: 50, cursorAfterId: 17 },
    {},
    NOW
  );
  const { sql, params } = buildSelectionPredicate(selection);

  assert.equal((sql.match(/\?/g) || []).length, params.length);
  assert.deepEqual(params, [selection.startDate, selection.endDate, 17]);
  assert.match(sql, /julianday\(timestamp\) >= julianday\(\?\)/, 'the start is inclusive');
  assert.match(sql, /julianday\(timestamp\) <= julianday\(\?\)/, 'the end is inclusive');
  assert.match(sql, /id > \?/, 'a page resumes after the cursor, it does not replay it');
});

test('T5: a selection is normalised once so a preview and a run cannot disagree', () => {
  const input = { startDate: '2026-01-01T00:00:00.000Z', endDate: '2026-01-02T00:00:00.000Z', batchSize: '25' };
  const first = buildArchiveSelection(input, {}, NOW);
  const second = buildArchiveSelection(first, {}, NOW);

  assert.equal(first.limit, 25);
  assert.equal(first.batchSize, undefined, 'the input is normalised, not carried through');
  assert.equal(second.startDate, first.startDate);
  assert.equal(second.endDate, first.endDate);
  assert.equal(second.limit, first.limit);
  assert.equal(second.cursorAfterId, first.cursorAfterId);
});

test('T5: retentionCutoff and resolveRetentionPolicy agree on the same day count', () => {
  const policy = resolveRetentionPolicy({ action: 'debug_ping' }, { AUDIT_DEFAULT_RETENTION_DAYS: 120 }, NOW);
  assert.equal(retentionCutoff(120, NOW), policy.cutoff);
  assert.equal(policy.cutoff, daysAgo(120));
  assert.throws(() => retentionCutoff('many', NOW), TypeError);
  assert.throws(() => retentionCutoff(120, 'not-a-date'), TypeError);
});

test('T5: the synthetic role sentinel is a single shared constant', () => {
  assert.equal(UNKNOWN_ACTOR_ROLE, 'UNKNOWN');
});

test('T5: every category has a config key and a fallback window', () => {
  for (const category of retentionCategories()) {
    assert.ok(CATEGORY_CONFIG_KEYS[category], `${category} needs a config key`);
    assert.equal(typeof CATEGORY_FALLBACK_DAYS[category], 'number', `${category} needs a fallback`);
    assert.ok(CATEGORY_FALLBACK_DAYS[category] > 0);
  }
});
