#!/bin/bash

# ====================================================================
# Super Admin User Role TESTING SCRIPT
# ====================================================================
# Test all endpoints with Super Admin credentials
# Expected: Full system access, unrestricted user management
# ====================================================================

# Configuration
BASE_URL="http://localhost:8788"
SUPERADMIN_EMAIL="test-superadmin@example.com"
SUPERADMIN_PASSWORD="password123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🔧 Super Admin User Role TESTING${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo -e "User: ${SUPERADMIN_EMAIL}"
echo -e "Role: Super Admin"
echo -e "Expected: Full system access, unrestricted user management"
echo ""

# Step 1: Login to get access token
echo -e "${YELLOW}📝 Step 1: Login as Super Admin${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SUPERADMIN_EMAIL\",\"password\":\"$SUPERADMIN_PASSWORD\"}")

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
# Super Admin PROFILE ACCESS - Should work
# ====================================================================
echo -e "${YELLOW}👑 Super Admin PROFILE TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for profile access"
echo ""

echo -e "${BLUE}👑 GET /api/user/profile${NC}"
curl -s -X GET "$BASE_URL/api/user/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

echo -e "${BLUE}👑 GET /api/user/me${NC}"
curl -s -X GET "$BASE_URL/api/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

# ====================================================================
# Super Admin USER MANAGEMENT - Should work WITHOUT restrictions
# ====================================================================
echo -e "${YELLOW}👥 Super Admin USER MANAGEMENT TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} - Can manage ALL users including super_admin users"
echo ""

echo -e "${BLUE}👥 GET /api/admin/users (View ALL users)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Should see ALL roles: 'user', 'admin', 'super_admin'"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}👥 GET /api/admin/users/1 (View specific user)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Can view any user regardless of role"
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
  -d '{"email":"super-created-user-'$(date +%s)'@example.com","password":"password123","full_name":"Super Admin Created User","role":"user"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

# Extract created user ID for role change tests
CREATED_USER_ID=$(echo "$BODY" | jq -r '.data.id' 2>/dev/null)
echo ""

echo -e "${BLUE}👥 POST /api/admin/users (Create admin user)${NC}"
echo -e "Expected: ${GREEN}201 Created${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"super-created-admin-'$(date +%s)'@example.com","password":"password123","full_name":"Super Admin Created Admin","role":"admin"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"

# Extract created admin ID for role change tests  
CREATED_ADMIN_ID=$(echo "$BODY" | jq -r '.data.id' 2>/dev/null)
echo ""

echo -e "${BLUE}👥 POST /api/admin/users (Create super_admin user)${NC}"
echo -e "Expected: ${GREEN}201 Created${NC} - Super Admin can create other Super Admins"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/admin/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email":"super-created-super-'$(date +%s)'@example.com","password":"password123","full_name":"Super Admin Created Super","role":"super_admin"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}👥 PUT /api/admin/users/2 (Update any user profile)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Can update any user"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/2" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"full_name":"Updated by Super Admin"}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# Test comprehensive role changes with created users
if [ "$CREATED_USER_ID" != "null" ] && [ -n "$CREATED_USER_ID" ]; then
    echo -e "${BLUE}👥 PUT /api/admin/users/$CREATED_USER_ID/role (Change user to admin)${NC}"
    echo -e "Expected: ${GREEN}200 OK${NC}"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/$CREATED_USER_ID/role" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"role":"admin"}')
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    echo "HTTP Status: $HTTP_STATUS"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo ""

    echo -e "${BLUE}👥 PUT /api/admin/users/$CREATED_USER_ID/role (Change admin to super_admin)${NC}"
    echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin can promote to super_admin"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/$CREATED_USER_ID/role" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"role":"super_admin"}')
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    echo "HTTP Status: $HTTP_STATUS"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo ""

    echo -e "${BLUE}👥 PUT /api/admin/users/$CREATED_USER_ID/role (Demote super_admin to user)${NC}"
    echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin can demote any role"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/$CREATED_USER_ID/role" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"role":"user"}')
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    echo "HTTP Status: $HTTP_STATUS"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo ""
else
    echo -e "${YELLOW}⚠️ Skipping role change tests - no created user ID available${NC}"
    echo ""
fi

# Test role changes with created admin
if [ "$CREATED_ADMIN_ID" != "null" ] && [ -n "$CREATED_ADMIN_ID" ]; then
    echo -e "${BLUE}👥 PUT /api/admin/users/$CREATED_ADMIN_ID/role (Change admin to super_admin)${NC}"
    echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin can promote admin to super_admin"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/users/$CREATED_ADMIN_ID/role" \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      -H "Content-Type: application/json" \
      -d '{"role":"super_admin"}')
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    echo "HTTP Status: $HTTP_STATUS"
    echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    echo ""
fi

echo -e "${BLUE}👥 DELETE /api/admin/users/2 (Delete any user)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Can delete any user (except self)"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/api/admin/users/2" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# Get Super Admin's own user ID first
echo -e "${BLUE}👑 GET /api/user/me (Get own user ID for deletion test)${NC}"
SUPERADMIN_PROFILE_RESPONSE=$(curl -s -X GET "$BASE_URL/api/user/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
SUPERADMIN_USER_ID=$(echo "$SUPERADMIN_PROFILE_RESPONSE" | jq -r '.data.id' 2>/dev/null)
echo "Super Admin User ID: $SUPERADMIN_USER_ID"
echo ""

echo -e "${BLUE}👥 DELETE /api/admin/users/$SUPERADMIN_USER_ID (Try to delete own account - should fail)${NC}"
echo -e "Expected: ${RED}403 Forbidden${NC} - Cannot delete your own account"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/api/admin/users/$SUPERADMIN_USER_ID" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# ====================================================================
# Super Admin STATISTICS - Should work
# ====================================================================
echo -e "${YELLOW}📊 Super Admin STATISTICS TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for all statistics"
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
echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin should see ALL data including super_admin users"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/dashboard" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"

if [ "$HTTP_STATUS" = "200" ]; then
    echo -e "${GREEN}✅ Dashboard access granted${NC}"
    
    # Extract key metrics to verify Super Admin privileges
    ACCESS_LEVEL=$(echo "$BODY" | jq -r '.data.permissions.accessLevel' 2>/dev/null)
    CAN_VIEW_SUPER_ADMIN=$(echo "$BODY" | jq -r '.data.permissions.canViewSuperAdminData' 2>/dev/null)
    TOTAL_USERS=$(echo "$BODY" | jq -r '.data.overview.totalUsers' 2>/dev/null)
    SUPER_ADMIN_COUNT=$(echo "$BODY" | jq -r '.data.summary.superAdminCount' 2>/dev/null)
    
    echo -e "${YELLOW}🔍 Super Admin Dashboard Analysis:${NC}"
    echo "   Access Level: $ACCESS_LEVEL (should be 'full')"
    echo "   Can View Super Admin Data: $CAN_VIEW_SUPER_ADMIN (should be 'true')"
    echo "   Total Users: $TOTAL_USERS"
    echo "   Super Admin Count: $SUPER_ADMIN_COUNT (should be > 0)"
    
    if [ "$ACCESS_LEVEL" = "full" ] && [ "$CAN_VIEW_SUPER_ADMIN" = "true" ]; then
        echo -e "${GREEN}✅ Super Admin has FULL dashboard privileges${NC}"
    else
        echo -e "${RED}❌ Super Admin privileges may be restricted${NC}"
    fi
else
    echo -e "${RED}❌ Dashboard access failed${NC}"
fi

echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# ====================================================================
# Super Admin EXCLUSIVE FEATURES - Should ALL work
# ====================================================================
echo -e "${YELLOW}🔑 Super Admin EXCLUSIVE TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for ALL Super Admin exclusive features"
echo ""

echo -e "${BLUE}🔑 GET /api/admin/settings${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin exclusive"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/settings" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔑 PUT /api/admin/settings${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin can modify settings"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/admin/settings" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"maintenance_mode":false,"max_users":1000}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔑 GET /api/admin/audit-logs${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin exclusive"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/audit-logs" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔑 GET /api/admin/backup${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin exclusive"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/backup" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔑 POST /api/admin/backup${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin can create backups"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/admin/backup" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"type":"full","compression":true}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}🔑 GET /api/admin/system-health${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin exclusive"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/system-health" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# ====================================================================
# ADVANCED Super Admin OPERATIONS
# ====================================================================
echo -e "${YELLOW}⚡ ADVANCED Super Admin OPERATIONS${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for advanced operations"
echo ""

echo -e "${BLUE}⚡ GET /api/admin/users?role=super_admin (Filter Super Admins)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Can view Super Admin users"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/users?role=super_admin" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}⚡ GET /api/admin/users?status=inactive (View inactive users)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Can view all user statuses"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/users?status=inactive" \
  -H "Authorization: Bearer $ACCESS_TOKEN")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

echo -e "${BLUE}⚡ GET /api/admin/users?limit=50&page=1 (Pagination)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Supports pagination"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/users?limit=50&page=1" \
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

echo -e "${BLUE}🌍 GET /api/translations/demo/all-languages${NC}"
curl -s -X GET "$BASE_URL/api/translations/demo/all-languages" \
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

echo -e "${BLUE}🎯 GET /api/zod_demo${NC}"
curl -s -X GET "$BASE_URL/api/zod_demo" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | jq . 2>/dev/null || echo "Response failed"
echo ""

# ====================================================================
# BULK OPERATIONS (Super Admin Only)
# ====================================================================
echo -e "${YELLOW}📦 BULK OPERATIONS TESTING${NC}"
echo -e "Expected: ${GREEN}✅ SUCCESS${NC} for bulk operations"
echo ""

echo -e "${BLUE}📦 POST /api/bulk-operation (Bulk user operations)${NC}"
echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin can perform bulk operations"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$BASE_URL/api/bulk-operation" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"operation":"status_update","user_ids":[1,2,3],"data":{"status":"active"}}')
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# ====================================================================
# TEST SUMMARY
# ====================================================================
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}📊 Super Admin TESTING SUMMARY${NC}"
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${GREEN}✅ SHOULD ALL WORK:${NC}"
echo "  - All public endpoints"
echo "  - Full profile access and updates"
echo "  - User list (ALL roles visible: 'user', 'admin', 'super_admin')"
echo "  - Create users with ANY role ('user', 'admin', 'super_admin')"
echo "  - Update/delete ANY user regardless of role"
echo "  - Change roles to ANY role including 'super_admin'"
echo "  - All admin statistics and dashboard (FULL ACCESS)"
echo "  - ALL Super Admin exclusive features:"
echo "    • System settings (/api/admin/settings)"
echo "    • Audit logs (/api/admin/audit-logs)"
echo "    • System backup (/api/admin/backup)"
echo "    • System health (/api/admin/system-health)"
echo "  - Advanced user filtering and pagination"
echo "  - Bulk operations"
echo "  - Translation and demo endpoints"
echo ""
echo -e "${YELLOW}🔍 DASHBOARD PERMISSIONS (Super Admin):${NC}"
echo "  ✅ Access Level: 'full' (unrestricted data)"
echo "  ✅ Can View Super Admin Data: true"
echo "  ✅ User counts include ALL users including super_admins"
echo "  ✅ Recent users list includes super_admin users"
echo "  ✅ Role statistics include super_admin counts"
echo "  ✅ Complete visibility into all system metrics"
echo ""
echo -e "${RED}❌ LIMITATIONS:${NC}"
echo "  - Cannot delete own account (safety measure)"
echo "  - Some operations may require additional validations"
echo ""
echo -e "${YELLOW}💡 Note: Super Admin has unrestricted access to all system features and user management.${NC}"
echo -e "${BLUE}=====================================================================${NC}"
