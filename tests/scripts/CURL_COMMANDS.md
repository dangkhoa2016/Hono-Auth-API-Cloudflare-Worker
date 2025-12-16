📖 **Language**: English | [Tiếng Việt](./CURL_COMMANDS_vi.md)

# 🧪 RBAC Testing with Curl Commands - Complete Reference

> **Comprehensive role-based access control (RBAC) testing using curl commands**

Complete documentation for testing the authentication and authorization system of Hono Auth Worker using curl commands. This guide covers all role types, security boundaries, and edge cases.

## 📋 Table of Contents

1. [🚀 Quick Setup](#quick-setup)
2. [🔐 Authentication](#authentication)
3. [👤 Regular User Commands](#regular-user-commands)
4. [👥 Admin Commands](#admin-commands)
5. [👑 Super Admin Commands](#super-admin-commands)
6. [🛡️ Security Testing](#security-testing)
7. [📊 System Endpoints](#system-endpoints)
8. [🔧 KV Configuration Management](#kv-configuration-management)
9. [🔍 Audit System Testing](#audit-system-testing)
10. [🌐 Internationalization Testing](#internationalization-testing)
11. [🎯 Zod Validation Demo Endpoints](#zod-validation-demo-endpoints)
12. [⚡ Performance Testing](#performance-testing)
13. [🧪 Test Automation Scripts](#test-automation-scripts)
14. [🔧 Troubleshooting](#troubleshooting)

## 🚀 Quick Setup

### Prerequisites
- **curl** installed
- **jq** for JSON formatting (optional but recommended)
- **Test server running** on port 8788 (test environment)

### Start Test Server
```bash
# Start test environment
npm run dev:test  # Port 8788

# Or start other environments
npm run dev         # Development - Port 8787
npm run dev:staging # Staging - Port 8789
```

### Test Data Setup
```bash
# Create test users (if not already exists)
node tests/utils/createTestAdminUsers.js

# Or run test data setup
node tests/utils/setupTestUsers.js

# Initialize test database
npm run test:initdb

# Reset test database with clean state
node tests/init/reset.sql
```

### Available Test Environments
```bash
# Development environment (port 8787)
npm run dev

# Test environment (port 8788)
npm run dev:test

# Staging environment (port 8789)
npm run dev:staging

# Test environment with debug
npm run dev:test:debug
```

## 🔐 Authentication

### Login for Each Role Type

#### 1. Super Admin Login
```bash
curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-superadmin@example.com",
    "password": "password123"
  }' | jq .
```

#### 2. Admin Login
```bash
curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-admin@example.com",
    "password": "password123"
  }' | jq .
```

#### 3. Regular User Login
```bash
curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-user@example.com",
    "password": "password123"
  }' | jq .
```

### Token Management

#### Refresh Token
```bash
curl -s -X POST http://localhost:8788/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }' | jq .
```

#### Logout
```bash
curl -s -X POST http://localhost:8788/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq .
```

## 👤 Regular User Commands

### Profile Management

#### Get Own Profile
```bash
curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .
```

#### Update Own Profile
```bash
curl -s -X PUT http://localhost:8788/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "full_name": "Updated User Name"
  }' | jq .
```

#### Change Password
```bash
curl -s -X PUT http://localhost:8788/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }' | jq .
```

### User Registration (Public Endpoint)
```bash
curl -s -X POST http://localhost:8788/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "New Registered User",
    "email": "newreg@example.com",
    "password": "password123"
  }' | jq .
```

### Forbidden Actions (Should Return 403)

#### Attempt to Access Admin Endpoints
```bash
# Should return 403 Forbidden
curl -s -X GET http://localhost:8788/api/admin/users \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .
```

#### Attempt to Create User
```bash
# Should return 403 Forbidden
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "email": "forbidden@example.com",
    "password": "password123",
    "full_name": "Forbidden User",
    "role": "user"
  }' | jq .
```

## 👥 Admin Commands

### User Management

#### Get All Users (Filtered)
```bash
# Get all users (Admin sees users and admins only)
curl -s -X GET http://localhost:8788/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Get Users with Pagination
```bash
curl -s -X GET "http://localhost:8788/api/admin/users?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Get Users Filtered by Role
```bash
# Get admin users only
curl -s -X GET "http://localhost:8788/api/admin/users?role=admin" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .

# Get regular users only
curl -s -X GET "http://localhost:8788/api/admin/users?role=user" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Get Users Filtered by Status
```bash
curl -s -X GET "http://localhost:8788/api/admin/users?status=active" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Search Users
```bash
curl -s -X GET "http://localhost:8788/api/admin/users?search=test" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### User Details

#### Get Specific User Details
```bash
# Replace USER_ID with actual user ID
curl -s -X GET http://localhost:8788/api/admin/users/4 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Create Users

#### Create Regular User
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "full_name": "New Test User",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "user",
    "status": "active"
  }' | jq .
```

#### Create Admin User
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "full_name": "New Admin User",
    "email": "newadmin@example.com",
    "password": "password123",
    "role": "admin",
    "status": "active"
  }' | jq .
```

### Update Users

#### Update User Information
```bash
# Replace USER_ID with actual user ID
curl -s -X PUT http://localhost:8788/api/admin/users/4 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "full_name": "Updated User Name",
    "status": "inactive"
  }' | jq .
```

### Role Management

#### Change User Role (Admin can change user ↔ admin)
```bash
# Promote user to admin
curl -s -X PUT http://localhost:8788/api/admin/users/4/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "admin"}' | jq .

# Demote admin to user
curl -s -X PUT http://localhost:8788/api/admin/users/3/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "user"}' | jq .
```

### Delete Users

#### Delete Regular User
```bash
curl -s -X DELETE http://localhost:8788/api/admin/users/4 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Delete Admin User
```bash
curl -s -X DELETE http://localhost:8788/api/admin/users/3 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Admin Limitations (Should Return 403)

#### Cannot Create Super Admin
```bash
# Should return 403 Forbidden
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "full_name": "Forbidden Super Admin",
    "email": "forbidden@example.com",
    "password": "password123",
    "role": "super_admin"
  }' | jq .
```

#### Cannot Access Super Admin Details
```bash
# Should return 403 Forbidden
curl -s -X GET http://localhost:8788/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Cannot Promote to Super Admin
```bash
# Should return 403 Forbidden
curl -s -X PUT http://localhost:8788/api/admin/users/4/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "super_admin"}' | jq .
```

## 👑 Super Admin Commands

### Full User Management

#### View All Users (Including Super Admins)
```bash
curl -s -X GET http://localhost:8788/api/admin/users \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### View Super Admin Users Only
```bash
curl -s -X GET "http://localhost:8788/api/admin/users?role=super_admin" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Access Super Admin Details
```bash
curl -s -X GET http://localhost:8788/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Create Users with Any Role

#### Create Regular User
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "full_name": "New Regular User",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "user",
    "status": "active"
  }' | jq .
```

#### Create Admin User
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "full_name": "New Admin User",
    "email": "newadmin@example.com",
    "password": "password123",
    "role": "admin",
    "status": "active"
  }' | jq .
```

#### Create Super Admin User
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "full_name": "New Super Admin",
    "email": "newsuperadmin@example.com",
    "password": "password123",
    "role": "super_admin",
    "status": "active"
  }' | jq .
```

### Update Any User

#### Update Super Admin Details
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "full_name": "Updated Super Admin Name",
    "status": "active"
  }' | jq .
```

### Advanced Role Management

#### Promote User to Admin
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/4/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "admin"}' | jq .
```

#### Promote User to Super Admin
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/5/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "super_admin"}' | jq .
```

#### Promote Admin to Super Admin
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/3/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "super_admin"}' | jq .
```

#### Demote Super Admin to Admin
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/SUPER_ADMIN_USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "admin"}' | jq .
```

#### Demote Super Admin to User
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/SUPER_ADMIN_USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "user"}' | jq .
```

### Delete Any User

#### Delete Regular User
```bash
curl -s -X DELETE http://localhost:8788/api/admin/users/4 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Delete Admin User
```bash
curl -s -X DELETE http://localhost:8788/api/admin/users/3 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Delete Super Admin User
```bash
curl -s -X DELETE http://localhost:8788/api/admin/users/SUPER_ADMIN_USER_ID \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Super Admin Limitations (Safety Measures)

#### Cannot Delete Own Account
```bash
# Should return 403 Forbidden
curl -s -X DELETE http://localhost:8788/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Cannot Change Own Role
```bash
# Should return 403 Forbidden
curl -s -X PUT http://localhost:8788/api/admin/users/1/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "admin"}' | jq .
```

## ⚙️ KV Configuration Management Commands (Super Admin Only)

### Get All Configurations
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Get Specific Configuration
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs/RATE_LIMIT_DISABLED \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Get Default Configurations
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs/defaults \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Compare ENV vs KV
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs/env-comparison \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Update Configuration
```bash
curl -s -X PUT http://localhost:8788/api/kv-admin/configs/RATE_LIMIT_DISABLED \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"value": false}' | jq .
```

### Batch Update Configurations
```bash
curl -s -X POST http://localhost:8788/api/kv-admin/configs/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "configs": {
      "RATE_LIMIT_MAX_ATTEMPTS": 10,
      "DEFAULT_PAGE_SIZE": 20,
      "ENABLE_DETAILED_ERRORS": true
    }
  }' | jq .
```

### Reset Configuration to Default
```bash
curl -s -X DELETE http://localhost:8788/api/kv-admin/configs/RATE_LIMIT_DISABLED \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Clear Configuration Cache
```bash
curl -s -X POST http://localhost:8788/api/kv-admin/configs/cache/clear \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Test Access Denied

#### Admin Try to Access KV Admin (Should be Denied)
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### User Try to Access KV Admin (Should be Denied)
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .
```

#### No Token (Should be Denied)
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs | jq .
```

## 🛡️ Security Testing

### Invalid Authentication

#### Invalid Token
```bash
curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer invalid_token" | jq .
```

#### No Token
```bash
curl -s -X GET http://localhost:8788/api/user/profile | jq .
```

#### Expired Token Testing
```bash
# Use an expired token (you need to manually create one or wait for expiry)
curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer EXPIRED_TOKEN" | jq .
```

### Role Boundary Testing

#### Admin Trying to See Super Admin Data
```bash
# Should return empty results or filtered data
curl -s -X GET "http://localhost:8788/api/admin/users?role=super_admin" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### User Trying Admin Operations
```bash
# All should return 403 Forbidden
curl -s -X GET http://localhost:8788/api/admin/users \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .

curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{"email":"hack@example.com","password":"password123","full_name":"Hacker","role":"admin"}' | jq .
```

### Input Validation Testing

#### Invalid Email Format
```bash
curl -s -X POST http://localhost:8788/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "invalid-email",
    "password": "password123"
  }' | jq .
```

#### Short Password
```bash
curl -s -X POST http://localhost:8788/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "123"
  }' | jq .
```

#### Invalid Role
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "role": "invalid_role"
  }' | jq .
```

## � KV Configuration Management

### System Configuration (Super Admin Only)

#### Get All KV Configurations
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Get Specific Configuration
```bash
# Get JWT settings
curl -s -X GET http://localhost:8788/api/kv-admin/configs/JWT_SECRET \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .

# Get feature flags
curl -s -X GET http://localhost:8788/api/kv-admin/configs/RATE_LIMIT_DISABLED \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .

# Get maintenance mode
curl -s -X GET http://localhost:8788/api/kv-admin/configs/MAINTENANCE_MODE \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Update Configuration
```bash
# Enable maintenance mode
curl -s -X PUT http://localhost:8788/api/kv-admin/configs/MAINTENANCE_MODE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"value": "true"}' | jq .

# Disable rate limiting
curl -s -X PUT http://localhost:8788/api/kv-admin/configs/RATE_LIMIT_DISABLED \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"value": "true"}' | jq .

# Update JWT token expiration
curl -s -X PUT http://localhost:8788/api/kv-admin/configs/JWT_ACCESS_TOKEN_EXPIRES \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"value": "7200"}' | jq .
```

#### Delete Configuration (Reset to Default)
```bash
curl -s -X DELETE http://localhost:8788/api/kv-admin/configs/MAINTENANCE_MODE \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Response Body Capture Control
```bash
# Enable response body capture for debugging
curl -s -X PUT http://localhost:8788/api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"value": "true"}' | jq .

# Check current status
curl -s -X GET http://localhost:8788/api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

## 🔍 Audit System Testing

### Basic Audit Log Queries
```bash
# Get recent audit logs
curl -s -X GET "http://localhost:8788/api/admin/audit-logs?limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .

# Get audit logs by action type
curl -s -X GET "http://localhost:8788/api/admin/audit-logs?action=user_login" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .

# Get audit logs by user ID
curl -s -X GET "http://localhost:8788/api/admin/audit-logs?user_id=2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .

# Get audit logs with date range
curl -s -X GET "http://localhost:8788/api/admin/audit-logs?start_date=2025-08-01&end_date=2025-08-02" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Advanced Audit Analytics (Super Admin Only)
```bash
# Get audit statistics
curl -s -X GET http://localhost:8788/api/admin/audit-stats \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .

# Get audit analytics dashboard
curl -s -X GET http://localhost:8788/api/admin/audit-analytics \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .

# Export audit logs
curl -s -X GET "http://localhost:8788/api/admin/audit-export?format=json&days=30" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Security Incident Management
```bash
# Get security incidents
curl -s -X GET http://localhost:8788/api/admin/security-incidents \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .

# Create security incident
curl -s -X POST http://localhost:8788/api/admin/security-incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "title": "Suspicious Login Activity",
    "description": "Multiple failed login attempts detected",
    "severity": "medium",
    "category": "authentication"
  }' | jq .

# Update incident status
curl -s -X PUT http://localhost:8788/api/admin/security-incidents/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"status": "investigating"}' | jq .
```

## 🌐 Internationalization Testing

### Language Detection Testing
```bash
# Test with different Accept-Language headers
curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Accept-Language: vi-VN,vi;q=0.9" | jq .

curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Accept-Language: fr-FR,fr;q=0.9" | jq .

curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Accept-Language: ja-JP,ja;q=0.9" | jq .
```

### Language Override with Query Parameter
```bash
# Force specific language
curl -s -X GET "http://localhost:8788/api/user/profile?lang=vi" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .

curl -s -X GET "http://localhost:8788/api/user/profile?lang=es" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .

curl -s -X GET "http://localhost:8788/api/user/profile?lang=th" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .
```

### Translation Demo Endpoints
```bash
# Get available languages
curl -s -X GET http://localhost:8788/api/translations/languages | jq .

# Get translations for specific language
curl -s -X GET http://localhost:8788/api/translations/demo/vi | jq .
curl -s -X GET http://localhost:8788/api/translations/demo/ja | jq .
curl -s -X GET http://localhost:8788/api/translations/demo/de | jq .
```

### Validation Error Messages in Multiple Languages
```bash
# Test validation errors in different languages
curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: vi-VN" \
  -d '{"email": "invalid", "password": ""}' | jq .

curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: ja-JP" \
  -d '{"email": "invalid", "password": ""}' | jq .
```

## ⚡ Performance Testing

### Load Testing Endpoints
```bash
# Simple performance test
for i in {1..10}; do
  curl -s -X GET http://localhost:8788/api/system/health \
    -w "Response time: %{time_total}s\n" -o /dev/null
done

# Concurrent authentication tests
for i in {1..5}; do
  curl -s -X POST http://localhost:8788/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "user@example.com", "password": "password123"}' \
    -w "Login time: %{time_total}s\n" -o /dev/null &
done
wait
```

### Performance Monitoring
```bash
# Get system performance metrics
curl -s -X GET http://localhost:8788/api/admin/system-health \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .

# Get detailed performance stats (Super Admin only)
curl -s -X GET http://localhost:8788/api/admin/performance-stats \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

## 🧪 Test Automation Scripts

### Available Test Scripts
```bash
# Interactive test menu (30 different test suites)
npm run test
# or
node tests/mainMenu.js

# Complete test runner (all 40+ tests)
bash tests/scripts/run-all-tests.sh

# Quick test runner (minimal output)
bash tests/scripts/run-all-tests-quick.sh

# Role-specific testing
bash tests/scripts/admin_user.sh
bash tests/scripts/regular_user.sh
bash tests/scripts/super_admin_user.sh
bash tests/scripts/test_all_roles.sh

# Security testing
bash tests/scripts/test-rbac.sh
bash tests/scripts/test-debug.sh
```

### Individual Test Suite Commands
```bash
# Core functionality tests
npm run test:system          # System health and environment
npm run test:auth            # Authentication and JWT
npm run test:security        # Security and rate limiting
npm run test:quick           # Fast smoke tests

# Role-based tests
npm run test:regular_user    # Regular user functionality
npm run test:admin_user      # Admin user management
npm run test:super_admin_user # Super admin full control

# Advanced functionality
npm run test:i18n           # i18n and localization
npm run test:validation      # Zod schema validation
npm run test:performance     # Load and performance testing
npm run test:integration     # End-to-end workflows

# Audit system tests
npm run test:audit:system    # Complete audit functionality
npm run test:audit:simple    # Basic audit tests
npm run test:audit:advanced  # Advanced audit analytics
npm run test:audit:perf      # Audit performance testing

# KV and configuration tests
npm run test:kv_admin        # KV configuration management
npm run test:kv:audit        # KV audit configuration

# Security tests
npm run test:xss:all         # XSS protection testing
npm run test:security:incident # Security incident management
npm run test:error           # Error handling tests

# Specialized tests
npm run test:zod_validation  # Additional Zod validation
npm run test:multilang_validation # Multi-language validation errors
npm run test:optimized       # Service optimization tests
```

### Test Environment Scripts
```bash
# Environment setup
npm run setup:dev            # Development environment
npm run setup:test           # Test environment  
npm run setup:staging        # Staging environment

# Database management
npm run db:migrate           # Run migrations (development)
npm run db:migrate:test      # Run migrations (test)
npm run db:migrate:staging   # Run migrations (staging)
npm run test:initdb          # Initialize test database
```

## 📊 System Endpoints

### Admin Statistics
```bash
curl -s -X GET http://localhost:8788/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Admin Dashboard
```bash
curl -s -X GET http://localhost:8788/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### System Health Check  
```bash
curl -s -X GET http://localhost:8788/api/admin/system-health \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Public Endpoints

#### Health Check
```bash
# Basic health check
curl -s -X GET http://localhost:8788/health | jq .

# Alternative health endpoint
curl -s -X GET http://localhost:8788/api/health | jq .
```

#### Version Information
```bash
# Basic version endpoint  
curl -s -X GET http://localhost:8788/version | jq .

# Alternative version endpoint
curl -s -X GET http://localhost:8788/api/version | jq .
```

#### Language Detection
```bash
# Language detection endpoint
curl -s -X GET http://localhost:8788/language | jq .

# Language with Accept-Language header
curl -s -X GET http://localhost:8788/language \
  -H "Accept-Language: vi,en;q=0.9" | jq .
```

#### API Information (Requires Authentication)
```bash
# Comprehensive API information
curl -s -X GET http://localhost:8788/api \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .

# System routes discovery (Admin only)
curl -s -X GET http://localhost:8788/routes \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Favicon and Static Assets
```bash
# Favicon ICO
curl -s -X GET http://localhost:8788/favicon.ico \
  -o favicon.ico

# Favicon PNG  
curl -s -X GET http://localhost:8788/favicon.png \
  -o favicon.png

# Apple touch icon
curl -s -X GET http://localhost:8788/apple-touch-icon.png \
  -o apple-touch-icon.png

# Manifest icon
curl -s -X GET http://localhost:8788/icon-192.png \
  -o icon-192.png
```

#### Translation Endpoints
```bash
# List all available languages
curl -s -X GET http://localhost:8788/api/translations | jq .

# Get specific language translations
curl -s -X GET http://localhost:8788/api/translations/vi | jq .
curl -s -X GET http://localhost:8788/api/translations/en | jq .
curl -s -X GET http://localhost:8788/api/translations/fr | jq .
curl -s -X GET http://localhost:8788/api/translations/es | jq .
curl -s -X GET http://localhost:8788/api/translations/de | jq .
curl -s -X GET http://localhost:8788/api/translations/ja | jq .
curl -s -X GET http://localhost:8788/api/translations/th | jq .

# Validate translation completeness
curl -s -X GET http://localhost:8788/api/translations/vi/validate | jq .

# Get specific section translations
curl -s -X GET http://localhost:8788/api/translations/en/section/auth | jq .
```

#### Translation Demo Endpoints
```bash
# Enhanced i18n demo
curl -s -X GET http://localhost:8788/api/translations/demo/enhanced | jq .

# Plurals demo
curl -s -X GET http://localhost:8788/api/translations/demo/plurals | jq .

# Formatting demo
curl -s -X GET http://localhost:8788/api/translations/demo/formatting | jq .

# Context demo
curl -s -X GET http://localhost:8788/api/translations/demo/context | jq .

# Error messages demo
curl -s -X GET http://localhost:8788/api/translations/demo/errors | jq .

# Success messages demo
curl -s -X GET http://localhost:8788/api/translations/demo/success | jq .
```

## 🎯 Zod Validation Demo Endpoints

### Main Zod Demo Information
```bash
# Get Zod demo overview and documentation
curl -s -X GET http://localhost:8788/api/zod_demo | jq .
```

### User Registration Demo
```bash
# Valid registration demo
curl -s -X POST http://localhost:8788/api/zod_demo/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "email": "john@example.com", 
    "password": "SecurePass123",
    "age": 25,
    "country": "us",
    "terms_accepted": true
  }' | jq .

# Invalid registration demo - shows validation errors
curl -s -X POST http://localhost:8788/api/zod_demo/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "",
    "email": "invalid-email",
    "password": "123", 
    "age": 15,
    "country": "invalid",
    "terms_accepted": false
  }' | jq .
```

### Search Demo with Query Parameters
```bash
# Valid search with all parameters
curl -s -X GET "http://localhost:8788/api/zod_demo/search?query=test&page=1&limit=10&sort_by=date&sort_order=desc" | jq .

# Search with minimal parameters (uses defaults)
curl -s -X GET "http://localhost:8788/api/zod_demo/search?query=example" | jq .

# Invalid search parameters - shows validation errors
curl -s -X GET "http://localhost:8788/api/zod_demo/search?query=&page=-1&limit=1000&sort_by=invalid&sort_order=wrong" | jq .
```

### File Upload Demo
```bash
# Valid file upload demo
curl -s -X POST http://localhost:8788/api/zod_demo/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "document.pdf",
    "file_size": 1024000,
    "description": "Important document"
  }' | jq .

# File upload with minimal data
curl -s -X POST http://localhost:8788/api/zod_demo/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "image.jpg",
    "file_size": 512000
  }' | jq .

# Invalid file upload - shows validation errors
curl -s -X POST http://localhost:8788/api/zod_demo/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "",
    "file_size": -1,
    "description": ""
  }' | jq .
```

## 🔧 Troubleshooting

### Quick Token Extraction

#### Extract Tokens with Bash
```bash
# Extract tokens automatically
export SUPER_ADMIN_TOKEN=$(curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test-superadmin@example.com","password":"password123"}' | \
  grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

export ADMIN_TOKEN=$(curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test-admin@example.com","password":"password123"}' | \
  grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

export USER_TOKEN=$(curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test-user@example.com","password":"password123"}' | \
  grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Verify tokens
echo "Super Admin Token: $SUPER_ADMIN_TOKEN"
echo "Admin Token: $ADMIN_TOKEN"  
echo "User Token: $USER_TOKEN"
```

### Quick Role Tests
```bash
# Test all roles with one command
echo "=== Testing Super Admin ==="
curl -s -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" http://localhost:8788/api/admin/users | jq .

echo "=== Testing Admin ==="
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8788/api/admin/users | jq .

echo "=== Testing User ==="
curl -s -H "Authorization: Bearer $USER_TOKEN" http://localhost:8788/api/admin/users | jq .
```

### Common Issues

#### Server Not Running
```bash
# Check if server is running
curl -s http://localhost:8788/api/health

# Start test server if needed
npm run dev:test

# Start with debug mode
npm run dev:test:debug
```

#### Database Issues
```bash
# Initialize test database
npm run test:initdb

# Reset database and recreate test users
npm run db:reset:test
node tests/utils/createTestAdminUsers.js

# Check database migration status
npm run db:status:test
```

#### Missing Test Users
```bash
# Create test users
node tests/utils/createTestAdminUsers.js

# Or use the service
node tests/utils/createTestAdminUsersService.js

# Set up comprehensive test data
node tests/utils/setupTestUsers.js
```

#### Test Environment Issues
```bash
# Run environment-specific tests
npm run test:quick          # Fast smoke tests
npm run test:system         # System health checks
npm run test:auth           # Authentication tests

# Interactive test menu with 30+ test suites
npm run test
# or
node tests/mainMenu.js

# Complete automated test suite
bash tests/scripts/run-all-tests.sh

# Quick automated test suite (minimal output)
bash tests/scripts/run-all-tests-quick.sh
```

#### Role-Based Testing Issues
```bash
# Test specific roles
npm run test:regular_user
npm run test:admin_user  
npm run test:super_admin_user

# Test all roles at once
bash tests/scripts/test_all_roles.sh

# RBAC-specific testing
bash tests/scripts/test-rbac.sh
```

#### Debug and Monitoring Issues
```bash
# Enable debug mode
bash tests/scripts/test-debug.sh

# Check KV configuration
npm run test:kv_admin

# Test audit system
npm run test:audit:system
npm run test:audit:simple
```

#### i18n and Localization Issues
```bash
# Test translations
npm run test:i18n

# Test multi-language validation
npm run test:multilang_validation

# Test i18n validator extensions
node tests/i18nValidatorExtensionTest.js
```

#### Performance and Load Testing Issues
```bash
# Performance testing
npm run test:performance

# Audit performance testing  
npm run test:audit:perf

# Optimized service testing
npm run test:optimized
```

#### Advanced Testing Features
```bash
# Security testing
npm run test:security
npm run test:xss:all
npm run test:security:incident

# Validation testing
npm run test:validation
npm run test:zod_validation

# Error handling testing
npm run test:error

# Integration testing
npm run test:integration
```

## 📋 Expected Results Summary

### Role Permissions Matrix

| Action | User | Admin | Super Admin |
|--------|------|-------|-------------|
| **View own profile** | ✅ | ✅ | ✅ |
| **Update own profile** | ✅ | ✅ | ✅ |
| **View user list** | ❌ | ✅ (filtered) | ✅ (all) |
| **View Super Admin details** | ❌ | ❌ | ✅ |
| **Create regular user** | ❌ | ✅ | ✅ |
| **Create admin user** | ❌ | ✅ | ✅ |
| **Create Super Admin** | ❌ | ❌ | ✅ |
| **Delete regular user** | ❌ | ✅ | ✅ |
| **Delete admin user** | ❌ | ✅ | ✅ |
| **Delete Super Admin** | ❌ | ❌ | ✅ |
| **Change role user ↔ admin** | ❌ | ✅ | ✅ |
| **Change role to Super Admin** | ❌ | ❌ | ✅ |
| **Delete own account** | ❌ | ❌ | ❌ |
| **Change own role** | ❌ | ❌ | ❌ |

### Safety Measures
- **Self-protection**: No user can delete their own account
- **Role protection**: No user can change their own role
- **Hierarchy enforcement**: Admins cannot manage Super Admins
- **Data filtering**: Admins cannot see Super Admin data
- **Input validation**: All inputs validated with Zod schemas

---

## 📊 **TESTING 4 MAIN AUDIT ROUTE GROUPS**

### **🔍 1. Core Audit Routes (/api/audit/)**

#### **Get Audit Logs with Filtering**
```bash
# Basic logs
curl -s -X GET http://localhost:8788/api/audit/logs \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Logs with pagination and filtering
curl -s -X GET "http://localhost:8788/api/audit/logs?page=1&limit=10&action=LOGIN_SUCCESS" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Time-based filtering
curl -s -X GET "http://localhost:8788/api/audit/logs?startDate=2025-07-20&endDate=2025-07-21" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Full-text Search in Audit Logs**
```bash
# Basic search
curl -s -X GET "http://localhost:8788/api/audit/search?query=login&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Complex search with filters
curl -s -X GET "http://localhost:8788/api/audit/search?query=failed&action=LOGIN_FAILED&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Audit Statistics**
```bash
# General statistics
curl -s -X GET http://localhost:8788/api/audit/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Time-based statistics
curl -s -X GET "http://localhost:8788/api/audit/stats?timeRange=7d&groupBy=action" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Export Audit Data**
```bash
# Export to CSV
curl -s -X GET "http://localhost:8788/api/audit/export?format=csv&startDate=2025-07-20" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -o audit_logs.csv

# Export to JSON with compression
curl -s -X GET "http://localhost:8788/api/audit/export?format=json&compress=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -o audit_logs.json.gz
```

#### **System Health Check**
```bash
# Audit system health
curl -s -X GET http://localhost:8788/api/audit/system-health \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

### **📈 2. Advanced Analytics Routes (/api/advanced-audit/)** (Super Admin Only)

#### **Analytics Dashboard**
```bash
# Main analytics dashboard
curl -s -X GET http://localhost:8788/api/advanced-audit/analytics \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Analytics with custom time range
curl -s -X GET "http://localhost:8788/api/advanced-audit/analytics?period=30d&metrics=all" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Trends Analysis**
```bash
# Usage trends
curl -s -X GET http://localhost:8788/api/advanced-audit/trends \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Specific metric trends
curl -s -X GET "http://localhost:8788/api/advanced-audit/trends?metric=login_attempts&period=7d" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Comprehensive Reports**
```bash
# Full system report
curl -s -X GET http://localhost:8788/api/advanced-audit/reports \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Custom report with filters
curl -s -X GET "http://localhost:8788/api/advanced-audit/reports?type=security&format=detailed" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Performance Metrics**
```bash
# System performance metrics
curl -s -X GET http://localhost:8788/api/advanced-audit/performance-metrics \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Performance metrics with time range
curl -s -X GET "http://localhost:8788/api/advanced-audit/performance-metrics?hours=24&detailed=true" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **User Activity Analysis**
```bash
# User activity patterns
curl -s -X GET http://localhost:8788/api/advanced-audit/user-activity-analysis \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Specific user analysis
curl -s -X GET "http://localhost:8788/api/advanced-audit/user-activity-analysis?userId=4&days=7" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Security Analysis**
```bash
# Security event analysis
curl -s -X GET http://localhost:8788/api/advanced-audit/security-analysis \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Threat detection analysis
curl -s -X GET "http://localhost:8788/api/advanced-audit/security-analysis?type=threats&severity=high" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Compliance Reports**
```bash
# Compliance overview
curl -s -X GET http://localhost:8788/api/advanced-audit/compliance-reports \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Specific compliance standard
curl -s -X GET "http://localhost:8788/api/advanced-audit/compliance-reports?standard=gdpr&period=quarter" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

### **🔴 3. Real-time Monitoring Routes (/api/realtime-monitoring/)** (Super Admin Only)

#### **Live Activity Feed**
```bash
# Current live activity
curl -s -X GET http://localhost:8788/api/realtime-monitoring/live-activity \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Live activity with filters
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/live-activity?type=login&limit=20" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Active Sessions**
```bash
# All active user sessions
curl -s -X GET http://localhost:8788/api/realtime-monitoring/active-sessions \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Sessions by role
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/active-sessions?role=admin&details=true" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **System Alerts**
```bash
# Current system alerts
curl -s -X GET http://localhost:8788/api/realtime-monitoring/system-alerts \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Filtered alerts
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/system-alerts?severity=critical&unread=true" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Performance Monitoring**
```bash
# Real-time performance
curl -s -X GET http://localhost:8788/api/realtime-monitoring/performance-monitor \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Performance with metrics
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/performance-monitor?metrics=cpu,memory,db" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Security Monitoring**
```bash
# Security event monitoring
curl -s -X GET http://localhost:8788/api/realtime-monitoring/security-monitor \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Security monitoring with filters
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/security-monitor?events=suspicious&minutes=30" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Resource Usage**
```bash
# Current resource usage
curl -s -X GET http://localhost:8788/api/realtime-monitoring/resource-usage \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Detailed resource breakdown
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/resource-usage?breakdown=detailed&history=1h" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Error Tracking**
```bash
# Recent error tracking
curl -s -X GET http://localhost:8788/api/realtime-monitoring/error-tracking \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Error tracking with severity
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/error-tracking?severity=error&hours=2" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

### **🚨 4. Security Incident Routes (/api/security-incident/)** (Admin+ Required)

#### **Security Incidents Management**
```bash
# List all incidents
curl -s -X GET http://localhost:8788/api/security-incident/incidents \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Filtered incidents
curl -s -X GET "http://localhost:8788/api/security-incident/incidents?status=open&severity=high" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Create Security Incident**
```bash
# Create new incident
curl -s -X POST http://localhost:8788/api/security-incident/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Suspicious Login Attempts",
    "description": "Multiple failed login attempts detected",
    "severity": "medium",
    "type": "login_abuse",
    "affected_resources": ["user_accounts"],
    "reporter_notes": "IP 192.168.1.100 attempted 50+ failed logins"
  }' | jq .
```

#### **Get Specific Incident**
```bash
# Get incident details
curl -s -X GET http://localhost:8788/api/security-incident/incidents/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Update Security Incident**
```bash
# Update incident status
curl -s -X PUT http://localhost:8788/api/security-incident/incidents/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "investigating",
    "assigned_to": "security_team",
    "resolution_notes": "Investigating IP patterns and user behavior"
  }' | jq .
```

#### **Incident Types**
```bash
# Get available incident types
curl -s -X GET http://localhost:8788/api/security-incident/incident-types \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Response Procedures**
```bash
# Get incident response procedures
curl -s -X GET http://localhost:8788/api/security-incident/response-procedures \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Specific procedure
curl -s -X GET "http://localhost:8788/api/security-incident/response-procedures?type=data_breach" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Threat Analysis**
```bash
# Security threat analysis
curl -s -X GET http://localhost:8788/api/security-incident/threat-analysis \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Specific threat analysis
curl -s -X GET "http://localhost:8788/api/security-incident/threat-analysis?period=7d&type=login_attacks" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Incident Reports**
```bash
# Generate incident report
curl -s -X GET http://localhost:8788/api/security-incident/incident-reports \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Monthly incident summary
curl -s -X GET "http://localhost:8788/api/security-incident/incident-reports?period=month&format=summary" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Create Incident Alert**
```bash
# Create incident alert
curl -s -X POST http://localhost:8788/api/security-incident/incident-alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "incident_id": 1,
    "alert_type": "email",
    "recipients": ["security@company.com"],
    "priority": "high",
    "message": "Critical security incident requires immediate attention"
  }' | jq .
```

### **🛡️ Role-Based Audit Testing**

#### **Admin Role Audit Testing**
```bash
# Admin can access core audit
curl -s -X GET http://localhost:8788/api/audit/logs \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Admin CANNOT access advanced analytics (should return 403)
curl -s -X GET http://localhost:8788/api/advanced-audit/analytics \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Admin CANNOT access real-time monitoring (should return 403)
curl -s -X GET http://localhost:8788/api/realtime-monitoring/live-activity \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Admin CAN access security incidents
curl -s -X GET http://localhost:8788/api/security-incident/incidents \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Super Admin Role Audit Testing**
```bash
# Super Admin can access ALL audit endpoints
curl -s -X GET http://localhost:8788/api/audit/logs \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/advanced-audit/analytics \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/realtime-monitoring/live-activity \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/security-incident/incidents \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **User Role Audit Testing (Should ALL Return 403)**
```bash
# Regular users should be denied access to ALL audit endpoints
curl -s -X GET http://localhost:8788/api/audit/logs \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/advanced-audit/analytics \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/realtime-monitoring/live-activity \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/security-incident/incidents \
  -H "Authorization: Bearer $USER_TOKEN" | jq .
```

### **🔄 Complete Audit System Test Sequence**
```bash
# Complete test sequence for all audit route groups
echo "=== Testing Core Audit (Admin Access) ==="
curl -s -X GET http://localhost:8788/api/audit/logs -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.success'

echo "=== Testing Advanced Analytics (Super Admin Only) ==="
curl -s -X GET http://localhost:8788/api/advanced-audit/analytics -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq '.success'

echo "=== Testing Real-time Monitoring (Super Admin Only) ==="
curl -s -X GET http://localhost:8788/api/realtime-monitoring/live-activity -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq '.success'

echo "=== Testing Security Incidents (Admin+ Access) ==="
curl -s -X GET http://localhost:8788/api/security-incident/incidents -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.success'

echo "=== Testing User Denial (All Should Fail) ==="
curl -s -X GET http://localhost:8788/api/audit/logs -H "Authorization: Bearer $USER_TOKEN" | jq '.success // false'
```

---

## 🎯 Quick Test Commands

For rapid testing, use these one-liner commands:

```bash
# Quick login and test
curl -s -X POST http://localhost:8788/api/auth/login -H "Content-Type: application/json" -d '{"email":"test-admin@example.com","password":"password123"}' | jq -r '.data.access_token' | xargs -I {} curl -s -H "Authorization: Bearer {}" http://localhost:8788/api/admin/users | jq .

# Test role boundaries in sequence
for role in user admin superadmin; do echo "=== Testing $role ===" && curl -s -X POST http://localhost:8788/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test-${role}@example.com\",\"password\":\"password123\"}" | jq -r '.data.access_token' | xargs -I {} curl -s -H "Authorization: Bearer {}" http://localhost:8788/api/admin/users | jq .; done
```

This comprehensive guide covers all aspects of RBAC testing for the Hono Auth Worker system. Use these commands to validate the security and functionality of your authentication system.
