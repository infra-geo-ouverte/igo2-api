import * as test from 'tape';
// import ToolContextCont from './toolContext.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfigs();

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /toolsContexts', function(t) {
      const options = {
          method: 'GET',
          url: '/toolsContexts'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 200);
          t.equal(response.result.length, 0);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - GET /toolsContexts/{id}', function(t) {
      const options = {
          method: 'GET',
          url: '/toolsContexts/2'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 404);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - POST /toolsContexts', function(t) {
      const options = {
          method: 'POST',
          url: '/toolsContexts',
          payload: {
            context_id: 1,
            tool_id: 1,
            options: {}
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 201);
          server.stop(t.end);
      });
  });


});
