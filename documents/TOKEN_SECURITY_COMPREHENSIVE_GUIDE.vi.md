# 🔐 HƯỚNG DẪN BẢO MẬT TOKEN

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](TOKEN_SECURITY_COMPREHENSIVE_GUIDE.vi.md)

## Phạm vi
Tóm tắt trạng thái tăng cường bảo mật token: vòng đời access/refresh, cơ chế blacklist, ghi audit và quy trình vận hành.

## Đã triển khai
- **Access/Refresh tokens**: Access 1h, refresh 3d, mỗi token có JTI, scope, iss/aud/sub chuẩn hóa; hỗ trợ băm IP/UA nếu bật cấu hình.
- **Lưu trữ refresh token**: Bảng `refresh_tokens` (migration 0006) lưu SHA-256 hash, metadata thiết bị, cờ revoke, trường phát hiện reuse.
- **Blacklist access token**: Bảng `token_blacklist` (migration 0008) chặn mọi access token JTI đã revoke (logout hoặc logout-all) đến khi hết hạn.
- **Nhật ký token**: Bảng `token_audit_logs` (migration 0008) ghi nhận login, refresh, logout, logout-all, hoạt động đáng ngờ kèm IP/UA và metadata.
- **Dịch vụ**: `tokenService.js` (phát hành/kiểm tra/rotate refresh), `tokenBlacklistService.js` (thêm/truy vấn/dọn blacklist), `tokenAuditService.js` (ghi log + dọn cũ); `authService.js` điều phối login/refresh/logout/logout-all và kiểm tra blacklist trong middleware.
- **Dọn dẹp**: Cleanup opportunistic cho blacklist hết hạn và audit cũ chạy trong luồng auth (chưa có scheduler riêng).
- **Kiểm thử**: `tests/tokenSecurityTest.js` + `yarn test:token_security` bao phủ login → refresh → logout → logout-all, blacklist enforcement và mismatch.

## Mô hình dữ liệu
- **refresh_tokens** (0006): `token_hash`, `jti`, `user_id`, thời gian phát hành/hết hạn, cờ revoked, chuỗi thay thế (`replaced_by`), IP/UA, trường phát hiện reuse; index trên `(user_id, revoked)`, `jti`, `replaced_by`.
- **token_blacklist** (0008): `jti`, `user_id`, `expires_at`, `reason`, timestamps; index trên `jti`, `expires_at`, `user_id`.
- **token_audit_logs** (0008): `user_id`, `action`, `token_jti`, `refresh_jti`, IP/UA, cờ success, message, metadata JSON; index trên `(user_id, action)` và `created_at`.

### Chi tiết cấu trúc bảng
- **refresh_tokens**
  - Định danh: `id` (PK), `jti` (duy nhất), `user_id` (FK users).
  - Trạng thái token: `token_hash` (SHA-256 của refresh), `issued_at`, `expires_at`, cờ `revoked`, `revoked_at`, `revocation_reason`, chuỗi `replaced_by`.
  - Phát hiện reuse: `reuse_detected_at`, `reuse_ip`, `reuse_user_agent`.
  - Ngữ cảnh: `ip_address`, `user_agent` (ràng buộc bật/tắt qua cấu hình).
  - Chỉ mục: `jti` tra cứu nhanh; `(user_id, revoked)` lọc token còn hiệu lực; `replaced_by` truy vết rotation.
- **token_blacklist**
  - Định danh: `id` (PK), `jti` (duy nhất), `user_id` (FK users).
  - Thu hồi: `blacklisted_at`, `expires_at`, `reason`; timestamps phục vụ audit.
  - Chỉ mục: `jti` kiểm tra nhanh; `expires_at` cho cleanup; `user_id` cho thu hồi toàn user.
- **token_audit_logs**
  - Định danh: `id` (PK), `user_id` (FK users).
  - Sự kiện: `action` (`login`, `refresh`, `logout`, `logout_all`, nghi ngờ), `token_jti`, `refresh_jti`.
  - Ngữ cảnh: `ip_address`, `user_agent`, `success`, `error_message`, `metadata` JSON.
  - Chỉ mục: `(user_id, action)` cho lọc nhanh; `created_at` cho dọn retention.

## Hành vi runtime
- **Middleware auth**: từ chối access token nếu JTI nằm trong `token_blacklist` trước khi cấp quyền route.
- **Login**: phát hành access/refresh có JTI, lưu refresh đã băm, ghi audit `login` kèm IP/UA.
- **Refresh**: kiểm tra JWT + hash DB, kiểm tra reuse/revoke, rotate token, ghi audit `refresh`; nếu reuse thì revoke-all và log cảnh báo.
- **Logout**: yêu cầu access + refresh hợp lệ; revoke refresh row, blacklist access JTI tới `exp`, ghi audit `logout` (hoặc `logout_mismatch` nếu JTI không khớp).
- **Logout-all**: revoke mọi refresh đang hoạt động của user, tùy chọn blacklist access hiện tại, ghi audit `logout_all` / `logout_all_mismatch`.
- **Cleanup**: dọn blacklist hết hạn và audit cũ trong luồng auth (chưa có worker riêng).

## Vận hành
- **Chạy migrations**: `yarn db:migrate` (dev) hoặc `yarn db:migrate:test` (test) để áp dụng 0006/0008.
- **Chạy kiểm thử bảo mật token**: `yarn test:initdb && yarn test:token_security` (hoặc lệnh npm tương đương).
- **Thông số cấu hình** (qua `dynamicConfig.js`): issuer, audience, clock skew, default scope, bật/tắt ràng buộc IP/UA, điều khiển rate limit; secret JWT lưu trong Wrangler secrets.
- **Ghi log**: namespace debug `hono-auth-api:services:token*` và `hono-auth-api:routes:*` để truy vết luồng token.

## Luồng chính (code sample)
```javascript
// Phát hành access/refresh, lưu refresh đã hash và kiểm soát quota
const { accessToken, refreshToken } = await tokenService.issueTokenPair(user, {
  ipAddress: c.req.header('cf-connecting-ip'),
  userAgent: c.req.header('user-agent')
});

// Kiểm tra blacklist trước khi cấp quyền
const isBlocked = await tokenBlacklistService.isBlacklisted(accessPayload.jti);
if (isBlocked) return c.json({ success: false, error: 'ACCESS_TOKEN_BLACKLISTED' }, 401);

// Logout: revoke refresh + blacklist access và ghi audit
await tokenService.revokeRefreshToken(refreshPayload.jti, 'USER_LOGOUT');
await tokenBlacklistService.addToBlacklist({
  jti: accessPayload.jti,
  userId: accessPayload.user_id,
  expiresAt: new Date(accessPayload.exp * 1000),
  reason: 'USER_LOGOUT'
});
await tokenAuditService.logTokenAction('logout', accessPayload.user_id, {
  tokenJti: accessPayload.jti,
  refreshJti: refreshPayload.jti,
  ipAddress: c.req.header('cf-connecting-ip'),
  userAgent: c.req.header('user-agent')
});

// Refresh rotation kèm phát hiện reuse
const validation = await tokenService.validateRefreshToken(refreshToken, {
  ipAddress: c.req.header('cf-connecting-ip'),
  userAgent: c.req.header('user-agent')
});
if (!validation.success) return c.json({ success: false, error: validation.error }, validation.statusCode);
const rotated = await tokenService.rotateRefreshToken({
  record: validation.record,
  user,
  metadata: { ipAddress: c.req.header('cf-connecting-ip'), userAgent: c.req.header('user-agent') }
});
await tokenAuditService.logTokenAction('refresh', user.id, {
  tokenJti: rotated.accessTokenPayload.jti,
  refreshJti: rotated.refreshTokenPayload.jti,
  ipAddress: c.req.header('cf-connecting-ip'),
  userAgent: c.req.header('user-agent')
});
```

## Thiếu sót còn lại
- Chưa có worker/scheduler riêng cho cleanup blacklist/audit (hiện chỉ opportunistic).
- Chưa có endpoint/UI quản trị thiết bị/phiên đăng nhập.
- Chưa có quy trình xoay vòng khóa với KMS.
