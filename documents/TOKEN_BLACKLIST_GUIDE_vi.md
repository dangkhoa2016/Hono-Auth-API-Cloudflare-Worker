# 🚫 HƯỚNG DẪN QUẢN LÝ BLACKLIST TOKEN - HONO AUTH WORKER

📖 Ngôn ngữ: [English](./TOKEN_BLACKLIST_GUIDE.md) | Tiếng Việt  
Cập nhật lần cuối: 10/01/2026

## Phạm vi
Tài liệu này mô tả hệ thống Quản lý Blacklist Token (Danh sách đen), cho phép Quản trị viên cấp cao (Super Admin) giám sát và quản lý các token truy cập đã bị thu hồi. Hệ thống này rất quan trọng đối với các phản ứng bảo mật tức thời, chẳng hạn như vô hiệu hóa các token bị lộ.

## Tính năng đã triển khai
- **API Routes**: Các điểm cuối (endpoint) chuyên dụng tại `/api/admin/token-blacklist` cho đầy đủ các thao tác CRUD.
- **Kiểm soát truy cập**: Áp dụng nghiêm ngặt quyền `SUPER_ADMIN` cho tất cả các route quản lý.
- **Đa ngôn ngữ (i18n)**: Hỗ trợ đầy đủ đa ngôn ngữ cho tất cả các thông báo phản hồi (thành công, lỗi, không tìm thấy) trên các ngôn ngữ được hỗ trợ (en, vi, de, es, fr, ja, th).
- **Validate dữ liệu**: Kiểm tra đầu vào cho định dạng JTI và các trường bắt buộc.
- **Kiểm thử**: Bộ test chuyên biệt `tests/tokenBlacklistRouteTest.js` bao gồm các luồng chuẩn, trường hợp biên và phân quyền bảo mật.

## Tài liệu API

| Phương thức | Endpoint | Mô tả | Quyền hạn | i18n Key |
|-------------|----------|-------|-----------|----------|
| `GET` | `/api/admin/token-blacklist` | Liệt kê token trong blacklist kèm phân trang & tìm kiếm | SUPER_ADMIN | `blacklistList` |
| `POST` | `/api/admin/token-blacklist` | Thêm thủ công một token (JTI) vào blacklist | SUPER_ADMIN | `blacklistCreate` |
| `GET` | `/api/admin/token-blacklist/:id` | Xem chi tiết một mục trong blacklist | SUPER_ADMIN | `blacklistDetails` |
| `DELETE` | `/api/admin/token-blacklist/:id` | Xóa một token khỏi blacklist | SUPER_ADMIN | `blacklistDelete` |
| `POST` | `/api/admin/token-blacklist/bulk-delete` | Xóa hàng loạt token | SUPER_ADMIN | `blacklistBulkDelete` |

## Mô hình dữ liệu
Hệ thống tương tác với bảng `token_blacklist`:
- **id**: Khóa chính (Integer)
- **jti**: JWT ID (String, Unique) - Mã định danh của access token.
- **user_id**: User ID (Integer, FK) - Người dùng sở hữu token.
- **expires_at**: Timestamp - Thời điểm token (và mục blacklist) hết hạn.
- **reason**: String - Lý do đưa vào blacklist (ví dụ: "USER_LOGOUT", "ADMIN_ACTION").
- **created_at**: Timestamp - Thời điểm tạo bản ghi.

## Ví dụ sử dụng

### 1. Xem danh sách Token bị chặn
**Yêu cầu:**
```http
GET /api/admin/token-blacklist?page=1&limit=10&search=revo
Authorization: Bearer <SUPER_ADMIN_TOKEN>
```

**Phản hồi:**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "jti": "8f7d9a...",
        "reason": "USER_LOGOUT",
        "expires_at": "2026-01-10T10:00:00Z"
      }
    ],
    "pagination": { "page": 1, "limit": 10, "total": 1 }
  },
  "message": "Danh sách token bị chặn đã được lấy thành công"
}
```

### 2. Chặn thủ công một Token
Hữu ích để vô hiệu hóa một token cụ thể ngay lập tức mà không cần đợi nó hết hạn.

**Yêu cầu:**
```http
POST /api/admin/token-blacklist
Content-Type: application/json
Authorization: Bearer <SUPER_ADMIN_TOKEN>

{
  "jti": "compromised-token-jti-123",
  "userId": 42,
  "reason": "ADMIN_SECURITY_ACTION",
  "expiresAt": "2026-01-11T00:00:00Z"
}
```

## Kiểm thử (Testing)
Để xác minh việc triển khai, hãy chạy các bộ test chuyên dụng:

```bash
# Chạy test cho các route blacklist token
node tests/tokenBlacklistRouteTest.js

# Chạy test cho token người dùng bị đình chỉ (suspended)
node tests/suspendedUserTokenTest.js
```

## Ghi chú tích hợp
- **Tích hợp Middleware**: Blacklist được kiểm tra bởi middleware xác thực. Nếu JTI của token tồn tại trong danh sách này, yêu cầu sẽ bị từ chối với mã lỗi `401 Unauthorized` trước khi đến bất kỳ route handler nào.
- **Người dùng bị đình chỉ**: Khi một người dùng bị đình chỉ (suspended), các token đang hoạt động của họ sẽ bị coi là không hợp lệ. `suspendedUserTokenTest.js` xác minh rằng người dùng bị đình chỉ không thể truy cập tài nguyên được bảo vệ.
