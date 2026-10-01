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
import {
  ILayer,
  ILayerIn,
  ILayerMigrateBatch,
  ILayerSearchResult,
  SourceOptions
} from '../layer.interface';
import { LayerService } from '../layer.service';
import { IRouteConfig } from '../permission/kong-permission/layer-permission-kong.interface';
import { getParamsLayers } from '../utils';
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

    t.test(
      'Should not store type, url or layers in sourceOptions column',
      async (t: TestContext) => {
        const payload = {
          ...LAYER_MOCK_2,
          url: 'http://sanitize.test.com/create',
          sourceOptions: {
            ...LAYER_MOCK_2.sourceOptions!,
            url: 'http://sanitize.test.com/create'
          }
        };
        const response = await createLayer(app, HEADERS_ADMIN, payload);
        t.assert.equal(response.statusCode, 201);

        const result = response.json<ILayer>();
        // Unique-key fields must not be duplicated inside sourceOptions
        t.assert.equal(result.sourceOptions?.['type'], undefined);
        t.assert.equal(result.sourceOptions?.['url'], undefined);
        const params = result.sourceOptions?.params as
          Record<string, unknown> | undefined;
        t.assert.equal(params?.['LAYERS'], undefined);
        t.assert.equal(params?.['layers'], undefined);
      }
    );

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
      t.assert.ok(result.length >= 4, 'expected at least four layers');
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

    t.test(
      'Should search layers and return formatted items',
      async (t: TestContext) => {
        const response = await searchLayers(HEADERS_USER_1, {
          q: 'msp',
          type: 'layer',
          limit: 10,
          page: 1
        });
        t.assert.equal(response.statusCode, 200);

        const result = response.json<ILayerSearchResult>();
        t.assert.equal(Array.isArray(result.items), true);
        t.assert.ok(result.items.length > 0, 'expected at least one result');
        t.assert.equal(result.items[0].properties.type, 'layer');
        t.assert.equal(result.items[0].properties.format, 'wms');
        t.assert.equal(
          result.items.some(
            (item) =>
              item.properties.title === LAYER_MOCK_2.layerOptions?.title &&
              item.properties.url === LAYER_MOCK_2.url
          ),
          true
        );
      }
    );

    t.test(
      'Should search layers by metadata keyword',
      async (t: TestContext) => {
        const response = await searchLayers(HEADERS_USER_1, {
          q: 'urgence',
          type: 'layer',
          limit: 10,
          page: 1
        });
        t.assert.equal(response.statusCode, 200);

        const result = response.json<ILayerSearchResult>();
        t.assert.equal(
          result.items.some(
            (item) =>
              item.properties.title === LAYER_MOCK_2.layerOptions?.title &&
              item.properties.keywords?.includes('urgence')
          ),
          true
        );
      }
    );

    t.test(
      'Should escape HTML in search highlight title',
      async (t: TestContext) => {
        const payload: ILayerIn = {
          ...LAYER_MOCK_1,
          url: 'http://sanitize.test.com/highlight-title',
          layerOptions: {
            ...LAYER_MOCK_1.layerOptions,
            title: 'Foret <img src=x onerror=alert(1)>'
          },
          sourceOptions: {
            ...LAYER_MOCK_1.sourceOptions!,
            url: 'http://sanitize.test.com/highlight-title'
          }
        };

        const createResponse = await createLayer(app, HEADERS_ADMIN, payload);
        t.assert.equal(createResponse.statusCode, 201);

        const response = await searchLayers(HEADERS_ADMIN, {
          q: 'foret',
          type: 'layer',
          limit: 20,
          page: 1
        });
        t.assert.equal(response.statusCode, 200);

        const result = response.json<ILayerSearchResult>();
        const item = result.items.find(
          (candidate) =>
            candidate.properties.url ===
            'http://sanitize.test.com/highlight-title'
        );

        t.assert.ok(item);
        t.assert.equal(
          item?.highlight.title?.includes('&lt;img src=x onerror=alert(1)&gt;'),
          true
        );
        t.assert.equal(
          item?.highlight.title?.includes('<img src=x onerror=alert(1)>'),
          false
        );
        t.assert.equal(item?.highlight.title?.includes('<strong>'), true);
      }
    );

    t.test(
      'Should paginate on authorized search results',
      async (t: TestContext) => {
        const deniedUrl =
          'http://restricted-host/apis/search-pagination-denied';
        const allowedUrl1 = 'http://example.com/search-pagination-allowed-1';
        const allowedUrl2 = 'http://example.com/search-pagination-allowed-2';

        nock(app.env.KONG_API)
          .persist()
          .get('/routes')
          .reply(200, {
            data: [
              {
                id: 'search-pagination-route',
                paths: ['/apis/search-pagination-denied'],
                methods: ['GET'],
                service: { id: 202 }
              } as IRouteConfig
            ]
          });

        nock(app.env.KONG_API)
          .persist()
          .get('/services/202/plugins')
          .reply(200, {
            data: [
              {
                name: 'acl',
                enabled: true,
                config: {
                  allow: ['admin']
                }
              }
            ]
          });

        const candidates: ILayerIn[] = [
          {
            ...LAYER_MOCK_1,
            url: deniedUrl,
            layerOptions: {
              ...LAYER_MOCK_1.layerOptions,
              title: 'pagtest pagtest pagtest'
            },
            sourceOptions: {
              ...LAYER_MOCK_1.sourceOptions!,
              url: deniedUrl
            }
          },
          {
            ...LAYER_MOCK_1,
            url: allowedUrl1,
            layerOptions: {
              ...LAYER_MOCK_1.layerOptions,
              title: 'pagtest pagtest'
            },
            sourceOptions: {
              ...LAYER_MOCK_1.sourceOptions!,
              url: allowedUrl1
            }
          },
          {
            ...LAYER_MOCK_1,
            url: allowedUrl2,
            layerOptions: {
              ...LAYER_MOCK_1.layerOptions,
              title: 'pagtest'
            },
            sourceOptions: {
              ...LAYER_MOCK_1.sourceOptions!,
              url: allowedUrl2
            }
          }
        ];

        for (const candidate of candidates) {
          const createResponse = await createLayer(
            app,
            HEADERS_ADMIN,
            candidate
          );
          t.assert.equal(createResponse.statusCode, 201);
        }

        const firstPageResponse = await searchLayers(HEADERS_USER_1, {
          q: 'pagtest',
          type: 'layer',
          limit: 1,
          page: 1
        });
        t.assert.equal(firstPageResponse.statusCode, 200);

        const secondPageResponse = await searchLayers(HEADERS_USER_1, {
          q: 'pagtest',
          type: 'layer',
          limit: 1,
          page: 2
        });
        t.assert.equal(secondPageResponse.statusCode, 200);

        const firstPage = firstPageResponse.json<ILayerSearchResult>();
        const secondPage = secondPageResponse.json<ILayerSearchResult>();

        t.assert.equal(firstPage.items.length, 1);
        t.assert.equal(secondPage.items.length, 1);
        t.assert.equal(firstPage.items[0].properties.url, allowedUrl1);
        t.assert.equal(secondPage.items[0].properties.url, allowedUrl2);

        nock.cleanAll();
      }
    );

    t.test('Should fail search when q is missing', async (t: TestContext) => {
      const response = await app.inject({
        method: 'GET',
        headers: HEADERS_USER_1,
        url: '/layers/search?type=layer&limit=10&page=1'
      });

      t.assert.equal(response.statusCode, 400);
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

    t.test(
      'Should not store type, url or layers in sourceOptions column after patch',
      async (t: TestContext) => {
        const patchPayload: Partial<ILayerIn> = {
          sourceOptions: {
            type: 'wms',
            url: layers[0].url,
            version: '1.1.1',
            params: {
              layers: 'SOME_LAYER',
              LAYERS: 'SOME_LAYER',
              STYLES: 'default'
            }
          }
        };
        const response = await updateLayer(
          HEADERS_ADMIN,
          layers[0].id,
          patchPayload
        );
        t.assert.equal(response.statusCode, 200);

        const result = (
          await getLayer(HEADERS_ADMIN, layers[0].id)
        ).json<ILayer>();
        t.assert.equal(result.sourceOptions?.['type'], undefined);
        t.assert.equal(result.sourceOptions?.['url'], undefined);
        const params = result.sourceOptions?.params as
          Record<string, unknown> | undefined;
        t.assert.equal(params?.['layers'], undefined);
        t.assert.equal(params?.['LAYERS'], undefined);
        // Other params kept
        t.assert.equal(params?.['STYLES'], 'default');
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

    t.test('Should get layer for anonymous user', async (t: TestContext) => {
      const layer = layers[1];

      const response = await getLayer(HEADERS_ANONYMOUS, layer.id);
      t.assert.equal(response.statusCode, 200);
    });

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

  t.test('POST /migrate/layer', async (t: TestContext) => {
    t.test(
      'Should not migrate layer for anonymous user',
      async (t: TestContext) => {
        const response = await migrateLayer(HEADERS_ANONYMOUS, LAYER_MOCK_1);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should not migrate layer for authenticated user',
      async (t: TestContext) => {
        const response = await migrateLayer(HEADERS_USER_1, LAYER_MOCK_1);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should migrate (create) new layer for admin user',
      async (t: TestContext) => {
        const newLayer: ILayerIn = {
          ...LAYER_MOCK_1,
          url: 'http://migrate.test.com/new-layer-1',
          sourceOptions: {
            ...LAYER_MOCK_1.sourceOptions!,
            url: 'http://migrate.test.com/new-layer-1'
          }
        };

        const response = await migrateLayer(HEADERS_ADMIN, newLayer);
        t.assert.equal(response.statusCode, 200);

        // Verify the layer was created
        const getResponse = await app.inject({
          method: 'GET',
          headers: HEADERS_ADMIN,
          url: '/layers'
        });
        const allLayers = getResponse.json<ILayer[]>();
        const created = allLayers.find(
          (l) => l.url === 'http://migrate.test.com/new-layer-1'
        );
        t.assert.ok(created);
        t.assert.equal(created?.type, LAYER_MOCK_1.type);
        // Unique-key fields must not be duplicated inside sourceOptions
        t.assert.equal(created?.sourceOptions?.['type'], undefined);
        t.assert.equal(created?.sourceOptions?.['url'], undefined);
      }
    );

    t.test(
      'Should migrate (update) existing layer for admin user',
      async (t: TestContext) => {
        const existingLayer = layers[0];
        const updateData: ILayerIn = {
          ...existingLayer,
          type: existingLayer.type,
          url: existingLayer.url,
          layers: getParamsLayers(existingLayer.sourceOptions as SourceOptions),
          sourceOptions: {
            ...existingLayer.sourceOptions!,
            // type and url are no longer stored in sourceOptions column;
            // they must be provided explicitly in migrate payloads
            type: existingLayer.type,
            url: existingLayer.url
          },
          layerOptions: {
            ...existingLayer.layerOptions,
            title: 'Updated Title for Migrate'
          }
        };

        const response = await migrateLayer(HEADERS_ADMIN, updateData);
        t.assert.equal(response.statusCode, 200);

        // Verify the layer was updated
        const getResponse = await getLayer(HEADERS_ADMIN, response.json().id);
        const updated = getResponse.json<ILayer>();
        t.assert.equal(
          updated.layerOptions?.title,
          'Updated Title for Migrate'
        );
      }
    );

    t.test('Should fail with invalid body', async (t: TestContext) => {
      const invalidLayer = {
        type: 'invalid_type' as never,
        url: 'http://test.com'
      };

      const response = await app.inject({
        method: 'POST',
        headers: HEADERS_ADMIN,
        url: '/layers/migrate/layer',
        body: invalidLayer
      });

      t.assert.equal(response.statusCode, 400);
    });
  });

  // ----------------------------------------------------------------

  t.test('POST /migrate/batch', async (t: TestContext) => {
    t.test(
      'Should not migrate batch for anonymous user',
      async (t: TestContext) => {
        const batchRequest: ILayerMigrateBatch = {
          toAdd: [LAYER_MOCK_1]
        };

        const response = await migrateBatch(HEADERS_ANONYMOUS, batchRequest);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should not migrate batch for authenticated user',
      async (t: TestContext) => {
        const batchRequest: ILayerMigrateBatch = {
          toAdd: [LAYER_MOCK_1]
        };

        const response = await migrateBatch(HEADERS_USER_1, batchRequest);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should add layers in batch for admin user',
      async (t: TestContext) => {
        const newLayer1: ILayerIn = {
          ...LAYER_MOCK_1,
          url: 'http://batch.test.com/layer-1',
          sourceOptions: {
            ...LAYER_MOCK_1.sourceOptions!,
            url: 'http://batch.test.com/layer-1'
          }
        };

        const newLayer2: ILayerIn = {
          ...LAYER_MOCK_2,
          url: 'http://batch.test.com/layer-2',
          sourceOptions: {
            ...LAYER_MOCK_2.sourceOptions!,
            url: 'http://batch.test.com/layer-2'
          }
        };

        const batchRequest: ILayerMigrateBatch = {
          toAdd: [newLayer1, newLayer2]
        };

        const response = await migrateBatch(HEADERS_ADMIN, batchRequest);
        t.assert.equal(response.statusCode, 200);

        // Verify both layers were created
        const getResponse = await app.inject({
          method: 'GET',
          headers: HEADERS_ADMIN,
          url: '/layers'
        });
        const allLayers = getResponse.json<ILayer[]>();
        const created1 = allLayers.find(
          (l) => l.url === 'http://batch.test.com/layer-1'
        );
        const created2 = allLayers.find(
          (l) => l.url === 'http://batch.test.com/layer-2'
        );
        t.assert.ok(created1);
        t.assert.ok(created2);
      }
    );

    t.test(
      'Should update layers in batch for admin user',
      async (t: TestContext) => {
        // Create fresh layers for this test since layers[1] is deleted in DELETE tests
        const layerResponse1 = await createLayer(app, HEADERS_ADMIN, {
          ...LAYER_MOCK_1,
          url: 'http://batch-update.test.com/layer-1',
          sourceOptions: {
            ...LAYER_MOCK_1.sourceOptions!,
            url: 'http://batch-update.test.com/layer-1'
          }
        });
        const newLayer1 = layerResponse1.json<ILayer>();

        const layerResponse2 = await createLayer(app, HEADERS_ADMIN, {
          ...LAYER_MOCK_2,
          url: 'http://batch-update.test.com/layer-2',
          sourceOptions: {
            ...LAYER_MOCK_2.sourceOptions!,
            url: 'http://batch-update.test.com/layer-2'
          }
        });
        const newLayer2 = layerResponse2.json<ILayer>();

        const batchRequest: ILayerMigrateBatch = {
          toPut: [
            {
              id: newLayer1.id,
              layerOptions: {
                title: 'Batch Updated Title 1'
              },
              sourceOptions: null
            },
            {
              id: newLayer2.id,
              layerOptions: {
                title: 'Batch Updated Title 2'
              },
              sourceOptions: null
            }
          ]
        };

        const response = await migrateBatch(HEADERS_ADMIN, batchRequest);
        t.assert.equal(response.statusCode, 200);

        // Verify both layers were updated
        const get1 = await getLayer(HEADERS_ADMIN, newLayer1.id);
        const get2 = await getLayer(HEADERS_ADMIN, newLayer2.id);
        const updated1 = get1.json<ILayer>();
        const updated2 = get2.json<ILayer>();
        t.assert.equal(updated1.layerOptions?.title, 'Batch Updated Title 1');
        t.assert.equal(updated2.layerOptions?.title, 'Batch Updated Title 2');
      }
    );

    t.test(
      'Should add and update layers together in batch for admin user',
      async (t: TestContext) => {
        const existingLayer = layers[0];
        const newLayer: ILayerIn = {
          ...LAYER_MOCK_1,
          url: 'http://batch.test.com/combined-new',
          sourceOptions: {
            ...LAYER_MOCK_1.sourceOptions!,
            url: 'http://batch.test.com/combined-new'
          }
        };

        const batchRequest: ILayerMigrateBatch = {
          toAdd: [newLayer],
          toPut: [
            {
              id: existingLayer.id,
              layerOptions: {
                title: 'Combined Batch Update'
              },
              sourceOptions: null
            }
          ]
        };

        const response = await migrateBatch(HEADERS_ADMIN, batchRequest);
        t.assert.equal(response.statusCode, 200);

        // Verify the layer was created
        const getResponse = await app.inject({
          method: 'GET',
          headers: HEADERS_ADMIN,
          url: '/layers'
        });
        const allLayers = getResponse.json<ILayer[]>();
        const created = allLayers.find(
          (l) => l.url === 'http://batch.test.com/combined-new'
        );
        t.assert.ok(created);

        // Verify the layer was updated
        const updated = await getLayer(HEADERS_ADMIN, existingLayer.id);
        const updatedLayer = updated.json<ILayer>();
        t.assert.equal(
          updatedLayer.layerOptions?.title,
          'Combined Batch Update'
        );
      }
    );

    t.test(
      'Should fail if trying to add a duplicate layer',
      async (t: TestContext) => {
        const duplicateLayer: ILayerIn = {
          ...layers[0],
          sourceOptions: {
            ...layers[0].sourceOptions!,
            // type and url are no longer stored in sourceOptions column;
            // they must be provided explicitly in migrate payloads
            type: layers[0].type,
            url: layers[0].url
          }
        };

        const batchRequest: ILayerMigrateBatch = {
          toAdd: [duplicateLayer]
        };

        const response = await migrateBatch(HEADERS_ADMIN, batchRequest);
        t.assert.equal(response.statusCode, 400);
      }
    );

    t.test(
      'Should handle empty batch request for admin user',
      async (t: TestContext) => {
        const batchRequest: ILayerMigrateBatch = {};

        const response = await migrateBatch(HEADERS_ADMIN, batchRequest);
        t.assert.equal(response.statusCode, 200);
      }
    );
  });

  // ----------------------------------------------------------------

  t.test('Service Logic (getLayerOrCreate)', async (t: TestContext) => {
    t.test(
      'Should create a new layer if it does not exist',
      async (t: TestContext) => {
        const sourceOptions = {
          ...LAYER_MOCK_1.sourceOptions!,
          url: 'http://example.com/new-service-layer'
        } as SourceOptions;

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
        } as SourceOptions;
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

  async function searchLayers(
    headers: IncomingHttpHeaders,
    query: {
      q: string;
      type?: 'layer' | 'group';
      limit?: number;
      page?: number;
    }
  ) {
    const searchParams = new URLSearchParams();
    searchParams.set('q', query.q);

    if (query.type) {
      searchParams.set('type', query.type);
    }

    if (query.limit != null) {
      searchParams.set('limit', query.limit.toString());
    }

    if (query.page != null) {
      searchParams.set('page', query.page.toString());
    }

    return app.inject({
      method: 'GET',
      headers,
      url: `/layers/search?${searchParams.toString()}`
    });
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

  async function migrateBatch(
    headers: IncomingHttpHeaders,
    batchRequest: ILayerMigrateBatch
  ) {
    const response = await app.inject({
      method: 'POST',
      headers,
      url: '/layers/migrate/batch',
      body: batchRequest
    });

    return response;
  }

  async function migrateLayer(headers: IncomingHttpHeaders, layer: ILayerIn) {
    const response = await app.inject({
      method: 'POST',
      headers,
      url: '/layers/migrate/layer',
      body: layer
    });

    return response;
  }
});
