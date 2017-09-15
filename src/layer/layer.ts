import * as Rx from 'rxjs';
import * as Boom from 'boom';
import * as URL from 'url';

import * as Configs from '../configurations';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';
import { User, Api } from '../user';

import { ILayer, LayerInstance } from './layer.model';

const ServerConfigs = Configs.getServerConfig();

export class Layer {

  private database: IDatabase = database;

  constructor() {}

  public create(layer: ILayer): Rx.Observable<LayerInstance> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(layer.source.url);
    if (hosts.indexOf(urlObj.hostname) !== -1) {
      layer.source.url = urlObj.path;
    }

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
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(layer.source.url);
    if (hosts.indexOf(urlObj.hostname) !== -1) {
      layer.source.url = urlObj.path;
    }

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

  public getById(id: string, user: string): Rx.Observable<LayerInstance> {
    return Rx.Observable.create(observer => {
      this.database.layer.findOne({
        where: {
          id: id
        }
      }).then((layer: LayerInstance) => {
        if (layer) {
          const layerPlain = ObjectUtils.removeNull(layer.get());
          User.getProfils(user).subscribe((profils) => {
            profils.push(user);
            Api.verifyPermissionByUrl(layerPlain.source.url, profils)
              .subscribe((isAllowed) => {
                if (isAllowed) {
                  observer.next(layerPlain);
                  observer.complete();
                } else {
                  observer.error(Boom.forbidden());
                }
            });
          });
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public getBySource(layer: ILayer): Rx.Observable<LayerInstance> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(layer.source.url);
    if (hosts.indexOf(urlObj.hostname) !== -1) {
      layer.source.url = urlObj.path;
    }

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
