import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { IPOI, POIInstance } from './poi.model';

export class POI {
  private database: IDatabase = database;

  constructor() {}

  public async create(poi: IPOI): Promise<POIInstance> {
    return await this.database.poi.create(poi);
  }

  public async update(
    id: string,
    userId: string,
    poi: IPOI
  ): Promise<{ id: string }> {
    return await this.database.poi
      .update(poi, {
        where: {
          id: id,
          userId: userId
        }
      })
      .then((count: [number, POIInstance[]]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id: id };
      });
  }

  public async delete(id: string, userId: string): Promise<void> {
    return await this.database.poi
      .destroy({
        where: {
          id: id,
          userId: userId
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async get(userId: string): Promise<POIInstance[]> {
    return await this.database.poi
      .findAll({
        where: {
          userId: userId
        }
      })
      .then((pois: POIInstance[]) => {
        const plainPOIs = pois.map(poi => ObjectUtils.removeNull(poi.get()));
        return plainPOIs;
      });
  }

  public async getById(id: string, userId: string): Promise<POIInstance> {
    return await this.database.poi
      .findOne({
        where: {
          id: id,
          userId: userId
        }
      })
      .then((poi: POIInstance) => {
        if (!poi) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(poi.get());
      });
  }
}
