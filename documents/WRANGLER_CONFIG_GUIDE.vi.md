# 🔧 Hướng Dẫn Cấu Hình Wrangler

> 🌐 Language / Ngôn ngữ: [English](WRANGLER_CONFIG_GUIDE.md) | **Tiếng Việt**

## 📋 Tổng Quan

File `wrangler.toml` là file cấu hình chính cho Cloudflare Workers, chứa thông tin về databases, environments, và các settings khác. Trong project này, file được quản lý đặc biệt để đảm bảo bảo mật.

## 🔒 Mô Hình Bảo Mật

### Template vs File Thực Tế
- **`wrangler.toml.example`** - Template file (commit vào git)
  - Chứa placeholder values
  - An toàn để chia sẻ
  - Dùng làm reference cho setup

- **`wrangler.toml`** - Actual config file (KHÔNG commit vào git)
  - Chứa database IDs thật
  - Credentials nhạy cảm
  - Environment-specific settings

### Environment Variables (.dev.vars files)
Project sử dụng `.dev.vars.*` files cho environment variables:
- **`.dev.vars.development`** - Development environment settings
- **`.dev.vars.test`** - Test environment settings  
- **`.dev.vars.staging`** - Staging environment settings
- **`.dev.vars`** - Default production settings (local)

**Lưu ý**: Các file này đều có template tương ứng (`.example`) để chia sẻ safely.

### Bảo Vệ .gitignore
File `wrangler.toml` đã được thêm vào `.gitignore` để:
- Tránh commit nhầm database IDs thật
- Bảo vệ staging/production credentials  
- Cho phép mỗi developer có config riêng

## 🚀 Hướng Dẫn Thiết Lập

### 1. Thiết Lập Ban Đầu
```bash
# Copy template để tạo actual config
cp wrangler.toml.example wrangler.toml

# Copy environment variable templates
cp .dev.vars.development.example .dev.vars.development
cp .dev.vars.test.example .dev.vars.test  
cp .dev.vars.staging.example .dev.vars.staging

# Chỉnh sửa files với values thật (JWT_SECRET, DEBUG settings, etc.)
nano .dev.vars.development
nano .dev.vars.test
nano .dev.vars.staging
```

### 2. Cấu Hình Theo Environment

#### Development Environment
```toml
[env.development]
name = "hono-auth-api-worker-development"
[[env.development.d1_databases]]
binding = "DB"
database_name = "hono-auth-api-db-development"
database_id = "development-placeholder"  # Sử dụng local database
migrations_dir = "migrations"
```
**Lưu ý**: Development dùng local database, không cần database ID thật.

#### Test Environment  
```toml
[env.test]
name = "hono-auth-api-worker-test"
[[env.test.d1_databases]]
binding = "DB"
database_name = "hono-auth-api-db-test"
database_id = "test-placeholder"  # Sử dụng local database
migrations_dir = "migrations"
```
**Lưu ý**: Test environment cũng dùng local database.

#### Staging Environment
```toml
[env.staging]
name = "hono-auth-api-worker-staging"
[[env.staging.d1_databases]]
binding = "DB"
database_name = "hono-auth-api-db-staging" 
database_id = "984fa566-xxxx-49be-xxxx-a6561426124a"  # Real staging DB ID
migrations_dir = "migrations"
```
**Lưu ý**: Staging đã có database ID thật và chạy remote.

#### Production Environment
```toml
# PRODUCTION environment (default)
[[d1_databases]]
binding = "DB"
database_name = "hono-auth-api-db"
database_id = ""  # Set via wrangler secret put DATABASE_ID
migrations_dir = "migrations"
preview_database_id = "984fa566-xxxx-49be-xxxx-a6561426124a"
```
**Lưu ý**: Production dùng empty database_id (để set via secret) và có preview_database_id cho staging.

## 📦 Quản Lý Database ID

### Cấu Hình Assets
Project có cấu hình assets cho static files:
```toml
[assets]
directory = "./src/assets"
binding = "ASSETS"
```

### Local Development (Khuyến nghị)
```bash
# Development & Test environments tự động dùng local database
npm run dev          # Port 8787 - Development  
npm run dev:test     # Port 8788 - Test
```

### Remote Staging/Production
```bash
# Staging environment - đã có database ID
npm run dev:staging     # Port 8789 - Staging (remote)

# Tạo production database (nếu chưa có)
npm run db:create:prod

# Copy database ID từ output và paste vào wrangler.toml
# [production]
# database_id = "your-production-database-id"

# Hoặc set production database ID via secret (khuyến nghị)
wrangler secret put DATABASE_ID
```

### Lệnh npm Có Sẵn
```bash
# Development servers
npm run dev                    # Development (port 8787, local DB)
npm run dev:test              # Test (port 8788, local DB) 
npm run dev:staging           # Staging (port 8789, remote DB)

# Debug modes
npm run dev:debug             # Development với debug logging
npm run dev:staging:debug     # Staging với debug logging

# Database operations
npm run db:create:staging     # Tạo staging database
npm run db:create:prod        # Tạo production database
npm run db:migrate            # Migrate development DB
npm run db:migrate:test       # Migrate test DB
npm run db:migrate:staging    # Migrate staging DB
npm run db:migrate:prod       # Migrate production DB

# Deployment
npm run deploy:staging        # Deploy to staging
npm run deploy               # Deploy to production
npm run deploy:prod          # Deploy to production (alias)
```

## 🛠️ Tác Vụ Thường Gặp

### Kiểm Tra Cấu Hình Hiện Tại
```bash
# Xem config hiện tại (không show secrets)
wrangler whoami
npx wrangler d1 list
```

### Xác Minh Environment Setup
```bash
# Test development environment (local DB)
npm run dev
curl http://localhost:8787/

# Test test environment (local DB)
npm run dev:test  
curl http://localhost:8788/

# Test staging environment (remote DB)
npm run dev:staging
curl http://localhost:8789/
```

### Thao Tác Database
```bash
# Local database migrations
npm run db:migrate          # Development
npm run db:migrate:test     # Test

# Remote database migrations
npm run db:migrate:staging  # Staging
npm run db:migrate:prod     # Production
```

## 🚨 Khắc Phục Sự Cố

### File Đã Được Commit vào Git
```bash
# Remove khỏi git tracking nhưng giữ local file
git rm --cached wrangler.toml

# Commit việc removal
git commit -m "Remove wrangler.toml from git tracking"

# Xác minh .gitignore chứa wrangler.toml
grep "wrangler.toml" .gitignore
```

### Vấn Đề Database Connection
```bash
# Kiểm tra database tồn tại
npx wrangler d1 list

# Xác minh database ID trong wrangler.toml khớp
npx wrangler d1 info <database-id>

# Test database connection
npm run dev
# Kiểm tra logs để tìm D1 binding errors
```

### Environment Không Load Đúng
```bash
# Xác minh environment name trong wrangler.toml
# Nên khớp: hono-auth-api-worker-{environment}

# Kiểm tra dev command sử dụng đúng environment
npm run dev          # Nên sử dụng [env.development] 
npm run dev:test     # Nên sử dụng [env.test]
npm run dev:staging  # Nên sử dụng [env.staging] --remote

# Kiểm tra nếu .dev.vars files tồn tại cho environment settings
ls -la .dev.vars*
# Nên có: .dev.vars.development, .dev.vars.test, .dev.vars.staging
```

## ✅ Best Practices

### 1. Không Bao Giờ Commit Real Database IDs
- ✅ Sử dụng template file để chia sẻ
- ❌ Không bao giờ `git add wrangler.toml` với real IDs
- ✅ Sử dụng `wrangler secret` cho production

### 2. Cách Ly Environment  
- ✅ Development/Test = local databases (`--local` flag)
- ✅ Staging = remote database với `--remote` flag
- ✅ Production = remote database với secrets

### 3. Cộng Tác Nhóm
- ✅ Chia sẻ cập nhật `wrangler.toml.example`
- ✅ Tài liệu hóa các bước thiết lập environment
- ✅ Sử dụng quy ước đặt tên nhất quán

### 4. Chiến Lược Backup
```bash
# Backup staging database (có database ID thật)
npx wrangler d1 export hono-auth-api-db-staging --env staging --output staging-backup.sql

# Backup cấu trúc production database
npx wrangler d1 export hono-auth-api-db --output production-backup.sql
```

## 📚 Tài Liệu Liên Quan

- [SETUP_GUIDE_vi.md](./SETUP_GUIDE_vi.md) - Thiết lập project ban đầu
- [README_vi.md](../README_vi.md) - Tài liệu project hoàn chỉnh  
- [DEBUG_DEVELOPMENT_GUIDE_vi.md](./DEBUG_DEVELOPMENT_GUIDE_vi.md) - Development workflow
- [ZOD_GUIDE_vi.md](./ZOD_GUIDE_vi.md) - Sử dụng Zod validation
- [Cloudflare Workers D1 Documentation](https://developers.cloudflare.com/d1/)

## 📊 Trạng Thái Project Hiện Tại

### Database IDs (theo config hiện tại):
- **Development**: `development-placeholder` (local database)
- **Test**: `test-placeholder` (local database)  
- **Staging**: `984fa566-xxxx-49be-xxxx-a6561426124a` (remote database)
- **Production**: `""` (empty, set via secret hoặc manual config)

### Environment Ports:
- **Development**: 8787 (local)
- **Test**: 8788 (local)
- **Staging**: 8789 (remote)  
- **Production**: Deployed URL

### Hiện Đang Chạy:
```bash
# Server hiện tại đang chạy trên port 8788 (test environment)
# Có thể test endpoints tại: http://localhost:8788/api/
```

## 🔗 Liên Kết Nhanh

```bash
# Lệnh setup
cp wrangler.toml.example wrangler.toml
npm run setup:dev
npm run db:migrate

# Development workflow
npm run dev              # Khởi động development server
npm run test            # Chạy test suite
npm run lint:check      # Kiểm tra code quality

# Deployment workflow  
npm run deploy:staging  # Deploy to staging
npm run deploy         # Deploy to production
```
