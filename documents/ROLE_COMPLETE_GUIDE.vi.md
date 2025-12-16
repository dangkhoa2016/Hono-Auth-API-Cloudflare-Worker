# Hướng Dẫn Toàn Diện Hệ Thống Quản Lý Vai Trò

> 🌐 Language / Ngôn ngữ: [English](ROLE_COMPLETE_GUIDE.md) | **Tiếng Việt**

## Tổng Quan

Hệ thống quản lý vai trò và admin của dự án được thiết kế để cung cấp một giải pháp toàn diện cho việc quản lý người dùng và phân quyền với hỗ trợ quốc tế hóa đầy đủ. Hệ thống bao gồm:

1. **Hệ Thống Quản Lý Vai Trò**: Hệ thống quản lý vai trò tập trung, linh hoạt
2. **Admin API**: API quản lý người dùng với phân quyền dựa trên vai trò và i18n validation
3. **Hệ Thống Phân Quyền**: Hệ thống phân quyền dựa trên vai trò và phân cấp
4. **Tính Năng Bảo Mật**: Bảo mật và kiểm soát truy cập nghiêm ngặt với bảo vệ XSS
5. **Tích Hợp I18n**: Hỗ trợ đa ngôn ngữ đầy đủ với 7 ngôn ngữ (en, vi, fr, es, de, ja, th)
6. **Validation Nâng Cao**: Validation được cải tiến với intelligent caching và performance monitoring

## I. Hệ Thống Quản Lý Vai Trò

### 1. Hệ Thống Constants Tập Trung

**Tập tin chính:** `src/constants/roles.js`

Tập trung tất cả định nghĩa về vai trò, quyền hạn, và trạng thái người dùng:

```javascript
// Định nghĩa vai trò
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin', 
  SUPER_ADMIN: 'super_admin'
};

// Định nghĩa trạng thái người dùng
export const USER_STATUSES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

// Phân cấp vai trò
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.ADMIN]: 2,
  [ROLES.SUPER_ADMIN]: 3
};

// Constants đặc biệt
export const SUPER_ADMIN_USER_ID = 1;
export const DEFAULT_USER_ROLE = ROLES.USER;
export const DEFAULT_USER_STATUS = USER_STATUSES.ACTIVE;
```

### 2. Hệ Thống Phân Quyền

Mỗi vai trò có một bộ quyền hạn được định nghĩa trong `ROLE_PERMISSIONS`:

```javascript
export const ROLE_PERMISSIONS = {
  [ROLES.USER]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: false,
    canViewAllUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canChangeRoles: false,
    canViewSuperAdminData: false,
    canAccessAdminRoutes: false,
  },
  [ROLES.ADMIN]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: true,
    canViewAllUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canChangeRoles: true,
    canViewSuperAdminData: false,
    canAccessAdminRoutes: true,
  },
  [ROLES.SUPER_ADMIN]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: true,
    canViewAllUsers: true,
    canCreateUsers: true,
    canEditUsers: true,
    canDeleteUsers: true,
    canChangeRoles: true,
    canViewSuperAdminData: true,
    canAccessAdminRoutes: true,
  }
};
```

### 3. Các Hàm Tiện Ích

```javascript
getAllRoles()                           // ['user', 'admin', 'super_admin']
getAllUserStatuses()                    // ['active', 'inactive', 'suspended']
isValidRole(role)                       // boolean
getRoleLevel(role)                      // number (mức phân cấp)
hasHigherOrEqualRole(role1, role2)      // boolean
hasPermission(role, permission)         // boolean
canManageUser(userRole, targetRole, userId, targetId) // {canManage, reason}
getRolesLowerOrEqual(role)              // mảng các vai trò có thể quản lý
```

## II. Tài Liệu Admin API

### Cấu Trúc Route

Tất cả admin endpoints đều dưới prefix `/api/admin`:

```
GET /api/admin/users              → Lấy danh sách user (được lọc theo vai trò)
GET /api/admin/users/:id          → Lấy chi tiết user
POST /api/admin/users             → Tạo user mới
PUT /api/admin/users/:id          → Cập nhật user (không thay đổi vai trò)
DELETE /api/admin/users/:id       → Xóa user (bị hạn chế theo vai trò)
PUT /api/admin/users/:id/role     → Thay đổi vai trò user (áp dụng phân cấp vai trò)
GET /api/admin/stats              → Thống kê hệ thống
```

### Xác Thực & Phân Quyền

Tất cả admin endpoints yêu cầu:
1. **Xác Thực**: Valid JWT access token
2. **Phân Quyền**: Quyền hạn vai trò phù hợp

### Ma Trận Quyền Hạn Vai Trò Được Cập Nhật

| Endpoint | User | Admin | Super Admin | Ghi Chú |
|----------|------|-------|-------------|---------|
| `GET /api/admin/users` | ❌ | ✅ | ✅ | Admin: chỉ vai trò admin/user |
| `GET /api/admin/users/:id` | ❌ | ✅* | ✅ | Admin: dữ liệu riêng hoặc user có thể truy cập |
| `POST /api/admin/users` | ❌ | ✅** | ✅ | Admin: không thể tạo admin/super_admin |
| `PUT /api/admin/users/:id` | ❌ | ✅* | ✅ | Tham số vai trò bị bỏ qua/xóa |
| `DELETE /api/admin/users/:id` | ❌ | ✅* | ✅ | Admin: chỉ vai trò admin/user |
| `PUT /api/admin/users/:id/role` | ❌ | ✅*** | ✅ | Admin: áp dụng hạn chế phân cấp vai trò |
| `GET /api/admin/stats` | ❌ | ✅ | ✅ | Thống kê hệ thống |
| `GET /api/admin/dashboard` | ❌ | ✅ | ✅ | Bảng điều khiển admin |
| `GET /api/admin/system-health` | ❌ | ✅ | ✅ | Kiểm tra sức khỏe hệ thống |

**Chú thích:**
- ✅ = Được phép
- ❌ = Không được phép  
- `*` = Truy cập bị hạn chế (xem ghi chú)
- `**` = Khả năng hạn chế (xem ghi chú)
- `***` = Áp dụng hạn chế phân cấp vai trò (xem ghi chú)

## III. API Endpoints Chi Tiết

### 1. Lấy Danh Sách Users

**Endpoint:** `GET /api/admin/users`  
**Quyền Hạn:** Admin hoặc Super Admin  
**Mô Tả:** Lấy danh sách phân trang của tất cả users với tùy chọn lọc

#### Tham Số Query

| Tham Số | Loại | Mặc Định | Mô Tả |
|---------|------|----------|-------|
| `page` | integer | 1 | Số trang (phải > 0) |
| `limit` | integer | 10 | Số item mỗi trang (tối đa 100) |
| `role` | string | - | Lọc theo vai trò: user, admin, super_admin |
| `status` | string | - | Lọc theo trạng thái: active, inactive, suspended |
| `search` | string | - | Tìm kiếm trong full_name và email |

#### Lọc Dựa Trên Vai Trò (Tính Năng Quan Trọng)

**Hành Vi Vai Trò Người Dùng Admin:**
- Chỉ có thể xem users với vai trò: `admin`, `user`
- Nếu request `?role=super_admin`, trả về kết quả rỗng
- Nếu không có bộ lọc vai trò, tự động lọc để chỉ hiển thị vai trò `admin` và `user`

**Hành Vi Vai Trò Người Dùng Super Admin:**
- Có thể xem tất cả users bất kể vai trò
- Không có hạn chế lọc
- Nhìn thấy toàn bộ hệ thống

#### Phản Hồi

```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "full_name": "John Doe",
        "email": "john@example.com",
        "role": "user",
        "status": "active",
        "created_at": "2025-01-01T00:00:00Z",
        "updated_at": "2025-01-01T00:00:00Z"
      }
    ],
    "pagination": {
      "total": 50,
      "page": 1,
      "limit": 10,
      "totalPages": 5
    }
  },
  "message": "Danh sách users đã được lấy thành công"
}
```

### 2. Tạo User

**Endpoint:** `POST /api/admin/users`  
**Quyền Hạn:** Admin hoặc Super Admin  
**Mô Tả:** Tạo tài khoản user mới

#### Quy Tắc Quyền Hạn (Bảo Mật Quan Trọng)

**Hạn Chế Admin:**
- ❌ Không thể tạo users với vai trò `super_admin` (403 Forbidden)
- ❌ Không thể tạo users với vai trò `admin` (403 Forbidden)  
- ✅ Chỉ có thể tạo users với vai trò `user`

**Khả Năng Super Admin:**
- ✅ Có thể tạo users với bất kỳ vai trò nào (`user`, `admin`, `super_admin`)
- ✅ Không có hạn chế về phân công vai trò

#### Request Body

```json
{
  "full_name": "John Doe",
  "email": "john@example.com",
  "password": "securepassword123",
  "role": "user",
  "status": "active"
}
```

#### Quy Tắc Validation

- `full_name`: Bắt buộc, 1-100 ký tự
- `email`: Bắt buộc, định dạng email hợp lệ, tối đa 255 ký tự, phải duy nhất
- `password`: Bắt buộc, 6-100 ký tự
- `role`: Tùy chọn, enum: user (mặc định), admin, super_admin
- `status`: Tùy chọn, enum: active (mặc định), inactive, suspended

### 3. Cập Nhật User (Bảo Mật Được Tăng Cường)

**Endpoint:** `PUT /api/admin/users/:id`  
**Quyền Hạn:** Admin (bị hạn chế) hoặc Super Admin  
**Mô Tả:** Cập nhật thông tin user (loại trừ thay đổi vai trò)

🚨 **Tham Số Vai Trò Đã Bị Xóa**: Endpoint này không còn chấp nhận tham số `role`. Thay đổi vai trò phải sử dụng endpoint chuyên dụng `/api/admin/users/:id/role`.

#### Các Trường Có Sẵn

| Trường | Loại | Mô Tả | Admin | Super Admin |
|--------|------|-------|-------|-------------|
| `full_name` | string | Tên đầy đủ của user (1-100 ký tự) | ✅ | ✅ |
| `email` | string | Địa chỉ email (phải duy nhất) | ✅ | ✅ |
| `status` | enum | active, inactive, suspended | ✅ | ✅ |
| ~~`role`~~ | ~~enum~~ | ~~Đã xóa khỏi endpoint này~~ | ❌ | ❌ |

#### Tính Năng Bảo Mật

- **Tham Số Vai Trò Bị Bỏ Qua**: Nếu `role` được bao gồm trong request, nó sẽ tự động bị xóa
- **Không Có Privilege Escalation**: Không thể thay đổi vai trò user qua endpoint này
- **Cập Nhật An Toàn**: Chỉ dữ liệu profile có thể được sửa đổi

### 4. Thay Đổi Vai Trò User

**Endpoint:** `PUT /api/admin/users/:id/role`  
**Quyền Hạn:** Admin (với hạn chế) hoặc Super Admin  
**Mô Tả:** Thay đổi vai trò của user (tách biệt khỏi cập nhật thường để bảo mật)

#### Tính Năng Bảo Mật

- **Áp Dụng Phân Cấp Vai Trò**: Users chỉ có thể thăng cấp lên vai trò ≤ mức của họ
- **Endpoint Chuyên Dụng**: Thay đổi vai trò được tách biệt khỏi cập nhật thường  
- **Tự Bảo Vệ**: Không thể thay đổi vai trò của chính mình
- **Bảo Vệ User Mục Tiêu**: Không thể sửa đổi users có vai trò cao hơn

#### Quy Tắc Quyền Hạn

**Khả Năng Admin:**
- ✅ Có thể thay đổi vai trò user thành: `user`, `admin`
- ❌ Không thể tạo hoặc thăng cấp lên vai trò `super_admin`
- ❌ Không thể sửa đổi users `super_admin`
- ❌ Không thể thay đổi vai trò của chính mình

**Khả Năng Super Admin:**
- ✅ Có thể thay đổi bất kỳ vai trò nào thành bất kỳ vai trò nào (`user`, `admin`, `super_admin`)
- ✅ Có thể sửa đổi bất kỳ user nào (bao gồm super_admins khác)
- ❌ Không thể thay đổi vai trò của chính mình

#### Validation Phân Cấp Vai Trò

Hệ thống áp dụng phân cấp vai trò trong quá trình thay đổi vai trò:

```javascript
// Admin (cấp 2) có thể quản lý:
- user (cấp 1) ✅
- admin (cấp 2) ✅ 
- super_admin (cấp 3) ❌

// Super Admin (cấp 3) có thể quản lý:
- user (cấp 1) ✅
- admin (cấp 2) ✅
- super_admin (cấp 3) ✅
```

#### Request Body

```json
{
  "role": "admin"
}
```

### 5. Xóa User

**Endpoint:** `DELETE /api/admin/users/:id`  
**Quyền Hạn:** Admin (hạn chế) hoặc Super Admin (truy cập đầy đủ)  
**Mô Tả:** Xóa vĩnh viễn tài khoản user

#### Quy Tắc Quyền Hạn

- **Người dùng Admin**: Có thể xóa users với vai trò `user` hoặc `admin`, nhưng KHÔNG phải `super_admin`
- **Người dùng Super Admin**: Có thể xóa bất kỳ user nào trừ chính họ
- **Hạn Chế**: 
  - Không thể xóa users super_admin (hạn chế Admin)
  - Không thể xóa tài khoản của chính mình
  - Không thể xóa user với ID 1 (bảo vệ super_admin)

### 6. Lấy Thống Kê Hệ Thống

**Endpoint:** `GET /api/admin/stats`  
**Quyền Hạn:** Admin hoặc Super Admin  
**Mô Tả:** Lấy thống kê và chỉ số hệ thống

#### Phản Hồi

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 120,
    "inactiveUsers": 20,
    "suspendedUsers": 10,
    "usersByRole": {
      "user": 140,
      "admin": 8,
      "super_admin": 2
    },
    "recentRegistrations": 15
  },
  "message": "Thống kê hệ thống đã được lấy thành công"
}
```

### 7. Lấy Bảng Điều Khiển Admin

**Endpoint:** `GET /api/admin/dashboard`  
**Quyền Hạn:** Admin hoặc Super Admin  
**Mô Tả:** Lấy dữ liệu bảng điều khiển toàn diện với lọc dựa trên vai trò

#### Quy Tắc Quyền Hạn

- **Người dùng Admin**: Lấy dữ liệu bảng điều khiển hạn chế (loại trừ thông tin super_admin)
- **Người dùng Super Admin**: Lấy dữ liệu bảng điều khiển đầy đủ bao gồm tất cả vai trò

#### Phản Hồi

```json
{
  "success": true,
  "data": {
    "totalUsers": 150,
    "activeUsers": 120,
    "inactiveUsers": 20,
    "suspendedUsers": 10,
    "usersByRole": {
      "user": 140,
      "admin": 8,
      "super_admin": 2
    },
    "recentRegistrations": 15,
    "systemHealth": "healthy",
    "lastBackup": "2024-01-15T10:30:00.000Z"
  },
  "message": "Bảng điều khiển admin đã được lấy thành công"
}
```

### 8. Kiểm Tra Sức Khỏe Hệ Thống

**Endpoint:** `GET /api/admin/system-health`  
**Quyền Hạn:** Admin hoặc Super Admin  
**Mô Tả:** Kiểm tra sức khỏe hệ thống toàn diện với chỉ số hiệu suất và bảo mật

#### Tính Năng

- **Sức Khỏe Database**: Trạng thái kết nối và chỉ số hiệu suất
- **Giám Sát Hiệu Suất**: Thời gian phản hồi và hiệu suất hệ thống
- **Đánh Giá Bảo Mật**: Các lần đăng nhập thất bại và phân tích rủi ro
- **Dữ Liệu Dựa Trên Vai Trò**: Super Admins thấy dữ liệu đầy đủ, admins thấy dữ liệu được lọc

#### Phản Hồi

```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2024-01-15T10:30:00.000Z",
    "responseTime": "150ms",
    "environment": "development",
    "database": {
      "isConnected": true,
      "info": {
        "version": "3.42.0",
        "pragma": "foreign_keys=ON"
      },
      "metrics": {
        "performance": {
          "queryResponseTime": "5ms",
          "isResponsive": true,
          "testQuerySuccess": true
        },
        "security": {
          "recentFailures1h": 2,
          "totalFailedAttempts": 15,
          "uniqueIpsWithFailures": 3
        }
      }
    },
    "system": {
      "statistics": {
        "totalUsers": 150,
        "activeUsers": 120,
        "usersByRole": {
          "user": 140,
          "admin": 8,
          "super_admin": 2
        }
      },
      "performance": {
        "responseTime": "150ms",
        "databaseResponseTime": "5ms",
        "isPerformant": true,
        "performanceGrade": "excellent"
      },
      "security": {
        "recentFailedLogins": 2,
        "totalFailedAttempts": 15,
        "uniqueIpsWithFailures": 3,
        "riskLevel": "low"
      }
    },
    "healthChecks": {
      "database": "pass",
      "performance": "pass",
      "security": "pass"
    },
    "metadata": {
      "checkedBy": {
        "userId": 123,
        "role": "admin"
      },
      "accessLevel": "limited",
      "canViewSuperAdminData": false
    }
  },
  "message": "Sức khỏe hệ thống đã được lấy thành công"
}
```

## IV. Kiến Trúc Triển Khai

### Cấu Trúc Tập Tin

```
src/
├── constants/
│   └── roles.js          # 🆕 Quản lý vai trò tập trung
├── middleware/
│   └── authorization.js  # ✅ Đã cập nhật để sử dụng role constants
├── services/
│   └── userService.js    # ✅ Đã cập nhật để sử dụng role constants
├── schemas/
│   └── user.js          # ✅ Đã cập nhật để sử dụng validation vai trò động
└── routes/
    └── admin.js         # ✅ Đã cập nhật để sử dụng role constants
```

### Các Tập Tin Đã Được Cập Nhật

#### 1. Authorization Middleware (`src/middleware/authorization.js`)

- ✅ Loại bỏ hard code `'admin'`, `'super_admin'`, `'user'`
- ✅ Sử dụng `ROLES` constants và permission checking
- ✅ Sử dụng `hasPermission()` thay vì so sánh string trực tiếp
- ✅ Sử dụng `SUPER_ADMIN_USER_ID` constant

#### 2. User Schemas (`src/schemas/user.js`)

- ✅ Sử dụng `getAllRoles()` trong Zod validation
- ✅ Sử dụng `getAllUserStatuses()` cho status validation
- ✅ Validation vai trò động với thông báo lỗi tự động

#### 3. Admin Routes (`src/routes/admin.js`)

- ✅ Loại bỏ hard code vai trò trong role change schema
- ✅ Sử dụng `hasHigherOrEqualRole()` cho permission checking
- ✅ Sử dụng `getRolesLowerOrEqual()` cho role filtering
- ✅ Truy cập bảng điều khiển dựa trên quyền hạn

#### 4. User Service (`src/services/userService.js`)

- ✅ Sử dụng `DEFAULT_USER_ROLE` và `DEFAULT_USER_STATUS`
- ✅ Sử dụng `canManageUser()` cho permission checking
- ✅ Sử dụng `ROLES` constants trong database queries
- ✅ Lọc vai trò động trong dữ liệu bảng điều khiển

## V. Ví Dụ Sử Dụng

### 1. Import Role Constants

```javascript
import { 
  ROLES, 
  hasPermission, 
  canManageUser,
  getAllRoles 
} from '../constants/roles.js';
```

### 2. Kiểm Tra Dựa Trên Quyền Hạn

```javascript
// Trước (hard coded)
if (user.role === 'admin' || user.role === 'super_admin') {
  // ...
}

// Sau (dựa trên quyền hạn)
if (hasPermission(user.role, 'canAccessAdminRoutes')) {
  // ...
}
```

### 3. Tạo Schema Zod Động

```javascript
// Trước (hard coded)
role: z.enum(['user', 'admin', 'super_admin'])

// Sau (động)
role: z.enum(getAllRoles(), {
  errorMap: () => ({ message: `Vai trò phải là một trong: ${getAllRoles().join(', ')}` })
})
```

### 4. Kiểm Tra Quản Lý User

```javascript
// Kiểm tra xem user có thể quản lý user khác không
const { canManage, reason } = canManageUser(
  currentUser.role, 
  targetUser.role, 
  currentUser.id, 
  targetUser.id
);

if (!canManage) {
  return errorResponse(reason);
}
```

### 5. Ví Dụ API Request

#### Admin Tạo User (Hạn Chế)

```bash
# Admin tạo regular user (được phép)
curl -X POST "http://localhost:8787/api/admin/users" \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "New User",
       "email": "newuser@example.com", 
       "password": "password123",
       "role": "user"
     }'

# Admin thử tạo admin (không được phép - 403)
curl -X POST "http://localhost:8787/api/admin/users" \
     -H "Authorization: Bearer $ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "New Admin",
       "email": "newadmin@example.com",
       "password": "password123", 
       "role": "admin"
     }'
```

#### Thay Đổi Vai Trò Người Dùng Super Admin

```bash
# Super Admin thay đổi vai trò user
curl -X PUT "http://localhost:8787/api/admin/users/123/role" \
     -H "Authorization: Bearer $SUPER_ADMIN_TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"role": "admin"}'
```

## VI. Cách Thêm Vai Trò Mới

### Bước 1: Thêm Vai Trò Vào Constants

```javascript
// src/constants/roles.js
export const ROLES = {
  USER: 'user',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
  MODERATOR: 'moderator', // 👈 Vai trò mới
  EDITOR: 'editor'        // 👈 Vai trò mới
};

// Cập nhật phân cấp
export const ROLE_HIERARCHY = {
  [ROLES.USER]: 1,
  [ROLES.MODERATOR]: 2,   // 👈 Thêm cấp
  [ROLES.EDITOR]: 3,      // 👈 Thêm cấp
  [ROLES.ADMIN]: 4,       // 👈 Cập nhật cấp
  [ROLES.SUPER_ADMIN]: 5  // 👈 Cập nhật cấp
};
```

### Bước 2: Định Nghĩa Quyền Hạn

```javascript
// src/constants/roles.js
export const ROLE_PERMISSIONS = {
  // ...vai trò hiện có...
  [ROLES.MODERATOR]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: false,
    canViewAllUsers: false,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canChangeRoles: false,
    canViewSuperAdminData: false,
    canAccessAdminRoutes: false,
    canModerateContent: true, // 👈 Quyền hạn riêng
  },
  [ROLES.EDITOR]: {
    canViewOwnProfile: true,
    canEditOwnProfile: true,
    canDeleteOwnAccount: false,
    canViewDashboard: true,
    canViewAllUsers: true,
    canCreateUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canChangeRoles: false,
    canViewSuperAdminData: false,
    canAccessAdminRoutes: true,
    canEditContent: true,     // 👈 Quyền hạn riêng
  }
};
```

### Bước 3: Vai Trò Sẽ Tự Động Hoạt Động

- ✅ Zod validation tự động chấp nhận vai trò mới
- ✅ Permission checking hoạt động ngay lập tức
- ✅ Phân cấp vai trò tự động áp dụng
- ✅ Database queries tự động hỗ trợ

## VII. Phản Hồi Lỗi

### Mã Lỗi Phổ Biến

| Mã | Thông Báo | Mô Tả |
|----|-----------|-------|
| 400 | Bad Request | Dữ liệu đầu vào không hợp lệ hoặc lỗi validation |
| 401 | Unauthorized | Thiếu hoặc token xác thực không hợp lệ |
| 403 | Forbidden | Quyền hạn không đủ cho thao tác |
| 404 | Not Found | User hoặc tài nguyên không tìm thấy |
| 409 | Conflict | Email đã tồn tại hoặc dữ liệu trùng lặp |
| 500 | Internal Server Error | Lỗi phía server |

### Định Dạng Phản Hồi Lỗi

```json
{
  "success": false,
  "error": "Mô tả thông báo lỗi",
  "details": "Chi tiết lỗi bổ sung (tùy chọn)"
}
```


### Chạy Tests

```bash
# Test nhanh
npm run test:quick

# Test kiểm soát truy cập dựa trên vai trò cụ thể
npm run test:role

# Test vai trò người dùng thường
npm run test:regular_user

# Test vai trò người dùng admin
npm run test:admin_user

# Test vai trò người dùng Super Admin
npm run test:super_admin_user

# Bộ test hoàn chỉnh
npm run test:unified
```

### Tài Khoản Test Được Tạo

- **Người dùng Admin**: `test-admin-{timestamp}@example.com` / `admin123`
- **Người dùng Super Admin**: `test-superadmin-{timestamp}@example.com` / `superadmin123`

## IX. Cân Nhắc Bảo Mật

1. **Role-Based Access Control (RBAC)**: Tất cả endpoints áp dụng quyền hạn nghiêm ngặt dựa trên vai trò
2. **Input Validation**: Tất cả đầu vào được validation bằng Zod schemas
3. **Bảo Vệ SQL Injection**: Tất cả database queries sử dụng prepared statements
4. **Rate Limiting**: Cân nhắc triển khai rate limiting cho admin endpoints
5. **Audit Logging**: Tất cả hành động admin nên được log để kiểm toán bảo mật
6. **Token Validation**: JWT tokens được validation ở mỗi request
7. **Tự Bảo Vệ**: Users không thể xóa/sửa đổi chính họ một cách không phù hợp
8. **Bảo Vệ Super Admin**: Bảo vệ đặc biệt cho tài khoản Super Admin

## X. Best Practices

### 1. Luôn Sử Dụng Kiểm Tra Quyền Hạn

```javascript
// ✅ Tốt
if (hasPermission(user.role, 'canDeleteUsers')) {
  // logic xóa
}

// Phương pháp cơ bản (sử dụng constants thay vì hard-coding)
if (user.role === ROLES.ADMIN || user.role === ROLES.SUPER_ADMIN) {
  // logic xóa  
}
```

### 2. Sử Dụng Hàm Quản Lý

```javascript
// ✅ Tốt
const { canManage, reason } = canManageUser(
  currentUser.role, 
  targetUser.role, 
  currentUser.id, 
  targetUser.id
);

if (!canManage) {
  return errorResponse(reason);
}
```

### 3. Tận Dụng Hàm Động

```javascript
// ✅ Tốt - tự động bao gồm vai trò mới
const validRoles = getAllRoles();

// ✅ Tốt - nhận biết phân cấp
const accessibleRoles = getRolesLowerOrEqual(currentUser.role);
```

## XI. Quốc Tế Hóa (i18n)

Tất cả admin endpoints hỗ trợ quốc tế hóa:
- Sử dụng tham số query `?lang=` hoặc header `Accept-Language`
- Thông báo lỗi và thông báo thành công được bản địa hóa
- Ngôn ngữ được hỗ trợ: en, vi, fr, es, de, ja, th

Ví dụ:
```bash
GET /api/admin/users?lang=vi
Accept-Language: vi
```

## XII. Cân Nhắc Hiệu Suất

1. **Phân Trang**: Danh sách user được phân trang để ngăn tải dữ liệu lớn
2. **Indexing**: Đảm bảo indices database trên các trường được truy vấn thường xuyên (email, role, status)
3. **Caching**: Cân nhắc cache thống kê hệ thống để hiệu suất tốt hơn
4. **Tối Ưu Query**: Sử dụng SQL queries hiệu quả với lọc phù hợp
5. **Lọc Vai Trò**: Triển khai lọc dữ liệu dựa trên vai trò hiệu quả

## XIII. Framework Test Vai Trò

Hệ thống đi kèm với bộ test toàn diện để kiểm thử tất cả các chức năng vai trò:

### 1. Các Tập Tin Test Vai Trò

| Vai Trò | Tập Tin Test | Số Tests | Mô Tả |
|---------|-------------|----------|-------|
| **Người dùng thường** | `tests/regularUserTest.js` | 15 tests | Kiểm thử quyền hạn người dùng thường - chỉ profile cá nhân |
| **Người dùng Admin** | `tests/adminUserTest.js` | 9 tests | Kiểm thử chức năng admin - quản lý user/dashboard, không Super Admin |
| **Người dùng Super Admin** | `tests/superAdminUserTest.js` | 12 tests | Kiểm thử toàn quyền - quản lý tất cả users & roles |

### 2. Chạy Test

```bash
# Test từng vai trò riêng lẻ
npm run test:regular_user      # Test vai trò người dùng thường
npm run test:admin_user        # Test vai trò người dùng Admin 
npm run test:super_admin_user  # Test vai trò người dùng Super Admin

# Test tất cả vai trò cùng lúc
npm run test:role              # Test kiểm soát truy cập dựa trên vai trò cụ thể

# Test menu tương tác
npm run test                   # Menu test chính
node tests/mainMenu.js         # Trực tiếp
```

### 3. Test Coverage Vai Trò

**Regular User (15 tests)**:
- ✅ Đăng nhập và xác thực
- ✅ Truy cập profile cá nhân
- ✅ Cập nhật thông tin cá nhân
- ✅ Thay đổi mật khẩu
- ❌ Không truy cập được admin endpoints
- ❌ Không xem được dashboard
- ❌ Không quản lý được users khác

**Admin (9 tests)**:
- ✅ Tất cả quyền của Regular User
- ✅ Truy cập admin dashboard  
- ✅ Quản lý user/admin roles
- ✅ Tạo/sửa/xóa users
- ✅ Xem thống kê hệ thống
- ❌ Không truy cập được super_admin users
- ❌ Không tạo được super_admin users

**Super Admin (12 tests)**:
- ✅ Tất cả quyền của Admin
- ✅ Truy cập không giới hạn tất cả users
- ✅ Tạo/quản lý super_admin users
- ✅ Thống kê hệ thống đầy đủ
- ✅ Toàn quyền kiểm soát hệ thống
- ✅ **Quản lý Cấu hình KV** - Truy cập endpoints `/api/kv-admin/*`

### 4. Script Test Shell

Ngoài JavaScript tests, còn có shell scripts để test qua CURL:

```bash
# Shell script tests
bash tests/scripts/regular_user.sh      # Test vai trò người dùng thường bằng CURL
bash tests/scripts/admin_user.sh        # Test vai trò người dùng admin bằng CURL  
bash tests/scripts/super_admin_user.sh  # Test vai trò người dùng super admin bằng CURL
bash tests/scripts/test-kv-admin.sh     # Test chức năng KV Admin (chỉ super_admin)

# So sánh tất cả roles
bash tests/scripts/all-roles-comparison.sh   # So sánh dashboard access
bash tests/scripts/test_all_roles.sh         # Test tất cả roles tuần tự
```

## V. Quản lý Cấu hình KV (Chỉ Super Admin)

### Tổng quan

Hệ thống Quản lý Cấu hình KV cho phép người dùng **super_admin** chỉnh sửa cấu hình ứng dụng một cách động mà không cần deploy code. Điều này cung cấp tính linh hoạt trong vận hành đồng thời vẫn duy trì bảo mật.

### 🔑 **Tính năng Độc quyền Super Admin**

Chức năng KV Admin chỉ dành riêng cho vai trò `super_admin`:

```javascript
// Chỉ super_admin có thể truy cập KV Admin routes
kvAdmin.use('*', authMiddleware);
kvAdmin.use('*', requireRole(ROLES.SUPER_ADMIN));
```

### 🎯 **API Endpoints KV Admin**

| Endpoint | Method | Mô tả | Chỉ Super Admin |
|----------|--------|-------|-----------------|
| `/api/kv-admin/configs` | GET | Lấy tất cả cấu hình | ✅ |
| `/api/kv-admin/configs/defaults` | GET | Lấy cấu hình mặc định | ✅ |
| `/api/kv-admin/configs/env-comparison` | GET | So sánh giá trị ENV vs KV | ✅ |
| `/api/kv-admin/configs/:key` | GET | Lấy cấu hình cụ thể | ✅ |
| `/api/kv-admin/configs/:key` | PUT | Cập nhật cấu hình | ✅ |
| `/api/kv-admin/configs/batch` | POST | Cập nhật hàng loạt cấu hình | ✅ |
| `/api/kv-admin/configs/:key` | DELETE | Reset về giá trị mặc định | ✅ |
| `/api/kv-admin/configs/cache/clear` | POST | Xóa cache cấu hình | ✅ |

### 🔧 **Khóa Cấu hình Có thể Quản lý**

Super admin có thể quản lý các khóa cấu hình sau:

#### **Giới hạn Tần suất**
- `RATE_LIMIT_MAX_ATTEMPTS` - Số lần đăng nhập tối đa
- `RATE_LIMIT_LOCKOUT_DURATION` - Thời gian khóa tính bằng giây
- `RATE_LIMIT_DISABLED` - Bật/tắt giới hạn tần suất

#### **Phân trang**
- `DEFAULT_PAGE_SIZE` - Số items mặc định mỗi trang
- `MAX_PAGE_SIZE` - Số items tối đa cho phép mỗi trang

#### **Bảo mật & Hiệu suất**
- `SECURITY_HIGH_RISK_THRESHOLD` - Ngưỡng rủi ro bảo mật
- `PERFORMANCE_GOOD_THRESHOLD` - Ngưỡng benchmark hiệu suất

#### **Quản lý User**
- `AUTO_ACTIVATE_USER_ON_REGISTER` - Tự động kích hoạt user mới

#### **Debug & Development**
- `ENABLE_DETAILED_ERRORS` - Hiển thị lỗi chi tiết
- `LOG_SQL_QUERIES` - Bật logging SQL queries

### 🛡️ **Tính năng Bảo mật**

#### **Giới hạn Theo Vai trò**
- Chỉ người dùng `super_admin` có thể truy cập KV Admin endpoints
- User thường và admin nhận `403 Forbidden`
- Yêu cầu xác thực cho tất cả operations

#### **Validation Khóa**
- Chỉ các khóa cấu hình được định nghĩa trước mới có thể sửa đổi
- Khóa không hợp lệ trả về `400 Bad Request`
- Validation đầu vào toàn diện với Zod schemas

#### **Audit Logging**
Tất cả thay đổi cấu hình KV đều được ghi log:
```javascript
kvAdminRoutes_log(`Config updated: ${key} = ${value} (was: ${oldValue})`);
```

#### **Defaults An toàn**
- Luôn fallback về giá trị mặc định an toàn
- Không thể làm hỏng ứng dụng bằng cấu hình sai
- Chức năng reset để khôi phục defaults

### 📊 **Ví dụ Sử dụng**

#### **Lấy Tất cả Cấu hình**
```bash
curl -H "Authorization: Bearer <super_admin_token>" \
     http://localhost:8787/api/kv-admin/configs
```

#### **Cập nhật Rate Limiting**
```bash
curl -X PUT -H "Authorization: Bearer <super_admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"value": 10}' \
     http://localhost:8787/api/kv-admin/configs/RATE_LIMIT_MAX_ATTEMPTS
```

#### **Cập nhật Hàng loạt Nhiều Configs**
```bash
curl -X POST -H "Authorization: Bearer <super_admin_token>" \
     -H "Content-Type: application/json" \
     -d '{"configs": {"RATE_LIMIT_MAX_ATTEMPTS": 10, "DEFAULT_PAGE_SIZE": 20}}' \
     http://localhost:8787/api/kv-admin/configs/batch
```

#### **So sánh Giá trị ENV vs KV**
```bash
curl -H "Authorization: Bearer <super_admin_token>" \
     http://localhost:8787/api/kv-admin/configs/env-comparison
```

### 🧪 **Testing KV Admin**

**JavaScript Tests**:
```bash
npm run test:kv_admin        # Chạy bộ test KV Admin
node tests/kvAdminTest.js    # Chạy test trực tiếp
```

**Shell Script Tests**:
```bash
bash tests/scripts/test-kv-admin.sh  # Testing dựa trên CURL
```

**Test Coverage**:
- ✅ Authentication & authorization
- ✅ CRUD operations cho tất cả config keys
- ✅ Chức năng batch update
- ✅ So sánh environment
- ✅ Quản lý cache
- ✅ Validation đầu vào & xử lý lỗi
- ✅ Kiểm soát truy cập dựa trên vai trò

### 📋 **Tích hợp với Hệ thống Admin Role**

Chức năng KV Admin tích hợp liền mạch với hệ thống vai trò hiện có:

```javascript
// Phân cấp vai trò cho KV access
hasPermission(ROLES.USER, PERMISSIONS.MANAGE_KV_CONFIG)        // ❌ false
hasPermission(ROLES.ADMIN, PERMISSIONS.MANAGE_KV_CONFIG)       // ❌ false  
hasPermission(ROLES.SUPER_ADMIN, PERMISSIONS.MANAGE_KV_CONFIG) // ✅ true
```

Điều này đảm bảo rằng chỉ có cấp độ đặc quyền cao nhất (`super_admin`) mới có thể sửa đổi các cấu hình ứng dụng quan trọng, duy trì bảo mật hệ thống và kiểm soát vận hành.

## Tóm Tắt

✅ **Migration Hoàn Thành**:
- Loại bỏ tất cả chuỗi vai trò hard-coded
- Tạo hệ thống quản lý vai trò tập trung
- Cập nhật tất cả middleware, services, schemas
- Duy trì backward compatibility
- Pass tất cả tests

✅ **Lợi Ích Đạt Được**:
- Dễ dàng thêm vai trò mới
- Dễ dàng đổi tên vai trò  
- Type safety và consistency
- Kiểm soát truy cập dựa trên quyền hạn
- Code maintainable và scalable
- Admin API toàn diện
- Cách tiếp cận bảo mật trước tiên

✅ **Sẵn Sàng Tương Lai**:
- Thêm vai trò mới (moderator, editor, viewer, v.v.)
- Kiểm soát truy cập dựa trên quyền hạn
- Phân công vai trò động
- Render UI dựa trên vai trò
- Kiểm soát truy cập API endpoint

🚀 **Sẵn Sàng Production**: Hệ thống mới đã sẵn sàng và được test kỹ lưỡng!

Hệ thống Admin & Quản Lý Vai Trò này cung cấp một giải pháp toàn diện, an toàn và linh hoạt cho việc quản lý người dùng và phân quyền trong ứng dụng.
