#!/bin/bash

# ====================================================================
# PENDING EMAIL CLEAR FLOW TEST
# ====================================================================
# Flow:
# 1) Login with regular user
# 2) Request email change (PUT /api/user/profile)
# 3) Clear pending email (DELETE /api/user/pending-email) -> expect 200
# 4) Clear again (DELETE /api/user/pending-email) -> expect 400
# ====================================================================

BASE_URL="http://localhost:8788"
USER_EMAIL="test-user@example.com"
USER_PASSWORD="password123"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}=====================================================================${NC}"
echo -e "${BLUE}🧪 PENDING EMAIL CLEAR FLOW TEST${NC}"
echo -e "${BLUE}=====================================================================${NC}"

echo -e "${YELLOW}Step 0: Check server health${NC}"
if ! curl -s "$BASE_URL/health" >/dev/null 2>&1; then
  echo -e "${RED}❌ Server is not running on $BASE_URL${NC}"
  echo -e "${YELLOW}💡 Start test server: npm run dev:test${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Server is running${NC}"
echo ""

echo -e "${YELLOW}Step 1: Login${NC}"
LOGIN_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$USER_EMAIL\",\"password\":\"$USER_PASSWORD\"}")

ACCESS_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.access_token' 2>/dev/null)

if [ -z "$ACCESS_TOKEN" ] || [ "$ACCESS_TOKEN" = "null" ]; then
  echo -e "${RED}❌ Login failed. Cannot continue.${NC}"
  echo "$LOGIN_RESPONSE" | jq . 2>/dev/null || echo "$LOGIN_RESPONSE"
  exit 1
fi

echo -e "${GREEN}✅ Login successful${NC}"
echo ""

NEW_EMAIL="pending-clear-$(date +%s)@example.com"

echo -e "${YELLOW}Step 2: Request email change -> $NEW_EMAIL${NC}"
UPDATE_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X PUT "$BASE_URL/api/user/profile" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$NEW_EMAIL\"}")

UPDATE_STATUS=$(echo "$UPDATE_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
UPDATE_BODY=$(echo "$UPDATE_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $UPDATE_STATUS"
echo "$UPDATE_BODY" | jq . 2>/dev/null || echo "$UPDATE_BODY"

if [ "$UPDATE_STATUS" != "200" ]; then
  echo -e "${RED}❌ Email change request failed${NC}"
  exit 1
fi

echo -e "${GREEN}✅ Email change requested${NC}"
echo ""

echo -e "${YELLOW}Step 3: Clear pending email (expect 200)${NC}"
CLEAR1_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/api/user/pending-email" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

CLEAR1_STATUS=$(echo "$CLEAR1_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
CLEAR1_BODY=$(echo "$CLEAR1_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $CLEAR1_STATUS"
echo "$CLEAR1_BODY" | jq . 2>/dev/null || echo "$CLEAR1_BODY"

if [ "$CLEAR1_STATUS" = "200" ]; then
  echo -e "${GREEN}✅ First clear request returned 200 as expected${NC}"
else
  echo -e "${RED}❌ First clear request expected 200 but got $CLEAR1_STATUS${NC}"
  exit 1
fi
echo ""

echo -e "${YELLOW}Step 4: Clear pending email again (expect 400)${NC}"
CLEAR2_RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X DELETE "$BASE_URL/api/user/pending-email" \
  -H "Authorization: Bearer $ACCESS_TOKEN")

CLEAR2_STATUS=$(echo "$CLEAR2_RESPONSE" | grep "HTTP_STATUS:" | cut -d: -f2)
CLEAR2_BODY=$(echo "$CLEAR2_RESPONSE" | sed '/HTTP_STATUS:/d')

echo "HTTP Status: $CLEAR2_STATUS"
echo "$CLEAR2_BODY" | jq . 2>/dev/null || echo "$CLEAR2_BODY"

if [ "$CLEAR2_STATUS" = "400" ]; then
  echo -e "${GREEN}✅ Second clear request returned 400 as expected${NC}"
else
  echo -e "${RED}❌ Second clear request expected 400 but got $CLEAR2_STATUS${NC}"
  exit 1
fi

echo ""
echo -e "${BLUE}=====================================================================${NC}"
echo -e "${GREEN}🎉 Pending email clear flow test passed${NC}"
echo -e "${BLUE}=====================================================================${NC}"
