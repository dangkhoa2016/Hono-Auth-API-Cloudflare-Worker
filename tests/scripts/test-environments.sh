#!/bin/bash

echo "🔧 Testing Configuration with Different Environments"
echo "=================================================="

echo ""
echo "1️⃣ Testing DEFAULT environment (test):"
node tests/configTest.js

echo ""
echo "2️⃣ Testing DEVELOPMENT environment:"
TEST_ENV=development node tests/configTest.js

echo ""
echo "3️⃣ Testing STAGING environment:"
TEST_ENV=staging node tests/configTest.js

echo ""
echo "4️⃣ Testing with actual test files:"
echo "   - Quick test with development environment:"
TEST_ENV=development node tests/quickTest.js | head -3

echo ""
echo "   - Auth test showing configuration:"
TEST_ENV=staging node -e "
import('./tests/authTest.js').then(module => {
  const authTest = new module.AuthTests();
  console.log('Auth Test BaseURL:', authTest.baseUrl);
}).catch(e => console.log('Auth test import failed:', e.message));"

echo ""
echo "✅ Environment testing completed!"
