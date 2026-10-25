# Tổng quan hệ thống kiểm toán

[English](ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.md) | Tiếng Việt

Tên file lịch sử được giữ để liên kết cũ vẫn hoạt động. Đây không phải tuyên bố sẵn sàng production hay chứng nhận “enterprise”. Xem [contract khả năng](CAPABILITIES.vi.md) cho hành vi được hỗ trợ.

| Route group | Phạm vi hiện tại |
| --- | --- |
| `/api/audit/*` | Truy vấn và thao tác audit cơ bản theo quyền/phạm vi. |
| `/api/advanced-audit/*` | Analytics, archival/restore, retention và export CSV/JSON có giới hạn. |
| `/api/realtime-monitoring/*` | Snapshot/dashboard theo truy vấn và quản lý cảnh báo; không có stream hay polling liên tục. |
| `/api/security-incident/*` | Hồ sơ sự cố, rule và ghi kết quả action; không tự chặn IP, khóa user hay quarantine. |

Dữ liệu audit nằm trong D1. Migration `0011` bảo toàn metadata archive mới và đánh dấu dữ liệu cũ thiếu metadata. Migration `0012` hỗ trợ session revocation. Cần áp dụng đầy đủ migration trước code hiện tại; xem [nâng cấp/phát hành](UPGRADE_RELEASE.vi.md).

Console/webhook là các kênh cảnh báo có implementation. Adapter email/KV cảnh báo chưa hỗ trợ, độc lập với email giao dịch tài khoản. Các action sự cố chưa triển khai trả kết quả chưa hỗ trợ, không được tính là ngăn chặn thành công. Thống kê archive hết deadline trả 503, không có báo cáo rỗng thành công.

[Tham khảo API lịch sử](AUDIT_API_REFERENCE.vi.md) còn giữ ví dụ cũ; đối chiếu với contract hiện hành và route source trước khi tích hợp. [Kiểm chứng](TEST_GUIDE.vi.md) mô tả checks được duy trì. Báo cáo mang tên GDPR/SOX/HIPAA không chứng nhận tuân thủ pháp lý.
