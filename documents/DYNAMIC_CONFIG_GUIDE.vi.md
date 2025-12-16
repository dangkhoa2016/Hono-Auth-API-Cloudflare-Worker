# Hướng dẫn Quản lý Cấu hình Động

> 🌐 Language / Ngôn ngữ: [English](DYNAMIC_CONFIG_GUIDE.md) | **Tiếng Việt**

> **Tài liệu toàn diện cho Hệ thống Quản lý Cấu hình Động**
> 
> 📅 **Cập nhật lần cuối**: 1 tháng 8, 2025

## Tổng quan

Hướng dẫn này bao gồm **Hệ thống Quản lý Cấu hình Động** được triển khai trong dự án Hono Auth Worker. Hệ thống này loại bỏ việc phải truyền tham số cấu hình qua các lớp service bằng cách cung cấp truy cập cấu hình tập trung và có cache với các tính năng cấp doanh nghiệp.

## 🎯 Lợi ích chính

- **🔧 Quản lý Tập trung**: Tất cả cấu hình được xử lý thông qua `src/utils/dynamicConfig.js`
- **🚀 API Đơn giản**: Không cần truyền tham số cấu hình qua các lời gọi service
- **⚙️ Tự động Phát hiện**: Services tự động lấy cấu hình từ môi trường
- **🔄 Fallback Thông minh**: KV Store → Biến Môi trường → Giá trị Mặc định
- **🛡️ An toàn Kiểu**: Validation và chuyển đổi kiểu tích hợp với các getter chuyên biệt
- **⚡ Hiệu suất**: Truy cập cấu hình có cache thông qua BaseService
- **🏢 Tính năng Doanh nghiệp**: Chế độ bảo trì, rate limiting, cài đặt bảo mật
- **🌍 Nhận biết Môi trường**: Phát hiện production, development, test, staging
- **📊 Cài đặt Nâng cao**: Metrics, ngưỡng hiệu suất, điều khiển phân trang
- **🔐 Kiểm soát Bảo mật**: Cài đặt BCrypt, cấu hình CORS, logging phản hồi

## 📁 Cấu trúc File

```
src/
├── utils/
│   └── dynamicConfig.js        # Tiện ích cấu hình chính
├── services/
│   ├── baseService.js          # Service cơ sở với cache cấu hình
│   ├── authService.js          # Sử dụng cấu hình JWT & feature động
│   ├── userService.js          # Sử dụng feature flags
│   └── databaseService.js      # Sử dụng cấu hình hiệu suất
├── constants/
│   └── kvKeys.js              # Khóa cấu hình & giá trị mặc định
└── middleware/
    └── auth.js                # Sử dụng cài đặt JWT động
```

## 🔑 Hàm Cấu hình

### Hàm Cốt lõi

#### `getDynamicConfig(env, key, defaultValue, preferKV)`
Hàm cơ sở để lấy bất kỳ giá trị cấu hình nào với logic fallback thông minh.

```javascript
import { getDynamicConfig } from '../utils/dynamicConfig.js';

// Lấy bất kỳ giá trị config nào với fallback
const value = await getDynamicConfig(env, 'MY_CONFIG_KEY', 'default_value');

// Ưu tiên environment hơn KV
const envValue = await getDynamicConfig(env, 'MY_CONFIG_KEY', 'default', false);
```

### Hàm Cấu hình Type-Safe

#### `getBooleanConfig(env, key, defaultValue)`
Lấy cấu hình boolean với chuyển đổi kiểu tự động.

```javascript
import { getBooleanConfig } from '../utils/dynamicConfig.js';

const isEnabled = await getBooleanConfig(env, 'FEATURE_ENABLED', false);
// Trả về: true/false với tự động parsing từ chuỗi 'true'/'false'
```

#### `getNumberConfig(env, key, defaultValue, min, max)`
Lấy cấu hình số với validation giới hạn.

```javascript
import { getNumberConfig } from '../utils/dynamicConfig.js';

const timeout = await getNumberConfig(env, 'REQUEST_TIMEOUT', 5000, 1000, 30000);
// Trả về: số trong phạm vi min/max
```

#### `getStringConfig(env, key, defaultValue, maxLength)`
Lấy cấu hình chuỗi với validation độ dài.

```javascript
import { getStringConfig } from '../utils/dynamicConfig.js';

const apiKey = await getStringConfig(env, 'API_KEY', '', 256);
// Trả về: chuỗi với tùy chọn giới hạn độ dài tối đa
```

### Hàm Cấu hình Chuyên biệt

#### `getJwtSettings(env)`
Trả về cấu hình JWT bao gồm secret và cài đặt hết hạn token.

```javascript
import { getJwtSettings } from '../utils/dynamicConfig.js';

const jwtSettings = await getJwtSettings(env);
// Trả về: {
//   secret: "jwt-secret-string",
//   accessTokenExpires: 3600,
//   refreshTokenExpires: 259200
// }
```

#### `getFeatureFlags(env)`
Trả về feature flags để kiểm soát phát triển và runtime.

```javascript
import { getFeatureFlags } from '../utils/dynamicConfig.js';

const featureFlags = await getFeatureFlags(env);
// Trả về: {
//   disableRateLimiting: false,
//   enableDetailedErrors: false,
//   autoActivateUserOnRegister: false,
//   logSqlQueries: false,
//   enableAuditLogCompression: true,
//   enableRealtimeNotifications: false,
//   enableAdvancedMetrics: false
// }
```

#### `getAppSettings(env)`
Trả về cài đặt cấp ứng dụng và thông tin phiên bản.

```javascript
import { getAppSettings } from '../utils/dynamicConfig.js';

const appSettings = await getAppSettings(env);
// Trả về: {
//   name: "Hono Auth Worker",
//   version: "1.0.0",
//   environment: "development"
// }
```

#### `getRateLimitSettings(env)`
Trả về cấu hình rate limiting.

```javascript
import { getRateLimitSettings } from '../utils/dynamicConfig.js';

const rateLimits = await getRateLimitSettings(env);
// Trả về: {
//   maxRequests: 100,
//   windowMs: 900000,  // 15 phút
//   enableRateLimit: true
// }
```

#### `getPerformanceSettings(env)`
Trả về các ngưỡng giám sát hiệu suất.

```javascript
import { getPerformanceSettings } from '../utils/dynamicConfig.js';

const performance = await getPerformanceSettings(env);
// Trả về: {
//   goodThreshold: 200,
//   warningThreshold: 500,
//   criticalThreshold: 1000
// }
```

#### `getPaginationSettings(env)`
Trả về cấu hình giới hạn phân trang.

```javascript
import { getPaginationSettings } from '../utils/dynamicConfig.js';

const pagination = await getPaginationSettings(env);
// Trả về: {
//   defaultPageSize: 10,
//   maxPageSize: 100,
//   allowUnlimitedPageSize: false
// }
```

#### `getBcryptSettings(env)`
Trả về cấu hình hashing BCrypt.

```javascript
import { getBcryptSettings } from '../utils/dynamicConfig.js';

const bcrypt = await getBcryptSettings(env);
// Trả về: {
//   saltRounds: 12,
//   maxPasswordLength: 128
// }
```

#### `getSecuritySettings(env)`
Trả về cấu hình bảo mật toàn diện.

```javascript
import { getSecuritySettings } from '../utils/dynamicConfig.js';

const security = await getSecuritySettings(env);
// Trả về: {
//   highRiskThreshold: 10,
//   performanceGoodThreshold: 1000
// }
```

#### `getSecurityHeadersSettings(env)`
Trả về cấu hình Security Headers cho bảo vệ XSS, clickjacking và các cuộc tấn công bảo mật khác.

```javascript
import { getSecurityHeadersSettings } from '../utils/dynamicConfig.js';

const securityHeaders = await getSecurityHeadersSettings(env);
// Trả về: {
//   headers: {
//     'X-Content-Type-Options': 'nosniff',
//     'X-Frame-Options': 'DENY',
//     'X-XSS-Protection': '1; mode=block',
//     'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline'; ...",
//     'Referrer-Policy': 'strict-origin-when-cross-origin',
//     'Permissions-Policy': 'camera=(), microphone=(), geolocation=(), ...',
//     'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload' // chỉ trong production
//   }
// }
```

#### `getCorsSettings(env)`
Trả về cấu hình CORS cho cross-origin requests.

```javascript
import { getCorsSettings } from '../utils/dynamicConfig.js';

const cors = await getCorsSettings(env);
// Trả về: {
//   origin: "*",
//   methods: ["GET", "POST", "PUT", "DELETE"],
//   allowedHeaders: ["Content-Type", "Authorization"],
//   maxAge: 86400
// }
```

#### `getMetricsSettings(env)`
Trả về cấu hình metrics và monitoring.

```javascript
import { getMetricsSettings } from '../utils/dynamicConfig.js';

const metrics = await getMetricsSettings(env);
// Trả về: {
//   enableMetrics: true,
//   metricsEndpoint: "/metrics",
//   collectDetailedMetrics: false,
//   metricsRetentionDays: 30
// }
```

### Hàm Phát hiện Môi trường

#### `isProduction(env)` / `isDevelopment(env)` / `isTest(env)` / `isStaging(env)`
Tiện ích phát hiện môi trường.

```javascript
import { 
  isProduction, 
  isDevelopment, 
  isTest, 
  isStaging 
} from '../utils/dynamicConfig.js';

if (await isProduction(env)) {
  // Logic chuyên biệt cho production
}

if (await isDevelopment(env)) {
  // Tính năng chuyên biệt cho development
}
```

#### `isMaintenanceMode(env)`
Kiểm tra xem ứng dụng có đang trong chế độ bảo trì không.

```javascript
import { isMaintenanceMode } from '../utils/dynamicConfig.js';

const maintenance = await isMaintenanceMode(env);
if (maintenance) {
  return c.json({ message: 'Hệ thống đang bảo trì' }, 503);
}
```

#### `getResponseLogSettings(env)`
Trả về cấu hình logging phản hồi để debug.

```javascript
import { getResponseLogSettings } from '../utils/dynamicConfig.js';

const logSettings = await getResponseLogSettings(env);
// Trả về: {
//   enableResponseBodyCapture: false,
//   maxResponseBodySize: 1024,
//   logLevel: "info"
// }
```

## 🚀 Ví dụ Migration

### Trước: Truyền tham số thủ công

**Cách sử dụng AuthService cũ:**
```javascript
// routes/auth.js (CÁCH CŨ)
import { getJwtSecret } from '../utils/jwt.js';
import { getFeatureFlags } from '../utils/dynamicConfig.js';

auth.post('/login', async (c) => {
  const { email, password } = c.req.valid('json');
  const ipAddress = getClientIP(c);
  
  // Lấy cấu hình thủ công
  const jwtSecret = await getJwtSecret(c.env);
  const featureFlags = await getFeatureFlags(c.env);
  const isRateLimitDisabled = featureFlags.disableRateLimiting;

  const authService = createAuthService(c.env);
  
  // Truyền nhiều tham số
  const result = await authService.login(
    email, 
    password, 
    ipAddress, 
    jwtSecret, 
    isRateLimitDisabled
  );
  
  // ... xử lý kết quả
});
```

**Triển khai AuthService cũ:**
```javascript
// services/authService.js (CÁCH CŨ)
export class AuthService {
  async login(email, password, ipAddress, jwtSecret, isRateLimitDisabled = false) {
    // Xử lý tham số thủ công
    if (!isRateLimitDisabled) {
      // Logic rate limiting sử dụng tham số được truyền
    }
    
    // Tạo JWT token sử dụng secret được truyền
    const tokens = await this.generateTokens(user, jwtSecret);
  }
  
  async generateTokens(user, jwtSecret) {
    // Sử dụng JWT secret được truyền
    const accessToken = await signToken(tokenPayload, jwtSecret);
    const refreshToken = await signToken(refreshTokenPayload, jwtSecret);
  }
}
```

### Sau: Cấu hình Động

**Cách sử dụng AuthService mới:**
```javascript
// routes/auth.js (CÁCH MỚI)
auth.post('/login', async (c) => {
  const { email, password } = c.req.valid('json');
  const ipAddress = getClientIP(c);

  const authService = createAuthService(c.env);
  
  // API sạch, đơn giản - cấu hình được xử lý nội bộ
  const result = await authService.login(email, password, ipAddress);
  
  // ... xử lý kết quả
});
```

**Triển khai AuthService mới:**
```javascript
// services/authService.js (CÁCH MỚI)
import { getJwtSettings, getFeatureFlags } from '../utils/dynamicConfig.js';

export class AuthService extends BaseService {
  constructor(env) {
    super(env, 'AuthService');
  }

  async login(email, password, ipAddress) {
    // Lấy cấu hình tự động
    const featureFlags = await getFeatureFlags(this.env);
    const jwtSettings = await getJwtSettings(this.env);
    
    // Sử dụng cấu hình trực tiếp
    const isRateLimitDisabled = featureFlags.disableRateLimiting;
    
    if (!isRateLimitDisabled) {
      // Logic rate limiting sử dụng cấu hình động
    }
    
    // Tạo JWT token sử dụng cấu hình động
    const tokens = await this.generateTokens(user);
  }
  
  async generateTokens(user) {
    // Lấy cài đặt JWT nội bộ
    const jwtSettings = await getJwtSettings(this.env);
    
    const accessToken = await signToken(tokenPayload, jwtSettings.secret);
    const refreshToken = await signToken(refreshTokenPayload, jwtSettings.secret);
  }
}
```

## 📋 Khóa Cấu hình được hỗ trợ

### Cài đặt JWT
- `JWT_SECRET` - Secret ký JWT
- `JWT_ACCESS_TOKEN_EXPIRES` - Hết hạn access token (giây) [Mặc định: 3600]
- `JWT_REFRESH_TOKEN_EXPIRES` - Hết hạn refresh token (giây) [Mặc định: 259200]

### Feature Flags
- `RATE_LIMIT_DISABLED` - Tắt rate limiting [Mặc định: false]
- `ENABLE_DETAILED_ERRORS` - Hiển thị thông báo lỗi chi tiết [Mặc định: false]
- `AUTO_ACTIVATE_USER_ON_REGISTER` - Tự động kích hoạt người dùng mới [Mặc định: false]
- `LOG_SQL_QUERIES` - Bật ghi log truy vấn SQL [Mặc định: false]
- `ENABLE_AUDIT_LOG_COMPRESSION` - Nén audit logs [Mặc định: true]
- `ENABLE_REALTIME_NOTIFICATIONS` - Bật thông báo thời gian thực [Mặc định: false]
- `ENABLE_ADVANCED_METRICS` - Bật thu thập metrics nâng cao [Mặc định: false]

### Cài đặt Ứng dụng
- `APP_NAME` - Tên ứng dụng [Mặc định: "Hono Auth Worker"]
- `APP_VERSION` - Phiên bản ứng dụng [Mặc định: "1.0.0"]
- `ENVIRONMENT` - Môi trường ứng dụng [Mặc định: "development"]

### Cài đặt Rate Limiting
- `RATE_LIMIT_MAX_REQUESTS` - Số requests tối đa mỗi window [Mặc định: 100]
- `RATE_LIMIT_WINDOW_MS` - Window rate limit tính bằng milliseconds [Mặc định: 900000]
- `ENABLE_RATE_LIMIT` - Bật rate limiting toàn cục [Mặc định: true]

### Cài đặt Hiệu suất
- `PERFORMANCE_GOOD_THRESHOLD` - Ngưỡng hiệu suất tốt (ms) [Mặc định: 200]
- `PERFORMANCE_WARNING_THRESHOLD` - Ngưỡng cảnh báo (ms) [Mặc định: 500]
- `PERFORMANCE_CRITICAL_THRESHOLD` - Ngưỡng quan trọng (ms) [Mặc định: 1000]

### Cài đặt Phân trang
- `DEFAULT_PAGE_SIZE` - Kích thước phân trang mặc định [Mặc định: 10]
- `MAX_PAGE_SIZE` - Kích thước phân trang tối đa [Mặc định: 100]
- `ALLOW_UNLIMITED_PAGE_SIZE` - Cho phép kích thước trang không giới hạn [Mặc định: false]

### Cài đặt Bảo mật
- `SECURITY_HIGH_RISK_THRESHOLD` - Ngưỡng hành động rủi ro cao [Mặc định: 10]
- `PERFORMANCE_GOOD_THRESHOLD` - Ngưỡng hiệu suất tốt (ms) [Mặc định: 1000]

#### Security Headers Configuration
- `SECURITY_X_CONTENT_TYPE_OPTIONS` - Ngăn MIME type sniffing [Mặc định: "nosniff"]
- `SECURITY_X_FRAME_OPTIONS` - Ngăn clickjacking [Mặc định: "DENY"]
- `SECURITY_X_XSS_PROTECTION` - Bảo vệ XSS [Mặc định: "1; mode=block"]
- `SECURITY_CSP` - Content Security Policy [Mặc định: "default-src 'self'; script-src 'self' 'unsafe-inline'; ..."]
- `SECURITY_REFERRER_POLICY` - Chính sách referrer [Mặc định: "strict-origin-when-cross-origin"]
- `SECURITY_PERMISSIONS_POLICY` - Chính sách permissions [Mặc định: "camera=(), microphone=(), geolocation=(), ..."]
- `SECURITY_HSTS` - HTTP Strict Transport Security (chỉ production) [Mặc định: "max-age=31536000; includeSubDomains; preload"]

### Cài đặt BCrypt
- `BCRYPT_SALT_ROUNDS` - Số vòng salt BCrypt [Mặc định: 12]
- `MAX_PASSWORD_LENGTH` - Độ dài mật khẩu tối đa [Mặc định: 128]

### Cài đặt CORS
- `CORS_ORIGIN` - Cài đặt CORS origin [Mặc định: "*"]
- `CORS_METHODS` - Các phương thức HTTP được phép [Mặc định: "GET,POST,PUT,DELETE"]
- `CORS_ALLOWED_HEADERS` - Headers được phép [Mặc định: "Content-Type,Authorization"]
- `CORS_MAX_AGE` - Thời gian cache CORS preflight (giây) [Mặc định: 86400]

### Cài đặt Metrics
- `ENABLE_METRICS` - Bật thu thập metrics [Mặc định: true]
- `METRICS_ENDPOINT` - Đường dẫn endpoint metrics [Mặc định: "/metrics"]
- `COLLECT_DETAILED_METRICS` - Thu thập metrics chi tiết [Mặc định: false]
- `METRICS_RETENTION_DAYS` - Thời gian lưu trữ metrics [Mặc định: 30]

### Cài đặt Hệ thống
- `MAINTENANCE_MODE` - Bật chế độ bảo trì [Mặc định: false]
- `ENABLE_RESPONSE_BODY_CAPTURE` - Bật logging response body [Mặc định: false]
- `MAX_RESPONSE_BODY_SIZE` - Kích thước response body tối đa để logging [Mặc định: 1024]
- `LOG_LEVEL` - Mức độ log ứng dụng [Mặc định: "info"]

## 🏗️ Tích hợp BaseService

Tất cả services kế thừa từ `BaseService` cung cấp truy cập cấu hình có cache và tính năng cấp doanh nghiệp:

```javascript
// services/baseService.js
export class BaseService {
  constructor(env, serviceName) {
    this.env = env;
    this.serviceName = serviceName;
    this.configCache = new Map();
  }
  
  // Các phương thức truy cập cấu hình có cache
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
  
  // Phát hiện môi trường (có cache)
  async isProduction() {
    return await this._getCachedConfig('isProduction', () => isProduction(this.env));
  }
  
  async isDevelopment() {
    return await this._getCachedConfig('isDevelopment', () => isDevelopment(this.env));
  }
  
  async isMaintenanceMode() {
    return await this._getCachedConfig('isMaintenanceMode', () => isMaintenanceMode(this.env));
  }
  
  // Phương thức cache riêng tư
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

**Sử dụng BaseService trong Services của bạn:**
```javascript
// services/yourService.js
import { BaseService } from './baseService.js';

export class YourService extends BaseService {
  constructor(env) {
    super(env, 'YourService');
  }
  
  async someMethod() {
    // Truy cập cấu hình có cache - không gọi lại nhiều lần
    const featureFlags = await this.getFeatureFlags();
    const jwtSettings = await this.getJwtSettings();
    const securitySettings = await this.getSecuritySettings();
    
    // Logic nhận biết môi trường
    if (await this.isProduction()) {
      // Hành vi chuyên biệt cho production
    }
    
    // Kiểm tra chế độ bảo trì
    if (await this.isMaintenanceMode()) {
      throw new Error('Hệ thống đang bảo trì');
    }
    
    // Sử dụng cấu hình cho business logic
    if (featureFlags.enableAdvancedMetrics) {
      // Thu thập metrics nâng cao
    }
  }
}
```

## 🏢 Tính năng Doanh nghiệp

### Chế độ Bảo trì
Đưa toàn bộ ứng dụng vào chế độ bảo trì chỉ với một thay đổi cấu hình:

```javascript
import { isMaintenanceMode } from '../utils/dynamicConfig.js';

// Trong middleware hoặc route handlers
if (await isMaintenanceMode(env)) {
  return c.json({
    success: false,
    error: 'Hệ thống hiện đang bảo trì. Vui lòng thử lại sau.',
    maintenance: true
  }, 503);
}
```

### Rate Limiting Nâng cao
Rate limiting toàn diện với cấu hình động:

```javascript
import { getRateLimitSettings } from '../utils/dynamicConfig.js';

const rateLimits = await getRateLimitSettings(env);
// Cấu hình rate limiter với cài đặt động
const limiter = new RateLimiter(rateLimits.maxRequests, rateLimits.windowMs);
```

### Giám sát Hiệu suất
Ngưỡng hiệu suất tích hợp để giám sát và cảnh báo:

```javascript
import { getPerformanceSettings } from '../utils/dynamicConfig.js';

const perf = await getPerformanceSettings(env);
const responseTime = Date.now() - startTime;

if (responseTime > perf.criticalThreshold) {
  // Cảnh báo vấn đề hiệu suất quan trọng
} else if (responseTime > perf.warningThreshold) {
  // Ghi log cảnh báo hiệu suất
}
```

### Kiểm soát Bảo mật
Cấu hình bảo mật cấp doanh nghiệp:

```javascript
import { getSecuritySettings } from '../utils/dynamicConfig.js';

const security = await getSecuritySettings(env);

// Triển khai giới hạn thử đăng nhập
if (attemptCount > security.maxLoginAttempts) {
  // Khóa tài khoản trong thời gian lockout
  const lockoutUntil = Date.now() + security.lockoutDuration;
}
```

### Logic Nhận biết Môi trường
Hành vi khác nhau dựa trên môi trường:

```javascript
import { isProduction, isDevelopment } from '../utils/dynamicConfig.js';

if (await isProduction(env)) {
  // Tối ưu hóa production
  // - Logging tối thiểu
  // - Bật caching
  // - Ẩn chi tiết lỗi
} else if (await isDevelopment(env)) {
  // Tính năng development
  // - Thông báo lỗi chi tiết
  // - SQL query logging
  // - Thông tin debug
}
```

## 🔄 Hệ thống Fallback

Hệ thống cấu hình sử dụng phương pháp fallback ba tầng:

1. **KV Store** (ưu tiên cao nhất) - Cấu hình runtime
2. **Biến Môi trường** - Cài đặt development/deployment
3. **Giá trị Mặc định** (ưu tiên thấp nhất) - Fallback an toàn

```javascript
// Ví dụ fallback cho JWT_SECRET
// 1. Kiểm tra KV Store: CONFIG_KV.get('JWT_SECRET')
// 2. Kiểm tra Môi trường: env.JWT_SECRET
// 3. Sử dụng Mặc định: 'your-super-secret-jwt-key-change-this-in-production'
```

## 🧪 Testing với Cấu hình Động

### Thiết lập Môi trường Test
Cấu hình động hoạt động mượt mà trong môi trường test:

```javascript
// tests/config/testEnv.js
export const testEnv = {
  JWT_SECRET: 'test-jwt-secret',
  RATE_LIMIT_DISABLED: 'true',
  ENABLE_DETAILED_ERRORS: 'true'
};

// Sử dụng test
const authService = new AuthService(testEnv);
const result = await authService.login('test@example.com', 'password', '127.0.0.1');
```

### Testing Hàm Cấu hình
```javascript
// Ví dụ test
describe('Dynamic Configuration', () => {
  test('getFeatureFlags trả về giá trị đúng', async () => {
    const featureFlags = await getFeatureFlags(testEnv);
    expect(featureFlags.disableRateLimiting).toBe(true);
    expect(featureFlags.enableDetailedErrors).toBe(true);
  });
});
```

## 🛡️ Cân nhắc Bảo mật

- **Tách biệt Môi trường**: Cấu hình khác nhau cho dev/test/staging/production
- **Quản lý Secret**: JWT secrets được quản lý thông qua biến môi trường hoặc KV
- **An toàn Mặc định**: Tất cả giá trị mặc định đều an toàn cho development
- **Validation**: Kiểm tra kiểu và validation cho tất cả giá trị cấu hình

## 📊 Lợi ích Hiệu suất

- **Truy cập có Cache**: Cấu hình được cache ở cấp service
- **Giảm tham số**: API sạch hơn với ít tham số hơn
- **Logic Tập trung**: Nguồn chân lý duy nhất cho tất cả cấu hình
- **Lazy Loading**: Cấu hình chỉ được tải khi cần thiết

## 🔧 Debug Cấu hình

Bật debug logging để xem việc lấy cấu hình:

```bash
# .dev.vars.development
DEBUG = "hono-auth-api:config:*"
```

Debug output sẽ hiển thị:
- Nguồn cấu hình (KV/ENV/Default)
- Cache hits/misses
- Thực thi fallback chain

## 📖 Best Practices

1. **Sử dụng BaseService**: Kế thừa từ BaseService để có cache tự động và tính năng doanh nghiệp
2. **Tránh Truyền tham số**: Để services tự lấy cấu hình của chúng nội bộ
3. **Test Tất cả Fallbacks**: Đảm bảo giá trị KV, ENV và mặc định đều hoạt động đúng
4. **Document Khóa mới**: Thêm khóa cấu hình mới vào `kvKeys.js` với giá trị mặc định
5. **Validate Kiểu**: Sử dụng các getter cấu hình type-safe (`getBooleanConfig`, `getNumberConfig`, v.v.)
6. **Cache Phù hợp**: Sử dụng truy cập có cache cho config được truy cập thường xuyên thông qua BaseService
7. **Nhận biết Môi trường**: Sử dụng hàm phát hiện môi trường cho logic có điều kiện
8. **Bảo mật Trước tiên**: Không bao giờ expose giá trị cấu hình nhạy cảm trong responses
9. **Giám sát Hiệu suất**: Sử dụng cài đặt hiệu suất để giám sát và cảnh báo
10. **Lập kế hoạch Bảo trì**: Triển khai kiểm tra chế độ bảo trì trong các endpoints quan trọng

### Quy ước Đặt tên Cấu hình

- **Boolean flags**: `ENABLE_*`, `DISABLE_*`, `ALLOW_*` (ví dụ: `ENABLE_RATE_LIMIT`)
- **Giới hạn số**: `MAX_*`, `MIN_*`, `*_THRESHOLD` (ví dụ: `MAX_LOGIN_ATTEMPTS`)
- **Thời gian**: `*_TIMEOUT_MS`, `*_DURATION_MS` (ví dụ: `SESSION_TIMEOUT_MS`)
- **Feature flags**: `ENABLE_*_FEATURE` (ví dụ: `ENABLE_ADVANCED_METRICS`)

### Cấu hình Theo Môi trường

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

## �️ Sử dụng Security Headers

### Security Headers Middleware
Hệ thống cung cấp middleware tự động áp dụng security headers để bảo vệ ứng dụng khỏi các cuộc tấn công phổ biến:

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

### Tùy chỉnh Security Headers qua KV Admin API

Super admin có thể tùy chỉnh security headers thông qua KV Admin API:

```bash
# Cập nhật Content Security Policy
curl -X PUT "/api/kv-admin/configs/SECURITY_CSP" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"default-src '\''self'\''; script-src '\''self'\''"}' 

# Cập nhật X-Frame-Options
curl -X PUT "/api/kv-admin/configs/SECURITY_X_FRAME_OPTIONS" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"SAMEORIGIN"}'

# Cập nhật Permissions Policy
curl -X PUT "/api/kv-admin/configs/SECURITY_PERMISSIONS_POLICY" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"value":"camera=(), microphone=(), geolocation=()"}'
```

### Tích hợp vào ứng dụng

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

### Kiểm tra Security Headers

Bạn có thể kiểm tra security headers đang được áp dụng:

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

## �🔗 Tài liệu Liên quan

- [Hệ thống Quản lý Cấu hình KV](../README_vi.md#%EF%B8%8F-hệ-thống-quản-lý-cấu-hình-kv)
- [Hướng dẫn Setup](./SETUP_GUIDE_vi.md) - Cấu hình môi trường
- [Hướng dẫn Database Service](./DATABASE_SERVICE_vi.md) - Kiến trúc service
- [Hướng dẫn Testing](./TEST_GUIDE_vi.md) - Testing với cấu hình động

---

Hệ thống cấu hình động này cung cấp một giải pháp mạnh mẽ, có thể mở rộng cho việc quản lý cài đặt ứng dụng trong khi duy trì kiến trúc code sạch, dễ bảo trì.
