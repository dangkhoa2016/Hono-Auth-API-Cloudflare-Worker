#!/bin/bash

# Test Environment Setup Script
echo "🧪 Setting up Hono Auth Worker for TEST environment..."

# Check if .dev.vars.test exists
if [ ! -f ".dev.vars.test" ]; then
    echo "📝 Creating .dev.vars.test file from template..."
    cp .dev.vars.test.example .dev.vars.test
    echo "⚠️  Please edit .dev.vars.test file with your actual values"
    echo "   - Generate a strong JWT_SECRET for testing"
    echo "   - Configure test-specific settings"
else
    echo "✅ .dev.vars.test file already exists"
fi

# Create D1 database for test environment
echo "🗄️  Creating test D1 database..."
npm run db:migrate:test
npx wrangler d1 execute hono-auth-api-db-test --local --env test --file tests/init/reset.sql

echo ""
echo "📋 Next steps for TEST environment:"
echo "1. Update .dev.vars.test with the database ID from above"
echo "2. Update JWT_SECRET in .dev.vars.test"
echo "3. Run: npm run dev:test"
echo ""
echo "🔗 Test server will run on: http://localhost:8788"
