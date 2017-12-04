import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { ContextController } from './context.controller';
import { ContextValidator } from './context.validator';
import { ContextPermissionValidator } from '../contextPermission';
import { UserValidator } from '../user/user.validator';

export default function(server: Hapi.Server) {

  const contextController = new ContextController();
  server.bind(contextController);

  server.route({
    method: 'GET',
    path: '/contexts/default',
    config: {
      handler: contextController.getDefault,
      tags: ['api', 'contexts'],
      description: 'Get default context.',
      validate: {
        headers: UserValidator.authenticateValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Context founded.'
            },
            '404': {
              description: 'Context does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/contexts/{contextId}',
    config: {
      handler: contextController.getById,
      tags: ['api', 'contexts'],
      description: 'Get context by id.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.readPermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Context founded.'
            },
            '404': {
              description: 'Context does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/contexts/{contextId}/details',
    config: {
      handler: contextController.getDetailsById,
      tags: ['api', 'tools', 'layers', 'contexts'],
      description: 'Get details of context by context id.',
      validate: {
        params: {
          contextId: Joi.string().required()
        }
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Context founded.'
            },
            '404': {
              description: 'Context does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/contexts',
    config: {
      handler: contextController.get,
      auth: false,
      tags: ['api', 'contexts'],
      description: 'Get all contexts.',
      validate: {
        headers: UserValidator.userValidator
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/contexts/{contextId}',
    config: {
      handler: contextController.delete,
      tags: ['api', 'contexts'],
      description: 'Delete context by id.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.writePermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '204': {
              description: 'Deleted Context.',
            },
            '401': {
              description: 'Must be authenticated'
            },
            '404': {
              description: 'Context does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/contexts/{contextId}',
    config: {
      handler: contextController.update,
      tags: ['api', 'contexts'],
      description: 'Update context by id.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        payload: ContextValidator.updateModel,
        headers: ContextPermissionValidator.writePermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Deleted Context.',
            },
            '401': {
              description: 'Must be authenticated'
            },
            '404': {
              description: 'Context does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/contexts',
    config: {
      handler: contextController.create,
      tags: ['api', 'contexts'],
      description: 'Create a context.',
      validate: {
        payload: ContextValidator.createModel,
        headers: UserValidator.userValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '201': {
              description: 'Created Context.'
            },
            '401': {
              description: 'Must be authenticated'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/contexts/{contextId}/clone',
    config: {
      handler: contextController.clone,
      tags: ['api', 'contexts'],
      description: 'Clone a context.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.authenticatedAndReadPermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '201': {
              description: 'Cloned context.'
            },
            '401': {
              description: 'Must be authenticated'
            }
          }
        }
      }
    }
  });
}
