-- Migration 0004: Add Audit Archive Table and Indexes
-- This migration creates the audit_logs_archive table for Phase 3 archival functionality
-- and adds additional performance indexes

-- Create audit logs archive table
CREATE TABLE IF NOT EXISTS audit_logs_archive (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  original_id INTEGER NOT NULL,
  actor_id INTEGER,
  actor_role TEXT NOT NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  details TEXT, -- JSON
  ip_address TEXT,
  user_agent TEXT,
  timestamp DATETIME NOT NULL,
  archived_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(original_id)
);

-- Create indexes for archive table performance
CREATE INDEX IF NOT EXISTS idx_archive_actor_id ON audit_logs_archive(actor_id);
CREATE INDEX IF NOT EXISTS idx_archive_actor_role ON audit_logs_archive(actor_role);
CREATE INDEX IF NOT EXISTS idx_archive_action ON audit_logs_archive(action);
CREATE INDEX IF NOT EXISTS idx_archive_target_type ON audit_logs_archive(target_type);
CREATE INDEX IF NOT EXISTS idx_archive_timestamp ON audit_logs_archive(timestamp);
CREATE INDEX IF NOT EXISTS idx_archive_archived_at ON audit_logs_archive(archived_at);
CREATE INDEX IF NOT EXISTS idx_archive_original_id ON audit_logs_archive(original_id);
CREATE INDEX IF NOT EXISTS idx_archive_ip_address ON audit_logs_archive(ip_address);

-- Create composite indexes for common query patterns in archive
CREATE INDEX IF NOT EXISTS idx_archive_actor_action ON audit_logs_archive(actor_id, action);
CREATE INDEX IF NOT EXISTS idx_archive_role_action ON audit_logs_archive(actor_role, action);
CREATE INDEX IF NOT EXISTS idx_archive_timestamp_action ON audit_logs_archive(timestamp, action);
CREATE INDEX IF NOT EXISTS idx_archive_target_timestamp ON audit_logs_archive(target_type, timestamp);

-- Add additional performance indexes to main audit_logs table (using existing column names)
CREATE INDEX IF NOT EXISTS idx_audit_actor_role_timestamp ON audit_logs(actor_role, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_action_timestamp ON audit_logs(action, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_target_action ON audit_logs(target_type, action);
CREATE INDEX IF NOT EXISTS idx_audit_ip_timestamp ON audit_logs(ip_address, timestamp);

-- Create indexes for analytics queries (using existing column names)
CREATE INDEX IF NOT EXISTS idx_audit_actor_action_timestamp ON audit_logs(actor_id, action, timestamp);
CREATE INDEX IF NOT EXISTS idx_audit_role_target_timestamp ON audit_logs(actor_role, target_type, timestamp);

-- Add system log entry for migration (using existing column names)
INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, details, ip_address, user_agent, timestamp)
VALUES (
  NULL, 
  'system', 
  'database_migration', 
  'system', 
  '0004_add_audit_archive', 
  '{"migration": "0004_add_audit_archive", "description": "Added audit archive table and performance indexes for Phase 3", "tables_created": ["audit_logs_archive"], "indexes_created": 15, "phase": "3"}',
  'system',
  'migration_script',
  datetime('now')
);
