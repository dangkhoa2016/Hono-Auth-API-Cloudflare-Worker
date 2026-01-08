import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { ROLES } from '../../src/constants/roles.js';

// ============================================================================
// CONFIG & CONSTANTS
// ============================================================================
const OUTPUT_FILE_NAME = 'seeds.sql';
const DEFAULT_PASSWORD = 'password123';

const AUDIT_ACTIONS = [
  'LOGIN', 'LOGOUT', 'REGISTER', 'UPDATE_PROFILE', 'CHANGE_PASSWORD', 
  'DELETE_ACCOUNT', 'VIEW_AUDIT_LOGS', 'EXPORT_DATA', 'UPDATE_SETTINGS',
  'USER_CREATE', 'USER_UPDATE', 'USER_DELETE', 'ROLE_UPDATE', 
  'STATUS_UPDATE', 'API_KEY_CREATE', 'API_KEY_REVOKE'
];

const INCIDENT_TYPES = ['BRUTE_FORCE', 'SUSPICIOUS_LOGIN', 'API_ABUSE', 'DATA_LEAK', 'UNAUTHORIZED_ACCESS'];
const SEVERITIES = ['low', 'medium', 'high', 'critical'];
const INCIDENT_STATUSES = ['detected', 'investigating', 'contained', 'resolved', 'false_positive'];

const DEMO_USERS = [
  // Super Admins
  { full_name: 'SysSuperAdmin', email: 'super@admin.local', role: ROLES.SUPER_ADMIN, status: 'active' },
  { full_name: 'Tech Lead', email: 'tech.lead@company.local', role: ROLES.SUPER_ADMIN, status: 'active' },
  
  // Admins
  { full_name: 'Security Officer', email: 'security@company.local', role: ROLES.ADMIN, status: 'active' },
  { full_name: 'User Manager', email: 'users@company.local', role: ROLES.ADMIN, status: 'active' },
  { full_name: 'Audit Supervisor', email: 'audit@company.local', role: ROLES.ADMIN, status: 'active' },
  
  // Regular Users - Active
  { full_name: 'Alice Developer', email: 'alice@dev.team', role: ROLES.USER, status: 'active' },
  { full_name: 'Bob Designer', email: 'bob@design.team', role: ROLES.USER, status: 'active' },
  { full_name: 'Charlie QA', email: 'charlie@qa.team', role: ROLES.USER, status: 'active' },
  { full_name: 'David DevOps', email: 'david@ops.team', role: ROLES.USER, status: 'active' },
  { full_name: 'Eve Product', email: 'eve@product.team', role: ROLES.USER, status: 'active' },
  { full_name: 'Frank Finance', email: 'frank@finance.local', role: ROLES.USER, status: 'active' },
  { full_name: 'Grace HR', email: 'grace@hr.local', role: ROLES.USER, status: 'active' },
  { full_name: 'Hank Sales', email: 'hank@sales.local', role: ROLES.USER, status: 'active' },
  
  // Regular Users - Non-active
  { full_name: 'Inactive User', email: 'inactive@test.local', role: ROLES.USER, status: 'inactive' },
  { full_name: 'Suspended User', email: 'suspended@test.local', role: ROLES.USER, status: 'suspended' },
  { full_name: 'Bad Actor', email: 'hacker@suspicious.net', role: ROLES.USER, status: 'suspended' },
];

// ============================================================================
// UTILS & HELPERS
// ============================================================================

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

function executeCommand(command) {
  try {
    const result = execSync(command, {
      encoding: 'utf8',
      cwd: process.cwd(),
      stdio: ['inherit', 'pipe', 'pipe']
    });
    return { success: true, output: result };
  } catch (error) {
    return { success: false, error: error.message, stderr: error.stderr };
  }
}

function escapeString(str) {
  if (typeof str !== 'string') return str;
  return str.replace(/'/g, '\'\'');
}

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateRandomIP() {
  return `${getRandomInt(1, 255)}.${getRandomInt(0, 255)}.${getRandomInt(0, 255)}.${getRandomInt(1, 255)}`;
}

function generateRandomUserAgent() {
  const userAgents = [
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
    'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Safari/605.1.15',
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:89.0) Gecko/20100101 Firefox/89.0',
    'Mozilla/5.0 (iPhone; CPU iPhone OS 14_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.1 Mobile/15E148 Safari/604.1',
    'Mozilla/5.0 (Linux; Android 10; SM-G981B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/80.0.3987.162 Mobile Safari/537.36'
  ];
  return getRandomItem(userAgents);
}

function generateRandomDate(start, end) {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime())).toISOString().replace('T', ' ').substring(0, 19);
}

// ============================================================================
// SQL GENERATORS
// ============================================================================

function generateCleanupSql() {
  console.log('🧹 Adding clean up commands...');
  const lines = ['-- Cleanup existing data'];
  lines.push('PRAGMA foreign_keys = OFF;');
  
  const cleanupTables = [
    'audit_logs', 'token_audit_logs', 'token_blacklist', 'refresh_tokens',
    'incident_response_actions', 'incident_timeline', 'security_incidents', 'users'
  ];
  
  for (const table of cleanupTables) {
    lines.push(`DELETE FROM ${table};`);
    lines.push(`DELETE FROM sqlite_sequence WHERE name='${table}';`);
  }
  
  lines.push('');
  return lines;
}

function generateUsersSql(users, hashedPwd) {
  console.log(`👥 Adding ${users.length} users...`);
  const lines = ['-- Seed Users'];
  const escapedHashedPassword = escapeString(hashedPwd);

  for (const user of users) {
    const escapedFullName = escapeString(user.full_name);
    lines.push(`INSERT INTO users (id, full_name, email, password, role, status, created_at, updated_at) VALUES (${user.id}, '${escapedFullName}', '${user.email}', '${escapedHashedPassword}', '${user.role}', '${user.status}', datetime('now'), datetime('now'));`);
  }
  lines.push('');
  return lines;
}

function generateAuditLogsSql(users, count = 50) {
  console.log('📜 Adding Audit Logs...');
  const lines = ['-- Seed Audit Logs'];
  
  for (let i = 0; i < count; i++) {
    const actor = getRandomItem(users);
    const action = getRandomItem(AUDIT_ACTIONS);
    const target = getRandomItem(users);
    const isSystemEvent = Math.random() > 0.9;

    const actorRole = actor.role || 'user';
    const actorId = isSystemEvent ? 'NULL' : actor.id;
    const actorRoleVal = isSystemEvent ? 'SYSTEM' : actorRole;
    const actorEmail = isSystemEvent ? 'system' : actor.email;
    const targetType = isSystemEvent ? 'SYSTEM' : 'USER';
    
    const detailsObj = { method: 'seeded', trigger: 'demo_script' };
    const detailsJson = JSON.stringify(detailsObj); 
    const escapedDetails = escapeString(detailsJson);
    const ip = generateRandomIP();
    const ua = generateRandomUserAgent();
    const status = Math.random() > 0.1 ? 'SUCCESS' : 'FAILED';
    const ts = generateRandomDate(new Date(Date.now() - 30*24*60*60*1000), new Date());

    lines.push(`INSERT INTO audit_logs (action, actor_id, actor_role, actor_email, target_type, target_id, target_identifier, ip_address, user_agent, status, details, timestamp) VALUES ('${action}', ${actorId}, '${actorRoleVal}', '${actorEmail}', '${targetType}', '${target.id}', '${target.email}', '${ip}', '${ua}', '${status}', '${escapedDetails}', '${ts}');`);
  }
  lines.push('');
  return lines;
}

function generateSecurityIncidentsSql(count = 20) {
  console.log('🚨 Adding Security Incidents...');
  const lines = ['-- Seed Security Incidents'];
  
  for (let i = 0; i < count; i++) {
    const type = getRandomItem(INCIDENT_TYPES);
    const severity = getRandomItem(SEVERITIES);
    const status = getRandomItem(INCIDENT_STATUSES);
    const id = `INC-${Date.now()}-${getRandomInt(1000, 9999)}`;
    const detected_at = generateRandomDate(new Date(Date.now() - 7*24*60*60*1000), new Date());
    const description = `Detected ${type} activity from IP ${generateRandomIP()} targeting system resources.`;
    
    lines.push(`INSERT INTO security_incidents (id, type, severity, status, title, description, detected_at, updated_at, created_by) VALUES ('${id}', '${type}', '${severity}', '${status}', '${type} Detected', '${description}', '${detected_at}', '${detected_at}', 'system');`);
  }
  lines.push('');
  return lines;
}

function generateTokenLogsSql(users, count = 30) {
  console.log('🔑 Adding Token/Login History...');
  const lines = ['-- Seed Token Logs'];
  
  for (let i = 0; i < count; i++) {
    const user = getRandomItem(users);
    const action = Math.random() > 0.3 ? 'TOKEN_ISSUE' : 'TOKEN_REFRESH';
    const success = Math.random() > 0.1 ? 1 : 0;
    const createdAt = generateRandomDate(new Date(Date.now() - 14*24*60*60*1000), new Date());
    const ip = generateRandomIP();
    const ua = generateRandomUserAgent();

    lines.push(`INSERT INTO token_audit_logs (user_id, action, ip_address, user_agent, success, created_at) VALUES (${user.id}, '${action}', '${ip}', '${ua}', ${success}, '${createdAt}');`);
  }
  lines.push('');
  return lines;
}

// ============================================================================
// EXECUTION HELPERS
// ============================================================================

function processWranglerOutput(result) {
    if (result.success) {
      console.log('🎉 Seeding executed successfully!');
      
      const output = result.output.trim();
      const jsonStartIndex = output.indexOf('[');
      
      if (jsonStartIndex !== -1) {
        const textPart = output.substring(0, jsonStartIndex);
        const jsonPart = output.substring(jsonStartIndex);
        
        console.log('\n📋 Wrangler Output:');
        console.log(textPart.trim());

        try {
            const results = JSON.parse(jsonPart);
            const totalQueries = results.length;
            const totalDuration = results.reduce((acc, r) => acc + (r.meta?.duration || 0), 0);
            const successful = results.filter(r => r.success).length;

            console.log('\n📊 Execution Summary:');
            console.log(`===============================================`);
            console.log(`✅ Status:       ${successful === totalQueries ? 'Complete Success' : 'Partial Success'}`);
            console.log(`🔢 Total Queries: ${totalQueries}`);
            console.log(`⏱️  Total Time:    ${totalDuration.toFixed(2)}ms`);
            console.log(`===============================================`);

             if (successful !== totalQueries) {
                console.warn(`⚠️ Warning: Only ${successful} out of ${totalQueries} queries succeeded.`);
             }
             return true;

        } catch (e) {
            console.log('\nUnknown output format (Raw JSON parsing failed):');
            console.log(jsonPart);
            return false;
        }
      } else {
        console.log(result.output);
        return true;
      }
    } else {
      console.error('❌ Seeding execution failed');
      console.error(result.error);
      if (result.stderr) console.error(result.stderr);
      return false;
    }
}

function runVerification(environment) {
     console.log('\n🔄 Running verification...');
     // Using import.meta.url to construct __dirname manually
     const __dirname = path.dirname(new URL(import.meta.url).pathname);
     try {
         execSync(`node "${path.join(__dirname, 'verify-seeds.js')}" ${environment}`, { stdio: 'inherit' });
     } catch (verifyErr) {
         console.error('⚠️ Verification script execution failed:', verifyErr.message);
     }
}

// ============================================================================
// MAIN
// ============================================================================

async function main() {
  try {
    const environment = process.argv[2] || 'development';
    const database_name = `hono-auth-api-db-${environment}`;
    const __dirname = path.dirname(new URL(import.meta.url).pathname);
    const outputFilePath = path.join(__dirname, OUTPUT_FILE_NAME);
    
    console.log(`🌱 Generating seed SQL for environment: ${environment}`);
    console.log(`📝 Output file: ${outputFilePath}`);

    // Prepare data
    console.log('🔐 Hashing default password...');
    const hashedPassword = await hashPassword(DEFAULT_PASSWORD);
    
    const usersWithIds = DEMO_USERS.map((user, index) => ({
      ...user,
      id: index + 1
    }));

    // Generate SQL
    const sqlLines = [
        ...generateCleanupSql(),
        ...generateUsersSql(usersWithIds, hashedPassword),
        ...generateAuditLogsSql(usersWithIds),
        ...generateSecurityIncidentsSql(),
        ...generateTokenLogsSql(usersWithIds)
    ];

    // Write File
    fs.writeFileSync(outputFilePath, sqlLines.join('\n'));
    console.log('✅ SQL file generated successfully!');

    // Execute
    console.log(`🚀 Executing seed file on D1 (${database_name})...`);
    const command = `npx wrangler d1 execute ${database_name} --env ${environment} --file "${outputFilePath}" --local`;
    
    const result = executeCommand(command);
    
    // Process Output & Run Verification
    if (processWranglerOutput(result)) {
        runVerification(environment);
    } else {
        process.exit(1);
    }

  } catch (error) {
    console.error('\n💥 Fatal error during seeding:', error);
    process.exit(1);
  }
}

main();
