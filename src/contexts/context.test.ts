import * as test from 'tape';
// import ContextCont from './context.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfigs();

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /contexts', function(t) {
      const options = {
          method: 'GET',
          url: '/contexts'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 200);
          t.equal(response.result.length, 0);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - GET /contexts/{id}', function(t) {
      const options = {
          method: 'GET',
          url: '/contexts/2'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 404);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - POST /contexts', function(t) {
      const options = {
          method: 'POST',
          url: '/contexts',
          payload: {
            name: 'dummy',
            title: 'dummy',
            scope: 'private',
            map: {}
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 201);
          server.stop(t.end);
      });
  });


});
