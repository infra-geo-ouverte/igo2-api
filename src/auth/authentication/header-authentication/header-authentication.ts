import { IncomingHttpHeaders } from 'node:http2';

import { FastifyPluginAsync, preHandlerHookHandler } from 'fastify';

import fastifyPlugin from 'fastify-plugin';
import Value from 'typebox/value';

import { AppInstance } from '../../../app.interface';
import { UserService } from '../../../user';
import { IAuthPluginConfig } from '../authentication.interface';
import { apiAuthentication } from './api-authentication';
import {
  ConsumerGroups,
  HEADERS_CONSUMER_SCHEMA,
  HEADERS_CONSUMER_SCHEMA_REF,
  HeaderAnoymousConsumer,
  HeaderConsumer,
  IConsumer
} from './header-authentication.interface';

/**
 * Factory function to create a Fastify preHandler hook for authorization.
 * @param requiredGroups - A list of consumer groups that are authorized.
 */
export const headerAuthentication: FastifyPluginAsync<IAuthPluginConfig> =
  fastifyPlugin(async (app: AppInstance, config?: IAuthPluginConfig) => {
    app.addSchema(HEADERS_CONSUMER_SCHEMA);

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

  return async (request) => {
    const consumer = getConsumer(request.headers);

    if (!consumer.isAnonymous && !isNaN(consumer.customId)) {
      const user = await userService.getOrCreateByExternalId(consumer.customId);
      request.user = { ...user, profils: consumer.groups };
    }
  };
}

export function getConsumer(incomingHeaders: IncomingHttpHeaders): IConsumer {
  const headers = formatHeaders(incomingHeaders);

  const isAnonymous =
    String(headers[HeaderAnoymousConsumer]).toLowerCase() === 'true';

  const groups = (headers['x-consumer-groups' as HeaderConsumer] ??
    []) as ConsumerGroups[];

  const customId = Number(headers['x-consumer-custom-id' as HeaderConsumer]);

  return {
    id: headers['x-consumer-id' as HeaderConsumer] as string,
    customId,
    username: headers['x-consumer-username' as HeaderConsumer] as string,
    groups,
    isAnonymous
  };
}

/**
 * Decodes specific headers (like groups) without mutating the original headers object.
 */
export function formatHeaders(
  incomingHeaders: IncomingHttpHeaders
): IncomingHttpHeaders {
  const xConsumerGroupsKey = 'x-consumer-groups' satisfies HeaderConsumer;
  const groupsHeader = incomingHeaders[xConsumerGroupsKey];

  if (!groupsHeader) {
    return incomingHeaders;
  }

  return {
    ...incomingHeaders,
    [xConsumerGroupsKey]: Value.Decode(
      HEADERS_CONSUMER_SCHEMA['properties'][xConsumerGroupsKey],
      groupsHeader
    )
  };
}
