#!/bin/bash

# Admin Message Translation Test Runner
# Comprehensive test script for admin routes i18n message validation

set -e

echo "🌍 Admin Routes i18n Message Translation Test Runner"
echo "====================================================="

# Configuration
TEST_PORT=8788
TEST_URL="http://localhost:$TEST_PORT"
MAX_WAIT_TIME=30
WAIT_INTERVAL=2

echo "📋 Test Configuration:"
echo "   • Test URL: $TEST_URL"
echo "   • Max wait time: ${MAX_WAIT_TIME}s"
echo "   • Check interval: ${WAIT_INTERVAL}s"
echo ""

# Function to check if server is running
check_server() {
    curl -s -f "$TEST_URL/health" > /dev/null 2>&1
    return $?
}

# Function to wait for server
wait_for_server() {
    echo "⏳ Waiting for test server to be ready..."
    local wait_time=0
    
    while [ $wait_time -lt $MAX_WAIT_TIME ]; do
        if check_server; then
            echo "✅ Test server is ready!"
            return 0
        fi
        
        echo "   ⏳ Server not ready, waiting... (${wait_time}s/${MAX_WAIT_TIME}s)"
        sleep $WAIT_INTERVAL
        wait_time=$((wait_time + WAIT_INTERVAL))
    done
    
    echo "❌ Test server failed to start within ${MAX_WAIT_TIME} seconds"
    echo "💡 Make sure to run: npm run dev:test"
    return 1
}

# Function to cleanup
cleanup() {
    echo ""
    echo "🧹 Cleaning up..."
    # Add any cleanup logic here if needed
}

# Set up cleanup trap
trap cleanup EXIT

# Main execution
main() {
    echo "🚀 Starting Admin Message Translation Tests..."
    echo ""
    
    # Check if server is running
    if ! wait_for_server; then
        echo ""
        echo "💡 To start the test server, run in another terminal:"
        echo "   npm run dev:test"
        echo ""
        echo "   or"
        echo ""
        echo "   npm run dev:test:debug"
        echo ""
        exit 1
    fi
    
    echo ""
    echo "🧪 Running Admin Message Translation Tests..."
    echo ""
    
    # Initialize test database
    echo "📦 Setting up test database..."
    npm run test:initdb
    
    echo ""
    echo "🌍 Running i18n Message Translation Tests..."
    echo ""
    
    # Run the admin message translation tests
    node tests/adminMessageTranslationTest.js
    
    local test_exit_code=$?
    
    echo ""
    if [ $test_exit_code -eq 0 ]; then
        echo "✅ All Admin Message Translation Tests passed!"
        echo ""
        echo "📊 Test Summary:"
        echo "   ✅ Role display name translations"
        echo "   ✅ Success message formatting"
        echo "   ✅ Error message localization"
        echo "   ✅ Pluralization handling"
        echo "   ✅ Date/time formatting"
        echo "   ✅ Multi-language support"
        echo "   ✅ Complex message interpolation"
        echo ""
    else
        echo "❌ Some Admin Message Translation Tests failed!"
        echo ""
        echo "🔍 Check the output above for details"
        echo "💡 Common issues:"
        echo "   • Role names not properly translated"
        echo "   • Raw role values (user, admin, super_admin) in messages"
        echo "   • Missing pluralization"
        echo "   • Incorrect message interpolation"
        echo ""
    fi
    
    exit $test_exit_code
}

# Help function
show_help() {
    echo "Admin Message Translation Test Runner"
    echo ""
    echo "Usage:"
    echo "  $0                    Run all admin message translation tests"
    echo "  $0 --help           Show this help message"
    echo ""
    echo "Prerequisites:"
    echo "  1. Test server must be running on port $TEST_PORT"
    echo "     npm run dev:test"
    echo ""
    echo "  2. Test database should be initialized"
    echo "     npm run test:initdb"
    echo ""
    echo "Test Categories:"
    echo "  • Role Display Names     - Verify role translations (User, Administrator, Super Administrator)"
    echo "  • Success Messages       - Check success message formatting and interpolation"
    echo "  • Error Messages         - Validate error message localization"
    echo "  • Pluralization          - Test singular/plural forms"
    echo "  • Date/Time Formatting   - Verify timestamp formatting"
    echo "  • Multi-Language         - Test multiple language support"
    echo "  • Access Control         - Test role-based message filtering"
    echo ""
    echo "Examples of what this test validates:"
    echo "  ❌ Bad: 'New user created with admin role'"
    echo "  ✅ Good: 'New user created with Administrator role'"
    echo ""
    echo "  ❌ Bad: 'Retrieved 5 user'"
    echo "  ✅ Good: 'Retrieved 5 users'"
    echo ""
    echo "  ❌ Bad: 'Created by super_admin'"
    echo "  ✅ Good: 'Created by Super Administrator'"
}

# Parse command line arguments
case "${1:-}" in
    --help|-h)
        show_help
        exit 0
        ;;
    "")
        main
        ;;
    *)
        echo "❌ Unknown option: $1"
        echo ""
        show_help
        exit 1
        ;;
esac
