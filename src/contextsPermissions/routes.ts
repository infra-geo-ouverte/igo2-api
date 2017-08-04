import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

import ContextPermissionController from './contextPermission.controller';
import * as ContextPermissionValidator from './contextPermission.validator';
import * as UserValidator from '../users/user.validator';

export default function(server: Hapi.Server,
  configs: IServerConfiguration,
  database: IDatabase) {

  const contextPermissionController =
    new ContextPermissionController(configs, database);

  server.bind(contextPermissionController);

  server.route({
    method: 'GET',
    path: '/contexts/{contextId}/permissions',
    config: {
      handler: contextPermissionController.getPermissionsByContextId,
      tags: ['api', 'contextsPermissions', 'contexts', 'permissions'],
      description: 'Get permissions by contexts id.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: UserValidator.authenticateValidator
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
    method: 'DELETE',
    path: '/contexts/{contextId}/permissions/{id}',
    config: {
      handler: contextPermissionController.deleteContextPermission,
      tags: ['api', 'contextsPermissions', 'contexts', 'permissions'],
      description: 'Delete contextPermission by id.',
      validate: {
        params: {
          id: Joi.string().required(),
          contextId: Joi.string().required()
        },
        headers: UserValidator.authenticateValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '204': {
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
    method: 'PATCH',
    path: '/contexts/{contextId}/permissions/{id}',
    config: {
      handler: contextPermissionController.updateContextPermission,
      tags: ['api', 'contextsPermissions', 'contexts', 'permissions'],
      description: 'Update contextPermission by id.',
      validate: {
        params: {
          id: Joi.string().required(),
          contextId: Joi.string().required()
        },
        payload: ContextPermissionValidator.updateContextPermissionModel,
        headers: UserValidator.authenticateValidator
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
    path: '/contexts/{contextId}/permissions',
    config: {
      handler: contextPermissionController.createContextPermission,
      tags: ['api', 'contextsPermissions', 'contexts', 'permissions'],
      description: 'Create a contextPermission.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        payload: ContextPermissionValidator.createContextPermissionModel,
        headers: UserValidator.authenticateValidator
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
