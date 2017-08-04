import * as test from 'tape';
// import LayerCont from './layer.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const xConsumerId = testConfigs.xConsumerId;

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /layers', function(t) {
      const options = {
          method: 'GET',
          url: '/layers',
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


  test('Basic HTTP Tests - GET /layers/{id}', function(t) {
      const options = {
          method: 'GET',
          url: '/layers/2',
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


  test('Basic HTTP Tests - POST /layers', function(t) {
      const options = {
          method: 'POST',
          url: '/layers',
          headers: {
            'x-consumer-username': 'barm08',
            'x-consumer-id': xConsumerId
          },
          payload: {
            title: 'dummy',
            type: 'osm',
            protected: false,
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
