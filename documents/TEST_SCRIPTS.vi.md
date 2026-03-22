# Tài Liệu Scripts Test Toàn Diện

> 🌐 Language / Ngôn ngữ: [English](TEST_SCRIPTS.md) | **Tiếng Việt**

Thư mục này chứa các bash scripts để tes### Execution Individual Test Category
```bash
# Chạy specific test categories trực tiếp
npm run test:unified:quick      # Quick smoke tests
npm run test:system            # System functionality tests
npm run test:audit:integration # Audit system integration tests
node tests/auditSystemTest.js  # Complete audit system testing

# i18n Message Translation Tests Mới
npm run test:admin:i18n               # Admin message translation validation
npm run test:admin:messages:script    # Automated admin message test runner
node tests/adminMessageTranslationTest.js  # Direct admin message test execution
./tests/scripts/test-admin-messages.sh     # Admin message translation script
```

### Chạy Admin Message Translation Tests
```bash
# Phương pháp 1: Automated (Khuyến nghị)
npm run dev:test                     # Start test server trong một terminal
npm run test:admin:messages:script   # Chạy test trong terminal khác

# Phương pháp 2: Direct execution
npm run dev:test                           # Start test server
npm run test:admin:i18n                   # Chạy test trực tiếp

# Phương pháp 3: Script execution
npm run dev:test                           # Start test server
./tests/scripts/test-admin-messages.sh    # Chạy test script
```iện hệ thống Hono Auth API với enterprise audit system, role-based access control, và coverage test mở rộng.

## 🚀 Scripts Chạy Test Chính

### 1. `run-all-tests.sh` - Công Cụ Chạy Test Suite Hoàn Chỉnh
**Execution test toàn diện với detailed logging, bao gồm hơn 40 categories test**

```bash
# Chạy complete test suite với detailed output
./tests/scripts/run-all-tests.sh
```

**Tính Năng:**
- ✅ Colored output với timestamps và progress indicators
- ✅ Individual test status tracking với success rates  
- ✅ Database initialization trước mỗi test group
- ✅ Comprehensive error handling và graceful interruption
- ✅ Detailed summary với pass/fail statistics
- ✅ Exit codes (0 = success, 1 = failures found)

**Test Coverage (40+ Test Categories):**
- **Unified Test Suites (9 tests)**: Quick, System, Auth, User, Admin, Security, KV, Translation, Performance
- **Individual Test Suites (21 tests)**: Role-based testing, validation, integration, specialized security tests
- **Audit System Tests (10 tests)**: Complete enterprise audit system validation
- **Advanced Features**: Multi-language validation, XSS protection, KV configuration

### 2. `run-all-tests-quick.sh` - Fast Test Runner
**Execution được tối ưu cho CI/CD và validation nhanh**

```bash
# Chạy tất cả tests với minimal output để execution nhanh hơn
./tests/scripts/run-all-tests-quick.sh
```

**Tính Năng:**
- ⚡ Fast execution với minimal output để tối ưu performance
- ✅ Simple pass/fail indicators với essential feedback
- ✅ Automated database initialization
- ✅ Quick summary với critical failure information
- ✅ Tối ưu cho CI/CD pipelines và automated testing

## 📊 Coverage Test Suite Hoàn Chỉnh

### 🧪 Unified Test Suites (9 comprehensive suites)
**Kiến trúc test modular với coverage toàn diện**
- `test:unified:quick` - Quick smoke tests để validation nhanh
- `test:unified:system` - System health và connectivity tests
- `test:unified:auth` - Authentication và token management tests
- `test:unified:user` - Regular user role functionality tests
- `test:unified:admin` - Admin user role comprehensive tests
- `test:unified:security` - Security features và vulnerability tests
- `test:unified:kv` - KV configuration và management tests
- `test:unified:translation` - i18n translation system tests
- `test:unified:performance` - Performance và load testing

### 🔧 Individual Test Suites (21+ specialized suites)
**Testing tập trung cho các chức năng cụ thể**
- `test:system` - Core system functionality validation
- `test:auth` - Authentication system comprehensive testing
- `test:admin_user` - Admin role permissions và functionality
- `test:super_admin_user` - Super admin exclusive features testing
- `test:regular_user` - Regular user role limitations và permissions
- `test:security` - Security features và protection mechanisms
- `test:i18n` - Internationalization và localization (comprehensive)
- `test:role` - Role-based access control (RBAC) validation
- `test:performance` - System performance và optimization
- `test:integration` - Component integration testing
- `test:validation` - Input validation và Zod schema testing
- `test:quick` - Essential functionality quick checks
- `test:zod_validation` - Zod schema validation comprehensive testing
- `test:error` - Error handling và recovery testing
- `test:xss:all` - XSS protection và security testing
- `test:kv_admin` - KV store administration và management
- `test:kv:audit` - KV audit configuration testing
- `test:security:incident` - Security incident management testing
- `test:multilang_validation` - Multi-language validation testing
- `test:admin:i18n` - Admin routes i18n message testing
- `test:admin:messages:script` - Automated admin message test runner
- `test:simple` - Basic functionality validation
- `test:optimized` - Optimized service performance testing

### 🔍 Enterprise Audit System Tests (10+ comprehensive audit suites)
**Validation hoàn chỉnh hệ thống audit enterprise-grade**
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

### 🌍 i18n Message Translation Tests (Tính Năng Mới)
**Validation Translation Message cho Admin Routes**
- `node tests/adminMessageTranslationTest.js` - Testing i18n message cho admin routes
- `npm run test:admin:i18n` - Validation translation message cho admin
- `npm run test:admin:messages:script` - Automated admin message test runner
- `./tests/scripts/test-admin-messages.sh` - Script test translation message cho admin

**Tính Năng Được Test:**
- ✅ Translation tên role (User, Administrator, Super Administrator)
- ✅ Formatting và interpolation success message
- ✅ Localization error message
- ✅ Xử lý pluralization (`1 user` vs `5 users`)
- ✅ Formatting date/time trong messages
- ✅ Hỗ trợ multi-language (EN, VI, FR, ES)
- ✅ Messages role-based access control
- ✅ Complex nested message formatting

**Vấn Đề Đã Được Giải Quyết:**
Sửa lỗi khi admin route messages hiển thị raw role values ("admin", "super_admin") thay vì proper translations ("Administrator", "Super Administrator").

**Trước**: `"New user created with admin role"`
**Sau**: `"New user created with Administrator role"`

**Test Coverage:**
- 8 admin routes được test với message validation
- 16+ test scenarios bao gồm role translations
- 4 ngôn ngữ được test (EN, VI, FR, ES)
- Cả Admin và Super Admin role message validation

## Ví Dụ Sử Dụng

## 🛠️ Ví Dụ Sử Dụng và Tham Khảo Lệnh

### Chạy Complete Test Suite
```bash
# Execute tất cả 40+ test categories với comprehensive logging
./tests/scripts/run-all-tests.sh

# Quick execution cho CI/CD và rapid validation  
./tests/scripts/run-all-tests-quick.sh
```

### Chạy từ Bất Kỳ Vị Trí Nào Trong Project
```bash
# Scripts tự động navigate đến project root directory
bash tests/scripts/run-all-tests.sh
bash tests/scripts/run-all-tests-quick.sh
```

### Execution Individual Test Categories
```bash
# Chạy specific test categories trực tiếp
npm run test:unified:quick      # Quick smoke tests
npm run test:system            # System functionality tests
npm run test:audit:integration # Audit system integration tests
node tests/auditSystemTest.js  # Complete audit system testing
```

## 🗄️ Database Initialization và Management

**Automated Database Management:**
- ✅ Tự động execute `npm run test:initdb` trước mỗi test suite
- ✅ Clean database state đảm bảo consistent test results
- ✅ Proper test isolation ngăn cross-test contamination
- ✅ Fresh data setup cho reliable testing environment

**Database Reset Process:**
- Drops và recreates test tables
- Initializes test user accounts với proper roles
- Sets up KV configuration cho audit system
- Configures test environment variables

## Database Initialization

Cả hai scripts đều tự động chạy `npm run test:initdb` trước mỗi test suite để đảm bảo:
- ✅ Clean database state cho mỗi test
- ✅ Proper test isolation
- ✅ Consistent test results

## ⚠️ Exit Codes và Error Handling

**Standard Exit Codes:**
- `0` - Tất cả tests passed thành công
- `1` - Một hoặc nhiều tests failed (details trong output)
- `130` - Script interrupted bởi user (Ctrl+C)

**Error Handling Features:**
- Graceful interruption với partial results display
- Detailed error logging với context information
- Automatic cleanup của test resources
- Clear failure identification và reporting

## 📋 System Requirements và Prerequisites

**Required Dependencies:**
- Node.js (v16+) và npm installed và configured
- Project dependencies installed via `npm install`
- Database access properly configured (D1 local databases)
- `bc` command để percentage calculations (auto-installed khi possible)
- Bash shell environment (Linux/macOS/WSL)

**Environment Setup:**
- Wrangler CLI configured cho Cloudflare Workers
- Test environment variables properly set
- Database migrations applied đến test databases
- KV stores configured để testing

## 🔧 Troubleshooting Guide

### Permission Issues
```bash
# Grant execution permissions đến tất cả test scripts
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
   # Check .dev.vars.test file exists và properly configured
   cat .dev.vars.test
   ```

3. **Chạy individual test suites để isolate issues:**
   ```bash
   npm run test:initdb && npm run test:unified:quick
   npm run test:system
   node tests/auditSystemTest.js
   ```

### Script Execution Issues
```bash
### Script Execution Issues
```bash
# Nếu scripts fail để start server hoặc find paths
cd hono-auth-api-cloudflare-worker
npm run dev:test  # Start test server
```

### Admin Message Translation Issues
```bash
# Nếu admin message translation tests fail:

# 1. Check role context translation function usage
grep -r "tc(c, 'roles.displayName'" src/routes/admin.js

# 2. Verify translation keys trong locale files
grep -r "displayName_context_" src/i18n/locales/

# 3. Check cho raw role values trong messages (should be fixed)
# ❌ Không nên xuất hiện: "admin", "super_admin" trong user-facing messages
# ✅ Nên xuất hiện: "Administrator", "Super Administrator"

# 4. Chạy specific admin message tests
npm run test:admin:i18n                    # Direct test execution
npm run test:admin:messages:script         # Automated test runner

# 5. Test với different languages
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
```
./tests/scripts/run-all-tests.sh
```

### Memory hoặc Performance Issues
```bash
# Sử dụng quick runner cho resource-constrained environments
./tests/scripts/run-all-tests-quick.sh

# Hoặc chạy test categories individually
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

## Ghi Chú

- Mỗi test suite chạy với fresh database initialization
- Tổng execution time phụ thuộc vào số lượng tests và system performance
- Scripts tương thích với Linux/macOS environments
- Windows users nên sử dụng WSL hoặc Git Bash

# 🎭 Role-Based Access Control (RBAC) Testing Scripts

Comprehensive shell scripts để manual testing của role-based permissions sử dụng curl commands, validating complete enterprise user role hierarchy.

## 📁 Core Role-Based Testing Scripts

| Script | Role | Mô Tả | Permission Level |
|--------|------|-------|------------------|
| `regular_user.sh` | Regular User | Basic user functionality testing | **Restricted Access** |
| `admin_user.sh` | Admin | Administrative permissions testing | **Elevated Access** |
| `super_admin_user.sh` | Super Admin | Full system access testing | **Complete Control** |
| `test_all_roles.sh` | All Roles | Comprehensive role comparison testing | **Complete Coverage** |

## 🚀 Advanced RBAC Testing Scripts

### Core RBAC Validation Scripts
| Script | Mục Đích | Mô Tả |
|--------|----------|-------|
| `test-rbac-comprehensive.sh` | **Comprehensive RBAC Testing** | Exhaustive role-based access control validation |
| `all-roles-comparison.sh` | **Role Comparison Analysis** | Side-by-side role capability comparison |
| `test-environments.sh` | **Multi-Environment Testing** | Cross-environment role permission validation |

### Specialized System Testing Scripts
| Script | Mục Đích | Mô Tả |
|--------|----------|-------|
| `test-system-health.sh` | **System Health Monitoring** | Health endpoints và system status validation |
| `test-favicon.sh` | **Static Asset Testing** | Favicon và static asset endpoint validation |
| `test-kv-admin.sh` | **KV Administration Testing** | KV store management và configuration testing |
| `test-kv-audit-config.sh` | **KV Audit Configuration** | KV audit system configuration validation |
| `test-response-capture.sh` | **Debug Response Capture** | Test cấu hình dynamic response body capture |

## 🎯 Enterprise Audit System Testing Scripts

### Unified Audit Testing
| Script | Coverage | Mô Tả |
|--------|----------|-------|
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
# Navigate đến project directory
cd hono-auth-api-cloudflare-worker

# Start development server (test environment)
npm run dev:test

# Open new terminal để script execution
```

### 2. Grant Script Execution Permissions
```bash
# Make tất cả test scripts executable
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

## 📊 Role Permission Matrix và Expected Results

### 🎭 Regular User Role (`regular_user.sh`)
**Restricted Access Level - Basic User Functionality**

**✅ CÓ THỂ TRUY CẬP:**
- **Public Endpoints**: `/health`, `/version`, `/api/language`, `/favicon.ico`
- **Profile Management**: `/api/user/profile`, `/api/user/me`, profile updates
- **Translation System**: Tất cả i18n/translation endpoints
- **Demo Features**: Validation demos và public features
- **Authentication**: Login, logout, token refresh

**❌ KHÔNG THỂ TRUY CẬP:**
- Tất cả administrative endpoints (`/api/admin/*`)
- User management operations (create, edit, delete other users)
- Role management và permissions changes
- System statistics và health monitoring
- Audit logs và system configuration
- KV store administration

### 👨‍💼 Admin User Role (`admin_user.sh`)
**Elevated Access Level - Administrative Functionality**

**✅ CÓ THỂ TRUY CẬP:**
- **Mọi thứ Regular User có thể truy cập**
- **User Management**: Create, read, update, delete users với `user` và `admin` roles
- **Role Management**: Change roles giữa `user` và `admin` (role hierarchy enforced)
- **User Lists**: View users với `user` và `admin` roles (filtered data)
- **Admin Statistics**: System statistics và dashboard (limited view)
- **Administrative Tools**: User search, filtering, và management operations

**❌ KHÔNG THỂ TRUY CẬP:**
- **Super Admin Users**: Không thể view, manage, hoặc interact với `super_admin` role users
- **Role Elevation**: Không thể create users với `super_admin` role hoặc elevate đến `super_admin`
- **Super Admin Endpoints**: Exclusive endpoints như system health, audit logs, backups
- **KV Store Management**: Advanced configuration và audit settings
- **Enterprise Features**: Advanced audit configuration, security incident management

### 👑 Super Admin Role (`super_admin_user.sh`)
**Complete Control Level - Full System Access**

**✅ CÓ THỂ TRUY CẬP MỌI THỨ:**
- **Complete User Management**: TẤT CẢ roles (`user`, `admin`, `super_admin`)
- **Full Role Control**: Create, modify, delete users với BẤT KỲ role nào
- **System Administration**: Tất cả admin endpoints plus exclusive super admin features
- **Enterprise Audit System**: Complete access đến tất cả 57+ audit endpoints
- **KV Store Management**: Full KV configuration và audit settings
- **Security Management**: Security incident management và response
- **System Monitoring**: Complete system health, performance, và monitoring
- **Advanced Features**: Bulk operations, advanced filtering, system configuration

**❌ LIMITATIONS:**
- **Self-Protection**: Không thể delete account của chính mình (safety mechanism)
- **Audit Trail**: Tất cả actions được logged và monitored

## 🔍 Detailed Testing Structure cho Mỗi Role Script

### Universal Test Structure (Tất Cả Role Scripts)

**1. 🔐 Authentication và Token Management**
- User login với role-specific credentials
- Access token acquisition và validation
- Token refresh và session management

**2. 📂 Public Endpoint Validation**
- Health check endpoints (`/health`, `/version`)
- Public API endpoints accessible đến tất cả roles
- Static asset serving (favicon, etc.)

**3. 👤 Profile và User Management**
- Personal profile access và modification
- User-specific data retrieval và updates
- Account management operations

**4. 👥 Role-Based User Operations**
- User CRUD operations theo role permissions
- Role hierarchy enforcement testing
- Permission boundary validation

**5. 📊 Administrative Feature Testing**
- Admin dashboard và statistics (role-dependent access)
- System monitoring và health checks (permission-based)
- Configuration management (role-restricted)

**6. 🔑 Advanced Feature Validation**
- Enterprise audit system access (role-based filtering)
- KV store management (super admin exclusive)
- Security incident management (elevated permissions)

**7. 🌍 Internationalization và Extras**
- Translation system endpoints
- Demo và validation features
- Multi-language support testing

## 🎯 Purpose và Benefits của RBAC Testing Scripts

### 1. **Comprehensive Security Validation**
- **Permission Boundary Testing**: Đảm bảo mỗi role chỉ có thể access authorized resources
- **Security Hole Detection**: Identify unauthorized access hoặc privilege escalation vulnerabilities
- **Role Hierarchy Enforcement**: Validate proper role-based access control implementation

### 2. **Manual Testing và Quality Assurance**
- **Endpoint-by-Endpoint Testing**: Systematic validation của mỗi API endpoint per role
- **Response Analysis**: Detailed examination của HTTP status codes và response messages
- **Cross-Role Comparison**: Clear understanding của permission differences giữa roles

### 3. **Development và Debugging Support**
- **Permission Issue Debugging**: Quick identification và resolution của RBAC problems
- **API Behavior Validation**: Verification của correct endpoint behavior cho mỗi role
- **Integration Testing**: End-to-end validation của role-based features

### 4. **Living Documentation và Reference**
- **API Permission Documentation**: Current và accurate documentation của role capabilities
- **Developer Reference**: Clear examples của what mỗi role có thể và không thể làm
- **Security Audit Trail**: Documentation để security reviews và compliance

## 🚀 Advanced Specialized Testing Scripts

### Multi-Environment và System Testing

#### `test-environments.sh` - Cross-Environment Validation
**Multi-environment consistency testing across development, test, và staging**

```bash
# Test role consistency across tất cả environments
./tests/scripts/test-environments.sh
```

**Features:**
- ✅ Cross-environment role permission validation
- ✅ Configuration consistency verification across environments  
- ✅ Environment-specific feature testing và validation
- ✅ Database và KV store consistency checking

#### `test-system-health.sh` - System Health và Monitoring
**Comprehensive system health endpoint validation**

```bash
# Validate system health và monitoring endpoints
./tests/scripts/test-system-health.sh
```

**Features:**
- ✅ Health endpoint monitoring và validation
- ✅ System status verification và reporting
- ✅ Performance metrics collection và analysis
- ✅ Database connectivity và health checking

#### `test-favicon.sh` - Static Asset Endpoint Testing
**Dedicated validation cho static assets và favicon endpoints**

```bash
# Test static asset serving và favicon endpoints
./tests/scripts/test-favicon.sh
```

**Features:**
- ✅ Static asset endpoint validation và testing
- ✅ Content-type verification và header checking
- ✅ Response headers và caching validation
- ✅ Asset availability và performance testing

### Advanced RBAC Testing

#### `test-rbac-comprehensive.sh` - Exhaustive RBAC Validation
**Complete role-based access control security testing**

```bash
# Comprehensive RBAC security validation
./tests/scripts/test-rbac-comprehensive.sh
```

**Features:**
- ✅ Complete permission matrix validation across tất cả roles
- ✅ Edge case và boundary condition testing  
- ✅ Security boundary verification và enforcement
- ✅ Role transition và elevation testing

### KV Store và Configuration Testing

#### `test-kv-admin.sh` - KV Store Administration
**KV store management và configuration testing**

```bash
# Test KV store administration features
./tests/scripts/test-kv-admin.sh
```

**Features:**
- ✅ KV store administrative interface testing  
- ✅ Configuration management validation
- ✅ Data persistence và retrieval testing
- ✅ Access control cho KV operations

#### `test-kv-audit-config.sh` - KV Audit Configuration
**KV-based audit system configuration validation**

```bash
# Test KV audit configuration system
./tests/scripts/test-kv-audit-config.sh
```

**Features:**
- ✅ KV audit system configuration testing
- ✅ Audit settings persistence và retrieval
- ✅ Configuration validation và error handling
- ✅ Dynamic configuration updates testing

## 💡 Best Practices cho RBAC Testing

### Testing Strategy
1. **Systematic Coverage**: Test mỗi endpoint với every role systematically
2. **Negative Testing**: Verify rằng forbidden operations properly return 403/401 errors
3. **Edge Cases**: Test boundary conditions và role transition scenarios
4. **Data Validation**: Ensure role-filtered data contains appropriate information only

### Security Considerations
1. **Token Security**: Verify tokens được properly validated và expired tokens rejected
2. **Permission Enforcement**: Ensure role restrictions được enforced at API level
3. **Data Leakage Prevention**: Confirm restricted data không exposed trong responses
4. **Audit Trail**: Verify rằng privileged operations được properly audited và logged

### Maintenance và Updates
1. **Regular Execution**: Run RBAC tests regularly during development
2. **Documentation Updates**: Keep role documentation synchronized với actual permissions
3. **New Feature Integration**: Add new endpoints đến role testing as features được developed
4. **Security Reviews**: Use test results cho security audits và compliance validation
