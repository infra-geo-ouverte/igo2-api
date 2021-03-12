import * as Hapi from '@hapi/hapi';

import { handleError } from '../utils';

import { CatalogService } from './catalog.service';
import { ICatalog } from './catalog.interface';

export class CatalogController {
  private catalogService: CatalogService;

  constructor() {
    this.catalogService = new CatalogService();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const catalogToCreate: ICatalog = request.payload as ICatalog;

    const res = await this.catalogService.create(catalogToCreate).catch(handleError);
    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const catalogToUpdate: ICatalog = request.payload as ICatalog;

    return await this.catalogService.update(id, catalogToUpdate).catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params.id;

    await this.catalogService.delete(id).catch(handleError);

    return h.response().code(204);
  }

  public async getById(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const user = request.headers['x-consumer-username'];

    return await this.catalogService.getById(id, user).catch(handleError);
  }

  public async get(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const user = request.headers['x-consumer-username'];

    return await this.catalogService.get(user).catch(handleError);
  }
}
