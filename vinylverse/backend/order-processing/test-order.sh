#!/bin/bash

# Test script for Order Processing Microservice
# Usage: ./test-order.sh [API_URL]
# Example: ./test-order.sh https://qqoneoafu7.execute-api.us-east-2.amazonaws.com/dev

API_URL="${1:-https://qqoneoafu7.execute-api.us-east-2.amazonaws.com/dev}/order-processing/order"

echo "=========================================="
echo "Testing Order Processing Microservice"
echo "API URL: $API_URL"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test 1: Valid order
echo -e "${YELLOW}Test 1: Valid Order${NC}"
echo "-------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "1", "name": "Pink Floyd - The Dark Side of the Moon", "price": 24.99, "qty": 1}
    ],
    "customer": {"name": "Test User", "email": "test@example.com"},
    "shipping": {
      "address1": "123 Test Street",
      "city": "Columbus",
      "state": "OH",
      "country": "USA",
      "postalCode": "43210"
    },
    "payment": {
      "cardName": "Test User",
      "cardNumber": "4111111111111111",
      "expiration": "12/25"
    },
    "total": 24.99
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "201" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Status: $HTTP_STATUS"
  echo "Response: $BODY" | jq . 2>/dev/null || echo "Response: $BODY"
else
  echo -e "${RED}✗ FAILED${NC} - Status: $HTTP_STATUS"
  echo "Response: $BODY"
fi
echo ""

# Test 2: Insufficient inventory
echo -e "${YELLOW}Test 2: Insufficient Inventory${NC}"
echo "-------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {"id": "1", "name": "Test Item", "price": 24.99, "qty": 99999}
    ],
    "customer": {"name": "Test User", "email": "test@example.com"},
    "shipping": {
      "address1": "123 Test Street",
      "city": "Columbus",
      "state": "OH",
      "country": "USA",
      "postalCode": "43210"
    },
    "payment": {
      "cardName": "Test User",
      "cardNumber": "4111111111111111",
      "expiration": "12/25"
    },
    "total": 2498900.01
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "409" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Status: $HTTP_STATUS (Expected)"
  echo "Response: $BODY" | jq . 2>/dev/null || echo "Response: $BODY"
else
  echo -e "${RED}✗ FAILED${NC} - Status: $HTTP_STATUS (Expected 409)"
  echo "Response: $BODY"
fi
echo ""

# Test 3: Missing items
echo -e "${YELLOW}Test 3: Missing Items (Invalid Request)${NC}"
echo "-------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "customer": {"name": "Test User", "email": "test@example.com"}
  }')

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)
BODY=$(echo "$RESPONSE" | sed '/HTTP_STATUS/d')

if [ "$HTTP_STATUS" = "400" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Status: $HTTP_STATUS (Expected)"
  echo "Response: $BODY" | jq . 2>/dev/null || echo "Response: $BODY"
else
  echo -e "${RED}✗ FAILED${NC} - Status: $HTTP_STATUS (Expected 400)"
  echo "Response: $BODY"
fi
echo ""

# Test 4: CORS preflight
echo -e "${YELLOW}Test 4: CORS Preflight (OPTIONS)${NC}"
echo "-------------------"
RESPONSE=$(curl -s -w "\nHTTP_STATUS:%{http_code}" -X OPTIONS "$API_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type")

HTTP_STATUS=$(echo "$RESPONSE" | grep "HTTP_STATUS" | cut -d: -f2)

if [ "$HTTP_STATUS" = "200" ]; then
  echo -e "${GREEN}✓ PASSED${NC} - Status: $HTTP_STATUS"
else
  echo -e "${RED}✗ FAILED${NC} - Status: $HTTP_STATUS (Expected 200)"
fi
echo ""

echo "=========================================="
echo "Testing Complete!"
echo "=========================================="

