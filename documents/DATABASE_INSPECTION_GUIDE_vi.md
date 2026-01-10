# 🔍 HƯỚNG DẪN KIỂM TRA CƠ SỞ DỮ LIỆU - HONO AUTH WORKER

📖 Ngôn ngữ: [English](./DATABASE_INSPECTION_GUIDE.md) | Tiếng Việt  
Cập nhật lần cuối: 10/01/2026

## Phạm vi
Tài liệu này hướng dẫn sử dụng các công cụ Kiểm tra Cơ sở dữ liệu (Database Inspection) nằm trong thư mục `tools/d1/`. Các script này cung cấp cho lập trình viên cách nhanh chóng và có cấu trúc để xác minh trạng thái của cơ sở dữ liệu D1 cục bộ, kiểm tra dữ liệu mẫu (seeding) và gỡ lỗi mà không cần công cụ GUI bên ngoài.

## Tổng quan công cụ

### 1. Advanced Inspector (`inspect_db_v2.js`)
**Trạng thái**: Khuyên dùng  
Một công cụ kiểm tra có cấu trúc, phân loại, cung cấp cái nhìn toàn diện về "sức khỏe" hệ thống và phân bố dữ liệu.

**Tính năng:**
- **Hỗ trợ từ xa (Remote)**: Có thể kiểm tra cả database D1 cục bộ và từ xa (trên Cloudflare) bằng cờ `--remote`.
- **Phân loại dữ liệu**: Nhóm các truy vấn thành các phần logic (Schema, Users, Audit, Security).
- **Thống kê tóm tắt**: Hiển thị số lượng theo vai trò, trạng thái, và loại hành động thay vì chỉ liệt kê hàng thô.
- **Bảng định dạng**: Sử dụng `console.table` để đầu ra dễ đọc.
- **Thực thi an toàn**: Xử lý lỗi nhẹ nhàng nếu bảng chưa tồn tại (hữu ích khi migration chưa chạy hết).

### 2. Basic Inspector (`inspect_db.js`)
**Trạng thái**: Cũ / Đơn giản  
Script đơn giản để dump các hàng dữ liệu thô cho các truy vấn định sẵn. Hữu ích cho việc kiểm tra nhanh hoặc test kết nối D1 binding.

## Cách sử dụng

### Yêu cầu tiên quyết
- Môi trường Node.js.
- Đã cài đặt dependencies (`npm install`).
- Cơ sở dữ liệu D1 cục bộ đã được khởi tạo (thông qua `wrangler dev` hoặc migrations).

### Chạy công cụ
Các công cụ hiện hỗ trợ kiểm tra các môi trường cụ thể (dev, staging, production) và cơ sở dữ liệu từ xa.

```bash
# Mặc định (Local Development)
node tools/d1/inspect_db_v2.js

# Môi trường cụ thể (Local)
node tools/d1/inspect_db_v2.js staging

# Cơ sở dữ liệu từ xa (Cloudflare D1)
node tools/d1/inspect_db_v2.js production --remote

# Chạy công cụ cơ bản (Cũ)
node tools/d1/inspect_db.js
```

> **Lưu ý**: Script V2 hiện sử dụng `npx wrangler d1 execute` ở lớp dưới. Điều này cho phép nó hoạt động mượt mà với các cơ sở dữ liệu từ xa bằng cách truyền cờ `--remote`, miễn là bạn đã xác thực bằng `wrangler login`.

## Các danh mục kiểm tra (V2)

Công cụ `inspect_db_v2.js` bao gồm các miền dữ liệu sau:

### 📂 Schema & Stats (Cấu trúc & Thống kê)
- **List all tables**: Xác minh việc migration thành công.
- **Table Record Counts**: Kiểm tra nhanh số lượng bản ghi trong `users`, `audit_logs`, `security_incidents`, v.v.

### 📂 Users (Người dùng)
- **Users by Role**: Số lượng Super Admin, Admin, và User thường.
- **Users by Status**: Phân bố người dùng Active, Inactive, Suspended.
- **Recent Activity**: Người dùng được tạo trong 7 ngày qua.
- **Verification Status**: Danh sách người dùng đang chờ kích hoạt hoặc chưa xác minh email.

### 📂 Audit (Nhật ký)
- **Recent Logs**: 5 hành động mới nhất trong hệ thống.
- **Action Distribution**: Các hoạt động phổ biến nhất (ví dụ: bao nhiêu `LOGIN` so với `UPDATE_PROFILE`).
- **Archive Check**: Xác minh bảng lưu trữ `audit_logs_archive` có truy cập được không.

### 📂 Security (Bảo mật)
- **Active Incidents**: Các cảnh báo bảo mật gần đây (tấn công DoS, Brute force).
- **Blacklist**: Các token (JWT) đang bị chặn và còn hiệu lực.
- **Blocked IPs**: Danh sách IP đang bị giới hạn hoặc chặn do đăng nhập sai nhiều lần.

## Tùy chỉnh
Bạn có thể dễ dàng mở rộng `tools/d1/inspect_db_v2.js` bằng cách thêm object truy vấn mới vào hằng số `queries`:

```javascript
const queries = {
  // ... các danh mục hiện có
  custom: [
    {
      name: 'Kiểm tra tùy chỉnh của tôi',
      query: "SELECT * FROM users WHERE email LIKE '%@company.com'"
    }
  ]
};
```
