#!/usr/bin/env node
/**
 * Missing Translation Behavior Test
 * Verifies that i18n service now throws MissingTranslationError when key absent.
 */

import { initI18n, i18next } from '../src/i18n/config.js';
import { tl, tpl, MissingTranslationError } from '../src/i18n/service.js';
import { TestLogger } from './utils/testLogger.js';
import { TestAssertions } from './utils/testAssertions.js';

class MissingTranslationTests {
  constructor() {
    this.logger = new TestLogger();
    this.assert = TestAssertions;
  }

  async runAll() {
    this.logger.logSuiteHeader('🌐 Missing Translation Tests');
    const tests = [
      this.testExistingKey,
      this.testMissingKeyTL,
      this.testMissingPluralKey,
      this.testExistingPluralKey
    ];

    let failures = 0;
    for (const t of tests) {
      try {
        await t.call(this);
        this.logger.success(`${t.name} passed`);
      } catch (err) {
        failures++;
        this.logger.error(`${t.name} failed: ${err.message}`);
      }
    }

    this.logger.logSummary();
    if (failures > 0) {
      process.exit(1);
    }
  }

  async ensureInit() {
    if (!i18next.isInitialized) {
      await initI18n();
    }
  }

  async testExistingKey() {
    await this.ensureInit();
    const lang = 'en';
    const value = tl(lang, 'system.welcome', { version: '1.0.0', language: 'en' });
    this.assert.assertType(value, 'string', 'Existing key should return string');
    this.assert.assertStringContains(value, 'Welcome', 'system.welcome should contain Welcome');
    this.logger.recordResult(true);
  }

  async testMissingKeyTL() {
    await this.ensureInit();
    const lang = 'en';
    let threw = false;
    try {
      tl(lang, 'nonexistent.random.key');
    } catch (e) {
      threw = true;
      this.assert.assertTrue(e instanceof MissingTranslationError, 'Should throw MissingTranslationError');
      this.assert.assertEqual(e.key, 'nonexistent.random.key', 'Error should report correct key');
    }
    this.assert.assertTrue(threw, 'Missing key must throw');
    this.logger.recordResult(true);
  }

  async testMissingPluralKey() {
    await this.ensureInit();
    const lang = 'en';
    let threw = false;
    try {
      tpl(lang, 'validation.nonexistentPluralKey', 2);
    } catch (e) {
      threw = true;
      this.assert.assertTrue(e instanceof MissingTranslationError, 'Plural missing should throw MissingTranslationError');
    }
    this.assert.assertTrue(threw, 'Missing plural key must throw');
    this.logger.recordResult(true);
  }

  async testExistingPluralKey() {
    await this.ensureInit();
    const lang = 'en';
    const single = tpl(lang, 'admin.totalUsersCount', 1, { count: 1 });
    const multiple = tpl(lang, 'admin.totalUsersCount', 5, { count: 5 });
    this.assert.assertStringContains(single, '1', 'Single plural form should contain count 1');
    this.assert.assertStringContains(multiple, '5', 'Other plural form should contain count 5');
    this.logger.recordResult(true);
  }
}

// Proper ESM main module detection (Node.js)
const isMain = (() => {
  try {
    const current = new URL(import.meta.url);
    const entry = process.argv[1] ? new URL(`file://${process.argv[1]}`) : null;
    return entry && current.pathname === entry.pathname;
  } catch (_) {
    return false;
  }
})();

if (isMain) {
  const suite = new MissingTranslationTests();
  suite.runAll();
}
