#!/bin/bash

#####################################################
# Quick Test Runner - All Tests
# Runs all unified and new test suites (minimal output)
#####################################################

# Set colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

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

echo "🚀 Starting comprehensive test execution..."

# Change to project root
cd "$(dirname "$0")/../.." || exit 1

LOG_DIR="logs/test-runs/quick-$(date '+%Y%m%d_%H%M%S')"
if mkdir -p "$LOG_DIR"; then
    log_info "Logs will be saved under: ${LOG_DIR}"
else
    log_warning "Could not create log directory. Logs will be printed to console only."
    LOG_DIR=""
fi

# Test counters
FAILED=0
TOTAL_TESTS=0
PASSED=0

# Failed test references
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

# Function to run test with per-test log
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

    reset_runtime_state

    eval "$test_command" > >(tee "$log_file") 2> >(tee -a "$log_file" >&2)
    local cmd_exit_code=$?

    if [ $cmd_exit_code -eq 0 ]; then
        log_success "PASSED: $test_name"
        PASSED=$((PASSED + 1))
    else
        log_error "FAILED: $test_name"
        log_warning "See log: ${log_file}"
        FAILED_TEST_LOGS+=("${test_name}|${log_file}")
        FAILED=$((FAILED + 1))
    fi
}

# Unified tests (9 tests total)
echo ""

# Initialize database once before all tests
if ! initialize_database; then
    exit 1
fi

echo "🧪 Unified Test Suites:"
run_test "Unified Security" "npm run test:unified:security"
run_test "Unified Translation" "npm run test:unified:translation"
run_test "Unified Performance" "npm run test:unified:performance"
run_test "Unified System" "npm run test:unified:system" 
run_test "Unified Auth" "npm run test:unified:auth"
run_test "Unified User" "npm run test:unified:user"
run_test "Unified Admin" "npm run test:unified:admin"
run_test "Unified Super Admin" "npm run test:unified:superadmin"
run_test "Unified RBAC" "npm run test:unified:rbac"
run_test "Unified KV Admin" "npm run test:unified:kv"

# New tests (22 tests total)
echo ""

# Initialize database once before all tests
if ! initialize_database; then
    exit 1
fi

echo "🆕 New Test Suites:"
run_test "System" "npm run test:system"
run_test "Auth" "npm run test:auth"
run_test "Admin User Role Tests" "npm run test:admin_user"
run_test "Super Admin User Role Tests" "npm run test:super_admin_user"
run_test "Regular User Role Tests" "npm run test:regular_user"
run_test "Login Message Format Tests" "node tests/loginMessageFormatTest.js"
run_test "Security" "npm run test:security"
run_test "Comprehensive i18n Tests" "npm run test:i18n"
run_test "Role-Based Tests" "npm run test:role"
run_test "Performance" "npm run test:performance"
run_test "Integration" "npm run test:integration"
run_test "Validation" "npm run test:validation"
run_test "Quick" "npm run test:quick"
run_test "Zod Validation Tests" "npm run test:zod_validation"
run_test "Error Handling Tests" "npm run test:error"
run_test "XSS Security Tests" "npm run test:xss:all"
run_test "KV Admin Tests" "npm run test:kv_admin"
run_test "KV Audit Config Tests" "npm run test:kv:audit"
run_test "Security Incident Tests" "npm run test:security:incident"
run_test "Multi-Language Validation Tests" "npm run test:multilang_validation"
run_test "Admin Message Translation (Direct)" "npm run test:admin:i18n"
run_test "Missing Translation Tests" "npm run test:i18n:missing"
run_test "Route Detection Tests" "node tests/routeDetectionTest.js"
run_test "Simple Tests" "npm run test:simple"
run_test "Optimized Service Tests" "npm run test:optimized"
run_test "Token Security Tests" "npm run test:token_security"
run_test "Token Blacklist Route Tests" "node tests/tokenBlacklistRouteTest.js"
run_test "Suspended User Token Tests" "node tests/suspendedUserTokenTest.js"

# Audit System Test Suites (9 additional tests)
echo ""

# Initialize database once before all tests
if ! initialize_database; then
    exit 1
fi

echo "🔍 Audit System Test Suites:"
run_test "Audit System" "node tests/auditSystemTest.js"
run_test "Audit Log Service" "npm run test:audit:integration"
run_test "Audit Performance" "npm run test:audit:perf"
run_test "Simple Audit" "npm run test:audit:simple:quick"
run_test "Advanced Audit" "npm run test:audit:advanced-js:quick"
run_test "Archival Service" "npm run test:audit:archival"
run_test "Realtime Monitoring" "node tests/realtimeMonitoringTest.js"
run_test "Alert System Config" "node tests/alertSystemConfigIntegrationTest.js"
run_test "i18n Validator Extension" "node tests/i18nValidatorExtensionTest.js"

# Summary
echo ""
echo "📊 Summary:"
echo "Total: $TOTAL_TESTS | Passed: $PASSED | Failed: $FAILED"

if [ ${#FAILED_TEST_LOGS[@]} -gt 0 ]; then
    echo ""
    echo "Failed tests and log files:"
    for entry in "${FAILED_TEST_LOGS[@]}"; do
        IFS='|' read -r failed_name failed_log <<< "$entry"
        echo "- ${failed_name} => ${failed_log}"
    done
fi

if [ -n "$LOG_DIR" ]; then
    echo "Logs directory: ${LOG_DIR}"
fi

if [ $FAILED -eq 0 ]; then
    echo "🎉 All $TOTAL_TESTS tests passed!"
    exit 0
else
    echo "❌ $FAILED test(s) failed out of $TOTAL_TESTS total tests"
    exit 1
fi
