import * as test from 'tape';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const xConsumerId = testConfigs.xConsumerId;

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /contexts/{cid}/layers', function(t) {
      const options = {
          method: 'GET',
          url: '/contexts/1/layers',
          headers: {
            'x-consumer-username': 'barm08',
            'x-consumer-id': xConsumerId
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 200);
          t.equal(response.result.length, 0);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - GET /contexts/{cid}/layers/{id}', function(t) {
      const options = {
          method: 'GET',
          url: '/contexts/1/layers/2',
          headers: {
            'x-consumer-username': 'barm08',
            'x-consumer-id': xConsumerId
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 404);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - POST /contexts/{id}/layers', function(t) {
      const options = {
          method: 'POST',
          url: '/contexts/1/layers',
          headers: {
            'x-consumer-username': 'barm08',
            'x-consumer-id': xConsumerId
          },
          payload: {
            layerId: 1,
            view: {},
            source: {}
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 201);
          server.stop(t.end);
      });
  });


});
