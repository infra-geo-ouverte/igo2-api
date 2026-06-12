import {
  FastifyInstance,
  FastifyPluginAsync,
  preHandlerHookHandler
} from 'fastify';

import fastifyPlugin from 'fastify-plugin';

import { IAuthPluginConfig } from '../authentication.interface';
import { isSystemConsumer } from '../shared/consumer/consumer.utils';
import { apiAuthentication } from './api-authentication';
import {
  HEADERS_CONSUMER_SCHEMA,
  HEADERS_CONSUMER_SCHEMA_REF
} from './header-authentication.interface';
import { HeaderAuthenticationService } from './header-authentication.service';

/**
 * Factory function to create a Fastify preHandler hook for authorization.
 * @param requiredGroups - A list of consumer groups that are authorized.
 */
export const headerAuthentication: FastifyPluginAsync<IAuthPluginConfig> =
  fastifyPlugin(async (app: FastifyInstance, config?: IAuthPluginConfig) => {
    app.addSchema(HEADERS_CONSUMER_SCHEMA);

    app.decorate('authService', new HeaderAuthenticationService());

    app.addHook('onRoute', (options) => {
      if (
        !options.schema ||
        isRouteWithoutAuth(config?.skipRoutes ?? [], options.url)
      ) {
        return;
      }

      // Add the headers authentication JSON Schema to all routes
      options.schema = {
        ...options.schema,
        headers: HEADERS_CONSUMER_SCHEMA_REF
      };
    });

    // Allow to forward mocked authentication headers to Axios Client for local Development.
    if (config?.clients) {
      apiAuthentication(app, config.clients);
    }

    app.addHook('preHandler', headerAuthenticationHook(app, config));
  });

function headerAuthenticationHook(
  app: FastifyInstance,
  config?: IAuthPluginConfig
): preHandlerHookHandler {
  return async (request, reply) => {
    if (isRouteWithoutAuth(config?.skipRoutes ?? [], request.url)) {
      return;
    }

    const consumer = app.authService.getConsumer(request.headers);
    if (!consumer) {
      throw app.httpErrors.unauthorized('Identifiants invalides');
    }

    if (consumer.source === 'anonymous') {
      return;
    }

    if (isSystemConsumer(consumer)) {
      const user = await app.userService.getOrCreateByExternalId(
        consumer.username, // The username for a system user should doesn't change but the id could change
        'system'
      );
      request.user = { ...user, profils: consumer.groups };
      return;
    }

    if (consumer.customId != null) {
      const user = await app.userService.getOrCreateByExternalId(
        consumer.customId.toString(),
        'user'
      );

      if (!user && request.routeOptions.url !== '/users/sync') {
        return reply.forbidden('Accès refusé');
      }

      request.user = user ? { ...user, profils: consumer.groups } : undefined;
    }
  };
}
function isRouteWithoutAuth(skipRoutes: string[], url: string) {
  return skipRoutes.some((route) => url.startsWith(route));
}
