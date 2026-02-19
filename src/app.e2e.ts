import assert from 'node:assert';
import test from 'node:test';

import { buildApp } from './app';
import { AppInstance } from './app.interface';

test('App E2E', (t) => {
  let app: AppInstance;

  t.before(async () => {
    app = await buildApp();
  });

  t.after(async () => {
    await app.close();
  });

  t.test('Healthy should return 200', async () => {
    const response = await app.inject({
      method: 'GET',
      url: '/healthy'
    });

    assert.strictEqual(response.statusCode, 200);
  });
});
