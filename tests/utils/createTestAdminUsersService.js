/**
 * Test Admin User Creation Script
 * Creates admin and Super Admin users for testing purposes
*/

import bcrypt from 'bcryptjs';

export async function createTestAdminUsers(db) {
  const timestamp = Date.now();

  try {
    // Hash passwords
    const adminPassword = await bcrypt.hash('password123', 10);
    const superAdminPassword = await bcrypt.hash('password123', 10);

    // Create admin user
    const adminResult = await db.prepare(`
      INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      'Test Admin User',
      `test-admin-${timestamp}@example.com`,
      adminPassword,
      'admin',
      'active'
    ).run();

    // Create Super Admin user
    const superAdminResult = await db.prepare(`
      INSERT INTO users (full_name, email, password, role, status, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))
    `).bind(
      'Test Super Admin User',
      `test-superadmin-${timestamp}@example.com`,
      superAdminPassword,
      'super_admin',
      'active'
    ).run();

    console.log('✅ Test admin users created successfully');
    console.log(`Admin user: test-admin-${timestamp}@example.com`);
    console.log(`Super Admin user: test-superadmin-${timestamp}@example.com`);

    return {
      admin: {
        id: adminResult.meta.last_row_id,
        email: `test-admin-${timestamp}@example.com`,
        password: 'admin123'
      },
      super_admin: {
        id: superAdminResult.meta.last_row_id,
        email: `test-superadmin-${timestamp}@example.com`,
        password: 'superadmin123'
      }
    };

  } catch (error) {
    console.error('❌ Failed to create test admin users:', error.message);
    throw error;
  }
}

export default createTestAdminUsers;
