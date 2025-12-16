# 🔐 Token Security Guide (EN) - Hono Auth Worker

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](TOKEN_SECURITY_COMPREHENSIVE_GUIDE.vi.md)

## Scope

This guide captures the current token hardening work (as of 2025-12-16) for the Hono Auth Worker: access/refresh lifecycle, blacklist-based revocation, audit logging, and operational steps.

## What is implemented
- **Access/Refresh tokens**: Access 1h, refresh 3d with JTI per token, scope, issuer/audience/subject hardening, optional IP/UA binding hashes.
- **Persistent refresh tokens**: `refresh_tokens` table (migration 0006) stores SHA-256 hashes, device metadata, revocation status, and reuse detection fields.
- **Blacklist for access tokens**: `token_blacklist` table (migration 0008) blocks any access token JTI that has been revoked (logout or logout-all) until its expiry.
- **Token audit log**: `token_audit_logs` (migration 0008) records login, refresh, logout, logout-all, and suspicious activity with IP/UA metadata.
- **Services**: `tokenService.js` issues/validates/rotates refresh tokens; `tokenBlacklistService.js` adds/queries/cleans blacklisted JTIs; `tokenAuditService.js` writes audit entries and prunes old logs. `authService.js` orchestrates these in login/refresh/logout/logout-all flows and enforces blacklist checks during auth middleware.
- **Cleanup**: Opportunistic cleanup for expired blacklist rows and stale audit logs runs inside auth flows (no dedicated scheduler yet).
- **Tests**: `tests/tokenSecurityTest.js` plus `yarn test:token_security` cover login → refresh → logout → logout-all, blacklist enforcement, and mismatch handling.

## Data model
- **refresh_tokens** (0006): hashed token (`token_hash`), `jti`, `user_id`, issued/expiry, revoked flags, replacement chain, IP/UA, reuse detection fields, indexes on `(user_id, revoked)`, `jti`, `replaced_by`.
- **token_blacklist** (0008): `jti`, `user_id`, `expires_at`, `reason`, timestamps, indexes on `jti`, `expires_at`, `user_id`.
- **token_audit_logs** (0008): `user_id`, `action`, `token_jti`, `refresh_jti`, IP/UA, success flag, message, metadata JSON, indexes on `(user_id, action)` and `created_at`.

## Runtime behavior
- **Auth middleware** rejects access tokens whose `jti` appears in `token_blacklist` before granting route access.
- **Login**: issues access/refresh with JTIs, stores hashed refresh token row, logs `login` audit with IP/UA.
- **Refresh**: verifies JWT + DB hash, checks reuse/revocation, rotates token, logs `refresh`; reuses trigger revoke-all and audit.
- **Logout**: requires valid access + refresh; revokes the refresh row, blacklists access JTI until `exp`, logs `logout` (or `logout_mismatch` when IDs differ).
- **Logout-all**: revokes all active refresh tokens for the user, optionally blacklists the presented access JTI, logs `logout_all` / `logout_all_mismatch`.
- **Cleanup**: periodic calls inside auth flows prune expired blacklist entries and old audit rows (defaults in services); a dedicated cron/queue worker is still pending.

## Operations
- **Run migrations**: `yarn db:migrate` (dev) or `yarn db:migrate:test` (test) to apply 0006/0008.
- **Run token security tests**: `yarn test:initdb && yarn test:token_security` (or `npm` equivalents).
- **Config knobs** (dynamic config via `dynamicConfig.js`): issuer, audience, clock skew, default scope, IP/UA binding toggles, rate limit controls; JWT secret in Wrangler secrets.
- **Logging**: debug namespaces `hono-auth-api:services:token*` and `hono-auth-api:routes:*` help trace token flows.

## Remaining gaps
- Scheduled cleanup worker for blacklist/audit tables (current cleanup is opportunistic only).
- Admin-facing session/device management endpoints and UI.
- Key rotation with KMS-backed secrets.
