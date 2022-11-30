import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './contextHidden.model';
export * from './contextHidden.interface';
export * from './contextHidden.service';
