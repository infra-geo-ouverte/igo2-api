import * as test from 'tape';
// import ToolCont from './tool.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfigs();

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /tools', function(t) {
      const options = {
          method: 'GET',
          url: '/tools'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 200);
          t.equal(response.result.length, 0);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - GET /tools/{id}', function(t) {
      const options = {
          method: 'GET',
          url: '/tools/2'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 404);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - POST /tools', function(t) {
      const options = {
          method: 'POST',
          url: '/tools',
          payload: {
            name: 'dummy',
            title: 'dummy',
            protected: false,
            inToolbar: true,
            options: {}
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 201);
          server.stop(t.end);
      });
  });


});
