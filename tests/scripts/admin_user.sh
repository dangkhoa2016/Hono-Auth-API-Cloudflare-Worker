#!/bin/bash

# ====================================================================
# ADMIN ROLE TESTING SCRIPT
# ====================================================================
# Test all endpoints with admin credentials
# Expected: User management access, limited Super Admin features
# ====================================================================

# Configuration
BASE_URL="http://localhost:8788"
ADMIN_EMAIL="test-admin@example.com"
ADMIN_PASSWORD="password123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🔧 ADMIN ROLE TESTING${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo -e "User: ${ADMIN_EMAIL}"
echo -e "Role: Admin"
echo -e "Expected: User management access, cannot see/manage super_admin users"
echo ""

# Step 1: Login to get access token
echo -e "${YELLOW}📝 Step 1: Login as Admin${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$ADMIN_EMAIL\",\"password\":\"$ADMIN_PASSWORD\"}")

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

# ====================================================================
# ADMIN PROFILE ACCESS - Should work
# ====================================================================
echo -e "${YELLOW}👨‍💼 ADMIN PROFILE TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for profile access"
echo ""

echo -e "${BLUE}👨‍💼 GET /api/user/profile${NC}"
curl -s -X GET "$BASE_URL/api/user/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}👨‍💼 GET /api/user/me${NC}"
curl -s -X GET "$BASE_URL/api/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

# ====================================================================
# ADMIN USER MANAGEMENT - Should work with restrictions
# ====================================================================
echo -e "${YELLOW}👥 ADMIN USER MANAGEMENT TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} - Can manage users and admins, but NOT super_admin users"
echo ""

echo -e "${BLUE}👥 GET /api/admin/users (View users list)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Should see 'user' and 'admin' roles only"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}👥 GET /api/admin/users/2 (View specific user - should be accessible)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - If user exists and not super_admin"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/users/2" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}👥 GET /api/admin/users/1 (Try to view Super Admin - should fail)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Cannot access super_admin user"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/users/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}👥 POST /api/admin/users (Create regular user)${NC}"
echo -e "Expected: ${GREEN}201 Created${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin-created-user-'$(date +%s)'@example.com","password":"password123","full_name":"Admin Created User","role":"user"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

# Extract created user ID for later tests
CREATED_USER_ID=$(echo "$BODY" | jq -r '.data.id' 2>/dev/null)
echo ""

echo -e "${BLUE}👥 POST /api/admin/users (Create admin user)${NC}"
echo -e "Expected: ${GREEN}201 Created${NC} - Admin can create other admins"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin-created-admin-'$(date +%s)'@example.com","password":"password123","full_name":"Admin Created Admin","role":"admin"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}👥 POST /api/admin/users (Try to create super_admin)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Admin cannot create super_admin users"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"admin-attempt-super-'$(date +%s)'@example.com","password":"password123","full_name":"Admin Attempt Super","role":"super_admin"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}👥 PUT /api/admin/users/2 (Update accessible user profile)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - If user exists and accessible to admin"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/2" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Updated by Admin"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}👥 PUT /api/admin/users/1 (Try to update Super Admin - should fail)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Cannot modify super_admin user"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Hacked by Admin"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# Test role changes with created user ID if available
if [ "$CREATED_USER_ID" != "null" ] && [ -n "$CREATED_USER_ID" ]; then
    echo -e "${BLUE}👥 PUT /api/admin/users/$CREATED_USER_ID/role (Change created user to admin)${NC}"
    echo -e "Expected: ${GREEN}200 OK${NC} - Admin can promote users to admin"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/$CREATED_USER_ID/role" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"role":"admin"}')
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    echo "HTTP Status: $HTTP_STATUS"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo ""

    echo -e "${BLUE}👥 PUT /api/admin/users/$CREATED_USER_ID/role (Try to change to super_admin)${NC}"
    echo -e "Expected: ${RED}403 Forbidden${NC} - Admin cannot promote to super_admin"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/$CREATED_USER_ID/role" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"role":"super_admin"}')
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    echo "HTTP Status: $HTTP_STATUS"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo ""

    echo -e "${BLUE}DELETE /api/admin/users/$CREATED_USER_ID (Delete the admin user we just promoted)${NC}"
    echo -e "Expected: ${GREEN}200 OK${NC} - Admin can delete other admin users"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/api/admin/users/$CREATED_USER_ID" \
      -H "Authorization: Bearer $ACCESS_TOKEN")
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    echo "HTTP Status: $HTTP_STATUS"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo ""
else
    echo -e "${YELLOW}⚠️ Skipping role change and admin deletion tests - no created user ID available${NC}"
    echo ""
fi

echo -e "${BLUE}👥 PUT /api/admin/users/1/role (Try to change Super Admin User Role - should fail)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Cannot modify super_admin role"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/1/role" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role":"admin"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}👥 DELETE /api/admin/users/2 (Delete accessible user)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - If user exists and is user/admin role"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/api/admin/users/2" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}👥 DELETE /api/admin/users/1 (Try to delete Super Admin - should fail)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Cannot delete super_admin user"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/api/admin/users/1" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# Get admin's own user ID first
echo -e "${BLUE}👨‍💼 GET /api/user/me (Get own user ID)${NC}"
ADMIN_PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
ADMIN_USER_ID=$(echo "$ADMIN_PROFILE_RESPONSE" | jq -r '.data.id' 2>/dev/null)
echo "Admin User ID: $ADMIN_USER_ID"
echo ""

echo -e "${BLUE}👥 DELETE /api/admin/users/$ADMIN_USER_ID (Try to delete own account - should fail)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Cannot delete your own account"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/api/admin/users/$ADMIN_USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# ====================================================================
# ADMIN STATISTICS - Should work
# ====================================================================
echo -e "${YELLOW}📊 ADMIN STATISTICS TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for admin statistics"
echo ""

echo -e "${BLUE}📊 GET /api/admin/stats${NC}"
echo -e "Expected: ${GREEN}200 OK${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/stats" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}📊 GET /api/admin/dashboard${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Admin should see LIMITED data (no super_admin users)"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/dashboard" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Dashboard access granted${NC}"
    
    # Extract key metrics to verify Admin restrictions
    ACCESS_LEVEL=$(echo "$BODY" | jq -r '.data.permissions.accessLevel' 2>/dev/null)
    CAN_VIEW_SUPER_ADMIN=$(echo "$BODY" | jq -r '.data.permissions.canViewSuperAdminData' 2>/dev/null)
    TOTAL_USERS=$(echo "$BODY" | jq -r '.data.overview.totalUsers' 2>/dev/null)
    SUPER_ADMIN_COUNT=$(echo "$BODY" | jq -r '.data.summary.superAdminCount' 2>/dev/null)
    SUPER_ADMIN_IN_RECENT=$(echo "$BODY" | jq '[.data.recentUsers[]? | select(.role == "super_admin")] | length' 2>/dev/null)
    
    echo -e "${YELLOW}🔍 Admin Dashboard Analysis:${NC}"
    echo "   Access Level: $ACCESS_LEVEL (should be 'limited')"
    echo "   Can View Super Admin Data: $CAN_VIEW_SUPER_ADMIN (should be 'false')"
    echo "   Total Users: $TOTAL_USERS (should exclude super_admins)"
    echo "   Super Admin Count: $SUPER_ADMIN_COUNT (should be 0)"
    echo "   Super Admins in Recent Users: $SUPER_ADMIN_IN_RECENT (should be 0)"
    
    if [ "$ACCESS_LEVEL" = "limited" ] && [ "$CAN_VIEW_SUPER_ADMIN" = "false" ] && [ "$SUPER_ADMIN_COUNT" = "0" ]; then
        echo -e "${GREEN}✅ Admin has RESTRICTED dashboard access (super_admin data filtered)${NC}"
    else
        echo -e "${RED}❌ Admin restrictions may not be working properly${NC}"
    fi
else
    echo -e "${RED}❌ Dashboard access failed${NC}"
fi

echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔒 GET /api/admin/system-health${NC}"
echo -e "Expected: ${GREEN}200 (Limited)${NC} - Only admin/super_admin access"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/system-health" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# ====================================================================
# Super Admin EXCLUSIVE FEATURES - Should be FORBIDDEN
# ====================================================================
echo -e "${YELLOW}🔒 Super Admin EXCLUSIVE TESTING${NC}"
echo -e "Expected: ${RED}❌ FORBIDDEN${NC} for Super Admin exclusive features"
echo ""

echo -e "${BLUE}🔒 GET /api/admin/settings${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Only super_admin access"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/settings" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔒 GET /api/admin/audit-logs${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Only super_admin access"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/audit-logs" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔒 GET /api/admin/backup${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Only super_admin access"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/backup" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# ====================================================================
# TRANSLATION ENDPOINTS - Should work
# ====================================================================
echo -e "${YELLOW}🌍 TRANSLATION ENDPOINTS TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for translation endpoints"
echo ""

echo -e "${BLUE}🌍 GET /api/translations${NC}"
curl -s -X GET "$BASE_URL/api/translations" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}🌍 GET /api/translations/en${NC}"
curl -s -X GET "$BASE_URL/api/translations/en" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

# ====================================================================
# DEMO ENDPOINTS - Should work
# ====================================================================
echo -e "${YELLOW}🎯 DEMO ENDPOINTS TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for demo endpoints"
echo ""

echo -e "${BLUE}🎯 GET /api/demo${NC}"
curl -s -X GET "$BASE_URL/api/demo" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}🎯 GET /api/demo/auth${NC}"
curl -s -X GET "$BASE_URL/api/demo/auth" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

# ====================================================================
# TEST SUMMARY
# ====================================================================
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}📊 ADMIN TESTING SUMMARY${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${GREEN}✅ SHOULD WORK:${NC}"
echo "  - All public endpoints"
echo "  - Own profile access and updates"
echo "  - User list (only 'user' and 'admin' roles visible)"
echo "  - Create users with 'user' and 'admin' roles"
echo "  - Update/delete users with 'user' and 'admin' roles"
echo "  - Delete other admin users (same or lower role)"
echo "  - Change roles between 'user' and 'admin'"
echo "  - Admin statistics and dashboard (LIMITED - no super_admin data)"
echo "  - Translation and demo endpoints"
echo ""
echo -e "${RED}❌ SHOULD BE FORBIDDEN:${NC}"
echo "  - Create users with 'super_admin' role"
echo "  - View/manage users with 'super_admin' role"
echo "  - Promote users to 'super_admin' role"
echo "  - Delete own admin account"
echo "  - System settings (/api/admin/settings)"
echo "  - Audit logs (/api/admin/audit-logs)"
echo "  - System backup (/api/admin/backup)"
echo "  - System health (/api/admin/system-health)"
echo ""
echo -e "${YELLOW}🔍 DASHBOARD PERMISSIONS (Admin):${NC}"
echo "  ✅ Access Level: 'limited' (filtered data)"
echo "  ✅ Can View Super Admin Data: false"
echo "  ✅ User counts exclude super_admin users"
echo "  ✅ Recent users list excludes super_admin users"
echo "  ✅ Role statistics exclude super_admin counts"
echo ""
echo -e "${YELLOW}💡 Note: Admin users have user management privileges but cannot access Super Admin exclusive features or data.${NC}"
echo -e "${BLUE}=====================================================================${NC}"
