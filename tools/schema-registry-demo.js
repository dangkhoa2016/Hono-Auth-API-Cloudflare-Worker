#!/usr/bin/env node

/**
 * Schema Registry Management Tool
 * Demo and management tool for the new centralized schema registry
 */

import {
  getSchemaRegistry,
} from '../src/schemas/registry.js';

import {
  generateValidatorMiddleware,
  validateSchemaDefinitions,
  generateValidatorDocumentation,
  createSchemaRegistryUtils
} from '../src/schemas/validatorGenerator.js';

// Create schema registry utils instance
const schemaRegistryUtils = createSchemaRegistryUtils();

// Generate validator middleware for demo
const i18nValidatorsMiddleware = generateValidatorMiddleware();

/**
 * Display help information
 */
function showHelp() {
  console.log(`
🔧 Schema Registry Management Tool

Usage: node tools/schema-registry-demo.js [command] [options]

Commands:
  list                    List all available schemas
  categories             List all categories
  category <name>        Show schemas in specific category
  validator <name>       Show validator information
  validators             List all convenience validators
  docs                   Generate documentation
  validate               Validate registry consistency
  demo                   Interactive demo
  help                   Show this help

Examples:
  node tools/schema-registry-demo.js list
  node tools/schema-registry-demo.js category auth
  node tools/schema-registry-demo.js validator login
  node tools/schema-registry-demo.js docs > VALIDATOR_DOCS.md
`);
}

/**
 * List all schemas
 */
function listSchemas() {
  console.log('\n📋 All Available Schemas:');
  console.log('=' .repeat(50));

  const registry = getSchemaRegistry();
  const categories = {};

  // Group by category
  Object.entries(registry).forEach(([schemaName, metadata]) => {
    if (!categories[metadata.category]) {
      categories[metadata.category] = [];
    }
    categories[metadata.category].push({ schemaName, ...metadata });
  });

  // Display by category
  Object.entries(categories).forEach(([category, schemas]) => {
    console.log(`\n🏷️  ${category.toUpperCase()}`);
    schemas.forEach(schema => {
      console.log(`   ${schema.schemaName.padEnd(30)} → ${schema.friendlyName} (${schema.target})`);
    });
  });

  console.log(`\n📊 Total: ${Object.keys(registry).length} schemas in ${Object.keys(categories).length} categories`);
}

/**
 * List all categories
 */
function listCategories() {
  console.log('\n📁 Available Categories:');
  console.log('=' .repeat(30));

  const categories = schemaRegistryUtils.getCategories();
  categories.forEach(category => {
    const validators = schemaRegistryUtils.getValidatorsByCategory(category);
    console.log(`  ${category.padEnd(20)} (${validators.length} schemas)`);
  });
}

/**
 * Show schemas in specific category
 */
function showCategory(categoryName) {
  console.log(`\n📂 Category: ${categoryName.toUpperCase()}`);
  console.log('=' .repeat(40));

  const validators = schemaRegistryUtils.getValidatorsByCategory(categoryName);

  if (validators.length === 0) {
    console.log(`❌ Category '${categoryName}' not found or empty`);
    return;
  }

  validators.forEach(validator => {
    console.log(`\n🔹 ${validator.friendlyName}`);
    console.log(`   Schema: ${validator.schemaName}`);
    console.log(`   Target: ${validator.defaultTarget}`);
    console.log(`   Description: ${validator.description}`);
    console.log(`   Usage: i18nValidatorsMiddleware.${validator.friendlyName}()`);
  });
}

/**
 * Show validator information
 */
function showValidator(friendlyName) {
  console.log(`\n🔍 Validator: ${friendlyName}`);
  console.log('=' .repeat(30));

  const validator = schemaRegistryUtils.findValidatorByName(friendlyName);

  if (!validator) {
    console.log(`❌ Validator '${friendlyName}' not found`);
    console.log('\n💡 Available validators:');
    const all = schemaRegistryUtils.getAvailableValidators();
    all.forEach(v => console.log(`   - ${v.friendlyName}`));
    return;
  }

  console.log(`Schema Name: ${validator.schemaName}`);
  console.log(`Category: ${validator.category}`);
  console.log(`Default Target: ${validator.defaultTarget}`);
  console.log(`Description: ${validator.description}`);

  console.log('\n📝 Usage Examples:');
  console.log(schemaRegistryUtils.getUsageExample(friendlyName));
}

/**
 * List all convenience validators
 */
function listValidators() {
  console.log('\n🚀 Available Convenience Validators:');
  console.log('=' .repeat(50));

  const docs = generateValidatorDocumentation();

  for (const [category, validators] of Object.entries(docs.byCategory)) {
    console.log(`\n🏷️  ${category.toUpperCase()}`);

    validators.forEach(validator => {
      console.log(`   i18nValidatorsMiddleware.${validator.name.padEnd(25)} // ${validator.description}`);
    });
  }

  console.log(`\n📊 Total: ${docs.total} validator functions generated`);
}

/**
 * Generate documentation
 */
function generateDocs() {
  const docs = generateValidatorDocumentation();

  console.log('\n📚 Schema Validator Documentation');
  console.log('=' .repeat(50));

  for (const [category, validators] of Object.entries(docs.byCategory)) {
    console.log(`\n## ${category.charAt(0).toUpperCase() + category.slice(1)} Validators\n`);

    validators.forEach(validator => {
      console.log(`### \`${validator.name}(target?)\``);
      console.log(`- **Schema**: \`${validator.schemaName}\``);
      console.log(`- **Default Target**: \`${validator.defaultTarget}\``);
      console.log(`- **Description**: ${validator.description}`);
      console.log('');
    });
  }
}

/**
 * Validate registry consistency
 */
function validateRegistry() {
  console.log('\n🔍 Validating Schema Registry:');
  console.log('=' .repeat(40));

  const validation = validateSchemaDefinitions();

  console.log(`Total Schemas: ${validation.stats.totalSchemas}`);
  console.log(`Total Categories: ${Object.keys(validation.stats.categories).length}`);
  console.log(`Registry Valid: ${validation.valid ? '✅ YES' : '❌ NO'}`);

  if (validation.errors.length > 0) {
    console.log('\n❌ Errors Found:');
    validation.errors.forEach(error => console.log(`   - ${error}`));
  }

  if (validation.warnings.length > 0) {
    console.log('\n⚠️  Warnings:');
    validation.warnings.forEach(warning => console.log(`   - ${warning}`));
  }

  if (validation.valid) {
    console.log('\n✅ Registry is consistent and ready to use!');
  }
}

/**
 * Interactive demo
 */
function runDemo() {
  console.log('\n🎮 Interactive Schema Registry Demo');
  console.log('=' .repeat(40));

  // Test validator creation
  console.log('\n1️⃣  Testing Validator Creation:');

  const testValidators = ['login', 'register', 'updateUser', 'auditQuery'];

  testValidators.forEach(validatorName => {
    if (i18nValidatorsMiddleware[validatorName]) {
      console.log(`✅ ${validatorName} validator created successfully`);

      const validator = schemaRegistryUtils.findValidatorByName(validatorName);
      if (validator) {
        console.log(`   → Default target: ${validator.defaultTarget}`);
      }
    } else {
      console.log(`❌ ${validatorName} validator not found`);
    }
  });

  // Test registry functions
  console.log('\n2️⃣  Testing Registry Functions:');

  try {
    const allValidators = schemaRegistryUtils.getAvailableValidators();
    console.log(`✅ Found ${allValidators.length} validators`);

    const categories = schemaRegistryUtils.getCategories();
    console.log(`✅ Found ${categories.length} categories: ${categories.join(', ')}`);

    const authValidators = schemaRegistryUtils.getValidatorsByCategory('auth');
    console.log(`✅ Auth category has ${authValidators.length} validators`);

  } catch (error) {
    console.log(`❌ Error testing registry: ${error.message}`);
  }

  // Performance test
  console.log('\n3️⃣  Performance Test:');
  const startTime = Date.now();

  for (let i = 0; i < 100; i++) {
    i18nValidatorsMiddleware.login();
    // Just create, don't execute
  }

  const duration = Date.now() - startTime;
  console.log(`✅ Created 100 validators in ${duration}ms (avg: ${(duration / 100).toFixed(2)}ms each)`);

  console.log('\n🎉 Demo completed successfully!');
}

/**
 * Main function
 */
function main() {
  const args = process.argv.slice(2);
  const command = args[0];
  const param = args[1];

  if (!command || command === 'help') {
    showHelp();
    return;
  }

  switch (command) {
  case 'list':
    listSchemas();
    break;

  case 'categories':
    listCategories();
    break;

  case 'category':
    if (!param) {
      console.log('❌ Please specify a category name');
      console.log('Usage: node tools/schema-registry-demo.js category <name>');
      return;
    }
    showCategory(param);
    break;

  case 'validator':
    if (!param) {
      console.log('❌ Please specify a validator name');
      console.log('Usage: node tools/schema-registry-demo.js validator <name>');
      return;
    }
    showValidator(param);
    break;

  case 'validators':
    listValidators();
    break;

  case 'docs':
    generateDocs();
    break;

  case 'validate':
    validateRegistry();
    break;

  case 'demo':
    runDemo();
    break;

  default:
    console.log(`❌ Unknown command: ${command}`);
    showHelp();
  }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { main };
