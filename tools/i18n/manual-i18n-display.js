#!/usr/bin/env node

/**
 * EN: Quick test for datetime formatting in success messages
 * VI: Kiểm thử nhanh định dạng thời gian trong thông điệp thành công
 */

import { initI18n } from '../../src/i18n/config.js';
import { tl, tpl } from '../../src/i18n/service.js';

console.log('🧪 Testing Fixed i18n Messages...\n');

try {
  // EN: Initialize i18n
  // VI: Khởi tạo i18n
  await initI18n();

  console.log('1️⃣ Testing User Registration Error...');
  const userError = tl('en', 'errors.user.registrationFailed', { reason: 'Email already exists' });
  console.log(`✅ User registration error: "${userError}"`);

  console.log('\n2️⃣ Testing Auth Success with proper datetime...');
  const now = new Date().toISOString();
  const authSuccess = tl('en', 'success.auth.loginSuccess', {
    userName: 'John Doe',
    userRole: 'admin',
    loginTime: now
  });
  console.log(`✅ Auth success: "${authSuccess}"`);

  console.log('\n3️⃣ Testing Auth Success with formatted datetime...');
  const formattedTime = new Date().toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short'
  });
  const authSuccessFormatted = tl('en', 'success.auth.loginSuccess', {
    userName: 'John Doe',
    userRole: 'admin',
    loginTime: formattedTime
  });
  console.log(`✅ Auth success formatted: "${authSuccessFormatted}"`);

  console.log('\n4️⃣ Testing Other Success Messages...');
  const userCreated = tl('en', 'success.user.created', {
    userName: 'Jane Smith',
    email: 'jane@example.com'
  });
  console.log(`✅ User created: "${userCreated}"`);

  const fileUploaded = tl('en', 'success.file.uploadCompleted', {
    filename: 'document.pdf',
    fileSize: '2.5MB'
  });
  console.log(`✅ File uploaded: "${fileUploaded}"`);

  console.log('\n5️⃣ Testing Proper Pluralization with tpl() Helper...');
  
  // EN: Test pluralization with the new tpl() helper
  // VI: Kiểm tra plural bằng helper tpl() mới
  const processingSingle = tpl('en', 'success.file.processingCompleted', 1, {
    filename: 'document.pdf',
    operationsCount: 1
  });
  console.log(`✅ Processing single: "${processingSingle}"`);

  const processingMultiple = tpl('en', 'success.file.processingCompleted', 5, {
    filename: 'document.pdf', 
    operationsCount: 5
  });
  console.log(`✅ Processing multiple: "${processingMultiple}"`);

  // EN: Test count-based pluralization with tpl()
  // VI: Kiểm tra plural dựa trên count với tpl()
  const itemsSingle = tpl('en', 'info.itemsFound', 1);
  console.log(`✅ Items found single: "${itemsSingle}"`);

  const itemsMultiple = tpl('en', 'info.itemsFound', 10);
  console.log(`✅ Items found multiple: "${itemsMultiple}"`);

  const itemsZero = tpl('en', 'info.itemsFound', 0);
  console.log(`✅ Items found zero: "${itemsZero}"`);

  console.log('\n6️⃣ Testing Different Languages with Pluralization...');
  
  // EN: Test Vietnamese pluralization (if vi.js has plural forms)
  // VI: Thử plural tiếng Việt (nếu vi.js có plural)
  const itemsViSingle = tpl('vi', 'info.itemsFound', 1);
  const itemsViMultiple = tpl('vi', 'info.itemsFound', 10);
  console.log(`✅ Items Vietnamese single: "${itemsViSingle}"`);
  console.log(`✅ Items Vietnamese multiple: "${itemsViMultiple}"`);

  console.log('\n7️⃣ Testing Practical Examples...');
  
  // EN: Practical examples with different counts
  // VI: Ví dụ thực tế với nhiều giá trị count
  const examples = [
    { count: 0, name: 'zero files' },
    { count: 1, name: 'single file' },
    { count: 2, name: 'two files' },
    { count: 5, name: 'multiple files' },
    { count: 100, name: 'many files' }
  ];

  examples.forEach(({ count, name }) => {
    const message = tpl('en', 'success.file.processingCompleted', count, {
      filename: 'batch.zip',
      operationsCount: count
    });
    console.log(`✅ ${name} (${count}): "${message}"`);
  });

  console.log('\n🎉 i18n pluralization with tpl() helper verified!');
} catch (error) {
  console.log(`❌ Test error: ${error.message}`);
}
