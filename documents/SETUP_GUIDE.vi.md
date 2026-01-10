# Hướng Dẫn Thiết Lập Development

> 🌐 Language / Ngôn ngữ: [English](SETUP_GUIDE.md) | **Tiếng Việt**

## 🚀 Bắt Đầu Nhanh

### 1. Clone và cài đặt dependencies
```bash
git clone <repository-url>
cd hono-auth-api-cloudflare-worker
npm install
```

### 2. Thiết lập môi trường development
│   ├── regularUserTest.js  # Test vai trò người dùng thường
│   ├── adminUserTest.js  # Test vai trò người dùng admin  
│   ├── superAdminUserTest.js    # Test vai trò người dùng Super Admin
```bash
# Chạy script setup tự động
npm run setup:dev

# Hoặc thiết lập thủ công:
cp .dev.vars.development.example .dev.vars.development
cp .dev.vars.test.example .dev.vars.test
cp .dev.vars.staging.example .dev.vars.staging
cp wrangler.toml.example wrangler.toml
```

### 3. Cấu hình tập tin .dev.vars
Chỉnh sửa các tập tin môi trường với các giá trị thật:

**Development (.dev.vars.development):**
```bash
JWT_SECRET = "your-development-jwt-secret-here"

# Cấu hình Debug - điều chỉnh mức độ logging
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

### 4. Thiết lập database (Development/Test sử dụng local database)
```bash
# Môi trường Development & Test sử dụng local database
# Không cần tạo database riêng, chỉ cần chạy migrations

# Chạy migrations cho development
npm run db:migrate

# Chạy migrations cho test environment (nếu cần test)
npm run db:migrate:test
```

**Lưu ý**: Môi trường Development và Test sử dụng local D1 database, không cần database IDs thật.

### 5. Khởi tạo cấu hình KV (Tùy chọn)
```bash
# Khởi tạo cấu hình KV với giá trị mặc định
npm run test:kv:setup

# Test chức năng KV Admin
npm run test:kv_admin

# Test KV Admin hoàn chỉnh
npm run test:kv:scripts
```

**Lưu ý**: Cấu hình KV là tùy chọn và chỉ cần thiết nếu bạn muốn sử dụng quản lý cấu hình động. Ứng dụng hoạt động bình thường mà không cần setup KV, sử dụng environment variables làm fallback.

### 6. Chạy development server
```bash
# Môi trường Development (port 8787)
npm run dev

# Môi trường Test (port 8788) 
npm run dev:test

# Môi trường Staging (port 8789) - yêu cầu database thật
npm run dev:staging
```

### 7. Test hệ thống
```bash
# Menu test tương tác (khuyến nghị)
npm run test

# Bộ test thống nhất (test toàn diện)
npm run test:unified

# Test smoke nhanh
npm run test:unified:quick

# Bối cảnh test cụ thể
npm run test:auth         # Test authentication
npm run test:system       # Test hệ thống
npm run test:regular_user         # Test vai trò người dùng thường
npm run test:admin_user        # Test vai trò người dùng admin
npm run test:super_admin_user       # Test vai trò người dùng Super Admin
npm run test:kv_admin     # Test cấu hình KV Admin (chỉ super_admin)
npm run test:security     # Test bảo mật
npm run test:i18n  # Test i18n
npm run test:validation   # Test validation
npm run test:zod_validation # Test validation Zod
npm run test:performance  # Test hiệu suất
npm run test:integration  # Test tích hợp
npm run test:role         # Test kiểm soát truy cập dựa trên vai trò cụ thể
npm run test:xss          # Test bảo mật XSS
```

## 🔒 Triển Khai Production

### Thiết Lập Môi Trường Staging (Tùy chọn)
```bash
# Thiết lập môi trường staging
npm run setup:staging

# Tạo staging database (lần đầu)
npm run db:create:staging

# Chạy staging migrations
npm run db:migrate:staging

# Deploy lên staging
npm run deploy:staging
```

### 1. Tạo production database
```bash
# Tạo production database (lần đầu)
npm run db:create:prod

# Hoặc lệnh thủ công
wrangler d1 create hono-auth-api-db
```

### 2. Đặt production secrets
```bash
# Đặt JWT secret cho production
npm run secret:put:prod

# Hoặc lệnh thủ công
wrangler secret put JWT_SECRET

# Đặt staging secrets (nếu cần)
npm run secret:put:staging
```

### 3. Thiết lập wrangler.toml
⚠️ **Lưu ý Bảo mật**: Tập tin `wrangler.toml` đã được thêm vào `.gitignore` để bảo vệ database IDs.

Tạo tập tin `wrangler.toml` từ template:
```bash
cp wrangler.toml.example wrangler.toml
```

Cập nhật database ID production trong `wrangler.toml`:
```toml
[[d1_databases]]
binding = "DB"
database_name = "hono-auth-api-db"
database_id = "your-production-database-id"  # Thay thế bằng database ID thật
migrations_dir = "migrations"
```

**Quan trọng**: Không commit tập tin `wrangler.toml` vào git vì chứa database IDs nhạy cảm.

### 4. Deploy
```bash
# Deploy lên production
npm run deploy

# Deploy lên staging (nếu cần)
npm run deploy:staging

# Chạy production migrations
npm run db:migrate:prod
```

## 📁 Cấu Trúc Tập Tin

```
├── .dev.vars.development     # Biến môi trường Development (KHÔNG có trong git)
├── .dev.vars.test           # Biến môi trường Test (KHÔNG có trong git)  
├── .dev.vars.staging        # Biến môi trường Staging (KHÔNG có trong git)
├── .dev.vars                # Biến mặc định/production (KHÔNG có trong git)
├── .dev.vars.*.example      # Tập tin template (có trong git)
├── wrangler.toml.example    # Template config Wrangler (có trong git)
├── wrangler.toml            # Config thật với secrets (KHÔNG có trong git)
├── scripts/                 # Scripts thiết lập & development
│   ├── setup-dev.sh         # Script thiết lập Development
│   ├── setup-test.sh        # Thiết lập môi trường Test
│   ├── setup-staging.sh     # Thiết lập Staging
├── tests/                   # Framework test toàn diện
│   ├── mainMenu.js          # Menu test tương tác
│   ├── unifiedTestSuite.js  # Test toàn diện tất cả trong một
│   ├── systemTest.js        # Test chức năng hệ thống
│   ├── authTest.js          # Test authentication
│   ├── adminUserTest.js     # Test Test vai trò người dùng admin
│   ├── regularUserTest.js   # Test vai trò người dùng thường
│   ├── superAdminUserTest.js    # Test vai trò người dùng Super Admin
│   ├── securityTest.js      # Test bảo mật
│   ├── comprehensiveI18nTest.js # Test i18n toàn diện
│   ├── validationTest.js    # Test validation
│   ├── zodValidationTest.js # Test validation Zod
│   ├── performanceTest.js   # Test hiệu suất
│   ├── integrationTest.js   # Test tích hợp
│   ├── roleTest.js          # Test kiểm soát truy cập dựa trên vai trò cụ thể
│   ├── xssSecurityTest.js   # Test bảo mật XSS
│   ├── scripts/             # Scripts tự động hóa test
│   └── utils/               # Tiện ích test & helper
└── src/                     # Code ứng dụng
    ├── routes/              # API routes
    ├── middleware/          # Các hàm middleware
    ├── services/            # Logic nghiệp vụ
    ├── schemas/             # Schema validation Zod
    ├── i18n/                # Hệ thống i18n động
    └── utils/               # Các hàm tiện ích
```

## 🔐 Best Practices Bảo Mật

1. **Không bao giờ commit dữ liệu nhạy cảm**:
   - Database IDs
   - JWT secrets
   - API keys

2. **Sử dụng database khác nhau cho mỗi môi trường**:
   - Development: Local D1 database
   - Test: Local D1 database  
   - Staging: Remote D1 database (`984fa566-xxxx-49be-xxxx-a6561426124a`)
   - Production: Remote D1 database (qua secrets)

3. **Tách biệt môi trường**:
   - `.dev.vars.*` cho môi trường local
   - Cloudflare secrets cho production

4. **Secrets mạnh**:
   - Sử dụng JWT secrets ngẫu nhiên, dài
   - Xoay secrets thường xuyên

## 🚀 Kiến Trúc Đa Môi Trường

| Môi Trường | Mục Đích | Port | Database | Tập Tin Config |
|------------|----------|------|----------|----------------|
| **Development** | Phát triển local | 8787 | Local D1 | .dev.vars.development |
| **Test** | Test tự động | 8788 | Local D1 Test | .dev.vars.test |
| **Staging** | Pre-production | 8789 | Remote D1 | .dev.vars.staging |
| **Production** | Ứng dụng live | - | Remote D1 | Secrets |

## 📚 Tài Liệu Liên Quan

- [WRANGLER_CONFIG_GUIDE_vi.md](./WRANGLER_CONFIG_GUIDE_vi.md) - Chi tiết cấu hình Wrangler
- [DEBUG_DEVELOPMENT_GUIDE_vi.md](./DEBUG_DEVELOPMENT_GUIDE_vi.md) - Quy trình debug và development
- [ZOD_GUIDE_vi.md](./ZOD_GUIDE_vi.md) - Cách sử dụng validation Zod
- [I18N_MASTER_GUIDE_vi.md](./I18N_MASTER_GUIDE_vi.md) - Hệ thống quốc tế hóa
- [ROLE_COMPLETE_GUIDE_vi.md](./ROLE_COMPLETE_GUIDE_vi.md) - Quản lý vai trò
