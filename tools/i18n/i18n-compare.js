/**
 * i18n Key Comparison Tool
 * Compares translation keys between en.js (base) and other locale files
 * Finds missing keys and provides options to auto-add them
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const LOCALES_DIR = path.resolve(__dirname, '../../src/i18n/locales');
const BASE_LOCALE = 'en.js';

/**
 * Extract all keys from a translation object recursively
 * @param {Object} obj - Translation object
 * @param {string} prefix - Key prefix for nested objects
 * @returns {Array} Array of key paths
 */
function extractKeys(obj, prefix = '') {
  const keys = [];

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      keys.push(...extractKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }

  return keys;
}

/**
 * Load and parse a translation file
 * @param {string} filePath - Path to translation file
 * @returns {Object} Parsed translation object
 */
async function loadTranslationFile(filePath) {
  try {
    const module = await import(`file://${filePath}`);
    return module.default || module;
  } catch (error) {
    console.error(`❌ Error loading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Get value from nested object using dot notation
 * @param {Object} obj - Object to search in
 * @param {string} keyPath - Dot notation key path
 * @returns {*} Value or undefined
 */
function getNestedValue(obj, keyPath) {
  return keyPath.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}

/**
 * Set value in nested object using dot notation
 * @param {Object} obj - Object to modify
 * @param {string} keyPath - Dot notation key path
 * @param {*} value - Value to set
 */
function setNestedValue(obj, keyPath, value) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();

  let current = obj;
  for (const key of keys) {
    if (!current[key] || typeof current[key] !== 'object') {
      current[key] = {};
    }
    current = current[key];
  }

  current[lastKey] = value;
}

/**
 * Generate JavaScript code for nested object
 * @param {Object} obj - Object to convert
 * @param {number} indent - Indentation level
 * @returns {string} JavaScript object code
 */
function objectToJS(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  const innerSpaces = '  '.repeat(indent + 1);

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return JSON.stringify(obj);
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return '{}';
  }

  const lines = entries.map(([key, value]) => {
    const jsValue = objectToJS(value, indent + 1);
    return `${innerSpaces}'${key}': ${jsValue}`;
  });

  return `{\n${lines.join(',\n')}\n${spaces}}`;
}

/**
 * Update translation file with missing keys
 * @param {string} filePath - Path to translation file
 * @param {Object} missingKeys - Object containing missing keys and values
 * @returns {boolean} Success status
 */
async function updateTranslationFile(filePath, missingKeys) {
  try {
    // Load current translation
    const currentTranslation = await loadTranslationFile(filePath);
    if (!currentTranslation) {
      return false;
    }

    // Add missing keys
    for (const [keyPath, value] of Object.entries(missingKeys)) {
      setNestedValue(currentTranslation, keyPath, value);
    }

    // Generate new file content
    const fileContent = `/**
 * ${path.basename(filePath, '.js').toUpperCase()} translations (camelCase format)
 * Auto-updated by i18n comparison tool
 * Last updated: ${new Date().toISOString()}
*/

export default ${objectToJS(currentTranslation)};
`;

    // Write back to file
    fs.writeFileSync(filePath, fileContent);
    return true;

  } catch (error) {
    console.error(`❌ Error updating ${filePath}:`, error.message);
    return false;
  }
}

/**
 * Compare translation files and find missing keys
 */
async function compareTranslations() {
  console.log('🔍 i18n Key Comparison Tool\n');

  // Load base translation (en.js)
  const baseFilePath = path.join(LOCALES_DIR, BASE_LOCALE);
  console.log(`📖 Loading base translation: ${BASE_LOCALE}`);

  const baseTranslation = await loadTranslationFile(baseFilePath);
  if (!baseTranslation) {
    console.error('❌ Failed to load base translation file');
    return;
  }

  const baseKeys = extractKeys(baseTranslation);
  console.log(`✅ Found ${baseKeys.length} keys in base translation\n`);

  // Get all locale files (except base)
  const allFiles = fs.readdirSync(LOCALES_DIR);
  const localeFiles = allFiles.filter(file =>
    file.endsWith('.js') && file !== BASE_LOCALE
  );

  if (localeFiles.length === 0) {
    console.log('ℹ️  No other locale files found');
    return;
  }

  const results = [];

  // Compare each locale file
  for (const localeFile of localeFiles) {
    const localePath = path.join(LOCALES_DIR, localeFile);
    const locale = path.basename(localeFile, '.js');

    console.log(`🔍 Checking ${localeFile}...`);

    const localeTranslation = await loadTranslationFile(localePath);
    if (!localeTranslation) {
      console.log(`  ❌ Failed to load ${localeFile}\n`);
      continue;
    }

    const localeKeys = extractKeys(localeTranslation);
    const missingKeys = baseKeys.filter(key => !localeKeys.includes(key));

    if (missingKeys.length === 0) {
      console.log(`  ✅ All keys present (${localeKeys.length}/${baseKeys.length})\n`);
    } else {
      console.log(`  ⚠️  Missing ${missingKeys.length} keys (${localeKeys.length}/${baseKeys.length})`);

      // Show first few missing keys
      const showKeys = missingKeys.slice(0, 5);
      showKeys.forEach(key => console.log(`     - ${key}`));
      if (missingKeys.length > 5) {
        console.log(`     ... and ${missingKeys.length - 5} more`);
      }
      console.log();

      // Prepare missing keys with values from base
      const missingKeyValues = {};
      missingKeys.forEach(key => {
        const baseValue = getNestedValue(baseTranslation, key);
        missingKeyValues[key] = baseValue;
      });

      results.push({
        locale,
        filePath: localePath,
        missingCount: missingKeys.length,
        missingKeys: missingKeyValues,
        totalKeys: baseKeys.length,
        presentKeys: localeKeys.length
      });
    }
  }

  // Summary
  console.log('📊 Summary:');
  console.log(`   Base locale (${BASE_LOCALE}): ${baseKeys.length} keys`);

  if (results.length === 0) {
    console.log('   🎉 All locale files are up to date!');
    return results;
  }

  results.forEach(result => {
    console.log(`   ${result.locale}: ${result.presentKeys}/${result.totalKeys} keys (missing: ${result.missingCount})`);
  });

  return results;
}

/**
 * Auto-fix missing keys by copying from base translation
 * @param {Array} results - Results from comparison
 */
async function autoFixMissingKeys(results) {
  if (results.length === 0) {
    console.log('\n✅ No files need fixing!');
    return;
  }

  console.log('\n🔧 Auto-fixing missing keys...\n');

  let successCount = 0;

  for (const result of results) {
    console.log(`🔄 Updating ${result.locale}...`);

    const success = await updateTranslationFile(result.filePath, result.missingKeys);

    if (success) {
      console.log(`  ✅ Added ${result.missingCount} missing keys`);
      successCount++;
    } else {
      console.log('  ❌ Failed to update file');
    }
  }

  console.log('\n📊 Auto-fix Summary:');
  console.log(`   ✅ Successfully updated: ${successCount}/${results.length} files`);
  console.log(`   ❌ Failed: ${results.length - successCount} files`);

  if (successCount === results.length) {
    console.log('\n🎉 All files updated successfully!');
    console.log('💡 Note: English values were used as placeholders.');
    console.log('   Consider translating them to native languages.');
  }
}

/**
 * Main execution with interactive options
 */
async function main() {
  try {
    const results = await compareTranslations();

    if (results.length === 0) {
      return;
    }

    // Interactive prompt (simplified for demo)
    console.log('\n❓ Options:');
    console.log('   1. Auto-fix missing keys (copy from en.js)');
    console.log('   2. Show detailed missing keys list');
    console.log('   3. Exit without changes');

    // For automation, you can uncomment the line below to auto-fix
    // await autoFixMissingKeys(results);

    console.log('\n💡 To auto-fix, uncomment the autoFixMissingKeys call in the script');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

// Export functions for programmatic use
export {
  compareTranslations,
  autoFixMissingKeys,
  extractKeys,
  loadTranslationFile
};

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
