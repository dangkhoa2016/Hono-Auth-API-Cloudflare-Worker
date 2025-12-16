// Basic test to validate dynamic route detection logic for parameterized and exact routes
// This is a lightweight ad-hoc test (not part of full framework) to quickly confirm detection.
// Run with: node tests/routeDetectionTest.js

import { detectFromRegistry } from '../src/middleware/routeDetector.js';
import { registerRoute, clearRegistry } from '../src/constants/routeRegistry.js';

// Manually seed a minimal registry to avoid importing full routeDefinitions (which triggers heavy service imports)
function seedRegistry() {
  clearRegistry();
  registerRoute('auth', 'GET', '/api/auth/login', { description: 'Login route', logName: 'AuthLogin' });
  registerRoute('admin', 'GET', '/api/admin/users/:id', { description: 'Admin user detail', permissions: ['admin'], logName: 'AdminUserDetail' });
}

seedRegistry();

function assert(condition, message) {
  if (!condition) {
    console.error('Assertion failed:', message);
    process.exit(1);
  }
}

function testExact() {
  const key = 'GET /api/auth/login';
  const [method, path] = ['GET', '/api/auth/login'];
  const detected = detectFromRegistry(path, method);
  assert(detected, 'Exact route should be detected');
  assert(detected.pattern === key, 'Pattern should equal exact key');
  assert(detected.name === 'AuthLogin', 'Should use logName for exact route');
}

function testParameterized() {
  // Find a parameterized route, e.g., having :id
  const testPath = '/api/admin/users/123';
  const detected = detectFromRegistry(testPath, 'GET');
  assert(detected, 'Parameterized route should be detected');
  assert(detected.name === 'AdminUserDetail', 'Should use logName for parameter route');
}

function testRegistryReset() {
  clearRegistry();
  const missing = detectFromRegistry('/api/auth/login', 'GET');
  assert(!missing, 'Route should not be detected after registry reset');
  seedRegistry();
}

function run() {
  testRegistryReset();
  testExact();
  testParameterized();
  console.log('routeDetectionTest: PASS');
}

run();
