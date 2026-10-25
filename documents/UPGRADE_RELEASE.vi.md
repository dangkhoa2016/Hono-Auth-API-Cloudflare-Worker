# Nâng cấp, kiểm chứng và phát hành

[English](UPGRADE_RELEASE.md) | Tiếng Việt

Đây là checklist vận hành, không phải bằng chứng đã phát hành. Phiên bản package `1.0.0` tự nó không xác định deployment đã kiểm chứng. Ghi commit và kết quả kiểm tra thực tế cho từng deployment.

## Chuẩn bị và kiểm chứng bản dự kiến

1. Ghi commit source chính xác, phiên bản Node 24, npm và lockfile. Cài bằng `npm ci --ignore-scripts --no-audit --no-fund`.
2. Chạy `npm run verify`. Giữ output và chi tiết lỗi. Đây là regression/integration chuẩn, gồm migration D1 và Worker local; không chạy mọi test cũ ở root hay adapter bên ngoài.
3. Kiểm tra tài liệu đã đổi, liên kết và tên script. Rà soát [khả năng](CAPABILITIES.vi.md), migration và tác động client. Parse/lint thành công không phải kiểm chứng tích hợp từ xa.
4. Chuẩn bị tài nguyên/secrets staging riêng. Xác nhận account Cloudflare, Worker, D1 và namespace KV tùy chọn trong `wrangler.toml` bị ignore. Cấu hình biến và secrets deployment theo [Wrangler](WRANGLER_CONFIG_GUIDE.vi.md).

## Migration và tương thích

Áp dụng đầy đủ chuỗi chỉ bổ sung trong [migrations](../migrations), hiện từ `0001_initial.sql` đến `0012_session_revocation.sql`. Không sửa migration đã áp dụng trên database dùng chung hay thay bằng SQL reset fixture. Kiểm tra migration đã áp dụng/còn chờ ở đúng môi trường trước khi thay đổi.

| Migration | Tác động nâng cấp |
| --- | --- |
| `0011_preserve_audit_archive.sql` | Thêm metadata archive, cờ xuất xứ và theo dõi restore. Dòng archive cũ vẫn được đánh dấu thiếu dữ liệu; không thể tái tạo metadata đã mất. |
| `0012_session_revocation.sql` | Thêm `users.auth_version`, trường version/consume/grace của refresh token và index cho rotation/revocation. Code phiên hiện tại cần các trường này. |

Sao lưu hoặc export dữ liệu đích bằng công cụ vận hành của nền tảng và kiểm chứng quy trình phục hồi trước migration từ xa. Diễn tập với bản staging đại diện. Migration thành công không tự chứng minh Worker cũ tương thích schema mới.

Thay đổi phiên cần client tương thích. Lưu cặp **access và refresh** token thay thế sau refresh thành công; phối hợp các lần refresh đồng thời thay vì liên tục gửi lại token đã tiêu thụ. Khi gặp 401 và lỗi phiên đã thu hồi/thiếu version, yêu cầu đăng nhập lại. Xử lý 429 theo hướng dẫn retry nhận được. Kiểm tra đổi mật khẩu, logout-all và đổi vai trò với phiên đang tồn tại.

`AUTH_VERSION_ENFORCEMENT` nhận `observe` hoặc `enforce`. `observe` tạm chấp nhận token thiếu claim `auth_version`; token có version không khớp bị từ chối ở cả hai mode. Đặt deadline ISO hợp lệ trong `AUTH_VERSION_ENFORCEMENT_EXPIRES_AT` cho chuyển tiếp; hết deadline thì token cũ bị từ chối. Mặc định (`observe`, deadline rỗng) tự nó không tạo cửa sổ chuyển tiếp hữu hạn. Chuyển sang `enforce` sau khi hoàn tất chuyển đổi client/phiên. Phối hợp hành vi refresh và yêu cầu đăng nhập lại với client đang triển khai trước khi enforce.

Client cũng phải xử lý tùy chọn incident/alert/export chưa hỗ trợ và contract HTTP 503 của thống kê archive. Không chuyển lỗi chưa hỗ trợ thành thông báo thành công, tuyên bố đã ngăn chặn hay biểu đồ rỗng. Không tự retry mutation chưa rõ kết quả; xác định kết quả trước.

## Staging, rồi production

Sau review và chuẩn bị phục hồi nêu trên, các script có sẵn sau tác động tài nguyên từ xa:

```bash
npm run db:migrate:staging
npm run deploy:staging
```

Kiểm tra health/API info staging, login và refresh với cặp token đã xoay, phân quyền, thu hồi phiên, audit query/export, thống kê archive và action bị từ chối rõ ràng. Kiểm tra console/webhook thật khi bật; email cảnh báo vẫn chưa hỗ trợ dù email giao dịch tài khoản hoạt động. Ghi request ID và status code quan sát được. Nếu thiếu credentials hoặc bỏ qua kiểm tra adapter, ghi rõ chưa kiểm chứng.

Chọn cửa sổ thay đổi production phù hợp. Kiểm chứng thứ tự schema/code ở staging, áp dụng migration cần thiết trước khi kích hoạt code đọc trường mới, và phối hợp lưu lượng Worker cũ trong chuyển tiếp. Sau khi chọn tài nguyên/account production và cấu hình secrets:

```bash
npm run db:migrate:prod
npm run deploy:prod
```

Production là đích Wrangler mặc định. Lặp lại smoke check trọng tâm và theo dõi lỗi thực tế. Nếu kiểm chứng thất bại, dừng promotion để điều tra. Migration bổ sung không cung cấp downgrade tự động: dùng Worker rollback đã kiểm tra tương thích hoặc sửa tiến; không xóa cột/reset dữ liệu dùng chung như rollback thông thường.

## Xuất xứ lịch sử và bằng chứng phát hành

Repository chứa baseline đã import và lịch sử Git đã biên tập. Ngày tác giả gốc được giữ mô tả xuất xứ source; không chứng minh công việc được viết trong khoảng import hiển thị, mọi commit trung gian đều được kiểm thử độc lập hay đã deploy vào ngày đó. Đọc formatting, tài liệu import và thay đổi implementation về sau theo phạm vi được nêu. Ngày cập nhật tài liệu lịch sử và tuyên bố cũ “complete/enterprise/production-ready” là nội dung tham khảo, không phải bằng chứng release.

Với release thực tế, ghi commit, checks đã xác minh, trạng thái migration, môi trường, deployment ID, tương thích client, giới hạn đã biết và kế hoạch phục hồi. Chỉ tạo release/tag cho lần phát hành thật đã review theo chính sách xuất bản dự án; hướng dẫn này không tạo ra release hay tag quá khứ. Không suy ra release từ version package, ngày commit đã biên tập hoặc checklist này.
