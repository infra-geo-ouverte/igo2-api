import { AppInstance } from '../../app.interface';
import { authenticatedAuthorization } from '../../auth/authorization/authorization';
import { addRoutingTagHook } from '../../utils/url.utils';
import {
  hasContextReadPermission,
  hasContextWritePermission
} from '../context';
import { CONTEXT_TAG } from '../context.route';
import { ContextLayerController } from './context-layer.controller';
import {
  CreateContextLayerSchema,
  DeleteContextLayerSchema,
  GetContextLayerSchema,
  GetContextLayersSchema,
  UpdateContextLayerSchema
} from './context-layer.schema';

export const routes = (app: AppInstance) => {
  const controller = new ContextLayerController(app);

  const tags = [`${CONTEXT_TAG}/Layer`];
  addRoutingTagHook(app, tags, [CONTEXT_TAG]);

  app.route({
    method: 'GET',
    url: '',
    preHandler: hasContextReadPermission(app),
    handler: controller.getByContextId,
    schema: GetContextLayersSchema
  });

  app.route({
    method: 'GET',
    url: '/:id',
    preHandler: hasContextReadPermission(app),
    handler: controller.getById,
    schema: GetContextLayerSchema
  });

  app.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.delete,
    schema: DeleteContextLayerSchema
  });

  app.route({
    method: 'PATCH',
    url: '/:id',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.update,
    schema: UpdateContextLayerSchema
  });

  app.route({
    method: 'POST',
    url: '',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.create,
    schema: CreateContextLayerSchema
  });
};
