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

  test('POST /contexts - before layerContext - Context 1', async t => {
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

  test('POST /contexts - before layerContext - context 2', async t => {
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

  test('POST /contexts - before layerContext - context 3', async t => {
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

  test('POST /contexts - before layerContext - context 4', async t => {
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

  test('POST /contexts - before layerContext - context 5', async t => {
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

  test('POST /contexts - before layerContext - context 6', async t => {
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

  test('POST /contexts/4/permissions - before layerContext', async t => {
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

  test('POST /contexts/6/permissions - before layerContext', async t => {
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

  test('POST /layers - before layerContext', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: adminHeaders,
      payload: {
        layerOptions: {
          title: 'dummyTitle'
        },
        sourceOptions: {
          type: 'osm'
        }
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

  test('POST /layers - before layerContext', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: adminHeaders,
      payload: {
        layerOptions: {
          title: 'dummyTitle2'
        },
        sourceOptions: {
          type: 'wfs'
        }
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

  test('POST /contexts/1/layers - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/1/layers',
      headers: standardHeaders,
      payload: {
        layerId: 1,
        layerOptions: {
          title: 'New Title',
          visible: false,
          zIndex: 2
        }
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerId, 1);
      t.equal(result.layerOptions.zIndex, 2);
      t.equal(Number(result.contextId), 1);
      t.equal(result.layerOptions.visible, false);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/1/layers - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/1/layers',
      headers: standardHeaders,
      payload: {
        layerId: 2,
        layerOptions: {
          zIndex: 1
        }
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerId, 2);
      t.equal(result.layerOptions.zIndex, 1);
      t.equal(Number(result.contextId), 1);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/2/layers - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/2/layers',
      headers: standardHeaders,
      payload: {
        layerId: 1
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

  test('POST /contexts/3/layers - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/3/layers',
      headers: standardHeaders,
      payload: {
        layerId: 1
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

  test('POST /contexts/4/layers - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/layers',
      headers: standardHeaders,
      payload: {
        layerId: 1
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerId, 1);
      t.equal(Number(result.contextId), 4);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/5/layers - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/5/layers',
      headers: standardHeaders,
      payload: {
        layerId: 1
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

  test('POST /contexts/6/layers - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/layers',
      headers: standardHeaders,
      payload: {
        layerId: 1
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerId, 1);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/10/layers - standard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/1/layers',
      headers: standardHeaders,
      payload: {
        layerId: 10
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'Layer can not be found.');
      t.equal(response.statusCode, 400);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/layers - user2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/layers',
      headers: user2Headers,
      payload: {
        layerId: 2
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerId, 2);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/6/layers - user2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/layers',
      headers: user2Headers,
      payload: {
        layerId: 2
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.message, 'The pair contextId and layerId must be unique.');
      t.equal(response.statusCode, 409);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/3/layers - user2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/3/layers',
      headers: user2Headers,
      payload: {
        layerId: 2
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerId, 2);
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

  test('PATCH /contexts/1/layers/1 - layerId not allowed', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/1/layers/1',
      headers: standardHeaders,
      payload: {
        layerId: 1
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

  test('PATCH /contexts/1/layers/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/1/layers/1',
      headers: standardHeaders,
      payload: {
        layerOptions: {
          title: 'patch title'
        }
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(Number(result.layerId), 1);
      t.equal(Number(result.contextId), 1);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/2/layers/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/2/layers/1',
      headers: standardHeaders,
      payload: {
        layerOptions: {
          title: 'patch title'
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

  test('PATCH /contexts/3/layers/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/3/layers/1',
      headers: standardHeaders,
      payload: {
        layerOptions: {
          title: 'patch title'
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

  test('PATCH /contexts/4/layers/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/4/layers/1',
      headers: standardHeaders,
      payload: {
        layerOptions: {
          zIndex: 7
        }
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(Number(result.layerId), 1);
      t.equal(Number(result.contextId), 4);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/5/layers/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/5/layers/1',
      headers: standardHeaders,
      payload: {
        layerOptions: {
          title: 'patch title'
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

  test('PATCH /contexts/6/layers/1 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/6/layers/1',
      headers: standardHeaders,
      payload: {
        layerOptions: {
          zIndex: 8
        }
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(Number(result.layerId), 1);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /contexts/1/layers/10 - standard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/contexts/1/layers/10',
      headers: standardHeaders,
      payload: {
        layerOptions: {
          zIndex: 7
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

  test('GET /contexts/1/layers - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/1/layers',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 2);
      t.equal(result[0].layerOptions.title, 'patch title');
      t.equal(result[0].layerId, 1);
      t.equal(result[1].layerId, 2);
      t.equal(result[0].layerOptions.zIndex, undefined);
      t.equal(result[1].layerOptions.zIndex, 1);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/2/layers - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/2/layers',
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

  test('GET /contexts/3/layers - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/3/layers',
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

  test('GET /contexts/4/layers - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/4/layers',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 1);
      t.equal(result[0].layerOptions.zIndex, 7);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/5/layers - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/5/layers',
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

  test('GET /contexts/6/layers - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/layers',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 2);
      t.equal(result[1].layerOptions.zIndex, 8);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ============================================

  test('GET /contexts/6/layers/2 - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/layers/2',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layerId, 2);
      t.equal(result.contextId, 6);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('DELETE /contexts/6/layers/2 - standard', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/contexts/6/layers/2',
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

  test('GET /contexts/6/layers/2 - standard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/layers/2',
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

  // ======================================================

  test('GET /contexts/1/details - layerContext 1', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/1/details',
      headers: standardHeaders
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layers.length, 2);
      t.equal(result.layers[0].title, 'patch title');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/2/details - layerContext 2 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/2/details',
      headers: user2Headers
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.layers.length, 0);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // let idContextWithLayer;
  test('POST /contexts - layerContext 1 ', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: standardHeaders,
      payload: {
        uri: 'withLayer',
        title: 'withLayer',
        scope: 'public',
        map: {},
        layers: [
          {
            id: '1',
            layerOptions: {
              zIndex: '4',
              visible: false
            }
          },
          {
            id: '90'
          },
          {
            id: '2',
            layerOptions: {
              zIndex: '2'
            }
          },
          {
            id: '3',
            layerOptions: {
              zIndex: '1'
            }
          },
          {
            layerOptions: {
              title: 'dummyTitleLayerContext',
              zIndex: '3',
              visible: false
            },
            sourceOptions: {
              type: 'wms',
              url: 'http://source.com'
            }
          }
        ]
      }
    };
    try {
      response = await server.inject(options);
      // const result: any = response.result;
      // idContextWithLayer = result.id;
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });
};

runTests();
