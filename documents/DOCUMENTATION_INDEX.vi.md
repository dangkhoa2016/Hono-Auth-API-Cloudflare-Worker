# Mục lục tài liệu

> 🌐 Language / Ngôn ngữ: [English](DOCUMENTATION_INDEX.md) | **Tiếng Việt**

## Hướng dẫn hiện hành

Dùng các tài liệu này để cài đặt, review và vận hành phiên bản hiện tại.

- [Cài đặt local](SETUP_GUIDE.vi.md)
- [Khả năng và giới hạn](CAPABILITIES.vi.md)
- [Môi trường, secret và domain](WRANGLER_CONFIG_GUIDE.vi.md)
- [Kiểm chứng chuẩn](TEST_GUIDE.vi.md)
- [Phạm vi script test](TEST_SCRIPTS.vi.md)
- [Nâng cấp, staging và phát hành](UPGRADE_RELEASE.vi.md)
- [Cấu hình ESLint hiện hành](ESLINT_GUIDE.vi.md)
- [Email tài khoản và Brevo](MANUAL_SEND_EMAIL_GUIDE_vi.md)
- [Tổng quan audit và contract](ENTERPRISE_AUDIT_SYSTEM_COMPLETE_GUIDE.vi.md)

## Tài liệu thiết kế và ví dụ lịch sử

Các tài liệu bên dưới giữ phạm vi tham khảo lịch sử, không phải runbook hiện hành. Banner đầu tài liệu chỉ rõ giới hạn. Không suy ra capability đang có, số test hiện tại, release hoặc ngày triển khai từ các ví dụ và tuyên bố cũ. Khi có mâu thuẫn, contract khả năng và mã nguồn hiện hành được ưu tiên. Ví dụ có lệnh reset/ghi dữ liệu chỉ phù hợp môi trường test được chủ đích chuẩn bị.

- [🔍 **AUDIT SYSTEM API REFERENCE - TÀI LIỆU THAM KHẢO API**](AUDIT_API_REFERENCE.vi.md)
- [🔧 **HƯỚNG DẪN CẤU HÌNH CLOUDFLARE KV CHO HỆ THỐNG AUDIT**](AUDIT_KV_CONFIGURATION_GUIDE.vi.md)
- [Kiểm tra database](DATABASE_INSPECTION_GUIDE_vi.md)
- [DatabaseService - Tài Liệu Hoàn Chỉnh & Tham Khảo Nhanh](DATABASE_SERVICE.vi.md)
- [Hướng Dẫn Debug & Development Hoàn Chỉnh](DEBUG_DEVELOPMENT_GUIDE.vi.md)
- [Hướng dẫn Quản lý Cấu hình Động](DYNAMIC_CONFIG_GUIDE.vi.md)
- [Xác minh email mới](EMAIL_CHANGE_VERIFICATION_GUIDE_vi.md)
- [🌍 HONO AUTH WORKER - TÀI LIỆU CHÍNH THỨC i18n](I18N_MASTER_GUIDE.vi.md)
- [Hướng Dẫn Toàn Diện Hệ Thống Quản Lý Vai Trò](ROLE_COMPLETE_GUIDE.vi.md)
- [Tài liệu cấu trúc Schemas](SCHEMAS_GUIDE.vi.md)
- [Quản lý blacklist token](TOKEN_BLACKLIST_GUIDE_vi.md)
- [🔐 HƯỚNG DẪN BẢO MẬT TOKEN](TOKEN_SECURITY_COMPREHENSIVE_GUIDE.vi.md)
- [Hướng dẫn Zod Validation - Hệ Thống Kiểm Toán Doanh Nghiệp](ZOD_GUIDE.vi.md)

## Lộ trình review trước release

1. Cài đặt → contract khả năng → cấu hình môi trường.
2. Kiểm chứng chuẩn → migration và nâng cấp → nghiệm thu staging.
3. Xác nhận domain, email, quyền và phiên; ghi commit, kết quả CI và deployment ID thật. Chỉ tạo release sau khi các kiểm tra bắt buộc được nghiệm thu.
