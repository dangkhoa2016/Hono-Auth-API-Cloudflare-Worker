import test from 'node:test';
import assert from 'node:assert/strict';
import { UserService } from '../../src/services/userService.js';
import { generateActivationToken } from '../../src/services/emailService.js';

const generators = [
  ['user activation and email verification', () => new UserService({}).generateActivationToken()],
  ['manual email activation', () => generateActivationToken()]
];

for (const [name, generate] of generators) {
  test(`T6: ${name} token does not depend on Math.random`, (t) => {
    t.mock.method(Math, 'random', () => { throw new Error('Noncryptographic RNG forbidden'); });
    const tokens = Array.from({ length: 16 }, generate);
    assert.ok(tokens.every(token => /^[A-Za-z0-9]{64}$/.test(token)), 'preserve token wire format');
    assert.equal(new Set(tokens).size, tokens.length, 'independent tokens must not collapse to a constant');
  });

  test(`T6: ${name} token fails closed when secure entropy is unavailable`, (t) => {
    t.mock.method(globalThis.crypto, 'getRandomValues', () => { throw new Error('Secure entropy unavailable'); });
    assert.throws(generate, /Secure entropy unavailable/);
  });
}
