import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './contextPermission.model';
export * from './contextPermission.validator';
export * from './contextPermission.interface';
export * from './contextPermission.service';
