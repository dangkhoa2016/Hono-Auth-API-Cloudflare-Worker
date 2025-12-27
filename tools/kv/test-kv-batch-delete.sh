#!/bin/bash

# Configuration
BASE_URL="http://localhost:8788"
SUPERADMIN_EMAIL="test-superadmin@example.com"
SUPERADMIN_PASSWORD="password123"

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m'

# Login
echo "Logging in..."
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$SUPERADMIN_EMAIL\",\"password\":\"$SUPERADMIN_PASSWORD\"}")

TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token')

if [ "$TOKEN" == "null" ] || [ -z "$TOKEN" ]; then
  echo -e "${RED}Login failed${NC}"
  echo "$LOGIN_RESPONSE"
  exit 1
fi
echo -e "${GREEN}Login successful${NC}"

# Seed keys
PREFIX="batchtest:"
echo "Seeding keys..."
SEED_RESPONSE=$(curl -s -X POST "$BASE_URL/api/kv-admin/rate-limits/seed" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"prefix\":\"$PREFIX\", \"count\": 5}")

echo "Seed response: $SEED_RESPONSE"

# Extract keys from seed response
KEYS=$(echo "$SEED_RESPONSE" | jq '.data.createdKeys')

# Batch Delete Dry Run
echo "Batch Delete Dry Run..."
DRY_RUN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/kv-admin/rate-limits/batch-delete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"keys\": $KEYS, \"dryRun\": true}")

echo "Dry Run Response: $DRY_RUN_RESPONSE"

# Batch Delete Real
echo "Batch Delete Real..."
DELETE_RESPONSE=$(curl -s -X POST "$BASE_URL/api/kv-admin/rate-limits/batch-delete" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"keys\": $KEYS}")

echo "Delete Response: $DELETE_RESPONSE"
