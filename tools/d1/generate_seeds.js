import bcrypt from 'bcryptjs';
import fs from 'fs';
import path from 'path';
import { getAllUserStatuses, getAllRoles } from '../../src/constants/roles.js';

const statuses = getAllUserStatuses();
const roles = getAllRoles();

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

const fileName = 'seeds.sql';
const currentDirectory = process.cwd();
const absoluteFilePath = path.resolve(currentDirectory, './tools/d1', fileName);

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

function escapeString(str) {
  return str.replace(/'/g, '\'\'');
}

function randomTimestamp(startTime = new Date(2020, 0, 1), endTime = new Date()) {
  const start = startTime.getTime();
  const end = endTime.getTime();
  const randomTime = Math.floor(Math.random() * (end - start + 1)) + start;
  return new Date(randomTime);
}

function formatSqlDate(date) {
  return date.toISOString().slice(0, 19).replace('T', ' ');
}

(async () => {
  const password = 'password123';
  const hashedPassword = await hashPassword(password);

  if (fs.existsSync(absoluteFilePath)) {
    fs.unlinkSync(absoluteFilePath);
  }

  for (const user of users) {
    // Escape single quotes in user data
    const escapedFullName = escapeString(user.full_name);
    const escapedEmail = escapeString(user.email);
    const escapedStatus = escapeString(user.status);
    const createdAt = randomTimestamp(new Date(2020, 0, 1), new Date());
    const updatedAt = randomTimestamp(createdAt, new Date());
    fs.appendFileSync(absoluteFilePath, 'INSERT INTO users' +
      ' (full_name, email, password, role, status, created_at, updated_at)' +
      ' VALUES ' +
      ` ('${escapedFullName}', '${escapedEmail}', '${hashedPassword}',` +
      ` '${roles[Math.floor(Math.random() * roles.length)]}',` +
      ` '${escapedStatus}', '${formatSqlDate(createdAt)}', '${formatSqlDate(updatedAt)}');\n`);
  }

  console.log(`✅ Successfully generated seed data in ${absoluteFilePath}`);
  console.log('You can now run the following command to execute the seed data:');
  console.log(`npx wrangler d1 execute <database_name> --env <environment> --file ${absoluteFilePath} --local`);
})().catch(error => {
  console.error('❌ Error generating seed data:', error);
});
