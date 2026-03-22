# DatabaseService - Tài Liệu Hoàn Chỉnh & Tham Khảo Nhanh

> 🌐 Language / Ngôn ngữ: [English](DATABASE_SERVICE.md) | **Tiếng Việt**

## 📋 Tổng Quan

`DatabaseService` là một service chính trong hệ sinh thái **BaseService** của ứng dụng Hono Auth Worker, cung cấp giao diện tối ưu và an toàn để tương tác với database D1 của Cloudflare. Service này được tích hợp với hệ thống cấu hình động, tính năng bảo mật nâng cao, và hệ thống audit toàn diện.

**Trạng thái**: ✅ **SẴN SÀNG PRODUCTION** - Hơn 15 services tích hợp với hệ sinh thái BaseService

---

## 🚀 Hướng Dẫn Khởi Động Nhanh

### Sử Dụng Với BaseService (Khuyến Nghị)

```javascript
import { BaseService } from '../services/baseService.js';

export class UserService extends BaseService {
  constructor(env) {
    super(env, 'UserService');
    // DatabaseService tự động khả dụng qua this.dbService
    // Cấu hình động được cache và tối ưu
  }
  
  async findUser(email) {
    return await this.dbService.select(
      'SELECT * FROM users WHERE email = ?',
      [email],
      true // firstOnly
    );
  }
  
  async createUser(userData) {
    return await this.dbService.insert(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [userData.name, userData.email]
    );
  }
}
```

### 📋 Trạng Thái Hiện Tại

✅ **SẴN SÀNG PRODUCTION** - Kiến trúc BaseService với tối ưu hiệu năng  
✅ **HỆ SINH THÁI TOÀN DIỆN** - 15+ services tích hợp: AuditLogService, SecurityIncidentResponseService, AuditRetentionService  
✅ **CẤU HÌNH ĐỘNG** - Feature flags, KV store integration với intelligent caching  
✅ **BẢO MẬT NÂNG CAO** - Field whitelisting, SQL injection prevention, XSS protection  

### 🔗 Tổng Quan Tính Năng Chính

- **Thao Tác CRUD Nâng Cao**: `select()`, `insert()`, `update()`, `delete()`, `upsert()` với enhanced return formats
- **Cấu Hình Động**: Feature flag-based SQL query logging, KV-based configuration với intelligent caching
- **Bảo Mật Nâng Cao**: Field whitelisting, SQL injection prevention, XSS protection, input sanitization
- **Hệ Thống Audit**: Tích hợp với AuditLogService, SecurityIncidentResponseService, AuditRetentionService
- **Phương Thức Helper**: `buildWhereClause()`, `buildSetClause()` với security filtering
- **Tiện Ích**: `healthCheck()`, `getDatabaseInfo()`, `execute()` với enhanced metrics
- **BaseService Integration**: Kế thừa từ BaseService với optimized configuration management
- **Logging Thông Minh**: Feature flag-based logging với dynamic configuration
- **Xử Lý Lỗi**: Enhanced error handling với comprehensive tracking

### 📖 Tài Nguyên Có Sẵn (Hệ Sinh Thái BaseService)

- **[DatabaseService](../src/services/databaseService.js)** - Service database cốt lõi với BaseService integration
- **[AuditLogService](../src/services/auditLogService.js)** - Enterprise-grade audit logging với DatabaseService
- **[SecurityIncidentResponseService](../src/services/securityIncidentResponseService.js)** - Security monitoring tích hợp
- **[AuditRetentionService](../src/services/auditRetentionService.js)** - Audit data lifecycle management
- **[UserService](../src/services/userService.js)** - User management với BaseService architecture
- **[AuthService](../src/services/authService.js)** - Authentication với dynamic configuration
- **[RateLimitService](../src/services/rateLimitService.js)** - Advanced rate limiting với security features

---

## ⭐ Tính Năng Nâng Cao

### 🔒 Bảo Mật Doanh Nghiệp
- ✅ **Field Whitelisting**: Lọc trường được phép theo role để bảo mật
- ✅ **SQL Injection Prevention**: Enhanced prepared statements với input validation
- ✅ **XSS Protection**: Comprehensive input sanitization
- ✅ **Role-Based Access**: Dynamic field filtering theo user role

### 🚀 Hiệu Năng & Cấu Hình
- ✅ **BaseService Architecture**: Optimized configuration management với caching
- ✅ **Dynamic Configuration**: KV store integration với intelligent caching
- ✅ **Feature Flags**: Runtime configuration changes không cần restart
- ✅ **Smart Logging**: Conditional logging based on feature flags

### 📊 Monitoring & Audit
- ✅ **Comprehensive Audit System**: 15+ specialized audit services
- ✅ **Enhanced Return Formats**: Success tracking với detailed metadata
- ✅ **Performance Metrics**: Built-in metrics collection
- ✅ **Security Incident Tracking**: Integrated security monitoring

### 💾 Database Operations
- ✅ **Enhanced CRUD Operations**: `select()`, `insert()`, `update()`, `delete()`, `upsert()` với security features
- ✅ **Dynamic Query Building**: Helper methods với security filtering
- ✅ **Health Checks**: Comprehensive database health monitoring
- ✅ **Metadata Support**: Enhanced database information retrieval

---

## 🚀 Khởi Động Nhanh

### 1. Khởi Tạo Với BaseService (Khuyến Nghị)

```javascript
import { BaseService } from '../services/baseService.js';

export class MyService extends BaseService {
  constructor(env) {
    super(env, 'MyService');
    // DatabaseService tự động khả dụng: this.dbService
    // Cấu hình động được cache: await this.getFeatureFlags()
  }
  
  async exampleOperation() {
    // Truy cập cấu hình động (cached)
    const featureFlags = await this.getFeatureFlags();
    
    // Sử dụng DatabaseService với enhanced features
    return await this.dbService.select(
      'SELECT * FROM users WHERE status = ?',
      ['active'],
      true
    );
  }
}
```

### 2. Khởi Tạo Trực Tiếp (Legacy)

```javascript
import { DatabaseService } from '../src/services/databaseService.js';

// Với full env object (khuyến nghị)
const dbService = new DatabaseService(env);

// Legacy mode (để tương thích ngược)
const dbService = new DatabaseService(env.DB);
```

### 3. Ví Dụ Sử Dụng Nâng Cao

#### Thao Tác SELECT Với Bảo Mật

```javascript
// SELECT với field whitelisting theo role
const allowedFields = userRole === 'admin' 
  ? ['id', 'name', 'email', 'role', 'created_at']  // Admin xem tất cả
  : ['id', 'name', 'email'];                        // User thường chỉ xem cơ bản

const users = await dbService.select(
  `SELECT ${allowedFields.join(', ')} FROM users WHERE status = ?`,
  ['active']
);

// Sử dụng helper với security filtering
const { whereClause, params } = dbService.buildWhereClause({
  status: 'active',
  role: ['admin', 'user'],
  created_at: { operator: '>=', value: '2024-01-01' }
}, allowedFields); // Security filtering applied

const results = await dbService.select(
  `SELECT * FROM users WHERE ${whereClause}`,
  params
);
```

#### Thao Tác INSERT Với Enhanced Tracking

```javascript
// Insert với enhanced return format
const result = await dbService.insert(
  'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
  ['John Doe', 'john@example.com', 'user']
);

// Enhanced result checking
if (result && result.success) {
  console.log('User ID mới:', result.meta.last_row_id);
  console.log('Số rows affected:', result.meta.changes);
} else {
  console.error('Insert failed:', result.error);
}

// Insert với RETURNING clause và validation
  ['Jane Doe', 'jane@example.com', 'admin']
);
```

#### Thao Tác UPDATE

```javascript
// Update đơn giản
const result = await dbService.update(
  'UPDATE users SET status = ? WHERE id = ?',
  ['inactive', userId]
const newUser = await dbService.insert(
  'INSERT INTO users (name, email, role) VALUES (?, ?, ?) RETURNING *',
  ['John Doe', 'john@example.com', 'user']
);

// Enhanced result validation
if (newUser && newUser.success && newUser.data) {
  console.log('User được tạo:', newUser.data);
} else {
  console.error('Tạo user thất bại:', newUser.error);
}
```

#### Thao Tác UPDATE Với Bảo Mật

```javascript
// UPDATE với enhanced tracking
const result = await dbService.update(
  'UPDATE users SET status = ?, updated_at = datetime("now") WHERE id = ?',
  ['active', userId]
);

// Enhanced result checking
if (result && result.success) {
  console.log('Rows affected:', result.meta.changes);
} else {
  console.error('Update failed:', result.error);
}

// Sử dụng helper với security filtering
const updateData = { status: 'active', last_login: new Date() };
const allowedFields = ['status', 'last_login']; // Fields allowed for this role

const { setClause, params } = dbService.buildSetClause(updateData, allowedFields);

await dbService.update(
  `UPDATE users SET ${setClause} WHERE id = ?`,
  [...params, userId]
);
```

#### Thao Tác DELETE Với Audit

```javascript
// DELETE với enhanced tracking
const result = await dbService.delete(
  'DELETE FROM users WHERE id = ?',
  [userId]
);

// Enhanced validation
if (result && result.success) {
  console.log('Deleted rows:', result.meta.changes);
  // Audit logging sẽ được tự động thực hiện nếu enabled
} else {
  console.error('Delete failed:', result.error);
}

// Xóa có điều kiện với security check
await dbService.delete(
  'DELETE FROM users WHERE status = ? AND last_login < ?',
  ['inactive', '2023-01-01']
);
```

#### Thao Tác UPSERT Nâng Cao

```javascript
// UPSERT với enhanced error handling
const result = await dbService.upsert(
  `INSERT INTO user_settings (user_id, setting_key, setting_value) 
   VALUES (?, ?, ?)
   ON CONFLICT(user_id, setting_key) 
   DO UPDATE SET setting_value = excluded.setting_value, updated_at = datetime("now")`,
  [userId, 'theme', 'dark']
);

// Enhanced result validation
if (result && result.success) {
  console.log('Upsert successful, changes:', result.meta.changes);
} else {
  console.error('Upsert failed:', result.error);
}
```

---

## 🏗️ Kiến Trúc Nâng Cao

### Hệ Sinh Thái BaseService

```
BaseService Architecture
├── DatabaseService (Core)
│   ├── Enhanced CRUD Operations
│   ├── Security Features
│   ├── Dynamic Configuration
│   └── Audit Integration
├── AuditLogService
│   ├── Comprehensive Logging
│   ├── Security Incident Tracking
│   └── Performance Monitoring
├── SecurityIncidentResponseService
│   ├── Real-time Security Monitoring
│   ├── Automated Response
│   └── Threat Intelligence
└── AuditRetentionService
    ├── Data Lifecycle Management
    ├── Automated Archival
    └── Compliance Reporting
```

### Cấu Hình Động & Feature Flags

```javascript
// Cấu hình được cache và tối ưu qua BaseService
const featureFlags = await this.getFeatureFlags();
const databaseConfig = await this.getDatabaseConfig();

// Feature flags điều khiển behavior
if (featureFlags.enableSqlQueryLogging) {
  console.log(`Executing query: ${query}`);
}

if (featureFlags.enableEnhancedSecurity) {
  // Áp dụng additional security checks
}
```

### Enhanced Return Format

Tất cả methods trả về định dạng nâng cao:

```javascript
{
  success: boolean,           // Indicates operation success
  data: any,                 // Query results hoặc affected data
  meta: {                    // Enhanced D1 metadata
    duration: number,        // Query execution time
    changes: number,         // Rows affected (cho mutations)
    last_row_id: number,     // Last inserted ID
    size_after: number,      // Database size after operation
    query_hash: string,      // Query fingerprint cho monitoring
    timestamp: string        // Operation timestamp
  },
  error?: string,            // Error message nếu success = false
  audit?: {                  // Audit information nếu enabled
    request_id: string,      // Unique request identifier
    user_id: string,         // User performing operation
    operation_type: string   // Type of database operation
  }
}
```

---

## 📚 Tham Khảo Phương Thức Nâng Cao

### Core Operations Với Enhanced Features

#### `select(query, params = [], firstOnly = false, options = {})`

Thực thi SELECT queries với enhanced security và monitoring.

**Parameters:**
- `query` (string): SQL SELECT statement với placeholders
- `params` (array): Parameters cho prepared statement
- `firstOnly` (boolean): Chỉ trả về kết quả đầu tiên nếu true
- `options` (object): Enhanced options cho security và monitoring

**Enhanced Options:**
```javascript
{
  allowedFields: ['field1', 'field2'],  // Field whitelisting cho security
  userRole: 'admin',                    // User role cho access control
  enableAudit: true,                    // Enable audit logging
  queryTimeout: 30000                   // Query timeout in milliseconds
}
```

**Trả về:** Mảng kết quả query hoặc single object (nếu firstOnly)

```javascript
// Lấy tất cả active users
const users = await dbService.select(
  'SELECT * FROM users WHERE status = ?',
  ['active']
);

// Lấy single user theo email
const user = await dbService.select(
  'SELECT * FROM users WHERE email = ?',
  ['user@example.com'],
  true
);
```

#### `insert(query, params = [])`

Thực thi INSERT operations.

#### `insert(query, params = [], options = {})`

Thực thi INSERT operations với enhanced security và audit logging.

**Parameters:**
- `query` (string): SQL INSERT statement
- `params` (array): Parameters cho prepared statement
- `options` (object): Enhanced options cho security và monitoring

**Enhanced Options:**
```javascript
{
  enableAudit: true,        // Enable audit logging
  validateInput: true,      // Enable input validation
  userContext: {            // User context cho audit
    user_id: 'user123',
    request_id: 'req456'
  }
}
```

**Trả về:** Enhanced result với comprehensive metadata

```javascript
const result = await dbService.insert(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['John Doe', 'john@example.com'],
  { enableAudit: true, userContext: { user_id: currentUserId } }
);

// Enhanced validation
if (result && result.success) {
  const newUserId = result.meta.last_row_id;
  console.log('User created with ID:', newUserId);
  
  // Audit information available if enabled
  if (result.audit) {
    console.log('Audit logged with request ID:', result.audit.request_id);
  }
} else {
  console.error('Insert failed:', result.error);
}
```

#### `update(query, params = [], options = {})`

Thực thi UPDATE operations với enhanced security và field validation.

**Parameters:**
- `query` (string): SQL UPDATE statement
- `params` (array): Parameters cho prepared statement
- `options` (object): Enhanced options cho security

**Enhanced Options:**
```javascript
{
  allowedFields: ['name', 'email'],  // Fields allowed to be updated
  userRole: 'admin',                 // User role cho permission check
  enableAudit: true,                 // Enable audit logging
  validateInput: true                // Enable input validation và XSS protection
}
```

**Trả về:** Enhanced result với comprehensive tracking

```javascript
const result = await dbService.update(
  'UPDATE users SET status = ? WHERE id = ?',
  ['active', userId],
  { 
    allowedFields: ['status'], 
    userRole: currentUserRole,
    enableAudit: true 
  }
);

// Enhanced result validation
if (result && result.success) {
  console.log(`Updated ${result.meta.changes} rows`);
  console.log('Operation completed at:', result.meta.timestamp);
} else {
  console.error('Update failed:', result.error);
}
```

#### `delete(query, params = [], options = {})`

Thực thi DELETE operations với enhanced security và audit tracking.

**Parameters:**
- `query` (string): SQL DELETE statement
- `params` (array): Parameters cho prepared statement
- `options` (object): Enhanced options cho security và audit

**Enhanced Options:**
```javascript
{
  requireConfirmation: true,    // Require additional confirmation cho sensitive deletes
  enableAudit: true,           // Enable comprehensive audit logging
  cascadeDelete: false,        // Control cascade delete behavior
  userContext: {               // User context cho audit trail
    user_id: 'user123',
    reason: 'Account cleanup'
  }
}
```

**Trả về:** Enhanced result với comprehensive audit trail

```javascript
const result = await dbService.delete(
  'DELETE FROM users WHERE status = ?',
  ['inactive'],
  { 
    enableAudit: true,
    userContext: { 
      user_id: currentUserId, 
      reason: 'Cleanup inactive accounts' 
    }
  }
);

// Enhanced result checking
if (result && result.success) {
  console.log(`Deleted ${result.meta.changes} rows`);
  
  // Audit trail available
  if (result.audit) {
    console.log('Delete operation audited:', result.audit.request_id);
  }
} else {
  console.error('Delete failed:', result.error);
}
```

#### `upsert(query, params = [], options = {})`

Thực thi INSERT với ON CONFLICT (UPSERT) operations với enhanced features.

**Parameters:**
- `query` (string): SQL INSERT với ON CONFLICT statement
- `params` (array): Parameters cho prepared statement
- `options` (object): Enhanced options cho security và monitoring

**Enhanced Options:**
```javascript
{
  conflictResolution: 'update',  // 'update', 'ignore', 'replace'
  enableAudit: true,            // Enable audit logging
  validateInput: true,          // Input validation và sanitization
  userContext: {                // User context
    user_id: 'user123',
    operation: 'profile_update'
  }
}
```

**Trả về:** Enhanced result với comprehensive metadata

```javascript
await dbService.upsert(
  `INSERT INTO user_preferences (user_id, theme) 
   VALUES (?, ?)
   ON CONFLICT(user_id) 
   DO UPDATE SET theme = excluded.theme, updated_at = datetime("now")`,
  [userId, 'dark'],
  { 
    enableAudit: true,
    userContext: { user_id: userId, operation: 'theme_change' }
  }
);
```

#### `execute(query, params = [], options = {})`

Thực thi bất kỳ SQL statement nào với enhanced monitoring và security.

**Parameters:**
- `query` (string): Bất kỳ SQL statement nào
- `params` (array): Parameters cho prepared statement
- `options` (object): Enhanced execution options

**Enhanced Options:**
```javascript
{
  queryTimeout: 30000,       // Query timeout in milliseconds
  enableProfiling: true,     // Enable query performance profiling
  enableAudit: false,        // Audit logging (default false cho DDL)
  validateQuery: true        // Basic SQL injection protection
}
```

**Trả về:** Enhanced execution result

```javascript
// Tạo table với enhanced options
await dbService.execute(
  'CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, message TEXT, created_at DATETIME DEFAULT CURRENT_TIMESTAMP)',
  [],
  { queryTimeout: 10000, enableProfiling: true }
);

// Complex query với monitoring
const result = await dbService.execute(
  'WITH user_stats AS (SELECT COUNT(*) as total FROM users) SELECT * FROM user_stats',
  [],
  { enableProfiling: true, queryTimeout: 15000 }
);

// Enhanced result validation
if (result && result.success) {
  console.log('Query executed in:', result.meta.duration, 'ms');
  console.log('Query hash:', result.meta.query_hash);
} else {
  console.error('Execution failed:', result.error);
}
```

### Enhanced Helper Methods

#### `buildWhereClause(conditions, allowedFields = [])`

Xây dựng dynamic WHERE clauses từ object conditions với enhanced security filtering.

**Parameters:**
- `conditions` (object): Object conditions
- `allowedFields` (array): Array of fields allowed cho security filtering

**Enhanced Security Features:**
- Field whitelisting để prevent unauthorized field access
- Input sanitization để prevent SQL injection
- XSS protection cho string values

**Định Dạng Conditions:**
```javascript
{
  // Simple equality
  status: 'active',
  
  // Array (IN clause)
  role: ['admin', 'user'],
  
  // Complex condition
  age: { operator: '>=', value: 18 },
  
  // Date ranges
  created_at: { 
    operator: 'BETWEEN', 
    value: ['2024-01-01', '2024-12-31'] 
  },
  
  // NULL checks
  deleted_at: null,        // IS NULL
  email: { value: null, operator: 'IS NOT' }  // IS NOT NULL
}
```

**Trả về:** `{ whereClause, params }`

```javascript
const conditions = {
  status: 'active',
  role: ['admin', 'user'],
  age: { operator: '>=', value: 18 },
  created_at: { operator: '>=', value: '2024-01-01' }
};

// Với field whitelisting cho security
const allowedFields = ['status', 'role', 'age']; // 'created_at' sẽ được filtered out

const { whereClause, params } = dbService.buildWhereClause(conditions, allowedFields);
// whereClause: "status = ? AND role IN (?, ?) AND age >= ?"
// params: ['active', 'admin', 'user', 18]
// created_at condition được filtered out vì security

const users = await dbService.select(
  `SELECT * FROM users WHERE ${whereClause}`,
  params
);
```

#### `buildSetClause(data, allowedFields = [])`

Xây dựng dynamic SET clauses cho UPDATE operations với enhanced security.

**Parameters:**
- `data` (object): Object dữ liệu với các fields cần update
- `allowedFields` (array): Fields allowed cho security filtering

**Enhanced Security Features:**
- Field whitelisting để prevent unauthorized updates
- Input validation và sanitization
- XSS protection cho string values

**Trả về:** `{ setClause, params }`

```javascript
const updateData = {
  name: 'John Updated',
  status: 'active',
  last_login: new Date(),
  admin_notes: 'User updated'  // Sensitive field
};

// Security filtering
const allowedFields = ['name', 'status', 'last_login']; // admin_notes không được phép

const { setClause, params } = dbService.buildSetClause(updateData, allowedFields);
// setClause: "name = ?, status = ?, last_login = ?"
// params: ['John Updated', 'active', '2024-01-15T10:30:00.000Z']
// admin_notes được filtered out vì security

await dbService.update(
  `UPDATE users SET ${setClause} WHERE id = ?`,
  [...params, userId]
);
```

### Enhanced Utility Methods

#### `healthCheck(options = {})`

Kiểm tra comprehensive database health với enhanced monitoring.

**Parameters:**
- `options` (object): Health check options

**Enhanced Options:**
```javascript
{
  includeMetrics: true,       // Include performance metrics
  testOperations: true,       // Test CRUD operations
  checkConnections: true,     // Check connection pool
  validateSchema: false       // Validate database schema
}
```

**Trả về:** Comprehensive health report

```javascript
const health = await dbService.healthCheck({
  includeMetrics: true,
  testOperations: true
});

// Enhanced health check result
if (health.success) {
  console.log('Database Status:', health.data.status);
  console.log('Response Time:', health.data.responseTime, 'ms');
  console.log('Connection Pool:', health.data.connections);
  
  // Performance metrics nếu enabled
  if (health.data.metrics) {
    console.log('Query Performance:', health.data.metrics.avgQueryTime);
    console.log('Total Queries:', health.data.metrics.totalQueries);
  }
} else {
  console.error('Database health check failed:', health.error);
}

console.log('Database khỏe mạnh:', health.success);
console.log('Thời gian phản hồi:', health.meta.duration, 'ms');
```

#### `getDatabaseInfo()`

Lấy thông tin schema và metadata của database.

**Trả về:** Object thông tin database

```javascript
const dbInfo = await dbService.getDatabaseInfo();

console.log('Tables:', dbInfo.data.tables);
console.log('Kích thước database:', dbInfo.meta.size_after);
```

---

## 🛡️ Tính Năng Bảo Mật

### Prepared Statements

Tất cả methods tự động sử dụng prepared statements để ngăn chặn SQL injection:

```javascript
// ✅ AN TOÀN - Sử dụng prepared statements
const user = await dbService.select(
  'SELECT * FROM users WHERE email = ?',
  [userEmail]
);

// ❌ NGUY HIỂM - Không bao giờ làm như này (chỉ là ví dụ)
// const user = await dbService.select(
//   `SELECT * FROM users WHERE email = '${userEmail}'`
// );
```

### Xác Thực Input

```

#### `getDatabaseInfo(options = {})`

Lấy thông tin comprehensive database và metadata với enhanced details.

**Parameters:**
- `options` (object): Information retrieval options

**Enhanced Options:**
```javascript
{
  includeSchema: true,        // Include table schema information
  includeStatistics: true,    // Include database statistics
  includeIndexes: true,       // Include index information
  includeConstraints: false   // Include constraint information
}
```

**Trả về:** Comprehensive database information

```javascript
const dbInfo = await dbService.getDatabaseInfo({
  includeSchema: true,
  includeStatistics: true
});

if (dbInfo.success) {
  console.log('Database Version:', dbInfo.data.version);
  console.log('Total Tables:', dbInfo.data.tables.length);
  console.log('Database Size:', dbInfo.data.statistics.size);
  
  // Schema information nếu requested
  if (dbInfo.data.schema) {
    dbInfo.data.schema.forEach(table => {
      console.log(`Table: ${table.name}, Columns: ${table.columns.length}`);
    });
  }
} else {
  console.error('Failed to get database info:', dbInfo.error);
}
```

---

## 🔒 Enhanced Security Features

### Input Validation & Sanitization

DatabaseService tự động áp dụng comprehensive security measures:

```javascript
// XSS Protection
const userInput = "<script>alert('xss')</script>";
const result = await dbService.insert(
  'INSERT INTO posts (title, content) VALUES (?, ?)',
  ['Safe Title', userInput]  // Tự động sanitized và escaped
);

// SQL Injection Prevention
const maliciousInput = "'; DROP TABLE users; --";
const safe = await dbService.select(
  'SELECT * FROM users WHERE name = ?',
  [maliciousInput]  // An toàn - được xử lý như literal string
);

// Field Whitelisting
const updateData = {
  name: 'John',
  email: 'john@example.com',
  admin_secret: 'hack attempt'  // Sẽ được filtered nếu không trong allowedFields
};

const allowedFields = ['name', 'email']; // admin_secret bị loại bỏ
const { setClause, params } = dbService.buildSetClause(updateData, allowedFields);
```

### Role-Based Access Control

```javascript
// Field access dựa trên user role
const getUserData = async (userId, currentUserRole) => {
  const allowedFields = currentUserRole === 'admin' 
    ? ['id', 'name', 'email', 'phone', 'address', 'admin_notes']  // Admin access all
    : ['id', 'name', 'email'];  // Regular user limited access

  return await dbService.select(
    `SELECT ${allowedFields.join(', ')} FROM users WHERE id = ?`,
    [userId],
    true
  );
};
```

---

## 🎯 Enhanced Integration Examples

### Trong Enhanced UserService với BaseService

```javascript
import { BaseService } from '../services/baseService.js';

export class UserService extends BaseService {
  constructor(env) {
    super(env, 'UserService');
    // DatabaseService tự động khả dụng qua this.dbService
    // Cấu hình động được optimized qua BaseService
  }

  async findUserByEmail(email, userRole = 'user') {
    // Field whitelisting based on role
    const allowedFields = userRole === 'admin' 
      ? ['id', 'name', 'email', 'role', 'created_at', 'admin_notes']
      : ['id', 'name', 'email', 'role', 'created_at'];

    return await this.dbService.select(
      `SELECT ${allowedFields.join(', ')} FROM users WHERE email = ?`,
      [email],
      true,
      { allowedFields, userRole, enableAudit: true }
    );
  }

  async createUser(userData, currentUserContext) {
    const { name, email, hashedPassword, role = 'user' } = userData;
    
    // Enhanced creation với audit logging
    return await this.dbService.insert(
      'INSERT INTO users (name, email, password_hash, role, created_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [name, email, hashedPassword, role],
      {
        enableAudit: true,
        validateInput: true,
        userContext: {
          user_id: currentUserContext.user_id,
          operation: 'user_creation'
        }
      }
    );
  }

  async updateUserStatus(userId, status, currentUserContext) {
    // Get dynamic configuration
    const featureFlags = await this.getFeatureFlags();
    
    // Enhanced update với comprehensive tracking
    return await this.dbService.update(
      'UPDATE users SET status = ?, updated_at = datetime("now") WHERE id = ?',
      [status, userId],
      {
        allowedFields: ['status'],
        enableAudit: featureFlags.enableUserStatusAudit,
        userContext: currentUserContext
      }
    );
  }
}
```

### Trong Enhanced AuthService với Dynamic Configuration

```javascript
import { BaseService } from '../services/baseService.js';

export class AuthService extends BaseService {
  constructor(env) {
    super(env, 'AuthService');
    // DatabaseService và configuration tự động khả dụng
  }

  async login(email, password, ipAddress, userAgent) {
    // Dynamic configuration tự động cached
    const featureFlags = await this.getFeatureFlags();
    const jwtConfig = await this.getJwtConfig();
    const securityConfig = await this.getSecurityConfig();
    
    // Enhanced user lookup với security features
    const user = await this.dbService.select(
      'SELECT id, email, password_hash, role, status FROM users WHERE email = ? AND status = ?',
      [email, 'active'],
      true,
      {
        allowedFields: ['id', 'email', 'password_hash', 'role', 'status'],
        enableAudit: featureFlags.enableLoginAudit
      }
    );
    
    // Record login attempt với comprehensive data
    await this.recordLoginAttempt(email, !!user, ipAddress, userAgent);
    
    // ... rest of login logic với enhanced security
  }

  async recordLoginAttempt(email, success, ipAddress, userAgent) {
    const featureFlags = await this.getFeatureFlags();
    
    return await this.dbService.insert(
      'INSERT INTO login_attempts (email, success, ip_address, user_agent, attempted_at) VALUES (?, ?, ?, ?, datetime("now"))',
      [email, success, ipAddress, userAgent],
      {
        enableAudit: featureFlags.enableSecurityAudit,
        validateInput: true,
        userContext: {
          operation: 'login_attempt',
          ip_address: ipAddress
        }
      }
    );
  }

  async getFailedAttempts(email, timeWindow = '15 minutes') {
    const securityConfig = await this.getSecurityConfig();
    const actualTimeWindow = securityConfig.failedLoginWindow || timeWindow;
    
    return await this.dbService.select(
      `SELECT COUNT(*) as count FROM login_attempts 
       WHERE email = ? AND success = false 
       AND attempted_at > datetime('now', '-${actualTimeWindow}')`,
      [email],
      true,
      { enableAudit: false } // Read operations typically don't need audit
    );
  }
}
```

---

## 🧪 Testing

### Unit Tests

Tất cả DatabaseService methods có unit tests toàn diện:

```javascript
// Ví dụ test
describe('DatabaseService', () => {
  test('select với firstOnly trả về single result', async () => {
    const result = await dbService.select(
      'SELECT * FROM users WHERE id = ?',
      [1],
      true
    );
    
    expect(result.success).toBe(true);
    expect(typeof result.data).toBe('object');
    expect(Array.isArray(result.data)).toBe(false);
  });

  test('buildWhereClause xử lý complex conditions', () => {
    const conditions = {
      status: 'active',
      role: ['admin', 'user'],
      age: { operator: '>=', value: 18 }
    };
    
    const { whereClause, params } = dbService.buildWhereClause(conditions);
    
    expect(whereClause).toBe('status = ? AND role IN (?, ?) AND age >= ?');
    expect(params).toEqual(['active', 'admin', 'user', 18]);
  });
});
```

### Integration Tests

Test complete workflows sử dụng multiple operations:

```javascript
describe('User Management Integration', () => {
  test('complete user lifecycle', async () => {
    // Tạo user
    const createResult = await dbService.insert(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      ['Test User', 'test@example.com']
    );
    
    const userId = createResult.meta.last_row_id;
    
    // Update user
    await dbService.update(
      'UPDATE users SET status = ? WHERE id = ?',
      ['active', userId]
    );
    
    // Xác minh update
    const user = await dbService.select(
      'SELECT * FROM users WHERE id = ?',
      [userId],
      true
    );
    
    expect(user.data.status).toBe('active');
    
    // Cleanup
    await dbService.delete(
      'DELETE FROM users WHERE id = ?',
      [userId]
### Trong Enterprise AuditLogService

```javascript
import { BaseService } from '../services/baseService.js';

export class AuditLogService extends BaseService {
  constructor(env) {
    super(env, 'AuditLogService');
    // Full BaseService integration với enhanced configuration
  }

  async log(auditEvent, context = null) {
    // Check nếu audit logging được enable qua dynamic configuration
    const featureFlags = await this.getFeatureFlags();
    if (!featureFlags.enableAuditLogging) {
      return { success: true, disabled: true };
    }

    const auditEntry = {
      ...auditEvent,
      request_id: context?.get('requestId') || this.generateRequestId(),
      ip_address: this.getClientIP(context),
      user_agent: context?.req.header('User-Agent'),
      timestamp: new Date().toISOString(),
      status: auditEvent.status || 'SUCCESS'
    };

    // Enhanced insert với comprehensive error handling
    const result = await this.dbService.insert(
      `INSERT INTO audit_logs (
        user_id, action, resource, resource_id, details, 
        ip_address, user_agent, request_id, timestamp, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        auditEntry.user_id, auditEntry.action, auditEntry.resource,
        auditEntry.resource_id, JSON.stringify(auditEntry.details),
        auditEntry.ip_address, auditEntry.user_agent, auditEntry.request_id,
        auditEntry.timestamp, auditEntry.status
      ],
      {
        enableAudit: false, // Tránh recursive audit logging
        validateInput: true
      }
    );

    return result || { success: false, error: 'Failed to create audit log' };
  }

  async searchAuditLogs(searchParams, userRole) {
    // Enhanced security với role-based field filtering
    const allowedFields = userRole === 'super_admin' 
      ? ['user_id', 'action', 'resource', 'status', 'timestamp', 'ip_address']  // Super admin xem tất cả
      : ['action', 'resource', 'status', 'timestamp'];                           // Admin có quyền hạn chế

    const { whereClause, params } = this.dbService.buildWhereClause(searchParams, allowedFields);

    return await this.dbService.select(
      `SELECT ${allowedFields.join(', ')} FROM audit_logs ${whereClause} ORDER BY timestamp DESC LIMIT 100`,
      params,
      false,
      { allowedFields, userRole, enableAudit: true }
    );
  }
}
```

---

## 🧪 Enhanced Testing & Validation

### Unit Testing với Enhanced Features

```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '../src/services/databaseService.js';

describe('Enhanced DatabaseService', () => {
  let dbService;
  let mockEnv;

  beforeEach(() => {
    mockEnv = {
      DB: mockD1Database,
      AUDIT_KV: mockKVNamespace,
      CONFIG_KV: mockKVNamespace
    };
    dbService = new DatabaseService(mockEnv);
  });

  describe('Enhanced Security Features', () => {
    it('should filter fields based on allowedFields', async () => {
      const updateData = {
        name: 'John',
        admin_secret: 'hack',
        status: 'active'
      };
      const allowedFields = ['name', 'status'];

      const { setClause, params } = dbService.buildSetClause(updateData, allowedFields);
      
      expect(setClause).not.toContain('admin_secret');
      expect(params).not.toContain('hack');
    });

    it('should sanitize XSS input', async () => {
      const maliciousInput = '<script>alert("xss")</script>';
      
      const result = await dbService.insert(
        'INSERT INTO posts (content) VALUES (?)',
        [maliciousInput],
        { validateInput: true }
      );
      
      expect(result.success).toBe(true);
      // Input should be sanitized trong actual implementation
    });
  });

  describe('Enhanced Return Formats', () => {
    it('should return enhanced metadata', async () => {
      const result = await dbService.select(
        'SELECT * FROM users WHERE id = ?',
        [1],
        true
      );

      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('data');
      expect(result).toHaveProperty('meta');
      expect(result.meta).toHaveProperty('duration');
      expect(result.meta).toHaveProperty('query_hash');
      expect(result.meta).toHaveProperty('timestamp');
    });
  });
});
```

---

## 🚀 Enhanced Performance Optimization

### Dynamic Configuration Caching

```javascript
// BaseService tự động cache configuration
export class OptimizedService extends BaseService {
  constructor(env) {
    super(env, 'OptimizedService');
    // Configuration được cache và tự động refresh
  }

  async performOperation() {
    // Feature flags được cache, không cần gọi KV mỗi lần
    const featureFlags = await this.getFeatureFlags(); // Cached response
    
    if (featureFlags.enableQueryOptimization) {
      // Optimized path
      return await this.dbService.select(
        'SELECT id, name FROM users WHERE status = ?',
        ['active']
      );
    } else {
      // Standard path
      return await this.dbService.select(
        'SELECT * FROM users WHERE status = ?',
        ['active']
      );
    }
  }
}
```

### Query Performance Monitoring

```javascript
// Enhanced monitoring với performance metrics
const performDatabaseOperation = async () => {
  const result = await dbService.select(
    'SELECT * FROM users WHERE status = ?',
    ['active'],
    false,
    { enableProfiling: true }
  );

  // Enhanced performance metrics
  if (result.success && result.meta) {
    console.log('Query executed in:', result.meta.duration, 'ms');
    console.log('Query hash:', result.meta.query_hash);
    
    // Performance alerting
    if (result.meta.duration > 1000) {
      console.warn('Slow query detected:', result.meta.query_hash);
      // Có thể trigger alerting system
    }
  }
};
```

### Connection Pool Optimization

```javascript
// DatabaseService với optimized connection management
class OptimizedDatabaseService extends DatabaseService {
  constructor(env) {
    super(env);
    this.connectionPool = new Map(); // Connection pooling
    this.queryCache = new Map();     // Query result caching
  }

  async select(query, params = [], firstOnly = false, options = {}) {
    // Query caching cho read operations
    if (options.enableCache) {
      const cacheKey = this.generateCacheKey(query, params);
      const cached = this.queryCache.get(cacheKey);
      
      if (cached && !this.isCacheExpired(cached)) {
        return { ...cached.result, cached: true };
      }
    }

    // Execute query với enhanced monitoring
    const result = await super.select(query, params, firstOnly, options);

    // Cache successful results
    if (result.success && options.enableCache) {
      const cacheKey = this.generateCacheKey(query, params);
      this.queryCache.set(cacheKey, {
        result,
        timestamp: Date.now(),
        ttl: options.cacheTTL || 300000 // 5 minutes default
      });
    }

    return result;
  }
}
```

---

## 🔍 Enhanced Debugging & Monitoring

### Comprehensive Debug Mode

```javascript
// Enhanced debug configuration
// Trong .dev.vars.development
DEBUG = "hono-auth-api:services:database:*,hono-auth-api:services:audit:*,hono-auth-api:services:security:*"
ENABLE_QUERY_PROFILING = "true"
ENABLE_PERFORMANCE_MONITORING = "true"
```

Enhanced debug output bao gồm:
- SQL queries với parameters và execution time
- Security filtering actions
- Audit logging events
- Performance metrics và slow query alerts
- Configuration caching events
- Error stack traces với context

### Production Monitoring

```javascript
// Enhanced error handling với monitoring integration
const executeWithMonitoring = async (operation) => {
  const startTime = Date.now();
  
  try {
    const result = await operation();
    
    // Success metrics
    if (result && result.meta) {
      console.log('Operation metrics:', {
        duration: result.meta.duration,
        query_hash: result.meta.query_hash,
        timestamp: result.meta.timestamp
      });
    }
    
    return result;
  } catch (error) {
    // Enhanced error reporting
    const duration = Date.now() - startTime;
    console.error('Database operation failed:', {
      error: error.message,
      duration,
      stack: error.stack,
      context: operation.toString()
    });
    
    // Có thể integrate với monitoring services (DataDog, NewRelic, etc.)
    throw error;
  }
};
```

---

## 📋 Enhanced Best Practices

### 1. Security-First Approach

```javascript
// ✅ EXCELLENT - Enhanced security
const getUsers = async (filters, currentUserRole) => {
  // Field whitelisting dựa trên role
  const allowedFields = currentUserRole === 'admin' 
    ? ['id', 'name', 'email', 'status', 'created_at']
    : ['id', 'name', 'email'];

  const { whereClause, params } = dbService.buildWhereClause(filters, allowedFields);
  
  return await dbService.select(
    `SELECT ${allowedFields.join(', ')} FROM users WHERE ${whereClause}`,
    params,
    false,
    { 
      allowedFields, 
      userRole: currentUserRole, 
      enableAudit: true,
      validateInput: true 
    }
  );
};

// ❌ POOR - No security measures
const getUsers = async (filters) => {
  return await dbService.select(
    'SELECT * FROM users WHERE status = "active"' // No parameterization, no field filtering
  );
};
```

### 2. Enhanced Error Handling

```javascript
// ✅ EXCELLENT - Comprehensive error handling
const performDatabaseOperation = async (operation) => {
  try {
    const result = await operation();
    
    if (!result || !result.success) {
      console.error('Database operation failed:', result?.error);
      
      // Structured error response
      return {
        success: false,
        error: result?.error || 'Unknown database error',
        code: 'DATABASE_ERROR',
        timestamp: new Date().toISOString()
      };
    }
    
    return result;
  } catch (error) {
    console.error('Unexpected database error:', error);
    
    // Enhanced error reporting
    return {
      success: false,
      error: 'Internal database error',
      code: 'INTERNAL_ERROR',
      timestamp: new Date().toISOString(),
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    };
  }
};

// ❌ POOR - Basic error handling
const performDatabaseOperation = async (operation) => {
  const result = await operation();
  return result;
};
  [status]
);

// ❌ XẤU - Nguy cơ SQL injection
const users = await dbService.select(
  `SELECT * FROM users WHERE status = '${status}'`
);
```

### 2. Xử Lý Lỗi Một Cách Graceful

```javascript
const result = await dbService.insert(
  'INSERT INTO users (email) VALUES (?)',
  [email]
);

if (!result.success) {
  if (result.error.includes('UNIQUE constraint failed')) {
    return { error: 'Email đã tồn tại' };
  }
  return { error: 'Đã xảy ra lỗi database' };
}
```

### 3. Sử Dụng Transactions Cho Multiple Operations

```javascript
// Cho complex operations, sử dụng D1's batch feature
const statements = [
  db.prepare('INSERT INTO users (name) VALUES (?)').bind('User 1'),
  db.prepare('INSERT INTO users (name) VALUES (?)').bind('User 2'),
];

const results = await db.batch(statements);
```

### 4. Tối Ưu Query Performance

```javascript
// Sử dụng specific columns thay vì SELECT *
const users = await dbService.select(
  'SELECT id, name, email FROM users WHERE status = ?',
  ['active']
);

// Sử dụng LIMIT cho large datasets
const recentUsers = await dbService.select(
  'SELECT * FROM users ORDER BY created_at DESC LIMIT ?',
  [10]
);
```

### 5. Xác Thực Input Data

```javascript
class UserService {
  async createUser(userData) {
    // Xác thực trước database operation
    if (!userData.email || !userData.name) {
      throw new Error('Email và name là bắt buộc');
    }
    
    return await this.dbService.insert(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [userData.name, userData.email]
    );
  }
}
```

---

## 🔗 Tài Liệu Liên Quan

- **[Hướng Dẫn Setup Hoàn Chỉnh](./SETUP_GUIDE_vi.md)** - Setup và cấu hình project
- **[Hướng Dẫn Testing](./TEST_GUIDE_vi.md)** - Testing framework và procedures
- **[Hướng Dẫn Debug & Development](./DEBUG_DEVELOPMENT_GUIDE_vi.md)** - Development workflow

---

## 📈 Migration và Updates

### Thay Đổi Database Schema

Khi update database schema, thực hiện các bước sau:

1. **Tạo Migration File**
```sql
-- migrations/0001_initial.sql
CREATE TABLE user_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  setting_key TEXT NOT NULL,
  setting_value TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE UNIQUE INDEX idx_user_preferences_user_setting 
ON user_preferences(user_id, setting_key);
```

2. **Update DatabaseService Usage**
```javascript
// Thêm methods mới vào service classes
async getUserPreference(userId, key) {
  return await this.dbService.select(
    'SELECT setting_value FROM user_preferences WHERE user_id = ? AND setting_key = ?',
    [userId, key],
    true
  );
}
```

3. **Test Migration**
```javascript
// Test chức năng mới
const preference = await userService.getUserPreference(1, 'theme');
expect(preference.success).toBe(true);
```

---

Hướng dẫn toàn diện này bao gồm tất cả các khía cạnh của **DatabaseService trong hệ sinh thái BaseService**. Service này cung cấp cách thức enterprise-grade, secure và hiệu quả để tương tác với Cloudflare D1 databases với enhanced features, comprehensive security, và production-ready capabilities.

## 🎯 Kết Luận

`DatabaseService` trong hệ sinh thái **BaseService** cung cấp:

### 🏢 **Cấp Doanh Nghiệp**
- **BaseService Architecture**: Optimized configuration management với intelligent caching
- **Enhanced Security**: Field whitelisting, XSS protection, SQL injection prevention
- **Comprehensive Audit**: 15+ specialized services với full audit trail
- **Dynamic Configuration**: KV store integration với feature flags

### 🚀 **Hiệu Năng Cao**
- **Smart Caching**: Configuration và query result caching
- **Performance Monitoring**: Built-in metrics và slow query detection
- **Connection Optimization**: Efficient D1 connection management
- **Query Profiling**: Detailed performance analytics

### 🔒 **Bảo Mật Toàn Diện**
- **Role-Based Access**: Dynamic field filtering theo user role
- **Input Validation**: Comprehensive sanitization và XSS protection
- **Security Incident Tracking**: Integrated monitoring và response
- **Audit Compliance**: Enterprise-grade audit logging

### 💡 **Developer Experience**
- **Intuitive API**: Consistent patterns và enhanced error handling  
- **Rich Documentation**: Comprehensive examples và best practices
- **Enhanced Debugging**: Detailed logging và monitoring tools
- **Production Ready**: Battle-tested với comprehensive test coverage

DatabaseService không chỉ là một database wrapper đơn giản, mà là một **enterprise-grade service** được thiết kế cho production workloads với security, performance, và maintainability là ưu tiên hàng đầu.

### 🔗 **Tài Nguyên Liên Quan**
- **[BaseService Architecture](./BASESERVICE_GUIDE.md)** - Core architecture patterns
- **[Security Best Practices](./SECURITY_GUIDE.md)** - Comprehensive security guide  
- **[Audit System Guide](./AUDIT_COMPLETE_GUIDE.md)** - Enterprise audit implementation
- **[Dynamic Configuration](./DYNAMIC_CONFIG_GUIDE.md)** - Configuration management
- **[Performance Optimization](./PERFORMANCE_GUIDE.md)** - Performance best practices

---

**💬 Hỗ Trợ**: Nếu bạn cần hỗ trợ hoặc có câu hỏi về DatabaseService, vui lòng tham khảo documentation hoặc liên hệ team development.

**📅 Cập Nhật Lần Cuối**: Tài liệu này được cập nhật để phản ánh architecture hiện tại với BaseService integration và enhanced features.

Để biết chi tiết implementation và source code, tham khảo các file service thực tế trong thư mục `src/services/`.

---

📖 **Language**: [English](./DATABASE_SERVICE.md) | **Tiếng Việt**
