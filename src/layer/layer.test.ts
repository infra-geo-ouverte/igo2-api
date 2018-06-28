import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const admin = testConfigs.admin;
const anonyme = testConfigs.anonyme;
const userStandard = testConfigs.standard;

const runTests = async () => {
  const server = await Server.init(serverConfigs);

  test('POST /layers - admin', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        title: 'dummyTitle',
        type: 'osm',
        view: {},
        source: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.type, 'osm');
      t.equal(result.title, 'dummyTitle');
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /layers - admin 2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        title: 'dummyTitle2',
        type: 'osm'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'dummyTitle2');
      t.equal(result.type, 'osm');
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /layers - admin - type missing', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        title: 'dummy',
        view: {},
        source: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      const message = 'Invalid request payload input';
      t.equal(result.message, message);
      t.equal(response.statusCode, 400);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /layers - admin - another param', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        title: 'dummy',
        type: 'osm',
        view: {},
        source: {},
        anotherParam: 'other'
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

  test('POST /layers - anonyme', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      },
      payload: {
        title: 'dummyAnonyme',
        type: 'wfs',
        view: {},
        source: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'dummyAnonyme');
      t.equal(result.type, 'wfs');
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /layers - userStandard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        title: 'dummyuserStandard',
        type: 'osm',
        view: {},
        source: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'dummyuserStandard');
      t.equal(result.type, 'osm');
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ----------------------------------------------------------------

  test('GET /layers - admin', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 4);
      t.equal(result[0].title, 'dummyTitle');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /layers - anonyme', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
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

  test('GET /layers - userStandard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers',
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

  // ----------------------------------------------------------------

  test('PATCH /layers/{id} - admin', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/layers/2',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        type: 'wms'
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

  test('PATCH /layers/{id} - anonyme', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/layers/2',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      },
      payload: {
        title: 'dummy99'
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('PATCH /layers/{id} - userStandard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/layers/2',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        title: 'dummy99'
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ----------------------------------------------------------------

  test('GET /layers/{id} - admin', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers/10',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
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

  test('GET /layers/{id} - admin', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers/1',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'dummyTitle');
      t.equal(result.type, 'osm');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /layers/{id} - anonyme', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers/2',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'dummyTitle2');
      t.equal(result.type, 'wms');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('GET /layers/{id} - userStandard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers/1',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.title, 'dummyTitle');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  // ----------------------------------------------------------------


  test('DELETE /layers/{id} - anonyme', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/layers/3',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('DELETE /layers/{id} - userStandard', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/layers/3',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('DELETE /layers/{id} - admin', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/layers/3',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
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


  test('GET /layers - admin', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 3);
      t.equal(result[0].title, 'dummyTitle');
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
