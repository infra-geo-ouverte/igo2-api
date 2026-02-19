import { AppInstance } from '../../app.interface';
import { authenticatedAuthorization } from '../../auth/authorization/authorization';
import { addRoutingTagHook } from '../../utils/url.utils';
import {
  hasContextReadPermission,
  hasContextWritePermission
} from '../context';
import { CONTEXT_TAG } from '../context.route';
import { ContextPermissionController } from './context-permission.controller';
import {
  CreateContextPermissionSchema,
  DeleteContextPermissionSchema,
  GetAllContextPermissionSchema,
  GetContextPermissionByIdSchema,
  UpdateContextPermissionSchema
} from './context-permission.schema';

export const subRoutes = (app: AppInstance) => {
  const controller = new ContextPermissionController(app);

  const tags = [`${CONTEXT_TAG}/Permission`];
  addRoutingTagHook(app, tags, [CONTEXT_TAG]);

  app.route({
    method: 'GET',
    url: '',
    preHandler: hasContextReadPermission(app),
    handler: controller.getAll,
    schema: GetAllContextPermissionSchema
  });

  app.route({
    method: 'GET',
    url: '/:id',
    preHandler: hasContextReadPermission(app),
    handler: controller.getById,
    schema: GetContextPermissionByIdSchema
  });

  app.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.delete,
    schema: DeleteContextPermissionSchema
  });

  app.route({
    method: 'PATCH',
    url: '/:id',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.update,
    schema: UpdateContextPermissionSchema
  });

  app.route({
    method: 'POST',
    url: '',
    preHandler: [authenticatedAuthorization, hasContextWritePermission(app)],
    handler: controller.create,
    schema: CreateContextPermissionSchema
  });
};
