#!/bin/bash

# Test script for KV Admin functionality
# Only super_admin can access this functionality

BASE_URL="http://localhost:8788"
SUPERADMIN_EMAIL="test-superadmin@example.com"
ADMIN_EMAIL="test-admin@example.com"
USER_EMAIL="test-user@example.com"
PASSWORD="password123"
SUPER_ADMIN_TOKEN=""
REGULAR_USER_TOKEN=""
ADMIN_TOKEN=""

echo "🚀 Testing KV Admin functionality..."

# Function to login and get token
login_super_admin() {
  echo "📝 Logging in as super_admin..."
  
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$SUPERADMIN_EMAIL\",
      \"password\": \"$PASSWORD\"
    }")
  
  echo "Login Response: $RESPONSE"
  
  SUPER_ADMIN_TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  
  if [ -z "$SUPER_ADMIN_TOKEN" ]; then
    echo "❌ Failed to get super_admin token"
    exit 1
  fi
  
  echo "✅ Super admin logged in successfully"
  echo "Token: ${SUPER_ADMIN_TOKEN:0:20}..."
}

# Function to login as regular user
login_regular_user() {
  echo "📝 Logging in as regular user..."
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$USER_EMAIL\",
      \"password\": \"$PASSWORD\"
    }")

  echo "Login Response: $RESPONSE"
  REGULAR_USER_TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  if [ -z "$REGULAR_USER_TOKEN" ]; then
    echo "❌ Failed to get regular user token"
    exit 1
  fi

  echo "✅ Regular user logged in successfully"
  echo "Token: ${REGULAR_USER_TOKEN:0:20}..."
}

# Function to login as admin
login_admin() {
  echo "📝 Logging in as admin..."
  RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{
      \"email\": \"$ADMIN_EMAIL\",
      \"password\": \"$PASSWORD\"
    }")

  echo "Login Response: $RESPONSE"
  ADMIN_TOKEN=$(echo $RESPONSE | grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)
  if [ -z "$ADMIN_TOKEN" ]; then
    echo "❌ Failed to get admin token"
    exit 1
  fi

  echo "✅ Admin logged in successfully"
  echo "Token: ${ADMIN_TOKEN:0:20}..."
}

# Test GET all configs
test_get_all_configs() {
  echo ""
  echo "📋 Testing GET all configs..."
  
  curl -s -X GET "$BASE_URL/api/kv-admin/configs" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" | jq '.'
}

# Test GET specific config
test_get_specific_config() {
  echo ""
  echo "📋 Testing GET specific config (RATE_LIMIT_DISABLED)..."
  
  curl -s -X GET "$BASE_URL/api/kv-admin/configs/RATE_LIMIT_DISABLED" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" | jq '.'
}

# Test UPDATE config
test_update_config() {
  echo ""
  echo "✏️ Testing UPDATE config (RATE_LIMIT_DISABLED = false)..."
  
  curl -s -X PUT "$BASE_URL/api/kv-admin/configs/RATE_LIMIT_DISABLED" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{"value": false}' | jq '.'
  
  echo ""
  echo "🔍 Verifying update..."
  curl -s -X GET "$BASE_URL/api/kv-admin/configs/RATE_LIMIT_DISABLED" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" | jq '.'
}

# Test BATCH update
test_batch_update() {
  echo ""
  echo "📝 Testing BATCH update configs..."
  
  curl -s -X POST "$BASE_URL/api/kv-admin/configs/batch" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
      "configs": {
        "RATE_LIMIT_MAX_ATTEMPTS": 10,
        "DEFAULT_PAGE_SIZE": 20,
        "ENABLE_DETAILED_ERRORS": true
      }
    }' | jq '.'
}

# Test ENV vs KV comparison
test_env_kv_comparison() {
  echo ""
  echo "⚖️ Testing ENV vs KV comparison..."
  
  curl -s -X GET "$BASE_URL/api/kv-admin/configs/env-comparison" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" | jq '.'
}

# Test RESET config (delete)
test_reset_config() {
  echo ""
  echo "🔄 Testing RESET config to default (DELETE RATE_LIMIT_DISABLED)..."
  
  curl -s -X DELETE "$BASE_URL/api/kv-admin/configs/RATE_LIMIT_DISABLED" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" | jq '.'
}

# Test clear cache
test_clear_cache() {
  echo ""
  echo "🧹 Testing clear cache..."
  
  curl -s -X POST "$BASE_URL/api/kv-admin/configs/cache/clear" \
    -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
    -H "Content-Type: application/json" | jq '.'
}

# Test unauthorized access (regular user)
test_unauthorized_access() {
  echo ""
  echo "🚫 Testing unauthorized access (should fail)..."
  
  # Try to access without token
  echo "Without token:"
  curl -s -X GET "$BASE_URL/api/kv-admin/configs" \
    -H "Content-Type: application/json" | jq '.'
}

# Try to access with regular user token
test_regular_user_access() {
  echo ""
  echo "🚫 Testing unauthorized access with regular user token..."
  curl -s -X GET "$BASE_URL/api/kv-admin/configs" \
    -H "Authorization: Bearer $REGULAR_USER_TOKEN" \
    -H "Content-Type: application/json" | jq '.'
}

# Try to access with admin token
test_admin_access() {
  echo ""
  echo "🚫 Testing unauthorized access with admin token..."
  curl -s -X GET "$BASE_URL/api/kv-admin/configs" \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -H "Content-Type: application/json" | jq '.'
}


# Main test execution
main() {
  echo "Starting KV Admin tests..."
  echo "Base URL: $BASE_URL"
  
  # Login first
  login_super_admin
  
  # Run all tests
  test_get_all_configs
  test_get_specific_config
  test_update_config
  test_batch_update
  test_env_kv_comparison
  test_reset_config
  test_clear_cache
  test_unauthorized_access
  login_regular_user
  test_regular_user_access
  login_admin
  test_admin_access
  
  echo ""
  echo "✅ KV Admin tests completed!"
}

# Check if jq is installed
if ! command -v jq &> /dev/null; then
  echo "❌ jq is required but not installed. Please install jq first."
  exit 1
fi

# Run tests
main
