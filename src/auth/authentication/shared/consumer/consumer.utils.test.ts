import { strictEqual, throws } from 'node:assert';
import test from 'node:test';

import { HeaderApiKey } from '../../header-authentication';
import { getConsumerSource } from './consumer.utils';

// adjust path

test('getConsumerSource utility', async (t) => {
  await t.test(
    'should return "system" if API key exists, even if custom-id is missing',
    () => {
      const headers = {
        [HeaderApiKey]: 'some-api-key'
      };

      const result = getConsumerSource(headers);
      strictEqual(result, 'system');
    }
  );

  await t.test(
    'should return "anonymous" when isConsumerAnonymous is true (and no API key)',
    () => {
      const headers = {
        'x-consumer-groups': 'anonymous' // assuming this triggers isConsumerAnonymous
      };

      const result = getConsumerSource(headers);
      strictEqual(result, 'anonymous');
    }
  );

  await t.test(
    'should return "user" when x-consumer-custom-id is present (and not system/anonymous)',
    () => {
      const headers = {
        'x-consumer-custom-id': '12345'
      };

      const result = getConsumerSource(headers);
      strictEqual(result, 'user');
    }
  );

  await t.test('should prioritize "system" over "anonymous"', () => {
    // If both exist, the 'system' check comes first in your if/else
    const headers = {
      [HeaderApiKey]: 'some-api-key',
      'x-consumer-groups': 'anonymous'
    };

    const result = getConsumerSource(headers);
    strictEqual(result, 'system');
  });

  await t.test('should prioritize "anonymous" over "user"', () => {
    // If it's flagged anonymous, it shouldn't reach the 'user' block
    const headers = {
      'x-consumer-custom-id': '12345',
      'x-consumer-groups': 'anonymous'
    };

    const result = getConsumerSource(headers);
    strictEqual(result, 'anonymous');
  });

  await t.test('should throw an error if no matching headers are found', () => {
    const headers = {};

    throws(
      () => {
        getConsumerSource(headers);
      },
      {
        message: 'Consumer source not found'
      }
    );
  });
});
