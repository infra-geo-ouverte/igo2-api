import { FastifyPluginAsync } from 'fastify';

import fastifyPlugin from 'fastify-plugin';

import { AppInstance } from '../../app.interface';
import { IAuthApi, IAuthPluginConfig } from './authentication.interface';

interface IAuthenticationConfig {
  api: {
    implementation: new (app: AppInstance) => IAuthApi;
  };
  strategy: {
    plugin: FastifyPluginAsync<IAuthPluginConfig>;
    options?: IAuthPluginConfig;
  };
}

export const authenticationPlugin: FastifyPluginAsync<IAuthenticationConfig> =
  fastifyPlugin(async (app: AppInstance, opts: IAuthenticationConfig) => {
    const AuthApi = opts.api.implementation;
    const authApiInstance = new AuthApi(app);
    app.decorate('authApi', authApiInstance);

    await app.register(opts.strategy.plugin, opts.strategy.options ?? {});
  });
