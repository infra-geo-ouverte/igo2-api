import { AppInstance } from '../app.interface';
import { authenticatedAuthorization } from '../auth/authorization/authorization';
import { addRoutingTagHook } from '../utils/url.utils';
import { UserController } from './user.controller';
import {
  CreateUserSchema,
  DeleteUserSchema,
  GetUserSchema,
  UpdateUserSchema
} from './user.schema';

export const routes = (app: AppInstance) => {
  const controller = new UserController(app);

  addRoutingTagHook(app, ['User'], ['User']);

  app.route({
    method: 'GET',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.get,
    schema: GetUserSchema
  });

  app.route({
    method: 'DELETE',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.delete,
    schema: DeleteUserSchema
  });

  app.route({
    method: 'PATCH',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.update,
    schema: UpdateUserSchema
  });

  app.route({
    method: 'POST',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.create,
    schema: CreateUserSchema
  });
};
