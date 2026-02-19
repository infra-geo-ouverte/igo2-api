import { AppDatabase, IAppEnv } from './app.interface';
import {
  IAuthApiInstance,
  IAuthenticationRequest
} from './auth/authentication/authentication.interface';
import { ILayerPermissionInstance } from './layer/permission/shared/permission.interface';

// Declaration merging technique to enhance the FastifyInstance
declare module 'fastify' {
  interface FastifyInstance extends IAuthApiInstance, ILayerPermissionInstance {
    env: IAppEnv;
    db: AppDatabase;
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface FastifyRequest extends IAuthenticationRequest {}
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace NodeJS {
    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface ProcessEnv extends IAppEnv {}
  }
}
