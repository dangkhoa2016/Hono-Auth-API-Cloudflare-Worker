# DatabaseService - Complete Documentation & Quick Reference

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](DATABASE_SERVICE.vi.md)

## 📋 Overview

`DatabaseService` is a core service for handling all database operations in the Hono Auth Worker application. This service provides a unified, secure interface for interacting with Cloudflare's D1 database, with integrated dynamic configuration management, enhanced security features, and comprehensive audit logging support.

**Status**: ✅ **PRODUCTION READY** - Battle-tested with extensive audit system integration

**Current Architecture**: Part of the enhanced BaseService ecosystem with 15+ specialized services

---

## 🚀 Quick Start Guide

### Basic Usage

```javascript
import { DatabaseService } from '../src/services/databaseService.js';
import { BaseService } from '../src/services/baseService.js';

// Modern approach - Use BaseService inheritance (recommended)
class MyService extends BaseService {
  constructor(env) {
    super(env, 'MyService');
  }
  
  async findUser(email) {
    // DatabaseService is available as this.dbService
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

// Direct usage (for specific cases)
class LegacyService {
  constructor(env) {
    this.dbService = new DatabaseService(env); // Takes full env, not just DB
  }
}
```

### 📋 Current Status

✅ **Production Ready** - Deployed in live environments with 15+ service integrations  
✅ **BaseService Architecture** - Modern inheritance-based service architecture  
✅ **Dynamic Configuration** - KV-based configuration with intelligent caching  
✅ **Enhanced Security** - Field whitelisting, SQL injection protection, XSS prevention  
✅ **Comprehensive Audit System** - Full audit trail integration with 8 specialized audit services  
✅ **Performance Optimized** - Database metrics, query optimization, connection pooling  

### 🔗 Key Features Overview

- **Enhanced CRUD Operations**: `select()`, `insert()`, `update()`, `delete()`, `upsert()` with field validation
- **Dynamic Query Builders**: `buildWhereClause()`, `buildSetClause()` with security whitelisting  
- **Advanced Utilities**: `healthCheck()`, `getDatabaseMetrics()`, `execute()` with performance monitoring
- **Dynamic Configuration**: Feature flag-based SQL query logging and performance controls
- **Enhanced Security**: Automatic prepared statements, field whitelisting, SQL injection prevention
- **Comprehensive Logging**: Debug system with configurable SQL query logging
- **BaseService Integration**: Optimized config management with intelligent caching
- **Audit Trail Support**: Seamless integration with enterprise audit logging system

### 📖 Available Resources

- **[DatabaseService](../src/services/databaseService.js)** - Core database operations service
- **[BaseService](../src/services/baseService.js)** - Foundation service with optimized configuration management
- **[UserService](../src/services/userService.js)** - User management service extending BaseService
- **[AuthService](../src/services/authService.js)** - Authentication service with dynamic configuration
- **[AuditLogService](../src/services/auditLogService.js)** - Comprehensive audit logging service
- **[KvConfigService](../src/services/kvConfigService.js)** - Dynamic configuration service
- **[AuditRetentionService](../src/services/auditRetentionService.js)** - Audit data retention management
- **[SecurityIncidentResponseService](../src/services/securityIncidentResponseService.js)** - Security incident handling

---

## ⭐ Key Features

- ✅ **Enhanced Constructor**: Takes full `env` object for comprehensive configuration access
- ✅ **Dynamic Configuration**: Feature flag-based query logging and performance controls via KV store
- ✅ **Prepared Statements**: Automatically uses prepared statements with enhanced parameter binding
- ✅ **Advanced Logging**: Configurable SQL query logging with debug system integration
- ✅ **Enhanced Security**: Field whitelisting in helper methods, comprehensive input validation
- ✅ **Performance Monitoring**: Database metrics collection with response time tracking
- ✅ **BaseService Integration**: Optimized for use with BaseService inheritance pattern
- ✅ **Audit Trail Ready**: Seamless integration with enterprise audit logging system
- ✅ **Error Handling**: Comprehensive error handling with detailed logging
- ✅ **Return Consistency**: Enhanced return format with success flags and metadata
- ✅ **Query Optimization**: Built-in query performance tracking and optimization
- ✅ **Security Hardening**: SQL injection prevention, XSS protection, input sanitization

---

## 🚀 Quick Start

### 1. Import and Initialize

```javascript
import { DatabaseService } from '../src/services/databaseService.js';
import { BaseService } from '../src/services/baseService.js';

// RECOMMENDED: Use BaseService inheritance for modern services
class MyService extends BaseService {
  constructor(env) {
    super(env, 'MyService');
    // DatabaseService is automatically available as this.dbService
    // Dynamic configuration is automatically available via this.getFeatureFlags()
  }
}

// LEGACY: Direct instantiation (for specific use cases)
class DirectService {
  constructor(env) {
    this.dbService = new DatabaseService(env); // Pass full env object
  }
}

// SERVICE FACTORY: For utility functions
import { createDatabaseService } from '../src/utils/serviceFactory.js';
const dbService = createDatabaseService(env);
```

### 2. Basic Usage Examples

#### SELECT Operations

```javascript
// Enhanced SELECT with automatic query logging (when enabled via feature flags)
const user = await dbService.select(
  'SELECT * FROM users WHERE id = ?',
  [userId],
  true // firstOnly
);

// Multi-user query with enhanced logging
const users = await dbService.select(
  'SELECT * FROM users WHERE status = ? AND role = ?',
  ['active', 'admin']
);

// Using enhanced helper with field whitelisting for security
const allowedFields = ['status', 'role', 'created_at']; // Security: only allow safe fields
const { whereClause, params } = dbService.buildWhereClause({
  status: 'active',
  role: ['admin', 'user'],
  created_at: { operator: '>=', value: '2024-01-01' }
}, allowedFields);

const results = await dbService.select(
  `SELECT * FROM users ${whereClause}`, // Note: helper now includes WHERE keyword
  params
);
```

#### INSERT Operations

```javascript
// Simple insert
const result = await dbService.insert(
  'INSERT INTO users (name, email, role) VALUES (?, ?, ?)',
  ['John Doe', 'john@example.com', 'user']
);

// Get inserted ID
console.log('New user ID:', result.meta.last_row_id);

// Insert with RETURNING clause
const newUser = await dbService.insert(
  'INSERT INTO users (name, email, role) VALUES (?, ?, ?) RETURNING *',
  ['Jane Doe', 'jane@example.com', 'admin']
);
```

#### UPDATE Operations

```javascript
// Simple update with enhanced return format
const result = await dbService.update(
  'UPDATE users SET status = ? WHERE id = ?',
  ['inactive', userId]
);

// Enhanced result format includes success flag
if (result && result.success) {
  console.log('Rows affected:', result.changes);
  console.log('Meta data:', result.meta);
}

// Using enhanced helper with field whitelisting for security
const updateData = { status: 'active', last_login: new Date() };
const allowedFields = ['status', 'last_login']; // Security: whitelist allowed update fields
const { setClause, params } = dbService.buildSetClause(updateData, allowedFields);

await dbService.update(
  `UPDATE users SET ${setClause} WHERE id = ?`,
  [...params, userId]
);
```

#### DELETE Operations

```javascript
// Delete with enhanced return format
const result = await dbService.delete(
  'DELETE FROM users WHERE id = ?',
  [userId]
);

// Check success and get affected rows
if (result && result.success) {
  console.log('Deleted rows:', result.changes);
}

// Conditional delete with query logging (when enabled)
const deleteResult = await dbService.delete(
  'DELETE FROM users WHERE status = ? AND last_login < ?',
  ['inactive', '2023-01-01']
);
```

#### UPSERT Operations

```javascript
// Enhanced UPSERT with better D1 syntax and return handling
const result = await dbService.upsert(
  `INSERT INTO user_settings (user_id, setting_key, setting_value) 
   VALUES (?, ?, ?)
   ON CONFLICT(user_id, setting_key) 
   DO UPDATE SET 
     setting_value = excluded.setting_value,
     updated_at = datetime('now')`,
  [userId, 'theme', 'dark']
);

// Check success
if (result && result.success) {
  console.log('UPSERT completed successfully');
}
```

---

## 🏗️ Architecture

### Database Service Structure

```
DatabaseService (Enhanced)
├── Core Methods (with dynamic configuration)
│   ├── select()     - SELECT queries with logging control
│   ├── insert()     - INSERT operations with enhanced returns
│   ├── update()     - UPDATE operations with success tracking
│   ├── delete()     - DELETE operations with result validation
│   ├── upsert()     - INSERT/UPDATE operations with conflict handling
│   └── execute()    - Generic SQL execution with method selection
├── Enhanced Helper Methods (with security)
│   ├── buildWhereClause()  - Dynamic WHERE with field whitelisting
│   └── buildSetClause()    - Dynamic SET with field validation
├── Advanced Utilities
│   ├── healthCheck()       - Database health verification
│   └── getDatabaseMetrics() - Comprehensive performance metrics
└── Configuration Integration
    ├── Dynamic feature flags - Query logging, performance controls
    ├── BaseService compatibility - Optimized config caching
    └── Audit trail integration - Seamless audit log support
```

### Enhanced Return Format

All methods now return a more comprehensive format with success tracking:

```javascript
// SELECT operations return results directly or null
const user = await dbService.select('SELECT * FROM users WHERE id = ?', [1], true);
// Returns: User object or null

const users = await dbService.select('SELECT * FROM users WHERE status = ?', ['active']);
// Returns: Array of users or empty array

// INSERT/UPDATE/DELETE operations return enhanced result objects
const result = await dbService.insert('INSERT INTO users (name) VALUES (?)', ['John']);
// Returns: { success: true, insertId: 123, meta: { changes: 1, last_row_id: 123, ... } } or null

const updateResult = await dbService.update('UPDATE users SET status = ? WHERE id = ?', ['active', 1]);
// Returns: { success: true, changes: 1, meta: { changes: 1, ... } } or null

// Error cases return null with detailed logging
```

---

## 📚 Method Reference

### Core Operations

#### `select(query, params = [], firstOnly = false)`

Execute SELECT queries with dynamic logging configuration.

**Parameters:**
- `query` (string): SQL SELECT statement with placeholders
- `params` (array): Parameters for prepared statement
- `firstOnly` (boolean): Return only first result if true

**Returns:** Query results array, single object (if firstOnly), or null on error

**Enhanced Features:**
- Automatic query logging when enabled via feature flags
- Result count logging for performance monitoring
- Enhanced error handling with detailed logging

```javascript
// Get all active users with automatic logging
const users = await dbService.select(
  'SELECT * FROM users WHERE status = ?',
  ['active']
);

// Get single user by email with firstOnly optimization
const user = await dbService.select(
  'SELECT * FROM users WHERE email = ?',
  ['user@example.com'],
  true
);
```

#### `insert(query, params = [])`

Execute INSERT operations with enhanced return handling.

**Parameters:**
- `query` (string): SQL INSERT statement
- `params` (array): Parameters for prepared statement

**Returns:** `{ success: true, insertId: number, meta: object }` on success, `null` on failure

**Enhanced Features:**
- Enhanced return format with success flag
- Automatic insertId extraction from meta.last_row_id
- Comprehensive error logging with query details

```javascript
const result = await dbService.insert(
  'INSERT INTO users (name, email) VALUES (?, ?)',
  ['John Doe', 'john@example.com']
);

// Enhanced result handling
if (result && result.success) {
  const newUserId = result.insertId; // Direct access to inserted ID
  console.log('User created with ID:', newUserId);
} else {
  console.log('Insert failed - check logs for details');
}
```

#### `update(query, params = [])`

Execute UPDATE operations.

**Parameters:**
- `query` (string): SQL UPDATE statement
- `params` (array): Parameters for prepared statement

**Returns:** Update result with affected rows count

```javascript
const result = await dbService.update(
  'UPDATE users SET status = ? WHERE id = ?',
  ['active', userId]
);

console.log(`Updated ${result.meta.changes} rows`);
```

#### `delete(query, params = [])`

Execute DELETE operations.

**Parameters:**
- `query` (string): SQL DELETE statement
- `params` (array): Parameters for prepared statement

**Returns:** Delete result with affected rows count

```javascript
const result = await dbService.delete(
  'DELETE FROM users WHERE status = ?',
  ['inactive']
);

console.log(`Deleted ${result.meta.changes} rows`);
```

#### `upsert(query, params = [])`

Execute INSERT with ON CONFLICT (UPSERT) operations.

**Parameters:**
- `query` (string): SQL INSERT with ON CONFLICT statement
- `params` (array): Parameters for prepared statement

**Returns:** Upsert result with metadata

```javascript
await dbService.upsert(
  `INSERT INTO user_preferences (user_id, theme) 
   VALUES (?, ?)
   ON CONFLICT(user_id) 
   DO UPDATE SET theme = excluded.theme`,
  [userId, 'dark']
);
```

#### `execute(query, params = [])`

Execute any SQL statement (generic method).

**Parameters:**
- `query` (string): Any SQL statement
- `params` (array): Parameters for prepared statement

**Returns:** Execution result

```javascript
// Create table
await dbService.execute(
  'CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY, message TEXT)'
);

// Execute stored procedure or complex query
const result = await dbService.execute(
  'WITH user_stats AS (...) SELECT * FROM user_stats WHERE ...',
  [param1, param2]
);
```

### Helper Methods

#### `buildWhereClause(conditions, allowedFields = [])`

Build dynamic WHERE clauses with enhanced security through field whitelisting.

**Parameters:**
- `conditions` (object): Conditions object
- `allowedFields` (array): **NEW** - Array of allowed field names for security

**Enhanced Security Features:**
- Field whitelisting prevents unauthorized field access
- Empty allowedFields array allows all fields (backward compatibility)
- Enhanced logging of generated clauses and parameters

**Condition Formats:**
```javascript
{
  // Simple equality
  status: 'active',
  
  // Array (IN clause)
  role: ['admin', 'user'],
  
  // LIKE queries with % wildcards
  name: '%john%',
  
  // NULL checks
  deleted_at: null,        // IS NULL  
  created_at: ''          // Filtered out automatically
}
```

**Returns:** `{ whereClause, params }` - whereClause now includes "WHERE" keyword

```javascript
const conditions = {
  status: 'active',
  role: ['admin', 'user'],
  name: '%john%'
};

// Enhanced security with field whitelisting
const allowedFields = ['status', 'role', 'name']; // Only allow safe fields
const { whereClause, params } = dbService.buildWhereClause(conditions, allowedFields);
// whereClause: "WHERE status = ? AND role IN (?, ?) AND name LIKE ?"
// params: ['active', 'admin', 'user', '%john%']

const users = await dbService.select(
  `SELECT * FROM users ${whereClause}`, // No need for additional WHERE
  params
);
```

#### `buildSetClause(data, allowedFields = [])`

Build dynamic SET clauses for UPDATE operations with enhanced security.

**Parameters:**
- `data` (object): Data object with fields to update
- `allowedFields` (array): **NEW** - Array of allowed field names for security

**Enhanced Security Features:**
- Field whitelisting prevents unauthorized field updates
- Empty allowedFields array allows all fields (backward compatibility)
- Automatic filtering of undefined values
- Enhanced logging of generated clauses

**Returns:** `{ setClause, params }`

```javascript
const updateData = {
  name: 'John Updated',
  status: 'active',
  last_login: new Date(),
  unauthorized_field: 'hack attempt' // Will be filtered out
};

// Enhanced security with field whitelisting
const allowedFields = ['name', 'status', 'last_login']; // Only allow safe updates
const { setClause, params } = dbService.buildSetClause(updateData, allowedFields);
// setClause: "name = ?, status = ?, last_login = ?"
// params: ['John Updated', 'active', '2024-01-15T10:30:00.000Z']
// Note: unauthorized_field is automatically filtered out

await dbService.update(
  `UPDATE users SET ${setClause} WHERE id = ?`,
  [...params, userId]
);
```

### Utility Methods

#### `healthCheck()`

Check database connection and basic functionality.

**Returns:** Health check result

```javascript
const health = await dbService.healthCheck();

console.log('Database healthy:', health.success);
console.log('Response time:', health.meta.duration, 'ms');
```

#### `getDatabaseMetrics()`

**NEW** - Get comprehensive database performance metrics and statistics.

**Returns:** Comprehensive metrics object with performance data

**Features:**
- Query response time measurement
- Table statistics and index counts
- User activity metrics
- Security incident statistics
- Performance health assessment

```javascript
const metrics = await dbService.getDatabaseMetrics();

console.log('Database Metrics:', {
  queryResponseTime: metrics.performance.queryResponseTime,
  isResponsive: metrics.performance.isResponsive,
  totalTables: metrics.database.totalTables,
  activeUsers: metrics.users.active_users,
  recentActivity: metrics.users.recent_activity_1h,
  securityIncidents: metrics.security.recent_failures_1h
});
```

---

## 🛡️ Security Features

### Prepared Statements

All methods automatically use prepared statements to prevent SQL injection:

```javascript
// ✅ SAFE - Uses prepared statements
const user = await dbService.select(
  'SELECT * FROM users WHERE email = ?',
  [userEmail]
);

// ❌ DANGEROUS - Never do this (example only)
// const user = await dbService.select(
//   `SELECT * FROM users WHERE email = '${userEmail}'`
// );
```

### Input Validation

The service validates all inputs and handles edge cases:

```javascript
// Handles null/undefined parameters
const result = await dbService.select(
  'SELECT * FROM users WHERE status = ?',
  [null]  // Properly handles NULL values
);

// Validates SQL injection attempts
const maliciousInput = "'; DROP TABLE users; --";
const safe = await dbService.select(
  'SELECT * FROM users WHERE name = ?',
  [maliciousInput]  // Safe - treated as literal string
);
```

---

## 🎯 Integration Examples

### In Modern UserService (BaseService Architecture)

```javascript
import { BaseService } from '../services/baseService.js';
import { DEFAULT_USER_ROLE, DEFAULT_USER_STATUS } from '../constants/roles.js';

export class UserService extends BaseService {
  constructor(env) {
    super(env, 'UserService'); // DatabaseService available as this.dbService
  }

  async findUserByEmail(email) {
    return await this.dbService.select(
      'SELECT id, full_name, email, password, role, status FROM users WHERE email = ?',
      [email],
      true
    );
  }

  async createUser(userData) {
    const { full_name, email, password, role = DEFAULT_USER_ROLE, status = DEFAULT_USER_STATUS } = userData;
    
    const result = await this.dbService.insert(
      'INSERT INTO users (full_name, email, password, role, status) VALUES (?, ?, ?, ?, ?)',
      [full_name, email, password, role, status]
    );

    // Enhanced result handling
    if (result && result.success) {
      return await this.findById(result.insertId);
    }
    return null;
  }

  async updateUserStatus(userId, status) {
    return await this.dbService.update(
      'UPDATE users SET status = ?, updated_at = datetime("now") WHERE id = ?',
      [status, userId]
    );
  }
}
```

### In Enhanced AuthService with Dynamic Configuration

```javascript
import { BaseService } from '../services/baseService.js';

export class AuthService extends BaseService {
  constructor(env) {
    super(env, 'AuthService');
    // Automatic access to optimized configuration via BaseService
    // DatabaseService available as this.dbService
  }

  async login(email, password, ipAddress) {
    // Get dynamic configuration automatically (cached via BaseService)
    const featureFlags = await this.getFeatureFlags();
    const jwtConfig = await this.getJwtConfig();
    
    // Use configuration without additional parameter passing
    const isRateLimitDisabled = featureFlags.disableRateLimiting;
    const jwtSecret = jwtConfig.secret;
    
    // Enhanced database operations with automatic logging
    const user = await this.dbService.select(
      'SELECT * FROM users WHERE email = ? AND status = ?',
      [email, 'active'],
      true
    );
    
    // ... rest of login logic with enhanced error handling
  }

  async recordLoginAttempt(email, success, ipAddress) {
    const result = await this.dbService.insert(
      'INSERT INTO login_attempts (email, success, ip_address, attempted_at) VALUES (?, ?, ?, datetime("now"))',
      [email, success, ipAddress]
    );
    
    // Enhanced result checking
    if (!result || !result.success) {
      console.warn('Failed to record login attempt for:', email);
    }
    
    return result;
  }

  async getFailedAttempts(email, timeWindow = '15 minutes') {
    return await this.dbService.select(
      `SELECT COUNT(*) as count FROM login_attempts 
       WHERE email = ? AND success = false 
       AND attempted_at > datetime('now', '-${timeWindow}')`,
      [email],
      true
    );
  }
}
```

### In Enterprise AuditLogService (Advanced Integration)

```javascript
import { BaseService } from '../services/baseService.js';

export class AuditLogService extends BaseService {
  constructor(env) {
    super(env, 'AuditLogService');
    // Full BaseService integration with enhanced configuration
  }

  async log(auditEvent, context = null) {
    // Check if audit logging is enabled via dynamic configuration
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

    // Enhanced insert with comprehensive error handling
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
      ]
    );

    return result || { success: false, error: 'Failed to create audit log' };
  }

  async searchAuditLogs(searchParams, userRole) {
    // Enhanced security with role-based field filtering
    const allowedFields = userRole === 'super_admin' 
      ? ['user_id', 'action', 'resource', 'status', 'timestamp']  // Super admin can search all
      : ['action', 'resource', 'status', 'timestamp'];            // Admin has limited access

    const { whereClause, params } = this.dbService.buildWhereClause(searchParams, allowedFields);

    return await this.dbService.select(
      `SELECT * FROM audit_logs ${whereClause} ORDER BY timestamp DESC LIMIT 100`,
      params
    );
  }
}
```

---

## 🧪 Testing

### Unit Tests

All DatabaseService methods have comprehensive unit tests:

```javascript
// Example test
describe('DatabaseService', () => {
  test('select with firstOnly returns single result', async () => {
    const result = await dbService.select(
      'SELECT * FROM users WHERE id = ?',
      [1],
      true
    );
    
    expect(result.success).toBe(true);
    expect(typeof result.data).toBe('object');
    expect(Array.isArray(result.data)).toBe(false);
  });

  test('buildWhereClause handles complex conditions', () => {
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

Test complete workflows using multiple operations:

```javascript
describe('User Management Integration', () => {
  test('complete user lifecycle', async () => {
    // Create user
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
    
    // Verify update
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
    );
  });
});
```

---

## 🚀 Performance Optimization

### Query Optimization

- Use indexes on frequently queried columns
- Limit result sets with appropriate WHERE clauses
- Use `firstOnly` parameter when you only need one result

```javascript
// Optimized queries
const user = await dbService.select(
  'SELECT id, email, status FROM users WHERE email = ?',  // Select only needed columns
  [email],
  true  // Stop after first result
);

// Use appropriate indexes
await dbService.execute(
  'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)'
);
```

### Connection Management

DatabaseService efficiently manages D1 connections:

```javascript
// Reuse the same service instance
class UserController {
  constructor(db) {
    this.dbService = new DatabaseService(db);  // Create once
  }
  
  async handleMultipleRequests() {
    // All operations use the same service instance
    const users = await this.dbService.select('SELECT * FROM users');
    const count = await this.dbService.select('SELECT COUNT(*) as total FROM users', [], true);
    return { users: users.data, total: count.data.total };
  }
}
```

---

## 🔍 Debugging

### Debug Mode

Enable debug logging for database operations:

```javascript
// In .dev.vars.development
DEBUG = "hono-auth-api:services:database:*"
```

Debug output includes:
- SQL queries with parameters
- Execution time
- Result metadata
- Error details

### Error Handling

DatabaseService provides detailed error information:

```javascript
const result = await dbService.select(
  'SELECT * FROM non_existent_table'
);

if (!result.success) {
  console.error('Database error:', result.error);
  // Handle specific error types
  if (result.error.includes('no such table')) {
    // Handle missing table
  }
}
```

---

## 📋 Best Practices

### 1. Always Use Prepared Statements

```javascript
// ✅ GOOD
const users = await dbService.select(
  'SELECT * FROM users WHERE status = ?',
  [status]
);

// ❌ BAD - SQL injection risk
const users = await dbService.select(
  `SELECT * FROM users WHERE status = '${status}'`
);
```

### 2. Handle Errors Gracefully

```javascript
const result = await dbService.insert(
  'INSERT INTO users (email) VALUES (?)',
  [email]
);

if (!result.success) {
  if (result.error.includes('UNIQUE constraint failed')) {
    return { error: 'Email already exists' };
  }
  return { error: 'Database error occurred' };
}
```

### 3. Use Transactions for Multiple Operations

```javascript
// For complex operations, use D1's batch feature
const statements = [
  db.prepare('INSERT INTO users (name) VALUES (?)').bind('User 1'),
  db.prepare('INSERT INTO users (name) VALUES (?)').bind('User 2'),
];

const results = await db.batch(statements);
```

### 4. Optimize Query Performance

```javascript
// Use specific columns instead of SELECT *
const users = await dbService.select(
  'SELECT id, name, email FROM users WHERE status = ?',
  ['active']
);

// Use LIMIT for large datasets
const recentUsers = await dbService.select(
  'SELECT * FROM users ORDER BY created_at DESC LIMIT ?',
  [10]
);
```

### 5. Validate Input Data

```javascript
class UserService {
  async createUser(userData) {
    // Validate before database operation
    if (!userData.email || !userData.name) {
      throw new Error('Email and name are required');
    }
    
    return await this.dbService.insert(
      'INSERT INTO users (name, email) VALUES (?, ?)',
      [userData.name, userData.email]
    );
  }
}
```

---

## 🔗 Related Documentation

- **[Complete Setup Guide](./SETUP_GUIDE.md)** - Project setup and configuration
- **[Testing Guide](./TEST_GUIDE.md)** - Testing framework and procedures
- **[Debug & Development Guide](./DEBUG_DEVELOPMENT_GUIDE.md)** - Development workflow

---

## 📈 Migration and Updates

### Database Schema Changes

When updating database schema, follow these steps:

1. **Create Migration File**
```sql
-- migrations/001_add_user_preferences.sql
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
// Add new methods to service classes
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
// Test new functionality
const preference = await userService.getUserPreference(1, 'theme');
expect(preference.success).toBe(true);
```

---

This comprehensive guide covers all aspects of the DatabaseService. The service provides a robust, secure, and efficient way to interact with Cloudflare D1 databases while maintaining code consistency and reusability across the entire application.

For implementation details and source code, refer to the actual service files in the `src/services/` directory.
