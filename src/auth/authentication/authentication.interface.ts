import { IncomingHttpHeaders } from 'node:http';

import { AxiosInstance } from 'axios';

import { IUserWithProfils } from '../../user';
import { ADMIN_GROUP } from '../authorization';

export interface IAuthApi {
  findMany(ids: number[]): Promise<IAuthUser[]>;
  getUserById(id: number): Promise<IAuthUser | null>;
  searchUsers(limit: number, filter: string | undefined): Promise<IAuthUser[]>;
}

export interface IAuthService {
  getConsumer(headers: IncomingHttpHeaders): IConsumer;
}

export const ConsumerGroups = [ADMIN_GROUP, 'test'] as const;
export type ConsumerGroups = (typeof ConsumerGroups)[number] | string;

export interface IConsumer {
  /** Le id externe de l'usager provenant du provider d'authentification */
  id: string;
  /** Le id externe de l'api d'authentification */
  customId: number;
  username: string;
  groups: ConsumerGroups[];
  isAnonymous: boolean;
}

export interface IAuthUser {
  id: number;
  source: string;
  sourceId: string;
  email?: string;
  firstName?: string;
  lastName?: string;
}

export interface IAuthApiInstance {
  authApi: IAuthApi;
  authService: IAuthService;
}

export interface IAuthenticationRequest {
  user?: IUserWithProfils;
}

export type IProfils = string[];

export interface IAuthPluginConfig {
  clients?: IAuthPluginClientConfig[];
}

export interface IAuthPluginClientConfig {
  client: AxiosInstance;
  options: IAuthPluginClientConfigOptions;
}

export interface IAuthPluginClientConfigOptions {
  withApiKey?: boolean;
  withConsumer?: boolean;
  withAuthorization?: boolean;
}
