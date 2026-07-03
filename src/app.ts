import cors from '@fastify/cors';
import fastifySensible from '@fastify/sensible';
import { Type, TypeBoxTypeProvider } from '@fastify/type-provider-typebox';
import Fastify, { FastifyServerOptions } from 'fastify';

import { Signer } from '@aws-sdk/rds-signer';
import {
  PgPoolConfig,
  configPlugin,
  loggerPlugin,
  postgresDatabasePlugin,
  sentryPlugin,
  swaggerPlugin,
  withDrizzlePg
} from '@igo2/fastify';

import { APP_ENV_SCHEMA, AppInstance, IAppEnv } from './app.interface';
import { routes } from './app.route';
import {
  AuthClient,
  AuthenticationApi,
  authenticationPlugin
} from './auth/authentication';
import { headerAuthentication } from './auth/authentication/header-authentication';
import relations from './core/database/relations';
import { LayerWssClient } from './layer';
import { layerPermissionPlugin } from './layer/permission';
import {
  LayerPermissionKongApi,
  LayerPermissionKongClient
} from './layer/permission/kong-permission';
import { UserService } from './user';
import { getPackageVersion } from './utils/version';

export async function buildApp(
  options?: FastifyServerOptions
): Promise<AppInstance> {
  const app = Fastify(options).withTypeProvider<TypeBoxTypeProvider>();

  await app.register(fastifySensible, {
    sharedSchemaId: 'HttpError'
  });

  // Read and validate environment variables
  await app.register(configPlugin, {
    appEnvSchema: APP_ENV_SCHEMA
  });

  await app.register(loggerPlugin, app.env);
  const isLocal = app.env.ENVIRONMENT === 'local';

  await app.register(postgresDatabasePlugin, {
    ...app.env,
    signer: (config: PgPoolConfig) => {
      const signer = new Signer({
        hostname: config.host!,
        port: config.port!,
        username: config.user!
      });

      return () => signer.getAuthToken();
    },
    orm: withDrizzlePg({
      environment: app.env.ENVIRONMENT,
      relations: relations,
      logger: isLocal
    })
  });

  await app.register(swaggerPlugin, {
    ...app.env,
    info: {
      title: 'API - IGO',
      description: "Documentation pour l'api de IGO",
      version: getPackageVersion(app.env.ENVIRONMENT)
    }
  });

  await app.register(sentryPlugin, { ...app.env });

  await app.register(authenticationPlugin, {
    api: { authApi: AuthenticationApi, userService: UserService },
    strategy: {
      plugin: headerAuthentication,
      options: {
        clients: [
          {
            client: AuthClient,
            options: {
              withConsumer: isLocal, // Allow debug with local communication between the API
              withApiKey: true
            }
          },
          {
            client: LayerWssClient,
            options: {
              withAuthorization: true
            }
          },
          {
            client: LayerPermissionKongClient,
            options: {
              withApiKey: true
            }
          }
        ],
        skipRoutes: ['/docs', '/healthy']
      }
    }
  });

  await app.register(layerPermissionPlugin, {
    implementation: LayerPermissionKongApi
  });

  await app.register(routes);

  await app.register(cors, {
    origin: getCorsOrigin(app.env),
    methods: ['GET', 'POST', 'HEAD', 'DELETE']
  });

  app.get(
    '/healthy',
    {
      schema: {
        description: 'Health check for the API',
        response: {
          200: Type.String()
        }
      }
    },
    () => 'healthy'
  );

  return app;
}

/**
 * Allow cors-origin for localhost on the DEV and the domain client for every one
 */
function getCorsOrigin(env: IAppEnv): (string | RegExp)[] {
  const origin = [];

  if (env.ENVIRONMENT === 'development' || env.ENVIRONMENT === 'local') {
    origin.push(/^https?:\/\/localhost(:\d+)?(\/.*)?$/);
  }

  if (env.DOMAIN_CLIENT) {
    origin.push(env.DOMAIN_CLIENT);
  }

  return origin;
}
