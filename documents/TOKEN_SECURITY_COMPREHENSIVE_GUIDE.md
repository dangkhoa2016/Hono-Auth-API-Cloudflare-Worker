
# 🔐 TOKEN SECURITY COMPREHENSIVE GUIDE

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](TOKEN_SECURITY_COMPREHENSIVE_GUIDE_vi.vi.md)

## Scope
Summarizes token security hardening: access/refresh lifecycle, blacklist, audit logging, and ops guidance.

## Implemented
- **Access/Refresh tokens**: Access 1h, refresh 3d, each with JTI, scope, standard iss/aud/sub; optional IP/UA hashing when enabled.
- **Refresh storage**: `refresh_tokens` table (migration 0006) stores SHA-256 hash, device metadata, revoke flag, reuse detection chain.
- **Access blacklist**: `token_blacklist` (migration 0008) blocks revoked access JTIs until expiry.
- **Token audit logs**: `token_audit_logs` (migration 0008) capture login, refresh, logout, logout-all, suspicious actions with IP/UA and metadata.
- **Services**: `tokenService.js` (issue/validate/rotate refresh), `tokenBlacklistService.js` (add/query/cleanup blacklist), `tokenAuditService.js` (log + cleanup); `authService.js` orchestrates login/refresh/logout/logout-all and middleware checks blacklist.
- **Cleanup**: Opportunistic cleanup of expired blacklist entries and old audits occurs in auth flows (no dedicated scheduler yet).
- **Tests**: `tests/tokenSecurityTest.js` + `yarn test:token_security` cover login → refresh → logout → logout-all, blacklist enforcement, mismatch cases.

## Data model
- **refresh_tokens** (0006): `token_hash`, `jti`, `user_id`, issued/expiry, `revoked`, `replaced_by`, IP/UA, reuse detection; indexes on `(user_id, revoked)`, `jti`, `replaced_by`.
- **token_blacklist** (0008): `jti`, `user_id`, `expires_at`, `reason`, timestamps; indexes on `jti`, `expires_at`, `user_id`.
- **token_audit_logs** (0008): `user_id`, `action`, `token_jti`, `refresh_jti`, IP/UA, `success`, `message`, `metadata` JSON; indexes on `(user_id, action)` and `created_at`.

### Table structure details
- **refresh_tokens**
	- Identity: `id` (PK), `jti` (unique), `user_id` (FK users).
	- Token state: `token_hash` (SHA-256 of refresh), `issued_at`, `expires_at`, `revoked` flag, `revoked_at`, `revocation_reason`, `replaced_by` chain.
	- Reuse detection: `reuse_detected_at`, `reuse_ip`, `reuse_user_agent`.
	- Context: `ip_address`, `user_agent` (binding optional via config).
	- Indices: `jti` lookup; `(user_id, revoked)` for active selection; `replaced_by` for rotation chain.
- **token_blacklist**
	- Identity: `id` (PK), `jti` (unique), `user_id` (FK users).
	- Revocation: `blacklisted_at`, `expires_at`, `reason`; timestamps for auditing.
	- Indices: `jti` fast check; `expires_at` for cleanup; `user_id` for user-wide revocation.
- **token_audit_logs**
	- Identity: `id` (PK), `user_id` (FK users).
	- Event: `action` (`login`, `refresh`, `logout`, `logout_all`, suspicious), `token_jti`, `refresh_jti`.
	- Context: `ip_address`, `user_agent`, `success`, `error_message`, `metadata` JSON.
	- Indices: `(user_id, action)` for filtering; `created_at` for retention cleanup.

## Runtime behavior
- **Auth middleware**: denies access tokens whose JTI is in `token_blacklist` before route authorization.
- **Login**: issues access/refresh with JTI, stores hashed refresh, logs `login` with IP/UA.
- **Refresh**: validates JWT + DB hash, checks reuse/revoke, rotates tokens, logs `refresh`; on reuse, revoke-all and log warning.
- **Logout**: requires valid access + refresh; revokes refresh row, blacklists access JTI until `exp`, logs `logout` (or `logout_mismatch` on JTI mismatch).
- **Logout-all**: revokes all active refresh tokens for the user, optionally blacklists current access, logs `logout_all` / `logout_all_mismatch`.
- **Cleanup**: opportunistic removal of expired blacklist entries and stale audits (no dedicated worker yet).

## Operations
- **Run migrations**: `yarn db:migrate` (dev) or `yarn db:migrate:test` (test) to apply 0006/0008.
- **Run token security tests**: `yarn test:initdb && yarn test:token_security` (or npm equivalents).
- **Configuration** (via `dynamicConfig.js`): issuer, audience, clock skew, default scope, IP/UA binding toggle, rate-limit control; JWT secret stored in Wrangler secrets.
- **Logging**: debug namespaces `hono-auth-api:services:token*` and `hono-auth-api:routes:*` to trace token flows.

## Key flows (code samples)
```javascript
// Issue access/refresh, persist hashed refresh, and enforce quota
const { accessToken, refreshToken } = await tokenService.issueTokenPair(user, {
	ipAddress: c.req.header('cf-connecting-ip'),
	userAgent: c.req.header('user-agent')
});

// Check blacklist before authorizing access token
const isBlocked = await tokenBlacklistService.isBlacklisted(accessPayload.jti);
if (isBlocked) return c.json({ success: false, error: 'ACCESS_TOKEN_BLACKLISTED' }, 401);

// Logout: revoke refresh + blacklist access, then audit
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

// Refresh rotation with reuse detection
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

## Remaining gaps
- No dedicated worker/scheduler yet for blacklist/audit cleanup (opportunistic only).
- No admin/device session management endpoints/UI.
- No KMS-backed key rotation process yet.
