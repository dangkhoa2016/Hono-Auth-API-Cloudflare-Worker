/**
 * EN: Debug i18n pluralization issue
 * VI: Gỡ lỗi vấn đề số nhiều trong i18n
 */

import { i18next } from '../../src/i18n/config.js';
import { initI18n } from '../../src/i18n/config.js';

async function testPluralization() {
  console.log('🔍 Initializing i18n...');
  await initI18n();

  console.log('\n📊 Testing i18next pluralization:');
  
  // EN: Test totalUsersCount pluralization
  // VI: Kiểm tra plural cho totalUsersCount
  console.log('\n--- totalUsersCount ---');
  console.log('Count 0:', i18next.t('admin.totalUsersCount', { count: 0 }));
  console.log('Count 1:', i18next.t('admin.totalUsersCount', { count: 1 }));
  console.log('Count 2:', i18next.t('admin.totalUsersCount', { count: 2 }));
  console.log('Count 5:', i18next.t('admin.totalUsersCount', { count: 5 }));
  console.log('Count 10:', i18next.t('admin.totalUsersCount', { count: 10 }));

  // EN: Test usersListRetrieved pluralization
  // VI: Kiểm tra plural cho usersListRetrieved
  console.log('\n--- usersListRetrieved ---');
  console.log('Count 1:', i18next.t('admin.usersListRetrieved', { 
    count: 1, 
    displayedCount: 1, 
    currentPage: 1, 
    totalPages: 1, 
    requestedBy: 'Test User' 
  }));
  console.log('Count 5:', i18next.t('admin.usersListRetrieved', { 
    count: 5, 
    displayedCount: 5, 
    currentPage: 1, 
    totalPages: 1, 
    requestedBy: 'Test User' 
  }));
  console.log('Count 10:', i18next.t('admin.usersListRetrieved', { 
    count: 10, 
    displayedCount: 10, 
    currentPage: 1, 
    totalPages: 2, 
    requestedBy: 'Test User' 
  }));

  // EN: Inspect i18next configuration
  // VI: Kiểm tra cấu hình i18next
  console.log('\n🔧 i18next Configuration:');
  console.log('Language:', i18next.language);
  console.log('Languages:', i18next.languages);
  console.log('Options keys:', Object.keys(i18next.options));
  console.log('Plural separator:', i18next.options.pluralSeparator);
  console.log('Compatibility JSON:', i18next.options.compatibilityJSON);
  
  // EN: Check available resource keys for totalUsersCount
  // VI: Xem các key resource cho totalUsersCount
  console.log('\n🔍 Available translation keys:');
  const store = i18next.getResourceBundle('en', 'translation');
  console.log('admin.totalUsersCount:', store.admin?.totalUsersCount);
  console.log('admin.totalUsersCount_other:', store.admin?.totalUsersCount_other);
  console.log('admin.usersListRetrieved:', store.admin?.usersListRetrieved);
  console.log('admin.usersListRetrieved_other:', store.admin?.usersListRetrieved_other);
  
  // EN: Test direct pluralization APIs
  // VI: Kiểm tra API plural hoá trực tiếp
  console.log('\n🧪 Testing direct pluralization:');
  console.log('Exists method result for count 1:', i18next.exists('admin.totalUsersCount', { count: 1 }));
  console.log('Exists method result for count 5:', i18next.exists('admin.totalUsersCount', { count: 5 }));
  console.log('Exists method result for plural:', i18next.exists('admin.totalUsersCount_other'));
  
  // EN: Inspect plural resolver suffixes
  // VI: Kiểm tra hậu tố của plural resolver
  const PluralResolver = i18next.services.pluralResolver;
  console.log('Plural resolver suffix for count 1:', PluralResolver.getSuffix('en', 1));
  console.log('Plural resolver suffix for count 5:', PluralResolver.getSuffix('en', 5));
  console.log('Plural resolver suffix for count 10:', PluralResolver.getSuffix('en', 10));
}

testPluralization().catch(console.error);
