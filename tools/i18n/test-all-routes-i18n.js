import app from '../../src/index.js';
import { initI18n } from '../../src/i18n/config.js';

async function testAllRoutesI18n() {
  console.log('🧪 Testing All Routes i18n Messages...\n');

  // EN: Initialize i18n
  // VI: Khởi tạo i18n
  await initI18n();

  const env = {
    NODE_ENV: 'test',
    DB: null // Mock DB for testing
  };

  // EN: Use the imported app instance directly
  // VI: Dùng thẳng instance app đã import

  // EN: Test cases covering multiple routes
  // VI: Bộ test bao phủ nhiều route
  const testCases = [
    {
      name: 'User Registration',
      method: 'POST',
      path: '/api/user/register',
      body: {
        full_name: 'Test User',
        // EN: Invalid to trigger validation
        // VI: Giá trị sai để kích hoạt validation
        email: 'invalid-email',
        // EN: Too short
        // VI: Quá ngắn
        password: '123'
      }
    },
    {
      name: 'User Login',
      method: 'POST',
      path: '/api/auth/login',
      body: {
        email: 'nonexistent@test.com',
        password: 'wrongpassword'
      }
    },
    {
      name: 'Protected Route without Auth',
      method: 'GET',
      path: '/api/user/profile'
    },
    {
      name: 'Route Not Found',
      method: 'GET',
      path: '/api/nonexistent'
    }
  ];

  for (const testCase of testCases) {
    console.log(`\n📋 Testing: ${testCase.name}`);
    console.log(`   ${testCase.method} ${testCase.path}`);

    try {
      const request = new Request(`http://localhost${testCase.path}`, {
        method: testCase.method,
        headers: {
          'Content-Type': 'application/json',
          'Accept-Language': 'en'
        },
        ...(testCase.body && { body: JSON.stringify(testCase.body) })
      });

      const response = await app.fetch(request, env);
      const result = await response.json();

      console.log(`   Status: ${response.status}`);

      if (result.error) {
        console.log(`   ❌ Error: ${result.error}`);

        // EN: Check if error hints a missing i18n key
        // VI: Kiểm tra lỗi có phải thiếu key i18n hay không
        if (typeof result.error === 'string' && result.error.includes('.')) {
          console.log(`   ⚠️  Possible missing i18n key: ${result.error}`);
        }
      }

      if (result.message) {
        console.log(`   ✅ Message: ${result.message}`);
      }

      if (result.data && result.data.validationErrors) {
        console.log('   📋 Validation Errors:');
        result.data.validationErrors.forEach(err => {
          console.log(`      - ${err.field}: ${err.message}`);

          // EN: Check for untranslated validation messages
          // VI: Kiểm tra thông điệp validation chưa dịch
          if (typeof err.message === 'string' && err.message.includes('validation.')) {
            console.log(`      ⚠️  Possible missing validation key: ${err.message}`);
          }
        });
      }

    } catch (error) {
      console.log(`   💥 Test Error: ${error.message}`);
    }
  }

  console.log('\n🎯 i18n Route Testing Complete!');
}

// EN: Run the test
// VI: Chạy kịch bản kiểm thử
testAllRoutesI18n().catch(console.error);
