#!/usr/bin/env node

/**
 * Tool để tự động xóa các key dư thừa trong các file locale
 * Sử dụng file en.js làm reference base
 *
 * Usage:
 *   node tools/i18n/remove-extra-keys.js [options] [files...]
 *
 * Options:
 *   --dry-run       Preview changes without modifying files
 *   --verbose       Show detailed information about keys
 *   --check-usage   Check if keys are used in code before removing
 *   --help          Show this help message
 *
 * Files:
 *   Specify specific locale files to process (e.g. vi.js es.js)
 *   If no files specified, all locale files will be processed
 *
 * Examples:
 *   node tools/i18n/remove-extra-keys.js --dry-run --verbose
 *   node tools/i18n/remove-extra-keys.js --check-usage vi.js
 *   node tools/i18n/remove-extra-keys.js de.js fr.js ja.js th.js
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EN: Console colors helper
// VI: Bộ màu cho console
const colors = {
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  reset: '\x1b[0m',
  bright: '\x1b[1m'
};

const localesDir = path.resolve(__dirname, '../../src/i18n/locales');
const baseFile = 'en.js';

/**
 * Lấy tất cả keys từ một object một cách đệ quy
 */
function getAllKeys(obj, prefix = '') {
  const keys = new Set();

  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    keys.add(fullKey);

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      const nestedKeys = getAllKeys(value, fullKey);
      nestedKeys.forEach(k => keys.add(k));
    }
  }

  return keys;
}

/**
 * Load module động
 */
async function loadLocaleModule(filePath) {
  try {
    const fileUrl = `file://${filePath}`;
    const module = await import(fileUrl);
    return module.default || module;
  } catch (error) {
    console.error(`${colors.red}❌ Error loading ${filePath}: ${error.message}${colors.reset}`);
    return null;
  }
}

/**
 * Xóa key khỏi object một cách đệ quy
 */
function removeKeyFromObject(obj, keyPath) {
  const keys = keyPath.split('.');
  const lastKey = keys.pop();

  let current = obj;
  for (const key of keys) {
    if (!(key in current) || typeof current[key] !== 'object') {
      return false; // EN: Key does not exist
             // VI: Key không tồn tại
    }
    current = current[key];
  }

  if (lastKey in current) {
    delete current[lastKey];
    return true;
  }

  return false;
}

/**
 * Làm sạch object - xóa các object rỗng
 */
function cleanupObject(obj) {
  for (const key in obj) {
    if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
      cleanupObject(obj[key]);
      // EN: Remove nested object if empty
      // VI: Xóa object lồng nếu rỗng
      if (Object.keys(obj[key]).length === 0) {
        delete obj[key];
      }
    }
  }
}

/**
 * Chuyển object thành string với format đẹp
 */
function objectToString(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  const nextSpaces = '  '.repeat(indent + 1);

  if (typeof obj !== 'object' || obj === null) {
    return JSON.stringify(obj);
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) {
    return '{}';
  }

  const lines = entries.map(([key, value]) => {
    const keyStr = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `'${key}'`;
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      return `${nextSpaces}${keyStr}: ${objectToString(value, indent + 1)}`;
    } else {
      return `${nextSpaces}${keyStr}: ${JSON.stringify(value)}`;
    }
  });

  return `{\n${lines.join(',\n')}\n${spaces}}`;
}

/**
 * Ghi file locale
 */
function writeLocaleFile(filePath, content) {
  const fileContent = `export default ${objectToString(content, 0)};\n`;
  fs.writeFileSync(filePath, fileContent, 'utf8');
}

/**
 * Kiểm tra xem key có được sử dụng trong code không
 */
async function isKeyUsedInCode(key) {
  const srcDir = path.resolve(__dirname, '../../src');
  const testsDir = path.resolve(__dirname, '../../tests');

  try {
    // EN: Search in src and tests
    // VI: Tìm trong src và tests
    const { execSync } = await import('child_process');
    const searchPattern = key.replace(/\./g, '\\.');

    // EN: Common i18n usage patterns to search
    // VI: Các pattern phổ biến khi dùng i18n key
    const patterns = [
      `t\\('${searchPattern}'`,
      `t\\("${searchPattern}"`,
      `'${searchPattern}'`,
      `"${searchPattern}"`,
      `${searchPattern}`
    ];

    for (const pattern of patterns) {
      try {
        const result = execSync(`grep -r "${pattern}" "${srcDir}" "${testsDir}" --include="*.js" 2>/dev/null || true`, { encoding: 'utf8' });
        if (result.trim()) {
          return true;
        }
      } catch (error) {
        // EN: Ignore grep errors
        // VI: Bỏ qua lỗi từ grep
      }
    }

    return false;
  } catch (error) {
    // EN: If detection fails, assume key is used for safety
    // VI: Nếu không kiểm tra được, giả định key đang dùng để an toàn
    return true;
  }
}

/**
 * Main function
 */
async function main() {
  const args = process.argv.slice(2);
  const isDryRun = args.includes('--dry-run');
  const isVerbose = args.includes('--verbose');
  const checkUsage = args.includes('--check-usage');
  const showHelp = args.includes('--help');
  const onlySpecificFiles = args.filter(arg => arg.endsWith('.js') && !arg.includes('/'));

  if (showHelp) {
    console.log(`${colors.bright}${colors.cyan}🔧 I18n Key Cleanup Tool${colors.reset}
    
Tool để tự động xóa các key dư thừa trong các file locale.
Sử dụng file en.js làm reference base.

${colors.yellow}Usage:${colors.reset}
  node tools/i18n/remove-extra-keys.js [options] [files...]

${colors.yellow}Options:${colors.reset}
  --dry-run       Preview changes without modifying files
  --verbose       Show detailed information about keys
  --check-usage   Check if keys are used in code before removing
  --help          Show this help message

${colors.yellow}Files:${colors.reset}
  Specify specific locale files to process (e.g. vi.js es.js)
  If no files specified, all locale files will be processed

${colors.yellow}Examples:${colors.reset}
  ${colors.green}node tools/i18n/remove-extra-keys.js --dry-run --verbose${colors.reset}
  ${colors.green}node tools/i18n/remove-extra-keys.js --check-usage vi.js${colors.reset}
  ${colors.green}node tools/i18n/remove-extra-keys.js de.js fr.js ja.js th.js${colors.reset}
`);
    return;
  }

  console.log(`${colors.bright}${colors.cyan}🔧 I18n Key Cleanup Tool${colors.reset}\n`);

  if (isDryRun) {
    console.log(`${colors.yellow}📋 DRY RUN MODE - No files will be modified${colors.reset}\n`);
  }

  if (checkUsage) {
    console.log(`${colors.cyan}🔍 Will check if keys are used in code before removing${colors.reset}\n`);
  }

  // EN: Load base locale file (en.js)
  // VI: Tải file locale gốc (en.js)
  const baseFilePath = path.join(localesDir, baseFile);
  if (!fs.existsSync(baseFilePath)) {
    console.error(`${colors.red}❌ Base file not found: ${baseFilePath}${colors.reset}`);
    process.exit(1);
  }

  console.log(`${colors.blue}📖 Loading base locale: ${baseFile}${colors.reset}`);
  const baseContent = await loadLocaleModule(baseFilePath);
  if (!baseContent) {
    console.error(`${colors.red}❌ Failed to load base file${colors.reset}`);
    process.exit(1);
  }

  const baseKeys = getAllKeys(baseContent);
  console.log(`${colors.green}✅ Base keys: ${baseKeys.size}${colors.reset}\n`);

  // EN: Collect all locale files
  // VI: Lấy tất cả các file locale
  const localeFiles = fs.readdirSync(localesDir)
    .filter(file => file.endsWith('.js') && file !== baseFile)
    .filter(file => onlySpecificFiles.length === 0 || onlySpecificFiles.includes(file))
    .sort();

  if (localeFiles.length === 0) {
    console.log(`${colors.yellow}⚠️  No other locale files found${colors.reset}`);
    return;
  }

  let totalExtraKeys = 0;
  let totalFilesModified = 0;

  // EN: Process each locale file
  // VI: Xử lý từng file locale
  for (const file of localeFiles) {
    const filePath = path.join(localesDir, file);
    console.log(`${colors.blue}🔍 Checking ${file}...${colors.reset}`);

    const content = await loadLocaleModule(filePath);
    if (!content) {
      continue;
    }

    const currentKeys = getAllKeys(content);
    const extraKeys = [...currentKeys].filter(key => !baseKeys.has(key));

    if (extraKeys.length === 0) {
      console.log(`${colors.green}  ✅ No extra keys found${colors.reset}`);
      continue;
    }

    console.log(`${colors.yellow}  ➕ Found ${extraKeys.length} extra keys:${colors.reset}`);

    let keysToRemove = extraKeys;

    if (checkUsage) {
      console.log(`${colors.cyan}    🔍 Checking usage in code...${colors.reset}`);
      const usageResults = await Promise.all(
        extraKeys.map(async key => ({
          key,
          used: await isKeyUsedInCode(key)
        }))
      );

      const usedKeys = usageResults.filter(r => r.used).map(r => r.key);
      keysToRemove = usageResults.filter(r => !r.used).map(r => r.key);

      if (usedKeys.length > 0) {
        console.log(`${colors.green}    ✅ Keys in use (will keep): ${usedKeys.length}${colors.reset}`);
        if (isVerbose) {
          usedKeys.forEach(key => {
            console.log(`${colors.green}      ✓ ${key}${colors.reset}`);
          });
        }
      }

      if (keysToRemove.length === 0) {
        console.log(`${colors.green}    ✅ All extra keys are in use - nothing to remove${colors.reset}`);
        continue;
      }

      console.log(`${colors.red}    🗑️  Unused keys to remove: ${keysToRemove.length}${colors.reset}`);
    }

    if (isVerbose) {
      keysToRemove.forEach(key => {
        console.log(`${colors.red}    • ${key}${colors.reset}`);
      });
    }

    if (!isDryRun) {
      // EN: Create a copy to modify
      // VI: Tạo bản copy để chỉnh sửa
      const modifiedContent = JSON.parse(JSON.stringify(content));

      // EN: Remove extra keys
      // VI: Xóa các key dư thừa
      let removedCount = 0;
      for (const key of keysToRemove) {
        if (removeKeyFromObject(modifiedContent, key)) {
          removedCount++;
        }
      }

      // EN: Cleanup empty nested objects
      // VI: Dọn các object rỗng
      cleanupObject(modifiedContent);

      // EN: Write locale file
      // VI: Ghi file locale
      try {
        writeLocaleFile(filePath, modifiedContent);
        console.log(`${colors.green}  ✅ Removed ${removedCount} keys from ${file}${colors.reset}`);
        totalFilesModified++;
      } catch (error) {
        console.error(`${colors.red}  ❌ Error writing ${file}: ${error.message}${colors.reset}`);
      }
    } else {
      console.log(`${colors.cyan}  📋 Would remove ${keysToRemove.length} keys${colors.reset}`);
    }

    totalExtraKeys += keysToRemove.length;
    console.log('');
  }

  // EN: Summary
  // VI: Tóm tắt
  console.log(`${colors.bright}${colors.magenta}📊 Summary:${colors.reset}`);
  console.log(`${colors.white}  • Files processed: ${localeFiles.length}${colors.reset}`);
  console.log(`${colors.white}  • Total extra keys found: ${totalExtraKeys}${colors.reset}`);

  if (!isDryRun) {
    console.log(`${colors.green}  • Files modified: ${totalFilesModified}${colors.reset}`);
    console.log(`${colors.bright}${colors.green}\n🎉 Cleanup completed!${colors.reset}`);
  } else {
    console.log(`${colors.yellow}\n💡 Run without --dry-run to apply changes${colors.reset}`);
  }
}

// Run
main().catch(error => {
  console.error(`${colors.red}❌ Fatal error: ${error.message}${colors.reset}`);
  process.exit(1);
});
