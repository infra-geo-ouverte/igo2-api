import * as Rx from 'rxjs';
import * as Boom from 'boom';
import * as async from 'async';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { Layer, ILayer, LayerInstance } from '../layer';
import { ILayerContext, LayerContextInstance } from './layerContext.model';

export class LayerContext {

  private database: IDatabase = database;
  private layer: Layer = new Layer();

  constructor() {}

  public create(
    layerContext: ILayerContext): Rx.Observable<LayerContextInstance> {

    return Rx.Observable.create(observer => {
      this.database.layerContext.create(layerContext)
        .then((createdLayerContext) => {
          observer.next(createdLayerContext);
          observer.complete();
        }).catch((error) => {
          const uniqueFields = ['contextId', 'layerId'];
          if (error.name === 'SequelizeUniqueConstraintError' &&
            error.fields.toString() === uniqueFields.toString()) {
            const message = 'The pair contextId and layerId must be unique.';
            observer.error(Boom.conflict(message));
          } else if (error.name === 'SequelizeForeignKeyConstraintError') {
            const message = 'Layer can not be found.';
            observer.error(Boom.badRequest(message));
          } else {
            observer.error(Boom.badImplementation(error));
          }
        });
    });
  }

  public update(contextId: string, layerId: string,
    layerContext: ILayerContext): Rx.Observable<LayerContextInstance> {

    return Rx.Observable.create(observer => {
      this.database.layerContext.update(layerContext, {
        where: {
          layerId: layerId,
          contextId: contextId
        }
      }).then((count: [number, LayerContextInstance[]]) => {
        if (count[0]) {
          observer.next({
            layerId: layerId,
            contextId: contextId
          });
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public delete(contextId: string, layerId: string): Rx.Observable<{}> {
    return Rx.Observable.create(observer => {
      this.database.layerContext.destroy({
        where: {
          layerId: layerId,
          contextId: contextId
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

  public deleteByContextId(contextId: string): Rx.Observable<{}> {
    return Rx.Observable.create(observer => {
      this.database.layerContext.destroy({
        where: {
          contextId: contextId
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

  public getByContextId(
    contextId: string): Rx.Observable<LayerContextInstance[]> {

    return Rx.Observable.create(observer => {
      this.database.layerContext.findAll({
        where: {
          contextId: contextId,
        },
        order: ['order']
      }).then((layerContextsContexts: LayerContextInstance[]) => {
          const plainLayerContextsContexts = layerContextsContexts.map(
            (layerContext) => ObjectUtils.removeNull(layerContext.get())
          );
          observer.next(plainLayerContextsContexts);
          observer.complete();
        }).catch((error) => {
          observer.error(Boom.badImplementation(error));
        });
    });
  }

  public getById(contextId: string,
    layerId: string): Rx.Observable<LayerContextInstance> {

    return Rx.Observable.create(observer => {
      this.database.layerContext.findOne({
        where: {
          layerId: layerId,
          contextId: contextId
        }
      }).then((layerContext: LayerContextInstance) => {
        if (layerContext) {
          observer.next(ObjectUtils.removeNull(layerContext.get()));
          observer.complete();
        } else {
          observer.error(Boom.notFound());
        }
      }).catch((error) => {
        observer.error(Boom.badImplementation(error));
      });
    });
  }

  public bulkCreate(
    contextId: string,
    layers: ILayer[],
    createLayerIfNotExist = false) {

    const createFct = (layerCommun, layer, next) => {
      this.create({
        contextId: contextId,
        layerId: layerCommun.id,
        order: layer.order,
        options: {
          visible: layer.visible,
          title: layerCommun.title !== layer.title ? layer.title : undefined
        }
      }).subscribe(
        (rep) => next(),
        (error) => next(error)
      );
    };

    return Rx.Observable.create(observer => {
      async.forEach(layers,
        (layer: ILayer, next) => {
          this.layer.getBySource(layer).subscribe(
            (layerFound: LayerInstance) => {
              createFct(layerFound, layer, next);
            },
            (error: Boom.BoomError) => {
              if (createLayerIfNotExist) {
                const layerToCreate = layer;
                this.layer.create(layerToCreate).subscribe(
                  (layerCreated) => {
                    createFct(layerCreated, layer, next);
                  },
                  (createError) => next(createError)
                );
              } else {
                next(error);
              }
            }
          );
        },
        (error) => {
          if (error) {
            observer.error(error);
          } else {
            observer.next();
            observer.complete();
          }
        }
      );
    });
  }

}
