-- Add index on role column in users table for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
