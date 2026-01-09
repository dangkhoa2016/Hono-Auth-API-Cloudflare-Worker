#!/bin/bash

#####################################################
# Comprehensive Test Runner Script
# Runs all unified and new test suites with database initialization
#####################################################

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to log with timestamp
log() {
    echo -e "${CYAN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

# Function to log success
log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

# Function to log error
log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Function to log warning
log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

# Function to log info
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

# Track log directory and failed test log references
LOG_DIR=""
FAILED_TEST_LOGS=()

# Reset rate limits and cached state between tests to avoid cascading failures
reset_runtime_state() {
    log_info "Resetting rate limits and caches before next test..."

    if node tools/reset-rate-limits.js > /dev/null 2>&1; then
        log_info "Rate limits reset"
    else
        log_warning "Rate limit reset failed"
    fi

    if node tools/clear-cache.js > /dev/null 2>&1; then
        log_info "Service cache cleared"
    else
        log_warning "Service cache clear skipped or failed"
    fi
}

# Function to run a test with error handling
run_test() {
    local test_name="$1"
    local test_command="$2"
    local safe_name
    local log_file
    safe_name=$(echo "$test_name" | tr '[:space:]' '_' | tr -cd '[:alnum:]_-')
    if [ -n "$LOG_DIR" ]; then
        log_file="$LOG_DIR/${safe_name:-test}.log"
    else
        log_file="./${safe_name:-test}.log"
    fi
    
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    log "Running: ${YELLOW}$test_name${NC}"
    log_info "Log file: ${log_file}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"

    # Ensure rate limit counters are cleared between tests
    reset_runtime_state
    
    eval "$test_command" > >(tee "$log_file") 2> >(tee -a "$log_file" >&2)
    local cmd_exit_code=$?

    if [ $cmd_exit_code -eq 0 ]; then
        log_success "Test completed: $test_name"
        PASSED_TESTS=$((PASSED_TESTS + 1))
        return 0
    else
        log_error "Test failed: $test_name"
        log_warning "See log: ${log_file}"
        FAILED_TEST_LOGS+=("${test_name}|${log_file}")
        FAILED_TESTS=$((FAILED_TESTS + 1))
        return 1
    fi
}

# Function to initialize test database
initialize_database() {
    echo ""
    echo -e "${CYAN}🗄️  INITIALIZING TEST DATABASE${NC}"
    echo -e "${CYAN}================================${NC}"
    log "Initializing test database..."
    
    if npm run test:initdb; then
        log_success "Database initialized successfully"
        
        # Reset rate limits
        log "Resetting rate limits..."
        if node tools/reset-rate-limits.js; then
            log_success "Rate limits reset successfully"
        else
            log_warning "Failed to reset rate limits"
        fi

        # Clear service cache
        log "Clearing service cache..."
        if node tools/clear-cache.js; then
            log_success "Service cache cleared successfully"
        else
            log_warning "Failed to clear service cache (Worker might not be running)"
        fi

        return 0
    else
        log_error "Failed to initialize database"
        return 1
    fi
}

# Function to print summary
print_summary() {
    echo ""
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${CYAN}                     TEST EXECUTION SUMMARY                    ${NC}"
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
    echo -e "${BLUE}📊 Total Tests Run:${NC} $TOTAL_TESTS"
    echo -e "${GREEN}✅ Passed:${NC} $PASSED_TESTS"
    echo -e "${RED}❌ Failed:${NC} $FAILED_TESTS"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "${GREEN}🎉 All tests passed!${NC}"
        SUCCESS_RATE="100%"
    else
        # Calculate success rate using shell arithmetic (avoiding bc dependency)
        SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
        echo -e "${YELLOW}📈 Success Rate:${NC} ${SUCCESS_RATE}%"
    fi

    if [ ${#FAILED_TEST_LOGS[@]} -gt 0 ]; then
        echo ""
        echo -e "${RED}Failed tests and log files:${NC}"
        for entry in "${FAILED_TEST_LOGS[@]}"; do
            IFS='|' read -r failed_name failed_log <<< "$entry"
            echo "- ${failed_name} => ${failed_log}"
        done
    fi
    if [ -n "$LOG_DIR" ]; then
        echo ""
        echo -e "${BLUE}Logs directory:${NC} ${LOG_DIR}"
    fi
    
    echo -e "${PURPLE}═══════════════════════════════════════════════════════════════${NC}"
}

# Main execution
main() {
    log "Starting comprehensive test execution..."
    log_info "This will run all unified and new test suites"
    
    # Change to project root directory
    cd "$(dirname "$0")/../.." || {
        log_error "Failed to change to project directory"
        exit 1
    }
    
    log_info "Working directory: $(pwd)"

    LOG_DIR="logs/test-runs/$(date '+%Y%m%d_%H%M%S')"
    if mkdir -p "$LOG_DIR"; then
        log_info "Logs will be saved under: ${LOG_DIR}"
    else
        log_warning "Could not create log directory. Logs will be printed to console only."
        LOG_DIR=""
    fi
    
    # Initialize database once before all tests
    if ! initialize_database; then
        exit 1
    fi
    
    # Unified Test Suites (9 tests total)
    echo ""
    echo -e "${CYAN}🧪 RUNNING UNIFIED TEST SUITES${NC}"
    echo -e "${CYAN}================================${NC}"
    
    run_test "Unified Security Tests" "npm run test:unified:security"
    run_test "Unified Translation Tests" "npm run test:unified:translation"
    run_test "Unified Performance Tests" "npm run test:unified:performance"
    run_test "Unified System Tests" "npm run test:unified:system"
    run_test "Unified Auth Tests" "npm run test:unified:auth"
    run_test "Unified User Tests" "npm run test:unified:user"
    run_test "Unified Admin Tests" "npm run test:unified:admin"
    run_test "Unified Super Admin Tests" "npm run test:unified:superadmin"
    run_test "Unified RBAC Tests" "npm run test:unified:rbac"
    run_test "Unified KV Admin Tests" "npm run test:unified:kv"
    
    # New Test Suites (21 tests total)
    echo ""
    echo -e "${CYAN}🆕 RUNNING NEW TEST SUITES${NC}"
    echo -e "${CYAN}============================${NC}"
    
    # Initialize database once before all tests
    if ! initialize_database; then
        exit 1
    fi
    
    run_test "System Tests" "npm run test:system"
    run_test "Auth Tests" "npm run test:auth"
    run_test "Admin User Role Tests" "npm run test:admin_user"
    run_test "Super Admin User Role Tests" "npm run test:super_admin_user"
    run_test "Regular User Role Tests" "npm run test:regular_user"
    run_test "Security Tests" "npm run test:security"
    run_test "Comprehensive i18n Tests" "npm run test:i18n"
    run_test "Role-Based Tests" "npm run test:role"
    run_test "Performance Tests" "npm run test:performance"
    run_test "Integration Tests" "npm run test:integration"
    run_test "Validation Tests" "npm run test:validation"
    run_test "Quick Tests" "npm run test:quick"
    run_test "Zod Validation Tests" "npm run test:zod_validation"
    run_test "Error Handling Tests" "npm run test:error"
    run_test "XSS Security Tests" "npm run test:xss:all"
    run_test "KV Admin Tests" "npm run test:kv_admin"
    run_test "KV Audit Config Tests" "npm run test:kv:audit"
    run_test "Security Incident Tests" "npm run test:security:incident"
    run_test "Multi-Language Validation Error Tests" "npm run test:multilang_validation"
    run_test "Admin Message Translation Tests (Direct)" "npm run test:admin:i18n"
    run_test "Login Message Format Tests" "node tests/loginMessageFormatTest.js"
    run_test "Missing Translation Tests" "npm run test:i18n:missing"
    run_test "Route Detection Tests" "node tests/routeDetectionTest.js"
    run_test "Simple Tests" "npm run test:simple"
    run_test "Optimized Service Tests" "npm run test:optimized"
    run_test "Token Security Tests" "npm run test:token_security"
    run_test "Token Blacklist Route Tests" "node tests/tokenBlacklistRouteTest.js"
    run_test "Suspended User Token Tests" "node tests/suspendedUserTokenTest.js"
    run_test "Email Change Verification Tests" "node tests/emailChangeVerificationTest.js"
    
    # Audit System Test Suites (10 additional tests)
    echo ""
    echo -e "${CYAN}🔍 RUNNING AUDIT SYSTEM TEST SUITES${NC}"
    echo -e "${CYAN}====================================${NC}"
    
    # Initialize database once before all tests
    if ! initialize_database; then
        exit 1
    fi
    
    run_test "Audit System Tests" "node tests/auditSystemTest.js"
    run_test "Audit Log Service Tests" "npm run test:audit:integration"
    run_test "Audit Performance Tests" "npm run test:audit:perf"
    run_test "Simple Audit Tests" "npm run test:audit:simple"
    run_test "Advanced Audit Tests" "npm run test:audit:advanced-js:all"
    run_test "Archival Service Tests" "npm run test:audit:archival"
    run_test "Realtime Monitoring Tests" "node tests/realtimeMonitoringTest.js"
    run_test "Alert System Config Tests" "node tests/alertSystemConfigIntegrationTest.js"
    run_test "i18n Validator Extension Tests" "node tests/i18nValidatorExtensionTest.js"
    
    # Print final summary
    print_summary
    
    # Exit with appropriate code
    if [ $FAILED_TESTS -eq 0 ]; then
        log_success "All tests completed successfully!"
        exit 0
    else
        log_error "Some tests failed. Please check the output above."
        exit 1
    fi
}

# Check if we can do calculations (bc is optional)
if ! command -v bc &> /dev/null; then
    log_info "bc command not available. Using shell arithmetic for calculations."
fi

# Trap to handle interruption
trap 'echo -e "\n${RED}Test execution interrupted!${NC}"; print_summary; exit 130' INT TERM

# Run main function
main "$@"
