import * as Boom from 'boom';
import * as Sequelize from 'sequelize';

import { IDatabase, database, ObjectUtils } from '@igo2/base-api';
import { UserApi } from '../user';

import { ICatalog, CatalogInstance } from './catalog.model';

export class Catalog {
  private database: IDatabase = database;

  constructor() {}

  public async create(catalog: ICatalog): Promise<CatalogInstance> {
    return await this.database.models.catalog.create(catalog);
  }

  public async update(id: string, catalog: ICatalog): Promise<{ id: string }> {
    return await this.database.models.catalog
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
    return await this.database.models.catalog
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
    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    profils.push(user);

    const catalogs = await this.database.models.catalog.findAll({
      where: {
        profils: {
          [Sequelize.Op.or]: {
            [Sequelize.Op.eq]: null,
            [Sequelize.Op.overlap] : profils
          }
        }
      },
      order: ['order']
    });

    return catalogs.map(catalog =>
      ObjectUtils.removeNull(catalog.get())
    );
  }

  public async getById(id: string, user: string): Promise<CatalogInstance> {
    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    profils.push(user);

    const catalog = await this.database.models.catalog.findOne({
      where: {
        id: id,
        profils: {
          [Sequelize.Op.or]: {
            [Sequelize.Op.eq]: null,
            [Sequelize.Op.overlap] : profils
          }
        }
      }
    });

    if (!catalog) {
      throw Boom.notFound();
    }

    return ObjectUtils.removeNull(catalog.get());
  }
}
