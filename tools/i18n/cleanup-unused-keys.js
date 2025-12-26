#!/usr/bin/env node
/*
 * i18n Unused Key Cleanup Script
 *
 * Features:
 * 1. Scans source (src/, tests/, tools/) for translation key usages
 * 2. Supports nested keys (e.g., auth.loginSuccess)
 * 3. Handles i18next style t('namespace:key') and t('key') calls
 * 4. Detects template usage with backticks and variable parts (best-effort)
 * 5. Outputs report (JSON + pretty console table)
 * 6. Can delete unused keys from ALL locale files consistently (with --fix)
 * 7. Dry-run by default, safe and idempotent
 * 8. Skips keys listed in a whitelist config (tools/i18n/i18n-whitelist.json)
 * 9. Handles plural suffix variants (_other) so that if base key used, keeps plural form
 * 10. Supports --include / --exclude glob filters
 *
 * Usage:
 *   node tools/i18n/cleanup-unused-keys.js            # dry run
 *   node tools/i18n/cleanup-unused-keys.js --fix      # remove unused keys
 *   node tools/i18n/cleanup-unused-keys.js --report report.json
 *   node tools/i18n/cleanup-unused-keys.js --include src/routes --exclude tests
 *   npm run tool:i18n:cleanup                         # mapped to dry-run
 *
 * Exit codes:
 *   0 - success (no unused keys OR after cleanup)
 *   1 - unused keys found (in dry-run mode)
 *   2 - fatal error
 */

import fs from 'fs';
import path from 'path';
import url from 'url';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '../../');
const localeDir = path.join(projectRoot, 'src/i18n/locales');
const whitelistPath = path.join(__dirname, 'i18n-whitelist.json');

const args = process.argv.slice(2);
const isFix = args.includes('--fix');
const dryRun = !isFix;
const reportArgIndex = args.indexOf('--report');
let reportPath = null;
if (reportArgIndex !== -1) {
  const candidate = args[reportArgIndex + 1];
  if (!candidate || candidate.startsWith('--')) {
    // EN: No filename provided; use default
    // VI: Không truyền tên file nên dùng mặc định
    reportPath = 'i18n-cleanup-report.json';
    console.log('[i18n-cleanup] No report filename supplied after --report; using default i18n-cleanup-report.json');
  } else {
    reportPath = candidate;
  }
}
const backupEnabled = args.includes('--backup') || args.includes('-b');
const showHelp = args.includes('-h') || args.includes('--help');

// EN: Optional include/exclude substring filters (not full glob)
// VI: Bộ lọc include/exclude đơn giản (không dùng glob)
const includeIndex = args.indexOf('--include');
const includes = includeIndex !== -1 ? args[includeIndex + 1].split(',').map(s => s.trim()).filter(Boolean) : [];
const excludeIndex = args.indexOf('--exclude');
const excludes = excludeIndex !== -1 ? args[excludeIndex + 1].split(',').map(s => s.trim()).filter(Boolean) : [];
// EN: Aggressive skips safety heuristics
// VI: Aggressive bỏ qua heuristic an toàn
const aggressive = args.includes('--aggressive');
// EN: Disable scanning i18nKey fields
// VI: Cho phép tắt quét trường i18nKey
const noI18nKeyScan = args.includes('--no-i18nkey-scan');
const prefixStatsEnabled = args.includes('--prefix-stats');
const prefixDepthIndex = args.indexOf('--prefix-depth');
const prefixDepth = prefixDepthIndex !== -1 ? parseInt(args[prefixDepthIndex + 1], 10) : 1;
// EN: Targeted deletion options
// VI: Tuỳ chọn xoá theo tiền tố
const onlyPrefixIndex = args.indexOf('--only-prefix');
const onlyPrefixes = onlyPrefixIndex !== -1 ? args[onlyPrefixIndex + 1].split(',').map(s => s.trim()).filter(Boolean) : [];
const excludePrefixIndex = args.indexOf('--exclude-prefix');
const excludePrefixes = excludePrefixIndex !== -1 ? args[excludePrefixIndex + 1].split(',').map(s => s.trim()).filter(Boolean) : [];

function log(msg) { console.log(`[i18n-cleanup] ${msg}`); }
function warn(msg) { console.warn(`[i18n-cleanup] WARN: ${msg}`); }
function error(msg) { console.error(`[i18n-cleanup] ERROR: ${msg}`); }

function printHelp() {
  const text = `\nUsage: node tools/i18n/cleanup-unused-keys.js [options]\n\n` +
    `Find and optionally remove unused i18n translation keys across locale files.\n` +
    `Dry-run by default (exit code 1 if unused keys found).\n\n` +
    `Options:\n` +
    `  --fix                       Remove unused keys (destructive).\n` +
    `  --backup, -b                Backup original locale files before writing.\n` +
    `  --report <file>             Write JSON report to file.\n` +
    `  --include <paths>           Comma list substrings; only scan source files containing any (src/tests/tools by default).\n` +
    `  --exclude <paths>           Comma list substrings; skip source files containing any.\n` +
    `  --only-prefix <p1,p2>       Only consider deletion of unused keys starting with these prefixes.\n` +
    `  --exclude-prefix <p1,p2>    Never delete unused keys starting with these prefixes.\n` +
    `  --aggressive                Disable sibling safety heuristic (may delete more).\n` +
    `  --no-i18nkey-scan           Disable scanning of i18nKey: '...' properties.\n` +
    `  --prefix-stats              Include prefix statistics in console & report.\n` +
    `  --prefix-depth <n>          Depth for prefix grouping (default 1).\n` +
    `  --only-prefix + --fix       Safe targeted cleanup batch per namespace.\n` +
    `  --exclude-prefix + --fix    Keep certain namespaces while cleaning others.\n` +
    `  -h, --help                  Show this help and exit.\n\n` +
    `Dynamic Detection:\n` +
    `  Detects patterns: t(), i18n.t(), tl(), builder.tl(), tError(), tSuccess(), i18nKey: '...'\n` +
    `  Keeps dynamic template prefixes: \`validation.*\` with interpolation, errors.*, success.*\n\n` +
    `Safety Heuristic (default):\n` +
    `  If a sibling key in same object is used, unused sibling is retained unless --aggressive.\n\n` +
    `Exit Codes:\n` +
    `  0  Success (no unused keys OR after --fix OR help).\n` +
    `  1  Unused keys found (dry-run).\n` +
    `  2  Fatal error.\n\n` +
    `Examples:\n` +
    `  Dry run with stats:            node tools/i18n/cleanup-unused-keys.js --prefix-stats --prefix-depth 2\n` +
    `  Target endpoints.* only:       node tools/i18n/cleanup-unused-keys.js --only-prefix endpoints. --fix --backup\n` +
    `  Exclude security namespace:    node tools/i18n/cleanup-unused-keys.js --only-prefix endpoints. --exclude-prefix endpoints.security. --fix\n` +
    `  Write report JSON:             node tools/i18n/cleanup-unused-keys.js --report cleanup.json\n` +
    `  Aggressive full cleanup:       node tools/i18n/cleanup-unused-keys.js --fix --aggressive --backup\n` +
    `  Combine prefixes:              node tools/i18n/cleanup-unused-keys.js --only-prefix endpoints.,validation.audit_retention. --fix --backup\n` +
    `\n`;
  console.log(text);
}

function readWhitelist() {
  if (fs.existsSync(whitelistPath)) {
    try {
      const data = JSON.parse(fs.readFileSync(whitelistPath, 'utf8'));
      if (Array.isArray(data.keep)) return new Set(data.keep);
      if (Array.isArray(data)) return new Set(data);
    } catch (e) {
      warn(`Failed to parse whitelist file: ${e.message}`);
    }
  }
  return new Set();
}

function walk(dir, fileList = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      // EN: Skip node_modules and .git
      // VI: Bỏ qua node_modules và .git
      if (e.name === 'node_modules' || e.name === '.git') continue;
      fileList.push(...walk(full, []));
    } else {
      // EN: Track only js/mjs/cjs files
      // VI: Chỉ theo dõi file js/mjs/cjs
      if (!/\.(js|mjs|cjs)$/i.test(e.name)) continue;
      const rel = path.relative(projectRoot, full);
      if (includes.length && !includes.some(f => rel.includes(f))) continue;
      if (excludes.some(f => rel.includes(f))) continue;
      fileList.push(full);
    }
  }
  return fileList;
}

function collectSourceFiles() {
  const roots = ['src', 'tests', 'tools'];
  let files = [];
  for (const r of roots) {
    const p = path.join(projectRoot, r);
    if (fs.existsSync(p)) files.push(...walk(p));
  }
  return files;
}

// EN: Extract translation keys from code via common patterns
// VI: Trích xuất key dịch từ code theo các pattern phổ biến
// EN: Covers t('key'), t("key"), t(`key`), t(c,'key') and i18n.t variants
// VI: Bao gồm t('key'), t("key"), t(`key`), t(c,'key') và các biến thể i18n.t
// EN: Covers tl(...) and builder.tl(...) static usage
// VI: Bao quát tl(...) và builder.tl(...) dạng tĩnh
// EN: Handles backtick usage without interpolation
// VI: Hỗ trợ backtick không nội suy
const CALL_PATTERNS = [
  /\bt\(\s*(['"])([A-Za-z0-9_.:-]+)\1/g,                               // t('key')
  /\bt\(\s*[^,]+,\s*(['"])([A-Za-z0-9_.:-]+)\1/g,                     // t(c,'key')
  /\bi18n\s*\.\s*t\(\s*(['"])([A-Za-z0-9_.:-]+)\1/g,                 // i18n.t('key')
  /\bi18n\s*\.\s*t\(\s*[^,]+,\s*(['"])([A-Za-z0-9_.:-]+)\1/g,       // i18n.t(c,'key')
  /\bt\(\s*`([A-Za-z0-9_.:-]+)`/g,                                       // t(`key`)
  /\bt\(\s*[^,]+,\s*`([A-Za-z0-9_.:-]+)`/g,                             // t(c,`key`)
  /\bi18n\s*\.\s*t\(\s*`([A-Za-z0-9_.:-]+)`/g,                        // i18n.t(`key`)
  /\bi18n\s*\.\s*t\(\s*[^,]+,\s*`([A-Za-z0-9_.:-]+)`/g,               // i18n.t(c,`key`)
  /\btl\(\s*(['"])([A-Za-z0-9_.:-]+)\1/g,                              // tl('key') one-arg
  /\btl\(\s*[^,]+,\s*(['"])([A-Za-z0-9_.:-]+)\1/g,                    // tl(lang,'key') two-arg
  /\b[a-zA-Z_][a-zA-Z0-9_]*\.tl\(\s*(['"])([A-Za-z0-9_.:-]+)\1/g      // builder.tl('key')
];

function extractKeysFromContent(content) {
  const keys = new Set();
  for (const pattern of CALL_PATTERNS) {
    const regex = new RegExp(pattern.source, 'g');
    let m;
    while ((m = regex.exec(content)) !== null) {
      const key = m[m.length - 1];
      if (key) keys.add(key.trim());
    }
  }
  return keys;
}

function extractAllUsedKeys(files) {
  const used = new Set();
  // EN: Route definitions etc.
  // VI: Dùng trong định nghĩa route
  const i18nKeyPattern = /i18nKey\s*:\s*['"]([A-Za-z0-9_.:-]+)['"]/g;
  const dynamicPrefixes = new Set();
  // EN: Capture validation prefix before interpolation
  // VI: Bắt prefix validation trước nội suy
  const dynamicTemplatePattern = /`(validation\.[^`$]*?)\$\{[A-Za-z0-9_]+\}/g;
  // EN: tError(c,'type') -> errors.type
  // VI: tError(c,'type') -> errors.type
  const tErrorLiteralPattern = /tError\(\s*[^,]+,\s*(['"])([A-Za-z0-9_.:-]+)\1/g;
  // EN: tSuccess(c,'type') -> success.type
  // VI: tSuccess(c,'type') -> success.type
  const tSuccessLiteralPattern = /tSuccess\(\s*[^,]+,\s*(['"])([A-Za-z0-9_.:-]+)\1/g;
  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      const k = extractKeysFromContent(content);
      k.forEach(x => used.add(x));
      if (!noI18nKeyScan) {
        let m;
        while ((m = i18nKeyPattern.exec(content)) !== null) {
          used.add(m[1]);
        }
      }
      // EN: Detect dynamic validation prefixes inside template literals
      // VI: Phát hiện prefix validation động trong template literal
      let dm;
      while ((dm = dynamicTemplatePattern.exec(content)) !== null) {
        const pref = dm[1];
        if (pref) dynamicPrefixes.add(pref);
      }
      // EN: Detect tError/tSuccess usages (literal and dynamic)
      // VI: Bắt các trường hợp tError/tSuccess (literal và dynamic)
      if (/tError\(/.test(content)) {
        // EN: Keep entire prefix if any non-literal usage exists
        // VI: Nếu có cách dùng không literal thì giữ nguyên prefix
        dynamicPrefixes.add('errors.');
        let em;
        while ((em = tErrorLiteralPattern.exec(content)) !== null) {
          const typeKey = em[2];
          if (typeKey) used.add(`errors.${typeKey}`);
        }
      }
      if (/tSuccess\(/.test(content)) {
        dynamicPrefixes.add('success.');
        let sm;
        while ((sm = tSuccessLiteralPattern.exec(content)) !== null) {
          const typeKey = sm[2];
            if (typeKey) used.add(`success.${typeKey}`);
        }
      }
    } catch (e) {
      warn(`Failed to read ${file}: ${e.message}`);
    }
  }
  return { used, dynamicPrefixes };
}

// EN: Load locale files (ES module default exports)
// VI: Nạp file locale (export default dạng ES module)
async function loadLocale(localeFile) {
  const rel = path.relative(projectRoot, localeFile);
  const modPath = path.resolve(localeFile);
  try {
    const mod = await import(url.pathToFileURL(modPath));
    return mod.default || {};
  } catch (e) {
    error(`Failed to import locale ${rel}: ${e.message}`);
    return {};
  }
}

function flattenObject(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const p = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flattenObject(v, p));
    } else {
      out[p] = v;
    }
  }
  return out;
}

function unflatten(flat) {
  const root = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.split('.');
    let cur = root;
    parts.forEach((part, idx) => {
      if (idx === parts.length - 1) {
        cur[part] = value;
      } else {
        cur[part] = cur[part] || {};
        cur = cur[part];
      }
    });
  }
  return root;
}

function ensureDir(dir) { if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true }); }

function writeLocaleFile(localeFile, dataObj, originalContent) {
  // EN: Backup original file if enabled
  // VI: Sao lưu file gốc nếu bật tuỳ chọn
  if (backupEnabled && originalContent) {
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const backupDir = path.join(__dirname, 'backups', ts);
    ensureDir(backupDir);
    const dest = path.join(backupDir, path.basename(localeFile));
    fs.writeFileSync(dest, originalContent, 'utf8');
  }
  const header = `/**\n * Auto-cleaned by i18n cleanup tool on ${new Date().toISOString()}\n * NOTE: Removed unused keys. Original formatting may differ.${backupEnabled ? ' Backup stored in tools/i18n/backups/' : ''}\n */\n\nexport default `;
  const content = header + JSON.stringify(dataObj, null, 2) + '\n';
  fs.writeFileSync(localeFile, content, 'utf8');
}

(async function main() {
  try {
    if (showHelp) {
      printHelp();
      process.exit(0);
    }
    log('Starting i18n unused key scan...');
    const whitelist = readWhitelist();
    if (whitelist.size) log(`Loaded whitelist with ${whitelist.size} keys`);

    const localeFiles = fs.readdirSync(localeDir).filter(f => f.endsWith('.js')).map(f => path.join(localeDir, f));
    if (!localeFiles.length) {
      warn('No locale files found. Exiting.');
      return;
    }

    // EN: Collect used keys from source files
    // VI: Thu thập key sử dụng từ mã nguồn
    const sourceFiles = collectSourceFiles();
    log(`Scanning ${sourceFiles.length} source files for key usage...`);
  const { used: usedKeysRaw, dynamicPrefixes } = extractAllUsedKeys(sourceFiles);

    // EN: Expand used keys with plural suffix _other and related segments
    // VI: Mở rộng key dùng với hậu tố số nhiều _other và các segment
    const usedKeys = new Set(usedKeysRaw);
    for (const k of Array.from(usedKeysRaw)) {
      if (k.endsWith('_other')) {
        usedKeys.add(k.replace(/_other$/, ''));
      } else {
        usedKeys.add(`${k}_other`); // EN: Keep plural variant when base is used
        // VI: Thêm biến thể số nhiều khi base đang dùng
      }
    }

    // EN: Accumulate report data
    // VI: Gom dữ liệu báo cáo
    const report = {
      generatedAt: new Date().toISOString(),
      dryRun,
      locales: {},
      totals: { locales: 0, keys: 0, unused: 0, removed: 0 },
      prefixStats: {}
    };

    for (const localeFile of localeFiles) {
      const localeName = path.basename(localeFile, '.js');
      const originalContent = fs.readFileSync(localeFile, 'utf8');
      const data = await loadLocale(localeFile);
      const flat = flattenObject(data);
      const keys = Object.keys(flat);

      const unusedAll = [];
      for (const key of keys) {
        const hasDynamic = [...dynamicPrefixes].some(p => key.startsWith(p));
        const isUsed = hasDynamic || usedKeys.has(key) || usedKeys.has(key.replace(/^[^.]+:/, ''));
        if (!isUsed && !whitelist.has(key)) {
          // EN: Safe mode keeps siblings when one is used (unless aggressive)
          // VI: Chế độ an toàn giữ key cùng cấp nếu có anh em được dùng (trừ khi aggressive)
          if (!aggressive) {
            const parent = key.includes('.') ? key.split('.').slice(0, -1).join('.') : null;
            if (parent) {
              // EN: If any sibling is used, assume potential dynamic access and skip deletion
              // VI: Có anh em đang dùng thì giả định truy cập động và không xoá
              const siblingPrefix = parent + '.';
              const hasUsedSibling = keys.some(k2 => k2.startsWith(siblingPrefix) && usedKeys.has(k2));
              if (hasUsedSibling) continue; // EN: Skip marking as unused
              // VI: Bỏ qua, không đánh dấu unused
            }
          }
          unusedAll.push(key);
        }
      }

      // EN: Apply prefix filters (only & exclude)
      // VI: Áp dụng bộ lọc tiền tố only/exclude
      const unused = unusedAll.filter(k => {
        if (onlyPrefixes.length && !onlyPrefixes.some(p => k.startsWith(p))) return false;
        if (excludePrefixes.some(p => k.startsWith(p))) return false;
        return true;
      });

      // EN: Remove unused keys when running with --fix
      // VI: Xoá key không dùng khi chạy --fix
      let removedCount = 0;
      if (!dryRun && unused.length) {
        const flatCopy = { ...flat };
        for (const u of unused) {
          delete flatCopy[u];
          removedCount++;
        }
        const rebuilt = unflatten(flatCopy);
        writeLocaleFile(localeFile, rebuilt, originalContent);
        log(`Locale ${localeName}: removed ${removedCount} keys`);
      }

      report.locales[localeName] = {
        file: path.relative(projectRoot, localeFile),
        totalKeys: keys.length,
        unusedKeys: unused,
        unusedCount: unused.length,
        filteredByOnlyPrefixes: onlyPrefixes.length ? onlyPrefixes : undefined,
        excludedByPrefixes: excludePrefixes.length ? excludePrefixes : undefined,
        rawUnusedCount: unusedAll.length,
        removed: !dryRun ? removedCount : 0
      };
      if (prefixStatsEnabled) {
        const stats = {};
        for (const key of keys) {
          const parts = key.split('.');
          const depth = Math.min(prefixDepth, parts.length);
          const prefix = parts.slice(0, depth).join('.');
          if (!stats[prefix]) stats[prefix] = { total: 0, unused: 0 };
          stats[prefix].total++;
        }
        for (const u of unused) {
          const parts = u.split('.');
          const depth = Math.min(prefixDepth, parts.length);
          const prefix = parts.slice(0, depth).join('.');
          if (!stats[prefix]) stats[prefix] = { total: 0, unused: 0 };
          stats[prefix].unused++;
        }
        const transformed = Object.fromEntries(
          Object.entries(stats).map(([p, s]) => [p, { ...s, used: s.total - s.unused, unusedRatio: s.total ? +(s.unused / s.total).toFixed(3) : 0 }])
        );
        report.prefixStats[localeName] = transformed;
      }
      report.totals.locales++;
      report.totals.keys += keys.length;
      report.totals.unused += unused.length;
      report.totals.removed += !dryRun ? removedCount : 0;
    }

    // EN: Output summary
    // VI: Xuất tóm tắt
    log('Scan complete. Summary:');
    for (const [loc, info] of Object.entries(report.locales)) {
      log(`  ${loc}: ${info.unusedCount} unused / ${info.totalKeys} total`);
      if (prefixStatsEnabled) {
        const entries = Object.entries(report.prefixStats[loc] || {});
        const top = entries
          .sort((a, b) => b[1].unused - a[1].unused)
          .slice(0, 5)
          .map(([p, s]) => `${p}(${s.unused}/${s.total})`)
          .join(', ');
        if (top) log(`    top unused prefixes: ${top}`);
      }
    }
    log(`Totals: ${report.totals.unused} unused keys across ${report.totals.locales} locales.`);

    if (reportPath) {
      fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf8');
      log(`Report written to ${reportPath}`);
    }

    if (dryRun && report.totals.unused > 0) {
      log('Run with --fix to remove the unused keys.');
      process.exit(1);
    }

    process.exit(0);
  } catch (e) {
    error(e.stack || e.message);
    process.exit(2);
  }
})();
