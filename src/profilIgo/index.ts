import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './profilIgo.model';
export * from './profilIgo.interface';
export * from './profilIgo.service';
