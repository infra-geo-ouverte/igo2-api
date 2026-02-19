import { AppInstance } from '../app.interface';
import {
  adminAuthorization,
  authenticatedAuthorization
} from '../auth/authorization/authorization';
import { addRoutingTagHook } from '../utils/url.utils';
import { ProfilController } from './profil.controller';
import {
  CreateProfilSchema,
  DeleteProfilSchema,
  GetAllProfilSchema,
  GetProfilSchema,
  GetUsersAndProfilsSchema,
  UpdateProfilSchema
} from './profil.schema';

export const routes = (app: AppInstance) => {
  const controller = new ProfilController(app);

  addRoutingTagHook(app, ['Profil']);

  app.route({
    method: 'GET',
    url: '/users',
    preHandler: authenticatedAuthorization,
    handler: controller.getProfilsAndUsers,
    schema: GetUsersAndProfilsSchema
  });

  app.route({
    method: 'GET',
    url: '',
    preHandler: authenticatedAuthorization,
    handler: controller.get,
    schema: GetAllProfilSchema
  });

  app.route({
    method: 'GET',
    url: '/:name',
    preHandler: authenticatedAuthorization,
    handler: controller.getByName,
    schema: GetProfilSchema
  });

  app.route({
    method: 'DELETE',
    url: '/:name',
    preHandler: adminAuthorization,
    handler: controller.delete,
    schema: DeleteProfilSchema
  });

  app.route({
    method: 'PATCH',
    url: '/:name',
    preHandler: adminAuthorization,
    handler: controller.update,
    schema: UpdateProfilSchema
  });

  app.route({
    method: 'POST',
    url: '',
    preHandler: adminAuthorization,
    handler: controller.create,
    schema: CreateProfilSchema
  });
};
