import test from 'node:test';

import { IncomingHttpHeaders } from 'http';

import { resetDatabase } from '../../../../scripts/src/seeder';
import { buildApp } from '../../../app';
import { AppInstance } from '../../../app.interface';
import {
  HEADERS_USER_1,
  HEADERS_USER_2,
  mockAuthFindMany
} from '../../../auth/test/auth.mock';
import { syncUsers } from '../../../user/test/user.mock';
import { getUser } from '../../../user/test/user.mock';
import {
  IContextMockedData,
  appendMockedContexts
} from '../../test/context.mock';
import {
  IAnyContextPermission,
  IAnyContextPermissionIn,
  IContextPermissionUser,
  TypePermission
} from '../context-permission.interface';
import {
  IContextMockedDataWithPermission,
  createPermissions as _createPermission,
  appendContextsWithPermission
} from './context-permission.mock';

test('Context Permission', async (t) => {
  let app: AppInstance;
  let data: IContextMockedData;

  t.before(async () => {
    app = await buildApp();
    await resetDatabase(app);

    await syncUsers(app);
    data = await appendMockedContexts(app);
  });

  t.after(async () => {
    await app.close();
  });

  t.test('Creates', async (t) => {
    t.test(
      'Should create permission for profil with canShare activated',
      async (t) => {
        const context = data.user1.contexts[0];

        const user = await getUser(app, HEADERS_USER_1);
        const id = context.id;
        const response = await createPermission(id, HEADERS_USER_1, {
          typePermission: 'read',
          userExternalId: user.externalId
        });
        t.assert.equal(response.statusCode, 201);

        const result = response.json<IContextPermissionUser>();
        t.assert.equal(result.userId, user.id);
        t.assert.equal(result.typePermission, 'read');
        t.assert.equal(result.contextId, id);
      }
    );

    t.test(
      'Should create permission for profil with canShare activated',
      async (t) => {
        const context = data.user2.contexts[0];

        const user = await getUser(app, HEADERS_USER_1);
        const id = context.id;
        const response = await createPermission(id, HEADERS_USER_2, {
          typePermission: 'read',
          userExternalId: user.externalId
        });
        t.assert.equal(response.statusCode, 201);

        const result = response.json<IContextPermissionUser>();
        t.assert.equal(result.userId, user.id);
        t.assert.equal(result.typePermission, 'read');
        t.assert.equal(result.contextId, id);
      }
    );

    t.test(
      'Should fail to create permission for user without profil that can share',
      async (t) => {
        const context = data.user2.contexts[0];

        const user = await getUser(app, HEADERS_USER_1);
        const id = context.id;
        const response = await createPermission(id, HEADERS_USER_1, {
          typePermission: 'read',
          userExternalId: user.externalId
        });
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test('Should create permission with write permission', async (t) => {
      const context = data.user2.contexts[2];

      const id = context.id;
      const user1 = await getUser(app, HEADERS_USER_1);
      await createPermission(id, HEADERS_USER_2, {
        userExternalId: user1.externalId,
        typePermission: 'write'
      });

      const user2 = await getUser(app, HEADERS_USER_2);
      const response = await createPermission(id, HEADERS_USER_1, {
        userExternalId: user2.externalId,
        typePermission: 'read'
      });
      t.assert.equal(response.statusCode, 201);

      const result = response.json<IContextPermissionUser>();
      t.assert.equal(result.userId, user2.id);
      t.assert.equal(result.typePermission, 'read');
      t.assert.equal(result.contextId, id);
    });

    t.test(
      'Should fail on context id and profil unicity violation',
      async (t) => {
        const context = data.user2.contexts[2];
        const id = context.id;

        const user1 = await getUser(app, HEADERS_USER_1);
        await createPermission(id, HEADERS_USER_2, {
          userExternalId: user1.externalId,
          typePermission: 'read'
        });
        const response = await createPermission(id, HEADERS_USER_2, {
          userExternalId: user1.externalId,
          typePermission: 'read'
        });
        t.assert.equal(response.statusCode, 409);
      }
    );

    t.test(
      'Should fail when typePermission is not in the value range',
      async (t) => {
        const context = data.user1.contexts[0];

        const id = context.id;
        const user2 = await getUser(app, HEADERS_USER_2);
        const response = await createPermission(id, HEADERS_USER_1, {
          typePermission: 'test' as never as TypePermission,
          userExternalId: user2.externalId
        });
        t.assert.equal(response.statusCode, 400);
      }
    );
  });

  t.test('Patches', async (t) => {
    let data: IContextMockedDataWithPermission;

    t.before(async () => {
      await resetDatabase(app);
      await syncUsers(app);
      data = await appendContextsWithPermission(app);
    });

    t.test("Should patch it's own context", async (t) => {
      const context = data.user1[1].context;
      const permission = data.user1[1].permission!;
      const user2 = await getUser(app, HEADERS_USER_2);

      const response = await updatePermission(
        HEADERS_USER_1,
        permission.id,
        context.id,
        {
          typePermission: 'write',
          userId: user2.id
        }
      );
      t.assert.equal(response.statusCode, 200);

      const permissionBd = await getPermission(
        HEADERS_USER_1,
        permission.id,
        context.id
      );
      const result = permissionBd.json<IContextPermissionUser>();
      t.assert.equal(result.id, permission.id);
      t.assert.equal(result.typePermission, 'write');
      t.assert.equal(result.userId, user2.id);
    });

    t.test("Should not update if user doesn't have permission", async (t) => {
      const { id, contextId } = data.user2[2].permission!;
      const user2 = await getUser(app, HEADERS_USER_2);

      const response = await updatePermission(HEADERS_USER_1, id, contextId, {
        typePermission: 'write',
        userId: user2.id
      });
      t.assert.equal(response.statusCode, 403);
    });

    t.test(
      "Should not update if user doesn't have the write permission",
      async (t) => {
        const { id, contextId } = data.user2[3].permission!;

        const response = await updatePermission(HEADERS_USER_1, id, contextId, {
          typePermission: 'write'
        });
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test('Should patch another context with write permission', async (t) => {
      const { id, contextId } = data.user2[6].permission!;

      const response = await updatePermission(HEADERS_USER_1, id, contextId, {
        typePermission: 'write'
      });
      t.assert.equal(response.statusCode, 200);
    });
  });

  // ===================================

  t.test('GET /contexts/1/permissions - standard', async (t) => {
    let data: IContextMockedDataWithPermission;

    t.before(async () => {
      await resetDatabase(app);
      await syncUsers(app);
      data = await appendContextsWithPermission(app);
    });

    t.test('Should get his context permissions', async (t) => {
      const context = data.user1[1].context;
      const permission = data.user1[1].permission!;

      const response = await getPermissions(HEADERS_USER_1, context.id);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<IAnyContextPermission[]>();
      t.assert.equal(result.length, 1);
      t.assert.equal(result[0].id, permission.id);
    });

    t.test(
      'Should fail to get another context permission without permission',
      async (t) => {
        const context = data.user2[2].context;

        const response = await getPermissions(HEADERS_USER_1, context.id);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should get another context permission with read permission',
      async (t) => {
        const userContext = data.user2[3];
        const context = userContext.context;

        const response = await getPermissions(HEADERS_USER_1, context.id);
        t.assert.equal(response.statusCode, 200);

        const result = response.json<IAnyContextPermission[]>();
        t.assert.equal(result.length, 1);
      }
    );

    t.test(
      'Should get another context permission with write permission',
      async (t) => {
        const userContext = data.user2[4];
        const context = userContext.context;

        const response = await getPermissions(HEADERS_USER_1, context.id);
        t.assert.equal(response.statusCode, 200);

        const result = response.json<IAnyContextPermission[]>();
        t.assert.equal(result.length, 1);
      }
    );
  });

  // ============================================

  t.test('Deletes', async (t) => {
    let data: IContextMockedDataWithPermission;

    t.before(async () => {
      await resetDatabase(app);
      await syncUsers(app);
      data = await appendContextsWithPermission(app);
    });
    t.test("Should delete it's own context", async (t) => {
      const userContext = data.user1[1];
      const context = userContext.context;
      const permission = userContext.permission!;

      const response = await app.inject({
        method: 'DELETE',
        url: `/contexts/${context.id}/permissions/${permission.id}`,
        headers: HEADERS_USER_1
      });
      t.assert.equal(response.statusCode, 204);
    });

    t.test(
      'Should fail to delete another context without permission',
      async (t) => {
        const userContext = data.user2[2];
        const context = userContext.context;
        const permission = userContext.permission!;

        const response = await app.inject({
          method: 'DELETE',
          url: `/contexts/${context.id}/permissions/${permission.id}`,
          headers: HEADERS_USER_1
        });
        t.assert.equal(response.statusCode, 403);
      }
    );
  });

  async function updatePermission(
    headers: IncomingHttpHeaders,
    id: number,
    contextId: number,
    payload: Partial<IAnyContextPermission>
  ) {
    mockAuthFindMany(app);
    const response = await app.inject({
      method: 'PATCH',
      headers,
      url: `/contexts/${contextId}/permissions/${id}`,
      body: payload
    });

    return response;
  }

  async function getPermission(
    headers: IncomingHttpHeaders,
    id: number,
    contextId: number
  ) {
    const response = await app.inject({
      method: 'GET',
      headers,
      url: `/contexts/${contextId}/permissions/${id}`
    });

    return response;
  }

  async function getPermissions(
    headers: IncomingHttpHeaders,
    contextId: number
  ) {
    mockAuthFindMany(app);
    const response = await app.inject({
      method: 'GET',
      headers,
      url: `/contexts/${contextId}/permissions`
    });

    return response;
  }

  async function createPermission(
    id: number,
    headers: IncomingHttpHeaders,
    payload: Partial<IAnyContextPermissionIn>
  ) {
    return _createPermission(app, id, headers, payload);
  }
});
