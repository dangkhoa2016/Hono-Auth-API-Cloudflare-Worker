#!/bin/bash

# Test script for /api/admin/system-health endpoint
# Checks admin and super_admin access rights

BASE_URL="http://localhost:8788"

echo "🏥 Testing /api/admin/system-health endpoint"
echo "=============================================="

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo ""
echo -e "${BLUE}📋 Basic endpoint check (without auth)${NC}"
echo -e "Expected: ${RED}401 Unauthorized${NC}"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/system-health")
HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
echo "HTTP Status: $HTTP_STATUS"
echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
echo ""

# Try to login as admin user
echo -e "${BLUE}🔐 Login as admin user${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-admin@example.com","password":"password123"}')

ADMIN_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token' 2>/dev/null)

if [ "$ADMIN_TOKEN" != "null" ] && [ "$ADMIN_TOKEN" != "" ]; then
    echo -e "${GREEN}✅ Admin login successful${NC}"
    
    echo ""
    echo -e "${BLUE}🏥 GET /api/admin/system-health (Admin Role)${NC}"
    echo -e "Expected: ${GREEN}200 OK${NC} - Admin should access system health"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/system-health" \
      -H "Authorization: Bearer $ADMIN_TOKEN")
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    echo "HTTP Status: $HTTP_STATUS"
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ System health access granted${NC}"
        
        # Extract key metrics to verify Admin restrictions
        OVERALL_STATUS=$(echo "$BODY" | jq -r '.data.status' 2>/dev/null)
        ACCESS_LEVEL=$(echo "$BODY" | jq -r '.data.metadata.accessLevel' 2>/dev/null)
        CAN_VIEW_SUPER_ADMIN=$(echo "$BODY" | jq -r '.data.metadata.canViewSuperAdminData' 2>/dev/null)
        DB_HEALTH=$(echo "$BODY" | jq -r '.data.database.isConnected' 2>/dev/null)
        PERFORMANCE_GRADE=$(echo "$BODY" | jq -r '.data.system.performance.performanceGrade' 2>/dev/null)
        SECURITY_RISK=$(echo "$BODY" | jq -r '.data.system.security.riskLevel' 2>/dev/null)
        
        echo -e "${YELLOW}🔍 Admin System Health Analysis:${NC}"
        echo "   Overall Status: $OVERALL_STATUS"
        echo "   Access Level: $ACCESS_LEVEL (should be 'limited')"
        echo "   Can View Super Admin Data: $CAN_VIEW_SUPER_ADMIN (should be 'false')"
        echo "   Database Health: $DB_HEALTH"
        echo "   Performance Grade: $PERFORMANCE_GRADE"
        echo "   Security Risk Level: $SECURITY_RISK"
        
        # Show sample response structure
        echo ""
        echo -e "${YELLOW}📊 Response Structure Preview:${NC}"
        echo "$BODY" | jq '.data | {status, database: {isConnected, info: {version, tableCount}}, system: {performance: {performanceGrade, responseTime}, security: {riskLevel}}, healthChecks, metadata: {accessLevel, canViewSuperAdminData}}' 2>/dev/null
        
        if [ "$ACCESS_LEVEL" = "limited" ] && [ "$CAN_VIEW_SUPER_ADMIN" = "false" ]; then
            echo -e "${GREEN}✅ Admin has LIMITED system health privileges (correct filtering)${NC}"
        else
            echo -e "${RED}⚠️ Admin system health access may be too broad${NC}"
        fi
    else
        echo -e "${RED}❌ System health access failed${NC}"
        echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    fi
else
    echo -e "${RED}❌ Admin login failed${NC}"
    echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
fi

echo ""

# Try to login as Super Admin user
echo -e "${BLUE}🔐 Login as Super Admin user${NC}"
SUPER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-superadmin@example.com","password":"password123"}')

SUPER_ADMIN_TOKEN=$(echo "$SUPER_LOGIN_RESPONSE" | jq -r '.data.access_token' 2>/dev/null)

if [ "$SUPER_ADMIN_TOKEN" != "null" ] && [ "$SUPER_ADMIN_TOKEN" != "" ]; then
    echo -e "${GREEN}✅ Super Admin login successful${NC}"
    
    echo ""
    echo -e "${BLUE}🏥 GET /api/admin/system-health (Super Admin User Role)${NC}"
    echo -e "Expected: ${GREEN}200 OK${NC} - Super Admin should access ALL system health data"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/system-health" \
      -H "Authorization: Bearer $SUPER_ADMIN_TOKEN")
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    echo "HTTP Status: $HTTP_STATUS"
    
    if [ "$HTTP_STATUS" = "200" ]; then
        echo -e "${GREEN}✅ System health access granted${NC}"
        
        # Extract key metrics to verify Super Admin privileges
        OVERALL_STATUS=$(echo "$BODY" | jq -r '.data.status' 2>/dev/null)
        ACCESS_LEVEL=$(echo "$BODY" | jq -r '.data.metadata.accessLevel' 2>/dev/null)
        CAN_VIEW_SUPER_ADMIN=$(echo "$BODY" | jq -r '.data.metadata.canViewSuperAdminData' 2>/dev/null)
        DB_HEALTH=$(echo "$BODY" | jq -r '.data.database.isConnected' 2>/dev/null)
        PERFORMANCE_GRADE=$(echo "$BODY" | jq -r '.data.system.performance.performanceGrade' 2>/dev/null)
        SECURITY_RISK=$(echo "$BODY" | jq -r '.data.system.security.riskLevel' 2>/dev/null)
        TOTAL_USERS=$(echo "$BODY" | jq -r '.data.system.statistics.totalUsers' 2>/dev/null)
        
        echo -e "${YELLOW}🔍 Super Admin System Health Analysis:${NC}"
        echo "   Overall Status: $OVERALL_STATUS"
        echo "   Access Level: $ACCESS_LEVEL (should be 'full')"
        echo "   Can View Super Admin Data: $CAN_VIEW_SUPER_ADMIN (should be 'true')"
        echo "   Database Health: $DB_HEALTH"
        echo "   Performance Grade: $PERFORMANCE_GRADE"
        echo "   Security Risk Level: $SECURITY_RISK"
        echo "   Total Users: $TOTAL_USERS"
        
        if [ "$ACCESS_LEVEL" = "full" ] && [ "$CAN_VIEW_SUPER_ADMIN" = "true" ]; then
            echo -e "${GREEN}✅ Super Admin has FULL system health privileges${NC}"
        else
            echo -e "${RED}⚠️ Super Admin system health access may be restricted${NC}"
        fi
    else
        echo -e "${RED}❌ System health access failed${NC}"
        echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    fi
else
    echo -e "${RED}❌ Super Admin login failed${NC}"
    echo "$SUPER_LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$SUPER_LOGIN_RESPONSE"
fi

echo ""

# Try with regular user (should fail)
echo -e "${BLUE}🔐 Login as regular user${NC}"
USER_LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test-user@example.com","password":"password123"}')

USER_TOKEN=$(echo "$USER_LOGIN_RESPONSE" | jq -r '.data.access_token' 2>/dev/null)

if [ "$USER_TOKEN" != "null" ] && [ "$USER_TOKEN" != "" ]; then
    echo -e "${GREEN}✅ Regular user login successful${NC}"
    
    echo ""
    echo -e "${BLUE}🏥 GET /api/admin/system-health (Regular User Role)${NC}"
    echo -e "Expected: ${RED}403 Forbidden${NC} - Regular user should NOT access system health"
    RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X GET "$BASE_URL/api/admin/system-health" \
      -H "Authorization: Bearer $USER_TOKEN")
    HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
    BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS:/d')
    echo "HTTP Status: $HTTP_STATUS"
    
    if [ "$HTTP_STATUS" = "403" ]; then
        echo -e "${GREEN}✅ System health access correctly blocked for regular user${NC}"
    else
        echo -e "${RED}⚠️ System health access should be blocked for regular user${NC}"
        echo "$BODY" | jq . 2>/dev/null || echo "$BODY"
    fi
else
    echo -e "${RED}❌ Regular user login failed${NC}"
    echo "$USER_LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$USER_LOGIN_RESPONSE"
fi

echo ""
echo -e "${BLUE}=============================================${NC}"
echo -e "${BLUE}📊 SYSTEM HEALTH ENDPOINT TESTING SUMMARY${NC}"
echo -e "${BLUE}=============================================${NC}"
echo -e "${GREEN}✅ EXPECTED BEHAVIOR:${NC}"
echo "  - Regular User: 403 Forbidden (access blocked)"
echo "  - Admin: 200 OK with LIMITED data (super_admin data filtered)"
echo "  - Super Admin: 200 OK with FULL data (unrestricted access)"
echo ""
echo -e "${YELLOW}🔍 SYSTEM HEALTH FEATURES:${NC}"
echo "  📊 Database health monitoring"
echo "  ⚡ Performance metrics and grading"
echo "  🔒 Security risk assessment"
echo "  📈 User activity statistics"
echo "  🏥 Comprehensive health checks"
echo "  🎯 Role-based data filtering"
echo ""
echo -e "${YELLOW}💡 Usage:${NC}"
echo "  Use this endpoint for admin dashboards, monitoring systems,"
echo "  and automated health checks with appropriate role restrictions."
echo -e "${BLUE}=============================================${NC}"
