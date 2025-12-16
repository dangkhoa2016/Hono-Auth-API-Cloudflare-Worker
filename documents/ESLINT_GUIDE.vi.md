# Hướng Dẫn Cấu Hình ESLint & Style Guide

> 🌐 Language / Ngôn ngữ: [English](ESLINT_GUIDE.md) | **Tiếng Việt**

# 🔧 Hướng Dẫn ESLint

### Test files và generated files
*.test.js
*.spec.jsTổng Quan

Project đã được tích hợp với **ESLint** - một JavaScript linting tool mạnh mẽ để đảm bảo code quality, consistency và ngăn chặn các lỗi thường gặp.

## 🎯 Tại Sao Sử Dụng ESLint?

### ✅ **Lợi Ích:**

| **Không Có ESLint** | **Có ESLint** |
|---------------------|---------------|
| ❌ Định dạng không nhất quán | ✅ Code style nhất quán |
| ❌ Lỗi runtime tiềm ẩn | ✅ Phát hiện lỗi sớm |
| ❌ Thực hành code kém | ✅ Thực thi best practices |
| ❌ Khó bảo trì | ✅ Bảo trì dễ dàng |
| ❌ Không có tiêu chuẩn | ✅ Tiêu chuẩn coding team |

## 🔧 Cấu Hình

### 📁 **File Cấu Hình**
```
.eslintrc.json       # Cấu hình ESLint chính
.eslintignore        # Files/folders để ignore
.vscode/tasks.json   # VS Code ESLint tasks
```

### 📝 **Cấu Hình Hiện Tại** (`.eslintrc.json`)

#### **Thiết Lập Environment:**
```javascript
env: {
  browser: true,    // Browser globals
  es2021: true,     // ES2021 features
  node: true        // Node.js globals
}
```

#### **Parser Options:**
```javascript
parserOptions: {
  ecmaVersion: 'latest',    // ECMAScript mới nhất
  sourceType: 'module'      // ES6 modules
}
```

#### **Extends:**
```javascript
extends: ['eslint:recommended']  // ESLint recommended rules
```

### 🎯 **Các Rules Chính Được Áp Dụng**

#### **Code Style:**
- **Thụt lề**: 2 spaces (`indent: ['error', 2]`)
- **Dấu nháy**: Single quotes (`quotes: ['error', 'single']`)
- **Dấu chấm phẩy**: Bắt buộc (`semi: ['error', 'always']`)
- **Line breaks**: Unix style (`linebreak-style: ['error', 'unix']`)

#### **Best Practices:**
- **Không có biến không sử dụng**: Error (`no-unused-vars: ['error', { argsIgnorePattern: '^_' }]`)
- **Ưu tiên const**: Bắt buộc (`prefer-const: ['error']`)
- **Không dùng var**: Error (`no-var: ['error']`)
- **Arrow functions**: Ưa thích (`prefer-arrow-callback: ['error']`)
- **Equality**: Strict equality (`eqeqeq: ['error', 'always']`)
- **Curly braces**: Bắt buộc (`curly: ['error']`)

#### **Ngăn Chặn Lỗi:**
- **Không có biến undefined**: Error (`no-undef: ['error']`)
- **Không có code không thể reach**: Error (`no-unreachable: ['error']`)
- **Không có import trùng lặp**: Error (`no-duplicate-imports: ['error']`)
- **Không có block rỗng**: Error (`no-empty: ['error']`)
- **Require await**: Warning (`require-await: ['warn']`)

#### **Spacing & Formatting:**
- **Object spacing**: `{ key: value }` (`object-curly-spacing: ['error', 'always']`)
- **Array spacing**: `[item1, item2]` (`array-bracket-spacing: ['error', 'never']`)
- **Không có trailing spaces**: Error (`no-trailing-spaces: ['error']`)
- **Function spacing**: `function()` vs `function ()` (`space-before-function-paren`)
- **Arrow spacing**: `=> {}` (`arrow-spacing: ['error']`)
- **Template literals**: `${var}` không phải `${ var }` (`template-curly-spacing: ['error', 'never']`)
- **Tối đa empty lines**: 2 (`no-multiple-empty-lines: ['error', { max: 2 }]`)
- **End of line**: Bắt buộc (`eol-last: ['error']`)

### 🧪 **Test Files Override**
```javascript
overrides: [
  {
    files: ['tests/**/*.js', 'test-*.js', '*.test.js'],
    rules: {
      'no-console': 'off',        // Cho phép console.log trong tests
      'require-await': 'off'      // Cho phép async without await trong tests
    }
  }
]
```

### 🚫 **File Được Ignore** (`.eslintignore` + `ignorePatterns`)

**Qua `.eslintignore`:**
```
# Dependencies
node_modules/
package-lock.json

# Build outputs
dist/
build/
.wrangler/

# Environment files
.env
.env.*
.dev.vars.development
.dev.vars.test
.dev.vars.staging
.dev.vars

# Configuration files
wrangler.toml

# Database migrations
migrations/

# Test files and generated files
tests/legacy/
*.test.js
*.spec.js

# Logs and temporary files
*.log
*.tmp
*.temp

# IDE and OS files
.vscode/
.idea/
.DS_Store
Thumbs.db
```

**Qua `ignorePatterns` trong `.eslintrc.json`:**
```json
"ignorePatterns": [
  "node_modules/",
  "dist/",
  "build/",
  "*.min.js",
  "wrangler.toml",
  "migrations/",
  ".wrangler/"
]
```

## 🚀 **Sử Dụng**

### **NPM Scripts**
```bash
# Kiểm tra code để tìm issues
npm run lint

# Tự động sửa các issues có thể fix được
npm run lint:fix

# Kiểm tra strict (không cho phép warnings)
npm run lint:check
```

**Chi Tiết Script:**
- `lint`: `eslint src/ tests/ --ext .js` - Lint tất cả JS files trong src và tests
- `lint:fix`: `eslint src/ tests/ --ext .js --fix` - Tự động sửa các issues có thể fix được
- `lint:check`: `eslint src/ tests/ --ext .js --max-warnings 0` - CI/CD ready (fail nếu có warnings)

### **VS Code Tasks**
Có sẵn qua `Ctrl+Shift+P` → `Tasks: Run Task`:
- **ESLint - Check Code** - Chạy linting
- **ESLint - Fix Code** - Tự động sửa issues
- **ESLint - Strict Check** - Kiểm tra CI/CD ready

### **Ví Dụ Command Line**
```bash
# Lint specific files
npx eslint src/routes/auth.js

# Lint với custom format
npx eslint src/ --format table

# Fix specific directory
npx eslint src/routes/ --fix

# Chỉ kiểm tra errors (ignore warnings)
npx eslint src/ --quiet
```

## 📊 **Vấn Đề Thường Gặp & Cách Sửa**

### **1. Trailing Spaces**
```javascript
// ❌ Sai
const user = 'john';    

// ✅ Đúng
const user = 'john';
```
**Sửa:** `npm run lint:fix` (tự động sửa được)

### **2. Quote Consistency**
```javascript
// ❌ Sai
const message = "Hello world";

// ✅ Đúng
const message = 'Hello world';
```
**Sửa:** `npm run lint:fix` (tự động sửa được)

### **3. Unused Variables**
```javascript
// ❌ Sai
import { validation_log, zod_log } from '../utils/debug.js';
// Chỉ sử dụng zod_log

// ✅ Đúng
import { zod_log } from '../utils/debug.js';

// ✅ Cũng được chấp nhận (underscore prefix)
const _unusedParam = someFunction(); // Không trigger error
```
**Sửa:** Cần xóa thủ công (underscore prefix cho intentional unused vars)

### **4. Indentation**
```javascript
// ❌ Sai (4 spaces)
if (condition) {
    return true;
}

// ✅ Đúng (2 spaces)
if (condition) {
  return true;
}
```
**Sửa:** `npm run lint:fix` (tự động sửa được)

### **5. Object Spacing**
```javascript
// ❌ Sai
const obj = {key: 'value'};

// ✅ Đúng
const obj = { key: 'value' };
```
**Sửa:** `npm run lint:fix` (tự động sửa được)

### **6. Console Statements**
```javascript
// ⚠️ Warning trong src/ files (sử dụng debug package thay thế)
console.log('Debug message');

// ✅ Tốt hơn - sử dụng debug package
import { route_log } from '../utils/debug.js';
const debug = route_log('auth');
debug('User authenticated successfully');

// ✅ Được phép trong test files
// tests/authTest.js
console.log('Test output'); // Không có warning
```
**Sửa:** Thay thế bằng debug package hoặc chuyển vào test files

### **7. Function Spacing**
```javascript
// ❌ Sai
function test () { return true; }
const arrow = () =>{ return true; }

// ✅ Đúng
function test() { return true; }
const arrow = () => { return true; }
```
**Sửa:** `npm run lint:fix` (tự động sửa được)

### **8. Template Literal Spacing**
```javascript
// ❌ Sai
const message = `Hello ${ name }`;

// ✅ Đúng
const message = `Hello ${name}!`;
```
**Sửa:** `npm run lint:fix` (tự động sửa được)

### **9. Equality Operators**
```javascript
// ❌ Sai
if (value == '0') { /* ... */ }

// ✅ Đúng
if (value === '0') { /* ... */ }
```
**Sửa:** Cần sửa thủ công

### **10. Curly Braces**
```javascript
// ❌ Sai
if (condition) doSomething();

// ✅ Đúng
if (condition) {
  doSomething();
}
```
**Sửa:** `npm run lint:fix` (tự động sửa được)

## 🔍 **Tích Hợp với Development Workflow**

### **Pre-commit Checks**
Thiết lập khuyến nghị cho pre-commit hook:
```bash
# Thêm vào package.json scripts
"precommit": "npm run lint:check"
```

### **Tích Hợp CI/CD**
```bash
# Trong CI pipeline
name: Code Quality
run: |
  npm install
  npm run lint:check  # Fail nếu có warnings
  npm run test        # Chạy tests sau khi linting
```

### **Tích Hợp VS Code**
ESLint extension sẽ:
- ✅ Highlight errors real-time
- ✅ Hiển thị problems trong Problems panel
- ✅ Auto-fix on save (nếu được cấu hình)
- ✅ IntelliSense support

## 📈 **ESLint Metrics & Monitoring**

### **Trạng Thái Hiện Tại**
```bash
npm run lint
```
**Kết Quả Mới Nhất:**
- ✅ **0 errors** - Không có blocking issues
- ✅ **0 warnings** - Codebase sạch
- 📊 **Tất cả files đều pass** - Tuân thủ đầy đủ ESLint rules

### **Tác Động Performance**
- **Linting time**: ~2-3 giây cho toàn bộ codebase
- **Auto-fix time**: ~1-2 giây
- **Memory usage**: Tối thiểu (<50MB)

### **File Coverage**
```
src/                  ✅ Fully linted (40 JS files)
├── routes/          ✅ Tất cả route files
├── services/        ✅ Tất cả service files  
├── utils/           ✅ Tất cả utility files
├── middleware/      ✅ Tất cả middleware
├── schemas/         ✅ Tất cả schema files
├── i18n/            ✅ i18n system files
└── constants/       ✅ Configuration files

tests/               ✅ Linted với test overrides (23 JS files)
├── suites/         ✅ Test suite files
├── utils/          ✅ Test utilities
├── scripts/        ✅ Test automation
└── config/         ✅ Test configuration

Tổng cộng: 63 JavaScript files dưới sự kiểm soát của ESLint
```

## 🛠️ **Tùy Chỉnh**

### **Thêm Rules Mới**
Chỉnh sửa `.eslintrc.json`:
```json
{
  "rules": {
    // Thêm custom rule
    "no-magic-numbers": ["warn", { "ignore": [0, 1, -1] }],
    "max-len": ["error", { "code": 120 }]
  }
}
```

### **Rules Theo Environment**
```json
{
  "overrides": [
    {
      "files": ["src/**/*.js"],
      "excludeFiles": ["src/**/*.test.js"],
      "rules": {
        "no-console": "error",
        "no-debugger": "error"
      }
    }
  ]
}
```

### **Project-specific Globals**
```javascript
globals: {
  // Cloudflare Workers runtime globals
  'addEventListener': 'readonly',
  'Response': 'readonly',
  'Request': 'readonly', 
  'Headers': 'readonly',
  'URL': 'readonly',
  'URLSearchParams': 'readonly',
  'fetch': 'readonly',
  'crypto': 'readonly',
  'console': 'readonly'
}
```

**Lưu ý:** Những globals này tự động có sẵn trong Cloudflare Workers runtime và không cần import.

## 🚨 **Khắc Phục Sự Cố**

### **Vấn Đề Thường Gặp:**

#### **1. Lỗi "Module not found"**
```bash
# Xóa node_modules và reinstall
rm -rf node_modules package-lock.json
npm install
```

#### **2. ESLint không chạy trong VS Code**
- Cài đặt extension "ESLint"
- Reload VS Code window
- Kiểm tra VS Code settings cho ESLint configuration

#### **3. Quá nhiều warnings**
```bash
# Sửa auto-fixable issues trước
npm run lint:fix

# Sau đó review remaining warnings thủ công
npm run lint
```

#### **4. Vấn đề performance**
```bash
# Lint chỉ specific directories
npx eslint src/routes/

# Sử dụng cache cho subsequent runs nhanh hơn
npx eslint src/ --cache
```

## 📚 **Tài Nguyên**

- **ESLint Documentation**: https://eslint.org/docs/
- **Rules Reference**: https://eslint.org/docs/latest/rules/
- **VS Code ESLint Extension**: https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint
- **Configuration Guide**: https://eslint.org/docs/latest/use/configure/

---

**✅ ESLint Setup Hoàn Thành**

Project hiện có code quality enforcement với:
- ✅ Formatting nhất quán trên tất cả files
- ✅ Ngăn chặn lỗi và best practices
- ✅ Tích hợp development workflow
- ✅ VS Code tasks và problem detection
- ✅ Cấu hình CI/CD ready

**Các Bước Tiếp Theo:**
1. Chạy `npm run lint` thường xuyên
2. Sử dụng `npm run lint:fix` để tự động sửa issues
3. Cân nhắc pre-commit hooks cho team development
4. Tùy chỉnh rules dựa trên team preferences
