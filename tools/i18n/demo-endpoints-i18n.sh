#!/bin/bash

echo "🌍 Demo: i18n Endpoints API"
echo "=========================="
echo ""

echo "📝 Testing API endpoints with different languages..."
echo ""

echo "🔥 Starting demo - you can test these commands when server is running:"
echo ""

echo "1️⃣ English (default):"
echo "curl http://localhost:8788/ | jq '.endpoints.auth'"
echo "Expected: \"POST /api/auth/login\": \"Login with email and password\""
echo ""

echo "2️⃣ Vietnamese:"
echo "curl -H 'Accept-Language: vi' http://localhost:8788/ | jq '.endpoints.auth'"
echo "Expected: \"POST /api/auth/login\": \"Đăng nhập bằng email và mật khẩu\""
echo ""

echo "3️⃣ Language query parameter:"
echo "curl http://localhost:8788/?lang=vi | jq '.endpoints.auth'"
echo "Expected: \"POST /api/auth/login\": \"Đăng nhập bằng email và mật khẩu\""
echo ""

echo "🚀 Start server to test:"
echo "npm run dev:test"
