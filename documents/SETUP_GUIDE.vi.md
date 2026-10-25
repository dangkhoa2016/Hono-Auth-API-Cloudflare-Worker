# Cài đặt cục bộ

[English](SETUP_GUIDE.md) | Tiếng Việt

Dùng Node.js 24 (cùng major với CI), npm và `package-lock.json` đã commit. Lockfile ghim dependency; `npm ci` tái tạo dependency mà không cập nhật lockfile. Với nvm đã cài, chạy từ root repository:

```bash
nvm install 24
nvm use 24
npm ci --ignore-scripts --no-audit --no-fund
cp wrangler.toml.example wrangler.toml
cp .dev.vars.development.example .dev.vars.development
```

Tạo secret cục bộ bằng `node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"`, rồi đặt vào `JWT_SECRET` trong `.dev.vars.development`. Dùng secret riêng cho từng môi trường. Placeholder trong template không phải secret triển khai. Giữ `.dev.vars.*` và `wrangler.toml` ngoài version control.

Đặt `DEBUG = ""` và `ENABLE_DETAILED_ERRORS = "false"` khi không chủ động debug. Tắt email trong lần chạy đầu (`EMAIL_ENABLED = "false"`). Email kích hoạt cần credentials provider và `APP_URL` phù hợp; đăng ký thành công không xác nhận email đã được gửi. Xem [ví dụ cấu hình đầy đủ](../.dev.vars.complete.example) và [khả năng hiện hành](CAPABILITIES.vi.md): cờ cấu hình không tạo ra adapter còn thiếu.

Dùng compatibility date (`2025-06-01`) và flags trong template được duy trì. Ứng dụng dùng `WeakRef`; cấu hình cũ như `2024-01-01` có thể khởi động Worker nhưng request trả HTTP 500.

## Storage và server cục bộ

[Template Wrangler](../wrangler.toml.example) có binding D1 development/test riêng với placeholder local; các lệnh này không cần ID database Cloudflare thật:

```bash
npm run db:migrate
npm run dev
```

Wrangler lưu state cục bộ dưới `.wrangler/`. Development dùng cổng 8787. Kiểm tra API info bằng `curl http://localhost:8787/`. Migration tạo schema; việc reset fixture là thao tác riêng.

Để chạy server test với database local riêng:

```bash
cp .dev.vars.test.example .dev.vars.test
npm run db:migrate:test
npm run dev:test
```

Đặt `JWT_SECRET` test riêng trước khi khởi động; server dùng cổng 8788. `RATE_LIMIT_DISABLED` trong template test chỉ dành cho test cô lập. Không sao chép nguyên sang staging hoặc production.

`setup:dev` chạy migration và `tests/init/reset.sql`; `setup:test` cũng chuẩn bị dữ liệu test. Đọc script trước khi dùng với dữ liệu local có sẵn. Quy trình thủ công tối thiểu ở trên không cần hai script này.

## Cấu hình KV tùy chọn

Template chưa bind `CONFIG_KV`. Đọc cấu hình thông thường có thể dùng biến môi trường/giá trị mặc định khi không có KV; quản trị KV cần binding được cấu hình. Nếu dùng KV, thêm namespace `CONFIG_KV` riêng vào từng môi trường trong `wrangler.toml` bị ignore. Binding thuộc từng môi trường. Không trỏ test local vào tài nguyên production.

`npm run test:kv:setup` ghi cấu hình fixture vào môi trường **test**; đây không phải bước bootstrap development. Binding KV đã cấu hình nhưng không truy cập được là lỗi khả dụng, không phải lý do dùng cấu hình bảo mật mặc định/cũ một cách âm thầm. Lưu JWT và provider secrets trong secret storage của môi trường; không đặt vào cấu hình KV có thể chỉnh sửa.

## Kiểm chứng và môi trường từ xa

```bash
npm run lint:check && npm run test:node
```

Node integration suites tự tạo fixture local dùng tạm. Bộ kiểm tra chuẩn không cần credentials triển khai từ xa. Xem [kiểm thử](TEST_GUIDE.vi.md), [Wrangler](WRANGLER_CONFIG_GUIDE.vi.md) và [nâng cấp/phát hành](UPGRADE_RELEASE.vi.md). `dev:staging` dùng tài nguyên từ xa, tách biệt với development local.
