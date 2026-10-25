# Capability contract

English | [Tiếng Việt](CAPABILITIES.vi.md)

This describes the current backend contract. Route names containing “realtime” and historical “enterprise” document titles do not imply continuous operation, compliance certification or production readiness. Config flags cannot enable an adapter that is absent from the implementation.

| Area | Implemented | Limits / unavailable behavior |
| --- | --- | --- |
| Authentication | bcrypt passwords, account activation, JWT access/refresh pairs, refresh rotation, session version checks, revocation | Requires migrations through `0012`, configured JWT secret and compatible clients; see [upgrade](UPGRADE_RELEASE.md). |
| Roles | `user`, `admin`, `super_admin`, route authorization and role restrictions | Permissions depend on the route; never infer permission from the route name alone. |
| Configuration | Environment/default reads, optional `CONFIG_KV`, administrative config routes | Security-sensitive config reads and administrative listings expose binding outages; some nonsecurity reads use defaults. Secrets belong in environment secret storage. |
| Transactional email | Configurable email service and provider request handling for account workflows | Requires provider credentials/configuration. This service does not implement the audit alert email adapter. |
| Audit | D1 audit storage, scoped queries, analytics, archival/restore and retention operations | Operations and policy reports are not independent compliance certification. No background scheduler is provided merely by enabling a flag. |
| Export | Bounded UTF-8 CSV/JSON and allowlisted aggregation | Current output ceiling 10,000 rows/groups; CSV formula guard. Excel, PDF, encryption, compression, charts, sheets and pivot options are unsupported. |
| Monitoring | Query-on-demand snapshots, dashboards and threat analysis | `continuousMonitoring: false`, `realtimeEventStream: false`; continuous start returns HTTP 422 `UNSUPPORTED_MONITORING_MODE`. In-memory state is not a durable event feed. |
| Incident records | Incident creation, lifecycle records, rule evaluation and logged action outcomes | A saved record or a successful log does not establish containment. `automaticContainment: false`. |
| Incident actions | `log_alert` writes an alert log | `block_ip`, `disable_user`, `escalate`, `notify_admin`, `quarantine` return `success: false`, `status: "unsupported"`, `code: "UNSUPPORTED_INCIDENT_ACTION"`, `statusCode: 422`; no WAF, user-disable, escalation, admin notification or quarantine side effect occurs. |
| Alert delivery | Console output; webhook HTTP delivery when configured/enabled | Email and KV alert channels return `UNSUPPORTED_ALERT_CHANNEL` (422); KV is disabled by default. Unknown channels return `UNKNOWN_ALERT_CHANNEL` (422). Only completed deliveries count as successful. Console success is not external notification. |
| Archive statistics | Actual statistics when the query completes | The bounded archive-statistics request returns HTTP 503 `ARCHIVE_STATS_TIMEOUT` with request ID on deadline, never a successful empty report. |

## Discover before calling

Authenticated routes expose current implementation data:

- `GET /api/advanced-audit/capabilities` (`super_admin`): export formats, output cap, aggregation and refused options.
- `GET /api/realtime-monitoring/monitoring/status` (admin roles): monitoring stats with `data.capabilities`.
- `GET /api/security-incident/status` (admin roles): incident status with `data.capabilities`.
- `GET /api/realtime-monitoring/alerts/channels` (admin roles): channels and capability data.

Inspect structured codes and per-action/per-channel results. A threat intake can succeed at recording an incident while its automated response has unsupported actions; the incident must not be interpreted as contained. A single unsupported manual action receives HTTP 422. A manual alert with zero successful deliveries is a failed delivery operation; partial results must be inspected channel by channel. Webhook success records the HTTP outcome, not downstream human acknowledgement.

`GET /api/advanced-audit/archive` applies the statistics deadline to its default statistics action. The `action=status` and `action=policies` queries remain distinct. On a timeout, show unavailable statistics, retain the request ID for diagnosis and retry a read only when appropriate; do not substitute zero counts. Never automatically replay mutation requests after an ambiguous timeout.

Manual response requests use `action` (`log_alert`, `block_ip`, `disable_user`, `escalate`, `notify_admin`, `quarantine`) and optional `params`. The separate `PUT /api/security-incident/incidents/:id/status` endpoint updates lifecycle status; a manually recorded status is not evidence that a response adapter performed containment.

## Verification boundary

[Canonical checks](TEST_GUIDE.md) validate local behavior. They do not certify every legacy test, remote binding, email recipient, webhook receiver, throughput target or regulatory requirement. Validate deployed configuration and integration outcomes in staging using the [release checklist](UPGRADE_RELEASE.md).
