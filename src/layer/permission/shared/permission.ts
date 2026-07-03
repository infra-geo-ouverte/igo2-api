import { FastifyPluginAsync } from 'fastify';

import fastifyPlugin from 'fastify-plugin';

import { AppInstance } from '../../../app.interface';
import { ILayerPermission } from './permission.interface';

interface IConfig {
  implementation: new (app: AppInstance) => ILayerPermission;
}

export const layerPermissionPlugin: FastifyPluginAsync<IConfig> = fastifyPlugin(
  async (app: AppInstance, opts: IConfig) => {
    const Service = opts.implementation;
    const serviceInstance = new Service(app);
    app.decorate('layerPermission', serviceInstance);
  }
);
