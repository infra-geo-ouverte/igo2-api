import * as Hapi from 'hapi';
import Routes from './routes';

export function init(server: Hapi.Server) {
  Routes(server);
}

export * from './userIgo.model';
export * from './userIgo';

export * from './api';
export * from './user.validator';
export * from './user.model';
