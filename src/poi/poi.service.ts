import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';

import { IPoi } from './poi.interface';
import { Poi } from './poi.model';

export class PoiService {
  public async create (poi: IPoi): Promise<Poi> {
    return await Poi.create(poi);
  }

  public async update (
    id: string,
    userId: string,
    poi: IPoi
  ): Promise<{ id: string }> {
    return await Poi
      .update(poi, {
        where: {
          id: id,
          userId: userId
        }
      })
      .then((count: [number]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id: id };
      });
  }

  public async delete (id: string, userId: string): Promise<void> {
    return await Poi
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
      });
  }

  public async get (userId: string): Promise<Poi[]> {
    return await Poi
      .findAll({
        where: {
          userId: userId
        }
      })
      .then((pois: Poi[]) => {
        const plainPois = pois.map(poi => ObjectUtils.removeNull(poi.get()));
        return plainPois;
      });
  }

  public async getById (id: string, userId: string): Promise<Poi> {
    return await Poi
      .findOne({
        where: {
          id: id,
          userId: userId
        }
      })
      .then((poi: Poi) => {
        if (!poi) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(poi.get());
      });
  }
}
