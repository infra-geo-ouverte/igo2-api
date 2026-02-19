import { loggerConfig } from '@igo2/fastify';

import { buildApp } from './app';

(async () => {
  const server = await buildApp({
    pluginTimeout: 30000, // 30 seconds
    disableRequestLogging: true,
    logger: loggerConfig // Use with the logger plugin in the app.ts
  });

  try {
    await server.listen({
      host: '0.0.0.0',
      port: server.env.PORT
    });
  } catch (err) {
    server.log.error(err);
    process.exit(1);
  }
})();
