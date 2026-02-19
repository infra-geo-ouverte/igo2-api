import { IncomingHttpHeaders } from 'node:http';
import test from 'node:test';

import { resetDatabase } from '../../../../scripts/src/seeder';
import { buildApp } from '../../../app';
import { AppInstance } from '../../../app.interface';
import { HEADERS_USER_1, HEADERS_USER_2 } from '../../../auth/test/auth.mock';
import { ILayer, LayerGroupOptions } from '../../../layer';
import { LAYER_MOCK_1, createLayer } from '../../../layer/test/layer.mock';
import { IContextMockedDataWithPermission } from '../../permission/test/context-permission.mock';
import { IContextLayer } from '../context-layer.interface';
import { appendContextsDetailledWithLayers } from './context-layer.mock';

test('Layer context', async (t) => {
  let app: AppInstance;
  let contexts: IContextMockedDataWithPermission;

  t.before(async () => {
    app = await buildApp();
    await resetDatabase(app);

    contexts = await appendContextsDetailledWithLayers(app);
  });

  t.after(async () => {
    await app.close();
  });

  // ===========================================================

  t.test('Creates', async (t) => {
    t.test(
      'Should create on his own context for authenticated user',
      async (t) => {
        const context = contexts.user1[1].context;
        const response = await createCtxLayer(context.id!, HEADERS_USER_1, {
          layerOptions: {
            title: 'New Title',
            visible: false,
            zIndex: 2
          }
        });
        t.assert.equal(response.statusCode, 201);

        const result = response.json<IContextLayer>();
        t.assert.equal(result.layerOptions?.zIndex, 2);
        t.assert.equal(result.contextId, context.id);
        t.assert.equal(result.layerOptions?.visible, false);
      }
    );

    t.test(
      'Should not create on another context for authenticated user',
      async (t) => {
        const context = contexts.user2[3].context;
        const layer = context.layers![0];
        const response = await createCtxLayer(context.id!, HEADERS_USER_1, {
          layerId: layer.id,
          layerOptions: {
            title: 'New Title',
            visible: false,
            zIndex: 2
          }
        });
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should create on another context with the write permission',
      async (t) => {
        const context = contexts.user2[4].context;
        const response = await createCtxLayer(context.id!, HEADERS_USER_1, {
          layerOptions: {
            title: 'New Title',
            visible: false,
            zIndex: 2
          }
        });
        t.assert.equal(response.statusCode, 201);
      }
    );

    t.test(
      'Should not create on another context with read only permission',
      async (t) => {
        const context = contexts.user2[3].context;
        const layer = context.layers![0];
        const response = await createCtxLayer(context.id!, HEADERS_USER_1, {
          layerId: layer.id,
          layerOptions: {
            title: 'New Title',
            visible: false,
            zIndex: 2
          }
        });
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test('Should handle layer not found', async (t) => {
      const context = contexts.user2[4].context;
      const response = await createCtxLayer(context.id!, HEADERS_USER_1, {
        layerId: 12345667788,
        layerOptions: {
          title: 'New Title',
          visible: false,
          zIndex: 2
        }
      });
      t.assert.equal(response.statusCode, 400);
    });

    t.test('Should fail on unicity violation', async (t) => {
      const context = contexts.user2[4].context;
      const layer = (
        await createLayer(app, HEADERS_USER_1, LAYER_MOCK_1)
      ).json<ILayer>();
      await createCtxLayer(context.id!, HEADERS_USER_1, {
        layerId: layer.id,
        layerOptions: {
          title: 'New Title',
          visible: false,
          zIndex: 2
        }
      });
      const response = await createCtxLayer(context.id!, HEADERS_USER_1, {
        layerId: layer.id,
        layerOptions: {
          title: 'New Title',
          visible: false,
          zIndex: 2
        }
      });
      t.assert.equal(response.statusCode, 409);
    });
  });

  // ===============================================

  t.test('PATCH ', async (t) => {
    t.test(
      'Should update his own context for authenticated user with the good info',
      async (t) => {
        const { id: ctxId, layers } = contexts.user1[1].context;
        const { id } = layers![0];

        const response = await updateCtxLayer(ctxId!, id!, HEADERS_USER_1, {
          layerOptions: {
            type: 'group',
            title: 'patch title'
          }
        });
        t.assert.equal(response.statusCode, 200);

        const result = response.json<IContextLayer<LayerGroupOptions>>();
        t.assert.equal(result.id, id);
        t.assert.equal(result.contextId, ctxId);
        t.assert.equal(result.layerOptions?.title, 'patch title');
      }
    );

    t.test(
      'Should fail to update another ctx layer without permission',
      async (t) => {
        const { id: ctxId, ...context } = contexts.user1[1].context;
        const { id } = context.layers![0];

        const response = await updateCtxLayer(ctxId!, id!, HEADERS_USER_2, {
          layerOptions: {
            type: 'group',
            title: 'patch title'
          }
        });
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should fail to update another ctx layer with read permission',
      async (t) => {
        const { id: ctxId, ...context } = contexts.user2[3].context;
        const { id } = context.layers![1];

        const response = await updateCtxLayer(ctxId!, id!, HEADERS_USER_1, {
          layerOptions: {
            type: 'group',
            title: 'patch title'
          }
        });
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should update another ctx layer with write permission',
      async (t) => {
        const { id: ctxId, layers } = contexts.user2[4].context;
        const { id } = layers![0];

        const response = await updateCtxLayer(ctxId!, id!, HEADERS_USER_1, {
          layerOptions: {
            type: 'group',
            title: 'patch title'
          }
        });
        t.assert.equal(response.statusCode, 200);
      }
    );

    t.test("Should fail when layer doesn't exist", async (t) => {
      const { id: ctxId } = contexts.user2[4].context;

      const response = await updateCtxLayer(ctxId!, 1234567, HEADERS_USER_1, {
        layerOptions: {
          type: 'group',
          title: 'patch title'
        }
      });
      t.assert.equal(response.statusCode, 404);
    });
  });

  // ===================================

  t.test('GET', async (t) => {
    t.before(async () => {
      await resetDatabase(app);
      contexts = await appendContextsDetailledWithLayers(app);
    });

    t.test('Should list ctx layers for his own conxtext', async (t) => {
      const { id: ctxId } = contexts.user1[1].context;

      const response = await getAll(ctxId!, HEADERS_USER_1);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<IContextLayer[]>();
      t.assert.equal(result.length >= 7, true);
    });

    t.test(
      'Should not list ctx layers for another context without permission',
      async (t) => {
        const { id: ctxId } = contexts.user1[1].context;

        const response = await getAll(ctxId!, HEADERS_USER_2);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should list ctx layers for another context with read permission',
      async (t) => {
        const { id: ctxId } = contexts.user2[3].context;

        const response = await getAll(ctxId!, HEADERS_USER_1);
        t.assert.equal(response.statusCode, 200);

        const result = response.json<IContextLayer[]>();
        t.assert.equal(result.length >= 3, true);
      }
    );

    t.test(
      'Should list ctx layers for another context with write permission',
      async (t) => {
        const { id: ctxId } = contexts.user2[4].context;

        const response = await getAll(ctxId!, HEADERS_USER_1);
        t.assert.equal(response.statusCode, 200);
      }
    );
  });

  // ============================================

  t.test('GET and DELETE', async (t) => {
    t.test('Should get layer by id', async (t) => {
      const { id: ctxId, ...context } = contexts.user1[1].context;
      const layers = context.layers!;

      const response = await getById(ctxId!, layers[0].id!, HEADERS_USER_1);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<IContextLayer>();
      t.assert.equal(!!result.layerId, true);
      t.assert.equal(result.contextId, ctxId);
    });

    t.test('DELETE /contexts/6/layers/2 - standard', async (t) => {
      const { id: ctxId, ...context } = contexts.user2[4].context;
      const layer = context.layers![0];

      const response = await app.inject({
        method: 'DELETE',
        headers: HEADERS_USER_2,
        url: `contexts/${ctxId}/layers/${layer.id}`
      });
      t.assert.equal(response.statusCode, 204);
    });
  });

  // ======================================================

  async function createCtxLayer(
    contextId: number,
    headers: IncomingHttpHeaders,
    payload: Partial<IContextLayer>
  ) {
    return app.inject({
      method: 'POST',
      headers,
      url: `contexts/${contextId}/layers`,
      payload
    });
  }

  async function updateCtxLayer(
    contextId: number,
    id: number,
    headers: IncomingHttpHeaders,
    payload: Partial<IContextLayer>
  ) {
    return app.inject({
      method: 'PATCH',
      headers,
      url: `contexts/${contextId}/layers/${id}`,
      payload
    });
  }

  async function getAll(contextId: number, headers: IncomingHttpHeaders) {
    const response = await app.inject({
      method: 'GET',
      headers,
      url: `contexts/${contextId}/layers`
    });

    return response;
  }

  async function getById(
    contextId: number,
    id: number,
    headers: IncomingHttpHeaders
  ) {
    const response = await app.inject({
      method: 'GET',
      headers,
      url: `contexts/${contextId}/layers/${id}`
    });

    return response;
  }
});
