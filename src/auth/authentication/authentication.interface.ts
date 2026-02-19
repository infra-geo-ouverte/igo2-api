import { AxiosInstance } from 'axios';

import { IUserWithProfils } from '../../user';

export interface IAuthApi {
  findMany(ids: number[]): Promise<IAuthUser[]>;
  getUserById(id: number): Promise<IAuthUser | null>;
  searchUsers(limit: number, filter: string | undefined): Promise<IAuthUser[]>;
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
  /** @deprecated should be remove eventually in favor of withAuthorization */
  withConsumer?: boolean;
  withAuthorization?: boolean;
}
