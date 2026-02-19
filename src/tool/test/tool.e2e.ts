import { randomInt } from 'node:crypto';
import { IncomingHttpHeaders } from 'node:http';
import test from 'node:test';

import { resetDatabase } from '../../../scripts/src/seeder';
import { buildApp } from '../../app';
import { AppInstance } from '../../app.interface';
import {
  HEADERS_ADMIN,
  HEADERS_ANONYMOUS,
  HEADERS_USER_1
} from '../../auth/test/auth.mock';
import { ITool } from '../tool.interface';
import { TOOL_MOCK, appendTools, createMockTool } from './tool.mock';

test('Tool', (t) => {
  let app: AppInstance;
  let tools: ITool[];

  t.before(async () => {
    app = await buildApp();
    await resetDatabase(app);

    tools = await appendTools(app);
  });

  t.after(async () => {
    await app.close();
  });

  t.test('Create', async (t) => {
    t.test('Should create tool for admin user', async (t) => {
      const uniqueName = (TOOL_MOCK.name ?? '') + randomInt(1000);
      const tool = { ...TOOL_MOCK, name: uniqueName };
      const response = await createMockTool(app, HEADERS_ADMIN, tool);
      t.assert.equal(response.statusCode, 201);

      const result = response.json<ITool>();
      t.assert.equal(result.name, uniqueName);
      t.assert.equal(result.title, 'dummyTitle');
      t.assert.equal(result.inToolbar, true);
    });

    t.test('Should catch invalid payload', async (t) => {
      const { name, ...mock } = TOOL_MOCK;

      const response = await createMockTool(app, HEADERS_ADMIN, mock as ITool);
      t.assert.equal(response.statusCode, 400);
    });

    t.test('Should not create for anonymous user', async (t) => {
      const response = await createMockTool(app, HEADERS_ANONYMOUS, TOOL_MOCK);
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should not create for authenticated user', async (t) => {
      const response = await createMockTool(app, HEADERS_USER_1, TOOL_MOCK);
      t.assert.equal(response.statusCode, 403);
    });
  });

  // ----------------------------------------------------------------

  t.test('GET', async (t) => {
    t.test('Should list tools for admin user', async (t) => {
      const response = await get(HEADERS_ADMIN);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<ITool[]>();
      t.assert.equal(result.length >= 3, true);
      t.assert.equal(result[0].name, 'dummyName');
    });

    t.test('Should not list tools for anonymous user', async (t) => {
      const response = await get(HEADERS_ANONYMOUS);
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should list tools for authenticated user', async (t) => {
      const customHeaders = { ...HEADERS_USER_1 };
      customHeaders['x-consumer-groups'] += ', dummyProfils';
      const response = await get(customHeaders);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<ITool[]>();
      t.assert.equal(result.length >= 3, true);
    });
  });

  // ----------------------------------------------------------------

  t.test('PATCH', async (t) => {
    t.test('Should update for admin user with valid data', async (t) => {
      const tool = tools[0];
      const response = await update(HEADERS_ADMIN, tool.id!, {
        inToolbar: false,
        options: {
          optionParams: true
        }
      });
      t.assert.equal(response.statusCode, 200);

      const toolDb = await getById(HEADERS_ADMIN, tool.id!);
      const result = toolDb.json<ITool>();
      t.assert.equal(result.name, tool.name);
      t.assert.equal(result.inToolbar, false);
      t.assert.equal(result.options?.optionParams, true);
    });

    t.test('Should not update for anonymous user', async (t) => {
      const tool = tools[0];
      const response = await update(HEADERS_ANONYMOUS, tool.id!, {
        inToolbar: false,
        options: {
          optionParams: true
        }
      });
      t.assert.equal(response.statusCode, 403);
    });

    t.test(
      'Should not update for authenticated user without admin privilege',
      async (t) => {
        const tool = tools[0];
        const response = await update(HEADERS_USER_1, tool.id!, {
          inToolbar: false,
          options: {
            optionParams: true
          }
        });
        t.assert.equal(response.statusCode, 403);
      }
    );
  });

  // ----------------------------------------------------------------

  t.test('GET by id', async (t) => {
    t.before(async () => {
      await resetDatabase(app);
      tools = await appendTools(app);
    });

    t.test('Should handle not found', async (t) => {
      const response = await getById(HEADERS_ADMIN, 123456789);
      t.assert.equal(response.statusCode, 404);
    });

    t.test('Should get tool for admin user with valid data', async (t) => {
      const tool = tools[0];
      const response = await getById(HEADERS_ADMIN, tool.id!);
      t.assert.equal(response.statusCode, 200);

      const result = response.json<ITool>();
      t.assert.deepEqual(result, tool);
    });

    t.test('Should not get tool for anonymous user', async (t) => {
      const tool = tools[0];
      const response = await getById(HEADERS_ANONYMOUS, tool.id!);
      t.assert.equal(response.statusCode, 403);
    });

    t.test(
      'Should not get tool for authenticated user but without the profil',
      async (t) => {
        const tool = tools[0];
        const response = await getById(HEADERS_USER_1, tool.id!);
        t.assert.equal(response.statusCode, 401);
      }
    );
  });

  // ----------------------------------------------------------------

  t.test('DELETE', async (t) => {
    t.test('Should not delete for anonymous user', async (t) => {
      const tool = tools[0];

      const response = await deleteTool(HEADERS_ANONYMOUS, tool.id!);
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should not delete for authenticated user', async (t) => {
      const tool = tools[0];

      const response = await deleteTool(HEADERS_USER_1, tool.id!);
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should delete for admin user', async (t) => {
      const tool = tools[0];

      const response = await deleteTool(HEADERS_ADMIN, tool.id!);
      t.assert.equal(response.statusCode, 204);
    });
  });

  // ----------------------------------------------------------------

  async function get(headers: IncomingHttpHeaders) {
    return app.inject({
      method: 'GET',
      url: `/tools`,
      headers
    });
  }

  async function getById(headers: IncomingHttpHeaders, id: number) {
    return app.inject({
      method: 'GET',
      url: `/tools/${id}`,
      headers
    });
  }

  async function update(
    headers: IncomingHttpHeaders,
    id: number,
    payload: Partial<ITool>
  ) {
    return app.inject({
      method: 'PATCH',
      url: `/tools/${id}`,
      headers,
      payload
    });
  }

  async function deleteTool(headers: IncomingHttpHeaders, id: number) {
    return app.inject({
      method: 'DELETE',
      url: `/tools/${id}`,
      headers
    });
  }
});
