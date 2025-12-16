-- Migration to add role column to users table
ALTER TABLE users ADD COLUMN role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin', 'super_admin'));

-- Set user with id=1 as super_admin
UPDATE users SET role = 'super_admin' WHERE id = 1;
