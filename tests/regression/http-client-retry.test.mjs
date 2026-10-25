import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import test from 'node:test';
import { TestClient } from '../utils/testClient.js';

async function withServer(t, handler) {
  const server = createServer(handler);
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  t.after(() => new Promise((resolve, reject) => {
    server.close(error => error ? reject(error) : resolve());
    server.closeAllConnections();
  }));
  const client = new TestClient(`http://127.0.0.1:${server.address().port}`);
  client.defaultOptions.retryDelayMs = 0;
  return client;
}

for (const method of ['POST', 'PUT', 'PATCH', 'DELETE']) {
  test(`${method} does not repeat a side effect after a 503 by default`, async t => {
    let sideEffects = 0;
    const client = await withServer(t, (_request, response) => {
      sideEffects += 1;
      response.writeHead(503, { 'Content-Type': 'application/json' });
      response.end(JSON.stringify({ error: 'Response failed after write' }));
    });

    const response = await client.request(method, '/write', { value: 1 });

    assert.equal(response.status, 503);
    assert.equal(response.success, false);
    assert.equal(sideEffects, 1, 'a failed response must not repeat the mutation');
  });
}

for (const method of ['GET', 'HEAD']) {
  test(`${method} retries are bounded after repeated 503 responses`, async t => {
    let attempts = 0;
    const client = await withServer(t, (_request, response) => {
      attempts += 1;
      response.writeHead(503);
      response.end();
    });

    const response = await client.request(method, '/read');

    assert.equal(response.status, 503);
    assert.equal(response.success, false);
    assert.equal(attempts, 3, 'one original request plus two safe-read retries');
  });
}

test('GET can recover on a retry and does not send remaining attempts', async t => {
  let attempts = 0;
  const client = await withServer(t, (_request, response) => {
    attempts += 1;
    response.writeHead(attempts === 1 ? 503 : 200);
    response.end('ready');
  });

  const response = await client.get('/read');

  assert.equal(response.status, 200);
  assert.equal(response.data, 'ready');
  assert.equal(attempts, 2);
});

test('setup can explicitly opt a POST into a bounded retry count', async t => {
  let sideEffects = 0;
  const client = await withServer(t, (_request, response) => {
    sideEffects += 1;
    response.writeHead(503);
    response.end();
  });

  const response = await client.post('/setup', { value: 1 }, {}, { retries: 1 });

  assert.equal(response.status, 503);
  assert.equal(sideEffects, 2, 'only the caller-authorized retry may repeat setup');
});

test('GET can explicitly disable retries for first-attempt correctness checks', async t => {
  let attempts = 0;
  const client = await withServer(t, (_request, response) => {
    attempts += 1;
    response.writeHead(503);
    response.end();
  });

  const response = await client.get('/read', {}, { retries: 0 });

  assert.equal(response.status, 503);
  assert.equal(attempts, 1);
});

test('retryOnHttp5xx false refuses an HTTP retry even with an explicit count', async t => {
  let attempts = 0;
  const client = await withServer(t, (_request, response) => {
    attempts += 1;
    response.writeHead(503);
    response.end();
  });

  const response = await client.post('/setup', {}, {}, { retries: 2, retryOnHttp5xx: false });

  assert.equal(response.status, 503);
  assert.equal(attempts, 1);
});
