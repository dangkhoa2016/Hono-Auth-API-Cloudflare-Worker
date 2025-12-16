-- Migration: 0003_add_audit_logs.sql
-- Create audit logs table for comprehensive audit trail
-- This table stores all audit events with role-based access control support

CREATE TABLE IF NOT EXISTS audit_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    
    -- Core audit information
    action VARCHAR(50) NOT NULL,           -- USER_CREATE, USER_DELETE, LOGIN, etc.
    actor_id INTEGER,                      -- User ID who performed the action
    actor_role VARCHAR(20),                -- Role of the actor at time of action
    actor_email VARCHAR(255),              -- Email of the actor (for reference)
    
    -- Target information
    target_type VARCHAR(50),               -- USER, SYSTEM, KV_CONFIG, etc.
    target_id VARCHAR(100),                -- ID of the target resource
    target_identifier VARCHAR(255),       -- Human-readable identifier (email, name, etc.)
    
    -- Request context
    ip_address VARCHAR(45),                -- IPv4/IPv6 address
    user_agent TEXT,                       -- Browser/client information
    request_id VARCHAR(36),                -- UUID for request correlation
    
    -- Action details
    details JSON,                          -- Structured details about the action
    old_values JSON,                       -- Previous values (for UPDATE actions)
    new_values JSON,                       -- New values (for UPDATE actions)
    
    -- Metadata
    status VARCHAR(20) DEFAULT 'SUCCESS',  -- SUCCESS, FAILED, ERROR, SECURITY_EVENT
    error_message TEXT,                    -- Error details if status != SUCCESS
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign key constraint
    FOREIGN KEY (actor_id) REFERENCES users(id)
);

-- Performance indexes for common queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor_id ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON audit_logs(timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_logs_target_type ON audit_logs(target_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_ip_address ON audit_logs(ip_address);

-- Full-text search indexes for advanced search
CREATE INDEX IF NOT EXISTS idx_audit_logs_search_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_search_email ON audit_logs(actor_email);
CREATE INDEX IF NOT EXISTS idx_audit_logs_search_target ON audit_logs(target_identifier);

-- KV Config specific indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_kv_config ON audit_logs(target_type, target_id) 
WHERE target_type = 'KV_CONFIG';

-- Composite indexes for common search patterns
CREATE INDEX IF NOT EXISTS idx_audit_logs_role_timestamp ON audit_logs(actor_role, timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action_timestamp ON audit_logs(action, timestamp DESC);

-- Performance optimization for role-based filtering
CREATE INDEX IF NOT EXISTS idx_audit_logs_exclude_super_admin ON audit_logs(timestamp DESC) 
WHERE actor_role != 'super_admin';

-- Insert initial system audit log entry
INSERT INTO audit_logs (
    action, actor_id, actor_role, actor_email,
    target_type, target_id, target_identifier,
    details, status, timestamp
) VALUES (
    'SYSTEM_AUDIT_INIT',
    NULL,
    'SYSTEM',
    'system@internal',
    'SYSTEM',
    'audit_logs_table',
    'Audit Logs Table Initialization',
    '{"operation": "table_creation", "version": "0003", "features": ["role_based_access", "search_support", "kv_audit"]}',
    'SUCCESS',
    CURRENT_TIMESTAMP
);
