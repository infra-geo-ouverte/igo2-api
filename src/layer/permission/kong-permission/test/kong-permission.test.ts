import { strictEqual } from 'node:assert/strict';
import test, { TestContext } from 'node:test';

import nock from 'nock';

import { AppInstance } from '../../../../app.interface';
import { IRouteConfig } from '../layer-permission-kong.interface';
import { LayerPermissionKongApi } from '../layer-permission-kong.service';

const MOCK_APP = {
  env: {
    KONG_API: 'http://kong-api',
    OGC_WSS_HOSTS: 'http://test.com',
    OGC_WSS_BASE_PATHS: ['/api/v1']
  }
} as unknown as AppInstance;

test('KongPermission', async (t: TestContext) => {
  const service = new LayerPermissionKongApi(MOCK_APP);

  t.beforeEach(() => {
    nock.cleanAll();
  });

  await t.test(
    'verifyPermissionByUrl - Should return false when no route matches the URI',
    async () => {
      nock('http://kong-api').get('/routes').reply(200, { data: [] });

      const result = await service.verifyPermissionByUrl(
        'http://test.com/api/v1/unknown',
        []
      );
      strictEqual(result, false);
    }
  );

  await t.test(
    'verifyPermissionByUrl - Should return false when route is found but has no service',
    async () => {
      nock('http://kong-api')
        .get('/routes')
        .reply(200, {
          data: [
            {
              id: '1',
              paths: ['/api/v1']
            } as IRouteConfig
          ]
        });

      const result = await service.verifyPermissionByUrl(
        'http://test.com/api/v1/resource',
        []
      );
      strictEqual(result, false);
    }
  );

  await t.test(
    'verifyPermissionByUrl - Should return true when no plugins are configured',
    async () => {
      nock('http://kong-api')
        .get('/routes')
        .reply(200, {
          data: [
            {
              id: '1',
              paths: ['/api/v1'],
              service: { id: 101 }
            } as IRouteConfig
          ]
        });

      nock('http://kong-api')
        .get('/services/101/plugins')
        .reply(200, { data: [] });

      const result = await service.verifyPermissionByUrl(
        'http://test.com/api/v1/resource',
        []
      );
      strictEqual(result, true);
    }
  );

  await t.test(
    'verifyPermissionByUrl - Should return true when ACL plugin is disabled',
    async () => {
      nock('http://kong-api')
        .get('/routes')
        .reply(200, {
          data: [
            {
              id: '1',
              paths: ['/api/v1'],
              service: { id: 101 }
            } as IRouteConfig
          ]
        });

      nock('http://kong-api')
        .get('/services/101/plugins')
        .reply(200, {
          data: [
            {
              name: 'acl',
              enabled: false,
              config: { allow: ['admin'] }
            }
          ]
        });

      const result = await service.verifyPermissionByUrl(
        'http://test.com/api/v1/resource',
        ['user']
      );
      strictEqual(result, true);
    }
  );

  await t.test('verifyPermissionByUrl - ACL allow rules', async () => {
    const route = {
      id: '1',
      paths: ['/api/v1'],
      service: { id: 101 }
    } as IRouteConfig;

    nock('http://kong-api')
      .get('/routes')
      .reply(200, { data: [route] })
      .persist();

    nock('http://kong-api')
      .get('/services/101/plugins')
      .reply(200, {
        data: [
          {
            name: 'acl',
            enabled: true,
            config: { allow: ['admin', 'manager'] }
          }
        ]
      })
      .persist();

    strictEqual(
      await service.verifyPermissionByUrl('http://test.com/api/v1/resource', [
        'admin'
      ]),
      true,
      'Allow admin'
    );
    strictEqual(
      await service.verifyPermissionByUrl('http://test.com/api/v1/resource', [
        'user'
      ]),
      false,
      'Deny user'
    );
  });

  await t.test('verifyPermissionByUrl - ACL deny rules', async () => {
    const route = {
      id: '1',
      paths: ['/api/v1'],
      service: { id: 101 }
    } as IRouteConfig;

    nock('http://kong-api')
      .get('/routes')
      .reply(200, { data: [route] })
      .persist();

    nock('http://kong-api')
      .get('/services/101/plugins')
      .reply(200, {
        data: [
          {
            name: 'acl',
            enabled: true,
            config: { deny: ['banned'] }
          }
        ]
      })
      .persist();

    strictEqual(
      await service.verifyPermissionByUrl('http://test.com/api/v1/resource', [
        'user'
      ]),
      true,
      'Allow user'
    );
    strictEqual(
      await service.verifyPermissionByUrl('http://test.com/api/v1/resource', [
        'banned'
      ]),
      false,
      'Deny banned'
    );
  });

  await t.test('verifyPermissionByUrl - ACL allow and deny rules', async () => {
    const route = {
      id: '1',
      paths: ['/api/v1'],
      service: { id: 101 }
    } as IRouteConfig;

    nock('http://kong-api')
      .get('/routes')
      .reply(200, { data: [route] })
      .persist();

    nock('http://kong-api')
      .get('/services/101/plugins')
      .reply(200, {
        data: [
          {
            name: 'acl',
            enabled: true,
            config: {
              allow: ['user', 'admin'],
              deny: ['admin']
            }
          }
        ]
      })
      .persist();

    strictEqual(
      await service.verifyPermissionByUrl('http://test.com/api/v1/resource', [
        'user'
      ]),
      true,
      'Allow user'
    );
    strictEqual(
      await service.verifyPermissionByUrl('http://test.com/api/v1/resource', [
        'admin'
      ]),
      false,
      'Deny admin even if allowed if also denied'
    );
  });
});
