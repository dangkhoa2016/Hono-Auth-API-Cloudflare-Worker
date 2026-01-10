# Development Setup Guide

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](SETUP_GUIDE.vi.md)

## 🚀 Quick Start

### 1. Clone and install dependencies
```bash
git clone <repository-url>
cd hono-auth-api-cloudflare-worker
npm install
```

### 2. Setup development environment
│   ├── regularUserTest.js  # Regular User Role tests  
│   ├── adminUserTest.js    # Admin functionality tests
│   ├── superAdminUserTest.js    # Super Admin User Role tests
```bash
# Run automated setup script
npm run setup:dev

# Or manual setup:
cp .dev.vars.development.example .dev.vars.development
cp .dev.vars.test.example .dev.vars.test
cp .dev.vars.staging.example .dev.vars.staging
cp wrangler.toml.example wrangler.toml
```

### 3. Configure .dev.vars files
Edit the environment files with real values:

**Development (.dev.vars.development):**
```bash
JWT_SECRET = "your-development-jwt-secret-here"

# Debug Configuration - adjust logging level
DEBUG = "hono-auth-api:*"

ENV = "development"
```

**Test (.dev.vars.test):**
```bash
JWT_SECRET = "your-test-jwt-secret-here"
DEBUG = "hono-auth-api:*"
RATE_LIMIT_DISABLED = "true"
AUTO_ACTIVATE_USER_ON_REGISTER = "true"
ENV = "test"
```

**Staging (.dev.vars.staging):**
```bash
JWT_SECRET = "your-staging-jwt-secret-here"
DEBUG = "hono-auth-api:error:*,hono-auth-api:security:*"
ENV = "staging"
RATE_LIMIT_DISABLED = "true"
```

### 4. Setup database (Development/Test use local database)
```bash
# Development & Test environments use local database
# No need to create separate database, just run migrations

# Run migrations for development
npm run db:migrate

# Run migrations for test environment (if needed for testing)
npm run db:migrate:test
```

**Note**: Development and Test environments use local D1 database, no real database IDs needed.

### 5. Initialize KV configuration (Optional)
```bash
# Initialize KV configuration with default values
npm run test:kv:setup

# Test KV Admin functionality
npm run test:kv_admin

# Complete KV Admin testing
npm run test:kv:scripts
```

**Note**: KV configuration is optional and only needed if you want to use dynamic configuration management. The application works without KV setup using environment variables as fallback.

### 6. Run development server
```bash
# Development environment (port 8787)
npm run dev

# Test environment (port 8788) 
npm run dev:test

# Staging environment (port 8789) - requires real database
npm run dev:staging
```

### 6. Test the system
```bash
# Interactive test menu (recommended)
npm run test

# Unified test suite (comprehensive testing)
npm run test:unified

# Quick smoke tests
npm run test:unified:quick

# Specific test contexts  
npm run test:auth         # Authentication tests
npm run test:system       # System tests
npm run test:regular_user         # Regular User Role tests
npm run test:admin_user        # Admin User Role tests
npm run test:super_admin_user       # Super Admin User Role tests
npm run test:kv_admin     # KV Admin configuration testing (super_admin only)
npm run test:security     # Security tests
npm run test:i18n  # i18n tests
npm run test:validation   # Validation tests
npm run test:zod_validation # Zod validation tests
npm run test:performance  # Performance tests
npm run test:integration  # Integration tests
npm run test:role         # Role-based access control tests
npm run test:xss          # XSS security tests
```

## 🔒 Production Deployment

### Staging Environment Setup (Optional)
```bash
# Setup staging environment
npm run setup:staging

# Create staging database (first time)
npm run db:create:staging

# Run staging migrations
npm run db:migrate:staging

# Deploy to staging
npm run deploy:staging
```

### 1. Create production database
```bash
# Create production database (first time)
npm run db:create:prod

# Or manual command
wrangler d1 create hono-auth-api-db
```

### 2. Set production secrets
```bash
# Set JWT secret for production
npm run secret:put:prod

# Or manual command
wrangler secret put JWT_SECRET

# Set staging secrets (if needed)
npm run secret:put:staging
```

### 3. Setup wrangler.toml
⚠️ **Security Note**: File `wrangler.toml` has been added to `.gitignore` to protect database IDs.

Create `wrangler.toml` file from template:
```bash
cp wrangler.toml.example wrangler.toml
```

Update production database ID in `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "hono-auth-api-db"
database_id = "your-production-database-id"  # Replace with actual database ID
migrations_dir = "migrations"
```

**Important**: Do not commit `wrangler.toml` file to git as it contains sensitive database IDs.

### 4. Deploy
```bash
# Deploy to production
npm run deploy

# Deploy to staging (if needed)
npm run deploy:staging

# Run production migrations
npm run db:migrate:prod
```

## 📁 File Structure

```
├── .dev.vars.development     # Development environment variables (NOT in git)
├── .dev.vars.test           # Test environment variables (NOT in git)  
├── .dev.vars.staging        # Staging environment variables (NOT in git)
├── .dev.vars                # Default/production variables (NOT in git)
├── .dev.vars.*.example      # Template files (in git)
├── wrangler.toml.example    # Wrangler config template (in git)
├── wrangler.toml            # Actual config with secrets (NOT in git)
├── scripts/                 # Setup & development scripts
│   ├── setup-dev.sh         # Development setup script
│   ├── setup-test.sh        # Test environment setup
│   ├── setup-staging.sh     # Staging setup
├── tests/                   # Comprehensive testing framework
│   ├── mainMenu.js          # Interactive test menu
│   ├── unifiedTestSuite.js  # All-in-one comprehensive testing
│   ├── systemTest.js        # System functionality tests
│   ├── authTest.js          # Authentication tests
│   ├── adminUserTest.js         # Admin functionality tests
│   ├── regularUserTest.js   # Regular User Role tests
│   ├── superAdminUserTest.js    # Super Admin User Role tests
│   ├── kvAdminTest.js       # KV Admin configuration tests (super_admin only)
│   ├── securityTest.js      # Security tests
│   ├── comprehensiveI18nTest.js # Comprehensive i18n tests
│   ├── validationTest.js    # Validation tests
│   ├── zodValidationTest.js # Zod validation tests
│   ├── performanceTest.js   # Performance tests
│   ├── integrationTest.js   # Integration tests
│   ├── roleTest.js          # Role-based access control tests
│   ├── xssSecurityTest.js   # XSS security tests
│   ├── scripts/             # Test automation scripts
│   └── utils/               # Test utilities & helpers
└── src/                     # Application code
    ├── routes/              # API routes
    ├── middleware/          # Middleware functions
    ├── services/            # Business logic
    ├── schemas/             # Zod validation schemas
    ├── i18n/                # Dynamic i18n system
    └── utils/               # Utility functions
```

## 🔐 Security Best Practices

1. **Never commit sensitive data**:
   - Database IDs
   - JWT secrets
   - API keys

2. **Use different databases per environment**:
   - Development: Local D1 database
   - Test: Local D1 database  
   - Staging: Remote D1 database (`984fa566-xxxx-49be-xxxx-a6561426124a`)
   - Production: Remote D1 database (via secrets)

3. **Environment separation**:
   - `.dev.vars.*` for local environments
   - Cloudflare secrets for production

4. **Strong secrets**:
   - Use random, long JWT secrets
   - Rotate secrets regularly

## 🚀 Multi-Environment Architecture

| Environment | Purpose | Port | Database | Config File |
|-------------|---------|------|----------|-------------|
| **Development** | Local development | 8787 | Local D1 | .dev.vars.development |
| **Test** | Automated testing | 8788 | Local D1 Test | .dev.vars.test |
| **Staging** | Pre-production | 8789 | Remote D1 | .dev.vars.staging |
| **Production** | Live application | - | Remote D1 | Secrets |

## 📚 Related Documentation

- [WRANGLER_CONFIG_GUIDE.md](./WRANGLER_CONFIG_GUIDE.md) - Wrangler configuration details
- [DEBUG_DEVELOPMENT_GUIDE.md](./DEBUG_DEVELOPMENT_GUIDE.md) - Debug and development workflow
- [ZOD_GUIDE.md](./ZOD_GUIDE.md) - Zod validation usage
- [I18N_MASTER_GUIDE.md](./I18N_MASTER_GUIDE.md) - Internationalization system
- [ROLE_COMPLETE_GUIDE.md](./ROLE_COMPLETE_GUIDE.md) - Role management
