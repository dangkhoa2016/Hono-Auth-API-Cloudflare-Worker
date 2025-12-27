# 🔧 **HƯỚNG DẪN CẤU HÌNH CLOUDFLARE KV CHO HỆ THỐNG AUDIT**

> 🌐 Language / Ngôn ngữ: [English](AUDIT_KV_CONFIGURATION_GUIDE.md) | **Tiếng Việt**

**Dự án**: Hono Auth Worker - Ứng dụng Cloudflare Workers  
**Trạng thái**: ✅ **SẴN SÀNG CHO PRODUCTION** ✅  
**Cập nhật lần cuối**: 30 tháng 7, 2025
**Đối tượng**: 👑 **Chỉ dành cho Super Admin**

---

## 📋 **MỤC LỤC**

1. [🎯 Tổng Quan](#-tổng-quan)
2. [🔐 Bảo Mật & Kiểm Soát Truy Cập](#-bảo-mật--kiểm-soát-truy-cập)
3. [🏗️ Các Khóa Cấu Hình KV Hiện Tại](#-các-khóa-cấu-hình-kv-hiện-tại)
4. [📊 Đề Xuất Các Khóa KV Cho Hệ Thống Audit](#-đề-xuất-các-khóa-kv-cho-hệ-thống-audit)
5. [🛠️ API Endpoints Để Quản Lý KV](#-api-endpoints-để-quản-lý-kv)
6. [💾 Ví Dụ Triển Khai](#-ví-dụ-triển-khai)
7. [🔄 Chiến Lược Migration](#-chiến-lược-migration)
8. [📈 Giám Sát & Thực Hành Tốt Nhất](#-giám-sát--thực-hành-tốt-nhất)
9. [🌍 Hỗ trợ Cấu hình i18n](#-hỗ-trợ-cấu-hình-i18n)
10. [🔗 Điểm Tích Hợp](#-điểm-tích-hợp)
11. [📝 Các Bước Tiếp Theo](#-các-bước-tiếp-theo)

---

## 🎯 **TỔNG QUAN**

**Hệ Thống Audit Doanh Nghiệp** trong Hono Auth Worker hiện tại hỗ trợ ghi log audit toàn diện với 4 nhóm route chính và hơn 40 endpoints. Để làm cho hệ thống này có thể tùy chỉnh hoàn toàn bởi người dùng super admin qua API, chúng ta cần mở rộng hệ thống cấu hình Cloudflare KV để hỗ trợ các cài đặt cụ thể cho audit.

### **Kiến Trúc Hệ Thống Hiện Tại**
- ✅ **KV Configuration Service** (`src/services/kvConfigService.js`)
- ✅ **KV Admin Routes** (`src/routes/kvAdmin.js`) - Chỉ Super Admin
- ✅ **Dynamic Configuration** (`src/utils/dynamicConfig.js`)
- ✅ **Hệ Thống Audit Toàn Diện** (4 nhóm route: audit, advanced-audit, realtime-monitoring, security-incident)
- ✅ **Hệ thống Xác thực i18n** - Thông báo lỗi đa ngôn ngữ và phản hồi được bản địa hóa
- ✅ **Unified Request Middleware** - Ghi log và theo dõi audit nâng cao

### **Mục Tiêu**
Cho phép super admin tùy chỉnh hành vi hệ thống audit thông qua API mà không cần deployment code, bao gồm:
- Chính sách lưu giữ dữ liệu
- Ngưỡng cảnh báo  
- Cài đặt hiệu năng
- Feature toggles
- Cài đặt giám sát real-time
- Cấu hình xuất dữ liệu
- Tùy chọn ngôn ngữ i18n và xử lý lỗi đa ngôn ngữ
- Tự động hóa phản hồi sự cố bảo mật

---

## 🔐 **BẢO MẬT & KIỂM SOÁT TRUY CẬP**

### **Mô Hình Bảo Mật Hiện Tại**
- **Quyền truy cập KV Admin**: Chỉ có vai trò `super_admin` mới có thể truy cập endpoints `/api/kv-admin/*`
- **Xác thực khóa**: Chỉ các khóa được định nghĩa trước trong mảng `KV_CONFIG_KEYS` mới được phép
- **Ghi log Audit**: Tất cả các thay đổi cấu hình KV đều được ghi log với audit trail đầy đủ
- **Lọc theo vai trò**: Hạn chế truy cập dữ liệu giữa Admin và Super Admin

### **Bảo Mật Cụ Thể Cho Audit**
```javascript
// Tất cả thay đổi cấu hình audit sẽ được ghi log
{
  "action": "KV_CONFIG_UPDATE",
  "actor_id": 1,
  "actor_role": "super_admin", 
  "actor_email": "admin@company.com",
  "target_type": "KV_CONFIG",
  "target_id": "AUDIT_RETENTION_DAYS",
  "target_identifier": "Audit Retention Policy",
  "details": {
    "old_value": "365",
    "new_value": "730",
    "category": "audit_system"
  }
}
```

---

## 🏗️ **CÁC KHÓA CẤU HÌNH KV HIỆN TẠI**

### **Các Khóa Hiện Có trong `src/constants/kvKeys.js`**

| Khóa | Sử Dụng Hiện Tại | Giá Trị Mặc Định | Kiểu |
|------|-------------------|-------------------|------|
| `APP_NAME` | Tên ứng dụng | `"Hono Auth API"` | string |
| `APP_VERSION` | Phiên bản ứng dụng | `"1.0.0"` | string |
| `DEBUG` | Mẫu debug logging | `"hono-auth-api:*"` | string |
| `ENABLE_DETAILED_ERRORS` | Phản hồi lỗi chi tiết | `true` | boolean |
| `LOG_SQL_QUERIES` | Ghi log truy vấn SQL | `false` | boolean |
| `RATE_LIMIT_MAX_ATTEMPTS` | Ngưỡng giới hạn tốc độ | `5` | number |
| `RATE_LIMIT_LOCKOUT_DURATION` | Thời gian khóa (giây) | `120` | number |
| `RATE_LIMIT_DISABLED` | Tắt giới hạn tốc độ | `false` | boolean |
| `DEFAULT_PAGE_SIZE` | Kích thước phân trang mặc định | `10` | number |
| `MAX_PAGE_SIZE` | Kích thước phân trang tối đa | `100` | number |
| `SECURITY_HIGH_RISK_THRESHOLD` | Ngưỡng rủi ro bảo mật | `10` | number |
| `PERFORMANCE_GOOD_THRESHOLD` | Ngưỡng hiệu năng (ms) | `1000` | number |
| `AUTO_ACTIVATE_USER_ON_REGISTER` | Tự động kích hoạt user (bỏ qua email) | `false` | boolean |
| `CORS_ORIGIN` | Cài đặt CORS origin | `"*"` | string |

---

## 📊 **ĐỀ XUẤT CÁC KHÓA KV CHO HỆ THỐNG AUDIT**

### **1. 🗄️ Cài Đặt Lưu Giữ & Lưu Trữ**

| Khóa | Mục Đích | Giá Trị Mặc Định | Kiểu | Mô Tả |
|------|----------|-------------------|------|-------|
| `AUDIT_RETENTION_DAYS_GENERAL` | Lưu giữ log chung | `90` | number | Số ngày lưu giữ audit log chung |
| `AUDIT_RETENTION_DAYS_AUTH` | Log xác thực | `365` | number | Số ngày lưu giữ log đăng nhập/đăng xuất |
| `AUDIT_RETENTION_DAYS_ADMIN` | Thao tác admin | `2555` | number | Số ngày lưu giữ log hành động admin (7 năm) |
| `AUDIT_RETENTION_DAYS_SECURITY` | Sự kiện bảo mật | `1095` | number | Số ngày lưu giữ log sự cố bảo mật (3 năm) |
| `AUDIT_ARCHIVAL_ENABLED` | Kích hoạt lưu trữ tự động | `true` | boolean | Bật/tắt lưu trữ log tự động |
| `AUDIT_ARCHIVAL_BATCH_SIZE` | Kích thước batch lưu trữ | `1000` | number | Số bản ghi mỗi batch lưu trữ |
| `AUDIT_ARCHIVE_COMPRESSION` | Nén lưu trữ | `true` | boolean | Nén log đã lưu trữ |

### **2. 🔍 Cài Đặt Tìm Kiếm & Xuất Dữ Liệu**

| Khóa | Mục Đích | Giá Trị Mặc Định | Kiểu | Mô Tả |
|------|----------|-------------------|------|-------|
| `AUDIT_MAX_SEARCH_RESULTS` | Kết quả tìm kiếm tối đa | `1000` | number | Giới hạn kết quả tìm kiếm tối đa |
| `AUDIT_EXPORT_MAX_RECORDS` | Bản ghi xuất tối đa | `50000` | number | Số bản ghi tối đa mỗi lần xuất |
| `AUDIT_EXPORT_FORMATS` | Định dạng xuất cho phép | `"csv,json,xlsx"` | string | Danh sách định dạng xuất (phân cách bằng dấu phẩy) |
| `AUDIT_FULL_TEXT_SEARCH` | Kích hoạt tìm kiếm toàn văn | `true` | boolean | Bật tìm kiếm văn bản nâng cao |
| `AUDIT_SEARCH_TIMEOUT_MS` | Timeout tìm kiếm | `30000` | number | Thời gian timeout cho thao tác tìm kiếm (ms) |

### **3. 🚨 Cài Đặt Giám Sát Real-time**

| Khóa | Mục Đích | Giá Trị Mặc Định | Kiểu | Mô Tả |
|------|----------|-------------------|------|-------|
| `AUDIT_REALTIME_ENABLED` | Giám sát real-time | `true` | boolean | Kích hoạt giám sát audit real-time |
| `AUDIT_REALTIME_INTERVAL_MS` | Khoảng thời gian giám sát | `5000` | number | Khoảng thời gian kiểm tra real-time (ms) |
| `AUDIT_THREAT_DETECTION` | Phát hiện mối đe dọa | `true` | boolean | Kích hoạt hệ thống phát hiện mối đe dọa |
| `AUDIT_ALERT_HIGH_RISK_COUNT` | Ngưỡng cảnh báo rủi ro cao | `10` | number | Số lần thất bại để kích hoạt cảnh báo |
| `AUDIT_ALERT_ADMIN_ACTIONS` | Cảnh báo hành động admin | `true` | boolean | Giám sát tất cả thao tác admin |
| `AUDIT_ALERT_LOGIN_FAILURES` | Cảnh báo đăng nhập thất bại | `5` | number | Ngưỡng đăng nhập thất bại |
| `AUDIT_ALERT_RATE_LIMIT_HITS` | Cảnh báo giới hạn tốc độ | `true` | boolean | Cảnh báo khi kích hoạt giới hạn tốc độ |

### **4. 📈 Hiệu Năng & Tối Ưu Hóa**

| Khóa | Mục Đích | Giá Trị Mặc Định | Kiểu | Mô Tả |
|------|----------|-------------------|------|-------|
| `AUDIT_LOG_BUFFER_SIZE` | Kích thước buffer log | `100` | number | Kích thước buffer log trong bộ nhớ |
| `AUDIT_BATCH_INSERT_SIZE` | Kích thước batch insert | `50` | number | Kích thước batch insert database |
| `AUDIT_CACHE_TTL_SECONDS` | TTL cache | `300` | number | Thời gian cache dữ liệu audit |
| `AUDIT_INDEX_OPTIMIZATION` | Kích hoạt tối ưu index | `true` | boolean | Tối ưu hóa database indexes |
| `AUDIT_PARALLEL_PROCESSING` | Xử lý song song | `true` | boolean | Kích hoạt xử lý audit song song |

### **5. 🎛️ Dashboard & Báo Cáo**

| Khóa | Mục Đích | Giá Trị Mặc Định | Kiểu | Mô Tả |
|------|----------|-------------------|------|-------|
| `AUDIT_DASHBOARD_REFRESH_MS` | Tỷ lệ làm mới dashboard | `10000` | number | Tự động làm mới dashboard (ms) |
| `AUDIT_DASHBOARD_MAX_ITEMS` | Số item tối đa dashboard | `50` | number | Số item tối đa trong danh sách dashboard |
| `AUDIT_STATS_CACHE_MINUTES` | Cache thống kê | `5` | number | Cache thống kê audit (phút) |
| `AUDIT_TREND_ANALYSIS_DAYS` | Thời gian phân tích xu hướng | `30` | number | Số ngày cho phân tích xu hướng |
| `AUDIT_REPORT_FORMATS` | Định dạng báo cáo | `"pdf,html,csv"` | string | Các định dạng báo cáo có sẵn |

### **6. 🔔 Cài Đặt Cảnh Báo & Thông Báo**

| Khóa | Mục Đích | Giá Trị Mặc Định | Kiểu | Mô Tả |
|------|----------|-------------------|------|-------|
| `AUDIT_ALERTS_ENABLED` | Kích hoạt hệ thống cảnh báo | `true` | boolean | Bật/tắt toàn bộ hệ thống cảnh báo |
| `AUDIT_ALERT_CHANNELS` | Kênh cảnh báo | `"console,webhook"` | string | Danh sách kênh cảnh báo (phân cách bằng dấu phẩy) |
| `AUDIT_WEBHOOK_URL` | URL webhook | `""` | string | Webhook ngoài cho cảnh báo |
| `AUDIT_EMAIL_ALERTS` | Cảnh báo email | `false` | boolean | Kích hoạt thông báo email |
| `AUDIT_ALERT_COOLDOWN_MS` | Thời gian nghỉ cảnh báo | `300000` | number | Thời gian nghỉ giữa các cảnh báo tương tự (ms) |
| `AUDIT_CRITICAL_ACTIONS` | Danh sách hành động quan trọng | `"user_delete,role_change,kv_config"` | string | Hành động yêu cầu cảnh báo ngay lập tức |

### **7. 🛡️ Bảo Mật & Tuân Thủ**

| Khóa | Mục Đích | Giá Trị Mặc Định | Kiểu | Mô Tả |
|------|----------|-------------------|------|-------|
| `AUDIT_SENSITIVE_FIELDS` | Che dấu trường nhạy cảm | `"password,token,secret"` | string | Các trường cần che dấu trong log |
| `AUDIT_IP_ANONYMIZATION` | Ẩn danh địa chỉ IP | `false` | boolean | Hash địa chỉ IP để bảo vệ privacy |
| `AUDIT_GDPR_COMPLIANCE` | Chế độ tuân thủ GDPR | `true` | boolean | Kích hoạt tính năng tuân thủ GDPR |
| `AUDIT_DATA_RESIDENCY` | Vùng lưu trữ dữ liệu | `"global"` | string | Vùng lưu trữ dữ liệu |
| `AUDIT_ENCRYPTION_ENABLED` | Mã hóa log nhạy cảm | `true` | boolean | Mã hóa dữ liệu audit nhạy cảm |

---

## 🛠️ **API ENDPOINTS ĐỂ QUẢN LÝ KV**

### **KV Admin Endpoints Hiện Có**

Tất cả endpoints yêu cầu vai trò `super_admin` và có tiền tố `/api/kv-admin/`:

```javascript
// Lấy tất cả cấu hình
GET /configs

// Lấy cấu hình cụ thể
GET /configs/:key  

// Cập nhật cấu hình
PUT /configs/:key
Body: { "value": "new_value" }

// Cập nhật hàng loạt
POST /configs/batch
Body: { "configs": { "key1": "value1", "key2": "value2" } }

// Reset về mặc định
DELETE /configs/:key

// Xóa cache
POST /configs/cache/clear

// So sánh môi trường
GET /configs/env-comparison

// Lấy giá trị mặc định
GET /configs/defaults
```

### **Endpoints Cụ Thể Cho Audit Được Đề Xuất**

```javascript
// Lấy cấu hình audit theo danh mục
GET /configs/audit/:category
// Danh mục: retention, monitoring, alerts, performance, compliance

// Cập nhật cấu hình audit theo danh mục
PUT /configs/audit/:category
Body: { "configs": { "key1": "value1", "key2": "value2" } }

// Test cấu hình audit
POST /configs/audit/test/:key
Body: { "value": "test_value" }

// Xuất cấu hình audit
GET /configs/audit/export
Response: File JSON với tất cả cài đặt audit

// Import cấu hình audit  
POST /configs/audit/import
Body: File cấu hình JSON
```

---

## 💾 **VÍ DỤ TRIỂN KHAI**

### **1. Cập Nhật Cấu Hình KV Keys**

**File**: `src/constants/kvKeys.js`

```javascript
export const DEFAULT_CONFIGS = {
  // ... cấu hình hiện có ...
  
  // Cài Đặt Lưu Giữ Audit
  AUDIT_RETENTION_DAYS_GENERAL: 90,
  AUDIT_RETENTION_DAYS_AUTH: 365, 
  AUDIT_RETENTION_DAYS_ADMIN: 2555,
  AUDIT_RETENTION_DAYS_SECURITY: 1095,
  AUDIT_ARCHIVAL_ENABLED: true,
  AUDIT_ARCHIVAL_BATCH_SIZE: 1000,
  
  // Tìm Kiếm & Xuất Audit
  AUDIT_MAX_SEARCH_RESULTS: 1000,
  AUDIT_EXPORT_MAX_RECORDS: 50000,
  AUDIT_EXPORT_FORMATS: 'csv,json,xlsx',
  AUDIT_FULL_TEXT_SEARCH: true,
  
  // Giám Sát Real-time
  AUDIT_REALTIME_ENABLED: true,
  AUDIT_REALTIME_INTERVAL_MS: 5000,
  AUDIT_THREAT_DETECTION: true,
  AUDIT_ALERT_HIGH_RISK_COUNT: 10,
  
  // Cài Đặt Hiệu Năng
  AUDIT_LOG_BUFFER_SIZE: 100,
  AUDIT_BATCH_INSERT_SIZE: 50,
  AUDIT_CACHE_TTL_SECONDS: 300,
  
  // Cài Đặt Cảnh Báo
  AUDIT_ALERTS_ENABLED: true,
  AUDIT_ALERT_CHANNELS: 'console,webhook',
  AUDIT_WEBHOOK_URL: '',
  AUDIT_ALERT_COOLDOWN_MS: 300000,
  
  // Bảo Mật & Tuân Thủ
  AUDIT_SENSITIVE_FIELDS: 'password,token,secret',
  AUDIT_IP_ANONYMIZATION: false,
  AUDIT_GDPR_COMPLIANCE: true,
  AUDIT_ENCRYPTION_ENABLED: true
};
```

### **2. Tích Hợp Cấu Hình Service**

**File**: `src/services/auditLogService.js`

```javascript
// Lấy cấu hình audit động
async getAuditConfig() {
  return {
    retentionDays: {
      general: await getDynamicConfig(this.env, 'AUDIT_RETENTION_DAYS_GENERAL', 90),
      auth: await getDynamicConfig(this.env, 'AUDIT_RETENTION_DAYS_AUTH', 365),
      admin: await getDynamicConfig(this.env, 'AUDIT_RETENTION_DAYS_ADMIN', 2555),
      security: await getDynamicConfig(this.env, 'AUDIT_RETENTION_DAYS_SECURITY', 1095)
    },
    performance: {
      batchSize: await getDynamicConfig(this.env, 'AUDIT_BATCH_INSERT_SIZE', 50),
      bufferSize: await getDynamicConfig(this.env, 'AUDIT_LOG_BUFFER_SIZE', 100),
      cacheTTL: await getDynamicConfig(this.env, 'AUDIT_CACHE_TTL_SECONDS', 300)
    },
    alerts: {
      enabled: await getDynamicConfig(this.env, 'AUDIT_ALERTS_ENABLED', true),
      channels: await getDynamicConfig(this.env, 'AUDIT_ALERT_CHANNELS', 'console,webhook'),
      cooldown: await getDynamicConfig(this.env, 'AUDIT_ALERT_COOLDOWN_MS', 300000)
    }
  };
}

// Sử dụng cấu hình trong xử lý log
async log(auditEvent, context = null) {
  const config = await this.getAuditConfig();
  
  // Áp dụng kích thước buffer
  if (this.logBuffer.length >= config.performance.bufferSize) {
    await this.flushBuffer();
  }
  
  // Kiểm tra điều kiện cảnh báo
  if (config.alerts.enabled && this.shouldAlert(auditEvent)) {
    await this.triggerAlert(auditEvent, config.alerts);
  }
  
  // Tiếp tục với logic ghi log hiện có...
}
```

### **3. Cấu Hình Giám Sát Real-time**

**File**: `src/services/auditMonitoringService.js`

```javascript
async startMonitoring() {
  const realtimeEnabled = await getDynamicConfig(this.env, 'AUDIT_REALTIME_ENABLED', true);
  const intervalMs = await getDynamicConfig(this.env, 'AUDIT_REALTIME_INTERVAL_MS', 5000);
  const threatDetection = await getDynamicConfig(this.env, 'AUDIT_THREAT_DETECTION', true);
  
  if (!realtimeEnabled) {
    auditMonitoring_log('Giám sát real-time bị tắt qua cấu hình KV');
    return false;
  }
  
  this.threatDetectionEnabled = threatDetection;
  this.monitoringInterval = setInterval(async () => {
    await this.processNewEvents();
  }, intervalMs);
  
  return true;
}
```

### **4. Cấu Hình Hệ Thống Cảnh Báo**

**File**: `src/services/alertSystemService.js`

```javascript
async sendAlert(alert) {
  const alertsEnabled = await getDynamicConfig(this.env, 'AUDIT_ALERTS_ENABLED', true);
  const channels = await getDynamicConfig(this.env, 'AUDIT_ALERT_CHANNELS', 'console');
  const webhookUrl = await getDynamicConfig(this.env, 'AUDIT_WEBHOOK_URL', '');
  
  if (!alertsEnabled) return;
  
  const channelList = channels.split(',').map(c => c.trim());
  
  for (const channel of channelList) {
    switch (channel) {
      case 'console':
        this.handleConsoleAlert(alert);
        break;
      case 'webhook':
        if (webhookUrl) await this.handleWebhookAlert(alert, webhookUrl);
        break;
      case 'email':
        await this.handleEmailAlert(alert);
        break;
    }
  }
}
```

---

## 🔄 **CHIẾN LƯỢC MIGRATION**

### **Giai Đoạn 1: Thêm KV Keys**
1. **Cập nhật `kvKeys.js`** với các khóa cấu hình cụ thể cho audit
2. **Cập nhật test data** trong `tests/init/kv_config.json`
3. **Test KV Admin endpoints** với các khóa mới

### **Giai Đoạn 2: Tích Hợp Service**
1. **Sửa đổi các audit services** để sử dụng cấu hình động
2. **Cập nhật cấu hình hiệu năng**
3. **Triển khai cấu hình hệ thống cảnh báo**

### **Giai Đoạn 3: Mở Rộng API**
1. **Thêm endpoints cụ thể cho audit** để cấu hình theo danh mục
2. **Triển khai validation cấu hình** và testing endpoints
3. **Thêm chức năng import/export**

### **Giai Đoạn 4: Tài Liệu & Testing**
1. **Cập nhật tài liệu API**
2. **Tạo test cases toàn diện**
3. **Performance testing với các cấu hình khác nhau**

---

## 📈 **GIÁM SÁT & THỰC HÀNH TỐT NHẤT**

### **Giám Sát Cấu Hình**
```javascript
// Giám sát thay đổi cấu hình KV
{
  "action": "AUDIT_CONFIG_PERFORMANCE_IMPACT",
  "details": {
    "old_buffer_size": 50,
    "new_buffer_size": 200,
    "performance_impact": "positive",
    "metrics": {
      "processing_time_ms": 120,
      "memory_usage_mb": 15
    }
  }
}
```

### **Thực Hành Tốt Nhất**
- ✅ **Xác thực phạm vi** cho giá trị số (ví dụ: kích thước buffer)
- ✅ **Test tác động hiệu năng** trước khi áp dụng thay đổi cấu hình
- ✅ **Giám sát các chỉ số hệ thống** sau khi cập nhật cấu hình
- ✅ **Duy trì backup cấu hình** với chức năng export
- ✅ **Sử dụng semantic versioning** cho schemas cấu hình
- ✅ **Ghi chép tất cả thay đổi** trong audit logs

### **Quy Tắc Validation Cấu Hình**
```javascript
const AUDIT_CONFIG_VALIDATION = {
  AUDIT_RETENTION_DAYS_GENERAL: { min: 1, max: 3650 },
  AUDIT_RETENTION_DAYS_ADMIN: { min: 365, max: 9999 },
  AUDIT_BATCH_INSERT_SIZE: { min: 10, max: 1000 },
  AUDIT_LOG_BUFFER_SIZE: { min: 10, max: 500 },
  AUDIT_REALTIME_INTERVAL_MS: { min: 1000, max: 60000 },
  AUDIT_ALERT_COOLDOWN_MS: { min: 30000, max: 3600000 }
};
```

---

## 🌍 **HỖ TRỢ CẤU HÌNH i18n**

Hệ thống audit bao gồm các tùy chọn cấu hình i18n toàn diện để hỗ trợ triển khai đa ngôn ngữ và thông báo lỗi được bản địa hóa.

### **🌐 Các Khóa Cấu Hình i18n Được Đề Xuất**

| Khóa | Mục Đích | Giá Trị Mặc Định | Kiểu | Mô Tả |
|------|----------|-------------------|------|-------|
| `AUDIT_DEFAULT_LANGUAGE` | Ngôn ngữ audit mặc định | `"vi"` | string | Ngôn ngữ mặc định cho audit logs và responses |
| `AUDIT_SUPPORTED_LANGUAGES` | Ngôn ngữ được hỗ trợ | `"en,vi,fr,es,de,ja,th"` | string | Danh sách ngôn ngữ hỗ trợ (phân cách bằng dấu phẩy) |
| `AUDIT_AUTO_DETECT_LANGUAGE` | Tự động phát hiện ngôn ngữ | `true` | boolean | Tự động phát hiện ngôn ngữ từ Accept-Language header |
| `AUDIT_FALLBACK_LANGUAGE` | Ngôn ngữ dự phòng | `"en"` | string | Ngôn ngữ sử dụng khi phát hiện thất bại |
| `AUDIT_LOCALIZE_ERROR_MESSAGES` | Bản địa hóa thông báo lỗi | `true` | boolean | Bật thông báo lỗi đa ngôn ngữ |
| `AUDIT_LOCALIZE_LOG_METADATA` | Bản địa hóa metadata log | `false` | boolean | Bản địa hóa các trường metadata trong audit logs |
| `AUDIT_TRANSLATION_CACHE_TTL` | TTL cache dịch thuật | `3600` | number | Thời gian cache bản dịch (giây) |

### **🔧 Ví dụ Cấu hình i18n**

**Bật hỗ trợ tiếng Nhật và tiếng Đức**:
```bash
curl -X PUT "http://localhost:8787/api/kv-admin/configs/AUDIT_SUPPORTED_LANGUAGES" \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"value": "en,vi,fr,es,de,ja,th"}'
```

**Đặt tiếng Việt làm mặc định cho thị trường Việt Nam**:
```bash
curl -X PUT "http://localhost:8787/api/kv-admin/configs/AUDIT_DEFAULT_LANGUAGE" \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{"value": "vi"}'
```

**Cấu hình hàng loạt i18n**:
```bash
curl -X POST "http://localhost:8787/api/kv-admin/configs/batch" \
  -H "Authorization: Bearer <super_admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "configs": {
      "AUDIT_DEFAULT_LANGUAGE": "vi",
      "AUDIT_AUTO_DETECT_LANGUAGE": true,
      "AUDIT_LOCALIZE_ERROR_MESSAGES": true,
      "AUDIT_TRANSLATION_CACHE_TTL": 7200
    }
  }'
```

### **🌐 Tích hợp Dịch vụ i18n**

**File**: `src/services/auditI18nService.js` (Đề xuất)

```javascript
export class AuditI18nService {
  constructor(env) {
    this.env = env;
  }

  async getAuditLanguage(request) {
    const autoDetect = await getDynamicConfig(this.env, 'AUDIT_AUTO_DETECT_LANGUAGE', true);
    
    if (!autoDetect) {
      return await getDynamicConfig(this.env, 'AUDIT_DEFAULT_LANGUAGE', 'vi');
    }

    // Logic phát hiện ngôn ngữ với cấu hình KV
    const supportedLangs = await getDynamicConfig(this.env, 'AUDIT_SUPPORTED_LANGUAGES', 'en,vi');
    const supportedLanguages = supportedLangs.split(',');
    
    // Tiếp tục với logic phát hiện i18n hiện có...
    return detectedLanguage;
  }

  async localizeAuditMessage(messageKey, language, params = {}) {
    const cacheEnabled = await getDynamicConfig(this.env, 'AUDIT_TRANSLATION_CACHE_TTL', 3600) > 0;
    
    if (cacheEnabled) {
      // Sử dụng cached translations
    }
    
    // Logic bản địa hóa
    return localizedMessage;
  }
}
```

### **📊 Dashboard Cấu hình i18n**

Các endpoints chuyên biệt được đề xuất cho cấu hình audit i18n:

```javascript
// Lấy cấu hình i18n hiện tại
GET /api/kv-admin/configs/audit/i18n

// Cập nhật cài đặt i18n
PUT /api/kv-admin/configs/audit/i18n
Body: {
  "defaultLanguage": "vi",
  "supportedLanguages": ["en", "vi", "fr", "es", "de", "ja", "th"],
  "autoDetect": true
}

// Kiểm thử cấu hình i18n
POST /api/kv-admin/configs/audit/i18n/test
Body: {
  "language": "vi",
  "messageKey": "validation.required",
  "params": {"field": "email"}
}

// Lấy thống kê i18n
GET /api/kv-admin/configs/audit/i18n/stats
Response: {
  "supportedLanguages": 7,
  "activeLanguages": ["en", "vi", "fr"],
  "translationCacheHitRate": 0.95,
  "mostUsedLanguage": "vi"
}
```

---

## 🔗 **ĐIỂM TÍCH HỢP**

### **Services Cần Cập Nhật**
1. **`auditLogService.js`** - Ghi log cốt lõi với retention có thể cấu hình
2. **`auditArchivalService.js`** - Chính sách retention có thể cấu hình  
3. **`auditMonitoringService.js`** - Cài đặt giám sát real-time
4. **`alertSystemService.js`** - Cấu hình cảnh báo và kênh
5. **`auditExportService.js`** - Định dạng export và giới hạn kích thước
6. **`auditI18nService.js`** - Dịch vụ bản địa hóa và đa ngôn ngữ
7. **`securityIncidentService.js`** - Phản hồi sự cố có thể cấu hình

### **Cập Nhật Route**
1. **`audit.js`** - Giới hạn tìm kiếm và cài đặt phân trang
2. **`advancedAudit.js`** - Cấu hình analytics và archival
3. **`realtimeMonitoring.js`** - Cài đặt giám sát và phát hiện mối đe dọa
4. **`kvAdmin.js`** - Endpoints cụ thể cho audit mới
5. **`i18nValidator.js`** - Middleware xác thực đa ngôn ngữ

### **Tích Hợp Middleware**
- **`audit.js`** middleware sẽ tuân theo cấu hình hiệu năng
- Tích hợp **hệ thống cảnh báo** với giám sát real-time
- Cache **cấu hình động** với TTL có thể cấu hình

---

## 📝 **CÁC BƯỚC TIẾP THEO**

### **Hành Động Ngay Lập Tức** (Tuần 1-2)
1. ✅ **Mở rộng `kvKeys.js`** với các khóa cấu hình audit được đề xuất
2. ✅ **Cập nhật test fixtures** với cấu hình KV mới
3. ✅ **Tạo validation schemas** cho cài đặt cụ thể audit
4. ✅ **Test KV Admin API hiện có** với các khóa mới

### **Tích Hợp Service** (Tuần 3-4)  
1. 🔄 **Cập nhật audit services** để sử dụng cấu hình động
2. 🔄 **Triển khai tối ưu hiệu năng** dựa trên cài đặt KV
3. 🔄 **Thêm tích hợp cấu hình hệ thống cảnh báo**
4. 🔄 **Tạo giám sát tác động cấu hình**

### **Mở Rộng API** (Tuần 5-6)
1. 🆕 **Thêm endpoints KV cụ thể cho audit** để quản lý danh mục
2. 🆕 **Triển khai endpoints test cấu hình**
3. 🆕 **Thêm chức năng import/export** cho cấu hình audit
4. 🆕 **Tạo tính năng backup và restore cấu hình**
5. 🌍 **Tích hợp endpoints cấu hình i18n** cho quản lý đa ngôn ngữ

### **Testing & Tài Liệu** (Tuần 7-8)
1. 📚 **Cập nhật tài liệu API** với endpoints mới
2. 🧪 **Tạo test suites toàn diện** cho tất cả cấu hình
3. 📊 **Performance testing** với các tổ hợp cài đặt khác nhau
4. ✅ **User acceptance testing** với người dùng super admin
5. 🌐 **Testing i18n configuration** trên tất cả ngôn ngữ được hỗ trợ

---

## 🎯 **LỢI ÍCH MONG ĐỢI**

### **Cho Super Admins**
- 🎛️ **Cấu hình real-time** mà không cần deployment code
- 📊 **Tối ưu hiệu năng** thông qua cài đặt động
- 🚨 **Cảnh báo tùy chỉnh** cho các môi trường khác nhau
- 🌍 **Hỗ trợ đa ngôn ngữ** với cấu hình i18n linh hoạt
- 🔧 **Quản lý tập trung** tất cả cài đặt audit từ một nơi
- 🔒 **Cấu hình tuân thủ** cho yêu cầu quy định

### **Cho Vận Hành Hệ Thống**  
- 📈 **Khả năng tuning hiệu năng**
- 🔧 **Cài đặt cụ thể môi trường** (dev, staging, production)
- 📋 **Audit trail cấu hình** cho tất cả thay đổi
- 🚀 **Cập nhật cấu hình zero-downtime**

### **Cho Nhóm Phát Triển**
- 🛠️ **Giảm tần suất deployment** cho thay đổi cấu hình
- 🔍 **Giám sát và quan sát tốt hơn**
- 📝 **Quản lý cấu hình chuẩn hóa**
- 🧪 **Testing dễ dàng hơn** với tham số có thể cấu hình

---

**Phiên Bản Tài Liệu**: 1.0.0  
**Cập Nhật Cuối**: Tháng 1 2025  
**Đánh Giá Tiếp Theo**: Tháng 3 2025

---

> 💡 **Mẹo**: Bắt đầu với các cài đặt audit quan trọng (chính sách retention và ngưỡng cảnh báo) và từ từ thêm các tùy chọn cấu hình nâng cao dựa trên mẫu sử dụng và phản hồi người dùng.
