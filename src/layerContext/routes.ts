import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';

import { LayerContextController } from './layerContext.controller';
import { LayerContextValidator } from './layerContext.validator';
import { ContextPermissionValidator } from '../contextPermission';

export default function (server: Hapi.Server) {
  const layerContextController = new LayerContextController();
  server.bind(layerContextController);

  server.route({
    method: 'GET',
    path: '/contexts/{contextId}/layers',
    handler: layerContextController.getByContextId,
    options: {
      tags: ['api', 'layerContext', 'layers', 'contexts'],
      description: 'Get layers by context id.',
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
              description: 'Layers founded.'
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
    path: '/contexts/{contextId}/layers/{layerId}',
    handler: layerContextController.getById,
    options: {
      tags: ['api', 'layerContext'],
      description: 'Get layerContext by id.',
      cache: false,
      validate: {
        params: {
          layerId: Joi.string().required(),
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.readPermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'LayerContext founded.'
            },
            404: {
              description: 'LayerContext does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/contexts/{contextId}/layers/{layerId}',
    handler: layerContextController.delete,
    options: {
      tags: ['api', 'layerContext'],
      description: 'Delete layerContext by id.',
      validate: {
        params: {
          layerId: Joi.string().required(),
          contextId: Joi.string().required()
        },
        headers: ContextPermissionValidator.writePermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            204: {
              description: 'Deleted LayerContext.'
            },
            404: {
              description: 'LayerContext does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/contexts/{contextId}/layers/{layerId}',
    handler: layerContextController.update,
    options: {
      tags: ['api', 'layerContext'],
      description: 'Update layerContext by id.',
      validate: {
        params: {
          layerId: Joi.string().required(),
          contextId: Joi.string().required()
        },
        payload: LayerContextValidator.updateModel,
        headers: ContextPermissionValidator.writePermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Deleted LayerContext.'
            },
            404: {
              description: 'LayerContext does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/contexts/{contextId}/layers',
    handler: layerContextController.create,
    options: {
      tags: ['api', 'layerContext'],
      description: 'Create a layerContext.',
      validate: {
        payload: LayerContextValidator.createModel,
        headers: ContextPermissionValidator.writePermission
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Created LayerContext.'
            }
          }
        }
      }
    }
  });
}
