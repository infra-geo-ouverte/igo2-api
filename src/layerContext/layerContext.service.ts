import * as Boom from '@hapi/boom';

import { ObjectUtils } from '@igo2/base-api';

import { LayerService, ILayer } from '../layer';
import { ILayerContext } from './layerContext.interface';
import { LayerContext } from './layerContext.model';

export class LayerContextService {
  private layerService: LayerService = new LayerService();

  public async create (layerContext: ILayerContext): Promise<LayerContext> {
    return await LayerContext.create(layerContext).catch((error) => {
      if (error?.data?.name === 'SequelizeUniqueConstraintError') {
        const message = 'The pair contextId and layerId must be unique.';
        throw Boom.conflict(message);
      }
      if (error?.data?.name === 'SequelizeForeignKeyConstraintError') {
        const message = 'Layer can not be found.';
        throw Boom.badRequest(message);
      }
      if (Boom.isBoom(error)) {
        throw error;
      }
      throw Boom.badImplementation(error);
    });
  }

  public async update (contextId: string, layerId: string, layerContext: ILayerContext): Promise<ILayerContext> {
    return await LayerContext.update(layerContext, {
      where: {
        layerId: layerId,
        contextId: contextId
      }
    }).then((count: [number]) => {
      if (!count[0]) {
        throw Boom.notFound();
      }
      return {
        layerId: layerId,
        contextId: contextId
      };
    });
  }

  public async delete (contextId: string, layerId: string): Promise<void> {
    return await LayerContext.destroy({
      where: {
        layerId: layerId,
        contextId: contextId
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
    });
  }

  public async deleteByContextId (contextId: string): Promise<void> {
    return await LayerContext.destroy({
      where: {
        contextId: contextId
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
    });
  }

  public async getByContextId (contextId: string): Promise<LayerContext[]> {
    return await LayerContext.findAll({
      where: {
        contextId: contextId,
        enabled: true
      },
      order: ['layerOptions.zIndex']
    }).then((layerContextsContexts: LayerContext[]) => {
      const plainLayerContextsContexts = layerContextsContexts.map((layerContext) =>
        ObjectUtils.removeNull(layerContext.get())
      );
      return plainLayerContextsContexts;
    });
  }

  public async getById (contextId: string, layerId: string): Promise<LayerContext> {
    return await LayerContext.findOne({
      where: {
        layerId: layerId,
        contextId: contextId,
        enabled: true
      }
    }).then((layerContext: LayerContext) => {
      if (!layerContext) {
        throw Boom.notFound();
      }
      return ObjectUtils.removeNull(layerContext.get());
    });
  }

  public async bulkCreate (contextId: string, layers: ILayer[], ignoreErrors = true, createLayerIfNotExist = false) {
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
          let layerFound: any = await this.layerService.getBySource(layer).catch((error) => {
            if (createLayerIfNotExist) {
              return;
            }
            return handleError(layer, error);
          });

          if (!layerFound) {
            const params = layer.sourceOptions.params;
            const layerToCreate = {
              global: layer.global,
              layerOptions: layer.layerOptions?.title ? { title: layer.layerOptions.title } : {},
              sourceOptions: { type: layer.sourceOptions.type, url: layer.sourceOptions.url, params }
            };
            layerFound = await this.layerService.create(layerToCreate).catch((error) => {
              handleError(layer, error);
            });
          }

          if (!layerFound || layerFound.error) {
            resolve(layerFound);
            return;
          }

          if (layerFound.global && !layer.layerOptions.visible) {
            resolve(layerFound);
            return;
          }

          layer.layerOptions = layer.layerOptions || {};
          const rep = await this.create({
            contextId: contextId,
            layerId: layerFound.id,
            layerOptions: {
              zIndex: layer.layerOptions.zIndex,
              visible: layer.layerOptions.visible
            }
          })
            .then((l) => {
              return { layerId: l.layerId };
            })
            .catch((error) => {
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
