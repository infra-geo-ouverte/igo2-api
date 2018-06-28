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

  test('POST /tools - admin', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        name: 'dummyName',
        title: 'dummyTitle',
        inToolbar: true,
        options: {}
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.name, 'dummyName');
      t.equal(result.title, 'dummyTitle');
      t.equal(result.inToolbar, true);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }
  });

  test('POST /tools - admin 2', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        name: 'dummyName2',
        title: 'dummyTitle2',
        inToolbar: false
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.name, 'dummyName2');
      t.equal(result.title, 'dummyTitle2');
      t.equal(result.inToolbar, false);
      t.equal(response.statusCode, 201);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }

  });

  test('POST /tools - admin - name missing', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        title: 'dummyTitle3',
        inToolbar: false,
        options: {}
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

  test('POST /tools - admin - another param', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        name: 'dummyTitle4',
        title: 'dummyTitle4',
        inToolbar: false,
        anotherParam: false
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

  test('POST /tools - anonyme', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      },
      payload: {
        name: 'dummy',
        title: 'dummy',
        inToolbar: true,
        options: {}
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

  test('POST /tools - userStandard', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        name: 'dummy',
        title: 'dummy',
        inToolbar: true,
        options: {}
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

  test('POST /tools - Tool 3', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        name: 'Tool3',
        title: 'TitleTool3',
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

  test('POST /tools - Tool 4', async t => {
    let response;
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        name: 'tool4',
        title: 'TitleTool4',
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

  // ----------------------------------------------------------------

  test('GET /tools - admin', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/tools',
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
      t.equal(result[0].name, 'dummyName');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }

  });

  test('GET /tools - anonyme', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/tools',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 4);
      t.equal(result[0].name, 'dummyName');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }

  });

  test('GET /tools - userStandard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/tools',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.length, 4);
      t.equal(result[0].name, 'dummyName');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }

  });

  // ----------------------------------------------------------------

  test('PATCH /tools/{id} - admin', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/tools/2',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      },
      payload: {
        inToolbar: true,
        options: {
          optionParams: true
        }
      }
    };
    try {
      response = await server.inject(options);
      // const result: any = response.result;
      // t.equal(result.name, 'dummyName2');
      // t.equal(result.inToolbar, true);
      // t.equal(result.options.optionParams, true);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }

  });

  test('PATCH /tools/{id} - anonyme', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/tools/2',
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

  test('PATCH /tools/{id} - userStandard', async t => {
    let response;
    const options = {
      method: 'PATCH',
      url: '/tools/2',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      },
      payload: {
        name: 'dummy99'
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

  test('GET /tools/{id} - 404', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/tools/13',
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

  test('GET /tools/{id} - admin', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/tools/1',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId,
        'x-consumer-groups': 'admin, standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.name, 'dummyName');
      t.equal(result.inToolbar, true);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }

  });

  test('GET /tools/{id} - anonyme', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/tools/2',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.name, 'dummyName2');
      t.equal(result.inToolbar, true);
      t.equal(result.options.optionParams, true);
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }

  });

  test('GET /tools/{id} - userStandard', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/tools/1',
      headers: {
        'x-consumer-username': userStandard.xConsumerUsername,
        'x-consumer-id': userStandard.xConsumerId,
        'x-consumer-groups': 'standard, another'
      }
    };
    try {
      response = await server.inject(options);
      const result: any = response.result;
      t.equal(result.name, 'dummyName');
      t.equal(response.statusCode, 200);
    } catch (e) {
      console.error(response.result);
      t.fail(e);
    } finally {
      t.end();
    }

  });

  // ----------------------------------------------------------------


  test('DELETE /tools/{id} - anonyme', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/tools/2',
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

  test('DELETE /tools/{id} - userStandard', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/tools/2',
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

  test('DELETE /tools/{id} - admin', async t => {
    let response;
    const options = {
      method: 'DELETE',
      url: '/tools/3',
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


  test('GET /tools - after delete', async t => {
    let response;
    const options = {
      method: 'GET',
      url: '/tools',
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
      t.equal(result[0].name, 'dummyName');
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
