/**
 * Translation Progress Checker
 *
 * This script checks the translation progress by comparing
 * *-auto-english.js files with original locale files.
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

// Function to flatten nested object and collect key-value pairs
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

      // Load original locale file
      const originalModule = await import(originalPath);
      const originalFlat = flattenObject(originalModule.default);
      const originalCount = Object.keys(originalFlat).length;

      let needTranslationCount = 0;
      let translatedCount = 0;

      if (existsSync(autoEnglishPath)) {
        // Load auto-english file
        const autoEnglishModule = await import(autoEnglishPath);
        const autoEnglishFlat = flattenObject(autoEnglishModule.default);
        needTranslationCount = Object.keys(autoEnglishFlat).length;

        // Count how many have been translated (changed from original English)
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

      // Status indicators
      const statusIcon = progressPercent === 100 ? '✅' :
        progressPercent >= 75 ? '🟡' :
          progressPercent >= 25 ? '🟠' : '🔴';

      console.log(`${statusIcon} ${languageNames[locale]} (${locale}.js)`);
      console.log(`   📄 Total keys: ${originalCount}`);

      if (needTranslationCount > 0) {
        console.log(`   🔤 Need translation: ${needTranslationCount}`);
        console.log(`   ✅ Translated: ${translatedCount}`);
        console.log(`   📊 Progress: ${progressPercent}% (${translatedCount}/${needTranslationCount})`);

        // Progress bar
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

      // Accumulate totals
      totalOriginal += originalCount;
      totalNeedTranslation += needTranslationCount;
      totalTranslated += translatedCount;

    } catch (error) {
      console.error(`❌ Error checking ${locale}:`, error.message);
    }
  }

  // Overall summary
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

    // Overall progress bar
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

// Parse command line arguments
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
