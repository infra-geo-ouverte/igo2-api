import * as test from 'tape';
// import LayerCont from './layer.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfigs();

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /layers', function(t) {
      const options = {
          method: 'GET',
          url: '/layers'
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
          url: '/layers/2'
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
          payload: {
            name: 'dummy',
            protected: false,
            properties: {}
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 201);
          server.stop(t.end);
      });
  });


});
