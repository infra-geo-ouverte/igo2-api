import * as Hapi from 'hapi';
import * as Joi from 'joi';
import LayerContextController from './layerContext.controller';
import * as LayerContextValidator from './layerContext.validator';
// import { jwtValidator } from '../users/user-validator';
import { IDatabase } from '../database';
import { IServerConfigurations } from '../configurations';

export default function (server: Hapi.Server,
                         configs: IServerConfigurations,
                         database: IDatabase) {

  const layerContextController = new LayerContextController(configs, database);
  server.bind(layerContextController);

  server.route({
      method: 'GET',
      path: '/layerContexts/{id}',
      config: {
          handler: layerContextController.getLayerContextById,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'layerContexts'],
          description: 'Get layerContexts by id.',
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
                          'description': 'LayerContext founded.'
                      },
                      '404': {
                          'description': 'LayerContext does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'GET',
      path: '/layerContexts',
      config: {
          handler: layerContextController.getLayerContexts,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'layerContexts'],
          description: 'Get all layerContexts.',
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
      path: '/layerContexts/{id}',
      config: {
          handler: layerContextController.deleteLayerContext,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'layerContexts'],
          description: 'Delete layerContext by id.',
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
                          'description': 'Deleted LayerContext.',
                      },
                      '404': {
                          'description': 'LayerContext does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'PUT',
      path: '/layerContexts/{id}',
      config: {
          handler: layerContextController.updateLayerContext,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'layerContexts'],
          description: 'Update layerContext by id.',
          validate: {
              params: {
                  id: Joi.string().required()
              },
              payload: LayerContextValidator.updateLayerContextModel
              // headers: jwtValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '200': {
                          'description': 'Deleted LayerContext.',
                      },
                      '404': {
                          'description': 'LayerContext does not exists.'
                      }
                  }
              }
          }
      }
  });

  server.route({
      method: 'POST',
      path: '/layerContexts',
      config: {
          handler: layerContextController.createLayerContext,
          // auth: 'jwt',
          auth: false,
          tags: ['api', 'layerContexts'],
          description: 'Create a layerContext.',
          validate: {
              payload: LayerContextValidator.createLayerContextModel
              // headers: jwtValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '201': {
                          'description': 'Created LayerContext.'
                      }
                  }
              }
          }
      }
  });
}
