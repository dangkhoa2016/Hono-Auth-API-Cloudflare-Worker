/**
 * EN:
 *   - Export untranslated keys to separate [locale]-auto-english.js files.
 *   - Scans locale files for values that are still English.
 *   - Usage: node export_untranslated_keys.js
 *   - Output files: de-auto-english.js, es-auto-english.js, fr-auto-english.js, ja-auto-english.js, th-auto-english.js, vi-auto-english.js.
 * VI:
 *   - Xuất các key chưa dịch vào file [locale]-auto-english.js riêng.
 *   - Quét file locale để tìm giá trị vẫn còn tiếng Anh.
 *   - Cách dùng: node export_untranslated_keys.js
 *   - File tạo ra: de-auto-english.js, es-auto-english.js, fr-auto-english.js, ja-auto-english.js, th-auto-english.js, vi-auto-english.js.
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { writeFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// EN: Flatten nested object and collect key/value pairs
// VI: Làm phẳng object lồng nhau để gom key/value
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

// EN: Rebuild nested object from flattened keys
// VI: Dựng lại object lồng nhau từ key phẳng
function buildNestedObject(flatObj) {
  const result = {};

  for (const [key, value] of Object.entries(flatObj)) {
    const keys = key.split('.');
    let current = result;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  return result;
}

// EN: Format object as JavaScript code
// VI: Định dạng object thành mã JavaScript
function formatAsJavaScript(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  const items = [];

  for (const [key, value] of Object.entries(obj)) {
    if (typeof value === 'object' && value !== null) {
      items.push(`${spaces}  ${key}: {\n${formatAsJavaScript(value, indent + 1)}\n${spaces}  }`);
    } else {
      // Escape quotes and format string
      const escapedValue = typeof value === 'string'
        ? `'${value.replace(/'/g, '\\\'').replace(/\n/g, '\\n')}'`
        : JSON.stringify(value);
      items.push(`${spaces}  ${key}: ${escapedValue}`);
    }
  }

  return items.join(',\n');
}

async function exportUntranslatedKeys() {
  const locales = ['de', 'es', 'fr', 'ja', 'th', 'vi'];
  const languageNames = {
    'de': 'German',
    'es': 'Spanish',
    'fr': 'French',
    'ja': 'Japanese',
    'th': 'Thai',
    'vi': 'Vietnamese'
  };

  console.log('🔄 Exporting missing keys to separate files...\n');

  try {
    // Load English base file
    const enModule = await import(join(__dirname, '../../src/i18n/locales/en.js'));
    const enData = flattenObject(enModule.default);

    console.log(`📖 Base English (en.js): ${Object.keys(enData).length} keys loaded\n`);

    let totalExported = 0;

    for (const locale of locales) {
      try {
        const module = await import(join(__dirname, `../../src/i18n/locales/${locale}.js`));
        const localeData = flattenObject(module.default);

        // Find MISSING keys (not just English values)
        const missingKeys = {};
        for (const [key, enValue] of Object.entries(enData)) {
          // Check if the key is completely missing from locale file
          if (!(key in localeData)) {
            missingKeys[key] = enValue;
          }
        }

        if (Object.keys(missingKeys).length > 0) {
          // Convert flat keys back to nested structure
          const nestedObject = buildNestedObject(missingKeys);

          // Generate JavaScript file content
          const fileContent = `/**
 * ${languageNames[locale]} (${locale}) - Missing Keys
 * 
 * These keys are missing from ${locale}.js and need translation.
 * Generated on: ${new Date().toISOString()}
 * Total keys to translate: ${Object.keys(missingKeys).length}
 * 
 * Instructions:
 * 1. Translate all string values to ${languageNames[locale]}
 * 2. Keep the key structure unchanged
 * 3. Preserve placeholders like {{variable}} in translations
 * 4. After translation, merge back into ${locale}.js
 */

export default {
${formatAsJavaScript(nestedObject)}
};
`;

          // Write to file
          const outputPath = join(__dirname, `${locale}-auto-english.js`);
          writeFileSync(outputPath, fileContent, 'utf8');

          console.log(`✅ ${languageNames[locale]} (${locale}): ${Object.keys(missingKeys).length} missing keys exported`);
          console.log(`   📄 File: ${locale}-missing-keys.js`);

          totalExported += Object.keys(missingKeys).length;
        } else {
          console.log(`✅ ${languageNames[locale]} (${locale}): No missing keys found`);
        }

      } catch (error) {
        console.error(`❌ Error processing ${locale}.js:`, error.message);
      }
    }

    console.log('\n🎉 Export completed!');
    console.log(`📊 Total missing keys exported: ${totalExported}`);
    console.log(`📁 Files created: ${locales.length} *-missing-keys.js files`);
    console.log('\n💡 Next steps:');
    console.log('   1. Open each *-missing-keys.js file');
    console.log('   2. Translate all English values to the target language');
    console.log('   3. Copy translated content to original locale files');
    console.log('   4. Run "node tools/i18n/master.js compare" to verify no missing keys');

  } catch (error) {
    console.error('❌ Error loading en.js:', error.message);
  }
}

exportUntranslatedKeys();
