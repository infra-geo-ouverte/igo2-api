import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';

import { LayerController } from './layer.controller';
import { LayerValidator } from './layer.validator';
import { LoginValidator } from '../login/login.validator';

export default function (server: Hapi.Server) {
  const layerController = new LayerController();
  server.bind(layerController);

  server.route({
    method: 'GET',
    path: '/layers/options',
    handler: layerController.getOptions,
    options: {
      tags: ['api', 'layers'],
      description: 'Get layers by source.',
      cache: false,
      validate: {
        query: {
          type: Joi.string().required(),
          url: Joi.string(),
          layers: Joi.string(),
          key: Joi.string()
        },
        headers: LoginValidator.userValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Layer founded.'
            },
            404: {
              description: 'Layer does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/layers/admin/options',
    handler: layerController.getAdminOptions,
    options: {
      tags: ['api', 'layers'],
      description: 'Get layers by source.',
      cache: false,
      validate: {
        query: {
          type: Joi.string().required(),
          url: Joi.string(),
          layers: Joi.string()
        },
        headers: LoginValidator.adminTokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Layer founded.'
            },
            404: {
              description: 'Layer does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/layers/{id}',
    handler: layerController.getById,
    options: {
      tags: ['api', 'layers'],
      description: 'Get layers by id.',
      cache: false,
      validate: {
        params: {
          id: Joi.string().required()
        },
        headers: LoginValidator.userValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Layer founded.'
            },
            404: {
              description: 'Layer does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/layers/search',
    handler: layerController.searchAndFormatAsItems,
    options: {
      tags: ['api', 'layers'],
      description: 'Search layers.',
      cache: false,
      validate: {
        query: {
          q: Joi.string().required(),
          type: Joi.string().required(),
          limit: Joi.number(),
          page: Joi.number()
        },
        headers: LoginValidator.userValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Layers founded.'
            },
            404: {
              description: 'Layers does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/layers',
    handler: layerController.get,
    options: {
      tags: ['api', 'layers'],
      description: 'Get all layers.',
      cache: false,
      validate: {
        headers: LoginValidator.adminTokenValidator
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/baselayers',
    handler: layerController.getBaseLayers,
    options: {
      tags: ['api', 'layers'],
      description: 'Get base layers.',
      cache: false,
      validate: {
        headers: LoginValidator.userValidator
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/layers/{id}',
    handler: layerController.delete,
    options: {
      tags: ['api', 'layers'],
      description: 'Delete layer by id.',
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
              description: 'Deleted Layer.'
            },
            404: {
              description: 'Layer does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/layers/{id}',
    handler: layerController.update,
    options: {
      tags: ['api', 'layers'],
      description: 'Update layer by id.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        payload: LayerValidator.updateModel,
        headers: LoginValidator.adminTokenValidator
      } as any,
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Deleted Layer.'
            },
            404: {
              description: 'Layer does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/layers',
    handler: layerController.create,
    options: {
      tags: ['api', 'layers'],
      description: 'Create a layer.',
      validate: {
        payload: LayerValidator.createModel,
        headers: LoginValidator.userValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Created Layer.'
            }
          }
        }
      }
    }
  });
}
