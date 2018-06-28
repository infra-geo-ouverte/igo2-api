import * as Hapi from 'hapi';

import { handleError } from '../utils';

import { Catalog } from './catalog';
import { ICatalog } from './catalog.model';

export class CatalogController {

  private catalog: Catalog;

  constructor() {
    this.catalog = new Catalog();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const catalogToCreate: ICatalog = request.payload as ICatalog;

    const res = await this.catalog.create(catalogToCreate)
      .catch(handleError);
    return h.response(res).code(201)
  }

  public async update(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];
    const catalogToUpdate: ICatalog = request.payload as ICatalog;

    return await this.catalog.update(id, catalogToUpdate).catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];

    await this.catalog.delete(id).catch(handleError);

    return h.response().code(204);
  }

  public async getById(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];
    const user = request.headers['x-consumer-username'];

    return await this.catalog.getById(id, user).catch(handleError);
  }

  public async get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const user = request.headers['x-consumer-username'];

    return await this.catalog.get(user).catch(handleError);
  }
}
