import { AppInstance } from '../../app.interface';
import { authenticatedAuthorization } from '../../auth/authorization/authorization';
import { addRoutingTagHook } from '../../utils/url.utils';
import {
  hasContextReadPermission,
  hasContextWritePermission
} from '../context';
import { CONTEXT_TAG } from '../context.route';
import { ContextToolController } from './context-tool.controller';
import {
  CreateContextToolSchema,
  DeleteContextToolSchema,
  GetContextToolSchema,
  GetContextToolsSchema,
  UpdateContextToolSchema
} from './context-tool.schema';

export const userRoutes = (app: AppInstance) => {
  const controller = new ContextToolController(app);

  addRoutingTagHook(app, ['Context/Tools'], [CONTEXT_TAG]);

  app.route({
    method: 'GET',
    url: '',
    preHandler: hasContextReadPermission(app),
    handler: controller.getByContextId,
    schema: GetContextToolsSchema
  });

  app.route({
    method: 'GET',
    url: '/:toolId',
    preHandler: hasContextReadPermission(app),
    handler: controller.getById,
    schema: GetContextToolSchema
  });

  app.route({
    method: 'DELETE',
    url: '/:toolId',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.delete,
    schema: DeleteContextToolSchema
  });

  app.route({
    method: 'PATCH',
    url: '/:toolId',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.update,
    schema: UpdateContextToolSchema
  });

  app.route({
    method: 'POST',
    url: '',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.create,
    schema: CreateContextToolSchema
  });
};
