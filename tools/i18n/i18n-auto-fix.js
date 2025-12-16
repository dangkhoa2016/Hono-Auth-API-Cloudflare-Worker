/**
 * Simple i18n Auto-Fix Tool
 * Automatically finds and fixes missing translation keys
 */

import { compareTranslations, autoFixMissingKeys } from './i18n-compare.js';

async function main() {
  console.log('🚀 Auto-fixing missing i18n keys...\n');

  try {
    // Compare and get missing keys
    const results = await compareTranslations();

    // Auto-fix all missing keys
    await autoFixMissingKeys(results);

  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
