import * as Hapi from 'hapi';
import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';


export interface IPluginOptions {
    database?: IDatabase;
    serverConfigs: IServerConfiguration;
}

export interface IPlugin {
    register(server: Hapi.Server, options?: IPluginOptions): Promise<void>;
    info(): IPluginInfo;
}

export interface IPluginInfo {
    name: string;
    version: string;
}
