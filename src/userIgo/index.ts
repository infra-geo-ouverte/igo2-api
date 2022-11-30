import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './userIgo.model';
export * from './userIgo.interface';
export * from './userIgo.service';
