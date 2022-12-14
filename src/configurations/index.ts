import {
  IDatabaseConfiguration, IDataConfiguration, IDBStringConfiguration,
  IPostgresConfiguration, IServerConfiguration, ISqliteConfiguration
} from '@igo2/base-api';
import * as nconf from 'nconf';
import * as path from 'path';
import * as Jwt from 'jsonwebtoken';
import { UserWithCredentials } from '../login/login.interface';

// Read Configurations
const configs = new nconf.Provider({
  env: true,
  argv: true,
  store: {
    type: 'file',
    file: path.join(__dirname, `./config.${process.env.NODE_ENV || 'dev'}.json`)
  }
});

export interface CredentialsConfig {
  admins: UserWithCredentials[];
  users?: UserWithCredentials[];
}
export interface JwtConfig {
  maxRefresh: number;
  secretKey: string;
  signOptions: Jwt.SignOptions;
  verifyOptions: Jwt.VerifyOptions;
}

export { IDatabaseConfiguration, ISqliteConfiguration, IPostgresConfiguration, IDBStringConfiguration, IDataConfiguration };

export interface ILdapConfiguration {
  url: string;
  baseDN: string;
  bindDN: string;
  bindCredentials: string;
  attributes?: any;
  entryParser?: any;
}

interface ILocalhostConfiguration {
  hosts: string[];
  basePaths: string[];
}

export interface IgoApiIServerConfiguration extends IServerConfiguration {
  ldap: ILdapConfiguration[];
  localhost?: ILocalhostConfiguration;
}
export interface GeoServicesOptions {
  getInfoFromCapabilities: boolean;
}

export function getDatabaseConfig (): IDataConfiguration {
  return configs.get('database');
}

export function getServerConfig (): IgoApiIServerConfiguration {
  return configs.get('server');
}

export function getGeoServiceConfig (): GeoServicesOptions {
  return configs.get('geoServices');
}