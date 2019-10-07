import * as nconf from 'nconf';
import * as path from 'path';

// Read Configurations
const configs = new nconf.Provider({
  env: true,
  argv: true,
  store: {
    type: 'file',
    file: path.join(__dirname, `./config.${process.env.NODE_ENV || 'dev'}.json`)
  }
});

export interface ILdapConfiguration {
  url: string;
  baseSearch: string;
}

interface ILocalhostConfiguration {
  hosts: string[];
  basePaths: string[];
}

interface IApmConfiguration {
  name: string;
  url: string;
}

export interface IServerConfiguration {
  port: number;
  plugins: Array<string>;
  pluginsOptions: any;
  routes: Array<string>;
  jwtExpiration: string;
  userApi: string;
  ldap: ILdapConfiguration[];
  googleKey?: string;
  adminProfil?: string;
  localhost?: ILocalhostConfiguration;
  apm?: IApmConfiguration;
}

export interface IDatabaseConfiguration {
  dialect?: string; // [sqlite, postgres]
}
export interface ISqliteConfiguration extends IDatabaseConfiguration {
  dialect: string;
  host: string;
  storage: string;
}
export interface IPostgresConfiguration extends IDatabaseConfiguration {
  dialect: string;
  host: string;
  port: number;
  database: string;
  username?: string;
  password?: string;
}
export interface IDBStringConfiguration extends IDatabaseConfiguration {
  connectionString: string;
}
export type IDataConfiguration =
  | ISqliteConfiguration
  | IPostgresConfiguration
  | IDBStringConfiguration;

export interface IConsumerHeaders {
  'x-consumer-id': string;
  'x-consumer-username': string;
  'x-consumer-custom-id': string;
  'x-consumer-groups': string;
  'x-anonymous-consumer'?: string;
}

export interface ITestConfiguration {
  adminHeaders: IConsumerHeaders;
  anonymeHeaders: IConsumerHeaders;
  standardHeaders: IConsumerHeaders;
  user2Headers: IConsumerHeaders;
}

export function getDatabaseConfig(): IDataConfiguration {
  return configs.get('database');
}

export function getServerConfig(): IServerConfiguration {
  return configs.get('server');
}

export function getTestConfig(): ITestConfiguration {
  return configs.get('test');
}
