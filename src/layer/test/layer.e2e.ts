import test, { TestContext } from 'node:test';

import { IncomingHttpHeaders } from 'http';
import nock from 'nock';

import { resetDatabase } from '../../../scripts/src/seeder';
import { buildApp } from '../../app';
import { AppInstance } from '../../app.interface';
import {
  HEADERS_ADMIN,
  HEADERS_ANONYMOUS,
  HEADERS_USER_1,
  HEADERS_USER_2
} from '../../auth/test/auth.mock';
import { syncUsers } from '../../user/test/user.mock';
import { ILayer, ILayerIn } from '../layer.interface';
import { LayerService } from '../layer.service';
import { IRouteConfig } from '../permission/kong-permission/layer-permission-kong.interface';
import {
  LAYER_MOCK_1,
  LAYER_MOCK_2,
  appendLayers,
  createLayer
} from './layer.mock';

test('Layer', async (t: TestContext) => {
  let app: AppInstance;
  let layerService: LayerService;
  let layers: ILayer[];

  t.before(async () => {
    // Mock OGC_WSS_HOSTS to include the restricted host
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    process.env.OGC_WSS_HOSTS = 'http://restricted-host' as any;
    app = await buildApp();
    await resetDatabase(app);
    await syncUsers(app);
    layerService = new LayerService(app);
    layers = await appendLayers(app);
  });

  t.after(async () => {
    await app.close();
  });

  t.test('Creates', async (t: TestContext) => {
    t.test('Should create for admin user', async (t: TestContext) => {
      const response = await createLayer(app, HEADERS_ADMIN, LAYER_MOCK_1);
      t.assert.equal(response.statusCode, 201);

      const result = response.json<ILayer>();
      t.assert.equal(result.type, LAYER_MOCK_1.type);
      t.assert.equal(
        result.layerOptions?.title,
        LAYER_MOCK_1.layerOptions?.title
      );
    });

    t.test('Should fail on invalid body', async (t: TestContext) => {
      const { type, ...mock } = { ...LAYER_MOCK_1 };
      const response = await createLayer(app, HEADERS_ADMIN, mock as ILayerIn);
      t.assert.equal(response.statusCode, 400);
    });

    t.test('Should not create for anonymous user', async (t: TestContext) => {
      const response = await createLayer(app, HEADERS_ANONYMOUS, LAYER_MOCK_2);
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should create for authenticated user', async (t: TestContext) => {
      const response = await createLayer(app, HEADERS_USER_1, LAYER_MOCK_2);
      t.assert.equal(response.statusCode, 201);
    });
  });

  // ----------------------------------------------------------------

  t.test('GET', async (t: TestContext) => {
    t.test('Should list all layer for admin user', async (t: TestContext) => {
      const response = await getLayers(HEADERS_ADMIN);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<ILayer[]>();
      t.assert.equal(result.length >= 4, true);
      t.assert.equal(
        result[0].layerOptions?.title,
        LAYER_MOCK_1.layerOptions?.title
      );
    });

    t.test('Should not list for anonymous user', async (t: TestContext) => {
      const response = await getLayers(HEADERS_ANONYMOUS);
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should not list for authenticated user', async (t: TestContext) => {
      const response = await getLayers(HEADERS_USER_1);
      t.assert.equal(response.statusCode, 403);
    });
  });

  // ----------------------------------------------------------------

  t.test('PATCH', async (t: TestContext) => {
    t.test(
      'Should patch for admin user with the good data',
      async (t: TestContext) => {
        const layer = layers[1];
        const response = await updateLayer(HEADERS_ADMIN, layer.id, {
          sourceOptions: {
            type: 'wms',
            url: '',
            version: '1.3.0',
            params: {}
          }
        });
        t.assert.equal(response.statusCode, 200);

        const result = (await getLayer(HEADERS_ADMIN, layer.id)).json();
        t.assert.equal(result.type, layer.type);
        t.assert.equal(result.sourceOptions?.version, '1.3.0');
      }
    );

    t.test('Should not patch for anonymous user', async (t: TestContext) => {
      const layer = layers[1];

      const response = await updateLayer(HEADERS_ANONYMOUS, layer.id, {
        sourceOptions: {
          type: 'wms',
          url: '',
          version: '1.3.0',
          params: {}
        }
      });
      t.assert.equal(response.statusCode, 403);
    });
    t.test(
      'Should not patch for authenticated user',
      async (t: TestContext) => {
        const layer = layers[1];

        const response = await updateLayer(HEADERS_USER_1, layer.id, {
          sourceOptions: {
            type: 'wms',
            url: '',
            version: '1.3.0',
            params: {}
          }
        });
        t.assert.equal(response.statusCode, 403);
      }
    );
  });

  // ----------------------------------------------------------------

  t.test('GET by ID', async (t: TestContext) => {
    t.test('Should handle layer not found', async (t: TestContext) => {
      const response = await getLayer(HEADERS_ADMIN, 1234456);
      t.assert.equal(response.statusCode, 404);
    });

    t.test('Should get any layer for admin user', async (t: TestContext) => {
      const layer = layers[1];

      const response = await getLayer(HEADERS_ADMIN, layer.id);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<ILayer>();
      t.assert.equal(result.layerOptions?.title, layer.layerOptions?.title);
      t.assert.equal(result.type, layer.type);
    });

    t.test(
      'Should not get layer for anonymous user',
      async (t: TestContext) => {
        const layer = layers[1];

        const response = await getLayer(HEADERS_ANONYMOUS, layer.id);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should get any layer for authenticated user',
      async (t: TestContext) => {
        const layer = await createLayer(app, HEADERS_USER_1, LAYER_MOCK_1);

        const response = await getLayer(HEADERS_USER_2, layer.json().id);
        t.assert.equal(response.statusCode, 200);
      }
    );

    t.test(
      'Should return 400 if the ID is not a number',
      async (t: TestContext) => {
        const response = await app.inject({
          method: 'GET',
          url: '/layers/abc'
        });
        t.assert.equal(response.statusCode, 400);
      }
    );

    t.test(
      "Should return 403 if the user is authenticated but doesn't have permission for the layer URL",
      async (t: TestContext) => {
        const restrictedLayer = await createLayer(app, HEADERS_ADMIN, {
          ...LAYER_MOCK_1,
          url: 'http://restricted-host/apis/layer'
        });
        const layerId = restrictedLayer.json().id;

        // Mock Kong API to return 403 for this route
        nock(app.env.KONG_API)
          .get('/routes')
          .reply(200, {
            data: [
              {
                id: '1',
                paths: ['/apis/layer'],
                methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE'],
                service: { id: 101 }
              } as IRouteConfig
            ]
          });

        nock(app.env.KONG_API)
          .get('/services/101/plugins')
          .reply(200, {
            data: [
              {
                name: 'acl',
                enabled: true,
                config: {
                  allow: ['admin'] // User 1 prefix is not admin
                }
              }
            ]
          });

        const response = await getLayer(HEADERS_USER_1, layerId);
        t.assert.equal(response.statusCode, 403);

        nock.cleanAll();
      }
    );
  });

  // ----------------------------------------------------------------

  t.test('DELETE', async (t: TestContext) => {
    t.test('Should not delete for anonymous user', async (t: TestContext) => {
      const layer = layers[1];
      const response = await deleteLayer(HEADERS_ANONYMOUS, layer.id);
      t.assert.equal(response.statusCode, 403);
    });

    t.test(
      'Should not delete for authenticated user',
      async (t: TestContext) => {
        const layer = layers[1];
        const response = await deleteLayer(HEADERS_USER_1, layer.id);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test('Should delete for admin user', async (t: TestContext) => {
      const layer = layers[1];
      const response = await deleteLayer(HEADERS_ADMIN, layer.id);
      t.assert.equal(response.statusCode, 204);
    });
  });

  // ----------------------------------------------------------------

  t.test('Service Logic (getLayerOrCreate)', async (t: TestContext) => {
    t.test(
      'Should create a new layer if it does not exist',
      async (t: TestContext) => {
        const sourceOptions = {
          ...LAYER_MOCK_1.sourceOptions!,
          url: 'http://example.com/new-service-layer'
        };

        const layer = await layerService.getLayerOrCreate(
          undefined,
          sourceOptions
        );
        t.assert.ok(layer);
        t.assert.ok(layer?.id);
        t.assert.equal(layer?.url, sourceOptions.url);
      }
    );

    t.test(
      'Should return existing layer if it exists',
      async (t: TestContext) => {
        const sourceOptions = {
          ...LAYER_MOCK_1.sourceOptions!,
          url: 'http://example.com/existing-service-layer'
        };
        const firstLayer = await layerService.getLayerOrCreate(
          undefined,
          sourceOptions
        );
        t.assert.ok(firstLayer);

        const secondLayer = await layerService.getLayerOrCreate(
          undefined,
          sourceOptions
        );
        t.assert.ok(secondLayer);
        t.assert.equal(firstLayer?.id, secondLayer?.id);

        const allLayers = await layerService.getAll();
        const matchingLayers = allLayers.filter(
          (l) => l.url === sourceOptions.url
        );
        t.assert.equal(matchingLayers.length, 1);
      }
    );

    t.test(
      'Should throw badRequest if url is missing and layer does not exist',
      async (t: TestContext) => {
        const sourceOptions = {
          ...LAYER_MOCK_1.sourceOptions!,
          url: undefined
        };

        await t.assert.rejects(
          layerService.getLayerOrCreate(undefined, sourceOptions as never),
          (err) => {
            const error = err as { statusCode: number; message: string };
            return (
              error.statusCode === 400 &&
              error.message === 'SourceOptions url is required'
            );
          }
        );
      }
    );
  });

  async function getLayers(headers: IncomingHttpHeaders) {
    const response = await app.inject({
      method: 'GET',
      headers,
      url: `/layers`
    });

    return response;
  }

  async function getLayer(headers: IncomingHttpHeaders, id: number) {
    const response = await app.inject({
      method: 'GET',
      headers,
      url: `/layers/${id}`
    });

    return response;
  }

  async function updateLayer(
    headers: IncomingHttpHeaders,
    id: number,
    payload: Partial<ILayerIn>
  ) {
    const response = await app.inject({
      method: 'PATCH',
      headers,
      url: `/layers/${id}`,
      body: payload
    });

    return response;
  }
  async function deleteLayer(headers: IncomingHttpHeaders, id: number) {
    const response = await app.inject({
      method: 'DELETE',
      headers,
      url: `/layers/${id}`
    });

    return response;
  }
});
