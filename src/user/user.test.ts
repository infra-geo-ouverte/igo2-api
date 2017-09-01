import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const admin = testConfigs.admin;
const anonyme = testConfigs.anonyme;
const user1 = testConfigs.user1;

Server.init(serverConfigs).then((server) => {

  test('POST /users/login - wrong password', function(t) {
    const options = {
      method: 'POST',
      url: '/users/login',
      payload: {
        username: 'test',
        password: 'test',
        typeConnection: 'test'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.message, 'Incorrect username and/or password');
      t.equal(response.statusCode, 401);
      server.stop(t.end);
    });
  });

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

  // =======================================================

  test('GET /users/info - user1', function(t) {
    const options = {
      method: 'GET',
      url: '/users/info',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': user1.xConsumerId,
        'x-consumer-custom-id': '1'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.source, 'test');
      t.equal(result.sourceId, 'test');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /users/info - inexistant', function(t) {
    const options = {
      method: 'GET',
      url: '/users/info',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': 'test',
        'x-consumer-custom-id': '2'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 404);
      server.stop(t.end);
    });
  });

  test('GET /users/info - inexistant', function(t) {
    const options = {
      method: 'GET',
      url: '/users/info'
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 401);
      server.stop(t.end);
    });
  });

  // =======================================================

  test('GET /users/profils - admin', function(t) {
    const options = {
      method: 'GET',
      url: '/users/profils',
      headers: {
        'x-consumer-username': admin.xConsumerUsername,
        'x-consumer-id': admin.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.profils.length, 1);
      t.equal(result.profils[0], 'admin');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /users/profils - anonyme', function(t) {
    const options = {
      method: 'GET',
      url: '/users/profils',
      headers: {
        'x-consumer-username': anonyme.xConsumerUsername,
        'x-consumer-id': anonyme.xConsumerId
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.profils.length, 0);
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  // =======================================================

  test('PATCH /users - inexistant', function(t) {
    const options = {
      method: 'PATCH',
      url: '/users',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': 'test',
        'x-consumer-custom-id': '1'
      },
      payload: {
        email: 'test@igo.com'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

  test('GET /users/info - after patch', function(t) {
    const options = {
      method: 'GET',
      url: '/users/info',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': 'test',
        'x-consumer-custom-id': '1'
      }
    };
    server.inject(options, function(response) {
      const result: any = response.result;
      t.equal(result.source, 'test');
      t.equal(result.sourceId, 'test');
      t.equal(result.email, 'test@igo.com');
      t.equal(response.statusCode, 200);
      server.stop(t.end);
    });
  });

// =======================================================

  test('DELETE /users - inexistant', function(t) {
    const options = {
      method: 'DELETE',
      url: '/users',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': 'test',
        'x-consumer-custom-id': '1'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 204);
      server.stop(t.end);
    });
  });

  test('GET /users/info - after delete', function(t) {
    const options = {
      method: 'GET',
      url: '/users/info',
      headers: {
        'x-consumer-username': 'test',
        'x-consumer-id': 'test',
        'x-consumer-custom-id': '1'
      }
    };
    server.inject(options, function(response) {
      t.equal(response.statusCode, 404);
      server.stop(t.end);
    });
  });

});
