# Comprehensive Test Scripts Documentation

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](TEST_SCRIPTS.vi.md)

This directory contains bash scripts for comprehensive testing of the Hono Auth API project with enterprise audit system, role-based access control, and extensive test# 5. Test với different languages
curl -H "Accept-Language: vi" http://localhost:8788/api/admin/users
curl -H "Accept-Language: fr" http://localhost:8788/api/admin/users
```

### Expected Admin Message Translation Test Output
```
🌍 Starting Admin Routes i18n Message Translation Tests
========================================================

🔑 Setting up Admin authentication...
✅ Admin authentication setup completed

🔧 Testing Admin role message translations...
📝 User list message: "Successfully retrieved 3 users (showing 3 on page 1 of 1). Requested by Test Admin User (Administrator)"
✅ testUserListMessages (Admin) passed

📝 User creation message: "New user Message Test User created with User role. Created by Test Admin User (Administrator) Created at 8/4/2025, 2:46:51 PM"
✅ testUserCreationMessages (Admin) passed

🔑 Setting up Super Admin authentication...
✅ Super Admin authentication setup completed

📝 Dashboard message: "Dashboard loaded with 4 users total system overview (full system access). Requested by Super Admin User (Super Administrator)"
✅ testDashboardMessages (Super Admin) passed

🌍 Testing multi-language message translations...
📝 EN message: "Successfully retrieved 3 users..."
✅ EN language test passed

📝 VI message: "Đã lấy thành công 3 người dùng..."
✅ VI language test passed

✅ All Admin Message Translation Tests passed!

Test Summary:
✅ Role display name translations: 25 tests
✅ Success message formatting: 15 tests  
✅ Error message localization: 8 tests
✅ Pluralization handling: 12 tests
✅ Multi-language support: 4 languages
✅ Total assertions: 64 passed, 0 failed
```erage.

## 🚀 Main Test Runner Scripts

### 1. `run-all-tests.sh` - Complete Test Suite Runner
**Comprehensive test execution with detailed logging, covering all 40+ test categories**

```bash
# Run complete test suite with detailed output
./tests/scripts/run-all-tests.sh
```

**Features:**
- ✅ Colored output with timestamps and progress indicators
- ✅ Individual test status tracking with success rates
- ✅ Database initialization before each test group
- ✅ Comprehensive error handling and graceful interruption
- ✅ Detailed summary with pass/fail statistics
- ✅ Exit codes (0 = success, 1 = failures found)

**Test Coverage (40+ Test Categories):**
- **Unified Test Suites (9 tests)**: Quick, System, Auth, User, Admin, Security, KV, Translation, Performance
- **Individual Test Suites (21 tests)**: Role-based testing, validation, integration, specialized security tests
- **Audit System Tests (10 tests)**: Complete enterprise audit system validation
- **Advanced Features**: Multi-language validation, XSS protection, KV configuration

### 2. `run-all-tests-quick.sh` - Fast Test Runner
**Streamlined execution for CI/CD and quick validation**

```bash
# Run all tests with minimal output for faster execution
./tests/scripts/run-all-tests-quick.sh
```

**Features:**
- ⚡ Fast execution with minimal output for performance
- ✅ Simple pass/fail indicators with essential feedback
- ✅ Automated database initialization
- ✅ Quick summary with critical failure information
- ✅ Optimized for CI/CD pipelines and automated testing

## 📊 Complete Test Suite Coverage

### 🧪 Unified Test Suites (9 comprehensive suites)
**Modular test architecture with comprehensive coverage**
- `test:unified:quick` - Quick smoke tests for rapid validation
- `test:unified:system` - System health and connectivity tests
- `test:unified:auth` - Authentication and token management tests
- `test:unified:user` - Regular user role functionality tests
- `test:unified:admin` - Admin user role comprehensive tests
- `test:unified:security` - Security features and vulnerability tests
- `test:unified:kv` - KV configuration and management tests
- `test:unified:translation` - i18n translation system tests
- `test:unified:performance` - Performance and load testing

### 🔧 Individual Test Suites (21+ specialized suites)
**Focused testing for specific functionality areas**
- `test:system` - Core system functionality validation
- `test:auth` - Authentication system comprehensive testing
- `test:admin_user` - Admin role permissions and functionality
- `test:super_admin_user` - Super admin exclusive features testing
- `test:regular_user` - Regular user role limitations and permissions
- `test:security` - Security features and protection mechanisms
- `test:i18n` - Internationalization and localization (comprehensive)
- `test:role` - Role-based access control (RBAC) validation
- `test:performance` - System performance and optimization
- `test:integration` - Component integration testing
- `test:validation` - Input validation and Zod schema testing
- `test:quick` - Essential functionality quick checks
- `test:zod_validation` - Zod schema validation comprehensive testing
- `test:error` - Error handling and recovery testing
- `test:xss:all` - XSS protection and security testing
- `test:kv_admin` - KV store administration and management
- `test:kv:audit` - KV audit configuration testing
- `test:security:incident` - Security incident management testing
- `test:multilang_validation` - Multi-language validation testing
- `test:admin:i18n` - Admin routes i18n message testing
- `test:admin:messages:script` - Automated admin message test runner
- `test:simple` - Basic functionality validation
- `test:optimized` - Optimized service performance testing

### 🔍 Enterprise Audit System Tests (10+ comprehensive audit suites)
**Complete enterprise-grade audit system validation**
- `node tests/auditSystemTest.js` - Complete audit system integration testing
- `npm run test:audit:integration` - Audit log service integration tests
- `npm run test:audit:perf` - Audit system performance analysis
- `npm run test:audit:simple` - Basic audit functionality validation
- `npm run test:audit:advanced-js:quick` - Advanced audit features testing
- `node tests/advancedAuditComprehensiveTest.js` - Advanced audit comprehensive testing
- `node tests/realtimeMonitoringTest.js` - Real-time monitoring system testing
- `node tests/securityIncidentTest.js` - Security incident management testing
- `npm run test:audit:archival` - Audit archival system testing
- `node tests/alertSystemConfigIntegrationTest.js` - Alert system configuration testing
- `node tests/i18nValidatorExtensionTest.js` - i18n validator extension testing

### 🌍 i18n Message Translation Tests (New Feature)
**Admin Routes Message Translation Validation**
- `node tests/adminMessageTranslationTest.js` - Admin routes i18n message testing
- `npm run test:admin:messages` - Admin message translation validation
- `npm run test:admin:messages:script` - Automated admin message test runner
- `./tests/scripts/test-admin-messages.sh` - Admin message translation test script

**Features Tested:**
- ✅ Role display name translations (User, Administrator, Super Administrator)
- ✅ Success message formatting and interpolation
- ✅ Error message localization
- ✅ Pluralization handling (`1 user` vs `5 users`)
- ✅ Date/time formatting in messages
- ✅ Multi-language support (EN, VI, FR, ES)
- ✅ Role-based access control messages
- ✅ Complex nested message formatting

**Problem Solved:**
Fixed issue where admin route messages displayed raw role values ("admin", "super_admin") instead of proper translations ("Administrator", "Super Administrator").

**Before**: `"New user created with admin role"`
**After**: `"New user created with Administrator role"`

**Test Coverage:**
- 8 admin routes tested with message validation
- 16+ test scenarios covering role translations
- 4 languages tested (EN, VI, FR, ES)
- Both Admin and Super Admin role message validation

## 🛠️ Usage Examples and Command Reference

### Run Complete Test Suite
```bash
# Execute all 40+ test categories with comprehensive logging
./tests/scripts/run-all-tests.sh

# Quick execution for CI/CD and rapid validation
./tests/scripts/run-all-tests-quick.sh
```

### Run from Any Project Location
```bash
# Scripts automatically navigate to project root directory
bash tests/scripts/run-all-tests.sh
bash tests/scripts/run-all-tests-quick.sh
```

### Individual Test Category Execution
```bash
# Run specific test categories directly
npm run test:unified:quick      # Quick smoke tests
npm run test:system            # System functionality tests
npm run test:audit:integration # Audit system integration tests
node tests/auditSystemTest.js  # Complete audit system testing

# New i18n Message Translation Tests
npm run test:admin:messages           # Admin message translation validation
npm run test:admin:messages:script    # Automated admin message test runner
node tests/adminMessageTranslationTest.js  # Direct admin message test execution
./tests/scripts/test-admin-messages.sh     # Admin message translation script
```

### Run Admin Message Translation Tests
```bash
# Method 1: Automated (Recommended)
npm run dev:test                     # Start test server in one terminal
npm run test:admin:messages:script   # Run test in another terminal

# Method 2: Direct execution
npm run dev:test                           # Start test server
npm run test:admin:messages               # Run test directly

# Method 3: Script execution
npm run dev:test                           # Start test server
./tests/scripts/test-admin-messages.sh    # Run test script
```

## 🗄️ Database Initialization and Management

**Automated Database Management:**
- ✅ Automatic execution of `npm run test:initdb` before each test suite
- ✅ Clean database state ensures consistent test results
- ✅ Proper test isolation prevents cross-test contamination
- ✅ Fresh data setup for reliable testing environment

**Database Reset Process:**
- Drops and recreates test tables
- Initializes test user accounts with proper roles
- Sets up KV configuration for audit system
- Configures test environment variables

## ⚠️ Exit Codes and Error Handling

**Standard Exit Codes:**
- `0` - All tests passed successfully
- `1` - One or more tests failed (details in output)
- `130` - Script interrupted by user (Ctrl+C)

**Error Handling Features:**
- Graceful interruption with partial results display
- Detailed error logging with context information
- Automatic cleanup of test resources
- Clear failure identification and reporting

## 📋 System Requirements and Prerequisites

**Required Dependencies:**
- Node.js (v16+) and npm installed and configured
- Project dependencies installed via `npm install`
- Database access properly configured (D1 local databases)
- `bc` command for percentage calculations (auto-installed when possible)
- Bash shell environment (Linux/macOS/WSL)

**Environment Setup:**
- Wrangler CLI configured for Cloudflare Workers
- Test environment variables properly set
- Database migrations applied to test databases
- KV stores configured for testing

## 🔧 Troubleshooting Guide

### Permission Issues
```bash
# Grant execution permissions to all test scripts
chmod +x tests/scripts/*.sh
```

### Persistent Test Failures
1. **Check database connectivity:**
   ```bash
   npm run db:migrate:test
   npm run test:initdb
   ```

2. **Verify environment configuration:**
   ```bash
   # Check .dev.vars.test file exists and is properly configured
   cat .dev.vars.test
   ```

3. **Run individual test suites to isolate issues:**
   ```bash
   npm run test:initdb && npm run test:unified:quick
   npm run test:system
   node tests/auditSystemTest.js
   ```

### Script Execution Issues
```bash
### Script Execution Issues
```bash
# If scripts fail to start server or find paths
cd hono-auth-api-cloudflare-worker
npm run dev:test  # Start test server
```

### Admin Message Translation Issues
```bash
# If admin message translation tests fail:

# 1. Check role context translation function usage
grep -r "tc(c, 'roles.displayName'" src/routes/admin.js

# 2. Verify translation keys in locale files
grep -r "displayName_context_" src/i18n/locales/

# 3. Check for raw role values in messages (should be fixed)
# ❌ Should NOT appear: "admin", "super_admin" in user-facing messages
# ✅ Should appear: "Administrator", "Super Administrator"

# 4. Run specific admin message tests
npm run test:admin:i18n                    # Direct test execution
npm run test:admin:messages:script         # Automated test runner

# 5. Test with different languages
curl -H "Accept-Language: vi" http://localhost:8788/api/admin/users
curl -H "Accept-Language: fr" http://localhost:8788/api/admin/users
```
./tests/scripts/run-all-tests.sh
```

### Memory or Performance Issues
```bash
# Use quick runner for resource-constrained environments
./tests/scripts/run-all-tests-quick.sh

# Or run test categories individually
npm run test:unified:quick
npm run test:system
```

## 🚀 CI/CD Integration Examples

### GitHub Actions Integration
```yaml
name: Comprehensive Test Suite
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm install
      - run: npm run setup:test
      - name: Run comprehensive tests
        run: ./tests/scripts/run-all-tests-quick.sh
```

### Jenkins Pipeline Integration
```groovy
pipeline {
    agent any
    stages {
        stage('Test') {
            steps {
                sh 'npm install'
                sh 'npm run setup:test'
                sh './tests/scripts/run-all-tests-quick.sh'
            }
        }
    }
}
```

# 🎭 Role-Based Access Control (RBAC) Testing Scripts

Comprehensive shell scripts for manual testing of role-based permissions using curl commands, validating the complete enterprise user role hierarchy.

## 📁 Core Role-Based Testing Scripts

| Script | Role | Description | Permission Level |
|--------|------|-------------|------------------|
| `regular_user.sh` | Regular User | Basic user functionality testing | **Restricted Access** |
| `admin_user.sh` | Admin | Administrative permissions testing | **Elevated Access** |
| `super_admin_user.sh` | Super Admin | Full system access testing | **Complete Control** |
| `test_all_roles.sh` | All Roles | Comprehensive role comparison testing | **Complete Coverage** |

## 🚀 Advanced RBAC Testing Scripts

### Core RBAC Validation Scripts
| Script | Purpose | Description |
|--------|---------|-------------|
| `test-rbac-comprehensive.sh` | **Comprehensive RBAC Testing** | Exhaustive role-based access control validation |
| `all-roles-comparison.sh` | **Role Comparison Analysis** | Side-by-side role capability comparison |
| `test-environments.sh` | **Multi-Environment Testing** | Cross-environment role permission validation |

### Specialized System Testing Scripts
| Script | Purpose | Description |
|--------|---------|-------------|
| `test-system-health.sh` | **System Health Monitoring** | Health endpoints and system status validation |
| `test-favicon.sh` | **Static Asset Testing** | Favicon and static asset endpoint validation |
| `test-kv-admin.sh` | **KV Administration Testing** | KV store management and configuration testing |
| `test-kv-audit-config.sh` | **KV Audit Configuration** | KV audit system configuration validation || `test-response-capture.sh` | **Debug Response Capture** | Test response body capture dynamic configuration |
## 🎯 Enterprise Audit System Testing Scripts

### Unified Audit Testing
| Script | Coverage | Description |
|--------|----------|-------------|
| `unified-audit-test.sh` | **Complete Audit System** | Comprehensive enterprise audit system testing |

**Audit Endpoint Coverage (51+ endpoints):**
- **Core Audit** (`/api/audit/*`) - 6 endpoints: logs, search, stats, export, system-health, delete-log-by-id
- **Advanced Audit** (`/api/advanced-audit/*`) - 15 endpoints: analytics, archival, compliance
- **Real-time Monitoring** (`/api/realtime-monitoring/*`) - 28 endpoints: monitoring, alerts, metrics
- **Security Incidents** (`/api/security-incident/*`) - 8 endpoints: incident management, response

### Audit Script Usage Options
```bash
# Quick audit validation
bash tests/scripts/unified-audit-test.sh quick

# Test specific audit categories
bash tests/scripts/unified-audit-test.sh core      # Core audit endpoints
bash tests/scripts/unified-audit-test.sh advanced  # Advanced audit features
bash tests/scripts/unified-audit-test.sh realtime  # Real-time monitoring
bash tests/scripts/unified-audit-test.sh security  # Security incident management

# Complete endpoint testing
bash tests/scripts/unified-audit-test.sh endpoints

# Comprehensive testing (all features)
bash tests/scripts/unified-audit-test.sh full
```

## 🛠️ RBAC Script Usage Instructions

### 1. Environment Preparation
```bash
# Navigate to project directory
cd hono-auth-api-cloudflare-worker

# Start development server (test environment)
npm run dev:test

# Open new terminal for script execution
```

### 2. Grant Script Execution Permissions
```bash
# Make all test scripts executable
chmod +x tests/scripts/*.sh
```

### 3. Execute Role-Based Testing Scripts
```bash
# Test individual roles
bash tests/scripts/regular_user.sh      # Regular user permissions
bash tests/scripts/admin_user.sh        # Admin user permissions  
bash tests/scripts/super_admin_user.sh  # Super admin permissions

# Comprehensive role comparison
bash tests/scripts/test_all_roles.sh

# Advanced RBAC validation
bash tests/scripts/test-rbac-comprehensive.sh
bash tests/scripts/all-roles-comparison.sh
```

## 📊 Role Permission Matrix and Expected Results

### 🎭 Regular User Role (`regular_user.sh`)
**Restricted Access Level - Basic User Functionality**

**✅ CAN ACCESS:**
- **Public Endpoints**: `/health`, `/version`, `/api/language`, `/favicon.ico`
- **Profile Management**: `/api/user/profile`, `/api/user/me`, profile updates
- **Translation System**: All i18n/translation endpoints
- **Demo Features**: Validation demos and public features
- **Authentication**: Login, logout, token refresh

**❌ CANNOT ACCESS:**
- All administrative endpoints (`/api/admin/*`)
- User management operations (create, edit, delete other users)
- Role management and permissions changes
- System statistics and health monitoring
- Audit logs and system configuration
- KV store administration

### 👨‍💼 Admin User Role (`admin_user.sh`)
**Elevated Access Level - Administrative Functionality**

**✅ CAN ACCESS:**
- **Everything Regular User can access**
- **User Management**: Create, read, update, delete users with `user` and `admin` roles
- **Role Management**: Change roles between `user` and `admin` (role hierarchy enforced)
- **User Lists**: View users with `user` and `admin` roles (filtered data)
- **Admin Statistics**: System statistics and dashboard (limited view)
- **Administrative Tools**: User search, filtering, and management operations

**❌ CANNOT ACCESS:**
- **Super Admin Users**: Cannot view, manage, or interact with `super_admin` role users
- **Role Elevation**: Cannot create users with `super_admin` role or elevate to `super_admin`
- **Super Admin Endpoints**: Exclusive endpoints like system health, audit logs, backups
- **KV Store Management**: Advanced configuration and audit settings
- **Enterprise Features**: Advanced audit configuration, security incident management

### 👑 Super Admin Role (`super_admin_user.sh`)
**Complete Control Level - Full System Access**

**✅ CAN ACCESS EVERYTHING:**
- **Complete User Management**: ALL roles (`user`, `admin`, `super_admin`)
- **Full Role Control**: Create, modify, delete users with ANY role
- **System Administration**: All admin endpoints plus exclusive super admin features
- **Enterprise Audit System**: Complete access to all 57+ audit endpoints
- **KV Store Management**: Full KV configuration and audit settings
- **Security Management**: Security incident management and response
- **System Monitoring**: Complete system health, performance, and monitoring
- **Advanced Features**: Bulk operations, advanced filtering, system configuration

**❌ LIMITATIONS:**
- **Self-Protection**: Cannot delete their own account (safety mechanism)
- **Audit Trail**: All actions are logged and monitored

## 🔍 Detailed Testing Structure for Each Role Script

### Universal Test Structure (All Role Scripts)

**1. 🔐 Authentication and Token Management**
- User login with role-specific credentials
- Access token acquisition and validation
- Token refresh and session management

**2. 📂 Public Endpoint Validation**
- Health check endpoints (`/health`, `/version`)
- Public API endpoints accessible to all roles
- Static asset serving (favicon, etc.)

**3. 👤 Profile and User Management**
- Personal profile access and modification
- User-specific data retrieval and updates
- Account management operations

**4. 👥 Role-Based User Operations**
- User CRUD operations according to role permissions
- Role hierarchy enforcement testing
- Permission boundary validation

**5. 📊 Administrative Feature Testing**
- Admin dashboard and statistics (role-dependent access)
- System monitoring and health checks (permission-based)
- Configuration management (role-restricted)

**6. 🔑 Advanced Feature Validation**
- Enterprise audit system access (role-based filtering)
- KV store management (super admin exclusive)
- Security incident management (elevated permissions)

**7. 🌍 Internationalization and Extras**
- Translation system endpoints
- Demo and validation features
- Multi-language support testing

## 🎯 Purpose and Benefits of RBAC Testing Scripts

### 1. **Comprehensive Security Validation**
- **Permission Boundary Testing**: Ensure each role can only access authorized resources
- **Security Hole Detection**: Identify unauthorized access or privilege escalation vulnerabilities
- **Role Hierarchy Enforcement**: Validate proper role-based access control implementation

### 2. **Manual Testing and Quality Assurance**
- **Endpoint-by-Endpoint Testing**: Systematic validation of each API endpoint per role
- **Response Analysis**: Detailed examination of HTTP status codes and response messages
- **Cross-Role Comparison**: Clear understanding of permission differences between roles

### 3. **Development and Debugging Support**
- **Permission Issue Debugging**: Quick identification and resolution of RBAC problems
- **API Behavior Validation**: Verification of correct endpoint behavior for each role
- **Integration Testing**: End-to-end validation of role-based features

### 4. **Living Documentation and Reference**
- **API Permission Documentation**: Current and accurate documentation of role capabilities
- **Developer Reference**: Clear examples of what each role can and cannot do
- **Security Audit Trail**: Documentation for security reviews and compliance

## 🚀 Advanced Specialized Testing Scripts

### Multi-Environment and System Testing

#### `test-environments.sh` - Cross-Environment Validation
**Multi-environment consistency testing across development, test, and staging**

```bash
# Test role consistency across all environments
./tests/scripts/test-environments.sh
```

**Features:**
- ✅ Cross-environment role permission validation
- ✅ Configuration consistency verification across environments  
- ✅ Environment-specific feature testing and validation
- ✅ Database and KV store consistency checking

#### `test-system-health.sh` - System Health and Monitoring
**Comprehensive system health endpoint validation**

```bash
# Validate system health and monitoring endpoints
./tests/scripts/test-system-health.sh
```

**Features:**
- ✅ Health endpoint monitoring and validation
- ✅ System status verification and reporting
- ✅ Performance metrics collection and analysis
- ✅ Database connectivity and health checking

#### `test-favicon.sh` - Static Asset Endpoint Testing
**Dedicated validation for static assets and favicon endpoints**

```bash
# Test static asset serving and favicon endpoints
./tests/scripts/test-favicon.sh
```

**Features:**
- ✅ Static asset endpoint validation and testing
- ✅ Content-type verification and header checking
- ✅ Response headers and caching validation
- ✅ Asset availability and performance testing

### Advanced RBAC Testing

#### `test-rbac-comprehensive.sh` - Exhaustive RBAC Validation
**Complete role-based access control security testing**

```bash
# Comprehensive RBAC security validation
./tests/scripts/test-rbac-comprehensive.sh
```

**Features:**
- ✅ Complete permission matrix validation across all roles
- ✅ Edge case and boundary condition testing  
- ✅ Security boundary verification and enforcement
- ✅ Role transition and elevation testing

### KV Store and Configuration Testing

#### `test-kv-admin.sh` - KV Store Administration
**KV store management and configuration testing**

```bash
# Test KV store administration features
./tests/scripts/test-kv-admin.sh
```

**Features:**
- ✅ KV store administrative interface testing  
- ✅ Configuration management validation
- ✅ Data persistence and retrieval testing
- ✅ Access control for KV operations

#### `test-kv-audit-config.sh` - KV Audit Configuration
**KV-based audit system configuration validation**

```bash
# Test KV audit configuration system
./tests/scripts/test-kv-audit-config.sh
```

**Features:**
- ✅ KV audit system configuration testing
- ✅ Audit settings persistence and retrieval
- ✅ Configuration validation and error handling
- ✅ Dynamic configuration updates testing

## 💡 Best Practices for RBAC Testing

### Testing Strategy
1. **Systematic Coverage**: Test each endpoint with every role systematically
2. **Negative Testing**: Verify that forbidden operations properly return 403/401 errors
3. **Edge Cases**: Test boundary conditions and role transition scenarios
4. **Data Validation**: Ensure role-filtered data contains appropriate information only

### Security Considerations
1. **Token Security**: Verify tokens are properly validated and expired tokens rejected
2. **Permission Enforcement**: Ensure role restrictions are enforced at the API level
3. **Data Leakage Prevention**: Confirm restricted data is not exposed in responses
4. **Audit Trail**: Verify that privileged operations are properly audited and logged

### Maintenance and Updates
1. **Regular Execution**: Run RBAC tests regularly during development
2. **Documentation Updates**: Keep role documentation synchronized with actual permissions
3. **New Feature Integration**: Add new endpoints to role testing as features are developed
4. **Security Reviews**: Use test results for security audits and compliance validation
