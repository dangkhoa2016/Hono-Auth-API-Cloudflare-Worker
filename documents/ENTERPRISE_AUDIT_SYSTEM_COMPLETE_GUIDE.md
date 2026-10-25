# Audit system overview

> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.vi.md)

The historical filename is retained for existing links. It is not a production-readiness or “enterprise” certification claim. Use the [capability contract](CAPABILITIES.md) for supported behavior.

| Route group | Current scope |
| --- | --- |
| `/api/audit/*` | Basic audit queries/operations under role and scope restrictions. |
| `/api/advanced-audit/*` | Analytics, archival/restore, retention and bounded CSV/JSON export. |
| `/api/realtime-monitoring/*` | On-demand snapshots/dashboards and alert management; no continuous polling or event stream. |
| `/api/security-incident/*` | Incident records, rules and recorded action outcomes; no automatic IP block, user disable or quarantine. |

Audit data is stored in D1. Migration `0011` preserves metadata for new archives and labels incomplete legacy data. Migration `0012` supports session revocation. Apply all migrations before current code; see [upgrade/release](UPGRADE_RELEASE.md).

Console/webhook alert channels have implementations. Email/KV alert adapters are unavailable and separate from transactional account email. Unimplemented incident actions return unsupported outcomes and must not count as successful containment. Archive statistics deadlines produce 503, not an empty successful report.

The [historical API reference](AUDIT_API_REFERENCE.md) retains old examples; compare them with current contracts and route source before integrating. The [verification guide](TEST_GUIDE.md) identifies maintained checks. Reports named GDPR/SOX/HIPAA do not certify legal compliance.
