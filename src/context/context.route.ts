import { AppInstance } from '../app.interface';
import { authenticatedAuthorization } from '../auth/authorization/authorization';
import { addRoutingTagHook } from '../utils/url.utils';
import {
  hasContextReadPermission,
  hasContextReadPermissionByUri,
  hasContextWritePermission,
  validateContextHook
} from './context';
import { ContextController } from './context.controller';
import {
  CloneContextSchema,
  CreateContextSchema,
  DeleteContextSchema,
  GetContextByIdSchema,
  GetContextDefaultSchema,
  GetContextDetailedByIdSchema,
  GetContextDetailedByUriSchema,
  GetContextsSchema,
  PostContextDefaultSchema,
  UpdateContextSchema
} from './context.schema';
import { routes as hiddenRoutes } from './hidden/context-hidden.route';
import { routes as layerRoutes } from './layer/context-layer.route';
import { subRoutes as permissionRoutes } from './permission/context-permission.route';
import { userRoutes as toolUserRoutes } from './tool/context-tool.route';

export const CONTEXT_TAG = 'Context';

export const routes = (app: AppInstance) => {
  const controller = new ContextController(app);

  addRoutingTagHook(app, [CONTEXT_TAG]);

  app.route({
    method: 'POST',
    url: '/default',
    preHandler: authenticatedAuthorization,
    handler: controller.setDefaultContext,
    schema: PostContextDefaultSchema
  });

  app.route({
    method: 'DELETE',
    url: '/:contextId',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.delete,
    schema: DeleteContextSchema
  });

  app.route({
    method: 'PATCH',
    url: '/:contextId',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.update,
    schema: UpdateContextSchema
  });

  app.route({
    method: 'POST',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.create,
    schema: CreateContextSchema
  });

  app.route({
    method: 'POST',
    url: '/:contextId/clone',
    preHandler: [authenticatedAuthorization, hasContextReadPermission(app)],
    handler: controller.cloneDetailed,
    schema: CloneContextSchema
  });

  app.route({
    method: 'GET',
    url: '/default',
    handler: controller.getDefault,
    schema: GetContextDefaultSchema
  });

  app.route({
    method: 'GET',
    url: '/:contextId/details',
    preHandler: [hasContextReadPermission(app)],
    handler: controller.getDetailsById,
    schema: GetContextDetailedByIdSchema
  });

  app.route({
    method: 'GET',
    url: '/uri/:uri/details',
    preHandler: [hasContextReadPermissionByUri(app)],
    handler: controller.getDetailsByUri,
    schema: GetContextDetailedByUriSchema
  });

  app.route({
    method: 'GET',
    url: '/:contextId',
    preHandler: [hasContextReadPermission(app)],
    handler: controller.getById,
    schema: GetContextByIdSchema
  });

  app.route({
    method: 'GET',
    url: '',
    handler: controller.get,
    schema: GetContextsSchema
  });

  app.register(contextSubRoutes);
};

const contextSubRoutes = (app: AppInstance) => {
  app.addHook('preHandler', validateContextHook(app));

  app.register(permissionRoutes, { prefix: '/:contextId/permissions' });
  app.register(layerRoutes, { prefix: '/:contextId/layers' });
  app.register(hiddenRoutes, { prefix: '/:contextId' });
  app.register(toolUserRoutes, { prefix: '/:contextId/tools' });
};
