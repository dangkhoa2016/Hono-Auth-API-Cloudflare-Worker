#!/usr/bin/env node

/**
 * Add New Language Demo
 * Demonstrates how easy it is to add a new language to the dynamic system
 */

import fs from 'fs';

// Manual path utilities for better compatibility
function join(...parts) {
  return parts.join('/').replace(/\/+/g, '/');
}

console.log('🌍 Add New Language Demo\n');

const languageCode = process.argv[2] || 'fr';
const languageName = process.argv[3] || 'French';

console.log(`Adding language: ${languageCode} (${languageName})`);

// Template for new language file (dynamic based on language)
const getLanguageTemplate = (languageCode, languageName) => {
  // Sample translations for different languages
  const sampleTranslations = {
    fr: {
      loginSuccess: 'Connexion réussie',
      welcome: 'Bienvenue dans l\'API Hono Auth Worker',
      success: 'Succès'
    },
    es: {
      loginSuccess: 'Inicio de sesión exitoso',
      welcome: 'Bienvenido a la API Hono Auth Worker',
      success: 'Éxito'
    },
    de: {
      loginSuccess: 'Anmeldung erfolgreich',
      welcome: 'Willkommen bei Hono Auth Worker API',
      success: 'Erfolgreich'
    },
    ja: {
      loginSuccess: 'ログイン成功',
      welcome: 'Hono Auth Worker APIへようこそ',
      success: '成功'
    },
    zh: {
      loginSuccess: '登录成功',
      welcome: '欢迎使用 Hono Auth Worker API',
      success: '成功'
    }
  };

  const samples = sampleTranslations[languageCode] || {
    loginSuccess: `Login successful (${languageName})`,
    welcome: `Welcome to Hono Auth Worker API (${languageName})`,
    success: `Success (${languageName})`
  };

  return `/**
 * ${languageName} Translations
 * Auto-generated template for ${languageCode} language
 */

export default {
  // Authentication messages
  auth: {
    loginSuccess: "${samples.loginSuccess}", // Login successful
    login_failed: "Login failed (${languageName})", // Login failed
    invalid_credentials: "Invalid credentials (${languageName})", // Invalid credentials
    token_expired: "Token expired (${languageName})", // Token expired
    token_invalid: "Token invalid (${languageName})", // Token invalid
    token_missing: "Token missing (${languageName})", // Token missing
    logout_success: "Logout successful (${languageName})", // Logout successful
    password_required: "Password required (${languageName})", // Password required
    email_required: "Email required (${languageName})", // Email required
    refresh_token_invalid: "Refresh token invalid (${languageName})" // Refresh token invalid
  },

  // User management
  user: {
    profile_updated: "Profile updated (${languageName})", // Profile updated
    profile_not_found: "Profile not found (${languageName})", // Profile not found
    user_created: "User created (${languageName})", // User created
    user_deleted: "User deleted (${languageName})", // User deleted
    user_not_found: "User not found (${languageName})", // User not found
    email_already_exists: "Email already exists (${languageName})", // Email already exists
    invalid_user_data: "Invalid user data (${languageName})" // Invalid user data
  },

  // Validation messages
  validation: {
    required_field: "This field is required (${languageName})", // This field is required
    invalid_email: "Invalid email format (${languageName})", // Invalid email format
    password_too_short: "Password too short (${languageName})", // Password too short
    invalid_format: "Invalid format (${languageName})", // Invalid format
    max_length_exceeded: "Maximum length exceeded (${languageName})", // Maximum length exceeded
    min_length_required: "Minimum length required (${languageName})", // Minimum length required
    invalid_characters: "Invalid characters (${languageName})", // Invalid characters
    passwords_dont_match: "Passwords don't match (${languageName})" // Passwords don't match
  },

  // System messages
  system: {
    welcome: "${samples.welcome}", // Welcome to Hono Auth Worker API
    success: "${samples.success}", // Success
    error: "Error (${languageName})", // Error
    not_found: "Not found (${languageName})", // Not found
    internal_error: "Internal server error (${languageName})", // Internal server error
    bad_request: "Bad request (${languageName})", // Bad request
    unauthorized: "Unauthorized (${languageName})", // Unauthorized
    forbidden: "Forbidden (${languageName})", // Forbidden
    service_unavailable: "Service unavailable (${languageName})", // Service unavailable
    language_changed: "Language changed to ${languageName.toLowerCase()}" // Language changed to [Language]
  },

  // API response messages
  api: {
    healthCheck: "Health check successful (${languageName})", // Health check successful
    versionInfo: "Version information (${languageName})", // Version information
    endpointList: "Endpoint list (${languageName})", // Endpoint list
    rateLimitExceeded: "Rate limit exceeded (${languageName})", // Rate limit exceeded
    invalidRequest: "Invalid request (${languageName})", // Invalid request
    dataRetrieved: "Data retrieved successfully (${languageName})", // Data retrieved successfully
    operationCompleted: "Operation completed (${languageName})", // Operation completed
    processingError: "Processing error (${languageName})" // Processing error
  },

  // API endpoint descriptions
  endpoints: {
    auth: {
      login: "User login with email and password (${languageName})", // User login with email and password
      refresh: "Refresh access token (${languageName})", // Refresh access token
      logout: "User logout (${languageName})" // User logout
    },
    user: {
      profile: "Get user profile (${languageName})", // Get user profile
      me: "Get current user information (${languageName})" // Get current user information
    },
    system: {
      health: "Check API health status (${languageName})", // Check API health status
      version: "Get API version information (${languageName})" // Get API version information
    },
    translations: {
      list: "List all available translations (${languageName})", // List all available translations
      get: "Get translations for a language (${languageName})", // Get translations for a language
      validate: "Validate translation structure (${languageName})", // Validate translation structure
      section: "Get specific translation section (${languageName})" // Get specific translation section
    },
    demo: {
      info: "Zod demo information (${languageName})", // Zod demo information
      register: "Demo registration with validation (${languageName})", // Demo registration with validation
      search: "Demo search with parameters (${languageName})", // Demo search with parameters
      upload: "Demo file upload (${languageName})" // Demo file upload
    }
  }
};
`;
};

const languageTemplate = getLanguageTemplate(languageCode, languageName);

// Create the new language file
const localesDir = join(process.cwd(), 'src', 'i18n', 'locales');
const languageFile = join(localesDir, `${languageCode}.js`);

try {
  // Check if language already exists
  if (fs.existsSync(languageFile)) {
    console.log(`⚠️ Language file already exists: ${languageFile}`);
    console.log('   Skipping file creation...');
  } else {
    // Create the language file
    fs.writeFileSync(languageFile, languageTemplate);
    console.log(`✅ Created language file: ${languageFile}`);
  }

  console.log(`\n🎉 Language ${languageCode} (${languageName}) is ready!`);
  console.log('\nNext steps:');
  console.log('1. Edit the translations in the new file');
  console.log('2. Restart the application');
  console.log('3. The language will be automatically detected and available');
  console.log(`4. Test with: curl "http://localhost:8787/api?lang=${languageCode}"`);

  console.log('\n🔧 No code changes needed - the system is fully dynamic!');

} catch (error) {
  console.error('❌ Error creating language file:', error.message);
}
