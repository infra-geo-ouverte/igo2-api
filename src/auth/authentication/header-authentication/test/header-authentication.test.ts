import { deepStrictEqual, ok, strictEqual } from 'node:assert/strict';
import test, { TestContext } from 'node:test';

import { AppInstance } from '../../../../app.interface';
import { IUserConsumer } from '../../shared/consumer';
import { headerAuthentication } from '../header-authentication';
import { HeaderAuthenticationService } from '../header-authentication.service';

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
        },
        decorate: () => void 0
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

      const authService = new HeaderAuthenticationService();
      const consumerGroups = authService['getHeaderGroups'](originalHeaders);

      deepStrictEqual(consumerGroups, ['admin', 'test']);
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

    const authService = new HeaderAuthenticationService();
    const consumer = authService.getConsumer(headers) as IUserConsumer;

    strictEqual(consumer.id, 'ext-123');
    strictEqual(consumer.customId, 456);
    strictEqual(consumer.username, 'jdoe');
    deepStrictEqual(consumer.groups, ['manager']);
  });

  await t.test('getConsumer should handle anonymous user', () => {
    const headers = {
      'x-anonymous-consumer': 'true'
    };

    const authService = new HeaderAuthenticationService();
    const consumer = authService.getConsumer(headers) as IUserConsumer;
    strictEqual(consumer.source, 'anonymous');
  });

  await t.test('getConsumer should handle missing headers', () => {
    const headers = {};

    const authService = new HeaderAuthenticationService();

    strictEqual(authService.getConsumer(headers), undefined);
  });

  await t.test('getConsumer should handle invalid customId', () => {
    const headers = {
      'x-consumer-custom-id': 'invalid'
    };

    const authService = new HeaderAuthenticationService();
    const consumer = authService.getConsumer(headers) as IUserConsumer;

    ok(isNaN(consumer.customId));
  });
});
