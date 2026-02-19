import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import test, { TestContext } from 'node:test';

import { AppInstance } from '../../../../app.interface';
import {
  formatHeaders,
  getConsumer,
  headerAuthentication
} from '../header-authentication';

test('headerAuthentication', async (t: TestContext) => {
  await t.test(
    'headerAuthentication should register schema and hooks',
    async () => {
      let schemaRegistered = false;
      const hooksRegistered: string[] = [];

      const mockApp = {
        addSchema: () => {
          schemaRegistered = true;
        },
        addHook: (name: string) => {
          hooksRegistered.push(name);
        }
      } as unknown as AppInstance;

      await headerAuthentication(mockApp, {});

      strictEqual(schemaRegistered, true, 'Schema should be registered');
      ok(
        hooksRegistered.includes('onRoute'),
        'onRoute hook should be registered'
      );
      ok(
        hooksRegistered.includes('preHandler'),
        'preHandler hook should be registered'
      );
    }
  );

  await t.test(
    'formatHeaders should be immutable and handle comma-separated groups',
    () => {
      const originalHeaders = {
        'x-consumer-groups': 'admin, test',
        'other-header': 'value'
      };

      const formattedHeaders = formatHeaders(originalHeaders);

      ok(formattedHeaders !== originalHeaders, 'Should return a new object');
      deepStrictEqual(formattedHeaders['x-consumer-groups'], ['admin', 'test']);
      strictEqual(
        originalHeaders['x-consumer-groups'],
        'admin, test',
        'Original should remain unchanged'
      );
    }
  );

  await t.test('getConsumer should correctly parse headers', () => {
    const headers = {
      'x-consumer-id': 'ext-123',
      'x-consumer-custom-id': '456',
      'x-consumer-username': 'jdoe',
      'x-consumer-groups': 'manager',
      'x-anonymous-consumer': 'false'
    };

    const consumer = getConsumer(headers);

    strictEqual(consumer.id, 'ext-123');
    strictEqual(consumer.customId, 456);
    strictEqual(consumer.username, 'jdoe');
    deepStrictEqual(consumer.groups, ['manager']);
    strictEqual(consumer.isAnonymous, false);
  });

  await t.test('getConsumer should handle anonymous user', () => {
    const headers = {
      'x-anonymous-consumer': 'true'
    };

    const consumer = getConsumer(headers);
    strictEqual(consumer.isAnonymous, true);
  });
});
