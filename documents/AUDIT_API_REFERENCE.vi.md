# 🔍 **AUDIT SYSTEM API REFERENCE - TÀI LIỆU THAM KHẢO API**

> 🌐 Language / Ngôn ngữ: [English](AUDIT_API_REFERENCE.md) | **Tiếng Việt**

**Dự án**: Hono Auth Worker - Hệ thống Audit Doanh nghiệp  
**Trạng thái**: ✅ **SẴN SÀNG PRODUCTION** ✅  
**Cập nhật lần cuối**: 30 tháng 7, 2025

---

## 📋 **MỤC LỤC**

1. [🎯 Tổng quan](#-tổng-quan)
2. [🔐 Xác thực & Phân quyền](#-xác-thực--phân-quyền)
3. [📊 Routes Audit Cốt lõi (/api/audit/)](#-routes-audit-cốt-lõi-apiaudit)
4. [🚀 Routes Audit Nâng cao (/api/advanced-audit/)](#-routes-audit-nâng-cao-apiadvanced-audit)
5. [🔴 Routes Giám sát Thời gian thực (/api/realtime-monitoring/)](#-routes-giám-sát-thời-gian-thực-apirealtime-monitoring)
6. [🛡️ Routes Sự cố Bảo mật (/api/security-incident/)](#️-routes-sự-cố-bảo-mật-apisecurity-incident)
7. [📝 Ví dụ Request/Response](#-ví-dụ-requestresponse)
8. [⚠️ Xử lý Lỗi](#️-xử-lý-lỗi)
9. [🌍 Hỗ trợ i18n & Thông báo Lỗi Đa ngôn ngữ](#-hỗ-trợ-i18n--thông-báo-lỗi-đa-ngôn-ngữ)
10. [🔧 Kiểm thử & Xác thực](#-kiểm-thử--xác-thực)

---

## 🎯 **TỔNG QUAN**

Hono Auth Worker tích hợp một **Hệ thống Audit Cấp Doanh nghiệp** toàn diện với 4 nhóm routes chính cung cấp 40+ endpoints cho quản lý audit log hoàn chỉnh, giám sát thời gian thực, và xử lý sự cố bảo mật.

### **🏗️ Kiến trúc Hệ thống**

```
Enterprise Audit System API
├── 📋 Core Audit (/api/audit/)
│   ├── Truy cập audit log cơ bản
│   ├── Tìm kiếm & lọc
│   ├── Thống kê & metrics
│   └── Xuất dữ liệu (CSV/JSON)
├── 🚀 Advanced Audit (/api/advanced-audit/)
│   ├── Phân tích & insights
│   ├── Báo cáo tuân thủ
│   ├── Lưu trữ & bảo quản dữ liệu
│   └── Định dạng xuất nâng cao
├── 🔴 Real-time Monitoring (/api/realtime-monitoring/)
│   ├── Phiên giám sát trực tiếp
│   ├── Phát hiện & phân tích mối đe dọa
│   ├── Dashboard thời gian thực
│   └── Quản lý cảnh báo
└── 🛡️ Security Incident (/api/security-incident/)
    ├── Quản lý sự cố
    ├── Tự động hóa phản hồi
    ├── Mô phỏng mối đe dọa
    └── Thống kê & báo cáo
```

### **🔒 Tính năng Bảo mật**
- **Kiểm soát Truy cập dựa trên Vai trò**: Quyền Admin, Super Admin
- **Phân quyền Đa lớp**: Cấp route + cấp dữ liệu filtering
- **Audit Trail**: Tất cả hành động được log và có thể truy vết
- **Rate Limiting**: Bảo vệ chống lạm dụng
- **Xác thực Input**: Zod schema validation trên tất cả input
- **Hỗ trợ i18n**: Thông báo lỗi đa ngôn ngữ và phản hồi được bản địa hóa
- **Bảo vệ XSS**: Làm sạch toàn diện và các biện pháp bảo mật

---

## 🔐 **XÁC THỰC & PHÂN QUYỀN**

Tất cả routes audit đều yêu cầu xác thực và quyền vai trò cụ thể.

### **Headers Bắt buộc**
```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
Accept-Language: vi (tùy chọn, cho i18n - hỗ trợ en, vi, fr, es, de, ja, th)
```

### **Cấp độ Quyền**
| Vai trò | Core Audit | Advanced Audit | Real-time Monitoring | Security Incident |
|---------|------------|----------------|---------------------|-------------------|
| **Admin** | ✅ Hạn chế | ✅ Hạn chế | ❌ Không truy cập | ✅ Có |
| **Super Admin** | ✅ Toàn bộ | ✅ Toàn bộ | ✅ Toàn bộ | ✅ Toàn bộ |

### **Lọc Dữ liệu theo Vai trò**
- **Admin**: Chỉ có thể xem logs liên quan đến người dùng thường và hành động của chính họ
- **Super Admin**: Có thể xem tất cả logs bao gồm hành động của super admin khác

---

## 📊 **ROUTES AUDIT CỐT LÕI (/api/audit/)**

**Base URL**: `/api/audit/`  
**Xác thực**: Bắt buộc (Vai trò Admin+)  
**File**: `src/routes/audit.js`

### **🔍 GET /api/audit/logs**
Lấy audit logs phân trang với tùy chọn lọc.

**Quyền truy cập**: Admin (đã lọc), Super Admin (tất cả)

**Query Parameters**:
```typescript
{
  page?: number;        // Số trang (mặc định: 1)
  limit?: number;       // Kết quả mỗi trang (mặc định: 10, tối đa: 100)
  action?: string;      // Lọc theo loại hành động
  userId?: string;      // Lọc theo ID người dùng
  entityType?: string;  // Lọc theo loại entity
  startDate?: string;   // Lọc theo ngày bắt đầu (định dạng ISO)
  endDate?: string;     // Lọc theo ngày kết thúc (định dạng ISO)
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "uuid",
        "action": "LOGIN_SUCCESS",
        "actor_id": "user-id",
        "actor_type": "user",
        "target_id": "target-id",
        "target_type": "session",
        "metadata": {},
        "ip_address": "192.168.1.1",
        "user_agent": "Mozilla/5.0...",
        "created_at": "2025-07-21T10:30:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 150,
      "totalPages": 15,
      "hasNext": true,
      "hasPrev": false
    }
  },
  "message": "Lấy audit logs thành công"
}
```

### **🔍 GET /api/audit/search**
Tìm kiếm full-text nâng cao trong audit logs.

**Quyền truy cập**: Admin (đã lọc), Super Admin (tất cả)

**Query Parameters**:
```typescript
{
  query: string;        // Chuỗi tìm kiếm (bắt buộc)
  page?: number;        // Số trang (mặc định: 1)
  limit?: number;       // Kết quả mỗi trang (mặc định: 10)
  action?: string;      // Lọc theo loại hành động
  startDate?: string;   // Lọc theo ngày bắt đầu
  endDate?: string;     // Lọc theo ngày kết thúc
}
```

### **📊 GET /api/audit/stats**
Lấy thống kê và metrics audit.

**Quyền truy cập**: Admin (đã lọc), Super Admin (tất cả)

**Query Parameters**:
```typescript
{
  timeRange?: string;   // Khoảng thời gian: '24h', '7d', '30d', '90d'
  groupBy?: string;     // Nhóm theo: 'action', 'user', 'date'
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "totalLogs": 1500,
    "logsByAction": {
      "LOGIN_SUCCESS": 450,
      "LOGIN_FAILED": 50,
      "USER_CREATED": 100
    },
    "logsByDate": {
      "2025-07-21": 250,
      "2025-07-20": 300
    },
    "activeUsers": 45,
    "timeRange": "7d"
  }
}
```

### **📥 GET /api/audit/export**
Xuất audit logs trong các định dạng khác nhau.

**Quyền truy cập**: Admin (đã lọc), Super Admin (tất cả)

**Query Parameters**:
```typescript
{
  format: 'csv' | 'json'; // Định dạng xuất (bắt buộc)
  limit?: number;         // Số bản ghi tối đa (mặc định: 1000)
  action?: string;        // Lọc theo hành động
  startDate?: string;     // Lọc theo ngày bắt đầu
  endDate?: string;       // Lọc theo ngày kết thúc
}
```

### **🏥 GET /api/audit/system-health**
Lấy trạng thái sức khỏe hệ thống audit.

**Quyền truy cập**: Admin, Super Admin

**Response**:
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "databaseConnection": true,
    "logWriteSpeed": "normal",
    "storageUsage": "45%",
    "lastLogTime": "2025-07-21T10:30:00Z"
  }
}
```

---

## 🚀 **ROUTES AUDIT NÂNG CAO (/api/advanced-audit/)**

**Base URL**: `/api/advanced-audit/`  
**Xác thực**: Bắt buộc (Vai trò Admin+)  
**File**: `src/routes/advancedAudit.js`

### **📈 GET /api/advanced-audit/analytics**
Lấy phân tích toàn diện và insights.

**Quyền truy cập**: Admin (hạn chế), Super Admin (đầy đủ)

**Query Parameters**:
```typescript
{
  timeRange?: string;     // '24h', '7d', '30d', '90d'
  analysisType?: string;  // 'general', 'security', 'behavior', 'performance'
  includeCharts?: boolean; // Bao gồm dữ liệu biểu đồ
}
```

### **📈 GET /api/advanced-audit/analytics/security**
Phân tích tập trung vào bảo mật.

**Quyền truy cập**: Admin, Super Admin

**Response**:
```json
{
  "success": true,
  "data": {
    "securityMetrics": {
      "failedLogins": 25,
      "suspiciousActivities": 3,
      "blockedIPs": 2
    },
    "threatLevel": "low",
    "recommendations": [
      "Giám sát IP 192.168.1.100 về hoạt động bất thường"
    ]
  }
}
```

### **📈 GET /api/advanced-audit/analytics/behavior**
Phân tích hành vi người dùng.

**Quyền truy cập**: Admin, Super Admin

### **📈 GET /api/advanced-audit/analytics/performance**
Phân tích hiệu suất hệ thống.

**Quyền truy cập**: Admin, Super Admin

### **📋 GET /api/advanced-audit/compliance**
Tạo báo cáo tuân thủ (GDPR, SOX, v.v.).

**Quyền truy cập**: Chỉ Super Admin

**Query Parameters**:
```typescript
{
  reportType: 'gdpr' | 'sox' | 'hipaa'; // Tiêu chuẩn tuân thủ
  startDate: string;                    // Bắt buộc
  endDate: string;                      // Bắt buộc
  format?: 'json' | 'pdf';             // Định dạng đầu ra
}
```

### **🗄️ GET /api/advanced-audit/archival/stats**
Lấy thống kê lưu trữ và chính sách.

**Quyền truy cập**: Chỉ Super Admin

### **🗄️ POST /api/advanced-audit/archival/run**
Thực thi quá trình lưu trữ dữ liệu.

**Quyền truy cập**: Chỉ Super Admin

**Request Body**:
```json
{
  "retentionDays": 90,
  "dryRun": true,
  "compressionLevel": "high",
  "targetTable": "audit_logs_archive"
}
```

### **🗄️ POST /api/advanced-audit/archival/restore**
Khôi phục dữ liệu đã lưu trữ.

**Quyền truy cập**: Chỉ Super Admin

---

## 🔴 **ROUTES GIÁM SÁT THỜI GIAN THỰC (/api/realtime-monitoring/)**

**Base URL**: `/api/realtime-monitoring/`  
**Xác thực**: Bắt buộc (Chỉ Super Admin)  
**File**: `src/routes/realtimeMonitoring.js`

### **🔍 GET /monitoring/status**
Lấy trạng thái hiện tại của hệ thống giám sát.

**Quyền truy cập**: Chỉ Super Admin

**Response**:
```json
{
  "success": true,
  "data": {
    "monitoringActive": true,
    "activeSubscribers": 3,
    "threatsDetected": 0,
    "lastAnalysis": "2025-07-21T10:30:00Z",
    "systemLoad": "normal"
  }
}
```

### **▶️ POST /monitoring/start**
Bắt đầu phiên giám sát thời gian thực.

**Quyền truy cập**: Chỉ Super Admin

**Request Body**:
```json
{
  "monitoringConfig": {
    "enableThreatDetection": true,
    "alertThreshold": "medium",
    "analysisInterval": 300
  }
}
```

### **⏹️ POST /monitoring/stop**
Dừng phiên giám sát thời gian thực.

**Quyền truy cập**: Chỉ Super Admin

### **⚠️ GET /monitoring/threats**
Lấy trạng thái mối đe dọa hiện tại và các mối đe dọa đã phát hiện.

**Quyền truy cập**: Chỉ Super Admin

### **✅ POST /monitoring/threats/:threatId/resolve**
Giải quyết một mối đe dọa đã phát hiện.

**Quyền truy cập**: Chỉ Super Admin

### **🔍 POST /monitoring/analyze**
Chạy phân tích thủ công mối đe dọa cho khoảng thời gian cụ thể.

**Quyền truy cập**: Chỉ Super Admin

### **🧪 POST /monitoring/simulate**
Mô phỏng sự kiện để kiểm thử.

**Quyền truy cập**: Chỉ Super Admin

### **📊 GET /monitoring/dashboard/realtime**
Lấy dữ liệu dashboard trực tiếp.

**Quyền truy cập**: Chỉ Super Admin

### **📊 GET /monitoring/dashboard/overview**
Lấy tổng quan dashboard.

**Quyền truy cập**: Chỉ Super Admin

---

## 🛡️ **ROUTES SỰ CỐ BẢO MẬT (/api/security-incident/)**

**Base URL**: `/api/security-incident/`  
**Xác thực**: Bắt buộc (Vai trò Admin+)  
**File**: `src/routes/securityIncident.js`

### **📋 GET /incidents**
Lấy tất cả sự cố bảo mật với lọc.

**Quyền truy cập**: Admin, Super Admin

**Query Parameters**:
```typescript
{
  status?: 'open' | 'investigating' | 'resolved' | 'closed';
  severity?: 'low' | 'medium' | 'high' | 'critical';
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
}
```

### **➕ POST /incidents**
Tạo sự cố bảo mật mới thủ công.

**Quyền truy cập**: Admin, Super Admin

**Request Body**:
```json
{
  "title": "Phát hiện hoạt động đăng nhập đáng nghi",
  "description": "Nhiều lần thất bại đăng nhập từ IP 192.168.1.100",
  "severity": "medium",
  "incidentType": "authentication_anomaly",
  "affectedSystems": ["auth_service"],
  "metadata": {
    "ip_address": "192.168.1.100",
    "user_agent": "suspicious-bot/1.0"
  }
}
```

### **🔍 GET /incidents/:id**
Lấy chi tiết sự cố cụ thể.

**Quyền truy cập**: Admin, Super Admin

### **🔄 PUT /incidents/:id/status**
Cập nhật trạng thái sự cố.

**Quyền truy cập**: Admin, Super Admin

### **⚡ POST /incidents/:id/response**
Thực thi hành động phản hồi thủ công.

**Quyền truy cập**: Admin, Super Admin

### **📊 GET /statistics**
Lấy thống kê sự cố.

**Quyền truy cập**: Admin, Super Admin

### **🏥 GET /status**
Lấy trạng thái dịch vụ bảo mật và cấu hình.

**Quyền truy cập**: Admin, Super Admin

### **🧪 POST /simulate**
Mô phỏng mối đe dọa bảo mật để kiểm thử.

**Quyền truy cập**: Admin, Super Admin (Chỉ môi trường Development)

---

## 📝 **VÍ DỤ REQUEST/RESPONSE**

### **Ví dụ Xác thực**
```bash
# Đăng nhập trước để lấy token
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "securepassword"}'

# Sử dụng token trong các request tiếp theo
curl -X GET http://localhost:8788/api/audit/logs \
  -H "Authorization: Bearer your-access-token-here"
```

### **Ví dụ Query Phân trang**
```bash
# Lấy audit logs với phân trang và lọc
curl -X GET "http://localhost:8788/api/audit/logs?page=1&limit=20&action=LOGIN_SUCCESS" \
  -H "Authorization: Bearer your-token"
```

### **Ví dụ Tìm kiếm**
```bash
# Tìm kiếm audit logs
curl -X GET "http://localhost:8788/api/audit/search?query=failed+login&limit=10" \
  -H "Authorization: Bearer your-token"
```

### **Ví dụ Xuất dữ liệu**
```bash
# Xuất dưới dạng CSV
curl -X GET "http://localhost:8788/api/audit/export?format=csv&limit=1000" \
  -H "Authorization: Bearer your-token"
```

---

## ⚠️ **XỬ LÝ LỖI**

### **Phản hồi Lỗi Thường gặp**

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "Yêu cầu xác thực",
  "details": "Token ủy quyền bị thiếu hoặc không hợp lệ"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": "Không đủ quyền",
  "details": "Cần vai trò Super admin cho hành động này"
}
```

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Tham số request không hợp lệ",
  "details": "Xác thực thất bại cho trường 'limit': phải từ 1 đến 100"
}
```

**429 Too Many Requests**:
```json
{
  "success": false,
  "error": "Vượt quá giới hạn tần suất",
  "details": "Tối đa 100 request mỗi phút được phép"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Lỗi máy chủ nội bộ",
  "details": "Kết nối cơ sở dữ liệu thất bại"
}
```

---

## 🌍 **HỖ TRỢ i18n & THÔNG BÁO LỖI ĐA NGÔN NGỮ**

API Hệ thống Audit cung cấp **hỗ trợ đa ngôn ngữ toàn diện** với thông báo lỗi và phản hồi được bản địa hóa trên tất cả các endpoints.

### **🌐 Các Ngôn ngữ Được Hỗ trợ**
- **Tiếng Anh (`en`)** - Ngôn ngữ mặc định
- **Tiếng Việt (`vi`)** - Hỗ trợ bản địa hóa đầy đủ  
- **Tiếng Pháp (`fr`)** - Bao phủ thông báo lỗi hoàn chỉnh
- **Tiếng Tây Ban Nha (`es`)** - Bao phủ thông báo lỗi hoàn chỉnh
- **Tiếng Đức (`de`)** - Bao phủ thông báo lỗi hoàn chỉnh
- **Tiếng Nhật (`ja`)** - Bao phủ thông báo lỗi hoàn chỉnh
- **Tiếng Thái (`th`)** - Bao phủ thông báo lỗi hoàn chỉnh

### **🎯 Ưu tiên Phát hiện Ngôn ngữ**
1. **Query Parameter**: `?lang=vi` (ưu tiên cao nhất)
2. **Accept-Language Header**: `Accept-Language: vi,en;q=0.9`
3. **Fallback Mặc định**: Tiếng Anh (`en`)

### **📋 Ví dụ Lỗi Đa ngôn ngữ**

**Phản hồi Lỗi Tiếng Anh**:
```json
{
  "success": false,
  "error": "Validation failed",
  "details": "Invalid search query format",
  "errors": [
    {
      "field": "query",
      "message": "Search query must be at least 3 characters long"
    }
  ]
}
```

**Phản hồi Lỗi Tiếng Việt** (với `Accept-Language: vi`):
```json
{
  "success": false,
  "error": "Xác thực thất bại",
  "details": "Định dạng truy vấn tìm kiếm không hợp lệ",
  "errors": [
    {
      "field": "query",
      "message": "Truy vấn tìm kiếm phải có ít nhất 3 ký tự"
    }
  ]
}
```

**Phản hồi Lỗi Tiếng Nhật** (với `Accept-Language: ja`):
```json
{
  "success": false,
  "error": "検証に失敗しました",
  "details": "無効な検索クエリ形式",
  "errors": [
    {
      "field": "query",
      "message": "検索クエリは少なくとも3文字以上である必要があります"
    }
  ]
}
```

### **🔍 Các API Endpoints với Hỗ trợ Đa ngôn ngữ**

**Tất cả endpoints của Hệ thống Audit đều hỗ trợ thông báo lỗi đa ngôn ngữ**:
- **Core Audit Routes** (`/api/audit/*`) - 5+ endpoints với hỗ trợ i18n đầy đủ
- **Advanced Audit Routes** (`/api/advanced-audit/*`) - 10+ endpoints với hỗ trợ i18n đầy đủ  
- **Real-time Monitoring Routes** (`/api/realtime-monitoring/*`) - 15+ endpoints với hỗ trợ i18n đầy đủ
- **Security Incident Routes** (`/api/security-incident/*`) - 10+ endpoints với hỗ trợ i18n đầy đủ

### **🌐 Ví dụ Sử dụng**

```bash
# Request với tiếng Việt
curl -X GET "http://localhost:8788/api/audit/logs?invalid_param=test" \
  -H "Authorization: Bearer your-token" \
  -H "Accept-Language: vi"

# Request với query parameter override
curl -X GET "http://localhost:8788/api/audit/logs?lang=ja&invalid_param=test" \
  -H "Authorization: Bearer your-token"

# Request với nhiều ngôn ngữ ưu tiên
curl -X GET "http://localhost:8788/api/audit/logs?invalid_param=test" \
  -H "Authorization: Bearer your-token" \
  -H "Accept-Language: fr,en;q=0.9,de;q=0.8"
```

---

## 🔧 **KIỂM THỬ & XÁC THỰC**

### **Lệnh Test có sẵn**

```bash
# Test tất cả audit endpoints
npm run test:audit:comprehensive

# Test từng nhóm route cụ thể
npm run test:audit:core          # Core audit routes
npm run test:audit:advanced      # Advanced audit routes
npm run test:audit:realtime      # Real-time monitoring
npm run test:audit:security      # Security incident routes

# Test hệ thống xác thực i18n
npm run test:i18n:validator      # Test phần mở rộng xác thực i18n
npm run test:validation:multilang # Test thông báo lỗi xác thực đa ngôn ngữ

# Performance testing
npm run test:audit:performance

# Xác thực nhanh
npm run test:audit:quick
```

### **Test thủ công với cURL**

Xem lệnh cURL toàn diện trong:
- `tests/scripts/CURL_COMMANDS.md` (Tiếng Anh)
- `tests/scripts/CURL_COMMANDS_vi.md` (Tiếng Việt)

### **Phủ sóng Test**

- ✅ **40+ API Endpoints** được test đầy đủ
- ✅ **Kiểm soát Truy cập dựa trên Vai trò** validation
- ✅ **Thông báo Lỗi Đa ngôn ngữ** được test trên 7 ngôn ngữ
- ✅ **Hệ thống Xác thực i18n** phủ sóng toàn diện
- ✅ **Performance Testing** cho tất cả audit routes
- ✅ **Security Testing** bao gồm bảo vệ XSS
- ✅ **Integration Testing** với unified middleware
- ✅ **Error Handling** xác thực toàn diện

---

## 🔗 **TÀI LIỆU LIÊN QUAN**

- [Hướng dẫn Hoàn chỉnh Hệ thống Audit Doanh nghiệp](./ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE_vi.md)
- [Hướng dẫn Test](./TEST_GUIDE_vi.md)
- [Hướng dẫn Quản lý Vai trò](./ROLE_COMPLETE_GUIDE_vi.md)
- [Hướng dẫn Database Service](./DATABASE_SERVICE_vi.md)
- [Hướng dẫn Thiết lập](./SETUP_GUIDE_vi.md)

---

**📞 Hỗ trợ**: Để được hỗ trợ kỹ thuật hoặc có câu hỏi, tham khảo tài liệu test suite hoặc chạy menu test tương tác với `npm run test`.
