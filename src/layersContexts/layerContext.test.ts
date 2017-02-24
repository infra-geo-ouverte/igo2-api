import * as test from 'tape';
// import LayerContextCont from './layerContext.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfigs();

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /layersContexts', function(t) {
      const options = {
          method: 'GET',
          url: '/layersContexts'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 200);
          t.equal(response.result.length, 0);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - GET /layersContexts/{id}', function(t) {
      const options = {
          method: 'GET',
          url: '/layersContexts/2'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 404);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - POST /layersContexts', function(t) {
      const options = {
          method: 'POST',
          url: '/layersContexts',
          payload: {
            context_id: 1,
            layer_id: 1,
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
