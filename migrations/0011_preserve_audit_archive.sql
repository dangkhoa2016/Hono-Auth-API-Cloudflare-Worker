-- Migration 0011: make the audit archive lossless
--
-- Migrations 0003/0004 are already deployable and are not modified. This one
-- only appends, so a database created at 0010 and a fresh one both end up with
-- the same archive shape.
--
-- Why: `audit_logs` (0003) carries metadata that `audit_logs_archive` (0004)
-- never had, so archiving was lossy and a restore could not reproduce the row.
-- Missing columns are added, and provenance is recorded for values that the
-- schema cannot represent truthfully:
--
--   * `actor_role` is NOT NULL in the archive but nullable in the source. A row
--     without a role is archived as the sentinel `UNKNOWN` with
--     `actor_role_synthetic = 1`, so the sentinel is never mistaken for a real
--     role. The service maps it back to NULL on restore.
--   * `status` has no default. A legacy archive row has none, and inventing
--     `SUCCESS` would fabricate evidence; those rows keep NULL and are reported
--     through `metadata_complete = 0`.

ALTER TABLE audit_logs_archive ADD COLUMN actor_email TEXT;
ALTER TABLE audit_logs_archive ADD COLUMN target_identifier TEXT;
ALTER TABLE audit_logs_archive ADD COLUMN request_id TEXT;
ALTER TABLE audit_logs_archive ADD COLUMN old_values TEXT;
ALTER TABLE audit_logs_archive ADD COLUMN new_values TEXT;
ALTER TABLE audit_logs_archive ADD COLUMN status TEXT;
ALTER TABLE audit_logs_archive ADD COLUMN error_message TEXT;

-- Provenance: 1 only for rows archived after this migration, which therefore
-- carry every column above. Legacy rows stay 0 and are reported as incomplete
-- rather than silently presented as a faithful copy.
ALTER TABLE audit_logs_archive ADD COLUMN metadata_complete INTEGER NOT NULL DEFAULT 0;
ALTER TABLE audit_logs_archive ADD COLUMN actor_role_synthetic INTEGER NOT NULL DEFAULT 0;

-- A restored row is recognised by its archive row, so re-restoring is a
-- conflict instead of a second copy of the same event.
ALTER TABLE audit_logs_archive ADD COLUMN restored_at TEXT;
ALTER TABLE audit_logs_archive ADD COLUMN restored_original_id INTEGER;

CREATE INDEX IF NOT EXISTS idx_archive_status ON audit_logs_archive(status);
CREATE INDEX IF NOT EXISTS idx_archive_request_id ON audit_logs_archive(request_id);
CREATE INDEX IF NOT EXISTS idx_archive_restored_at ON audit_logs_archive(restored_at);

INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, details, ip_address, user_agent, timestamp)
VALUES (
  NULL,
  'system',
  'database_migration',
  'system',
  '0011_preserve_audit_archive',
  '{"migration": "0011_preserve_audit_archive", "description": "Added lossless audit archive metadata columns, provenance flags and restore bookkeeping", "columns_added": 11, "indexes_added": 3, "phase": "5"}',
  'system',
  'migration_script',
  datetime('now')
);
