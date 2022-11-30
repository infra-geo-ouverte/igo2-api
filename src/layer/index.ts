import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './layer.model';
export * from './layer.interface';
export * from './layer.service';
