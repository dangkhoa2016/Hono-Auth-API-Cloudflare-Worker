#!/usr/bin/env node

/**
 * i18n Master Management Tool
 *
 * EN:
 *   - Consolidated tool for all i18n translation management needs.
 *   - Features:
 *     - Advanced translation key management.
 *     - Complete translation workflow.
 *     - System testing and verification.
 *     - Add new languages.
 *     - Compare and auto-fix.
 *   - Usage: node tools/i18n/master.js [command] [options].
 * VI:
 *   - Tổng hợp tất cả công cụ quản lý i18n vào một interface duy nhất.
 *   - Tính năng:
 *     - Quản lý khóa dịch thuật nâng cao.
 *     - Workflow dịch thuật hoàn chỉnh.
 *     - Test và xác minh hệ thống.
 *     - Thêm ngôn ngữ mới.
 *     - So sánh và sửa lỗi.
 *   - Cách dùng: node tools/i18n/master.js [command] [options].
 */

import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOCALES_DIR = path.resolve(__dirname, '../../src/i18n/locales');

// Colors for output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  purple: '\x1b[35m'
};

// Print functions
function printHeader(text) {
  console.log(`${colors.blue}${'='.repeat(60)}`);
  console.log(`${text}`);
  console.log(`${'='.repeat(60)}${colors.reset}`);
}

function printSuccess(text) {
  console.log(`${colors.green}✅ ${text}${colors.reset}`);
}

function printError(text) {
  console.log(`${colors.red}❌ ${text}${colors.reset}`);
}

function printWarning(text) {
  console.log(`${colors.yellow}⚠️  ${text}${colors.reset}`);
}

function printInfo(text) {
  console.log(`${colors.cyan}ℹ️  ${text}${colors.reset}`);
}

function printStep(step, text) {
  console.log(`${colors.magenta}${step}${colors.reset} ${text}`);
}

/**
 * Run a script and return a promise
 */
function runScript(scriptPath, args = [], description = '') {
  return new Promise((resolve, reject) => {
    if (description) {
      printInfo(description);
    }

    const isShellScript = scriptPath.endsWith('.sh');
    const cmd = isShellScript ? 'bash' : 'node';

    const child = spawn(cmd, [scriptPath, ...args], {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Script ${scriptPath} exited with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(new Error(`Error running ${scriptPath}: ${error.message}`));
    });
  });
}

/**
 * Load translation file content
 */
async function loadTranslationFile(filePath) {
  try {
  // Add cache-busting query param to ensure we always load the latest file contents
  const cacheBuster = `?t=${Date.now()}`;
  const module = await import(`file://${filePath}${cacheBuster}`);
    return module.default;
  } catch (error) {
    console.error(`Error loading ${filePath}:`, error.message);
    return null;
  }
}

/**
 * Helper function to set nested value in object
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

function isPlainObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function sortTranslationObject(obj) {
  if (!isPlainObject(obj)) {
    return obj;
  }

  const entries = Object.entries(obj).map(([key, value]) => {
    const sortedValue = sortTranslationObject(value);
    return { key, value: sortedValue, isObject: isPlainObject(sortedValue) };
  });

  entries.sort((a, b) => {
    if (a.isObject && !b.isObject) {return -1;}
    if (!a.isObject && b.isObject) {return 1;}
    return a.key.localeCompare(b.key);
  });

  return entries.reduce((acc, entry) => {
    acc[entry.key] = entry.value;
    return acc;
  }, {});
}

// Sorting helpers reused from standalone sort tool to avoid duplication
function sortObjectDeep(obj) {
  if (Array.isArray(obj)) {return obj;}
  if (obj && typeof obj === 'object') {
    const sorted = {};
    Object.keys(obj)
      .sort((a, b) => {
        const aIsObj = obj[a] && typeof obj[a] === 'object' && !Array.isArray(obj[a]);
        const bIsObj = obj[b] && typeof obj[b] === 'object' && !Array.isArray(obj[b]);
        if (aIsObj && !bIsObj) {return -1;}
        if (!aIsObj && bIsObj) {return 1;}
        return a.localeCompare(b, 'en');
      })
      .forEach(key => {
        sorted[key] = sortObjectDeep(obj[key]);
      });
    return sorted;
  }
  return obj;
}

function extractHeader(content) {
  const headerMatch = content.match(/^\s*\/\*([\s\S]*?)\*\//);
  let header = '';
  let rest = content;
  if (headerMatch && headerMatch.index === 0) {
    header = headerMatch[0].trim();
    rest = content.slice(headerMatch[0].length).trimStart();
  }
  return { header, rest };
}

function parseExportObject(content) {
  const exportMatch = content.match(/export\s+default\s+({[\s\S]*});?/);
  if (!exportMatch) {
    throw new Error('Không tìm thấy export default object');
  }
  const objectCode = exportMatch[1];
  // eslint-disable-next-line no-new-func
  const fn = new Function(`return (${objectCode});`);
  return { object: fn(), objectCode, fullMatch: exportMatch[0] };
}

function formatObject(obj, indent = 2) {
  const space = ' '.repeat(indent);
  function inner(value, level) {
    if (Array.isArray(value)) {
      return '[' + value.map(v => inner(v, level + 1)).join(', ') + ']';
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value);
      if (!entries.length) {return '{}';}
      const pad = ' '.repeat(level * indent);
      const padInner = ' '.repeat((level + 1) * indent);
      const lines = entries.map(([k, v]) => `${padInner}'${k}': ${inner(v, level + 1)}`);
      return `{
${lines.join(',\n')}
${pad}}`;
    }
    if (typeof value === 'string') {
      // Use JSON.stringify for correct escaping (newlines, backslashes) then wrap with single quotes
      const jsonEscaped = JSON.stringify(value).slice(1, -1); // drop surrounding quotes
      const singleQuoted = jsonEscaped.replace(/'/g, "\\'");
      return `'${singleQuoted}'`;
    }
    return JSON.stringify(value);
  }
  return inner(obj, 0);
}

function objectToJS(obj, indent = 0) {
  const spaces = '  '.repeat(indent);
  const innerSpaces = '  '.repeat(indent + 1);

  if (typeof obj !== 'object' || obj === null || Array.isArray(obj)) {
    return JSON.stringify(obj);
  }

  const entries = Object.entries(obj);
  if (entries.length === 0) {return '{}';}

  const lines = entries.map(([key, value]) => {
    const jsValue = objectToJS(value, indent + 1);
    return `${innerSpaces}'${key}': ${jsValue}`;
  });

  return `{
${lines.join(',\n')}
${spaces}}`;
}

async function sortTranslationFile(filePath) {
  try {
    const currentTranslation = await loadTranslationFile(filePath);
    if (!currentTranslation) {return false;}

    const sortedTranslation = sortTranslationObject(currentTranslation);
    const fileContent = `/**
 * ${path.basename(filePath, '.js').toUpperCase()} translations (camelCase format)
 * Auto-sorted by i18n management tool
 * Last updated: ${new Date().toISOString()}
*/

export default ${objectToJS(sortedTranslation)};
`;

    fs.writeFileSync(filePath, fileContent);
    return true;

  } catch (error) {
    printError(`Error sorting ${filePath}: ${error.message}`);
    return false;
  }
}

function sortLocaleKeys(targetLocales = [], options = {}) {
  const files = fs.readdirSync(LOCALES_DIR).filter(file => file.endsWith('.js'));
  const targetSet = new Set(targetLocales.map(locale => `${locale}.js`));

  if (targetLocales.length > 0) {
    const missing = [...targetSet].filter(file => !files.includes(file));
    missing.forEach(file => printWarning(`Locale file not found: ${file}`));
  }

  const filesToProcess = targetLocales.length > 0
    ? files.filter(file => targetSet.has(file))
    : files;

  if (filesToProcess.length === 0) {
    printWarning('No locale files to sort');
    return { changed: 0, total: 0, report: [] };
  }

  let changedCount = 0;
  const report = [];

  for (const file of filesToProcess) {
    const filePath = path.join(LOCALES_DIR, file);
    try {
      const original = fs.readFileSync(filePath, 'utf8');
      const { header, rest } = extractHeader(original);
      const { object: data } = parseExportObject(rest);
      const sorted = sortObjectDeep(data);
      const formatted = `${header ? header + '\n\n' : ''}export default ${formatObject(sorted)};\n`;

      const changed = formatted.trim() !== original.trim();
      if (changed) {
        changedCount++;
        if (options.fix) {
          if (options.backup) {
            fs.writeFileSync(`${filePath}.bak`, original, 'utf8');
          }
          fs.writeFileSync(filePath, formatted, 'utf8');
        }
      }

      report.push({ file, changed });
    } catch (error) {
      report.push({ file, error: error.message });
    }
  }

  return { changed: changedCount, total: report.length, report };
}

/**
 * Update translation file with new content
 */
async function updateTranslationFile(filePath, missingKeys) {
  try {
    const currentTranslation = await loadTranslationFile(filePath);
    if (!currentTranslation) {return false;}

    for (const [keyPath, value] of Object.entries(missingKeys)) {
      setNestedValue(currentTranslation, keyPath, value);
    }


    const fileContent = `/**
 * ${path.basename(filePath, '.js').toUpperCase()} translations (camelCase format)
 * Auto-updated by i18n management tool
 * Last updated: ${new Date().toISOString()}
*/

export default ${objectToJS(currentTranslation)};
`;

    fs.writeFileSync(filePath, fileContent);
    return true;

  } catch (error) {
    printError(`Error updating ${filePath}: ${error.message}`);
    return false;
  }
}

/**
 * Compare all translations and find missing keys
 */
async function compareTranslations() {
  printInfo('Comparing translations across all locales...');

  try {
    const files = fs.readdirSync(LOCALES_DIR).filter(file => file.endsWith('.js'));
    const baseFile = 'en.js';

    if (!files.includes(baseFile)) {
      printError('Base translation file (en.js) not found');
      return [];
    }

    const basePath = path.join(LOCALES_DIR, baseFile);
    const baseTranslation = await loadTranslationFile(basePath);

    if (!baseTranslation) {
      printError('Failed to load base translation');
      return [];
    }

    const extractKeys = (obj, prefix = '') => {
      const keys = {};
      for (const [key, value] of Object.entries(obj)) {
        const fullKey = prefix ? `${prefix}.${key}` : key;
        if (isPlainObject(value)) {
          Object.assign(keys, extractKeys(value, fullKey));
        } else {
          keys[fullKey] = value;
        }
      }
      return keys;
    };

    const baseKeys = extractKeys(baseTranslation);
    const results = [];

    for (const file of files) {
      if (file === baseFile) {continue;}

      const locale = path.basename(file, '.js');
      const localePath = path.join(LOCALES_DIR, file);
      const localeTranslation = await loadTranslationFile(localePath);

      if (!localeTranslation) {
        printWarning(`Failed to load ${file}`);
        continue;
      }

      const localeKeys = extractKeys(localeTranslation);
      const missingKeys = {};

      for (const [key, value] of Object.entries(baseKeys)) {
        if (!localeKeys[key]) {
          missingKeys[key] = value;
        }
      }

      if (Object.keys(missingKeys).length > 0) {
        results.push({
          locale,
          file,
          missingCount: Object.keys(missingKeys).length,
          missingKeys
        });
      }
    }

    if (results.length === 0) {
      printSuccess('All locales are up to date!');
    } else {
      console.log(`\n${colors.yellow}📊 Missing Keys Summary:${colors.reset}\n`);

      results.forEach(result => {
        console.log(`${colors.red}❌ ${result.locale}${colors.reset}: ${result.missingCount} missing keys`);
      });

      console.log(`\n${colors.cyan}Use 'details <locale>' to see specific missing keys${colors.reset}`);
      console.log(`${colors.cyan}Use 'fix' to auto-fix all missing keys${colors.reset}`);
    }

    return results;

  } catch (error) {
    printError(`Error comparing translations: ${error.message}`);
    return [];
  }
}

/**
 * Auto-fix missing keys
 */
async function autoFixMissingKeys(results) {
  if (!results || results.length === 0) {
    printSuccess('No missing keys to fix!');
    return true;
  }

  printInfo('Auto-fixing missing keys...');

  let fixedCount = 0;
  for (const result of results) {
    const filePath = path.join(LOCALES_DIR, result.file);
    printInfo(`Fixing ${result.locale} (${result.missingCount} keys)...`);

    const success = await updateTranslationFile(filePath, result.missingKeys);
    if (success) {
      fixedCount++;
      printSuccess(`✅ Fixed ${result.locale}`);
    } else {
      printError(`❌ Failed to fix ${result.locale}`);
    }
  }

  console.log(`\n${colors.green}📈 Fixed ${fixedCount}/${results.length} locales${colors.reset}`);
  return fixedCount === results.length;
}

/**
 * Show detailed missing keys for a specific locale
 */
async function showDetailedMissingKeys(locale) {
  printHeader(`🔍 DETAILED ANALYSIS FOR ${locale.toUpperCase()}`);

  const results = await compareTranslations();
  const localeResult = results.find(r => r.locale === locale);

  if (!localeResult) {
    if (results.length === 0) {
      printSuccess('All locales are up to date!');
    } else {
      printError(`Locale ${locale} not found in missing keys list`);
    }
    return;
  }

  console.log(`\n📊 Missing Keys in ${locale} (${localeResult.missingCount} total):\n`);

  // Group by section
  const keysBySection = {};
  Object.keys(localeResult.missingKeys).forEach(key => {
    const section = key.split('.')[0];
    if (!keysBySection[section]) {
      keysBySection[section] = [];
    }
    keysBySection[section].push(key);
  });

  Object.entries(keysBySection).forEach(([section, keys]) => {
    console.log(`${colors.magenta}📁 ${section}${colors.reset} (${keys.length} keys):`);
    keys.forEach(key => {
      const value = localeResult.missingKeys[key];
      console.log(`   ${colors.cyan}${key}${colors.reset}: "${value}"`);
    });
    console.log();
  });
}

/**
 * Add a new key to base translation and propagate
 */
async function addNewKey(keyPath, value, autoPropagate = true) {
  printHeader(`➕ ADDING NEW KEY: ${keyPath}`);

  const baseFilePath = path.join(LOCALES_DIR, 'en.js');

  try {
    // Load base translation
    const baseTranslation = await loadTranslationFile(baseFilePath);
    if (!baseTranslation) {
      printError('Failed to load base translation');
      return false;
    }

    // Check if key already exists
    const existingValue = keyPath.split('.').reduce((obj, key) => obj?.[key], baseTranslation);
    if (existingValue !== undefined) {
      printWarning(`Key already exists with value: "${existingValue}"`);
      return false;
    }

    // Add key to base translation
    setNestedValue(baseTranslation, keyPath, value);

    // Update base file
    const success = await updateTranslationFile(baseFilePath, { [keyPath]: value });
    if (!success) {
      printError('Failed to update base translation');
      return false;
    }

    printSuccess('Added key to base translation (en.js)');

    if (autoPropagate) {
      printInfo('Propagating to other locales...');

      // Compare and auto-fix
      const results = await compareTranslations();
      await autoFixMissingKeys(results);
    }

    return true;

  } catch (error) {
    printError(`Error adding key: ${error.message}`);
    return false;
  }
}

/**
 * Run complete translation workflow
 */
async function runTranslationWorkflow() {
  printHeader('🌍 COMPLETE TRANSLATION WORKFLOW');

  try {
    printStep('🔍 STEP 1:', 'Finding English values in locale files...');
    await runScript('tools/i18n/find-english-values.js');

    console.log();
    printStep('📤 STEP 2:', 'Exporting untranslated keys...');
    await runScript('tools/i18n/export-untranslated-keys.js');

    console.log();
    printStep('� STEP 3:', 'Checking and fixing missing keys...');
    const missingKeysResults = await compareTranslations();
    if (missingKeysResults.length > 0) {
      printWarning(`Found missing keys in ${missingKeysResults.length} locales. Auto-fixing...`);
      await autoFixMissingKeys(missingKeysResults);
    } else {
      printSuccess('No missing keys found!');
    }

    console.log();
    printStep('�📊 STEP 4:', 'Checking translation progress...');
    await runScript('tools/i18n/check-translation-progress.js');

    console.log();
    printStep('✅ STEP 5:', 'Final verification...');
    const finalCheck = await compareTranslations();
    if (finalCheck.length === 0) {
      printSuccess('All translations are synchronized!');
    } else {
      printWarning(`Still ${finalCheck.length} locales with missing keys.`);
    }

    console.log();
    printHeader('🎯 WORKFLOW GUIDANCE');
    printInfo('Next steps for complete workflow:');
    console.log('  1. ✅ Keys exported to *-auto-english.js files');
    console.log('  2. 📝 MANUAL: Translate values in auto-english files');
    console.log('  3. 🔄 Run: node tools/i18n/master.js merge [locale]');
    console.log('  4. 📊 Run: node tools/i18n/master.js progress');
    console.log('  5. ✅ Run: node tools/i18n/master.js verify');
    console.log('  6. 🧹 Run: node tools/i18n/master.js clean');

    printSuccess('Workflow completed successfully!');
    return true;

  } catch (error) {
    printError(`Workflow failed: ${error.message}`);
    return false;
  }
}

/**
 * Main CLI handler
 */
async function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const options = args.slice(1);

  console.log(`${colors.magenta}🌍 i18n Master Management Tool${colors.reset}`);
  console.log(`${colors.cyan}Công cụ quản lý dịch thuật i18n tổng hợp${colors.reset}\n`);

  try {
    switch (command) {
    // ===================
    // CORE COMMANDS / LỆNH CỐT LÕI
    // ===================
    case 'test':
    case 't':
      printHeader('🧪 TESTING DYNAMIC i18n SYSTEM');
      await runScript('tools/i18n/test-dynamic-i18n.js', [], 'Running comprehensive i18n system test...');
      break;

    case 'add':
    case 'a':
      if (options.length < 1) {
        printError('Usage: node tools/i18n/master.js add <language-code> [language-name]');
        console.log('   Example: node tools/i18n/master.js add de "German"');
        process.exit(1);
      }
      printHeader(`➕ ADDING LANGUAGE: ${options.join(' ')}`);
      await runScript('tools/i18n/add-language-demo.js', options, `Adding language: ${options.join(' ')}`);
      break;

    case 'verify':
    case 'v':
      printHeader('✅ VERIFYING i18n SYSTEM');
      await runScript('tools/i18n/final-verification.js', [], 'Running system verification...');
      break;

      // ===================
      // KEY MANAGEMENT / QUẢN LÝ KHÓA
      // ===================
    case 'compare':
    case 'c':
      printHeader('🔄 COMPARING TRANSLATIONS');
      await compareTranslations();
      break;

    case 'fix':
    case 'f':
      printHeader('🔧 AUTO-FIXING MISSING KEYS');
      await autoFixMissingKeys(await compareTranslations());
      break;

    case 'sort':
    case 's':
      printHeader('🔠 SORTING TRANSLATION KEYS');
      {
        const flags = new Set(options.filter(opt => opt.startsWith('--')));
        const locales = options.filter(opt => !opt.startsWith('--'));
        const fix = flags.has('--fix');
        const backup = flags.has('--backup');
        const { changed, total, report } = sortLocaleKeys(locales, { fix, backup });

        console.log('I18N Key Sorting Report');
        console.log('------------------------');
        report.forEach(r => {
          if (r.error) {
            console.log(`✗ ${r.file} - ERROR: ${r.error}`);
          } else if (r.changed) {
            console.log(`• ${r.file} - would sort${fix ? ' (sorted)' : ''}`);
          } else {
            console.log(`✓ ${r.file} - already sorted`);
          }
        });
        console.log('------------------------');
        console.log(`Files changed: ${changed}/${total}`);
        if (!fix) {
          console.log('Dry run complete. Thêm --fix để ghi thay đổi.');
        } else {
          console.log(backup ? 'Hoàn thành (đã tạo backup).' : 'Hoàn thành.');
        }
      }
      break;

    case 'sort-keys':
    case 'sk':
      printHeader('🔠 SORTING TRANSLATION KEYS');
      {
        const flags = new Set(options.filter(opt => opt.startsWith('--')));
        const locales = options.filter(opt => !opt.startsWith('--'));
        const fix = flags.has('--fix');
        const backup = flags.has('--backup');
        const { changed, total, report } = sortLocaleKeys(locales, { fix, backup });

        console.log('I18N Key Sorting Report');
        console.log('------------------------');
        report.forEach(r => {
          if (r.error) {
            console.log(`✗ ${r.file} - ERROR: ${r.error}`);
          } else if (r.changed) {
            console.log(`• ${r.file} - would sort${fix ? ' (sorted)' : ''}`);
          } else {
            console.log(`✓ ${r.file} - already sorted`);
          }
        });
        console.log('------------------------');
        console.log(`Files changed: ${changed}/${total}`);
        if (!fix) {
          console.log('Dry run complete. Thêm --fix để ghi thay đổi.');
        } else {
          console.log(backup ? 'Hoàn thành (đã tạo backup).' : 'Hoàn thành.');
        }
      }
      break;

    case 'details':
    case 'd':
      if (options[0]) {
        await showDetailedMissingKeys(options[0]);
      } else {
        printError('Please specify locale: node tools/i18n/master.js details <locale>');
      }
      break;

    case 'addkey':
    case 'ak':
      if (options[0] && options[1]) {
        await addNewKey(options[0], options[1], true);
      } else {
        printError('Please specify key and value: node tools/i18n/master.js addkey <key> <value>');
      }
      break;

      // ===================
      // TRANSLATION WORKFLOW / QUY TRÌNH DỊCH THUẬT
      // ===================
    case 'export':
    case 'e':
      printHeader('📤 EXPORTING UNTRANSLATED KEYS');
      await runScript('tools/i18n/export-untranslated-keys.js', [], 'Exporting untranslated keys...');
      break;

    case 'progress':
    case 'p':
      printHeader('📊 CHECKING TRANSLATION PROGRESS');
      await runScript('tools/i18n/check-translation-progress.js', options, 'Checking translation progress...');
      break;

    case 'merge':
    case 'm':
      printHeader('🔄 MERGING TRANSLATED KEYS');
      await runScript('tools/i18n/merge-translated-keys.js', options, `Merging translations for: ${options[0] || 'all'}`);
      break;

    case 'find-english':
    case 'fe':
      printHeader('🔍 FINDING ENGLISH VALUES');
      await runScript('tools/i18n/find-english-values.js', [], 'Finding English values in locale files...');
      break;

    case 'clean':
      printHeader('🧹 CLEANING AUTO-ENGLISH FILES');
      // Simple implementation for cleaning auto-english files
      const { execSync } = await import('child_process');
      try {
        execSync('ls tools/i18n/*-auto-english.js 2>/dev/null && rm -i tools/i18n/*-auto-english.js || echo "No auto-english files found"', {
          stdio: 'inherit',
          shell: true
        });
        printSuccess('Cleanup completed!');
      } catch (error) {
        printInfo('No auto-english files found to clean');
      }
      break;

    case 'workflow':
    case 'w':
      await runTranslationWorkflow();
      break;

      // ===================
      // DIAGNOSTIC COMMANDS / LỆNH CHẨN ĐOÁN
      // ===================
    case 'analyze':
    case 'an':
      printHeader('🔍 ANALYZING i18n SYSTEM');
      await runScript('tools/i18n/analyze-i18n-files.js', [], 'Analyzing i18n files and system...');
      break;

    case 'check':
      printHeader('🔍 CHECKING SYSTEM INTEGRITY');
      await runScript('tools/i18n/check-i18n.js', [], 'Checking system integrity...');
      break;

    case 'diff':
      printHeader('🔍 FINDING DIFFERENCES IN i18n FILES');
      await runScript('tools/i18n/i18n-key-diff.js', [], 'Finding differences in i18n files...');
      break;

    case 'endpoints':
      printHeader('🌐 TESTING API ENDPOINTS');
      await runScript('tools/i18n/test-endpoints-i18n.js', [], 'Testing API endpoint localization...');
      break;

    case 'routes':
      printHeader('🛣️  TESTING ROUTE i18n');
      await runScript('tools/i18n/test-all-routes-i18n.js', [], 'Testing route i18n messages...');
      break;

      // ===================
      // DEMO COMMANDS / LỆNH DEMO
      // ===================
    case 'demo':
      printHeader('🎬 RUNNING i18n DEMO');
      await runScript('tools/i18n/demo-i18n.sh', [], 'Running interactive i18n demo...');
      break;

    case 'demo-endpoints':
    case 'de':
      printHeader('🎬 RUNNING ENDPOINTS DEMO');
      await runScript('tools/i18n/demo-endpoints-i18n.sh', [], 'Running endpoints demo...');
      break;

      // ===================
      // HELP / TRỢ GIÚP
      // ===================
    case 'help':
    case 'h':
    case '--help':
    case '-h':
    case undefined:
      console.log(`
${colors.purple}🌍 i18n Master Management Tool${colors.reset}
${colors.cyan}Công cụ quản lý dịch thuật i18n tổng hợp${colors.reset}

${colors.yellow}CORE COMMANDS / LỆNH CỐT LÕI:${colors.reset}
  test, t              Test dynamic i18n system / Kiểm tra hệ thống i18n
  add, a <code>        Add new language / Thêm ngôn ngữ mới
  verify, v            Quick system verification / Xác minh nhanh hệ thống

${colors.yellow}KEY MANAGEMENT / QUẢN LÝ KHÓA:${colors.reset}
  compare, c           Compare translations / So sánh bản dịch
  fix, f               Auto-fix missing keys / Tự động sửa khóa thiếu
  details, d <locale>  Show detailed missing keys / Hiện khóa thiếu chi tiết
  addkey, ak <key> <value>  Add new key to all locales / Thêm khóa mới
  sort, s [locale] [--fix] [--backup]
                       Sort keys A-Z (dry-run by default; --fix writes; --backup saves *.bak)
  sort-keys, sk        Alias for sort with same options

${colors.yellow}TRANSLATION WORKFLOW / QUY TRÌNH DỊCH THUẬT:${colors.reset}
  export, e            Export untranslated keys / Xuất khóa chưa dịch
  progress, p [locale] Check translation progress / Kiểm tra tiến độ dịch
  merge, m [locale]    Merge translated keys / Hợp nhất khóa đã dịch
  find-english, fe     Find English values / Tìm giá trị tiếng Anh
  clean                Clean auto-english files / Dọn file auto-english
  workflow, w          Run complete workflow / Chạy quy trình hoàn chỉnh

${colors.yellow}DIAGNOSTIC COMMANDS / LỆNH CHẨN ĐOÁN:${colors.reset}
  analyze, an          Analyze i18n system / Phân tích hệ thống i18n
  check                Check system integrity / Kiểm tra tính toàn vẹn
  diff                 Find differences in i18n files / Tìm khác biệt trong file i18n
  endpoints            Test API endpoints / Kiểm tra API endpoints
  routes               Test route i18n / Kiểm tra i18n routes

${colors.yellow}DEMO COMMANDS / LỆNH DEMO:${colors.reset}
  demo                 Run interactive demo / Chạy demo tương tác
  demo-endpoints       Run endpoints demo / Chạy demo endpoints

${colors.yellow}EXAMPLES / VÍ DỤ:${colors.reset}
  node tools/i18n/master.js test                    # Test system
  node tools/i18n/master.js add fr "French"         # Add French
  node tools/i18n/master.js compare                 # Compare translations
  node tools/i18n/master.js sort                    # Sort keys for all locales
  node tools/i18n/master.js details vi              # Show Vietnamese details
  node tools/i18n/master.js addkey "new.key" "value" # Add new key
  node tools/i18n/master.js workflow                # Complete workflow
  node tools/i18n/master.js progress de             # Check German progress

${colors.yellow}WORKFLOW STEPS / BƯỚC QUY TRÌNH:${colors.reset}
  1. Export:    node tools/i18n/master.js export
  2. Translate: Edit *-auto-english.js files manually
  3. Merge:     node tools/i18n/master.js merge [locale]
  4. Progress:  node tools/i18n/master.js progress
  5. Verify:    node tools/i18n/master.js find-english
  6. Clean:     node tools/i18n/master.js clean

${colors.cyan}Available Locales / Ngôn ngữ có sẵn:${colors.reset} de, es, fr, ja, th, vi
        `);
      break;

    default:
      printError(`Unknown command: ${command}`);
      console.log('Run "node tools/i18n/master.js help" for available commands');
      console.log('Chạy "node tools/i18n/master.js help" để xem các lệnh có sẵn');
      process.exit(1);
    }

  } catch (error) {
    printError(`Error: ${error.message}`);
    process.exit(1);
  }
}

// Run the main function
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}
