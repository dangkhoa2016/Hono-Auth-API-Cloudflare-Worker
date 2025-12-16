# 🔧 Wrangler Configuration Guide

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](WRANGLER_CONFIG_GUIDE.vi.md)

## 📋 Overview

The `wrangler.toml` file is the main configuration file for Cloudflare Workers, containing information about databases, environments, and other settings. In this project, the file is managed specially to ensure security.

## 🔒 Security Model

### Template vs Actual File
- **`wrangler.toml.example`** - Template file (committed to git)
  - Contains placeholder values
  - Safe to share
  - Used as reference for setup

- **`wrangler.toml`** - Actual config file (NOT committed to git)
  - Contains real database IDs
  - Sensitive credentials
  - Environment-specific settings

### Environment Variables (.dev.vars files)
Project uses `.dev.vars.*` files for environment variables:
- **`.dev.vars.development`** - Development environment settings
- **`.dev.vars.test`** - Test environment settings  
- **`.dev.vars.staging`** - Staging environment settings
- **`.dev.vars`** - Default production settings (local)

**Note**: All these files have corresponding templates (`.example`) for safe sharing.

### .gitignore Protection
The `wrangler.toml` file has been added to `.gitignore` to:
- Avoid accidentally committing real database IDs
- Protect staging/production credentials  
- Allow each developer to have their own config

## 🚀 Setup Instructions

### 1. Initial Setup
```bash
# Copy template to create actual config
cp wrangler.toml.example wrangler.toml

# Copy environment variable templates
cp .dev.vars.development.example .dev.vars.development
cp .dev.vars.test.example .dev.vars.test  
cp .dev.vars.staging.example .dev.vars.staging

# Edit files with real values (JWT_SECRET, DEBUG settings, etc.)
nano .dev.vars.development
nano .dev.vars.test
nano .dev.vars.staging
```

### 2. Environment-Specific Configuration

#### Development Environment
```toml
[env.development]
name = "hono-auth-api-worker-development"
[[env.development.d1_databases]]
binding = "DB"
database_name = "hono-auth-api-db-development"
database_id = "development-placeholder"  # Uses local database
migrations_dir = "migrations"
```
**Note**: Development uses local database, doesn't need real database ID.

#### Test Environment  
```toml
[env.test]
name = "hono-auth-api-worker-test"
[[env.test.d1_databases]]
binding = "DB"
database_name = "hono-auth-api-db-test"
database_id = "test-placeholder"  # Uses local database
migrations_dir = "migrations"
```
**Note**: Test environment also uses local database.

#### Staging Environment
```toml
[env.staging]
name = "hono-auth-api-worker-staging"
[[env.staging.d1_databases]]
binding = "DB"
database_name = "hono-auth-api-db-staging" 
database_id = "984fa566-xxxx-49be-xxxx-a6561426124a"  # Real staging DB ID
migrations_dir = "migrations"
```
**Note**: Staging already has real database ID and runs remotely.

#### Production Environment
```toml
# PRODUCTION environment (default)
[[d1_databases]]
binding = "DB"
database_name = "hono-auth-api-db"
database_id = ""  # Set via wrangler secret put DATABASE_ID
migrations_dir = "migrations"
preview_database_id = "984fa566-xxxx-49be-xxxx-a6561426124a"
```
**Note**: Production uses empty database_id (to be set via secret) and has preview_database_id for staging.

## 📦 Database ID Management

### Assets Configuration
Project has assets configuration for static files:
```toml
[assets]
directory = "./src/assets"
binding = "ASSETS"
```

### Local Development (Recommended)
```bash
# Development & Test environments automatically use local database
npm run dev          # Port 8787 - Development  
npm run dev:test     # Port 8788 - Test
```

### Remote Staging/Production
```bash
# Staging environment - already has database ID
npm run dev:staging     # Port 8789 - Staging (remote)

# Create production database (if not exists)
npm run db:create:prod

# Copy database ID from output and paste into wrangler.toml
# [production]
# database_id = "your-production-database-id"

# Or set production database ID via secret (recommended)
wrangler secret put DATABASE_ID
```

### Available npm Commands
```bash
# Development servers
npm run dev                    # Development (port 8787, local DB)
npm run dev:test              # Test (port 8788, local DB) 
npm run dev:staging           # Staging (port 8789, remote DB)

# Debug modes
npm run dev:debug             # Development with debug logging
npm run dev:staging:debug     # Staging with debug logging

# Database operations
npm run db:create:staging     # Create staging database
npm run db:create:prod        # Create production database
npm run db:migrate            # Migrate development DB
npm run db:migrate:test       # Migrate test DB
npm run db:migrate:staging    # Migrate staging DB
npm run db:migrate:prod       # Migrate production DB

# Deployment
npm run deploy:staging        # Deploy to staging
npm run deploy               # Deploy to production
npm run deploy:prod          # Deploy to production (alias)
```

## 🛠️ Common Tasks

### Check Current Configuration
```bash
# View current config (without showing secrets)
wrangler whoami
npx wrangler d1 list
```

### Verify Environment Setup
```bash
# Test development environment (local DB)
npm run dev
curl http://localhost:8787/

# Test test environment (local DB)
npm run dev:test  
curl http://localhost:8788/

# Test staging environment (remote DB)
npm run dev:staging
curl http://localhost:8789/
```

### Database Operations
```bash
# Local database migrations
npm run db:migrate          # Development
npm run db:migrate:test     # Test

# Remote database migrations
npm run db:migrate:staging  # Staging
npm run db:migrate:prod     # Production
```

## 🚨 Troubleshooting

### File Already Committed to Git
```bash
# Remove from git tracking but keep local file
git rm --cached wrangler.toml

# Commit the removal
git commit -m "Remove wrangler.toml from git tracking"

# Verify .gitignore contains wrangler.toml
grep "wrangler.toml" .gitignore
```

### Database Connection Issues
```bash
# Check database exists
npx wrangler d1 list

# Verify database ID in wrangler.toml matches
npx wrangler d1 info <database-id>

# Test database connection
npm run dev
# Check logs for D1 binding errors
```

### Environment Not Loading Correctly
```bash
# Verify environment name in wrangler.toml
# Should match: hono-auth-api-worker-{environment}

# Check dev command uses correct environment
npm run dev          # Should use [env.development] 
npm run dev:test     # Should use [env.test]
npm run dev:staging  # Should use [env.staging] --remote

# Check if .dev.vars files exist for environment settings
ls -la .dev.vars*
# Should have: .dev.vars.development, .dev.vars.test, .dev.vars.staging
```

## ✅ Best Practices

### 1. Never Commit Real Database IDs
- ✅ Use template file for sharing
- ❌ Never `git add wrangler.toml` with real IDs
- ✅ Use `wrangler secret` for production

### 2. Environment Isolation  
- ✅ Development/Test = local databases (`--local` flag)
- ✅ Staging = remote database with `--remote` flag
- ✅ Production = remote database with secrets

### 3. Team Collaboration
- ✅ Share `wrangler.toml.example` updates
- ✅ Document environment setup steps
- ✅ Use consistent naming conventions

### 4. Backup Strategy
```bash
# Backup staging database (has real database ID)
npx wrangler d1 export hono-auth-api-db-staging --env staging --output staging-backup.sql

# Backup production database structure
npx wrangler d1 export hono-auth-api-db --output production-backup.sql
```

## 📚 Related Documentation

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Initial project setup
- [README.md](../README.md) - Complete project documentation  
- [DEBUG_DEVELOPMENT_GUIDE.md](./DEBUG_DEVELOPMENT_GUIDE.md) - Development workflow
- [ZOD_GUIDE.md](./ZOD_GUIDE.md) - Zod validation usage
- [Cloudflare Workers D1 Documentation](https://developers.cloudflare.com/d1/)

## 📊 Current Project State

### Database IDs (as of current config):
- **Development**: `development-placeholder` (local database)
- **Test**: `test-placeholder` (local database)  
- **Staging**: `984fa566-xxxx-49be-xxxx-a6561426124a` (remote database)
- **Production**: `""` (empty, set via secret or manual config)

### Environment Ports:
- **Development**: 8787 (local)
- **Test**: 8788 (local)
- **Staging**: 8789 (remote)  
- **Production**: Deployed URL

### Currently Running:
```bash
# Server currently running on port 8788 (test environment)
# Can test endpoints at: http://localhost:8788/api/
```

## 🔗 Quick Links

```bash
# Setup commands
cp wrangler.toml.example wrangler.toml
npm run setup:dev
npm run db:migrate

# Development workflow
npm run dev              # Start development server
npm run test            # Run test suite
npm run lint:check      # Check code quality

# Deployment workflow  
npm run deploy:staging  # Deploy to staging
npm run deploy         # Deploy to production
```
