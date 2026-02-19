import { IncomingHttpHeaders } from 'node:http';
import test from 'node:test';

import { resetDatabase } from '../../../../scripts/src/seeder';
import { buildApp } from '../../../app';
import { AppInstance } from '../../../app.interface';
import { HEADERS_USER_1, HEADERS_USER_2 } from '../../../auth/test/auth.mock';
import { IContext } from '../../context.interface';
import {
  IContextMockedDataWithPermission,
  appendContextsWithPermission
} from '../../permission/test/context-permission.mock';
import { IContextTool } from '../context-tool.interface';

test('Context Tool', async (t) => {
  let app: AppInstance;
  let data: IContextMockedDataWithPermission;

  t.before(async () => {
    app = await buildApp();
    await resetDatabase(app);

    data = await appendContextsWithPermission(app);
  });

  t.after(async () => {
    await app.close();
  });

  // ===========================================================

  t.test('Create tools', async (t) => {
    t.test("Should create context tool for it's own context", async (t) => {
      const context: IContext = data.user1[1].context;
      const tool = data.tools[0];

      const response = await createTool(HEADERS_USER_1, context.id!, {
        toolId: tool.id,
        options: {
          minZoom: 5
        }
      });
      t.assert.equal(response.statusCode, 201);

      const result = response.json();
      t.assert.equal(result.toolId, tool.id);
      t.assert.equal(result.contextId, context.id);
      t.assert.equal(result.options.minZoom, 5);
    });

    t.test(
      "Should fail to create tool when user doesn't have permission on private context",
      async (t) => {
        const context: IContext = data.user2[2].context;
        const tool = data.tools[0];

        const response = await createTool(HEADERS_USER_1, context.id!, {
          toolId: tool.id
        });
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should create tool for another public context with write permission',
      async (t) => {
        const context: IContext = data.user2[4].context;
        const tool = data.tools[0];

        const response = await createTool(HEADERS_USER_1, context.id!, {
          toolId: tool.id
        });
        t.assert.equal(response.statusCode, 201);

        const result = response.json();
        t.assert.equal(result.toolId, tool.id);
        t.assert.equal(result.contextId, context.id);
      }
    );

    t.test(
      'Should fail to create tool for another protected context without permission',
      async (t) => {
        const context: IContext = data.user2[7].context;
        const tool = data.tools[0];

        const response = await createTool(HEADERS_USER_1, context.id!, {
          toolId: tool.id
        });
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should create tool for another protected context with write permission',
      async (t) => {
        const context: IContext = data.user2[6].context;
        const tool = data.tools[0];

        const response = await createTool(HEADERS_USER_1, context.id!, {
          toolId: tool.id
        });
        t.assert.equal(response.statusCode, 201);

        const result = response.json();
        t.assert.equal(result.toolId, tool.id);
        t.assert.equal(result.contextId, context.id);
      }
    );

    t.test(
      "Should fail to create when the global tool doesn't exist",
      async (t) => {
        const context: IContext = data.user1[1].context;

        const response = await createTool(HEADERS_USER_1, context.id!, {
          toolId: 100
        });
        t.assert.equal(response.statusCode, 404);
      }
    );

    t.test(
      'Should fail to create when there is unicity constraint violation',
      async (t) => {
        const context: IContext = data.user2[6].context;
        const tool = data.tools[1];

        await createTool(HEADERS_USER_2, context.id!, {
          toolId: tool.id
        });
        const response = await createTool(HEADERS_USER_2, context.id!, {
          toolId: tool.id
        });

        t.assert.equal(response.statusCode, 409);
      }
    );
  });

  // ===============================================

  t.test('PATCH', async (t) => {
    t.before(async () => {
      await resetDatabase(app);
      data = await appendContextsWithPermission(app);
    });

    t.test("Should patch for it's own tool", async (t) => {
      const context: IContext = data.user1[1].context;
      const tool = data.tools[1];

      const responseTool = await createTool(HEADERS_USER_1, context.id!, {
        toolId: tool.id
      });
      const { toolId } = responseTool.json();

      const response = await updateTool(HEADERS_USER_1, context.id!, toolId, {
        options: {
          minZoom: 3
        }
      });
      t.assert.equal(response.statusCode, 200);

      const result = response.json();
      t.assert.equal(result.toolId, toolId);
      t.assert.equal(result.contextId, context.id);
    });

    t.test('Should fail to update without permission', async (t) => {
      const context: IContext = data.user2[7].context;
      const tool = data.tools[1];

      const responseTool = await createTool(HEADERS_USER_2, context.id!, {
        toolId: tool.id
      });
      const { toolId } = responseTool.json();

      const response = await updateTool(HEADERS_USER_1, context.id!, toolId, {
        options: {
          minZoom: 4
        }
      });
      t.assert.equal(response.statusCode, 403);
    });

    t.test('Should update another context with write permission', async (t) => {
      const context: IContext = data.user2[4].context;
      const tool = data.tools[1];

      const responseTool = await createTool(HEADERS_USER_2, context.id!, {
        toolId: tool.id
      });
      const { toolId } = responseTool.json();

      const response = await updateTool(HEADERS_USER_1, context.id!, toolId, {
        options: {
          minZoom: 4
        }
      });
      t.assert.equal(response.statusCode, 200);

      const result = response.json();
      t.assert.equal(result.toolId, toolId);
      t.assert.equal(result.contextId, context.id);
    });

    t.test('Should handle not found', async (t) => {
      const context: IContext = data.user2[2].context;
      const tool = data.tools[1];

      await createTool(HEADERS_USER_2, context.id!, {
        toolId: tool.id
      });
      const response = await updateTool(HEADERS_USER_2, context.id!, 200, {
        options: {
          minZoom: 4
        }
      });
      t.assert.equal(response.statusCode, 404);
    });
  });

  // ===================================

  t.test('GET', async (t) => {
    t.before(async () => {
      await resetDatabase(app);
      data = await appendContextsWithPermission(app);
    });

    t.test('Should get tools for context', async (t) => {
      const context: IContext = data.user1[1].context;
      const tool = data.tools[1];

      await createTool(HEADERS_USER_1, context.id!, {
        toolId: tool.id,
        options: {
          minZoom: 3
        }
      });
      const response = await getTools(HEADERS_USER_1, context.id!);
      t.assert.equal(response.statusCode, 200);

      const result = response.json();

      t.assert.equal(result.length, 1);
      t.assert.equal(result[0].options.minZoom, 3);
    });

    t.test(
      'Should fail to get tools for private and without read permission',
      async (t) => {
        const context: IContext = data.user2[2].context;
        const tool = data.tools[1];

        await createTool(HEADERS_USER_2, context.id!, {
          toolId: tool.id,
          options: {
            minZoom: 3
          }
        });

        const response = await getTools(HEADERS_USER_1, context.id!);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should get tools for public context without permission',
      async (t) => {
        const context: IContext = data.user2[3].context;
        const tool = data.tools[1];

        await createTool(HEADERS_USER_2, context.id!, {
          toolId: tool.id,
          options: {
            minZoom: 3
          }
        });

        const response = await getTools(HEADERS_USER_1, context.id!);
        t.assert.equal(response.statusCode, 200);
      }
    );

    t.test('Should get tools for public context and permission', async (t) => {
      const context: IContext = data.user2[4].context;
      const tool = data.tools[1];

      await createTool(HEADERS_USER_2, context.id!, {
        toolId: tool.id,
        options: {
          minZoom: 3
        }
      });

      const response = await getTools(HEADERS_USER_1, context.id!);
      t.assert.equal(response.statusCode, 200);
    });

    t.test(
      'Should fail to get tools on protected context without permission',
      async (t) => {
        const context: IContext = data.user2[5].context;
        const tool = data.tools[1];

        await createTool(HEADERS_USER_2, context.id!, {
          toolId: tool.id,
          options: {
            minZoom: 3
          }
        });

        const response = await getTools(HEADERS_USER_1, context.id!);
        t.assert.equal(response.statusCode, 403);
      }
    );

    t.test(
      'Should get tools on protected context with read permission',
      async (t) => {
        const context: IContext = data.user2[7].context;
        const tool = data.tools[1];

        await createTool(HEADERS_USER_2, context.id!, {
          toolId: tool.id,
          options: {
            minZoom: 3
          }
        });

        const response = await getTools(HEADERS_USER_1, context.id!);
        t.assert.equal(response.statusCode, 200);
      }
    );
  });

  // ============================================

  t.test('Get tool by id', async (t) => {
    let contextTool: IContextTool;
    let context: IContext;
    t.before(async () => {
      await resetDatabase(app);
      data = await appendContextsWithPermission(app);

      context = data.user2[7].context;
      const tool = data.tools[1];

      const response = await createTool(HEADERS_USER_2, context.id!, {
        toolId: tool.id,
        options: {
          minZoom: 3
        }
      });
      contextTool = response.json();
    });

    t.test('Should get tool with permission', async (t) => {
      const response = await getTool(
        HEADERS_USER_1,
        context.id!,
        contextTool.toolId
      );
      t.assert.equal(response.statusCode, 200);

      const result = response.json();
      t.assert.equal(result.toolId, contextTool.toolId);
      t.assert.equal(result.contextId, context.id);
    });

    t.test('Should handle not found', async (t) => {
      const response = await getTool(HEADERS_USER_1, context.id!, 200);
      t.assert.equal(response.statusCode, 404);
    });
  });

  t.test('Should delete tool with permission', async (t) => {
    const context: IContext = data.user2[6].context;
    const tool = data.tools[1];

    const contextTool = await createTool(HEADERS_USER_2, context.id!, {
      toolId: tool.id,
      options: {
        minZoom: 3
      }
    });

    const response = await app.inject({
      method: 'DELETE',
      url: `/contexts/${context.id}/tools/${contextTool.json().toolId}`,
      headers: HEADERS_USER_2
    });
    t.assert.equal(response.statusCode, 204);
  });

  async function createTool(
    headers: IncomingHttpHeaders,
    contextId: number,
    payload: Partial<IContextTool>
  ) {
    const response = await app.inject({
      method: 'POST',
      url: `/contexts/${contextId}/tools`,
      headers,
      payload
    });

    return response;
  }
  async function updateTool(
    headers: IncomingHttpHeaders,
    contextId: number,
    toolId: number,
    payload: Partial<IContextTool>
  ) {
    const response = await app.inject({
      method: 'PATCH',
      url: `/contexts/${contextId}/tools/${toolId}`,
      headers,
      payload
    });

    return response;
  }
  async function getTools(headers: IncomingHttpHeaders, contextId: number) {
    const response = await app.inject({
      method: 'GET',
      url: `/contexts/${contextId}/tools`,
      headers
    });

    return response;
  }
  async function getTool(
    headers: IncomingHttpHeaders,
    contextId: number,
    toolId: number
  ) {
    const response = await app.inject({
      method: 'GET',
      url: `/contexts/${contextId}/tools/${toolId}`,
      headers
    });

    return response;
  }
});
