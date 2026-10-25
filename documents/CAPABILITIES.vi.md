# Contract khả năng

> 🌐 Language / Ngôn ngữ: [English](CAPABILITIES.md) | **Tiếng Việt**

Tài liệu mô tả contract backend hiện tại. Tên route “realtime” và tiêu đề tài liệu lịch sử “enterprise” không hàm ý chạy liên tục, chứng nhận tuân thủ hay sẵn sàng production. Cờ cấu hình không bật được adapter chưa có trong implementation.

| Mảng | Đã triển khai | Giới hạn / hành vi chưa hỗ trợ |
| --- | --- | --- |
| Xác thực | Mật khẩu bcrypt, kích hoạt tài khoản, cặp JWT access/refresh, refresh rotation, kiểm tra phiên bản phiên và thu hồi | Cần migration đến `0012`, JWT secret được cấu hình và client tương thích; xem [nâng cấp](UPGRADE_RELEASE.vi.md). |
| Vai trò | `user`, `admin`, `super_admin`, phân quyền route và giới hạn vai trò | Quyền phụ thuộc từng route; không suy ra quyền từ tên route. |
| Cấu hình | Đọc biến môi trường/mặc định, `CONFIG_KV` tùy chọn, route quản trị cấu hình | Đọc cấu hình nhạy cảm bảo mật và liệt kê quản trị báo lỗi binding; một số lần đọc không liên quan bảo mật dùng giá trị mặc định. Secrets thuộc secret storage của môi trường. |
| Email giao dịch | Email service có cấu hình và gửi request đến provider cho luồng tài khoản | Cần credentials/cấu hình provider. Service này không triển khai adapter email cảnh báo kiểm toán. |
| Kiểm toán | Lưu audit D1, truy vấn theo phạm vi, analytics, archival/restore và retention | Báo cáo chính sách không phải chứng nhận tuân thủ độc lập. Bật cờ không tự tạo background scheduler. |
| Export | CSV/JSON UTF-8 có giới hạn và aggregation theo allowlist | Tối đa hiện tại 10.000 dòng/nhóm đầu ra; có bảo vệ công thức CSV. Chưa hỗ trợ Excel, PDF, mã hóa, nén, biểu đồ, sheets hoặc pivot. |
| Monitoring | Snapshot, dashboard và phân tích đe dọa theo truy vấn | `continuousMonitoring: false`, `realtimeEventStream: false`; yêu cầu chạy liên tục trả HTTP 422 `UNSUPPORTED_MONITORING_MODE`. State trong bộ nhớ không phải luồng sự kiện bền vững. |
| Hồ sơ sự cố | Tạo sự cố, ghi vòng đời, đánh giá rule và ghi kết quả action | Lưu hồ sơ hoặc ghi log thành công không chứng minh đã ngăn chặn sự cố. `automaticContainment: false`. |
| Action sự cố | `log_alert` ghi log cảnh báo | `block_ip`, `disable_user`, `escalate`, `notify_admin`, `quarantine` trả `success: false`, `status: "unsupported"`, `code: "UNSUPPORTED_INCIDENT_ACTION"`, `statusCode: 422`; không có tác động WAF, khóa user, escalation, thông báo admin hay quarantine. |
| Gửi cảnh báo | Console; gửi HTTP webhook khi được cấu hình/bật | Email và KV trả `UNSUPPORTED_ALERT_CHANNEL` (422); KV mặc định tắt. Kênh không tồn tại trả `UNKNOWN_ALERT_CHANNEL` (422). Chỉ lần gửi hoàn tất được tính thành công. Console thành công không phải thông báo ra ngoài. |
| Thống kê archive | Thống kê thật khi truy vấn hoàn tất | Request thống kê có deadline trả HTTP 503 `ARCHIVE_STATS_TIMEOUT` kèm request ID khi hết hạn, không trả báo cáo rỗng thành công. |

## Khám phá contract trước khi gọi

Các route đã xác thực công bố dữ liệu implementation hiện tại:

- `GET /api/advanced-audit/capabilities` (`super_admin`): định dạng export, giới hạn đầu ra, aggregation và tùy chọn bị từ chối.
- `GET /api/realtime-monitoring/monitoring/status` (vai trò admin): thống kê monitoring cùng `data.capabilities`.
- `GET /api/security-incident/status` (vai trò admin): trạng thái sự cố cùng `data.capabilities`.
- `GET /api/realtime-monitoring/alerts/channels` (vai trò admin): các kênh và dữ liệu capability.

Đọc code có cấu trúc và kết quả từng action/kênh. Tiếp nhận đe dọa có thể ghi sự cố thành công trong khi phản ứng tự động có action chưa hỗ trợ; không diễn giải sự cố là đã được ngăn chặn. Một action thủ công chưa hỗ trợ trả HTTP 422. Cảnh báo thủ công không có lần gửi nào thành công là thao tác gửi thất bại; kết quả một phần cần được xem theo từng kênh. Webhook thành công ghi nhận kết quả HTTP, không xác nhận con người đã nhận thông báo.

`GET /api/advanced-audit/archive` áp dụng deadline cho action thống kê mặc định. Truy vấn `action=status` và `action=policies` là các thao tác riêng. Khi timeout, hiển thị thống kê chưa khả dụng, giữ request ID để chẩn đoán và chỉ retry thao tác đọc khi phù hợp; không thay bằng số 0. Không tự động lặp lại mutation sau timeout chưa rõ kết quả.

Request phản ứng thủ công dùng `action` (`log_alert`, `block_ip`, `disable_user`, `escalate`, `notify_admin`, `quarantine`) và `params` tùy chọn. Endpoint riêng `PUT /api/security-incident/incidents/:id/status` cập nhật trạng thái vòng đời; trạng thái được ghi thủ công không chứng minh adapter đã thực hiện ngăn chặn.

## Phạm vi kiểm chứng

[Bộ kiểm tra chuẩn](TEST_GUIDE.vi.md) kiểm chứng hành vi local. Chúng không chứng nhận mọi test cũ, binding từ xa, người nhận email, hệ thống webhook, mục tiêu throughput hay yêu cầu pháp lý. Kiểm tra cấu hình deployment và kết quả tích hợp ở staging theo [checklist phát hành](UPGRADE_RELEASE.vi.md).
