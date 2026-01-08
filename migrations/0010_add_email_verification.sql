-- Migration: Add email verification columns to users table
-- Purpose: Store pending email and verification token for email change requests
-- Date: 2026-01-08

-- Add new_email column to store the requested email address before verification
ALTER TABLE users ADD COLUMN new_email TEXT;

-- Add verification token for email change
ALTER TABLE users ADD COLUMN email_verification_token TEXT;

-- Add expiry for the verification token (usually 24-48 hours)
ALTER TABLE users ADD COLUMN email_verification_expires_at TEXT;

-- Create index for fast token lookup
CREATE INDEX IF NOT EXISTS idx_users_email_verification_token ON users(email_verification_token);
