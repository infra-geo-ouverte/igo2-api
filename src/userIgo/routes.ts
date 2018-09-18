import * as Hapi from 'hapi';

import { UserIgoController } from './userIgo.controller';
import { UserIgoValidator } from './userIgo.validator';
import { UserValidator } from '../user/user.validator';

export default function(server: Hapi.Server) {
  const userIgoController = new UserIgoController();
  server.bind(userIgoController);

  server.route({
    method: 'GET',
    path: '/user/igo',
    handler: userIgoController.get,
    options: {
      tags: ['api', 'userIgo'],
      description: 'Get user Igo.',
      validate: {
        headers: UserValidator.authenticateValidator
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
        headers: UserValidator.authenticateValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '204': {
              description: 'Deleted User Igo.'
            },
            '404': {
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
        headers: UserValidator.authenticateValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              description: 'Deleted User Igo.'
            },
            '404': {
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
        headers: UserValidator.authenticateValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '201': {
              description: 'Created User Igo.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/contexts/default',
    handler: userIgoController.setDefaultContext,
    options: {
      tags: ['api', 'userIgo'],
      description: 'Define default context',
      validate: {
        payload: UserIgoValidator.createModel,
        headers: UserValidator.authenticateValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '201': {
              description: 'Default Context defined'
            }
          }
        }
      }
    }
  });
}
