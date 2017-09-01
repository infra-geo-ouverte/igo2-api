import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const admin = testConfigs.admin;
const user1 = testConfigs.user1;
const user2 = testConfigs.user2;

Server.init(serverConfigs).then((server) => {

  test('POST /contexts - before toolContext - ', function(t) {
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

  test('POST /contexts - before toolContext - context 2', function(t) {
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

  test('POST /contexts - before toolContext - context 3', function(t) {
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

  test('POST /contexts - before toolContext - context 4', function(t) {
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

  test('POST /contexts - before toolContext - context 5', function(t) {
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

  test('POST /contexts - before toolContext - context 6', function(t) {
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

  test('POST /contexts/4/permissions - before toolContext', function(t) {
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

  test('POST /contexts/6/permissions - before toolContext', function(t) {
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

  test('POST /tools - before toolContext', function(t) {
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
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /tools - before toolContext', function(t) {
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
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  // ===========================================================

  test('POST /contexts/1/tools - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/1/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        toolId: 1,
        options: {
          minZoom: 5
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.toolId, 1);
      t.equal(Number(result.contextId), 1);
      t.equal(result.options.minZoom, 5);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/2/tools - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/2/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        toolId: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('POST /contexts/3/tools - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/3/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        toolId: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('POST /contexts/4/tools - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/4/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        toolId: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.toolId, 1);
      t.equal(Number(result.contextId), 4);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/5/tools - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/5/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        toolId: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/tools - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        toolId: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.toolId, 1);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/10/tools - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/1/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        toolId: 10,
        options: {
          minZoom: 5
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Tool can not be found.');
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/tools - user2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/tools',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        toolId: 2
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.toolId, 2);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/tools - user2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/tools',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        toolId: 2
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'The pair contextId and toolId must be unique.');
      t.equal(response.statusCode, 409);
      server.stop(t.end);
    });
  });

  test('POST /contexts/3/tools - user2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/3/tools',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        toolId: 2
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.toolId, 2);
      t.equal(Number(result.contextId), 3);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  // ===============================================

  test('PATCH /contexts/1/tools/1 - user1 = toolId not allowed', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/1/tools/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        toolId: 1,
        options: {
          minZoom: 5
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, '"toolId" is not allowed');
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/1/tools/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/1/tools/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        options: {
          minZoom: 3
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(Number(result.toolId), 1);
      t.equal(Number(result.contextId), 1);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/2/tools/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/2/tools/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        options: {
          minZoom: 4
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

  test('PATCH /contexts/3/tools/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/3/tools/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        options: {
          minZoom: 8
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

  test('PATCH /contexts/4/tools/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/4/tools/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        options: {
          minZoom: 6
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(Number(result.toolId), 1);
      t.equal(Number(result.contextId), 4);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/5/tools/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/5/tools/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        options: {
          minZoom: 9
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

  test('PATCH /contexts/6/tools/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/6/tools/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        options: {
          minZoom: 11
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(Number(result.toolId), 1);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/1/tools/10 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/1/tools/10',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        options: {
          minZoom: 5
        }
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 404);
      server.stop(t.end);
    });
  });

// ===================================

  test('GET /contexts/1/tools - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/1/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 1);
      t.equal(result[0].options.minZoom, 3);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/2/tools - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/2/tools',
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

  test('GET /contexts/3/tools - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/3/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 1);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/4/tools - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/4/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 1);
      t.equal(result[0].options.minZoom, 6);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/5/tools - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/5/tools',
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

  test('GET /contexts/6/tools - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/6/tools',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 2);
      t.equal(result[0].options.minZoom, 11);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  // ============================================

  test('GET /contexts/6/tools/2 - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/6/tools/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.toolId, 2);
      t.equal(result.contextId, 6);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('DELETE /contexts/6/tools/2 - user1', function(t) {
    const options = {
      method: 'DELETE',
      url: '/contexts/6/tools/2',
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

  test('GET /contexts/6/tools/2 - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/6/tools/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 404);
      server.stop(t.end);
    });
  });

  // ==============================================

  test('GET /contexts/1/details - toolContext 1 ', function(t) {
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
      t.equal(result.tools.length, 1);
      t.equal(result.tools[0].title, 'dummyTitle');
      t.equal(result.toolbar.length, 1);
      t.equal(result.toolbar[0], 'dummyName');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/2/details - toolContext 2 ', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/2/details',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.tools.length, 0);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  let idContextWithTool;
  test('POST /contexts - toolContext 1 ', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
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
    server.inject(options, function(response) {
      const result: any = response.result;
      idContextWithTool = result.id;
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('GET /contexts/{id}/details - context with tool ', function(t) {
    const options = {
      method: 'GET',
      url: `/contexts/${idContextWithTool}/details`,
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.uri, 'withTool');
      t.equal(result.tools.length, 2);
      t.equal(result.tools[0].id, 1);
      t.equal(result.tools[1].id, 2);
      t.equal(result.toolbar.length, 2);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

});
