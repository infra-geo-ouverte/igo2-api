import { preHandlerHookHandler } from 'fastify';

import { AsyncLocalStorage } from 'async_hooks';
import { AxiosInstance, InternalAxiosRequestConfig } from 'axios';

import { HeaderConsumers } from './header-authentication.interface';

/** Should only be use for LOCAL DEVELOPMENT */
const localRequestContext = new AsyncLocalStorage<Map<string, string>>();

/** Should only be use for LOCAL DEVELOPMENT */
export const headerForwardHook: preHandlerHookHandler = (
  request,
  _reply,
  done
) => {
  const headersToForward = new Map();

  // Define which headers you want to propagate
  const forwardList = HeaderConsumers;

  forwardList.forEach((header) => {
    const value = request.headers[header];
    if (value) headersToForward.set(header, value as string);
  });

  // Run the rest of the request inside the context
  localRequestContext.run(headersToForward, () => {
    done();
  });
};

/** Should only be use for LOCAL DEVELOPMENT */
export function headerAuthenticationForwarded(clients: AxiosInstance[]) {
  clients.forEach((client) =>
    client.interceptors.request.use(appendHeaderToAxiosConfig)
  );
}

/** Should only be use for LOCAL DEVELOPMENT */
function appendHeaderToAxiosConfig(config: InternalAxiosRequestConfig) {
  const store = localRequestContext.getStore();

  if (store) {
    store.forEach((value, key) => {
      config.headers[key] = value;
    });
  }

  return config;
}
