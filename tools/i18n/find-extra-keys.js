#!/usr/bin/env node

/**
 * EN:
 *   - Find extra keys existing in target locale but not in en.js.
 *   - Detect discrepancies across locales (missing/extra keys, counts).
 *   - Works with master.js workflow.
 *   - Created: August 13, 2025.
 * VI:
 *   - Tìm các key dư thừa có trong locale đích nhưng không có ở en.js.
 *   - Phát hiện sai lệch giữa locale (thiếu/dư key, so sánh số lượng).
 *   - Tích hợp cùng workflow trong master.js.
 *   - Tạo ngày: 13/08/2025.
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
  
  // EN: Import the locale module
  // VI: Import module locale
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
    
    // EN: Find extra keys in target locale
    // VI: Tìm key dư trong locale đích
    const extraKeys = targetKeys.filter(key => !baseKeys.includes(key));
    
    // EN: Find missing keys in target locale
    // VI: Tìm key thiếu trong locale đích
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

  // EN: Main execution
  // VI: Thực thi chính
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
