import * as Hapi from '@hapi/hapi';

import { LoginController } from './login.controller';
import { LoginValidator } from './login.validator';

export default function (server: Hapi.Server) {
  const loginController = new LoginController();
  server.bind(loginController);

  server.route({
    method: 'POST',
    path: '/login',
    handler: loginController.authenticate,
    options: {
      tags: ['api', 'login'],
      description: 'Authenticate user.',
      validate: {
        payload: LoginValidator.model
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'User authenticated.'
            },
            401: {
              description: 'ERROR authenticated'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/refresh',
    handler: loginController.refreshToken,
    options: {
      tags: ['api', 'refresh'],
      description: 'Refresh the current token.',
      validate: {
        headers: LoginValidator.TokenValidator
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            201: {
              description: 'Token refreshed'
            },
            401: {
              description: 'ERROR on token refresh'
            }
          }
        }
      }
    }
  });
}
