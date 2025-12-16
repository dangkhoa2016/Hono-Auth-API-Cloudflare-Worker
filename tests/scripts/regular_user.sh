#!/bin/bash

# ====================================================================
# REGULAR USER ROLE TESTING SCRIPT
# ====================================================================
# Test all endpoints with regular user credentials
# Expected: Limited access - only own profile and public endpoints
# ====================================================================

# Configuration
BASE_URL="http://localhost:8788"
USER_EMAIL="test-user@example.com"
USER_PASSWORD="password123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🔧 REGULAR USER ROLE TESTING${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo -e "User: ${USER_EMAIL}"
echo -e "Role: Regular User"
echo -e "Expected: Limited access - only own profile and public endpoints"
echo ""

# Step 1: Login to get access token
echo -e "${YELLOW}📝 Step 1: Login as Regular User${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")

echo "Login Response:"
echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"

# Extract access token
ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token' 2>/dev/null)

if [ "$ACCESS_TOKEN" = "null" ] || [ -z "$ACCESS_TOKEN" ]; then
    echo -e "${RED}❌ Failed to get access token. Cannot continue tests.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Login successful. Token obtained.${NC}"
echo ""

# ====================================================================
# PUBLIC ENDPOINTS - Should work for everyone
# ====================================================================
echo -e "${YELLOW}📂 PUBLIC ENDPOINTS TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for all public endpoints"
echo ""

echo -e "${BLUE}🌐 GET /health${NC}"
curl -s -X GET "$BASE_URL/health" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}🌐 GET /version${NC}"
curl -s -X GET "$BASE_URL/version" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}🌐 GET /language${NC}"
curl -s -X GET "$BASE_URL/language" | jq . 2>/dev/null || echo "Response failed"
echo ""

# ====================================================================
# USER PROFILE ENDPOINTS - Should work for own profile
# ====================================================================
echo -e "${YELLOW}👤 USER PROFILE ENDPOINTS TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for own profile access"
echo ""

echo -e "${BLUE}👤 GET /api/user/profile${NC}"
curl -s -X GET "$BASE_URL/api/user/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}👤 GET /api/user/me${NC}"
curl -s -X GET "$BASE_URL/api/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}👤 PUT /api/user/profile (Update own profile)${NC}"
curl -s -X PUT "$BASE_URL/api/user/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Updated Regular User Name"}' | jq . 2>/dev/null || echo "Response failed"
echo ""

# ====================================================================
# ADMIN ENDPOINTS - Should be FORBIDDEN for regular users
# ====================================================================
echo -e "${YELLOW}🔒 ADMIN ENDPOINTS TESTING${NC}"
echo -e "Expected: ${RED}❌ FORBIDDEN (403)${NC} for all admin endpoints"
echo ""

echo -e "${BLUE}🔒 GET /api/admin/users${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔒 GET /api/admin/stats${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔒 GET /api/admin/dashboard${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Regular users should be COMPLETELY BLOCKED"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/dashboard" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "403" ]; then
    echo -e "${GREEN}✅ Dashboard access correctly FORBIDDEN for regular user${NC}"
    echo -e "${YELLOW}🔍 Regular User Dashboard Analysis:${NC}"
    echo "   Status: 403 Forbidden ✅"
    echo "   Access Level: None (completely blocked) ✅"
    echo "   Message: Should indicate insufficient privileges ✅"
elif [ "$HTTP_STATUS" = "401" ]; then
    echo -e "${YELLOW}⚠️ Authentication issue (401) - check token${NC}"
else
    echo -e "${RED}❌ SECURITY ISSUE: Regular user should NOT have dashboard access (got $HTTP_STATUS)${NC}"
fi

echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔒 POST /api/admin/users (Try to create user)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"regular-attempt@example.com","password":"password123","full_name":"Regular Attempt","role":"user"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔒 PUT /api/admin/users/1 (Try to update other user)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Hacked by Regular User"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔒 DELETE /api/admin/users/1 (Try to delete user)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/api/admin/users/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔒 PUT /api/admin/users/1/role (Try to change role)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/1/role" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# ====================================================================
# TRANSLATION ENDPOINTS - Should work for public endpoints
# ====================================================================
echo -e "${YELLOW}🌍 TRANSLATION ENDPOINTS TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for public translation endpoints"
echo ""

echo -e "${BLUE}🌍 GET /api/translations${NC}"
curl -s -X GET "$BASE_URL/api/translations" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}🌍 GET /api/translations/en${NC}"
curl -s -X GET "$BASE_URL/api/translations/en" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}🌍 GET /api/translations/demo${NC}"
curl -s -X GET "$BASE_URL/api/translations/demo" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

# ====================================================================
# DEMO ENDPOINTS - Should work for authenticated users
# ====================================================================
echo -e "${YELLOW}🎯 DEMO ENDPOINTS TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for demo endpoints"
echo ""

echo -e "${BLUE}🎯 GET /api/demo${NC}"
curl -s -X GET "$BASE_URL/api/demo" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}🎯 GET /api/demo/user${NC}"
curl -s -X GET "$BASE_URL/api/demo/user" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}🎯 GET /api/zod_demo${NC}"
curl -s -X GET "$BASE_URL/api/zod_demo" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

# ====================================================================
# TEST SUMMARY
# ====================================================================
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}📊 REGULAR USER TESTING SUMMARY${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${GREEN}✅ SHOULD WORK:${NC}"
echo "  - Public endpoints (health, version, language)"
echo "  - Own profile access and updates"
echo "  - Translation endpoints"
echo "  - Demo endpoints"
echo ""
echo -e "${RED}❌ SHOULD BE FORBIDDEN:${NC}"
echo "  - All admin endpoints (/api/admin/*)"
echo "  - Dashboard access (/api/admin/dashboard) - COMPLETE BLOCK"
echo "  - User creation, update, deletion of other users"
echo "  - Role changes"
echo "  - System statistics and settings"
echo ""
echo -e "${YELLOW}🔍 DASHBOARD PERMISSIONS (Regular User):${NC}"
echo "  ❌ Access Level: None (403 Forbidden)"
echo "  ❌ Complete block - no dashboard access"
echo "  ❌ Cannot view any admin statistics"
echo "  ❌ Cannot view user management data"
echo ""
echo -e "${YELLOW}💡 Note: Regular users should only have access to their own data and public resources.${NC}"
echo -e "${BLUE}=====================================================================${NC}"
