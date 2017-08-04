import * as test from 'tape';
// import ContextPermissionCont from './contextPermission.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfig();
const testConfigs = Configs.getTestConfig();
const xConsumerId = testConfigs.xConsumerId;

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /contexts/{id}/permissions', function(t) {
      const options = {
          method: 'GET',
          url: '/contexts/1/permissions',
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


  test('Basic HTTP Tests - POST /contexts/{id}/permissions', function(t) {
      const options = {
          method: 'POST',
          url: '/contexts/1/permissions',
          headers: {
            'x-consumer-username': 'barm08',
            'x-consumer-id': xConsumerId
          },
          payload: {
            profil: 'COG',
            typePermission: 'read'
          }
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 201);
          server.stop(t.end);
      });
  });


});
