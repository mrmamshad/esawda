import assert from 'node:assert/strict';
import test from 'node:test';

test('rewrites browser API requests to the configured backend origin', async () => {
  const previousTarget = process.env.API_PROXY_TARGET;
  process.env.API_PROXY_TARGET = 'https://api.example.test///';

  try {
    const { default: config } = await import(`../next.config.mjs?test=${Date.now()}`);

    assert.deepEqual(await config.rewrites(), [
      {
        source: '/backend-api/:path*',
        destination: 'https://api.example.test/:path*',
      },
    ]);
  } finally {
    if (previousTarget === undefined) delete process.env.API_PROXY_TARGET;
    else process.env.API_PROXY_TARGET = previousTarget;
  }
});
