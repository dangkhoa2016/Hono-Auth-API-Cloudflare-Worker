# 🔍 **AUDIT SYSTEM API REFERENCE - TÀI LIỆU THAM KHẢO API**

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](AUDIT_API_REFERENCE.vi.md)

**Project**: Hono Auth Worker - Enterprise Audit System  
**Status**: ✅ **PRODUCTION READY** ✅  
**Last Updated**: July 30, 2025

---

## 📋 **TABLE OF CONTENTS**

1. [🎯 Overview](#-overview)
2. [🔐 Authentication & Authorization](#-authentication--authorization)
3. [📊 Core Audit Routes (/api/audit/)](#-core-audit-routes-apiaudit)
4. [🚀 Advanced Audit Routes (/api/advanced-audit/)](#-advanced-audit-routes-apiadvanced-audit)
5. [🔴 Real-time Monitoring Routes (/api/realtime-monitoring/)](#-real-time-monitoring-routes-apirealtime-monitoring)
6. [🛡️ Security Incident Routes (/api/security-incident/)](#️-security-incident-routes-apisecurity-incident)
7. [📝 Request/Response Examples](#-requestresponse-examples)
8. [⚠️ Error Handling](#️-error-handling)
9. [🌍 i18n Support & Multilingual Error Messages](#-i18n-support--multilingual-error-messages)
10. [🔧 Testing & Validation](#-testing--validation)

---

## 🎯 **OVERVIEW**

The Hono Auth Worker features a comprehensive **Enterprise-Grade Audit System** with 4 main route groups providing 40+ endpoints for complete audit log management, real-time monitoring, and security incident response.

### **🏗️ System Architecture**

```
Enterprise Audit System API
├── 📋 Core Audit (/api/audit/)
│   ├── Basic audit log access
│   ├── Search & filtering
│   ├── Statistics & metrics
│   └── Data export (CSV/JSON)
├── 🚀 Advanced Audit (/api/advanced-audit/)
│   ├── Analytics & insights
│   ├── Compliance reporting
│   ├── Data archival & retention
│   └── Advanced export formats
├── 🔴 Real-time Monitoring (/api/realtime-monitoring/)
│   ├── Live monitoring sessions
│   ├── Threat detection & analysis
│   ├── Real-time dashboards
│   └── Alert management
└── 🛡️ Security Incident (/api/security-incident/)
    ├── Incident management
    ├── Response automation
    ├── Threat simulation
    └── Statistics & reporting
```

### **🔒 Security Features**
- **Role-based Access Control**: Admin, Super Admin permissions
- **Multi-layer Authorization**: Route-level + data-level filtering
- **Audit Trail**: All actions are logged and traceable
- **Rate Limiting**: Protection against abuse
- **Input Validation**: Zod schema validation on all inputs
- **i18n Support**: Multilingual error messages and localized responses
- **XSS Protection**: Comprehensive sanitization and security measures

---

## 🔐 **AUTHENTICATION & AUTHORIZATION**

All audit routes require authentication and specific role permissions.

### **Required Headers**
```http
Authorization: Bearer <your-jwt-token>
Content-Type: application/json
Accept-Language: en (optional, for i18n - supports en, vi, fr, es, de, ja, th)
```

### **Permission Levels**
| Role | Core Audit | Advanced Audit | Real-time Monitoring | Security Incident |
|------|------------|----------------|---------------------|-------------------|
| **Admin** | ✅ Limited | ✅ Limited | ❌ No Access | ✅ Yes |
| **Super Admin** | ✅ Full Access | ✅ Full Access | ✅ Full Access | ✅ Full Access |

### **Data Filtering by Role**
- **Admin**: Can only see logs related to regular users and their own actions
- **Super Admin**: Can see all logs including other super admin actions

---

## 📊 **CORE AUDIT ROUTES (/api/audit/)**

**Base URL**: `/api/audit/`  
**Authentication**: Required (Admin+ roles)  
**File**: `src/routes/audit.js`

### **🔍 GET /api/audit/logs**
Get paginated audit logs with filtering options.

**Access**: Admin (filtered), Super Admin (all)

**Query Parameters**:
```typescript
{
  page?: number;        // Page number (default: 1)
  limit?: number;       // Results per page (default: 10, max: 100)
  action?: string;      // Filter by action type
  userId?: string;      // Filter by user ID
  entityType?: string;  // Filter by entity type
  actorRole?: string;   // Filter by actor role (camelCase query key)
  startDate?: string;   // Filter by start date (ISO format)
  endDate?: string;     // Filter by end date (ISO format)
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
  "message": "Audit logs retrieved successfully"
}
```

### **🔍 GET /api/audit/search**
Advanced full-text search in audit logs.

**Access**: Admin (filtered), Super Admin (all)

**Query Parameters**:
```typescript
{
  query: string;        // Search query (required)
  page?: number;        // Page number (default: 1)
  limit?: number;       // Results per page (default: 10)
  userId?: string;      // Filter by user ID
  action?: string;      // Filter by action type
  entityType?: string;  // Filter by entity type
  actorRole?: string;   // Filter by actor role (camelCase query key)
  startDate?: string;   // Filter by start date
  endDate?: string;     // Filter by end date
}
```

### **📊 GET /api/audit/stats**
Get audit statistics and metrics.

**Access**: Admin (filtered), Super Admin (all)

**Query Parameters**:
```typescript
{
  timeRange?: string;   // Time range: '24h', '7d', '30d', '90d'
  groupBy?: string;     // Group by: 'action', 'user', 'date'
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
Export audit logs in various formats.

**Access**: Admin (filtered), Super Admin (all)

**Query Parameters**:
```typescript
{
  format?: 'csv' | 'json' | 'xlsx'; // Export format (default: json)
  maxRecords?: number;              // Max records (default: 1000)
  includeDetails?: boolean;         // Include detail payloads (default: true)
  filters?: object;                 // Optional structured filters object
  startDate?: string;     // Filter by start date
  endDate?: string;       // Filter by end date
}
```

### **🏥 GET /api/audit/system-health**
Get audit system health status.

**Access**: Admin, Super Admin

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

### **🗑️ DELETE /api/audit/logs/:id**
Delete a single audit log by numeric ID.

**Access**: Admin, Super Admin

**Path Parameters**:
```typescript
{
  id: number; // Required, must be > 0
}
```

---

## 🚀 **ADVANCED AUDIT ROUTES (/api/advanced-audit/)**

**Base URL**: `/api/advanced-audit/`  
**Authentication**: Required (Admin+ roles)  
**File**: `src/routes/advancedAudit.js`

### **📈 GET /api/advanced-audit/analytics**
Get comprehensive analytics and insights.

**Access**: Admin (limited), Super Admin (full)

**Query Parameters**:
```typescript
{
  timeRange?: string;     // '24h', '7d', '30d', '90d'
  analysisType?: string;  // 'general', 'security', 'behavior', 'performance'
  includeCharts?: boolean; // Include chart data
}
```

### **📈 GET /api/advanced-audit/analytics/security**
Security-focused analytics.

**Access**: Admin, Super Admin

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
      "Monitor IP 192.168.1.100 for unusual activity"
    ]
  }
}
```

### **📈 GET /api/advanced-audit/analytics/behavior**
User behavior analytics.

**Access**: Admin, Super Admin

### **📈 GET /api/advanced-audit/analytics/performance**
System performance analytics.

**Access**: Admin, Super Admin

### **📈 GET /api/advanced-audit/middleware/stats**
Get middleware usage statistics.

**Access**: Super Admin only

### **📋 GET /api/advanced-audit/compliance/report**
Generate general compliance report.

**Access**: Super Admin only

### **📋 GET /api/advanced-audit/compliance**
Generate specific compliance reports (GDPR, SOX, etc.).

**Access**: Super Admin only

**Query Parameters**:
```typescript
{
  type: 'gdpr' | 'sox' | 'iso27001'; // Compliance standard
  start_date?: string;
  end_date?: string;
  detailed?: boolean;
}
```

### **📋 POST /api/advanced-audit/compliance**
Update compliance settings.

**Access**: Super Admin only

### **🗄️ GET /api/advanced-audit/archival/stats**
Get archival statistics and policies.

**Access**: Super Admin only

### **🗄️ POST /api/advanced-audit/archival/run**
Execute data archival process.

**Access**: Super Admin only

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
Restore archived data.

**Access**: Super Admin only

### **🗄️ GET /api/advanced-audit/archive**
List available archives.

**Access**: Super Admin only

### **🗄️ POST /api/advanced-audit/archive**
Create manual archive.

**Access**: Super Admin only

### **⚙️ POST /api/advanced-audit/retention**
Configure data retention policies.

**Access**: Super Admin only

### **📤 POST /api/advanced-audit/export-advanced**
Advanced data export with more options.

**Access**: Super Admin only

---

## 🔴 **REAL-TIME MONITORING ROUTES (/api/realtime-monitoring/)**

**Base URL**: `/api/realtime-monitoring/`  
**Authentication**: Required (Super Admin only)  
**File**: `src/routes/realtimeMonitoring.js`

### **🔍 GET /monitoring/status**
Get current monitoring system status.

**Access**: Super Admin only

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
Start real-time monitoring session.

**Access**: Super Admin only

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
Stop real-time monitoring session.

**Access**: Super Admin only

### **⚠️ GET /monitoring/threats**
Get current threat status and detected threats.

**Access**: Super Admin only

### **✅ POST /monitoring/threats/:threatId/resolve**
Resolve a detected threat.

**Access**: Super Admin only

### **🔍 POST /monitoring/analyze**
Run manual threat analysis for specific time range.

**Access**: Super Admin only

### **🧪 POST /monitoring/simulate**
Simulate events for testing purposes.

**Access**: Super Admin only

### **� GET /events/recent**
Get recent monitoring events.

**Access**: Super Admin only

### **🔔 GET /alerts/status**
Get alert system status.

**Access**: Super Admin only

### **⚙️ POST /alerts/configure**
Configure alert system settings.

**Access**: Super Admin only

### **📜 GET /alerts/history**
Get alert history.

**Access**: Super Admin only

### **📨 POST /alerts/send**
Send a manual alert.

**Access**: Super Admin only

### **📏 GET /alerts/rules**
Get alert rules.

**Access**: Super Admin only

### **➕ POST /alerts/rules**
Create a new alert rule.

**Access**: Super Admin only

### **🔄 PUT /alerts/rules/:ruleId/toggle**
Toggle an alert rule on/off.

**Access**: Super Admin only

### **📢 GET /alerts/channels**
Get notification channels.

**Access**: Super Admin only

### **🔧 POST /alerts/channels**
Configure notification channels.

**Access**: Super Admin only

### **🧪 POST /alerts/test**
Test alert system.

**Access**: Super Admin only

### **📊 GET /dashboard/overview**
Get dashboard overview.

**Access**: Super Admin only

### **📈 GET /dashboard/realtime**
Get live dashboard data.

**Access**: Super Admin only

### **🔴 GET /dashboard/live**
Get live monitoring view.

**Access**: Super Admin only

### **⏱️ GET /dashboard/timeline**
Get historical timeline data.

**Access**: Super Admin only

### **🛡️ GET /dashboard/security**
Get security metrics dashboard.

**Access**: Super Admin only

### **🚀 GET /dashboard/performance**
Get performance metrics dashboard.

**Access**: Super Admin only

### **🏥 GET /dashboard/health**
Get dashboard system health.

**Access**: Admin and Super Admin

### **📤 POST /dashboard/export**
Export dashboard data.

**Access**: Super Admin only

### **🧹 DELETE /dashboard/cache**
Clear dashboard cache.

**Access**: Super Admin only

### **📝 POST /incidents/create**
Create incident from monitoring event.

**Access**: Super Admin only

---

## 🛡️ **SECURITY INCIDENT ROUTES (/api/security-incident/)**

**Base URL**: `/api/security-incident/`  
**Authentication**: Required (Admin+ roles)  
**File**: `src/routes/securityIncident.js`

### **📋 GET /incidents**
Get all security incidents with filtering.

**Access**: Admin, Super Admin

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
Create a new security incident manually.

**Access**: Admin, Super Admin

**Request Body**:
```json
{
  "title": "Suspicious login activity detected",
  "description": "Multiple failed login attempts from IP 192.168.1.100",
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
Get specific incident details.

**Access**: Admin, Super Admin

### **🔄 PUT /incidents/:id/status**
Update incident status.

**Access**: Admin, Super Admin

### **⚡ POST /incidents/:id/response**
Execute manual response actions.

**Access**: Admin, Super Admin

### **📊 GET /statistics**
Get incident statistics.

**Access**: Admin, Super Admin

### **🏥 GET /status**
Get security service status and configuration.

**Access**: Admin, Super Admin

### **🧪 POST /simulate**
Simulate a security threat for testing.

**Access**: Admin, Super Admin (Development environment only)

---

## 📝 **REQUEST/RESPONSE EXAMPLES**

### **Authentication Example**
```bash
# Login first to get token
curl -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "securepassword"}'

# Use token in subsequent requests
curl -X GET http://localhost:8788/api/audit/logs \
  -H "Authorization: Bearer your-access-token-here"
```

### **Paginated Query Example**
```bash
# Get audit logs with pagination and filtering
curl -X GET "http://localhost:8788/api/audit/logs?page=1&limit=20&action=LOGIN_SUCCESS" \
  -H "Authorization: Bearer your-token"
```

### **Search Example**
```bash
# Search audit logs
curl -X GET "http://localhost:8788/api/audit/search?query=failed+login&limit=10" \
  -H "Authorization: Bearer your-token"
```

### **Export Example**
```bash
# Export as CSV
curl -X GET "http://localhost:8788/api/audit/export?format=csv&limit=1000" \
  -H "Authorization: Bearer your-token"
```

---

## ⚠️ **ERROR HANDLING**

### **Common Error Responses**

**401 Unauthorized**:
```json
{
  "success": false,
  "error": "Authentication required",
  "details": "Missing or invalid authorization token"
}
```

**403 Forbidden**:
```json
{
  "success": false,
  "error": "Insufficient permissions",
  "details": "Super admin role required for this action"
}
```

**400 Bad Request**:
```json
{
  "success": false,
  "error": "Invalid request parameters",
  "details": "Validation failed for field 'limit': must be between 1 and 100"
}
```

**429 Too Many Requests**:
```json
{
  "success": false,
  "error": "Rate limit exceeded",
  "details": "Maximum 100 requests per minute allowed"
}
```

**500 Internal Server Error**:
```json
{
  "success": false,
  "error": "Internal server error",
  "details": "Database connection failed"
}
```

---

## 🌍 **i18n SUPPORT & MULTILINGUAL ERROR MESSAGES**

The Audit System API provides comprehensive **multilingual support** with localized error messages and responses across all endpoints.

### **🌐 Supported Languages**
- **English (`en`)** - Default language
- **Vietnamese (`vi`)** - Full localization support  
- **French (`fr`)** - Complete error message coverage
- **Spanish (`es`)** - Complete error message coverage
- **German (`de`)** - Complete error message coverage
- **Japanese (`ja`)** - Complete error message coverage
- **Thai (`th`)** - Complete error message coverage

### **🎯 Language Detection Priority**
1. **Query Parameter**: `?lang=vi` (highest priority)
2. **Accept-Language Header**: `Accept-Language: vi,en;q=0.9`
3. **Default Fallback**: English (`en`)

### **📋 Multilingual Error Examples**

**English Error Response**:
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

**Vietnamese Error Response** (with `Accept-Language: vi`):
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

**German Error Response** (with `Accept-Language: de`):
```json
{
  "success": false,
  "error": "Validierung fehlgeschlagen",
  "details": "Ungültiges Suchanfrage-Format",
  "errors": [
    {
      "field": "query",
      "message": "Suchanfrage muss mindestens 3 Zeichen lang sein"
    }
  ]
}
```

### **🔍 API Endpoints with Multilingual Support**

**All Audit System endpoints support multilingual error messages**:
- **Core Audit Routes** (`/api/audit/*`) - 6 endpoints with full i18n
- **Advanced Audit Routes** (`/api/advanced-audit/*`) - 15 endpoints with full i18n
- **Real-time Monitoring Routes** (`/api/realtime-monitoring/*`) - 15+ endpoints with full i18n
- **Security Incident Routes** (`/api/security-incident/*`) - 10+ endpoints with full i18n

### **🌐 Usage Examples**

```bash
# Request with Vietnamese language
curl -X GET "http://localhost:8788/api/audit/logs?invalid_param=test" \
  -H "Authorization: Bearer your-token" \
  -H "Accept-Language: vi"

# Request with query parameter override
curl -X GET "http://localhost:8788/api/audit/logs?lang=ja&invalid_param=test" \
  -H "Authorization: Bearer your-token"

# Request with multiple language preferences
curl -X GET "http://localhost:8788/api/audit/logs?invalid_param=test" \
  -H "Authorization: Bearer your-token" \
  -H "Accept-Language: fr,en;q=0.9,de;q=0.8"
```

---

## 🔧 **TESTING & VALIDATION**

### **Quick Test Entry Points**

```bash
# Recommended audit entry points
npm run test:audit:system
npm run test:audit:quick
npm run test:audit:comprehensive
npm run test:multilang_validation
```

For the complete audit test matrix, mode-by-mode runners, and troubleshooting, use [TEST_GUIDE.md](./TEST_GUIDE.md) and [TEST_SCRIPTS.md](./TEST_SCRIPTS.md).

### **Manual Testing with cURL**

See comprehensive cURL commands in:
- `tests/scripts/CURL_COMMANDS.md` (English)
- `tests/scripts/CURL_COMMANDS_vi.md` (Vietnamese)

### **Test Coverage**

- ✅ **40+ API Endpoints** fully tested
- ✅ **Role-based Access Control** validation
- ✅ **Multilingual Error Messages** tested across 7 languages
- ✅ **i18n Validation System** comprehensive coverage
- ✅ **Performance Testing** for all audit routes
- ✅ **Security Testing** including XSS protection
- ✅ **Integration Testing** with unified middleware
- ✅ **Error Handling** comprehensive validation
- ✅ **Input Validation** with Zod schemas
- ✅ **Performance Testing** under load
- ✅ **Security Testing** (SQL injection, XSS prevention)
- ✅ **Integration Testing** with real database
- ✅ **Error Handling** for all edge cases

---

## 🔗 **RELATED DOCUMENTATION**

- [Enterprise Audit System Complete Guide](./ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.md)
- [Test Guide](./TEST_GUIDE.md)
- [Role Management Guide](./ROLE_COMPLETE_GUIDE.md)
- [Database Service Guide](./DATABASE_SERVICE.md)
- [Setup Guide](./SETUP_GUIDE.md)

---

**📞 Support**: For technical support or questions, refer to the test suite documentation or run the interactive test menu with `npm run test`.
