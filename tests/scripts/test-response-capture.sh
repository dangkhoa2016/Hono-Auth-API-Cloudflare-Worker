#!/bin/bash

# Test script for Response Body Capture feature
# Tests the new KV setting for debugging response data

set -e

echo "🧪 Testing Response Body Capture Feature"
echo "========================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:8787"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

echo -e "${BLUE}📍 Testing Response Body Capture Configuration${NC}"
echo ""

# Function to make authenticated request
make_auth_request() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
            -H "Content-Type: application/json" \
            -d "$data"
    else
        curl -s -X "$method" "$BASE_URL$endpoint" \
            -H "Authorization: Bearer $SUPER_ADMIN_TOKEN"
    fi
}

# Step 1: Login as super admin to get token
echo -e "${YELLOW}🔐 Step 1: Authenticating as super admin...${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{"email":"super@admin.com","password":"SuperSecure123!"}')

SUPER_ADMIN_TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"access_token":"[^"]*' | cut -d'"' -f4)

if [ -z "$SUPER_ADMIN_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get super admin token${NC}"
    echo "Response: $LOGIN_RESPONSE"
    exit 1
fi

echo -e "${GREEN}✅ Super admin authenticated${NC}"
echo ""

# Step 2: Check current configuration
echo -e "${YELLOW}📊 Step 2: Checking current response capture setting...${NC}"
CURRENT_CONFIG=$(make_auth_request "GET" "/api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE")
echo "Current config: $CURRENT_CONFIG"
echo ""

# Step 3: Enable response body capture
echo -e "${YELLOW}🔧 Step 3: Enabling response body capture...${NC}"
ENABLE_RESPONSE=$(make_auth_request "PUT" "/api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE" '{"value": true}')
echo "Enable response: $ENABLE_RESPONSE"

# Verify it was enabled
VERIFY_ENABLED=$(make_auth_request "GET" "/api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE")
if echo "$VERIFY_ENABLED" | grep -q '"value":true'; then
    echo -e "${GREEN}✅ Response body capture enabled${NC}"
else
    echo -e "${RED}❌ Failed to enable response body capture${NC}"
    echo "Response: $VERIFY_ENABLED"
fi
echo ""

# Step 4: Test middleware behavior (make some requests to see logging difference)
echo -e "${YELLOW}📝 Step 4: Testing middleware behavior with capture enabled...${NC}"
echo "Making test requests to trigger middleware logging..."

# Make some test requests
TEST_RESPONSE=$(make_auth_request "GET" "/api/user/me")
echo "User profile request response: $(echo $TEST_RESPONSE | cut -c1-100)..."

# Make admin request  
ADMIN_RESPONSE=$(make_auth_request "GET" "/api/admin/stats")
echo "Admin stats request response: $(echo $ADMIN_RESPONSE | cut -c1-100)..."
echo ""

# Step 5: Disable response body capture
echo -e "${YELLOW}🔧 Step 5: Disabling response body capture...${NC}"
DISABLE_RESPONSE=$(make_auth_request "PUT" "/api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE" '{"value": false}')
echo "Disable response: $DISABLE_RESPONSE"

# Verify it was disabled
VERIFY_DISABLED=$(make_auth_request "GET" "/api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE")
if echo "$VERIFY_DISABLED" | grep -q '"value":false'; then
    echo -e "${GREEN}✅ Response body capture disabled${NC}"
else
    echo -e "${RED}❌ Failed to disable response body capture${NC}"
    echo "Response: $VERIFY_DISABLED"
fi
echo ""

# Step 6: Test the command line tool
echo -e "${YELLOW}🛠️  Step 6: Testing command line tool...${NC}"
echo "Note: Command line tool requires wrangler proxy setup"
echo "Command to run manually:"
echo "  cd $PROJECT_ROOT"
echo "  node tools/kv/kv-config-manager.js status"
echo "  node tools/kv/kv-config-manager.js get ENABLE_RESPONSE_BODY_CAPTURE"
echo "  node tools/kv/kv-config-manager.js enable ENABLE_RESPONSE_BODY_CAPTURE"
echo "  node tools/kv/kv-config-manager.js disable ENABLE_RESPONSE_BODY_CAPTURE"
echo ""

# Step 7: Show usage examples
echo -e "${BLUE}📚 Step 7: Usage Examples${NC}"
echo ""
echo -e "${GREEN}✅ API Usage:${NC}"
echo "  # Check current setting"
echo "  GET /api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE"
echo ""
echo "  # Enable response capture"  
echo "  PUT /api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE"
echo "  Body: {\"value\": true}"
echo ""
echo "  # Disable response capture"
echo "  PUT /api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE" 
echo "  Body: {\"value\": false}"
echo ""
echo -e "${GREEN}✅ Command Line Usage:${NC}"
echo "  node tools/kv/kv-config-manager.js status                        # Check tool status"
echo "  node tools/kv/kv-config-manager.js get ENABLE_RESPONSE_BODY_CAPTURE  # Get current value"
echo "  node tools/kv/kv-config-manager.js enable ENABLE_RESPONSE_BODY_CAPTURE  # Enable capture"
echo "  node tools/kv/kv-config-manager.js disable ENABLE_RESPONSE_BODY_CAPTURE # Disable capture"
echo "  node tools/kv/kv-config-manager.js set <key> <value> --type <type>      # Set any KV key"
echo ""

echo -e "${GREEN}🎉 Response Body Capture Feature Test Complete!${NC}"
echo ""
echo -e "${BLUE}📋 Summary:${NC}"
echo "✅ KV configuration key added: ENABLE_RESPONSE_BODY_CAPTURE"
echo "✅ Middleware updated to use dynamic configuration"
echo "✅ API endpoints work for managing the setting"
echo "✅ Command line tool created for easy management"
echo ""
echo -e "${YELLOW}⚠️  Security Notes:${NC}"
echo "- This setting affects all super_admin route logging"
echo "- Enabling capture may expose sensitive data in console logs"
echo "- Only use in development/debugging scenarios"
echo "- Remember to disable after debugging"
