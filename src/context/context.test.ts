import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const anonyme = testConfigs.anonyme;
const admin = testConfigs.admin;
const userStandard = testConfigs.standard;
const user2 = testConfigs.standard2;

const runTests = async () => {
  const server = await Server.init(serverConfigs);

  test('POST /contexts - context 1 ', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        uri: 'userStandardPrivate',
        title: 'userStandardPrivate',
        scope: 'private',
        map: {
          view: {
            center: [-73, 46]
          }
        }
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.uri, 'userStandardPrivate');
      t.equal(result.title, 'userStandardPrivate');
      t.equal(result.scope, 'private');
      t.equal(result.map.view.center[1], 46);
      t.equal(result.owner, userStandard.xConsumerUsername);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - context 2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId,
        'x-consumer-groups': 'another'
      },
      payload: {
        uri: 'user2Private',
        title: 'user2Private',
        scope: 'private',
        map: {}
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

  test('POST /contexts - context 3', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId,
        'x-consumer-groups': 'another'
      },
      payload: {
        uri: 'user2public',
        title: 'user2public',
        scope: 'public',
        map: {}
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

  test('POST /contexts - context 4', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId,
        'x-consumer-groups': 'another'
      },
      payload: {
        uri: 'user2publicWrite',
        title: 'user2publicWrite',
        scope: 'public',
        map: {}
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

  test('POST /contexts - context 5', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId,
        'x-consumer-groups': 'another'
      },
      payload: {
        uri: 'user2Protected',
        title: 'user2Protected',
        scope: 'protected',
        map: {}
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

  test('POST /contexts - context 6', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId,
        'x-consumer-groups': 'another'
      },
      payload: {
        uri: 'user2ProtectedWrite',
        title: 'user2ProtectedWrite',
        scope: 'protected',
        map: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.uri, 'user2ProtectedWrite');
      t.equal(result.title, 'user2ProtectedWrite');
      t.equal(result.scope, 'protected');
      t.equal(result.owner, user2.xConsumerUsername);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts - context 7', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        uri: 'adminPublic',
        title: 'adminPublic',
        scope: 'public',
        map: {}
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

  test('POST /contexts/4/permissions - before context', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/permissions',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId,
        'x-consumer-groups': 'another'
      },
      payload: {
        typePermission: 'write',
        profil: userStandard.xConsumerUsername
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

  test('POST /contexts/6/permissions - before context', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId,
        'x-consumer-groups': 'another'
      },
      payload: {
        typePermission: 'write',
        profil: userStandard.xConsumerUsername
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

  // =========================================================

  test('POST /contexts/1/clone - context 1 ', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/1/clone',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'userStandardPrivate');
      t.equal(result.scope, 'private');
      t.equal(result.owner, userStandard.xConsumerUsername);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });


  test('POST /contexts/2/clone - context 2 ', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/2/clone',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
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


  test('POST /contexts/3/clone - context 3 ', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/3/clone',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2public');
      t.equal(result.scope, 'private');
      t.equal(result.owner, userStandard.xConsumerUsername);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/4/clone - context 4 ', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/4/clone',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2publicWrite');
      t.equal(result.scope, 'private');
      t.equal(result.owner, userStandard.xConsumerUsername);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /contexts/5/clone - context 5 ', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/5/clone',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
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

  test('POST /contexts/6/clone - context 6 ', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts/6/clone',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2ProtectedWrite');
      t.equal(result.scope, 'private');
      t.equal(result.owner, userStandard.xConsumerUsername);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // =========================================================

  test('Patch /contexts/8 - context 8 ', async t => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/8',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        title: 'userStandardPrivateClone',
        scope: 'public',
        map: {
          view: {
            zoom: 11
          }
        }
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('Patch /contexts/1 - context 1 ', async t => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/1',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        map: {
          view: {
            zoom: 13
          }
        }
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('Patch /contexts/2 - context 2 ', async t => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/2',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        map: {
          view: {
            zoom: 12
          }
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

  test('Patch /contexts/3 - context 3 ', async t => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/3',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        map: {
          view: {
            zoom: 3
          }
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

  test('Patch /contexts/4 - context 4 ', async t => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/4',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        map: {
          view: {
            zoom: 4
          }
        }
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('Patch /contexts/5 - context 5 ', async t => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/5',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        map: {
          view: {
            zoom: 5
          }
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

  test('Patch /contexts/6 - context 6 ', async t => {
    let response;
    const options = {
      method: 'Patch',
      url: '/contexts/6',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        map: {
          view: {
            zoom: 6
          }
        }
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // =========================================================

  test('GET /contexts/8 - context 8 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/8',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'userStandardPrivateClone');
      t.equal(result.scope, 'public');
      t.equal(result.map.view.zoom, 11);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });


  test('DELETE /contexts/8 - context 8 ', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/contexts/8',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
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

  test('GET /contexts/8 - after delete ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/8',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 403);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // =========================================================

  test('GET /contexts/1/details - context 1 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/1/details',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'userStandardPrivate');
      t.equal(result.scope, 'private');
      t.equal(result.map.view.zoom, 13);
      t.equal(result.permission, 'write');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/2/details - context 2 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/2/details',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
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

  test('GET /contexts/3/details - context 3 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/3/details',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2public');
      t.equal(result.scope, 'public');
      t.equal(result.permission, 'read');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/4/details - context 4 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/4/details',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2publicWrite');
      t.equal(result.scope, 'public');
      t.equal(result.map.view.zoom, 4);
      t.equal(result.permission, 'write');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts/5/details - context 5 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/5/details',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
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

  test('GET /contexts/6/details - context 6 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/details',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2ProtectedWrite');
      t.equal(result.scope, 'protected');
      t.equal(result.map.view.zoom, 6);
      t.equal(result.permission, 'write');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });


  test('GET /contexts/4/details - anonyme 4 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/4/details',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2publicWrite');
      t.equal(result.scope, 'public');
      t.equal(result.permission, 'read');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });


  test('GET /contexts/6/details - anonyme 6 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/details',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
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


  test('GET /contexts/4/details - admin 4 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/4/details',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'user2publicWrite');
      t.equal(result.scope, 'public');
      t.equal(result.permission, 'read');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });


  test('GET /contexts/6/details - admin 6 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts/6/details',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      }
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

  // =========================================================

  test('GET /contexts - admin ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.ours.length, 1);
      t.equal(result.shared.length, 0);
      t.equal(result.public.length, 0);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts - anonyme ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.ours.length, 0);
      t.equal(result.shared.length, 0);
      t.equal(result.public.length, 1);
      t.equal(result.public[0].permission, 'read');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts - userStandard ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.ours.length, 4);
      t.equal(result.shared.length, 1);
      t.equal(result.public.length, 2);
      t.equal(result.ours[0].permission, 'write');
      t.equal(result.shared[0].permission, 'write');
      t.equal(result.public[0].permission, 'write');
      t.equal(result.public[1].permission, 'read');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /contexts - user2 ', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId,
        'x-consumer-groups': 'another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.ours.length, 5);
      t.equal(result.shared.length, 0);
      t.equal(result.public.length, 1);
      t.equal(result.ours[0].permission, 'write');
      t.equal(result.ours[2].permission, 'write');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });


  test('POST /contexts - anonyme', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
      },
      payload: {
        uri: 'anonyme2ProtectedWrite',
        title: 'anonyme2ProtectedWrite',
        scope: 'protected',
        map: {}
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

};

runTests();
