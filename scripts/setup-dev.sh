#!/bin/bash

# Development Environment Setup Script
echo "🚀 Setting up Hono Auth Worker for DEVELOPMENT environment..."

# Check if .dev.vars.development exists
if [ ! -f ".dev.vars.development" ]; then
    echo "📝 Creating .dev.vars.development file from template..."
    cp .dev.vars.development.example .dev.vars.development
    echo "⚠️  Please edit .dev.vars.development file with your actual values"
    echo "   - Generate a strong JWT_SECRET for development"
    echo "   - Configure development-specific settings"
else
    echo "✅ .dev.vars.development file already exists"
fi

# Create D1 database for development environment
echo "🗄️  Creating development D1 database..."
npm run db:migrate

npx wrangler d1 execute hono-auth-api-db-development --local --env development --file tests/init/reset.sql

echo ""
echo "📋 Next steps for DEVELOPMENT environment:"
echo "1. Update .dev.vars.development with any additional configuration"
echo "2. Run: npm run dev"
echo ""
echo "🔗 Dev server will run on: http://localhost:8787"
