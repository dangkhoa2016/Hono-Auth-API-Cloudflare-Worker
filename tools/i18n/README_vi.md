# 🌍 Công cụ Quản lý Dịch thuật i18n

Hệ thống quản lý dịch thuật quốc tế hóa (i18n) hoàn chỉnh cho dự án Hono Auth Worker.

## 🚀 Bắt đầu Nhanh

Sử dụng công cụ tổng hợp mới từ thư mục gốc dự án:

```bash
# Kiểm tra so sánh bản dịch
node tools/i18n/master.js compare

# Tìm giá trị tiếng Anh trong các tệp ngôn ngữ
node tools/i18n/master.js find-english

# Chạy quy trình làm việc hoàn chỉnh
node tools/i18n/master.js workflow
```

## 📋 Tổng quan

## 📋 Các Lệnh Có sẵn

| Lệnh | Mô tả |
|---------|-------------|
| `compare, c` | So sánh các khóa giữa các ngôn ngữ |
| `find-english, fe` | Tìm giá trị tiếng Anh trong các tệp ngôn ngữ |
| `export, e` | Xuất các khóa chưa dịch ra các tệp riêng biệt |
| `progress, p [locale]` | Kiểm tra tiến độ dịch thuật |
| `merge, m [locale]` | Hợp nhất các khóa đã dịch trở lại |
| `fix, f` | Tự động sửa các khóa dịch thiếu |
| `details, d <locale>` | Hiển thị khóa thiếu chi tiết |
| `addkey, ak <key> <value>` | Thêm khóa mới vào tất cả ngôn ngữ |
| `test, t` | Kiểm tra hệ thống i18n động |
| `add, a <code>` | Thêm ngôn ngữ mới |
| `verify, v` | Xác minh nhanh hệ thống |
| `diff` | Tìm khác biệt trong file i18n |
| `clean` | Dọn file auto-english |
| `workflow, w` | Chạy quy trình dịch thuật hoàn chỉnh |

## 🛠️ Công cụ Tổng hợp i18n/master.js

### 🎯 Tính năng Chính

#### **CORE COMMANDS / LỆNH CỐT LÕI:**
```bash
node tools/i18n/master.js test          # Kiểm tra hệ thống i18n động
node tools/i18n/master.js add fr "French"  # Thêm ngôn ngữ mới  
node tools/i18n/master.js verify       # Xác minh nhanh hệ thống
```

#### **KEY MANAGEMENT / QUẢN LÝ KHÓA:**
```bash
node tools/i18n/master.js compare      # So sánh bản dịch
node tools/i18n/master.js fix          # Tự động sửa khóa thiếu
node tools/i18n/master.js details vi   # Hiện khóa thiếu chi tiết
node tools/i18n/master.js addkey "new.key" "value"  # Thêm khóa mới
```

#### **TRANSLATION WORKFLOW / QUY TRÌNH DỊCH THUẬT:**
```bash
node tools/i18n/master.js export       # Xuất khóa chưa dịch
node tools/i18n/master.js progress vi  # Kiểm tra tiến độ dịch
node tools/i18n/master.js merge de     # Hợp nhất khóa đã dịch
node tools/i18n/master.js find-english # Tìm giá trị tiếng Anh
node tools/i18n/master.js clean        # Dọn file auto-english
node tools/i18n/master.js workflow     # Chạy quy trình hoàn chỉnh
```

#### **LỆNH CHẨN ĐOÁN / DIAGNOSTIC COMMANDS:**
```bash
node tools/i18n/master.js analyze      # Phân tích hệ thống i18n
node tools/i18n/master.js check        # Kiểm tra tính toàn vẹn
node tools/i18n/master.js diff         # Tìm khác biệt trong file i18n
node tools/i18n/master.js endpoints    # Kiểm tra API endpoints
node tools/i18n/master.js routes       # Kiểm tra i18n routes
```

#### **DEMO COMMANDS / LỆNH DEMO:**
```bash
node tools/i18n/master.js demo         # Chạy demo tương tác
node tools/i18n/master.js demo-endpoints  # Chạy demo endpoints
```

## 🔄 Quy trình Dịch thuật

### 1. Tìm Nội dung Chưa dịch

```bash
# Kiểm tra giá trị tiếng Anh trong các tệp ngôn ngữ
node tools/i18n/master.js find-english

# So sánh bản dịch giữa các ngôn ngữ
node tools/i18n/master.js compare
```

### 2. Xuất để Dịch thuật

```bash
# Xuất các khóa chưa dịch ra các tệp *-auto-english.js
node tools/i18n/master.js export
```

### 3. Dịch thuật Thủ công

Chỉnh sửa các tệp `*-auto-english.js` được tạo:
- `de-auto-english.js` - Bản dịch tiếng Đức
- `es-auto-english.js` - Bản dịch tiếng Tây Ban Nha
- `fr-auto-english.js` - Bản dịch tiếng Pháp
- `ja-auto-english.js` - Bản dịch tiếng Nhật
- `th-auto-english.js` - Bản dịch tiếng Thái
- `vi-auto-english.js` - Bản dịch tiếng Việt

**Lưu ý Quan trọng:**
- ✅ Giữ nguyên cấu trúc khóa
- ✅ Bảo tồn các placeholder như `{{variable}}`
- ✅ Dịch chính xác theo ngữ cảnh
- ❌ Không thay đổi tên khóa

### 4. Kiểm tra Tiến độ

```bash
# Kiểm tra tiến độ tổng thể
node tools/i18n/master.js progress

# Kiểm tra ngôn ngữ cụ thể
node tools/i18n/master.js progress vi
```

### 5. Hợp nhất Bản dịch Trở lại

```bash
# Hợp nhất ngôn ngữ cụ thể
node tools/i18n/master.js merge de

# Hợp nhất tất cả ngôn ngữ
node tools/i18n/master.js merge all

# Xem trước thay đổi (chạy thử)
node tools/i18n/master.js merge --dry-run
```

### 6. Xác minh Hoàn thành

```bash
# Kiểm tra các giá trị tiếng Anh còn lại
node tools/i18n/master.js find-english

# So sánh các khóa giữa các ngôn ngữ
node tools/i18n/master.js compare
```

## 🎯 Quy trình Hoàn chỉnh (Tự động)

```bash
# Chạy quy trình hoàn chỉnh
node tools/i18n/master.js workflow
```

Điều này sẽ:
1. Tìm giá trị tiếng Anh trong các tệp ngôn ngữ
2. Xuất các khóa chưa dịch
3. Hiển thị tiến độ dịch thuật
4. Cung cấp hướng dẫn bước tiếp theo

## 🔍 Công cụ Tính nhất quán & Xác thực Khóa

### find-extra-keys.js - Công cụ Phát hiện Không nhất quán Khóa

Công cụ mới này giúp xác định các khóa không nhất quán giữa các tệp ngôn ngữ:

```bash
# So sánh các khóa giữa ngôn ngữ đích và cơ sở (en)
node tools/i18n/find-extra-keys.js <target-locale> [base-locale]

# Ví dụ
node tools/i18n/find-extra-keys.js de en      # So sánh tiếng Đức vs tiếng Anh
node tools/i18n/find-extra-keys.js vi         # So sánh tiếng Việt vs tiếng Anh (mặc định)
node tools/i18n/find-extra-keys.js th de      # So sánh tiếng Thái vs tiếng Đức
```

**Tính năng:**
- ✅ **Tìm khóa thiếu** trong ngôn ngữ đích
- ✅ **Tìm khóa thừa** không có trong ngôn ngữ cơ sở
- ✅ **So sánh số lượng khóa** để kiểm tra tính nhất quán
- ✅ **Báo cáo chi tiết** với đầu ra được tổ chức
- ✅ **Hỗ trợ ES Module** cho JavaScript hiện đại

**Ví dụ Sử dụng:**
```bash
# Kiểm tra xem tiếng Việt có tất cả khóa tiếng Anh không
node tools/i18n/find-extra-keys.js vi

# Tìm những gì thiếu trong tiếng Đức so với tiếng Anh
node tools/i18n/find-extra-keys.js de en

# So sánh tiếng Thái với tiếng Đức làm cơ sở
node tools/i18n/find-extra-keys.js th de
```

**Ví dụ Đầu ra:**
```
🔍 Comparing vi with base en...
📊 en: 1533 keys
📊 vi: 1533 keys

✅ vi perfectly matches en!
```

### Tích hợp master.js

Chức năng so sánh khóa cũng được tích hợp vào công cụ master:

```bash
# Sử dụng master.js để so sánh toàn diện
node tools/i18n/master.js compare    # So sánh tất cả ngôn ngữ
node tools/i18n/master.js diff       # Tìm khác biệt trong file
node tools/i18n/master.js fix        # Tự động sửa khóa thiếu
```

## 🧪 Công cụ Kiểm tra & Phân tích

### Kiểm tra Hệ thống

```bash
# Kiểm tra toàn diện hệ thống i18n
node tools/i18n/master.js test

# Phân tích chi tiết hệ thống
node tools/i18n/master.js analyze

# Kiểm tra tính toàn vẹn
node tools/i18n/master.js check
```

### Kiểm tra API & Routes

```bash
# Kiểm tra API endpoints
node tools/i18n/master.js endpoints

# Kiểm tra i18n routes
node tools/i18n/master.js routes
```

### Quản lý Khóa Nâng cao

```bash
# Hiển thị khóa thiếu chi tiết cho tiếng Việt
node tools/i18n/master.js details vi

# Tự động sửa tất cả khóa thiếu
node tools/i18n/master.js fix

# Thêm khóa mới vào tất cả ngôn ngữ
node tools/i18n/master.js addkey "validation.newField" "Trường mới là bắt buộc"

# Tìm sự khác biệt khóa giữa các ngôn ngữ
node tools/i18n/master.js diff

# So sánh các ngôn ngữ cụ thể để tìm không nhất quán
node tools/i18n/find-extra-keys.js de en
```

## 🚀 Phương thức Sử dụng

### Phương thức Mới (Khuyến nghị) - i18n/master.js

```bash
# Giao diện tổng hợp với tất cả tính năng
node tools/i18n/master.js [command]

# Ví dụ
node tools/i18n/master.js compare
node tools/i18n/master.js find-english
node tools/i18n/master.js workflow
node tools/i18n/master.js add ko "Korean"
```

### Phương thức Legacy (Vẫn hoạt động)

Các công cụ riêng lẻ vẫn có sẵn trong thư mục `tools/i18n/`:

```bash
# Sử dụng công cụ trực tiếp (legacy)
node tools/i18n/find-english-values.js
node tools/i18n/export-untranslated-keys.js
node tools/i18n/check-translation-progress.js vi
node tools/i18n/test-dynamic-i18n.js
```

## 🎯 Quy trình Điển hình cho Ngôn ngữ Mới

### 1. Thêm Ngôn ngữ Mới
```bash
# Thêm ngôn ngữ Hàn Quốc
node tools/i18n/master.js add ko "Korean"
```

### 2. Kiểm tra Hệ thống
```bash
# Kiểm tra toàn diện
node tools/i18n/master.js test

# Xác minh nhanh
node tools/i18n/master.js verify
```

### 3. So sánh và Sửa lỗi
```bash
# So sánh bản dịch
node tools/i18n/master.js compare

# Tự động sửa khóa thiếu
node tools/i18n/master.js fix
```

### 4. Xác minh Trước khi Deploy
```bash
# Kiểm tra tính toàn vẹn hệ thống
node tools/i18n/master.js check

# Kiểm tra endpoints API
node tools/i18n/master.js endpoints
```

## 🌟 Tính năng Chính

### **🔄 Phát hiện Ngôn ngữ Tự động**
- Không cần mã hóa cứng danh sách ngôn ngữ
- Tự động khám phá từ `src/i18n/locales/`
- Dễ dàng thêm ngôn ngữ mới

### **⚡ Tối ưu hóa Hiệu suất**
- Ngôn ngữ được hỗ trợ được cache
- Tải dịch thuật một cách lười biếng
- Tương thích hoàn toàn với Cloudflare Workers

### **🛡️ Xác thực Mạnh mẽ**
- Kiểm tra cấu trúc dịch thuật
- Phát hiện khóa bị thiếu
- Xác thực schema Zod

### **🌐 Bản địa hóa API**
- Endpoints dịch thuật theo ngôn ngữ cụ thể
- Hỗ trợ tham số truy vấn `?lang=`
- Phát hiện header `Accept-Language`

### **🔍 Quản lý Khóa Dịch thuật**
- So sánh khóa giữa en.js và các ngôn ngữ khác
- Tự động sửa các khóa dịch thiếu
- CLI nâng cao cho quản lý khóa
- Thao tác hàng loạt cho bảo trì dịch thuật

## 📋 Ngôn ngữ Được hỗ trợ

Hiện tại hệ thống hỗ trợ các ngôn ngữ sau:

| Mã | Ngôn ngữ | Tệp |
|------|----------|------|
| `en` | Tiếng Anh (mặc định) | `src/i18n/locales/en.js` |
| `vi` | Tiếng Việt | `src/i18n/locales/vi.js` |
| `fr` | Tiếng Pháp | `src/i18n/locales/fr.js` |
| `es` | Tiếng Tây Ban Nha | `src/i18n/locales/es.js` |
| `de` | Tiếng Đức | `src/i18n/locales/de.js` |
| `ja` | Tiếng Nhật | `src/i18n/locales/ja.js` |
| `th` | Tiếng Thái | `src/i18n/locales/th.js` |

> **Lưu ý**: Danh sách này được tự động tạo từ các tệp trong `src/i18n/locales/`

## 🔧 Cấu hình

### Chế độ Debug
```bash
# Trong .dev.vars.development
DEBUG = "hono-auth-api:i18n:*"
```

### Biến Môi trường
```bash
# Ngôn ngữ mặc định
DEFAULT_LANGUAGE = "en"

# Bật/tắt phát hiện ngôn ngữ
ENABLE_LANGUAGE_DETECTION = "true"
```

## 🎨 Endpoints API

### Quản lý Dịch thuật
```bash
# Lấy tất cả ngôn ngữ
GET /translations

# Lấy bản dịch theo ngôn ngữ
GET /translations/:lang

# Xác thực bản dịch
GET /translations/:lang/validate

# Lấy phần cụ thể
GET /translations/:lang/section/:section
```

### Endpoints Kiểm tra
```bash
# Kiểm tra với ngôn ngữ mặc định
curl http://localhost:8787/

# Kiểm tra với header Accept-Language
curl -H "Accept-Language: vi" http://localhost:8787/

# Kiểm tra với tham số truy vấn
curl http://localhost:8787/?lang=vi
```

## 🚨 Khắc phục Sự cố

### Vấn đề Thường gặp

1. **Ngôn ngữ không được phát hiện**
   ```bash
   # Kiểm tra xem tệp có tồn tại không
   ls -la src/i18n/locales/
   
   # Kiểm tra tính toàn vẹn hệ thống
   node tools/i18n/master.js check
   ```

2. **Thiếu bản dịch**
   ```bash
   # Kiểm tra cấu trúc dịch thuật
   node tools/i18n/master.js find-english
   
   # So sánh bản dịch
   node tools/i18n/master.js compare
   ```

3. **Lỗi import Workers**
   ```bash
   # Kiểm tra khả năng tương thích Workers
   node tools/i18n/master.js test
   ```

4. **Thất bại hợp nhất**
   ```bash
   # Chạy thử để kiểm tra trước khi áp dụng
   node tools/i18n/master.js merge --dry-run
   ```

### Lệnh Debug
```bash
# Debug toàn diện
DEBUG="hono-auth-api:i18n:*" node tools/i18n/master.js test

# Phân tích hệ thống chi tiết
node tools/i18n/master.js analyze
```

## 📚 Mẹo & Thực hành Tốt nhất

### Dịch thuật Hiệu quả
- **Ưu tiên tiếng Việt trước** (ít khóa hơn - tốt để kiểm tra quy trình)
- **Dịch theo module**: auth, admin, validation, v.v.
- **Sử dụng công cụ dịch** như Google Translate làm nền tảng
- **Xem xét và chỉnh sửa** để đảm bảo chất lượng

### Kiểm soát Chất lượng
- **Kiểm tra ứng dụng** sau khi hợp nhất mỗi ngôn ngữ
- **Kiểm tra placeholders** `{{variable}}` được bảo tồn
- **Xác minh ngữ cảnh** thông báo phù hợp với ngữ cảnh

### Quản lý Tiến độ
- **Commit thường xuyên** khi hoàn thành các phần
- **Theo dõi tiến độ** bằng lệnh `progress`
- **Sao lưu tệp** trước khi hợp nhất (tạo sao lưu tự động)

## 📁 Cấu trúc Tệp

```
hono-auth-api-cloudflare-worker/
├── tools/
│   └── i18n/                              # Thư mục công cụ i18n
│       ├── master.js                      # 🆕 Công cụ tổng hợp mới
│       ├── README_vi.md                   # Tài liệu này (tiếng Việt)
│       ├── README.md                      # Tài liệu tiếng Anh
│       ├── find-english-values.js         # Tìm giá trị tiếng Anh trong ngôn ngữ
│       ├── find-extra-keys.js             # 🆕 Tìm không nhất quán khóa giữa ngôn ngữ
│       ├── export-untranslated-keys.js    # Xuất khóa để dịch
│       ├── check-translation-progress.js  # Kiểm tra tiến độ dịch thuật
│       ├── merge-translated-keys.js       # Hợp nhất bản dịch trở lại
│       ├── i18n-compare.js                # So sánh khóa ngôn ngữ
│       ├── i18n-key-diff.js               # Kiểm tra sự khác biệt khóa nhanh
│       ├── add-language-demo.js           # Thêm ngôn ngữ mới
````
│       ├── test-dynamic-i18n.js           # Kiểm tra toàn diện
│       ├── analyze-i18n-files.js          # Phân tích hệ thống
│       ├── check-i18n.js                  # Kiểm tra tính toàn vệní hệ thống
│       ├── test-workers-i18n.js           # Khả năng tương thích Workers
│       ├── test-endpoints-i18n.js         # Kiểm tra endpoint API
│       ├── final-verification.js          # Xác minh nhanh
│       ├── i18n-auto-fix.js               # Tự động sửa khóa thiếu
│       ├── check-i18n-usage.sh            # Kiểm tra việc sử dụng tError/tSuccess
│       ├── demo-i18n.sh                   # Demo tương tác
│       └── demo-endpoints-i18n.sh         # Demo endpoints API
├── *-auto-english.js                      # Tệp dịch thuật được tạo
└── src/i18n/locales/                      # Tệp ngôn ngữ gốc
    ├── en.js                              # Tiếng Anh (cơ sở)
    ├── de.js                              # Tiếng Đức
    ├── es.js                              # Tiếng Tây Ban Nha
    ├── fr.js                              # Tiếng Pháp
    ├── ja.js                              # Tiếng Nhật
    ├── th.js                              # Tiếng Thái
    └── vi.js                              # Tiếng Việt
```

---

## 🎉 Kết luận

Hệ thống i18n đã được **tối ưu hóa hoàn toàn** với:

✅ **Công cụ tổng hợp duy nhất** `tools/i18n/master.js`  
✅ **Giao diện song ngữ Việt-Anh**  
✅ **Phát hiện ngôn ngữ tự động**  
✅ **Không mã hóa cứng**  
✅ **Khả năng tương thích Cloudflare Workers**  
✅ **Công cụ quản lý mạnh mẽ**  
✅ **Bản địa hóa API hoàn chỉnh**  
✅ **Kiểm tra toàn diện**  
✅ **Quản lý quy trình chuyên nghiệp**

### 🚀 Điểm nổi bật mới:

- **Một công cụ duy nhất** thay thế 4 công cụ cũ
- **Lệnh ngắn gọn** với tên viết tắt (c, f, e, p, m, t, v, w...)
- **Chức năng tổng hợp** tất cả tính năng quan trọng
- **Tương thích ngược** với các công cụ legacy
- **Dễ sử dụng** hơn với interface thống nhất

**Được tạo bởi**: GitHub Copilot  
**Ngày**: 13 tháng 8, 2025  
**Phiên bản**: 3.1.0 - Quản lý Tính nhất quán Khóa Nâng cao

### 🆕 Cập nhật Mới nhất (v3.1.0):

- **Công cụ Mới**: `find-extra-keys.js` để phát hiện không nhất quán khóa chính xác
- **master.js Nâng cao**: Thêm lệnh `diff` và cải thiện so sánh khóa
- **Quy trình Tốt hơn**: Kiểm tra tính nhất quán số lượng khóa và xác thực
- **Tích hợp Cải thiện**: Quy trình liền mạch để duy trì tính nhất quán dịch thuật
- **Đầu ra Chuyên nghiệp**: Báo cáo lỗi và phân tích khóa được cải tiến
