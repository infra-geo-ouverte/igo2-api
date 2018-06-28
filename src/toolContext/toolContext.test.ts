import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const adminHeaders: any = testConfigs.adminHeaders;
const standardHeaders: any = testConfigs.standardHeaders;
const user2Headers: any = testConfigs.user2Headers;

const runTests = async () => {
  const server = await Server.init(serverConfigs);

  test('POST /contexts - before toolContext - ', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: standardHeaders,
      payload: {
        uri: 'standardPrivate',
        title: 'standardPrivate',
        scope: 'private',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      if (response.statusCode === 201) {
        t.equal(response.statusCode, 201);
      } else {
        t.equal(response.statusCode, 409);
      }
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - before toolContext - context 2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: user2Headers,
      payload: {
        uri: 'user2Private',
        title: 'user2Private',
        scope: 'private',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      if (response.statusCode === 201) {
        t.equal(response.statusCode, 201);
      } else {
        t.equal(response.statusCode, 409);
      }
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - before toolContext - context 3', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: user2Headers,
      payload: {
        uri: 'user2public',
        title: 'user2public',
        scope: 'public',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      if (response.statusCode === 201) {
        t.equal(response.statusCode, 201);
      } else {
        t.equal(response.statusCode, 409);
      }
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - before toolContext - context 4', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: user2Headers,
      payload: {
        uri: 'user2publicWrite',
        title: 'user2publicWrite',
        scope: 'public',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      if (response.statusCode === 201) {
        t.equal(response.statusCode, 201);
      } else {
        t.equal(response.statusCode, 409);
      }
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - before toolContext - context 5', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: user2Headers,
      payload: {
        uri: 'user2Protected',
        title: 'user2Protected',
        scope: 'protected',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      if (response.statusCode === 201) {
        t.equal(response.statusCode, 201);
      } else {
        t.equal(response.statusCode, 409);
      }
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - before toolContext - context 6', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: user2Headers,
      payload: {
        uri: 'user2ProtectedWrite',
        title: 'user2ProtectedWrite',
        scope: 'protected',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      if (response.statusCode === 201) {
        t.equal(response.statusCode, 201);
      } else {
        t.equal(response.statusCode, 409);
      }
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/4/permissions - before toolContext', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/permissions',
      headers: user2Headers,
      payload: {
        typePermission: 'write',
        profil: standardHeaders['x-consumer-username']
      }
    };
    try {
      response = await server.inject(options);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/permissions - before toolContext', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: user2Headers,
      payload: {
        typePermission: 'write',
        profil: standardHeaders['x-consumer-username']
      }
    };
    try {
      response = await server.inject(options);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /tools - before toolContext', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/tools',
      headers: adminHeaders,
      payload: {
        name: 'dummyName',
        title: 'dummyTitle',
        inToolbar: true,
        options: {}
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /tools - before toolContext', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/tools',
      headers: adminHeaders,
      payload: {
        name: 'dummyName2',
        title: 'dummyTitle2',
        inToolbar: false
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ===========================================================

  test('POST /contexts/1/tools - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/1/tools',
      headers: standardHeaders,
      payload: {
        toolId: 1,
        options: {
          minZoom: 5
        }
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.toolId, 1);
      t.equal(Number(result.contextId), 1);
      t.equal(result.options.minZoom, 5);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/2/tools - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/2/tools',
      headers: standardHeaders,
      payload: {
        toolId: 1
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/3/tools - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/3/tools',
      headers: standardHeaders,
      payload: {
        toolId: 1
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/4/tools - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/tools',
      headers: standardHeaders,
      payload: {
        toolId: 1
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.toolId, 1);
      t.equal(Number(result.contextId), 4);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/5/tools - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/5/tools',
      headers: standardHeaders,
      payload: {
        toolId: 1
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/tools - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/tools',
      headers: standardHeaders,
      payload: {
        toolId: 1
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.toolId, 1);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/10/tools - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/1/tools',
      headers: standardHeaders,
      payload: {
        toolId: 10,
        options: {
          minZoom: 5
        }
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'Tool can not be found.');
      t.equal(response.statusCode, 400);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/tools - user2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/tools',
      headers: user2Headers,
      payload: {
        toolId: 2
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.toolId, 2);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/tools - user2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/tools',
      headers: user2Headers,
      payload: {
        toolId: 2
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'The pair contextId and toolId must be unique.');
      t.equal(response.statusCode, 409);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/3/tools - user2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/3/tools',
      headers: user2Headers,
      payload: {
        toolId: 2
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.toolId, 2);
      t.equal(Number(result.contextId), 3);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ===============================================

  test('PATCH /contexts/1/tools/1 - toolId not allowed', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/1/tools/1',
      headers: standardHeaders,
      payload: {
        toolId: 1,
        options: {
          minZoom: 5
        }
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'Invalid request payload input');
      t.equal(response.statusCode, 400);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/1/tools/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/1/tools/1',
      headers: standardHeaders,
      payload: {
        options: {
          minZoom: 3
        }
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(Number(result.toolId), 1);
      t.equal(Number(result.contextId), 1);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/2/tools/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/2/tools/1',
      headers: standardHeaders,
      payload: {
        options: {
          minZoom: 4
        }
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/3/tools/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/3/tools/1',
      headers: standardHeaders,
      payload: {
        options: {
          minZoom: 8
        }
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/4/tools/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/4/tools/1',
      headers: standardHeaders,
      payload: {
        options: {
          minZoom: 6
        }
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(Number(result.toolId), 1);
      t.equal(Number(result.contextId), 4);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/5/tools/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/5/tools/1',
      headers: standardHeaders,
      payload: {
        options: {
          minZoom: 9
        }
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/6/tools/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/6/tools/1',
      headers: standardHeaders,
      payload: {
        options: {
          minZoom: 11
        }
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(Number(result.toolId), 1);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/1/tools/10 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/1/tools/10',
      headers: standardHeaders,
      payload: {
        options: {
          minZoom: 5
        }
      }
    };
    try {
      response = await server.inject(options);

      t.equal(response.statusCode, 404);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ===================================

  test('GET /contexts/1/tools - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/1/tools',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;

      t.equal(result.length, 1);
      t.equal(result[0].options.minZoom, 3);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/2/tools - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/2/tools',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/3/tools - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/3/tools',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.length, 1);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/4/tools - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/4/tools',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.length, 1);
      t.equal(result[0].options.minZoom, 6);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/5/tools - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/5/tools',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/6/tools - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/tools',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.length, 2);
      t.equal(result[0].options.minZoom, 11);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ============================================

  test('GET /contexts/6/tools/2 - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/tools/2',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.toolId, 2);
      t.equal(result.contextId, 6);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('DELETE /contexts/6/tools/2 - standard', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/contexts/6/tools/2',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 204);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/6/tools/2 - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/tools/2',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 404);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ==============================================

  test('GET /contexts/1/details - toolContext 1 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/1/details',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.tools.length, 1);
      t.equal(result.tools[0].title, 'dummyTitle');
      t.equal(result.toolbar.length, 1);
      t.equal(result.toolbar[0], 'dummyName');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/2/details - toolContext 2 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/2/details',
      headers: user2Headers
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.tools.length, 0);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  let idContextWithTool;
  test('POST /contexts - toolContext 1 ', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: standardHeaders,
      payload: {
        uri: 'withTool',
        title: 'withTool',
        scope: 'public',
        map: {},
        tools: [{
          id: '1'
        }, {
          id: '90'
        }, {
          id: '2'
        }, {
          name: 'extraTool'
        }]
      }
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      idContextWithTool = result.id;
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/{id}/details - context with tool ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: `/contexts/${idContextWithTool}/details`,
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);

      const result: any = response.result;
      t.equal(result.uri, 'withTool');
      t.equal(result.tools.length, 2);
      t.equal(result.tools[0].id, 1);
      t.equal(result.tools[1].id, 2);
      t.equal(result.toolbar.length, 2);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

};

runTests();
