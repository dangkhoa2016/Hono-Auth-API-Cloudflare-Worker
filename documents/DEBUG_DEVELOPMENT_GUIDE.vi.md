# Hướng Dẫn Debug & Development Hoàn Chỉnh

> 🌐 Language / Ngôn ngữ: [English](DEBUG_DEVELOPMENT_GUIDE.md) | **Tiếng Việt**

## 📋 Mục Lục
- [🚨 Thay Đổi Quan Trọng](#-thay-đổi-quan-trọng)
- [🎯 Tổng Quan Hệ Thống Debug](#-tổng-quan-hệ-thống-debug)
- [🌍 Thiết Lập Đa Môi Trường](#-thiết-lập-đa-môi-trường)
- [🔧 Cấu Hình Debug](#-cấu-hình-debug)
- [📦 Phương Thức Sử Dụng](#-phương-thức-sử-dụng)
- [💡 Ví Dụ Thực Tế](#-ví-dụ-thực-tế)
- [🧪 Testing với Debug](#-testing-với-debug)
- [📊 Phân Tích & Giám Sát Log](#-phân-tích--giám-sát-log)
- [🔍 Khắc Phục Sự Cố](#-khắc-phục-sự-cố)
- [🚀 Cân Nhắc Production](#-cân-nhắc-production)
- [📚 Tham Khảo Nhanh](#-tham-khảo-nhanh)
- [📋 Lịch Sử Hợp Nhất Tài Liệu](#-lịch-sử-hợp-nhất-tài-liệu)

---

## 🚨 Thay Đổi Quan Trọng

**Hệ thống debug đã được cập nhật để hoạt động với `wrangler dev`:**
- ℹ️ Lệnh `export DEBUG=...` **không tương thích** với wrangler
- ✅ Sử dụng file `.vars` để điều khiển debug patterns
- ✅ Sử dụng shell scripts để điều khiển wrangler log verbosity

**Cần Di Chuyển**: Debug scripts cũ sử dụng `export DEBUG=...` phải được cập nhật để dùng file `.vars`.

---

## 🎯 Tổng Quan Hệ Thống Debug

Hướng dẫn này bao gồm hệ thống debug và logging hoàn chỉnh cho dự án Hono Auth Worker. Hệ thống sử dụng hai cơ chế logging riêng biệt nhưng bổ sung cho nhau:

1. **Application Debug Logs** - Được điều khiển bởi file `.vars` sử dụng package `debug`
2. **Wrangler Log Levels** - Được điều khiển bởi shell scripts và npm commands

### Kiến Trúc Debug

Ứng dụng sử dụng các debug namespaces được cấu trúc theo chức năng:

| Namespace | Mục Đích | Sử Dụng |
|-----------|----------|---------|
| `hono-auth-api:*` | Tất cả debug logs | Chế độ debug đầy đủ |
| `hono-auth-api:app*` | Lifecycle ứng dụng | Startup, shutdown events |
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

## 🌍 Thiết Lập Đa Môi Trường

### Tổng Quan Môi Trường

Dự án hỗ trợ 4 môi trường khác nhau:

| Môi Trường | Mục Đích | Port | Database | Debug Mặc Định |
|------------|----------|------|----------|----------------|
| **Development** | Local development | 8787 | Local D1 | `hono-auth-api:*` |
| **Test** | Automated testing | 8788 | Local D1 Test | `hono-auth-api:*` |
| **Staging** | Pre-production | 8789 | Local D1 | `error:*,security:*` |
| **Production** | Live application | - | Cloudflare D1 | `error:*` hoặc im lặng |

### File Biến Môi Trường

#### .dev.vars.development (Development)
```bash
# Biến môi trường development
JWT_SECRET = "your-development-jwt-secret-here"

# Cài đặt debug - Khuyến nghị debug đầy đủ cho development
DEBUG = "hono-auth-api:*"                    # Tất cả debug logs
# DEBUG = "hono-auth-api:routes:*"           # Chỉ routes
# DEBUG = "hono-auth-api:security:*"         # Chỉ security
# DEBUG = "hono-auth-api:error:*"            # Chỉ errors
# DEBUG = ""                                 # Im lặng

ENV = "development"
```

#### .dev.vars.test (Testing)
```bash
# Biến môi trường test
JWT_SECRET = "your-test-jwt-secret-here"

# Cài đặt debug - Debug đầy đủ cho testing
DEBUG = "hono-auth-api:*"

# Cài đặt rate limiting - tắt cho testing để tránh can thiệp
RATE_LIMIT_DISABLED = "true"

# Tự động kích hoạt user khi đăng ký cho testing
AUTO_ACTIVATE_USER_ON_REGISTER = "true"

ENV = "test"
```

#### .dev.vars.staging (Staging)
```bash
# Biến môi trường staging
JWT_SECRET = "your-staging-jwt-secret-here"

# Cài đặt debug - Debug hạn chế cho staging
DEBUG = "hono-auth-api:error:*,hono-auth-api:security:*"

# Cài đặt rate limiting - tắt cho testing để tránh can thiệp
RATE_LIMIT_DISABLED = "true"

ENV = "staging"
```

### Thiết Lập Môi Trường Nhanh

#### Thiết Lập Development
```bash
# 1. Thiết lập môi trường
npm run setup:dev

# 2. Cấu hình .dev.vars.development với giá trị của bạn
cp .dev.vars.development.example .dev.vars.development
# Chỉnh sửa .dev.vars.development với giá trị thực tế

# 3. Thiết lập database
npm run db:migrate

# 4. Khởi động với debug
npm run dev              # Debug tiêu chuẩn
npm run dev:debug        # Verbose wrangler logs
```

#### Thiết Lập Test Environment
```bash
# 1. Thiết lập test environment
npm run setup:test

# 2. Cấu hình .dev.vars.test
cp .dev.vars.test.example .dev.vars.test

# 3. Thiết lập test database
npm run db:migrate:test

# 4. Khởi động test server
npm run dev:test         # Test environment
```

#### Thiết Lập Staging Environment
```bash
# 1. Thiết lập staging
npm run setup:staging

# 2. Cấu hình .dev.vars.staging
cp .dev.vars.staging.example .dev.vars.staging

# 3. Khởi động staging server
npm run dev:staging      # Debug hạn chế cho staging
```

---

## 🔧 Cấu Hình Debug

### Cách Thay Đổi Debug Patterns

1. **Chỉnh sửa file .vars tương ứng**:
   ```bash
   vim .dev.vars.development      # Cho development
   vim .dev.vars.test             # Cho testing
   vim .dev.vars.staging          # Cho staging
   ```

2. **Sửa đổi dòng DEBUG**:
   ```bash
   DEBUG = "hono-auth-api:routes:*"  # Chỉ routes
   DEBUG = "hono-auth-api:error:*"   # Chỉ errors
   DEBUG = ""                        # Im lặng
   ```

3. **Restart server**:
   ```bash
   npm run dev  # Thay đổi có hiệu lực khi restart
   ```

### Wrangler Log Levels

Wrangler log levels điều khiển mức độ chi tiết của wrangler tool, riêng biệt với application debug logs.

| Level | Verbosity | Tốc Độ | Use Case |
|-------|-----------|--------|----------|
| `debug` | Cao nhất | Chậm nhất | Deep wrangler debugging |
| `info` | Cao | Trung bình | General development |
| `log` | Trung bình | Tốt | Production-like development |
| `warn` | Thấp | Nhanh | Staging environment |
| `error` | Tối thiểu | Nhanh nhất | Production environment |
| `none` | Im lặng | Nhanh nhất | Testing, CI/CD |

---

## 📦 Phương Thức Sử Dụng

### 1. npm Scripts (Khuyến nghị)

#### Development Scripts
```bash
npm run dev              # Normal development server (port 8787)
npm run dev:debug        # Development với verbose wrangler logs
npm run dev:test         # Test environment (port 8788)
npm run dev:staging      # Staging environment (port 8789)
```

#### Debug Scripts Bổ Sung (theo wrangler log level)
```bash
# Development environment với different wrangler log levels
npm run dev:debug        # --log-level debug
npm run dev:info         # --log-level info
npm run dev:warn         # --log-level warn
npm run dev:error        # --log-level error
npm run dev:silent       # --log-level none

# Test environment với different wrangler log levels
npm run dev:test         # --log-level info (mặc định)
npm run dev:test:debug   # --log-level debug
npm run dev:test:warn    # --log-level warn
npm run dev:test:error   # --log-level error
npm run dev:test:silent  # --log-level none

# Staging environment với different wrangler log levels
npm run dev:staging      # --log-level warn (mặc định)
npm run dev:staging:debug # --log-level debug
npm run dev:staging:info # --log-level info
npm run dev:staging:error # --log-level error
npm run dev:staging:silent # --log-level none
```

#### Debug Information Tool
```bash
npm run debug:info       # Hiển thị thông tin cấu hình debug
```

### 2. Direct npm Scripts (Khuyến nghị)

Dự án cung cấp nhiều npm scripts cho các debug levels và environments khác nhau:

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

# Staging environment (port 8789, sử dụng remote database)
npm run dev:staging      # Standard staging (warn level)
npm run dev:staging:debug # Verbose staging environment
npm run dev:staging:info # Info-level staging environment
npm run dev:staging:error # Error-only staging environment
npm run dev:staging:silent # Silent staging environment
```

### 3. VS Code Tasks

Có sẵn qua Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`) → `Tasks: Run Task`:

- `Development Server` - Standard development mode
- `Development Server (Debug Mode)` - Verbose logging mode
- `Test API` - API testing
- `ESLint - Check Code` - Code quality check
- `ESLint - Fix Code` - Auto-fix ESLint issues
- `ESLint - Strict Check` - CI/CD ready ESLint check

**Lưu ý**: Không cần shell scripts - tất cả điều khiển debug qua npm scripts và file `.vars`.

---

## 💡 Ví Dụ Thực Tế

### Ví Dụ 1: Debug Chỉ Routes
```bash
# Chỉnh sửa .dev.vars.development
DEBUG = "hono-auth-api:routes:*"

# Khởi động server với verbose wrangler logs
npm run dev:debug
```

### Ví Dụ 2: Debug Chỉ Errors (Staging-like)
```bash  
# Chỉnh sửa .dev.vars.development
DEBUG = "hono-auth-api:error:*"

# Khởi động server với warning-level wrangler logs
npm run dev:warn
```

### Ví Dụ 3: Chế Độ Im Lặng (Testing)
```bash
# Chỉnh sửa .dev.vars.test
DEBUG = ""

# Khởi động test server không có wrangler logs
npm run dev:test:silent
```

### Ví Dụ 4: Security + Validation Debug
```bash
# Chỉnh sửa .dev.vars.development
DEBUG = "hono-auth-api:security:*,hono-auth-api:validation:*"

# Khởi động server
npm run dev
```

### Ví Dụ 5: Database Query Debugging
```bash
# Chỉnh sửa .dev.vars.development
DEBUG = "hono-auth-api:database:query*"

# Khởi động server và giám sát SQL queries
npm run dev
```

---

## 🧪 Testing với Debug

### Interactive Test Menu (Khuyến nghị)

```bash
# Interactive test menu với debug logging
npm run test             # Sử dụng debug settings từ .dev.vars.test

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
# 11 - Debug Info            (Hiển thị thông tin debug hiện tại)
# q - Quick Tests            (Fast smoke tests)
```

### Unified Test Suite

```bash
# Comprehensive testing với different contexts
npm run test:unified         # Tất cả tests
npm run test:unified:quick   # Quick smoke tests
npm run test:unified:system  # System functionality tests
npm run test:unified:auth    # Authentication tests
npm run test:unified:user    # Test vai trò Regular User
npm run test:unified:admin   # Test vai trò Admin User
npm run test:unified:superadmin # Test vai trò Super Admin User
npm run test:unified:rbac    # Test kiểm soát truy cập dựa trên vai trò
npm run test:unified:security # Security tests
npm run test:unified:translation # i18n tests
npm run test:unified:performance # Performance tests
npm run test:unified:help    # Hiển thị thông tin trợ giúp
```

### Direct Test Execution

```bash
# Validation nhanh
npm run test:quick       # Fast smoke tests

# Specific test contexts
npm run test:auth        # Authentication tests
npm run test:system      # System functionality tests
npm run test:security    # Security & rate limiting tests
npm run test:regular_user        # Test vai trò người dùng thường
npm run test:admin_user      # Test vai trò người dùng Admin
npm run test:super_admin_user      # Test vai trò người dùng Super Admin
npm run test:i18n # i18n tests
npm run test:role        # Test kiểm soát truy cập dựa trên vai trò cụ thể
npm run test:performance # Performance tests
npm run test:integration # Integration tests
npm run test:validation  # Validation tests
npm run test:zod_validation # Zod schema validation tests

# XSS Security Tests
npm run test:xss         # Tất cả XSS tests
npm run test:xss:login   # Login XSS tests
npm run test:xss:profile # Profile XSS tests
npm run test:xss:creation # User creation XSS tests
npm run test:xss:search  # Search XSS tests

# Role-based testing
npm run test:regular_user    # Test vai trò người dùng thường
npm run test:admin_user      # Test vai trò người dùng Admin
npm run test:super_admin_user     # Test vai trò người dùng Super Admin
bash tests/scripts/test_all_roles.sh # All role tests

# Database initialization cho testing
npm run test:initdb      # Initialize test database
```

### Testing Workflow
```bash
# Terminal 1: Khởi động test server với debug
npm run dev:test

# Terminal 2: Chạy tests với different debug levels
npm run test                     # Interactive menu
npm run test:unified:quick       # Quick comprehensive tests
npm run test:unified:rbac        # Test kiểm soát truy cập dựa trên vai trò
npm run test:auth               # Authentication tests only
API_BASE_URL=http://localhost:8788 npm run test:system  # System tests

# Cho different environments
API_BASE_URL=http://localhost:8787 npm run test  # Development environment
API_BASE_URL=http://localhost:8789 npm run test  # Staging environment
```

### API Testing với Debug

```bash
# Khởi động server với route và security debug
# Chỉnh sửa .dev.vars.development: DEBUG = "hono-auth-api:routes:*,hono-auth-api:security:*"
npm run dev

# Test valid login
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Test invalid data để xem validation errors
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email","password":"123"}'
```

---

## 📊 Phân Tích & Giám Sát Log

### Lưu và Giám Sát Logs

```bash
# Lưu tất cả logs vào file
npm run dev 2>&1 | tee debug.log

# Lưu chỉ application debug logs (lọc ra wrangler)
npm run dev 2>&1 | grep "hono-auth-api:" > debug.log

# Giám sát real-time
tail -f debug.log

# Lệnh phân tích
grep "error" debug.log                # Tìm errors
grep "routes:auth" debug.log          # Auth requests
grep "security:jwt" debug.log         # JWT operations
grep "+[0-9][0-9]ms" debug.log        # Slow operations (>10ms)
grep "validation" debug.log           # Validation operations
```

### Phân Tích Performance

```bash
# Tìm slow operations
grep "+[0-9][0-9][0-9]ms" debug.log   # >100ms operations

# Database query performance
grep "database:query" debug.log | grep "+[0-9][0-9]ms"

# JWT operations timing
grep "security:jwt" debug.log | grep "+[0-9]ms"

# Request count analysis
grep "routes:auth" debug.log | wc -l  # Đếm auth requests
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

## 🔍 Khắc Phục Sự Cố

### Debug Logs Không Xuất Hiện
1. **Kiểm tra file .vars**: `cat .dev.vars.development | grep DEBUG`
2. **Đảm bảo server đã restart** sau khi thay đổi `.dev.vars.*`
3. **Xác minh spelling namespace** (case-sensitive)
4. **Kiểm tra debug package**: `npm list debug`
5. **Xác minh debug enabling**: Tìm `debug.enable(c.env.DEBUG)` trong logs

### Quá Nhiều Logs
1. **Sử dụng specific namespaces**: `hono-auth-api:routes:*` thay vì `hono-auth-api:*`
2. **Giảm wrangler log level**: Sử dụng `npm run dev:warn` hoặc `npm run dev:error`
3. **Lọc theo specific areas**: `DEBUG="hono-auth-api:error:*"`

### Không Có Wrangler Logs
1. **Kiểm tra npm script**: Sử dụng `npm run dev:debug` cho verbose wrangler logs
2. **Xác minh wrangler đang chạy đúng**
3. **Kiểm tra port conflicts**: `lsof -ti:8787`

### Server Không Khởi Động
```bash
# Kiểm tra port conflicts
lsof -ti:8787  # Development port
lsof -ti:8788  # Test port
lsof -ti:8789  # Staging port

# Kill conflicting processes
npm run kill   # Kill existing wrangler processes
pkill -f 'wrangler dev'  # Alternative kill command
```

### Database Issues
```bash
# Kiểm tra database status
npm run db:migrate
npx wrangler d1 list

# Reset nếu cần
npm run db:migrate:test
```

### Authentication Errors
```bash
# Debug auth flow với comprehensive logging
# Chỉnh sửa .dev.vars.development: DEBUG = "hono-auth-api:security:*,hono-auth-api:routes:auth*"
npm run dev

# Test với known credentials
curl -X POST http://localhost:8787/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

---

## 🚀 Cân Nhắc Production

### Cài Đặt Khuyến Nghị Theo Môi Trường

#### Development
```bash
DEBUG = "hono-auth-api:*"          # Full debug
wrangler log level: debug hoặc info
```

#### Testing
```bash
DEBUG = "hono-auth-api:*"          # Full debug cho test debugging
wrangler log level: info
```

#### Staging
```bash
DEBUG = "hono-auth-api:error:*,hono-auth-api:security:*"  # Hạn chế
wrangler log level: warn
```

#### Production
```bash
DEBUG = ""                         # Im lặng (hoặc chỉ error:*)
wrangler log level: error hoặc none
```

### Cân Nhắc Bảo Mật

1. **Khuyến nghị cho production**: Sử dụng debug level tối thiểu
2. **Dữ liệu nhạy cảm**: Đảm bảo không có passwords/tokens trong debug logs
3. **Performance**: Debug logging có thể ảnh hưởng hiệu suất
4. **Log retention**: Cân nhắc việc lưu trữ và retention policies

---

## 📚 Tham Khảo Nhanh

### File Chính
- `.dev.vars.development` - Cài đặt debug development
- `.dev.vars.test` - Cài đặt debug test
- `.dev.vars.staging` - Cài đặt debug staging
- `.dev.vars.*.example` - Template files cho environment setup
- `src/utils/debug.js` - Debug namespace definitions
- `src/constants/app.js` - App configuration bao gồm debug base name
- `src/index.js` - Debug enabling logic (`debug.enable(c.env.DEBUG)`)
- `package.json` - Tất cả npm scripts cho different debug levels
- `.vscode/tasks.json` - VS Code tasks bao gồm debug tasks

### Debug Patterns Thường Dùng
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

### Lệnh Nhanh
```bash
# Khởi động development với debug
npm run dev

# Khởi động với verbose wrangler logs
npm run dev:debug

# Khởi động test environment
npm run dev:test

# Khởi động staging environment
npm run dev:staging

# Kiểm tra debug settings hiện tại
cat .dev.vars.development | grep DEBUG

# Test API với debug
npm run test

# Unified comprehensive testing
npm run test:unified

# Quick smoke tests
npm run test:quick

# Thông tin debug
npm run debug:info
```

## Tóm Tắt

Hệ thống debug tách biệt các mối quan tâm:
- **Application debug patterns**: Được điều khiển bởi file `.vars`
- **Wrangler verbosity**: Được điều khiển bởi npm scripts với different log levels
- **Không environment exports**: Mọi thứ sử dụng file `.vars` hoặc npm script parameters
- **Không cần shell scripts**: Tất cả điều khiển debug qua npm scripts
- **Dynamic enabling**: Qua `c.env.DEBUG` trong application code

Cách tiếp cận này đảm bảo tương thích với `wrangler dev` trong khi cung cấp điều khiển debug linh hoạt cho different environments.

Để được trợ giúp thêm:
1. Kiểm tra application logs
2. Xem lại debug namespace documentation trong `src/utils/debug.js`
3. Sử dụng debug information tool: `npm run debug:info`
4. Test debug configuration với different patterns
5. Tham khảo comprehensive test framework để debugging specific functionality
