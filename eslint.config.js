import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';
import { readFileSync } from 'node:fs';

// Keep project rule choices in one place. ESLint 10 loads this flat config;
// .eslintrc.json supplies rule data only, not legacy configuration discovery.
const policy = JSON.parse(readFileSync(new URL('./.eslintrc.json', import.meta.url), 'utf8'));
const legacyIgnores = readFileSync(new URL('./.eslintignore.legacy', import.meta.url), 'utf8')
  .split(/\r?\n/).map(line => line.trim()).filter(line => line && !line.startsWith('#'));
// Legacy ignore patterns without a slash match at every directory depth.
const ignoreGlob = pattern => pattern.replace(/\/$/, '').includes('/') ? pattern : `**/${pattern}`;
const nodeGlobals = { ...globals.node, ...globals.es2021 };
const browserGlobals = { ...globals.browser, ...nodeGlobals, ...policy.globals };
const nodeOnlyGlobals = Object.fromEntries(Object.keys(globals.browser).map(name => [name, 'off']));

export default defineConfig([
  { ignores: [...legacyIgnores, ...policy.ignorePatterns].map(ignoreGlob) },
  {
    files: ['**/*.js', '**/*.mjs'],
    extends: [js.configs.recommended],
    languageOptions: { ecmaVersion: 'latest', sourceType: 'module', globals: browserGlobals },
    // Match the previous catch-variable policy; fixtures intentionally ignore
    // caught exceptions. Other unused-variable errors remain enabled.
    rules: {
      ...policy.rules,
      // Keep v8 recommended protections that v10 no longer includes by default.
      'no-extra-semi': 'error',
      'no-inner-declarations': ['error', 'functions', { blockScopedFunctions: 'disallow' }],
      'no-mixed-spaces-and-tabs': 'error',
      'no-unused-vars': ['error', { argsIgnorePattern: '^_', caughtErrors: 'none' }],
      // These v10 recommended additions were not in the established v8 policy.
      // Adopt them separately from the tooling migration and runtime changes.
      'no-useless-assignment': 'off',
      'preserve-caught-error': 'off'
    },
    linterOptions: { reportUnusedDisableDirectives: 'off' }
  },
  ...policy.overrides.map(override => ({
    files: override.files,
    rules: override.rules,
    ...(override.env?.browser === false ? {
      languageOptions: { globals: { ...nodeOnlyGlobals, ...nodeGlobals } }
    } : {})
  }))
]);
