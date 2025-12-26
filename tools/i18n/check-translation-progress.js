/**
 * EN: Translation progress checker comparing *-auto-english.js with originals
 * VI: Công cụ kiểm tra tiến độ dịch bằng cách so sánh *-auto-english.js với bản gốc
 *
 * Usage:
 *   node check_translation_progress.js           # Check all locales
 *   node check_translation_progress.js [locale]  # Check specific locale
 *
 * Examples:
 *   node check_translation_progress.js           # Check all
 *   node check_translation_progress.js de        # Check German only
 */

import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { existsSync } from 'fs';

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

async function checkTranslationProgress(targetLocale = 'all') {
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

  console.log('📊 Translation Progress Report\n');
  console.log('=' .repeat(50));

  let totalOriginal = 0;
  let totalNeedTranslation = 0;
  let totalTranslated = 0;

  for (const locale of processLocales) {
    if (!locales.includes(locale)) {
      console.error(`❌ Invalid locale: ${locale}. Valid locales: ${locales.join(', ')}`);
      continue;
    }

    try {
      const autoEnglishPath = join(__dirname, `${locale}-auto-english.js`);
      const originalPath = join(__dirname, `../../src/i18n/locales/${locale}.js`);

      if (!existsSync(originalPath)) {
        console.error(`❌ ${languageNames[locale]} (${locale}): Original locale file not found`);
        continue;
      }

      // EN: Load original locale file
      // VI: Nạp file locale gốc
      const originalModule = await import(originalPath);
      const originalFlat = flattenObject(originalModule.default);
      const originalCount = Object.keys(originalFlat).length;

      let needTranslationCount = 0;
      let translatedCount = 0;

      if (existsSync(autoEnglishPath)) {
        // EN: Load auto-english file
        // VI: Nạp file auto-english
        const autoEnglishModule = await import(autoEnglishPath);
        const autoEnglishFlat = flattenObject(autoEnglishModule.default);
        needTranslationCount = Object.keys(autoEnglishFlat).length;

        // EN: Count how many entries have translated values
        // VI: Đếm số mục đã được dịch khác với tiếng Anh
        for (const [key, englishValue] of Object.entries(autoEnglishFlat)) {
          const currentValue = originalFlat[key];
          if (currentValue && currentValue !== englishValue) {
            translatedCount++;
          }
        }
      }

      const progressPercent = needTranslationCount > 0
        ? Math.round((translatedCount / needTranslationCount) * 100)
        : 100;

      // EN: Status indicators
      // VI: Chỉ báo trạng thái
      const statusIcon = progressPercent === 100 ? '✅' :
        progressPercent >= 75 ? '🟡' :
          progressPercent >= 25 ? '🟠' : '🔴';

      console.log(`${statusIcon} ${languageNames[locale]} (${locale}.js)`);
      console.log(`   📄 Total keys: ${originalCount}`);

      if (needTranslationCount > 0) {
        console.log(`   🔤 Need translation: ${needTranslationCount}`);
        console.log(`   ✅ Translated: ${translatedCount}`);
        console.log(`   📊 Progress: ${progressPercent}% (${translatedCount}/${needTranslationCount})`);

        // EN: Progress bar
        // VI: Thanh tiến độ
        const barLength = 20;
        const filledLength = Math.round((progressPercent / 100) * barLength);
        const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
        console.log(`   📈 [${bar}] ${progressPercent}%`);

        if (progressPercent < 100) {
          const remaining = needTranslationCount - translatedCount;
          console.log(`   ⏳ Remaining: ${remaining} keys to translate`);
        }
      } else {
        console.log('   🎉 No translations needed - fully localized!');
      }

      console.log('');

      // EN: Accumulate totals
      // VI: Cộng dồn số liệu tổng
      totalOriginal += originalCount;
      totalNeedTranslation += needTranslationCount;
      totalTranslated += translatedCount;

    } catch (error) {
      console.error(`❌ Error checking ${locale}:`, error.message);
    }
  }

  // EN: Overall summary
  // VI: Tổng quan
  if (processLocales.length > 1) {
    console.log('=' .repeat(50));
    console.log('📈 OVERALL SUMMARY');
    console.log('=' .repeat(50));

    const overallProgress = totalNeedTranslation > 0
      ? Math.round((totalTranslated / totalNeedTranslation) * 100)
      : 100;

    console.log(`📄 Total keys across all locales: ${totalOriginal}`);
    console.log(`🔤 Total keys needing translation: ${totalNeedTranslation}`);
    console.log(`✅ Total keys translated: ${totalTranslated}`);
    console.log(`📊 Overall progress: ${overallProgress}% (${totalTranslated}/${totalNeedTranslation})`);

    // EN: Overall progress bar
    // VI: Thanh tiến độ tổng
    const barLength = 30;
    const filledLength = Math.round((overallProgress / 100) * barLength);
    const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
    console.log(`📈 [${bar}] ${overallProgress}%`);

    if (overallProgress < 100) {
      const remaining = totalNeedTranslation - totalTranslated;
      console.log(`⏳ Total remaining: ${remaining} keys to translate`);
    } else {
      console.log('🎉 All translations completed!');
    }
  }

  console.log('\n💡 Tips:');
  console.log('   • Open *-auto-english.js files to translate');
  console.log('   • Use merge_translated_keys.js to apply translations');
  console.log('   • Run find_english_values.js to verify completion');
}

// EN: Parse command line arguments
// VI: Phân tích tham số dòng lệnh
const args = process.argv.slice(2);
const targetLocale = args[0] || 'all';

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
Usage:
  node check_translation_progress.js           # Check all locales
  node check_translation_progress.js [locale]  # Check specific locale

Examples:
  node check_translation_progress.js           # Check all
  node check_translation_progress.js de        # Check German only

Available locales: de, es, fr, ja, th, vi
`);
  process.exit(0);
}

checkTranslationProgress(targetLocale);
