import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './toolContext.model';
export * from './toolContext.interface';
export * from './toolContext.service';
