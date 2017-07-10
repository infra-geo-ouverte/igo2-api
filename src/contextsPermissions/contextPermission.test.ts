import * as test from 'tape';
// import ContextPermissionCont from './contextPermission.controller';
import * as Server from '../server';
import * as Configs from '../configurations';

const serverConfigs = Configs.getServerConfigs();

Server.init(serverConfigs).then((server) => {

  test('Basic HTTP Tests - GET /contextsPermissions', function(t) {
      const options = {
          method: 'GET',
          url: '/contextsPermissions'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 200);
          t.equal(response.result.length, 0);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - GET /contextsPermissions/{id}', function(t) {
      const options = {
          method: 'GET',
          url: '/contextsPermissions/2'
      };
      server.inject(options, function(response) {
          t.equal(response.statusCode, 404);
          server.stop(t.end);
      });
  });


  test('Basic HTTP Tests - POST /contextsPermissions', function(t) {
      const options = {
          method: 'POST',
          url: '/contextsPermissions',
          payload: {
            context_id: 1,
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
