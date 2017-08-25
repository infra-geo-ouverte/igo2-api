import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const anonyme = testConfigs.anonyme;
const admin = testConfigs.admin;
const user1 = testConfigs.user1;
const user2 = testConfigs.user2;

Server.init(serverConfigs).then((server) => {

  test('POST /contexts - context 1 ', function(t) {
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
        map: {
          view: {
            center: [-73, 46]
          }
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.uri, 'user1Private');
      t.equal(result.title, 'user1Private');
      t.equal(result.scope, 'private');
      t.equal(result.map.view.center[1], 46);
      t.equal(result.owner, user1.xConsumerUsername);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts - context 2', function(t) {
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

  test('POST /contexts - context 3', function(t) {
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

  test('POST /contexts - context 4', function(t) {
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

  test('POST /contexts - context 5', function(t) {
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

  test('POST /contexts - context 6', function(t) {
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
      const result: any = response.result;
      t.equal(result.uri, 'user2ProtectedWrite');
      t.equal(result.title, 'user2ProtectedWrite');
      t.equal(result.scope, 'protected');
      t.equal(result.owner, user2.xConsumerUsername);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/4/permissions - before context', function(t) {
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
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/permissions - before context', function(t) {
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
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts - anonyme', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId,
        'x-anonymous-consumer': 'true'
      },
      payload: {
        uri: 'user2ProtectedWrite',
        title: 'user2ProtectedWrite',
        scope: 'protected',
        map: {}
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must be authenticated');
      t.equal(response.statusCode, 401);
      server.stop(t.end);
    });
  });

  // =========================================================

  test('POST /contexts/1/clone - context 1 ', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/1/clone',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user1Private');
      t.equal(result.scope, 'private');
      t.equal(result.owner, user1.xConsumerUsername);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });


  test('POST /contexts/2/clone - context 2 ', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/2/clone',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });


  test('POST /contexts/3/clone - context 3 ', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/3/clone',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user2Public');
      t.equal(result.scope, 'private');
      t.equal(result.owner, user1.xConsumerUsername);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/4/clone - context 4 ', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/4/clone',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user2PublicWrite');
      t.equal(result.scope, 'private');
      t.equal(result.owner, user1.xConsumerUsername);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/5/clone - context 5 ', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/5/clone',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/clone - context 6 ', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/clone',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user2ProtectedWrite');
      t.equal(result.scope, 'private');
      t.equal(result.owner, user1.xConsumerUsername);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  // =========================================================

  test('Patch /contexts/7 - context 7 ', function(t) {
    const options = {
      method: 'Patch',
      url: '/contexts/7',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        title: 'user1PrivateClone',
        scope: 'public',
        map: {
          view: {
            zoom: 11
          }
        }
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('Patch /contexts/1 - context 1 ', function(t) {
    const options = {
      method: 'Patch',
      url: '/contexts/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        map: {
          view: {
            zoom: 13
          }
        }
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('Patch /contexts/2 - context 2 ', function(t) {
    const options = {
      method: 'Patch',
      url: '/contexts/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        map: {
          view: {
            zoom: 12
          }
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('Patch /contexts/3 - context 3 ', function(t) {
    const options = {
      method: 'Patch',
      url: '/contexts/3',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        map: {
          view: {
            zoom: 3
          }
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('Patch /contexts/4 - context 4 ', function(t) {
    const options = {
      method: 'Patch',
      url: '/contexts/4',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        map: {
          view: {
            zoom: 4
          }
        }
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('Patch /contexts/5 - context 5 ', function(t) {
    const options = {
      method: 'Patch',
      url: '/contexts/5',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        map: {
          view: {
            zoom: 5
          }
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('Patch /contexts/6 - context 6 ', function(t) {
    const options = {
      method: 'Patch',
      url: '/contexts/6',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        map: {
          view: {
            zoom: 6
          }
        }
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  // =========================================================

  test('GET /contexts/7 - context 7 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/7',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user1PrivateClone');
      t.equal(result.scope, 'public');
      t.equal(result.map.view.zoom, 11);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });


  test('DELETE /contexts/7 - context 7 ', function(t) {
    const options = {
      method: 'DELETE',
      url: '/contexts/7',
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

  test('GET /contexts/7 - after delete ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/7',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  // =========================================================

  test('GET /contexts/1/details - context 1 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/1/details',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user1Private');
      t.equal(result.scope, 'private');
      t.equal(result.map.view.zoom, 13);
      t.equal(result.permission, 'write');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/2/details - context 2 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/2/details',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('GET /contexts/3/details - context 3 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/3/details',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user2Public');
      t.equal(result.scope, 'public');
      t.equal(result.permission, 'read');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/4/details - context 4 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/4/details',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user2PublicWrite');
      t.equal(result.scope, 'public');
      t.equal(result.map.view.zoom, 4);
      t.equal(result.permission, 'write');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/5/details - context 5 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/5/details',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('GET /contexts/6/details - context 6 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/6/details',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user2ProtectedWrite');
      t.equal(result.scope, 'protected');
      t.equal(result.map.view.zoom, 6);
      t.equal(result.permission, 'write');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });


  test('GET /contexts/4/details - anonyme 4 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/4/details',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user2PublicWrite');
      t.equal(result.scope, 'public');
      t.equal(result.permission, 'read');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });


  test('GET /contexts/6/details - anonyme 6 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/6/details',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });


  test('GET /contexts/4/details - admin 4 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/4/details',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.title, 'user2PublicWrite');
      t.equal(result.scope, 'public');
      t.equal(result.permission, 'read');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });


  test('GET /contexts/6/details - admin 6 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/6/details',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have read permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  // =========================================================

  test('GET /contexts - admin ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.ours.length, 0);
      t.equal(result.shared.length, 0);
      t.equal(result.public.length, 2);
      t.equal(result.public[0].permission, 'read');
      t.equal(result.public[1].permission, 'read');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts - anonyme ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.ours.length, 0);
      t.equal(result.shared.length, 0);
      t.equal(result.public.length, 2);
      t.equal(result.public[0].permission, 'read');
      t.equal(result.public[1].permission, 'read');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts - user1 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      console.log(result);
      t.equal(result.ours.length, 4);
      t.equal(result.shared.length, 1);
      t.equal(result.public.length, 2);
      t.equal(result.ours[0].permission, 'write');
      t.equal(result.shared[0].permission, 'write');
      t.equal(result.public[0].permission, 'read');
      t.equal(result.public[1].permission, 'write');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts - user2 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.ours.length, 5);
      t.equal(result.shared.length, 0);
      t.equal(result.public.length, 0);
      t.equal(result.ours[0].permission, 'write');
      t.equal(result.ours[2].permission, 'write');
      t.equal(result.ours[4].permission, 'write');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });


});
