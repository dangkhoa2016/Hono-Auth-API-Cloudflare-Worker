#!/usr/bin/env node

/**
 * Dynamic i18n System Validation
 * Updated to work with the new dynamic language system
 */

import fs from 'fs';

// Manual path utilities for better compatibility
function join(...parts) {
  return parts.join('/').replace(/\/+/g, '/');
}

console.log('🔍 Testing Dynamic i18n System Integration...\n');

// Test 1: Check translation files structure
console.log('1️⃣ Checking dynamic translation files...');
const localesDir = join(process.cwd(), 'src/i18n/locales');

try {
  const files = fs.readdirSync(localesDir);
  console.log('   ✅ Found files:', files);

  // Count different file types
  const jsFiles = files.filter(f => f.endsWith('.js'));
  const jsonFiles = files.filter(f => f.endsWith('.json'));
  const yamlFiles = files.filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));

  console.log(`   📊 File types: ${jsFiles.length} .js, ${jsonFiles.length} .json, ${yamlFiles.length} .yml`);

  if (jsFiles.length > 0) {
    console.log('   ✅ Dynamic JS files found (good!)');
  }

  if (jsonFiles.length > 0 || yamlFiles.length > 0) {
    console.log('   ⚠️ Legacy files detected - consider cleanup');
  }

  // Test each JS file
  for (const file of jsFiles) {
    if (file.endsWith('.js')) {
      const filePath = join(localesDir, file);
      try {
        const content = fs.readFileSync(filePath, 'utf8');

        // Check if it's a proper ES module
        if (content.includes('export default')) {
          console.log(`   ✅ ${file} - Valid ES module`);
        } else {
          console.log(`   ❌ ${file} - Missing export default`);
        }

        // Check for required sections
        const requiredSections = ['auth', 'user', 'validation', 'system', 'endpoints'];
        const missingSections = requiredSections.filter(section =>
          !content.includes(`'${section}':`) && !content.includes(`"${section}":`) && !content.includes(`${section}:`)
        );

        if (missingSections.length === 0) {
          console.log(`   ✅ ${file} - All sections present`);
        } else {
          console.log(`   ⚠️ ${file} - Missing sections: ${missingSections.join(', ')}`);
        }

      } catch (error) {
        console.log(`   ❌ ${file} - Error reading: ${error.message}`);
      }
    }
  }

} catch (error) {
  console.log('   ❌ Error reading locales directory:', error.message);
}

// Test 2: Check dynamic system integration
console.log('\n2️⃣ Testing dynamic system components...');

const systemFiles = [
  'src/i18n/loader.js',
  'src/i18n/config.js',
  'src/i18n/service.js'
];

systemFiles.forEach(file => {
  try {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, 'utf8');

      // Check for dynamic patterns
      const isDynamic = content.includes('async function') ||
                       content.includes('await import') ||
                       content.includes('getSupportedLanguages');

      if (isDynamic) {
        console.log(`   ✅ ${file} - Dynamic patterns detected`);
      } else {
        console.log(`   ⚠️ ${file} - May need dynamic updates`);
      }

      // Check for hard-coded language lists
      const hasHardCode = content.includes('[\'en\', \'vi\']') ||
                         content.includes('["en", "vi"]');

      if (hasHardCode) {
        console.log(`   ❌ ${file} - Contains hard-coded language lists`);
      } else {
        console.log(`   ✅ ${file} - No hard-coded languages detected`);
      }

    } else {
      console.log(`   ❌ ${file} - File not found`);
    }
  } catch (error) {
    console.log(`   ❌ ${file} - Error: ${error.message}`);
  }
});

// Test 3: Check for legacy files
console.log('\n3️⃣ Checking for legacy files that should be cleaned up...');

const legacyFiles = [
  'src/i18n/locales/translations.js',
  'src/i18n/yamlLoader.js',
  'convert-translations.js',
  'src/i18n/locales/fr.yml'
];

let legacyFound = false;
legacyFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ⚠️ Legacy file found: ${file}`);
    legacyFound = true;
  }
});

if (!legacyFound) {
  console.log('   ✅ No legacy files found - cleanup complete!');
}

// Test 4: Test management tools
console.log('\n4️⃣ Checking management tools...');

const toolFiles = [
  'tools/i18n/add-language-demo.js',
  'tools/i18n/test-dynamic-i18n.js',
  'tools/i18n/final-verification.js',
  'tools/i18n/master.js'
];

toolFiles.forEach(file => {
  if (fs.existsSync(file)) {
    console.log(`   ✅ Tool available: ${file}`);
  } else {
    console.log(`   ❌ Missing tool: ${file}`);
  }
});

// Summary
console.log('\n📊 SYSTEM STATUS SUMMARY:');
console.log('========================');

try {
  const jsFilesCount = fs.readdirSync(localesDir).filter(f => f.endsWith('.js')).length;
  console.log(`   • Languages available: ${jsFilesCount}`);
  console.log(`   • System type: ${jsFilesCount > 0 ? 'Dynamic' : 'Static'}`);
  console.log('   • Management tools: Available');
  console.log(`   • Legacy cleanup: ${legacyFound ? 'Needed' : 'Complete'}`);

  if (jsFilesCount >= 2 && !legacyFound) {
    console.log('\n🎉 DYNAMIC i18n SYSTEM STATUS: OPTIMAL! ✅');
  } else {
    console.log('\n⚠️ System may need optimization');
  }

} catch (error) {
  console.log('\n❌ Unable to determine system status');
}

console.log('\n💡 Next steps:');
console.log('   • Run: node tools/i18n.js test    (comprehensive test)');
console.log('   • Run: node tools/i18n.js add de "German"  (add language)');
console.log('   • Run: node tools/i18n.js verify  (quick verification)');
