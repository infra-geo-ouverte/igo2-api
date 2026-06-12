import { FastifyInstance } from 'fastify';

import fastifyPlugin from 'fastify-plugin';

import { IAuthenticationConfig, IUserBase } from './authentication.interface';

export const authenticationPlugin = fastifyPlugin(
  async <U extends IUserBase>(
    app: FastifyInstance,
    opts: IAuthenticationConfig<U>
  ) => {
    const AuthApi = opts.api.authApi;
    const authApiInstance = new AuthApi(app);
    app.decorate('authApi', authApiInstance);

    const UserService = opts.api.userService;
    const userService = new UserService(app);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    app.decorate('userService', userService as any);

    await app.register(opts.strategy.plugin, opts.strategy.options ?? {});
  }
);
