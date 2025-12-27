📖 **Language**: [English](./CURL_COMMANDS.md) | Tiếng Việt

# 🧪 Kiểm Thử RBAC với Lệnh Curl - Tài Liệu Tham Khảo Hoàn Chỉnh

> **Kiểm thử toàn diện hệ thống kiểm soát truy cập dựa trên vai trò (RBAC) sử dụng lệnh curl**

Tài liệu đầy đủ để kiểm thử hệ thống xác thực và phân quyền của Hono Auth Worker bằng lệnh curl. Hướng dẫn này bao gồm tất cả loại vai trò, ranh giới bảo mật và các trường hợp đặc biệt.

## 📋 Mục Lục

1. [🚀 Thiết Lập Nhanh](#thiết-lập-nhanh)
2. [🔐 Xác Thực](#xác-thực)
3. [👤 Lệnh Người Dùng Thường](#lệnh-người-dùng-thường)
4. [👥 Lệnh Admin](#lệnh-admin)
5. [👑 Lệnh Super Admin](#lệnh-super-admin)
6. [🛡️ Kiểm Thử Bảo Mật](#kiểm-thử-bảo-mật)
7. [📊 Endpoints Hệ Thống](#endpoints-hệ-thống)
8. [🔧 Quản Lý Cấu Hình KV](#quản-lý-cấu-hình-kv)
9. [🔍 Kiểm Thử Hệ Thống Audit](#kiểm-thử-hệ-thống-audit)
10. [🌐 Kiểm Thử Đa Ngôn Ngữ](#kiểm-thử-đa-ngôn-ngữ)
11. [🎯 Endpoints Demo Zod Validation](#endpoints-demo-zod-validation)
12. [⚡ Kiểm Thử Hiệu Suất](#kiểm-thử-hiệu-suất)
13. [🧪 Scripts Tự Động Hóa Kiểm Thử](#scripts-tự-động-hóa-kiểm-thử)
14. [🔧 Khắc Phục Sự Cố](#khắc-phục-sự-cố)

## 🚀 Thiết Lập Nhanh

### Yêu Cầu
- **curl** đã được cài đặt
- **jq** để định dạng JSON (tùy chọn nhưng khuyến nghị)
- **Server kiểm thử đang chạy** trên cổng 8788 (môi trường test)

### Khởi Động Server Kiểm Thử
```bash
# Khởi động môi trường test (cổng 8788)
npm run dev:test

# Hoặc khởi động môi trường cụ thể
npm run dev      # Development (cổng 8787)
npm run dev:staging  # Staging (cổng 8789)
```

### Thiết Lập Dữ Liệu Kiểm Thử
```bash
# Tạo người dùng kiểm thử (nếu chưa tồn tại)
node tests/utils/createTestAdminUsers.js

# Hoặc chạy thiết lập dữ liệu kiểm thử
node tests/utils/setupTestUsers.js

# Khởi tạo database kiểm thử
npm run test:initdb

# Reset database kiểm thử với trạng thái sạch
node tests/init/reset.sql
```

### Môi Trường Kiểm Thử Có Sẵn
```bash
# Môi trường development (cổng 8787)
npm run dev

# Môi trường test (cổng 8788)
npm run dev:test

# Môi trường staging (cổng 8789)
npm run dev:staging

# Môi trường test với debug
npm run dev:test:debug
```

## 🔐 Xác Thực

### Đăng Nhập Cho Từng Loại Vai Trò

#### 1. Đăng Nhập Super Admin
```bash
curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-superadmin@example.com",
    "password": "password123"
  }' | jq .
```

#### 2. Đăng Nhập Admin
```bash
curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-admin@example.com",
    "password": "password123"
  }' | jq .
```

#### 3. Đăng Nhập Người Dùng Thường
```bash
curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-user@example.com",
    "password": "password123"
  }' | jq .
```

### Quản Lý Token

#### Làm Mới Token
```bash
curl -s -X POST http://localhost:8788/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refresh_token": "YOUR_REFRESH_TOKEN"
  }' | jq .
```

#### Đăng Xuất
```bash
curl -s -X POST http://localhost:8788/api/auth/logout \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" | jq .
```

## 👤 Lệnh Người Dùng Thường

### Quản Lý Hồ Sơ

#### Lấy Hồ Sơ Cá Nhân
```bash
curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .
```

#### Cập Nhật Hồ Sơ Cá Nhân
```bash
curl -s -X PUT http://localhost:8788/api/user/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "full_name": "Tên Người Dùng Đã Cập Nhật"
  }' | jq .
```

#### Thay Đổi Mật Khẩu
```bash
curl -s -X PUT http://localhost:8788/api/user/change-password \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "currentPassword": "password123",
    "newPassword": "newpassword123"
  }' | jq .
```

### Đăng Ký Người Dùng (Endpoint Công Khai)
```bash
curl -s -X POST http://localhost:8788/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Người Dùng Đăng Ký Mới",
    "email": "newreg@example.com",
    "password": "password123"
  }' | jq .
```

### Hành Động Bị Cấm (Nên Trả Về 403)

#### Thử Truy Cập Endpoints Admin
```bash
# Nên trả về 403 Forbidden
curl -s -X GET http://localhost:8788/api/admin/users \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .
```

#### Thử Tạo Người Dùng
```bash
# Nên trả về 403 Forbidden
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{
    "email": "forbidden@example.com",
    "password": "password123",
    "full_name": "Người Dùng Bị Cấm",
    "role": "user"
  }' | jq .
```

## 👥 Lệnh Admin

### Quản Lý Người Dùng

#### Lấy Tất Cả Người Dùng (Đã Lọc)
```bash
# Lấy tất cả người dùng (Admin chỉ thấy users và admins)
curl -s -X GET http://localhost:8788/api/admin/users \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Lấy Người Dùng Với Phân Trang
```bash
curl -s -X GET "http://localhost:8788/api/admin/users?page=1&limit=5" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Lấy Người Dùng Lọc Theo Vai Trò
```bash
# Chỉ lấy admin users
curl -s -X GET "http://localhost:8788/api/admin/users?role=admin" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .

# Chỉ lấy regular users
curl -s -X GET "http://localhost:8788/api/admin/users?role=user" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Lấy Người Dùng Lọc Theo Trạng Thái
```bash
curl -s -X GET "http://localhost:8788/api/admin/users?status=active" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Tìm Kiếm Người Dùng
```bash
curl -s -X GET "http://localhost:8788/api/admin/users?search=test" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Chi Tiết Người Dùng

#### Lấy Chi Tiết Người Dùng Cụ Thể
```bash
# Thay USER_ID bằng ID người dùng thực tế
curl -s -X GET http://localhost:8788/api/admin/users/4 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Tạo Người Dùng

#### Tạo Người Dùng Thường
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "full_name": "Người Dùng Kiểm Thử Mới",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "user",
    "status": "active"
  }' | jq .
```

#### Tạo Admin User
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "full_name": "Admin User Mới",
    "email": "newadmin@example.com",
    "password": "password123",
    "role": "admin",
    "status": "active"
  }' | jq .
```

### Cập Nhật Người Dùng

#### Cập Nhật Thông Tin Người Dùng
```bash
# Thay USER_ID bằng ID người dùng thực tế
curl -s -X PUT http://localhost:8788/api/admin/users/4 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "full_name": "Tên Người Dùng Đã Cập Nhật",
    "status": "inactive"
  }' | jq .
```

### Quản Lý Vai Trò

#### Thay Đổi Vai Trò Người Dùng (Admin có thể thay đổi user ↔ admin)
```bash
# Thăng user lên admin
curl -s -X PUT http://localhost:8788/api/admin/users/4/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "admin"}' | jq .

# Hạ admin xuống user
curl -s -X PUT http://localhost:8788/api/admin/users/3/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "user"}' | jq .
```

### Xóa Người Dùng

#### Xóa Người Dùng Thường
```bash
curl -s -X DELETE http://localhost:8788/api/admin/users/4 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Xóa Admin User
```bash
curl -s -X DELETE http://localhost:8788/api/admin/users/3 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Giới Hạn Admin (Nên Trả Về 403)

#### Không Thể Tạo Super Admin
```bash
# Nên trả về 403 Forbidden
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{
    "full_name": "Super Admin Bị Cấm",
    "email": "forbidden@example.com",
    "password": "password123",
    "role": "super_admin"
  }' | jq .
```

#### Không Thể Truy Cập Chi Tiết Super Admin
```bash
# Nên trả về 403 Forbidden
curl -s -X GET http://localhost:8788/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Không Thể Thăng Lên Super Admin
```bash
# Nên trả về 403 Forbidden
curl -s -X PUT http://localhost:8788/api/admin/users/4/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -d '{"role": "super_admin"}' | jq .
```

## 👑 Lệnh Super Admin

### Quản Lý Người Dùng Đầy Đủ

#### Xem Tất Cả Người Dùng (Bao Gồm Super Admins)
```bash
curl -s -X GET http://localhost:8788/api/admin/users \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Xem Chỉ Super Admin Users
```bash
curl -s -X GET "http://localhost:8788/api/admin/users?role=super_admin" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Truy Cập Chi Tiết Super Admin
```bash
curl -s -X GET http://localhost:8788/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Tạo Người Dùng Với Bất Kỳ Vai Trò Nào

#### Tạo Người Dùng Thường
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "full_name": "Người Dùng Thường Mới",
    "email": "newuser@example.com",
    "password": "password123",
    "role": "user",
    "status": "active"
  }' | jq .
```

#### Tạo Admin User
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "full_name": "Admin User Mới",
    "email": "newadmin@example.com",
    "password": "password123",
    "role": "admin",
    "status": "active"
  }' | jq .
```

#### Tạo Super Admin User
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "full_name": "Super Admin Mới",
    "email": "newsuperadmin@example.com",
    "password": "password123",
    "role": "super_admin",
    "status": "active"
  }' | jq .
```

### Cập Nhật Bất Kỳ Người Dùng Nào

#### Cập Nhật Chi Tiết Super Admin
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "full_name": "Tên Super Admin Đã Cập Nhật",
    "status": "active"
  }' | jq .
```

### Quản Lý Vai Trò Nâng Cao

#### Thăng User Lên Admin
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/4/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "admin"}' | jq .
```

#### Thăng User Lên Super Admin
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/5/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "super_admin"}' | jq .
```

#### Thăng Admin Lên Super Admin
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/3/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "super_admin"}' | jq .
```

#### Hạ Super Admin Xuống Admin
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/SUPER_ADMIN_USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "admin"}' | jq .
```

#### Hạ Super Admin Xuống User
```bash
curl -s -X PUT http://localhost:8788/api/admin/users/SUPER_ADMIN_USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "user"}' | jq .
```

### Xóa Bất Kỳ Người Dùng Nào

#### Xóa Người Dùng Thường
```bash
curl -s -X DELETE http://localhost:8788/api/admin/users/4 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Xóa Admin User
```bash
curl -s -X DELETE http://localhost:8788/api/admin/users/3 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Xóa Super Admin User
```bash
curl -s -X DELETE http://localhost:8788/api/admin/users/SUPER_ADMIN_USER_ID \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Giới Hạn Super Admin (Biện Pháp An Toàn)

#### Không Thể Xóa Tài Khoản Của Chính Mình
```bash
# Nên trả về 403 Forbidden
curl -s -X DELETE http://localhost:8788/api/admin/users/1 \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Không Thể Thay Đổi Vai Trò Của Chính Mình
```bash
# Nên trả về 403 Forbidden
curl -s -X PUT http://localhost:8788/api/admin/users/1/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"role": "admin"}' | jq .
```

## ⚙️ Lệnh Quản Lý Cấu Hình KV (Chỉ Super Admin)

### Lấy Tất Cả Cấu Hình
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Lấy Cấu Hình Cụ Thể
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs/RATE_LIMIT_DISABLED \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Lấy Cấu Hình Mặc Định
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs/defaults \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### So Sánh ENV vs KV
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs/env-comparison \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Cập Nhật Cấu Hình
```bash
curl -s -X PUT http://localhost:8788/api/kv-admin/configs/RATE_LIMIT_DISABLED \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"value": false}' | jq .
```

### Cập Nhật Nhiều Cấu Hình
```bash
curl -s -X POST http://localhost:8788/api/kv-admin/configs/batch \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "configs": {
      "RATE_LIMIT_MAX_ATTEMPTS": 10,
      "DEFAULT_PAGE_SIZE": 20,
      "ENABLE_DETAILED_ERRORS": true
    }
  }' | jq .
```

### Reset Cấu Hình Về Mặc Định
```bash
curl -s -X DELETE http://localhost:8788/api/kv-admin/configs/RATE_LIMIT_DISABLED \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Xóa Cache Cấu Hình
```bash
curl -s -X POST http://localhost:8788/api/kv-admin/configs/cache/clear \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Kiểm Thử Truy Cập Bị Từ Chối

#### Admin Thử Truy Cập KV Admin (Nên Bị Từ Chối)
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### User Thử Truy Cập KV Admin (Nên Bị Từ Chối)
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .
```

#### Không Có Token (Nên Bị Từ Chối)
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs | jq .
```

## 🛡️ Kiểm Thử Bảo Mật

### Xác Thực Không Hợp Lệ

#### Token Không Hợp Lệ
```bash
curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer invalid_token" | jq .
```

#### Không Có Token
```bash
curl -s -X GET http://localhost:8788/api/user/profile | jq .
```

#### Kiểm Thử Token Hết Hạn
```bash
# Sử dụng token đã hết hạn (bạn cần tự tạo hoặc chờ hết hạn)
curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer EXPIRED_TOKEN" | jq .
```

### Kiểm Thử Ranh Giới Vai Trò

#### Admin Thử Xem Dữ Liệu Super Admin
```bash
# Nên trả về kết quả rỗng hoặc dữ liệu đã lọc
curl -s -X GET "http://localhost:8788/api/admin/users?role=super_admin" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### User Thử Thao Tác Admin
```bash
# Tất cả nên trả về 403 Forbidden
curl -s -X GET http://localhost:8788/api/admin/users \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .

curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -d '{"email":"hack@example.com","password":"password123","full_name":"Hacker","role":"admin"}' | jq .
```

### Kiểm Thử Validation Input

#### Định Dạng Email Không Hợp Lệ
```bash
curl -s -X POST http://localhost:8788/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Người Dùng Kiểm Thử",
    "email": "invalid-email",
    "password": "password123"
  }' | jq .
```

#### Mật Khẩu Quá Ngắn
```bash
curl -s -X POST http://localhost:8788/api/user/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Người Dùng Kiểm Thử",
    "email": "test@example.com",
    "password": "123"
  }' | jq .
```

#### Vai Trò Không Hợp Lệ
```bash
curl -s -X POST http://localhost:8788/api/admin/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "full_name": "Người Dùng Kiểm Thử",
    "role": "invalid_role"
  }' | jq .
```

## � Quản Lý Cấu Hình KV

### Cấu Hình Hệ Thống (Chỉ Super Admin)

#### Lấy Tất Cả Cấu Hình KV
```bash
curl -s -X GET http://localhost:8788/api/kv-admin/configs \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Lấy Cấu Hình Cụ Thể
```bash
# Lấy cài đặt JWT
curl -s -X GET http://localhost:8788/api/kv-admin/configs/JWT_SECRET \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .

# Lấy feature flags
curl -s -X GET http://localhost:8788/api/kv-admin/configs/RATE_LIMIT_DISABLED \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .

# Lấy chế độ bảo trì
curl -s -X GET http://localhost:8788/api/kv-admin/configs/MAINTENANCE_MODE \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

#### Cập Nhật Cấu Hình
```bash
# Bật chế độ bảo trì
curl -s -X PUT http://localhost:8788/api/kv-admin/configs/MAINTENANCE_MODE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"value": "true"}' | jq .

# Tắt rate limiting
curl -s -X PUT http://localhost:8788/api/kv-admin/configs/RATE_LIMIT_DISABLED \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"value": "true"}' | jq .

# Cập nhật thời gian hết hạn JWT token
curl -s -X PUT http://localhost:8788/api/kv-admin/configs/JWT_ACCESS_TOKEN_EXPIRES \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"value": "7200"}' | jq .
```

#### Xóa Cấu Hình (Reset về Mặc định)
```bash
curl -s -X DELETE http://localhost:8788/api/kv-admin/configs/MAINTENANCE_MODE \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Kiểm Soát Response Body Capture
```bash
# Bật response body capture để debug
curl -s -X PUT http://localhost:8788/api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"value": "true"}' | jq .

# Kiểm tra trạng thái hiện tại
curl -s -X GET http://localhost:8788/api/kv-admin/configs/ENABLE_RESPONSE_BODY_CAPTURE \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

## 🔍 Kiểm Thử Hệ Thống Audit

### Truy Vấn Audit Log Cơ Bản
```bash
# Lấy audit logs gần đây
curl -s -X GET "http://localhost:8788/api/admin/audit-logs?limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .

# Lấy audit logs theo loại hành động
curl -s -X GET "http://localhost:8788/api/admin/audit-logs?action=user_login" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .

# Lấy audit logs theo user ID
curl -s -X GET "http://localhost:8788/api/admin/audit-logs?user_id=2" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .

# Lấy audit logs với khoảng thời gian
curl -s -X GET "http://localhost:8788/api/admin/audit-logs?start_date=2025-08-01&end_date=2025-08-02" \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Phân Tích Audit Nâng Cao (Chỉ Super Admin)
```bash
# Lấy thống kê audit
curl -s -X GET http://localhost:8788/api/admin/audit-stats \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .

# Lấy dashboard phân tích audit
curl -s -X GET http://localhost:8788/api/admin/audit-analytics \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .

# Xuất audit logs
curl -s -X GET "http://localhost:8788/api/admin/audit-export?format=json&days=30" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

### Quản Lý Sự Cố Bảo Mật
```bash
# Lấy sự cố bảo mật
curl -s -X GET http://localhost:8788/api/admin/security-incidents \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .

# Tạo sự cố bảo mật
curl -s -X POST http://localhost:8788/api/admin/security-incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{
    "title": "Hoạt Động Đăng Nhập Đáng Ngờ",
    "description": "Phát hiện nhiều lần thử đăng nhập thất bại",
    "severity": "medium",
    "category": "authentication"
  }' | jq .

# Cập nhật trạng thái sự cố
curl -s -X PUT http://localhost:8788/api/admin/security-incidents/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" \
  -d '{"status": "investigating"}' | jq .
```

## 🌐 Kiểm Thử Đa Ngôn Ngữ

### Kiểm Thử Phát Hiện Ngôn Ngữ
```bash
# Kiểm thử với các Accept-Language headers khác nhau
curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Accept-Language: vi-VN,vi;q=0.9" | jq .

curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Accept-Language: fr-FR,fr;q=0.9" | jq .

curl -s -X GET http://localhost:8788/api/user/profile \
  -H "Authorization: Bearer YOUR_USER_TOKEN" \
  -H "Accept-Language: ja-JP,ja;q=0.9" | jq .
```

### Ghi Đè Ngôn Ngữ Với Query Parameter
```bash
# Ép buộc ngôn ngữ cụ thể
curl -s -X GET "http://localhost:8788/api/user/profile?lang=vi" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .

curl -s -X GET "http://localhost:8788/api/user/profile?lang=es" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .

curl -s -X GET "http://localhost:8788/api/user/profile?lang=th" \
  -H "Authorization: Bearer YOUR_USER_TOKEN" | jq .
```

### Endpoints Demo Dịch Thuật
```bash
# Lấy danh sách ngôn ngữ có sẵn
curl -s -X GET http://localhost:8788/api/translations/languages | jq .

# Lấy bản dịch cho ngôn ngữ cụ thể
curl -s -X GET http://localhost:8788/api/translations/demo/vi | jq .
curl -s -X GET http://localhost:8788/api/translations/demo/ja | jq .
curl -s -X GET http://localhost:8788/api/translations/demo/de | jq .
```

### Thông Báo Lỗi Validation Đa Ngôn Ngữ
```bash
# Kiểm thử lỗi validation ở các ngôn ngữ khác nhau
curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: vi-VN" \
  -d '{"email": "invalid", "password": ""}' | jq .

curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -H "Accept-Language: ja-JP" \
  -d '{"email": "invalid", "password": ""}' | jq .
```

## ⚡ Kiểm Thử Hiệu Suất

### Kiểm Thử Tải Endpoints
```bash
# Kiểm thử hiệu suất đơn giản
for i in {1..10}; do
  curl -s -X GET http://localhost:8788/api/system/health \
    -w "Thời gian phản hồi: %{time_total}s\n" -o /dev/null
done

# Kiểm thử xác thực đồng thời
for i in {1..5}; do
  curl -s -X POST http://localhost:8788/api/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email": "user@example.com", "password": "password123"}' \
    -w "Thời gian đăng nhập: %{time_total}s\n" -o /dev/null &
done
wait
```

### Giám Sát Hiệu Suất
```bash
# Lấy metrics hiệu suất hệ thống
curl -s -X GET http://localhost:8788/api/admin/system-health \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .

# Lấy thống kê hiệu suất chi tiết (Chỉ Super Admin)
curl -s -X GET http://localhost:8788/api/admin/performance-stats \
  -H "Authorization: Bearer YOUR_SUPER_ADMIN_TOKEN" | jq .
```

## 🧪 Scripts Tự Động Hóa Kiểm Thử

### Scripts Kiểm Thử Có Sẵn
```bash
# Menu kiểm thử tương tác (30 bộ kiểm thử khác nhau)
npm run test
# hoặc
node tests/mainMenu.js

# Chạy toàn bộ kiểm thử (40+ tests)
bash tests/scripts/run-all-tests.sh

# Chạy kiểm thử nhanh (output tối thiểu)
bash tests/scripts/run-all-tests-quick.sh

# Kiểm thử theo vai trò
bash tests/scripts/admin_user.sh
bash tests/scripts/regular_user.sh
bash tests/scripts/super_admin_user.sh
bash tests/scripts/test_all_roles.sh

# Kiểm thử bảo mật
bash tests/scripts/test-rbac.sh
bash tests/scripts/test-debug.sh
```

### Lệnh Bộ Kiểm Thử Riêng Lẻ
```bash
# Kiểm thử chức năng cốt lõi
npm run test:system          # Sức khỏe hệ thống và môi trường
npm run test:auth            # Xác thực và JWT
npm run test:security        # Bảo mật và rate limiting
npm run test:quick           # Kiểm thử khói nhanh

# Kiểm thử theo vai trò
npm run test:regular_user    # Chức năng người dùng thường
npm run test:admin_user      # Quản lý người dùng admin
npm run test:super_admin_user # Kiểm soát toàn bộ super admin

# Chức năng nâng cao
npm run test:i18n           # i18n và localization
npm run test:validation      # Zod schema validation
npm run test:performance     # Kiểm thử tải và hiệu suất
npm run test:integration     # Quy trình end-to-end

# Kiểm thử hệ thống audit
npm run test:audit:system    # Chức năng audit hoàn chỉnh
npm run test:audit:simple    # Kiểm thử audit cơ bản
npm run test:audit:advanced  # Phân tích audit nâng cao
npm run test:audit:perf      # Kiểm thử hiệu suất audit

# Kiểm thử KV và cấu hình
npm run test:kv_admin        # Quản lý cấu hình KV
npm run test:kv:audit        # Cấu hình audit KV

# Kiểm thử bảo mật
npm run test:xss:all         # Kiểm thử bảo vệ XSS
npm run test:security:incident # Quản lý sự cố bảo mật
npm run test:error           # Kiểm thử xử lý lỗi

# Kiểm thử chuyên biệt
npm run test:zod_validation  # Zod validation bổ sung
npm run test:multilang_validation # Lỗi validation đa ngôn ngữ
npm run test:optimized       # Kiểm thử tối ưu hóa service
```

### Scripts Môi Trường Kiểm Thử
```bash
# Thiết lập môi trường
npm run setup:dev            # Môi trường development
npm run setup:test           # Môi trường test  
npm run setup:staging        # Môi trường staging

# Quản lý database
npm run db:migrate           # Chạy migrations (development)
npm run db:migrate:test      # Chạy migrations (test)
npm run db:migrate:staging   # Chạy migrations (staging)
npm run test:initdb          # Khởi tạo database kiểm thử
```

## 📊 Endpoints Hệ Thống

### Thống Kê Admin
```bash
curl -s -X GET http://localhost:8788/api/admin/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Dashboard Admin
```bash
curl -s -X GET http://localhost:8788/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Kiểm Tra Sức Khỏe Hệ Thống
```bash
curl -s -X GET http://localhost:8788/api/admin/system-health \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

### Endpoints Công Khai

#### Kiểm Tra Sức Khỏe
```bash
# Kiểm tra sức khỏe cơ bản
curl -s -X GET http://localhost:8788/health | jq .

# Endpoint kiểm tra sức khỏe thay thế
curl -s -X GET http://localhost:8788/api/health | jq .
```

#### Thông Tin Phiên Bản
```bash
# Endpoint phiên bản cơ bản
curl -s -X GET http://localhost:8788/version | jq .

# Endpoint phiên bản thay thế
curl -s -X GET http://localhost:8788/api/version | jq .
```

#### Phát Hiện Ngôn Ngữ
```bash
# Endpoint phát hiện ngôn ngữ
curl -s -X GET http://localhost:8788/language | jq .

# Ngôn ngữ với header Accept-Language
curl -s -X GET http://localhost:8788/language \
  -H "Accept-Language: vi,en;q=0.9" | jq .
```

#### Thông Tin API (Yêu Cầu Xác Thực)
```bash
# Thông tin API toàn diện
curl -s -X GET http://localhost:8788/api \
  -H "Authorization: Bearer YOUR_TOKEN" | jq .

# Khám phá routes hệ thống (Chỉ Admin)
curl -s -X GET http://localhost:8788/route-metadata \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq .
```

#### Favicon và Static Assets
```bash
# Favicon ICO
curl -s -X GET http://localhost:8788/favicon.ico \
  -o favicon.ico

# Favicon PNG
curl -s -X GET http://localhost:8788/favicon.png \
  -o favicon.png

# Apple touch icon
curl -s -X GET http://localhost:8788/apple-touch-icon.png \
  -o apple-touch-icon.png

# Manifest icon
curl -s -X GET http://localhost:8788/icon-192.png \
  -o icon-192.png
```

#### Endpoints Bản Dịch
```bash
# Liệt kê tất cả ngôn ngữ có sẵn
curl -s -X GET http://localhost:8788/api/translations | jq .

# Lấy bản dịch ngôn ngữ cụ thể
curl -s -X GET http://localhost:8788/api/translations/vi | jq .
curl -s -X GET http://localhost:8788/api/translations/en | jq .
curl -s -X GET http://localhost:8788/api/translations/fr | jq .
curl -s -X GET http://localhost:8788/api/translations/es | jq .
curl -s -X GET http://localhost:8788/api/translations/de | jq .
curl -s -X GET http://localhost:8788/api/translations/ja | jq .
curl -s -X GET http://localhost:8788/api/translations/th | jq .

# Xác thực tính đầy đủ của bản dịch
curl -s -X GET http://localhost:8788/api/translations/vi/validate | jq .

# Lấy bản dịch section cụ thể
curl -s -X GET http://localhost:8788/api/translations/en/section/auth | jq .
```

#### Endpoints Demo Bản Dịch
```bash
# Demo i18n nâng cao
curl -s -X GET http://localhost:8788/api/translations/demo/enhanced | jq .

# Demo plurals
curl -s -X GET http://localhost:8788/api/translations/demo/plurals | jq .

# Demo formatting
curl -s -X GET http://localhost:8788/api/translations/demo/formatting | jq .

# Demo context
curl -s -X GET http://localhost:8788/api/translations/demo/context | jq .

# Demo thông báo lỗi
curl -s -X GET http://localhost:8788/api/translations/demo/errors | jq .

# Demo thông báo thành công
curl -s -X GET http://localhost:8788/api/translations/demo/success | jq .
```

## 🎯 Endpoints Demo Zod Validation

### Thông Tin Demo Zod Chính
```bash
# Lấy tổng quan và tài liệu demo Zod
curl -s -X GET http://localhost:8788/api/zod_demo | jq .
```

### Demo Đăng Ký Người Dùng
```bash
# Demo đăng ký hợp lệ
curl -s -X POST http://localhost:8788/api/zod_demo/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Nguyễn Văn A",
    "email": "nguyen@example.com", 
    "password": "MatKhauBaoMat123",
    "age": 25,
    "country": "vn",
    "terms_accepted": true
  }' | jq .

# Demo đăng ký không hợp lệ - hiển thị lỗi xác thực
curl -s -X POST http://localhost:8788/api/zod_demo/register \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "",
    "email": "email-khong-hop-le",
    "password": "123", 
    "age": 15,
    "country": "invalid",
    "terms_accepted": false
  }' | jq .
```

### Demo Tìm Kiếm với Query Parameters
```bash
# Tìm kiếm hợp lệ với tất cả tham số
curl -s -X GET "http://localhost:8788/api/zod_demo/search?query=test&page=1&limit=10&sort_by=date&sort_order=desc" | jq .

# Tìm kiếm với tham số tối thiểu (sử dụng giá trị mặc định)
curl -s -X GET "http://localhost:8788/api/zod_demo/search?query=example" | jq .

# Tham số tìm kiếm không hợp lệ - hiển thị lỗi xác thực
curl -s -X GET "http://localhost:8788/api/zod_demo/search?query=&page=-1&limit=1000&sort_by=invalid&sort_order=wrong" | jq .
```

### Demo Upload File
```bash
# Demo upload file hợp lệ
curl -s -X POST http://localhost:8788/api/zod_demo/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "tai-lieu.pdf",
    "file_size": 1024000,
    "description": "Tài liệu quan trọng"
  }' | jq .

# Upload file với dữ liệu tối thiểu
curl -s -X POST http://localhost:8788/api/zod_demo/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "hinh-anh.jpg",
    "file_size": 512000
  }' | jq .

# Upload file không hợp lệ - hiển thị lỗi xác thực
curl -s -X POST http://localhost:8788/api/zod_demo/upload \
  -H "Content-Type: application/json" \
  -d '{
    "file_name": "",
    "file_size": -1,
    "description": ""
  }' | jq .
```

## 🔧 Khắc Phục Sự Cố

### Trích Xuất Token Nhanh

#### Trích Xuất Token Với Bash
```bash
# Trích xuất token tự động
export SUPER_ADMIN_TOKEN=$(curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test-superadmin@example.com","password":"password123"}' | \
  grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

export ADMIN_TOKEN=$(curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test-admin@example.com","password":"password123"}' | \
  grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

export USER_TOKEN=$(curl -s -X POST http://localhost:8788/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test-user@example.com","password":"password123"}' | \
  grep -o '"access_token":"[^"]*"' | cut -d'"' -f4)

# Xác minh tokens
echo "Super Admin Token: $SUPER_ADMIN_TOKEN"
echo "Admin Token: $ADMIN_TOKEN"  
echo "User Token: $USER_TOKEN"
```

### Kiểm Thử Vai Trò Nhanh
```bash
# Kiểm thử tất cả vai trò với một lệnh
echo "=== Kiểm thử Super Admin ==="
curl -s -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" http://localhost:8788/api/admin/users | jq .

echo "=== Kiểm thử Admin ==="
curl -s -H "Authorization: Bearer $ADMIN_TOKEN" http://localhost:8788/api/admin/users | jq .

echo "=== Kiểm thử User ==="
curl -s -H "Authorization: Bearer $USER_TOKEN" http://localhost:8788/api/admin/users | jq .
```

### Các Vấn Đề Thường Gặp

#### Server Không Chạy
```bash
# Kiểm tra nếu server đang chạy
curl -s http://localhost:8788/api/health

# Khởi động test server nếu cần
npm run dev:test

# Khởi động với chế độ debug
npm run dev:test:debug
```

#### Vấn Đề Database
```bash
# Khởi tạo database kiểm thử
npm run test:initdb

# Reset database và tạo lại test users
npm run db:reset:test
node tests/utils/createTestAdminUsers.js

# Kiểm tra trạng thái migration database
npm run db:status:test
```

#### Thiếu Test Users
```bash
# Tạo test users
node tests/utils/createTestAdminUsers.js

# Hoặc sử dụng service
node tests/utils/createTestAdminUsersService.js

# Thiết lập dữ liệu kiểm thử toàn diện
node tests/utils/setupTestUsers.js
```

#### Vấn Đề Môi Trường Kiểm Thử
```bash
# Chạy kiểm thử theo môi trường cụ thể
npm run test:quick          # Kiểm thử khói nhanh
npm run test:system         # Kiểm tra sức khỏe hệ thống
npm run test:auth           # Kiểm thử xác thực

# Menu kiểm thử tương tác với 30+ bộ kiểm thử
npm run test
# hoặc
node tests/mainMenu.js

# Bộ kiểm thử tự động hoàn chỉnh
bash tests/scripts/run-all-tests.sh

# Bộ kiểm thử tự động nhanh (output tối thiểu)
bash tests/scripts/run-all-tests-quick.sh
```

#### Vấn Đề Kiểm Thử Theo Vai Trò
```bash
# Kiểm thử vai trò cụ thể
npm run test:regular_user
npm run test:admin_user  
npm run test:super_admin_user

# Kiểm thử tất cả vai trò cùng lúc
bash tests/scripts/test_all_roles.sh

# Kiểm thử RBAC cụ thể
bash tests/scripts/test-rbac.sh
```

#### Vấn Đề Debug và Giám Sát
```bash
# Bật chế độ debug
bash tests/scripts/test-debug.sh

# Kiểm tra cấu hình KV
npm run test:kv_admin

# Kiểm thử hệ thống audit
npm run test:audit:system
npm run test:audit:simple
```

#### Vấn Đề i18n và Localization
```bash
# Kiểm thử dịch thuật
npm run test:i18n

# Kiểm thử validation đa ngôn ngữ
npm run test:multilang_validation

# Kiểm thử i18n validator extensions
node tests/i18nValidatorExtensionTest.js
```

#### Vấn Đề Hiệu Suất và Load Testing
```bash
# Kiểm thử hiệu suất
npm run test:performance

# Kiểm thử hiệu suất audit  
npm run test:audit:perf

# Kiểm thử service tối ưu hóa
npm run test:optimized
```

#### Tính Năng Kiểm Thử Nâng Cao
```bash
# Kiểm thử bảo mật
npm run test:security
npm run test:xss:all
npm run test:security:incident

# Kiểm thử validation
npm run test:validation
npm run test:zod_validation

# Kiểm thử xử lý lỗi
npm run test:error

# Kiểm thử tích hợp
npm run test:integration
```

## 📋 Tóm Tắt Kết Quả Mong Đợi

### Ma Trận Quyền Vai Trò

| Hành Động | User | Admin | Super Admin |
|-----------|------|-------|-------------|
| **Xem hồ sơ của mình** | ✅ | ✅ | ✅ |
| **Cập nhật hồ sơ của mình** | ✅ | ✅ | ✅ |
| **Xem danh sách user** | ❌ | ✅ (đã lọc) | ✅ (tất cả) |
| **Xem chi tiết Super Admin** | ❌ | ❌ | ✅ |
| **Tạo regular user** | ❌ | ✅ | ✅ |
| **Tạo admin user** | ❌ | ✅ | ✅ |
| **Tạo Super Admin** | ❌ | ❌ | ✅ |
| **Xóa regular user** | ❌ | ✅ | ✅ |
| **Xóa admin user** | ❌ | ✅ | ✅ |
| **Xóa Super Admin** | ❌ | ❌ | ✅ |
| **Thay đổi vai trò user ↔ admin** | ❌ | ✅ | ✅ |
| **Thay đổi vai trò thành Super Admin** | ❌ | ❌ | ✅ |
| **Xóa tài khoản của mình** | ❌ | ❌ | ❌ |
| **Thay đổi vai trò của mình** | ❌ | ❌ | ❌ |

### Biện Pháp An Toàn
- **Tự bảo vệ**: Không user nào có thể xóa tài khoản của chính mình
- **Bảo vệ vai trò**: Không user nào có thể thay đổi vai trò của chính mình
- **Thực thi thứ bậc**: Admin không thể quản lý Super Admin
- **Lọc dữ liệu**: Admin không thể thấy dữ liệu Super Admin
- **Validation input**: Tất cả input được validate với Zod schemas

---

## 📊 **KIỂM THỬ 4 ROUTES AUDIT CHÍNH**

### **🔍 1. Core Audit Routes (/api/audit/)**

#### **Lấy Audit Logs với Filtering**
```bash
# Lấy logs cơ bản
curl -s -X GET http://localhost:8788/api/audit/logs \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Lấy logs với pagination và filtering
curl -s -X GET "http://localhost:8788/api/audit/logs?page=1&limit=10&action=LOGIN_SUCCESS" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Filtering theo thời gian
curl -s -X GET "http://localhost:8788/api/audit/logs?startDate=2025-07-20&endDate=2025-07-21" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Tìm Kiếm Full-text trong Audit Logs**
```bash
# Tìm kiếm cơ bản
curl -s -X GET "http://localhost:8788/api/audit/search?query=login&limit=10" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Tìm kiếm với filters phức tạp
curl -s -X GET "http://localhost:8788/api/audit/search?query=failed&action=LOGIN_FAILED&limit=5" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Thống Kê Audit**
```bash
# Thống kê tổng quan
curl -s -X GET http://localhost:8788/api/audit/stats \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Thống kê theo thời gian
curl -s -X GET "http://localhost:8788/api/audit/stats?timeRange=7d&groupBy=action" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Xuất Dữ liệu Audit**
```bash
# Xuất ra CSV
curl -s -X GET "http://localhost:8788/api/audit/export?format=csv&startDate=2025-07-20" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -o audit_logs.csv

# Xuất ra JSON có nén
curl -s -X GET "http://localhost:8788/api/audit/export?format=json&compress=true" \
  -H "Authorization: Bearer $ADMIN_TOKEN" -o audit_logs.json.gz
```

#### **Kiểm Tra Sức Khỏe Hệ Thống**
```bash
# Sức khỏe hệ thống audit
curl -s -X GET http://localhost:8788/api/audit/system-health \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

### **📈 2. Advanced Analytics Routes (/api/advanced-audit/)** (Chỉ Super Admin)

#### **Dashboard Analytics**
```bash
# Dashboard analytics chính
curl -s -X GET http://localhost:8788/api/advanced-audit/analytics \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Analytics với khoảng thời gian tùy chỉnh
curl -s -X GET "http://localhost:8788/api/advanced-audit/analytics?period=30d&metrics=all" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Phân Tích Xu Hướng**
```bash
# Xu hướng sử dụng
curl -s -X GET http://localhost:8788/api/advanced-audit/trends \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Xu hướng metric cụ thể
curl -s -X GET "http://localhost:8788/api/advanced-audit/trends?metric=login_attempts&period=7d" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Báo Cáo Toàn Diện**
```bash
# Báo cáo hệ thống đầy đủ
curl -s -X GET http://localhost:8788/api/advanced-audit/reports \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Báo cáo tùy chỉnh với filters
curl -s -X GET "http://localhost:8788/api/advanced-audit/reports?type=security&format=detailed" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Metrics Hiệu Suất**
```bash
# Metrics hiệu suất hệ thống
curl -s -X GET http://localhost:8788/api/advanced-audit/performance-metrics \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Metrics hiệu suất với khoảng thời gian
curl -s -X GET "http://localhost:8788/api/advanced-audit/performance-metrics?hours=24&detailed=true" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Phân Tích Hoạt Động Người Dùng**
```bash
# Patterns hoạt động người dùng
curl -s -X GET http://localhost:8788/api/advanced-audit/user-activity-analysis \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Phân tích người dùng cụ thể
curl -s -X GET "http://localhost:8788/api/advanced-audit/user-activity-analysis?userId=4&days=7" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Phân Tích Bảo Mật**
```bash
# Phân tích sự kiện bảo mật
curl -s -X GET http://localhost:8788/api/advanced-audit/security-analysis \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Phân tích phát hiện mối đe dọa
curl -s -X GET "http://localhost:8788/api/advanced-audit/security-analysis?type=threats&severity=high" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Báo Cáo Tuân Thủ**
```bash
# Tổng quan tuân thủ
curl -s -X GET http://localhost:8788/api/advanced-audit/compliance-reports \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Tiêu chuẩn tuân thủ cụ thể
curl -s -X GET "http://localhost:8788/api/advanced-audit/compliance-reports?standard=gdpr&period=quarter" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

### **🔴 3. Real-time Monitoring Routes (/api/realtime-monitoring/)** (Chỉ Super Admin)

#### **Live Activity Feed**
```bash
# Hoạt động trực tiếp hiện tại
curl -s -X GET http://localhost:8788/api/realtime-monitoring/live-activity \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Hoạt động trực tiếp với filters
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/live-activity?type=login&limit=20" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Active Sessions**
```bash
# Tất cả sessions người dùng đang hoạt động
curl -s -X GET http://localhost:8788/api/realtime-monitoring/active-sessions \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Sessions theo vai trò
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/active-sessions?role=admin&details=true" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **System Alerts**
```bash
# Cảnh báo hệ thống hiện tại
curl -s -X GET http://localhost:8788/api/realtime-monitoring/system-alerts \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Cảnh báo đã lọc
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/system-alerts?severity=critical&unread=true" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Performance Monitoring**
```bash
# Hiệu suất thời gian thực
curl -s -X GET http://localhost:8788/api/realtime-monitoring/performance-monitor \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Hiệu suất với metrics
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/performance-monitor?metrics=cpu,memory,db" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Security Monitoring**
```bash
# Giám sát sự kiện bảo mật
curl -s -X GET http://localhost:8788/api/realtime-monitoring/security-monitor \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Giám sát bảo mật với filters
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/security-monitor?events=suspicious&minutes=30" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Resource Usage**
```bash
# Sử dụng tài nguyên hiện tại
curl -s -X GET http://localhost:8788/api/realtime-monitoring/resource-usage \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Phân tích tài nguyên chi tiết
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/resource-usage?breakdown=detailed&history=1h" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Error Tracking**
```bash
# Tracking lỗi gần đây
curl -s -X GET http://localhost:8788/api/realtime-monitoring/error-tracking \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

# Error tracking với mức độ nghiêm trọng
curl -s -X GET "http://localhost:8788/api/realtime-monitoring/error-tracking?severity=error&hours=2" \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

### **🚨 4. Security Incident Routes (/api/security-incident/)** (Yêu Cầu Admin+)

#### **Quản Lý Security Incidents**
```bash
# Liệt kê tất cả incidents
curl -s -X GET http://localhost:8788/api/security-incident/incidents \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Incidents đã lọc
curl -s -X GET "http://localhost:8788/api/security-incident/incidents?status=open&severity=high" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Tạo Security Incident**
```bash
# Tạo incident mới
curl -s -X POST http://localhost:8788/api/security-incident/incidents \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "title": "Các Lần Thử Đăng Nhập Đáng Ngờ",
    "description": "Phát hiện nhiều lần thử đăng nhập thất bại",
    "severity": "medium",
    "type": "login_abuse",
    "affected_resources": ["user_accounts"],
    "reporter_notes": "IP 192.168.1.100 đã thử 50+ lần đăng nhập thất bại"
  }' | jq .
```

#### **Lấy Incident Cụ Thể**
```bash
# Lấy chi tiết incident
curl -s -X GET http://localhost:8788/api/security-incident/incidents/1 \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Cập Nhật Security Incident**
```bash
# Cập nhật trạng thái incident
curl -s -X PUT http://localhost:8788/api/security-incident/incidents/1 \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "status": "investigating",
    "assigned_to": "security_team",
    "resolution_notes": "Đang điều tra patterns IP và hành vi người dùng"
  }' | jq .
```

#### **Loại Incidents**
```bash
# Lấy các loại incident có sẵn
curl -s -X GET http://localhost:8788/api/security-incident/incident-types \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Quy Trình Phản Hồi**
```bash
# Lấy quy trình phản hồi incident
curl -s -X GET http://localhost:8788/api/security-incident/response-procedures \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Quy trình cụ thể
curl -s -X GET "http://localhost:8788/api/security-incident/response-procedures?type=data_breach" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Phân Tích Mối Đe Dọa**
```bash
# Phân tích mối đe dọa bảo mật
curl -s -X GET http://localhost:8788/api/security-incident/threat-analysis \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Phân tích mối đe dọa cụ thể
curl -s -X GET "http://localhost:8788/api/security-incident/threat-analysis?period=7d&type=login_attacks" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Báo Cáo Incidents**
```bash
# Tạo báo cáo incident
curl -s -X GET http://localhost:8788/api/security-incident/incident-reports \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Tóm tắt incident hàng tháng
curl -s -X GET "http://localhost:8788/api/security-incident/incident-reports?period=month&format=summary" \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Tạo Cảnh Báo Incident**
```bash
# Tạo cảnh báo incident
curl -s -X POST http://localhost:8788/api/security-incident/incident-alerts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -d '{
    "incident_id": 1,
    "alert_type": "email",
    "recipients": ["security@company.com"],
    "priority": "high",
    "message": "Incident bảo mật nghiêm trọng cần xử lý ngay lập tức"
  }' | jq .
```

### **🛡️ Kiểm Thử Audit Dựa Trên Vai Trò**

#### **Kiểm Thử Vai Trò Admin với Audit**
```bash
# Admin có thể truy cập core audit
curl -s -X GET http://localhost:8788/api/audit/logs \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Admin KHÔNG THỂ truy cập advanced analytics (nên trả về 403)
curl -s -X GET http://localhost:8788/api/advanced-audit/analytics \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Admin KHÔNG THỂ truy cập real-time monitoring (nên trả về 403)
curl -s -X GET http://localhost:8788/api/realtime-monitoring/live-activity \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .

# Admin CÓ THỂ truy cập security incidents
curl -s -X GET http://localhost:8788/api/security-incident/incidents \
  -H "Authorization: Bearer $ADMIN_TOKEN" | jq .
```

#### **Kiểm Thử Vai Trò Super Admin với Audit**
```bash
# Super Admin có thể truy cập TẤT CẢ audit endpoints
curl -s -X GET http://localhost:8788/api/audit/logs \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/advanced-audit/analytics \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/realtime-monitoring/live-activity \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/security-incident/incidents \
  -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq .
```

#### **Kiểm Thử Vai Trò User với Audit (Tất Cả Nên Trả Về 403)**
```bash
# Regular users nên bị từ chối truy cập TẤT CẢ audit endpoints
curl -s -X GET http://localhost:8788/api/audit/logs \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/advanced-audit/analytics \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/realtime-monitoring/live-activity \
  -H "Authorization: Bearer $USER_TOKEN" | jq .

curl -s -X GET http://localhost:8788/api/security-incident/incidents \
  -H "Authorization: Bearer $USER_TOKEN" | jq .
```

### **🔄 Chuỗi Kiểm Thử Hệ Thống Audit Hoàn Chỉnh**
```bash
# Chuỗi kiểm thử hoàn chỉnh cho tất cả nhóm audit routes
echo "=== Kiểm thử Core Audit (Admin Access) ==="
curl -s -X GET http://localhost:8788/api/audit/logs -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.success'

echo "=== Kiểm thử Advanced Analytics (Chỉ Super Admin) ==="
curl -s -X GET http://localhost:8788/api/advanced-audit/analytics -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq '.success'

echo "=== Kiểm thử Real-time Monitoring (Chỉ Super Admin) ==="
curl -s -X GET http://localhost:8788/api/realtime-monitoring/live-activity -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" | jq '.success'

echo "=== Kiểm thử Security Incidents (Admin+ Access) ==="
curl -s -X GET http://localhost:8788/api/security-incident/incidents -H "Authorization: Bearer $ADMIN_TOKEN" | jq '.success'

echo "=== Kiểm thử User Denial (Tất Cả Nên Thất Bại) ==="
curl -s -X GET http://localhost:8788/api/audit/logs -H "Authorization: Bearer $USER_TOKEN" | jq '.success // false'
```

---

## 🎯 Lệnh Kiểm Thử Nhanh

Để kiểm thử nhanh, sử dụng các lệnh một dòng này:

```bash
# Đăng nhập nhanh và kiểm thử
curl -s -X POST http://localhost:8788/api/auth/login -H "Content-Type: application/json" -d '{"email":"test-admin@example.com","password":"password123"}' | jq -r '.data.access_token' | xargs -I {} curl -s -H "Authorization: Bearer {}" http://localhost:8788/api/admin/users | jq .

# Kiểm thử ranh giới vai trò theo sequence
for role in user admin superadmin; do echo "=== Kiểm thử $role ===" && curl -s -X POST http://localhost:8788/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"test-${role}@example.com\",\"password\":\"password123\"}" | jq -r '.data.access_token' | xargs -I {} curl -s -H "Authorization: Bearer {}" http://localhost:8788/api/admin/users | jq .; done
```

Hướng dẫn toàn diện này bao gồm tất cả các khía cạnh kiểm thử RBAC cho hệ thống Hono Auth Worker. Sử dụng những lệnh này để validate tính bảo mật và chức năng của hệ thống xác thực của bạn.
