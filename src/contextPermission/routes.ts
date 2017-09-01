import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { ContextPermissionController } from './contextPermission.controller';
import { ContextPermissionValidator } from './contextPermission.validator';

export default function(server: Hapi.Server) {

  const contextPermissionController =
    new ContextPermissionController();

  server.bind(contextPermissionController);

  server.route({
    method: 'GET',
    path: '/contexts/{contextId}/permissions',
    config: {
      handler: contextPermissionController.getByContextId,
      tags: ['api', 'contextsPermissions', 'contexts', 'permissions'],
      description: 'Get permissions by contexts id.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.writePermission
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
      handler: contextPermissionController.delete,
      tags: ['api', 'contextsPermissions', 'contexts', 'permissions'],
      description: 'Delete contextPermission by id.',
      validate: {
        params: {
          id: Joi.string().required(),
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.writePermission
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
      handler: contextPermissionController.update,
      tags: ['api', 'contextsPermissions', 'contexts', 'permissions'],
      description: 'Update contextPermission by id.',
      validate: {
        params: {
          id: Joi.string().required(),
          contextId: Joi.string().required()
        },
        payload: ContextPermissionValidator.updateModel,
        headers: ContextPermissionValidator.writePermission
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
      handler: contextPermissionController.create,
      tags: ['api', 'contextsPermissions', 'contexts', 'permissions'],
      description: 'Create a contextPermission.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        payload: ContextPermissionValidator.createModel,
        headers: ContextPermissionValidator.writePermission
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
