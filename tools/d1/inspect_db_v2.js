import { getPlatformProxy } from 'wrangler';

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

async function inspectDatabase(db) {
  console.log('🔍 Starting Database Inspection...');
  console.log('==================================');

  // Helper to run a list of queries
  async function runQueryGroup(groupName, queryList) {
    console.log(`\n📂 Category: ${groupName.toUpperCase()}`);
    console.log('----------------------------------');
    
    for (const { name, query } of queryList) {
      console.log(`\n📋 ${name}`);
      console.log(`   Query: ${query}`);
      try {
        const result = await db.prepare(query).all();
        // Check if results are in 'results' property (D1 standard) or directly returned
        const rows = result.results || result;
        
        if (Array.isArray(rows) && rows.length > 0) {
          console.table(rows);
        } else if (Array.isArray(rows) && rows.length === 0) {
          console.log('   (No results found)');
        } else {
             // Fallback for unexpected format
             console.log(result);
        }
      } catch (error) {
        // Some tables might not exist yet if migrations haven't run fully or if the query is invalid for the current schema
        // We log nicely instead of crashing
        console.log(`   ⚠️ Error or Table not found: ${error.message}`);
      }
    }
  }

  // Iterate over all categories
  for (const [category, queryList] of Object.entries(queries)) {
    await runQueryGroup(category, queryList);
  }
  
  console.log('\n==================================');
  console.log('✅ Inspection Complete');
}

(async () => {
  try {
    const { env } = await getPlatformProxy({ environment: 'development' });
    if (!env || !env.DB) {
        throw new Error('DB binding not found. Make sure wrangler.toml has [[d1_databases]] configured correctly.');
    }

    await inspectDatabase(env.DB);

  } catch (error) {
     console.error('Fatal Error during inspection:', error);
  } finally {
     process.exit(0);
  }

})();
