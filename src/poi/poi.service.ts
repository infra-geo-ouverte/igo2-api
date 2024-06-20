import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';

import { IPoi } from './poi.interface';
import { Poi } from './poi.model';

export class PoiService {
  public async create(poi: IPoi): Promise<Poi> {
    return await Poi.create(poi);
  }

  public async update(id: string, userId: string, poi: IPoi): Promise<{ id: string }> {
    return await Poi.update(poi, {
      where: {
        id: id,
        userId: userId
      }
    }).then((count) => {
      if (!count[0]) {
        throw Boom.notFound();
      }
      return { id: id };
    });
  }

  public async delete(id: string, userId: string): Promise<void> {
    return await Poi.destroy({
      where: {
        id: id,
        userId: userId
      }
    }).then((count) => {
      if (!count) {
        throw Boom.notFound();
      }
      return;
    });
  }

  public async get(userId: string): Promise<IPoi[]> {
    return Poi.findAll({
      where: {
        userId: userId
      }
    }).then((pois) => {
      const plainPois = pois.map((poi) => ObjectUtils.removeNull(poi.get()));
      return plainPois;
    });
  }

  public async getById(id: string, userId: string): Promise<IPoi> {
    return Poi.findOne({
      where: {
        id: id,
        userId: userId
      }
    }).then((poi) => {
      if (!poi) {
        throw Boom.notFound();
      }
      return ObjectUtils.removeNull(poi.get());
    });
  }
}
