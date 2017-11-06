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

interface IUserApiConfiguration {
  host: string;
  port: number;
}

interface ILdapConfiguration {
  url: string;
  baseSearch: string;
}

interface ILocalhostConfiguration {
  hosts: string[];
  basePaths: string[];
}

export interface IServerConfiguration {
    port: number;
    plugins: Array<string>;
    jwtExpiration: string;
    userApi: IUserApiConfiguration;
    ldap: ILdapConfiguration;
    googleKey?: string;
    adminProfil?: string;
    localhost?: ILocalhostConfiguration;
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
export type IDataConfiguration = ISqliteConfiguration |
                                 IPostgresConfiguration |
                                 IDBStringConfiguration;

export interface IConsumer {
  xConsumerId: string;
  xConsumerUsername: string;
}

export interface ITestConfiguration {
  admin: IConsumer;
  anonyme: IConsumer;
  user1: IConsumer;
  user2: IConsumer;
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
