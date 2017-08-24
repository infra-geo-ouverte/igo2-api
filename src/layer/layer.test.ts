import * as test from 'tape';
// import LayerCont from './layer.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const admin = testConfigs.admin;
const anonyme = testConfigs.anonyme;
const user1 = testConfigs.user1;

Server.init(serverConfigs).then((server) => {

  test('POST /layers - admin', function(t) {
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        title: 'dummyTitle',
        type: 'osm',
        view: {},
        source: {}
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.type, 'osm');
      t.equal(result.title, 'dummyTitle');
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /layers - admin 2', function(t) {
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        title: 'dummyTitle2',
        type: 'osm'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'dummyTitle2');
      t.equal(result.type, 'osm');
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /layers - admin - type missing', function(t) {
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        title: 'dummy',
        view: {},
        source: {}
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      const message = 'child "type" fails because ["type" is required]';
      t.equal(result.message, message);
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });

  test('POST /layers - admin - another param', function(t) {
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        title: 'dummy',
        type: 'osm',
        view: {},
        source: {},
        anotherParam: 'other'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, '"anotherParam" is not allowed');
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });

  test('POST /layers - anonyme', function(t) {
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
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'dummyAnonyme');
      t.equal(result.type, 'wfs');
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /layers - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        title: 'dummyUser1',
        type: 'osm',
        view: {},
        source: {}
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'dummyUser1');
      t.equal(result.type, 'osm');
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  // ----------------------------------------------------------------

  test('GET /layers - admin', function(t) {
    const options = {
      method: 'GET',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 4);
      t.equal(result[0].title, 'dummyTitle');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /layers - anonyme', function(t) {
    const options = {
      method: 'GET',
      url: '/layers',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 4);
      t.equal(result[0].title, 'dummyTitle');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /layers - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 4);
      t.equal(result[0].title, 'dummyTitle');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

// ----------------------------------------------------------------

  test('PATCH /layers/{id} - admin', function(t) {
    const options = {
      method: 'PATCH',
      url: '/layers/2',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        type: 'wms'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('PATCH /layers/{id} - anonyme', function(t) {
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
    server.inject(options, function(response) {
      t.equal(response.statusCode, 403);
      const result: any = response.result;
      t.equal(result.message, 'Must be administrator');
      server.stop(t.end);
    });
  });

  test('PATCH /layers/{id} - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/layers/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
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

  // ----------------------------------------------------------------

  test('GET /layers/{id} - admin', function(t) {
    const options = {
      method: 'GET',
      url: '/layers/10',
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

  test('GET /layers/{id} - admin', function(t) {
    const options = {
      method: 'GET',
      url: '/layers/1',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'dummyTitle');
      t.equal(result.type, 'osm');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /layers/{id} - anonyme', function(t) {
    const options = {
      method: 'GET',
      url: '/layers/2',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'dummyTitle2');
      t.equal(result.type, 'wms');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /layers/{id} - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/layers/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'dummyTitle');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  // ----------------------------------------------------------------


  test('DELETE /layers/{id} - anonyme', function(t) {
    const options = {
      method: 'DELETE',
      url: '/layers/3',
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

  test('DELETE /layers/{id} - user1', function(t) {
    const options = {
      method: 'DELETE',
      url: '/layers/3',
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

  test('DELETE /layers/{id} - admin', function(t) {
    const options = {
      method: 'DELETE',
      url: '/layers/3',
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


  test('GET /layers - admin', function(t) {
    const options = {
      method: 'GET',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 3);
      t.equal(result[0].title, 'dummyTitle');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

});
