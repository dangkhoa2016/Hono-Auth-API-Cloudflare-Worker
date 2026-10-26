import test from 'node:test';
import assert from 'node:assert/strict';
import { ESLint } from 'eslint';
import { fileURLToPath } from 'node:url';

const cwd = fileURLToPath(new URL('../..', import.meta.url));
const eslint = new ESLint({ cwd });
const rulesFor = async (source, filePath) => (await eslint.lintText(source, { filePath }))[0].messages.map(message => message.ruleId);

for (const [rule, source] of [
  ['no-extra-semi', 'export const probe = 1;;\n'],
  ['no-inner-declarations', 'if (true) { function scoped() {} scoped(); }\n'],
  ['no-mixed-spaces-and-tabs', 'export const probe = 1;\n \t// Mixed indentation\n']
]) {
  test(`the pre-upgrade ${rule} protection remains enforced`, async () => {
    assert.ok((await rulesFor(source, 'src/lint-policy-probe.js')).includes(rule));
  });
}

test('lint still rejects undefined names and unused variables in application source', async () => {
  const rules = await rulesFor('const unused = missingName;\n', 'src/lint-policy-probe.js');
  assert.ok(rules.includes('no-undef'));
  assert.ok(rules.includes('no-unused-vars'));
});

test('Worker Web APIs and Node test APIs remain recognized globals', async () => {
  const source = 'export const probe = () => new Response(Buffer.from(process.version));\n';
  assert.deepEqual(await rulesFor(source, 'src/lint-policy-probe.js'), []);
});

test('tests retain console and async fixture allowances while tools stay strict', async () => {
  const source = 'export async function probe() { console.log(\'fixture\'); }\n';
  const testRules = await rulesFor(source, 'tests/regression/lint-policy-probe.mjs');
  assert.ok(!testRules.includes('no-console'));
  assert.ok(!testRules.includes('require-await'));
  const toolRules = await rulesFor(source, 'tools/check-docs.mjs');
  assert.ok(toolRules.includes('no-console'));
  assert.ok(toolRules.includes('require-await'));
});

test('Node operator tools do not silently accept browser-only globals', async () => {
  const rules = await rulesFor('export const probe = () => window.location;\n', 'tools/check-docs.mjs');
  assert.ok(rules.includes('no-undef'));
});

test('legacy/generated JavaScript stays excluded without excluding canonical mjs regression tests', async () => {
  for (const path of ['tests/legacy/probe.js', 'dist/probe.js', 'nested/dist/probe.js', 'nested/build/probe.js',
    'nested/migrations/probe.js', 'nested/.wrangler/probe.js', 'nested/probe.min.js', 'nested/probe.test.js', '.wrangler/probe.js']) {
    assert.equal(await eslint.isPathIgnored(path), true, path);
  }
  assert.equal(await eslint.isPathIgnored('tests/regression/lint-policy-probe.mjs'), false);
});
