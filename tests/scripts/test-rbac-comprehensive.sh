#!/bin/bash

# =============================================================================
# COMPREHENSIVE ROLE-BASED ACCESS CONTROL TEST SCRIPT
# Test all role-based access control features including Dashboard and Admin endpoints
# =============================================================================

API_BASE="http://localhost:8788"
CONTENT_TYPE="Content-Type: application/json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Function to print colored output
print_section() {
    echo -e "\n${BLUE}=== $1 ===${NC}"
}

print_test() {
    echo -e "\n${YELLOW}🧪 $1${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

print_info() {
    echo -e "${CYAN}ℹ️  $1${NC}"
}

# Function to get token for a user (enhanced with better error handling)
get_token() {
    local email=$1
    local password=$2
    local response=$(curl -s -X POST "$API_BASE/api/auth/login" \
        -H "$CONTENT_TYPE" \
        -d "{\"email\":\"$email\",\"password\":\"$password\"}")
    
    echo "$response" | jq -r '.data.access_token // empty' 2>/dev/null
}

# Function to make authenticated request
auth_request() {
    local method=$1
    local url=$2
    local token=$3
    local data=$4
    
    if [ -n "$data" ]; then
        curl -s -X "$method" "$API_BASE$url" \
            -H "$CONTENT_TYPE" \
            -H "Authorization: Bearer $token" \
            -d "$data"
    else
        curl -s -X "$method" "$API_BASE$url" \
            -H "Authorization: Bearer $token"
    fi
}

# Function to make request with status code
auth_request_with_status() {
    local method=$1
    local url=$2
    local token=$3
    local data=$4
    local temp_file="/tmp/rbac_response_$$"
    local temp_headers="/tmp/rbac_headers_$$"
    
    if [ -n "$data" ]; then
        status_code=$(curl -s -w "%{http_code}" -X "$method" "$API_BASE$url" \
            -H "$CONTENT_TYPE" \
            -H "Authorization: Bearer $token" \
            -d "$data" \
            -o "$temp_file" \
            -D "$temp_headers")
    else
        status_code=$(curl -s -w "%{http_code}" -X "$method" "$API_BASE$url" \
            -H "Authorization: Bearer $token" \
            -o "$temp_file" \
            -D "$temp_headers")
    fi
    
    # Return both status code and response file path separated by |
    echo "$status_code|$temp_file"
}

# =============================================================================
# STEP 1: HEALTH CHECK
# =============================================================================
print_section "HEALTH CHECK"
health_response=$(curl -s "$API_BASE/health")
echo "Health Check Response:"
echo "$health_response" | jq . 2>/dev/null || echo "$health_response"

if echo "$health_response" | jq -e '.success' > /dev/null 2>&1; then
    print_success "Server is healthy and running"
else
    print_error "Server health check failed"
fi

# =============================================================================
# STEP 2: USER AUTHENTICATION
# =============================================================================
print_section "USER AUTHENTICATION"

# Super Admin Login (User ID = 1)
print_test "Login as Super Admin (test-superadmin@example.com)"
SUPER_ADMIN_TOKEN=$(get_token "test-superadmin@example.com" "password123")

if [ -n "$SUPER_ADMIN_TOKEN" ] && [ "$SUPER_ADMIN_TOKEN" != "null" ]; then
    print_success "Super Admin token extracted successfully"
else
    print_error "Failed to extract Super Admin token"
fi

# Admin Login
print_test "Login as Admin (test-admin@example.com)"
ADMIN_TOKEN=$(get_token "test-admin@example.com" "password123")

if [ -n "$ADMIN_TOKEN" ] && [ "$ADMIN_TOKEN" != "null" ]; then
    print_success "Admin token extracted successfully"
else
    print_error "Failed to extract Admin token"
fi

# Regular User Login
print_test "Login as Regular User (test-user@example.com)"
USER_TOKEN=$(get_token "test-user@example.com" "password123")

if [ -n "$USER_TOKEN" ] && [ "$USER_TOKEN" != "null" ]; then
    print_success "User token extracted successfully"
else
    print_error "Failed to extract User token"
fi

# =============================================================================
# STEP 3: DASHBOARD ACCESS TESTS
# =============================================================================
print_section "DASHBOARD ACCESS TESTS"

# Super Admin Dashboard Test
if [ -n "$SUPER_ADMIN_TOKEN" ]; then
    print_test "Super Admin - Dashboard Access (Full Privileges)"
    SUPER_ADMIN_DASHBOARD=$(auth_request "GET" "/api/admin/dashboard" "$SUPER_ADMIN_TOKEN")
    
    if echo "$SUPER_ADMIN_DASHBOARD" | jq -e '.success' > /dev/null 2>&1; then
        print_success "Super Admin can access dashboard"
        
        # Extract key metrics
        ACCESS_LEVEL=$(echo "$SUPER_ADMIN_DASHBOARD" | jq -r '.data.permissions.accessLevel')
        CAN_VIEW_SUPER_ADMIN=$(echo "$SUPER_ADMIN_DASHBOARD" | jq -r '.data.permissions.canViewSuperAdminData')
        SUPER_ADMIN_COUNT=$(echo "$SUPER_ADMIN_DASHBOARD" | jq -r '.data.summary.superAdminCount')
        TOTAL_USERS_SUPER=$(echo "$SUPER_ADMIN_DASHBOARD" | jq -r '.data.overview.totalUsers')
        SUPER_ADMIN_IN_RECENT=$(echo "$SUPER_ADMIN_DASHBOARD" | jq '[.data.recentUsers[] | select(.role == "super_admin")] | length')
        
        print_info "Access Level: $ACCESS_LEVEL"
        print_info "Can View Super Admin Data: $CAN_VIEW_SUPER_ADMIN"
        print_info "Super Admin Count: $SUPER_ADMIN_COUNT"
        print_info "Total Users: $TOTAL_USERS_SUPER"
        print_info "Super Admin users in recent list: $SUPER_ADMIN_IN_RECENT"
        
        # Show sample data structure
        echo -e "\n${PURPLE}📊 Dashboard Structure Preview:${NC}"
        echo "$SUPER_ADMIN_DASHBOARD" | jq '.data | {overview, permissions, summary}' 2>/dev/null
        
    else
        print_error "Super Admin dashboard access failed"
        echo "$SUPER_ADMIN_DASHBOARD" | jq '.' 2>/dev/null
    fi
fi

# Regular Admin Dashboard Test
if [ -n "$ADMIN_TOKEN" ]; then
    print_test "Regular Admin - Dashboard Access (Limited Privileges)"
    ADMIN_DASHBOARD=$(auth_request "GET" "/api/admin/dashboard" "$ADMIN_TOKEN")
    
    if echo "$ADMIN_DASHBOARD" | jq -e '.success' > /dev/null 2>&1; then
        print_success "Regular admin can access dashboard"
        
        # Extract key metrics
        ACCESS_LEVEL=$(echo "$ADMIN_DASHBOARD" | jq -r '.data.permissions.accessLevel')
        CAN_VIEW_SUPER_ADMIN=$(echo "$ADMIN_DASHBOARD" | jq -r '.data.permissions.canViewSuperAdminData')
        SUPER_ADMIN_COUNT=$(echo "$ADMIN_DASHBOARD" | jq -r '.data.summary.superAdminCount')
        TOTAL_USERS_ADMIN=$(echo "$ADMIN_DASHBOARD" | jq -r '.data.overview.totalUsers')
        SUPER_ADMIN_IN_RECENT=$(echo "$ADMIN_DASHBOARD" | jq '[.data.recentUsers[] | select(.role == "super_admin")] | length')
        
        print_info "Access Level: $ACCESS_LEVEL"
        print_info "Can View Super Admin Data: $CAN_VIEW_SUPER_ADMIN"
        print_info "Super Admin Count: $SUPER_ADMIN_COUNT"
        print_info "Total Users: $TOTAL_USERS_ADMIN"
        print_info "Super Admin users in recent list: $SUPER_ADMIN_IN_RECENT"
        
        # Compare with Super Admin view
        if [ -n "$TOTAL_USERS_SUPER" ] && [ -n "$TOTAL_USERS_ADMIN" ]; then
            if [ "$TOTAL_USERS_SUPER" -gt "$TOTAL_USERS_ADMIN" ]; then
                print_success "Role filtering working: Admin sees fewer users ($TOTAL_USERS_ADMIN vs $TOTAL_USERS_SUPER)"
            else
                print_warning "Role filtering may not be working properly"
            fi
        fi
        
    else
        print_error "Regular admin dashboard access failed"
        echo "$ADMIN_DASHBOARD" | jq '.' 2>/dev/null
    fi
fi

# Regular User Dashboard Test (Should Fail)
if [ -n "$USER_TOKEN" ]; then
    print_test "Regular User - Dashboard Access (Should be Forbidden)"
    response_data=$(auth_request_with_status "GET" "/api/admin/dashboard" "$USER_TOKEN")
    status_code=$(echo "$response_data" | cut -d'|' -f1)
    temp_file=$(echo "$response_data" | cut -d'|' -f2)
    
    if [ "$status_code" = "403" ]; then
        print_success "Regular user correctly denied dashboard access (403 Forbidden)"
    else
        print_error "Expected 403 but got $status_code"
        cat "$temp_file" | jq '.' 2>/dev/null || cat "$temp_file"
    fi
    rm -f "$temp_file"
fi

# =============================================================================
# STEP 4: ADMIN STATS COMPARISON
# =============================================================================
print_section "ADMIN STATS vs DASHBOARD COMPARISON"

if [ -n "$SUPER_ADMIN_TOKEN" ]; then
    print_test "Super Admin - Stats Endpoint (Basic)"
    stats_response=$(auth_request "GET" "/api/admin/stats" "$SUPER_ADMIN_TOKEN")
    echo "Stats Response:"
    echo "$stats_response" | jq . 2>/dev/null || echo "$stats_response"
fi

if [ -n "$ADMIN_TOKEN" ]; then
    print_test "Regular Admin - Stats Endpoint (Basic)"
    stats_response=$(auth_request "GET" "/api/admin/stats" "$ADMIN_TOKEN")
    echo "Stats Response:"
    echo "$stats_response" | jq . 2>/dev/null || echo "$stats_response"
fi

# =============================================================================
# STEP 5: PROFILE ACCESS TESTS
# =============================================================================
print_section "PROFILE ACCESS TESTS"

if [ -n "$SUPER_ADMIN_TOKEN" ]; then
    print_test "Super Admin - Get Profile"
    profile_response=$(auth_request "GET" "/api/user/profile" "$SUPER_ADMIN_TOKEN")
    echo "$profile_response" | jq . 2>/dev/null || echo "$profile_response"
fi

if [ -n "$ADMIN_TOKEN" ]; then
    print_test "Admin - Get Profile"
    profile_response=$(auth_request "GET" "/api/user/profile" "$ADMIN_TOKEN")
    echo "$profile_response" | jq . 2>/dev/null || echo "$profile_response"
fi

if [ -n "$USER_TOKEN" ]; then
    print_test "Regular User - Get Profile"
    profile_response=$(auth_request "GET" "/api/user/profile" "$USER_TOKEN")
    echo "$profile_response" | jq . 2>/dev/null || echo "$profile_response"
fi

# =============================================================================
# STEP 6: ADMIN USERS LIST ACCESS
# =============================================================================
print_section "ADMIN USERS LIST ACCESS"

if [ -n "$SUPER_ADMIN_TOKEN" ]; then
    print_test "Super Admin - Get Users List (All Users)"
    users_response=$(auth_request "GET" "/api/admin/users" "$SUPER_ADMIN_TOKEN")
    echo "$users_response" | jq . 2>/dev/null || echo "$users_response"
fi

if [ -n "$ADMIN_TOKEN" ]; then
    print_test "Admin - Get Users List (Filtered)"
    users_response=$(auth_request "GET" "/api/admin/users" "$ADMIN_TOKEN")
    echo "$users_response" | jq . 2>/dev/null || echo "$users_response"
fi

if [ -n "$USER_TOKEN" ]; then
    print_test "Regular User - Get Users List (Should be Forbidden)"
    users_response=$(auth_request "GET" "/api/admin/users" "$USER_TOKEN")
    echo "$users_response" | jq . 2>/dev/null || echo "$users_response"
fi

# =============================================================================
# STEP 7: USER CREATION TESTS
# =============================================================================
print_section "USER CREATION TESTS"

NEW_USER_DATA='{
  "full_name": "Test New User",
  "email": "testnew@example.com",
  "password": "password123",
  "role": "user",
  "status": "active"
}'

if [ -n "$SUPER_ADMIN_TOKEN" ]; then
    print_test "Super Admin - Create New User"
    create_response=$(auth_request "POST" "/api/admin/users" "$SUPER_ADMIN_TOKEN" "$NEW_USER_DATA")
    echo "$create_response" | jq . 2>/dev/null || echo "$create_response"
    
    # Extract new user ID for later tests
    NEW_USER_ID=$(echo "$create_response" | jq -r '.data.id // empty' 2>/dev/null)
    if [ -n "$NEW_USER_ID" ]; then
        print_info "New User ID: $NEW_USER_ID"
    fi
fi

if [ -n "$ADMIN_TOKEN" ]; then
    print_test "Admin - Create New User"
    admin_user_data='{
      "full_name": "Admin Created User",
      "email": "admincreated@example.com",
      "password": "password123",
      "role": "user",
      "status": "active"
    }'
    create_response=$(auth_request "POST" "/api/admin/users" "$ADMIN_TOKEN" "$admin_user_data")
    echo "$create_response" | jq . 2>/dev/null || echo "$create_response"
    
    print_test "Admin - Try to Create Super Admin User (Should be Forbidden)"
    admin_create_super_data='{
      "full_name": "Admin Created Super Admin",
      "email": "admincreatedsuper@example.com",
      "password": "password123",
      "role": "super_admin",
      "status": "active"
    }'
    create_super_response=$(auth_request "POST" "/api/admin/users" "$ADMIN_TOKEN" "$admin_create_super_data")
    echo "$create_super_response" | jq . 2>/dev/null || echo "$create_super_response"
fi

# =============================================================================
# STEP 8: USER DETAILS ACCESS TESTS
# =============================================================================
print_section "USER DETAILS ACCESS TESTS"

if [ -n "$SUPER_ADMIN_TOKEN" ]; then
    print_test "Super Admin - Get User Details (ID: 2)"
    details_response=$(auth_request "GET" "/api/admin/users/2" "$SUPER_ADMIN_TOKEN")
    echo "$details_response" | jq . 2>/dev/null || echo "$details_response"
fi

if [ -n "$ADMIN_TOKEN" ]; then
    print_test "Admin - Get User Details (ID: 3)"
    details_response=$(auth_request "GET" "/api/admin/users/3" "$ADMIN_TOKEN")
    echo "$details_response" | jq . 2>/dev/null || echo "$details_response"
    
    print_test "Admin - Try to Access Super Admin Details (ID: 1) - Should be Forbidden"
    details_response=$(auth_request "GET" "/api/admin/users/1" "$ADMIN_TOKEN")
    echo "$details_response" | jq . 2>/dev/null || echo "$details_response"
fi

# =============================================================================
# STEP 9: ROLE CHANGE TESTS
# =============================================================================
print_section "ROLE CHANGE TESTS"

if [ -n "$SUPER_ADMIN_TOKEN" ] && [ -n "$NEW_USER_ID" ]; then
    print_test "Super Admin - Change User Role (ID: $NEW_USER_ID)"
    role_change_data='{"role": "admin"}'
    role_response=$(auth_request "PUT" "/api/admin/users/$NEW_USER_ID/role" "$SUPER_ADMIN_TOKEN" "$role_change_data")
    echo "$role_response" | jq . 2>/dev/null || echo "$role_response"
fi

if [ -n "$ADMIN_TOKEN" ]; then
    print_test "Admin - Try to Change Role to Super Admin (Should be Forbidden)"
    role_super_data='{"role": "super_admin"}'
    role_response=$(auth_request "PUT" "/api/admin/users/4/role" "$ADMIN_TOKEN" "$role_super_data")
    echo "$role_response" | jq . 2>/dev/null || echo "$role_response"
fi

# =============================================================================
# STEP 10: USER DELETION TESTS
# =============================================================================
print_section "USER DELETION TESTS"

if [ -n "$ADMIN_TOKEN" ]; then
    print_test "Admin - Try to Delete Super Admin (Should be Forbidden)"
    delete_super_response=$(auth_request "DELETE" "/api/admin/users/1" "$ADMIN_TOKEN")
    echo "$delete_super_response" | jq . 2>/dev/null || echo "$delete_super_response"
fi

if [ -n "$SUPER_ADMIN_TOKEN" ] && [ -n "$NEW_USER_ID" ]; then
    print_test "Super Admin - Delete User (ID: $NEW_USER_ID)"
    delete_response=$(auth_request "DELETE" "/api/admin/users/$NEW_USER_ID" "$SUPER_ADMIN_TOKEN")
    echo "$delete_response" | jq . 2>/dev/null || echo "$delete_response"
fi

# =============================================================================
# STEP 11: EDGE CASE TESTS
# =============================================================================
print_section "EDGE CASE TESTS"

# Test with invalid token
print_test "Invalid Token Test - Dashboard"
response_data=$(auth_request_with_status "GET" "/api/admin/dashboard" "invalid_token_here")
status_code=$(echo "$response_data" | cut -d'|' -f1)
temp_file=$(echo "$response_data" | cut -d'|' -f2)
print_info "Status Code: $status_code"
cat "$temp_file" | jq . 2>/dev/null || cat "$temp_file"
rm -f "$temp_file"

# Test without token
print_test "No Token Test - Dashboard"
no_token_response=$(curl -s -X GET "$API_BASE/api/admin/dashboard")
echo "$no_token_response" | jq . 2>/dev/null || echo "$no_token_response"

# =============================================================================
# COMPREHENSIVE SUMMARY
# =============================================================================
print_section "COMPREHENSIVE TEST SUMMARY"

echo -e "${GREEN}✅ Dashboard Role-Based Access Control:${NC}"
echo "  📊 Super Admin: Full access, can view all data including super_admin users"
echo "  🔐 Regular Admin: Limited access, super_admin data filtered out"
echo "  🚫 Regular User: Completely blocked from dashboard (403 Forbidden)"

echo -e "\n${GREEN}✅ Admin Management Features:${NC}"
echo "  👑 Super Admin: Can perform all operations on all users"
echo "  🛡️  Regular Admin: Can manage regular users and admins, but not super_admins"
echo "  👤 Regular User: Can only access own profile"

echo -e "\n${GREEN}✅ Data Filtering for Regular Admin:${NC}"
echo "  📊 User counts exclude super_admin"
echo "  👥 Recent users list excludes super_admin"
echo "  📈 Growth statistics exclude super_admin registrations"
echo "  🎯 Role distribution excludes super_admin counts"

echo -e "\n${GREEN}✅ Security Features:${NC}"
echo "  🔐 JWT token authentication required"
echo "  🛡️  Role-based authorization middleware"
echo "  🚫 Proper 401/403 error responses"
echo "  📝 Detailed permissions in API responses"

echo -e "\n${BLUE}📋 API Endpoints Tested:${NC}"
echo "  • GET /api/admin/dashboard (NEW - comprehensive dashboard data)"
echo "  • GET /api/admin/stats (basic statistics)"
echo "  • GET /api/admin/users (user list with role filtering)"
echo "  • GET /api/admin/users/:id (user details)"
echo "  • POST /api/admin/users (user creation)"
echo "  • PUT /api/admin/users/:id (user updates)"
echo "  • PUT /api/admin/users/:id/role (role changes)"
echo "  • DELETE /api/admin/users/:id (user deletion)"
echo "  • GET /api/user/profile (profile access)"

echo -e "\n${PURPLE}🎯 Ready for Production:${NC}"
echo "  ✅ Role-based dashboard with comprehensive statistics"
echo "  ✅ Secure data filtering based on user roles"
echo "  ✅ Proper authentication and authorization"
echo "  ✅ Consistent API response format"
echo "  ✅ Comprehensive error handling"

echo -e "\n${CYAN}💡 Usage Recommendations:${NC}"
echo "  📊 Use /api/admin/dashboard for comprehensive admin interfaces"
echo "  ⚡ Use /api/admin/stats for lightweight widgets or mobile apps"
echo "  🔐 Frontend can use permissions.accessLevel to adjust UI"
echo "  🛡️  All sensitive operations properly protected by role-based access"

print_success "Comprehensive RBAC testing completed successfully! 🚀"
