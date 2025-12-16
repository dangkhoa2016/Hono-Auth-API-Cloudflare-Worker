import bcrypt from 'bcryptjs';
import { getAllUserStatuses, getAllRoles } from '../../src/constants/roles.js';
import { UserService } from '../../src/services/userService.js';
import { getPlatformProxy } from 'wrangler';

async function hashPassword(password) {
  return await bcrypt.hash(password, 10);
}

const statuses = getAllUserStatuses();
const roles = getAllRoles();

// Tạo một số user mẫu
const users = [
  { full_name: 'John Doe', email: 'john@doe.local', password: 'password123' },
  { full_name: 'Jane Smith', email: 'jane@smith.local', password: 'password123' },
  { full_name: 'Alice Johnson', email: 'alice.johnson@local.test', password: 'password123' },
  { full_name: 'Bob Brown', email: 'bob.brown@local.test', password: 'password123' },
  { full_name: 'Charlie Cunties', email: 'charlie.cunties@local.test', password: 'password123' },
  { full_name: 'Diana Whister', email: 'diana.whister@local.test', password: 'password123' },
  { full_name: 'Eve D\'agar Papant', email: 'eve@papant.local', password: 'password123' },
  { full_name: 'Frank Gloster', email: 'frank@gloster.local', password: 'password123' },
  { full_name: 'Grace Hopperia', email: 'grace@hooperia.local', password: 'password123' },
  { full_name: 'Hank Pym', email: 'hank.pym@test.local', password: 'password123' },
  { full_name: 'Ivy League', email: 'ivy.league@test.local', password: 'password123' },
  { full_name: 'Jack Sparrow', email: 'jack.sparrow@local.test', password: 'password123' },
  { full_name: 'Kathy Bates', email: 'kathy@bates.local', password: 'password123' },
  { full_name: 'Leo Messi', email: 'leo.messi@test.local', password: 'password123' },
  { full_name: 'Mia Wallace', email: 'mia@wallace.test', password: 'password123' },
  { full_name: 'Nina Simone', email: 'nina@simone.local', password: 'password123' },
  { full_name: 'Oscar Wilde', email: 'oscar.wilde@local.test', password: 'password123' },
];

(async () => {
  const { env: { DB } } = await getPlatformProxy({ environment: 'test' });

  const userService = new UserService(DB);
  let successCount = 0;

  // Tạo các user mẫu
  for (const user of users) {
    user.password = await hashPassword(user.password);
    user.status = statuses[Math.floor(Math.random() * statuses.length)];
    user.role = roles[Math.floor(Math.random() * roles.length)];
    try {
      const createdUser = await userService.create(user);
      console.log(`Created user: ${createdUser.full_name} (${createdUser.email}) with role: ${createdUser.role} and status: ${createdUser.status}`);
      successCount++;
    } catch (error) {
      console.error(`❌ Failed to create user ${user.full_name} (${user.email}):`, error.message);
    }
  }

  console.log('✅ Users seeded successfully!');
  console.log(`✅ Successfully created: ${successCount} users`);

  // Danh sách người dùng trong cơ sở dữ liệu
  console.log('📋 Listing current users in database:');
  const allUsers = await userService.getUsers({ limit: 100, offset: 0 });
  console.log(allUsers);

  process.exit(0);
})();
