#!/usr/bin/env node
/**
 * i18n Key Sorting Tool
 * ---------------------------------
 * Sắp xếp lại thứ tự key trong tất cả các file locale (7 ngôn ngữ) theo thứ tự alphabet ổn định.
 * - Giữ nguyên cấu trúc lồng nhau
 * - Sắp xếp keys ở mỗi cấp theo unicode localeCompare (en) để ổn định
 * - Tùy chọn --fix để ghi đè file
 * - Tùy chọn --backup để tạo bản sao lưu *.bak trước khi ghi
 * - Giữ nguyên comment header đầu file (block comment đầu tiên) nếu có
 * - Không thay đổi giá trị
 *
 * Usage:
 *   node tools/i18n/sort-i18n-keys.js           # Chỉ preview thay đổi (dry-run)
 *   node tools/i18n/sort-i18n-keys.js --fix     # Ghi thay đổi
 *   node tools/i18n/sort-i18n-keys.js --fix --backup  # Ghi và tạo backup
 */

import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
// Project root: hiện file ở tools/i18n => lên 2 cấp là root
const ROOT = path.resolve(__dirname, '../../');
const LOCALES_DIR = path.join(ROOT, 'src/i18n/locales');

const args = process.argv.slice(2);
const isFix = args.includes('--fix');
const makeBackup = args.includes('--backup');

function sortObjectDeep(obj) {
  if (Array.isArray(obj)) return obj; // không sắp xếp mảng
  if (obj && typeof obj === 'object') {
    const sorted = {};
    Object.keys(obj)
      .sort((a, b) => a.localeCompare(b, 'en'))
      .forEach(k => {
        sorted[k] = sortObjectDeep(obj[k]);
      });
    return sorted;
  }
  return obj;
}

function extractHeader(content) {
  // Lấy block comment đầu tiên nếu ở đầu file
  const headerMatch = content.match(/^\s*\/\*([\s\S]*?)\*\//);
  let header = '';
  let rest = content;
  if (headerMatch && headerMatch.index === 0) {
    header = headerMatch[0].trim();
    rest = content.slice(headerMatch[0].length).trimStart();
  }
  return { header, rest };
}

function parseExportObject(content) {
  // Tìm export default { ... } kết thúc bằng };
  const exportMatch = content.match(/export\s+default\s+({[\s\S]*});?/);
  if (!exportMatch) throw new Error('Không tìm thấy export default object');
  const objectCode = exportMatch[1];
  // Dùng Function để parse an toàn tương đối (file kiểm soát nội bộ)
  // Thay export default bằng return
  const wrapped = `return (${objectCode});`;
  // eslint-disable-next-line no-new-func
  const fn = new Function(wrapped);
  return { object: fn(), objectCode, fullMatch: exportMatch[0] };
}

function formatObject(obj, indent = 2) {
  // Tự format để đảm bảo single quotes & dấu phẩy cuối cùng nhất quán
  const space = ' '.repeat(indent);
  function inner(value, level) {
    if (Array.isArray(value)) {
      return '[' + value.map(v => inner(v, level + 1)).join(', ') + ']';
    }
    if (value && typeof value === 'object') {
      const entries = Object.entries(value);
      if (!entries.length) return '{}';
      const pad = ' '.repeat(level * indent);
      const padInner = ' '.repeat((level + 1) * indent);
      const lines = entries.map(([k, v]) => `${padInner}'${k}': ${inner(v, level + 1)}`);
      return `{
${lines.join(',\n')}
${pad}}`;
    }
    // primitive: string assumed
    if (typeof value === 'string') {
      return `'${value.replace(/'/g, "\\'")}'`;
    }
    return JSON.stringify(value);
  }
  return inner(obj, 0);
}

function processFile(filePath) {
  const original = fs.readFileSync(filePath, 'utf8');
  const { header, rest } = extractHeader(original);
  const { object: data } = parseExportObject(rest);
  const sorted = sortObjectDeep(data);

  const formatted = `${header ? header + '\n\n' : ''}export default ${formatObject(sorted)};\n\n`;

  const changed = formatted.trim() !== original.trim();
  return { changed, formatted, original, headerIncluded: !!header };
}

function main() {
  if (!fs.existsSync(LOCALES_DIR)) {
    console.error('Không tìm thấy thư mục locales:', LOCALES_DIR);
    process.exit(1);
  }
  const files = fs.readdirSync(LOCALES_DIR).filter(f => f.endsWith('.js'));
  if (!files.length) {
    console.error('Không có file locale nào.');
    process.exit(1);
  }
  let changedCount = 0;
  const report = [];

  for (const file of files) {
    const filePath = path.join(LOCALES_DIR, file);
    try {
      const { changed, formatted } = processFile(filePath);
      if (changed) changedCount++;
      report.push({ file, changed });
      if (changed && isFix) {
        if (makeBackup) {
          fs.writeFileSync(filePath + '.bak', fs.readFileSync(filePath));
        }
        fs.writeFileSync(filePath, formatted, 'utf8');
      }
    } catch (e) {
      console.error(`Lỗi xử lý ${file}:`, e.message);
      report.push({ file, error: e.message });
    }
  }

  console.log('I18N Key Sorting Report');
  console.log('------------------------');
  report.forEach(r => {
    if (r.error) {
      console.log(`✗ ${r.file} - ERROR: ${r.error}`);
    } else if (r.changed) {
      console.log(`• ${r.file} - would sort` + (isFix ? ' (sorted)' : ''));
    } else {
      console.log(`✓ ${r.file} - already sorted`);
    }
  });
  console.log('------------------------');
  console.log(`Files changed: ${changedCount}/${report.length}`);
  if (!isFix) {
    console.log('Dry run complete. Thêm --fix để ghi thay đổi.');
  } else {
    console.log('Hoàn thành.');
  }
}

main();
