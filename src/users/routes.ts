import * as Hapi from 'hapi';
import UserController from './user.controller';
import * as UserValidator from './user.validator';
import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

export default function(server: Hapi.Server,
  serverConfigs: IServerConfiguration,
  database: IDatabase) {

  const userController = new UserController(serverConfigs, database);
  server.bind(userController);

  server.route({
    method: 'GET',
    path: '/users/info',
    config: {
      handler: userController.infoUser,
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
    path: '/users/profils',
    config: {
      handler: userController.getProfilsReq,
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
      handler: userController.deleteUser,
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
      handler: userController.updateUser,
      tags: ['api', 'users'],
      description: 'Update current user info.',
      validate: {
        payload: UserValidator.updateUserModel,
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
      handler: userController.loginUser,
      tags: ['api', 'users'],
      description: 'Login a user.',
      validate: {
        payload: UserValidator.loginUserModel
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
