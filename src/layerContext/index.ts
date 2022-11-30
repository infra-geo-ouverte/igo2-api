import * as Hapi from '@hapi/hapi';
import Routes from './routes';

export function init (server: Hapi.Server) {
  Routes(server);
}

export * from './layerContext.model';
export * from './layerContext.interface';
export * from './layerContext.service';
