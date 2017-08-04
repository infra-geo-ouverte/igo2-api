import * as test from 'tape';
// import ToolCont from './tool.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const xConsumerId = testConfigs.xConsumerId;

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /tools', function(t) {
      const options = {
          method: 'GET',
          url: '/tools',
          headers: {
            'x-consumer-username': 'barm08',
            'x-consumer-id': xConsumerId
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 200);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - GET /tools/{id}', function(t) {
      const options = {
          method: 'GET',
          url: '/tools/2',
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


  test('Basic HTTP Tests - POST /tools', function(t) {
      const options = {
          method: 'POST',
          url: '/tools',
          headers: {
            'x-consumer-username': 'barm08',
            'x-consumer-id': xConsumerId
          },
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
