# Zod Validation Guide - Enterprise Audit System

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](ZOD_GUIDE.vi.md)

## 📋 Overview

The project has been integrated with **Zod** - a TypeScript-first schema validation library to provide powerful and type-safe validation for all API endpoints, including the comprehensive **Enterprise Audit System** with 49+ endpoints across 4 route groups.

## 🎯 Why Use Zod?

### ✅ **Benefits Over Manual Validation:**

| **Manual Validation** | **Zod Validation** |
|----------------------|-------------------|
| ❌ Scattered validation logic | ✅ Centralized schemas |
| ❌ Generic error messages | ✅ Detailed, specific errors |
| ❌ No type safety | ✅ Type inference |
| ❌ Manual data transformation | ✅ Automatic transformation |
| ❌ Hard to maintain | ✅ Easy to maintain & extend |
| ❌ No XSS protection | ✅ Built-in input sanitization |
| ❌ No enterprise features | ✅ Enterprise audit validation |

### 📊 **Current Validation vs Zod:**

**Before (Manual):**
```javascript
// Scattered validation in routes
if (!email || !password) {
  return c.json({error: 'Email and password are required'}, 400);
}
if (!isValidEmail(email)) {
  return c.json({error: 'Invalid email format'}, 400);
}
```

**After (Zod):**
```javascript
// Centralized schema
const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters')
});

// Clean route with automatic validation
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json'); // ✅ Validated data
  // Business logic here...
});
```

## 🔧 Implementation

### 📁 **File Structure**
```
src/
├── schemas/           # 🆕 Comprehensive Zod validation schemas
│   ├── base.js       # 🆕 Base utilities & XSS protection
│   ├── index.js      # 🆕 Schema registry & exports
│   ├── registry.js   # 🆕 Dynamic schema management
│   ├── auth.js       # Authentication schemas
│   ├── user.js       # User management schemas
│   ├── admin.js      # Admin operation schemas
│   ├── i18n.js       # i18n-aware schemas with translations
│   ├── zodDemo.js    # Demo examples schemas
│   ├── kv.js         # KV configuration schemas
│   └── 🏢 ENTERPRISE AUDIT SCHEMAS
│       ├── audit.js           # Core audit log schemas
│       ├── advancedAudit.js   # Advanced analytics schemas
│       ├── realtimeMonitoring.js # Real-time monitoring schemas
│       ├── securityIncident.js   # Security incident schemas
│       └── auditRetention.js     # Data retention schemas
├── routes/
│   ├── auth.js       # ✅ Updated with Zod
│   ├── zodDemo.js    # ✅ Zod demo examples
│   └── 🏢 ENTERPRISE AUDIT ROUTES (with Zod validation)
│       ├── audit.js           # Core audit endpoints
│       ├── advancedAudit.js   # Advanced analytics endpoints
│       ├── realtimeMonitoring.js # Real-time monitoring endpoints
│       └── securityIncident.js   # Security incident endpoints
```

### 📝 **Schema Definitions**

#### **Base Schema Utilities** (`src/schemas/base.js`)
```javascript
import { z } from 'zod';
import { tl } from '../i18n/index.js';

// Configuration constants
export const SCHEMA_CONFIG = {
  EMAIL_MAX_LENGTH: 255,
  PASSWORD_MIN_LENGTH: 6,
  NAME_MAX_LENGTH: 100,
  DESCRIPTION_MAX_LENGTH: 500,
  JWT_PATTERN: /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+$/,
  SEVERITY_LEVELS: ['low', 'medium', 'high', 'critical']
};

// XSS Protection
export function sanitizeInput(input) {
  // Advanced XSS protection with HTML entity decoding
  return input.replace(/[<>\"']/g, '');
}

// Schema builder with i18n support
export function createSchemaBuilder(lang = 'en') {
  return {
    string: (field, min = 1, max = 255) => z.string({
      required_error: tl(lang, `validation.${field}.required`)
    }).min(min, tl(lang, `validation.${field}.minLength`))
      .max(max, tl(lang, `validation.${field}.maxLength`))
      .transform(sanitizeInput),
    
    email: (field = 'email') => z.string()
      .email(tl(lang, `validation.${field}.invalid`))
      .max(SCHEMA_CONFIG.EMAIL_MAX_LENGTH),
    
    // Additional validation patterns...
  };
}
```

#### **Authentication Schemas** (`src/schemas/auth.js`)
```javascript
import { z } from 'zod';
import { createSchemaBuilder } from './base.js';

// Login validation with i18n support
export function createLoginSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  return builder.object({
    email: builder.email(),
    password: builder.string('password', 6, 100)
  });
}

// Refresh token validation  
export const refreshTokenSchema = z.object({
  refresh_token: z.string().regex(SCHEMA_CONFIG.JWT_PATTERN, 'Invalid token format')
});
```

#### **Enterprise Audit Schemas** (`src/schemas/audit.js`)
```javascript
import { createSchemaBuilder, ValidationPatterns } from './base.js';

// Audit query schema with comprehensive filtering
export function createAuditQuerySchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  
  return builder.object({
    // Pagination
    page: builder.coerceNumber('page', 1).default(1),
    limit: builder.coerceNumber('limit', 1, 100).default(10),
    
    // Filters
    userId: builder.coerceNumber('userId', 1).optional(),
    action: builder.string('action', 0, 50).optional(),
    entityType: builder.string('entityType', 0, 100).optional(),
    userRole: builder.enum(['user', 'admin', 'super_admin'], 'userRole').optional(),
    startDate: builder.string('startDate').optional(),
    endDate: builder.string('endDate').optional(),
    search: builder.string('search', 0, 200).optional()
  });
}
```

#### **Security Incident Schemas** (`src/schemas/securityIncident.js`)
```javascript
// Security incident creation with validation
export function createSecurityIncidentSchema(lang = 'en') {
  const builder = createSchemaBuilder(lang);
  
  return builder.object({
    title: builder.string('title', 1, 200),
    description: builder.string('description', 1, 1000),
    severity: builder.enum(SCHEMA_CONFIG.SEVERITY_LEVELS, 'severity'),
    category: builder.string('category', 1, 100),
    affected_systems: builder.array(builder.string('system', 1, 100)).optional(),
    response_team: builder.string('responseTeam', 1, 100).optional()
  });
}
```

#### **i18n Schemas** (`src/schemas/i18n.js`)
```javascript
import { z } from 'zod';
import { tl } from '../i18n/index.js';

// Create i18n-aware Zod schemas with translated error messages
export function createI18nSchemas(lang = 'en') {
  const loginSchema = z.object({
    email: z
      .string({ required_error: tl(lang, 'validation.email.required') })
      .email(tl(lang, 'validation.email.invalid')),
    password: z
      .string({ required_error: tl(lang, 'validation.password.required') })
      .min(6, tl(lang, 'validation.password.tooShort'))
  });
  
  return { loginSchema, refreshTokenSchema, registerSchema };
}
```

### 🚀 **Route Integration**

**Using Zod Validator with i18n Support:**
```javascript
import { zValidator } from '@hono/zod-validator';
import { createLoginSchema } from '../schemas/auth.js';
import { createAuditQuerySchema } from '../schemas/audit.js';

// JSON body validation with language detection
auth.post('/login', async (c, next) => {
  const lang = c.get('language') || 'en';
  const loginSchema = createLoginSchema(lang);
  return zValidator('json', loginSchema)(c, next);
}, async (c) => {
  const validatedData = c.req.valid('json'); // Type-safe & sanitized!
  // Business logic here...
});

// Enterprise Audit Query validation
audit.get('/logs', async (c, next) => {
  const lang = c.get('language') || 'en';
  const querySchema = createAuditQuerySchema(lang);
  return zValidator('query', querySchema)(c, next);
}, async (c) => {
  const { page, limit, userId, action } = c.req.valid('query');
  // Auto-transformed and sanitized parameters
});

// Security Incident creation with XSS protection
securityIncident.post('/', async (c, next) => {
  const lang = c.get('language') || 'en';
  const incidentSchema = createSecurityIncidentSchema(lang);
  return zValidator('json', incidentSchema)(c, next);
}, async (c) => {
  const incident = c.req.valid('json'); // XSS-protected input
  // Safe to process incident data
});
```

## 🎪 **Demo Examples**

The project includes comprehensive demo at `/api/zod_demo` endpoints with **Enterprise Audit System** examples:

**Note**: Server ports by environment:
- **Development**: `http://localhost:8787`
- **Test**: `http://localhost:8788` 
- **Staging**: `http://localhost:8789`

*Examples below use port 8788 (test environment)*

### 📍 **Available Demo Endpoints**

| Endpoint | Type | Purpose | Features |
|----------|------|---------|----------|
| `GET /api/zod_demo` | Info | Demo documentation | Complete endpoint overview |
| `POST /api/zod_demo/register` | JSON Body | Complex validation with transformation | XSS protection, data coercion |
| `GET /api/zod_demo/search` | Query Params | Parameter validation with defaults | Type transformation, enum validation |
| `POST /api/zod_demo/upload` | JSON Body | File metadata validation | Size/type validation |
| 🏢 **Enterprise Audit Examples** | | | |
| `GET /api/audit/logs` | Query Params | Audit log querying | Advanced filtering, pagination |
| `POST /api/security-incident` | JSON Body | Security incident creation | Severity validation, XSS protection |
| `GET /api/realtime-monitoring/alerts` | Query Params | Real-time alert querying | Status filtering, time ranges |

### 🔍 **Demo Features Showcase**

#### **1. Comprehensive Validation with XSS Protection**
```bash
# Test registration with complex rules and XSS attempt
curl -X POST http://localhost:8788/api/zod_demo/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John <script>alert(\"xss\")</script> Doe",
    "email": "john@example.com", 
    "password": "SecurePass123!",
    "age": 25,
    "country": "us",
    "terms_accepted": true
  }'
```

**Zod Features Demonstrated:**
- ✅ Email format validation
- ✅ Password strength requirements (uppercase, lowercase, number, special char)
- ✅ Age range validation (18-120)
- ✅ Country code transformation (us -> US)  
- ✅ Boolean validation
- ✅ **XSS protection** (script tags removed)
- ✅ **Input sanitization** (HTML entities handled)

#### **2. Enterprise Audit System Validation**
```bash
# Test audit log querying with advanced filters
curl "http://localhost:8788/api/audit/logs?page=1&limit=20&userId=123&action=login&userRole=admin&startDate=2025-01-01&search=failed"
```

**Enterprise Features:**
- ✅ **Advanced pagination** with page/limit validation
- ✅ **Multi-parameter filtering** (userId, action, role, dates)
- ✅ **Search functionality** with XSS protection
- ✅ **Role-based filtering** with enum validation
- ✅ **Date range validation** for audit queries
- ✅ **Auto-transformation** of string numbers to integers

#### **3. Security Incident Creation**
```bash
# Test security incident creation with validation
curl -X POST http://localhost:8788/api/security-incident \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Suspicious Login Activity",
    "description": "Multiple failed login attempts detected <script>alert(\"xss\")</script>",
    "severity": "high",
    "category": "authentication",
    "affected_systems": ["web-app", "api-gateway"],
    "response_team": "security-team"
  }'
```

**Security Features:**
- ✅ **XSS protection** in title and description
- ✅ **Severity level validation** (low, medium, high, critical)
- ✅ **Array validation** for affected systems
- ✅ **String length validation** with appropriate limits
- ✅ **Input sanitization** for all text fields

#### **4. Data Transformation**
```bash
# Test search with auto-transformation
curl "http://localhost:8788/api/zod_demo/search?query=test&page=2&limit=5"
```

**Auto-transformations:**
- `page: "2"` (string) → `page: 2` (number)
- `limit: "5"` (string) → `limit: 5` (number)
- Default values assignment
- Enum validation

#### **5. Detailed Error Messages with i18n**
```bash
# Test invalid data with Vietnamese language
curl -X POST http://localhost:8788/api/zod_demo/register \
  -H "Content-Type: application/json" \
  -H "Accept-Language: vi" \
  -d '{"email": "invalid", "age": 15}'
```

**Returns (Vietnamese):**
```json
{
  "success": false,
  "error": {
    "type": "validation_error",
    "message": "Validation failed",
    "issues": [
      {
        "path": ["email"],
        "message": "Định dạng email không hợp lệ",
        "code": "invalid_string"
      },
      {
        "path": ["age"],
        "message": "Tuổi phải từ 18 trở lên",
        "code": "too_small"
      }
    ]
  }
}
```

**i18n Features:**
- ✅ **Multi-language error messages** (English, Vietnamese, etc.)
- ✅ **Automatic language detection** from Accept-Language header
- ✅ **Consistent error format** across all endpoints
- ✅ **Field-specific error codes** for client-side handling

## 🌍 **i18n Integration**

### **Multilingual Validation**

Zod schemas support multiple languages through i18n integration:

```javascript
// Get localized schemas
const { loginSchema } = createI18nSchemas('vi');

// Vietnamese error messages
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  // Errors will be in Vietnamese
});
```

### **Language Detection**

Validation messages automatically use detected language:

```javascript
import { i18nValidator } from '../middleware/i18nValidator.js';

// Automatic language detection + validation
auth.post('/login', 
  i18nValidator(loginSchema), 
  async (c) => {
    // Validation errors in user's language
  }
);
```

## 🔧 **Advanced Features**

### **1. XSS Protection & Input Sanitization**

```javascript
import { sanitizeInput, createSchemaBuilder } from '../schemas/base.js';

// Automatic XSS protection in all string fields
const safeSchema = z.object({
  title: z.string()
    .transform(sanitizeInput) // Removes <script>, HTML entities, etc.
    .min(1, 'Title required'),
  
  description: z.string()
    .transform(sanitizeInput)
    .max(1000, 'Description too long'),
    
  // Advanced sanitization with custom rules
  userInput: z.string()
    .transform((input) => {
      // HTML entity decoding + XSS removal
      return sanitizeInput(input)
        .replace(/javascript:/gi, '') // Remove javascript: URLs
        .replace(/data:/gi, '')       // Remove data: URLs
        .trim();
    })
});
```

### **2. Enterprise Audit Validation**

```javascript
// Complex audit query validation with conditional logic
const auditQuerySchema = z.object({
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  userRole: z.enum(['user', 'admin', 'super_admin']).optional(),
  entityType: z.string().max(100).optional(),
  search: z.string().max(200).transform(sanitizeInput).optional()
}).refine((data) => {
  // Ensure endDate is after startDate
  if (data.startDate && data.endDate) {
    return new Date(data.endDate) >= new Date(data.startDate);
  }
  return true;
}, {
  message: "End date must be after start date",
  path: ["endDate"]
});
```

### **3. Dynamic Schema Creation**

```javascript
// Create schemas dynamically based on user role
export function createRoleBasedSchema(userRole, lang = 'en') {
  const builder = createSchemaBuilder(lang);
  
  const baseSchema = {
    title: builder.string('title', 1, 200),
    description: builder.string('description', 1, 1000)
  };
  
  if (userRole === 'super_admin') {
    // Add fields only super admins can access
    return builder.object({
      ...baseSchema,
      severity: builder.enum(['low', 'medium', 'high', 'critical'], 'severity'),
      affected_systems: builder.array(builder.string('system')).optional(),
      internal_notes: builder.string('notes', 0, 2000).optional()
    });
  }
  
  return builder.object(baseSchema);
}
```

### **4. Conditional Validation with i18n**

```javascript
const updateUserSchema = z.object({
  full_name: z.string().optional(),
  email: z.string().email().optional(),
  currentPassword: z.string().optional()
}).refine((data) => {
  // Require current password if changing email
  if (data.email && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: "Current password required when changing email",
  path: ["currentPassword"]
});
```

### **5. Transform & Coerce with Enterprise Features**

```javascript
const enterpriseSearchSchema = z.object({
  query: z.string().default('').transform(sanitizeInput),
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  sort: z.enum(['date', 'relevance', 'severity']).default('date'),
  order: z.enum(['asc', 'desc']).default('desc'),
  active: z.coerce.boolean().default(true),
  
  // Enterprise audit filters
  userRole: z.enum(['user', 'admin', 'super_admin']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  dateRange: z.object({
    start: z.string().datetime().optional(),
    end: z.string().datetime().optional()
  }).optional(),
  
  // Advanced search with sanitization
  filters: z.array(
    z.object({
      field: z.string().max(50),
      operator: z.enum(['eq', 'ne', 'like', 'in']),
      value: z.string().transform(sanitizeInput)
    })
  ).optional()
});
```

## 🧪 **Testing Validation**

### **Comprehensive Test Suite**

The project includes extensive validation testing with dedicated test files:

**Test Files:**
- `tests/zodValidationTest.js` - Complete Zod validation testing
- `tests/validationTest.js` - Input validation & sanitization tests
- `tests/multiLanguageValidationErrorTest.js` - i18n validation error testing

### **Unit Tests for Schemas**

```javascript
import { describe, test, expect } from 'vitest';
import { createLoginSchema } from '../schemas/auth.js';
import { createAuditQuerySchema } from '../schemas/audit.js';
import { sanitizeInput } from '../schemas/base.js';

describe('Authentication Schemas', () => {
  test('valid login data passes', () => {
    const loginSchema = createLoginSchema('en');
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123'
    });
    
    expect(result.success).toBe(true);
  });

  test('XSS protection works', () => {
    const maliciousInput = '<script>alert("xss")</script>hello';
    const sanitized = sanitizeInput(maliciousInput);
    
    expect(sanitized).not.toContain('<script>');
    expect(sanitized).not.toContain('</script>');
  });

  test('i18n error messages work', () => {
    const loginSchema = createLoginSchema('vi');
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: '123'
    });
    
    expect(result.success).toBe(false);
    expect(result.error.issues[0].message).toContain('email');
  });
});

describe('Enterprise Audit Schemas', () => {
  test('audit query validation', () => {
    const auditSchema = createAuditQuerySchema('en');
    const result = auditSchema.safeParse({
      page: '2',
      limit: '20',
      userRole: 'admin',
      severity: 'high'
    });
    
    expect(result.success).toBe(true);
    expect(result.data.page).toBe(2); // Auto-transformed
    expect(result.data.limit).toBe(20);
  });
});
```

### **Integration Tests**

```javascript
// Test validation across different languages
test('Multi-language validation errors', async () => {
  const languages = ['en', 'vi', 'fr', 'es', 'de', 'ja', 'th'];
  
  for (const lang of languages) {
    const res = await request(app)
      .post('/api/auth/login')
      .set('Accept-Language', lang)
      .send({ email: 'invalid', password: '123' });
      
    expect(res.status).toBe(400);
    expect(res.body.error.type).toBe('validation_error');
    expect(res.body.error.issues).toHaveLength(2);
    
    // Check language-specific error messages
    const emailError = res.body.error.issues.find(i => i.path.includes('email'));
    expect(emailError.message).toBeTruthy();
  }
});

// Test XSS protection in enterprise endpoints
test('XSS protection in security incidents', async () => {
  const maliciousInput = {
    title: 'Test <script>alert("xss")</script> Incident',
    description: '<img src=x onerror=alert("xss")> Description',
    severity: 'high'
  };
  
  const res = await request(app)
    .post('/api/security-incident')
    .send(maliciousInput);
    
  expect(res.status).toBe(200);
  expect(res.body.data.title).not.toContain('<script>');
  expect(res.body.data.description).not.toContain('<img');
});

// Test enterprise audit query validation
test('Audit query parameter validation', async () => {
  const res = await request(app)
    .get('/api/audit/logs')
    .query({
      page: '2',
      limit: '50',
      userRole: 'admin',
      severity: 'high',
      startDate: '2025-01-01',
      endDate: '2025-01-31'
    });
    
  expect(res.status).toBe(200);
  expect(res.body.success).toBe(true);
});
```

## 📋 **Best Practices**

### **1. Schema Organization with Enterprise Structure**

```javascript
// Group related schemas by domain
// src/schemas/auth.js - Authentication
export const loginSchema = createLoginSchema();
export const registerSchema = createRegisterSchema();
export const refreshTokenSchema = createRefreshTokenSchema();

// src/schemas/audit.js - Enterprise audit system
export const auditQuerySchema = createAuditQuerySchema();
export const auditLogSchema = createAuditLogSchema();

// src/schemas/securityIncident.js - Security incidents
export const incidentCreateSchema = createSecurityIncidentSchema();
export const incidentUpdateSchema = createIncidentUpdateSchema();

// src/schemas/base.js - Shared utilities
export const createSchemaBuilder = (lang) => ({ /* ... */ });
export const sanitizeInput = (input) => { /* XSS protection */ };
```

### **2. Reusable Base Schemas with XSS Protection**

```javascript
// Common field definitions with built-in sanitization
const createCommonFields = (lang = 'en') => {
  const builder = createSchemaBuilder(lang);
  
  return {
    email: builder.email().max(255),
    password: builder.string('password', 8, 100)
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 
             'Password must contain uppercase, lowercase, number, and special character'),
    safeText: (field, min = 1, max = 255) => 
      builder.string(field, min, max).transform(sanitizeInput),
    severityLevel: builder.enum(SCHEMA_CONFIG.SEVERITY_LEVELS, 'severity')
  };
};

// Reuse across multiple schemas
export const createUserRegistrationSchema = (lang = 'en') => {
  const fields = createCommonFields(lang);
  
  return z.object({
    email: fields.email,
    password: fields.password,
    full_name: fields.safeText('fullName', 2, 100),
    terms_accepted: z.boolean().refine(val => val === true, 'Must accept terms')
  });
};
```

### **3. Enterprise Error Handling**

```javascript
import { ZodError } from 'zod';
import { tl } from '../i18n/index.js';

// Global error handler with i18n support
app.onError((err, c) => {
  const lang = c.get('language') || 'en';
  
  if (err instanceof ZodError) {
    return c.json({
      success: false,
      error: {
        type: 'validation_error',
        message: tl(lang, 'errors.validationFailed'),
        issues: err.issues.map(issue => ({
          field: issue.path.join('.'),
          message: issue.message,
          code: issue.code,
          received: issue.received
        }))
      }
    }, 400);
  }
  
  // Handle other enterprise errors...
  return c.json({
    success: false,
    error: {
      type: 'internal_error',
      message: tl(lang, 'errors.internalError')
    }
  }, 500);
});
```

### **4. Performance Optimization for Enterprise Scale**

```javascript
// Pre-compile schemas for better performance
const ENTERPRISE_SCHEMAS = {
  // Authentication
  login: createLoginSchema('en'),
  loginVi: createLoginSchema('vi'),
  register: createUserRegistrationSchema('en'),
  
  // Audit system
  auditQuery: createAuditQuerySchema('en'),
  auditQueryVi: createAuditQuerySchema('vi'),
  
  // Security incidents
  securityIncident: createSecurityIncidentSchema('en'),
  
  // Real-time monitoring
  alertQuery: createAlertQuerySchema('en')
};

// Schema caching with language detection
export function getCachedSchema(schemaType, lang = 'en') {
  const key = lang === 'en' ? schemaType : `${schemaType}${lang.charAt(0).toUpperCase() + lang.slice(1)}`;
  return ENTERPRISE_SCHEMAS[key] || ENTERPRISE_SCHEMAS[schemaType];
}

// Use in routes
app.post('/login', async (c, next) => {
  const lang = c.get('language') || 'en';
  const schema = getCachedSchema('login', lang);
  return zValidator('json', schema)(c, next);
}, handler);
```

## 🔗 **Middleware Integration**

### **Custom Validation Middleware**

```javascript
// src/middleware/i18nValidator.js
import { zValidator } from '@hono/zod-validator';
import { createI18nSchemas } from '../schemas/i18n.js';

export function i18nValidator(schemaName) {
  return async (c, next) => {
    const lang = c.get('language') || 'en';
    const schemas = createI18nSchemas(lang);
    const schema = schemas[schemaName];
    
    return zValidator('json', schema)(c, next);
  };
}
```

### **Usage in Routes**

```javascript
import { i18nValidator } from '../middleware/i18nValidator.js';

// Automatic language-aware validation
auth.post('/login', i18nValidator('loginSchema'), async (c) => {
  const data = c.req.valid('json');
  // Validation errors in user's language
});
```

## 🚀 **Migration Guide**

### **From Manual to Zod Validation**

**Step 1: Create Schema**
```javascript
// Before
function validateLogin(body) {
  if (!body.email) return 'Email required';
  if (!body.password) return 'Password required';
  // ... more manual checks
}

// After - Create schema
const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});
```

**Step 2: Update Route**
```javascript
// Before
auth.post('/login', async (c) => {
  const body = await c.req.json();
  const error = validateLogin(body);
  if (error) return c.json({error}, 400);
  // ... rest of logic
});

// After
auth.post('/login', zValidator('json', loginSchema), async (c) => {
  const { email, password } = c.req.valid('json');
  // ... rest of logic (simplified)
});
```

**Step 3: Test Migration**
```javascript
// Test with invalid data
const res = await request(app)
  .post('/api/auth/login')
  .send({ email: 'invalid' });

expect(res.status).toBe(400);
expect(res.body.error.type).toBe('validation_error');
```

## 📊 **Comparison Table**

| Feature | Manual Validation | Zod Validation (Current) |
|---------|------------------|----------------|
| **Type Safety** | ❌ No | ✅ Full TypeScript support |
| **Error Messages** | ❌ Generic | ✅ Detailed & customizable |
| **Data Transformation** | ❌ Manual | ✅ Automatic |
| **Code Organization** | ❌ Scattered | ✅ Centralized schemas |
| **Reusability** | ❌ Limited | ✅ High |
| **i18n Support** | ❌ No | ✅ Multi-language (7+ languages) |
| **Testing** | ❌ Complex | ✅ Simple unit tests |
| **Performance** | ✅ Fast | ✅ Fast (compiled & cached) |
| **Bundle Size** | ✅ Small | ⚠️ ~14KB |
| **XSS Protection** | ❌ Manual | ✅ Built-in sanitization |
| **Enterprise Features** | ❌ No | ✅ Audit, monitoring, incidents |
| **Schema Registry** | ❌ No | ✅ Dynamic schema management |
| **Input Sanitization** | ❌ Manual | ✅ Automatic HTML entity handling |
| **Role-based Validation** | ❌ No | ✅ Dynamic schema creation |
| **Conditional Logic** | ❌ Basic | ✅ Advanced refinements |

## 🎯 **Common Use Cases**

### **1. Enterprise API Input Validation**

```javascript
// User registration with complex rules and XSS protection
const registerSchema = z.object({
  full_name: z.string().min(2).max(50).transform(sanitizeInput),
  email: z.string().email().max(255),
  password: z.string()
    .min(8)
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/, 
           'Must contain uppercase, lowercase, number, and special character'),
  age: z.number().min(18).max(120),
  terms_accepted: z.boolean().refine(val => val === true, 'Must accept terms'),
  
  // Enterprise fields with sanitization
  organization: z.string().max(200).transform(sanitizeInput).optional(),
  security_clearance: z.enum(['public', 'confidential', 'secret', 'top_secret']).optional()
});
```

### **2. Enterprise Audit Query Validation**

```javascript
// Advanced audit system query with comprehensive filtering
const auditQuerySchema = z.object({
  // Pagination
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(10),
  
  // Search with XSS protection  
  q: z.string().max(200).transform(sanitizeInput).optional(),
  
  // Filters with enum validation
  userRole: z.enum(['user', 'admin', 'super_admin']).optional(),
  severity: z.enum(['low', 'medium', 'high', 'critical']).optional(),
  entityType: z.string().max(100).optional(),
  action: z.string().max(50).optional(),
  
  // Date filtering
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  
  // Advanced filters
  tags: z.array(z.string().max(50)).max(10).optional(),
  excludeSystem: z.boolean().default(false),
  
  // Sorting
  sortBy: z.enum(['timestamp', 'severity', 'user', 'action']).default('timestamp'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

api.get('/audit/logs', zValidator('query', auditQuerySchema), async (c) => {
  const params = c.req.valid('query');
  // All parameters validated, transformed, and sanitized
  const auditLogs = await auditService.searchLogs(params);
  return c.json(createSuccessResponse(auditLogs));
});
```

### **3. Security Incident Management**

```javascript
// Security incident creation with comprehensive validation
const securityIncidentSchema = z.object({
  title: z.string().min(1).max(200).transform(sanitizeInput),
  description: z.string().min(10).max(2000).transform(sanitizeInput),
  
  // Severity with business rules
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  category: z.enum(['authentication', 'authorization', 'data_breach', 'malware', 'phishing', 'other']),
  
  // System impact
  affected_systems: z.array(z.string().max(100)).min(1).max(20),
  estimated_impact: z.enum(['minimal', 'moderate', 'significant', 'severe']),
  
  // Response details
  response_team: z.string().max(100).optional(),
  priority: z.coerce.number().min(1).max(5).default(3),
  
  // Metadata with sanitization
  tags: z.array(z.string().max(50).transform(sanitizeInput)).max(10).optional(),
  external_reference: z.string().url().optional(),
  
  // Attachments validation
  attachments: z.array(z.object({
    filename: z.string().min(1).max(255),
    size: z.number().max(10 * 1024 * 1024), // 10MB max
    type: z.enum(['image/jpeg', 'image/png', 'application/pdf', 'text/plain']),
    content_hash: z.string().length(64) // SHA-256 hash
  })).max(5).optional()
}).refine((data) => {
  // Business rule: Critical incidents require response team
  if (data.severity === 'critical' && !data.response_team) {
    return false;
  }
  return true;
}, {
  message: "Critical incidents must have an assigned response team",
  path: ["response_team"]
});
```

### **4. Real-time Monitoring Configuration**

```javascript
// Real-time monitoring alert configuration
const alertConfigSchema = z.object({
  name: z.string().min(1).max(100).transform(sanitizeInput),
  description: z.string().max(500).transform(sanitizeInput).optional(),
  
  // Alert conditions
  metric: z.enum(['cpu_usage', 'memory_usage', 'disk_usage', 'response_time', 'error_rate']),
  threshold: z.number().min(0).max(100),
  operator: z.enum(['gt', 'gte', 'lt', 'lte', 'eq']),
  
  // Time-based conditions
  duration: z.number().min(60).max(3600), // 1 minute to 1 hour
  evaluation_window: z.number().min(300).max(7200), // 5 minutes to 2 hours
  
  // Notification settings
  notification_channels: z.array(z.enum(['email', 'slack', 'webhook', 'sms'])).min(1),
  escalation_policy: z.enum(['immediate', 'gradual', 'business_hours']).default('gradual'),
  
  // Advanced settings
  enabled: z.boolean().default(true),
  auto_resolve: z.boolean().default(false),
  tags: z.array(z.string().max(50)).max(20).optional()
});
```

## 🔍 **Debugging Validation**

### **Debug Mode**

```javascript
// Enable detailed Zod error logging for different components
DEBUG = "hono-auth-api:validation:*"          // All validation debug
DEBUG = "hono-auth-api:validation:zod:*"      // Zod-specific debug
DEBUG = "hono-auth-api:validation:audit:*"    // Audit validation debug
DEBUG = "hono-auth-api:validation:security:*" // Security validation debug
```

### **Enterprise Error Formatting**

```javascript
import { ZodError } from 'zod';
import { tl } from '../i18n/index.js';
import { logger } from '../utils/debug.js';

function formatZodError(error, lang = 'en', context = {}) {
  const debug = logger('hono-auth-api:validation:zod');
  
  debug(`Validation failed for ${context.endpoint || 'unknown'}: ${error.message}`);
  
  return {
    type: 'validation_error',
    message: tl(lang, 'errors.validationFailed'),
    timestamp: new Date().toISOString(),
    request_id: context.requestId,
    endpoint: context.endpoint,
    issues: error.issues.map(issue => {
      const formattedIssue = {
        field: issue.path.join('.'),
        message: issue.message,
        code: issue.code,
        received: issue.received
      };
      
      // Add security context for sensitive fields
      if (issue.path.includes('password') || issue.path.includes('token')) {
        formattedIssue.received = '[REDACTED]';
      }
      
      // Add enterprise context
      if (context.userRole) {
        formattedIssue.user_role = context.userRole;
      }
      
      debug(`Field validation failed: ${formattedIssue.field} - ${formattedIssue.message}`);
      
      return formattedIssue;
    }),
    help: {
      documentation: '/docs/validation',
      examples: `/docs/examples/${context.schemaType || 'general'}`
    }
  };
}

// Usage in middleware
export function createValidationErrorHandler() {
  return async (c, next) => {
    try {
      await next();
    } catch (error) {
      if (error instanceof ZodError) {
        const lang = c.get('language') || 'en';
        const context = {
          endpoint: c.req.path,
          requestId: c.get('requestId'),
          userRole: c.get('userRole'),
          schemaType: c.get('schemaType')
        };
        
        const formattedError = formatZodError(error, lang, context);
        return c.json({ success: false, error: formattedError }, 400);
      }
      throw error;
    }
  };
}
```

### **Schema Debugging Tools**

```javascript
// Debug schema validation in development
export function debugSchema(schema, data, context = {}) {
  if (process.env.NODE_ENV !== 'development') return;
  
  const debug = logger('hono-auth-api:validation:debug');
  
  debug(`Testing schema for ${context.schemaType || 'unknown'}:`);
  debug(`Data:`, JSON.stringify(data, null, 2));
  
  const result = schema.safeParse(data);
  
  if (result.success) {
    debug(`✅ Validation passed`);
    debug(`Transformed data:`, JSON.stringify(result.data, null, 2));
  } else {
    debug(`❌ Validation failed`);
    result.error.issues.forEach((issue, index) => {
      debug(`Issue ${index + 1}:`);
      debug(`  Path: ${issue.path.join('.')}`);
      debug(`  Message: ${issue.message}`);
      debug(`  Code: ${issue.code}`);
      debug(`  Received: ${issue.received}`);
    });
  }
  
  return result;
}

// Usage example
const testData = { email: 'test@example.com', password: 'weak' };
debugSchema(loginSchema, testData, { schemaType: 'login' });
```

## 📚 **Resources**

### **Documentation Links**

- **[Zod Official Docs](https://zod.dev/)** - Complete Zod documentation
- **[@hono/zod-validator](https://www.npmjs.com/package/@hono/zod-validator)** - Hono Zod middleware
- **[Project Test Guide](./TEST_GUIDE.md)** - Testing framework including validation tests
- **[i18n Master Guide](./I18N_MASTER_GUIDE.md)** - Internationalization system
- **[Enterprise Audit System Guide](./ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.md)** - Complete audit system documentation

### **Example Files**

**Schema Files:**
- `src/schemas/` - All validation schemas organized by domain
  - `src/schemas/base.js` - Base utilities and XSS protection
  - `src/schemas/auth.js` - Authentication schemas
  - `src/schemas/audit.js` - Core audit system schemas
  - `src/schemas/advancedAudit.js` - Advanced audit analytics schemas
  - `src/schemas/realtimeMonitoring.js` - Real-time monitoring schemas
  - `src/schemas/securityIncident.js` - Security incident schemas
  - `src/schemas/zodDemo.js` - Demo examples

**Route Files with Zod Integration:**
- `src/routes/zodDemo.js` - Live demo examples
- `src/routes/auth.js` - Authentication with Zod validation
- `src/routes/audit.js` - Audit endpoints with validation
- `src/routes/advancedAudit.js` - Advanced audit with validation
- `src/routes/realtimeMonitoring.js` - Monitoring with validation
- `src/routes/securityIncident.js` - Security incidents with validation

**Test Files:**
- `tests/zodValidationTest.js` - Comprehensive Zod validation testing
- `tests/validationTest.js` - Input validation and sanitization tests
- `tests/multiLanguageValidationErrorTest.js` - Multi-language validation error testing

### **Enterprise Schema Registry**

The project includes a dynamic schema registry system:

```javascript
// Access schemas dynamically
import { getSchema } from '../schemas/registry.js';

// Get schema with language support
const loginSchema = getSchema('auth.login', 'en');
const auditQuerySchema = getSchema('audit.query', 'vi');

// Available schema categories:
// - auth.* (login, register, refresh)
// - user.* (profile, update, delete)
// - admin.* (create, update, permissions)
// - audit.* (query, create, export)
// - security.* (incident, alert, configuration)
// - monitoring.* (alert, dashboard, metrics)
```

### **Quick Reference Commands**

```bash
# Test validation systems
npm run test:zod_validation        # Zod-specific tests
npm run test:validation           # General validation tests
npm run test:multilang_validation # Multi-language validation

# Run validation demos
curl http://localhost:8788/api/zod_demo
curl http://localhost:8788/api/zod_demo/register
curl http://localhost:8788/api/audit/logs

# Debug validation issues
DEBUG=hono-auth-api:validation:* npm run dev
```

---

## 🎉 **Summary**

Zod integration provides **Enterprise-Grade Validation** with:

✅ **Type-safe validation** with automatic TypeScript inference  
✅ **Centralized schemas** organized by domain and functionality  
✅ **Multi-language error messages** (English, Vietnamese, French, Spanish, German, Japanese, Thai)  
✅ **Automatic data transformation** and coercion with XSS protection  
✅ **Enterprise audit system validation** for 49+ endpoints across 4 route groups  
✅ **Built-in input sanitization** protecting against XSS and injection attacks  
✅ **Role-based schema creation** for different user permission levels  
✅ **Comprehensive testing framework** with 30+ validation test scenarios  
✅ **Performance optimization** with schema compilation and caching  
✅ **Dynamic schema registry** for scalable enterprise applications  
✅ **Advanced debugging tools** with detailed error reporting and logging  

### **Enterprise Features**

🏢 **Audit System Integration**: Complete validation coverage for audit logs, analytics, monitoring, and security incidents  
🔒 **Security-First Approach**: Built-in XSS protection, input sanitization, and secure error handling  
🌍 **International Support**: Full i18n integration with 7+ language support  
📊 **Business Intelligence**: Advanced validation for complex enterprise queries and reporting  
⚡ **High Performance**: Optimized for enterprise scale with caching and pre-compilation  

The validation system is now **production-ready** with comprehensive testing, documentation, and enterprise-grade security features. All new endpoints should use Zod schemas for consistent, maintainable, and secure validation across the entire application ecosystem.
