import bcrypt from 'bcryptjs';
import { execSync } from 'child_process';
import { getAllUserStatuses, getAllRoles } from '../../src/constants/roles.js';

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

const statuses = getAllUserStatuses();

// Tạo một số user mẫu
const users = [
  { full_name: 'John Doe', email: 'john@doe.local', password: 'password123', status: statuses[0] }, // 'active'
  { full_name: 'Jane Smith', email: 'jane@smith.local', password: 'password123', status: statuses[1] }, // 'inactive'
  { full_name: 'Alice Johnson', email: 'alice.johnson@local.test', password: 'password123', status: statuses[2] }, // 'suspended'
  { full_name: 'Bob Brown', email: 'bob.brown@local.test', password: 'password123', status: 'active' },
  { full_name: 'Charlie Cunties', email: 'charlie.cunties@local.test', password: 'password123', status: 'active' },
  { full_name: 'Diana Whister', email: 'diana.whister@local.test', password: 'password123', status: 'active' },
  { full_name: 'Eve D\'agar Papant', email: 'eve@papant.local', password: 'password123', status: 'active' },
  { full_name: 'Frank Gloster', email: 'frank@gloster.local', password: 'password123', status: 'active' },
  { full_name: 'Grace Hopperia', email: 'grace@hooperia.local', password: 'password123', status: 'active' },
  { full_name: 'Hank Pym', email: 'hank.pym@test.local', password: 'password123', status: statuses[0] }, // 'active'
  { full_name: 'Ivy League', email: 'ivy.league@test.local', password: 'password123', status: 'active' },
  { full_name: 'Jack Sparrow', email: 'jack.sparrow@local.test', password: 'password123', status: statuses[1] }, // 'inactive'
  { full_name: 'Kathy Bates', email: 'kathy@bates.local', password: 'password123', status: 'active' },
  { full_name: 'Leo Messi', email: 'leo.messi@test.local', password: 'password123', status: 'active' },
  { full_name: 'Mia Wallace', email: 'mia@wallace.test', password: 'password123', status: 'active' },
  { full_name: 'Nina Simone', email: 'nina@simone.local', password: 'password123', status: statuses[2] }, // 'suspended'
  { full_name: 'Oscar Wilde', email: 'oscar.wilde@local.test', password: 'password123', status: 'active' },
];

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
  return str.replace(/'/g, '\'\'');
}

function listUsersInDatabase(database_name, environment) {
  const command = `npx wrangler d1 execute ${database_name} --env ${environment} --command "SELECT * FROM users;" --local`;
  const result = executeCommand(command);
  if (result.success) {
    console.log('📋 Current users in database:');
    console.log(result.output);
  }
  else {
    console.error('❌ Failed to list users in database:');
    console.error(result.error);
    if (result.stderr) {
      console.error(`   Details: ${result.stderr}`);
    }
  }
}

(async () => {
  try {
    // Get environment from command line args or default to development
    const environment = process.argv[2] || 'development';
    const database_name = `hono-auth-api-db-${environment}`;

    console.log(`🌱 Starting database seeding for environment: ${environment}`);
    console.log(`📦 Database: ${database_name}`);
    console.log(`👥 Creating ${users.length} sample users...\n`);

    // Hash password once for all users
    const hashedPassword = await hashPassword('password123');
    console.log('🔐 Password hashed successfully\n');

    let successCount = 0;
    const roles = getAllRoles();

    for (let i = 0; i < users.length; i++) {
      const user = users[i];
      console.log(`[${i + 1}/${users.length}] Creating user: ${user.full_name} (${user.email})`);

      // Escape single quotes in user data
      const escapedFullName = escapeString(user.full_name);
      const escapedEmail = escapeString(user.email);
      const escapedStatus = escapeString(user.status);
      const role = roles[Math.floor(Math.random() * roles.length)]; // Randomly assign a role

      const sql = `INSERT INTO users (full_name, email, password, role, status, created_at, updated_at) VALUES ('${escapedFullName}', '${escapedEmail}', '${hashedPassword}', '${role}', '${escapedStatus}', datetime('now'), datetime('now'));`;

      const command = `npx wrangler d1 execute ${database_name} --env ${environment} --command "${sql}" --local`;

      const result = executeCommand(command);

      if (result.success) {
        console.log(`✅ User ${user.full_name} created successfully`);
        successCount++;
      } else {
        console.error(`❌ Failed to create user ${user.full_name}:`);
        console.error(`   Error: ${result.error}`);
        if (result.stderr) {
          console.error(`   Details: ${result.stderr}`);
        }

        console.log(`\n💥 Seeding stopped after ${successCount} successful users`);
        console.log('💡 Fix the error above and run again');
        console.log(`🔍 Failed SQL command: ${command}`);
        process.exit(1);
      }
      console.log(''); // Empty line for readability
    }

    console.log('🎉 Seeding completed successfully!');
    console.log(`✅ Successfully created: ${successCount} users`);

    console.log('📋 Listing current users in database:');
    listUsersInDatabase(database_name, environment);
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error);
    process.exit(1);
  }
})();
