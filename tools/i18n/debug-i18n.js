/**
 * Debug i18n pluralization issue
 */

import { i18next } from '../../src/i18n/config.js';
import { initI18n } from '../../src/i18n/config.js';

async function testPluralization() {
  console.log('🔍 Initializing i18n...');
  await initI18n();

  console.log('\n📊 Testing i18next pluralization:');
  
  // Test totalUsersCount
  console.log('\n--- totalUsersCount ---');
  console.log('Count 0:', i18next.t('admin.totalUsersCount', { count: 0 }));
  console.log('Count 1:', i18next.t('admin.totalUsersCount', { count: 1 }));
  console.log('Count 2:', i18next.t('admin.totalUsersCount', { count: 2 }));
  console.log('Count 5:', i18next.t('admin.totalUsersCount', { count: 5 }));
  console.log('Count 10:', i18next.t('admin.totalUsersCount', { count: 10 }));

  // Test usersListRetrieved
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

  // Debug i18next configuration
  console.log('\n🔧 i18next Configuration:');
  console.log('Language:', i18next.language);
  console.log('Languages:', i18next.languages);
  console.log('Options keys:', Object.keys(i18next.options));
  console.log('Plural separator:', i18next.options.pluralSeparator);
  console.log('Compatibility JSON:', i18next.options.compatibilityJSON);
  
  // Check what keys exist for totalUsersCount
  console.log('\n🔍 Available translation keys:');
  const store = i18next.getResourceBundle('en', 'translation');
  console.log('admin.totalUsersCount:', store.admin?.totalUsersCount);
  console.log('admin.totalUsersCount_other:', store.admin?.totalUsersCount_other);
  console.log('admin.usersListRetrieved:', store.admin?.usersListRetrieved);
  console.log('admin.usersListRetrieved_other:', store.admin?.usersListRetrieved_other);
  
  // Test direct pluralization functionality
  console.log('\n🧪 Testing direct pluralization:');
  console.log('Exists method result for count 1:', i18next.exists('admin.totalUsersCount', { count: 1 }));
  console.log('Exists method result for count 5:', i18next.exists('admin.totalUsersCount', { count: 5 }));
  console.log('Exists method result for plural:', i18next.exists('admin.totalUsersCount_other'));
  
  // Test plural resolver
  const PluralResolver = i18next.services.pluralResolver;
  console.log('Plural resolver suffix for count 1:', PluralResolver.getSuffix('en', 1));
  console.log('Plural resolver suffix for count 5:', PluralResolver.getSuffix('en', 5));
  console.log('Plural resolver suffix for count 10:', PluralResolver.getSuffix('en', 10));
}

testPluralization().catch(console.error);
