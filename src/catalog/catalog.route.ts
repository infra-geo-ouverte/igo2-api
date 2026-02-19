import { AppInstance } from '../app.interface';
import {
  adminAuthorization,
  authenticatedAuthorization
} from '../auth/authorization/authorization';
import { addRoutingTagHook } from '../utils/url.utils';
import { CatalogController } from './catalog.controller';
import {
  CreateCatalogSchema,
  DeleteByCatalogIdSchema,
  GetByCatalogIdSchema,
  GetCatalogsSchema,
  UpdateCatalogSchema
} from './catalog.schema';

const tags = ['Catalog'];

export const routes = (app: AppInstance) => {
  const controller = new CatalogController(app);

  addRoutingTagHook(app, tags);

  app.route({
    method: 'GET',
    url: '/:id',
    preHandler: authenticatedAuthorization,
    handler: controller.getById,
    schema: GetByCatalogIdSchema
  });

  app.route({
    method: 'GET',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.get,
    schema: GetCatalogsSchema
  });

  app.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: adminAuthorization,
    handler: controller.delete,
    schema: DeleteByCatalogIdSchema
  });

  app.route({
    method: 'PATCH',
    url: '/:id',
    preHandler: adminAuthorization,
    handler: controller.update,
    schema: UpdateCatalogSchema
  });

  app.route({
    method: 'POST',
    url: '',
    preHandler: adminAuthorization,
    handler: controller.create,
    schema: CreateCatalogSchema
  });
};
