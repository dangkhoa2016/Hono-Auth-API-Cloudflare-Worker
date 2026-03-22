# 🔧 Hướng Dẫn Cấu Hình Wrangler

> 🌐 Language / Ngôn ngữ: [English](WRANGLER_CONFIG_GUIDE.md) | **Tiếng Việt**

## 📋 Tổng Quan

File `wrangler.toml` là file cấu hình chính cho Cloudflare Workers, chứa thông tin về databases, environments, và các settings khác. Trong project này, file được quản lý đặc biệt để đảm bảo bảo mật.

Tài liệu này tập trung vào cấu trúc cấu hình Wrangler và cách từng environment ánh xạ tới tài nguyên local hoặc remote. Với quy trình setup đầy đủ, workflow test và lệnh debug thường dùng, hãy dùng [SETUP_GUIDE_vi.md](./SETUP_GUIDE_vi.md), [TEST_GUIDE_vi.md](./TEST_GUIDE_vi.md) và [DEBUG_DEVELOPMENT_GUIDE_vi.md](./DEBUG_DEVELOPMENT_GUIDE_vi.md).

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

### 1. Thiết Lập Nhanh Cấu Hình
```bash
cp wrangler.toml.example wrangler.toml
cp .dev.vars.development.example .dev.vars.development
cp .dev.vars.test.example .dev.vars.test
cp .dev.vars.staging.example .dev.vars.staging
```

Sau khi copy template, điền secret thật cho environment bạn đang dùng. Nếu cần checklist onboarding đầy đủ, cách xử lý secret và bootstrap cho developer mới, dùng [SETUP_GUIDE_vi.md](./SETUP_GUIDE_vi.md).

### 2. Cấu Hình Theo Environment

#### Development Environment
```toml
[env.development]
name = "hono-auth-api-cloudflare-worker-development"
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
name = "hono-auth-api-cloudflare-worker-test"
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
name = "hono-auth-api-cloudflare-worker-staging"
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

### Tóm Tắt Vận Hành Theo Environment

Giữ mô hình Wrangler ở mức đơn giản:

- **Development** và **Test** dùng D1 local.
- **Staging** chạy với database remote qua `--remote`.
- **Production** nên dùng secret cho các giá trị nhạy cảm và migrate D1 remote.

Các lệnh đại diện:

```bash
# Local development
npm run dev
npm run dev:test

# Remote staging
npm run dev:staging

# Migrations
npm run db:migrate
npm run db:migrate:test
npm run db:migrate:staging
npm run db:migrate:prod

# Deployment
npm run deploy:staging
npm run deploy
```

Dùng [SETUP_GUIDE_vi.md](./SETUP_GUIDE_vi.md) cho bootstrap môi trường, [TEST_GUIDE_vi.md](./TEST_GUIDE_vi.md) cho ma trận lệnh đã được chuẩn hóa, và [DEBUG_DEVELOPMENT_GUIDE_vi.md](./DEBUG_DEVELOPMENT_GUIDE_vi.md) cho workflow debug.

## 🛠️ Tác Vụ Thường Gặp

### Kiểm Tra Cấu Hình Hiện Tại
```bash
# Xem config hiện tại (không show secrets)
wrangler whoami
npx wrangler d1 list
```

### Xác Minh Environment Setup

Sau khi thay đổi cấu hình Wrangler, dùng vòng kiểm tra ngắn sau:

```bash
wrangler whoami
npx wrangler d1 list
npm run dev
```

Nếu worker khởi động được và D1 binding mong đợi xuất hiện, cấu hình thường là đúng. Với smoke test rộng hơn và xác minh API, tiếp tục ở [TEST_GUIDE_vi.md](./TEST_GUIDE_vi.md).

## 🚨 Khắc Phục Sự Cố

### File Đã Được Commit vào Git

Nếu `wrangler.toml` từng bị track nhầm, hãy bỏ file này khỏi Git nhưng giữ bản local, sau đó xác minh `.gitignore` vẫn loại trừ nó. Đây là thao tác vệ sinh repository một lần, không phải bước vận hành thường ngày.

### Vấn Đề Database Connection

Kiểm tra theo thứ tự sau:

1. Xác nhận database đích tồn tại bằng `npx wrangler d1 list`.
2. Xác nhận đúng section environment đang được sử dụng.
3. Khởi động worker bằng đúng lệnh `npm run dev...` tương ứng và kiểm tra lỗi D1 binding.

Với các pattern debug sâu hơn trong runtime, tiếp tục ở [DEBUG_DEVELOPMENT_GUIDE_vi.md](./DEBUG_DEVELOPMENT_GUIDE_vi.md).

### Environment Không Load Đúng

Thường rơi vào một trong ba nguyên nhân:

1. Tên environment trong `wrangler.toml` không khớp với lệnh đã chạy.
2. File `.dev.vars.*` tương ứng bị thiếu hoặc thiếu biến quan trọng.
3. Bạn đang mong đợi môi trường remote nhưng lại khởi động local, hoặc ngược lại.

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

Trước khi thay đổi một environment remote, hãy export D1 staging hoặc production ra file SQL cục bộ. Dùng quy trình Wrangler D1 export chuẩn khớp với environment đang thao tác.

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

Tại thời điểm tài liệu này được viết, môi trường test local thường dùng port `8788`. Xem đây là ví dụ minh họa, không phải trạng thái runtime cố định.

## 🔗 Liên Kết Nhanh

- [SETUP_GUIDE_vi.md](./SETUP_GUIDE_vi.md) - Quy trình bootstrap và thiết lập môi trường đầy đủ
- [TEST_GUIDE_vi.md](./TEST_GUIDE_vi.md) - Nguồn chuẩn cho ma trận lệnh xác minh và test
- [DEBUG_DEVELOPMENT_GUIDE_vi.md](./DEBUG_DEVELOPMENT_GUIDE_vi.md) - Workflow debug và khắc phục sự cố local
- [README_vi.md](../README_vi.md) - Tổng quan dự án và quick-start tối giản
