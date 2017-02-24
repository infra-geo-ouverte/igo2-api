import * as test from 'tape';
// import LayerContextCont from './layerContext.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfigs();

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /layerContexts', function(t) {
      const options = {
          method: 'GET',
          url: '/layerContexts'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 200);
          t.equal(response.result.length, 0);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - GET /layerContexts/{id}', function(t) {
      const options = {
          method: 'GET',
          url: '/layerContexts/2'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 404);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - POST /layerContexts', function(t) {
      const options = {
          method: 'POST',
          url: '/layerContexts',
          payload: {
            context_id: 1,
            layer_id: 1,
            properties: {}
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 201);
          server.stop(t.end);
      });
  });


});
