import { AppInstance } from '../app.interface';
import {
  adminAuthorization,
  authenticatedAuthorization
} from '../auth/authorization/authorization';
import { addRoutingTagHook } from '../utils/url.utils';
import { LayerController } from './layer.controller';
import {
  CreateLayerSchema,
  DeleteLayerSchema,
  GetBaseLayersSchema,
  GetLayerAdminOptionSchema,
  GetLayerOptionSchema,
  GetLayerSchema,
  GetLayersSchema,
  LayerMigrateBatchSchema,
  LayerMigrateSchema,
  SearchLayerOptionSchema,
  UpdateLayerSchema
} from './layer.schema';

export const routes = (app: AppInstance) => {
  const controller = new LayerController(app);

  addRoutingTagHook(app, ['Layer']);

  app.route({
    method: 'GET',
    url: '/options',
    handler: controller.getOptions,
    schema: GetLayerOptionSchema
  });

  app.route({
    method: 'GET',
    url: '/admin/options',
    preHandler: adminAuthorization,
    handler: controller.getAdminOptions,
    schema: GetLayerAdminOptionSchema
  });

  app.route({
    method: 'GET',
    url: '/search',
    handler: controller.search,
    schema: SearchLayerOptionSchema
  });

  app.route({
    method: 'GET',
    url: '/:id',
    handler: controller.getById,
    schema: GetLayerSchema
  });

  app.route({
    method: 'GET',
    url: '',
    preHandler: adminAuthorization,
    handler: controller.getAll,
    schema: GetLayersSchema
  });

  app.route({
    method: 'GET',
    url: '/baselayers',
    handler: controller.getBaseLayers,
    schema: GetBaseLayersSchema
  });

  app.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: adminAuthorization,
    handler: controller.delete,
    schema: DeleteLayerSchema
  });

  app.route({
    method: 'PATCH',
    url: '/:id',
    preHandler: adminAuthorization,
    handler: controller.update,
    schema: UpdateLayerSchema
  });

  app.route({
    method: 'POST',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.create,
    schema: CreateLayerSchema
  });

  app.route({
    method: 'POST',
    url: '/migrate/batch',
    preHandler: adminAuthorization,
    handler: controller.migrateBatch,
    schema: LayerMigrateBatchSchema
  });

  app.route({
    method: 'POST',
    url: '/migrate/layer',
    preHandler: adminAuthorization,
    handler: controller.migrateLayer,
    schema: LayerMigrateSchema
  });
};
