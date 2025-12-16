-- Migration: token security tables for blacklist and audit

-- Blacklist for access tokens (immediate revocation)
CREATE TABLE IF NOT EXISTS token_blacklist (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    jti TEXT UNIQUE NOT NULL,
    user_id INTEGER NOT NULL,
    blacklisted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    expires_at DATETIME NOT NULL,
    reason TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_token_blacklist_jti ON token_blacklist(jti);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_expires ON token_blacklist(expires_at);
CREATE INDEX IF NOT EXISTS idx_token_blacklist_user ON token_blacklist(user_id);

-- Token audit log for authentication lifecycle events
CREATE TABLE IF NOT EXISTS token_audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action TEXT NOT NULL,
    token_jti TEXT,
    refresh_jti TEXT,
    ip_address TEXT,
    user_agent TEXT,
    success INTEGER DEFAULT 1,
    error_message TEXT,
    metadata TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_token_audit_user_action ON token_audit_logs(user_id, action);
CREATE INDEX IF NOT EXISTS idx_token_audit_created ON token_audit_logs(created_at);
