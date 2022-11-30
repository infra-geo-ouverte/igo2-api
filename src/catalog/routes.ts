import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';

import { CatalogController } from './catalog.controller';
import { CatalogValidator } from './catalog.validator';
import { LoginValidator } from '../login/login.validator';

export default function (server: Hapi.Server) {
  const catalogController = new CatalogController();
  server.bind(catalogController);

  server.route({
    method: 'GET',
    path: '/catalogs/{id}',
    handler: catalogController.getById,
    options: {
      tags: ['api', 'catalogs'],
      description: 'Get catalogs by id.',
      cache: false,
      validate: {
        params: {
          id: Joi.string().required()
        }
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Catalog founded.'
            },
            404: {
              description: 'Catalog does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/catalogs',
    handler: catalogController.get,
    options: {
      tags: ['api', 'catalogs'],
      description: 'Get all catalogs.',
      cache: false
    }
  });

  server.route({
    method: 'DELETE',
    path: '/catalogs/{id}',
    handler: catalogController.delete,
    options: {
      tags: ['api', 'catalogs'],
      description: 'Delete catalog by id.',
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
              description: 'Deleted Catalog.'
            },
            404: {
              description: 'Catalog does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/catalogs/{id}',
    handler: catalogController.update,
    options: {
      tags: ['api', 'catalogs'],
      description: 'Update catalog by id.',
      validate: {
        params: {
          id: Joi.string().required()
        },
        payload: CatalogValidator.updateModel,
        headers: LoginValidator.adminTokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Deleted Catalog.'
            },
            404: {
              description: 'Catalog does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/catalogs',
    handler: catalogController.create,
    options: {
      tags: ['api', 'catalogs'],
      description: 'Create a catalog.',
      validate: {
        payload: CatalogValidator.createModel,
        headers: LoginValidator.adminTokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Created Catalog.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/test',
    handler: () => { return true; }
  });
}
