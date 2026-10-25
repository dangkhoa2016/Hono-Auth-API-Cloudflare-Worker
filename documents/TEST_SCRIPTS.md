# Test scripts

English | [Tiếng Việt](TEST_SCRIPTS.vi.md)

See the [current verification guide](TEST_GUIDE.md) for canonical checks, server-suite prerequisites, fixtures and evidence limits. The actual script list lives in [package.json](../package.json); historical test names do not identify CI coverage.

```bash
npm run verify
npm run test:regression
npm run test:unified:help
```

`npm test` is an interactive menu with local data initialization; do not use it as a CI check. Many old suites invoke Yarn internally. Never run fixture resets against remote data.
