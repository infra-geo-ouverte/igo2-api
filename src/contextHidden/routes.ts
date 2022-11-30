import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';

import { ContextHiddenController } from './contextHidden.controller';
import { LoginValidator } from '../login/login.validator';

export default function (server: Hapi.Server) {
  const contextHiddenController = new ContextHiddenController();

  server.bind(contextHiddenController);

  server.route({
    method: 'GET',
    path: '/contexts/hidden',
    handler: contextHiddenController.get,
    options: {
      tags: ['api', 'contexts', 'hidden'],
      description: 'Get all hidden contexts.',
      cache: false,
      validate: {
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Hidden contexts founded.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/contexts/{contextId}/hidden',
    handler: contextHiddenController.getById,
    options: {
      tags: ['api', 'contexts', 'hidden'],
      description: 'Get hidden context',
      cache: false,
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Hidden context founded.'
            },
            404: {
              description: 'Context is not hidden.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/contexts/{contextId}/show',
    handler: contextHiddenController.show,
    options: {
      tags: ['api', 'contexts', 'hidden'],
      description: 'Show a context',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            204: {
              description: 'Context is now shown'
            },
            404: {
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
      tags: ['api', 'contexts', 'hidden'],
      description: 'Hide a contex.',
      validate: {
        params: {
          contextId: Joi.string().required()
        },
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Context hidden'
            }
          }
        }
      }
    }
  });
}
