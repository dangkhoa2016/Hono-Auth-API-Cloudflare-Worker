-- Migration: security enhancements for token rotation and adaptive rate limiting

-- Refresh token persistence with rotation metadata
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token_hash TEXT NOT NULL,
    jti TEXT NOT NULL UNIQUE,
    issued_at DATETIME NOT NULL,
    expires_at DATETIME NOT NULL,
    revoked INTEGER NOT NULL DEFAULT 0,
    revoked_at DATETIME,
    revocation_reason TEXT,
    replaced_by TEXT,
    ip_address TEXT,
    user_agent TEXT,
    reuse_detected_at DATETIME,
    reuse_ip TEXT,
    reuse_user_agent TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_revoked ON refresh_tokens(user_id, revoked);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_jti ON refresh_tokens(jti);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_replaced_by ON refresh_tokens(replaced_by);

-- Adaptive multi-dimensional rate limit counters
CREATE TABLE IF NOT EXISTS rate_limit_counters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    context TEXT NOT NULL,
    identifier TEXT NOT NULL,
    attempts_count INTEGER NOT NULL DEFAULT 1,
    first_attempt_at DATETIME NOT NULL,
    last_attempt_at DATETIME NOT NULL,
    metadata TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(context, identifier)
);

CREATE INDEX IF NOT EXISTS idx_rate_limit_context_identifier ON rate_limit_counters(context, identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_last_attempt ON rate_limit_counters(last_attempt_at);
