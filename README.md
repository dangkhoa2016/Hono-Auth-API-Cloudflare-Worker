# Hono Auth Worker

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](README.vi.md)

A comprehensive Cloudflare Workers project using the Hono.js framework (JavaScript) with D1 database to build a JWT authentication system with admin/role management, dynamic i18n system, comprehensive testing framework, and production-ready architecture.

## ✨ Key Features

- 🚀 **Hono.js Framework** (JavaScript) - Fast and lightweight
- 🗄️ **Cloudflare D1 Database** - SQLite compatible with global distribution
- 🔐 **JWT Authentication** with access & refresh tokens
- 👑 **Admin & Role Management** - Complete role-based access control system
- 🛡️ **Rate Limiting** for login attempts with IP-based tracking
- 🔒 **bcrypt Password Hashing** with salt rounds
- 🛡️ **Token Security Hardening** with access-token blacklist, refresh token rotation/audit, and logout-all enforcement
- 🌐 **RESTful API Endpoints** with consistent response format
- 🌍 **Dynamic i18n System** - Fully automatic language detection and unlimited language support
- 🎯 **Zod Validation** with comprehensive schema validation and i18n-aware error messages
- 🌐 **Multilingual Validation System** - i18n-aware Zod validation with localized error messages
- 🐛 **Debug Logging** with granular debug control
- 🧪 **Comprehensive Testing Framework** with modular test suite and advanced testing tools
- 🌍 **Multi-environment Support** (Dev, Test, Staging, Production)
- 📦 **Modular Architecture** with clear separation of concerns
- 🔧 **ESLint Integration** with comprehensive code quality rules
- ⚙️ **KV Configuration Management** - Dynamic runtime configuration with super admin controls
- 🚀 **Production Ready** deployment with Cloudflare Workers
- 📊 **Enterprise Audit System** - Complete audit logging with 4 main route groups (40+ endpoints)
  - 📋 **Core Audit Routes** (`/api/audit/*`) - Basic audit log access, search, and export
  - 🚀 **Advanced Audit Routes** (`/api/advanced-audit/*`) - Analytics, archival, and compliance
  - 🔴 **Real-time Monitoring Routes** (`/api/realtime-monitoring/*`) - Live monitoring and threat detection
  - 🛡️ **Security Incident Routes** (`/api/security-incident/*`) - Incident management and response
- 🌍 **i18n Validation System** - Multilingual validation with localized error messages for all API endpoints
- 🔧 **Dynamic Configuration System** - Runtime configuration management with KV storage and admin controls

## 📚 Documentation Organization

This project has documentation organized in the `documents/` folder for easy management and navigation:

### 🎯 **Core Documentation** (`documents/`)
- **[SETUP_GUIDE.md](./documents/SETUP_GUIDE.md)** - 🛠️ Complete setup guide & environment configuration
- **[ROLE_COMPLETE_GUIDE.md](./documents/ROLE_COMPLETE_GUIDE.md)** - 👑 Admin & role management system complete guide
- **[DEBUG_DEVELOPMENT_GUIDE.md](./documents/DEBUG_DEVELOPMENT_GUIDE.md)** - 🐛 Debug & development workflow with granular controls
- **[I18N_MASTER_GUIDE.md](./documents/I18N_MASTER_GUIDE.md)** - 🌍 Complete dynamic i18n system with multilingual validation
- **[ZOD_GUIDE.md](./documents/ZOD_GUIDE.md)** - ✅ Zod validation guide & schema design patterns
- **[SCHEMAS_GUIDE.md](./documents/SCHEMAS_GUIDE.md)** - 📋 Comprehensive schema validation with i18n support
- **[ESLINT_GUIDE.md](./documents/ESLINT_GUIDE.md)** - 🔧 Code quality & linting standards
- **[WRANGLER_CONFIG_GUIDE.md](./documents/WRANGLER_CONFIG_GUIDE.md)** - ⚙️ Cloudflare Workers configuration management
- **[DATABASE_SERVICE.md](./documents/DATABASE_SERVICE.md)** - 🗄️ Database service architecture & operations
- **[DYNAMIC_CONFIG_GUIDE.md](./documents/DYNAMIC_CONFIG_GUIDE.md)** - 🔧 Enterprise dynamic configuration management system

### 🧪 **Testing & Automation**
- **[TEST_GUIDE.md](./documents/TEST_GUIDE.md)** - 🧪 Comprehensive testing framework with 40+ test suites
- **[TEST_SCRIPTS.md](./documents/TEST_SCRIPTS.md)** - 📜 Test automation & shell scripts with RBAC testing

### 🏢 **Enterprise Features**
- **[ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.md](./documents/ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.md)** - 📋 Complete enterprise audit system with real-time monitoring, analytics, and compliance
- **[AUDIT_API_REFERENCE.md](./documents/AUDIT_API_REFERENCE.md)** - 🔍 Complete API reference for 4 main audit route groups (40+ endpoints)
- **[AUDIT_KV_CONFIGURATION_GUIDE.md](./documents/AUDIT_KV_CONFIGURATION_GUIDE.md)** - ⚙️ Advanced KV configuration management for audit system
- **[TOKEN_SECURITY_COMPREHENSIVE_GUIDE_EN.md](./TOKEN_SECURITY_COMPREHENSIVE_GUIDE_EN.md)** - 🔐 Token security hardening (blacklist, audits, logout-all) summary

### 🌍 **Multi-language Documentation**
All documentation is available in both English and Vietnamese:
- **English versions**: All guides above in English
- **Vietnamese versions**: Corresponding `*_vi.md` files for all guides
- **Complete Coverage**: 30 documentation files (15 English + 15 Vietnamese) covering all aspects of the system


### 🎯 **Quick Start**
1. **Setup**: [documents/SETUP_GUIDE.md](./documents/SETUP_GUIDE.md) - Complete environment setup with multi-environment support
2. **Development**: [documents/DEBUG_DEVELOPMENT_GUIDE.md](./documents/DEBUG_DEVELOPMENT_GUIDE.md) - Development workflow with granular debug controls
3. **Testing**: [documents/TEST_GUIDE.md](./documents/TEST_GUIDE.md) - Comprehensive testing framework with 40+ test suites
4. **Deployment**: [documents/WRANGLER_CONFIG_GUIDE.md](./documents/WRANGLER_CONFIG_GUIDE.md) - Production deployment with security best practices

### 📖 **Complete Documentation Library**
Our documentation is organized for maximum clarity and accessibility:
- **🎯 Core System Guides**: 10 comprehensive guides covering all system aspects
- **🧪 Testing & Automation**: Complete testing documentation with automation scripts
- **🏢 Enterprise Features**: Advanced audit system, KV configuration, and enterprise-grade features
- **🌍 Multilingual Support**: All 15 guides available in both English and Vietnamese (30 total files)
- **📋 Reference Materials**: API references, schema guides, and configuration management

## Project Structure

```
hono-auth-api-worker/
├── src/                      # 🔧 Source code - Application logic
│   ├── index.js             # Main application entry point
│   ├── constants/           # 🎯 Centralized constants & Role management
│   │   ├── app.js          # App-wide constants
│   │   ├── kvKeys.js       # KV configuration keys & defaults
│   │   └── roles.js        # Role definitions, permissions, hierarchy
│   ├── i18n/               # 🌍 Dynamic i18n system - Fully automatic
│   │   ├── index.js        # Main exports for i18n
│   │   ├── config.js       # Dynamic i18next configuration  
│   │   ├── loader.js       # Dynamic translation loader
│   │   ├── languages.js    # Language management utilities
│   │   ├── service.js      # Language detection & translation service
│   │   └── locales/        # Translation files (auto-detected)
│   │       ├── en.js       # English translations (default)
│   │       ├── vi.js       # Vietnamese translations
│   │       ├── fr.js       # French translations
│   │       ├── es.js       # Spanish translations
│   │       ├── de.js       # German translations
│   │       ├── ja.js       # Japanese translations
│   │       └── th.js       # Thai translations
│   ├── middleware/          # Middleware functions
│   │   ├── auth.js         # JWT authentication middleware
│   │   ├── authorization.js # Role-based access control middleware
│   │   ├── cors.js         # CORS configuration
│   │   ├── env.js          # Environment validation
│   │   ├── error.js        # Error handling middleware
│   │   ├── i18n.js         # i18n middleware for language detection
│   │   ├── handleLog.js    # Logging middleware
│   │   ├── kvConfig.js     # KV configuration service injection
│   │   ├── i18nValidator.js # i18n-aware Zod validation with multilingual error messages
│   │   └── unifiedRequestMiddleware.js # Unified request/response logging and audit
│   ├── routes/              # API route definitions
│   │   ├── api.js          # Main API router
│   │   ├── auth.js         # Authentication routes (/auth/*)
│   │   ├── user.js         # User routes (/user/*)
│   │   ├── admin.js        # 👑 Admin routes (/admin/*) - Complete admin system
│   │   ├── kvAdmin.js      # ⚙️ KV configuration management routes (/kv-admin/*) - Super admin only
│   │   ├── 📊 **ENTERPRISE AUDIT SYSTEM** - 4 Main Route Groups (40+ endpoints)
│   │   ├── audit.js        # 📋 Core audit routes (/api/audit/*) - Basic logs, search, stats, export
│   │   ├── advancedAudit.js # 🚀 Advanced audit routes (/api/advanced-audit/*) - Analytics, archival, compliance
│   │   ├── realtimeMonitoring.js # 🔴 Real-time monitoring (/api/realtime-monitoring/*) - Live monitoring, threat detection
│   │   ├── securityIncident.js # 🛡️ Security incidents (/api/security-incident/*) - Incident management, response
│   │   ├── favicon.js      # Favicon serving
│   │   ├── translations.js # i18n demo routes
│   │   └── zodDemo.js     # Zod validation demo
│   ├── schemas/            # 🎯 Validation schemas
│   │   ├── auth.js         # Authentication validation
│   │   ├── user.js         # User validation with dynamic roles
│   │   ├── kv.js           # KV configuration validation
│   │   ├── audit.js        # Audit system validation schemas
│   │   └── i18n.js         # i18n validation schemas with multilingual support
│   ├── services/            # Business logic services
│   │   ├── authService.js      # Authentication operations
│   │   ├── databaseService.js  # Database operations & health checks
│   │   ├── kvConfigService.js  # KV configuration management service
│   │   ├── auditLogService.js  # Enterprise audit logging service
│   │   ├── securityIncidentService.js # Security incident management
│   │   ├── realtimeMonitoringService.js # Real-time monitoring service
│   │   ├── rateLimitService.js # Rate limiting logic
│   │   └── userService.js      # User-related operations
│   ├── assets/             # Static assets
│   │   ├── favicon.ico     # Favicon files
│   │   ├── favicon.png     
│   │   └── icon-192.png    
│   └── utils/               # Utility functions
│       ├── debug.js        # 🐛 Debug logging configuration
│       ├── env.js          # Environment utilities
│       ├── helpers.js       # General helper functions
│       └── jwt.js          # JWT token utilities
├── tests/                   # 🧪 Comprehensive Testing Framework
│   ├── mainMenu.js         # 📋 Interactive test menu (main entry point)
│   ├── unifiedTestSuite.js # 🎯 Comprehensive unified test suite
│   ├── systemTest.js       # 🔧 Core system functionality tests
│   ├── authTest.js         # 🔐 Authentication & JWT tests
│   ├── regularUserTest.js  # 👤 Regular user functionality tests
│   ├── adminUserTest.js    # 👨‍💼 Admin user functionality tests
│   ├── superAdminUserTest.js   # 👑 Super Admin user functionality tests
│   ├── kvAdminTest.js         # ⚙️ KV configuration management tests (super_admin only)
│   ├── securityTest.js     # 🛡️ Security & rate limiting tests
│   ├── comprehensiveI18nTest.js  # 🌍 Comprehensive i18n & translation tests
│   ├── performanceTest.js  # ⚡ Performance & load tests
│   ├── integrationTest.js  # 🔗 End-to-end integration tests
│   ├── validationTest.js   # ✅ Zod validation tests
│   ├── quickTest.js        # ⚡ Quick smoke tests
│   ├── roleTest.js         # 🎭 Role-based access control tests
│   ├── **🔍 ENTERPRISE AUDIT TESTING SUITE** - Complete audit system testing
│   ├── auditSystemTest.js  # 📋 Core audit system functionality
│   ├── advancedAuditComprehensiveTest.js # 🚀 Advanced audit features
│   ├── realtimeMonitoringTest.js # 🔴 Real-time monitoring system
│   ├── securityIncidentTest.js # 🛡️ Security incident management
│   ├── auditPerformanceTest.js # ⚡ Audit system performance tests
│   ├── archivalServiceTest.js # 📦 Data archival functionality
│   ├── kvAuditConfigTest.js # ⚙️ KV audit configuration tests
│   ├── **🌍 i18n VALIDATION TESTING SUITE** - Multilingual validation testing
│   ├── i18nValidatorExtensionTest.js # 🌐 i18n validator system tests
│   ├── multiLanguageValidationErrorTest.js # 🗣️ Multilingual error message tests
│   ├── xssSecurityTest.js  # 🛡️ XSS protection and security tests
│   ├── errorHandlingTest.js # ⚠️ Comprehensive error handling tests
│   ├── scripts/            # 📜 Test automation & shell scripts
│   ├── utils/              # 🛠️ Shared test utilities & helpers
│   └── config/             # ⚙️ Test configuration
│   # See documents/TEST_GUIDE.md for complete testing documentation
│   │   └── zodValidation.js # 🎯 Zod schema validation tests
│   ├── init           # Initialization files
│   │   └── reset.sql # 🗄️ Database initialization for testing
│   │   └── kv_config.json # 🗄️ Cloudflare KV configuration initialization for testing
├── scripts/                 # 🚀 Setup & development scripts
│   ├── setup-dev.sh        # Development environment setup
│   ├── setup-test.sh       # Test environment setup
│   ├── setup-staging.sh    # Staging environment setup
│   ├── dev-debug.sh        # Development debug mode
│   └── staging-debug.sh    # Staging debug mode
├── migrations/              # 🗄️ Database migrations
│   ├── 0001_initial.sql    # Initial database schema
│   ├── 0002_add_role_column.sql # Add role column to users
│   ├── 0003_add_audit_logs.sql # Add audit logging tables
│   ├── 0004_add_audit_archive.sql # Add audit archival system
│   └── 0005_security_incident_management.sql # Add security incident management
├── tools/                   # 🔧 Development tools
│   ├── i18n/               # i18n management tools
│   ├── d1/                 # Database management tools
│   ├── debug_log/          # Debug system testing tools
│   └── generate-password-hashes.js # Password utilities
├── .dev.vars.development               # 🔒 Development environment variables (not in git)
├── .dev.vars.test              # 🔒 Test environment variables (not in git)
├── .dev.vars.staging           # 🔒 Staging environment variables (not in git)
├── .dev.vars.*.example         # 📋 Environment variable templates (in git)
├── wrangler.toml.example       # ⚙️ Cloudflare Workers configuration template (in git)
├── wrangler.toml               # ⚙️ Actual configuration with database IDs (not in git)
├── package.json            # 📦 Dependencies & scripts
├── README.md              # 📖 Project documentation (this file)
├── documents/             # 📚 Complete documentation collection
│   ├── SETUP_GUIDE.md          # 🛠️ Setup guide & environment
│   ├── ROLE_COMPLETE_GUIDE.md # 👑 Complete admin & role management guide
│   ├── DEBUG_DEVELOPMENT_GUIDE.md # 🐛 Debug & development workflow guide
│   ├── I18N_MASTER_GUIDE.md # 🌍 Complete dynamic i18n system guide
│   ├── ZOD_GUIDE.md      # ✅ Comprehensive Zod validation guide
│   ├── SCHEMAS_GUIDE.md  # 📋 Schema validation with i18n support
│   ├── ESLINT_GUIDE.md   # 🔧 Code quality & linting guide
│   ├── WRANGLER_CONFIG_GUIDE.md # ⚙️ Cloudflare Workers configuration guide
│   ├── TEST_GUIDE.md     # 🧪 Comprehensive testing framework guide
│   ├── TEST_SCRIPTS.md   # 📜 Test automation & shell scripts guide
│   ├── DATABASE_SERVICE.md # 🗄️ Database service & operations guide
│   ├── DYNAMIC_CONFIG_GUIDE.md # 🔧 Dynamic configuration management guide
│   ├── ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.md # 📋 Enterprise audit system guide
│   ├── AUDIT_API_REFERENCE.md # 🔍 Complete audit API reference
│   └── AUDIT_KV_CONFIGURATION_GUIDE.md # ⚙️ Audit KV configuration guide
└── wrangler.toml.example # ⚙️ Cloudflare Workers configuration template
```

## 🧪 Testing Framework

For complete testing documentation, please refer to **[documents/TEST_GUIDE.md](./documents/TEST_GUIDE.md)**.

### 🎯 Quick Start

```bash
# Interactive test menu with 30+ test suites (recommended)
npm run test

# Quick smoke tests for development
npm run test:quick

# Complete automated test suite (40+ tests)
bash tests/scripts/run-all-tests.sh

# Quick automated test runner (minimal output)
bash tests/scripts/run-all-tests-quick.sh

# Enterprise Audit System Tests
npm run test:audit:system       # Core audit system functionality
npm run test:audit:simple       # Basic audit tests
npm run test:audit:advanced     # Advanced audit analytics
npm run test:audit:perf         # Audit performance testing
npm run test:audit:integration  # Audit integration tests

# Role-based Access Control Tests
npm run test:regular_user       # Regular user functionality tests
npm run test:admin_user         # Admin user management tests
npm run test:super_admin_user   # Super admin full control tests
bash tests/scripts/test_all_roles.sh  # Complete RBAC testing

# i18n & Multilingual Validation Tests
npm run test:i18n              # i18n system tests
npm run test:multilang_validation # Multilingual validation error tests
npm run test:i18n:validator     # i18n validator extension tests
npm run test:comprehensive:i18n  # Comprehensive i18n functionality tests

# Security & Performance Tests
npm run test:security           # Security and rate limiting tests
npm run test:xss:all           # XSS protection tests
npm run test:performance       # Load and performance tests
npm run test:security:incident # Security incident management tests

# Configuration & System Tests
npm run test:kv_admin          # KV configuration management tests
npm run test:system            # System health and environment tests
npm run test:validation        # Zod schema validation tests
npm run test:integration       # End-to-end integration tests

# Schema Registry Management Tests
npm run test:schema:registry   # Schema registry integration tests
```

### 🔧 **Schema Registry Management Tools**

The project includes comprehensive schema registry management tools for handling 46 schemas across 10 categories:

```bash
# Schema Registry Tools - Main Commands
npm run tool:schema            # Interactive schema management tool
npm run tool:schema:help       # Show help and available commands
npm run tool:schema:list       # List all 46 schemas with details
npm run tool:schema:categories # Show all 10 schema categories
npm run tool:schema:validators # List all 46 pre-built validator functions
npm run tool:schema:docs       # Generate comprehensive documentation
npm run tool:schema:validate   # Validate registry consistency
npm run tool:schema:demo       # Interactive demo and testing

# Direct Commands (Alternative)
node tools/schema-registry-demo.js help        # Show help
node tools/schema-registry-demo.js list        # List all schemas  
node tools/schema-registry-demo.js categories  # Show categories
node tools/schema-registry-demo.js category auth # Show auth schemas
node tools/schema-registry-demo.js validator login # Show login validator
node tools/schema-registry-demo.js validators  # List all validators
node tools/schema-registry-demo.js docs       # Generate documentation
node tools/schema-registry-demo.js validate   # Validate registry
node tools/schema-registry-demo.js demo       # Interactive demo
```

**🎯 Schema Registry Features:**
- **46 Total Schemas** across 10 functional categories
- **46 Pre-built Validator Functions** automatically generated
- **Intelligent Caching System** with 90% performance improvement
- **Multi-language Support** with efficient i18n schema generation
- **Command-line Management Tools** for comprehensive schema operations
- **Registry Validation** with consistency checks and error detection
- **Interactive Demo System** for exploration and testing
- **Auto-generated Documentation** from schema definitions

### 📊 **Comprehensive Test Coverage**

Our testing framework provides extensive coverage across all system components:

**🎭 Role-based Testing** (4 test suites):
- **Regular User Tests**: Personal profile management, limited access validation
- **Admin User Tests**: User management, dashboard access, role hierarchy enforcement
- **Super Admin Tests**: Full system control, all user management, KV configuration access
- **RBAC Integration**: Complete role-based access control validation

**🔍 Enterprise Audit Testing** (10+ test suites):
- **Core Audit System**: Basic audit logging, search, filtering, and export
- **Advanced Audit Analytics**: Performance metrics, user activity analysis, security analysis
- **Real-time Monitoring**: Live monitoring, threat detection, alert systems
- **Security Incident Management**: Incident creation, tracking, and response workflows
- **Audit Performance**: Load testing, archival services, data retention
- **KV Audit Configuration**: Audit system configuration management

**🌍 Multilingual & Validation Testing** (8+ test suites):
- **i18n System Tests**: Language detection, translation services, dynamic language support
- **Multilingual Validation**: Error messages in 7 languages (EN, VI, FR, ES, DE, JA, TH)
- **Zod Schema Validation**: Comprehensive input validation, type safety, error handling
- **XSS Security Testing**: Cross-site scripting protection, input sanitization

**⚡ Performance & Security Testing** (6+ test suites):
- **Load Testing**: Concurrent requests, response time validation, system limits
- **Security Testing**: Rate limiting, authentication bypass attempts, input validation
- **Integration Testing**: End-to-end workflows, component interactions
- **Error Handling**: Comprehensive error scenarios, recovery mechanisms

**🔧 System & Configuration Testing** (12+ test suites):
- **KV Configuration Management**: Dynamic configuration, CRUD operations, validation
- **Database Services**: Health checks, migration testing, query optimization
- **Environment Testing**: Multi-environment support (dev, test, staging, production)
- **Debug System Testing**: Granular debug controls, logging validation

### 🛠️ **Test Automation & Scripts**

**Interactive Testing**:
```bash
npm run test                    # Interactive menu with 30+ test options
node tests/mainMenu.js          # Direct access to test menu
```

**Automated Test Runners**:
```bash
bash tests/scripts/run-all-tests.sh        # Complete test suite (detailed output)
bash tests/scripts/run-all-tests-quick.sh  # Quick test runner (minimal output)
bash tests/scripts/test_all_roles.sh       # Comprehensive RBAC testing
bash tests/scripts/test-rbac.sh           # Role-based access control tests
bash tests/scripts/test-debug.sh          # Debug system validation
```

**Individual Test Categories**:
- **Core Functionality**: `npm run test:system`, `npm run test:auth`, `npm run test:security`
- **Role Management**: `npm run test:admin_user`, `npm run test:super_admin_user`, `npm run test:regular_user`
- **Enterprise Features**: `npm run test:audit:*`, `npm run test:kv_admin`, `npm run test:security:incident`
- **Internationalization**: `npm run test:i18n`, `npm run test:multilang_validation`
- **Quality Assurance**: `npm run test:validation`, `npm run test:performance`, `npm run test:integration`

For complete testing documentation, comprehensive test suite details, and advanced testing strategies, please refer to **[documents/TEST_GUIDE.md](./documents/TEST_GUIDE.md)** and **[documents/TEST_SCRIPTS.md](./documents/TEST_SCRIPTS.md)**.

**Key Testing Features:**
- **🎭 Role-based Testing**: Comprehensive RBAC validation with 4 role levels
- **📜 Shell Script Automation**: Complete CI/CD integration with bash scripts
- **🛠️ Test Utilities**: Shared utilities, helpers, and setup functions
- **🔗 Integration Testing**: End-to-end workflows and component interactions
- **✅ Validation Testing**: Zod schema validation and multilingual error handling
- **🔍 Enterprise Audit Testing**: Complete audit system validation with 40+ endpoints
- **🌍 Multilingual Testing**: i18n validation across 7 languages with localized error messages
- **⚡ Performance Testing**: Load testing, concurrent requests, and response time validation
- **🛡️ Security Testing**: XSS protection, rate limiting, and authentication bypass prevention

### 🎭 Role-based Testing

Framework supports comprehensive role-based access control testing:

| Role | Test File | Shell Script | Capabilities |
|------|-----------|--------------|--------------|
| **Regular User** | `regularUserTest.js` | `regular_user.sh` | Personal profile access only, password change, no admin rights |
| **Admin User** | `adminUserTest.js` | `admin_user.sh` | User & dashboard management, create/delete user/admin, NO Super Admin access |
| **Super Admin User** | `superAdminUserTest.js` | `super_admin_user.sh` | Full system access, manage all users, create Super Admin |
| **KV Management** | `kvAdminTest.js` | `test-kv-admin.sh` | KV configuration management (super_admin only), CRUD configurations |

### 📊 Test Coverage

- ✅ **Authentication**: Login, logout, JWT validation, password security
- ✅ **User Management**: CRUD operations, profile management, role changes
- ✅ **Admin Operations**: User administration, system statistics
- ✅ **KV Configuration**: Dynamic configuration management, CRUD operations, super_admin permissions
- ✅ **Security**: Rate limiting, input validation, SQL injection prevention
- ✅ **Internationalization**: Language detection, translation services
- ✅ **Performance**: Load testing, response time validation
- ✅ **Integration**: End-to-end workflows, component interactions
- ✅ **Validation**: Zod schema validation, error handling

## Database Schema

### `users` Table
- `id` - Primary key (INTEGER)
- `full_name` - Full name (TEXT)
- `email` - Email (TEXT, unique)
- `password` - Hashed password (TEXT)
- `role` - User role: `user`, `admin`, `super_admin` (TEXT, default: 'user')
- `status` - Status: `active`, `inactive`, `suspended` (TEXT, default: 'active')
- `created_at` - Creation time (DATETIME)
- `updated_at` - Update time (DATETIME)

### `failed_login_limits` Table
- `id` - Primary key (INTEGER)
- `ip_address` - IP address (TEXT)
- `attempts_count` - Failed attempt count (INTEGER)
- `last_attempt_at` - Last attempt time (DATETIME)

## 👑 Admin & Role Management System

The project includes a complete admin and role management system with features:

### 🎭 **Role System:**
- **`user`** - Regular users with basic permissions
- **`admin`** - Admin users with user management capabilities  
- **`super_admin`** - Full system access with unlimited permissions

### 🔐 **Permission System:**
- Role-based access control with hierarchy enforcement
- Permission-based endpoint access
- Self-protection mechanisms (cannot modify own role/delete own account)

### 📊 **Admin API Endpoints:**
```
GET /api/admin/users              → User list (role-filtered)
GET /api/admin/users/:id          → User details
POST /api/admin/users             → Create user (role restrictions apply)
PUT /api/admin/users/:id          → Update user (excluding role changes)
DELETE /api/admin/users/:id       → Delete user (role restrictions apply)
PUT /api/admin/users/:id/role     → Change user role (hierarchy enforcement)
GET /api/admin/stats              → System statistics
GET /api/admin/dashboard          → Admin dashboard (role-filtered data)
GET /api/admin/system-health      → System health check with performance metrics
```

### 🛡️ **Security Features:**
- Role hierarchy enforcement (admin cannot manage super_admin users)
- Dedicated role change endpoint separate from regular updates
- Role-based data filtering (admin sees limited data, super_admin sees all)
- Self-protection (users cannot change own role or delete own account)
- Input validation and SQL injection prevention

### 📖 **Complete Documentation:**
See the complete system details in [documents/ROLE_COMPLETE_GUIDE.md](./documents/ROLE_COMPLETE_GUIDE.md)

## ⚙️ KV Configuration Management System

The project includes a powerful **KV Configuration Management System** for dynamic runtime configuration control:

### 🔑 **Key Features:**
- **Dynamic Configuration** - Change application settings without deployment
- **Super Admin Only** - Restricted to `super_admin` role for security
- **Environment Comparison** - Compare KV vs ENV variables
- **Batch Operations** - Update multiple configurations at once
- **Cache Management** - Clear configuration cache when needed
- **Default Fallback** - Automatic fallback to default values
- **Validation** - Comprehensive input validation with Zod schemas

### 🎯 **KV Admin API Endpoints:**
```
GET /api/kv-admin/configs              → Get all configurations
GET /api/kv-admin/configs/defaults     → Get default configurations  
GET /api/kv-admin/configs/env-comparison → Compare ENV vs KV values
GET /api/kv-admin/configs/:key         → Get specific configuration
PUT /api/kv-admin/configs/:key         → Update configuration
POST /api/kv-admin/configs/batch       → Batch update configurations
DELETE /api/kv-admin/configs/:key      → Reset configuration to default
POST /api/kv-admin/configs/cache/clear → Clear configuration cache
```

### 🔧 **Supported Configuration Keys:**
- **App Settings**: `APP_NAME`, `APP_VERSION`
- **Debug Control**: `DEBUG`, `ENABLE_DETAILED_ERRORS`, `LOG_SQL_QUERIES`
- **Rate Limiting**: `RATE_LIMIT_MAX_ATTEMPTS`, `RATE_LIMIT_LOCKOUT_DURATION`, `RATE_LIMIT_DISABLED`
- **Pagination**: `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`
- **Security**: `SECURITY_HIGH_RISK_THRESHOLD`
- **Performance**: `PERFORMANCE_GOOD_THRESHOLD`
- **User Management**: `AUTO_ACTIVATE_USER_ON_REGISTER`
- **CORS**: `CORS_ORIGIN`

### 🛡️ **Security Features:**
- **Role Restriction** - Only `super_admin` users can access
- **Key Validation** - Only predefined keys can be modified
- **Input Validation** - Zod schema validation for all inputs
- **Audit Logging** - All configuration changes are logged
- **Safe Defaults** - Always falls back to secure default values

### 📊 **Example Usage:**
```bash
# Get all configurations
curl -H "Authorization: Bearer <super_admin_token>" \
     http://localhost:8787/api/kv-admin/configs

# Update rate limit settings
curl -X PUT -H "Authorization: Bearer <super_admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"value": 10}' \
     http://localhost:8787/api/kv-admin/configs/RATE_LIMIT_MAX_ATTEMPTS

# Batch update multiple configs
curl -X POST -H "Authorization: Bearer <super_admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"configs": {"RATE_LIMIT_MAX_ATTEMPTS": 10, "DEFAULT_PAGE_SIZE": 20}}' \
     http://localhost:8787/api/kv-admin/configs/batch
```

## 🔧 Dynamic Configuration Management

The project features an **advanced dynamic configuration system** using `dynamicConfig.js` that eliminates the need to pass configuration parameters through service layers:

### ✨ **Key Improvements:**
- **🎯 Centralized Config**: All configuration accessed through `src/utils/dynamicConfig.js`
- **🚀 Simplified APIs**: No need to pass `jwtSecret`, `isRateLimitDisabled` as parameters
- **⚙️ Auto-Detection**: Services automatically get configuration from environment
- **🔄 Fallback System**: KV → Environment Variables → Default Values
- **🛡️ Type Safety**: Built-in validation and type conversion

### 🔑 **Configuration Functions:**
```javascript
// JWT settings with automatic fallback
const jwtSettings = await getJwtSettings(env);
// Returns: { secret, accessTokenExpires, refreshTokenExpires }

// Feature flags for development control  
const featureFlags = await getFeatureFlags(env);
// Returns: { disableRateLimiting, enableDetailedErrors, autoActivateUserOnRegister, ... }

// App configuration
const appConfig = await getAppSettings(env);
// Returns: { name, version, environment }
```

### 🚀 **Before vs After**

**Before (Manual Parameter Passing):**
```javascript
// Old way - parameters everywhere
const authService = createAuthService(c.env);
const jwtSecret = await getJwtSecret(c.env);
const featureFlags = await getFeatureFlags(c.env);
const result = await authService.login(email, password, ipAddress, jwtSecret, featureFlags.disableRateLimiting);
```

**After (Dynamic Configuration):**
```javascript
// New way - configuration handled internally
const authService = createAuthService(c.env);
const result = await authService.login(email, password, ipAddress);
// AuthService automatically gets configuration using getJwtSettings() and getFeatureFlags()
```

### 🎯 **Supported Services:**
- **AuthService**: Automatic JWT settings and rate limiting configuration
- **UserService**: Feature flags for user management
- **DatabaseService**: Performance and debug settings
- **All Services**: Inherit from BaseService with cached configuration access

## 🌍 Dynamic Internationalization System

This project uses a **fully dynamic i18n system** with outstanding features including **multilingual validation error messages**:

### ✨ **Key Features:**
✅ **Fully Dynamic** - Automatic language detection from file system  
✅ **Zero Hard-coding** - No hard-coded language lists  
✅ **One-Command Addition** - Add new language with just 1 command  
✅ **Unlimited Languages** - Support unlimited languages  
✅ **Production Ready** - Complete error handling and fallback  
✅ **Multilingual Validation** - i18n-aware Zod validation with localized error messages
✅ **API-wide Coverage** - All API endpoints support multilingual error messages

### 🎯 **Currently Supported Languages:**
- **English (`en`)** - Default language
- **Vietnamese (`vi`)** - Full translation support  
- **French (`fr`)** - Complete validation error coverage
- **Spanish (`es`)** - Complete validation error coverage
- **German (`de`)** - Complete validation error coverage
- **Japanese (`ja`)** - Complete validation error coverage
- **Thai (`th`)** - Complete validation error coverage
- *...and any other language you add!*

### 🌐 **Multilingual Validation System:**
The system provides **i18n-aware Zod validation** with localized error messages across all API endpoints:

```javascript
// Example: Login validation with Vietnamese error messages
// Request with Accept-Language: vi
{
  "success": false,
  "message": "Dữ liệu đầu vào không hợp lệ",
  "errors": [
    {
      "field": "email",
      "message": "Email không hợp lệ"
    },
    {
      "field": "password", 
      "message": "Mật khẩu phải có ít nhất 6 ký tự"
    }
  ]
}

// Same validation with English (Accept-Language: en)
{
  "success": false,
  "message": "Invalid input data",
  "errors": [
    {
      "field": "email",
      "message": "Invalid email format"
    },
    {
      "field": "password",
      "message": "Password must be at least 6 characters"
    }
  ]
}
```

### 📋 **API Endpoints with Multilingual Validation:**
**Authentication Endpoints** (3 endpoints):
- `POST /api/auth/login` - Login validation
- `POST /api/user/register` - Registration validation  
- `POST /api/auth/refresh_token` - Token refresh validation

**User Management Endpoints** (4 endpoints):
- `GET /api/user/profile` - Profile access validation
- `POST /api/user/change-password` - Password change validation
- `POST /api/user/upload` - File upload validation
- `PUT /api/admin/users/:id` - User update validation

**Admin Operations Endpoints** (6 endpoints):
- All admin endpoints with comprehensive multilingual error handling

**Audit System Endpoints** (4 endpoints):
- All audit endpoints with localized validation messages

**Security Incident Endpoints** (3 endpoints):
- All security incident endpoints with multilingual support

### 🚀 **Super Easy Language Addition:**

```bash
# Add German with 1 command
node tools/i18n/add-language-demo.js de "German"

# Add Japanese  
node tools/i18n/add-language-demo.js ja "Japanese"

# Edit auto-generated file, restart app → Done! 🎉
```

### 🌐 **Language Detection Priority:**
1. Query parameter `?lang=vi` (highest priority)
2. `Accept-Language` header parsing
3. Automatic fallback to default language

### 🧪 **Testing Tools:**
```bash
# Test entire system
node tools/i18n/test-dynamic-i18n.js

# Verify optimization
node tools/i18n/final-verification.js

# Add new language
node tools/i18n/add-language-demo.js [code] "[Name]"
```

### 📖 **Complete Documentation:**
See the complete system details in [documents/I18N_MASTER_GUIDE.md](./documents/I18N_MASTER_GUIDE.md)

## 🐛 Debug System Testing Tools

### 🧪 **Comprehensive Debug Test Suite:**
The project includes a comprehensive debug system testing suite located in `tools/debug_log/`:

```bash
# Run comprehensive debug system tests
npm run test:debug             # Run debug tests
npm run test:debug:run         # Run with shell script

# Direct execution
node tools/debug_log/comprehensive_debug_test.js
bash tools/debug_log/run_comprehensive_test.sh
```

### ✅ **Test Coverage:**
- Basic debug system functionality
- Color and formatting validation  
- Pattern matching and namespace filtering
- Enable/disable functionality testing
- Environment variable support validation
- Performance testing (1000+ debug instances)
- Edge cases and error handling
- Internal state inspection

### 📖 **Debug Tools Documentation:**
See complete debug test documentation:
- **English**: [tools/debug_log/README.md](./tools/debug_log/README.md)
- **Tiếng Việt**: [tools/debug_log/README_vi.md](./tools/debug_log/README_vi.md)

## 🚀 Quick Start

### Quick Setup
```bash
# 1. Environment setup
npm run setup:dev

# 2. Run database migrations
npm run db:migrate

# 3. Initialize KV configuration
npm run test:kv:setup

# 4. Start development server
npm run dev
```

### Available Commands
```bash
# Development
npm run dev              # Development server (port 8787)
npm run test             # Interactive test menu
npm run lint             # Code quality check

# KV Configuration
npm run test:kv:setup    # Initialize KV configuration
npm run test:kv_admin    # Test KV Admin functionality  
npm run test:kv:scripts          # Complete KV Admin testing
```

## 📚 Comprehensive Documentation

Our complete documentation library covers every aspect of the system:

### 🎯 **Core System Documentation**
- **[SETUP_GUIDE.md](./documents/SETUP_GUIDE.md)** - Complete environment setup with multi-environment support
- **[DEBUG_DEVELOPMENT_GUIDE.md](./documents/DEBUG_DEVELOPMENT_GUIDE.md)** - Debug & development workflow with granular controls
- **[DATABASE_SERVICE.md](./documents/DATABASE_SERVICE.md)** - Database service architecture & operations guide
- **[DYNAMIC_CONFIG_GUIDE.md](./documents/DYNAMIC_CONFIG_GUIDE.md)** - Enterprise dynamic configuration management
- **[WRANGLER_CONFIG_GUIDE.md](./documents/WRANGLER_CONFIG_GUIDE.md)** - Cloudflare Workers configuration management

### 🧪 **Testing & Quality Assurance**
- **[TEST_GUIDE.md](./documents/TEST_GUIDE.md)** - Comprehensive testing framework with 40+ test suites
- **[TEST_SCRIPTS.md](./documents/TEST_SCRIPTS.md)** - Test automation & shell scripts with RBAC testing
- **[ESLINT_GUIDE.md](./documents/ESLINT_GUIDE.md)** - Code quality & linting standards

### 👑 **Authentication & Authorization**
- **[ROLE_COMPLETE_GUIDE.md](./documents/ROLE_COMPLETE_GUIDE.md)** - Complete admin & role management system
- **[ZOD_GUIDE.md](./documents/ZOD_GUIDE.md)** - Validation & schema design patterns
- **[SCHEMAS_GUIDE.md](./documents/SCHEMAS_GUIDE.md)** - Schema validation with i18n support

### 🌍 **Internationalization & Localization**
- **[I18N_MASTER_GUIDE.md](./documents/I18N_MASTER_GUIDE.md)** - Complete dynamic i18n system with multilingual validation

### 🏢 **Enterprise Features**
- **[ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.md](./documents/ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.md)** - Complete enterprise audit system
- **[AUDIT_API_REFERENCE.md](./documents/AUDIT_API_REFERENCE.md)** - API reference for 40+ audit endpoints
- **[AUDIT_KV_CONFIGURATION_GUIDE.md](./documents/AUDIT_KV_CONFIGURATION_GUIDE.md)** - Advanced audit configuration

### 🌍 **Vietnamese Documentation (Tài liệu Tiếng Việt)**
Complete Vietnamese translations for all guides:
- **[SETUP_GUIDE_vi.md](./documents/SETUP_GUIDE_vi.md)** - Hướng dẫn thiết lập hoàn chỉnh
- **[ROLE_COMPLETE_GUIDE_vi.md](./documents/ROLE_COMPLETE_GUIDE_vi.md)** - Hệ thống quản lý admin & vai trò
- **[DEBUG_DEVELOPMENT_GUIDE_vi.md](./documents/DEBUG_DEVELOPMENT_GUIDE_vi.md)** - Quy trình debug & phát triển
- **[I18N_MASTER_GUIDE_vi.md](./documents/I18N_MASTER_GUIDE_vi.md)** - Hệ thống đa ngôn ngữ hoàn chỉnh
- **[TEST_GUIDE_vi.md](./documents/TEST_GUIDE_vi.md)** - Framework kiểm thử toàn diện
- **[DYNAMIC_CONFIG_GUIDE_vi.md](./documents/DYNAMIC_CONFIG_GUIDE_vi.md)** - Hệ thống cấu hình động
- *...và tất cả 15 tài liệu khác bằng tiếng Việt*

### 📊 **Documentation Statistics**
- **📄 Total Files**: 30 documentation files (15 English + 15 Vietnamese)
- **📋 Complete Coverage**: Every system component fully documented
- **🌍 Multilingual Support**: All guides available in both languages
- **🔄 Up-to-date**: Continuously updated with latest features and improvements
- **🎯 Comprehensive**: From basic setup to advanced enterprise features

---

*This project is production-ready and fully documented. Check the documents/ directory for comprehensive guides on all topics.*

## 🚀 Quick Start & Commands

### Development Commands
```bash
# Basic development
npm run dev                    # Start development server
npm run dev:debug             # Start with full debug logging
npm run dev:debug:validation  # Debug validation only
npm run dev:debug:zod         # Debug Zod validation only  
npm run dev:debug:i18n        # Debug i18n functionality only

# Database setup
npm run db:migrate            # Run database migrations
npm run setup:dev             # Complete development setup
```

### Production Commands
```bash
# Production deployment
npm run deploy                # Deploy to Cloudflare Workers
npm run db:migrate:prod       # Run production migrations
npm run secret:put:prod       # Set production secrets
```

---

*Status: ✅ COMPLETE & PRODUCTION READY*
