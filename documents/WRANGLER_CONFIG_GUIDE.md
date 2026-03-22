# 🔧 Wrangler Configuration Guide

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](WRANGLER_CONFIG_GUIDE.vi.md)

## 📋 Overview

The `wrangler.toml` file is the main configuration file for Cloudflare Workers, containing information about databases, environments, and other settings. In this project, the file is managed specially to ensure security.

This guide focuses on how the Wrangler configuration is structured and how environments map to local or remote resources. For full project setup, test workflows, and day-to-day debugging commands, use [SETUP_GUIDE.md](./SETUP_GUIDE.md), [TEST_GUIDE.md](./TEST_GUIDE.md), and [DEBUG_DEVELOPMENT_GUIDE.md](./DEBUG_DEVELOPMENT_GUIDE.md).

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

### 1. Configuration Quick Start
```bash
cp wrangler.toml.example wrangler.toml
cp .dev.vars.development.example .dev.vars.development
cp .dev.vars.test.example .dev.vars.test
cp .dev.vars.staging.example .dev.vars.staging
```

After copying the templates, fill in the real secrets for the environment you are working on. If you want the full onboarding workflow, secret handling checklist, or developer bootstrap steps, use [SETUP_GUIDE.md](./SETUP_GUIDE.md).

### 2. Environment-Specific Configuration

#### Development Environment
```toml
[env.development]
name = "hono-auth-api-cloudflare-worker-development"
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
name = "hono-auth-api-cloudflare-worker-test"
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
name = "hono-auth-api-cloudflare-worker-staging"
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

### Environment Operation Quick Start

Keep the Wrangler mental model simple:

- **Development** and **Test** use local D1 databases.
- **Staging** runs against the remote database with `--remote`.
- **Production** should use secrets for sensitive values and remote D1 migrations.

Representative commands:

```bash
# Local development
npm run dev
npm run dev:test

# Remote staging
npm run dev:staging

# Migrations
npm run db:migrate
npm run db:migrate:test
npm run db:migrate:staging
npm run db:migrate:prod

# Deployment
npm run deploy:staging
npm run deploy
```

Use [SETUP_GUIDE.md](./SETUP_GUIDE.md) for environment bootstrapping, [TEST_GUIDE.md](./TEST_GUIDE.md) for verified command coverage, and [DEBUG_DEVELOPMENT_GUIDE.md](./DEBUG_DEVELOPMENT_GUIDE.md) for debug-oriented workflows.

## 🛠️ Common Tasks

### Check Current Configuration
```bash
# View current config (without showing secrets)
wrangler whoami
npx wrangler d1 list
```

### Verify Environment Setup

Use a short verification loop after changing Wrangler config:

```bash
wrangler whoami
npx wrangler d1 list
npm run dev
```

If the worker starts and the expected D1 binding is available, the configuration is usually correct. For broader smoke tests and API verification, continue in [TEST_GUIDE.md](./TEST_GUIDE.md).

## 🚨 Troubleshooting

### File Already Committed to Git

If `wrangler.toml` was accidentally tracked, remove it from Git while keeping the local file, then confirm `.gitignore` still excludes it. This is a one-time repository hygiene fix rather than part of the normal setup flow.

### Database Connection Issues

Check the problem in this order:

1. Confirm the target database exists with `npx wrangler d1 list`.
2. Confirm the expected environment section is being used.
3. Start the worker with the matching `npm run dev...` command and inspect D1 binding errors.

For deeper runtime debugging patterns, continue in [DEBUG_DEVELOPMENT_GUIDE.md](./DEBUG_DEVELOPMENT_GUIDE.md).

### Environment Not Loading Correctly

Usually this means one of three things:

1. The environment name in `wrangler.toml` does not match the command you ran.
2. The matching `.dev.vars.*` file is missing or incomplete.
3. You expected a remote environment but started a local one, or the reverse.

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

Before modifying a remote environment, export the staging or production D1 database to a local SQL backup. Use the standard Wrangler D1 export workflow that matches the environment you are operating on.

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

At the time this guide was written, the actively used local test environment was port `8788`. Treat that as an example, not a guaranteed runtime state.

## 🔗 Quick Links

- [SETUP_GUIDE.md](./SETUP_GUIDE.md) - Full environment bootstrap and setup flow
- [TEST_GUIDE.md](./TEST_GUIDE.md) - Canonical command matrix for verification and test runs
- [DEBUG_DEVELOPMENT_GUIDE.md](./DEBUG_DEVELOPMENT_GUIDE.md) - Debug workflows and local troubleshooting
- [README.md](../README.md) - Project overview and minimal quick-start
