import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';

import { PoiController } from './poi.controller';
import { PoiValidator } from './poi.validator';
import { LoginValidator } from '../login/login.validator';

export default function (server: Hapi.Server) {
  const poiController = new PoiController();
  server.bind(poiController);

  server.route({
    method: 'GET',
    path: '/pois/{id}',
    handler: poiController.getById,
    options: {
      tags: ['api', 'pois'],
      description: 'Get pois by id.',
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
              description: 'Poi founded.'
            },
            404: {
              description: 'Poi does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/pois',
    handler: poiController.get,
    options: {
      tags: ['api', 'pois'],
      description: 'Get all pois.',
      cache: false,
      validate: {
        headers: LoginValidator.TokenValidator
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/pois/{id}',
    handler: poiController.delete,
    options: {
      tags: ['api', 'pois'],
      description: 'Delete poi by id.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            204: {
              description: 'Deleted Poi.'
            },
            404: {
              description: 'Poi does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/pois/{id}',
    handler: poiController.update,
    options: {
      tags: ['api', 'pois'],
      description: 'Update poi by id.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        payload: PoiValidator.updateModel,
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Deleted Poi.'
            },
            404: {
              description: 'Poi does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/pois',
    handler: poiController.create,
    options: {
      tags: ['api', 'pois'],
      description: 'Create a poi.',
      validate: {
        payload: PoiValidator.createModel,
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Created Poi.'
            }
          }
        }
      }
    }
  });
}
