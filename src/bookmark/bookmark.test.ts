import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const anonyme = testConfigs.anonyme;
const user1 = testConfigs.user1;

Server.init(serverConfigs).then((server) => {

  test('POST /users/login', function(t) {
    const options = {
      method: 'POST',
      url: '/users/login',
      payload: {
        username: 'test',
        password: 'testIgo2Password',
        typeConnection: 'test'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('POST /bookmarks - headers missing', function(t) {
    const options = {
      method: 'POST',
      url: '/bookmarks',
      payload: {
        title: 'bookmark1',
        zoom:  6,
        x: -73.22,
        y: 46.44
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
      server.stop(t.end);
    });
  });

  test('POST /bookmarks - zoom missing', function(t) {
    const options = {
      method: 'POST',
      url: '/bookmarks',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '1'
      },
      payload: {
        title: 'bookmark1',
        x: -73.22,
        y: 46.44
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      const message = 'child "zoom" fails because ["zoom" is required]';
      t.equal(result.message, message);
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });

  test('POST /bookmarks - anonyme', function(t) {
    const options = {
      method: 'POST',
      url: '/bookmarks',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
      },
      payload: {
        title: 'bookmark1',
        zoom:  6,
        x: -73.22,
        y: 46.44
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
      server.stop(t.end);
    });
  });

  test('POST /bookmarks - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/bookmarks',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '1'
      },
      payload: {
        title: 'bookmark1',
        zoom:  6,
        x: -73.22,
        y: 46.44
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'bookmark1');
      t.equal(result.zoom, 6);
      t.equal(result.x, -73.22);
      t.equal(result.y, 46.44);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /bookmarks - user1 bis', function(t) {
    const options = {
      method: 'POST',
      url: '/bookmarks',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '1'
      },
      payload: {
        title: 'bookmark2',
        zoom:  2,
        x: -53.22,
        y: 26.44
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'bookmark2');
      t.equal(result.zoom, 2);
      t.equal(result.x, -53.22);
      t.equal(result.y, 26.44);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  // ----------------------------------------------------------------

  test('GET /bookmarks - anonyme', function(t) {
    const options = {
      method: 'GET',
      url: '/bookmarks',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
      server.stop(t.end);
    });
  });

  test('GET /bookmarks - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/bookmarks',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '1'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 2);
      t.equal(result[0].title, 'bookmark1');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /bookmarks - user2', function(t) {
    const options = {
      method: 'GET',
      url: '/bookmarks',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '10'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 0);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

// ----------------------------------------------------------------

  test('PATCH /bookmarks/{id} - anonyme', function(t) {
    const options = {
      method: 'PATCH',
      url: '/bookmarks/2',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
      },
      payload: {
        title: 'dummy99'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
      server.stop(t.end);
    });
  });

  test('PATCH /bookmarks/{id} - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/bookmarks/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '1'
      },
      payload: {
        title: 'dummy99'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 200);
      const result: any = response.result;
      t.equal(result.id, '2');
      server.stop(t.end);
    });
  });

  test('PATCH /bookmarks/{id} - another user', function(t) {
    const options = {
      method: 'PATCH',
      url: '/bookmarks/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '9'
      },
      payload: {
        title: 'dummy99'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 404);
      server.stop(t.end);
    });
  });

  // ----------------------------------------------------------------

  test('GET /bookmarks/{id} - anonyme', function(t) {
    const options = {
      method: 'GET',
      url: '/bookmarks/2',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
      server.stop(t.end);
    });
  });

  test('GET /bookmarks/{id} - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/bookmarks/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '1'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'dummy99');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /bookmarks/{id} - another user', function(t) {
    const options = {
      method: 'GET',
      url: '/bookmarks/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '9'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 404);
      server.stop(t.end);
    });
  });

  // ----------------------------------------------------------------

  test('DELETE /bookmarks/{id} - anonyme', function(t) {
    const options = {
      method: 'DELETE',
      url: '/bookmarks/2',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
      server.stop(t.end);
    });
  });

  test('DELETE /bookmarks/{id} - another user', function(t) {
    const options = {
      method: 'DELETE',
      url: '/bookmarks/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '9'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 404);
      server.stop(t.end);
    });
  });

  test('DELETE /bookmarks/{id} - user1', function(t) {
    const options = {
      method: 'DELETE',
      url: '/bookmarks/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '1'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 204);
      server.stop(t.end);
    });
  });


  test('GET /bookmarks - after delete', function(t) {
    const options = {
      method: 'GET',
      url: '/bookmarks',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '1'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 1);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

});
