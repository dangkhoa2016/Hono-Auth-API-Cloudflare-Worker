# 🔍 DATABASE INSPECTION GUIDE - HONO AUTH WORKER

📖 Language: English | [Tiếng Việt](./DATABASE_INSPECTION_GUIDE_vi.md)  
Last updated: 2026-01-10

## Scope
Documentation for the Database Inspection tools located in `tools/d1/`. These scripts provide developers with a quick and structured way to verify the state of the local D1 database, verify data seeding, and debug issues without needing external GUI tools.

## Tools Overview

### 1. Advanced Inspector (`inspect_db_v2.js`)
**Status**: Recommended  
A structured, categorized inspection tool that provides a comprehensive overview of the system's health and data distribution.

**Features:**
- **Remote Support**: Can inspect both local and remote Cloudflare D1 databases using the `--remote` flag.
- **Categorized Output**: Groups data into logical sections (Schema, Users, Audit, Security).
- **Summary Statistics**: Shows counts by role, status, and action types rather than just raw rows.
- **Formatted Tables**: Uses `console.table` for readable output.
- **Safe Execution**: Handles missing tables gracefull (useful during partial migrations).

### 2. Basic Inspector (`inspect_db.js`)
**Status**: Legacy / Simple  
A simple script that dumps raw rows for predefined queries. Useful for quick, specific checks or testing D1 bindings directly.

## Usage

### Prerequisites
- Node.js environment.
- Dependencies installed (`npm install`).
- Local D1 database initialized (via `wrangler dev` or migrations).

### Running the Inspector
The tools now support checking specific environments (dev, staging, production) and remote databases.

```bash
# Default (Local Development)
node tools/d1/inspect_db_v2.js

# Specific Environment (Local)
node tools/d1/inspect_db_v2.js staging

# Remote Database (Cloudflare D1)
node tools/d1/inspect_db_v2.js production --remote

# Run the basic inspector (Legacy)
node tools/d1/inspect_db.js
```

> **Note**: The V2 script now uses `npx wrangler d1 execute` under the hood. This allows it to work seamlessly with remote databases by passing the `--remote` flag, provided you are authenticated with `wrangler login`.

## Inspection Categories (V2)

The `inspect_db_v2.js` tool covers the following domains:

### 📂 Schema & Stats
- **List all tables**: Verifies migration success.
- **Table Record Counts**: Quick check of data volume across `users`, `audit_logs`, `security_incidents`, etc.

### 📂 Users
- **Users by Role**: Counts of Super Admins, Admins, and Users.
- **Users by Status**: Distribution of Active, Inactive, Suspended users.
- **Recent Activity**: Users created in the last 7 days.
- **Verification Status**: Lists users with pending activation or unverified emails.

### 📂 Audit
- **Recent Logs**: The latest 5 actions in the system.
- **Action Distribution**: Most common activities (e.g., how many `LOGIN` vs `UPDATE_PROFILE`).
- **Archive Check**: Verifies that `audit_logs_archive` table is accessible.

### 📂 Security
- **Active Incidents**: Recent security alerts (DoS attempts, Brute force).
- **Blacklist**: Currently active blacklisted tokens (JWTs).
- **Blocked IPs**: List of IPs currently rate-limited or blocked due to failed logins.

## Customization
You can easily extend `tools/d1/inspect_db_v2.js` by adding new query objects to the `queries` constant:

```javascript
const queries = {
  // ... existing categories
  custom: [
    {
      name: 'My Custom Check',
      query: "SELECT * FROM users WHERE email LIKE '%@company.com'"
    }
  ]
};
```
