import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const admin = testConfigs.admin;
const user1 = testConfigs.user1;
const user2 = testConfigs.user2;

Server.init(serverConfigs).then((server) => {

  test('POST /contexts - before layerContext - Context 1', function(t) {
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

  test('POST /contexts - before layerContext - context 2', function(t) {
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

  test('POST /contexts - before layerContext - context 3', function(t) {
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

  test('POST /contexts - before layerContext - context 4', function(t) {
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

  test('POST /contexts - before layerContext - context 5', function(t) {
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

  test('POST /contexts - before layerContext - context 6', function(t) {
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

  test('POST /contexts/4/permissions - before layerContext', function(t) {
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

  test('POST /contexts/6/permissions - before layerContext', function(t) {
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


  test('POST /layers - before layerContext', function(t) {
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
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /layers - before layerContext', function(t) {
    const options = {
      method: 'POST',
      url: '/layers',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      },
      payload: {
        title: 'dummyTitle2',
        type: 'wfs',
        view: {},
        source: {}
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  // ===========================================================

  test('POST /contexts/1/layers - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/1/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        layerId: 1,
        view: {
          minZoom: 5
        },
        order: 2
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.layerId, 1);
      t.equal(result.order, 2);
      t.equal(Number(result.contextId), 1);
      t.equal(result.view.minZoom, 5);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/1/layers - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/1/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        layerId: 2,
        view: {
          minZoom: 4
        },
        order: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.layerId, 2);
      t.equal(result.order, 1);
      t.equal(Number(result.contextId), 1);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/2/layers - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/2/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        layerId: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('POST /contexts/3/layers - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/3/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        layerId: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('POST /contexts/4/layers - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/4/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        layerId: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.layerId, 1);
      t.equal(Number(result.contextId), 4);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/5/layers - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/5/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        layerId: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Must have write permission for this context');
      t.equal(response.statusCode, 403);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/layers - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        layerId: 1
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.layerId, 1);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/10/layers - user1', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/1/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        layerId: 10,
        view: {
          minZoom: 5
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Layer can not be found.');
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/layers - user2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/layers',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        layerId: 2
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.layerId, 2);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('POST /contexts/6/layers - user2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/6/layers',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        layerId: 2
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'The pair contextId and layerId must be unique.');
      t.equal(response.statusCode, 409);
      server.stop(t.end);
    });
  });

  test('POST /contexts/3/layers - user2', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts/3/layers',
      headers: {
        'x-consumer-username': user2.xConsumerUsername,
        'x-consumer-id': user2.xConsumerId
      },
      payload: {
        layerId: 2
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.layerId, 2);
      t.equal(Number(result.contextId), 3);
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  // ===============================================

  test('PATCH /contexts/1/layers/1 - user1 = layerId not allowed', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/1/layers/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        layerId: 1,
        view: {
          minZoom: 5
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, '"layerId" is not allowed');
      t.equal(response.statusCode, 400);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/1/layers/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/1/layers/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        view: {
          minZoom: 3
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(Number(result.layerId), 1);
      t.equal(Number(result.contextId), 1);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/2/layers/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/2/layers/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        view: {
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

  test('PATCH /contexts/3/layers/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/3/layers/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        view: {
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

  test('PATCH /contexts/4/layers/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/4/layers/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        view: {
          minZoom: 6
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(Number(result.layerId), 1);
      t.equal(Number(result.contextId), 4);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/5/layers/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/5/layers/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        view: {
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

  test('PATCH /contexts/6/layers/1 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/6/layers/1',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        view: {
          minZoom: 11
        }
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(Number(result.layerId), 1);
      t.equal(Number(result.contextId), 6);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('PATCH /contexts/1/layers/10 - user1', function(t) {
    const options = {
      method: 'PATCH',
      url: '/contexts/1/layers/10',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        view: {
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

  test('GET /contexts/1/layers - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/1/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 2);
      t.equal(result[0].layerId, 2);
      t.equal(result[1].layerId, 1);
      t.equal(result[0].view.minZoom, 4);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/2/layers - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/2/layers',
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

  test('GET /contexts/3/layers - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/3/layers',
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

  test('GET /contexts/4/layers - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/4/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 1);
      t.equal(result[0].view.minZoom, 6);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/5/layers - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/5/layers',
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

  test('GET /contexts/6/layers - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/6/layers',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.length, 2);
      t.equal(result[0].view.minZoom, 11);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  // ============================================

  test('GET /contexts/6/layers/2 - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/6/layers/2',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.layerId, 2);
      t.equal(result.contextId, 6);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('DELETE /contexts/6/layers/2 - user1', function(t) {
    const options = {
      method: 'DELETE',
      url: '/contexts/6/layers/2',
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

  test('GET /contexts/6/layers/2 - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/contexts/6/layers/2',
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

  // ======================================================

  test('GET /contexts/1/details - layerContext 1', function(t) {
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
      t.equal(result.layers.length, 2);
      t.equal(result.layers[0].title, 'dummyTitle2');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /contexts/2/details - layerContext 2 ', function(t) {
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
      t.equal(result.layers.length, 0);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  let idContextWithLayer;
  test('POST /contexts - layerContext 1 ', function(t) {
    const options = {
      method: 'POST',
      url: '/contexts',
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      },
      payload: {
        uri: 'withLayer',
        title: 'withLayer',
        scope: 'public',
        map: {},
        layers: [{
          id: '1',
          order: '4'
        }, {
          id: '90'
        }, {
          id: '2',
          order: '2'
        }, {
          id: '3',
          order: '1'
        }, {
          title: 'dummyTitleLayerContext',
          type: 'wms',
          view: {},
          source: {
            url: 'http://source.com'
          },
          order: '3'
        }]
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      idContextWithLayer = result.id;
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('GET /contexts/{id}/details - context with layer', function(t) {
    const options = {
      method: 'GET',
      url: `/contexts/${idContextWithLayer}/details`,
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.uri, 'withLayer');
      t.equal(result.layers.length, 3);
      t.equal(result.layers[2].id, 1);
      t.equal(result.layers[0].id, 2);
      t.equal(result.layers[1].title, 'dummyTitleLayerContext');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  let idContextClonedWithLayer;
  test('POST /contexts/{id}/clone - context with layer', function(t) {
    const options = {
      method: 'POST',
      url: `/contexts/${idContextWithLayer}/clone`,
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      idContextClonedWithLayer = result.id;
      t.equal(response.statusCode, 201);
      server.stop(t.end);
    });
  });

  test('GET /contexts/{id}/details - context cloned with layer', function(t) {
    const options = {
      method: 'GET',
      url: `/contexts/${idContextClonedWithLayer}/details`,
      headers: {
        'x-consumer-username': user1.xConsumerUsername,
        'x-consumer-id': user1.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.layers.length, 3);
      t.equal(result.layers[2].id, 1);
      t.equal(result.layers[0].id, 2);
      t.equal(result.layers[1].title, 'dummyTitleLayerContext');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

});
