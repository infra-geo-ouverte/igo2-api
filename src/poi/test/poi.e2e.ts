import { IncomingHttpHeaders } from 'node:http';
import test from 'node:test';

import { resetDatabase } from '../../../scripts/src/seeder';
import { buildApp } from '../../app';
import { AppInstance } from '../../app.interface';
import { IUsersHeader, getUserHeaders } from '../../auth/test/auth.mock';
import { syncUsers } from '../../user/test/user.mock';
import { IPoi } from '../poi.interface';
import { POI_MOCK } from './poi.mock';

test('POI', (t) => {
  let app: AppInstance;
  let usersHeader: IUsersHeader;
  let poiDb: IPoi;

  t.before(async () => {
    app = await buildApp();
    await resetDatabase(app);

    await syncUsers(app);
    usersHeader = getUserHeaders();
    poiDb = (await create(usersHeader.user1, POI_MOCK)).json();
  });

  t.test('POST', async (t) => {
    t.test('Should not create for anonymous user', async (t) => {
      const response = await create(usersHeader.anonymous, POI_MOCK);
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should handle invalid payload', async (t) => {
      const { zoom, ...invalidMock } = POI_MOCK;
      const response = await create(usersHeader.anonymous, invalidMock as IPoi);
      t.assert.equal(response.statusCode, 400);
    });

    t.test(
      'Should create for authenticated user with valid data',
      async (t) => {
        const mock = POI_MOCK;
        const response = await create(usersHeader.user1, mock);
        t.assert.equal(response.statusCode, 201);

        const result = response.json<IPoi>();
        t.assert.equal(result.title, POI_MOCK.title);
        t.assert.equal(result.zoom, POI_MOCK.zoom);
        t.assert.equal(result.x, POI_MOCK.x);
        t.assert.equal(result.y, POI_MOCK.y);
      }
    );
  });

  // ----------------------------------------------------------------

  t.test('GET', async (t) => {
    t.test('Should fail to list for anonymous user', async (t) => {
      const response = await getAll(usersHeader.anonymous);
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should list for authenticated user', async (t) => {
      const response = await getAll(usersHeader.user1);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<IPoi[]>();
      t.assert.equal(result.length, 2);
    });
    t.test('Should list for authenticated user2', async (t) => {
      const response = await getAll(usersHeader.user2);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<IPoi[]>();
      t.assert.equal(result.length, 0);
    });
  });

  // ----------------------------------------------------------------

  t.test('PATCH', async (t) => {
    t.test('Should not update for anonymous user', async (t) => {
      const poi = poiDb;
      const response = await update(usersHeader.anonymous, poi.id!, {
        title: 'dummy99'
      });
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should update for authenticated user', async (t) => {
      const poi = poiDb;
      const response = await update(usersHeader.user1, poi.id!, {
        title: 'dummy99'
      });
      t.assert.equal(response.statusCode, 200);

      const updatedPoi = await getById(usersHeader.user1, poi.id!);
      const result = updatedPoi.json<IPoi>();
      t.assert.equal(result.id, poi.id);
      t.assert.equal(result.title, 'dummy99');
    });

    t.test(
      'Should not update another user POI for authenticated user',
      async (t) => {
        const poi = poiDb;
        const response = await update(usersHeader.user2, poi.id!, {
          title: 'dummy99'
        });
        t.assert.equal(response.statusCode, 404);
      }
    );
  });

  // ----------------------------------------------------------------

  t.test('GET by id', async (t) => {
    t.test('Should not get POI for anonymous user', async (t) => {
      const response = await getById(usersHeader.anonymous, poiDb.id!);
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should get POI for authenticated user', async (t) => {
      const response = await getById(usersHeader.user1, poiDb.id!);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<IPoi>();
      t.assert.equal(result.title, 'dummy99'); // Previously updated in another test
    });

    t.test('Should not get another POI for authenticated user', async (t) => {
      const response = await getById(usersHeader.user2, poiDb.id!);
      t.assert.equal(response.statusCode, 404);
    });
  });

  // ----------------------------------------------------------------

  t.test('DELETE', async (t) => {
    t.test('Should not delete for anonymous user', async (t) => {
      const response = await deletePoi(usersHeader.anonymous, poiDb.id!);
      t.assert.equal(response.statusCode, 403);
    });

    t.test(
      'Should not delete another user POI for authenticated user',
      async (t) => {
        const response = await deletePoi(usersHeader.user2, poiDb.id!);
        t.assert.equal(response.statusCode, 404);
      }
    );

    t.test('Should delete POI for authenticated user', async (t) => {
      const response = await deletePoi(usersHeader.user1, poiDb.id!);
      t.assert.equal(response.statusCode, 204);
    });
  });

  //  ------ HELPER FUNCTION ----------------------------------------------------------

  async function create(headers: IncomingHttpHeaders, payload: IPoi) {
    return app.inject({
      method: 'POST',
      url: `/pois`,
      headers,
      payload
    });
  }

  async function getAll(headers: IncomingHttpHeaders) {
    return app.inject({
      method: 'GET',
      url: `/pois`,
      headers
    });
  }

  async function getById(headers: IncomingHttpHeaders, id: number) {
    return app.inject({
      method: 'GET',
      url: `/pois/${id}`,
      headers
    });
  }

  async function update(
    headers: IncomingHttpHeaders,
    id: number,
    payload: Partial<IPoi>
  ) {
    return app.inject({
      method: 'PATCH',
      url: `/pois/${id}`,
      headers,
      payload
    });
  }

  async function deletePoi(headers: IncomingHttpHeaders, id: number) {
    return app.inject({
      method: 'DELETE',
      url: `/pois/${id}`,
      headers
    });
  }
});
