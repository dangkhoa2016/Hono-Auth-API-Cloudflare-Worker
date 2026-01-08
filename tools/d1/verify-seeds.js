import { execSync } from 'child_process';

const environment = process.argv[2] || 'development';
const database_name = `hono-auth-api-db-${environment}`;

console.log(`\n🔍 Verifying seed data for: ${database_name}`);

function execute(sql) {
  try {
    // We use --json to get structured data
    const cmd = `npx wrangler d1 execute ${database_name} --env ${environment} --command "${sql}" --local --json`;
    const output = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    
    // Find JSON in output (wrangler logs might prepend text)
    const jsonStart = output.indexOf('[');
    if (jsonStart === -1) return [];
    
    const jsonPart = output.substring(jsonStart);
    const parsed = JSON.parse(jsonPart);
    return parsed[0].results;
  } catch (err) {
    // console.error(`Error executing SQL: ${sql}`, err.message);
    return [];
  }
}

async function verify() {
  console.log('\n📊 Database Statistics');
  console.log('==================================================');
  
  const tables = [
    { name: 'users', icon: '👤', label: 'Users' },
    { name: 'audit_logs', icon: '📜', label: 'Audit Logs' },
    { name: 'security_incidents', icon: '🚨', label: 'Security Incidents' },
    { name: 'token_audit_logs', icon: '🔑', label: 'Token History' },
    { name: 'token_blacklist', icon: '🚫', label: 'Blacklisted Tokens' }
  ];

  for (const t of tables) {
    const res = execute(`SELECT COUNT(*) as c FROM ${t.name}`);
    const count = res[0]?.c || 0;
    console.log(`${t.icon} ${t.label.padEnd(20)}: ${count} rows`);
  }
  
  console.log('==================================================');

  // Show some samples
  console.log('\n👀 Random User Sample:');
  const sampleUsers = execute("SELECT id, full_name, email, role, status FROM users ORDER BY RANDOM() LIMIT 3");
  if (sampleUsers.length > 0) {
      console.table(sampleUsers);
  } else {
      console.log("No users found.");
  }
  
  console.log('\n👀 Recent Audit Logs:');
  const recentLogs = execute("SELECT action, actor_email, target_type, status, timestamp FROM audit_logs ORDER BY timestamp DESC LIMIT 3");
  if (recentLogs.length > 0) {
    console.table(recentLogs);
  } else {
    console.log("No audit logs found.");
  }

  console.log('\n✅ Verification Done');
}

verify();
