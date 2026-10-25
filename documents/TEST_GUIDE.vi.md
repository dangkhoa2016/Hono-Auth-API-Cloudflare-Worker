# Hướng dẫn kiểm chứng

[English](TEST_GUIDE.md) | Tiếng Việt

Các entrypoint tự động chuẩn khớp [CI Backend quality](../.github/workflows/backend-quality.yml). Chạy bằng Node 24 từ root repository:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run verify
```

`verify` lần lượt chạy `lint:check`, `lint:tools`, `verify:docs` và `test:node`. `lint:check` từ chối warning trong các đường dẫn được cấu hình. `lint:tools` kiểm tra command/helper reset mật khẩu được hỗ trợ và docs checker; không khẳng định mọi tool lịch sử đều được duy trì. `verify:docs` kiểm tra đích file tương đối và tham chiếu package script trong README/tài liệu; không xác minh URL bên ngoài hoặc mọi ví dụ lịch sử. `test:node` tìm `tests/regression/*.test.mjs` và `tests/integration/*.test.mjs`; dùng package script thực tế để lấy lệnh được duy trì. Integration suites gồm hành vi D1/Worker local dùng tạm và nâng cấp migration, không cần secret account từ xa. Lockfile và major Node cần khớp CI; test dùng Wrangler/workerd cần nền tảng mà công cụ đã cài hỗ trợ.

Để chẩn đoán tập trung, `npm run test:regression` chỉ chạy regression. Dùng test có sẵn liên quan trong lúc điều tra, rồi chạy checks chuẩn cho bản cuối. Giữ kết quả thật; số file test không tương đương coverage.

## Test server tùy chọn

Các suite tương tác/ở root lịch sử dùng API đang chạy và fixture. Chúng tách biệt với Node checks chuẩn, có thể cần cấu hình môi trường. Xem [cài đặt](SETUP_GUIDE.vi.md) để tạo server test cô lập. Đọc [package scripts](../package.json) và [cấu hình test](../tests/config) trước khi chạy. Một số script reset dữ liệu test local; nhiều lệnh cũ gọi Yarn nội bộ dù khởi chạy bằng npm. `npm test` không phải CI: nó chuẩn bị fixture và mở menu tương tác.

Ví dụ `npm run test:unified:help` hiển thị mode của runner, không khẳng định đã chạy các mode đó. Không khởi tạo fixture hoặc chạy suite phá dữ liệu trên staging/production. Số lượng test, bảng hiệu năng lịch sử và tuyên bố “100% coverage” không phải bằng chứng kiểm chứng được duy trì.

HTTP test helper không được mặc định lặp lại mutation sau lỗi truyền tải. Chỉ retry thao tác đọc theo chính sách hữu hạn rõ ràng; chỉ opt-in retry mutation khi thao tác và kịch bản test bảo đảm thực thi lặp lại an toàn. Timeout không chứng minh mutation chưa thực thi.

## Bằng chứng vận hành

Checks local không chứng minh binding từ xa, credentials provider, người nhận đã nhận thư, webhook acknowledgement, độ trễ production hoặc tuân thủ pháp lý. Dùng [contract khả năng](CAPABILITIES.vi.md) và [checklist nâng cấp/phát hành](UPGRADE_RELEASE.vi.md) để chọn staging smoke checks, ghi rõ tích hợp chưa khả dụng/bị bỏ qua. Không báo check bị bỏ qua là đã đạt.
