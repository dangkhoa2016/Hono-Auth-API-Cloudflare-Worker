#!/bin/bash

# Cache Invalidation Test Script
# Runs comprehensive cache invalidation tests
# 
# Tests the fix for cache not being properly invalidated after KV config updates
# This ensures frontend always gets the latest configuration values

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
TEST_ENV="${TEST_ENV:-test}"
TEST_PORT="${TEST_PORT:-8788}"
BASE_URL="http://localhost:${TEST_PORT}"

# Script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_FILE="$PROJECT_ROOT/tests/cacheInvalidationTest.js"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🔄 Cache Invalidation Test Suite${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Environment:${NC} $TEST_ENV"
echo -e "${YELLOW}Base URL:${NC} $BASE_URL"
echo -e "${YELLOW}Test File:${NC} $TEST_FILE"
echo ""

# Check if test file exists
if [ ! -f "$TEST_FILE" ]; then
    echo -e "${RED}❌ Test file not found: $TEST_FILE${NC}"
    exit 1
fi

# Check if server is running
echo -e "${YELLOW}Checking if server is running...${NC}"
if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server is not running on $BASE_URL${NC}"
    echo -e "${YELLOW}Please start the server first:${NC}"
    echo "  wrangler dev (in $PROJECT_ROOT)"
    exit 1
fi

echo -e "${GREEN}✓ Server is running${NC}"
echo ""

# Run the test
echo -e "${BLUE}Running cache invalidation tests...${NC}"
echo ""

cd "$PROJECT_ROOT"
export TEST_ENV=$TEST_ENV

# Run Node test with proper environment
if node "$TEST_FILE"; then
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${GREEN}✅ All cache invalidation tests passed!${NC}"
    echo -e "${BLUE}========================================${NC}"
    exit 0
else
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${RED}❌ Some cache invalidation tests failed!${NC}"
    echo -e "${BLUE}========================================${NC}"
    exit 1
fi
