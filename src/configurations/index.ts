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

export interface IServerConfiguration {
    port: number;
    plugins: Array<string>;
    jwtExpiration: string;
    userApi: IUserApiConfiguration;
    googleKey?: string;
    adminProfil?: string;
}

interface IDatabaseConfiguration {
  dialect?: string; // [sqlite, postgres]
}
export interface ISqliteConfiguration extends IDatabaseConfiguration {
  dialect: string;
  host: string;
  storage: string;
}
export interface IPostgresConfiguration extends IDatabaseConfiguration {
  connectionString: string;
}
export type IDataConfiguration = ISqliteConfiguration | IPostgresConfiguration;

export interface ITestConfiguration {
    xConsumerId?: string;
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
