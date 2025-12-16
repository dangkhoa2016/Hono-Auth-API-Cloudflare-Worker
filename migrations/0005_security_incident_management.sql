-- Migration 0005: Add security incident management tables
-- Phase 4: Security incident response and management
-- Date: 2025-07-15
-- Description: Create tables for security incident tracking, response actions, and monitoring

-- ============================================================================
-- SECURITY INCIDENTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS security_incidents (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL CHECK (status IN ('detected', 'investigating', 'contained', 'resolved', 'false_positive')),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    metadata TEXT, -- JSON metadata about the incident
    detected_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    resolved_at TEXT,
    assignee TEXT,
    notes TEXT,
    tags TEXT, -- JSON array of tags
    created_by TEXT DEFAULT 'system'
);

-- Create indexes for security_incidents
CREATE INDEX IF NOT EXISTS idx_security_incidents_type ON security_incidents(type);
CREATE INDEX IF NOT EXISTS idx_security_incidents_severity ON security_incidents(severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status ON security_incidents(status);
CREATE INDEX IF NOT EXISTS idx_security_incidents_detected_at ON security_incidents(detected_at);
CREATE INDEX IF NOT EXISTS idx_security_incidents_updated_at ON security_incidents(updated_at);
CREATE INDEX IF NOT EXISTS idx_security_incidents_assignee ON security_incidents(assignee);
CREATE INDEX IF NOT EXISTS idx_security_incidents_type_severity ON security_incidents(type, severity);
CREATE INDEX IF NOT EXISTS idx_security_incidents_status_severity ON security_incidents(status, severity);

-- ============================================================================
-- INCIDENT TIMELINE TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS incident_timeline (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT NOT NULL,
    timestamp TEXT NOT NULL,
    event_type TEXT NOT NULL,
    description TEXT NOT NULL,
    actor TEXT NOT NULL,
    details TEXT, -- JSON details of the timeline event
    notes TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (incident_id) REFERENCES security_incidents(id) ON DELETE CASCADE
);

-- Create indexes for incident_timeline
CREATE INDEX IF NOT EXISTS idx_incident_timeline_incident_id ON incident_timeline(incident_id);
CREATE INDEX IF NOT EXISTS idx_incident_timeline_timestamp ON incident_timeline(timestamp);
CREATE INDEX IF NOT EXISTS idx_incident_timeline_event_type ON incident_timeline(event_type);
CREATE INDEX IF NOT EXISTS idx_incident_timeline_actor ON incident_timeline(actor);

-- ============================================================================
-- INCIDENT RESPONSE ACTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS incident_response_actions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    incident_id TEXT NOT NULL,
    rule_id TEXT,
    rule_name TEXT,
    action_type TEXT NOT NULL,
    action_status TEXT NOT NULL CHECK (action_status IN ('pending', 'executing', 'completed', 'failed')),
    priority INTEGER DEFAULT 0,
    params TEXT, -- JSON parameters for the action
    result TEXT, -- JSON result of the action execution
    executed_at TEXT,
    completed_at TEXT,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (incident_id) REFERENCES security_incidents(id) ON DELETE CASCADE
);

-- Create indexes for incident_response_actions
CREATE INDEX IF NOT EXISTS idx_response_actions_incident_id ON incident_response_actions(incident_id);
CREATE INDEX IF NOT EXISTS idx_response_actions_rule_id ON incident_response_actions(rule_id);
CREATE INDEX IF NOT EXISTS idx_response_actions_action_type ON incident_response_actions(action_type);
CREATE INDEX IF NOT EXISTS idx_response_actions_status ON incident_response_actions(action_status);
CREATE INDEX IF NOT EXISTS idx_response_actions_executed_at ON incident_response_actions(executed_at);

-- ============================================================================
-- THREAT DETECTIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS threat_detections (
    id TEXT PRIMARY KEY,
    rule_id TEXT NOT NULL,
    rule_name TEXT NOT NULL,
    threat_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    risk_score INTEGER NOT NULL DEFAULT 0,
    source_data TEXT NOT NULL, -- JSON data that triggered the detection
    detected_at TEXT NOT NULL,
    status TEXT NOT NULL CHECK (status IN ('active', 'resolved', 'false_positive')) DEFAULT 'active',
    resolved_at TEXT,
    resolution TEXT,
    incident_id TEXT, -- Link to created incident if any
    metadata TEXT, -- Additional JSON metadata
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (incident_id) REFERENCES security_incidents(id) ON DELETE SET NULL
);

-- Create indexes for threat_detections
CREATE INDEX IF NOT EXISTS idx_threat_detections_rule_id ON threat_detections(rule_id);
CREATE INDEX IF NOT EXISTS idx_threat_detections_threat_type ON threat_detections(threat_type);
CREATE INDEX IF NOT EXISTS idx_threat_detections_severity ON threat_detections(severity);
CREATE INDEX IF NOT EXISTS idx_threat_detections_risk_score ON threat_detections(risk_score);
CREATE INDEX IF NOT EXISTS idx_threat_detections_detected_at ON threat_detections(detected_at);
CREATE INDEX IF NOT EXISTS idx_threat_detections_status ON threat_detections(status);
CREATE INDEX IF NOT EXISTS idx_threat_detections_incident_id ON threat_detections(incident_id);
CREATE INDEX IF NOT EXISTS idx_threat_detections_type_severity ON threat_detections(threat_type, severity);

-- ============================================================================
-- ALERT HISTORY TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS alert_history (
    id TEXT PRIMARY KEY,
    rule_id TEXT,
    rule_name TEXT,
    alert_type TEXT NOT NULL,
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    channels TEXT, -- JSON array of channels used
    send_results TEXT, -- JSON results of sending to channels
    triggered_by TEXT, -- What triggered this alert (incident_id, threat_id, etc.)
    source_event TEXT, -- JSON of the original event
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    processed_at TEXT,
    is_manual BOOLEAN DEFAULT FALSE
);

-- Create indexes for alert_history
CREATE INDEX IF NOT EXISTS idx_alert_history_rule_id ON alert_history(rule_id);
CREATE INDEX IF NOT EXISTS idx_alert_history_alert_type ON alert_history(alert_type);
CREATE INDEX IF NOT EXISTS idx_alert_history_severity ON alert_history(severity);
CREATE INDEX IF NOT EXISTS idx_alert_history_created_at ON alert_history(created_at);
CREATE INDEX IF NOT EXISTS idx_alert_history_triggered_by ON alert_history(triggered_by);
CREATE INDEX IF NOT EXISTS idx_alert_history_is_manual ON alert_history(is_manual);

-- ============================================================================
-- MONITORING SESSIONS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS monitoring_sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT UNIQUE NOT NULL,
    started_at TEXT NOT NULL,
    stopped_at TEXT,
    status TEXT NOT NULL CHECK (status IN ('active', 'stopped', 'error')) DEFAULT 'active',
    config TEXT, -- JSON configuration of the monitoring session
    last_processed_id INTEGER DEFAULT 0,
    events_processed INTEGER DEFAULT 0,
    threats_detected INTEGER DEFAULT 0,
    alerts_sent INTEGER DEFAULT 0,
    error_message TEXT,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for monitoring_sessions
CREATE INDEX IF NOT EXISTS idx_monitoring_sessions_session_id ON monitoring_sessions(session_id);
CREATE INDEX IF NOT EXISTS idx_monitoring_sessions_status ON monitoring_sessions(status);
CREATE INDEX IF NOT EXISTS idx_monitoring_sessions_started_at ON monitoring_sessions(started_at);

-- ============================================================================
-- SYSTEM PERFORMANCE METRICS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS system_performance_metrics (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    metric_type TEXT NOT NULL,
    metric_name TEXT NOT NULL,
    metric_value REAL NOT NULL,
    metric_unit TEXT,
    tags TEXT, -- JSON tags for grouping/filtering
    recorded_at TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- Create indexes for system_performance_metrics
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type ON system_performance_metrics(metric_type);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_name ON system_performance_metrics(metric_name);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON system_performance_metrics(recorded_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_type_name ON system_performance_metrics(metric_type, metric_name);

-- ============================================================================
-- MIGRATION LOG TABLE (CREATE IF NOT EXISTS)
-- ============================================================================

CREATE TABLE IF NOT EXISTS migration_log (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    migration_id TEXT UNIQUE NOT NULL,
    migration_name TEXT NOT NULL,
    executed_at TEXT NOT NULL,
    description TEXT
);

-- ============================================================================
-- MIGRATION LOG ENTRY
-- ============================================================================

INSERT INTO migration_log (migration_id, migration_name, executed_at, description) 
VALUES (
    '0005_security_incident_management',
    'Add security incident management tables',
    datetime('now'),
    'Phase 4: Create tables for security incident tracking, response actions, threat detections, alert history, monitoring sessions, and performance metrics'
);

-- ============================================================================
-- SAMPLE DATA FOR TESTING (OPTIONAL)
-- ============================================================================

-- Sample security incident
INSERT OR IGNORE INTO security_incidents (
    id, type, severity, status, title, description, metadata, detected_at, updated_at, created_by
) VALUES (
    'SEC_SAMPLE_001',
    'brute_force_login',
    'high',
    'resolved',
    'Sample Brute Force Attack',
    'Multiple failed login attempts detected from IP 192.168.1.100',
    '{"sourceIp": "192.168.1.100", "attemptCount": 15, "timeWindow": "300s"}',
    datetime('now', '-2 hours'),
    datetime('now', '-1 hour'),
    'system'
);

-- Sample incident timeline
INSERT OR IGNORE INTO incident_timeline (
    incident_id, timestamp, event_type, description, actor, details
) VALUES (
    'SEC_SAMPLE_001',
    datetime('now', '-2 hours'),
    'incident_created',
    'Security incident detected and created',
    'system',
    '{"detection_rule": "brute_force_critical", "confidence": 95}'
);

INSERT OR IGNORE INTO incident_timeline (
    incident_id, timestamp, event_type, description, actor, details
) VALUES (
    'SEC_SAMPLE_001',
    datetime('now', '-1 hour'),
    'status_change',
    'Status changed from detected to resolved',
    'admin_user',
    '{"previous_status": "detected", "new_status": "resolved", "resolution": "IP blocked by firewall"}'
);

-- Sample threat detection
INSERT OR IGNORE INTO threat_detections (
    id, rule_id, rule_name, threat_type, severity, risk_score, source_data, detected_at, status, incident_id
) VALUES (
    'THREAT_SAMPLE_001',
    'brute_force_critical',
    'Critical Brute Force Detection',
    'brute_force_login',
    'high',
    85,
    '{"failed_attempts": 15, "source_ip": "192.168.1.100", "target_users": ["admin", "user1"]}',
    datetime('now', '-2 hours'),
    'resolved',
    'SEC_SAMPLE_001'
);

-- Sample alert history
INSERT OR IGNORE INTO alert_history (
    id, rule_id, rule_name, alert_type, severity, title, message, channels, triggered_by, created_at, processed_at
) VALUES (
    'ALERT_SAMPLE_001',
    'brute_force_critical',
    'Critical Brute Force Alert',
    'security_alert',
    'high',
    'Critical Security Threat Detected',
    'A critical brute force attack has been detected from IP 192.168.1.100',
    '["console", "webhook"]',
    'SEC_SAMPLE_001',
    datetime('now', '-2 hours'),
    datetime('now', '-2 hours')
);

-- Sample monitoring session
INSERT OR IGNORE INTO monitoring_sessions (
    session_id, started_at, status, config, events_processed, threats_detected, alerts_sent
) VALUES (
    'MON_SESSION_001',
    datetime('now', '-3 hours'),
    'active',
    '{"interval_ms": 5000, "threat_detection": true, "alert_channels": ["console", "webhook"]}',
    1250,
    3,
    3
);

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Verify table creation
SELECT name FROM sqlite_master WHERE type='table' AND name LIKE '%incident%' OR name LIKE '%threat%' OR name LIKE '%alert%' OR name LIKE '%monitoring%' OR name LIKE '%performance%';

-- Count sample records
SELECT 
    'security_incidents' as table_name, COUNT(*) as record_count FROM security_incidents
UNION ALL
SELECT 
    'incident_timeline' as table_name, COUNT(*) as record_count FROM incident_timeline
UNION ALL
SELECT 
    'threat_detections' as table_name, COUNT(*) as record_count FROM threat_detections
UNION ALL
SELECT 
    'alert_history' as table_name, COUNT(*) as record_count FROM alert_history
UNION ALL
SELECT 
    'monitoring_sessions' as table_name, COUNT(*) as record_count FROM monitoring_sessions;

-- ============================================================================
-- END OF MIGRATION 0005
-- ============================================================================
