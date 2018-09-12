import * as Boom from 'boom';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';

import { Layer, ILayer } from '../layer';
import { ILayerContext, LayerContextInstance } from './layerContext.model';

export class LayerContext {
  private database: IDatabase = database;
  private layer: Layer = new Layer();

  constructor() {}

  public async create(
    layerContext: ILayerContext
  ): Promise<LayerContextInstance> {
    return await this.database.layerContext
      .create(layerContext)
      .catch(error => {
        const uniqueFields = ['contextId', 'layerId'];
        if (
          error.name === 'SequelizeUniqueConstraintError' &&
          error.fields.toString() === uniqueFields.toString()
        ) {
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

  public async update(
    contextId: string,
    layerId: string,
    layerContext: ILayerContext
  ): Promise<ILayerContext> {
    return await this.database.layerContext
      .update(layerContext, {
        where: {
          layerId: layerId,
          contextId: contextId
        }
      })
      .then((count: [number, LayerContextInstance[]]) => {
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
    return await this.database.layerContext
      .destroy({
        where: {
          layerId: layerId,
          contextId: contextId
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async deleteByContextId(contextId: string): Promise<void> {
    return await this.database.layerContext
      .destroy({
        where: {
          contextId: contextId
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async getByContextId(
    contextId: string
  ): Promise<LayerContextInstance[]> {
    return await this.database.layerContext
      .findAll({
        where: {
          contextId: contextId
        },
        order: ['layerOptions.zIndex']
      })
      .then((layerContextsContexts: LayerContextInstance[]) => {
        const plainLayerContextsContexts = layerContextsContexts.map(
          layerContext => ObjectUtils.removeNull(layerContext.get())
        );
        return plainLayerContextsContexts;
      });
  }

  public async getById(
    contextId: string,
    layerId: string
  ): Promise<LayerContextInstance> {
    return await this.database.layerContext
      .findOne({
        where: {
          layerId: layerId,
          contextId: contextId
        }
      })
      .then((layerContext: LayerContextInstance) => {
        if (!layerContext) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(layerContext.get());
      });
  }

  public async bulkCreate(
    contextId: string,
    layers: ILayer[],
    ignoreErrors = true,
    createLayerIfNotExist = false
  ) {
    const handleError = (layer, error) => {
      if (!ignoreErrors) {
        throw error;
      }
      return {
        layer: layer,
        error: error
      };
    };

    const promises = [];
    for (const layer of layers) {
      promises.push(
        new Promise(async (resolve, _reject) => {
          let layerFound: any = await this.layer
            .getBySource(layer)
            .catch(error => {
              if (createLayerIfNotExist) {
                return;
              }
              return handleError(layer, error);
            });

          if (!layerFound) {
            layerFound = await this.layer.create(layer).catch(error => {
              handleError(layer, error);
            });
          }

          if (!layerFound || layerFound.error) {
            resolve(layerFound);
            return;
          }

          layer.layerOptions = layer.layerOptions || {};
          const rep = await this.create({
            contextId: contextId,
            layerId: layerFound.id,
            layerOptions: {
              zIndex: layer.layerOptions.zIndex,
              visible: layer.layerOptions.visible,
              title:
                layerFound.layerOptions.title !== layer.layerOptions.title
                  ? layer.layerOptions.title
                  : undefined
            }
          })
            .then(l => {
              return { layerId: l.layerId };
            })
            .catch(error => {
              if (!ignoreErrors) {
                throw error;
              }
              return {
                layerId: layerFound.id,
                error: error
              };
            });

          resolve(rep);
        })
      );
    }

    return await Promise.all(promises);
  }
}
