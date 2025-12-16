#!/bin/bash

# Test Favicon Routes
echo "🎯 Testing Favicon Routes..."

# Base URL (default to test environment)
BASE_URL=${1:-"http://localhost:8788"}

echo "📍 Testing against: $BASE_URL"
echo ""

# Test favicon.ico
echo "🔍 Testing /favicon.ico"
response=$(curl -s -w "%{http_code}" -o /tmp/favicon_test.ico "$BASE_URL/favicon.ico")
if [ "$response" = "200" ]; then
    echo "✅ favicon.ico: SUCCESS (HTTP $response)"
    echo "   📊 File size: $(wc -c < /tmp/favicon_test.ico) bytes"
    echo "   📋 Content-Type: $(curl -s -I "$BASE_URL/favicon.ico" | grep -i content-type)"
else
    echo "❌ favicon.ico: FAILED (HTTP $response)"
fi

echo ""

# Test favicon.png
echo "🔍 Testing /favicon.png"
response=$(curl -s -w "%{http_code}" -o /tmp/favicon_test.png "$BASE_URL/favicon.png")
if [ "$response" = "200" ]; then
    echo "✅ favicon.png: SUCCESS (HTTP $response)"
    echo "   📊 File size: $(wc -c < /tmp/favicon_test.png) bytes"
    echo "   📋 Content-Type: $(curl -s -I "$BASE_URL/favicon.png" | grep -i content-type)"
else
    echo "❌ favicon.png: FAILED (HTTP $response)"
fi

echo ""

# Test favicon redirect
echo "🔍 Testing /favicon (should redirect)"
status_code=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL/favicon")
if [ "$status_code" = "301" ]; then
    echo "✅ favicon redirect: SUCCESS (HTTP $status_code)"
    echo "   📍 Location: $(curl -s -I "$BASE_URL/favicon" | grep -i location)"
else
    echo "❌ favicon redirect: FAILED (HTTP $status_code)"
fi

echo ""

# Test apple-touch-icon.png
echo "🔍 Testing /apple-touch-icon.png"
response=$(curl -s -w "%{http_code}" -o /tmp/apple_touch_icon_test.png "$BASE_URL/apple-touch-icon.png")
if [ "$response" = "200" ]; then
    echo "✅ apple-touch-icon.png: SUCCESS (HTTP $response)"
    echo "   📊 File size: $(wc -c < /tmp/apple_touch_icon_test.png) bytes"
else
    echo "❌ apple-touch-icon.png: FAILED (HTTP $response)"
fi

echo ""


# Test icon-192.png
echo "🔍 Testing /icon-192.png"
response=$(curl -s -w "%{http_code}" -o /tmp/icon_192_test.png "$BASE_URL/icon-192.png")
if [ "$response" = "200" ]; then
    echo "✅ icon-192.png: SUCCESS (HTTP $response)"
    echo "   📊 File size: $(wc -c < /tmp/icon_192_test.png) bytes"
else
    echo "❌ icon-192.png: FAILED (HTTP $response)"
fi

echo ""

# Test headers
echo "🔍 Testing Response Headers"
echo "📋 favicon.ico headers:"
curl -s -I "$BASE_URL/favicon.ico" | grep -E "(Content-Type|Cache-Control|ETag|Content-Length)"

echo ""
echo "📋 favicon.png headers:"
curl -s -I "$BASE_URL/favicon.png" | grep -E "(Content-Type|Cache-Control|ETag|Content-Length)"

echo ""

# Cleanup
rm -f /tmp/favicon_test.ico /tmp/favicon_test.png /tmp/apple_touch_icon_test.png /tmp/icon_192_test.png

echo "🎉 Favicon test completed!"
echo ""
echo "💡 Usage examples:"
echo "   curl $BASE_URL/favicon.ico -o favicon.ico"
echo "   curl $BASE_URL/favicon -o favicon.ico"
echo "   curl $BASE_URL/favicon.png -o favicon.png"
echo "   curl $BASE_URL/apple-touch-icon.png -o apple-touch-icon.png"
echo "   curl $BASE_URL/icon-192.png -o icon-192.png"
echo ""
