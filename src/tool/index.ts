import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './tool.service';
export * from './tool.model';
export * from './tool.interface';
