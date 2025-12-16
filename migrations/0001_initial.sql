-- Migration to create users table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive', 'suspended')),
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Migration to create failed_login_limits table
CREATE TABLE IF NOT EXISTS failed_login_limits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_address TEXT NOT NULL,
    attempts_count INTEGER DEFAULT 1,
    last_attempt_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(ip_address)
);

-- Insert a test user (password: password123)
-- Hash được tạo từ bcrypt.hash('password123', 10)
INSERT OR IGNORE INTO users (full_name, email, password) 
VALUES ('Super Admin User', 'super@admin.user', '$2a$10$eSyCEpnnr10S7zk4oAC/f.palOwaEFex.mgTAa1UBymY706jdWd8K');
