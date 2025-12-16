# Complete Debug & Development Guide

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](DEBUG_DEVELOPMENT_GUIDE.vi.md)

## 📋 Table of Contents
- [🚨 Important Changes](#-important-changes)
- [🎯 Debug System Overview](#-debug-system-overview)
- [🌍 Multi-Environment Setup](#-multi-environment-setup)
- [🔧 Debug Configuration](#-debug-configuration)
- [📦 Usage Methods](#-usage-methods)
- [💡 Practical Examples](#-practical-examples)
- [🧪 Testing with Debug](#-testing-with-debug)
- [📊 Log Analysis & Monitoring](#-log-analysis--monitoring)
- [🔍 Troubleshooting](#-troubleshooting)
- [🚀 Production Considerations](#-production-considerations)
- [📚 Quick Reference](#-quick-reference)
- [📋 Documentation Consolidation History](#-documentation-consolidation-history)

---

## 🚨 Important Changes

**The debug system has been updated to work with `wrangler dev`:**
- ❌ `export DEBUG=...` commands **DO NOT WORK** with wrangler
- ✅ Use `.vars` files to control debug patterns
- ✅ Use shell scripts to control wrangler log verbosity

**Migration Required**: Old debug scripts using `export DEBUG=...` must be updated to use `.vars` files.

---

## 🎯 Debug System Overview

This guide covers the complete debug and logging system for the Hono Auth Worker project. The system uses two separate but complementary logging mechanisms:

1. **Application Debug Logs** - Controlled by `.vars` files using the `debug` package
2. **Wrangler Log Levels** - Controlled by shell scripts and npm commands

### Debug Architecture

The application uses structured debug namespaces organized by functionality:

| Namespace | Purpose | Usage |
|-----------|---------|--------|
| `hono-auth-api:*` | All debug logs | Full debug mode |
| `hono-auth-api:app*` | Application lifecycle | Startup, shutdown events |
| `hono-auth-api:server*` | Server events | HTTP server operations |
| `hono-auth-api:config*` | Configuration | App configuration loading |
| `hono-auth-api:routes:*` | Route handlers | API request/response debugging |
| `hono-auth-api:routes:auth*` | Auth routes only | Login, refresh token |
| `hono-auth-api:routes:user*` | User routes only | Profile, user management |
| `hono-auth-api:routes:admin*` | Admin routes only | Admin management |
| `hono-auth-api:routes:api*` | API routes only | General API endpoints |
| `hono-auth-api:routes:favicon*` | Favicon routes | Static asset serving |
| `hono-auth-api:middleware:*` | Middleware layer | CORS, error handling, auth |
| `hono-auth-api:middleware:auth*` | Auth middleware only | JWT verification |
| `hono-auth-api:middleware:cors*` | CORS middleware | Cross-origin requests |
| `hono-auth-api:middleware:error*` | Error middleware | Error handling |
| `hono-auth-api:middleware:handle*` | Handle middleware | Request handling |
| `hono-auth-api:services:*` | Service layer | Business logic debugging |
| `hono-auth-api:services:user*` | User service only | User operations |
| `hono-auth-api:services:auth*` | Auth service only | Authentication logic |
| `hono-auth-api:services:ratelimit*` | Rate limiting | IP blocking, attempt tracking |
| `hono-auth-api:security:*` | Security operations | JWT, bcrypt, auth flow |
| `hono-auth-api:security:jwt*` | JWT operations only | Token create/verify |
| `hono-auth-api:security:bcrypt*` | Password hashing | Hash/compare operations |
| `hono-auth-api:security:ratelimit*` | Rate limiting security | Security rate limiting |
| `hono-auth-api:validation:*` | Input validation | Zod validation debugging |
| `hono-auth-api:validation:zod*` | Zod validation only | Schema validation |
| `hono-auth-api:i18n:*` | Internationalization | Language detection, translation |
| `hono-auth-api:database:*` | Database operations | Queries, migrations, connections |
| `hono-auth-api:database:query*` | SQL queries only | Query execution |
| `hono-auth-api:database:migration*` | Migrations only | Schema changes |
| `hono-auth-api:utils:*` | Utility functions | Helper functions |
| `hono-auth-api:utils:helpers*` | Helper utilities | General utilities |
| `hono-auth-api:error:*` | Error handling | All error scenarios |
| `hono-auth-api:error:auth*` | Auth errors | Authentication errors |
| `hono-auth-api:error:database*` | Database errors | DB operation errors |
| `hono-auth-api:error:validation*` | Validation errors | Input validation errors |
| `hono-auth-api:test:*` | Testing operations | Test runner, test suites |
| `hono-auth-api:test:runner*` | Test runner | Test execution |
| `hono-auth-api:test:suite*` | Test suites | Test suites |

---

## 🌍 Multi-Environment Setup

### Environment Overview

The project supports 4 distinct environments:

| Environment | Purpose | Port | Database | Debug Default |
|-------------|---------|------|----------|---------------|
| **Development** | Local development | 8787 | Local D1 | `hono-auth-api:*` |
| **Test** | Automated testing | 8788 | Local D1 Test | `hono-auth-api:*` |
| **Staging** | Pre-production | 8789 | Local D1 | `error:*,security:*` |
| **Production** | Live application | - | Cloudflare D1 | `error:*` or silent |

### Environment Variable Files

#### .dev.vars.development (Development)
```bash
# Development environment variables
JWT_SECRET = "your-development-jwt-secret-here"

# Debug settings - Full debug recommended for development
DEBUG = "hono-auth-api:*"                    # All debug logs
# DEBUG = "hono-auth-api:routes:*"           # Routes only
# DEBUG = "hono-auth-api:security:*"         # Security only
# DEBUG = "hono-auth-api:error:*"            # Errors only
# DEBUG = ""                                 # Silent

ENV = "development"
```

#### .dev.vars.test (Testing)
```bash
# Test environment variables
JWT_SECRET = "your-test-jwt-secret-here"

# Debug settings - Full debug for testing
DEBUG = "hono-auth-api:*"

# Rate limiting settings - disable for testing to avoid interference
RATE_LIMIT_DISABLED = "true"

# Auto activate user on register for testing
AUTO_ACTIVATE_USER_ON_REGISTER = "true"

ENV = "test"
```

#### .dev.vars.staging (Staging)
```bash
# Staging environment variables
JWT_SECRET = "your-staging-jwt-secret-here"

# Debug settings - Limited debug for staging
DEBUG = "hono-auth-api:error:*,hono-auth-api:security:*"

# Rate limiting settings - disable for testing to avoid interference
RATE_LIMIT_DISABLED = "true"

ENV = "staging"
```

### Quick Environment Setup

#### Development Setup
```bash
# 1. Setup environment
npm run setup:dev

# 2. Configure .dev.vars.development with your values
cp .dev.vars.development.example .dev.vars.development
# Edit .dev.vars.development with actual values

# 3. Setup database
npm run db:migrate

# 4. Start with debug
npm run dev              # Standard debug
npm run dev:debug        # Verbose wrangler logs
```

#### Test Environment Setup
```bash
# 1. Setup test environment
npm run setup:test

# 2. Configure .dev.vars.test
cp .dev.vars.test.example .dev.vars.test

# 3. Setup test database
npm run db:migrate:test

# 4. Start test server
npm run dev:test         # Test environment
```

#### Staging Environment Setup
```bash
# 1. Setup staging
npm run setup:staging

# 2. Configure .dev.vars.staging
cp .dev.vars.staging.example .dev.vars.staging

# 3. Start staging server
npm run dev:staging      # Limited debug for staging
```

---

## 🔧 Debug Configuration

### How to Change Debug Patterns

1. **Edit the appropriate .vars file**:
   ```bash
   vim .dev.vars.development      # For development
   vim .dev.vars.test     # For testing
   vim .dev.vars.staging  # For staging
   ```

2. **Modify the DEBUG line**:
   ```bash
   DEBUG = "hono-auth-api:routes:*"  # Routes only
   DEBUG = "hono-auth-api:error:*"   # Errors only
   DEBUG = ""                        # Silent
   ```

3. **Restart the server**:
   ```bash
   npm run dev  # Changes take effect on restart
   ```

### Wrangler Log Levels

Wrangler log levels control how verbose the wrangler tool itself is, separate from application debug logs.

| Level | Verbosity | Speed | Use Case |
|-------|-----------|-------|----------|
| `debug` | Highest | Slowest | Deep wrangler debugging |
| `info` | High | Medium | General development |
| `log` | Medium | Good | Production-like development |
| `warn` | Low | Fast | Staging environment |
| `error` | Minimal | Fastest | Production environment |
| `none` | Silent | Fastest | Testing, CI/CD |

---

## 📦 Usage Methods

### 1. npm Scripts (Recommended)

#### Development Scripts
```bash
npm run dev              # Normal development server (port 8787)
npm run dev:debug        # Development with verbose wrangler logs
npm run dev:test         # Test environment (port 8788)
npm run dev:staging      # Staging environment (port 8789)
```

#### Additional Debug Scripts (by wrangler log level)
```bash
# Development environment with different wrangler log levels
npm run dev:debug        # --log-level debug
npm run dev:info         # --log-level info
npm run dev:warn         # --log-level warn
npm run dev:error        # --log-level error
npm run dev:silent       # --log-level none

# Test environment with different wrangler log levels
npm run dev:test         # --log-level info (default)
npm run dev:test:debug   # --log-level debug
npm run dev:test:warn    # --log-level warn
npm run dev:test:error   # --log-level error
npm run dev:test:silent  # --log-level none

# Staging environment with different wrangler log levels
npm run dev:staging      # --log-level warn (default)
npm run dev:staging:debug # --log-level debug
npm run dev:staging:info # --log-level info
npm run dev:staging:error # --log-level error
npm run dev:staging:silent # --log-level none
```

#### Debug Information Tool
```bash
npm run debug:info       # Display debug configuration info
```

### 2. Direct npm Scripts (Recommended)

The project provides multiple npm scripts for different debug levels and environments:

```bash
# Development environment
npm run dev              # Standard development (info level)
npm run dev:debug        # Verbose wrangler logging (debug level)
npm run dev:warn         # Warning-level wrangler logging
npm run dev:error        # Error-only wrangler logging
npm run dev:silent       # Silent wrangler logging

# Test environment (port 8788)
npm run dev:test         # Standard test environment (info level)
npm run dev:test:debug   # Verbose test environment
npm run dev:test:warn    # Warning-level test environment
npm run dev:test:error   # Error-only test environment
npm run dev:test:silent  # Silent test environment

# Staging environment (port 8789, uses remote database)
npm run dev:staging      # Standard staging (warn level)
npm run dev:staging:debug # Verbose staging environment
npm run dev:staging:info # Info-level staging environment
npm run dev:staging:error # Error-only staging environment
npm run dev:staging:silent # Silent staging environment
```

#### Debug Information Tool
```bash
npm run debug:info       # Display debug configuration info
```

### 3. VS Code Tasks

Available through Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → `Tasks: Run Task`:

- `Development Server` - Standard development mode
- `Development Server (Debug Mode)` - Verbose logging mode
- `Test API` - API testing
- `ESLint - Check Code` - Code quality check
- `ESLint - Fix Code` - Auto-fix ESLint issues
- `ESLint - Strict Check` - CI/CD ready ESLint check

**Note**: No shell scripts are needed - all debug control is through npm scripts and `.vars` files.

---

## 💡 Practical Examples

### Example 1: Debug Only Routes
```bash
# Edit .dev.vars.development
DEBUG = "hono-auth-api:routes:*"

# Start server with verbose wrangler logs
npm run dev:debug
```

### Example 2: Debug Only Errors (Staging-like)
```bash  
# Edit .dev.vars.development
DEBUG = "hono-auth-api:error:*"

# Start server with warning-level wrangler logs
npm run dev:warn
```

### Example 3: Silent Mode (Testing)
```bash
# Edit .dev.vars.test
DEBUG = ""

# Start test server with no wrangler logs
npm run dev:test:silent
```

### Example 4: Security + Validation Debug
```bash
# Edit .dev.vars.development
DEBUG = "hono-auth-api:security:*,hono-auth-api:validation:*"

# Start server
npm run dev
```

### Example 5: Database Query Debugging
```bash
# Edit .dev.vars.development
DEBUG = "hono-auth-api:database:query*"

# Start server and monitor SQL queries
npm run dev
```

---

## 🧪 Testing with Debug

### Interactive Test Menu (Recommended)

```bash
# Interactive test menu with debug logging
npm run test             # Uses debug settings from .dev.vars.test

# Menu options:
# 1 - System Tests            (Core functionality)
# 2 - Authentication Tests    (Login, JWT validation)  
# 3 - User Management Tests   (User CRUD operations)
# 5 - Security Tests         (Rate limiting, validation)
# 6 - Translation Tests      (i18n functionality)
# 7 - Role-Based Tests       (RBAC testing)
# 8 - Performance Tests      (Load testing)
# 9 - Integration Tests      (End-to-end workflows)
# 10 - Validation Tests      (Zod schema validation)
# q - Quick Tests            (Fast smoke tests)
```

### Unified Test Suite

```bash
# Comprehensive testing with different contexts
npm run test:unified         # All tests
npm run test:unified:quick   # Quick smoke tests
npm run test:unified:system  # System functionality tests
npm run test:unified:auth    # Authentication tests
npm run test:unified:user    # Regular User Role tests
npm run test:unified:admin   # Admin User Role tests
npm run test:unified:superadmin # Super Admin User Role tests
npm run test:unified:rbac    # Role-based access control tests
npm run test:unified:security # Security tests
npm run test:unified:translation # i18n tests
npm run test:unified:performance # Performance tests
npm run test:unified:help    # Show help information
```

### Direct Test Execution

```bash
# Quick validation
npm run test:quick       # Fast smoke tests

# Specific test contexts
npm run test:auth        # Authentication tests
npm run test:system      # System functionality tests
npm run test:security    # Security & rate limiting tests
npm run test:regular_user        # Regular User Role tests
npm run test:admin_user       # Admin User Role tests
npm run test:super_admin_user      # Super Admin User Role tests
npm run test:i18n # i18n tests
npm run test:role        # Role-based access control tests
npm run test:performance # Performance tests
npm run test:integration # Integration tests
npm run test:validation  # Validation tests
npm run test:zod_validation # Zod schema validation tests

# XSS Security Tests
npm run test:xss         # All XSS tests
npm run test:xss:login   # Login XSS tests
npm run test:xss:profile # Profile XSS tests
npm run test:xss:creation # User creation XSS tests
npm run test:xss:search  # Search XSS tests

# Role-based testing
npm run test:regular_user    # Regular User Role tests
npm run test:admin_user      # Admin User Role tests
npm run test:super_admin_user     # Super Admin User Role tests
bash tests/scripts/test_all_roles.sh # All role tests

# Database initialization for testing
npm run test:initdb      # Initialize test database
```

### Testing Workflow
```bash
# Terminal 1: Start test server with debug
npm run dev:test

# Terminal 2: Run tests with different debug levels
npm run test                     # Interactive menu
npm run test:unified:quick       # Quick comprehensive tests
npm run test:unified:rbac        # Role-based access control tests
npm run test:auth               # Authentication tests only
API_BASE_URL=http://localhost:8788 npm run test:system  # System tests

# For different environments
API_BASE_URL=http://localhost:8787 npm run test  # Development environment
API_BASE_URL=http://localhost:8789 npm run test  # Staging environment
```

### API Testing with Debug

```bash
# Start server with route and security debug
# Edit .dev.vars.development: DEBUG = "hono-auth-api:routes:*,hono-auth-api:security:*"
npm run dev

# Test valid login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test invalid data to see validation errors
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"123"}'
```

---

## 📊 Log Analysis & Monitoring

### Saving and Monitoring Logs

```bash
# Save all logs to file
npm run dev 2>&1 | tee debug.log

# Save only application debug logs (filter out wrangler)
npm run dev 2>&1 | grep "hono-auth-api:" > debug.log

# Monitor real-time
tail -f debug.log

# Analysis commands
grep "error" debug.log                # Find errors
grep "routes:auth" debug.log          # Auth requests
grep "security:jwt" debug.log         # JWT operations
grep "+[0-9][0-9]ms" debug.log        # Slow operations (>10ms)
grep "validation" debug.log           # Validation operations
```

### Performance Analysis

```bash
# Find slow operations
grep "+[0-9][0-9][0-9]ms" debug.log   # >100ms operations

# Database query performance
grep "database:query" debug.log | grep "+[0-9][0-9]ms"

# JWT operations timing
grep "security:jwt" debug.log | grep "+[0-9]ms"

# Request count analysis
grep "routes:auth" debug.log | wc -l  # Count auth requests
```

### Debug Output Examples

```
hono-auth-api:app Hono Auth API starting up... +0ms
hono-auth-api:server Setting up routes... +2ms
hono-auth-api:routes:auth Login request received +1ms
hono-auth-api:security:jwt Creating JWT token for user: 2 +0ms
hono-auth-api:middleware:auth Token verified successfully +5ms
hono-auth-api:database:query SELECT * FROM users WHERE email = ? +3ms
hono-auth-api:validation Zod validation passed for login schema +1ms
```

---

## 🔍 Troubleshooting

### Debug Logs Not Appearing
1. **Check .vars file**: `cat .dev.vars.development | grep DEBUG`
2. **Ensure server restarted** after changing `.dev.vars.*`
3. **Verify namespace spelling** (case-sensitive)
4. **Check debug package**: `npm list debug`
5. **Verify debug enabling**: Look for `debug.enable(c.env.DEBUG)` in logs

### Too Many Logs
1. **Use specific namespaces**: `hono-auth-api:routes:*` instead of `hono-auth-api:*`
2. **Reduce wrangler log level**: Use `npm run dev:warn` or `npm run dev:error`
3. **Filter to specific areas**: `DEBUG="hono-auth-api:error:*"`

### No Wrangler Logs
1. **Check npm script**: Use `npm run dev:debug` for verbose wrangler logs
2. **Verify wrangler is running correctly**
3. **Check port conflicts**: `lsof -ti:8787`

### Server Won't Start
```bash
# Check port conflicts
lsof -ti:8787  # Development port
lsof -ti:8788  # Test port
lsof -ti:8789  # Staging port

# Kill conflicting processes
npm run kill   # Kill existing wrangler processes
pkill -f 'wrangler dev'  # Alternative kill command
```

### Database Issues
```bash
# Check database status
npm run db:migrate
npx wrangler d1 list

# Reset if needed
npm run db:migrate:test
```

### Authentication Errors
```bash
# Debug auth flow with comprehensive logging
# Edit .dev.vars.development: DEBUG = "hono-auth-api:security:*,hono-auth-api:routes:auth*"
npm run dev

# Test with known credentials
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🚀 Production Considerations

### Recommended Settings by Environment

#### Development
```bash
DEBUG = "hono-auth-api:*"          # Full debug
wrangler log level: debug or info
```

#### Testing
```bash
DEBUG = "hono-auth-api:*"          # Full debug for test debugging
wrangler log level: info
```

#### Staging
```bash
DEBUG = "hono-auth-api:error:*,hono-auth-api:security:*"  # Limited
wrangler log level: warn
```

#### Production
```bash
DEBUG = ""                         # Silent (or error:* only)
wrangler log level: error or none
```

### Security Considerations

1. **Recommendation for production**: Use minimal debug level
2. **Sensitive data**: Ensure no passwords/tokens in debug logs
3. **Performance**: Debug logging can impact performance
4. **Log retention**: Consider log storage and retention policies

---

## 📚 Quick Reference

### Key Files
- `.dev.vars.development` - Development debug settings
- `.dev.vars.test` - Test debug settings  
- `.dev.vars.staging` - Staging debug settings
- `.dev.vars.*.example` - Template files for environment setup
- `src/utils/debug.js` - Debug namespace definitions
- `src/constants/app.js` - App configuration including debug base name
- `src/index.js` - Debug enabling logic (`debug.enable(c.env.DEBUG)`)
- `package.json` - All npm scripts for different debug levels
- `.vscode/tasks.json` - VS Code tasks including debug tasks

### Common Debug Patterns
```bash
# Full debugging
DEBUG = "hono-auth-api:*"

# API focused
DEBUG = "hono-auth-api:routes:*,hono-auth-api:middleware:*"

# Security focused  
DEBUG = "hono-auth-api:security:*,hono-auth-api:middleware:auth*"

# Database focused
DEBUG = "hono-auth-api:database:*"

# Error focused
DEBUG = "hono-auth-api:error:*"

# Silent mode
DEBUG = ""
```

### Quick Commands
```bash
# Start development with debug
npm run dev

# Start with verbose wrangler logs
npm run dev:debug

# Start test environment
npm run dev:test

# Start staging environment
npm run dev:staging

# Check current debug settings
cat .dev.vars.development | grep DEBUG

# Test API with debug
npm run test

# Unified comprehensive testing
npm run test:unified

# Quick smoke tests
npm run test:quick

# Debug information
npm run debug:info
```

## Summary

The debug system separates concerns:
- **Application debug patterns**: Controlled by `.vars` files
- **Wrangler verbosity**: Controlled by npm scripts with different log levels
- **No environment exports**: Everything uses `.vars` files or npm script parameters
- **No shell scripts needed**: All debug control through npm scripts
- **Dynamic enabling**: Through `c.env.DEBUG` in application code

This approach ensures compatibility with `wrangler dev` while providing flexible debug control for different environments.

For additional help:
1. Check the application logs
2. Review the debug namespace documentation in `src/utils/debug.js`
3. Use the debug information tool: `npm run debug:info`
4. Test debug configuration with different patterns
5. Consult the comprehensive test framework for debugging specific functionality
