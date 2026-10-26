# Đặt lại mật khẩu bởi quản trị viên

🌐 Language / Ngôn ngữ: [English](ADMIN_PASSWORD_RESET.md) | Tiếng Việt

`POST /api/admin/users/:id/reset-password` yêu cầu Bearer token của người đang quản trị và JSON:

```json
{"newPassword":"New-password-example-9!","confirmPassword":"New-password-example-9!"}
```

- Admin chỉ reset User. Super Admin reset User/Admin.
- Không reset chính mình, tài khoản ngang quyền hoặc cao hơn. Tự đổi mật khẩu tại Profile bằng mật khẩu hiện tại; Super Admin bị khóa tài khoản cần dùng quy trình khôi phục vận hành.
- Mật khẩu mới cần ít nhất 8 ký tự (theo độ dài chuỗi JavaScript) và tối đa 72 byte UTF-8. Không cắt khoảng trắng hay cắt ngắn mật khẩu; giới hạn byte ngăn bcrypt âm thầm bỏ phần cuối.

Trong cùng giao dịch D1, server kiểm tra lại vai trò/trạng thái/auth_version của người thực hiện và vai trò/hash của tài khoản đích, ghi hash mới, tăng auth_version, thu hồi mọi refresh token còn hiệu lực và ghi audit `ADMIN_PASSWORD_RESET`. Lỗi ở bất kỳ bước nào sẽ hoàn tác toàn bộ. Nội dung audit không chứa mật khẩu hay hash.

Thành công trả HTTP 200, `success: true` và `data: {userId, sessionsRevoked: true}`. Tài khoản đích phải đăng nhập lại bằng mật khẩu mới; phiên của người quản trị không bị thu hồi. Triển khai với migrations đến `0012` và `AUTH_VERSION_ENFORCEMENT=enforce` để cả access token cũ thiếu version cũng bị từ chối.

| HTTP | Ý nghĩa |
| --- | --- |
| 400 | ID/payload/mật khẩu/xác nhận không hợp lệ; field ngoài hợp đồng bị từ chối. |
| 401 | Thiếu phiên, hết hạn hoặc phiên bị thu hồi. |
| 403 | Không đủ quyền hoặc vi phạm thứ bậc vai trò. |
| 404 | Không tìm thấy tài khoản đích. |
| 409 | Tài khoản/quyền thay đổi hoặc không xác nhận được đầy đủ các lệnh ghi; tải lại trước khi thử lại. |
| 500 | Không hoàn tất giao dịch; không có thay đổi một phần. |

Không tự động gửi lại POST sau timeout hay lỗi mạng chưa rõ kết quả. Kiểm tra trạng thái hoặc yêu cầu mới có chủ đích. Chức năng không gửi email, không phát reset token và không bắt buộc đổi lại mật khẩu lần đăng nhập tiếp theo. Chuyển mật khẩu qua kênh an toàn. Mã nguồn: [route](../src/routes/admin.js), [service](../src/services/userService.js), [kiểm thử D1](../tests/integration/admin-password-reset.d1.test.mjs).
