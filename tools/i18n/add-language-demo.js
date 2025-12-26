#!/usr/bin/env node

/**
 * Add New Language Demo
 * Demonstrates how easy it is to add a new language to the dynamic system
 */

import fs from 'fs';

// EN: Manual path utilities for better compatibility
// VI: Tiện ích ghép đường dẫn thủ công để tăng tương thích
function join(...parts) {
  return parts.join('/').replace(/\/+/g, '/');
}

console.log('🌍 Add New Language Demo\n');

const languageCode = process.argv[2] || 'fr';
const languageName = process.argv[3] || 'French';

console.log(`Adding language: ${languageCode} (${languageName})`);

// EN: Template for new language file (dynamic)
// VI: Mẫu file ngôn ngữ mới (tạo động theo ngôn ngữ)
const getLanguageTemplate = (languageCode, languageName) => {
  // EN: Sample translations for several languages
  // VI: Mẫu bản dịch cho một số ngôn ngữ
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
  // EN: Authentication messages
  // VI: Thông điệp xác thực
  auth: {
    // EN: Login successful
    // VI: Đăng nhập thành công
    loginSuccess: "${samples.loginSuccess}",
    // EN: Login failed
    // VI: Đăng nhập thất bại
    login_failed: "Login failed (${languageName})",
    // EN: Invalid credentials
    // VI: Thông tin xác thực không hợp lệ
    invalid_credentials: "Invalid credentials (${languageName})",
    // EN: Token expired
    // VI: Token hết hạn
    token_expired: "Token expired (${languageName})",
    // EN: Token invalid
    // VI: Token không hợp lệ
    token_invalid: "Token invalid (${languageName})",
    // EN: Token missing
    // VI: Thiếu token
    token_missing: "Token missing (${languageName})",
    // EN: Logout successful
    // VI: Đăng xuất thành công
    logout_success: "Logout successful (${languageName})",
    // EN: Password required
    // VI: Cần mật khẩu
    password_required: "Password required (${languageName})",
    // EN: Email required
    // VI: Cần email
    email_required: "Email required (${languageName})",
    // EN: Refresh token invalid
    // VI: Refresh token không hợp lệ
    refresh_token_invalid: "Refresh token invalid (${languageName})"
  },

  // EN: User management
  // VI: Quản lý người dùng
  user: {
    // EN: Profile updated
    // VI: Cập nhật hồ sơ
    profile_updated: "Profile updated (${languageName})",
    // EN: Profile not found
    // VI: Không tìm thấy hồ sơ
    profile_not_found: "Profile not found (${languageName})",
    // EN: User created
    // VI: Tạo người dùng
    user_created: "User created (${languageName})",
    // EN: User deleted
    // VI: Xoá người dùng
    user_deleted: "User deleted (${languageName})",
    // EN: User not found
    // VI: Không tìm thấy người dùng
    user_not_found: "User not found (${languageName})",
    // EN: Email already exists
    // VI: Email đã tồn tại
    email_already_exists: "Email already exists (${languageName})",
    // EN: Invalid user data
    // VI: Dữ liệu người dùng không hợp lệ
    invalid_user_data: "Invalid user data (${languageName})"
  },

  // EN: Validation messages
  // VI: Thông báo kiểm tra dữ liệu
  validation: {
    // EN: This field is required
    // VI: Trường này là bắt buộc
    required_field: "This field is required (${languageName})",
    // EN: Invalid email format
    // VI: Định dạng email không hợp lệ
    invalid_email: "Invalid email format (${languageName})",
    // EN: Password too short
    // VI: Mật khẩu quá ngắn
    password_too_short: "Password too short (${languageName})",
    // EN: Invalid format
    // VI: Định dạng không hợp lệ
    invalid_format: "Invalid format (${languageName})",
    // EN: Maximum length exceeded
    // VI: Vượt quá độ dài tối đa
    max_length_exceeded: "Maximum length exceeded (${languageName})",
    // EN: Minimum length required
    // VI: Yêu cầu độ dài tối thiểu
    min_length_required: "Minimum length required (${languageName})",
    // EN: Invalid characters
    // VI: Ký tự không hợp lệ
    invalid_characters: "Invalid characters (${languageName})",
    // EN: Passwords do not match
    // VI: Mật khẩu không khớp
    passwords_dont_match: "Passwords don't match (${languageName})"
  },

  // EN: System messages
  // VI: Thông báo hệ thống
  system: {
    // EN: Welcome to Hono Auth Worker API
    // VI: Chào mừng tới Hono Auth Worker API
    welcome: "${samples.welcome}",
    // EN: Success
    // VI: Thành công
    success: "${samples.success}",
    // EN: Error
    // VI: Lỗi
    error: "Error (${languageName})",
    // EN: Not found
    // VI: Không tìm thấy
    not_found: "Not found (${languageName})",
    // EN: Internal server error
    // VI: Lỗi máy chủ
    internal_error: "Internal server error (${languageName})",
    // EN: Bad request
    // VI: Yêu cầu không hợp lệ
    bad_request: "Bad request (${languageName})",
    // EN: Unauthorized
    // VI: Chưa xác thực
    unauthorized: "Unauthorized (${languageName})",
    // EN: Forbidden
    // VI: Bị cấm
    forbidden: "Forbidden (${languageName})",
    // EN: Service unavailable
    // VI: Dịch vụ tạm ngưng
    service_unavailable: "Service unavailable (${languageName})",
    // EN: Language changed to ...
    // VI: Đã chuyển ngôn ngữ sang ...
    language_changed: "Language changed to ${languageName.toLowerCase()}"
  },

  // EN: API response messages
  // VI: Thông báo phản hồi API
  api: {
    // EN: Health check successful
    // VI: Kiểm tra sức khoẻ thành công
    healthCheck: "Health check successful (${languageName})",
    // EN: Version information
    // VI: Thông tin phiên bản
    versionInfo: "Version information (${languageName})",
    // EN: Endpoint list
    // VI: Danh sách endpoint
    endpointList: "Endpoint list (${languageName})",
    // EN: Rate limit exceeded
    // VI: Vượt giới hạn truy cập
    rateLimitExceeded: "Rate limit exceeded (${languageName})",
    // EN: Invalid request
    // VI: Yêu cầu không hợp lệ
    invalidRequest: "Invalid request (${languageName})",
    // EN: Data retrieved successfully
    // VI: Lấy dữ liệu thành công
    dataRetrieved: "Data retrieved successfully (${languageName})",
    // EN: Operation completed
    // VI: Thao tác hoàn tất
    operationCompleted: "Operation completed (${languageName})",
    // EN: Processing error
    // VI: Lỗi xử lý
    processingError: "Processing error (${languageName})"
  },

  // EN: API endpoint descriptions
  // VI: Mô tả endpoint API
  endpoints: {
    auth: {
      // EN: User login with email and password
      // VI: Đăng nhập bằng email và mật khẩu
      login: "User login with email and password (${languageName})",
      // EN: Refresh access token
      // VI: Làm mới access token
      refresh: "Refresh access token (${languageName})",
      // EN: User logout
      // VI: Đăng xuất
      logout: "User logout (${languageName})"
    },
    user: {
      // EN: Get user profile
      // VI: Lấy hồ sơ người dùng
      profile: "Get user profile (${languageName})",
      // EN: Get current user information
      // VI: Lấy thông tin người dùng hiện tại
      me: "Get current user information (${languageName})"
    },
    system: {
      // EN: Check API health status
      // VI: Kiểm tra tình trạng API
      health: "Check API health status (${languageName})",
      // EN: Get API version information
      // VI: Lấy thông tin phiên bản API
      version: "Get API version information (${languageName})"
    },
    translations: {
      // EN: List all available translations
      // VI: Liệt kê toàn bộ bản dịch
      list: "List all available translations (${languageName})",
      // EN: Get translations for a language
      // VI: Lấy bản dịch cho một ngôn ngữ
      get: "Get translations for a language (${languageName})",
      // EN: Validate translation structure
      // VI: Kiểm tra cấu trúc bản dịch
      validate: "Validate translation structure (${languageName})",
      // EN: Get specific translation section
      // VI: Lấy một phần bản dịch cụ thể
      section: "Get specific translation section (${languageName})"
    },
    demo: {
      // EN: Zod demo information
      // VI: Thông tin demo Zod
      info: "Zod demo information (${languageName})",
      // EN: Demo registration with validation
      // VI: Đăng ký demo có kiểm tra
      register: "Demo registration with validation (${languageName})",
      // EN: Demo search with parameters
      // VI: Tìm kiếm demo với tham số
      search: "Demo search with parameters (${languageName})",
      // EN: Demo file upload
      // VI: Upload tệp demo
      upload: "Demo file upload (${languageName})"
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
