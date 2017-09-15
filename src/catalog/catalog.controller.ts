import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { Catalog } from './catalog';
import { ICatalog, CatalogInstance } from './catalog.model';

export class CatalogController {

  private catalog: Catalog;

  constructor() {
    this.catalog = new Catalog();
  }

  public create(request: Hapi.Request, reply: Hapi.IReply) {
    const catalogToCreate: ICatalog = request.payload;

    this.catalog.create(catalogToCreate).subscribe(
      (catalog: CatalogInstance) => reply(catalog).code(201),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public update(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const catalogToUpdate: ICatalog = request.payload;

    this.catalog.update(id, catalogToUpdate).subscribe(
      (catalog: CatalogInstance) => reply(catalog),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public delete(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];

    this.catalog.delete(id).subscribe(
      (catalog: CatalogInstance) => reply(catalog).code(204),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getById(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const user = request.headers['x-consumer-username'];

    this.catalog.getById(id, user).subscribe(
      (catalog: CatalogInstance) => reply(catalog),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public get(request: Hapi.Request, reply: Hapi.IReply) {
    const user = request.headers['x-consumer-username'];

    this.catalog.get(user).subscribe(
      (catalogs: CatalogInstance[]) => reply(catalogs),
      (error: Boom.BoomError) => reply(error)
    );
  }
}
