import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';

import { ToolContextController } from './toolContext.controller';
import { ToolContextValidator } from './toolContext.validator';
import { ContextPermissionValidator } from '../contextPermission';

export default function (server: Hapi.Server) {
  const toolContextController = new ToolContextController();
  server.bind(toolContextController);

  server.route({
    method: 'GET',
    path: '/contexts/{contextId}/tools',
    handler: toolContextController.getByContextId,
    options: {
      tags: ['api', 'toolContext', 'tools', 'contexts'],
      description: 'Get tools by context id.',
      cache: false,
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.readPermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Tools founded.'
            },
            404: {
              description: 'Context does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/contexts/{contextId}/tools/{toolId}',
    handler: toolContextController.getById,
    options: {
      tags: ['api', 'toolContext'],
      description: 'Get toolContext by id.',
      cache: false,
      validate: {
        params: {
          toolId: Joi.string().required(),
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.readPermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'ToolContext founded.'
            },
            404: {
              description: 'ToolContext does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/contexts/{contextId}/tools/{toolId}',
    handler: toolContextController.delete,
    options: {
      tags: ['api', 'toolContext'],
      description: 'Delete toolContext by id.',
      validate: {
        params: {
          toolId: Joi.string().required(),
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.writePermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            204: {
              description: 'Deleted ToolContext.'
            },
            404: {
              description: 'ToolContext does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/contexts/{contextId}/tools/{toolId}',
    handler: toolContextController.update,
    options: {
      tags: ['api', 'toolContext'],
      description: 'Update toolContext by id.',
      validate: {
        params: {
          toolId: Joi.string().required(),
          contextId: Joi.string().required()
        },
        payload: ToolContextValidator.updateModel,
        headers: ContextPermissionValidator.writePermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Deleted ToolContext.'
            },
            404: {
              description: 'ToolContext does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/contexts/{contextId}/tools',
    handler: toolContextController.create,
    options: {
      tags: ['api', 'toolContext'],
      description: 'Create a toolContext.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        payload: ToolContextValidator.createModel,
        headers: ContextPermissionValidator.writePermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Created ToolContext.'
            }
          }
        }
      }
    }
  });
}
