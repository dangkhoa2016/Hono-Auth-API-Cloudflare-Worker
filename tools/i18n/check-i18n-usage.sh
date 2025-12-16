#!/bin/bash

echo "🔍 Checking all routes and middleware for tError/tSuccess usage..."
echo "=================================================="

echo ""
echo "📁 Routes analysis:"
echo "-------------------"

# Find all routes that should use tError/tSuccess
echo "Routes NOT using tError/tSuccess properly:"
grep -r "createErrorResponse\|createSuccessResponse" src/routes/ --include="*.js" | grep -v "tError\|tSuccess" | head -10

echo ""
echo "Routes using old t() format in error handling:"
grep -r "handleStandardError.*t(" src/routes/ --include="*.js" | head -10

echo ""
echo "📁 Middleware analysis:"
echo "----------------------"

echo "Middleware NOT using tError properly:"
grep -r "createErrorResponse.*t(" src/middleware/ --include="*.js" | head -10

echo ""
echo "✅ Routes already using tError/tSuccess correctly:"
grep -r "tError\|tSuccess" src/routes/ --include="*.js" | wc -l

echo ""
echo "✅ Middleware already using tError/tSuccess correctly:"
grep -r "tError\|tSuccess" src/middleware/ --include="*.js" | wc -l

echo ""
echo "🔍 Summary of function usage:"
echo "----------------------------"
echo "tError usage count: $(grep -r "tError(" src/ --include="*.js" | wc -l)"
echo "tSuccess usage count: $(grep -r "tSuccess(" src/ --include="*.js" | wc -l)"
echo "Old t() with errors pattern: $(grep -r "t(.*'errors\." src/ --include="*.js" | wc -l)"
echo "Old t() with success pattern: $(grep -r "t(.*'success\." src/ --include="*.js" | wc -l)"

echo ""
echo "🎯 Migration Progress Complete!"
