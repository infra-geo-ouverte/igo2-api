import * as Hapi from 'hapi';
import * as Joi from 'joi';
import ToolContextController from './toolContext.controller';
import * as ToolContextValidator from './toolContext.validator';
// import { jwtValidator } from '../users/user-validator';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default function (server: Hapi.Server,
                         configs: IServerConfigurations,
                         database: IDatabase) {

  const toolContextController = new ToolContextController(configs, database);
  server.bind(toolContextController);

  server.route({
      method: 'GET',
      path: '/contexts/{id}/tools',
      config: {
          handler: toolContextController.getToolsByContextId,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'toolsContexts', 'tools', 'contexts'],
          description: 'Get tools by context id.',
          validate: {
              params: {
                  id: Joi.string().required()
              }
              // headers: jwtValidator
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
      path: '/toolsContexts/{id}',
      config: {
          handler: toolContextController.getToolContextById,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'toolsContexts'],
          description: 'Get toolsContexts by id.',
          validate: {
              params: {
                  id: Joi.string().required()
              }
              // headers: jwtValidator
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
      method: 'GET',
      path: '/toolsContexts',
      config: {
          handler: toolContextController.gettoolsContexts,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'toolsContexts'],
          description: 'Get all toolsContexts.',
          validate: {
              query: {
                  // top: Joi.number().default(5),
                  // skip: Joi.number().default(0)
              }
              // headers: jwtValidator
          }
      }
  });

  server.route({
      method: 'DELETE',
      path: '/toolsContexts/{id}',
      config: {
          handler: toolContextController.deleteToolContext,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'toolsContexts'],
          description: 'Delete toolContext by id.',
          validate: {
              params: {
                  id: Joi.string().required()
              }
              // headers: jwtValidator
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
      method: 'PUT',
      path: '/toolsContexts/{id}',
      config: {
          handler: toolContextController.updateToolContext,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'toolsContexts'],
          description: 'Update toolContext by id.',
          validate: {
              params: {
                  id: Joi.string().required()
              },
              payload: ToolContextValidator.updateToolContextModel
              // headers: jwtValidator
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
      path: '/toolsContexts',
      config: {
          handler: toolContextController.createToolContext,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'toolsContexts'],
          description: 'Create a toolContext.',
          validate: {
              payload: ToolContextValidator.createToolContextModel
              // headers: jwtValidator
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
