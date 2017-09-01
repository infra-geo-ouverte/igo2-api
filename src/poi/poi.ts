import * as Rx from 'rxjs';
import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { IPOI, POIInstance } from './poi.model';

export class POI {

  private database: IDatabase = database;

  constructor() {}

  public create(poi: IPOI): Rx.Observable<POIInstance> {
    return Rx.Observable.create(observer => {
      this.database.poi.create(poi).then((createdPOI) => {
        observer.next(createdPOI);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public update(id: string, userId: string,
    poi: IPOI): Rx.Observable<POIInstance> {

    return Rx.Observable.create(observer => {
      this.database.poi.update(poi, {
        where: {
          id: id,
          userId: userId
        }
      }).then((count: [number, POIInstance[]]) => {
        if (count[0]) {
          observer.next({id: id});
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public delete(id: string, userId: string): Rx.Observable<{}> {
    return Rx.Observable.create(observer => {
      this.database.poi.destroy({
        where: {
          id: id,
          userId: userId
        }
      }).then((count: number) => {
        if (count) {
          observer.next({});
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public get(userId: string): Rx.Observable<POIInstance[]> {
    return Rx.Observable.create(observer => {
      this.database.poi.findAll({
        where: {
          userId: userId
        }
      }).then((pois: POIInstance[]) => {
        const plainPOIs = pois.map(
          (poi) => ObjectUtils.removeNull(poi.get())
        );
        observer.next(plainPOIs);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public getById(id: string, userId: string): Rx.Observable<POIInstance> {
    return Rx.Observable.create(observer => {
      this.database.poi.findOne({
        where: {
          id: id,
          userId: userId
        }
      }).then((poi: POIInstance) => {
        if (poi) {
          observer.next(ObjectUtils.removeNull(poi.get()));
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }
}
