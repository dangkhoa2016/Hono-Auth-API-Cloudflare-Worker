📖 **Language**: [English](./MANUAL_SEND_EMAIL_GUIDE.md) | Tiếng Việt

# Hướng dẫn test email

Hướng dẫn dùng CLI `tools/emails/emailSendTesterCli.js` và cấu hình Brevo.

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
- Với Brevo, `EMAIL_PROVIDER_API_KEY` là bắt buộc. Bật debug để xem endpoint, header, tình trạng API key và nội dung phản hồi khi lỗi.
