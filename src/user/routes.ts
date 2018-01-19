import * as Hapi from 'hapi';
import { UserController } from './user.controller';
import { UserValidator } from './user.validator';

export default function(server: Hapi.Server) {

  const userController = new UserController();
  server.bind(userController);

  server.route({
    method: 'GET',
    path: '/users/info',
    config: {
      handler: userController.info,
      tags: ['api', 'users'],
      description: 'Get user info.',
      validate: {
        headers: UserValidator.authenticateValidator,
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              'description': 'User founded.'
            },
            '401': {
              'description': 'Please login.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/users',
    config: {
      handler: userController.get,
      tags: ['api', 'users'],
      description: 'Get all users of your group',
      validate: {
        headers: UserValidator.adminValidator,
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              'description': 'Users founded.'
            },
            '401': {
              'description': 'Please login.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/users/profils',
    config: {
      handler: userController.getProfils,
      tags: ['api', 'users', 'profils'],
      description: 'Get profils from user.',
      validate: {
        headers: UserValidator.authenticateValidator,
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              'description': 'Profils founded.'
            },
            '401': {
              'description': 'Please login.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'DELETE',
    path: '/users',
    config: {
      handler: userController.delete,
      tags: ['api', 'users'],
      description: 'Delete current user.',
      validate: {
        headers: UserValidator.authenticateValidator,
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '204': {
              'description': 'User deleted.',
            },
            '401': {
              'description': 'User does not have authorization.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'PATCH',
    path: '/users',
    config: {
      handler: userController.update,
      tags: ['api', 'users'],
      description: 'Update current user info.',
      validate: {
        payload: UserValidator.updateModel,
        headers: UserValidator.authenticateValidator,
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              'description': 'Updated info.',
            },
            '401': {
              'description': 'User does not have authorization.'
            }
          }
        }
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/users/login',
    config: {
      handler: userController.login,
      tags: ['api', 'users'],
      description: 'Login a user.',
      validate: {
        payload: UserValidator.loginModel,
        failAction: userController.failLogin
      },
      plugins: {
        'hapi-swagger': {
          responses: {
            '200': {
              'description': 'User logged in.'
            }
          }
        }
      }
    }
  });
}
