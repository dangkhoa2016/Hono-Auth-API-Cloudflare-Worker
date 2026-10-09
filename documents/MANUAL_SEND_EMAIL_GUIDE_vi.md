📖 **Language**: [English](./MANUAL_SEND_EMAIL_GUIDE.md) | Tiếng Việt

# Hướng dẫn test email

Hướng dẫn dùng CLI `tools/emails/emailSendTesterCli.js` và cấu hình Brevo.

## URL kích hoạt và hiển thị email

Đặt `APP_URL` là origin backend phục vụ `/api/auth/activate` và `/api/user/verify-email`, ví dụ `https://api.example.com`. Hostname chỉ phục vụ frontend không xử lý được các API này. KV được ưu tiên hơn biến môi trường, nên kiểm tra cả `APP_URL` cũ trong KV lẫn biến của Worker.

Công cụ quản lý KV lưu chuỗi dưới dạng JSON; resolver giải mã đúng một lớp lưu trữ này. Chuỗi biến môi trường và KV dạng raw cũ vẫn được hỗ trợ. Link email được tạo bằng URL API để tránh dấu gạch chéo trùng và mã hóa token; URL gốc không hợp lệ hoặc chứa thông tin đăng nhập bị từ chối.

Cả hai mẫu email tài khoản có màu nền đặc dự phòng trên ô bảng của header và nút bấm. Gradient chỉ là trang trí, nên chữ vẫn đọc được khi trình đọc mail bỏ gradient. Dùng preview với dữ liệu giả trước khi gửi thật; preview trên trình duyệt không chứng nhận mọi phiên bản Outlook.

## Chuẩn bị (Brevo)
- Thiết lập KV cho môi trường development (ví dụ):
	- EMAIL_PROVIDER=brevo
	- EMAIL_ENABLED=true
	- EMAIL_CONFIRMATION_ENABLED=true
	- EMAIL_PROVIDER_ENDPOINT=https://api.brevo.com/v3/smtp/email
	- EMAIL_PROVIDER_AUTH_HEADER=api-key
	- EMAIL_PROVIDER_API_KEY=<api_key_brevo>
	- EMAIL_FROM_ADDRESS=no-reply@hono-api-cloudflare-worker.dangkhoa.dev
	- EMAIL_FROM_NAME=Contact from Hono API

Ví dụ lệnh:
```
node tools/kv/kv-config-manager.js set EMAIL_PROVIDER "brevo" --env development
node tools/kv/kv-config-manager.js set EMAIL_ENABLED true --env development
node tools/kv/kv-config-manager.js set EMAIL_CONFIRMATION_ENABLED true --env development
node tools/kv/kv-config-manager.js set EMAIL_PROVIDER_ENDPOINT "https://api.brevo.com/v3/smtp/email" --env development
node tools/kv/kv-config-manager.js set EMAIL_PROVIDER_AUTH_HEADER "api-key" --env development
node tools/kv/kv-config-manager.js set EMAIL_PROVIDER_API_KEY "xkeysib-..." --env development
node tools/kv/kv-config-manager.js set EMAIL_FROM_ADDRESS "no-reply@hono-api-cloudflare-worker.dangkhoa.dev" --env development
node tools/kv/kv-config-manager.js set EMAIL_FROM_NAME "Contact from Hono API" --env development
```

## Cách dùng CLI
- Help: `node tools/emails/emailSendTesterCli.js -h`
- Kiểm tra cấu hình: `node tools/emails/emailSendTesterCli.js --verify`
- Gửi thử (preview, không gọi provider):
```
node tools/emails/emailSendTesterCli.js --send --to you@example.com --name "Your Name" --locale vi --ip 203.0.113.10 --preview
```
- Gửi thật kèm debug:
```
node tools/emails/emailSendTesterCli.js --send --to you@example.com --name "Your Name" --locale vi --ip 203.0.113.10 --base-url https://your-app.com --debug
```
- Override header/key theo lần chạy:
```
node tools/emails/emailSendTesterCli.js --send --to you@example.com --auth-header api-key --api-key xkeysib-... --debug
```

- Đổi ngôn ngữ email (i18n): thêm `--locale <code>`, mặc định `en`. Hỗ trợ: en, vi, fr, es, de, ja, th.

## Flag ngắn
- `-h` trợ giúp, `-v` verify, `-s` send, `-d` debug.

## Lưu ý
- Với Brevo, `EMAIL_PROVIDER_API_KEY` là bắt buộc. Kết quả debug cho biết có key và trạng thái provider, không hiển thị key, token hoặc nội dung phản hồi của provider.
