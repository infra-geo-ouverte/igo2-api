import * as test from 'tape';
// import ToolCont from './tool.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const admin = testConfigs.admin;
const anonyme = testConfigs.anonyme;
const user1 = testConfigs.user1;

Server.init(serverConfigs).then((server) => {

  test('POST /tools - admin', function(t) {
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        name: 'dummyName',
        title: 'dummyTitle',
        inToolbar: true,
        options: {}
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.name, 'dummyName');
      t.equal(result.title, 'dummyTitle');
      t.equal(result.inToolbar, true);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /tools - admin 2', function(t) {
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        name: 'dummyName2',
        title: 'dummyTitle2',
        inToolbar: false
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.name, 'dummyName2');
      t.equal(result.title, 'dummyTitle2');
      t.equal(result.inToolbar, false);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /tools - admin - name missing', function(t) {
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        title: 'dummyTitle3',
        inToolbar: false,
        options: {}
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      const message = 'child "name" fails because ["name" is required]';
      t.equal(result.message, message);
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });

  test('POST /tools - admin - another param', function(t) {
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        name: 'dummyTitle4',
        title: 'dummyTitle4',
        inToolbar: false,
        anotherParam: false
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, '"anotherParam" is not allowed');
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });

  test('POST /tools - anonyme', function(t) {
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
    server.inject(options, function(response) {
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
      server.stop(t.end);
    });
  });

  test('POST /tools - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        name: 'dummy',
        title: 'dummy',
        inToolbar: true,
        options: {}
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
      server.stop(t.end);
    });
  });

  test('POST /tools - Tool 3', function(t) {
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        name: 'Tool3',
        title: 'TitleTool3',
        inToolbar: true,
        options: {}
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /tools - Tool 4', function(t) {
    const options = {
      method: 'POST',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        name: 'tool4',
        title: 'TitleTool4',
        inToolbar: false
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  // ----------------------------------------------------------------

  test('GET /tools - admin', function(t) {
    const options = {
      method: 'GET',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 4);
      t.equal(result[0].name, 'dummyName');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /tools - anonyme', function(t) {
    const options = {
      method: 'GET',
      url: '/tools',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 4);
      t.equal(result[0].name, 'dummyName');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /tools - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 4);
      t.equal(result[0].name, 'dummyName');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  // ----------------------------------------------------------------

  test('PATCH /tools/{id} - admin', function(t) {
    const options = {
      method: 'PATCH',
      url: '/tools/2',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        inToolbar: true,
        options: {
          optionParams: true
        }
      }
    };
    server.inject(options, function(response) {
      // const result: any = response.result;
      // t.equal(result.name, 'dummyName2');
      // t.equal(result.inToolbar, true);
      // t.equal(result.options.optionParams, true);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('PATCH /tools/{id} - anonyme', function(t) {
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
    server.inject(options, function(response) {
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
      server.stop(t.end);
    });
  });

  test('PATCH /tools/{id} - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/tools/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        name: 'dummy99'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
      server.stop(t.end);
    });
  });

  // ----------------------------------------------------------------

  test('GET /tools/{id} - 404', function(t) {
    const options = {
      method: 'GET',
      url: '/tools/13',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 404);
      server.stop(t.end);
    });
  });

  test('GET /tools/{id} - admin', function(t) {
    const options = {
      method: 'GET',
      url: '/tools/1',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.name, 'dummyName');
      t.equal(result.inToolbar, true);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /tools/{id} - anonyme', function(t) {
    const options = {
      method: 'GET',
      url: '/tools/2',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.name, 'dummyName2');
      t.equal(result.inToolbar, true);
      t.equal(result.options.optionParams, true);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /tools/{id} - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/tools/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.name, 'dummyName');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  // ----------------------------------------------------------------


  test('DELETE /tools/{id} - anonyme', function(t) {
    const options = {
      method: 'DELETE',
      url: '/tools/2',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
      server.stop(t.end);
    });
  });

  test('DELETE /tools/{id} - user1', function(t) {
    const options = {
      method: 'DELETE',
      url: '/tools/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
      server.stop(t.end);
    });
  });

  test('DELETE /tools/{id} - admin', function(t) {
    const options = {
      method: 'DELETE',
      url: '/tools/3',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 204);
      server.stop(t.end);
    });
  });


  test('GET /tools - after delete', function(t) {
    const options = {
      method: 'GET',
      url: '/tools',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 3);
      t.equal(result[0].name, 'dummyName');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

});
