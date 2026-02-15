#!/bin/bash

# Quick Cache Invalidation Test
# Fast verification that the cache invalidation fix works

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

TEST_ENV="${TEST_ENV:-test}"
TEST_PORT="${TEST_PORT:-8788}"
BASE_URL="http://localhost:${TEST_PORT}"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
TEST_FILE="$PROJECT_ROOT/tests/quickCacheTest.js"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}⚡ Quick Cache Invalidation Test${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check server
if ! curl -s "$BASE_URL/health" > /dev/null 2>&1; then
    echo -e "${RED}❌ Server not running on $BASE_URL${NC}"
    echo "Start server with: wrangler dev"
    exit 1
fi

echo -e "${GREEN}✓ Server running${NC}"
echo ""

# Run test
cd "$PROJECT_ROOT"
export TEST_ENV=$TEST_ENV

if node "$TEST_FILE"; then
    echo ""
    echo -e "${GREEN}✅ Cache invalidation fix verified!${NC}"
    exit 0
else
    echo ""
    echo -e "${RED}❌ Test failed - cache fix may not be working${NC}"
    exit 1
fi
