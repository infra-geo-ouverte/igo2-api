import * as Rx from 'rxjs';
import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { ILayer, LayerInstance } from './layer.model';

export class Layer {

  private database: IDatabase = database;

  constructor() {}

  public create(layer: ILayer): Rx.Observable<LayerInstance> {
    return Rx.Observable.create(observer => {
      this.database.layer.create(layer).then((createdLayer) => {
        observer.next(createdLayer);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public update(id: string, layer: ILayer): Rx.Observable<LayerInstance> {
    return Rx.Observable.create(observer => {
      this.database.layer.update(layer, {
        where: {
          id: id
        }
      }).then((count: [number, LayerInstance[]]) => {
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

  public delete(id: string): Rx.Observable<{}> {
    return Rx.Observable.create(observer => {
      this.database.layer.destroy({
        where: {
          id: id
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

  public get(): Rx.Observable<LayerInstance[]> {
    return Rx.Observable.create(observer => {
      this.database.layer.findAll().then((layers: LayerInstance[]) => {
        const plainLayers = layers.map(
          (layer) => ObjectUtils.removeNull(layer.get())
        );
        observer.next(plainLayers);
        observer.complete();
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public getById(id: string): Rx.Observable<LayerInstance> {
    return Rx.Observable.create(observer => {
      this.database.layer.findOne({
        where: {
          id: id
        }
      }).then((layer: LayerInstance) => {
        if (layer) {
          observer.next(ObjectUtils.removeNull(layer.get()));
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public getBySource(layer: ILayer): Rx.Observable<LayerInstance> {

    const where: any = {
      $or: [
        {id: layer.id},
        {
          type: layer.type,
          source: JSON.stringify(layer.source)
        }
      ]
    };

    return Rx.Observable.create(observer => {
      this.database.layer.findOne({
        where: where
      }).then((layerFound: LayerInstance) => {
        if (layerFound) {
          observer.next(ObjectUtils.removeNull(layerFound.get()));
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
