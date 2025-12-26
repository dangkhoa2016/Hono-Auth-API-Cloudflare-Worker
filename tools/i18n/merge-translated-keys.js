/**
 * EN: Merge translated keys from [locale]-auto-english.js back to originals
 * VI: Gộp các key đã dịch từ file [locale]-auto-english.js vào file locale gốc
 *
 * Usage:
 *   node merge_translated_keys.js [locale]     # Merge specific locale
 *   node merge_translated_keys.js all         # Merge all locales
 *   node merge_translated_keys.js --dry-run   # Preview changes without applying
 *
 * Examples:
 *   node merge_translated_keys.js de          # Merge German translations
 *   node merge_translated_keys.js all         # Merge all locales
 *   node merge_translated_keys.js --dry-run   # Preview all changes
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync, writeFileSync, existsSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// EN: Flatten nested object to key/value pairs
// VI: Trải phẳng object lồng thành cặp key/giá trị
function flattenObject(obj, prefix = '') {
  const result = {};
  for (const key in obj) {
    if (obj[key] !== undefined) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        Object.assign(result, flattenObject(obj[key], fullKey));
      } else {
        result[fullKey] = obj[key];
      }
    }
  }
  return result;
}

// EN: Deep merge two objects
// VI: Gộp sâu hai object
function deepMerge(target, source) {
  const result = { ...target };

  for (const key in source) {
    if (source[key] !== undefined) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        result[key] = deepMerge(result[key] || {}, source[key]);
      } else {
        result[key] = source[key];
      }
    }
  }

  return result;
}

// EN: Format object back to JS code
// VI: Định dạng object thành mã JS
function formatAsJavaScript(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  const items = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      items.push(`${spaces}  ${key}: {\n${formatAsJavaScript(value, indent + 1)}\n${spaces}  }`);
    } else {
      // EN: Escape quotes and format string
      // VI: Thoát ký tự nháy và định dạng chuỗi
      const escapedValue = typeof value === 'string'
        ? `'${value.replace(/'/g, '\\\'').replace(/\n/g, '\\n')}'`
        : JSON.stringify(value);
      items.push(`${spaces}  ${key}: ${escapedValue}`);
    }
  }

  return items.join(',\n');
}

async function mergeTranslatedKeys(targetLocale = 'all', isDryRun = false) {
  const locales = ['de', 'es', 'fr', 'ja', 'th', 'vi'];
  const languageNames = {
    'de': 'German',
    'es': 'Spanish',
    'fr': 'French',
    'ja': 'Japanese',
    'th': 'Thai',
    'vi': 'Vietnamese'
  };

  const processLocales = targetLocale === 'all' ? locales : [targetLocale];

  console.log(`🔄 ${isDryRun ? 'Previewing' : 'Merging'} translated keys...\n`);

  let totalMerged = 0;

  for (const locale of processLocales) {
    if (!locales.includes(locale)) {
      console.error(`❌ Invalid locale: ${locale}. Valid locales: ${locales.join(', ')}`);
      continue;
    }

    try {
      const autoEnglishPath = join(__dirname, `${locale}-auto-english.js`);
      const originalPath = join(__dirname, `../../src/i18n/locales/${locale}.js`);

      if (!existsSync(autoEnglishPath)) {
        console.log(`⚠️  ${languageNames[locale]} (${locale}): Auto-english file not found`);
        continue;
      }

      if (!existsSync(originalPath)) {
        console.error(`❌ ${languageNames[locale]} (${locale}): Original locale file not found`);
        continue;
      }

      // EN: Load both locale variants
      // VI: Nạp cả hai phiên bản locale
      const autoEnglishModule = await import(autoEnglishPath);
      const originalModule = await import(originalPath);

      // EN: Merge original with auto-english
      // VI: Gộp bản gốc với auto-english
      const mergedObject = deepMerge(originalModule.default, autoEnglishModule.default);

      // EN: Count how many entries change
      // VI: Đếm số mục thay đổi
      const originalFlat = flattenObject(originalModule.default);
      const autoEnglishFlat = flattenObject(autoEnglishModule.default);
      const mergedFlat = flattenObject(mergedObject);

      let changesCount = 0;
      for (const key in autoEnglishFlat) {
        if (originalFlat[key] !== autoEnglishFlat[key]) {
          changesCount++;
        }
      }

      if (changesCount === 0) {
        console.log(`✅ ${languageNames[locale]} (${locale}): No changes to merge`);
        continue;
      }

      console.log(`📝 ${languageNames[locale]} (${locale}): ${changesCount} translations to merge`);

      if (!isDryRun) {
        // EN: Generate new file content
        // VI: Tạo nội dung file mới
        const fileContent = `/**
 * ${languageNames[locale]} (${locale}) translations
 * Last updated: ${new Date().toISOString()}
 * Total keys: ${Object.keys(mergedFlat).length}
 */

export default {
${formatAsJavaScript(mergedObject)}
};
`;

        // EN: Backup original file
        // VI: Sao lưu file gốc
        const backupPath = `${originalPath}.backup-${Date.now()}`;
        const originalContent = readFileSync(originalPath, 'utf8');
        writeFileSync(backupPath, originalContent, 'utf8');

        // EN: Write merged content
        // VI: Ghi nội dung đã gộp
        writeFileSync(originalPath, fileContent, 'utf8');

        console.log('   ✅ Merged successfully');
        console.log(`   💾 Backup created: ${backupPath.split('/').pop()}`);

        totalMerged += changesCount;
      } else {
        console.log(`   👁️  Preview: ${changesCount} translations would be merged`);

        // EN: Show a few sample changes
        // VI: Hiển thị một vài thay đổi mẫu
        const examples = [];
        for (const key in autoEnglishFlat) {
          if (originalFlat[key] !== autoEnglishFlat[key] && examples.length < 3) {
            examples.push({
              key,
              old: originalFlat[key] || '[not exists]',
              new: autoEnglishFlat[key]
            });
          }
        }

        if (examples.length > 0) {
          console.log('   📋 Example changes:');
          examples.forEach(({ key, old, new: newVal }) => {
            const shortOld = old.length > 50 ? old.substring(0, 50) + '...' : old;
            const shortNew = newVal.length > 50 ? newVal.substring(0, 50) + '...' : newVal;
            console.log(`     • ${key}`);
            console.log(`       Old: "${shortOld}"`);
            console.log(`       New: "${shortNew}"`);
          });
        }
      }

    } catch (error) {
      console.error(`❌ Error processing ${locale}:`, error.message);
    }
  }

  if (!isDryRun && totalMerged > 0) {
    console.log('\n🎉 Merge completed!');
    console.log(`📊 Total translations merged: ${totalMerged}`);
    console.log('💡 Next steps:');
    console.log('   1. Test the application with new translations');
    console.log('   2. Run: node find_english_values.js to verify no English values remain');
    console.log('   3. Delete *-auto-english.js files when satisfied');
  } else if (isDryRun) {
    console.log('\n👁️  Preview completed! Run without --dry-run to apply changes.');
  }
}

// EN: Parse command line arguments
// VI: Phân tích tham số dòng lệnh
const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const targetLocale = args.find(arg => arg !== '--dry-run') || 'all';

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage:
  node merge_translated_keys.js [locale]     # Merge specific locale  
  node merge_translated_keys.js all         # Merge all locales
  node merge_translated_keys.js --dry-run   # Preview changes

Examples:
  node merge_translated_keys.js de          # Merge German translations
  node merge_translated_keys.js all         # Merge all locales  
  node merge_translated_keys.js --dry-run   # Preview all changes

Available locales: de, es, fr, ja, th, vi
`);
  process.exit(0);
}

mergeTranslatedKeys(targetLocale, isDryRun);
