import { AppInstance } from '../app.interface';
import {
  adminAuthorization,
  authenticatedAuthorization
} from '../auth/authorization/authorization';
import { addRoutingTagHook } from '../utils/url.utils';
import { ToolController } from './tool.controller';
import {
  CreateToolSchema,
  DeleteToolSchema,
  GetAllToolSchema,
  GetToolSchema,
  UpdateToolSchema
} from './tool.schema';

export const routes = (app: AppInstance) => {
  const controller = new ToolController(app);

  addRoutingTagHook(app, ['Tool']);

  app.route({
    method: 'GET',
    url: '/:id',
    preHandler: authenticatedAuthorization,
    handler: controller.getById,
    schema: GetToolSchema
  });

  app.route({
    method: 'GET',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.get,
    schema: GetAllToolSchema
  });

  app.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: adminAuthorization,
    handler: controller.delete,
    schema: DeleteToolSchema
  });

  app.route({
    method: 'PATCH',
    url: '/:id',
    preHandler: adminAuthorization,
    handler: controller.update,
    schema: UpdateToolSchema
  });

  app.route({
    method: 'POST',
    url: '',
    preHandler: adminAuthorization,
    handler: controller.create,
    schema: CreateToolSchema
  });
};
