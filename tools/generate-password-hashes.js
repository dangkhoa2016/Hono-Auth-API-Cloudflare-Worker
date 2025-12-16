#!/usr/bin/env node

/**
 * Generate hashed passwords for test users
 * This script generates bcrypt hashes for the test users
 */

import bcrypt from 'bcryptjs';

async function generatePasswordHashes() {
  const password = 'password123';
  const saltRounds = 10;

  console.log('🔐 Generating password hashes for test users...');
  console.log(`Password: ${password}`);
  console.log(`Salt rounds: ${saltRounds}\n`);

  // Generate multiple hashes to avoid identical hashes
  const hashes = [];
  for (let i = 0; i < 5; i++) {
    const hash = await bcrypt.hash(password, saltRounds);
    hashes.push(hash);
    console.log(`Hash ${i + 1}: ${hash}`);
  }

  console.log('\n📋 Use these hashes in your migration file:');
  console.log('-- All hashes are for password: password123');
  hashes.forEach((hash, index) => {
    console.log(`-- Hash ${index + 1}: '${hash}'`);
  });

  console.log('\n✅ Password hash generation completed');
}

// Run if executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  generatePasswordHashes().catch(console.error);
}

export { generatePasswordHashes };
