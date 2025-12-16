#!/usr/bin/env node

/**
 * i18n Tools Analysis & Health Check
 * Analyze all i18n-related tools and provide optimization recommendations
 */

import fs from 'fs';
import path from 'path';

// Manual path utilities for better compatibility
function join(...parts) {
  return parts.join('/').replace(/\/+/g, '/');
}

console.log('🔍 i18n Tools Analysis & Health Check\n');

// Dynamically scan tools/i18n directory
const toolsDir = join(process.cwd(), 'tools', 'i18n');
const allFiles = fs.readdirSync(toolsDir)
  .filter(file => file.endsWith('.js') || file.endsWith('.mjs'))
  .map(file => join('tools/i18n', file));

console.log(`📂 Found ${allFiles.length} tool files in tools/i18n/\n`);

console.log('1️⃣ Analyzing tool files...');

const fileStatus = {};
const categories = {
  'Core Tools': [],
  'Testing Tools': [],
  'Demo/Development': [],
  'Analysis/Validation': []
};

for (const file of allFiles) {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    const content = fs.readFileSync(file, 'utf8');
    const fileName = path.basename(file);

    // Improved analysis logic
    const hasModernSyntax = content.includes('getSupportedLanguages') ||
                           content.includes('loadTranslation');

    const isWellStructured = content.includes('console.log') &&
                            (content.includes('✅') || content.includes('❌'));

    // Check for actual legacy patterns (not detection code)
    const hasHardcodedLanguages = content.includes('[\'en\', \'vi\']') &&
                                 !content.includes('hasHardCode') &&
                                 !content.includes('hasLegacyPatterns');
    const hasLegacyPatterns = hasHardcodedLanguages ||
                             content.includes('yamlLoader') ||
                             (content.includes('hard-code') && !content.includes('hard-code'));

    const usesModernModules = content.includes('const fs = require') ||
                             content.includes('import ') ||
                             file.endsWith('.mjs');

    // Categorize files
    let category = 'Analysis/Validation';
    if (fileName.includes('add-language') || fileName.includes('demo')) {
      category = 'Demo/Development';
    } else if (fileName.includes('test-') || fileName.includes('check-')) {
      category = 'Testing Tools';
    } else if (fileName.includes('final-') || fileName.includes('organization')) {
      category = 'Core Tools';
    }

    categories[category].push(file);

    fileStatus[file] = {
      size: Math.round(stats.size / 1024),
      modernSyntax: hasModernSyntax,
      wellStructured: isWellStructured,
      legacy: hasLegacyPatterns,
      moduleSystem: usesModernModules,
      lastModified: stats.mtime.toISOString().split('T')[0],
      category: category
    };

    // Better status indicators
    const qualityScore = [hasModernSyntax, isWellStructured, !hasLegacyPatterns, usesModernModules]
      .filter(Boolean).length;
    const qualityStatus = qualityScore >= 3 ? '✅ Good' :
      qualityScore >= 2 ? '⚠️ Fair' : '❌ Poor';

    console.log(`   📄 ${fileName} (${fileStatus[file].size}KB)`);
    console.log(`      ${qualityStatus} - Quality: ${qualityScore}/4`);
    console.log(`      📊 Modern syntax: ${hasModernSyntax ? '✅' : '❌'} | Structured: ${isWellStructured ? '✅' : '❌'}`);
    if (hasLegacyPatterns) {
      console.log('      ⚠️ Contains legacy patterns');
    }
  } else {
    console.log(`   ❌ ${path.basename(file)} - File not found`);
  }
}

// Analysis & Recommendations
console.log('\n2️⃣ Quality Analysis...');

const qualityStats = {
  good: Object.values(fileStatus).filter(s => [s.modernSyntax, s.wellStructured, !s.legacy, s.moduleSystem].filter(Boolean).length >= 3).length,
  fair: Object.values(fileStatus).filter(s => [s.modernSyntax, s.wellStructured, !s.legacy, s.moduleSystem].filter(Boolean).length === 2).length,
  poor: Object.values(fileStatus).filter(s => [s.modernSyntax, s.wellStructured, !s.legacy, s.moduleSystem].filter(Boolean).length < 2).length
};

console.log('   📊 Quality Distribution:');
console.log(`      ✅ Good quality: ${qualityStats.good} files`);
console.log(`      ⚠️ Fair quality: ${qualityStats.fair} files`);
console.log(`      ❌ Poor quality: ${qualityStats.poor} files`);

// Smart recommendations
console.log('\n3️⃣ Smart Recommendations...');

const recommendations = [];

// Check for legacy patterns
const legacyFiles = Object.keys(fileStatus).filter(f => fileStatus[f].legacy);
if (legacyFiles.length > 0) {
  recommendations.push(`🔧 Update legacy patterns in: ${legacyFiles.map(f => path.basename(f)).join(', ')}`);
}

// Check for poor quality files
const poorFiles = Object.keys(fileStatus).filter(f => {
  const s = fileStatus[f];
  return [s.modernSyntax, s.wellStructured, !s.legacy, s.moduleSystem].filter(Boolean).length < 2;
});
if (poorFiles.length > 0) {
  recommendations.push(`🛠️ Improve structure in: ${poorFiles.map(f => path.basename(f)).join(', ')}`);
}

// Check for redundant test files
const testFiles = Object.keys(fileStatus).filter(f => path.basename(f).startsWith('test-'));
if (testFiles.length > 4) {
  recommendations.push(`📦 Consider consolidating ${testFiles.length} test files for better maintainability`);
}

if (recommendations.length === 0) {
  console.log('   🎉 All tools are in excellent condition!');
} else {
  recommendations.forEach((rec, index) => {
    console.log(`   ${index + 1}. ${rec}`);
  });
}

// Category Summary
console.log('\n4️⃣ Tools by Category...');

Object.entries(categories).forEach(([categoryName, files]) => {
  console.log(`\n   📁 ${categoryName} (${files.length} files):`);

  if (files.length === 0) {
    console.log('      � No files in this category');
    return;
  }

  files.forEach(file => {
    if (fileStatus[file]) {
      const status = fileStatus[file];
      const qualityScore = [status.modernSyntax, status.wellStructured, !status.legacy, status.moduleSystem]
        .filter(Boolean).length;
      const qualityIcon = qualityScore >= 3 ? '✅' : qualityScore >= 2 ? '⚠️' : '❌';
      console.log(`      ${qualityIcon} ${path.basename(file)} - ${status.size}KB (${qualityScore}/4)`);
    }
  });
});

// Usage recommendations
console.log('\n5️⃣ Recommended Usage...');

const usageMap = {
  'add-language-demo.js': 'Add new languages to the system',
  'test-dynamic-i18n.js': 'Comprehensive system testing',
  'final-verification.js': 'Quick health checks',
  'check-i18n.js': 'Detailed validation and structure check',
  'organization-check.js': 'File organization verification',
  'test-i18n.js': 'Testing',
  'analyze-i18n-files.js': 'This analysis tool'
};

Object.entries(usageMap).forEach(([file, purpose]) => {
  const fullPath = allFiles.find(f => f.includes(file));
  if (fullPath && fileStatus[fullPath]) {
    const status = fileStatus[fullPath];
    const qualityScore = [status.modernSyntax, status.wellStructured, !status.legacy, status.moduleSystem]
      .filter(Boolean).length;
    const icon = qualityScore >= 3 ? '🟢' : qualityScore >= 2 ? '🟡' : '🔴';
    console.log(`   ${icon} node tools/i18n/${file}`);
    console.log(`      └─ ${purpose}`);
  }
});

console.log('\n✅ i18n Tools Analysis Complete!');
console.log(`📈 Overall health: ${qualityStats.good}/${allFiles.length} tools in good condition`);
