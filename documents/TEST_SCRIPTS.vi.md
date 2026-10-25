# Test scripts

[English](TEST_SCRIPTS.md) | Tiếng Việt

Xem [hướng dẫn kiểm chứng hiện hành](TEST_GUIDE.vi.md) cho checks chuẩn, điều kiện chạy suite server, fixture và giới hạn bằng chứng. Danh sách script thực tế nằm trong [package.json](../package.json); không suy ra CI từ tên test lịch sử.

```bash
npm run lint:check && npm run test:node
npm run test:regression
npm run test:unified:help
```

`npm test` là menu tương tác có khởi tạo dữ liệu local; không dùng làm check CI. Nhiều suite cũ gọi Yarn nội bộ. Không chạy reset fixture với dữ liệu từ xa.
