<!-- Use this file to provide workspace-specific custom instructions to Copilot. For more details, see https://code.visualstudio.com/docs/copilot/copilot-customization#_use-a-githubcopilotinstructionsmd-file -->

# Hono Auth Worker - Copilot Instructions

## Project Overview
This is a comprehensive **Enterprise-grade Cloudflare Workers project** using Hono.js framework (JavaScript) with D1 database for JWT authentication system. Features include **Enterprise Audit System**, admin/role management, dynamic i18n, KV configuration management, comprehensive testing framework, multi-environment support, **token security hardening (blacklist + audit + logout-all)**, and production-ready architecture.

## 🎯 Key Technologies & Features
- **Framework**: Hono.js (JavaScript, NOT TypeScript)
- **Platform**: Cloudflare Workers
- **Database**: Cloudflare D1 (SQLite)
- **Authentication**: JWT with access & refresh tokens
- **Role Management**: Complete admin & role-based access control system
- **Password Hashing**: bcryptjs
- **Validation**: Zod schema validation with @hono/zod-validator
- **i18n**: Dynamic internationalization system with i18next (7 languages)
- **Development**: Wrangler CLI with multi-environment support
- **Testing**: Comprehensive modular testing framework (40+ test suites)
- **Code Quality**: ESLint integration with strict rules
- **Debug System**: Granular debug logging with debug package
- **Enterprise Audit System**: Complete audit logging with 4 main route groups (40+ endpoints)
- **KV Configuration Management**: Dynamic runtime configuration with super admin controls
- **Security**: XSS protection, rate limiting, comprehensive input validation
- **Multilingual Validation**: i18n-aware Zod validation with localized error messages

## 🏢 Enterprise Audit System
Complete enterprise-grade audit system with 4 main route groups:

### 📋 **Core Audit Routes** (`/api/audit/*`)
- Basic audit log access, search, filtering, and export
- Audit statistics and performance metrics
- Log management and data retention

### 🚀 **Advanced Audit Routes** (`/api/advanced-audit/*`)  
- Advanced analytics and reporting
- Data archival and compliance management
- Performance analysis and user activity insights

### 🔴 **Real-time Monitoring Routes** (`/api/realtime-monitoring/*`)
- Live system monitoring and health checks
- Threat detection and security analysis
- Alert system configuration and management

### 🛡️ **Security Incident Routes** (`/api/security-incident/*`)
- Security incident management and response
- Incident tracking and investigation tools
- Security analytics and threat assessment

## Multi-Environment Architecture
Support for 4 environments:

| Environment | Purpose | Port | Database | Config File |
|-------------|---------|------|----------|-------------|
| **Development** | Local development | 8787 | Local D1 | .dev.vars.development |
| **Test** | Automated testing | 8788 | Local D1 Test | .dev.vars.test |
| **Staging** | Pre-production | 8789 | Local D1 | .dev.vars.staging |
| **Production** | Live application | - | Cloudflare D1 | Secrets |

## Code Style Guidelines (ESLint Enforced)
- Use JavaScript ES6+ syntax with ES modules (`import`/`export`)
- **Indentation**: 2 spaces (enforced by ESLint)
- **Quotes**: Single quotes (enforced by ESLint)
- **Semicolons**: Required (enforced by ESLint)
- Prefer `const` over `let`, never use `var`
- Prefer arrow functions and async/await
- Follow RESTful API conventions
- Include proper error handling with try/catch
- Add meaningful comments for complex logic
- Use object destructuring where appropriate

## Validation with Zod
- **ALWAYS use Zod schemas** for input validation instead of manual validation
- Import schemas from `src/schemas/` directory
- Use `zValidator('json', schema)` middleware for route validation
- Access validated data with `c.req.valid('json')`
- Schemas available: `auth.js`, `user.js`, `i18n.js`

Example:
```javascript
import { zValidator } from '@hono/zod-validator';
import { loginSchema } from '../schemas/auth.js';

auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json'); // Type-safe validated data
});
```

## Dynamic i18n System
- **Fully dynamic language detection** from file system
- **Zero hard-coding** - languages auto-discovered from `src/i18n/locales/`
- **Language detection priority**: Query param `?lang=` → Accept-Language header → Default (en)
- **Adding languages**: Use `node tools/i18n/add-language-demo.js [code] "[name]"`
- **Testing i18n**: Use `node tools/i18n/test-dynamic-i18n.js`
- **Translation service**: Import from `src/i18n/service.js`

Supported languages: English (en), Vietnamese (vi), French (fr), Spanish (es), German (de), Japanese (ja), Thai (th)

## Database Schema
- **Core Tables**: `users`, `failed_login_limits`
- **Enterprise Audit Tables**: `audit_logs`, `audit_archive`, `security_incidents`
- **User roles**: `user`, `admin`, `super_admin` with role hierarchy enforcement
- **User statuses**: `active`, `inactive`, `suspended`
- **Audit System**: Complete audit logging with archival and retention policies
- **Security Incidents**: Incident tracking and management with threat assessment
- **Always use prepared statements** for SQL queries
- **Migration files**: Located in `migrations/` directory (5 migration files)
- **Environment-specific databases** with separate migration commands
- Handle database errors gracefully with proper error responses

## Wrangler Configuration Management
- **Security-first approach**: `wrangler.toml` contains sensitive database IDs and is NOT committed to git
- **Template system**: Use `wrangler.toml.example` (in git) → copy to `wrangler.toml` (local only)
- **Environment setup**: Run `cp wrangler.toml.example wrangler.toml` for initial setup
- **Local development**: Uses placeholder IDs with local D1 databases
- **Production databases**: Contains real database IDs, managed via `.gitignore`
- **Team collaboration**: Share template updates, never actual config with secrets
- **Troubleshooting**: If accidentally committed, use `git rm --cached wrangler.toml`

## Authentication & Security
- **JWT tokens**: 1 hour expiry (3600 seconds)
- **Refresh tokens**: 3 days expiry (259200 seconds)
- **Role-based access control**: Admin/role management with hierarchy enforcement
- **Rate limiting**: IP-based with `rateLimitService.js`
- **Password hashing**: bcryptjs with salt rounds
- **Input validation**: Use Zod schemas, never trust user input
- **SQL injection prevention**: Always use prepared statements
- **Environment secrets**: Use `.dev.vars` files locally, Cloudflare secrets in production

## Dynamic Configuration Management
- **Centralized Config**: All configuration accessed through `src/utils/dynamicConfig.js`
- **KV Configuration Service**: Enterprise-grade KV management with `kvConfigService.js`
- **No Parameter Passing**: Services automatically get configuration from environment
- **Configuration Functions**: 
  - `getJwtSettings(env)` - JWT secret and token expiration settings
  - `getFeatureFlags(env)` - Feature flags including rate limiting control
  - `getAppSettings(env)` - Application settings (name, version, environment)
- **Fallback System**: KV Store → Environment Variables → Default Values
- **BaseService Pattern**: All services inherit from `BaseService` for optimized config access
- **AuthService Usage**: No longer requires `jwtSecret` or `isRateLimitDisabled` parameters
  - Old: `authService.login(email, password, ipAddress, jwtSecret, isRateLimitDisabled)`
  - New: `authService.login(email, password, ipAddress)` (gets config internally)
- **Middleware Usage**: Auth middleware uses `getJwtSettings()` instead of `getJwtSecret()`
- **Cached Access**: BaseService provides cached configuration access for performance
- **KV Admin API**: Complete KV configuration management for super admin users

## API Response Format
Always return consistent JSON responses:
```javascript
// Success responses
{ "success": true, "data": {...}, "message": "Optional success message" }

// Error responses  
{ "success": false, "error": "Error message", "details": "Optional details" }

// i18n responses (localized)
{ "success": true, "data": {...}, "message": t('success.login') }
```

## Debug & Logging System
Use the `debug` package with organized namespaces controlled by environment variables:
- `hono-auth-api:*` - All debug output
- `hono-auth-api:routes:*` - Route-specific logging  
- `hono-auth-api:services:*` - Service layer logging
- `hono-auth-api:validation:*` - Validation logging
- `hono-auth-api:i18n:*` - i18n system logging
- `hono-auth-api:audit:*` - Enterprise audit system logging
- `hono-auth-api:security:*` - Security and incident logging

Debug configuration through `.vars` files (NOT environment exports):
```bash
# .dev.vars.development - Development (full debug)
DEBUG=hono-auth-api:*

# .dev.vars.staging - Staging (limited debug) 
DEBUG=hono-auth-api:error:*,hono-auth-api:security:*

# .dev.vars.test - Testing (full debug)
DEBUG=hono-auth-api:*

# To disable debug completely
DEBUG=""
```

**Important**: Do NOT use `export DEBUG=...` or `DEBUG=... command` as these don't work with `wrangler dev`. Use `.vars` files only.

### 🔧 Response Body Capture for Debugging
Super admin can control response body capture in middleware logging via KV setting:
- **KV Key**: `ENABLE_RESPONSE_BODY_CAPTURE` (default: `false`)
- **API**: `GET/PUT /api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE` (super_admin only)
- **CLI Tool**: `node tools/kv/kv-config-manager.js [get|enable|disable] ENABLE_RESPONSE_BODY_CAPTURE`
- **Universal KV Tool**: `node tools/kv/kv-config-manager.js <action> [key] [value] [options]`
- **Test**: `bash tests/scripts/test-response-capture.sh`
- **Security**: Only enable for debugging, disable after use

## File Structure
```
src/
├── index.js                    # Main application entry
├── constants/                  # Centralized constants & role management
│   ├── app.js                 # App-wide constants
│   ├── kvKeys.js              # KV configuration keys & defaults
│   ├── roles.js               # Role definitions, permissions, hierarchy
│   ├── routeRegistry.js       # Centralized route registry
│   ├── routeDefinitions.js    # Route definitions for all modules
│   ├── adminRoutes.js         # Admin route constants
│   ├── auditRoutes.js         # Audit route constants
│   ├── authRoutes.js          # Auth route constants
│   ├── kvAdminRoutes.js       # KV Admin route constants
│   ├── realtimeMonitoringRoutes.js # Real-time monitoring route constants
│   ├── securityIncidentRoutes.js # Security incident route constants
│   ├── systemRoutes.js        # System route constants
│   ├── translationRoutes.js   # Translation route constants
│   └── userRoutes.js          # User route constants
├── middleware/                 # Middleware functions
│   ├── auth.js                # JWT authentication
│   ├── authorization.js       # Role-based access control
│   ├── cors.js                # CORS configuration
│   ├── env.js                 # Environment validation
│   ├── error.js               # Error handling
│   ├── handleLog.js           # Logging middleware
│   ├── i18n.js                # i18n middleware for language detection
│   ├── i18nValidator.js       # i18n-aware validation
│   ├── kvConfig.js            # KV configuration service injection
│   └── unifiedRequestMiddleware.js # Unified request/response logging and audit
├── routes/                     # API route definitions
│   ├── api.js                 # Main API router
│   ├── admin.js               # Admin management routes
│   ├── auth.js                # Authentication routes
│   ├── user.js                # User management routes
│   ├── kvAdmin.js             # KV configuration management routes (super_admin only)
│   ├── 📊 **ENTERPRISE AUDIT SYSTEM** - 4 Main Route Groups (40+ endpoints)
│   ├── audit.js               # 📋 Core audit routes (/api/audit/*) - Basic logs, search, stats, export
│   ├── advancedAudit.js       # 🚀 Advanced audit routes (/api/advanced-audit/*) - Analytics, archival, compliance
│   ├── realtimeMonitoring.js  # 🔴 Real-time monitoring (/api/realtime-monitoring/*) - Live monitoring, threat detection
│   ├── securityIncident.js   # 🛡️ Security incidents (/api/security-incident/*) - Incident management, response
│   ├── favicon.js             # Favicon serving
│   ├── translations.js        # i18n demo routes
│   └── zodDemo.js             # Zod validation demos
├── schemas/                    # Zod validation schemas
│   ├── index.js               # Schema exports
│   ├── registry.js            # Schema registry management
│   ├── base.js                # Base schema definitions
│   ├── auth.js                # Authentication validation
│   ├── user.js                # User validation
│   ├── admin.js               # Admin validation schemas
│   ├── kv.js                  # KV configuration validation
│   ├── audit.js               # Audit system validation schemas
│   ├── advancedAudit.js       # Advanced audit validation
│   ├── auditRetention.js      # Audit retention validation
│   ├── realtimeMonitoring.js  # Real-time monitoring validation
│   ├── securityIncident.js   # Security incident validation
│   ├── i18n.js                # i18n validation
│   └── zodDemo.js             # Zod demo validation
├── services/                   # Business logic services
│   ├── baseService.js         # Base service with config caching
│   ├── authService.js         # Authentication operations
│   ├── userService.js         # User operations
│   ├── databaseService.js     # Database operations & health checks
│   ├── rateLimitService.js    # Rate limiting logic
│   ├── kvConfigService.js     # KV configuration management service
│   ├── 📊 **ENTERPRISE AUDIT SERVICES** - Complete audit system services
│   ├── auditLogService.js     # Core audit logging service
│   ├── auditAnalyticsService.js # Audit analytics and reporting
│   ├── auditArchivalService.js # Data archival and compliance
│   ├── auditRetentionService.js # Data retention policies
│   ├── auditExportService.js  # Audit data export functionality
│   ├── auditDashboardService.js # Audit dashboard and metrics
│   ├── auditMonitoringService.js # Real-time audit monitoring
│   ├── alertSystemService.js  # Alert system configuration
│   └── securityIncidentResponseService.js # Security incident management
├── services/                   # Business logic services
│   ├── baseService.js         # Base service with config caching
│   ├── authService.js         # Authentication operations
│   ├── userService.js         # User operations
│   ├── databaseService.js     # Database operations & health checks
│   ├── rateLimitService.js    # Rate limiting logic
│   ├── kvConfigService.js     # KV configuration management service
│   ├── 📊 **ENTERPRISE AUDIT SERVICES** - Complete audit system services
│   ├── auditLogService.js     # Core audit logging service
│   ├── auditAnalyticsService.js # Audit analytics and reporting
│   ├── auditArchivalService.js # Data archival and compliance
│   ├── auditRetentionService.js # Data retention policies
│   ├── auditExportService.js  # Audit data export functionality
│   ├── auditDashboardService.js # Audit dashboard and metrics
│   ├── auditMonitoringService.js # Real-time audit monitoring
│   ├── alertSystemService.js  # Alert system configuration
│   └── securityIncidentResponseService.js # Security incident management
├── i18n/                      # Dynamic i18n system
│   ├── index.js               # Main exports
│   ├── config.js              # i18next configuration
│   ├── loader.js              # Dynamic translation loader
│   ├── languages.js           # Language management
│   ├── service.js             # Translation service
│   └── locales/               # Translation files (auto-detected)
│       ├── en.js              # English (default)
│       ├── vi.js              # Vietnamese
│       ├── fr.js              # French
│       ├── es.js              # Spanish
│       ├── de.js              # German
│       ├── ja.js              # Japanese
│       └── th.js              # Thai
├── assets/                    # Static assets
│   ├── favicon.ico           # Favicon files
│   ├── favicon.png           
│   └── icon-192.png          
└── utils/                     # Utility functions
    ├── debug.js               # Debug configuration
    ├── env.js                 # Environment utilities
    ├── helpers.js             # General helpers
    ├── dynamicConfig.js       # Dynamic configuration management
    └── jwt.js                 # JWT utilities

tests/                          # Comprehensive testing framework
├── README.md                  # Complete test documentation
├── mainMenu.js                # Interactive test menu
├── unifiedTestSuite.js        # All-in-one comprehensive testing
├── systemTest.js              # System functionality tests
├── authTest.js                # Authentication tests
├── adminUserTest.js           # Admin User Role tests
├── regularUserTest.js         # Regular User Role tests
├── superAdminUserTest.js      # Super Admin User Role tests
├── kvAdminTest.js             # KV configuration management tests (super_admin only)
├── securityTest.js            # Security tests
├── comprehensiveI18nTest.js   # Comprehensive i18n & translation tests
├── performanceTest.js         # Performance tests
├── integrationTest.js         # Integration tests
├── validationTest.js          # Validation tests
├── quickTest.js               # Quick smoke tests
├── roleTest.js                # Role-based access control tests
├── 🔍 **ENTERPRISE AUDIT TESTING SUITE** - Complete audit system testing
├── auditSystemTest.js         # Core audit system functionality
├── simpleAuditTest.js         # Basic audit tests
├── advancedAuditComprehensiveTest.js # Advanced audit features
├── realtimeMonitoringTest.js  # Real-time monitoring system
├── securityIncidentTest.js   # Security incident management
├── auditPerformanceTest.js   # Audit system performance tests
├── auditLogServiceIntegrationTest.js # Audit log service integration
├── archivalServiceTest.js    # Data archival functionality
├── kvAuditConfigTest.js      # KV audit configuration tests
├── alertSystemConfigIntegrationTest.js # Alert system integration
├── 🌍 **i18n VALIDATION TESTING SUITE** - Multilingual validation testing
├── i18nValidatorExtensionTest.js # i18n validator system tests
├── errorHandlingTest.js # Comprehensive error handling tests
├── optimizedServiceTest.js # Service optimization tests
├── zodValidationTest.js # Zod schema validation tests
├── scripts/                   # Test automation scripts
│   ├── README.md              # Test scripts documentation
│   ├── CURL_COMMANDS.md       # Manual testing commands
│   ├── admin_user.sh               # Admin User Role curl tests
│   ├── regular_user.sh        # Regular User Role curl tests
│   ├── super_admin_user.sh         # Super Admin User Role curl tests
│   ├── test_all_roles.sh      # Comprehensive role testing
│   ├── run-all-tests.sh       # Complete test runner (detailed)
│   ├── run-all-tests-quick.sh # Quick test runner (minimal)
│   ├── test-rbac.sh           # RBAC testing
│   ├── test-debug.sh          # Debug environment tests
│   └── test-response-capture.sh # Response body capture testing
├── utils/                     # Test utilities & helpers
│   ├── createTestAdminUsers.js # Test admin user creation
│   ├── setupTestUsers.js      # Test user setup utilities
│   ├── testAssertions.js      # Custom test assertions
│   ├── testClient.js          # HTTP client for testing
│   ├── testData.js            # Test data management
│   ├── testDataSetup.js       # Test data setup utilities
│   └── testLogger.js          # Test logging utilities
├── config/                    # Test configuration
├── templates/                 # Test templates
├── integration/               # Integration test suites
│   └── components.js          # Component integration tests
├── validation/                # Validation test suites
│   └── zodValidation.js       # Zod validation tests
├── init                       # Initialization files
│   └── reset.sql              # Initialization for testing
│   └── kv_config.json         # cloudflare KV configuration for testing
└── demo-new-structure.sh      # Demo script for test structure

scripts/                       # Development & setup scripts
├── setup-dev.sh              # Development environment setup
├── setup-test.sh             # Test environment setup
├── setup-staging.sh          # Staging environment setup
├── dev-debug.sh              # Development debug mode
└── staging-debug.sh          # Staging debug mode
```

## Testing Framework
- **Modular test structure** in `tests/` directory
- **Interactive test menu**: `npm run test` or `node tests/mainMenu.js` 
- **Unified test suite**: `npm run test:unified` for comprehensive testing
- **Direct test execution**: Run individual test files directly
- **Context-specific tests**: 
  - `npm run test:system` - Core system functionality
  - `npm run test:auth` - Authentication tests
  - `npm run test:regular_user` - Regular User Role tests
  - `npm run test:admin_user` - Admin User Role tests
  - `npm run test:super_admin_user` - Super Admin User Role tests
  - `npm run test:kv_admin` - KV configuration management tests (super_admin only)
  - `npm run test:security` - Security tests
  - `npm run test:comprehensive:i18n` - Comprehensive i18n & translation tests
  - `npm run test:role` - Role-based access control tests
  - `npm run test:performance` - Performance tests
  - `npm run test:integration` - Integration tests
  - `npm run test:validation` - Zod validation tests
  - `npm run test:quick` - Fast smoke tests
- **Enterprise Audit Testing Suite**:
  - `npm run test:audit:system` - Core audit system functionality
  - `npm run test:audit:simple` - Basic audit tests
  - `npm run test:audit:advanced` - Advanced audit analytics
  - `npm run test:audit:perf` - Audit performance testing
  - `npm run test:audit:integration` - Audit integration tests
  - `npm run test:security:incident` - Security incident management tests
  - `npm run test:realtime:monitoring` - Real-time monitoring tests
- **i18n & Multilingual Validation Testing**:
  - `npm run test:i18n:validator` - i18n validator extension tests
  - `npm run test:multilang_validation` - Multilingual validation error tests
  - `npm run test:xss:all` - XSS protection tests
- **Individual test files**: Each test context has its own file
  - `systemTest.js` - Core system functionality
  - `authTest.js` - Authentication tests
  - `adminUserTest.js` - Admin User Role tests
  - `regularUserTest.js` - Regular User Role tests
  - `superAdminUserTest.js` - Super Admin User Role tests
  - `kvAdminTest.js` - KV configuration management tests (super_admin only)
  - `securityTest.js` - Security tests
  - `comprehensiveI18nTest.js` - Comprehensive i18n & translation tests
  - `performanceTest.js` - Performance tests
  - `integrationTest.js` - Integration tests
  - `validationTest.js` - Zod validation tests
  - `quickTest.js` - Fast smoke tests
  - `roleTest.js` - Role-based access control tests
  - `unifiedTestSuite.js` - All-in-one comprehensive testing
  - **Enterprise Audit Test Files**:
    - `auditSystemTest.js` - Core audit system functionality
    - `simpleAuditTest.js` - Basic audit tests
    - `advancedAuditComprehensiveTest.js` - Advanced audit features
    - `realtimeMonitoringTest.js` - Real-time monitoring system
    - `securityIncidentTest.js` - Security incident management
    - `auditPerformanceTest.js` - Audit system performance tests
    - `auditLogServiceIntegrationTest.js` - Audit log service integration
    - `archivalServiceTest.js` - Data archival functionality
    - `kvAuditConfigTest.js` - KV audit configuration tests
    - `alertSystemConfigIntegrationTest.js` - Alert system integration
  - **i18n & Multilingual Validation Test Files**:
    - `i18nValidatorExtensionTest.js` - i18n validator system tests
    - `comprehensiveI18nTest.js` - Comprehensive i18n functionality tests
    - `multiLanguageValidationErrorTest.js` - Multilingual error message tests
    - `xssSecurityTest.js` - XSS protection and security tests
    - `errorHandlingTest.js` - Comprehensive error handling tests
    - `optimizedServiceTest.js` - Service optimization tests
    - `zodValidationTest.js` - Zod schema validation tests
- **Role-specific test scripts** in `tests/scripts/`:
  - `admin_user.sh` - Admin User Role tests
  - `regular_user.sh` - Regular User Role tests
  - `super_admin_user.sh` - Super Admin User Role tests
  - `test_all_roles.sh` - Comprehensive role testing
  - `run-all-tests.sh` - Complete test suite runner (detailed)
  - `run-all-tests-quick.sh` - Quick test runner (minimal output)
  - `test-rbac.sh` - RBAC testing
  - `test-debug.sh` - Debug environment tests
  - `test-response-capture.sh` - Response body capture testing
- **Test utilities** in `tests/utils/` for shared testing functionality
- **Integration tests** in `tests/integration/` for component and i18n testing
- **Validation tests** in `tests/validation/` for Zod schema testing
- **Support files**:
  - `tests/init/reset.sql` - Database initialization for testing
  - `tests/init/kv_config.json` - Cloudflare KV configuration for testing
  - `tests/scripts/CURL_COMMANDS.md` - Manual testing commands

## Development Workflow
1. **Setup environment**: `npm run setup:dev`
2. **Run database migrations**: `npm run db:migrate`
3. **Start development server**: `npm run dev` (port 8787)
4. **Interactive test menu**: `npm run test` or `node tests/mainMenu.js`
5. **Run specific tests**: 
   - `npm run test:auth` - Authentication tests
   - `npm run test:system` - System tests  
   - `npm run test:regular_user` - Regular User Role tests
   - `npm run test:admin_user` - Admin User Role tests
   - `npm run test:super_admin_user` - Super Admin User Role tests
   - `npm run test:kv_admin` - KV configuration management tests (super_admin only)
   - `npm run test:unified` - Comprehensive unified test suite
   - `npm run test:quick` - Quick smoke tests
   - `npm run test:audit:system` - Core audit system functionality
   - `npm run test:audit:advanced` - Advanced audit analytics
   - `npm run test:security:incident` - Security incident management tests
   - `npm run test:realtime:monitoring` - Real-time monitoring tests
   - `npm run test:i18n:validator` - i18n validator extension tests
   - `npm run test:multilang_validation` - Multilingual validation error tests
6. **Lint code**: `npm run lint` or `npm run lint:fix`
7. **Debug mode**: Use debug scripts like `npm run debug:dev` or `bash scripts/dev-debug.sh`
8. **Test automation**: Use `bash tests/scripts/run-all-tests.sh` for complete testing

**Debug Control**: Edit DEBUG variable in `.dev.vars.development`, `.dev.vars.test`, or `.dev.vars.staging` files to control debug output.

## Production Deployment
1. **Setup production database**: `npm run db:create:prod`
2. **Set secrets**: `npm run secret:put:prod`
3. **Run production migrations**: `npm run db:migrate:prod`
4. **Deploy**: `npm run deploy`

## When Making Changes
1. **Always validate input with Zod schemas** - never use manual validation
2. **Use the debug system** for logging instead of console.log - control via `.vars` files
3. **Use dynamic configuration** - Access config via `getJwtSettings()`, `getFeatureFlags()` instead of passing parameters
4. **Test with multiple environments** (dev, test, staging)
5. **Run ESLint** to ensure code quality: `npm run lint:check`
6. **Test i18n functionality** if modifying user-facing messages
7. **Update schemas** in `src/schemas/` when changing API contracts
8. **Run comprehensive tests** before deployment: 
   - `npm run test:unified` for complete testing
   - `bash tests/scripts/run-all-tests.sh` for detailed test runner
   - `npm run test:quick` for fast validation
9. **Consider security implications** - validate all inputs, use prepared statements
10. **Maintain consistent API response format** with success/error structure
11. **Document new features** in relevant markdown files
12. **Test role-based access control** when modifying user/admin functionality
13. **Validate database operations** with proper prepared statements
14. **Use BaseService inheritance** for optimized configuration access in new services

**Dynamic Config Notes**: 
- Services inherit from `BaseService` get automatic config caching
- Never pass `jwtSecret` or feature flags as parameters - use dynamic config functions
- Auth middleware uses `getJwtSettings()` instead of `getJwtSecret()`
- All services automatically access their needed configuration from environment

**Debug Notes**: 
- Change DEBUG patterns in `.vars` files, not in code or scripts
- Use `c.env.DEBUG` in application code, never `process.env.DEBUG`
- Debug scripts only control wrangler log levels, not debug patterns

## Admin & Role Management System
- **Role System**: Complete role-based access control with `user`, `admin`, `super_admin`
- **Permission System**: Permission-based endpoint access with role hierarchy enforcement
- **Role Constants**: Centralized role management in `src/constants/roles.js`
- **Admin API**: Full admin management API with 9 endpoints for user management
- **Security Features**: Role hierarchy validation, self-protection mechanisms, input validation
- **Role-based Data Filtering**: Admin sees limited data, super_admin sees all data

### Admin API Endpoints
- `GET /api/admin/users` - User list with role-based filtering
- `POST /api/admin/users` - Create users (role restrictions apply)
- `PUT /api/admin/users/:id` - Update user info (excluding role changes)
- `DELETE /api/admin/users/:id` - Delete users (role hierarchy enforced)
- `PUT /api/admin/users/:id/role` - Change user roles (dedicated endpoint)
- `GET /api/admin/stats` - System statistics
- `GET /api/admin/dashboard` - Admin dashboard with role-filtered data
- `GET /api/admin/system-health` - System health check with performance metrics

## KV Configuration Management System
- **KV Configuration Service**: Enterprise-grade KV management with `kvConfigService.js`
- **Super Admin Only**: All KV configuration endpoints restricted to `super_admin` role
- **Dynamic Configuration**: Runtime configuration management without deployment
- **KV Admin API**: Complete KV configuration management with CRUD operations
- **Configuration Keys**: Centralized in `src/constants/kvKeys.js` with defaults
- **Validation**: Comprehensive Zod schema validation for all KV operations
- **Cache Management**: Configuration cache clearing and optimization
- **Audit Logging**: All KV configuration changes are logged

### KV Admin API Endpoints
- `GET /api/kv-admin/configs` - Get all configurations
- `GET /api/kv-admin/configs/defaults` - Get default configurations
- `GET /api/kv-admin/configs/env-comparison` - Compare ENV vs KV values
- `GET /api/kv-admin/configs/:key` - Get specific configuration
- `PUT /api/kv-admin/configs/:key` - Update configuration
- `POST /api/kv-admin/configs/batch` - Batch update configurations
- `DELETE /api/kv-admin/configs/:key` - Reset configuration to default
- `POST /api/kv-admin/configs/cache/clear` - Clear configuration cache

### Role Management Best Practices
1. **Use role constants** from `src/constants/roles.js` instead of hard-coding strings
2. **Check permissions** with `hasPermission()` function instead of role string comparisons
3. **Validate role hierarchy** with `canManageUser()` before role operations
4. **Use dynamic role validation** in Zod schemas with `getAllRoles()`
5. **Test role-based functionality** with dedicated role test files

## Tools & Utilities
- **i18n management**: `node tools/i18n.js` (main tool)
- **Language addition**: `node tools/i18n/add-language-demo.js`
- **i18n testing**: `node tools/i18n/test-dynamic-i18n.js`
- **Health check**: `node tools/tools-health-check.js`
- **Universal KV Config**: `node tools/kv/kv-config-manager.js <action> [key] [value] [options]`

## Key Development Guidelines

### 🏢 Enterprise Features
1. **Use Enterprise Audit System** for all user actions and system events
2. **Implement multilingual validation** with i18n-aware Zod schemas
3. **Follow BaseService pattern** for all new services (inherits config caching)
4. **Use route constants** from `src/constants/*Routes.js` files
5. **Implement comprehensive logging** with audit trails for compliance

### 🔒 Security Best Practices
1. **Always validate input** with Zod schemas from `src/schemas/`
2. **Use role hierarchy enforcement** with `canManageUser()` functions
3. **Implement audit logging** for all sensitive operations
4. **Use prepared statements** for all database operations
5. **Validate XSS protection** for user-generated content

### 🌍 Internationalization & Validation
1. **Use dynamic i18n system** - languages auto-detected from filesystem
2. **Implement multilingual validation errors** with i18n-aware Zod schemas
3. **Test multilingual functionality** with dedicated test suites
4. **Support 7 languages**: EN, VI, FR, ES, DE, JA, TH (expandable)

### 🧪 Testing Requirements
1. **Write comprehensive tests** for all new features
2. **Use role-based testing** for access control validation
3. **Test multilingual validation** errors in supported languages
4. **Include performance testing** for audit system operations
5. **Test enterprise audit functionality** with dedicated test suites

### 📊 Performance & Monitoring
1. **Use BaseService caching** for configuration access
2. **Implement real-time monitoring** for system health
3. **Use audit analytics** for performance insights
4. **Monitor security incidents** with alert systems

Remember: This is a **production-ready enterprise application** with comprehensive testing, security, admin/role management, multilingual validation, enterprise audit system, and internationalization. Always follow the established patterns and use the provided tools and frameworks.
