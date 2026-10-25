# Email tài khoản và kiểm tra Brevo

> 🌐 Language / Ngôn ngữ: [English](MANUAL_SEND_EMAIL_GUIDE.md) | **Tiếng Việt**

Hướng dẫn này dành cho kích hoạt đăng ký và xác minh email mới, không bật adapter email cảnh báo chưa được hỗ trợ trong [contract khả năng](CAPABILITIES.vi.md).

## Cấu hình đúng môi trường

Dùng `.dev.vars.development` bị ignore khi thử local; dùng biến và secret của Worker đã triển khai cho môi trường từ xa. File local Wrangler không tự tạo secret trên Worker. Xem [cấu hình Wrangler](WRANGLER_CONFIG_GUIDE.vi.md).

| Cấu hình | Giá trị Brevo / mục đích |
| --- | --- |
| `EMAIL_PROVIDER` | `brevo` |
| `EMAIL_ENABLED` | `true` để cho phép gửi email giao dịch |
| `EMAIL_CONFIRMATION_ENABLED` | `true` để xác nhận đăng ký |
| `EMAIL_PROVIDER_ENDPOINT` | `https://api.brevo.com/v3/smtp/email` |
| `EMAIL_PROVIDER_AUTH_HEADER` | `api-key` |
| `EMAIL_PROVIDER_API_KEY` | Secret provider; lưu ngoài Git và KV có thể chỉnh sửa |
| `EMAIL_FROM_ADDRESS` | Sender thuộc domain của bạn đã xác minh với provider |
| `EMAIL_FROM_NAME` | Tên người gửi công khai |
| `APP_URL` | Origin backend phục vụ API kích hoạt và xác minh email |
| `FRONTEND_URL` | URL home frontend, chỉ lấy từ môi trường, cho nút trên trang kết quả kích hoạt |

Nhập khóa qua secret input, ví dụ `npx wrangler secret put EMAIL_PROVIDER_API_KEY --env staging`; chỉ bỏ tên môi trường khi chủ đích chọn production mặc định. Không đưa secret vào tham số dòng lệnh, log hay quản trị KV. Giữ file secret local bị ignore. Xóa override khóa provider cũ khỏi KV có thể chỉnh sửa thay vì trông cậy vào thứ tự ưu tiên biến.

Cấu hình thông thường trong KV ưu tiên hơn biến môi trường. Kiểm tra `APP_URL` cũ, cờ email bị tắt hoặc sender/provider cũ trong đúng namespace. Quản trị KV mã hóa chuỗi bằng JSON; resolver giải mã một lớp và vẫn hỗ trợ chuỗi thô cũ. Ví dụ `APP_URL=https://api.example.com` phải trỏ backend, không phải host chỉ phục vụ frontend.

## Kiểm tra và preview local

Sau khi cấu hình binding và biến development local:

```bash
node tools/emails/emailSendTesterCli.js --verify --env development
node tools/emails/emailSendTesterCli.js --send --to preview@example.com --name "Preview User" --locale vi --base-url https://api.example.com --preview --env development
```

CLI dùng platform proxy của Wrangler, mặc định `development`, không phải kiểm tra secret hiệu lực của Worker đã deploy. `--verify` kiểm tra cấu hình có đủ, không xác thực khóa Brevo hay chứng minh gửi thành công. `--preview` tạo nội dung mà không gọi provider, nhưng output chứa link kích hoạt được sinh: dùng dữ liệu giả và không công khai. Token ngẫu nhiên này không gắn với user đã đăng ký trong database nên không kiểm thử kích hoạt end to end.

Để CLI gửi thật, bỏ `--preview`, dùng email bạn kiểm soát và cấu hình provider hợp lệ. Đây là email test, không tạo hay kích hoạt tài khoản thật. Chọn rõ môi trường và người nhận. Tránh tùy chọn cũ `--api-key` vì tham số dòng lệnh có thể lộ secret. Debug trả trạng thái có khóa và status provider, không trả body provider; output CLI vẫn có thể chứa metadata người nhận/cấu hình và cần giữ riêng tư.

## Chẩn đoán email đăng ký

1. Xác nhận backend/môi trường, cờ email hiệu lực, sender và `APP_URL`. Thông báo đăng ký thành công hay Worker khỏe không chứng minh provider đã nhận hoặc email đến inbox; xem `email_notification` trong kết quả đăng ký và chẩn đoán server/provider riêng tư.
2. Kiểm tra khóa Brevo còn hoạt động, sender/domain đã xác minh và tài khoản được phép gửi. Xem sự kiện provider, suppression/bounce và thư rác. Có khóa trong cấu hình không có nghĩa khóa hợp lệ.
3. Link kích hoạt dùng `/api/auth/activate`; đổi email dùng `/api/user/verify-email`. URL API tránh slash trùng và mã hóa token; từ chối base URL không hợp lệ hoặc chứa credentials. Nút trên trang kết quả dùng `FRONTEND_URL` môi trường đã kiểm tra, fallback backend `/`; không chuyển token sang frontend hay tự redirect.
4. Hai template có màu nền đặc ở ô header và nút; gradient chỉ trang trí. Preview cả hai ngôn ngữ khi tắt gradient. Preview trình duyệt không chứng nhận mọi phiên bản Outlook/email client.

Không đưa token kích hoạt/xác minh thật, mật khẩu, thông tin người nhận hoặc khóa provider vào ảnh chụp, issue hay log công khai. Chỉ thử kích hoạt thật với tài khoản test được chủ đích chuẩn bị; mở link thật có thể tiêu thụ token.
