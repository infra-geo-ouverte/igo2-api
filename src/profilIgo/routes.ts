import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';

import { ProfilIgoController } from './profilIgo.controller';
import { ProfilIgoValidator } from './profilIgo.validator';
import { LoginValidator } from '../login/login.validator';

export default function (server: Hapi.Server) {
  const profilIgoController = new ProfilIgoController();
  server.bind(profilIgoController);

  server.route({
    method: 'GET',
    path: '/profils-users',
    handler: profilIgoController.getProfilsAndUsers,
    options: {
      tags: ['api', 'ProfilIgo'],
      cache: false,
      validate: {
        headers: LoginValidator.TokenValidator,
        query: {
          q: Joi.string().regex(/^[\wÀ-ÿ\ \-\_\(\)\/']+$/, 'Alphanum latin'),
          limit: Joi.number()
            .max(20)
            .optional()
        },
        options: {
          stripUnknown: true
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/profils',
    handler: profilIgoController.get,
    options: {
      tags: ['api', 'ProfilIgo'],
      description: 'Get all profils Igo.',
      cache: false,
      validate: {
        headers: LoginValidator.TokenValidator
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/profils/{name}',
    handler: profilIgoController.getById,
    options: {
      tags: ['api', 'ProfilIgo'],
      description: 'Get Profil Igo.',
      cache: false,
      validate: {
        params: {
          name: Joi.string().required()
        },
        headers: LoginValidator.TokenValidator
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/profils/{name}',
    handler: profilIgoController.delete,
    options: {
      tags: ['api', 'ProfilIgo'],
      description: 'Delete Profil Igo by name.',
      validate: {
        params: {
          name: Joi.string().required()
        },
        headers: LoginValidator.adminTokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            204: {
              description: 'Deleted Profil Igo.'
            },
            404: {
              description: 'Profil Igo does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/profils/{name}',
    handler: profilIgoController.update,
    options: {
      tags: ['api', 'ProfilIgo'],
      description: 'Update Profil Igo by name.',
      validate: {
        params: {
          name: Joi.string().required()
        },
        payload: ProfilIgoValidator.updateModel,
        headers: LoginValidator.adminTokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Deleted Profil Igo.'
            },
            404: {
              description: 'Profil Igo does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/profils',
    handler: profilIgoController.create,
    options: {
      tags: ['api', 'ProfilIgo'],
      description: 'Create a profil Igo.',
      validate: {
        payload: ProfilIgoValidator.createModel,
        headers: LoginValidator.adminTokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Created profil Igo.'
            }
          }
        }
      }
    }
  });
}
