import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const user1 = testConfigs.user1;
const user2 = testConfigs.user2;

Server.init(serverConfigs).then((server) => {

  test('POST /contexts - before permissionContext - ', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        uri: 'user1Private',
        title: 'user1Private',
        scope: 'private',
        map: {}
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts - before permissionContext - context 2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        uri: 'user2Private',
        title: 'user2Private',
        scope: 'private',
        map: {}
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts - before permissionContext - context 3', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        uri: 'user2Public',
        title: 'user2Public',
        scope: 'public',
        map: {}
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts - before permissionContext - context 4', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        uri: 'user2PublicWrite',
        title: 'user2PublicWrite',
        scope: 'public',
        map: {}
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts - before permissionContext - context 5', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        uri: 'user2Protected',
        title: 'user2Protected',
        scope: 'protected',
        map: {}
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts - before permissionContext - context 6', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        uri: 'user2ProtectedWrite',
        title: 'user2ProtectedWrite',
        scope: 'protected',
        map: {}
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/{id}/permissions - before permContext', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/4/permissions',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        typePermission: 'write',
        profil: user1.xConsumerUsername
      }
    };
    server.inject(options, function(response) {
      server.stop(t.end);
    });
  });

  test('POST /contexts/{id}/permissions - before permContext', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        typePermission: 'write',
        profil: user1.xConsumerUsername
      }
    };
    server.inject(options, function(response) {
      server.stop(t.end);
    });
  });

  // ===========================================================

  test('POST /contexts/1/permissions - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/1/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.profil, 'test');
      t.equal(result.typePermission, 'read');
      t.equal(Number(result.contextId), 1);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/2/permissions - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/2/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('POST /contexts/3/permissions - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/3/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('POST /contexts/4/permissions - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/4/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.profil, 'test');
      t.equal(result.typePermission, 'read');
      t.equal(Number(result.contextId), 4);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/5/permissions - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/5/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/permissions - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'write',
        profil: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.profil, 'test');
      t.equal(result.typePermission, 'write');
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/10/permissions - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/1/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'The pair contextId and profil must be unique.');
      t.equal(response.statusCode, 409);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/permissions - user2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'The pair contextId and profil must be unique.');
      t.equal(response.statusCode, 409);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/permissions - user2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/permissions',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      const message = 'The pair contextId and profil must be unique.';
      t.equal(result.message, message);
      t.equal(response.statusCode, 409);
      server.stop(t.end);
    });
  });

  test('POST /contexts/3/permissions - user2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/3/permissions',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        typePermission: 'read',
        profil: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.profil, 'test');
      t.equal(result.typePermission, 'read');
      t.equal(Number(result.contextId), 3);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/3/permissions - user2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/3/permissions',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        typePermission: 'test',
        profil: 'test2'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      let message = 'child "typePermission" fails because ';
      message += '["typePermission" must be one of [read, write]]';
      t.equal(result.message, message);
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });


  // ===============================================

  test('PATCH /contexts/1/permissions/1 - id not allowed', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/1/permissions/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        id: '1234'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, '"id" is not allowed');
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/1/permissions/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/1/permissions/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        profil: 'anotherProfil',
        typePermission: 'write'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(Number(result.id), 1);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/2/permissions/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/2/permissions/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'write'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/3/permissions/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/3/permissions/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'write'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/4/permissions/2 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/4/permissions/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'write'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/5/permissions/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/5/permissions/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'write'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/6/permissions/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/6/permissions/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'write'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(Number(result.id), 1);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/1/permissions/10 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/1/permissions/10',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        typePermission: 'write'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 404);
      server.stop(t.end);
    });
  });

// ===================================

  test('GET /contexts/1/permissions - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/1/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 1);
      t.equal(result[0].profil, 'test');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/2/permissions - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/2/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('GET /contexts/3/permissions - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/3/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('GET /contexts/4/permissions - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/4/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('GET /contexts/5/permissions - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/5/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('GET /contexts/6/permissions - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/6/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 2);
      t.equal(result[0].profil, user1.xConsumerUsername);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  // ============================================

  test('DELETE /contexts/1/permissions/3 - user1', function(t) {
    const options = {
      method: 'DELETE',
      url: '/contexts/1/permissions/3',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 204);
      server.stop(t.end);
    });
  });

  test('GET /contexts/1/permissions - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/1/permissions',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 0);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });


});
