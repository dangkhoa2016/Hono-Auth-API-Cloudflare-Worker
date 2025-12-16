#!/usr/bin/env node

/**
 * Find Extra Keys Tool
 * Find keys that exist in target locale but not in en.js (base)
 * 
 * Created: August 13, 2025
 * Purpose: Detect key discrepancies between locale files to maintain consistency
 * Features: Missing keys detection, extra keys detection, key count comparison
 * Integration: Works with master.js workflow for comprehensive key management
 * 
 * Usage:
 *   node find-extra-keys.js <target-locale> [base-locale]
 *   node find-extra-keys.js vi en    # Compare Vietnamese vs English
 *   node find-extra-keys.js de       # Compare German vs English (default)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAllKeys(obj, prefix = '') {
  const keys = [];
  
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      keys.push(...getAllKeys(obj[key], prefix ? `${prefix}.${key}` : key));
    } else {
      keys.push(prefix ? `${prefix}.${key}` : key);
    }
  }
  
  return keys;
}

async function loadLocaleKeys(localeCode) {
  const filePath = path.join(__dirname, '..', '..', 'src', 'i18n', 'locales', `${localeCode}.js`);
  
  if (!fs.existsSync(filePath)) {
    throw new Error(`Locale file not found: ${filePath}`);
  }
  
  // Import the locale module
  const localeModule = await import(`file://${filePath}`);
  const localeData = localeModule.default;
  
  return getAllKeys(localeData);
}

async function compareKeys(baseCode, targetCode) {
  console.log(`🔍 Comparing ${targetCode} with base ${baseCode}...`);
  
  try {
    const baseKeys = await loadLocaleKeys(baseCode);
    const targetKeys = await loadLocaleKeys(targetCode);
    
    console.log(`📊 ${baseCode}: ${baseKeys.length} keys`);
    console.log(`📊 ${targetCode}: ${targetKeys.length} keys`);
    
    // Find extra keys in target
    const extraKeys = targetKeys.filter(key => !baseKeys.includes(key));
    
    // Find missing keys in target
    const missingKeys = baseKeys.filter(key => !targetKeys.includes(key));
    
    if (extraKeys.length > 0) {
      console.log(`\n❌ ${targetCode} has ${extraKeys.length} EXTRA keys not in ${baseCode}:`);
      extraKeys.sort().forEach(key => {
        console.log(`   • ${key}`);
      });
    }
    
    if (missingKeys.length > 0) {
      console.log(`\n⚠️  ${targetCode} is MISSING ${missingKeys.length} keys from ${baseCode}:`);
      missingKeys.sort().forEach(key => {
        console.log(`   • ${key}`);
      });
    }
    
    if (extraKeys.length === 0 && missingKeys.length === 0) {
      console.log(`\n✅ ${targetCode} perfectly matches ${baseCode}!`);
    }
    
    return {
      baseCount: baseKeys.length,
      targetCount: targetKeys.length,
      extraKeys,
      missingKeys
    };
    
  } catch (error) {
    console.error(`❌ Error comparing keys:`, error.message);
    process.exit(1);
  }
}

// Main execution
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const targetCode = process.argv[2];
  const baseCode = process.argv[3] || 'en';
  
  if (!targetCode) {
    console.log('Usage: node find-extra-keys.js <target-locale> [base-locale]');
    console.log('Example: node find-extra-keys.js de en');
    process.exit(1);
  }
  
  await compareKeys(baseCode, targetCode);
}

export { compareKeys, loadLocaleKeys, getAllKeys };
