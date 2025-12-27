# Complete Role Management System Guide

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](ROLE_COMPLETE_GUIDE.vi.md)

## Overview

The project's role and admin management system is designed to provide a comprehensive solution for user management and authorization with full internationalization support. The system includes:

1. **Role Management System**: Centralized, flexible role management system
2. **Admin API**: User management API with role-based permissions and i18n validation
3. **Permission System**: Permission system based on roles and hierarchy
4. **Security Features**: Strict security and access control with XSS protection
5. **I18n Integration**: Full multilingual support with 7 languages (en, vi, fr, es, de, ja, th)
6. **Advanced Validation**: Enhanced validation with intelligent caching and performance monitoring

## I. Role Management System

### 1. Centralized Constants System

**Main file:** `src/constants/roles.js`

Centralizes all definitions for roles, permissions, and user statuses:

```javascript
// Role definitions
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin', 
  SUPER_ADMIN: 'super_admin'
};

// User status definitions
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Role hierarchy
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3
};

// Special constants
export const SUPER_ADMIN_USER_ID = 1;
export const DEFAULT_USER_ROLE = ROLES.USER;
export const DEFAULT_USER_STATUS = USER_STATUSES.ACTIVE;
```

### 2. Permission System

Each role has a set of permissions defined in `ROLE_PERMISSIONS`:

```javascript
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: false,
    canViewAllUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canChangeRoles: false,
    canViewSuperAdminData: false,
    canAccessAdminRoutes: false,
  },
  [ROLES.ADMIN]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: true,
    canViewAllUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canChangeRoles: true,
    canViewSuperAdminData: false,
    canAccessAdminRoutes: true,
  },
  [ROLES.SUPER_ADMIN]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: true,
    canViewAllUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canChangeRoles: true,
    canViewSuperAdminData: true,
    canAccessAdminRoutes: true,
  }
};
```

### 3. Utility Functions

```javascript
getAllRoles()                           // ['user', 'admin', 'super_admin']
getAllUserStatuses()                    // ['active', 'inactive', 'suspended']
isValidRole(role)                       // boolean
getRoleLevel(role)                      // number (hierarchy level)
hasHigherOrEqualRole(role1, role2)      // boolean
hasPermission(role, permission)         // boolean
canManageUser(userRole, targetRole, userId, targetId) // {canManage, reason}
getRolesLowerOrEqual(role)              // array of manageable roles
```

## II. Admin API Documentation with I18n Integration

### Route Structure

All admin endpoints are under the `/api/admin` prefix with full i18n validation support:

```
GET /api/admin/users              → Get user list (role-filtered, i18n query validation)
GET /api/admin/users/:id          → Get user details (i18n error messages)
POST /api/admin/users             → Create new user (i18n validation & responses)
PUT /api/admin/users/:id          → Update user (i18n validation, no role changes)
DELETE /api/admin/users/:id       → Delete user (role-restricted, i18n messages)
PUT /api/admin/users/:id/role     → Change user role (i18n validation & hierarchy)
GET /api/admin/stats              → System statistics (i18n responses)
```

### Authentication & Authorization with I18n Support

All admin endpoints require:
1. **Authentication**: Valid JWT access token
2. **Authorization**: Appropriate role permissions  
3. **I18n Validation**: Automatic language detection and translated error messages
4. **XSS Protection**: Input sanitization and validation

### Enhanced Validation Features

The admin API now uses advanced i18n validators with:

```javascript
// Enhanced validation middleware
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';

// Examples of enhanced validators
admin.get('/users', i18nValidatorsMiddleware.userListQuery('query'), handler);
admin.post('/users', i18nValidatorsMiddleware.createUser(), handler);
admin.put('/users/:id', i18nValidatorsMiddleware.updateUserWithoutRole(), handler);
admin.put('/users/:id/role', i18nValidatorsMiddleware.roleChange(), handler);
```

**Key Features:**
- **Intelligent Caching**: Schema caching for sub-millisecond validation
- **Multilingual Errors**: Error messages in 7 languages
- **Performance Monitoring**: Built-in validation performance tracking
- **XSS Protection**: Advanced input sanitization

### Updated Role Permissions Matrix with I18n Features

| Endpoint | User | Admin | Super Admin | Notes |
|----------|------|-------|-------------|-------|
| `GET /api/admin/users` | ❌ | ✅ | ✅ | Admin: only admin/user roles, i18n query validation |
| `GET /api/admin/users/:id` | ❌ | ✅* | ✅ | Admin: own data or accessible users, i18n responses |
| `POST /api/admin/users` | ❌ | ✅** | ✅ | Admin: cannot create admin/super_admin, i18n validation |
| `PUT /api/admin/users/:id` | ❌ | ✅* | ✅ | Role parameter ignored/removed, XSS protection |
| `DELETE /api/admin/users/:id` | ❌ | ✅* | ✅ | Admin: only admin/user roles, i18n confirmations |
| `PUT /api/admin/users/:id/role` | ❌ | ✅*** | ✅ | Admin: role hierarchy restrictions, i18n validation |
| `GET /api/admin/stats` | ❌ | ✅ | ✅ | System statistics, i18n formatted responses |
| `GET /api/admin/dashboard` | ❌ | ✅ | ✅ | Admin dashboard, multilingual interface |
| `GET /api/admin/system-health` | ❌ | ✅ | ✅ | System health check, i18n status messages |

**Legend:**
- ✅ = Allowed
- ❌ = Not Allowed  
- `*` = Restricted access (see notes)
- `**` = Limited capabilities (see notes)
- `***` = Role hierarchy restrictions apply (see notes)

## III. Detailed API Endpoints

### 1. Get Users List

**Endpoint:** `GET /api/admin/users`  
**Permission:** Admin or Super Admin  
**Description:** Retrieve a paginated list of all users with filtering options

#### Query Parameters

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `page` | integer | 1 | Page number (must be > 0) |
| `limit` | integer | 10 | Items per page (max 100) |
| `role` | string | - | Filter by role: user, admin, super_admin |
| `status` | string | - | Filter by status: active, inactive, suspended |
| `search` | string | - | Search in full_name and email |

#### Role-Based Filtering (Critical Feature)

**Admin Role Behavior:**
- Can only view users with roles: `admin`, `user`
- If requesting `?role=super_admin`, returns empty results
- If no role filter, automatically filters to show only `admin` and `user` roles

**Super Admin User Role Behavior:**
- Can view all users regardless of role
- No filtering restrictions
- Full system visibility

#### Response (with I18n Support)

The response format includes multilingual messages based on the user's language preference:

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "status": "active",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  },
  "message": "Users list retrieved successfully", // English
  "message_vi": "Danh sách người dùng được lấy thành công", // Vietnamese
  "message_fr": "Liste des utilisateurs récupérée avec succès", // French
  "validation_time": "2.1ms",
  "cache_hit": true
}
```

**I18n Error Response Example:**
```json
{
  "success": false,
  "error": "Validation failed",
  "errors": [
    {
      "field": "role",
      "message": "Role must be one of: user, admin, super_admin", // English
      "message_vi": "Vai trò phải là một trong: user, admin, super_admin", // Vietnamese
      "code": "invalid_enum_value"
    }
  ],
  "validation_time": "1.8ms"
}
```

### 2. Create User (with I18n Validation)

**Endpoint:** `POST /api/admin/users`  
**Permission:** Admin or Super Admin  
**Description:** Create a new user account with full i18n validation and XSS protection

#### Enhanced Request Validation

The endpoint now uses `i18nValidatorsMiddleware.createUser()` for:
- **XSS Protection**: Automatic input sanitization
- **Multilingual Validation**: Error messages in user's preferred language
- **Performance Monitoring**: Request validation timing
- **Intelligent Caching**: Schema caching for faster subsequent validations

#### Permission Rules (Critical Security)

**Admin Restrictions:**
- ❌ Cannot create users with `super_admin` role (403 Forbidden)
- ❌ Cannot create users with `admin` role (403 Forbidden)  
- ✅ Can only create users with `user` role

**Super Admin Capabilities:**
- ✅ Can create users with any role (`user`, `admin`, `super_admin`)
- ✅ No restrictions on role assignment

#### Request Body

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user",
  "status": "active"
}
```

#### Validation Rules

- `full_name`: Required, 1-100 characters
- `email`: Required, valid email format, max 255 characters, must be unique
- `password`: Required, 6-100 characters
- `role`: Optional, enum: user (default), admin, super_admin
- `status`: Optional, enum: active (default), inactive, suspended

### 3. Update User (Security Enhanced)

**Endpoint:** `PUT /api/admin/users/:id`  
**Permission:** Admin (restricted) or Super Admin  
**Description:** Update user information (excluding role changes)

🚨 **Role Parameter Removed**: This endpoint no longer accepts `role` parameter. Role changes must use the dedicated endpoint `/api/admin/users/:id/role`.

#### Available Fields

| Field | Type | Description | Admin | Super Admin |
|-------|------|-------------|-------|-------------|
| `full_name` | string | User's full name (1-100 chars) | ✅ | ✅ |
| `email` | string | Email address (must be unique) | ✅ | ✅ |
| `status` | enum | active, inactive, suspended | ✅ | ✅ |
| ~~`role`~~ | ~~enum~~ | ~~Removed from this endpoint~~ | ❌ | ❌ |

#### Security Features

- **Role Parameter Ignored**: If `role` is included in request, it will be automatically removed
- **No Privilege Escalation**: Cannot change user roles through this endpoint
- **Safe Updates**: Only profile data can be modified

### 4. Change User Role

**Endpoint:** `PUT /api/admin/users/:id/role`  
**Permission:** Admin (with restrictions) or Super Admin  
**Description:** Change a user's role (separated from regular updates for security)

#### Security Features

- **Role Hierarchy Enforcement**: Users can only promote to roles ≤ their own level
- **Dedicated Endpoint**: Role changes isolated from regular updates  
- **Self-Protection**: Cannot change own role
- **Target User Protection**: Cannot modify users with higher roles

#### Permission Rules

**Admin Capabilities:**
- ✅ Can change user roles to: `user`, `admin`
- ❌ Cannot create or promote to `super_admin` role
- ❌ Cannot modify `super_admin` users
- ❌ Cannot change own role

**Super Admin Capabilities:**
- ✅ Can change any role to any role (`user`, `admin`, `super_admin`)
- ✅ Can modify any user (including other super_admins)
- ❌ Cannot change own role

#### Role Hierarchy Validation

The system enforces role hierarchy during role changes:

```javascript
// Admin (level 2) can manage:
- user (level 1) ✅
- admin (level 2) ✅ 
- super_admin (level 3) ❌

// Super Admin (level 3) can manage:
- user (level 1) ✅
- admin (level 2) ✅
- super_admin (level 3) ✅
```

#### Request Body

```json
{
  "role": "admin"
}
```

### 5. Delete User

**Endpoint:** `DELETE /api/admin/users/:id`  
**Permission:** Admin (limited) or Super Admin (full access)  
**Description:** Permanently delete a user account

#### Permission Rules

- **Admin User**: Can delete users with roles `user` or `admin`, but NOT `super_admin`
- **Super Admin User**: Can delete any user except themselves
- **Restrictions**: 
  - Cannot delete super_admin users (Admin restriction)
  - Cannot delete own account
  - Cannot delete user with ID 1 (super_admin protection)

### 6. Get System Statistics

**Endpoint:** `GET /api/admin/stats`  
**Permission:** Admin or Super Admin  
**Description:** Get system statistics and metrics

#### Response

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 120,
    "inactiveUsers": 20,
    "suspendedUsers": 10,
    "usersByRole": {
      "user": 140,
      "admin": 8,
      "super_admin": 2
    },
    "recentRegistrations": 15
  },
  "message": "System statistics retrieved successfully"
}
```

### 7. Get Admin Dashboard

**Endpoint:** `GET /api/admin/dashboard`  
**Permission:** Admin or Super Admin  
**Description:** Get comprehensive dashboard data with role-based filtering

#### Permission Rules

- **Admin User**: Gets limited dashboard data (excludes super_admin information)
- **Super Admin User**: Gets full dashboard data including all roles

#### Response

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 120,
    "inactiveUsers": 20,
    "suspendedUsers": 10,
    "usersByRole": {
      "user": 140,
      "admin": 8,
      "super_admin": 2
    },
    "recentRegistrations": 15,
    "systemHealth": "healthy",
    "lastBackup": "2024-01-15T10:30:00.000Z"
  },
  "message": "Admin dashboard retrieved successfully"
}
```

### 8. Get System Health Check

**Endpoint:** `GET /api/admin/system-health`  
**Permission:** Admin or Super Admin  
**Description:** Comprehensive system health check with performance and security metrics

#### Features

- **Database Health**: Connection status and performance metrics
- **Performance Monitoring**: Response times and system performance
- **Security Assessment**: Failed login attempts and risk analysis
- **Role-based Data**: Super Admins see full data, admins see filtered data

#### Response

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "responseTime": "150ms",
    "environment": "development",
    "database": {
      "isConnected": true,
      "info": {
        "version": "3.42.0",
        "pragma": "foreign_keys=ON"
      },
      "metrics": {
        "performance": {
          "queryResponseTime": "5ms",
          "isResponsive": true,
          "testQuerySuccess": true
        },
        "security": {
          "recentFailures1h": 2,
          "totalFailedAttempts": 15,
          "uniqueIpsWithFailures": 3
        }
      }
    },
    "system": {
      "statistics": {
        "totalUsers": 150,
        "activeUsers": 120,
        "usersByRole": {
          "user": 140,
          "admin": 8,
          "super_admin": 2
        }
      },
      "performance": {
        "responseTime": "150ms",
        "databaseResponseTime": "5ms",
        "isPerformant": true,
        "performanceGrade": "excellent"
      },
      "security": {
        "recentFailedLogins": 2,
        "totalFailedAttempts": 15,
        "uniqueIpsWithFailures": 3,
        "riskLevel": "low"
      }
    },
    "healthChecks": {
      "database": "pass",
      "performance": "pass",
      "security": "pass"
    },
    "metadata": {
      "checkedBy": {
        "userId": 123,
        "role": "admin"
      },
      "accessLevel": "limited",
      "canViewSuperAdminData": false
    }
  },
  "message": "System health retrieved successfully"
}
```

## IV. Implementation Architecture

### File Structure

```
src/
├── constants/
│   └── roles.js          # 🆕 Centralized role management
├── middleware/
│   └── authorization.js  # ✅ Updated to use role constants
├── services/
│   └── userService.js    # ✅ Updated to use role constants
├── schemas/
│   └── user.js          # ✅ Updated to use dynamic role validation
└── routes/
    └── admin.js         # ✅ Updated to use role constants
```

### Updated Files

#### 1. Authorization Middleware (`src/middleware/authorization.js`)

- ✅ Removed hard-coded `'admin'`, `'super_admin'`, `'user'`
- ✅ Use `ROLES` constants and permission checking
- ✅ Use `hasPermission()` instead of direct string comparison
- ✅ Use `SUPER_ADMIN_USER_ID` constant
- ✅ **NEW**: I18n error messages integration
- ✅ **NEW**: Enhanced XSS protection for user input

#### 2. User Schemas (`src/schemas/user.js`)

- ✅ Use `getAllRoles()` in Zod validation
- ✅ Use `getAllUserStatuses()` for status validation
- ✅ Dynamic role validation with automatic error messages
- ✅ **NEW**: I18n validation with multilingual error messages
- ✅ **NEW**: Advanced XSS protection via base utilities
- ✅ **NEW**: Performance monitoring and caching

#### 3. Admin Routes (`src/routes/admin.js`)

- ✅ Removed hard-coded roles in role change schema
- ✅ Use `hasHigherOrEqualRole()` for permission checking
- ✅ Use `getRolesLowerOrEqual()` for role filtering
- ✅ Permission-based dashboard access
- ✅ **NEW**: Full i18n validator integration (`i18nValidatorsMiddleware`)
- ✅ **NEW**: Removed basic Zod validators in favor of i18n validators
- ✅ **NEW**: Enhanced request validation with caching
- ✅ **NEW**: Multilingual response messages

#### 4. User Service (`src/services/userService.js`)

- ✅ Use `DEFAULT_USER_ROLE` and `DEFAULT_USER_STATUS`
- ✅ Use `canManageUser()` for permission checking
- ✅ Use `ROLES` constants in database queries
- ✅ Dynamic role filtering in dashboard data
- ✅ **NEW**: I18n integration for service responses
- ✅ **NEW**: Enhanced error handling with multilingual messages

## V. Enhanced Usage Examples with I18n Integration

### 1. Import Role Constants and I18n Utilities

```javascript
import { 
  ROLES, 
  hasPermission, 
  canManageUser,
  getAllRoles 
} from '../constants/roles.js';
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';
import { t, tError, tSuccess } from '../i18n/index.js';
```

### 2. Enhanced Permission-Based Checking with I18n

```javascript
// Before (hard coded)
if (user.role === 'admin' || user.role === 'super_admin') {
  // ...
}

// After (permission-based)
if (hasPermission(user.role, 'canAccessAdminRoutes')) {
  // ...
}
```

### 3. Creating Dynamic Zod Schemas with I18n Support

```javascript
// Before (hard coded, English only)
role: z.enum(['user', 'admin', 'super_admin'])

// After (dynamic with i18n)
import { createUserI18nSchemas } from '../schemas/user.js';

// For multilingual validation
const userSchemas = createUserI18nSchemas('vi'); // Vietnamese
const { createUserSchema } = userSchemas;

// Or use the i18n validator middleware (recommended)
admin.post('/users', i18nValidatorsMiddleware.createUser(), handler);
```

### 4. Enhanced User Management Checking with I18n

```javascript
// Check if user can manage another user with multilingual responses
const { canManage, reason } = canManageUser(
  currentUser.role, 
  targetUser.role, 
  currentUser.id, 
  targetUser.id
);

if (!canManage) {
  return c.json({
    success: false,
    error: tError(c, 'permissions'), // Translated error message
    reason: t(c, `roles.errors.${reason}`), // Specific translated reason
    details: t(c, 'roles.cannotManageUser')
  }, 403);
}

// Success response with i18n
return c.json({
  success: true,
  message: tSuccess(c, 'userManagement'),
  data: result
});
```

### 5. I18n Validator Integration Examples

```javascript
// Enhanced admin routes with i18n validation
import { i18nValidatorsMiddleware } from '../middleware/i18nValidator.js';

// User list with query validation
admin.get('/users', 
  i18nValidatorsMiddleware.userListQuery('query'), 
  async (c) => {
    const validatedQuery = c.req.valid('query');
    // Query is validated and sanitized with XSS protection
  }
);

// Create user with comprehensive validation
admin.post('/users', 
  i18nValidatorsMiddleware.createUser(), 
  async (c) => {
    const userData = c.req.valid('json');
    // Data is validated, sanitized, and error messages are in user's language
  }
);

// Role change with hierarchy validation
admin.put('/users/:id/role', 
  i18nValidatorsMiddleware.roleChange(), 
  async (c) => {
    const { role } = c.req.valid('json');
    // Role hierarchy and permissions are validated with i18n messages
  }
);
```

### 5. API Request Examples

#### Admin Creating User (Limited)

```bash
# Admin creating regular user (allowed)
curl -X POST "http://localhost:8787/api/admin/users" \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "New User",
       "email": "newuser@example.com", 
       "password": "password123",
       "role": "user"
     }'

# Admin trying to create admin (not allowed - 403)
curl -X POST "http://localhost:8787/api/admin/users" \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "New Admin",
       "email": "newadmin@example.com",
       "password": "password123", 
       "role": "admin"
     }'
```

#### Super Admin User Role Change

```bash
# Super Admin changing user role
curl -X PUT "http://localhost:8787/api/admin/users/123/role" \
     -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"role": "admin"}'
```

## VI. Adding New Roles

### Step 1: Add Role to Constants

```javascript
// src/constants/roles.js
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  MODERATOR: 'moderator', // 👈 New role
  EDITOR: 'editor'        // 👈 New role
};

// Update hierarchy
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.MODERATOR]: 2,   // 👈 Add level
  [ROLES.EDITOR]: 3,      // 👈 Add level
  [ROLES.ADMIN]: 4,       // 👈 Update level
  [ROLES.SUPER_ADMIN]: 5  // 👈 Update level
};
```

### Step 2: Define Permissions

```javascript
// src/constants/roles.js
export const ROLE_PERMISSIONS = {
  // ...existing roles...
  [ROLES.MODERATOR]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: false,
    canViewAllUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canChangeRoles: false,
    canViewSuperAdminData: false,
    canAccessAdminRoutes: false,
    canModerateContent: true, // 👈 Specific permission
  },
  [ROLES.EDITOR]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: true,
    canViewAllUsers: true,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canChangeRoles: false,
    canViewSuperAdminData: false,
    canAccessAdminRoutes: true,
    canEditContent: true,     // 👈 Specific permission
  }
};
```

### Step 3: Roles Will Automatically Work

- ✅ Zod validation automatically accepts new roles
- ✅ Permission checking works immediately
- ✅ Role hierarchy automatically applies
- ✅ Database queries automatically support

## VII. Error Responses

### Common Error Codes

| Code | Message | Description |
|------|---------|-------------|
| 400 | Bad Request | Invalid input data or validation error |
| 401 | Unauthorized | Missing or invalid authentication token |
| 403 | Forbidden | Insufficient permissions for the operation |
| 404 | Not Found | User or resource not found |
| 409 | Conflict | Email already exists or duplicate data |
| 500 | Internal Server Error | Server-side error |

### Error Response Format

```json
{
  "success": false,
  "error": "Error message description",
  "details": "Additional error details (optional)"
}
```


### Run Tests

```bash
# Quick test
npm run test:quick

Role-based access control tests
npm run test:role

# Regular User Role tests
npm run test:regular_user

# Admin User Role tests
npm run test:admin_user

# Super Admin User Role tests
npm run test:super_admin_user

# Complete test suite
npm run test:unified
```

### Test Accounts Created

- **Admin User**: `test-admin-{timestamp}@example.com` / `admin123`
- **Super Admin User**: `test-superadmin-{timestamp}@example.com` / `superadmin123`

## IX. Security Considerations

1. **Role-Based Access Control (RBAC)**: All endpoints enforce strict role-based permissions
2. **Input Validation**: All inputs are validated using Zod schemas
3. **SQL Injection Protection**: All database queries use prepared statements
4. **Rate Limiting**: Consider implementing rate limiting for admin endpoints
5. **Audit Logging**: All admin actions should be logged for security auditing
6. **Token Validation**: JWT tokens are validated on every request
7. **Self-Protection**: Users cannot delete/modify themselves inappropriately
8. **Super Admin Protection**: Special protections for Super Admin accounts

## X. Best Practices

### 1. Always Use Permission Checks

```javascript
// ✅ Good
if (hasPermission(user.role, 'canDeleteUsers')) {
  // delete logic
}

// Basic approach (using constants instead of hard-coding)
if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
  // delete logic  
}
```

### 2. Use Management Functions

```javascript
// ✅ Good
const { canManage, reason } = canManageUser(
  currentUser.role, 
  targetUser.role, 
  currentUser.id, 
  targetUser.id
);

if (!canManage) {
  return errorResponse(reason);
}
```

### 3. Leverage Dynamic Functions

```javascript
// ✅ Good - automatically includes new roles
const validRoles = getAllRoles();

// ✅ Good - hierarchy-aware
const accessibleRoles = getRolesLowerOrEqual(currentUser.role);
```

## XI. Internationalization (i18n)

All admin endpoints support internationalization:
- Use `?lang=` query parameter or `Accept-Language` header
- Error messages and success messages are localized
- Supported languages: en, vi, fr, es, de, ja, th

Example:
```bash
GET /api/admin/users?lang=vi
Accept-Language: vi
```

## XII. Performance Considerations

1. **Pagination**: User lists are paginated to prevent large data loads
2. **Indexing**: Ensure database indices on frequently queried fields (email, role, status)
3. **Caching**: Consider caching system statistics for better performance
4. **Query Optimization**: Use efficient SQL queries with proper filtering
5. **Role Filtering**: Implement efficient role-based data filtering

## XIII. Role Testing Framework

The system comes with comprehensive test suites to verify all role-based functionality:

### 1. Role Test Files

| Role | Test File | Test Count | Description |
|------|-----------|------------|-------------|
| **Regular User** | `tests/regularUserTest.js` | 15 tests | Test regular user permissions - personal profile only |
| **Admin User** | `tests/adminUserTest.js` | 9 tests | Test admin functionality - user/dashboard management, no Super Admin access |
| **Super Admin User** | `tests/superAdminUserTest.js` | 12 tests | Test full system control - manage all users & roles |

### 2. Running Tests

```bash
# Test individual roles
npm run test:regular_user      # Test Regular User Role
npm run test:admin_user        # Test Admin User Role  
npm run test:super_admin_user  # Test Super Admin User Role

# Test all roles together
npm run test:role              # Role-based access control tests

# Interactive test menu
npm run test                   # Main test menu
node tests/mainMenu.js         # Direct access
```

### 3. Role Test Coverage

**Regular User (15 tests)**:
- ✅ Login and authentication
- ✅ Access personal profile
- ✅ Update personal information
- ✅ Change password
- ❌ Cannot access admin endpoints
- ❌ Cannot view dashboard
- ❌ Cannot manage other users

**Admin (9 tests)**:
- ✅ All Regular User permissions
- ✅ Access admin dashboard  
- ✅ Manage user/admin roles
- ✅ Create/update/delete users
- ✅ View system statistics
- ❌ Cannot access super_admin users
- ❌ Cannot create super_admin users

**Super Admin (12 tests)**:
- ✅ All Admin permissions
- ✅ Unrestricted access to all users
- ✅ Create/manage super_admin users
- ✅ Full system statistics
- ✅ Complete system control
- ✅ **KV Configuration Management** - Access to `/api/kv-admin/*` endpoints

### 4. Shell Test Scripts

In addition to JavaScript tests, there are shell scripts for CURL-based testing:

```bash
# Shell script tests
bash tests/scripts/regular_user.sh      # Test Regular User Role via CURL
bash tests/scripts/admin_user.sh        # Test Admin User Role via CURL  
bash tests/scripts/super_admin_user.sh  # Test Super Admin User Role via CURL
bash tests/scripts/test-kv-admin.sh     # Test KV Admin functionality (super_admin only)

# Compare all roles
bash tests/scripts/all-roles-comparison.sh   # Compare dashboard access
bash tests/scripts/test_all_roles.sh         # Test all roles sequentially
```

## V. KV Configuration Management (Super Admin Only)

### Overview

The KV Configuration Management system allows **super_admin** users to dynamically modify application configurations without requiring code deployment. This provides operational flexibility while maintaining security.

### 🔑 **Exclusive Super Admin Feature**

KV Admin functionality is restricted to `super_admin` role only:

```javascript
// Only super_admin can access KV Admin routes
kvAdmin.use('*', authMiddleware);
kvAdmin.use('*', requireRole(ROLES.SUPER_ADMIN));
```

### 🎯 **KV Admin API Endpoints**

| Endpoint | Method | Description | Super Admin Only |
|----------|--------|-------------|------------------|
| `/api/kv-admin/configs` | GET | Get all configurations | ✅ |
| `/api/kv-admin/configs/defaults` | GET | Get default configurations | ✅ |
| `/api/kv-admin/configs/env-comparison` | GET | Compare ENV vs KV values | ✅ |
| `/api/kv-admin/configs/:key` | GET | Get specific configuration | ✅ |
| `/api/kv-admin/configs/:key` | PUT | Update configuration | ✅ |
| `/api/kv-admin/configs/batch` | POST | Batch update configurations | ✅ |
| `/api/kv-admin/configs/:key` | DELETE | Reset to default value | ✅ |
| `/api/kv-admin/configs/cache/clear` | POST | Clear configuration cache | ✅ |

### 🔧 **Manageable Configuration Keys**

Super admins can manage these configuration keys:

#### **Rate Limiting**
- `RATE_LIMIT_MAX_ATTEMPTS` - Maximum login attempts
- `RATE_LIMIT_LOCKOUT_DURATION` - Lockout duration in seconds  
- `RATE_LIMIT_DISABLED` - Enable/disable rate limiting

#### **Pagination**
- `DEFAULT_PAGE_SIZE` - Default items per page
- `MAX_PAGE_SIZE` - Maximum allowed page size

#### **Security & Performance**
- `SECURITY_HIGH_RISK_THRESHOLD` - Security risk threshold
- `PERFORMANCE_GOOD_THRESHOLD` - Performance benchmark threshold

#### **User Management**
- `AUTO_ACTIVATE_USER_ON_REGISTER` - Auto-activate new users (skips email)

#### **Debug & Development**
- `ENABLE_DETAILED_ERRORS` - Show detailed error messages
- `LOG_SQL_QUERIES` - Enable SQL query logging

### 🛡️ **Security Features**

#### **Role-Based Restriction**
- Only `super_admin` users can access KV Admin endpoints
- Regular users and admins receive `403 Forbidden` 
- Authentication required for all operations

#### **Key Validation**
- Only predefined configuration keys can be modified
- Invalid keys return `400 Bad Request`
- Comprehensive input validation with Zod schemas

#### **Audit Logging**
All KV configuration changes are logged:
```javascript
kvAdminRoutes_log(`Config updated: ${key} = ${value} (was: ${oldValue})`);
```

#### **Safe Defaults**
- Always falls back to safe default values
- Cannot break application by misconfiguration
- Reset functionality to restore defaults

### 📊 **Example Usage**

#### **Get All Configurations**
```bash
curl -H "Authorization: Bearer <super_admin_token>" \
     http://localhost:8787/api/kv-admin/configs
```

#### **Update Rate Limiting**
```bash
curl -X PUT -H "Authorization: Bearer <super_admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"value": 10}' \
     http://localhost:8787/api/kv-admin/configs/RATE_LIMIT_MAX_ATTEMPTS
```

#### **Batch Update Multiple Configs**
```bash
curl -X POST -H "Authorization: Bearer <super_admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"configs": {"RATE_LIMIT_MAX_ATTEMPTS": 10, "DEFAULT_PAGE_SIZE": 20}}' \
     http://localhost:8787/api/kv-admin/configs/batch
```

#### **Compare ENV vs KV Values**
```bash
curl -H "Authorization: Bearer <super_admin_token>" \
     http://localhost:8787/api/kv-admin/configs/env-comparison
```

### 🧪 **Testing KV Admin**

**JavaScript Tests**:
```bash
npm run test:kv_admin        # Run KV Admin test suite
node tests/kvAdminTest.js    # Direct test execution
```

**Shell Script Tests**:
```bash
bash tests/scripts/test-kv-admin.sh  # CURL-based testing
```

**Test Coverage**:
- ✅ Authentication & authorization
- ✅ CRUD operations for all config keys
- ✅ Batch update functionality
- ✅ Environment comparison
- ✅ Cache management
- ✅ Input validation & error handling
- ✅ Role-based access control

### 📋 **Integration with Admin Role System**

The KV Admin functionality seamlessly integrates with the existing role system:

```javascript
// Role hierarchy for KV access
hasPermission(ROLES.USER, PERMISSIONS.MANAGE_KV_CONFIG)        // ❌ false
hasPermission(ROLES.ADMIN, PERMISSIONS.MANAGE_KV_CONFIG)       // ❌ false  
hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.MANAGE_KV_CONFIG) // ✅ true
```

This ensures that only the highest privilege level (`super_admin`) can modify critical application configurations, maintaining system security and operational control.

## Summary

✅ **Completed Migration with I18n Enhancement**:
- Removed all hard-coded role strings
- Created centralized role management system
- Updated all middleware, services, schemas with i18n support
- Integrated comprehensive i18n validation system
- Added advanced XSS protection and input sanitization
- Implemented intelligent caching for performance optimization
- Enhanced error handling with multilingual messages
- Maintained backward compatibility
- Passed all tests with new i18n features

✅ **Benefits Achieved**:
- Easy to add new roles
- Easy to rename roles  
- Type safety and consistency
- Permission-based access control
- Maintainable and scalable code
- Comprehensive admin API with i18n support
- Security-first approach with XSS protection
- **NEW**: Multilingual support for 7 languages (en, vi, fr, es, de, ja, th)
- **NEW**: Advanced validation with intelligent caching
- **NEW**: Performance monitoring and optimization
- **NEW**: Enhanced security with input sanitization

✅ **Future Ready with I18n**:
- Add new roles (moderator, editor, viewer, etc.)
- Permission-based access control with multilingual interfaces
- Dynamic role assignment with i18n validation
- Role-based UI rendering in multiple languages
- API endpoint access control with localized responses
- **NEW**: Easy addition of new languages for validation
- **NEW**: Performance insights for optimization decisions
- **NEW**: Advanced security features for enterprise use

🚀 **Production Ready with I18n**: The enhanced system is thoroughly tested and ready for international deployment!

This Admin & Role Management system now provides a comprehensive, secure, flexible, and internationally-ready solution for user management and authorization with full multilingual support.
