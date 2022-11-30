import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';

import { ToolController } from './tool.controller';
import { ToolValidator } from './tool.validator';
import { LoginValidator } from '../login/login.validator';

export default function (server: Hapi.Server) {
  const toolController = new ToolController();
  server.bind(toolController);

  server.route({
    method: 'GET',
    path: '/tools/{id}',
    handler: toolController.getById,
    options: {
      tags: ['api', 'tools'],
      description: 'Get tools by id.',
      cache: false,
      validate: {
        params: {
          id: Joi.string().required()
        },
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Tool founded.'
            },
            404: {
              description: 'Tool does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/tools',
    handler: toolController.get,
    options: {
      tags: ['api', 'tools'],
      description: 'Get all tools.',
      cache: false,
      validate: {
        headers: LoginValidator.TokenValidator
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/tools/{id}',
    handler: toolController.delete,
    options: {
      tags: ['api', 'tools'],
      description: 'Delete tool by id.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        headers: LoginValidator.adminTokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            204: {
              description: 'Deleted Tool.'
            },
            404: {
              description: 'Tool does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/tools/{id}',
    handler: toolController.update,
    options: {
      tags: ['api', 'tools'],
      description: 'Update tool by id.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        payload: ToolValidator.updateModel,
        headers: LoginValidator.adminTokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Deleted Tool.'
            },
            404: {
              description: 'Tool does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/tools',
    handler: toolController.create,
    options: {
      tags: ['api', 'tools'],
      description: 'Create a tool.',
      validate: {
        payload: ToolValidator.createModel,
        headers: LoginValidator.adminTokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Created Tool.'
            }
          }
        }
      }
    }
  });
}
