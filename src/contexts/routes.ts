import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

import ContextController from './context.controller';
import * as ContextValidator from './context.validator';
import * as UserValidator from '../users/user.validator';

export default function(server: Hapi.Server,
  configs: IServerConfiguration,
  database: IDatabase) {

  const contextController = new ContextController(configs, database);
  server.bind(contextController);

  server.route({
    method: 'GET',
    path: '/contexts/{id}',
    config: {
      handler: contextController.getContextById,
      tags: ['api', 'contexts'],
      description: 'Get contexts by id.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        headers: UserValidator.userValidator
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
    path: '/contexts/{id}/details',
    config: {
      handler: contextController.getContextDetailsById,
      tags: ['api', 'tools', 'layers', 'contexts'],
      description: 'Get details of context by context id.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        headers: UserValidator.userValidator
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
      handler: contextController.getContexts,
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
    path: '/contexts/{id}',
    config: {
      handler: contextController.deleteContext,
      tags: ['api', 'contexts'],
      description: 'Delete context by id.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        headers: UserValidator.authenticateValidator
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
    path: '/contexts/{id}',
    config: {
      handler: contextController.updateContext,
      tags: ['api', 'contexts'],
      description: 'Update context by id.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        payload: ContextValidator.updateContextModel,
        headers: UserValidator.authenticateValidator
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
      handler: contextController.createContext,
      tags: ['api', 'contexts'],
      description: 'Create a context.',
      validate: {
        payload: ContextValidator.createContextModel,
        headers: UserValidator.authenticateValidator
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
    path: '/contexts/{id}/clone',
    config: {
      handler: contextController.cloneContext,
      tags: ['api', 'contexts'],
      description: 'Clone a context.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        headers: UserValidator.authenticateValidator
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
