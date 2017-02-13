import * as nconf from "nconf";
import * as path from "path";

//Read Configurations
const configs = new nconf.Provider({
  env: true,
  argv: true,
  store: {
    type: 'file',
    file: path.join(__dirname, `./config.${process.env.NODE_ENV || "dev"}.json`)
  }
});

export interface IServerConfigurations {
    port: number;
    plugins: Array<string>;
    jwtSecret: string;
    jwtExpiration: string;
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


export function getDatabaseConfig(): IDataConfiguration {
    return configs.get("database");
}

export function getServerConfigs(): IServerConfigurations {
    return configs.get("server");
}
