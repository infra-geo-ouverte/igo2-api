import { FastifyPluginAsync, preHandlerHookHandler } from 'fastify';

import fastifyPlugin from 'fastify-plugin';

import { AppInstance } from '../../../app.interface';
import { UserService } from '../../../user';
import { IAuthPluginConfig } from '../authentication.interface';
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
  fastifyPlugin(async (app: AppInstance, config?: IAuthPluginConfig) => {
    app.addSchema(HEADERS_CONSUMER_SCHEMA);

    app.decorate('authService', new HeaderAuthenticationService());

    app.addHook('onRoute', (options) => {
      if (!options.schema) {
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

    app.addHook('preHandler', headerAuthenticationHook(app));
  });

function headerAuthenticationHook(app: AppInstance): preHandlerHookHandler {
  const userService = new UserService(app);

  return async (request, reply) => {
    const consumer = app.authService.getConsumer(request.headers);

    if (!consumer.isAnonymous && !isNaN(consumer.customId)) {
      const user = await userService.getByExternalId(consumer.customId);

      if (!user && request.routeOptions.url !== '/users/sync') {
        return reply.forbidden(`L'usager n'existe pas`);
      }

      request.user = user ? { ...user, profils: consumer.groups } : undefined;
    }
  };
}
