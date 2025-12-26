-- Migration: Add activation token columns to users table
-- Purpose: Store activation token for email verification with expiry
-- Date: 2025-12-19

-- Add activation token column (64 char random string)
ALTER TABLE users ADD COLUMN activation_token TEXT;

-- Add activation token expiry (2 days from creation)
ALTER TABLE users ADD COLUMN activation_token_expires_at TEXT;

-- Add timestamp when user was first activated (to track if ever activated)
ALTER TABLE users ADD COLUMN activated_at TEXT;

-- Add flag to track if user was disabled by admin (prevents re-activation via link)
ALTER TABLE users ADD COLUMN disabled_by_admin INTEGER DEFAULT 0;

-- Create index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_users_activation_token ON users(activation_token);

-- Create index for cleanup of expired tokens
CREATE INDEX IF NOT EXISTS idx_users_activation_token_expires ON users(activation_token_expires_at);
