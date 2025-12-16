/**
 * Simple test of context translation
 */

import i18next from 'i18next';

// Simple initialization with our translation structure
const resources = {
  en: {
    translation: {
      roles: {
        displayName: "Role",
        displayName_context_user: "User",
        displayName_context_admin: "Administrator", 
        displayName_context_super_admin: "Super Administrator"
      }
    }
  }
};

await i18next.init({
  lng: 'en',
  fallbackLng: 'en',
  resources,
  interpolation: {
    escapeValue: false
  },
  pluralSeparator: '_',
  contextSeparator: '_context_',
  nsSeparator: ':',
  keySeparator: '.',
  compatibilityJSON: 'v4'
});

console.log('=== Testing Context Translation ===');

// Test different approaches
console.log('Base key:', i18next.t('roles.displayName'));
console.log('Context user:', i18next.t('roles.displayName', { context: 'user' }));
console.log('Context admin:', i18next.t('roles.displayName', { context: 'admin' }));
console.log('Context super_admin:', i18next.t('roles.displayName', { context: 'super_admin' }));

console.log('\n=== Direct key access ===');
console.log('Direct user:', i18next.t('roles.displayName_context_user'));
console.log('Direct admin:', i18next.t('roles.displayName_context_admin'));
console.log('Direct super_admin:', i18next.t('roles.displayName_context_super_admin'));
