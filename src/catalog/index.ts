import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './catalog.model';
export * from './catalog.interface';
export * from './catalog.service';
