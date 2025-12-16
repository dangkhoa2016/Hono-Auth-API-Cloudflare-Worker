-- Test User Seed Data
-- This file creates test users with different roles for testing admin endpoints
-- All users use password: password123

-- ============================================================================
-- RESET AUDIT TABLES FOR CLEAN TEST ENVIRONMENT
-- ============================================================================

-- Reset threat detections (must be first due to potential foreign keys)
DELETE FROM threat_detections;
DELETE FROM sqlite_sequence WHERE name='threat_detections';

-- Reset incident response actions (references incidents)  
DELETE FROM incident_response_actions;
DELETE FROM sqlite_sequence WHERE name='incident_response_actions';

-- Reset incident timeline (references incidents)
DELETE FROM incident_timeline;
DELETE FROM sqlite_sequence WHERE name='incident_timeline';

-- Reset security incidents
DELETE FROM security_incidents;
DELETE FROM sqlite_sequence WHERE name='security_incidents';

-- Reset audit archive
DELETE FROM audit_logs_archive;
DELETE FROM sqlite_sequence WHERE name='audit_logs_archive';

-- Reset main audit logs (this may have foreign key references from other tables)
DELETE FROM audit_logs;
DELETE FROM sqlite_sequence WHERE name='audit_logs';

-- Reset failed login limits (related to security)
DELETE FROM failed_login_limits;
DELETE FROM sqlite_sequence WHERE name='failed_login_limits';

-- Reset refresh tokens (references users)
DELETE FROM refresh_tokens;
DELETE FROM sqlite_sequence WHERE name='refresh_tokens';

-- Reset rate limit counters
DELETE FROM rate_limit_counters;
DELETE FROM sqlite_sequence WHERE name='rate_limit_counters';

-- ============================================================================
-- RESET USER DATA
-- ============================================================================

-- delete all Users
DELETE FROM users;
-- reset the auto-incrementing primary key
DELETE FROM sqlite_sequence WHERE name='users';

-- Insert test users with different roles
INSERT OR IGNORE INTO users (
  full_name, 
  email, 
  password, 
  role, 
  status, 
  created_at, 
  updated_at
) VALUES 

-- Super Admin test user
(
  'Test Super Admin User', 
  'test-superadmin@example.com', 
  '$2a$10$oZhSJOLW55fHD2NTwGy/w.4/RoEoFvxJuVrOE6thh9hfHqTjJ.DRK', 
  'super_admin', 
  'active', 
  datetime('now'), 
  datetime('now')
),

-- Regular test user
(
  'Test Regular User', 
  'test-user@example.com', 
  '$2a$10$oZhSJOLW55fHD2NTwGy/w.4/RoEoFvxJuVrOE6thh9hfHqTjJ.DRK', 
  'user', 
  'active', 
  datetime('now'), 
  datetime('now')
),

-- Admin test user
(
  'Test Admin User', 
  'test-admin@example.com', 
  '$2a$10$oZhSJOLW55fHD2NTwGy/w.4/RoEoFvxJuVrOE6thh9hfHqTjJ.DRK', 
  'admin', 
  'active', 
  datetime('now'), 
  datetime('now')
),

-- Additional test users for list/pagination testing
(
  'Test User 2', 
  'test-user2@example.com', 
  '$2a$10$oZhSJOLW55fHD2NTwGy/w.4/RoEoFvxJuVrOE6thh9hfHqTjJ.DRK', 
  'user', 
  'active', 
  datetime('now'), 
  datetime('now')
),

(
  'Test Inactive User', 
  'test-inactive@example.com', 
  '$2a$10$oZhSJOLW55fHD2NTwGy/w.4/RoEoFvxJuVrOE6thh9hfHqTjJ.DRK', 
  'user', 
  'inactive', 
  datetime('now'), 
  datetime('now')
);

-- Verify the inserted users
SELECT 
  id, 
  full_name, 
  email, 
  role, 
  status, 
  created_at 
FROM users 
WHERE email LIKE 'test-%@example.com' 
ORDER BY role, email;

-- ============================================================================
-- CREATE SAMPLE AUDIT DATA FOR TESTING
-- ============================================================================

-- Insert sample audit logs for testing purposes
INSERT INTO audit_logs (
    action, actor_id, actor_role, actor_email,
    target_type, target_id, target_identifier,
    ip_address, user_agent, request_id,
    details, status, timestamp
) VALUES 

-- System initialization logs
(
    'SYSTEM_INIT', NULL, 'SYSTEM', 'system@internal',
    'SYSTEM', 'database', 'Database Initialization',
    '127.0.0.1', 'test-runner/1.0', 'req-init-001',
    '{"operation": "database_reset", "test_environment": true}',
    'SUCCESS', datetime('now', '-10 minutes')
),

-- User creation logs (using the actual user IDs from above)
(
    'USER_CREATE', 1, 'SYSTEM', 'system@internal',
    'USER', '1', 'test-superadmin@example.com',
    '127.0.0.1', 'test-runner/1.0', 'req-create-001',
    '{"user_role": "super_admin", "created_by": "system"}',
    'SUCCESS', datetime('now', '-9 minutes')
),

(
    'USER_CREATE', 1, 'SYSTEM', 'system@internal',
    'USER', '2', 'test-user@example.com',
    '127.0.0.1', 'test-runner/1.0', 'req-create-002',
    '{"user_role": "user", "created_by": "system"}',
    'SUCCESS', datetime('now', '-8 minutes')
),

(
    'USER_CREATE', 1, 'SYSTEM', 'system@internal',
    'USER', '3', 'test-admin@example.com',
    '127.0.0.1', 'test-runner/1.0', 'req-create-003',
    '{"user_role": "admin", "created_by": "system"}',
    'SUCCESS', datetime('now', '-7 minutes')
),

-- Sample login logs
(
    'LOGIN_SUCCESS', 1, 'super_admin', 'test-superadmin@example.com',
    'AUTH', '1', 'test-superadmin@example.com',
    '192.168.1.100', 'Mozilla/5.0 Test Browser', 'req-login-001',
    '{"login_method": "password", "session_duration": 3600}',
    'SUCCESS', datetime('now', '-6 minutes')
),

(
    'LOGIN_SUCCESS', 3, 'admin', 'test-admin@example.com',
    'AUTH', '3', 'test-admin@example.com',
    '192.168.1.101', 'Mozilla/5.0 Test Browser', 'req-login-002',
    '{"login_method": "password", "session_duration": 3600}',
    'SUCCESS', datetime('now', '-5 minutes')
),

(
    'LOGIN_FAILED', NULL, 'unknown', 'invalid@example.com',
    'AUTH', 'unknown', 'invalid@example.com',
    '192.168.1.102', 'Mozilla/5.0 Test Browser', 'req-login-003',
    '{"reason": "invalid_credentials", "attempts": 1}',
    'FAILED', datetime('now', '-4 minutes')
),

-- Admin operations
(
    'ADMIN_USER_LIST', 3, 'admin', 'test-admin@example.com',
    'USER', 'all', 'user_list_query',
    '192.168.1.101', 'Mozilla/5.0 Test Browser', 'req-admin-001',
    '{"operation": "list_users", "filters": {"status": "active"}}',
    'SUCCESS', datetime('now', '-3 minutes')
),

(
    'AUDIT_LOGS_ACCESS', 3, 'admin', 'test-admin@example.com',
    'AUDIT', 'logs', 'audit_logs_query',
    '192.168.1.101', 'Mozilla/5.0 Test Browser', 'req-audit-001',
    '{"operation": "view_audit_logs", "limit": 50}',
    'SUCCESS', datetime('now', '-2 minutes')
),

-- Security events
(
    'SECURITY_EVENT', NULL, 'SYSTEM', 'system@security',
    'SECURITY', 'rate_limit', 'rate_limit_exceeded',
    '192.168.1.999', 'Suspicious Bot/1.0', 'req-security-001',
    '{"event_type": "rate_limit_exceeded", "requests": 100, "timeframe": "1_minute"}',
    'SECURITY_EVENT', datetime('now', '-1 minute')
);

-- Insert sample security incident for testing
INSERT INTO security_incidents (
    id, type, severity, status, title, description,
    metadata, detected_at, updated_at, created_by
) VALUES (
    'incident-test-001',
    'suspicious_login',
    'medium',
    'investigating',
    'Multiple Failed Login Attempts',
    'Detected multiple failed login attempts from suspicious IP address',
    '{"ip": "192.168.1.999", "attempts": 5, "pattern": "brute_force"}',
    datetime('now', '-30 minutes'),
    datetime('now', '-25 minutes'),
    'system'
);

-- Insert incident timeline entry
INSERT INTO incident_timeline (
    incident_id, timestamp, event_type, description, actor, details
) VALUES (
    'incident-test-001',
    datetime('now', '-30 minutes'),
    'detection',
    'Incident automatically detected by security monitoring',
    'system',
    '{"detector": "rate_limit_monitor", "confidence": 0.85}'
),
(
    'incident-test-001',
    datetime('now', '-25 minutes'),
    'escalation',
    'Incident escalated due to continued suspicious activity',
    'system',
    '{"escalation_reason": "continued_attempts", "new_severity": "medium"}'
);

-- Verify audit data was created
SELECT 
    COUNT(*) as total_audit_logs,
    COUNT(CASE WHEN action LIKE 'LOGIN_%' THEN 1 END) as login_logs,
    COUNT(CASE WHEN action LIKE 'USER_%' THEN 1 END) as user_logs,
    COUNT(CASE WHEN status = 'SUCCESS' THEN 1 END) as success_logs,
    COUNT(CASE WHEN status = 'FAILED' THEN 1 END) as failed_logs
FROM audit_logs;

SELECT 
    COUNT(*) as total_incidents
FROM security_incidents;

-- Show recent audit activity
SELECT 
    action, actor_email, target_identifier, status, timestamp
FROM audit_logs 
ORDER BY timestamp DESC 
LIMIT 5;
