import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';
import { UserApi } from '../user';

import { ICatalog, CatalogInstance } from './catalog.model';

export class Catalog {
  private database: IDatabase = database;

  constructor() {}

  public async create(catalog: ICatalog): Promise<CatalogInstance> {
    return await this.database.catalog.create(catalog);
  }

  public async update(id: string, catalog: ICatalog): Promise<{ id: string }> {
    return await this.database.catalog
      .update(catalog, {
        where: {
          id: id
        }
      })
      .then((count: [number, CatalogInstance[]]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }

        return { id: id };
      });
  }

  public async delete(id: string): Promise<void> {
    return await this.database.catalog
      .destroy({
        where: {
          id: id
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async get(user: string): Promise<CatalogInstance[]> {
    const catalogs = await this.database.catalog.findAll();

    const plainCatalogs = catalogs.map(catalog =>
      ObjectUtils.removeNull(catalog.get())
    );

    if (!plainCatalogs.length) {
      return plainCatalogs;
    }

    const catalogsAllowed = [];
    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    profils.push(user);

    for (const c of plainCatalogs) {
      const isAllowed = await UserApi.verifyPermissionByUrl(c.url, profils);
      if (isAllowed) {
        catalogsAllowed.push(c);
      }
    }

    return catalogsAllowed;
  }

  public async getById(id: string, user: string): Promise<CatalogInstance> {
    const catalog = await this.database.catalog.findOne({
      where: {
        id: id
      }
    });

    if (!catalog) {
      throw Boom.notFound();
    }
    const catalogPlain = ObjectUtils.removeNull(catalog.get());
    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    profils.push(user);
    const isAllowed = await UserApi.verifyPermissionByUrl(
      catalogPlain.url,
      profils
    );

    if (!isAllowed) {
      throw Boom.forbidden();
    }
    return catalogPlain;
  }
}
