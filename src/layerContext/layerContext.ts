import * as Boom from 'boom';
import * as async from 'async';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { Layer, ILayer } from '../layer';
import { ILayerContext, LayerContextInstance } from './layerContext.model';

export class LayerContext {

  private database: IDatabase = database;
  private layer: Layer = new Layer();

  constructor() { }

  public async create(
    layerContext: ILayerContext): Promise<LayerContextInstance> {

    return await this.database.layerContext.create(layerContext)
      .catch((error) => {
        const uniqueFields = ['contextId', 'layerId'];
        if (error.name === 'SequelizeUniqueConstraintError' &&
          error.fields.toString() === uniqueFields.toString()) {
          const message = 'The pair contextId and layerId must be unique.';
          throw Boom.conflict(message);
        } else if (error.name === 'SequelizeForeignKeyConstraintError') {
          const message = 'Layer can not be found.';
          throw Boom.badRequest(message);
        } else {
          throw Boom.badImplementation(error);
        }
      });
  }

  public async update(contextId: string, layerId: string,
    layerContext: ILayerContext): Promise<ILayerContext> {

    return await this.database.layerContext.update(layerContext, {
      where: {
        layerId: layerId,
        contextId: contextId
      }
    }).then((count: [number, LayerContextInstance[]]) => {
      if (!count[0]) {
        throw Boom.notFound();
      }
      return {
        layerId: layerId,
        contextId: contextId
      };
    });
  }

  public async delete(contextId: string, layerId: string): Promise<void> {
    return await this.database.layerContext.destroy({
      where: {
        layerId: layerId,
        contextId: contextId
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
      return;
    });
  }

  public async deleteByContextId(contextId: string): Promise<void> {
    return await this.database.layerContext.destroy({
      where: {
        contextId: contextId
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
      return;
    });
  }

  public async getByContextId(
    contextId: string): Promise<LayerContextInstance[]> {

    return await this.database.layerContext.findAll({
      where: {
        contextId: contextId,
      },
      order: ['order']
    }).then((layerContextsContexts: LayerContextInstance[]) => {
      const plainLayerContextsContexts = layerContextsContexts.map(
        (layerContext) => ObjectUtils.removeNull(layerContext.get())
      );
      return plainLayerContextsContexts;

    });
  }

  public async getById(contextId: string,
    layerId: string): Promise<LayerContextInstance> {

    return await this.database.layerContext.findOne({
      where: {
        layerId: layerId,
        contextId: contextId
      }
    }).then((layerContext: LayerContextInstance) => {
      if (!layerContext) {
        throw Boom.notFound();
      }
      return ObjectUtils.removeNull(layerContext.get());
    });
  }

  public async bulkCreate(
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
      }).then(() => next())
        .catch((error) => next(error));
    };

    return async.forEach(layers,
      (layer: ILayer, next) => {
        const layerFound = this.layer.getBySource(layer).catch(
          (error) => {
            if (createLayerIfNotExist) {
              const layerToCreate = layer;
              this.layer.create(layerToCreate).then(
                (layerCreated) => {
                  createFct(layerCreated, layer, next);
                }).catch((createError) => next(createError));
            } else {
              next(error);
            }
          }
        );
        createFct(layerFound, layer, next);
      },
      (error) => {
        if (error) {
          throw error;
        } else {
          return;
        }
      }
    );
  }

}
