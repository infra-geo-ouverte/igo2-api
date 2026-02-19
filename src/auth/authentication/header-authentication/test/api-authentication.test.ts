/* eslint-disable @typescript-eslint/no-explicit-any */
import { ok, strictEqual } from 'node:assert/strict';
import test, { TestContext } from 'node:test';

import axios from 'axios';

import { AppInstance } from '../../../../app.interface';
import { apiAuthentication } from '../api-authentication';

const MOCK_APP = {
  env: {
    ADMIN_KEY: 'test-api-key'
  },
  addHook: () => void 0
} as unknown as AppInstance;

test('apiAuthentication', async (t: TestContext) => {
  await t.test('should append x-api-key when withApiKey is true', async () => {
    const client = axios.create();
    apiAuthentication(MOCK_APP, [{ client, options: { withApiKey: true } }]);

    // Trigger the request interceptor manually
    const config = await (
      client.interceptors.request as any
    ).handlers[0].fulfilled({ headers: {} });
    strictEqual(config.headers['x-api-key'], 'test-api-key');
  });

  await t.test(
    'should forward authorization header when withAuthorization is true',
    async () => {
      let capturedHook: any;
      const mockApp = {
        ...MOCK_APP,
        addHook: (name: string, hook: any) => {
          if (name === 'onRequest') capturedHook = hook;
        }
      } as any;

      const client = axios.create();
      apiAuthentication(mockApp, [
        { client, options: { withAuthorization: true } }
      ]);

      ok(capturedHook, 'onRequest hook should be registered');

      const mockRequest = { headers: { authorization: 'Bearer token' } };

      // Simulate Fastify hook execution
      await new Promise<void>((resolve) => {
        capturedHook(mockRequest, {}, async () => {
          // Trigger the axios interceptor while inside the context
          const config = await (
            client.interceptors.request as any
          ).handlers[0].fulfilled({ headers: {} });
          strictEqual(config.headers['authorization'], 'Bearer token');
          resolve();
        });
      });
    }
  );

  await t.test('should handle array headers correctly', async () => {
    let capturedHook: any;
    const mockApp = {
      ...MOCK_APP,
      addHook: (name: string, hook: any) => {
        if (name === 'onRequest') capturedHook = hook;
      }
    } as any;

    const client = axios.create();
    apiAuthentication(mockApp, [{ client, options: { withConsumer: true } }]);

    const mockRequest = {
      headers: {
        'x-consumer-groups': ['group1', 'group2']
      }
    };

    await new Promise<void>((resolve) => {
      capturedHook(mockRequest, {}, async () => {
        const config = await (
          client.interceptors.request as any
        ).handlers[0].fulfilled({ headers: {} });
        // Axios should receive the array as is, or we can check how it's handled
        deepStrictEqual(config.headers['x-consumer-groups'], [
          'group1',
          'group2'
        ]);
        resolve();
      });
    });
  });

  await t.test(
    'should not forward headers if not allowed for that client',
    async () => {
      let capturedHook: any;
      const mockApp = {
        ...MOCK_APP,
        addHook: (name: string, hook: any) => {
          if (name === 'onRequest') capturedHook = hook;
        }
      } as any;

      const client = axios.create();
      // Only withApiKey, no forwarding
      apiAuthentication(mockApp, [{ client, options: { withApiKey: true } }]);

      // Even if hook is registered (because of other clients maybe?), it shouldn't be here since no client wants forwarding
      // But in our case, if no client wants forwarding, the hook isn't even registered.
      strictEqual(
        capturedHook,
        undefined,
        'onRequest hook should NOT be registered if no client needs forwarding'
      );
    }
  );
});

function deepStrictEqual(actual: any, expected: any) {
  strictEqual(JSON.stringify(actual), JSON.stringify(expected));
}
