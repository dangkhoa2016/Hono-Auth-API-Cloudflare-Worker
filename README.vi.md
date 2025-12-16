# Hono Auth Worker

> 🌐 Language / Ngôn ngữ: [English](README.md) | **Tiếng Việt**

Một dự án Cloudflare Workers toàn diện sử dụng Hono.js framework (JavaScript) với cơ sở dữ liệu D1 để xây dựng một hệ thống xác thực JWT với quản lý admin/vai trò, hệ thống i18n động, bộ kiểm thử toàn diện và kiến trúc sẵn sàng cho sản xuất.

## ✨ Các tính năng chính

- 🚀 **Hono.js Framework** (JavaScript) - Nhanh và nhẹ
- 🗄️ **Cơ sở dữ liệu Cloudflare D1** - Tương thích SQLite với phân phối toàn cầu
- 🔐 **Xác thực JWT** với access & refresh tokens
- 👑 **Quản lý Admin & Vai trò** - Hệ thống kiểm soát truy cập dựa trên vai trò hoàn chỉnh
- 🛡️ **Giới hạn truy cập (Rate Limiting)** cho các lần đăng nhập với theo dõi dựa trên IP
- 🔒 **Mã hóa mật khẩu bcrypt** với salt rounds
- 🛡️ **Tăng cường bảo mật token** với blacklist access token, rotation/ghi log refresh token và cơ chế logout-all
- 🌐 **Các điểm cuối API RESTful** với định dạng phản hồi nhất quán
- 🌍 **Hệ thống i18n động** - Tự động phát hiện ngôn ngữ và hỗ trợ không giới hạn ngôn ngữ
- 🎯 **Xác thực Zod** với xác thực schema toàn diện và thông báo lỗi hỗ trợ i18n
- 🌐 **Hệ thống xác thực đa ngôn ngữ** - Xác thực Zod hỗ trợ i18n với thông báo lỗi được bản địa hóa
- 🐛 **Ghi log gỡ lỗi (Debug Logging)** với kiểm soát gỡ lỗi chi tiết
- 🧪 **Bộ kiểm thử toàn diện** với bộ kiểm thử mô-đun và công cụ kiểm thử nâng cao
- 🌍 **Hỗ trợ đa môi trường** (Dev, Test, Staging, Production)
- 📦 **Kiến trúc mô-đun** với sự tách biệt rõ ràng các mối quan tâm
- 🔧 **Tích hợp ESLint** với các quy tắc chất lượng mã toàn diện
- ⚙️ **Quản lý cấu hình KV** - Cấu hình thời gian chạy động với quyền kiểm soát của super admin
- 🚀 **Sẵn sàng cho sản xuất** triển khai với Cloudflare Workers
- 📊 **Hệ thống kiểm toán doanh nghiệp** - Ghi log kiểm toán hoàn chỉnh với 4 nhóm định tuyến chính (hơn 40 điểm cuối)
  - 📋 **Các định tuyến kiểm toán cốt lõi** (`/api/audit/*`) - Truy cập log kiểm toán cơ bản, tìm kiếm và xuất
  - 🚀 **Các định tuyến kiểm toán nâng cao** (`/api/advanced-audit/*`) - Phân tích, lưu trữ và tuân thủ
  - 🔴 **Các định tuyến giám sát thời gian thực** (`/api/realtime-monitoring/*`) - Giám sát trực tiếp và phát hiện mối đe dọa
  - 🛡️ **Các định tuyến sự cố bảo mật** (`/api/security-incident/*`) - Quản lý và ứng phó sự cố
- 🌍 **Hệ thống xác thực i18n** - Xác thực đa ngôn ngữ với thông báo lỗi được bản địa hóa cho tất cả các điểm cuối API
- 🔧 **Hệ thống cấu hình động** - Quản lý cấu hình thời gian chạy với lưu trữ KV và điều khiển admin

## � **Khởi động nhanh**

### 📋 **Thiết lập dự án**
```bash
# 1. Cài đặt dependencies
npm install

# 2. Thiết lập môi trường phát triển
npm run setup:dev
# hoặc bash scripts/setup-dev.sh

# 3. Chạy migration cơ sở dữ liệu
npm run db:migrate

# 4. Khởi động development server
npm run dev          # Port 8787
# hoặc npm run dev:debug  # Với debug mode
```

### 🧪 **Chạy kiểm thử**
```bash
# Menu kiểm thử tương tác (khuyến nghị)
npm run test

# Kiểm thử nhanh
npm run test:quick

# Kiểm thử toàn diện
npm run test:unified
bash tests/scripts/run-all-tests.sh

# Kiểm thử theo vai trò
npm run test:regular_user     # Người dùng thường
npm run test:admin_user       # Admin
npm run test:super_admin_user # Super Admin
```

### 🌍 **Kiểm thử đa ngôn ngữ**
```bash
# Test API với ngôn ngữ khác nhau
curl "http://localhost:8787/api/auth/login?lang=vi" -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"short"}'

# Hỗ trợ: en, vi, fr, es, de, ja, th
```

### 📚 **Tài liệu quan trọng**
- **[SETUP_GUIDE_vi.md](./documents/SETUP_GUIDE_vi.md)** - Hướng dẫn cài đặt chi tiết
- **[TEST_GUIDE_vi.md](./documents/TEST_GUIDE_vi.md)** - Framework kiểm thử toàn diện
- **[ROLE_COMPLETE_GUIDE_vi.md](./documents/ROLE_COMPLETE_GUIDE_vi.md)** - Hệ thống vai trò & admin

## �📚 Tổ chức tài liệu

Dự án này có tài liệu được tổ chức trong thư mục `documents/` để dễ dàng quản lý và điều hướng:

### 🎯 **Tài liệu cốt lõi** (`documents/`)
- **[SETUP_GUIDE_vi.md](./documents/SETUP_GUIDE_vi.md)** - 🛠️ Hướng dẫn cài đặt hoàn chỉnh & cấu hình môi trường
- **[ROLE_COMPLETE_GUIDE_vi.md](./documents/ROLE_COMPLETE_GUIDE_vi.md)** - 👑 Hệ thống quản lý admin & vai trò hoàn chỉnh
- **[DEBUG_DEVELOPMENT_GUIDE_vi.md](./documents/DEBUG_DEVELOPMENT_GUIDE_vi.md)** - 🐛 Quy trình gỡ lỗi & phát triển với điều khiển chi tiết
- **[I18N_MASTER_GUIDE_vi.md](./documents/I18N_MASTER_GUIDE_vi.md)** - 🌍 Hệ thống i18n động hoàn chỉnh với xác thực đa ngôn ngữ
- **[ZOD_GUIDE_vi.md](./documents/ZOD_GUIDE_vi.md)** - ✅ Hướng dẫn xác thực Zod & mẫu thiết kế schema
- **[SCHEMAS_GUIDE_vi.md](./documents/SCHEMAS_GUIDE_vi.md)** - 📋 Xác thực schema toàn diện với hỗ trợ i18n
- **[ESLINT_GUIDE_vi.md](./documents/ESLINT_GUIDE_vi.md)** - 🔧 Tiêu chuẩn chất lượng mã & linting
- **[WRANGLER_CONFIG_GUIDE_vi.md](./documents/WRANGLER_CONFIG_GUIDE_vi.md)** - ⚙️ Quản lý cấu hình Cloudflare Workers
- **[DATABASE_SERVICE_vi.md](./documents/DATABASE_SERVICE_vi.md)** - 🗄️ Kiến trúc & vận hành dịch vụ cơ sở dữ liệu
- **[DYNAMIC_CONFIG_GUIDE_vi.md](./documents/DYNAMIC_CONFIG_GUIDE_vi.md)** - � Hệ thống quản lý cấu hình động cấp doanh nghiệp

### 🧪 **Kiểm thử & Tự động hóa**
- **[TEST_GUIDE_vi.md](./documents/TEST_GUIDE_vi.md)** - 🧪 Framework kiểm thử toàn diện với 40+ bộ kiểm thử
- **[TEST_SCRIPTS_vi.md](./documents/TEST_SCRIPTS_vi.md)** - 📜 Tự động hóa kiểm thử & script shell với kiểm thử RBAC

### 🏢 **Tính năng doanh nghiệp**
- **[ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE_vi.md](./documents/ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE_vi.md)** - 🏛️ Hệ thống audit cấp doanh nghiệp hoàn chỉnh
- **[AUDIT_API_REFERENCE_vi.md](./documents/AUDIT_API_REFERENCE_vi.md)** - 📚 Tham chiếu API audit chi tiết với 50+ endpoint
- **[AUDIT_KV_CONFIGURATION_GUIDE_vi.md](./documents/AUDIT_KV_CONFIGURATION_GUIDE_vi.md)** - ⚙️ Cấu hình KV Store cho audit & quản lý cấu hình
- **[TOKEN_SECURITY_COMPREHENSIVE_GUIDE.md](./TOKEN_SECURITY_COMPREHENSIVE_GUIDE.md)** - 🔐 Tóm tắt tăng cường bảo mật token (blacklist, audit, logout-all)

### 🌏 **Tài liệu đa ngôn ngữ**
Tất cả tài liệu có sẵn bằng **Tiếng Anh** và **Tiếng Việt** (30 tệp tổng cộng):
- **Tiếng Anh**: `*_en.md` hoặc `*.md` (15 tệp)
- **Tiếng Việt**: `*_vi.md` (15 tệp)

### 🏢 **Tính năng doanh nghiệp**
- **[ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE_vi.md](./documents/ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE_vi.md)** - 📋 Hệ thống kiểm toán doanh nghiệp hoàn chỉnh với giám sát thời gian thực, phân tích và tuân thủ
- **[AUDIT_API_REFERENCE_vi.md](./documents/AUDIT_API_REFERENCE_vi.md)** - 🔍 Tham chiếu API hoàn chỉnh cho 4 nhóm định tuyến kiểm toán chính (hơn 40 điểm cuối)
- **[AUDIT_KV_CONFIGURATION_GUIDE_vi.md](./documents/AUDIT_KV_CONFIGURATION_GUIDE_vi.md)** - ⚙️ Quản lý cấu hình KV nâng cao cho hệ thống kiểm toán
- **[SCHEMAS_GUIDE_vi.md](./documents/SCHEMAS_GUIDE_vi.md)** - 📋 Xác thực schema toàn diện với hỗ trợ i18n

### 🎯 **Bắt đầu nhanh**
1. **Cài đặt**: [documents/SETUP_GUIDE_vi.md](./documents/SETUP_GUIDE_vi.md) - Cài đặt môi trường hoàn chỉnh
2. **Phát triển**: [documents/DEBUG_DEVELOPMENT_GUIDE_vi.md](./documents/DEBUG_DEVELOPMENT_GUIDE_vi.md) - Quy trình phát triển
3. **Kiểm thử**: [documents/TEST_GUIDE_vi.md](./documents/TEST_GUIDE_vi.md) - Sử dụng bộ kiểm thử
4. **Triển khai**: [documents/WRANGLER_CONFIG_GUIDE_vi.md](./documents/WRANGLER_CONFIG_GUIDE_vi.md) - Triển khai sản xuất

## Cấu trúc dự án

```
hono-auth-api-worker/
├── src/                      # 🔧 Mã nguồn - Logic ứng dụng
│   ├── index.js             # Điểm vào chính của ứng dụng
│   ├── constants/           # 🎯 Hằng số tập trung & Quản lý vai trò
│   │   ├── app.js          # Hằng số toàn ứng dụng
│   │   ├── kvKeys.js       # Khóa cấu hình KV & giá trị mặc định
│   │   └── roles.js        # Định nghĩa vai trò, quyền hạn, phân cấp
│   ├── i18n/               # 🌍 Hệ thống i18n động - Hoàn toàn tự động
│   │   ├── index.js        # Export chính cho i18n
│   │   ├── config.js       # Cấu hình i18next động
│   │   ├── loader.js       # Trình tải bản dịch động
│   │   ├── languages.js    # Tiện ích quản lý ngôn ngữ
│   │   ├── service.js      # Dịch vụ phát hiện ngôn ngữ & dịch thuật
│   │   └── locales/        # Tệp bản dịch (tự động phát hiện)
│   │       ├── en.js       # Bản dịch tiếng Anh (mặc định)
│   │       ├── vi.js       # Bản dịch tiếng Việt
│   │       ├── fr.js       # Bản dịch tiếng Pháp
│   │       ├── es.js       # Bản dịch tiếng Tây Ban Nha
│   │       ├── de.js       # Bản dịch tiếng Đức
│   │       ├── ja.js       # Bản dịch tiếng Nhật
│   │       └── th.js       # Bản dịch tiếng Thái
│   ├── middleware/          # Các hàm middleware
│   │   ├── auth.js         # Middleware xác thực JWT
│   │   ├── authorization.js # Middleware kiểm soát truy cập dựa trên vai trò
│   │   ├── cors.js         # Cấu hình CORS
│   │   ├── env.js          # Xác thực môi trường
│   │   ├── error.js        # Middleware xử lý lỗi
│   │   ├── i18n.js         # Middleware i18n để phát hiện ngôn ngữ
│   │   ├── handleLog.js    # Middleware ghi log
│   │   ├── kvConfig.js     # Middleware chèn dịch vụ cấu hình KV
│   │   ├── i18nValidator.js # Xác thực Zod nhận biết i18n với thông báo lỗi đa ngôn ngữ
│   │   └── unifiedRequestMiddleware.js # Ghi log request/response thống nhất và kiểm toán
│   ├── routes/              # Định nghĩa các định tuyến API
│   │   ├── api.js          # Router API chính
│   │   ├── auth.js         # Các định tuyến xác thực (/auth/*)
│   │   ├── user.js         # Các định tuyến người dùng (/user/*)
│   │   ├── admin.js        # 👑 Các định tuyến admin (/admin/*) - Hệ thống admin hoàn chỉnh
│   │   ├── kvAdmin.js      # ⚙️ Các định tuyến quản lý cấu hình KV (/kv-admin/*) - Chỉ super admin
│   │   ├── 📊 **HỆ THỐNG KIỂM TOÁN DOANH NGHIỆP** - 4 Nhóm định tuyến chính (hơn 40 điểm cuối)
│   │   ├── audit.js        # 📋 Các định tuyến kiểm toán cốt lõi (/api/audit/*) - Log cơ bản, tìm kiếm, thống kê, xuất
│   │   ├── advancedAudit.js # 🚀 Các định tuyến kiểm toán nâng cao (/api/advanced-audit/*) - Phân tích, lưu trữ, tuân thủ
│   │   ├── realtimeMonitoring.js # 🔴 Giám sát thời gian thực (/api/realtime-monitoring/*) - Giám sát trực tiếp, phát hiện mối đe dọa
│   │   ├── securityIncident.js # 🛡️ Sự cố bảo mật (/api/security-incident/*) - Quản lý và ứng phó sự cố
│   │   ├── favicon.js      # Cung cấp favicon
│   │   ├── translations.js # Các định tuyến demo i18n
│   │   └── zodDemo.js     # Demo xác thực Zod
│   ├── schemas/            # 🎯 Các schema xác thực
│   │   ├── auth.js         # Xác thực xác thực
│   │   ├── user.js         # Xác thực người dùng với vai trò động
│   │   ├── kv.js           # Xác thực cấu hình KV
│   │   ├── audit.js        # Các schema xác thực hệ thống kiểm toán
│   │   └── i18n.js         # Các schema xác thực i18n với hỗ trợ đa ngôn ngữ
│   ├── services/            # Các dịch vụ logic nghiệp vụ
│   │   ├── authService.js      # Các hoạt động xác thực
│   │   ├── databaseService.js  # Các hoạt động cơ sở dữ liệu & kiểm tra sức khỏe
│   │   ├── kvConfigService.js  # Dịch vụ quản lý cấu hình KV
│   │   ├── auditLogService.js  # Dịch vụ ghi log kiểm toán doanh nghiệp
│   │   ├── securityIncidentService.js # Quản lý sự cố bảo mật
│   │   ├── realtimeMonitoringService.js # Dịch vụ giám sát thời gian thực
│   │   ├── rateLimitService.js # Logic giới hạn truy cập
│   │   └── userService.js      # Các hoạt động liên quan đến người dùng
│   ├── assets/             # Các tài sản tĩnh
│   │   ├── favicon.ico     # Tệp Favicon
│   │   ├── favicon.png     
│   │   └── icon-192.png    
│   └── utils/               # Các hàm tiện ích
│       ├── debug.js        # 🐛 Cấu hình ghi log gỡ lỗi
│       ├── env.js          # Tiện ích môi trường
│       ├── helpers.js       # Các hàm trợ giúp chung
│       └── jwt.js          # Tiện ích token JWT
├── tests/                   # 🧪 Bộ kiểm thử toàn diện
│   ├── mainMenu.js         # 📋 Menu kiểm thử tương tác (điểm vào chính)
│   ├── unifiedTestSuite.js # 🎯 Bộ kiểm thử hợp nhất toàn diện
│   ├── systemTest.js       # 🔧 Kiểm thử chức năng hệ thống cốt lõi
│   ├── authTest.js         # 🔐 Kiểm thử xác thực & JWT
│   ├── regularUserTest.js  # 👤 Kiểm thử chức năng người dùng thông thường
│   ├── adminUserTest.js    # 👨‍💼 Kiểm thử chức năng người dùng admin
│   ├── superAdminUserTest.js   # 👑 Kiểm thử chức năng người dùng Super Admin
│   ├── kvAdminTest.js         # ⚙️ Kiểm thử quản lý cấu hình KV (chỉ super_admin)
│   ├── securityTest.js     # 🛡️ Kiểm thử bảo mật & giới hạn truy cập
│   ├── comprehensiveI18nTest.js  # 🌍 Kiểm thử i18n & dịch thuật toàn diện
│   ├── performanceTest.js  # ⚡ Kiểm thử hiệu năng & tải
│   ├── integrationTest.js  # 🔗 Kiểm thử tích hợp end-to-end
│   ├── validationTest.js   # ✅ Kiểm thử xác thực Zod
│   ├── quickTest.js        # ⚡ Kiểm thử nhanh (smoke tests)
│   ├── roleTest.js         # 🎭 Kiểm thử kiểm soát truy cập dựa trên vai trò
│   ├── **🔍 BỘ KIỂM THỬ HỆ THỐNG KIỂM TOÁN DOANH NGHIỆP** - Kiểm thử hệ thống kiểm toán hoàn chỉnh
│   ├── auditSystemTest.js  # 📋 Chức năng hệ thống kiểm toán cốt lõi
│   ├── advancedAuditComprehensiveTest.js # 🚀 Tính năng kiểm toán nâng cao
│   ├── realtimeMonitoringTest.js # 🔴 Hệ thống giám sát thời gian thực
│   ├── securityIncidentTest.js # 🛡️ Quản lý sự cố bảo mật
│   ├── auditPerformanceTest.js # ⚡ Kiểm thử hiệu năng hệ thống kiểm toán
│   ├── archivalServiceTest.js # 📦 Chức năng lưu trữ dữ liệu
│   ├── kvAuditConfigTest.js # ⚙️ Kiểm thử cấu hình KV kiểm toán
│   ├── **🌍 BỘ KIỂM THỬ XÁC THỰC i18n** - Kiểm thử xác thực đa ngôn ngữ
│   ├── i18nValidatorExtensionTest.js # 🌐 Kiểm thử hệ thống xác thực i18n
│   ├── multiLanguageValidationErrorTest.js # 🗣️ Kiểm thử thông báo lỗi đa ngôn ngữ
│   ├── xssSecurityTest.js  # 🛡️ Kiểm thử bảo vệ XSS và bảo mật
│   ├── errorHandlingTest.js # ⚠️ Kiểm thử xử lý lỗi toàn diện
│   ├── scripts/            # 📜 Script tự động hóa kiểm thử & shell
│   ├── utils/              # 🛠️ Tiện ích & trợ giúp kiểm thử dùng chung
│   └── config/             # ⚙️ Cấu hình kiểm thử
│   # Xem documents/TEST_GUIDE_vi.md để có tài liệu kiểm thử hoàn chỉnh
│   │   └── zodValidation.js # 🎯 Kiểm thử xác thực schema Zod
│   ├── init           # Tệp khởi tạo
│   │   └── reset.sql # 🗄️ Khởi tạo cơ sở dữ liệu để kiểm thử
│   │   └── kv_config.json # 🗄️ Khởi tạo cấu hình Cloudflare KV để kiểm thử
├── scripts/                 # 🚀 Script cài đặt & phát triển
│   ├── setup-dev.sh        # Cài đặt môi trường phát triển
│   ├── setup-test.sh       # Cài đặt môi trường kiểm thử
│   ├── setup-staging.sh    # Cài đặt môi trường staging
│   ├── dev-debug.sh        # Chế độ gỡ lỗi phát triển
│   └── staging-debug.sh    # Chế độ gỡ lỗi staging
├── migrations/              # 🗄️ Di chuyển cơ sở dữ liệu
│   ├── 0001_initial.sql    # Schema cơ sở dữ liệu ban đầu
│   ├── 0002_add_role_column.sql # Thêm cột vai trò vào bảng người dùng
│   ├── 0003_add_audit_logs.sql # Thêm bảng ghi log kiểm toán
│   ├── 0004_add_audit_archive.sql # Thêm hệ thống lưu trữ kiểm toán
│   └── 0005_security_incident_management.sql # Thêm quản lý sự cố bảo mật
├── tools/                   # 🔧 Công cụ phát triển
│   ├── i18n/               # Công cụ quản lý i18n
│   ├── d1/                 # Công cụ quản lý cơ sở dữ liệu
│   ├── debug_log/          # Công cụ kiểm thử hệ thống gỡ lỗi
│   └── generate-password-hashes.js # Tiện ích mật khẩu
├── .dev.vars.development               # 🔒 Biến môi trường phát triển (không có trong git)
├── .dev.vars.test              # 🔒 Biến môi trường kiểm thử (không có trong git)
├── .dev.vars.staging           # 🔒 Biến môi trường staging (không có trong git)
├── .dev.vars.*.example         # 📋 Mẫu biến môi trường (có trong git)
├── wrangler.toml.example       # ⚙️ Mẫu cấu hình Cloudflare Workers (có trong git)
├── wrangler.toml               # ⚙️ Cấu hình thực tế với ID cơ sở dữ liệu (không có trong git)
├── package.json            # 📦 Phụ thuộc & script
├── README_vi.md              # 📖 Tài liệu dự án (tệp này)
├── documents/             # 📚 Bộ sưu tập tài liệu hoàn chỉnh
│   ├── SETUP_GUIDE_vi.md          # 🛠️ Hướng dẫn cài đặt & môi trường
│   ├── ROLE_COMPLETE_GUIDE_vi.md # 👑 Hướng dẫn quản lý admin & vai trò hoàn chỉnh
│   ├── DEBUG_DEVELOPMENT_GUIDE_vi.md # 🐛 Hướng dẫn quy trình gỡ lỗi & phát triển
│   ├── I18N_MASTER_GUIDE_vi.md # 🌍 Hướng dẫn hệ thống i18n động hoàn chỉnh
│   ├── ZOD_GUIDE_vi.md      # ✅ Hướng dẫn xác thực Zod toàn diện
│   ├── SCHEMAS_GUIDE_vi.md  # 📋 Xác thực schema với hỗ trợ i18n
│   ├── ESLINT_GUIDE_vi.md   # 🔧 Hướng dẫn chất lượng mã & linting
│   ├── WRANGLER_CONFIG_GUIDE_vi.md # ⚙️ Hướng dẫn cấu hình Cloudflare Workers
│   ├── TEST_GUIDE_vi.md     # 🧪 Hướng dẫn bộ kiểm thử toàn diện
│   ├── TEST_SCRIPTS_vi.md   # 📜 Hướng dẫn script tự động hóa kiểm thử & shell
│   ├── DATABASE_SERVICE_vi.md # 🗄️ Hướng dẫn dịch vụ & hoạt động cơ sở dữ liệu
│   ├── DYNAMIC_CONFIG_GUIDE_vi.md # 🔧 Hướng dẫn hệ thống quản lý cấu hình động
│   ├── ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE_vi.md # 📋 Hướng dẫn hệ thống kiểm toán doanh nghiệp
│   ├── AUDIT_API_REFERENCE_vi.md # 🔍 Tham chiếu API kiểm toán hoàn chỉnh
│   └── AUDIT_KV_CONFIGURATION_GUIDE_vi.md # ⚙️ Hướng dẫn cấu hình KV kiểm toán
└── wrangler.toml.example # ⚙️ Mẫu cấu hình Cloudflare Workers
```

## 🧪 **Framework kiểm thử toàn diện (40+ Bộ kiểm thử)**

### 🎯 **Bộ kiểm thử chuyên biệt**

**Kiểm thử cốt lõi hệ thống:**
- `systemTest.js` - Kiểm thử chức năng hệ thống cốt lõi
- `authTest.js` - Kiểm thử xác thực JWT hoàn chỉnh
- `validationTest.js` - Kiểm thử xác thực Zod
- `securityTest.js` - Kiểm thử bảo mật toàn diện
- `performanceTest.js` - Kiểm thử hiệu suất & tải

**Kiểm thử vai trò cụ thể:**
- `regularUserTest.js` - Kiểm thử vai trò người dùng thường
- `adminUserTest.js` - Kiểm thử vai trò quản trị viên
- `superAdminUserTest.js` - Kiểm thử vai trò siêu quản trị
- `roleTest.js` - Kiểm thử RBAC hoàn chỉnh
- `kvAdminTest.js` - Kiểm thử quản trị KV Store (chỉ super_admin)

**Kiểm thử tính năng nâng cao:**
- `comprehensiveI18nTest.js` - Kiểm thử i18n & dịch thuật toàn diện
- `integrationTest.js` - Kiểm thử tích hợp
- `i18nValidatorExtensionTest.js` - Kiểm thử hệ thống xác thực i18n
- `multiLanguageValidationErrorTest.js` - Kiểm thử thông báo lỗi đa ngôn ngữ

**Kiểm thử hệ thống audit doanh nghiệp:**
- `auditSystemTest.js` - Chức năng hệ thống kiểm toán cốt lõi
- `advancedAuditComprehensiveTest.js` - Tính năng kiểm toán nâng cao
- `realtimeMonitoringTest.js` - Hệ thống giám sát thời gian thực
- `securityIncidentTest.js` - Quản lý sự cố bảo mật
- `auditPerformanceTest.js` - Hiệu năng hệ thống kiểm toán
- `archivalServiceTest.js` - Chức năng lưu trữ dữ liệu

**Kiểm thử bảo mật chuyên sâu:**
- `xssSecurityTest.js` - Kiểm thử bảo vệ XSS
- `errorHandlingTest.js` - Kiểm thử xử lý lỗi toàn diện

### 📋 **Menu kiểm thử tương tác**

### 🚀 **Bắt đầu nhanh**

```bash
# Menu kiểm thử tương tác (khuyến nghị)
npm run test
# hoặc
node tests/mainMenu.js

# Kiểm thử nhanh (smoke tests)
npm run test:quick

# Bộ kiểm thử toàn diện
npm run test:unified               # Bộ kiểm thử hợp nhất tất cả
bash tests/scripts/run-all-tests.sh     # Chi tiết đầy đủ
bash tests/scripts/run-all-tests-quick.sh # Đầu ra tối thiểu

# Kiểm thử theo vai trò
npm run test:regular_user         # Kiểm thử người dùng thường
npm run test:admin_user           # Kiểm thử admin
npm run test:super_admin_user     # Kiểm thử super admin
bash tests/scripts/test_all_roles.sh    # Tất cả vai trò

# Kiểm thử hệ thống cốt lõi
npm run test:system               # Chức năng hệ thống
npm run test:auth                 # Xác thực
npm run test:security             # Bảo mật
npm run test:role                 # RBAC
npm run test:validation           # Xác thực Zod
npm run test:performance          # Hiệu suất
npm run test:integration          # Tích hợp

# Kiểm thử hệ thống audit doanh nghiệp
npm run test:audit                # Kiểm toán cốt lõi
npm run test:audit:advanced       # Tính năng nâng cao
npm run test:audit:realtime       # Giám sát thời gian thực
npm run test:audit:security       # Sự cố bảo mật
npm run test:audit:performance    # Hiệu suất audit

# Kiểm thử i18n & xác thực đa ngôn ngữ
npm run test:i18n                # Hệ thống i18n
npm run test:i18n:validator       # Xác thực i18n
npm run test:validation:multilang # Lỗi xác thực đa ngôn ngữ

# Kiểm thử quản lý Schema Registry
npm run test:schema:registry      # Kiểm thử tích hợp schema registry
```

### 🔧 **Công cụ quản lý Schema Registry**

Dự án bao gồm các công cụ quản lý schema registry toàn diện để xử lý 46 schemas trên 10 categories:

```bash
# Công cụ Schema Registry - Lệnh chính
npm run tool:schema               # Công cụ quản lý schema tương tác
npm run tool:schema:help          # Hiển thị trợ giúp và lệnh có sẵn
npm run tool:schema:list          # Liệt kê tất cả 46 schemas với chi tiết
npm run tool:schema:categories    # Hiển thị tất cả 10 schema categories
npm run tool:schema:validators    # Liệt kê tất cả 46 validator functions được xây dựng sẵn
npm run tool:schema:docs          # Tạo tài liệu toàn diện
npm run tool:schema:validate      # Xác thực tính nhất quán registry
npm run tool:schema:demo          # Demo và kiểm thử tương tác

# Lệnh trực tiếp (Thay thế)
node tools/schema-registry-demo.js help        # Hiển thị trợ giúp
node tools/schema-registry-demo.js list        # Liệt kê tất cả schemas
node tools/schema-registry-demo.js categories  # Hiển thị categories
node tools/schema-registry-demo.js category auth # Hiển thị auth schemas
node tools/schema-registry-demo.js validator login # Hiển thị login validator
node tools/schema-registry-demo.js validators  # Liệt kê tất cả validators
node tools/schema-registry-demo.js docs       # Tạo tài liệu
node tools/schema-registry-demo.js validate   # Xác thực registry
node tools/schema-registry-demo.js demo       # Demo tương tác
```

**🎯 Tính năng Schema Registry:**
- **46 Schemas tổng cộng** trên 10 categories chức năng
- **46 Validator Functions được xây dựng sẵn** tự động tạo
- **Hệ thống Caching thông minh** với cải thiện hiệu suất 90%
- **Hỗ trợ đa ngôn ngữ** với tạo i18n schema hiệu quả
- **Công cụ quản lý Command-line** cho các hoạt động schema toàn diện
- **Xác thực Registry** với kiểm tra tính nhất quán và phát hiện lỗi
- **Hệ thống Demo tương tác** cho khám phá và kiểm thử
- **Tài liệu tự động tạo** từ định nghĩa schema

**Tham khảo chi tiết**: [TEST_GUIDE_vi.md](./documents/TEST_GUIDE_vi.md) | [TEST_SCRIPTS_vi.md](./documents/TEST_SCRIPTS_vi.md)
- **🎭 Kiểm thử dựa trên vai trò**: Các tệp cụ thể để kiểm thử các vai trò người dùng khác nhau
- **📜 Script Shell**: Các script tự động hóa cho CI/CD và kiểm thử thủ công
- **🛠️ Tiện ích kiểm thử**: Các tiện ích và hàm trợ giúp dùng chung
- **🔗 Tích hợp**: Kiểm thử tích hợp end-to-end và thành phần
- **✅ Xác thực**: Xác thực schema và kiểm thử đầu vào
- **🔍 Kiểm thử kiểm toán doanh nghiệp**: Bộ kiểm thử hệ thống kiểm toán hoàn chỉnh với kiểm thử hiệu năng
- **🌍 Kiểm thử xác thực i18n**: Kiểm thử thông báo lỗi xác thực đa ngôn ngữ trên tất cả các điểm cuối API

### 🎭 Kiểm thử dựa trên vai trò

Bộ khung hỗ trợ kiểm thử kiểm soát truy cập dựa trên vai trò toàn diện:

| Vai trò | Tệp kiểm thử | Script Shell | Khả năng |
|---|---|---|---|
| **Người dùng thông thường** | `regularUserTest.js` | `regular_user.sh` | Chỉ truy cập hồ sơ cá nhân, thay đổi mật khẩu, không có quyền admin |
| **Người dùng Admin** | `adminUserTest.js` | `admin_user.sh` | Quản lý người dùng & dashboard, tạo/xóa người dùng/admin, KHÔNG có quyền truy cập Super Admin |
| **Người dùng Super Admin** | `superAdminUserTest.js` | `super_admin_user.sh` | Toàn quyền truy cập hệ thống, quản lý tất cả người dùng, tạo Super Admin |
| **Quản lý KV** | `kvAdminTest.js` | `test-kv-admin.sh` | Quản lý cấu hình KV (chỉ super_admin), CRUD cấu hình |

### 📊 Phạm vi kiểm thử

- ✅ **Xác thực**: Đăng nhập, đăng xuất, xác thực JWT, bảo mật mật khẩu
- ✅ **Quản lý người dùng**: Các hoạt động CRUD, quản lý hồ sơ, thay đổi vai trò
- ✅ **Hoạt động Admin**: Quản trị người dùng, thống kê hệ thống
- ✅ **Cấu hình KV**: Quản lý cấu hình động, hoạt động CRUD, quyền super_admin
- ✅ **Bảo mật**: Giới hạn truy cập, xác thực đầu vào, phòng chống SQL injection
- ✅ **Quốc tế hóa**: Phát hiện ngôn ngữ, dịch vụ dịch thuật
- ✅ **Hiệu năng**: Kiểm thử tải, xác thực thời gian phản hồi
- ✅ **Tích hợp**: Quy trình làm việc end-to-end, tương tác thành phần
- ✅ **Xác thực**: Xác thực schema Zod, xử lý lỗi

## Lược đồ cơ sở dữ liệu

### Bảng `users`
- `id` - Khóa chính (INTEGER)
- `full_name` - Tên đầy đủ (TEXT)
- `email` - Email (TEXT, duy nhất)
- `password` - Mật khẩu đã băm (TEXT)
- `role` - Vai trò người dùng: `user`, `admin`, `super_admin` (TEXT, mặc định: 'user')
- `status` - Trạng thái: `active`, `inactive`, `suspended` (TEXT, mặc định: 'active')
- `created_at` - Thời gian tạo (DATETIME)
- `updated_at` - Thời gian cập nhật (DATETIME)

### Bảng `failed_login_limits`
- `id` - Khóa chính (INTEGER)
- `ip_address` - Địa chỉ IP (TEXT)
- `attempts_count` - Số lần thử thất bại (INTEGER)
- `last_attempt_at` - Thời gian thử lần cuối (DATETIME)

## 👑 Hệ thống quản lý Admin & Vai trò

Dự án bao gồm một hệ thống quản lý admin và vai trò hoàn chỉnh với các tính năng:

### 🎭 **Hệ thống vai trò:**
- **`user`** - Người dùng thông thường với các quyền cơ bản
- **`admin`** - Người dùng admin với khả năng quản lý người dùng
- **`super_admin`** - Toàn quyền truy cập hệ thống với các quyền không giới hạn

### 🔐 **Hệ thống quyền hạn:**
- Kiểm soát truy cập dựa trên vai trò với thực thi phân cấp
- Truy cập điểm cuối dựa trên quyền hạn
- Cơ chế tự bảo vệ (không thể sửa đổi vai trò của chính mình/xóa tài khoản của chính mình)

### 📊 **Các điểm cuối API Admin:**
```
GET /api/admin/users              → Danh sách người dùng (được lọc theo vai trò)
GET /api/admin/users/:id          → Chi tiết người dùng
POST /api/admin/users             → Tạo người dùng (áp dụng các hạn chế về vai trò)
PUT /api/admin/users/:id          → Cập nhật người dùng (không bao gồm thay đổi vai trò)
DELETE /api/admin/users/:id       → Xóa người dùng (áp dụng các hạn chế về vai trò)
PUT /api/admin/users/:id/role     → Thay đổi vai trò người dùng (thực thi phân cấp)
GET /api/admin/stats              → Thống kê hệ thống
GET /api/admin/dashboard          → Dashboard admin (dữ liệu được lọc theo vai trò)
GET /api/admin/system-health      → Kiểm tra sức khỏe hệ thống với các chỉ số hiệu năng
```

### 🛡️ **Tính năng bảo mật:**
- Thực thi phân cấp vai trò (admin không thể quản lý người dùng super_admin)
- Điểm cuối thay đổi vai trò chuyên dụng tách biệt với các cập nhật thông thường
- Lọc dữ liệu dựa trên vai trò (admin thấy dữ liệu hạn chế, super_admin thấy tất cả dữ liệu)
- Tự bảo vệ (người dùng không thể thay đổi vai trò của chính mình hoặc xóa tài khoản của chính mình)
- Xác thực đầu vào và phòng chống SQL injection

### 📖 **Tài liệu hoàn chỉnh:**
Xem chi tiết hệ thống hoàn chỉnh trong [documents/ROLE_COMPLETE_GUIDE_vi.md](./documents/ROLE_COMPLETE_GUIDE_vi.md)

## ⚙️ Hệ thống quản lý cấu hình KV

Dự án bao gồm một **Hệ thống quản lý cấu hình KV** mạnh mẽ để kiểm soát cấu hình thời gian chạy động:

### 🔑 **Các tính năng chính:**
- **Cấu hình động** - Thay đổi cài đặt ứng dụng mà không cần triển khai
- **Chỉ Super Admin** - Bị hạn chế cho vai trò `super_admin` để bảo mật
- **So sánh môi trường** - So sánh các biến KV và ENV
- **Hoạt động hàng loạt** - Cập nhật nhiều cấu hình cùng một lúc
- **Quản lý bộ đệm** - Xóa bộ đệm cấu hình khi cần
- **Dự phòng mặc định** - Tự động dự phòng về các giá trị mặc định
- **Xác thực** - Xác thực đầu vào toàn diện với các schema Zod

### 🎯 **Các điểm cuối API KV Admin:**
```
GET /api/kv-admin/configs              → Lấy tất cả cấu hình
GET /api/kv-admin/configs/defaults     → Lấy cấu hình mặc định
GET /api/kv-admin/configs/env-comparison → So sánh giá trị ENV và KV
GET /api/kv-admin/configs/:key         → Lấy cấu hình cụ thể
PUT /api/kv-admin/configs/:key         → Cập nhật cấu hình
POST /api/kv-admin/configs/batch       → Cập nhật hàng loạt cấu hình
DELETE /api/kv-admin/configs/:key      → Đặt lại cấu hình về mặc định
POST /api/kv-admin/configs/cache/clear → Xóa bộ đệm cấu hình
```

### 🔧 **Các khóa cấu hình được hỗ trợ:**
- **Cài đặt ứng dụng**: `APP_NAME`, `APP_VERSION`
- **Kiểm soát gỡ lỗi**: `DEBUG`, `ENABLE_DETAILED_ERRORS`, `LOG_SQL_QUERIES`
- **Giới hạn truy cập**: `RATE_LIMIT_MAX_ATTEMPTS`, `RATE_LIMIT_LOCKOUT_DURATION`, `RATE_LIMIT_DISABLED`
- **Phân trang**: `DEFAULT_PAGE_SIZE`, `MAX_PAGE_SIZE`
- **Bảo mật**: `SECURITY_HIGH_RISK_THRESHOLD`
- **Hiệu năng**: `PERFORMANCE_GOOD_THRESHOLD`
- **Quản lý người dùng**: `AUTO_ACTIVATE_USER_ON_REGISTER`
- **CORS**: `CORS_ORIGIN`

### 🛡️ **Tính năng bảo mật:**
- **Hạn chế vai trò** - Chỉ người dùng `super_admin` mới có thể truy cập
- **Xác thực khóa** - Chỉ các khóa được xác định trước mới có thể được sửa đổi
- **Xác thực đầu vào** - Xác thực schema Zod cho tất cả các đầu vào
- **Ghi log kiểm toán** - Tất cả các thay đổi cấu hình đều được ghi lại
- **Mặc định an toàn** - Luôn dự phòng về các giá trị mặc định an toàn

### 📊 **Ví dụ sử dụng:**
```bash
# Lấy tất cả cấu hình
curl -H "Authorization: Bearer <super_admin_token>" \
     http://localhost:8787/api/kv-admin/configs

# Cập nhật cài đặt giới hạn truy cập
curl -X PUT -H "Authorization: Bearer <super_admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"value": 10}' \
     http://localhost:8787/api/kv-admin/configs/RATE_LIMIT_MAX_ATTEMPTS

# Cập nhật hàng loạt nhiều cấu hình
curl -X POST -H "Authorization: Bearer <super_admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"configs": {"RATE_LIMIT_MAX_ATTEMPTS": 10, "DEFAULT_PAGE_SIZE": 20}}' \
     http://localhost:8787/api/kv-admin/configs/batch
```

## 🔧 Quản lý cấu hình động

Dự án có một **hệ thống cấu hình động tiên tiến** sử dụng `dynamicConfig.js` giúp loại bỏ nhu cầu truyền các tham số cấu hình qua các lớp dịch vụ:

### ✨ **Những cải tiến chính:**
- **🎯 Cấu hình tập trung**: Tất cả cấu hình được truy cập thông qua `src/utils/dynamicConfig.js`
- **🚀 API đơn giản hóa**: Không cần truyền các tham số `jwtSecret`, `isRateLimitDisabled`
- **⚙️ Tự động phát hiện**: Các dịch vụ tự động lấy cấu hình từ môi trường
- **🔄 Hệ thống dự phòng**: KV → Biến môi trường → Giá trị mặc định
- **🛡️ An toàn kiểu**: Xác thực và chuyển đổi kiểu tích hợp

### 🔑 **Các hàm cấu hình:**
```javascript
// Cài đặt JWT với dự phòng tự động
const jwtSettings = await getJwtSettings(env);
// Trả về: { secret, accessTokenExpires, refreshTokenExpires }

// Cờ tính năng để kiểm soát phát triển
const featureFlags = await getFeatureFlags(env);
// Trả về: { disableRateLimiting, enableDetailedErrors, autoActivateUserOnRegister, ... }

// Cấu hình ứng dụng
const appConfig = await getAppSettings(env);
// Trả về: { name, version, environment }
```

### 🚀 **Trước và Sau**

**Trước (Truyền tham số thủ công):**
```javascript
// Cách cũ - tham số ở khắp mọi nơi
const authService = createAuthService(c.env);
const jwtSecret = await getJwtSecret(c.env);
const featureFlags = await getFeatureFlags(c.env);
const result = await authService.login(email, password, ipAddress, jwtSecret, featureFlags.disableRateLimiting);
```

**Sau (Cấu hình động):**
```javascript
// Cách mới - cấu hình được xử lý nội bộ
const authService = createAuthService(c.env);
const result = await authService.login(email, password, ipAddress);
// AuthService tự động lấy cấu hình bằng cách sử dụng getJwtSettings() và getFeatureFlags()
```

### 🎯 **Các dịch vụ được hỗ trợ:**
- **AuthService**: Cài đặt JWT tự động và cấu hình giới hạn truy cập
- **UserService**: Cờ tính năng để quản lý người dùng
- **DatabaseService**: Cài đặt hiệu năng và gỡ lỗi
- **Tất cả các dịch vụ**: Kế thừa từ BaseService với quyền truy cập cấu hình được lưu trong bộ đệm

## 🌍 Hệ thống quốc tế hóa động

Dự án này sử dụng một **hệ thống i18n hoàn toàn động** với các tính năng nổi bật bao gồm **thông báo lỗi xác thực đa ngôn ngữ**:

### ✨ **Các tính năng chính:**
✅ **Hoàn toàn động** - Tự động phát hiện ngôn ngữ từ hệ thống tệp  
✅ **Không mã hóa cứng** - Không có danh sách ngôn ngữ được mã hóa cứng  
✅ **Thêm ngôn ngữ bằng một lệnh** - Thêm ngôn ngữ mới chỉ với 1 lệnh  
✅ **Không giới hạn ngôn ngữ** - Hỗ trợ không giới hạn ngôn ngữ  
✅ **Sẵn sàng cho sản xuất** - Xử lý lỗi và dự phòng hoàn chỉnh  
✅ **Xác thực đa ngôn ngữ** - Xác thực Zod nhận biết i18n với thông báo lỗi được bản địa hóa
✅ **Bao phủ toàn API** - Tất cả các điểm cuối API hỗ trợ thông báo lỗi đa ngôn ngữ

### 🎯 **Các ngôn ngữ hiện được hỗ trợ:**
- **Tiếng Anh (`en`)** - Ngôn ngữ mặc định
- **Tiếng Việt (`vi`)** - Hỗ trợ dịch đầy đủ  
- **Tiếng Pháp (`fr`)** - Bao phủ hoàn chỉnh thông báo lỗi xác thực
- **Tiếng Tây Ban Nha (`es`)** - Bao phủ hoàn chỉnh thông báo lỗi xác thực
- **Tiếng Đức (`de`)** - Bao phủ hoàn chỉnh thông báo lỗi xác thực
- **Tiếng Nhật (`ja`)** - Bao phủ hoàn chỉnh thông báo lỗi xác thực
- **Tiếng Thái (`th`)** - Bao phủ hoàn chỉnh thông báo lỗi xác thực
- *...và bất kỳ ngôn ngữ nào khác bạn thêm vào!*

### 🌐 **Hệ thống xác thực đa ngôn ngữ:**
Hệ thống cung cấp **xác thực Zod nhận biết i18n** với thông báo lỗi được bản địa hóa trên tất cả các điểm cuối API:

```javascript
// Ví dụ: Xác thực đăng nhập với thông báo lỗi tiếng Việt
// Request với Accept-Language: vi
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

// Cùng xác thực với tiếng Anh (Accept-Language: en)
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

### 📋 **Các điểm cuối API với xác thực đa ngôn ngữ:**
**Các điểm cuối xác thực** (3 điểm cuối):
- `POST /api/auth/login` - Xác thực đăng nhập
- `POST /api/user/register` - Xác thực đăng ký  
- `POST /api/auth/refresh_token` - Xác thực làm mới token

**Các điểm cuối quản lý người dùng** (4 điểm cuối):
- `GET /api/user/profile` - Xác thực truy cập hồ sơ
- `POST /api/user/change-password` - Xác thực thay đổi mật khẩu
- `POST /api/user/upload` - Xác thực tải lên tệp
- `PUT /api/admin/users/:id` - Xác thực cập nhật người dùng

**Các điểm cuối vận hành admin** (6 điểm cuối):
- Tất cả các điểm cuối admin với xử lý lỗi đa ngôn ngữ toàn diện

**Các điểm cuối hệ thống kiểm toán** (4 điểm cuối):
- Tất cả các điểm cuối kiểm toán với thông báo xác thực được bản địa hóa

**Các điểm cuối sự cố bảo mật** (3 điểm cuối):
- Tất cả các điểm cuối sự cố bảo mật với hỗ trợ đa ngôn ngữ

### 🚀 **Thêm ngôn ngữ siêu dễ dàng:**

```bash
# Thêm tiếng Đức bằng 1 lệnh
node tools/i18n/add-language-demo.js de "German"

# Thêm tiếng Nhật
node tools/i18n/add-language-demo.js ja "Japanese"

# Chỉnh sửa tệp được tạo tự động, khởi động lại ứng dụng → Xong! 🎉
```

### 🌐 **Ưu tiên phát hiện ngôn ngữ:**
1. Tham số truy vấn `?lang=vi` (ưu tiên cao nhất)
2. Phân tích tiêu đề `Accept-Language`
3. Tự động dự phòng về ngôn ngữ mặc định

### 🧪 **Công cụ kiểm thử:**
```bash
# Kiểm tra toàn bộ hệ thống
node tools/i18n/test-dynamic-i18n.js

# Xác minh tối ưu hóa
node tools/i18n/final-verification.js

# Thêm ngôn ngữ mới
node tools/i18n/add-language-demo.js [mã] "[Tên]"
```

### 📖 **Tài liệu hoàn chỉnh:**
Xem chi tiết hệ thống hoàn chỉnh trong [documents/I18N_MASTER_GUIDE_vi.md](./documents/I18N_MASTER_GUIDE_vi.md)

## 🐛 Công cụ kiểm thử hệ thống gỡ lỗi

### 🧪 **Bộ kiểm thử gỡ lỗi toàn diện:**
Dự án bao gồm một bộ kiểm thử hệ thống gỡ lỗi toàn diện nằm trong `tools/debug_log/`:

```bash
# Chạy các kiểm thử hệ thống gỡ lỗi toàn diện
npm run test:debug             # Chạy kiểm thử gỡ lỗi
npm run test:debug:run         # Chạy bằng script shell

# Thực thi trực tiếp
node tools/debug_log/comprehensive_debug_test.js
bash tools/debug_log/run_comprehensive_test.sh
```

### ✅ **Phạm vi kiểm thử:**
- Chức năng hệ thống gỡ lỗi cơ bản
- Xác thực màu sắc và định dạng
- Đối sánh mẫu và lọc không gian tên
- Kiểm thử chức năng bật/tắt
- Xác thực hỗ trợ biến môi trường
- Kiểm thử hiệu năng (hơn 1000 phiên bản gỡ lỗi)
- Các trường hợp đặc biệt và xử lý lỗi
- Kiểm tra trạng thái nội bộ

### 📖 **Tài liệu công cụ gỡ lỗi:**
Xem tài liệu kiểm thử gỡ lỗi hoàn chỉnh:
- **Tiếng Anh**: [tools/debug_log/README.md](./tools/debug_log/README.md)
- **Tiếng Việt**: [tools/debug_log/README_vi.md](./tools/debug_log/README_vi.md)

## 🚀 Bắt đầu nhanh

### Cài đặt nhanh
```bash
# 1. Cài đặt môi trường
npm run setup:dev

# 2. Chạy di chuyển cơ sở dữ liệu
npm run db:migrate

# 3. Khởi tạo cấu hình KV
npm run test:kv:setup

# 4. Khởi động máy chủ phát triển
npm run dev
```

### Các lệnh có sẵn
```bash
# Phát triển
npm run dev              # Máy chủ phát triển (cổng 8787)
npm run test             # Menu kiểm thử tương tác
npm run lint             # Kiểm tra chất lượng mã

# Cấu hình KV
npm run test:kv:setup    # Khởi tạo cấu hình KV
npm run test:kv_admin    # Kiểm thử chức năng KV Admin
npm run test:kv:scripts          # Kiểm thử KV Admin hoàn chỉnh
```

## 📚 **Thống kê tài liệu dự án**

### 📊 **Tổng quan tài liệu**
- **📋 Tổng số tài liệu**: 30 tệp
- **🌍 Hỗ trợ đa ngôn ngữ**: Tiếng Anh (15 tệp) + Tiếng Việt (15 tệp)
- **📚 Tài liệu cốt lõi**: 10 hướng dẫn toàn diện
- **🧪 Tài liệu kiểm thử**: 2 hướng dẫn chuyên sâu
- **🏢 Tài liệu doanh nghiệp**: 3 hướng dẫn nâng cao

### 🎯 **Phân loại nội dung**
- **Cài đặt & Cấu hình**: Setup, Wrangler, Dynamic Config, Database
- **Phát triển & Debug**: Debug Guide, ESLint Guide
- **Xác thực & Bảo mật**: Role Management, Zod Validation, Schemas
- **Quốc tế hóa**: i18n Master Guide với xác thực đa ngôn ngữ
- **Kiểm thử**: Test Framework với 40+ bộ kiểm thử, Scripts tự động hóa
- **Doanh nghiệp**: Audit System, API Reference, KV Configuration

### 🌐 **Hỗ trợ ngôn ngữ**
- **English**: `*.md` (15 tệp)
- **Tiếng Việt**: `*_vi.md` (15 tệp)

---

**Tài liệu này được cập nhật để phản ánh chính xác trạng thái hiện tại của dự án với 30 tệp tài liệu toàn diện.**

Hướng dẫn chi tiết theo chủ đề:

- **[SETUP_GUIDE_vi.md](./documents/SETUP_GUIDE_vi.md)** - Cài đặt môi trường hoàn chỉnh
- **[DEBUG_DEVELOPMENT_GUIDE_vi.md](./documents/DEBUG_DEVELOPMENT_GUIDE_vi.md)** - Quy trình gỡ lỗi & phát triển
- **[TEST_GUIDE_vi.md](./documents/TEST_GUIDE_vi.md)** - Tài liệu kiểm thử toàn diện
- **[ROLE_COMPLETE_GUIDE_vi.md](./documents/ROLE_COMPLETE_GUIDE_vi.md)** - Quản lý admin & quyền hạn
- **[I18N_MASTER_GUIDE_vi.md](./documents/I18N_MASTER_GUIDE_vi.md)** - Hệ thống đa ngôn ngữ với xác thực
- **[ZOD_GUIDE_vi.md](./documents/ZOD_GUIDE_vi.md)** - Xác thực & thiết kế schema
- **[SCHEMAS_GUIDE_vi.md](./documents/SCHEMAS_GUIDE_vi.md)** - Xác thực schema với hỗ trợ i18n
- **[ESLINT_GUIDE_vi.md](./documents/ESLINT_GUIDE_vi.md)** - Chất lượng mã & linting
- **[WRANGLER_CONFIG_GUIDE_vi.md](./documents/WRANGLER_CONFIG_GUIDE_vi.md)** - Cấu hình Cloudflare Workers

### 🏢 **Tài liệu doanh nghiệp:**
- **[ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE_vi.md](./documents/ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE_vi.md)** - Hệ thống kiểm toán doanh nghiệp hoàn chỉnh
- **[AUDIT_API_REFERENCE_vi.md](./documents/AUDIT_API_REFERENCE_vi.md)** - Tham chiếu API cho hơn 40 điểm cuối kiểm toán
- **[AUDIT_KV_CONFIGURATION_GUIDE_vi.md](./documents/AUDIT_KV_CONFIGURATION_GUIDE_vi.md)** - Cấu hình kiểm toán nâng cao
- **[DATABASE_SERVICE_vi.md](./documents/DATABASE_SERVICE_vi.md)** - Dịch vụ & hoạt động cơ sở dữ liệu
- **[DYNAMIC_CONFIG_GUIDE_vi.md](./documents/DYNAMIC_CONFIG_GUIDE_vi.md)** - Quản lý cấu hình động

---

*Dự án này đã sẵn sàng cho sản xuất và được tài liệu hóa đầy đủ. Kiểm tra thư mục documents/ để có hướng dẫn toàn diện về tất cả các chủ đề.*

## 🚀 Lệnh & Bắt đầu nhanh

### Lệnh phát triển
```bash
# Phát triển cơ bản
npm run dev                    # Khởi động máy chủ phát triển
npm run dev:debug             # Khởi động với ghi log gỡ lỗi đầy đủ
npm run dev:debug:validation  # Chỉ gỡ lỗi xác thực
npm run dev:debug:zod         # Chỉ gỡ lỗi xác thực Zod
npm run dev:debug:i18n        # Chỉ gỡ lỗi chức năng i18n

# Cài đặt cơ sở dữ liệu
npm run db:migrate            # Chạy di chuyển cơ sở dữ liệu
npm run setup:dev             # Cài đặt phát triển hoàn chỉnh
```

### Lệnh sản xuất
```bash
# Triển khai sản xuất
npm run deploy                # Triển khai lên Cloudflare Workers
npm run db:migrate:prod       # Chạy di chuyển cơ sở dữ liệu sản xuất
npm run secret:put:prod       # Đặt bí mật sản xuất
```

---

*Trạng thái: ✅ HOÀN THÀNH & SẴN SÀNG CHO SẢN XUẤT*
