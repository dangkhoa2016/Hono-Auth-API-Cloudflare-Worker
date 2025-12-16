/**
 * Temporary script to find key differences between locale files
 */

import { readFileSync } from 'fs';
import { join } from 'path';

// Function to flatten nested object keys
function flattenKeys(obj, prefix = '') {
  const keys = [];
  for (const key in obj) {
    if (obj[key] !== undefined) {
      const newKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        keys.push(...flattenKeys(obj[key], newKey));
      } else {
        keys.push(newKey);
      }
    }
  }
  return keys;
}

// Load locale files
async function loadLocale(filename) {
  try {
    const filePath = join(process.cwd(), 'src/i18n/locales', filename);
    const content = readFileSync(filePath, 'utf-8');

    // Create a temporary module to evaluate the export
    const moduleCode = content.replace('export default', 'const localeData =') + '\nlocaleData;';
    const localeData = eval(moduleCode);

    return flattenKeys(localeData);
  } catch (error) {
    console.error(`Error loading ${filename}:`, error.message);
    return [];
  }
}

async function main() {
  console.log('🔍 Finding key differences between locale files...\n');

  const enKeys = await loadLocale('en.js');
  console.log(`📖 Base locale (en.js): ${enKeys.length} keys`);

  const locales = ['de.js', 'es.js', 'fr.js', 'ja.js', 'th.js', 'vi.js'];

  for (const locale of locales) {
    const keys = await loadLocale(locale);
    console.log(`\n🔍 Checking ${locale}: ${keys.length} keys`);

    // Find keys in this locale but not in en.js
    const extraKeys = keys.filter(key => !enKeys.includes(key));
    if (extraKeys.length > 0) {
      console.log(`  ➕ Extra keys (${extraKeys.length}):`);
      extraKeys.forEach(key => console.log(`    • ${key}`));
    }

    // Find keys in en.js but not in this locale
    const missingKeys = enKeys.filter(key => !keys.includes(key));
    if (missingKeys.length > 0) {
      console.log(`  ❌ Missing keys (${missingKeys.length}):`);
      missingKeys.slice(0, 10).forEach(key => console.log(`    • ${key}`));
      if (missingKeys.length > 10) {
        console.log(`    ... and ${missingKeys.length - 10} more`);
      }
    }

    if (extraKeys.length === 0 && missingKeys.length === 0) {
      console.log('  ✅ Perfect match!');
    }
  }
}

main().catch(console.error);
