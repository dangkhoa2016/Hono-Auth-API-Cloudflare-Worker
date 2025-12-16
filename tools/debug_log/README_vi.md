# Bộ Test Debug - Tổng hợp
📖 **Language**: [English](./README.md) | Tiếng Việt

## Tổng quan

Thư mục này chứa một bộ test hệ thống debug toàn diện đã được tổng hợp từ nhiều tập tin test debug riêng lẻ thành một tập tin test có tổ chức duy nhất.

## Tập tin chính

### `comprehensive_debug_test.js` 
Tập tin test tổng hợp chứa tất cả các test debug được tổ chức thành 18 test case khác nhau:

1. **Basic System Inspection** - Kiểm tra cấu trúc cơ bản của hệ thống debug
2. **Basic Colors** - Test màu sắc và formatting cơ bản
3. **Pattern Matching** - Test các pattern matching khác nhau
4. **Enable/Disable** - Test chức năng bật/tắt debug  
5. **Environment Support** - Test hỗ trợ biến môi trường
6. **Formatters** - Test các formatter và ký tự đặc biệt
7. **Performance** - Test hiệu năng khi tạo nhiều debug instance
8. **Edge Cases** - Test các trường hợp edge case
9. **Internal State** - Test trạng thái nội bộ của hệ thống debug
10. **formatArgs** - Test function formatArgs

### `run_comprehensive_test.sh`
Script runner để chạy test một cách dễ dàng.

## Cách sử dụng

### Chạy test tổng hợp
```bash
# Từ thư mục gốc của project
node tools/debug_log/comprehensive_debug_test.js

# Hoặc sử dụng script runner
bash tools/debug_log/run_comprehensive_test.sh
```

### Chạy từ package.json
Bạn có thể thêm script này vào `package.json`:
```json
{
  "scripts": {
    "tool:debug": "node tools/debug_log/comprehensive_debug_test.js",
    "tool:debug:run": "bash tools/debug_log/run_comprehensive_test.sh"
  }
}
```

## Kết quả test

Test suite sẽ hiển thị:
- ✅ Các test passed với màu xanh
- ❌ Các test failed với màu đỏ  
- 📊 Summary với tổng số test, pass/fail rate
- ⏱️ Thời gian thực hiện
- 🎨 Debug output với màu sắc khác nhau cho từng namespace

## Lợi ích của việc tổng hợp

1. **Tổ chức tốt hơn** - Tất cả test trong một tập tin có cấu trúc
2. **Dễ bảo trì** - Chỉ cần maintain 1 tập tin thay vì nhiều tập tin
3. **Báo cáo tốt hơn** - Summary report tổng hợp với statistics
4. **Performance tracking** - Đo lường thời gian thực hiện
5. **Standardized output** - Format output nhất quán
6. **Error handling** - Xử lý lỗi tốt hơn với try/catch

## Chạy test cụ thể

Trong tương lai có thể mở rộng để chạy test cụ thể:
```javascript
// Có thể thêm command line arguments
const args = process.argv.slice(2);
if (args.includes('--colors-only')) {
  testSuite.testBasicColors();
} else if (args.includes('--patterns-only')) {
  testSuite.testPatternMatching();
} else {
  testSuite.runAllTests();
}
```

## Tích hợp với dự án

Bộ test debug này là một phần của framework testing toàn diện của dự án Hono Auth Worker. Nó xác thực hệ thống debug logging được sử dụng trong toàn bộ ứng dụng.

**Script NPM liên quan:**
- `npm run tool:debug` - Chạy test debug
- `npm run tool:debug:run` - Chạy với shell script

**Debug Namespace sử dụng trong dự án:**
- `hono-auth-api:*` - Tất cả debug output
- `hono-auth-api:routes:*` - Logging đặc thù route  
- `hono-auth-api:services:*` - Logging tầng service
- `hono-auth-api:validation:*` - Logging validation
- `hono-auth-api:i18n:*` - Logging hệ thống i18n

## 🌍 Hỗ trợ ngôn ngữ

Tài liệu này có sẵn bằng nhiều ngôn ngữ:
- **English**: [README.md](./README.md)
- **Tiếng Việt**: [README_vi.md](./README_vi.md) (tập tin này)
