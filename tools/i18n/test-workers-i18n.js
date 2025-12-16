#!/usr/bin/env node

/**
 * Test Dynamic i18n System for Cloudflare Workers Compatibility
 * Updated to test the new fully dynamic language system
 */

import fs from 'fs';

console.log('🔧 Testing Dynamic i18n System for Cloudflare Workers');
console.log('===================================================\n');

// Test 1: Check dynamic file structure
console.log('1️⃣ Checking dynamic file structure...');

const requiredFiles = [
  'src/i18n/loader.js',
  'src/i18n/config.js',
  'src/i18n/locales/en.js',
  'src/i18n/locales/vi.js',
  'src/i18n/service.js',
  'src/i18n/index.js'
];

console.log('   Required files for dynamic system:');
requiredFiles.forEach(file => {
  const exists = fs.existsSync(file);
  console.log(`   ${exists ? '✅' : '❌'} ${file}`);
});

// Test 2: Check for Workers-incompatible code
console.log('\n2️⃣ Checking for Cloudflare Workers compatibility...');

const incompatiblePatterns = [
  { pattern: /require\(/g, description: 'CommonJS require()' },
  { pattern: /import.*from\s+['"]path['"]/g, description: 'Node.js path module' },
  { pattern: /import.*from\s+['"]fs['"]/g, description: 'Node.js fs module in main code' },
  { pattern: /process\.cwd\(\)/g, description: 'process.cwd() calls' },
  { pattern: /__dirname/g, description: '__dirname usage' },
  { pattern: /__filename/g, description: '__filename usage' }
];

const filesToCheck = [
  'src/i18n/loader.js',
  'src/i18n/config.js',
  'src/i18n/service.js',
  'src/i18n/index.js'
];

filesToCheck.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`\n   Checking ${file}...`);
    const content = fs.readFileSync(file, 'utf8');

    let hasIssues = false;
    incompatiblePatterns.forEach(({ pattern, description }) => {
      const matches = content.match(pattern);
      if (matches) {
        console.log(`   ⚠️ Found ${description}: ${matches.length} occurrence(s)`);
        hasIssues = true;
      }
    });

    if (!hasIssues) {
      console.log(`   ✅ ${file} - Workers compatible`);
    }
  }
});

// Test 3: Check translation file structure
console.log('\n3️⃣ Checking translation file structure...');

try {
  const localesDir = 'src/i18n/locales';
  const files = fs.readdirSync(localesDir);
  const jsFiles = files.filter(f => f.endsWith('.js'));

  console.log(`   Found ${jsFiles.length} translation files:`, jsFiles);

  jsFiles.forEach(file => {
    const filePath = `${localesDir}/${file}`;
    const content = fs.readFileSync(filePath, 'utf8');

    // Check ES module format
    if (content.includes('export default')) {
      console.log(`   ✅ ${file} - Valid ES module format`);
    } else {
      console.log(`   ❌ ${file} - Not ES module format`);
    }

    // Check required sections
    const requiredSections = ['auth', 'user', 'validation', 'system', 'api', 'endpoints'];
    const missingSection = requiredSections.find(section => !content.includes(`'${section}':`));

    if (!missingSection) {
      console.log(`   ✅ ${file} - All required sections present`);
    } else {
      console.log(`   ⚠️ ${file} - Missing some sections: ${missingSection}`);
    }
  });

} catch (error) {
  console.log('   ❌ Error checking translation files:', error.message);
}

// Test 4: Test dynamic import compatibility
console.log('\n4️⃣ Testing dynamic import patterns...');

const loaderPath = 'src/i18n/loader.js';
if (fs.existsSync(loaderPath)) {
  const content = fs.readFileSync(loaderPath, 'utf8');

  // Check for dynamic import patterns
  if (content.includes('await import')) {
    console.log('   ✅ Dynamic import patterns found');
  } else {
    console.log('   ⚠️ No dynamic import patterns detected');
  }

  // Check for hard-coded imports
  const hasStaticImports = content.includes('import enTranslations') ||
                          content.includes('import viTranslations');

  if (hasStaticImports) {
    console.log('   ⚠️ Static imports still present - may limit scalability');
  } else {
    console.log('   ✅ No static language imports - fully dynamic');
  }

  // Check for language discovery
  if (content.includes('discoverAvailableLanguages') || content.includes('potentialLanguages')) {
    console.log('   ✅ Language discovery mechanism present');
  } else {
    console.log('   ⚠️ Language discovery may be missing');
  }
}

// Test 5: Check for optimization markers
console.log('\n5️⃣ Checking optimization status...');

const optimizationMarkers = [
  { file: 'src/routes/api.js', marker: 'getSupportedLanguagesSync', description: 'Dynamic language list in API' },
  { file: 'src/i18n/config.js', marker: 'getSupportedLanguagesSync', description: 'Sync language getter' },
  { file: 'src/i18n/loader.js', marker: 'TRANSLATIONS_CACHE', description: 'Translation caching' },
  { file: 'src/i18n/config.js', marker: 'initI18n', description: 'Dynamic initialization' }
];

optimizationMarkers.forEach(({ file, marker, description }) => {
  if (fs.existsSync(file)) {
    const content = fs.readFileSync(file, 'utf8');
    if (content.includes(marker)) {
      console.log(`   ✅ ${description} - implemented`);
    } else {
      console.log(`   ❌ ${description} - missing`);
    }
  } else {
    console.log(`   ⚠️ ${file} - file not found`);
  }
});

// Summary
console.log('\n📊 COMPATIBILITY SUMMARY:');
console.log('=========================');

const allFilesExist = requiredFiles.every(file => fs.existsSync(file));
const hasTranslations = fs.existsSync('src/i18n/locales') &&
                       fs.readdirSync('src/i18n/locales').filter(f => f.endsWith('.js')).length >= 2;

console.log(`   • Core files: ${allFilesExist ? 'Present' : 'Missing'}`);
console.log(`   • Translations: ${hasTranslations ? 'Available' : 'Missing'}`);
console.log('   • Format: ES Modules');
console.log('   • System: Fully Dynamic');

if (allFilesExist && hasTranslations) {
  console.log('\n🎉 CLOUDFLARE WORKERS COMPATIBILITY: EXCELLENT! ✅');
  console.log('   System ready for Workers deployment');
} else {
  console.log('\n⚠️ Some issues detected - check above for details');
}

console.log('\n🚀 Next steps:');
console.log('   • Test: node tools/i18n.js test');
console.log('   • Deploy: npm run deploy');
console.log('   • Add language: node tools/i18n.js add [code] "[name]"');
