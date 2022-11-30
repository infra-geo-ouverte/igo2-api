import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './context.model';
export * from './context.interface';
export * from './context.service';
