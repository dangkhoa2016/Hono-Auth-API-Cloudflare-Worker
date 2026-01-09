/**
 * DATABASE INSPECTION TOOL / CÔNG CỤ KIỂM TRA DATABASE
 * ----------------------------------------------------------------------------
 * This script runs a comprehensive inspection of the D1 database, executing a set
 * of predefined queries to check schema, users, audit logs, and security data.
 *
 * Script này chạy kiểm tra toàn diện database D1, thực hiện một tập hợp các
 * truy vấn định sẵn để kiểm tra schema, người dùng, nhật ký kiểm toán và dữ liệu bảo mật.
 *
 * Usage / Cách sử dụng:
 *
 * 1. Default (Local Development) / Mặc định (Local Development):
 *    node tools/d1/inspect_db_v2.js
 *
 * 2. Specific Environment (Local) / Môi trường cụ thể (Local):
 *    node tools/d1/inspect_db_v2.js staging
 *    node tools/d1/inspect_db_v2.js production
 *
 * 3. Remote Database / Database từ xa (Remote):
 *    node tools/d1/inspect_db_v2.js staging --remote
 *    node tools/d1/inspect_db_v2.js production --remote
 * ----------------------------------------------------------------------------
 */
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Queries categorized for better organization
const queries = {
  schema: [
    {
      name: 'List all tables',
      query: "SELECT name FROM sqlite_master WHERE type='table' ORDER BY name;"
    },
    {
      name: 'Table Record Counts',
      // Dynamic query generation isn't easy here without running multiple, so we will handle this in the code
      query: "SELECT 'users' as table_name, COUNT(*) as count FROM users UNION ALL SELECT 'audit_logs', COUNT(*) FROM audit_logs UNION ALL SELECT 'audit_logs_archive', COUNT(*) FROM audit_logs_archive UNION ALL SELECT 'security_incidents', COUNT(*) FROM security_incidents UNION ALL SELECT 'token_blacklist', COUNT(*) FROM token_blacklist;"
    }
  ],
  users: [
    {
      name: 'All Users (Limit 5)',
      query: 'SELECT id, full_name, email, status, created_at FROM users LIMIT 5;'
    },
    {
      name: 'Users by Role Summary',
      query: 'SELECT role, COUNT(*) as count FROM users GROUP BY role;'
    },
    {
      name: 'Users by Status Summary',
      query: 'SELECT status, COUNT(*) as count FROM users GROUP BY status;'
    },
    {
      name: 'Recently Created Users (Last 7 days)',
      query: "SELECT * FROM users WHERE created_at >= datetime('now', '-7 days');"
    },
    {
      name: 'Users with Pending Activation (Recent)',
      query: 'SELECT id, email, activation_token_expires_at FROM users WHERE activation_token IS NOT NULL LIMIT 5;'
    },
    {
      name: 'Admin Users',
      query: "SELECT id, full_name, email FROM users WHERE role = 'admin' LIMIT 5;"
    },
    {
      name: 'Disabled Users',
      query: "SELECT id, full_name, email FROM users WHERE status = 'inactive' LIMIT 5;"
    },
    {
      name: 'Users with Verified Emails',
      query: "SELECT id, full_name, email FROM users WHERE activated_at IS NOT NULL LIMIT 5;"
    },
    {
      name: 'Users with Unverified Emails',
      query: "SELECT id, full_name, email FROM users WHERE activated_at IS NULL LIMIT 5;"
    },
    {
      name: 'Latest token_audit_logs (Limit 5)',
      query: 'SELECT * FROM token_audit_logs ORDER BY created_at DESC LIMIT 5;'
    }
  ],
  audit: [
    {
      name: 'Recent Audit Logs (Limit 5)',
      query: 'SELECT id, action, actor_email, target_type, status, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 5;'
    },
    {
      name: 'Audit Logs by Action Type',
      query: 'SELECT action, COUNT(*) as count FROM audit_logs GROUP BY action ORDER BY count DESC;'
    },
    {
      name: 'Audit Logs Archive Sample (Limit 5)',
      query: 'SELECT * FROM audit_logs_archive ORDER BY archived_at DESC LIMIT 5;'
    }
  ],
  security: [
    {
      name: 'Recent Security Incidents',
      query: 'SELECT id, type, severity, status, title, detected_at FROM security_incidents ORDER BY detected_at DESC LIMIT 5;'
    },
    {
      name: 'Security Incidents by Severity',
      query: 'SELECT severity, COUNT(*) as count FROM security_incidents GROUP BY severity;'
    },
    {
      name: 'Recent Threat Detections',
      query: 'SELECT id, threat_type, severity, risk_score, detected_at FROM threat_detections ORDER BY detected_at DESC LIMIT 5;'
    },
    {
      name: 'Active Blacklisted Tokens',
      query: "SELECT * FROM token_blacklist WHERE expires_at > datetime('now') LIMIT 10;"
    },
    {
      name: 'Failed Login Limits (Blocked IPs)',
      query: 'SELECT * FROM failed_login_limits ORDER BY last_attempt_at DESC LIMIT 10;'
    }
  ]
};

function executeCommand(command) {
    // This function is no longer used but kept for interface compatibility if needed later, 
    // or we can remove it. For now, we inline execution in inspectDatabase.
}

async function inspectDatabase(database_name, environment, locationFlag) {
  console.log('🔍 Starting Database Inspection...');
  console.log(`📡 Database: ${database_name} (${environment}) [${locationFlag}]`);
  console.log('==================================');

  for (const [category, queryList] of Object.entries(queries)) {
    console.log(`\n📂 Category: ${category.toUpperCase()}`);
    console.log('----------------------------------');
    
    for (const { name, query } of queryList) {
      console.log(`\n📋 ${name}`);
      console.log(`   Query: ${query}`);
      
      try {
        // Safe quote the query for shell execution
        // We use single quotes for the query string in shell command, so we escape single quotes in SQL
        const safeQuery = query.replace(/"/g, '\\"');
        const command = `npx wrangler d1 execute ${database_name} --env ${environment} --command "${safeQuery}" ${locationFlag} --json`;
        
        // Execute sync
        // Using direct execSync instead of helper to localize logic and simplify
        const output = execSync(command, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
        
        const jsonStart = output.indexOf('[');
        if (jsonStart === -1) {
            console.log('   (No content returned or error parsing output)');
            continue;
        }
        
        const jsonStr = output.substring(jsonStart);
        const parsed = JSON.parse(jsonStr);
        // Wrangler usually returns [{ results: [...], meta: ... }] for single command
        // Note: Sometimes it might return multiple results if the query string had semicolons, but here we process 1 query at a time.
        const res = parsed[0]; 

        if (!res || !res.success) {
            console.log(`   ⚠️ Query failed.`);
             if (res && res.error) console.log(`   Error: ${res.error}`);
            continue;
        }

        const rows = res.results;
        if (Array.isArray(rows) && rows.length > 0) {
          console.table(rows);
        } else {
          console.log('   (No results found)');
        }

      } catch (error) {
        console.log(`   ⚠️ Error executing query: ${error.message}`);
      }
    }
  }

  console.log('\n==================================');
  console.log('✅ Inspection Complete');
}

(async () => {
    const args = process.argv.slice(2);
    // Find first non-flag argument as environment, default to 'development'
    const environment = args.find(arg => !arg.startsWith('--')) || 'development';
    const isRemote = args.includes('--remote');
    const locationFlag = isRemote ? '--remote' : '--local';
    const database_name = `hono-auth-api-db-${environment}`;

    await inspectDatabase(database_name, environment, locationFlag);
})();
