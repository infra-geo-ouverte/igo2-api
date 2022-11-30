import * as Boom from '@hapi/boom';

export function handleError (e): any {
  if (Boom.isBoom(e)) {
    if (e.isServer) {
      const response = (e as any).response;
      if (response) {
        throw Boom.badImplementation(
          JSON.stringify({
            statusText: response.statusText,
            status: response.status,
            url: response.config.url
          })
        );
      }
    }
    throw e; // (e as any).typeof();
  }
  throw Boom.badImplementation(e);
}
