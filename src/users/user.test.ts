import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfigs();

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - POST /users/login', function(t) {
      const options = {
          method: 'POST',
          url: '/users/login',
          payload: {
            username: 'dummy',
            password: 'dummy'
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 401);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - GET /users/info', function(t) {
      const options = {
          method: 'GET',
          url: '/user/info'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 401);
          server.stop(t.end);
      });
  });

});
