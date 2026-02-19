import { preHandlerHookHandler } from 'fastify';

import { HeaderConsumers } from '@igo2/fastify';
import { AsyncLocalStorage } from 'async_hooks';
import { InternalAxiosRequestConfig } from 'axios';

import { AppInstance } from '../../../app.interface';
import { IAuthPluginClientConfig } from '../authentication.interface';

const requestContext = new AsyncLocalStorage<Map<string, string | string[]>>();

/**
 * Configure API authentication for Axios clients.
 * Forwards specific headers from the incoming Fastify request to outgoing Axios requests.
 */
export function apiAuthentication(
  app: AppInstance,
  clients: IAuthPluginClientConfig[]
) {
  const apiKey = app.env.ADMIN_KEY;
  const allForwardedHeaders = new Set<string>();

  clients.forEach(({ client, options }) => {
    const allowedHeaders = new Set<string>();

    if (options.withAuthorization) {
      allowedHeaders.add('authorization');
      allForwardedHeaders.add('authorization');
    }

    if (options.withConsumer) {
      HeaderConsumers.forEach((h) => {
        allowedHeaders.add(h);
        allForwardedHeaders.add(h);
      });
    }

    client.interceptors.request.use((config) => {
      if (options.withApiKey) {
        config.headers['x-api-key'] = apiKey;
      }

      if (allowedHeaders.size > 0) {
        appendHeadersToAxiosConfig(config, allowedHeaders);
      }

      return config;
    });
  });

  if (allForwardedHeaders.size > 0) {
    app.addHook(
      'onRequest',
      headerForwardHook(Array.from(allForwardedHeaders))
    );
  }
}

function headerForwardHook(headers: string[]): preHandlerHookHandler {
  return (request, _reply, done) => {
    const headersToForward = new Map<string, string | string[]>();
    headers.forEach((header) => {
      const value = request.headers[header];
      if (value !== undefined) {
        headersToForward.set(header, value);
      }
    });

    // Run the rest of the request inside the context
    requestContext.run(headersToForward, () => {
      done();
    });
  };
}

function appendHeadersToAxiosConfig(
  config: InternalAxiosRequestConfig,
  allowedHeaders: Set<string>
) {
  const store = requestContext.getStore();

  if (!store) return config;

  store.forEach((value, key) => {
    if (allowedHeaders.has(key)) {
      config.headers[key] = value;
    }
  });

  return config;
}
