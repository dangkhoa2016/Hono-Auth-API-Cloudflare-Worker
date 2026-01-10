#!/bin/bash

# Staging Environment Setup Script
echo "🎭 Setting up Hono Auth Worker for STAGING environment..."

# Check if .dev.vars.staging exists
if [ ! -f ".dev.vars.staging" ]; then
    echo "📝 Creating .dev.vars.staging file from template..."
    cp .dev.vars.staging.example .dev.vars.staging
    echo "⚠️  Please edit .dev.vars.staging file with your actual values"
    echo "   - Generate a production-strength JWT_SECRET"
    echo "   - Configure staging-specific settings"
else
    echo "✅ .dev.vars.staging file already exists"
fi

# Create D1 database for staging environment
echo "🗄️  Creating staging D1 database..."
npm run db:migrate:staging
npx wrangler d1 execute hono-auth-api-db-staging --env staging --remote --file tests/init/reset.sql

echo ""
echo "📋 Next steps for STAGING environment:"
echo "1. Update wrangler.toml with staging database ID"
echo "2. Set secrets: npm run secret:put:staging"
echo "3. Deploy: npm run deploy:staging"
echo ""
echo "🚀 Staging URL will be: https://hono-auth-api-cloudflare-worker-staging.your-domain.workers.dev"
