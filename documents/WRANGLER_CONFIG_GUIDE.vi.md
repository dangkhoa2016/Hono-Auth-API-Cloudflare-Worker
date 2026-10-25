# Môi trường Wrangler và secrets

> 🌐 Language / Ngôn ngữ: [English](WRANGLER_CONFIG_GUIDE.md) | **Tiếng Việt**

Sao chép [wrangler.toml.example](../wrangler.toml.example) thành `wrangler.toml` bị ignore để cài local. Template chỉ là khung môi trường, chưa phải cấu hình deployment đầy đủ. Nó có binding D1 và assets; KV tùy chọn cần cấu hình riêng. [Fixture smoke local](../tests/fixtures/wrangler.local-smoke.toml) chỉ dành cho test, không dùng để deploy.

| Môi trường | Selector | Tài nguyên | Lệnh |
| --- | --- | --- | --- |
| Development | `--env development` | D1 local; cổng 8787 | `npm run db:migrate`, `npm run dev` |
| Test | `--env test` | D1 local riêng; cổng 8788 | `npm run db:migrate:test`, `npm run dev:test` |
| Staging | `--env staging` | D1/binding từ xa riêng; remote dev cổng 8789 | `npm run db:migrate:staging`, `npm run deploy:staging` |
| Production | Mặc định; không có named env | D1/binding production từ xa | `npm run db:migrate:prod`, `npm run deploy:prod` |

Cả `deploy` và `deploy:prod` đều deploy môi trường **production mặc định**. `dev:staging` dùng `--remote`, có thể truy cập dữ liệu staging thật. Dùng account/database/namespace staging riêng khi phù hợp; xác minh account, tên Worker và ID database trước khi ghi từ xa. Mỗi named environment cần binding riêng; không giả định binding root được kế thừa.

Dùng compatibility date (`2025-06-01`) và flags trong template được duy trì. Ứng dụng dùng `WeakRef`; cấu hình cũ như `2024-01-01` có thể khởi động Worker nhưng request trả HTTP 500.

## Phân biệt cấu hình và secrets

- `wrangler.toml`: tên Worker/binding, ID tài nguyên, compatibility options và biến triển khai không bí mật. ID định danh tài nguyên, không phải authentication secret. Dự án ignore file vận hành vì cấu hình riêng theo người triển khai.
- `.dev.vars.development`, `.dev.vars.test`, `.dev.vars.staging`: biến Wrangler local bị ignore. Template chứa placeholder. Không có `.dev.vars.example` production; không tạo ra tham chiếu giả hoặc xem file local là cấu hình đã deploy.
- Secret đã deploy: đặt bằng lệnh Wrangler secret cho đúng môi trường. `.dev.vars.*` không provision secret lên deployment. Dùng `npm run secret:put:staging` hoặc `npm run secret:put:prod` cho JWT; secret provider khác phải chỉ rõ đích, ví dụ `npx wrangler secret put EMAIL_PROVIDER_API_KEY --env staging`.
- Thiết lập không bí mật: cấu hình `[vars]` cho môi trường mặc định và `[env.staging.vars]` cho staging khi cần. Đặt `ENV`, `APP_URL`, CORS origins và chính sách email cho từng đích. Tắt debug diện rộng và lỗi chi tiết ngoài lúc chủ động chẩn đoán.
- `APP_URL` là origin backend dùng cho link API trong email tài khoản. Đặt biến môi trường riêng `FRONTEND_URL` là URL trang chủ frontend cho nút trên trang kết quả kích hoạt. Dùng HTTPS khi deploy; HTTP chỉ được chấp nhận cho localhost, 127.0.0.1 và IPv6 loopback. Thiếu giá trị hoặc giá trị không hợp lệ sẽ dùng `/` trên backend. Không kèm thông tin đăng nhập, query hoặc fragment. Cấu hình này không thay API kích hoạt và không tự chuyển hướng trình duyệt.

Tạo JWT secret mạnh, khác nhau cho từng môi trường. Không đưa provider key/credentials vào source, tham số command, log hoặc KV có thể chỉnh sửa. Giữ rate limiting bật ở staging/production trừ kịch bản test được cô lập có chủ đích. Template có thể chứa giá trị dev/test rộng; rà soát từng giá trị.

`CONFIG_KV` tùy chọn khi đọc cấu hình môi trường/mặc định thông thường; quản trị KV cần binding này. Thêm binding KV riêng cho từng môi trường đích. Binding đã cấu hình nhưng không truy cập được là lỗi. Cờ như `AUDIT_ENABLE_REAL_TIME_MONITORING` không tạo background execution; xem [khả năng](CAPABILITIES.vi.md).

Xem [cài đặt](SETUP_GUIDE.vi.md) cho lệnh local và [nâng cấp/phát hành](UPGRADE_RELEASE.vi.md) cho thứ tự migration từ xa, tương thích và bằng chứng. Không dùng SQL reset fixture trên staging hoặc production.


## Domain và DNS

Khi Worker trực tiếp phục vụ một hostname riêng, dùng [Custom Domain](https://developers.cloudflare.com/workers/configuration/routing/custom-domains/) để Cloudflare tạo DNS và TLS. [Route](https://developers.cloudflare.com/workers/configuration/routing/routes/) cần bản ghi DNS đã được proxy cho hostname; chỉ có route không bảo đảm hostname phân giải được. Giữ domain/route của môi trường đích khi deploy lại.

Sau deploy, kiểm tra DNS công khai, HTTPS, `/health`, CORS từ origin frontend và các URL email. Worker báo deployed không chứng minh DNS hoặc email hoạt động. Không mở token kích hoạt thật chỉ để kiểm tra routing. Xem [email tài khoản](MANUAL_SEND_EMAIL_GUIDE_vi.md).
