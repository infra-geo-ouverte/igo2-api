import * as Hapi from '@hapi/hapi';
import * as Joi from 'joi';

import { UserIgoController } from './userIgo.controller';
import { UserIgoValidator } from './userIgo.validator';
import { LoginValidator } from '../login/login.validator';

export default function (server: Hapi.Server) {
  const userIgoController = new UserIgoController();
  server.bind(userIgoController);

  server.route({
    method: 'GET',
    path: '/user/igo',
    handler: userIgoController.get,
    options: {
      tags: ['api', 'userIgo'],
      description: 'Get user Igo.',
      cache: false,
      validate: {
        headers: LoginValidator.TokenValidator
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/user/igo',
    handler: userIgoController.delete,
    options: {
      tags: ['api', 'userIgo'],
      description: 'Delete user Igo by id.',
      validate: {
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            204: {
              description: 'Deleted User Igo.'
            },
            404: {
              description: 'User Igo does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/user/igo',
    handler: userIgoController.update,
    options: {
      tags: ['api', 'userIgo'],
      description: 'Update user Igo by id.',
      validate: {
        payload: UserIgoValidator.updateModel,
        query: {
          mergePreference: Joi.bool()
        },
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            200: {
              description: 'Updated User Igo.'
            },
            404: {
              description: 'User Igo does not exists.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/user/igo',
    handler: userIgoController.create,
    options: {
      tags: ['api', 'userIgo'],
      description: 'Create a user Igo.',
      validate: {
        payload: UserIgoValidator.createModel,
        headers: LoginValidator.adminTokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Created User Igo.'
            }
          }
        }
      }
    }
  });
}
