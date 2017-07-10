import * as Hapi from 'hapi';
import * as Joi from 'joi';
import ContextPermissionController from './contextPermission.controller';
import * as ContextPermissionValidator from './contextPermission.validator';
// import { jwtValidator } from '../users/user-validator';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default function (server: Hapi.Server,
                         configs: IServerConfigurations,
                         database: IDatabase) {

  const contextPermissionController =
    new ContextPermissionController(configs, database);

  server.bind(contextPermissionController);

  server.route({
      method: 'GET',
      path: '/contexts/{id}/permissions',
      config: {
          handler: contextPermissionController.getPermissionsByContextId,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'contextsPermissions', 'contexts', 'permissions'],
          description: 'Get permissions by contexts id.',
          validate: {
              params: {
                  id: Joi.string().required()
              }
              // headers: jwtValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '200': {
                          'description': 'permissions founded.'
                      },
                      '404': {
                          'description': 'Permission does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'GET',
      path: '/contextsPermissions/{id}',
      config: {
          handler: contextPermissionController.getContextPermissionById,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'contextsPermissions'],
          description: 'Get contextsPermissions by id.',
          validate: {
              params: {
                  id: Joi.string().required()
              }
              // headers: jwtValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '200': {
                          'description': 'ContextPermission founded.'
                      },
                      '404': {
                          'description': 'ContextPermission does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'GET',
      path: '/contextsPermissions',
      config: {
          handler: contextPermissionController.getcontextsPermissions,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'contextsPermissions'],
          description: 'Get all contextsPermissions.',
          validate: {
              query: {
                  // top: Joi.number().default(5),
                  // skip: Joi.number().default(0)
              }
              // headers: jwtValidator
          }
      }
  });

  server.route({
      method: 'DELETE',
      path: '/contextsPermissions/{id}',
      config: {
          handler: contextPermissionController.deleteContextPermission,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'contextsPermissions'],
          description: 'Delete contextPermission by id.',
          validate: {
              params: {
                  id: Joi.string().required()
              }
              // headers: jwtValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '200': {
                          'description': 'Deleted ContextPermission.',
                      },
                      '404': {
                          'description': 'ContextPermission does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'PUT',
      path: '/contextsPermissions/{id}',
      config: {
          handler: contextPermissionController.updateContextPermission,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'contextsPermissions'],
          description: 'Update contextPermission by id.',
          validate: {
              params: {
                  id: Joi.string().required()
              },
              payload: ContextPermissionValidator.updateContextPermissionModel
              // headers: jwtValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '200': {
                          'description': 'Deleted ContextPermission.',
                      },
                      '404': {
                          'description': 'ContextPermission does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'POST',
      path: '/contextsPermissions',
      config: {
          handler: contextPermissionController.createContextPermission,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'contextsPermissions'],
          description: 'Create a contextPermission.',
          validate: {
              payload: ContextPermissionValidator.createContextPermissionModel
              // headers: jwtValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '201': {
                          'description': 'Created ContextPermission.'
                      }
                  }
              }
          }
      }
  });
}
