import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { ContextHiddenController } from './contextHidden.controller';
import { UserValidator } from '../user/user.validator';

export default function(server: Hapi.Server) {
  const contextHiddenController = new ContextHiddenController();

  server.bind(contextHiddenController);

  server.route({
    method: 'GET',
    path: '/contexts/hiddens',
    handler: contextHiddenController.get,
    options: {
      tags: ['api', 'contexts', 'hiddens'],
      description: 'Get all hiddens contexts.',
      validate: {
        headers: UserValidator.authenticateValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Hiddens contexts founded.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/contexts/{contextId}/hiddens',
    handler: contextHiddenController.getById,
    options: {
      tags: ['api', 'contexts', 'hiddens'],
      description: 'Get hidden context',
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
              description: 'Hidden context founded.'
            },
            '404': {
              description: 'Context is not hidden.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/contexts/{contextId}/show',
    handler: contextHiddenController.show,
    options: {
      tags: ['api', 'contexts', 'hiddens'],
      description: 'Show a context',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: UserValidator.authenticateValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '204': {
              description: 'Context is now shown'
            },
            '404': {
              description: 'Context is not hidden'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/contexts/{contextId}/hide',
    handler: contextHiddenController.hide,
    options: {
      tags: ['api', 'contexts', 'hiddens'],
      description: 'Hide a contex.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: UserValidator.authenticateValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '201': {
              description: 'Context hidden'
            }
          }
        }
      }
    }
  });
}
