import test from 'node:test';

import { IncomingHttpHeaders } from 'http';

import { resetDatabase } from '../../../scripts/src/seeder';
import { buildApp } from '../../app';
import { AppInstance } from '../../app.interface';
import {
  HEADERS_ADMIN,
  HEADERS_ANONYMOUS,
  HEADERS_USER_1,
  HEADERS_USER_2
} from '../../auth/test/auth.mock';
import { LayerGroupOptions, LayerOptions } from '../../layer';
import { LAYER_MOCK_1 } from '../../layer/test/layer.mock';
import { PROFIL_ADMIN_MOCK, createProfil } from '../../profil/test/profil.mock';
import { syncUsers } from '../../user/test/user.mock';
import { DeepPartial } from '../../utils/typescript';
import {
  IContext,
  IContextDetailed,
  IContextDetailedIn,
  IContextOut
} from '../context.interface';
import {
  CONTEXT_LAYER_MOCK_1,
  CONTEXT_LAYER_MOCK_4,
  appendContextsDetailledWithLayers
} from '../layer/test/context-layer.mock';
import {
  IContextMockedDataWithPermission,
  appendContextsWithPermission
} from '../permission/test/context-permission.mock';
import {
  createContext as _createContext,
  getContextDetails as _getContextDetails,
  getMockContext
} from './context.mock';

test('Context', async (t) => {
  let app: AppInstance;

  t.before(async () => {
    app = await buildApp();
    await resetDatabase(app);

    await syncUsers(app);
    await createProfil(app, HEADERS_ADMIN, PROFIL_ADMIN_MOCK);
  });

  t.after(async () => {
    await app.close();
  });

  t.test('Creates', async (t) => {
    t.test(
      'Should create context with the good owner and the good info',
      async (t) => {
        const mock = getMockContext('private');
        const response = await createContext(mock, HEADERS_USER_1);
        t.assert.equal(response.statusCode, 201);

        const result = response.json<IContext>();
        t.assert.equal(result.uri, mock.uri);
        t.assert.equal(result.title, mock.title);
        t.assert.equal(result.scope, 'private');
        t.assert.equal(result.map?.view.center[1], mock.map?.view.center[1]);
        // t.assert.equal(result.userId, HEADERS_USER_1['x-consumer-custom-id']);
      }
    );

    t.test('Should create with private scope', async (t) => {
      const mock = getMockContext('private');
      const response = await createContext(mock, HEADERS_USER_2);
      t.assert.equal(response.statusCode, 201);
    });

    test('Should create context with public scope', async (t) => {
      const mock = getMockContext('public');
      const response = await createContext(mock, HEADERS_USER_1);
      t.assert.equal(response.statusCode, 201);
    });

    t.test('Should create context with protected scope', async (t) => {
      const mock = getMockContext('protected');
      const response = await createContext(mock, HEADERS_USER_2);
      t.assert.equal(response.statusCode, 201);
    });

    test('Should fail to create for anonymous user', async (t) => {
      const mock = getMockContext('protected');
      const response = await createContext(mock, HEADERS_ANONYMOUS);
      t.assert.equal(response.statusCode, 403);
    });
  });

  t.test('Creates detailled', async (t) => {
    t.before(async () => {
      await resetDatabase(app);
      await syncUsers(app);
    });

    // let idContextWithLayer;
    t.test('Should create context detailled', async (t) => {
      const mock = getMockContext('protected');
      mock.layers = [CONTEXT_LAYER_MOCK_1];
      const response = await createContext(mock, HEADERS_USER_2);

      t.assert.equal(response.statusCode, 201);
    });

    t.test(
      'Should create context detailled with valid layer group structure',
      async (t) => {
        const mock = getMockContext('protected');
        mock.layers = [CONTEXT_LAYER_MOCK_4];
        const response = await createContext(mock, HEADERS_USER_2);

        t.assert.equal(response.statusCode, 201);

        const result = response.json<IContextDetailed>();

        const context = await getContextDetails(result.id, HEADERS_USER_2);
        const contextResult = context.json<IContextDetailed>();

        const group1 = contextResult.layers![0] as LayerGroupOptions;
        t.assert.equal(group1.children?.length, 1);

        const group2 = group1.children![0] as LayerGroupOptions;
        t.assert.equal(group2.children!.length, 1);

        const group3 = group2.children![0] as LayerGroupOptions;
        t.assert.equal(group3.children!.length, 1);

        const layerGroup3 = group3.children![0] as LayerOptions;
        t.assert.equal(layerGroup3.type, LAYER_MOCK_1.type);
      }
    );
  });

  // Clones
  t.test('Clones', async (t) => {
    let data: IContextMockedDataWithPermission;
    t.before(async () => {
      await resetDatabase(app);
      await syncUsers(app);
      data = await appendContextsWithPermission(app);
    });

    t.test('Should clone his own context with the good info', async (t) => {
      const context = data.user1[1].context;

      const response = await cloneContext(context.id, HEADERS_USER_1);
      t.assert.equal(response.statusCode, 201);

      const result = response.json<IContext>();
      t.assert.equal(result.title, context.title);
      t.assert.equal(result.scope, context.scope);
      // t.assert.equal(result.userId, HEADERS_USER_1['x-consumer-custom-id']);
    });

    t.test('Should clone another context with public scope', async (t) => {
      const context = data.user2[3].context;

      const response = await cloneContext(context.id, HEADERS_USER_1);
      t.assert.equal(response.statusCode, 201);
    });

    t.test(
      'Should fail to clone for user without permission on private scope',
      async (t) => {
        const context = data.user2[2].context;

        const response = await cloneContext(context.id, HEADERS_USER_1);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should fail to clone without permission on protected scope',
      async (t) => {
        const context = data.user2[5].context;

        const response = await cloneContext(context.id, HEADERS_USER_1);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should clone another context when you have the permission',
      async (t) => {
        const context = data.user2[4].context;
        const id = context.id;

        const response = await cloneContext(id, HEADERS_USER_1);
        t.assert.equal(response.statusCode, 201);

        const result = response.json<IContext>();
        t.assert.equal(result.title, context.title);
        t.assert.equal(result.scope, 'private');
        // t.assert.equal(result.userId, HEADERS_USER_1['x-consumer-custom-id']);
      }
    );
  });

  // Patches
  test('Patches', async (t) => {
    let data: IContextMockedDataWithPermission;
    t.before(async () => {
      await resetDatabase(app);
      await syncUsers(app);
      data = await appendContextsWithPermission(app);
    });

    t.test('Should patch context', async (t) => {
      const context = data.user1[1].context;

      const body = {
        title: 'standardPrivateClone',
        scope: 'public',
        map: {
          view: {
            zoom: 11
          }
        }
      } satisfies DeepPartial<IContext>;
      const response = await patchContext(context.id, HEADERS_USER_1, body);

      t.assert.equal(response.statusCode, 200);

      const contextDb = await getContext(response.json().id, HEADERS_USER_1);
      const result = contextDb.json();
      t.assert.equal(result.title, body.title);
      t.assert.equal(result.scope, body.scope);
      t.assert.equal(result.map.view.zoom, body.map.view.zoom);
    });

    t.test("Should fail when user doesn't have permission", async (t) => {
      const context = data.user2[2].context;
      const body = {
        map: {
          view: {
            zoom: 12
          }
        }
      } satisfies DeepPartial<IContext>;
      const response = await patchContext(context.id, HEADERS_USER_1, body);
      t.assert.equal(response.statusCode, 403);
    });
  });

  // DELETES
  test('Deletes', async (t) => {
    let data: IContextMockedDataWithPermission;
    t.before(async () => {
      await resetDatabase(app);
      await syncUsers(app);
      data = await appendContextsWithPermission(app);
    });

    t.test('Should delete context', async (t) => {
      const { id } = data.user2[2].context;
      const deleteResponse = await deleteContext(id, HEADERS_USER_2);
      t.assert.equal(deleteResponse.statusCode, 204);

      const getResponse = await getContext(id, HEADERS_USER_2);
      t.assert.equal(getResponse.statusCode, 404);
    });

    t.test("Should fail when user doesn't have permission", async (t) => {
      const { id } = data.user2[3].context;

      const deleteResponse = await deleteContext(id, HEADERS_USER_1);
      t.assert.equal(deleteResponse.statusCode, 403);
    });
  });

  // GET details
  test('GET detailed context', async (t) => {
    let data: IContextMockedDataWithPermission;
    t.before(async () => {
      await resetDatabase(app);
      await syncUsers(app);
      data = await appendContextsWithPermission(app);
    });

    t.test('Should get detailed context', async (t) => {
      const context = data.user1[1].context;

      const response = await getContextDetails(context.id, HEADERS_USER_1);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<IContextOut>();
      t.assert.equal(result.title, context.title);
      t.assert.equal(result.scope, context.scope);
      t.assert.equal(result.map?.view.zoom, context.map?.view.zoom);
      t.assert.equal(result.permission, 'write');
    });

    t.test("Should fail when user doesn't have permission", async (t) => {
      const { id } = data.user1[1].context;

      const response = await getContextDetails(id, HEADERS_USER_2);
      t.assert.equal(response.statusCode, 403);
    });

    t.test(
      'Should GET for anonymous user when the scope is public',
      async (t) => {
        const { id } = data.user2[3].context;

        const response = await getContextDetails(id, HEADERS_ANONYMOUS);
        const result = response.json<IContextOut>();

        t.assert.equal(result.scope, 'public');
        t.assert.equal(result.permission, 'read');
        t.assert.equal(response.statusCode, 200);
      }
    );

    t.test(
      'Should GET fail for anonymous user when the scope is private',
      async (t) => {
        const { id } = data.user2[2].context;
        const response = await getContextDetails(id, HEADERS_ANONYMOUS);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should GET fail for anonymous user when the scope is protected',
      async (t) => {
        const { id } = data.user2[5].context;
        const response = await getContextDetails(id, HEADERS_ANONYMOUS);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should GET fail for admin user when the scope is protected',
      async (t) => {
        const { id } = data.user2[5].context;

        const response = await getContextDetails(id, HEADERS_ADMIN);
        t.assert.equal(response.statusCode, 403);
      }
    );
  });

  // GET /contexts list checks
  test('GET List', async (t) => {
    t.before(async () => {
      await resetDatabase(app);
      await syncUsers(app);
      await appendContextsWithPermission(app);
    });

    t.test('Should get only our contexts', async (t) => {
      const response = await getContexts(HEADERS_USER_2);
      t.assert.equal(response.statusCode, 200);

      const result = response.json();
      t.assert.equal(result.ours.length, 6);
      t.assert.equal(result.shared.length, 0);
      t.assert.equal(result.public.length, 0);
    });

    t.test(
      'Should get only the public context?? Not sure how this work',
      async (t) => {
        const response = await getContexts(HEADERS_ANONYMOUS);
        t.assert.equal(response.statusCode, 200);

        const result = response.json();
        t.assert.equal(result.ours.length, 0);
        t.assert.equal(result.shared.length, 0);
        t.assert.equal(result.public.length, 0);
      }
    );

    t.test(
      'Should get the user contexts with the good permission',
      async (t) => {
        const response = await getContexts(HEADERS_USER_1);
        t.assert.equal(response.statusCode, 200);

        const result = response.json();
        t.assert.equal(result.ours.length, 1);
        t.assert.equal(result.shared.length, 1);
        t.assert.equal(result.public.length, 0);
        t.assert.equal(result.ours[0].permission, 'write');
        t.assert.equal(result.shared[0].permission, 'write');
      }
    );
  });

  // ======================================================

  t.test('Context detailled', async (t) => {
    let contexts: IContextMockedDataWithPermission;

    t.before(async () => {
      await resetDatabase(app);
      await syncUsers(app);
      contexts = await appendContextsDetailledWithLayers(app);
    });

    t.test('Should get detailled ctx with valid info', async (t) => {
      const { id, ...context } = contexts.user1[1].context;
      const response = await getContextDetails(id, HEADERS_USER_1);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<IContextDetailed>();
      t.assert.equal(result.layers?.length, 4);
      t.assert.equal(result.layers![0].id, context.layers![0].id);
      t.assert.equal(result.layers![2].type, 'group');
      t.assert.equal(
        (result.layers![2] as LayerGroupOptions).children?.length,
        1
      );
    });

    t.test('Should get detailled ctx with valid info', async (t) => {
      const { id } = contexts.user2[2].context;
      const response = await getContextDetails(id, HEADERS_USER_2);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<IContextDetailed>();
      t.assert.equal(result.layers?.length, 0);
    });
  });

  async function getContexts(headers: IncomingHttpHeaders) {
    const response = await app.inject({
      method: 'GET',
      headers,
      url: '/contexts'
    });

    return response;
  }

  async function getContextDetails(id: number, headers: IncomingHttpHeaders) {
    return _getContextDetails(app, id, headers);
  }

  async function getContext(id: number, headers: IncomingHttpHeaders) {
    return app.inject({
      method: 'GET',
      headers,
      url: `/contexts/${id}`
    });
  }

  async function deleteContext(id: number, headers: IncomingHttpHeaders) {
    const response = await app.inject({
      method: 'DELETE',
      headers,
      url: `/contexts/${id}`
    });

    return response;
  }

  async function cloneContext(id: number, headers: IncomingHttpHeaders) {
    const response = await app.inject({
      method: 'POST',
      headers,
      url: `/contexts/${id}/clone`
    });

    return response;
  }

  async function patchContext(
    id: number,
    headers: IncomingHttpHeaders,
    payload: Record<string, unknown>
  ) {
    return app.inject({
      method: 'PATCH',
      headers,
      url: `/contexts/${id}`,
      payload
    });
  }

  async function createContext(
    context: IContextDetailedIn,
    headers: IncomingHttpHeaders
  ) {
    return _createContext(app, context, headers);
  }
});
