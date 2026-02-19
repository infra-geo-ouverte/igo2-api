import { DefaultRoute } from 'fastify/types/route';

import { AppInstance, AppReply, AppRequest } from '../app.interface';
import { BASE_SCHEMA_CONTEXT } from './context.schema';
import { ContextService } from './context.service';
import { ContextPermissionService } from './permission/context-permission.service';

export function validateContextHook(
  app: AppInstance
): DefaultRoute<AppRequest<typeof BASE_SCHEMA_CONTEXT>, AppReply> {
  const contextService = new ContextService(app);

  return async (
    request: AppRequest<typeof BASE_SCHEMA_CONTEXT>,
    reply: AppReply
  ) => {
    const contextId = request.params.contextId;

    const context = await contextService.getById(contextId);
    if (!context) {
      return reply.notFound('Context not found');
    }
  };
}

export function hasContextWritePermission(
  app: AppInstance
): DefaultRoute<AppRequest<typeof BASE_SCHEMA_CONTEXT>, AppReply> {
  const permissionService = new ContextPermissionService(app);
  const contextService = new ContextService(app);

  return async (request: AppRequest<typeof BASE_SCHEMA_CONTEXT>, reply) => {
    const user = request.user;
    if (!user) {
      throw reply.forbidden('Must be authenticated');
    }

    const contextId = request.params.contextId;
    const context = await contextService.getById(contextId);
    if (!context) {
      throw reply.notFound('Context not found');
    }

    const permission = await permissionService.getTypePermission(
      context,
      request.user
    );

    if (permission !== 'write') {
      const msg = 'Must have write permission for this context';
      throw reply.forbidden(msg);
    }

    return permission;
  };
}

export function hasContextReadPermission(
  app: AppInstance
): DefaultRoute<AppRequest<typeof BASE_SCHEMA_CONTEXT>, AppReply> {
  const permissionService = new ContextPermissionService(app);
  const contextService = new ContextService(app);

  return async (request: AppRequest<typeof BASE_SCHEMA_CONTEXT>, reply) => {
    const contextId = request.params.contextId;

    const context = await contextService.getById(contextId);
    if (!context) {
      throw reply.notFound('Context not found');
    }

    const permission = await permissionService.getTypePermission(
      context,
      request.user
    );

    if (!permission) {
      const msg = 'Must have read permission for this context';
      throw reply.forbidden(msg);
    }

    return permission;
  };
}
