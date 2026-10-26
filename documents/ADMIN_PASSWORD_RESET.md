# Administrator password reset

🌐 Language / Ngôn ngữ: English | [Tiếng Việt](ADMIN_PASSWORD_RESET.vi.md)

`POST /api/admin/users/:id/reset-password` requires the acting administrator's Bearer token and JSON:

```json
{"newPassword":"New-password-example-9!","confirmPassword":"New-password-example-9!"}
```

- Admin may reset User. Super Admin may reset User/Admin.
- Self, peer and higher-role resets are refused. Use Profile with the current password for self-service changes; locked-out Super Admin accounts require the operator recovery procedure.
- New passwords require at least 8 JavaScript string code units and at most 72 UTF-8 bytes. Whitespace is preserved and passwords are never truncated; the byte limit prevents silent bcrypt truncation.

One D1 transaction rechecks the actor's role/status/auth_version and the target's role/hash, writes the new hash, increments auth_version, revokes every active refresh token and records `ADMIN_PASSWORD_RESET`. Any failed step rolls back the entire operation. Audit metadata never contains a password or hash.

Success returns HTTP 200, `success: true` and `data: {userId, sessionsRevoked: true}`. The target must sign in again with the new password; the administrator's sessions remain valid. Deploy migrations through `0012` and `AUTH_VERSION_ENFORCEMENT=enforce` to reject legacy access tokens without a version as well.

| HTTP | Meaning |
| --- | --- |
| 400 | Invalid ID, payload, password or confirmation; unknown fields are rejected. |
| 401 | Missing, expired or revoked session. |
| 403 | Insufficient permissions or role hierarchy violation. |
| 404 | Target account not found. |
| 409 | Account/permissions changed or a write could not be confirmed; reload before retrying. |
| 500 | Transaction could not complete; no partial changes are committed. |

Never automatically replay this POST after an ambiguous timeout or network failure. Inspect the outcome or make an intentional new request. This operation does not send email, issue reset tokens or require another password change at the next login. Share the password securely. Sources: [route](../src/routes/admin.js), [service](../src/services/userService.js), [D1 tests](../tests/integration/admin-password-reset.d1.test.mjs).
