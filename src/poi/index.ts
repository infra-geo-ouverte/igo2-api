import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './poi.model';
export * from './poi.interface';
export * from './poi.service';
