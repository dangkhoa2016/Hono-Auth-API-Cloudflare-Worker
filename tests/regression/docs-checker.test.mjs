import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const checker = fileURLToPath(new URL('../../tools/check-docs.mjs', import.meta.url));

async function fixture(t, files = {}) {
  const root = await mkdtemp(join(tmpdir(), 'docs-checker-'));
  t.after(() => rm(root, { recursive: true, force: true }));
  const contents = {
    'package.json': JSON.stringify({ scripts: { verify: 'node check.mjs', 'test:unit': 'node --test' } }),
    'README.md': '# Documentation\n',
    'README.vi.md': '# Tài liệu\n',
    'documents/guide.md': '# Guide\n',
    ...files
  };
  for (const [path, content] of Object.entries(contents)) {
    const target = join(root, path);
    await mkdir(dirname(target), { recursive: true });
    await writeFile(target, content);
  }
  return root;
}

function run(root) {
  const result = spawnSync(process.execPath, [checker, root], {
    cwd: tmpdir(), encoding: 'utf8', timeout: 10000
  });
  assert.equal(result.error, undefined, 'the checker process must finish');
  return { status: result.status, output: result.stdout + result.stderr };
}

test('docs CLI accepts relative targets from each document and known npm/yarn scripts', async t => {
  const root = await fixture(t, {
    'README.md': '[Guide](documents/guide.md)\n[Directory](documents)\n`npm run verify`\n',
    'README.vi.md': '[English](README.md)\n`yarn test:unit`\n',
    'documents/guide.md': '[Root](../README.md)\n`yarn run verify`\n`npm run-script test:unit`\n',
    'documents/nested/deep.md': '[Guide](../guide.md)\n`npm run verify -- --verbose`\n'
  });
  const result = run(root);
  assert.equal(result.status, 0, result.output);
  assert.match(result.output, /4 Markdown files/);
});

test('docs CLI fails on an absent file in a recursively discovered guide', async t => {
  const root = await fixture(t, {
    'documents/nested/deep.md': '[Missing](../missing.md)\n'
  });
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.output, /documents\/nested\/deep\.md:1/);
  assert.match(result.output, /missing\.md/);
});

for (const command of ['npm run absent:script', 'yarn absent:script', 'yarn run absent:script']) {
  test(`docs CLI fails on an unknown script: ${command}`, async t => {
    const root = await fixture(t, { 'README.vi.md': `Run \`${command}\`.\n` });
    const result = run(root);
    assert.equal(result.status, 1);
    assert.match(result.output, /README\.vi\.md:1/);
    assert.match(result.output, /unknown script "absent:script"/);
  });
}

test('docs CLI ignores external URLs, anchors, shell placeholders, and package-manager builtins', async t => {
  const root = await fixture(t, {
    'README.md': [
      '[Web](https://unreachable.invalid/missing.md)',
      '[CDN](//unreachable.invalid/image.png)',
      '[Mail](mailto:person@example.invalid)',
      '[Anchor](#unvalidated-anchor)',
      '[Shell](${DOCS_ROOT}/guide.md)',
      '`npm ci` and `npm exec wrangler -- --help`',
      '`npx wrangler --help`, `yarn install`, `yarn add example`, `yarn dlx example`'
    ].join('\n')
  });
  const result = run(root);
  assert.equal(result.status, 0, result.output);
});

test('docs CLI ignores Markdown examples in fences but validates their shell script commands', async t => {
  const root = await fixture(t, {
    'README.md': '```markdown\n[Example](intentionally-missing.md)\n```\n```sh\nnpm run verify\n```\n'
  });
  const valid = run(root);
  assert.equal(valid.status, 0, valid.output);

  await writeFile(join(root, 'README.md'), '```sh\nnpm run absent:script\n```\n');
  const invalid = run(root);
  assert.equal(invalid.status, 1);
  assert.match(invalid.output, /unknown script "absent:script"/);
});

test('docs CLI treats an explicit yarn run of a builtin name as a script reference', async t => {
  const root = await fixture(t, { 'README.md': '`yarn run install`\n' });
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.output, /unknown script "install"/);
});

test('docs CLI decodes local paths while stripping query and anchor before decoding', async t => {
  const root = await fixture(t, {
    'README.md': '[Unicode](assets/caf%C3%A9%20file%23name.md?raw=1#section)\n[Spaces](<assets/a file.md>)\n',
    'assets/café file#name.md': '# Existing\n',
    'assets/a file.md': '# Existing\n'
  });
  const result = run(root);
  assert.equal(result.status, 0, result.output);
});

test('docs CLI checks reference-style file targets and reports malformed URL encoding', async t => {
  const root = await fixture(t, {
    'documents/guide.md': '[See reference][guide]\n\n[guide]: missing.md\n[Bad](invalid%ZZ.md)\n'
  });
  const result = run(root);
  assert.equal(result.status, 1);
  assert.match(result.output, /missing\.md/);
  assert.match(result.output, /invalid URL encoding/);
});
