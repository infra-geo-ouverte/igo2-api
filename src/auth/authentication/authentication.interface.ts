import { IncomingHttpHeaders } from 'node:http';

import { FastifyInstance, FastifyPluginAsync } from 'fastify';

import { AxiosInstance } from 'axios';

import { IAnyConsumer } from './shared/consumer';

export interface IAuthApi {
  findMany(ids: number[]): Promise<IAuthUser[]>;
  getUserById(id: number): Promise<IAuthUser | null>;
  searchUsers(limit: number, filter: string | undefined): Promise<IAuthUser[]>;
}

export interface IAuthService {
  getConsumer(headers: IncomingHttpHeaders): IAnyConsumer | undefined;
}

export interface IAuthEnv {
  AUTH_API: string;
}

export interface IAuthUser {
  id: number;
  source: string;
  sourceId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface IAuthApiInstance<U extends IUserBase = IUserBase> {
  authApi: IAuthApi;
  userService: IUserService<U>;
  authService: IAuthService;
}

export interface IUserService<U extends IUserBase = IUserBase> {
  getByExternalId: (externalId: string) => Promise<U | undefined>;
  getOrCreateByExternalId: (externalId: string, source?: string) => Promise<U>;
}

export interface IAuthenticationRequest<
  U extends IUserBase = IUserBaseWithProfils
> {
  user?: U;
}

interface IUserBaseWithProfils extends IUserBase {
  profils: IProfils;
}

export type IUserBase = object;

export type IProfils = string[];

export interface IAuthenticationConfig<U extends IUserBase = IUserBase> {
  api: {
    authApi: new (app: FastifyInstance) => IAuthApi;
    userService: new (app: FastifyInstance) => IUserService<U>;
  };
  strategy: {
    plugin: FastifyPluginAsync<IAuthPluginConfig>;
    options?: IAuthPluginConfig;
  };
}

export interface IAuthPluginConfig {
  clients?: IAuthPluginClientConfig[];
  skipRoutes?: string[];
}

export interface IAuthPluginClientConfig {
  client: AxiosInstance;
  options: IAuthPluginClientConfigOptions;
}

export interface IAuthPluginClientConfigOptions {
  /** Set the header api-key */
  withApiKey?: boolean;
  /** Forward the consumer headers */
  withConsumer?: boolean;
  /** Forward the header authorization */
  withAuthorization?: boolean;
}
