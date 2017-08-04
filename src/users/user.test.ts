import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - POST /users/login', function(t) {
      const options = {
          method: 'POST',
          url: '/users/login',
          payload: {
            username: 'test',
            password: 'test'
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 401);
          server.stop(t.end);
      });
  });

});
