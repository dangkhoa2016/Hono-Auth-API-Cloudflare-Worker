# 🔐 **HƯỚNG DẪN BẢO MẬT TOKEN TOÀN DIỆN - HONO AUTH WORKER PROJECT**

> 🌐 Language / Ngôn ngữ: [English](TOKEN_SECURITY_COMPREHENSIVE_GUIDE.md) | **Tiếng Việt**

---

## 📋 **MỤC LỤC**

1. [Tình trạng hiện tại của dự án](#1-tình-trạng-hiện-tại-của-dự-án)
2. [Kiến trúc bảo mật token đề xuất](#2-kiến-trúc-bảo-mật-token-đề-xuất)
3. [Kế hoạch triển khai](#3-kế-hoạch-triển-khai)
4. [Chi tiết triển khai](#4-chi-tiết-triển-khai)
5. [Danh sách công việc cần làm](#5-danh-sách-công-việc-cần-làm)

---

## 🔍 **1. TÌNH TRẠNG HIỆN TẠI CỦA DỰ ÁN**

### ✅ **Đã triển khai:**
- **JWT Authentication**: Access token (1h) và refresh token (3d)
- **Database Tables**: `users`, `failed_login_limits`
- **Rate Limiting**: IP-based với service `rateLimitService.js`
- **Role-based Access Control**: User, Admin, Super Admin
- **Password Security**: bcryptjs với salt rounds
- **Input Validation**: Zod schemas với middleware validation
- **Environment Support**: Development, Test, Staging, Production
- **Debug System**: Granular logging với debug package
- **Access Token Hardening (2025-11-25)**:
  - Thiết lập `iss`, `aud`, `sub` chuẩn hóa (`user:<id>`) và giới hạn lifetime thực tế
  - Chuẩn hóa và lưu `scope`, cho phép bắt buộc scope theo middleware
  - Băm IP/User-Agent (`ip_hash`, `ua_hash`) để ràng buộc token với client khi bật cấu hình
  - Middleware `auth` sử dụng `TokenService.verifyAccessToken()` để kiểm tra issuer, audience, scope, clock-skew và binding
  - Thêm cấu hình động: `JWT_ISSUER`, `JWT_AUDIENCE`, `JWT_ALLOWED_CLOCK_SKEW`, `JWT_DEFAULT_SCOPE`, `ENFORCE_ACCESS_TOKEN_IP_BINDING`, `ENFORCE_ACCESS_TOKEN_UA_BINDING`
- **Token Security Foundation (2025-12-16)**:
  - Migration `0008_token_security_tables.sql` thêm bảng `token_blacklist`, `token_audit_logs` với index hiệu năng
  - Services mới: `tokenBlacklistService.js`, `tokenAuditService.js` tích hợp trong `authService.js`
  - Logout/Logout-all: access token bị blacklist theo `jti`, refresh token bị revoke, ghi audit chi tiết (action + metadata)
  - Kiểm tra blacklist ở middleware xác thực; cleanup expired blacklist/audit được kích hoạt trong luồng auth
  - Tests: `tests/tokenSecurityTest.js` bao phủ login → refresh → logout → logout-all và mismatch cases

### ❌ **Chưa triển khai (cần bổ sung):**
- **Token Cleanup Scheduler**: Chưa có worker/scheduler định kỳ (hiện cleanup chỉ chạy kèm luồng auth)
- **Multiple Device Management UI/API**: Chưa có endpoint quản trị token theo người dùng
- **Key Rotation & KMS**: Chưa triển khai quay vòng khóa và tích hợp KMS

---

## 🏗️ **2. KIẾN TRÚC BẢO MẬT TOKEN ĐỀ XUẤT**

### **A. Database Schema Mở Rộng**

```sql
-- Bảng lưu trữ refresh tokens
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jti TEXT UNIQUE NOT NULL,                    -- JWT ID (unique identifier)
    user_id INTEGER NOT NULL,                    -- User ID
    token_hash TEXT NOT NULL,                    -- Hash của refresh token (bảo mật)
    ip_address TEXT NOT NULL,                    -- IP tại thời điểm đăng nhập
    user_agent TEXT,                             -- User agent string
    device_info TEXT,                            -- Thông tin thiết bị (optional)
    issued_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'revoked', 'expired')),
    revoked_at DATETIME,
    revoked_reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng blacklist cho access tokens (cho revoke ngay lập tức)
CREATE TABLE IF NOT EXISTS token_blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jti TEXT UNIQUE NOT NULL,                    -- JWT ID của access token
    user_id INTEGER NOT NULL,                    -- User ID
    blacklisted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,               -- Khi nào token này hết hạn (để cleanup)
    reason TEXT,                                -- Lý do blacklist
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Bảng audit log cho token operations
CREATE TABLE IF NOT EXISTS token_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,                       -- 'login', 'refresh', 'logout', 'revoke'
    token_jti TEXT,                            -- JTI của token liên quan
    ip_address TEXT,
    user_agent TEXT,
    success BOOLEAN DEFAULT TRUE,
    error_message TEXT,
    metadata TEXT,                             -- JSON metadata
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Index cho performance
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_jti ON refresh_tokens(jti);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_status ON refresh_tokens(status);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON token_blacklist(jti);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_action ON token_audit_logs(user_id, action);
```

### **B. Service Architecture**

```
src/services/
├── tokenService.js          # Token management service
├── tokenBlacklistService.js # Blacklist management
├── tokenAuditService.js     # Audit logging service
├── authService.js           # Enhanced with token tracking
└── tokenCleanupService.js   # Cleanup expired tokens
```

---

## 📅 **3. KẾ HOẠCH TRIỂN KHAI**

### **Phase 1: Foundation (Ưu tiên cao)**
1. Tạo database migrations cho các bảng mới
2. Triển khai TokenService cơ bản
3. Cập nhật AuthService để tích hợp token tracking
4. Thêm logout endpoint với token revocation

### **Phase 2: Enhanced Security (Ưu tiên trung bình)**
1. Triển khai token blacklist mechanism
2. Thêm IP/User-Agent binding validation
3. Triển khai audit logging
4. Thêm multiple device management

### **Phase 3: Maintenance & Optimization (Ưu tiên thấp)**
1. Token cleanup service
2. Performance optimization
3. Monitoring và alerting
4. Key rotation mechanism

---

## 🛠️ **4. CHI TIẾT TRIỂN KHAI**

### **A. JWT Structure Enhancement**

```javascript
// Enhanced JWT payload structure
const tokenPayload = {
  // Subject & issuer/audience hardening
  sub: `${subjectPrefix}:${user.id}`,
  iss: jwtConfig.issuer,
  aud: jwtConfig.audience.length === 1 ? jwtConfig.audience[0] : jwtConfig.audience,

  // Existing identity fields (retained for backwards compatibility)
  user_id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  
  // New security fields
  scope: normalizedScopes.join(jwtConfig.scopeSeparator),
  jti: generateUniqueJTI(),        // JWT ID
  iat: Math.floor(Date.now() / 1000),
  exp: iat + JWT_CONFIG.ACCESS_TOKEN_EXPIRES,
  
  // Binding metadata
  ip_hash: tokenSecurityConfig.enforceAccessTokenIpBinding ? hashIdentifier(requestIP) : undefined,
  ua_hash: tokenSecurityConfig.enforceAccessTokenUaBinding ? createUserAgentHash(userAgent) : undefined,
  session_id: sessionId,
  client_id: clientId,
  
  // Token type
  type: 'access_token' // or 'refresh_token'
};
```

### **B. Enhanced AuthService Methods**

```javascript
// New methods cần thêm vào AuthService
class AuthService {
  // Enhanced login với token tracking
  async login(email, password, ipAddress, userAgent, jwtSecret) {
    // ... existing login logic ...
    
    // Generate tokens với JTI
    const accessJTI = generateUniqueJTI();
    const refreshJTI = generateUniqueJTI();
    
    // Store refresh token in database
    await this.tokenService.storeRefreshToken({
      jti: refreshJTI,
      user_id: user.id,
      token_hash: await hashToken(refreshToken),
      ip_address: ipAddress,
      user_agent: userAgent,
      expires_at: new Date(Date.now() + JWT_CONFIG.REFRESH_TOKEN_EXPIRES * 1000)
    });
    
    // Audit log
    await this.auditService.logTokenAction('login', user.id, {
      ip_address: ipAddress,
      user_agent: userAgent,
      access_jti: accessJTI,
      refresh_jti: refreshJTI
    });
    
    return { accessToken, refreshToken };
  }
  
  // Enhanced refresh token với validation
  async refreshToken(refreshToken, ipAddress, userAgent, jwtSecret) {
    const payload = await verifyToken(refreshToken, jwtSecret);
    
    // Check if refresh token exists and is active
    const storedToken = await this.tokenService.getRefreshToken(payload.jti);
    if (!storedToken || storedToken.status !== 'active') {
      throw new Error('REFRESH_TOKEN_REVOKED');
    }
    
    // Validate IP/User-Agent binding (configurable)
    if (this.config.strictBinding) {
      if (storedToken.ip_address !== ipAddress) {
        await this.auditService.logSuspiciousActivity('ip_mismatch', payload.user_id, {
          stored_ip: storedToken.ip_address,
          request_ip: ipAddress
        });
        throw new Error('IP_ADDRESS_MISMATCH');
      }
    }
    
    // Generate new access token
    const newAccessJTI = generateUniqueJTI();
    // ... generate new access token ...
    
    // Audit log
    await this.auditService.logTokenAction('refresh', payload.user_id, {
      old_refresh_jti: payload.jti,
      new_access_jti: newAccessJTI,
      ip_address: ipAddress
    });
    
    return { access_token: newAccessToken };
  }
  
  // New logout method
  async logout(refreshToken, accessToken, jwtSecret) {
    const refreshPayload = await verifyToken(refreshToken, jwtSecret);
    const accessPayload = await verifyToken(accessToken, jwtSecret);
    
    // Revoke refresh token
    await this.tokenService.revokeRefreshToken(refreshPayload.jti, 'user_logout');
    
    // Blacklist access token (immediate revocation)
    await this.blacklistService.addToBlacklist(accessPayload.jti, {
      user_id: accessPayload.user_id,
      reason: 'user_logout',
      expires_at: new Date(accessPayload.exp * 1000)
    });
    
    // Audit log
    await this.auditService.logTokenAction('logout', refreshPayload.user_id, {
      refresh_jti: refreshPayload.jti,
      access_jti: accessPayload.jti
    });
  }
  
  // Logout all devices
  async logoutAllDevices(userId) {
    // Revoke all refresh tokens
    await this.tokenService.revokeAllUserTokens(userId, 'logout_all_devices');
    
    // Note: Access tokens vẫn valid cho đến khi hết hạn (hoặc implement blacklist toàn bộ)
    
    // Audit log
    await this.auditService.logTokenAction('logout_all', userId, {
      reason: 'user_requested'
    });
  }
}
```

### **C. Enhanced Auth Middleware**

```javascript
// Enhanced middleware với blacklist checking
export const authMiddleware = async (c, next) => {
  const token = extractTokenFromHeader(c);
  const payload = await verifyToken(token, getJwtSecret(c.env));
  
  if (!payload) {
    return c.json(createErrorResponse('Invalid token'), 401);
  }
  
  // Check if token is blacklisted
  const isBlacklisted = await tokenBlacklistService.isBlacklisted(payload.jti);
  if (isBlacklisted) {
    return c.json(createErrorResponse('Token has been revoked'), 401);
  }
  
  // Optional: Check IP binding
  if (c.env.STRICT_IP_BINDING === 'true') {
    const requestIP = getClientIP(c);
    if (payload.ip && payload.ip !== requestIP) {
      // Log suspicious activity
      await auditService.logSuspiciousActivity('ip_mismatch', payload.user_id, {
        token_ip: payload.ip,
        request_ip: requestIP
      });
      return c.json(createErrorResponse('Token IP mismatch'), 401);
    }
  }
  
  // Continue with existing user validation...
  await next();
};
```

---

## ✅ **5. DANH SÁCH CÔNG VIỆC CẦN LÀM**

### **🚨 PRIORITY 1 - Critical Security (Cần làm ngay)**

#### **Database & Migration**
- [ ] **Tạo migration file**: `0003_add_token_security_tables.sql`
  - [ ] Bảng `refresh_tokens` với các trường bảo mật
  - [ ] Bảng `token_blacklist` cho revocation
  - [ ] Bảng `token_audit_logs` cho tracking
  - [ ] Thêm indexes cho performance

#### **Core Services**
- [ ] **Tạo `src/services/tokenService.js`**
  - [ ] `storeRefreshToken()` - Lưu refresh token vào DB
  - [ ] `getRefreshToken()` - Lấy thông tin refresh token
  - [ ] `revokeRefreshToken()` - Thu hồi refresh token
  - [ ] `revokeAllUserTokens()` - Thu hồi tất cả token của user
  - [ ] `validateTokenBinding()` - Kiểm tra IP/UA binding

- [ ] **Tạo `src/services/tokenBlacklistService.js`**
  - [ ] `addToBlacklist()` - Thêm access token vào blacklist
  - [ ] `isBlacklisted()` - Kiểm tra token có bị blacklist
  - [ ] `removeExpiredBlacklist()` - Dọn dẹp blacklist hết hạn

#### **Auth Service Enhancement**
- [ ] **Cập nhật `src/services/authService.js`**
  - [ ] Thêm JTI vào JWT payload
  - [ ] Lưu refresh token metadata vào DB trong `login()`
  - [ ] Validate stored refresh token trong `refreshToken()`
  - [ ] Thêm method `logout()` với token revocation
  - [ ] Thêm method `logoutAllDevices()`

#### **Middleware Enhancement**
- [ ] **Cập nhật `src/middleware/auth.js`**
  - [ ] Kiểm tra blacklist trong middleware
  - [ ] Optional: IP/User-Agent binding validation
  - [ ] Enhanced error handling cho revoked tokens

#### **Routes & API**
- [ ] **Thêm logout endpoint vào `src/routes/auth.js`**
  - [ ] `POST /auth/logout` - Single device logout
  - [ ] `POST /auth/logout-all` - All devices logout
  - [ ] Zod validation schemas cho logout requests

### **🔶 PRIORITY 2 - Enhanced Security Features**

#### **Advanced Security**
- [ ] **Tạo `src/services/tokenAuditService.js`**
  - [ ] `logTokenAction()` - Log token activities
  - [ ] `logSuspiciousActivity()` - Log security events
  - [ ] `getAuditTrail()` - Lấy audit history

- [ ] **IP/User-Agent Binding**
  - [ ] Thêm config `STRICT_IP_BINDING` vào environment
  - [ ] Hash user-agent thay vì lưu full string
  - [ ] Configurable strictness levels

#### **Admin Features**
- [ ] **Thêm admin endpoints cho token management**
  - [ ] `GET /admin/tokens/:userId` - Xem active tokens của user
  - [ ] `DELETE /admin/tokens/:userId` - Revoke all tokens của user
  - [ ] `GET /admin/audit/tokens` - Token audit logs

#### **Utils & Helpers**
- [ ] **Tạo `src/utils/tokenUtils.js`**
  - [ ] `generateUniqueJTI()` - Generate unique JWT ID
  - [ ] `hashToken()` - Hash refresh token for storage
  - [ ] `createUserAgentHash()` - Hash user agent
  - [ ] `getClientIP()` - Extract client IP

### **🔵 PRIORITY 3 - Maintenance & Optimization**

#### **Cleanup & Maintenance**
- [ ] **Tạo `src/services/tokenCleanupService.js`**
  - [ ] Dọn dẹp expired refresh tokens
  - [ ] Dọn dẹp expired blacklist entries
  - [ ] Archive old audit logs

- [ ] **Scheduled Tasks**
  - [ ] Setup cron job cho token cleanup
  - [ ] Tự động xóa audit logs cũ

#### **Configuration & Environment**
- [ ] **Thêm token security configs**
  - [ ] `MAX_REFRESH_TOKENS_PER_USER` - Giới hạn số token/user
  - [ ] `STRICT_IP_BINDING` - Bật/tắt IP binding
  - [ ] `TOKEN_CLEANUP_INTERVAL` - Tần suất cleanup
  - [ ] `AUDIT_LOG_RETENTION` - Thời gian lưu audit logs

#### **Monitoring & Alerting**
- [ ] **Security Monitoring**
  - [ ] Track suspicious login patterns
  - [ ] Alert on multiple device logins
  - [ ] Monitor token revocation patterns

### **📊 PRIORITY 4 - Testing & Documentation**

#### **Testing**
- [ ] **Unit Tests**
  - [ ] Test TokenService methods
  - [ ] Test blacklist functionality
  - [ ] Test logout flows

- [ ] **Integration Tests**
  - [ ] Test login → refresh → logout flow
  - [ ] Test multiple device scenarios
  - [ ] Test security breach scenarios

#### **Documentation**
- [ ] **Update API Documentation**
  - [ ] Document new logout endpoints
  - [ ] Document token security features
  - [ ] Document admin token management

- [ ] **Security Documentation**
  - [ ] Token security best practices
  - [ ] Incident response procedures
  - [ ] Configuration guidelines

---

## 🔧 **CONFIGURATION UPDATES NEEDED**

### **Environment Variables**
```bash
# .dev.vars.development
# Token Security Settings
STRICT_IP_BINDING=false
MAX_REFRESH_TOKENS_PER_USER=5
TOKEN_CLEANUP_INTERVAL=86400
AUDIT_LOG_RETENTION=2592000

# .dev.vars.production  
STRICT_IP_BINDING=true
MAX_REFRESH_TOKENS_PER_USER=3
TOKEN_CLEANUP_INTERVAL=3600
AUDIT_LOG_RETENTION=7776000
```

### **JWT Enhancement**
```javascript
// src/constants/app.js - Update JWT config
export const JWT_CONFIG = {
  SECRET: 'your-super-secret-jwt-key-change-in-production',
  ACCESS_TOKEN_EXPIRES: 3600,      // 1 hour
  REFRESH_TOKEN_EXPIRES: 259200,   // 3 days
  // New configs
  INCLUDE_JTI: true,               // Always include JTI
  INCLUDE_IP_BINDING: true,        // Include IP in payload
  BLACKLIST_ON_LOGOUT: true        // Blacklist access token on logout
};
```

---

## 🎯 **IMPLEMENTATION ROADMAP**

### **Week 1: Foundation**
- Database migrations
- TokenService basic implementation
- AuthService integration

### **Week 2: Core Security**
- Blacklist service
- Enhanced middleware
- Logout endpoints

### **Week 3: Advanced Features**
- Audit logging
- IP binding
- Admin endpoints

### **Week 4: Testing & Polish**
- Comprehensive testing
- Documentation
- Performance optimization

---

## ⚠️ **SECURITY CONSIDERATIONS**

1. **Database Security**: Refresh token phải được hash trước khi lưu DB
2. **Rate Limiting**: Thêm rate limit cho logout endpoints
3. **Input Validation**: Validate tất cả token-related inputs
4. **Error Handling**: Không leak thông tin trong error messages
5. **Audit Trail**: Log tất cả security-sensitive operations
6. **Performance**: Index các trường quan trọng, cleanup định kỳ
7. **Backup Strategy**: Backup audit logs và token data

---

## 📈 **SUCCESS METRICS**

- [ ] Zero unauthorized token usage after logout
- [ ] Audit trail for all token operations
- [ ] Performance impact < 10ms per request
- [ ] 100% test coverage for security features
- [ ] Documentation coverage 100%

---

**Tập tin này sẽ được cập nhật khi triển khai từng phase. Ưu tiên thực hiện theo thứ tự Priority để đảm bảo bảo mật tối ưu.**
