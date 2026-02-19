import type { preHandlerAsyncHookHandler } from 'fastify';

import { AppInstance } from '../../app.interface';
import { IProfils } from '../authentication';
import { isAnonymousConsumer } from '../authentication/shared/consumer/consumer.utils';

export const ADMIN_GROUP = 'igo-admin' as const;

// Example: authenticatedAuthorization now requires the 'user' or 'admin' group
export const authenticatedAuthorization = createAuthorizationHook();

// Example: adminAuthorization only requires the highest-level 'admin' group
export const adminAuthorization = createAuthorizationHook([ADMIN_GROUP]);

// Factory function to create a Fastify preHandler hook to validate consumer access.
export const consumerAuthorization = (
  app: AppInstance
): preHandlerAsyncHookHandler => {
  return async (request, reply) => {
    // Extract the standardized identity (Authentication step)
    const consumer = app.authService.getConsumer(request.headers);

    if (!consumer || isAnonymousConsumer(consumer)) {
      return reply.forbidden('Missing authorization: Access denied.');
    }
  };
};
/**
 * Factory function to create a Fastify preHandler hook for authorization.
 * @param groups - A list of consumer groups that are authorized.
 */
function createAuthorizationHook(
  profils?: string[]
): preHandlerAsyncHookHandler {
  return async (request, reply) => {
    // Extract the standardized identity (Authentication step)
    const user = request.user;

    if (!user) {
      return reply.forbidden('Missing authorization: Access denied.');
    }

    const isAuthorized = hasRequiredProfils(profils, user.profils);
    if (!isAuthorized) {
      return reply.forbidden(
        'Missing authorization: Insufficient permissions.'
      );
    }
  };
}

export function hasRequiredProfils(
  requiredRoles: IProfils | null | undefined,
  userRoles: IProfils | null | undefined = []
): boolean {
  if (!requiredRoles || requiredRoles.length === 0) {
    return true;
  }

  if (!userRoles) {
    return false;
  }

  return requiredRoles.some((role) =>
    userRoles.some((userRole) => userRole === role)
  );
}
