/**
 * EN: Find values identical to English (en.js) in other locales
 * VI: Tìm các giá trị trùng với tiếng Anh (en.js) ở locale khác để dịch
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

async function findUntranslatedValues() {
  const locales = ['de', 'es', 'fr', 'ja', 'th', 'vi'];
  const languageNames = {
    'de': 'German',
    'es': 'Spanish',
    'fr': 'French',
    'ja': 'Japanese',
    'th': 'Thai',
    'vi': 'Vietnamese'
  };

  console.log('🔍 Finding untranslated values (matching en.js) in locale files...\n');

  try {
    // EN: Load English base file
    // VI: Nạp file gốc tiếng Anh
    const enModule = await import(join(__dirname, '../../src/i18n/locales/en.js'));
    const enData = flattenObject(enModule.default);

    console.log(`📖 Base English (en.js): ${Object.keys(enData).length} keys loaded\n`);

    for (const locale of locales) {
      try {
        const module = await import(join(__dirname, `../../src/i18n/locales/${locale}.js`));
        const localeData = flattenObject(module.default);

        const untranslatedValues = [];
        for (const [key, enValue] of Object.entries(enData)) {
          const localeValue = localeData[key];
          // EN: Check if value exists and matches English exactly
          // VI: Kiểm tra giá trị tồn tại và trùng với tiếng Anh
          if (localeValue && localeValue === enValue && typeof enValue === 'string') {
            untranslatedValues.push({ key, value: enValue });
          }
        }

        console.log(`📁 ${languageNames[locale]} (${locale}.js): ${untranslatedValues.length} untranslated values`);

        if (untranslatedValues.length > 0) {
          console.log('   🔤 Keys needing translation:');
          untranslatedValues.slice(0, 15).forEach(({ key, value }) => {
            // EN: Truncate long values for readability
            // VI: Rút gọn giá trị dài cho dễ đọc
            const displayValue = value.length > 60 ? value.substring(0, 60) + '...' : value;
            console.log(`     • ${key}: "${displayValue}"`);
          });
          if (untranslatedValues.length > 15) {
            console.log(`     ... and ${untranslatedValues.length - 15} more`);
          }
          console.log('');
        } else {
          console.log('   ✅ All values appear to be translated\n');
        }

      } catch (error) {
        console.error(`❌ Error loading ${locale}.js:`, error.message);
      }
    }

  } catch (error) {
    console.error('❌ Error loading en.js:', error.message);
  }
}

findUntranslatedValues();
