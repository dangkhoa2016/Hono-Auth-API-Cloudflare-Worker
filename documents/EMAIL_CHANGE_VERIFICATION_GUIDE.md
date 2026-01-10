# 📧 EMAIL CHANGE VERIFICATION GUIDE - HONO AUTH WORKER

📖 Language: English | [Tiếng Việt](./EMAIL_CHANGE_VERIFICATION_GUIDE_vi.md)  
Last updated: 2026-01-10

## Scope
Documentation for the Email Change Verification process. This feature ensures that when a user updates their email address, the new address is verified before being applied to the account, preventing account lockouts due to typos and enhancing security.

## Implemented
- **Database Schema**: Added columns to the `users` table to temporary store the new email and verification token (Migration 0010).
- **API Routes**: 
  - Updated `PUT /api/user/profile` to handle email change requests separately from standard profile updates.
  - New `GET /api/user/verify-email` endpoint to process token validation.
- **Email Service**: New transactional email template for "Email Change Verification".
- **Internationalization**: Full i18n support for email content and API responses.
- **Testing**: Dedicated integration test suite `tests/emailChangeVerificationTest.js`.

## Data Model
The verification process uses the following new columns in the `users` table:
- **new_email** (TEXT): Stores the requested new email address.
- **email_verification_token** (TEXT, Indexed): A secure, random token generated for the verification link.
- **email_verification_expires_at** (TEXT): Timestamp when the token becomes invalid (24 hours).

## Verification Flow
1. **Request**: Authenticated user sends `PUT /api/user/profile` with a new `email` value.
2. **Setup**: System checks if the new email is available. If yes, it stores `new_email` and generates a token in the database, but **does not** update the main `email` field yet.
3. **Notification**: System sends a verification email to the **new** email address containing a link.
4. **Response**: API returns `emailVerificationPending: true` to the client.
5. **Verification**: User clicks the link (`/api/user/verify-email?token=...`).
6. **Completion**: System validates the token, expiry, and potential conflicts. If valid, `email` is updated to `new_email`, and temporary fields are cleared.

## API Reference

| Method | Endpoint | Description | Auth | i18n Key |
|--------|----------|-------------|------|----------|
| `PUT` | `/api/user/profile` | Request email change (payload must contain `email`) | User | `user.updatedWithEmailVerification` |
| `GET` | `/api/user/verify-email` | Verify new email via token query param | Public | `user.emailVerified` |

## Usage Examples

### 1. Request Email Change
**Request:**
```http
PUT /api/user/profile
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "email": "new.address@example.com",
  "full_name": "Updated Name"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "old.address@example.com",
    "new_email": "new.address@example.com",
    "emailVerificationPending": true,
    ...
  },
  "message": "Profile updated. Please check your new email address new.address@example.com to verify and complete the change."
}
```

### 2. Verify Email (Link Click)
**Request:**
```http
GET /api/user/verify-email?token=8f7d9a...
```

**Response:**
```json
{
  "success": true,
  "data": {
    "email": "new.address@example.com",
    "id": 1,
    ...
  },
  "message": "Email address verified successfully for user Updated Name."
}
```

## Testing
To verify the complete flow (including database token retrieval simulator), run the dedicated test suite:

```bash
# Run email change verification tests
node tests/emailChangeVerificationTest.js
```

## Security Considerations
- **Token Expiry**: Verification tokens expire after 24 hours.
- **Conflict Check**: A final check for email uniqueness is performed at the moment of verification to prevent race conditions.
- **Token Invalidation**: Once used, the token is immediately cleared.
- **State Validation**: Verification fails if the user has requested another change or if the state is invalid.
