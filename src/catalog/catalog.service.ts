import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';
import { UserApi } from '../user';

import { ICatalog } from './catalog.interface';
import { Catalog } from './catalog.model';

export class CatalogService {
  public async create (catalog: ICatalog): Promise<Catalog> {
    return await Catalog.create(catalog);
  }

  public async update (id: string, catalog: ICatalog): Promise<{ id: string }> {
    return await Catalog
      .update(catalog, {
        where: {
          id
        }
      })
      .then((count: [number]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }

        return { id };
      });
  }

  public async delete (id: string): Promise<void> {
    return await Catalog
      .destroy({
        where: {
          id
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
      });
  }

  public async get (userId: string): Promise<Catalog[]> {
    const profils: string[] = await UserApi.getProfils(userId).catch(() => {
      return [];
    });
    profils.push(userId);

    const catalogs = await Catalog.findAll({
      order: ['order']
    });

    return catalogs.filter(c => {
      return c.profils.length === 0 || c.profils.some(p => profils.includes(p));
    }).map(catalog => {
      return ObjectUtils.removeNull(catalog.get());
    });
  }

  public async getById (id: string, userId: string): Promise<Catalog> {
    const profils: string[] = await UserApi.getProfils(userId).catch(() => {
      return [];
    });
    profils.push(userId);

    const catalog = await Catalog.findOne({
      where: {
        id
      }
    });

    if (!catalog || (catalog.profils.length !== 0 && !catalog.profils.some(p => profils.includes(p)))) {
      throw Boom.notFound();
    }

    return ObjectUtils.removeNull(catalog.get());
  }
}
