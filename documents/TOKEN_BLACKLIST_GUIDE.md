# 🚫 TOKEN BLACKLIST MANAGEMENT GUIDE - HONO AUTH WORKER

📖 Language: English | [Tiếng Việt](./TOKEN_BLACKLIST_GUIDE_vi.md)  
Last updated: 2026-01-10

## Scope
Documentation for the Token Blacklist Management system, which allows Super Administrators to monitor and manage revoked access tokens. This system is crucial for immediate security responses, such as invalidating compromised tokens.

## Implemented
- **API Routes**: Dedicated endpoints at `/api/admin/token-blacklist` for full CRUD operations.
- **Access Control**: Strictly enforced `SUPER_ADMIN` permission for all management routes.
- **Internationalization**: Complete i18n support for all response messages (success, error, not found) across supported languages (en, vi, de, es, fr, ja, th).
- **Validation**: Input validation for JTI formats and required fields.
- **Testing**: Dedicated test suite `tests/tokenBlacklistRouteTest.js` covering standard flows, edge cases, and security permissions.

## API Reference

| Method | Endpoint | Description | Permissions | i18n Key |
|--------|----------|-------------|-------------|----------|
| `GET` | `/api/admin/token-blacklist` | List blacklisted tokens with pagination & search | SUPER_ADMIN | `blacklistList` |
| `POST` | `/api/admin/token-blacklist` | Manually add a token (JTI) to blacklist | SUPER_ADMIN | `blacklistCreate` |
| `GET` | `/api/admin/token-blacklist/:id` | Get detailed information of a blacklist entry | SUPER_ADMIN | `blacklistDetails` |
| `DELETE` | `/api/admin/token-blacklist/:id` | Remove a token from blacklist | SUPER_ADMIN | `blacklistDelete` |
| `POST` | `/api/admin/token-blacklist/bulk-delete` | Bulk remove multiple tokens | SUPER_ADMIN | `blacklistBulkDelete` |

## Data Model
The system interacts with the `token_blacklist` table:
- **id**: Primary Key (Integer)
- **jti**: JWT ID (String, Unique) - The identifier of the access token.
- **user_id**: User ID (Integer, FK) - The user associated with the token.
- **expires_at**: Timestamp - When the token (and blacklist entry) expires.
- **reason**: String - Reason for blacklisting (e.g., "USER_LOGOUT", "ADMIN_ACTION").
- **created_at**: Timestamp - Record creation time.

## Usage Examples

### 1. List Blacklisted Tokens
**Request:**
```http
GET /api/admin/token-blacklist?page=1&limit=10&search=revo
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "jti": "8f7d9a...",
        "reason": "USER_LOGOUT",
        "expires_at": "2026-01-10T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1 }
  },
  "message": "Blacklist tokens retrieved successfully"
}
```

### 2. Manually Blacklist a Token
Useful for invalidating a specific token without waiting for it to expire.

**Request:**
```http
POST /api/admin/token-blacklist
Content-Type: application/json
Authorization: Bearer <SUPER_ADMIN_TOKEN>

{
  "jti": "compromised-token-jti-123",
  "userId": 42,
  "reason": "ADMIN_SECURITY_ACTION",
  "expiresAt": "2026-01-11T00:00:00Z"
}
```

## Testing
To verify the implementation, run the dedicated test suite:

```bash
# Run token blacklist route tests
node tests/tokenBlacklistRouteTest.js

# Run suspended user token tests (related security check)
node tests/suspendedUserTokenTest.js
```

## Integration Notes
- **Middleware Integration**: The blacklist is checked by the authentication middleware. If a token's JTI exists in this list, the request is rejected with `401 Unauthorized` before reaching any route handler.
- **Suspended Users**: When a user is suspended, their active tokens should effectively be treated as invalid. The `suspendedUserTokenTest.js` verifies that suspended users cannot access protected resources.
