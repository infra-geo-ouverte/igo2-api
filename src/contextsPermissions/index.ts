import * as Hapi from 'hapi';
import Routes from './routes';
import { IDatabase } from '../database';
import { IServerConfiguration } from '../configurations';

export function init(server: Hapi.Server,
                     configs: IServerConfiguration,
                     database: IDatabase) {
    Routes(server, configs, database);
}

export * from './contextPermission.model'
export * from './contextPermission'
