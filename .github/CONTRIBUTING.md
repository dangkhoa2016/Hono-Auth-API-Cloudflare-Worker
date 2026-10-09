# Contributing

## English

Read the [English README](../README.md) or [Vietnamese README](../README.vi.md) for setup and the complete verification command supported by your checkout. Use Node.js 24 and the committed lockfile; keep unrelated dependency upgrades separate.

Discuss substantial API, schema or operational changes in an issue first. Keep pull requests focused on one outcome, with related tests and documentation. Explain previous/resulting behavior and client or migration impact. Separate formatting from functional changes when it improves review.

Reproduce behavior defects with a failing test before implementation. Prefer isolated local D1/Worker helpers under `tests/regression/helpers/`. Assert real side effects and failure paths, not merely response shape. State exactly which checks ran and which remain unverified.

Baseline automated checks:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run lint:check
npm run test:node
```

Also run the complete verification command in the README for your revision. Historical interactive/live-server suites have separate setup; do not claim them as tested unless they ran. Never point reset fixtures or exploratory tests at a shared database.

Use descriptive commit subjects, a blank line and bullet bodies explaining the change and its reason. Keep `main` linear; maintainers may squash related corrections before integration. Preserve original author metadata during history curation; do not fabricate dates or verification claims.

Keep migrations append-only and test upgrades from populated schemas. Follow existing role, validation, localization and error contracts. Keep credentials, tokens, database exports and private account data out of Git and public discussions. See [SECURITY.md](SECURITY.md) and [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).

## Tiếng Việt

Đọc [README tiếng Việt](../README.vi.md) hoặc [README tiếng Anh](../README.md) để cài đặt và chọn lệnh kiểm chứng đầy đủ của checkout. Dùng Node.js 24 và lockfile đã commit; tách nâng dependency không liên quan.

Trao đổi qua issue trước khi thay đổi lớn về API, schema hoặc vận hành. Mỗi pull request tập trung vào một mục tiêu, kèm test và tài liệu. Giải thích hành vi trước/sau và ảnh hưởng client/migration. Tách formatting khỏi chức năng khi giúp review.

Tái hiện lỗi hành vi bằng test thất bại trước khi triển khai. Ưu tiên helper D1/Worker local cô lập trong `tests/regression/helpers/`. Kiểm tra tác động thực và đường lỗi, không chỉ response shape. Ghi rõ kiểm tra đã chạy và phần chưa xác minh.

Các lệnh tự động cơ bản:

```bash
npm ci --ignore-scripts --no-audit --no-fund
npm run lint:check
npm run test:node
```

Chạy thêm lệnh kiểm chứng đầy đủ trong README của revision đó. Các bộ tương tác/server cũ có setup riêng; chỉ ghi nhận khi thực sự chạy. Không dùng fixture reset hoặc test thử nghiệm trên database dùng chung.

Commit có subject rõ, dòng trống và bullet body giải thích thay đổi cùng lý do. Giữ `main` tuyến tính; maintainer có thể squash chỉnh sửa liên quan trước khi tích hợp. Giữ metadata tác giả gốc khi biên tập lịch sử; không tạo ngày giả hoặc tuyên bố kiểm chứng thiếu bằng chứng.

Migration chỉ bổ sung và có test nâng cấp từ schema chứa dữ liệu. Tuân theo contract về role, validation, bản dịch và lỗi. Không đưa credential, token, export database hoặc dữ liệu riêng tư vào Git/trao đổi công khai. Xem [SECURITY.md](SECURITY.md) và [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md).
