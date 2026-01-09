/**
 * SEED VERIFICATION TOOL / CÔNG CỤ XÁC MINH DỮ LIỆU SEED
 * ----------------------------------------------------------------------------
 * This script verifies that the database has been correctly populated.
 * It counts rows in key tables and displays sample data to ensure integrity.
 *
 * Script này xác minh rằng database đã được nạp dữ liệu chính xác.
 * Nó đếm số dòng trong các bảng chính và hiển thị dữ liệu mẫu để đảm bảo tính toàn vẹn.
 *
 * Usage / Cách sử dụng:
 *
 * 1. Default (Local Development) / Mặc định (Local Development):
 *    node tools/d1/verify-seeds.js
 *
 * 2. Specific Environment / Môi trường cụ thể:
 *    node tools/d1/verify-seeds.js staging
 *
 * 3. Remote Database / Database từ xa (Remote):
 *    node tools/d1/verify-seeds.js staging --remote
 * ----------------------------------------------------------------------------
 */
import { execSync } from 'child_process';

const args = process.argv.slice(2);
const environment = args.find(arg => !arg.startsWith('--')) || 'development';
const isRemote = args.includes('--remote');
const locationFlag = isRemote ? '--remote' : '--local';
const database_name = `hono-auth-api-db-${environment}`;

console.log(`\n🔍 Verifying seed data for: ${database_name} (${isRemote ? 'REMOTE' : 'LOCAL'})`);

function execute(sql) {
  try {
    // We use --json to get structured data
    const cmd = `npx wrangler@latest d1 execute ${database_name} --env ${environment} --command "${sql}" ${locationFlag} --json`;
    const output = execSync(cmd, { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
    
    // Find JSON in output (wrangler@latest logs might prepend text)
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
