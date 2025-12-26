#!/usr/bin/env node

/**
 * EN: Quick schema validation test using updated i18n keys
 * VI: Kiểm thử nhanh validate schema với cấu trúc key i18n mới
 */

import { createSchemaBuilder } from '../../src/schemas/base.js';
import { createLoginSchema } from '../../src/schemas/auth.js';
import { createUserRegistrationSchema } from '../../src/schemas/zodDemo.js';

console.log('🧪 Testing Updated i18n Schema Validation...\n');

// EN: Test 1 - Base schema builder
// VI: Kiểm thử 1 - Bộ dựng schema cơ bản
console.log('1️⃣ Testing Base Schema Builder...');
try {
  const builder = createSchemaBuilder('en');

  // EN: Test email validation
  // VI: Kiểm tra validate email
  const emailSchema = builder.email();
  const validEmail = emailSchema.safeParse('test@example.com');
  const invalidEmail = emailSchema.safeParse('invalid-email');

  console.log(`✅ Valid email: ${validEmail.success}`);
  console.log(`❌ Invalid email error: ${invalidEmail.success ? 'UNEXPECTED SUCCESS' : invalidEmail.error.errors[0].message}`);

} catch (error) {
  console.log(`❌ Base schema builder error: ${error.message}`);
}

// EN: Test 2 - Login schema
// VI: Kiểm thử 2 - Schema đăng nhập
console.log('\n2️⃣ Testing Login Schema...');
try {
  const loginSchema = createLoginSchema('en');

  const validLogin = loginSchema.safeParse({
    email: 'user@example.com',
    password: 'password123'
  });

  const invalidLogin = loginSchema.safeParse({
    email: 'invalid-email',
    password: '123' // EN: Too short
    // VI: Quá ngắn
  });

  console.log(`✅ Valid login: ${validLogin.success}`);
  console.log(`❌ Invalid login errors: ${invalidLogin.success ? 'UNEXPECTED SUCCESS' : invalidLogin.error.errors.length + ' errors'}`);

  if (!invalidLogin.success) {
    invalidLogin.error.errors.forEach((err, index) => {
      console.log(`   ${index + 1}. ${err.path.join('.')}: ${err.message}`);
    });
  }

} catch (error) {
  console.log(`❌ Login schema error: ${error.message}`);
}

// EN: Test 3 - Registration schema
// VI: Kiểm thử 3 - Schema đăng ký
console.log('\n3️⃣ Testing User Registration Schema...');
try {
  const registrationSchema = createUserRegistrationSchema('en');

  const validRegistration = registrationSchema.safeParse({
    full_name: 'John Doe',
    email: 'john@example.com',
    password: 'securePassword123',
    confirmPassword: 'securePassword123',
    age: 25,
    terms_accepted: true
  });

  const invalidRegistration = registrationSchema.safeParse({
    full_name: '',
    email: 'invalid-email',
    password: '123',
    confirmPassword: 'different',
    age: 15, // EN: Too young
    // VI: Quá trẻ
    terms_accepted: false
  });

  console.log(`✅ Valid registration: ${validRegistration.success}`);
  console.log(`❌ Invalid registration errors: ${invalidRegistration.success ? 'UNEXPECTED SUCCESS' : invalidRegistration.error.errors.length + ' errors'}`);

  if (!invalidRegistration.success) {
    invalidRegistration.error.errors.forEach((err, index) => {
      console.log(`   ${index + 1}. ${err.path.join('.')}: ${err.message}`);
    });
  }

} catch (error) {
  console.log(`❌ Registration schema error: ${error.message}`);
}

// EN: Test 4 - i18n key structure
// VI: Kiểm thử 4 - Cấu trúc key i18n
console.log('\n4️⃣ Testing i18n Key Structure...');
try {
  const { initI18n } = await import('../../src/i18n/config.js');
  const { tl } = await import('../../src/i18n/service.js');

  // EN: Initialize i18n first
  // VI: Khởi tạo i18n trước
  console.log('Initializing i18n...');
  await initI18n();
  console.log('i18n initialized successfully');

  // EN: Test new validation keys
  // VI: Kiểm thử các key validation mới
  console.log('Testing fieldRequired keys...');
  const requiredFieldError = tl('en', 'validation.fieldRequired.email');
  console.log(`✅ Required field key: "${requiredFieldError}"`);

  console.log('Testing formatValidation keys...');
  const formatError = tl('en', 'validation.formatValidation.email.invalid');
  console.log(`✅ Format validation key: "${formatError}"`);

  console.log('Testing lengthValidation keys...');
  const lengthError = tl('en', 'validation.lengthValidation.password.tooShort', { minLength: 6 });
  console.log(`✅ Length validation key: "${lengthError}"`);

  console.log('Testing error keys...');
  // Test new error keys
  const authError = tl('en', 'errors.auth.invalidCredentials');
  const userError = tl('en', 'errors.user.registrationFailed');

  console.log(`✅ Auth error key: "${authError}"`);
  console.log(`✅ User error key: "${userError}"`);

  console.log('Testing success keys...');
  // Test new success keys
  const authSuccess = tl('en', 'success.auth.loginSuccess');
  const userSuccess = tl('en', 'success.user.created', { userName: 'John', email: 'john@example.com' });

  console.log(`✅ Auth success key: "${authSuccess}"`);
  console.log(`✅ User success key: "${userSuccess}"`);

} catch (error) {
  console.log(`❌ i18n key test error: ${error.message}`);
  console.log(`❌ Stack: ${error.stack}`);
}

console.log('\n🎉 Schema validation test completed!');
console.log('\n📚 Next steps:');
console.log('   1. Run full test suite: npm run test:validation');
console.log('   2. Test API endpoints: npm run test:zod');
console.log('   3. Check multi-language support: npm run test:validation:multilang');
