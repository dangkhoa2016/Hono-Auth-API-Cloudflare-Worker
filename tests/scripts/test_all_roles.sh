#!/bin/bash

# ====================================================================
# ALL ROLES TESTING SCRIPT
# ====================================================================
# Run all role-based tests in sequence for comparison
# ====================================================================

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BASE_URL="http://localhost:8788"

# Debug information
echo "Debug: Script directory: $SCRIPT_DIR"
echo "Debug: Available files:"
ls -la "$SCRIPT_DIR/"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # No Color

echo -e "${CYAN}=====================================================================${NC}"
echo -e "${CYAN}🔧 COMPREHENSIVE ROLE-BASED TESTING${NC}"
echo -e "${CYAN}=====================================================================${NC}"
echo -e "Base URL: ${BASE_URL}"
echo -e "Test Date: $(date)"
echo ""
echo -e "${YELLOW}This script will test all three roles in sequence:${NC}"
echo -e "  1. 🧑‍💻 Regular User (Limited access)"
echo -e "  2. 👨‍💼 Admin (User management + admin features)"
echo -e "  3. 👑 Super Admin (Full system access)"
echo ""
echo -e "${YELLOW}💡 Compare the results to verify RBAC is working correctly.${NC}"
echo ""

# Check if server is running
echo -e "${YELLOW}🔍 Checking if server is running...${NC}"
if ! curl -s "$BASE_URL/health" >/dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on $BASE_URL${NC}"
    echo -e "${YELLOW}💡 Please start the server first:${NC}"
    echo -e "   npm run dev"
    exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

# Function to run a test script with header
run_role_test() {
    local role_name="$1"
    local script_name="$2"
    local icon="$3"
    
    echo -e "${CYAN}=====================================================================${NC}"
    echo -e "${CYAN}${icon} TESTING: ${role_name}${NC}"
    echo -e "${CYAN}=====================================================================${NC}"
    echo -e "Script: ${script_name}"
    echo -e "Time: $(date)"
    echo ""
    
    if [ -f "$SCRIPT_DIR/$script_name" ]; then
        bash "$SCRIPT_DIR/$script_name"
        local exit_code=$?
        
        echo ""
        if [ $exit_code -eq 0 ]; then
            echo -e "${GREEN}✅ ${role_name} testing completed successfully${NC}"
        else
            echo -e "${RED}❌ ${role_name} testing completed with errors (exit code: $exit_code)${NC}"
        fi
    else
        echo -e "${RED}❌ Script not found: $script_name${NC}"
        echo -e "${YELLOW}Debug: Looking for file at: $SCRIPT_DIR/$script_name${NC}"
        echo -e "${YELLOW}Available files in directory:${NC}"
        ls -la "$SCRIPT_DIR/"
        return 1
    fi
    
    echo ""
    echo -e "${YELLOW}Press Enter to continue to next role test, or Ctrl+C to stop...${NC}"
    read -r
    echo ""
}

# Test sequence
echo -e "${BOLD}Starting comprehensive role-based testing...${NC}"
echo ""

# 1. Regular User Test
run_role_test "REGULAR USER" "regular_user.sh" "🧑‍💻"

# 2. Admin Test  
run_role_test "ADMIN" "admin_user.sh" "👨‍💼"

# 3. Super Admin Test
run_role_test "Super Admin" "super_admin_user.sh" "👑"

# Final Summary
echo -e "${CYAN}=====================================================================${NC}"
echo -e "${CYAN}📊 COMPREHENSIVE TESTING COMPLETED${NC}"
echo -e "${CYAN}=====================================================================${NC}"
echo -e "Completion Time: $(date)"
echo ""
echo -e "${GREEN}✅ All role-based tests have been executed.${NC}"
echo ""
echo -e "${YELLOW}📋 SUMMARY OF WHAT WAS TESTED:${NC}"
echo ""
echo -e "${BLUE}🧑‍💻 Regular User:${NC}"
echo -e "   ✓ Public endpoints access"
echo -e "   ✓ Own profile management"
echo -e "   ✓ Admin endpoints restriction (should be forbidden)"
echo -e "   ✓ User creation/management restriction"
echo ""
echo -e "${BLUE}👨‍💼 Admin:${NC}"
echo -e "   ✓ User management (user + admin roles only)"
echo -e "   ✓ Admin statistics and dashboard"
echo -e "   ✓ User creation with user/admin roles"
echo -e "   ✓ Super Admin features restriction (should be forbidden)"
echo ""
echo -e "${BLUE}👑 Super Admin:${NC}"
echo -e "   ✓ Unrestricted user management (all roles)"
echo -e "   ✓ Super Admin exclusive features"
echo -e "   ✓ System settings and administration"
echo -e "   ✓ Advanced operations and bulk actions"
echo ""
echo -e "${YELLOW}🔍 VERIFICATION CHECKLIST:${NC}"
echo -e "   □ Regular users cannot access admin endpoints"
echo -e "   □ Admins cannot see/manage super_admin users"
echo -e "   □ Admins cannot access Super Admin exclusive features"
echo -e "   □ Super Admins have unrestricted access"
echo -e "   □ Role filtering works correctly in user lists"
echo -e "   □ Permission errors return proper HTTP status codes"
echo ""
echo -e "${GREEN}💡 If any unexpected results were found, review the authorization middleware and role-based permissions in the code.${NC}"
echo -e "${CYAN}=====================================================================${NC}"
