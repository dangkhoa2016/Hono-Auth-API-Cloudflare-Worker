# 📧 HƯỚNG DẪN XÁC MINH THAY ĐỔI EMAIL - HONO AUTH WORKER

📖 Ngôn ngữ: [English](./EMAIL_CHANGE_VERIFICATION_GUIDE.md) | Tiếng Việt  
Cập nhật lần cuối: 10/01/2026

## Phạm vi
Tài liệu hướng dẫn về quy trình Xác minh Thay đổi Email. Tính năng này đảm bảo rằng khi người dùng cập nhật địa chỉ email, địa chỉ mới phải được xác minh trước khi áp dụng vào tài khoản. Điều này giúp ngăn chặn việc bị khóa tài khoản do lỗi nhập liệu và tăng cường bảo mật.

## Tính năng đã triển khai
- **Cơ sở dữ liệu**: Thêm các cột vào bảng `users` để lưu trữ tạm thời email mới và token xác minh (Migration 0010).
- **API Routes**: 
  - Cập nhật `PUT /api/user/profile` để xử lý yêu cầu thay đổi email riêng biệt so với việc cập nhật hồ sơ thông thường.
  - Thêm endpoint mới `GET /api/user/verify-email` để xử lý việc xác thực token.
- **Email Service**: Mẫu email giao dịch mới cho "Xác minh Thay đổi Email".
- **Đa ngôn ngữ (i18n)**: Hỗ trợ đầy đủ i18n cho nội dung email và phản hồi API.
- **Kiểm thử**: Bộ test tích hợp chuyên biệt `tests/emailChangeVerificationTest.js`.

## Mô hình dữ liệu
Quy trình xác minh sử dụng các cột mới sau trong bảng `users`:
- **new_email** (TEXT): Lưu trữ địa chỉ email mới đang chờ xác minh.
- **email_verification_token** (TEXT, Indexed): Một mã token ngẫu nhiên, bảo mật được tạo cho liên kết xác minh.
- **email_verification_expires_at** (TEXT): Thời điểm token hết hạn (sau 24 giờ).

## Quy trình Xác minh
1. **Yêu cầu (Request)**: Người dùng đã đăng nhập gửi `PUT /api/user/profile` với giá trị `email` mới.
2. **Thiết lập (Setup)**: Hệ thống kiểm tra xem email mới có khả dụng không. Nếu có, nó lưu `new_email` và tạo token trong cơ sở dữ liệu, nhưng **chưa** cập nhật trường `email` chính.
3. **Thông báo (Notification)**: Hệ thống gửi email xác minh đến địa chỉ email **mới** chứa liên kết xác thực.
4. **Phản hồi (Response)**: API trả về `emailVerificationPending: true` cho client.
5. **Xác minh (Verification)**: Người dùng nhấp vào liên kết (`/api/user/verify-email?token=...`).
6. **Hoàn tất (Completion)**: Hệ thống xác thực token, thời hạn và xung đột tiềm ẩn. Nếu hợp lệ, `email` được cập nhật thành `new_email`, và các trường tạm thời bị xóa.

## Tài liệu API

| Phương thức | Endpoint | Mô tả | Xác thực | i18n Key |
|-------------|----------|-------|----------|----------|
| `PUT` | `/api/user/profile` | Yêu cầu đổi email (payload phải chứa `email`) | User | `user.updatedWithEmailVerification` |
| `GET` | `/api/user/verify-email` | Xác minh email mới qua token trên query param | Public | `user.emailVerified` |

## Ví dụ sử dụng

### 1. Yêu cầu Thay đổi Email
**Yêu cầu:**
```http
PUT /api/user/profile
Authorization: Bearer <USER_TOKEN>
Content-Type: application/json

{
  "email": "new.address@example.com",
  "full_name": "Updated Name"
}
```

**Phản hồi:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "old.address@example.com",
    "new_email": "new.address@example.com",
    "emailVerificationPending": true,
    ...
  },
  "message": "Hồ sơ đã được cập nhật. Vui lòng kiểm tra địa chỉ email mới new.address@example.com của bạn để xác minh và hoàn tất thay đổi."
}
```

### 2. Xác minh Email (Nhấp vào liên kết)
**Yêu cầu:**
```http
GET /api/user/verify-email?token=8f7d9a...
```

**Phản hồi:**
```json
{
  "success": true,
  "data": {
    "email": "new.address@example.com",
    "id": 1,
    ...
  },
  "message": "Địa chỉ email đã được xác minh thành công cho người dùng Updated Name."
}
```

## Kiểm thử (Testing)
Để xác minh toàn bộ quy trình (bao gồm giả lập việc lấy token từ DB), hãy chạy bộ test chuyên dụng:

```bash
# Chạy test xác minh thay đổi email
node tests/emailChangeVerificationTest.js
```

## Lưu ý bảo mật
- **Hết hạn Token**: Token xác minh sẽ hết hạn sau 24 giờ.
- **Kiểm tra xung đột**: Kiểm tra tính duy nhất của email lần cuối được thực hiện tại thời điểm xác minh để ngăn chặn các điều kiện tranh chấp (race conditions).
- **Vô hiệu hóa Token**: Sau khi sử dụng, token sẽ bị xóa ngay lập tức.
- **Xác thực trạng thái**: Việc xác minh sẽ thất bại nếu người dùng đã yêu cầu thay đổi khác hoặc trạng thái không hợp lệ.
