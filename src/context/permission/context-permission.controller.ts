import { AppInstance, AppReply, AppRequest } from '../../app.interface';
import { ContextService } from '../context.service';
import { IAnyContextPermissionIn } from './context-permission.interface';
import {
  CreateContextPermissionSchema,
  DeleteContextPermissionSchema,
  GetAllContextPermissionSchema,
  GetContextPermissionByIdSchema,
  UpdateContextPermissionSchema
} from './context-permission.schema';
import { ContextPermissionService } from './context-permission.service';

export class ContextPermissionController {
  private contextService: ContextService;
  private ctxPermissionService: ContextPermissionService;

  constructor(private app: AppInstance) {
    this.ctxPermissionService = new ContextPermissionService(app);
    this.contextService = new ContextService(app);
  }

  create = async (
    request: AppRequest<typeof CreateContextPermissionSchema>,
    reply: AppReply<typeof CreateContextPermissionSchema>
  ) => {
    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }

    const ctxPermission = {
      ...request.body,
      contextId: request.params.contextId
    };

    const res = await this.ctxPermissionService.create(ctxPermission, user);

    return reply.code(201).send(res);
  };

  update = async (
    request: AppRequest<typeof UpdateContextPermissionSchema>,
    reply: AppReply<typeof UpdateContextPermissionSchema>
  ) => {
    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }

    const id = request.params.id;

    const ctxPermission = await this.ctxPermissionService.getById(id);
    if (!ctxPermission) {
      return reply.notFound();
    }

    const { id: _id, ...restPermission } = ctxPermission;
    const body = {
      ...restPermission,
      ...request.body
    } as IAnyContextPermissionIn;
    return this.ctxPermissionService.update(id, body, user);
  };

  delete = async (
    request: AppRequest<typeof DeleteContextPermissionSchema>,
    reply: AppReply<typeof DeleteContextPermissionSchema>
  ) => {
    const id = request.params.id;
    const contextId = request.params.contextId;

    const context = await this.contextService.getById(contextId);
    if (!context) {
      throw this.app.httpErrors.notFound('Context not found');
    }

    const permission = await this.ctxPermissionService.getById(id);
    if (!permission) {
      return reply.notFound();
    }

    const typePerm = await this.ctxPermissionService.getTypePermission(
      context,
      request.user
    );
    if (typePerm !== 'write') {
      throw reply.forbidden('Must have write permission for this context');
    }

    const result = await this.ctxPermissionService.delete(id);
    return reply.code(204).send(result);
  };

  getById = async (
    request: AppRequest<typeof GetContextPermissionByIdSchema>
  ) => {
    const id = request.params.id;
    return this.ctxPermissionService.getById(id);
  };

  getAll = async (
    request: AppRequest<typeof GetAllContextPermissionSchema>
  ) => {
    const {
      user,
      params: { contextId }
    } = request;
    const profilNames = user?.profils ?? [];

    const context = await this.contextService.getById(contextId);
    if (!context) {
      throw this.app.httpErrors.notFound('Context not found');
    }

    const accessLevel = await this.ctxPermissionService.getTypePermission(
      context,
      user
    );

    const permissions = await this.ctxPermissionService.getAllByContextId(
      contextId,
      {
        type: accessLevel,
        userId: user?.id,
        profilNames: profilNames
      }
    );

    return this.ctxPermissionService.enrichPermissions(permissions);
  };
}
