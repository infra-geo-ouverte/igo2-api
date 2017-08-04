import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

import ToolContextController from './toolContext.controller';
import * as ToolContextValidator from './toolContext.validator';
import * as UserValidator from '../users/user.validator';

export default function (server: Hapi.Server,
                         configs: IServerConfiguration,
                         database: IDatabase) {

  const toolContextController = new ToolContextController(configs, database);
  server.bind(toolContextController);

  server.route({
      method: 'GET',
      path: '/contexts/{contextId}/tools',
      config: {
          handler: toolContextController.getToolsByContextId,
          tags: ['api', 'toolsContexts', 'tools', 'contexts'],
          description: 'Get tools by context id.',
          validate: {
              params: {
                  contextId: Joi.string().required()
              },
              headers: UserValidator.userValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '200': {
                          'description': 'Tools founded.'
                      },
                      '404': {
                          'description': 'Context does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'GET',
      path: '/contexts/{contextId}/tools/{toolId}',
      config: {
          handler: toolContextController.getToolContextById,
          tags: ['api', 'toolsContexts'],
          description: 'Get toolsContexts by id.',
          validate: {
              params: {
                  toolId: Joi.string().required(),
                  contextId: Joi.string().required()
              },
              headers: UserValidator.userValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '200': {
                          'description': 'ToolContext founded.'
                      },
                      '404': {
                          'description': 'ToolContext does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'DELETE',
      path: '/contexts/{contextId}/tools/{toolId}',
      config: {
          handler: toolContextController.deleteToolContext,
          tags: ['api', 'toolsContexts'],
          description: 'Delete toolContext by id.',
          validate: {
              params: {
                  toolId: Joi.string().required(),
                  contextId: Joi.string().required()
              },
              headers: UserValidator.authenticateValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '204': {
                          'description': 'Deleted ToolContext.',
                      },
                      '404': {
                          'description': 'ToolContext does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'PATCH',
      path: '/contexts/{contextId}/tools/{toolId}',
      config: {
          handler: toolContextController.updateToolContext,
          tags: ['api', 'toolsContexts'],
          description: 'Update toolContext by id.',
          validate: {
              params: {
                  toolId: Joi.string().required(),
                  contextId: Joi.string().required()
              },
              payload: ToolContextValidator.updateToolContextModel,
              headers: UserValidator.authenticateValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '200': {
                          'description': 'Deleted ToolContext.',
                      },
                      '404': {
                          'description': 'ToolContext does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'POST',
      path: '/contexts/{contextId}/tools',
      config: {
          handler: toolContextController.createToolContext,
          tags: ['api', 'toolsContexts'],
          description: 'Create a toolContext.',
          validate: {
              params: {
                  contextId: Joi.string().required()
              },
              payload: ToolContextValidator.createToolContextModel,
              headers: UserValidator.authenticateValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '201': {
                          'description': 'Created ToolContext.'
                      }
                  }
              }
          }
      }
  });
}
