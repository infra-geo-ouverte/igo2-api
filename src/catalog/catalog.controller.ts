import { AppInstance, AppReply, AppRequest } from '../app.interface';
import {
  CreateCatalogSchema,
  DeleteByCatalogIdSchema,
  GetByCatalogIdSchema,
  GetCatalogsSchema,
  UpdateCatalogSchema
} from './catalog.schema';
import { CatalogService } from './catalog.service';

export class CatalogController {
  private catalogService: CatalogService;

  constructor(app: AppInstance) {
    this.catalogService = new CatalogService(app);
  }

  create = async (
    request: AppRequest<typeof CreateCatalogSchema>,
    reply: AppReply<typeof CreateCatalogSchema>
  ) => {
    const catalogToCreate = request.body;

    const res = await this.catalogService.create(catalogToCreate);
    return reply.code(201).send(res);
  };

  update = async (
    request: AppRequest<typeof UpdateCatalogSchema>,
    reply: AppReply<typeof UpdateCatalogSchema>
  ) => {
    const id = request.params.id;
    const profils = request.user!.profils;
    const catalogToUpdate = request.body;

    const catalog = await this.catalogService.getById(id, profils);
    if (!catalog) {
      return reply.notFound('Catalog not found');
    }

    return this.catalogService.update(id, catalogToUpdate);
  };

  delete = async (
    request: AppRequest<typeof DeleteByCatalogIdSchema>,
    reply: AppReply<typeof DeleteByCatalogIdSchema>
  ) => {
    const id = request.params.id;
    const profils = request.user!.profils;

    const catalog = await this.catalogService.getById(id, profils);
    if (!catalog) {
      return reply.notFound('Catalog not found');
    }

    const res = await this.catalogService.delete(id);

    return reply.code(204).send(res);
  };

  getById = async (
    request: AppRequest<typeof GetByCatalogIdSchema>,
    reply: AppReply<typeof GetByCatalogIdSchema>
  ) => {
    const id = request.params.id;
    const profils = request.user!.profils;

    const catalog = await this.catalogService.getById(id, profils);
    if (!catalog) {
      return reply.notFound('Catalog not found');
    }

    return catalog;
  };

  get = async (request: AppRequest<typeof GetCatalogsSchema>) => {
    const profils = request.user!.profils;
    return this.catalogService.get(profils);
  };
}
