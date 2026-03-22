# 📚 Hướng Dẫn Bộ Kiểm Thử Toàn Diện - Hệ Thống Kiểm Toán Doanh Nghiệp Hono

> 🌐 Language / Ngôn ngữ: [English](TEST_GUIDE.md) | **Tiếng Việt**

> **Tài Liệu Kiểm Thử Hoàn Chỉnh - Hướng Dẫn Hợp Nhất Tất Cả Trong Một**
>
> 📅 **Cập nhật lần cuối**: 4 tháng 8, 2025
> 📊 **Trạng thái**: ✅ Sẵn sàng cho Production - Hệ Thống Kiểm Toán Doanh Nghiệp với Admin Message Translation Testing
> 🔄 **Bảo trì**: Đang hoạt động & Cập nhật
> 🏢 **Phạm vi**: Hệ thống kiểm toán doanh nghiệp với 57+ endpoint qua 4 nhóm route

---

## 📖 Mục Lục

1.  [🎯 Tổng Quan](#-tổng-quan)
2.  [🚀 Bắt Đầu Nhanh](#-bắt-đầu-nhanh)
3.  [📊 Trạng Thái Hệ Thống](#-trạng-thái-hệ-thống)
4.  [📁 Cấu Trúc Kiểm Thử](#-cấu-trúc-kiểm-thử)
5.  [🔧 Phương Pháp Thực Thi Kiểm Thử](#-phương-pháp-thực-thi-kiểm-thử)
6.  [🏢 Chi Tiết Kiểm Thử Hệ Thống Kiểm Toán Doanh Nghiệp](#-chi-tiết-kiểm-thử-hệ-thống-kiểm-toán-doanh-nghiệp)
7.  [🔐 Mẫu Kiểm Thử Xác Thực](#-mẫu-kiểm-thử-xác-thực)
8.  [⚙️ Cấu Hình & Môi Trường](#️-cấu-hình--môi-trường)
9.  [🛡️ Kiểm Soát Truy Cập Dựa Trên Vai Trò](#️-kiểm-soát-truy-cập-dựa-trên-vai-trò)
10. [🎉 Bộ Kiểm Thử Hợp Nhất](#-bộ-kiểm-thử-hợp-nhất)
11. [📜 Script Kiểm Thử & Tự Động Hóa](#-script-kiểm-thử--tự-động-hóa)
12. [🔍 Kiểm Thử Thủ Công với CURL](#-kiểm-thử-thủ-công-với-curl)
13. [📊 Phạm Vi Kiểm Thử](#-phạm-vi-kiểm-thử)
14. [🎯 Phân Tích Coverage Routes Hoàn Chỉnh](#-phân-tích-coverage-routes-hoàn-chỉnh)
15. [🗂️ Quản Lý Tệp](#️-quản-lý-tệp)
16. [🔍 Xử Lý Sự Cố](#-xử-lý-sự-cố)
17. [🤝 Đóng Góp](#-đóng-góp)

---

## 🎯 Tổng Quan

Tài liệu này là nguồn chuẩn duy nhất cho các lệnh kiểm thử trong repository. Các guide khác chỉ nên giữ quick start ngắn gọn và trỏ về đây khi cần ma trận lệnh đầy đủ, coverage theo vai trò, audit suites và hướng dẫn xử lý sự cố.

### Bộ Kiểm Thử Này Là Gì?

Bộ kiểm thử Hệ Thống Kiểm Toán Doanh Nghiệp Hono là một framework kiểm thử toàn diện được thiết kế cho:

-   ✅ **Hệ Thống Kiểm Toán Doanh Nghiệp** - 57+ endpoint qua 4 nhóm route chính
-   ✅ **Nhiều Cấu Trúc Kiểm Thử** - Các phương pháp tiếp cận mới có cấu trúc, hợp nhất và kế thừa
-   ✅ **Kiểm Soát Truy Cập Dựa Trên Vai Trò** - Kiểm thử RBAC toàn diện
-   ✅ **Giám Sát Thời Gian Thực** - Hệ thống giám sát và cảnh báo trực tiếp
-   ✅ **Quản Lý Sự Cố Bảo Mật** - Phát hiện và phản ứng với mối đe dọa
-   ✅ **Phân Tích Nâng Cao** - Business intelligence và báo cáo tuân thủ
-   ✅ **Kiểm Thử Bảo Mật** - SQL injection, XSS, rate limiting
-   ✅ **Kiểm Thử Hiệu Năng** - Kiểm thử tải và giám sát thời gian phản hồi
-   ✅ **Kiểm Thử i18n** - Quốc tế hóa và phát hiện ngôn ngữ
-   ✅ **Kiểm Thử Admin Message Translation** - Validation localization message dựa trên vai trò

### Lợi Ích Chính

| Tính Năng | Giá Trị | Cải Tiến |
| :--- | :--- | :--- |
| **Hệ Thống Kiểm Toán Doanh Nghiệp** | 57+ endpoint kiểm toán | 4 nhóm route chuyên biệt |
| **Giám Sát Thời Gian Thực** | 22+ endpoint giám sát | Cảnh báo và dashboard trực tiếp |
| **Quản Lý Sự Cố Bảo Mật** | 8+ endpoint bảo mật | Phản ứng tự động với mối đe dọa |
| **Phân Tích Nâng Cao** | 14+ endpoint phân tích | Business intelligence & tuân thủ |
| **Tổ Chức Kiểm Thử** | Có sẵn nhiều phương pháp tiếp cận | Sử dụng linh hoạt |
| **Kiểm Thử Admin Message Translation** | Validation localization message admin | Coverage translation hoàn chỉnh |
| **Bảo Trì Mã** | Các tùy chọn module và hợp nhất | Dễ bảo trì |
| **Phạm Vi Kiểm Thử** | Toàn diện | Phạm vi API 100% |
| **Trải Nghiệm Nhà Phát Triển** | Menu tương tác + script trực tiếp | Trực quan |
| **Tích Hợp CI/CD** | Tất cả các phương pháp kiểm thử đều hỗ trợ tự động hóa | Sẵn sàng cho production |

---

## 🚀 Bắt Đầu Nhanh

### Lệnh Nhanh Được Đề Xuất

```bash
# 🎯 ĐỀ XUẤT: Menu kiểm thử tương tác
npm run test

# ⚡ Xác thực nhanh (nhanh nhất)
npm run test:quick

# 🏢 KIỂM THỬ HỆ THỐNG KIỂM TOÁN DOANH NGHIỆP (Đề xuất)
npm run test:audit:system      # Kiểm thử hệ thống kiểm toán 4 giai đoạn
npm run test:audit:comprehensive # Kiểm thử toàn diện hệ thống kiểm toán

# 🔒 Kiểm thử bảo mật
npm run test:security

# 👥 Kiểm thử dựa trên vai trò
npm run test:role

# 🌍 Kiểm thử i18n message translation (Mới)
npm run test:admin:i18n

# � Kiểm thử Email & Kích hoạt tài khoản
npm run test:activation        # Kiểm thử luồng kích hoạt tài khoản
npm run test:email:content     # Kiểm thử bản địa hóa nội dung email
npm run test:email:provider    # Kiểm thử tích hợp nhà cung cấp email

# �📊 Bộ kiểm thử hoàn chỉnh (bao gồm hệ thống kiểm toán)
npm run test:unified
```

### Kiểm Thử Hệ Thống Kiểm Toán Doanh Nghiệp

```bash
# Kiểm thử nhanh hệ thống kiểm toán
npm run test:audit:quick

# Kiểm thử từng nhóm route kiểm toán
npm run test:audit:core        # Core audit endpoints (/api/audit/*)
npm run test:audit:advanced    # Advanced analytics (/api/advanced-audit/*)
npm run test:audit:realtime    # Real-time monitoring (/api/realtime-monitoring/*)  
npm run test:audit:security    # Security incident management (/api/security-incident/*)

# Kiểm thử tự động toàn diện (57+ endpoints)
bash tests/scripts/unified-audit-test.sh comprehensive
```

### Thiết Lập Lần Đầu

```bash
# 1. Cài đặt các dependencies
npm install

# 2. Thiết lập môi trường phát triển
npm run setup:dev

# 3. Chạy các migration cơ sở dữ liệu
npm run db:migrate

# 4. Chạy xác thực nhanh
npm run test:unified:quick
```

---

## 📊 Trạng Thái Hệ Thống

### 🏗️ Cơ Sở Hạ Tầng Kiểm Thử Hiện Tại

**Tổng Số Tệp Kiểm Thử**: 30+ tệp (bao gồm hệ thống kiểm toán doanh nghiệp)
**Script Kiểm Thử NPM**: 25+ script (bao gồm kiểm toán chuyên biệt)
**Shell Script**: 15+ script bao gồm tự động hóa kiểm toán
**Hỗ Trợ Môi Trường**: 3 môi trường (dev, test, staging)
**Phạm Vi Vai Trò**: 3 vai trò (user, admin, super_admin)
**Menu Tương Tác**: 15+ ngữ cảnh kiểm thử + hệ thống kiểm toán doanh nghiệp
**Hệ Thống Kiểm Toán**: 57+ endpoint qua 4 nhóm route chính

### ✅ Chỉ Số Chất Lượng & Phân Tích Coverage Routes

-   **Phạm Vi Danh Mục Kiểm Thử**: 25+ danh mục - ✅ Hoàn thành (bao gồm hệ thống kiểm toán doanh nghiệp)
-   **Số Dòng Mã Kiểm Thử**: 10,000+ dòng (được tăng cường với hệ thống kiểm toán)
-   **Endpoint API Được Bao Phủ**: **100% coverage** - Tất cả **75 routes** qua **12 categories** được test đầy đủ
-   **Chi Tiết Coverage Routes**:
    - `system` (6/6) - ✅ 100% | `assets` (5/5) - ✅ 100% | `auth` (3/3) - ✅ 100%
    - `user` (5/5) - ✅ 100% | `admin` (9/9) - ✅ 100% | `kv_admin` (4/4) - ✅ 100%
    - `audit` (4/4) - ✅ 100% | `advanced_audit` (11/11) - ✅ 100%
    - `realtime_monitoring` (12/12) - ✅ 100% | `security_incident` (8/8) - ✅ 100%
    - `translations` (4/4) - ✅ 100% | `zod_demo` (4/4) - ✅ 100%
-   **Quyền Vai Trò**: Kiểm thử RBAC toàn diện + kiểm soát truy cập kiểm toán
-   **Môi Trường**: Hỗ trợ 3 môi trường với cấu hình kiểm toán
-   **Ngôn Ngữ**: Kiểm thử i18n cho 7+ ngôn ngữ + địa phương hóa kiểm toán
-   **Phương Pháp Thực Thi Kiểm Thử**: 4 phương pháp (tương tác, script npm, script shell, tự động hóa kiểm toán)
-   **Hệ Thống Kiểm Toán**: ✅ Ghi nhật ký kiểm toán cấp doanh nghiệp với kiểm thử 4 giai đoạn qua 4 nhóm route
-   **Tối Ưu Hóa Tệp**: ✅ Toàn diện 35+ tổng số tệp (bao gồm kiểm thử kiểm toán chuyên biệt)

### 🏢 Hệ Thống Kiểm Toán Doanh Nghiệp

#### **4 NHÓM ROUTE KIỂM TOÁN CHÍNH**

1. **Core Audit Routes** (`/api/audit/*`) - 6 endpoint
   - Ghi nhật ký kiểm toán cơ bản và hoạt động cốt lõi
   - Yêu cầu quyền Admin+ 

2. **Advanced Analytics Routes** (`/api/advanced-audit/*`) - 15 endpoint  
   - Phân tích nâng cao, lưu trữ và báo cáo tuân thủ
   - Yêu cầu quyền Super Admin

3. **Real-time Monitoring Routes** (`/api/realtime-monitoring/*`) - 22+ endpoint
   - Giám sát hệ thống thời gian thực và phát hiện mối đe dọa
   - Yêu cầu quyền Super Admin

4. **Security Incident Routes** (`/api/security-incident/*`) - 8+ endpoint
   - Quản lý sự cố bảo mật và điều phối phản ứng
   - Yêu cầu quyền Super Admin

### 🎯 Cải Tiến Gần Đây (17 tháng 1, 2025)

#### ✅ Hệ Thống Kiểm Toán Doanh Nghiệp Hoàn Chỉnh

-   57+ endpoint kiểm toán qua 4 nhóm route chuyên biệt
-   Kiểm thử 4 giai đoạn toàn diện
-   Giám sát thời gian thực và quản lý sự cố bảo mật
-   Phân tích nâng cao và báo cáo tuân thủ

#### ✅ Lợi Ích Đạt Được

1.  **Hệ Thống Kiểm Toán Doanh Nghiệp**: 57+ endpoint với phạm vi toàn diện
2.  **Giám Sát Thời Gian Thực**: 22+ endpoint cho giám sát trực tiếp
3.  **Quản Lý Sự Cố Bảo Mật**: 8+ endpoint cho phản ứng với mối đe dọa
4.  **Phân Tích Nâng Cao**: 14+ endpoint cho business intelligence
5.  **Kiểm Thử 4 Giai Đoạn**: Xác thực toàn diện từ cơ bản đến nâng cao
6.  **Tài Liệu Toàn Diện**: Hướng dẫn đầy đủ cho hệ thống doanh nghiệp

### 📁 Tổng Quan Cấu Trúc Kiểm Thử Hiện Tại

```
tests/
├── 📄 Tài liệu (1 tệp)
│   └── README.md                    # Hướng dẫn toàn diện hợp nhất này
├── 🎯 Cơ sở hạ tầng cốt lõi (4 tệp)
│   ├── mainMenu.js                  # Menu CLI tương tác
│   ├── unifiedTestSuite.js          # Bộ kiểm thử hợp nhất
│   ├── init                         # Tệp khởi tạo
│   │   └── reset.sql                # Khởi tạo cơ sở dữ liệu
│   │   └── kv_config.json           # Cấu hình Cloudflare KV
│   └── config/testConfig.js         # Cấu hình tập trung
├── 🧪 Tệp kiểm thử (21 tệp) - Phạm vi toàn diện bao gồm Kiểm toán Doanh nghiệp
│   ├── systemTest.js                # Chức năng hệ thống cốt lõi + kiểm thử cấu hình
│   ├── authTest.js                  # Xác thực & JWT
│   ├── regularUserTest.js           # Chức năng người dùng thông thường (15 bài kiểm thử) - Chỉ hồ sơ cá nhân
│   ├── adminUserTest.js             # Chức năng người dùng admin (9 bài kiểm thử) - Quản lý người dùng/bảng điều khiển, không có quyền truy cập Super Admin
│   ├── superAdminUserTest.js        # Chức năng người dùng super admin (12 bài kiểm thử) - Toàn quyền kiểm soát hệ thống
│   ├── kvAdminTest.js               # Kiểm thử quản lý cấu hình KV (14 bài kiểm thử) - Chỉ super admin
│   ├── securityTest.js              # Bảo mật & rate limiting
│   ├── xssSecurityTest.js           # Kiểm thử bảo mật XSS
│   ├── comprehensiveI18nTest.js     # Kiểm thử i18n & translation toàn diện
│   ├── performanceTest.js           # Kiểm thử hiệu năng & tải
│   ├── integrationTest.js           # Tích hợp từ đầu đến cuối
│   ├── validationTest.js            # Xác thực chung
│   ├── zodValidationTest.js         # Xác thực schema Zod
│   ├── quickTest.js                 # Kiểm thử nhanh (smoke test)
│   ├── roleTest.js                  # Kiểm soát truy cập dựa trên vai trò
│   └── 📊 KIỂM THỬ HỆ THỐNG KIỂM TOÁN - Cấp Doanh Nghiệp (8 tệp)
│       ├── auditSystemTest.js           # Kiểm thử hệ thống kiểm toán hoàn chỉnh
│       ├── advancedAuditComprehensiveTest.js # Phân tích nâng cao (/api/advanced-audit/*)
│       ├── auditPerformanceTest.js      # Điểm chuẩn hiệu năng kiểm toán
│       ├── realtimeMonitoringTest.js    # Giám sát thời gian thực (/api/realtime-monitoring/*)
│       ├── securityIncidentTest.js      # Quản lý sự cố bảo mật (/api/security-incident/*)
│       ├── archivalServiceTest.js       # Lưu trữ & giữ lại dữ liệu
│       ├── optimizedServiceTest.js      # Tối ưu hóa & bộ nhớ đệm dịch vụ
│       └── simpleAuditTest.js           # Xác thực kiểm toán nhanh với bộ nhớ đệm token
├── 🛠️ Tiện ích kiểm thử (6 tệp)
│   ├── createTestAdminUsers.js      # Tạo người dùng admin kiểm thử
│   ├── createTestAdminUsersService.js # Tiện ích dịch vụ người dùng admin
│   ├── setupTestUsers.js            # Thiết lập người dùng kiểm thử
│   ├── testAssertions.js            # Hàm khẳng định tùy chỉnh
│   ├── testClient.js                # HTTP client để kiểm thử
│   └── testLogger.js                # Tiện ích ghi nhật ký kiểm thử
└── 📜 Script kiểm thử (18 tệp - Bao gồm Tự động hóa Kiểm toán)
    ├── CURL_COMMANDS.md             # Lệnh kiểm thử thủ công
    └── test-system-health.sh        # Giám sát sức khỏe hệ thống
```

---

## 📁 Cấu Trúc Kiểm Thử

Bộ kiểm thử cung cấp một **phương pháp tiếp cận toàn diện và có tổ chức** với nhiều phương pháp thực thi và phân tách rõ ràng theo chức năng:

### 🎯 Hệ Thống Menu Kiểm Thử Tương Tác

```
tests/
├── 📋 mainMenu.js              # Menu CLI tương tác - điểm vào chính
```

### 🎉 Bộ Kiểm Thử Hợp Nhất (Đề xuất cho CI/CD)

```
tests/
├── unifiedTestSuite.js         # Bộ kiểm thử toàn diện tất cả trong một
```

### 🧪 Ngữ Cảnh Kiểm Thử Riêng Lẻ (Đã tinh gọn - 16 tệp)

```
tests/
├── 🔧 systemTest.js            # Chức năng hệ thống cốt lõi + kiểm thử cấu hình
├── 🔐 authTest.js              # Kiểm thử Xác thực & JWT
├── 👤 regularUserTest.js       # Kiểm thử chức năng Vai trò Người dùng thông thường - Truy cập hạn chế, chỉ hồ sơ cá nhân
├── 👨‍💼 adminUserTest.js        # Kiểm thử chức năng Vai trò Người dùng Admin - Quản lý người dùng & bảng điều khiển, không có quyền truy cập Super Admin
├── 👑 superAdminUserTest.js     # Kiểm thử chức năng Vai trò Người dùng Super Admin - Toàn quyền kiểm soát hệ thống, tất cả người dùng & vai trò
├── ⚙️ kvAdminTest.js           # Kiểm thử quản lý cấu hình KV - Chỉ super admin, CRUD cấu hình
├── 🛡️ securityTest.js          # Kiểm thử Bảo mật & rate limiting
├── 🔒 xssSecurityTest.js        # Kiểm thử bảo mật XSS
├── 🌍 comprehensiveI18nTest.js # Kiểm thử i18n & translation toàn diện
├── 📬 adminMessageTranslationTest.js # Kiểm thử i18n message translation cho admin routes
├── 🌐 multiLanguageValidationErrorTest.js # Kiểm thử lỗi validation Zod đa ngôn ngữ
├── 📧 activationTest.js        # Kiểm thử luồng kích hoạt tài khoản (12+ test)
├── 📧 emailContentTest.js      # Kiểm thử bản địa hóa nội dung email
├── 📧 emailProviderHeaderTest.js # Kiểm thử tích hợp nhà cung cấp email
├── ⚡ performanceTest.js       # Kiểm thử Hiệu năng & tải
├── 🔗 integrationTest.js       # Kiểm thử Tích hợp từ đầu đến cuối
├── ✅ validationTest.js        # Kiểm thử Xác thực chung
├── ✅ zodValidationTest.js     # Kiểm thử schema Zod
├── 🔧 i18nValidatorExtensionTest.js # Kiểm thử tích hợp schema registry + i18n validator
├── ⚡ quickTest.js             # Kiểm thử nhanh (smoke test)
└── 🎭 roleTest.js              # Kiểm thử kiểm soát truy cập dựa trên vai trò
```

### 📜 Script Tự Động Hóa & Kiểm Thử Thủ Công

```
tests/scripts/
├── CURL_COMMANDS.md             # Tham khảo lệnh kiểm thử thủ công
├── CURL_COMMANDS_vi.md          # Lệnh kiểm thử thủ công (Tiếng Việt)
├── admin_user.sh                # Bộ kiểm thử curl Vai trò Người dùng Admin
├── regular_user.sh              # Bộ kiểm thử curl Vai trò Người dùng thông thường
├── super_admin_user.sh          # Bộ kiểm thử curl Vai trò Người dùng Super Admin
├── test_all_roles.sh            # Kiểm thử toàn diện các vai trò
├── run-all-tests.sh             # Chạy bộ kiểm thử hoàn chỉnh (đầu ra chi tiết)
├── run-all-tests-quick.sh       # Chạy kiểm thử nhanh (đầu ra tối thiểu)
├── all-roles-comparison.sh      # So sánh chức năng các vai trò
├── test-rbac-comprehensive.sh   # Kiểm thử RBAC toàn diện
├── test-environments.sh         # Kiểm thử môi trường
├── test-favicon.sh              # Kiểm thử favicon
└── test-system-health.sh        # Kiểm thử sức khỏe hệ thống
├── test-environments.sh       # Kiểm thử đa môi trường
├── test-favicon.sh            # Kiểm thử endpoint favicon
├── test-rbac-comprehensive.sh # Kiểm thử RBAC toàn diện
└── test-system-health.sh      # Kiểm thử giám sát sức khỏe hệ thống
```

### 🛠️ Cơ Sở Hạ Tầng & Tệp Hỗ Trợ Kiểm Thử

```
tests/
├── config/                     # Cấu hình kiểm thử
│   └── testConfig.js          # Cấu hình & dữ liệu kiểm thử tập trung
├── utils/                      # Tiện ích & hàm trợ giúp dùng chung
│   ├── createTestAdminUsers.js # Tiện ích tạo người dùng admin kiểm thử
│   ├── createTestAdminUsersService.js # Tiện ích dịch vụ người dùng admin
│   ├── setupTestUsers.js      # Tiện ích thiết lập người dùng kiểm thử
│   ├── testAssertions.js      # Hàm khẳng định kiểm thử tùy chỉnh
│   ├── testClient.js          # HTTP client để kiểm thử API
│   └── testLogger.js          # Tiện ích ghi nhật ký kiểm thử
└── init                       # Tệp khởi tạo
    └── reset.sql              # Khởi tạo cơ sở dữ liệu để kiểm thử
    └── kv_config.json         # Cấu hình Cloudflare KV để kiểm thử
```

*Lưu ý: Tài liệu kiểm thử được cung cấp trong `/documents/TEST_GUIDE.md`*

---

## 🏢 Chi Tiết Kiểm Thử Hệ Thống Kiểm Toán Doanh Nghiệp

### **4 NHÓM ROUTE KIỂM TOÁN CHÍNH - PHẠM VI TOÀN DIỆN**

Hệ Thống Kiểm Toán Doanh Nghiệp được tổ chức thành **4 nhóm route chính** (`src/routes/`), mỗi nhóm phục vụ chức năng kiểm toán riêng biệt:

#### **1. Core Audit Routes** (`src/routes/audit.js`)
**Mục đích**: Chức năng ghi nhật ký kiểm toán cơ bản và hoạt động kiểm toán thiết yếu
- **Route Prefix**: `/api/audit/`
- **Phân quyền**: Yêu cầu vai trò Admin+  
- **Tính năng chính**: Ghi nhật ký cơ bản, tìm kiếm, thống kê, xuất dữ liệu, sức khỏe hệ thống
- **Endpoints**: 6 endpoint cốt lõi cho hoạt động kiểm toán cơ bản
- **Sử dụng**: Giao diện ghi nhật ký kiểm toán chính cho tất cả hoạt động hệ thống

#### **2. Advanced Analytics Routes** (`src/routes/advancedAudit.js`)
**Mục đích**: Phân tích nâng cao, lưu trữ và tính năng báo cáo tuân thủ
- **Route Prefix**: `/api/advanced-audit/`
- **Phân quyền**: Yêu cầu vai trò Super Admin (cấp truy cập cao nhất)
- **Tính năng chính**: Dashboard phân tích, phân tích xu hướng, báo cáo toàn diện, tuân thủ
- **Endpoints**: 14+ endpoint nâng cao cho phân tích cấp doanh nghiệp  
- **Sử dụng**: Thông tin chi tiết sâu, business intelligence, báo cáo tuân thủ quy định

#### **3. Real-time Monitoring Routes** (`src/routes/realtimeMonitoring.js`)
**Mục đích**: Giám sát hệ thống thời gian thực và khả năng phát hiện mối đe dọa
- **Route Prefix**: `/api/realtime-monitoring/`
- **Phân quyền**: Yêu cầu vai trò Super Admin (quan trọng về bảo mật)
- **Tính năng chính**: Giám sát trực tiếp, cảnh báo thời gian thực, streaming dashboard, phát hiện mối đe dọa
- **Endpoints**: 22+ endpoint giám sát cho giám sát hệ thống toàn diện
- **Sử dụng**: Giám sát hệ thống trực tiếp, phát hiện mối đe dọa bảo mật, cảnh báo thời gian thực

#### **4. Security Incident Routes** (`src/routes/securityIncident.js`)
**Mục đích**: Quản lý sự cố bảo mật và điều phối phản ứng
- **Route Prefix**: `/api/security-incident/`
- **Phân quyền**: Yêu cầu vai trò Super Admin (hoạt động bảo mật)
- **Tính năng chính**: Tạo sự cố, quản lý, điều phối phản ứng, phân tích mối đe dọa
- **Endpoints**: 8+ endpoint quản lý sự cố cho phản ứng bảo mật hoàn chỉnh
- **Sử dụng**: Phản ứng sự cố bảo mật, quản lý mối đe dọa, điều phối hoạt động bảo mật

### Phạm Vi Kiểm Thử Toàn Diện

Hệ thống kiểm toán doanh nghiệp của chúng tôi bao gồm kiểm thử toàn diện qua 4 nhóm route chính với 57+ API endpoint:

#### Core Audit System (`/api/audit/*` - 6 endpoints)
- Tạo và truy xuất nhật ký kiểm toán cơ bản
- Theo dõi hoạt động người dùng
- Ghi nhật ký sự kiện hệ thống  
- Xuất dữ liệu kiểm toán
- Quản lý cấu hình

#### Advanced Audit Analytics (`/api/advanced-audit/*` - 15 endpoints)
- Phân tích và báo cáo nâng cao
- Phân tích xu hướng và phát hiện mẫu
- Báo cáo tuân thủ
- Tổng hợp dữ liệu và chỉ số
- Tạo báo cáo tùy chỉnh
- Phân tích hiệu năng

#### Real-time Monitoring System (`/api/realtime-monitoring/*` - 22+ endpoints)
- Số hóa hệ thống trực tiếp
- Streaming sự kiện thời gian thực
- Thu thập chỉ số hiệu năng
- Giám sát sức khỏe hệ thống
- Quản lý cảnh báo
- Theo dõi sử dụng tài nguyên
- Giám sát mạng
- Giám sát hiệu năng ứng dụng

#### Security Incident Management (`/api/security-incident/*` - 8+ endpoints)
- Phát hiện sự cố bảo mật
- Phân tích và phản ứng mối đe دọa
- Tài liệu sự cố
- Quản lý cảnh báo bảo mật
- Theo dõi vi phạm tuân thủ
- Thu thập dữ liệu pháp y

### Giai Đoạn Thực Thi Kiểm Thử

#### Giai đoạn 1: Xác thực Hệ thống Cốt lõi
- Xác thực và phân quyền
- Hoạt động CRUD cơ bản
- Xác minh tính toàn vẹn dữ liệu
- Xác thực xử lý lỗi

#### Giai đoạn 2: Kiểm thử Tính năng Nâng cao
- Hoạt động phân tích phức tạp
- Tạo báo cáo
- Độ chính xác tổng hợp dữ liệu
- Đánh giá hiệu năng

#### Giai đoạn 3: Kiểm thử Hệ thống Thời gian Thực
- Xác thực streaming sự kiện
- Tính nhất quán dữ liệu thời gian thực
- Độ chính xác giám sát
- Chức năng hệ thống cảnh báo

#### Giai đoạn 4: Kiểm thử Bảo mật & Tuân thủ
- Xử lý sự cố bảo mật
- Xác thực kiểm soát truy cập
- Độ chính xác báo cáo tuân thủ
- Xác minh bảo mật dữ liệu

### Tệp Kiểm Thử Chính

- `auditSystemTest.js`: Kiểm thử hệ thống kiểm toán hoàn chỉnh 4 giai đoạn
- `advancedAuditComprehensiveTest.js`: Kiểm thử phân tích kiểm toán nâng cao
- `realtimeMonitoringTest.js`: Kiểm thử hệ thống giám sát thời gian thực
- `securityIncidentTest.js`: Kiểm thử quản lý sự cố bảo mật  
- `auditPerformanceTest.js`: Đánh giá hiệu năng
- `auditLogServiceIntegrationTest.js`: Kiểm thử tích hợp
- `archivalServiceTest.js`: Kiểm thử lưu trữ và lưu giữ dữ liệu

## 🔧 Phương Pháp Thực Thi Kiểm Thử

### Phương Pháp 1: Menu Tương Tác (Đề xuất)

```bash
# Khởi chạy menu tương tác
npm run test
# hoặc
node tests/mainMenu.js

# Tùy chọn menu (15+ ngữ cảnh + nhanh + hệ thống kiểm toán doanh nghiệp):
# 1 - Kiểm thử Hệ thống        (Chức năng hệ thống cốt lõi + kiểm thử cấu hình)
# 2 - Kiểm thử Xác thực        (Đăng nhập, token JWT, xác thực mật khẩu, refresh token)
# 3 - Kiểm thử Vai trò Người dùng thông thường (Chức năng người dùng, quản lý hồ sơ, các hoạt động liên quan đến người dùng)
# 4 - Kiểm thử Vai trò Admin   (Chức năng admin, quản lý người dùng, hoạt động hệ thống)
# 5 - Kiểm thử Vai trò Super Admin (Kiểm soát hệ thống hoàn toàn, tất cả người dùng & vai trò, truy cập kiểm toán)
# 6 - Kiểm thử Bảo mật        (Rate limiting, xác thực đầu vào, header bảo mật)
# 7 - Kiểm thử Dịch thuật     (Quốc tế hóa + tích hợp i18n, phát hiện ngôn ngữ)
# 7a- Admin Message Translation Tests (i18n admin message validation & role translations - MỚI)
# 8 - Kiểm thử Dựa trên Vai trò (Bộ kiểm thử theo vai trò - user, admin, super-admin)
# 9 - Kiểm thử KV Admin       (Quản lý cấu hình KV - Chỉ super admin)
# 10 - Kiểm thử Hiệu năng     (Kiểm thử tải, thời gian phản hồi, yêu cầu đồng thời)
# 11 - Kiểm thử Tích hợp      (Quy trình từ đầu đến cuối, tích hợp thành phần)
# 12 - Kiểm thử Xác thực      (Xác thực chung, khử trùng đầu vào)
# 13 - Kiểm thử Xác thực Zod  (Xác thực schema Zod, khử trùng đầu vào)
# 14 - Kiểm thử Bảo mật XSS   (Bảo vệ XSS và kiểm thử bảo mật)
# 15+ - KIỂM THỬ HỆ THỐNG KIỂM TOÁN DOANH NGHIỆP (Nhiều ngữ cảnh kiểm toán)
#     ├── Kiểm thử Hệ thống Kiểm toán    (Kiểm thử hệ thống kiểm toán hoàn chỉnh 4 giai đoạn)
#     ├── Kiểm thử Core Audit           (Core audit endpoints /api/audit/*)
#     ├── Kiểm thử Advanced Audit       (Advanced analytics /api/advanced-audit/*)
#     ├── Giám sát Thời gian Thực       (Live monitoring /api/realtime-monitoring/*)
#     ├── Kiểm thử Security Incident    (Incident management /api/security-incident/*)
#     ├── Kiểm thử Hiệu năng Audit      (Performance benchmarking)
#     └── ... (các ngữ cảnh kiểm toán chuyên biệt bổ sung)
# q - Kiểm thử Nhanh           (Kiểm thử smoke nhanh cho phát triển)
# x - Thoát
```

### Phương Pháp 2: Kiểm Thử Ngữ Cảnh Trực Tiếp

```bash
# Bộ kiểm thử hợp nhất (Đề xuất cho kiểm thử tự động)
npm run test:unified           # Bộ kiểm thử toàn diện hoàn chỉnh
npm run test:unified:quick     # Kiểm thử xác thực nhanh
npm run test:unified:system    # Kiểm thử chức năng hệ thống
npm run test:unified:auth      # Kiểm thử xác thực
npm run test:unified:user      # Kiểm thử Vai trò Người dùng thông thường
npm run test:unified:admin     # Kiểm thử Vai trò Admin
npm run test:unified:superadmin # Kiểm thử Vai trò Super Admin
npm run test:unified:rbac      # Kiểm thử kiểm soát truy cập dựa trên vai trò
npm run test:unified:security  # Kiểm thử bảo mật
npm run test:unified:translation # Kiểm thử i18n
npm run test:unified:audit     # Kiểm thử hệ thống kiểm toán doanh nghiệp
npm run test:unified:performance # Kiểm thử hiệu năng
npm run test:unified:help      # Hiển thị tùy chọn kiểm thử hợp nhất có sẵn

# Ngữ cảnh kiểm thử riêng lẻ
npm run test:system            # Kiểm thử hệ thống
npm run test:auth              # Kiểm thử xác thực
npm run test:regular_user      # Kiểm thử Vai trò Người dùng thông thường
npm run test:admin_user        # Kiểm thử Vai trò Admin
npm run test:super_admin_user  # Kiểm thử Vai trò Super Admin
npm run test:security          # Kiểm thử bảo mật
npm run test:i18n              # Kiểm thử i18n
npm run test:multilang_validation # Kiểm thử lỗi xác thực đa ngôn ngữ Zod
npm run test:activation        # Kiểm thử luồng kích hoạt tài khoản
npm run test:email:content     # Kiểm thử bản địa hóa nội dung email
npm run test:email:provider    # Kiểm thử tích hợp nhà cung cấp email
npm run test:kv_admin          # Kiểm thử quản lý cấu hình KV
npm run test:role              # Kiểm thử kiểm soát truy cập dựa trên vai trò
npm run test:performance       # Kiểm thử hiệu năng
npm run test:integration       # Kiểm thử tích hợp
npm run test:validation        # Kiểm thử xác thực
npm run test:quick             # Kiểm thử smoke nhanh

# Kiểm thử xác thực chuyên biệt
npm run test:zod_validation    # Kiểm thử xác thực Zod
node tests/i18nValidatorExtensionTest.js # Kiểm thử tích hợp schema registry

# Kiểm thử Bảo mật XSS
npm run test:xss:all           # Kiểm thử Bảo mật XSS

# KIỂM THỬ HỆ THỐNG KIỂM TOÁN DOANH NGHIỆP
npm run test:audit:system      # Kiểm thử hệ thống kiểm toán hoàn chỉnh (4 giai đoạn)
npm run test:audit:core        # Core audit endpoints (/api/audit/*)
npm run test:audit:advanced    # Advanced audit analytics (/api/advanced-audit/*)
npm run test:audit:realtime    # Real-time monitoring (/api/realtime-monitoring/*)
npm run test:audit:security    # Security incident management (/api/security-incident/*)
npm run test:audit:performance # Audit system performance benchmarking
npm run test:audit:integration # Audit log service integration
npm run test:audit:archival    # Data archival and retention testing
npm run test:audit:endpoints   # Complete audit endpoint coverage (57+ endpoints)
npm run test:audit:quick       # Quick audit validation
npm run test:audit:comprehensive # Comprehensive audit system testing
```

### Phương Pháp 3: Tự Động Hóa Hệ Thống Kiểm Toán Doanh Nghiệp

```bash
# Kiểm thử hệ thống kiểm toán toàn diện (57+ endpoints)
bash tests/scripts/unified-audit-test.sh comprehensive

# Xác thực kiểm toán nhanh
bash tests/scripts/unified-audit-test.sh quick

# Kiểm thử các danh mục kiểm toán cụ thể
bash tests/scripts/unified-audit-test.sh core      # Core audit endpoints
bash tests/scripts/unified-audit-test.sh advanced  # Advanced audit features
bash tests/scripts/unified-audit-test.sh realtime  # Real-time monitoring
bash tests/scripts/unified-audit-test.sh security  # Security incident management

# Kiểm thử endpoint hoàn chỉnh với curl
bash tests/scripts/unified-audit-test.sh endpoints

# Thực thi tệp kiểm thử JavaScript
bash tests/scripts/unified-audit-test.sh js-core       # Core audit JS tests
bash tests/scripts/unified-audit-test.sh js-advanced   # Advanced audit JS tests
bash tests/scripts/unified-audit-test.sh js-realtime   # Real-time monitoring JS tests
bash tests/scripts/unified-audit-test.sh js-security   # Security incident JS tests

# Phân tích hiệu năng và hệ thống
bash tests/scripts/unified-audit-test.sh performance   # Performance analysis
bash tests/scripts/unified-audit-test.sh system        # System integration
```
# 4 - Kiểm thử Vai trò Admin        (Chức năng admin, quản lý người dùng, các hoạt động hệ thống)
# 5 - Kiểm thử Bảo mật         (Rate limiting, xác thực đầu vào, header bảo mật)
# 6 - Kiểm thử Dịch thuật      (Quốc tế hóa + tích hợp i18n, phát hiện ngôn ngữ)
# 6a - Kiểm thử Admin Message Translation (Validation i18n message cho admin routes - MỚI)
# 7 - Kiểm thử Dựa trên Vai trò   (Các bộ kiểm thử theo vai trò - user, admin, super-admin)
# 8 - Kiểm thử Hệ thống Kiểm toán (Ghi nhật ký kiểm toán doanh nghiệp, phân tích, giám sát)
# 9 - Kiểm thử Hiệu năng      (Kiểm thử tải, thời gian phản hồi, yêu cầu đồng thời)
# 10 - Kiểm thử Tích hợp     (Quy trình từ đầu đến cuối, tích hợp thành phần)
# 11 - Kiểm thử Xác thực      (Xác thực chung, làm sạch đầu vào)
# 12 - Kiểm thử Xác thực Zod  (Xác thực schema Zod, làm sạch đầu vào)
# q - Kiểm thử Nhanh            (Kiểm thử nhanh để phát triển)
# x - Thoát
```

### Phương Pháp 2: Kiểm Thử Ngữ Cảnh Trực Tiếp

```bash
# Bộ kiểm thử hợp nhất (Đề xuất cho kiểm thử tự động)
npm run test:unified           # Bộ kiểm thử toàn diện hoàn chỉnh
npm run test:unified:quick     # Kiểm thử xác thực nhanh
npm run test:unified:system    # Kiểm thử chức năng hệ thống
npm run test:unified:auth      # Kiểm thử xác thực
npm run test:unified:user      # Kiểm thử Vai trò Người dùng thông thường
npm run test:unified:admin     # Kiểm thử Vai trò Admin
npm run test:unified:superadmin # Kiểm thử Vai trò Super Admin
npm run test:unified:rbac      # Kiểm thử kiểm soát truy cập dựa trên vai trò
npm run test:unified:security  # Kiểm thử bảo mật
npm run test:unified:translation # Kiểm thử i18n
npm run test:unified:audit     # Kiểm thử doanh nghiệp hệ thống kiểm toán
npm run test:unified:performance # Kiểm thử hiệu năng
npm run test:unified:help      # Hiển thị các tùy chọn kiểm thử hợp nhất có sẵn

# Ngữ cảnh kiểm thử riêng lẻ
npm run test:system            # Kiểm thử hệ thống
npm run test:auth              # Kiểm thử xác thực
npm run test:regular_user      # Kiểm thử Vai trò Người dùng thông thường
npm run test:admin_user        # Kiểm thử Vai trò Admin
npm run test:super_admin_user  # Kiểm thử Vai trò Super Admin
npm run test:security          # Kiểm thử bảo mật
npm run test:i18n              # Kiểm thử i18n
npm run test:admin:i18n        # Kiểm thử i18n message translation cho admin routes (MỚI)
npm run test:admin:messages:script # Automated admin message test runner (MỚI)
npm run test:multilang_validation # Kiểm thử lỗi validation Zod đa ngôn ngữ
npm run test:audit             # Kiểm thử doanh nghiệp hệ thống kiểm toán
npm run test:role              # Kiểm thử kiểm soát truy cập dựa trên vai trò
npm run test:performance       # Kiểm thử hiệu năng
npm run test:integration       # Kiểm thử tích hợp
npm run test:validation        # Kiểm thử xác thực
npm run test:quick             # Kiểm thử nhanh

# Kiểm thử xác thực chuyên biệt
npm run test:zod_validation    # Kiểm thử xác thực Zod

# Kiểm thử bảo mật XSS
npm run test:xss:all           # Kiểm thử Bảo mật XSS
```

### 🌐 **Kiểm Thử Lỗi Validation Đa Ngôn Ngữ**

**Kiểm thử Lỗi Validation Đa Ngôn Ngữ** (`multiLanguageValidationErrorTest.js`) cung cấp validation toàn diện của error messages schema Zod qua nhiều ngôn ngữ:

#### **📋 Phạm Vi Kiểm Thử**
- **Ngôn ngữ được Kiểm thử**: Japanese (ja), German (de), French (fr), Spanish (es), Thai (th)
- **Nhóm Route**: 8 nhóm route API chính
- **Loại Validation**: Field requirements, formats, types, ranges, custom rules
- **Kịch bản Kiểm thử**: Localization lỗi, tính nhất quán response, xử lý Unicode

#### **🎯 Nhóm Route được Kiểm thử**
1. **Authentication Routes** (`/api/auth/*`) - Login, registration, password validation
2. **User Management Routes** (`/api/user/*`) - Profile updates, thông tin user
3. **Admin Operations Routes** (`/api/admin/*`) - Tạo user, updates, thay đổi role
4. **Audit System Routes** (`/api/audit/*`) - Log queries, advanced operations
5. **Security Incident Routes** (`/api/security-incident/*`) - Báo cáo/cập nhật sự cố
6. **KV Admin Routes** (`/api/kv-admin/*`) - Quản lý cấu hình
7. **Real-time Monitoring Routes** (`/api/realtime-monitoring/*`) - Alerts, cấu hình
8. **Zod Demo Routes** (`/api/zod_demo/*`) - Registration, search, upload validation

#### **🔍 Error Patterns Đặc trưng theo Ngôn ngữ**
- **Japanese (ja)**: `必須` (required), `メール` (email), `パスワード` (password), `無効` (invalid)
- **German (de)**: `erforderlich`, `e-mail`, `passwort`, `ungültig`
- **French (fr)**: `requis`, `email`, `mot de passe`, `invalide`
- **Spanish (es)**: `requerido`, `correo`, `contraseña`, `inválido`
- **Thai (th)**: `จำเป็น`, `อีเมล`, `รหัสผ่าน`, `ไม่ถูกต้อง`

#### **💡 Cách Sử dụng**
```bash
# Thực thi trực tiếp
node tests/multiLanguageValidationErrorTest.js

# Qua npm script
npm run test:multilang_validation

# Qua test menu
npm run test  # Chọn option multi-language validation
```

### 🔧 **Kiểm Thử Tích Hợp Schema Registry**

**Kiểm thử Tích hợp Schema Registry** (`i18nValidatorExtensionTest.js`) cung cấp kiểm thử toàn diện cho hệ thống schema registry tập trung quản lý 46 schemas trên 10 categories:

#### **📋 Phạm Vi Kiểm Thử**
- **Hệ thống Schema Registry**: Chức năng registry cốt lõi và caching
- **Tạo Validator**: Tự động tạo validator middleware
- **Categories Schema**: Tất cả 10 categories (auth, user, admin, audit, v.v.)
- **Schemas Đa ngôn ngữ**: Tạo và validation i18n schema
- **Kiểm thử Hiệu suất**: Hiệu suất cache và tối ưu registry
- **Tích hợp Tool**: Command-line tools và utilities quản lý

#### **🎯 Tính năng Cốt lõi Được Kiểm thử**
1. **Hoạt động Registry** - Tải schema, caching, và truy xuất
2. **Tạo Validator** - Tạo 46 pre-built validator functions
3. **Validation Schema** - Tính nhất quán registry và phát hiện lỗi
4. **Quản lý Cache** - Tối ưu hiệu suất và analytics cache
5. **Hỗ trợ Đa ngôn ngữ** - Tạo i18n schema trên 7 ngôn ngữ
6. **Tích hợp Tool** - Chức năng command-line management tool

#### **🔍 Categories Kiểm thử**
- **Registry Functions Cơ bản**: `getSchema()`, `validateSchemaName()`, `getCacheStats()`
- **Validator Middleware**: Tự động tạo validator functions và middleware
- **Categories Schema**: 10 categories với 46 schemas tổng cộng
- **Metrics Hiệu suất**: Cache hit rates, load times, optimization
- **Xử lý Lỗi**: Invalid schemas, missing schemas, fallback strategies
- **Tool Commands**: CLI tool validation và interactive features

#### **💡 Sử dụng**
```bash
# Thực thi trực tiếp
node tests/i18nValidatorExtensionTest.js

# Qua test menu
npm run test  # Chọn schema registry option

# Schema management tools
npm run tool:schema:demo      # Quản lý schema tương tác
npm run tool:schema:list      # Liệt kê tất cả 46 schemas
npm run tool:schema:validate  # Validate tính nhất quán registry
```

### 🌍 **Kiểm Thử Admin Message Translation (MỚI)**

**Kiểm thử Admin Message Translation** (`adminMessageTranslationTest.js`) cung cấp validation toàn diện cho i18n message translations trong admin routes, đảm bảo localization tên role đúng cách và formatting message:

#### **🎯 Vấn Đề Đã Được Giải Quyết**
Sửa lỗi khi admin route messages hiển thị raw role values ("admin", "super_admin") thay vì proper translations ("Administrator", "Super Administrator").

**Trước**: `"New user created with admin role"` ❌  
**Sau**: `"New user created with Administrator role"` ✅

#### **📋 Coverage Kiểm Thử**
- **8 Admin Routes**: Validation message hoàn chỉnh trên tất cả admin endpoints
- **16+ Scenarios Kiểm Thử**: Role translations trong contexts khác nhau
- **4 Ngôn Ngữ**: Validation translation message EN, VI, FR, ES
- **Messages Dựa trên Role**: Cả Admin và Super Admin access level messages

#### **🔍 Tính Năng Được Kiểm Thử**
- ✅ **Role Display Names**: `user` → `User`, `admin` → `Administrator`, `super_admin` → `Super Administrator`
- ✅ **Success Message Formatting**: Interpolation phức tạp với role names, timestamps, user details
- ✅ **Error Message Localization**: Proper role translations trong error responses
- ✅ **Pluralization Handling**: `1 user` vs `5 users`, `1 change` vs `3 changes`
- ✅ **Date/Time Formatting**: Formatting timestamp nhất quán trên messages
- ✅ **Access Control Messages**: Role-based restriction messages với proper translations
- ✅ **Multi-Language Support**: Tính nhất quán message trên các ngôn ngữ được hỗ trợ

#### **🧪 Scenarios Kiểm Thử**
1. **User List Messages** - Role filtering và access level messages
2. **User Creation** - Role translation trong creation success messages  
3. **User Updates** - Role translation trong update success messages
4. **Role Changes** - Old/new role translations trong change notifications
5. **User Deletion** - Role translation trong deletion confirmation messages
6. **Dashboard Access** - Access level indicators (limited vs full access)
7. **System Stats** - Data scope messages (filtered vs complete data)
8. **Access Restrictions** - Role-based restriction messages

#### **💡 Cách Sử Dụng**
```bash
# Phương pháp 1: Automated (Khuyến nghị)
npm run dev:test                     # Start test server trong một terminal
npm run test:admin:messages:script   # Chạy automated test trong terminal khác

# Phương pháp 2: Direct execution
npm run dev:test                     # Start test server
npm run test:admin:i18n              # Chạy test trực tiếp

# Phương pháp 3: Script execution
npm run dev:test                     # Start test server
./tests/scripts/test-admin-messages.sh  # Chạy test script

# Phương pháp 4: Via test menu
npm run test  # Chọn "Admin Message Translation Tests" option
```

#### **🔍 Expected Output**
```
🌍 Starting Admin Routes i18n Message Translation Tests
========================================================

🔑 Setting up Admin authentication...
✅ Admin authentication setup completed

📝 User list message: "Successfully retrieved 3 users (showing 3 on page 1 of 1). Requested by Test Admin User (Administrator)"
✅ testUserListMessages (Admin) passed

📝 User creation message: "New user Message Test User created with User role. Created by Test Admin User (Administrator) Created at 8/4/2025, 2:46:51 PM"
✅ testUserCreationMessages (Admin) passed

🌍 Testing multi-language message translations...
📝 VI message: "Đã lấy thành công 3 người dùng..."
✅ VI language test passed

✅ All Admin Message Translation Tests passed!

Test Summary:
✅ Role display name translations: 25 tests
✅ Success message formatting: 15 tests  
✅ Multi-language support: 4 languages
✅ Total assertions: 64 passed, 0 failed
```

```
npm run test:xss:all           # Kiểm thử bảo mật XSS
```

## 📊 **Chi Tiết Kiểm Thử Hệ Thống Kiểm Toán Doanh Nghiệp**

### **4 NHÓM ROUTE KIỂM TOÁN CHÍNH - CHI TIẾT ĐẦY ĐỦ**

Hệ Thống Kiểm Toán Doanh Nghiệp được tổ chức thành **4 nhóm route chính** (`src/routes/`), mỗi nhóm phục vụ chức năng kiểm toán riêng biệt:

#### **1. Route Kiểm Toán Cốt Lõi** (`src/routes/audit.js`)

**Mục đích**: Chức năng ghi nhật ký kiểm toán thiết yếu và các hoạt động kiểm toán cơ bản
-   **Tiền tố Route**: `/api/audit/`
-   **Phân quyền**: Yêu cầu vai trò Admin+
-   **Tính năng chính**: Ghi nhật ký cơ bản, tìm kiếm, thống kê, xuất, sức khỏe hệ thống
-   **Endpoint**: 10 endpoint cốt lõi cho các hoạt động kiểm toán cơ bản
-   **Sử dụng**: Giao diện ghi nhật ký kiểm toán chính cho tất cả các hoạt động của hệ thống

#### **2. Route Phân Tích Nâng Cao** (`src/routes/advancedAudit.js`)

**Mục đích**: Các tính năng phân tích nâng cao, lưu trữ và báo cáo tuân thủ
-   **Tiền tố Route**: `/api/advanced-audit/`
-   **Phân quyền**: Yêu cầu vai trò Super Admin (cấp truy cập cao nhất)
-   **Tính năng chính**: Bảng điều khiển phân tích, phân tích xu hướng, báo cáo toàn diện, tuân thủ
-   **Endpoint**: 15+ endpoint nâng cao cho phân tích cấp doanh nghiệp
-   **Sử dụng**: Thông tin chuyên sâu, trí tuệ kinh doanh, báo cáo tuân thủ quy định

#### **3. Route Giám Sát Thời Gian Thực** (`src/routes/realtimeMonitoring.js`)

**Mục đích**: Khả năng giám sát hệ thống và phát hiện mối đe dọa trong thời gian thực
-   **Tiền tố Route**: `/api/realtime-monitoring/`
-   **Phân quyền**: Yêu cầu vai trò Super Admin (quan trọng về bảo mật)
-   **Tính năng chính**: Luồng hoạt động trực tiếp, phiên hoạt động, cảnh báo hệ thống, giám sát hiệu năng
-   **Endpoint**: 12+ endpoint giám sát cho khả năng hiển thị hệ thống trong thời gian thực
-   **Sử dụng**: Bảng điều khiển trực tiếp, giám sát bảo mật, theo dõi hiệu năng

#### **4. Route Sự Cố Bảo Mật** (`src/routes/securityIncident.js`)

**Mục đích**: Quản lý sự cố bảo mật và hệ thống phản ứng tự động
-   **Tiền tố Route**: `/api/security-incident/`
-   **Phân quyền**: Yêu cầu vai trò Admin+ (quản lý sự cố)
-   **Tính năng chính**: Hoạt động CRUD sự cố, quy trình phản ứng, phân tích mối đe dọa
-   **Endpoint**: 10+ endpoint quản lý sự cố cho các hoạt động bảo mật
-   **Sử dụng**: Vòng đời sự cố bảo mật, phản ứng mối đe dọa, báo cáo sự cố

### Mẫu & Thực Hành Tốt Nhất Kiểm Thử Hệ Thống Kiểm Toán

```bash
# Kiểm thử Hệ thống Kiểm toán - 4 Giai đoạn Cấp Doanh nghiệp
# Giai đoạn 1: Kiểm toán Cốt lõi (/api/audit/*)
npm run test:core-audit       # Chức năng ghi nhật ký kiểm toán cốt lõi

# Giai đoạn 2: Phân tích Nâng cao (/api/advanced-audit/*)
npm run test:advanced-audit   # Phân tích & báo cáo nâng cao
node tests/advancedAuditComprehensiveTest.js

# Giai đoạn 3: Giám sát Thời gian thực (/api/realtime-monitoring/*)
npm run test:realtime-audit   # Giám sát hệ thống thời gian thực
node tests/realtimeMonitoringTest.js

# Giai đoạn 4: Quản lý Sự cố Bảo mật (/api/security-incident/*)
npm run test:security-incident # Phản ứng sự cố bảo mật
node tests/securityIncidentTest.js

# Kiểm thử Hiệu năng & Tối ưu hóa
npm run test:audit-performance # Điểm chuẩn hiệu năng kiểm toán
node tests/auditPerformanceTest.js
node tests/optimizedServiceTest.js  # Kiểm thử tối ưu hóa dịch vụ

# Kiểm thử Quản lý Dữ liệu
npm run test:audit-archival   # Kiểm thử lưu trữ & giữ lại dữ liệu
node tests/archivalServiceTest.js

# Kiểm thử Hệ thống Toàn diện
npm run test:audit-system     # Kiểm thử hệ thống kiểm toán hoàn chỉnh (tất cả các giai đoạn)
node tests/auditSystemTest.js

# Kiểm thử Xác thực Nhanh
npm run test:audit-simple     # Xác thực kiểm toán nhanh với bộ nhớ đệm
node tests/simpleAuditTest.js
```

### Phạm Vi Endpoint API Kiểm Toán

**Route Kiểm Toán Cốt Lõi** (/api/audit/*)
-   ✅ GET /logs - Lấy nhật ký kiểm toán với bộ lọc
-   ✅ POST /log - Tạo mục nhật ký kiểm toán mới
-   ✅ GET /logs/:id - Lấy nhật ký kiểm toán cụ thể
-   ✅ DELETE /logs/:id - Xóa nhật ký kiểm toán (chỉ admin)
-   ✅ GET /stats - Thống kê kiểm toán
-   ✅ POST /cleanup - Dọn dẹp nhật ký cũ
-   ✅ GET /export - Xuất nhật ký kiểm toán
-   ✅ GET /users/:userId - Nhật ký kiểm toán theo người dùng cụ thể
-   ✅ GET /actions - Các hành động kiểm toán có sẵn
-   ✅ GET /health - Sức khỏe hệ thống kiểm toán

**Route Phân Tích Nâng Cao** (/api/advanced-audit/*)
-   ✅ GET /analytics - Bảng điều khiển phân tích nâng cao
-   ✅ GET /trends - Phân tích xu hướng sử dụng
-   ✅ GET /reports - Báo cáo kiểm toán toàn diện
-   ✅ GET /performance-metrics - Chỉ số hiệu năng hệ thống
-   ✅ GET /user-activity-analysis - Phân tích mẫu hoạt động của người dùng
-   ✅ GET /security-analysis - Phân tích sự kiện bảo mật
-   ✅ GET /data-insights - Thông tin chuyên sâu & đề xuất dữ liệu
-   ✅ GET /compliance-reports - Báo cáo tuân thủ
-   ✅ GET /custom-queries - Thực thi truy vấn tùy chỉnh
-   ✅ GET /dashboard-widgets - Dữ liệu widget bảng điều khiển

**Route Giám Sát Thời Gian Thực** (/api/realtime-monitoring/*)
-   ✅ GET /live-activity - Luồng hoạt động hệ thống trực tiếp
-   ✅ GET /active-sessions - Các phiên người dùng đang hoạt động
-   ✅ GET /system-alerts - Cảnh báo & thông báo hệ thống
-   ✅ GET /performance-monitor - Giám sát hiệu năng thời gian thực
-   ✅ GET /security-monitor - Giám sát sự kiện bảo mật
-   ✅ GET /health-checks - Kiểm tra sức khỏe hệ thống
-   ✅ GET /resource-usage - Giám sát sử dụng tài nguyên
-   ✅ GET /error-tracking - Theo dõi & phân tích lỗi
-   ✅ GET /api-usage - Thống kê sử dụng API
-   ✅ GET /concurrent-users - Giám sát người dùng đồng thời

**Route Quản Lý Sự Cố Bảo Mật** (/api/security-incident/*)
-   ✅ GET /incidents - Danh sách sự cố bảo mật
-   ✅ POST /incidents - Tạo sự cố bảo mật
-   ✅ GET /incidents/:id - Lấy sự cố cụ thể
-   ✅ PUT /incidents/:id - Cập nhật sự cố
-   ✅ DELETE /incidents/:id - Xóa sự cố
-   ✅ GET /incident-types - Các loại sự cố có sẵn
-   ✅ GET /response-procedures - Quy trình phản ứng sự cố
-   ✅ GET /threat-analysis - Phân tích mối đe dọa bảo mật
-   ✅ GET /incident-reports - Báo cáo sự cố
-   ✅ POST /incident-alerts - Tạo cảnh báo sự cố

### Kiểm Thử Kiểm Toán Dựa Trên Vai Trò

```bash
# Kiểm thử Kiểm toán Vai trò Admin
TEST_ROLE=admin npm run test:audit
# - Truy cập nhật ký kiểm toán đầy đủ
# - Có thể xóa nhật ký kiểm toán
# - Truy cập tất cả các phân tích
# - Quản lý sự cố bảo mật

# Kiểm thử Kiểm toán Vai trò Super Admin
TEST_ROLE=super_admin npm run test:audit
# - Truy cập hệ thống kiểm toán hoàn chỉnh
# - Thay đổi cấu hình hệ thống
# - Các tính năng bảo mật nâng cao
# - Quản lý lưu trữ dữ liệu

# Kiểm thử Kiểm toán Vai trò User
TEST_ROLE=user npm run test:audit
# - Truy cập nhật ký kiểm toán hạn chế (chỉ nhật ký của chính mình)
# - Thống kê kiểm toán cơ bản
# - Quyền truy cập chỉ đọc vào các báo cáo
```

### Phương Pháp 3: Kiểm Thử Dựa Trên Vai Trò

```bash
# Kiểm thử vai trò cá nhân
npm run test:regular_user      # Kiểm thử Vai trò Người dùng thông thường
npm run test:admin_user        # Kiểm thử Vai trò Admin
npm run test:super_admin_user  # Kiểm thử Vai trò Super Admin

# Script tự động hóa kiểm thử vai trò
bash tests/scripts/regular_user.sh         # Kiểm thử curl Vai trò Người dùng thông thường
bash tests/scripts/admin_user.sh           # Kiểm thử curl Vai trò Admin
bash tests/scripts/super_admin_user.sh     # Kiểm thử curl Vai trò Super Admin
bash tests/scripts/test_all_roles.sh       # Kiểm thử toàn diện tất cả các vai trò
```

### Phương Pháp 4: Script Tự Động

```bash
# Chạy bộ kiểm thử hoàn chỉnh
bash tests/scripts/run-all-tests.sh        # Đầu ra chi tiết với thống kê
bash tests/scripts/run-all-tests-quick.sh  # Đầu ra tối thiểu nhanh cho CI/CD

# Kiểm thử thủ công dựa trên vai trò (script curl)
bash tests/scripts/regular_user.sh         # Kiểm thử curl Vai trò Người dùng thông thường
bash tests/scripts/admin_user.sh           # Kiểm thử curl Vai trò Admin
bash tests/scripts/super_admin_user.sh     # Kiểm thử curl Vai trò Super Admin
bash tests/scripts/test_all_roles.sh       # Kiểm thử toàn diện tất cả các vai trò

# Script tự động hóa chuyên biệt
bash tests/scripts/all-roles-comparison.sh     # Kiểm thử so sánh vai trò
bash tests/scripts/test-environments.sh        # Kiểm thử đa môi trường
bash tests/scripts/test-favicon.sh             # Kiểm thử favicon
bash tests/scripts/test-rbac-comprehensive.sh  # Kiểm thử RBAC toàn diện
bash tests/scripts/test-system-health.sh       # Kiểm thử sức khỏe hệ thống

# Script Tự động hóa Hệ thống Kiểm toán
bash tests/scripts/unified-audit-test.sh core          # Kiểm thử chức năng kiểm toán cốt lõi
bash tests/scripts/unified-audit-test.sh advanced      # Kiểm thử phân tích nâng cao
bash tests/scripts/unified-audit-test.sh realtime      # Kiểm thử giám sát thời gian thực
bash tests/scripts/unified-audit-test.sh security      # Kiểm thử sự cố bảo mật
bash tests/scripts/unified-audit-test.sh performance   # Điểm chuẩn hiệu năng kiểm toán
bash tests/scripts/unified-audit-test.sh comprehensive      # Kiểm thử hệ thống kiểm toán hoàn chỉnh
bash tests/scripts/test_all_roles.sh       # Kiểm thử curl tất cả các vai trò

# Script kiểm thử chuyên biệt
bash tests/scripts/all-roles-comparison.sh     # So sánh chức năng các vai trò
bash tests/scripts/test-environments.sh        # Kiểm thử đa môi trường
bash tests/scripts/test-favicon.sh             # Kiểm thử endpoint favicon
bash tests/scripts/test-rbac-comprehensive.sh  # Kiểm thử RBAC toàn diện
bash tests/scripts/test-system-health.sh       # Kiểm thử giám sát sức khỏe hệ thống
```

### Phương Pháp 5: Khởi Tạo Cơ Sở Dữ Liệu

```bash
# Khởi tạo cơ sở dữ liệu kiểm thử (tự động chạy bởi các script kiểm thử)
npm run test:initdb

# Đặt lại cơ sở dữ liệu thủ công để kiểm thử
wrangler d1 execute hono-auth-api-db-test --local --env test --file tests/init/reset.sql
```

---

## 🔐 Mẫu Kiểm Thử Xác Thực

### Tổng Quan

Tất cả các tệp kiểm thử hiện tại đã được cập nhật để sử dụng `this.client.setAuthToken()` thay vì truyền header `Authorization` thủ công. Cách tiếp cận này cung cấp:

-   Giảm trùng lặp mã
-   Bảo trì dễ dàng hơn
-   Giảm khả năng xảy ra lỗi khi sao chép/dán header
-   Mã sạch hơn và dễ đọc hơn

### Mẫu Sử Dụng

#### Cách tiếp cận cũ (không khuyến khích):

```javascript
const response = await this.client.get(API_ENDPOINTS.profile, {
  Authorization: `Bearer ${this.accessToken}`
});
```

#### Cách tiếp cận mới (khuyến nghị):

```javascript
// Đặt token một lần trong phương thức setup
this.client.setAuthToken(this.accessToken);

// Tất cả các yêu cầu tiếp theo sẽ tự động bao gồm header Authorization
const response = await this.client.get(API_ENDPOINTS.profile);
```

### Mẫu Kiểm Thử Xác Thực Tiêu Chuẩn

```javascript
class YourTests {
  constructor() {
    this.client = new TestClient(TEST_CONFIG.baseUrl);
    this.assert = TestAssertions;
    this.accessToken = null;
  }

  async setupAuth() {
    // 1. Đăng nhập để lấy token
    const response = await this.client.post(API_ENDPOINTS.login, this.testUser);
    this.accessToken = response.data.data.access_token;

    // 2. Đặt token cho tất cả các yêu cầu tiếp theo
    this.client.setAuthToken(this.accessToken);

    // 3. Xác minh xác thực (tùy chọn)
    const profileResponse = await this.client.get(API_ENDPOINTS.profile);
  }

  async testSomeFeature() {
    // Không cần truyền header Authorization - tự động được đặt
    const response = await this.client.get(API_ENDPOINTS.someEndpoint);
    // Logic kiểm thử...
  }
}
```

### Kiểm Thử Đa Vai Trò

Khi các bài kiểm thử cần nhiều vai trò, bạn có thể:

1.  **Tạo nhiều phiên bản TestClient:**

```javascript
class MultiRoleTests {
  constructor() {
    this.adminClient = new TestClient();
    this.userClient = new TestClient();
  }

  async setupAuth() {
    // Thiết lập admin
    const adminResponse = await this.adminClient.post(API_ENDPOINTS.login, TEST_USERS.admin);
    this.adminClient.setAuthToken(adminResponse.data.data.access_token);

    // Thiết lập user
    const userResponse = await this.userClient.post(API_ENDPOINTS.login, TEST_USERS.user);
    this.userClient.setAuthToken(userResponse.data.data.access_token);
  }
}
```

2.  **Hoặc chuyển đổi token khi cần:**

```javascript
async testWithDifferentRoles() {
  // Kiểm thử với vai trò admin
  this.client.setAuthToken(this.adminToken);
  const adminResponse = await this.client.get(API_ENDPOINTS.adminDashboard);

  // Kiểm thử với vai trò user
  this.client.setAuthToken(this.userToken);
  const userResponse = await this.client.get(API_ENDPOINTS.profile);
}
```

### Các Phương Thức Tiện Ích Có Sẵn

TestClient cung cấp các phương thức để quản lý xác thực:

```javascript
// Đặt token
this.client.setAuthToken(token);

// Xóa token (kiểm thử các kịch bản không được phép)
this.client.clearAuthToken();

// Kiểm tra token hiện tại
console.log(this.client.defaultHeaders.Authorization);
```

### Các Tệp Kiểm Thử Đã Cập Nhật

Tất cả các tệp kiểm thử đã được cập nhật để tuân theo mẫu mới:

-   `tests/adminUserTest.js`
-   `tests/regularUserTest.js`
-   `tests/superAdminUserTest.js`
-   `tests/authTest.js`
-   `tests/auditSystemTest.js`
-   `tests/performanceTest.js`
-   `tests/securityTest.js`
-   `tests/quickTest.js`
-   `tests/advancedAuditComprehensiveTest.js`
-   `tests/realtimeMonitoringTest.js`
-   `tests/validationTest.js`
-   `tests/securityIncidentTest.js`
-   `tests/comprehensiveI18nTest.js` (kiểm thử i18n tổng hợp)
-   `tests/quickTest.js`
-   `tests/auditPerformanceTest.js`
-   `tests/integrationTest.js`

### Ghi Chú Quan Trọng

1.  **Luôn gọi `setAuthToken()` sau khi đăng nhập thành công**
2.  **Chỉ cần gọi một lần cho mỗi phiên**
3.  **Sử dụng `clearAuthToken()` khi kiểm thử các kịch bản không được phép**
4.  **Khi kiểm thử với nhiều vai trò, hãy xem xét việc tạo nhiều phiên bản client**

---

## 🛡️ Kiểm Thử Dựa Trên Vai Trò

### Cấu Trúc & Năng Lực Vai Trò

**Năng Lực Vai Trò Admin Nâng Cao**:
-   ✅ Admin hiện có thể tạo người dùng với vai trò `admin`
-   ✅ Admin hiện có thể xóa người dùng với vai trò `admin` và `user`
-   ✅ Admin hiện có thể thay đổi vai trò người dùng giữa `user` và `admin`
-   ❌ Admin vẫn không thể tạo người dùng `super_admin`
-   ❌ Admin vẫn không thể xóa người dùng `super_admin`
-   ❌ Admin vẫn không thể thăng cấp người dùng lên vai trò `super_admin`

### Ma Trận Phân Quyền

| Endpoint | Người dùng thông thường | Admin | Super Admin | Phạm Vi Kiểm Thử |
| :--- | :--- | :--- | :--- | :--- |
| `GET /api/admin/users` | ❌ 403 | ✅ (lọc) | ✅ (tất cả) | ✅ Tất cả vai trò |
| `POST /api/admin/users` | ❌ 403 | ✅ (user/admin) | ✅ (bất kỳ vai trò nào) | ✅ Tất cả vai trò |
| `PUT /api/admin/users/:id` | ❌ 403 | ✅ (không có vai trò) | ✅ (không có vai trò) | ✅ Tất cả vai trò |
| `DELETE /api/admin/users/:id` | ❌ 403 | ✅ (không phải super_admin) | ✅ | ✅ Tất cả vai trò |
| `PUT /api/admin/users/:id/role` | ❌ 403 | ✅ (user↔admin) | ✅ | ✅ Tất cả vai trò |
| `GET /api/admin/stats` | ❌ 403 | ✅ | ✅ | ✅ Tất cả vai trò |

#### ⚙️ Endpoint Quản Lý Cấu Hình KV (Chỉ Super Admin)
| Endpoint | Phương thức | Phạm vi | Tệp kiểm thử |
| :--- | :--- | :--- | :--- |
| `/api/kv-admin/configs` | GET | ✅ Hoàn thành | kvAdminTest.js, unifiedTestSuite.js |
| `/api/kv-admin/configs/defaults` | GET | ✅ Hoàn thành | kvAdminTest.js, unifiedTestSuite.js |
| `/api/kv-admin/configs` | POST | ✅ Hoàn thành | kvAdminTest.js, unifiedTestSuite.js |
| `/api/kv-admin/configs/:key` | GET | ✅ Hoàn thành | kvAdminTest.js, unifiedTestSuite.js |
| `/api/kv-admin/configs/:key` | PUT | ✅ Hoàn thành | kvAdminTest.js, unifiedTestSuite.js |
| `/api/kv-admin/configs/:key` | DELETE | ✅ Hoàn thành | kvAdminTest.js, unifiedTestSuite.js |

#### 🌍 Endpoint Dịch/i18n
| Endpoint | Phương thức | Phạm vi | Tệp kiểm thử |
| :--- | :--- | :--- | :--- |
| `/api/translations` | GET | ✅ Hoàn thành | comprehensiveI18nTest.js, unifiedTestSuite.js |
| Tất cả endpoint với `?lang=` | ALL | ✅ Hoàn thành | comprehensiveI18nTest.js, integrationTest.js |
| Phát hiện ngôn ngữ qua header | ALL | ✅ Hoàn thành | comprehensiveI18nTest.js, integrationTest.js |

#### ⚙️ Endpoint Hệ Thống

| Endpoint | Phương thức | Phạm vi | Tệp kiểm thử |
| :--- | :--- | :--- | :--- |
| `/health` | GET | ✅ Hoàn thành | systemTest.js, quickTest.js |
| `/favicon.ico` | GET | ✅ Hoàn thành | systemTest.js, tests/scripts/test-favicon.sh |
| `/api` | GET | ✅ Hoàn thành | systemTest.js, integrationTest.js |

### 🛡️ Phạm Vi Kiểm Thử Bảo Mật

#### ✅ Xác Thực Bảo Mật Toàn Diện
-   **🔒 Bảo Mật Xác Thực**: Xác thực JWT, hết hạn token, xoay vòng refresh token
-   **🛡️ Kiểm Thử Phân Quyền**: Xác thực kiểm soát truy cập dựa trên vai trò (RBAC)
-   **⚡ Rate Limiting**: Rate limiting dựa trên IP, ngăn chặn lạm dụng API
-   **🔐 Xác Thực Đầu Vào**: Ngăn chặn XSS, bảo vệ khỏi SQL injection
-   **🌐 Kiểm Thử CORS**: Cấu hình chia sẻ tài nguyên chéo nguồn gốc
-   **📝 Làm Sạch Dữ Liệu**: Làm sạch đầu vào và mã hóa đầu ra
-   **🔑 Bảo Mật Mật Khẩu**: Xác thực hashing, độ phức tạp mật khẩu

### 🌍 Phạm Vi Quốc Tế Hóa (i18n)

#### ✅ Kiểm Thử i18n Hoàn Chỉnh
-   **🗣️ Phát Hiện Ngôn Ngữ**: Phân tích header Accept-Language
-   **🌐 Lựa Chọn Ngôn Ngữ Rõ Ràng**: Hỗ trợ tham số truy vấn `?lang=`
-   **📝 Độ Chính Xác Của Bản Dịch**: Tất cả các thông báo lỗi và phản hồi
-   **🔄 Tải Ngôn Ngữ Động**: Chuyển đổi ngôn ngữ trong thời gian chạy
-   **✅ Ngôn Ngữ Được Hỗ Trợ**: 7+ ngôn ngữ (en, vi, fr, es, de, ja, th)

### ⚡ Phạm Vi Kiểm Thử Hiệu Năng

#### ✅ Xác Thực Hiệu Năng Toàn Diện
-   **🚀 Kiểm Thử Tải**: Xử lý yêu cầu đồng thời (50+ người dùng cùng lúc)
-   **⏱️ Giám Sát Thời Gian Phản Hồi**: Phản hồi API dưới 200ms
-   **📊 Kiểm Thử Thông Lượng**: Xác thực dung lượng yêu cầu/giây
-   **🔄 Kiểm Thử Áp Lực**: Hành vi hệ thống dưới tải nặng
-   **💾 Mức Sử Dụng Bộ Nhớ**: Giám sát tiêu thụ tài nguyên

### 📈 Chỉ Số Chất Lượng Kiểm Thử

#### 🎯 Thống Kê Phạm Vi

```
📊 TÓM TẮT PHẠM VI KIỂM THỬ
✅ Tổng số Endpoint API: 15+ endpoint
✅ Tỷ lệ Phạm vi: 100%
✅ Tệp Kiểm Thử: 16 tệp (đã tinh gọn)
✅ Tổng số Trường Hợp Kiểm Thử: 135+ trường hợp kiểm thử toàn diện
✅ Quyền Vai Trò: 100% phạm vi RBAC
✅ Kịch Bản Bảo Mật: 25+ bài kiểm thử bảo mật
✅ Kiểm Thử Hiệu Năng: 5+ bài kiểm thử tải
✅ Ngôn Ngữ i18n: 7+ ngôn ngữ quốc tế hóa
✅ Kịch Bản Lỗi: 50+ trường hợp lỗi
✅ Luồng Tích Hợp: 8+ quy trình làm việc từ đầu đến cuối
```

#### 🎭 Phạm Vi Kiểm Thử Dựa Trên Vai Trò

-   **👤 Người Dùng Thông Thường**: 7 bài kiểm thử bao gồm các giới hạn của người dùng
-   **👨‍💼 Người Dùng Admin**: 12 bài kiểm thử bao gồm các khả năng của admin
-   **👑 Super Admin**: 10 bài kiểm thử bao gồm quyền truy cập đầy đủ
-   **🔄 Kiểm Thử Chéo Vai Trò**: 15 bài kiểm thử so sánh ranh giới vai trò
-   **🛡️ Ma Trận Phân Quyền**: 100% kết hợp endpoint x vai trò

---

## 🔍 Xử Lý Sự Cố

### ❓ Sự Cố Thường Gặp & Giải Pháp

#### 1. Lỗi Thực Thi Kiểm Thử

```bash
# Sự cố: Kiểm thử không thể kết nối đến API
# Giải pháp: Đảm bảo máy chủ phát triển đang chạy
npm run dev  # Khởi động máy chủ phát triển trên cổng 8787

# Sự cố: Cấu hình môi trường sai
# Giải pháp: Kiểm tra cài đặt môi trường kiểm thử
TEST_ENV=test npm run test:quick
```

#### 2. Sự Cố Kiểm Thử Xác Thực

```bash
# Sự cố: Lỗi xác thực token JWT
# Giải pháp: Xác minh người dùng kiểm thử tồn tại và đặt lại nếu cần
node tests/utils/setupTestUsers.js

# Sự cố: Token hết hạn trong quá trình kiểm thử
# Giải pháp: Sử dụng môi trường kiểm thử mới
npm run test:initdb  # Đặt lại cơ sở dữ liệu kiểm thử
```

#### 3. Sự Cố Kết Nối Cơ Sở Dữ Liệu

```bash
# Sự cố: Lỗi di chuyển cơ sở dữ liệu
# Giải pháp: Chạy thiết lập cơ sở dữ liệu
npm run db:migrate

# Sự cố: Cơ sở dữ liệu kiểm thử bị hỏng
# Giải pháp: Đặt lại cơ sở dữ liệu kiểm thử
wrangler d1 execute hono-auth-api-db-test --local --env test --file tests/init/reset.sql
```

#### 4. Sự Cố Cấu Hình Môi Trường

```bash
# Sự cố: URL cơ sở hoặc cổng sai
# Giải pháp: Kiểm tra cấu hình kiểm thử
cat tests/config/testConfig.js | grep baseUrl

# Sự cố: Vấn đề phát hiện môi trường
# Giải pháp: Đặt môi trường rõ ràng
TEST_ENV=test npm run test:system
```

#### 5. Hết Thời Gian Chờ Kiểm Thử Hiệu Năng

```bash
# Sự cố: Kiểm thử hiệu năng hết thời gian chờ
# Giải pháp: Kiểm tra tài nguyên hệ thống và điều chỉnh thời gian chờ
DEBUG=hono-auth-api:performance:* npm run test:performance
```

### 🔧 Lệnh Gỡ Lỗi

```bash
# Đầu ra gỡ lỗi đầy đủ cho tất cả các bài kiểm thử
DEBUG=hono-auth-api:* npm run test:unified

# Gỡ lỗi theo từng bài kiểm thử
DEBUG=hono-auth-api:auth:* npm run test:auth
DEBUG=hono-auth-api:regular_user:* npm run test:regular_user
DEBUG=hono-auth-api:routes:admin:* npm run test:admin_user
DEBUG=hono-auth-api:routes:admin:* npm run test:super_admin_user
DEBUG=hono-auth-api:security:* npm run test:security

# Gỡ lỗi hiệu năng
DEBUG=hono-auth-api:performance:* npm run test:performance

# Gỡ lỗi môi trường
DEBUG=hono-auth-api:env:* npm run test:system
```

### 🩺 Lệnh Kiểm Tra Sức Khỏe

```bash
# Xác thực hệ thống nhanh
npm run test:quick

# Sức khỏe máy chủ API
curl http://localhost:8788/health

# Kết nối cơ sở dữ liệu
npm run db:status

# Xác thực môi trường
node -e "import('./tests/config/testConfig.js').then(m => console.log(m.TEST_CONFIG))"
```

### 📝 Phân Tích Nhật Ký

```bash
# Xem nhật ký kiểm thử với dấu thời gian
npm run test:unified 2>&1 | tee test-execution.log

# Lọc chỉ các lỗi
npm run test:unified 2>&1 | grep -E "(ERROR|FAILED|✗)"

# Phân tích hiệu năng
npm run test:performance 2>&1 | grep -E "(Response time|Duration)"
```

---

## 🤝 Đóng Góp

### 🚀 Thêm Kiểm Thử Mới

#### Phương Pháp 1: Thêm vào Ngữ Cảnh Kiểm Thử Hiện Có

```javascript
// Ví dụ: Thêm vào authTest.js
class AuthTest {
  async testNewAuthFeature() {
    const response = await this.client.post('/api/auth/new-feature', {
      // dữ liệu kiểm thử
    });

  }

  async runAll() {
    const tests = [
      // ...các bài kiểm thử hiện có...
      this.testNewAuthFeature
    ];

    return await this.executeTests(tests, 'Authentication Tests');
  }
}
```

#### Phương Pháp 2: Thêm vào Bộ Kiểm Thử Hợp Nhất

```javascript
// Ví dụ: Thêm vào unifiedTestSuite.js
class UnifiedTestSuite {
  async testNewGlobalFeature() {
    // Triển khai
  }

  async runAuthTests() {
    const tests = [
      // ...các bài kiểm thử hiện có...
      this.testNewGlobalFeature
    ];

    return await this.executeTests(tests, 'Authentication Tests');
  }
}
```

#### Phương Pháp 3: Tạo Ngữ Cảnh Kiểm Thử Mới

1.  **Tạo tệp kiểm thử mới** theo các mẫu hiện có
2.  **Thêm vào menu chính** trong `mainMenu.js`
3.  **Thêm script npm** vào `package.json`
4.  **Cập nhật tài liệu** trong README này
5.  **Thêm vào bộ kiểm thử hợp nhất** nếu phù hợp

### 📋 Nguyên Tắc Phát Triển Kiểm Thử

#### ✅ Thực Hành Tốt Nhất

1.  **Sử dụng cấu hình trung tâm** từ `tests/config/testConfig.js`
2.  **Tuân theo quy ước đặt tên hiện có** để đảm bảo tính nhất quán
3.  **Bao gồm xử lý lỗi phù hợp** và các khẳng định có ý nghĩa
4.  **Kiểm thử cả kịch bản thành công và thất bại**
5.  **Sử dụng mã trạng thái HTTP phù hợp** và xác thực phản hồi
6.  **Bao gồm kiểm thử bảo mật và các trường hợp biên**
7.  **Thêm kiểm thử i18n** cho các tính năng hướng tới người dùng
8.  **Cập nhật tài liệu** khi thêm các khả năng mới

#### 🔧 Tiêu Chuẩn Mã

```javascript
// ✅ Cấu trúc kiểm thử tốt
async testFeatureName() {
  // Sắp xếp
  const testData = { /* dữ liệu kiểm thử */ };

  // Hành động
  const response = await this.client.post('/api/endpoint', testData);

  // Khẳng định
}

// ✅ Kiểm thử lỗi
async testFeatureValidation() {
  const invalidData = { /* dữ liệu không hợp lệ */ };

  const response = await this.client.post('/api/endpoint', invalidData);

}
```

### 🎯 Quy Trình Phát Triển

```bash
# Quy trình phát triển hàng ngày
npm run test:quick             # Xác thực nhanh (30 giây)
npm run test                   # Menu tương tác để kiểm thử cụ thể

# Quy trình phát triển tính năng
npm run test:system            # Kiểm tra sức khỏe hệ thống
npm run test:auth              # Kiểm thử xác thực
npm run test:regular_user      # Kiểm thử vai trò Người dùng thông thường
npm run test:admin_user        # Kiểm thử vai trò Admin
npm run test:super_admin_user  # Kiểm thử vai trò Super Admin
npm run test:kv_admin         # Kiểm thử cấu hình KV Admin

# Quy trình trước khi triển khai
npm run test:unified           # Kiểm thử toàn diện hoàn chỉnh (4-5 phút)
bash tests/scripts/run-all-tests.sh  # Kiểm thử tự động đầy đủ với thống kê
npm run test:security          # Xác thực bảo mật
npm run test:performance       # Xác thực hiệu năng
```

---

## 🎯 Phân Tích Coverage Routes Hoàn Chỉnh

### 📊 **COVERAGE ROUTES TOÀN DIỆN: 100%**

Dựa trên phân tích hệ thống chi tiết, bộ kiểm thử của chúng ta đạt được **coverage hoàn toàn** cho tất cả API endpoints:

| **Tổng Routes** | **Routes Đã Test** | **Coverage** |
|-----------------|-------------------|-------------|
| **75** | **75** | **✅ 100%** |

### 🏆 **Coverage Theo Category**

| Category | Routes | Covered | Coverage % | Test Files Chính |
|----------|--------|---------|------------|------------------|
| **System** | 6 | 6 | ✅ 100% | `systemTest.js`, `quickTest.js` |
| **Assets** | 5 | 5 | ✅ 100% | `systemTest.js`, `quickTest.js` |
| **Authentication** | 3 | 3 | ✅ 100% | `authTest.js`, `*UserTest.js` |
| **User Management** | 5 | 5 | ✅ 100% | `regularUserTest.js`, `adminUserTest.js` |
| **Admin Operations** | 9 | 9 | ✅ 100% | `adminUserTest.js`, `superAdminUserTest.js` |
| **KV Configuration** | 4 | 4 | ✅ 100% | `kvAdminTest.js`, `kvAuditConfigTest.js` |
| **Core Audit** | 4 | 4 | ✅ 100% | `auditSystemTest.js` |
| **Advanced Audit** | 11 | 11 | ✅ 100% | `advancedAuditComprehensiveTest.js` |
| **Real-time Monitoring** | 12 | 12 | ✅ 100% | `realtimeMonitoringTest.js` |
| **Security Incidents** | 8 | 8 | ✅ 100% | `securityIncidentTest.js` |
| **Translations (i18n)** | 4 | 4 | ✅ 100% | `comprehensiveI18nTest.js` |
| **Validation Demo** | 4 | 4 | ✅ 100% | `zodValidationTest.js`, `validationTest.js` |

### 🎯 **Coverage Hệ Thống Kiểm Toán Doanh Nghiệp**

#### **4 Nhóm Route Chính - Coverage Hoàn Chỉnh (57 endpoints)**

1. **Core Audit Routes** (`/api/audit/*`) - **6 endpoints** ✅
   - Chức năng ghi nhật ký và tìm kiếm kiểm toán cơ bản
  - Test Coverage: `auditSystemTest.js` (đã gộp core), `simpleAuditTest.js`

2. **Advanced Analytics Routes** (`/api/advanced-audit/*`) - **15 endpoints** ✅
   - Phân tích nâng cao, lưu trữ và báo cáo tuân thủ
   - Test Coverage: `advancedAuditComprehensiveTest.js`, `auditPerformanceTest.js`

3. **Real-time Monitoring Routes** (`/api/realtime-monitoring/*`) - **28 endpoints** ✅
   - Giám sát hệ thống trực tiếp, cảnh báo và phát hiện mối đe dọa
   - Test Coverage: `realtimeMonitoringTest.js`, `alertSystemConfigIntegrationTest.js`

4. **Security Incident Routes** (`/api/security-incident/*`) - **8 endpoints** ✅
   - Quản lý sự cố bảo mật và điều phối phản ứng
   - Test Coverage: `securityIncidentTest.js`

### 🌟 **Điểm Nổi Bật Coverage**

#### ✅ **Điểm Mạnh Kiểm Thử Toàn Diện**
- **100% Endpoint Coverage**: Tất cả 75 routes qua 12 categories được test
- **Kiểm Thử Dựa Trên Vai Trò**: Coverage RBAC hoàn chỉnh cho 3 roles (user, admin, super_admin)
- **Tính Năng Doanh Nghiệp**: Coverage đầy đủ hệ thống kiểm toán doanh nghiệp (35 routes)
- **Kiểm Thử Bảo Mật**: Kiểm thử bảo mật và quản lý sự cố hoàn chỉnh
- **Hỗ Trợ Đa Ngôn Ngữ**: Kiểm thử i18n và validation đầy đủ qua 7 ngôn ngữ
- **Kiểm Thử Hiệu Năng**: Coverage kiểm thử hiệu năng và tải hoàn chỉnh

#### 📋 **Kiến Trúc Kiểm Thử**
- **35+ Test Files Chuyên Biệt**: Mỗi domain có coverage test riêng biệt
- **Kiểm Thử Kiểm Toán 4 Giai Đoạn**: Xác thực hệ thống kiểm toán doanh nghiệp toàn diện
- **Hỗ Trợ Đa Môi Trường**: Coverage qua các môi trường development, test, và staging
- **Kiểm Thử Tự Động**: Hỗ trợ pipeline CI/CD hoàn chỉnh với shell scripts

### 🚀 **Kết Quả Đảm Bảo Chất Lượng**

| Metric | Kết Quả | Trạng Thái |
|--------|---------|------------|
| **API Endpoint Coverage** | 75/75 (100%) | ✅ Hoàn chỉnh |
| **Role Permission Coverage** | 3/3 roles đã test đầy đủ | ✅ Hoàn chỉnh |
| **Security Feature Coverage** | Tất cả endpoints bảo mật đã test | ✅ Hoàn chỉnh |
| **Enterprise Audit Coverage** | 35/35 audit endpoints đã test | ✅ Hoàn chỉnh |
| **i18n/Translation Coverage** | 7/7 ngôn ngữ đã test | ✅ Hoàn chỉnh |
| **Performance Test Coverage** | Tất cả đường dẫn quan trọng đã test | ✅ Hoàn chỉnh |

### 🎉 **Kết Luận**

**Bộ kiểm thử Hono Auth API** đạt được **100% route coverage hoàn hảo** với:
- ✅ Tất cả 75 routes được test qua 12 categories
- ✅ Coverage hệ thống kiểm toán doanh nghiệp hoàn chỉnh (35 routes)
- ✅ Kiểm thử kiểm soát truy cập dựa trên vai trò toàn diện
- ✅ Xác thực bảo mật và hiệu năng đầy đủ
- ✅ Tự động hóa kiểm thử sẵn sàng production

Coverage toàn diện này đảm bảo **chất lượng cấp doanh nghiệp** và **độ tin cậy API hoàn chỉnh**.

---

### 📚 Cập Nhật Tài Liệu

Khi thêm các tính năng mới, hãy đảm bảo bạn cập nhật:

1.  **TEST_GUIDE.md này** - Thêm mô tả và cách sử dụng kiểm thử mới
2.  **`tests/scripts/CURL_COMMANDS.md`** - Nếu thêm các endpoint mới
3.  **Cấu hình kiểm thử** - Cập nhật `tests/config/testConfig.js` nếu cần
4.  **Script package.json** - Thêm các script kiểm thử npm mới nếu cần

---

## 📝 Tổng Kết

**Bộ kiểm thử toàn diện hợp nhất** này cung cấp nhiều phương pháp để kiểm thử Hono Auth API với **quản lý tệp được tinh gọn** và **phạm vi API hoàn chỉnh**:

### 🎯 Tính Năng Chính

-   ✅ **16 Tệp Kiểm Thử Được Tinh Gọn** (giảm từ 17, tối ưu hóa 6%)
-   ✅ **Phạm Vi API 100%** - Tất cả các endpoint, bảo mật, hiệu năng, i18n
-   ✅ **Nhiều Phương Pháp Thực Thi** - Menu tương tác, script npm, tự động hóa
-   ✅ **Kiểm Thử Dựa Trên Vai Trò** - Xác thực RBAC toàn diện (user, admin, super_admin)
-   ✅ **Admin Message Translation** - Kiểm thử i18n message translation đầy đủ
-   ✅ **Hỗ Trợ Đa Môi Trường** - Cấu hình phát triển, kiểm thử, staging
-   ✅ **Tài Liệu Hợp Nhất** - Nguồn thông tin duy nhất cho tất cả thông tin kiểm thử

### 🚀 Bắt Đầu Nhanh Được Đề Xuất

```bash
# 🎯 Cho Phát Triển Tương Tác
npm run test                   # Khởi chạy menu tương tác

# ⚡ Cho Xác Thực Nhanh
npm run test:quick             # Kiểm thử nhanh (10 giây)

# 🔒 Cho Kiểm Thử Bảo Mật
npm run test:security          # Kiểm thử bảo mật & rate limiting

# 👥 Cho Kiểm Thử Vai Trò
npm run test:role              # Kiểm thử kiểm soát truy cập dựa trên vai trò

# � Cho Kiểm Thử i18n (MỚI)
npm run test:admin:i18n        # Kiểm thử admin message translation
npm run test:admin:messages:script  # Script tự động admin messages

# �🎉 Cho Kiểm Thử Hoàn Chỉnh
npm run test:unified           # Bộ kiểm thử toàn diện tất cả trong một (4-5 phút)

# 🤖 Cho Tự Động Hóa CI/CD
bash tests/scripts/run-all-tests-quick.sh  # Kiểm thử quy trình tự động
```

### 📊 Tóm Tắt Thống Kê Kiểm Thử

```
📊 THỐNG KÊ BỘ KIỂM THỬ TOÀN DIỆN
✅ Tệp Kiểm Thử: 16 tệp (đã tinh gọn & tối ưu hóa)
✅ Danh Mục Kiểm Thử: 18 ngữ cảnh kiểm thử riêng biệt (bao gồm hệ thống kiểm toán doanh nghiệp)
✅ Tổng số Bài Kiểm Thử: 135+ trường hợp kiểm thử toàn diện
✅ Endpoint API: 15+ endpoint với phạm vi 100%
✅ Quyền Vai Trò: 100% ma trận phân quyền RBAC
✅ Kiểm Thử Bảo Mật: 25+ kịch bản xác thực bảo mật
✅ Kiểm Thử Hiệu Năng: 5+ bài kiểm thử tải và áp lực
✅ Ngôn Ngữ i18n: 7+ ngôn ngữ quốc tế hóa
✅ Script Tự Động: 10+ script kiểm thử tự động
✅ Phương Pháp Thực Thi: 3 phương pháp (tương tác, npm, tự động hóa)
✅ Tài Liệu: Hướng dẫn toàn diện hợp nhất duy nhất
```

Bộ kiểm thử này **sẵn sàng cho production**, **được tài liệu hóa tốt**, và **được thiết kế để mở rộng** cùng với nhu cầu phát triển ứng dụng của bạn.

---

> **📅 Cập nhật lần cuối**: 4 tháng 8, 2025
> **🎯 Trạng thái**: ✅ Sẵn sàng cho Production - Bao gồm Admin Message Translation
> **🔄 Bảo trì**: Đang hoạt động & Cập nhật
>
> Hướng dẫn hợp nhất này tổng hợp tất cả tài liệu kiểm thử vào một nguồn thông tin duy nhất cho bộ kiểm thử Hono Auth API.
