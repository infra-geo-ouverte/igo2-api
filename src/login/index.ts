import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './login.interface';
export * from './login.service';
