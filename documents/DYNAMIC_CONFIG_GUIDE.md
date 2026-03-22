# Dynamic Configuration Management Guide

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](DYNAMIC_CONFIG_GUIDE.vi.md)

> **Comprehensive documentation for the Dynamic Configuration Management System**
> 
> 📅 **Last Updated**: August 1, 2025

## Overview

This guide covers the **Dynamic Configuration Management System** implemented in the Hono Auth Worker project. This system eliminates the need to pass configuration parameters through service layers by providing centralized, cached configuration access with enterprise-grade features.

This guide focuses on configuration model, helper APIs, and integration patterns. For test commands and operational runners, use [TEST_GUIDE.md](./TEST_GUIDE.md) and [TEST_SCRIPTS.md](./TEST_SCRIPTS.md). For role-restricted KV Admin endpoint workflows, use [ROLE_COMPLETE_GUIDE.md](./ROLE_COMPLETE_GUIDE.md).

## 🎯 Key Benefits

- **🔧 Centralized Management**: All configuration handled through `src/utils/dynamicConfig.js`
- **🚀 Simplified APIs**: No need to pass configuration parameters through service calls
- **⚙️ Automatic Detection**: Services automatically retrieve configuration from environment
- **🔄 Smart Fallback**: KV Store → Environment Variables → Default Values
- **🛡️ Type Safety**: Built-in validation and type conversion with specialized getters
- **⚡ Performance**: Cached configuration access through BaseService
- **🏢 Enterprise Features**: Maintenance mode, rate limiting, security settings
- **🌍 Environment Awareness**: Production, development, test, staging detection
- **📊 Advanced Settings**: Metrics, performance thresholds, pagination controls
- **🔐 Security Controls**: BCrypt settings, CORS configuration, response logging

## 📁 File Structure

```
src/
├── utils/
│   └── dynamicConfig.js        # Main configuration utilities
├── services/
│   ├── baseService.js          # Base service with config caching
│   ├── authService.js          # Uses dynamic JWT & feature configs
│   ├── userService.js          # Uses feature flags
│   └── databaseService.js      # Uses performance configs
├── constants/
│   └── kvKeys.js              # Configuration keys & defaults
└── middleware/
    └── auth.js                # Uses dynamic JWT settings
```

## 🔑 Configuration Functions

### Core Functions

#### `getDynamicConfig(env, key, defaultValue, preferKV)`
Base function for retrieving any configuration value with smart fallback logic.

```javascript
import { getDynamicConfig } from '../utils/dynamicConfig.js';

// Get any config value with fallback
const value = await getDynamicConfig(env, 'MY_CONFIG_KEY', 'default_value');

// Prefer environment over KV
const envValue = await getDynamicConfig(env, 'MY_CONFIG_KEY', 'default', false);
```

### Type-Safe Configuration Functions

#### `getBooleanConfig(env, key, defaultValue)`
Get boolean configuration with automatic type conversion.

```javascript
import { getBooleanConfig } from '../utils/dynamicConfig.js';

const isEnabled = await getBooleanConfig(env, 'FEATURE_ENABLED', false);
// Returns: true/false with automatic parsing from 'true'/'false' strings
```

#### `getNumberConfig(env, key, defaultValue, min, max)`
Get numeric configuration with validation bounds.

```javascript
import { getNumberConfig } from '../utils/dynamicConfig.js';

const timeout = await getNumberConfig(env, 'REQUEST_TIMEOUT', 5000, 1000, 30000);
// Returns: number within min/max bounds
```

#### `getStringConfig(env, key, defaultValue, maxLength)`
Get string configuration with length validation.

```javascript
import { getStringConfig } from '../utils/dynamicConfig.js';

const apiKey = await getStringConfig(env, 'API_KEY', '', 256);
// Returns: string with optional max length enforcement
```

### Specialized Configuration Functions

#### `getJwtSettings(env)`
Returns JWT configuration including secret and token expiration settings.

```javascript
import { getJwtSettings } from '../utils/dynamicConfig.js';

const jwtSettings = await getJwtSettings(env);
// Returns: {
//   secret: "jwt-secret-string",
//   accessTokenExpires: 3600,
//   refreshTokenExpires: 259200
// }
```

#### `getFeatureFlags(env)`
Returns feature flags for development and runtime control.

```javascript
import { getFeatureFlags } from '../utils/dynamicConfig.js';

const featureFlags = await getFeatureFlags(env);
// Returns: {
//   disableRateLimiting: false,
//   enableDetailedErrors: false,
//   autoActivateUserOnRegister: false, // If true: skips activation email and auto-activates user
//   logSqlQueries: false,
//   enableAuditLogCompression: true,
//   enableRealtimeNotifications: false,
//   enableAdvancedMetrics: false
// }
```

#### `getAppSettings(env)`
Returns application-level settings and version information.

```javascript
import { getAppSettings } from '../utils/dynamicConfig.js';

const appSettings = await getAppSettings(env);
// Returns: {
//   name: "Hono Auth Worker",
//   version: "1.0.0",
//   environment: "development"
// }
```

#### `getRateLimitSettings(env)`
Returns rate limiting configuration.

```javascript
import { getRateLimitSettings } from '../utils/dynamicConfig.js';

const rateLimits = await getRateLimitSettings(env);
// Returns: {
//   maxRequests: 100,
//   windowMs: 900000,  // 15 minutes
//   enableRateLimit: true
// }
```

#### `getPerformanceSettings(env)`
Returns performance monitoring thresholds.

```javascript
import { getPerformanceSettings } from '../utils/dynamicConfig.js';

const performance = await getPerformanceSettings(env);
// Returns: {
//   goodThreshold: 200,
//   warningThreshold: 500,
//   criticalThreshold: 1000
// }
```

#### `getPaginationSettings(env)`
Returns pagination configuration limits.

```javascript
import { getPaginationSettings } from '../utils/dynamicConfig.js';

const pagination = await getPaginationSettings(env);
// Returns: {
//   defaultPageSize: 10,
//   maxPageSize: 100,
//   allowUnlimitedPageSize: false
// }
```

#### `getBcryptSettings(env)`
Returns BCrypt hashing configuration.

```javascript
import { getBcryptSettings } from '../utils/dynamicConfig.js';

const bcrypt = await getBcryptSettings(env);
// Returns: {
//   saltRounds: 12,
//   maxPasswordLength: 128
// }
```

#### `getSecuritySettings(env)`
Returns comprehensive security configuration.

```javascript
import { getSecuritySettings } from '../utils/dynamicConfig.js';

const security = await getSecuritySettings(env);
// Returns: {
//   highRiskThreshold: 10,
//   performanceGoodThreshold: 1000
// }
```

#### `getSecurityHeadersSettings(env)`
Returns Security Headers configuration for XSS, clickjacking, and other security attack protection.

```javascript
import { getSecurityHeadersSettings } from '../utils/dynamicConfig.js';

const securityHeaders = await getSecurityHeadersSettings(env);
// Returns: {
//   headers: {
//     'X-Content-Type-Options': 'nosniff',
//     'X-Frame-Options': 'DENY',
//     'X-XSS-Protection': '1; mode=block',
//     'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; ...",
//     'Referrer-Policy': 'strict-origin-when-cross-origin',
//     'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), ...',
//     'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' // production only
//   }
// }
```

#### `getCorsSettings(env)`
Returns CORS configuration for cross-origin requests.

```javascript
import { getCorsSettings } from '../utils/dynamicConfig.js';

const cors = await getCorsSettings(env);
// Returns: {
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   maxAge: 86400
// }
```

#### `getMetricsSettings(env)`
Returns metrics and monitoring configuration.

```javascript
import { getMetricsSettings } from '../utils/dynamicConfig.js';

const metrics = await getMetricsSettings(env);
// Returns: {
//   enableMetrics: true,
//   metricsEndpoint: "/metrics",
//   collectDetailedMetrics: false,
//   metricsRetentionDays: 30
// }
```

### Environment Detection Functions

#### `isProduction(env)` / `isDevelopment(env)` / `isTest(env)` / `isStaging(env)`
Environment detection utilities.

```javascript
import { 
  isProduction, 
  isDevelopment, 
  isTest, 
  isStaging 
} from '../utils/dynamicConfig.js';

if (await isProduction(env)) {
  // Production-specific logic
}

if (await isDevelopment(env)) {
  // Development-specific features
}
```

#### `isMaintenanceMode(env)`
Check if the application is in maintenance mode.

```javascript
import { isMaintenanceMode } from '../utils/dynamicConfig.js';

const maintenance = await isMaintenanceMode(env);
if (maintenance) {
  return c.json({ message: 'System under maintenance' }, 503);
}
```

#### `getResponseLogSettings(env)`
Returns response logging configuration for debugging.

```javascript
import { getResponseLogSettings } from '../utils/dynamicConfig.js';

const logSettings = await getResponseLogSettings(env);
// Returns: {
//   enableResponseBodyCapture: false,
//   maxResponseBodySize: 1024,
//   logLevel: "info"
// }
```

## 🚀 Migration Examples

### Before: Manual Parameter Passing

**Old AuthService Usage:**
```javascript
// routes/auth.js (OLD WAY)
import { getJwtSecret } from '../utils/jwt.js';
import { getFeatureFlags } from '../utils/dynamicConfig.js';

auth.post('/login', async (c) => {
  const { email, password } = c.req.valid('json');
  const ipAddress = getClientIP(c);
  
  // Manual configuration retrieval
  const jwtSecret = await getJwtSecret(c.env);
  const featureFlags = await getFeatureFlags(c.env);
  const isRateLimitDisabled = featureFlags.disableRateLimiting;

  const authService = createAuthService(c.env);
  
  // Multiple parameters passed
  const result = await authService.login(
    email, 
    password, 
    ipAddress, 
    jwtSecret, 
    isRateLimitDisabled
  );
  
  // ... handle result
});
```

**Old AuthService Implementation:**
```javascript
// services/authService.js (OLD WAY)
export class AuthService {
  async login(email, password, ipAddress, jwtSecret, isRateLimitDisabled = false) {
    // Manual parameter handling
    if (!isRateLimitDisabled) {
      // Rate limiting logic using passed parameter
    }
    
    // JWT token generation using passed secret
    const tokens = await this.generateTokens(user, jwtSecret);
  }
  
  async generateTokens(user, jwtSecret) {
    // Using passed JWT secret
    const accessToken = await signToken(tokenPayload, jwtSecret);
    const refreshToken = await signToken(refreshTokenPayload, jwtSecret);
  }
}
```

### After: Dynamic Configuration

**New AuthService Usage:**
```javascript
// routes/auth.js (NEW WAY)
auth.post('/login', async (c) => {
  const { email, password } = c.req.valid('json');
  const ipAddress = getClientIP(c);

  const authService = createAuthService(c.env);
  
  // Clean, simple API - configuration handled internally
  const result = await authService.login(email, password, ipAddress);
  
  // ... handle result
});
```

**New AuthService Implementation:**
```javascript
// services/authService.js (NEW WAY)
import { getJwtSettings, getFeatureFlags } from '../utils/dynamicConfig.js';

export class AuthService extends BaseService {
  constructor(env) {
    super(env, 'AuthService');
  }

  async login(email, password, ipAddress) {
    // Automatic configuration retrieval
    const featureFlags = await getFeatureFlags(this.env);
    const jwtSettings = await getJwtSettings(this.env);
    
    // Use configuration directly
    const isRateLimitDisabled = featureFlags.disableRateLimiting;
    
    if (!isRateLimitDisabled) {
      // Rate limiting logic using dynamic config
    }
    
    // JWT token generation using dynamic config
    const tokens = await this.generateTokens(user);
  }
  
  async generateTokens(user) {
    // Get JWT settings internally
    const jwtSettings = await getJwtSettings(this.env);
    
    const accessToken = await signToken(tokenPayload, jwtSettings.secret);
    const refreshToken = await signToken(refreshTokenPayload, jwtSettings.secret);
  }
}
```

## 📋 Supported Configuration Keys

### JWT Settings
- `JWT_SECRET` - JWT signing secret
- `JWT_ACCESS_TOKEN_EXPIRES` - Access token expiration (seconds) [Default: 3600]
- `JWT_REFRESH_TOKEN_EXPIRES` - Refresh token expiration (seconds) [Default: 259200]

### Feature Flags
- `RATE_LIMIT_DISABLED` - Disable rate limiting [Default: false]
- `ENABLE_DETAILED_ERRORS` - Show detailed error messages [Default: false]
- `AUTO_ACTIVATE_USER_ON_REGISTER` - Auto-activate new users [Default: false]
- `LOG_SQL_QUERIES` - Enable SQL query logging [Default: false]
- `ENABLE_AUDIT_LOG_COMPRESSION` - Compress audit logs [Default: true]
- `ENABLE_REALTIME_NOTIFICATIONS` - Enable real-time notifications [Default: false]
- `ENABLE_ADVANCED_METRICS` - Enable advanced metrics collection [Default: false]

### Application Settings
- `APP_NAME` - Application name [Default: "Hono Auth Worker"]
- `APP_VERSION` - Application version [Default: "1.0.0"]
- `ENVIRONMENT` - Application environment [Default: "development"]

### Rate Limiting Settings
- `RATE_LIMIT_MAX_REQUESTS` - Maximum requests per window [Default: 100]
- `RATE_LIMIT_WINDOW_MS` - Rate limit window in milliseconds [Default: 900000]
- `ENABLE_RATE_LIMIT` - Enable rate limiting globally [Default: true]

### Performance Settings
- `PERFORMANCE_GOOD_THRESHOLD` - Good performance threshold (ms) [Default: 200]
- `PERFORMANCE_WARNING_THRESHOLD` - Warning threshold (ms) [Default: 500]
- `PERFORMANCE_CRITICAL_THRESHOLD` - Critical threshold (ms) [Default: 1000]

### Pagination Settings
- `DEFAULT_PAGE_SIZE` - Default pagination size [Default: 10]
- `MAX_PAGE_SIZE` - Maximum pagination size [Default: 100]
- `ALLOW_UNLIMITED_PAGE_SIZE` - Allow unlimited page size [Default: false]

### Security Settings
- `SECURITY_HIGH_RISK_THRESHOLD` - High risk action threshold [Default: 10]
- `PERFORMANCE_GOOD_THRESHOLD` - Good performance threshold (ms) [Default: 1000]

#### Security Headers Configuration
- `SECURITY_X_CONTENT_TYPE_OPTIONS` - Prevent MIME type sniffing [Default: "nosniff"]
- `SECURITY_X_FRAME_OPTIONS` - Prevent clickjacking [Default: "DENY"]
- `SECURITY_X_XSS_PROTECTION` - XSS protection [Default: "1; mode=block"]
- `SECURITY_CSP` - Content Security Policy [Default: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."]
- `SECURITY_REFERRER_POLICY` - Referrer policy [Default: "strict-origin-when-cross-origin"]
- `SECURITY_PERMISSIONS_POLICY` - Permissions policy [Default: "camera=(), microphone=(), geolocation=(), ..."]
- `SECURITY_HSTS` - HTTP Strict Transport Security (production only) [Default: "max-age=31536000; includeSubDomains; preload"]

### BCrypt Settings
- `BCRYPT_SALT_ROUNDS` - BCrypt salt rounds [Default: 12]
- `MAX_PASSWORD_LENGTH` - Maximum password length [Default: 128]

### CORS Settings
- `CORS_ORIGIN` - CORS origin settings [Default: "*"]
- `CORS_METHODS` - Allowed HTTP methods [Default: "GET,POST,PUT,DELETE"]
- `CORS_ALLOWED_HEADERS` - Allowed headers [Default: "Content-Type,Authorization"]
- `CORS_MAX_AGE` - CORS preflight cache time (seconds) [Default: 86400]

### Metrics Settings
- `ENABLE_METRICS` - Enable metrics collection [Default: true]
- `METRICS_ENDPOINT` - Metrics endpoint path [Default: "/metrics"]
- `COLLECT_DETAILED_METRICS` - Collect detailed metrics [Default: false]
- `METRICS_RETENTION_DAYS` - Metrics retention period [Default: 30]

### System Settings
- `MAINTENANCE_MODE` - Enable maintenance mode [Default: false]
- `ENABLE_RESPONSE_BODY_CAPTURE` - Enable response body logging [Default: false]
- `MAX_RESPONSE_BODY_SIZE` - Max response body size for logging [Default: 1024]
- `LOG_LEVEL` - Application log level [Default: "info"]

## 🏗️ BaseService Integration

All services inherit from `BaseService` which provides cached configuration access and enterprise-grade features:

```javascript
// services/baseService.js
export class BaseService {
  constructor(env, serviceName) {
    this.env = env;
    this.serviceName = serviceName;
    this.configCache = new Map();
  }
  
  // Cached configuration access methods
  async getFeatureFlags() {
    return await this._getCachedConfig('featureFlags', () => getFeatureFlags(this.env));
  }
  
  async getJwtSettings() {
    return await this._getCachedConfig('jwtSettings', () => getJwtSettings(this.env));
  }
  
  async getRateLimitSettings() {
    return await this._getCachedConfig('rateLimitSettings', () => getRateLimitSettings(this.env));
  }
  
  async getSecuritySettings() {
    return await this._getCachedConfig('securitySettings', () => getSecuritySettings(this.env));
  }
  
  async getPerformanceSettings() {
    return await this._getCachedConfig('performanceSettings', () => getPerformanceSettings(this.env));
  }
  
  async getPaginationSettings() {
    return await this._getCachedConfig('paginationSettings', () => getPaginationSettings(this.env));
  }
  
  // Environment detection (cached)
  async isProduction() {
    return await this._getCachedConfig('isProduction', () => isProduction(this.env));
  }
  
  async isDevelopment() {
    return await this._getCachedConfig('isDevelopment', () => isDevelopment(this.env));
  }
  
  async isMaintenanceMode() {
    return await this._getCachedConfig('isMaintenanceMode', () => isMaintenanceMode(this.env));
  }
  
  // Private caching method
  async _getCachedConfig(key, fetcher) {
    if (this.configCache.has(key)) {
      return this.configCache.get(key);
    }
    
    const value = await fetcher();
    this.configCache.set(key, value);
    return value;
  }
}
```

**Using BaseService in Your Services:**
```javascript
// services/yourService.js
import { BaseService } from './baseService.js';

export class YourService extends BaseService {
  constructor(env) {
    super(env, 'YourService');
  }
  
  async someMethod() {
    // Cached configuration access - no repeated calls
    const featureFlags = await this.getFeatureFlags();
    const jwtSettings = await this.getJwtSettings();
    const securitySettings = await this.getSecuritySettings();
    
    // Environment-aware logic
    if (await this.isProduction()) {
      // Production-specific behavior
    }
    
    // Maintenance mode check
    if (await this.isMaintenanceMode()) {
      throw new Error('System under maintenance');
    }
    
    // Use configuration for business logic
    if (featureFlags.enableAdvancedMetrics) {
      // Advanced metrics collection
    }
  }
}
```

## 🏢 Enterprise Features

### Maintenance Mode
Put the entire application into maintenance mode with a single configuration change:

```javascript
import { isMaintenanceMode } from '../utils/dynamicConfig.js';

// In middleware or route handlers
if (await isMaintenanceMode(env)) {
  return c.json({
    success: false,
    error: 'System is currently under maintenance. Please try again later.',
    maintenance: true
  }, 503);
}
```

### Advanced Rate Limiting
Comprehensive rate limiting with dynamic configuration:

```javascript
import { getRateLimitSettings } from '../utils/dynamicConfig.js';

const rateLimits = await getRateLimitSettings(env);
// Configure rate limiter with dynamic settings
const limiter = new RateLimiter(rateLimits.maxRequests, rateLimits.windowMs);
```

### Performance Monitoring
Built-in performance thresholds for monitoring and alerting:

```javascript
import { getPerformanceSettings } from '../utils/dynamicConfig.js';

const perf = await getPerformanceSettings(env);
const responseTime = Date.now() - startTime;

if (responseTime > perf.criticalThreshold) {
  // Alert critical performance issue
} else if (responseTime > perf.warningThreshold) {
  // Log performance warning
}
```

### Security Controls
Enterprise-grade security configuration:

```javascript
import { getSecuritySettings } from '../utils/dynamicConfig.js';

const security = await getSecuritySettings(env);

// Implement login attempt limiting
if (attemptCount > security.maxLoginAttempts) {
  // Lock account for lockout duration
  const lockoutUntil = Date.now() + security.lockoutDuration;
}
```

### Environment-Aware Logic
Different behavior based on environment:

```javascript
import { isProduction, isDevelopment } from '../utils/dynamicConfig.js';

if (await isProduction(env)) {
  // Production optimizations
  // - Minimal logging
  // - Caching enabled
  // - Error details hidden
} else if (await isDevelopment(env)) {
  // Development features
  // - Detailed error messages
  // - SQL query logging
  // - Debug information
}
```

## 🔄 Fallback System

The configuration system uses a three-tier fallback approach:

1. **KV Store** (highest priority) - Runtime configuration
2. **Environment Variables** - Development/deployment settings
3. **Default Values** (lowest priority) - Safe fallbacks

```javascript
// Example fallback for JWT_SECRET
// 1. Check KV Store: CONFIG_KV.get('JWT_SECRET')
// 2. Check Environment: env.JWT_SECRET
// 3. Use Default: 'your-super-secret-jwt-key-change-this-in-production'
```

## 🧪 Testing with Dynamic Configuration

### Test Environment Setup
Dynamic configuration works seamlessly in test environments:

```javascript
// tests/config/testConfig.js
export const testEnv = {
  JWT_SECRET: 'test-jwt-secret',
  RATE_LIMIT_DISABLED: 'true',
  ENABLE_DETAILED_ERRORS: 'true'
};

// Test usage
const authService = new AuthService(testEnv);
const result = await authService.login('test@example.com', 'password', '127.0.0.1');
```

### Testing Configuration Functions
```javascript
// Example test
describe('Dynamic Configuration', () => {
  test('getFeatureFlags returns correct values', async () => {
    const featureFlags = await getFeatureFlags(testEnv);
    expect(featureFlags.disableRateLimiting).toBe(true);
    expect(featureFlags.enableDetailedErrors).toBe(true);
  });
});
```

## 🛡️ Security Considerations

- **Environment Separation**: Different configs for dev/test/staging/production
- **Secret Management**: JWT secrets managed through environment variables or KV
- **Default Safety**: All default values are safe for development
- **Validation**: Type checking and validation for all configuration values

## 📊 Performance Benefits

- **Cached Access**: Configuration cached at service level
- **Reduced Parameters**: Cleaner APIs with fewer parameters
- **Centralized Logic**: Single source of truth for all configuration
- **Lazy Loading**: Configuration loaded only when needed

## 🔧 Debugging Configuration

Enable debug logging to see configuration retrieval:

```bash
# .dev.vars.development
DEBUG = "hono-auth-api:config:*"
```

Debug output will show:
- Configuration source (KV/ENV/Default)
- Cache hits/misses
- Fallback chain execution

## 📖 Best Practices

1. **Use BaseService**: Inherit from BaseService for automatic caching and enterprise features
2. **Avoid Parameter Passing**: Let services get their own configuration internally
3. **Test All Fallbacks**: Ensure KV, ENV, and default values work correctly
4. **Document New Keys**: Add new configuration keys to `kvKeys.js` with defaults
5. **Validate Types**: Use type-safe configuration getters (`getBooleanConfig`, `getNumberConfig`, etc.)
6. **Cache Appropriately**: Use cached access for frequently accessed config through BaseService
7. **Environment Awareness**: Use environment detection functions for conditional logic
8. **Security First**: Never expose sensitive configuration values in responses
9. **Performance Monitoring**: Use performance settings for monitoring and alerting
10. **Maintenance Planning**: Implement maintenance mode checks in critical endpoints

### Configuration Naming Conventions

- **Boolean flags**: `ENABLE_*`, `DISABLE_*`, `ALLOW_*` (e.g., `ENABLE_RATE_LIMIT`)
- **Numeric limits**: `MAX_*`, `MIN_*`, `*_THRESHOLD` (e.g., `MAX_LOGIN_ATTEMPTS`)
- **Time durations**: `*_TIMEOUT_MS`, `*_DURATION_MS` (e.g., `SESSION_TIMEOUT_MS`)
- **Feature flags**: `ENABLE_*_FEATURE` (e.g., `ENABLE_ADVANCED_METRICS`)

### Environment-Specific Configuration

```javascript
// Development
{
  ENABLE_DETAILED_ERRORS: true,
  LOG_SQL_QUERIES: true,
  RATE_LIMIT_DISABLED: true
}

// Production
{
  ENABLE_DETAILED_ERRORS: false,
  LOG_SQL_QUERIES: false,
  ENABLE_SECURITY_HEADERS: true,
  COLLECT_DETAILED_METRICS: true
}

// Testing
{
  RATE_LIMIT_DISABLED: true,
  ENABLE_DETAILED_ERRORS: true,
  MAINTENANCE_MODE: false
}
```

## �️ Security Headers Usage

### Security Headers Middleware
The system provides middleware to automatically apply security headers to protect applications from common attacks:

```javascript
// middleware/security.js
import { getSecurityHeadersSettings } from '../utils/dynamicConfig.js';

export const securityMiddleware = async (c, next) => {
  const securityConfig = await getSecurityHeadersSettings(c.env);
  
  await next(); // Execute route handler first
  
  // Apply security headers
  const headers = securityConfig.headers || {};
  for (const [headerName, headerValue] of Object.entries(headers)) {
    if (headerValue && typeof headerValue === 'string') {
      c.header(headerName, headerValue);
    }
  }
};
```

### Customizing Security Headers via KV Admin API

Super admins can customize security headers through the KV Admin API:

```bash
# Example: update Content Security Policy
curl -X PUT "/api/kv-admin/configs/SECURITY_CSP" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"default-src '\''self'\''; script-src '\''self'\''"}' 
```

For additional KV Admin request examples and permission-aware workflows, refer to [ROLE_COMPLETE_GUIDE.md](./ROLE_COMPLETE_GUIDE.md) and [TEST_SCRIPTS.md](./TEST_SCRIPTS.md).

### Application Integration

```javascript
// index.js
import { securityMiddleware } from './middleware/security.js';

const app = new Hono();

// Apply security headers to all routes
app.use('*', securityMiddleware);

// Your routes...
app.route('/api/auth', authRoutes);
app.route('/api/user', userRoutes);
```

### Checking Security Headers

You can verify which security headers are being applied:

```javascript
// Example: Check security headers in tests
import { getSecurityHeadersSettings } from '../utils/dynamicConfig.js';

const securityConfig = await getSecurityHeadersSettings(env);
console.log('Current Security Headers:', securityConfig.headers);

// Headers will include:
// - X-Content-Type-Options: nosniff
// - X-Frame-Options: DENY  
// - X-XSS-Protection: 1; mode=block
// - Content-Security-Policy: ...
// - Referrer-Policy: strict-origin-when-cross-origin
// - Permissions-Policy: camera=(), microphone=(), ...
// - Strict-Transport-Security: ... (production only)
```

## �🔗 Related Documentation

- [KV Configuration Management System](../README.md#%EF%B8%8F-kv-configuration-management-system)
- [Setup Guide](./SETUP_GUIDE.md) - Environment configuration
- [Database Service Guide](./DATABASE_SERVICE.md) - Service architecture
- [Testing Guide](./TEST_GUIDE.md) - Testing with dynamic configuration

---

This dynamic configuration system provides a robust, scalable solution for managing application settings while maintaining clean, maintainable code architecture.
