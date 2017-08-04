import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const xConsumerId = testConfigs.xConsumerId;

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /contexts', function(t) {
      const options = {
          method: 'GET',
          url: '/contexts',
          headers: {
            'x-consumer-username': 'barm08',
            'x-consumer-id': xConsumerId
          },
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 200);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - GET /contexts/{id}', function(t) {
      const options = {
          method: 'GET',
          url: '/contexts/2',
          headers: {
            'x-consumer-username': 'barm08',
            'x-consumer-id': xConsumerId
          },
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
          headers: {
            'x-consumer-username': 'barm08',
            'x-consumer-id': xConsumerId
          },
          payload: {
            uri: 'dummy',
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
