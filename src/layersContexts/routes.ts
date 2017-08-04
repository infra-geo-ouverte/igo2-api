import * as Hapi from 'hapi';
import * as Joi from 'joi';

import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

import LayerContextController from './layerContext.controller';
import * as LayerContextValidator from './layerContext.validator';
import * as UserValidator from '../users/user.validator';


export default function (server: Hapi.Server,
                         configs: IServerConfiguration,
                         database: IDatabase) {

  const layerContextController = new LayerContextController(configs, database);
  server.bind(layerContextController);

  server.route({
      method: 'GET',
      path: '/contexts/{contextId}/layers',
      config: {
          handler: layerContextController.getLayersByContextId,
          tags: ['api', 'layersContexts', 'layers', 'contexts'],
          description: 'Get layers by context id.',
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
                          'description': 'Layers founded.'
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
      path: '/contexts/{contextId}/layers/{layerId}',
      config: {
          handler: layerContextController.getLayerContextById,
          tags: ['api', 'layersContexts'],
          description: 'Get layersContexts by id.',
          validate: {
              params: {
                  layerId: Joi.string().required(),
                  contextId: Joi.string().required()
              },
              headers: UserValidator.userValidator
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
      method: 'DELETE',
      path: '/contexts/{contextId}/layers/{layerId}',
      config: {
          handler: layerContextController.deleteLayerContext,
          tags: ['api', 'layersContexts'],
          description: 'Delete layerContext by id.',
          validate: {
              params: {
                  layerId: Joi.string().required(),
                  contextId: Joi.string().required()
              },
              headers: UserValidator.userValidator
          },
          plugins: {
              'hapi-swagger': {
                  responses: {
                      '204': {
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
      method: 'PATCH',
      path: '/contexts/{contextId}/layers/{layerId}',
      config: {
          handler: layerContextController.updateLayerContext,
          tags: ['api', 'layersContexts'],
          description: 'Update layerContext by id.',
          validate: {
              params: {
                  layerId: Joi.string().required(),
                  contextId: Joi.string().required()
              },
              payload: LayerContextValidator.updateLayerContextModel,
              headers: UserValidator.userValidator
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
      path: '/contexts/{contextId}/layers',
      config: {
          handler: layerContextController.createLayerContext,
          tags: ['api', 'layersContexts'],
          description: 'Create a layerContext.',
          validate: {
              payload: LayerContextValidator.createLayerContextModel,
              headers: UserValidator.userValidator
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
