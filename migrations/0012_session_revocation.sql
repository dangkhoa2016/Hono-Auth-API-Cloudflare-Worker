-- T6/B08 session rotation and revocation.
--
-- Append-only like every other migration: 0001-0011 are not touched.
--
-- 1. users.auth_version is the authoritative "which sessions are still alive"
--    counter. A token carries the version it was minted under, and any
--    mismatch means the session was revoked after the token was issued.
--    Default 1 so every existing row is valid under the version it already
--    implies, rather than 0 which would read as "already revoked".
--
-- 2. refresh_tokens gains the state a rotation needs to be atomic:
--    auth_version (what the token was minted under) and consumed_at (the
--    conditional-consume marker). Without consumed_at there is no way to make
--    "this refresh token has already been rotated" a single atomic statement.
--
-- 3. replaced_by gets a partial unique index. Two concurrent rotations of the
--    same token would otherwise each insert a successor and each claim to have
--    replaced the predecessor; at most one predecessor may name a successor.
--    The index is partial because NULL means "not rotated" and SQLite treats
--    multiple NULLs in a unique index as distinct.

ALTER TABLE users ADD COLUMN auth_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE refresh_tokens ADD COLUMN auth_version INTEGER NOT NULL DEFAULT 1;

ALTER TABLE refresh_tokens ADD COLUMN consumed_at DATETIME;

ALTER TABLE refresh_tokens ADD COLUMN rotation_grace_until DATETIME;

CREATE UNIQUE INDEX IF NOT EXISTS idx_refresh_tokens_replaced_by_unique
  ON refresh_tokens (replaced_by)
  WHERE replaced_by IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_active
  ON refresh_tokens (user_id, revoked);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_consumed
  ON refresh_tokens (consumed_at)
  WHERE consumed_at IS NOT NULL;

INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, details, ip_address, user_agent, timestamp)
VALUES (
  NULL,
  'system',
  'database_migration',
  'system',
  '0012_session_revocation',
  '{"migration": "0012_session_revocation", "description": "Added users.auth_version plus refresh token rotation lineage columns and indexes", "columns_added": 4, "indexes_added": 3, "phase": "6"}',
  'system',
  'migration_script',
  datetime('now')
);
