import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';

import { ContextController } from './context.controller';
import { ContextValidator } from './context.validator';
import { ContextPermissionValidator } from '../contextPermission';

import { LoginValidator } from '../login/login.validator';

export default function (server: Hapi.Server) {
  const contextController = new ContextController();
  server.bind(contextController);

  server.route({
    method: 'GET',
    path: '/contexts/default',
    handler: contextController.getDefault,
    options: {
      tags: ['api', 'contexts'],
      description: 'Get default context.',
      cache: false,
      validate: {
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Context founded.'
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
    method: 'POST',
    path: '/contexts/default',
    handler: contextController.setDefaultContext,
    options: {
      tags: ['api', 'context'],
      description: 'Define default context',
      validate: {
        payload: {
          defaultContextId: Joi.number().integer().required()
        },
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Default Context defined'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/contexts/{contextId}',
    handler: contextController.getById,
    options: {
      tags: ['api', 'contexts'],
      description: 'Get context by id.',
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
              description: 'Context founded.'
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
    path: '/contexts/{contextId}/details',
    handler: contextController.getDetailsById,
    options: {
      tags: ['api', 'tools', 'layers', 'contexts'],
      description: 'Get details of context by context id.',
      cache: false,
      validate: {
        params: {
          contextId: Joi.string().required()
        }
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Context founded.'
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
    path: '/contexts',
    handler: contextController.get,
    options: {
      auth: false,
      tags: ['api', 'contexts'],
      description: 'Get all contexts.',
      cache: false,
      validate: {
        query: ContextValidator.getQuery
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/contexts/{contextId}',
    handler: contextController.delete,
    options: {
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
            204: {
              description: 'Deleted Context.'
            },
            401: {
              description: 'Must be authenticated'
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
    method: 'PATCH',
    path: '/contexts/{contextId}',
    handler: contextController.update,
    options: {
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
            200: {
              description: 'Deleted Context.'
            },
            401: {
              description: 'Must be authenticated'
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
    method: 'POST',
    path: '/contexts',
    handler: contextController.create,
    options: {
      tags: ['api', 'contexts'],
      description: 'Create a context.',
      validate: {
        payload: ContextValidator.createModel,
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Created Context.'
            },
            401: {
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
    handler: contextController.clone,
    options: {
      tags: ['api', 'contexts'],
      description: 'Clone a context.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.readPermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Cloned context.'
            },
            401: {
              description: 'Must be authenticated'
            }
          }
        }
      }
    }
  });
}
