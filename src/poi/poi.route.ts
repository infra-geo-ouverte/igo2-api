import { AppInstance } from '../app.interface';
import { authenticatedAuthorization } from '../auth/authorization/authorization';
import { addRoutingTagHook } from '../utils/url.utils';
import { PoiController } from './poi.controller';
import {
  CreatePoiSchema,
  DeletePoiSchema,
  GetAllPoiSchema,
  GetPoiSchema,
  UpdatePoiSchema
} from './poi.schema';

export const routes = (app: AppInstance) => {
  const controller = new PoiController(app);

  addRoutingTagHook(app, ['Point of Interest (POI)']);

  app.route({
    method: 'GET',
    url: '/:id',
    preHandler: authenticatedAuthorization,
    handler: controller.getById,
    schema: GetPoiSchema
  });

  app.route({
    method: 'GET',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.getAll,
    schema: GetAllPoiSchema
  });

  app.route({
    method: 'DELETE',
    url: '/:id',
    preHandler: authenticatedAuthorization,
    handler: controller.delete,
    schema: DeletePoiSchema
  });

  app.route({
    method: 'PATCH',
    url: '/:id',
    preHandler: authenticatedAuthorization,
    handler: controller.update,
    schema: UpdatePoiSchema
  });

  app.route({
    method: 'POST',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.create,
    schema: CreatePoiSchema
  });
};
