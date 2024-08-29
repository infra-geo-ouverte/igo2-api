import * as Boom from '@hapi/boom';
import { Transaction } from 'sequelize';

import { ObjectUtils } from '@igo2/base-api';

import { LayerService, ILayer, Layer } from '../layer';
import { ILayerContext } from './layerContext.interface';
import { LayerContext } from './layerContext.model';

export class LayerContextService {
  private layerService: LayerService = new LayerService();

  public async create(layerContext: ILayerContext, transaction?: Transaction): Promise<LayerContext> {
    return await LayerContext.create(layerContext, {transaction}).catch((error) => {
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

  public async update(contextId: number, layerId: string, layerContext: ILayerContext): Promise<ILayerContext> {
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

  public async cloneByContextId(id: number, newId: number, transaction: Transaction): Promise<LayerContext[]> {
    const layers = await this.getByContextId(id);
    const requests$ = layers.map(({ id, ...layer }) => this.create({ ...layer, contextId: newId }, transaction));
    return Promise.all(requests$);
  }

  public async delete(contextId: string, layerId: string): Promise<void> {
    return await LayerContext.destroy({
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
    return await LayerContext.destroy({
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

  public async getByContextId(contextId: number): Promise<ILayerContext[]> {
    return LayerContext.findAll({
      where: {
        contextId: contextId
      },
      order: ['layerOptions.zIndex']
    }).then((layerContextsContexts: LayerContext[]) => {
      const plainLayerContextsContexts = layerContextsContexts.map((layerContext) =>
        ObjectUtils.removeNull(layerContext.get())
      );
      return plainLayerContextsContexts;
    });
  }

  public async getById(contextId: number, layerId: string): Promise<ILayerContext> {
    return LayerContext.findOne({
      where: {
        layerId: layerId,
        contextId: contextId
      }
    }).then((layerContext: LayerContext) => {
      if (!layerContext) {
        throw Boom.notFound();
      }
      return ObjectUtils.removeNull(layerContext.get());
    });
  }

  public async bulkCreate(contextId: number, layers: ILayer[]): Promise<(LayerContext | undefined)[]> {
    const promises = layers.map((layer) => this._createLayerContext(layer, contextId));
    return Promise.all(promises);
  }

  private async _createLayerContext(layer: ILayer, contextId: number): Promise<LayerContext | undefined> {
    try {
      const layerDB = await this.getLayerOrCreate(layer);
      if (layerDB.global && !layer.layerOptions.visible) {
        return;
      }

      // The type, url and params should not be saved for LayerContext
      const { type, url, params, ...sourceOptions } = layer.sourceOptions;
      const layerContext = await this.create({
        contextId: contextId,
        layerId: String(layerDB.id),
        layerOptions: layer.layerOptions ?? {},
        sourceOptions
      });

      return layerContext;
    } catch (error) {
      // Ignore error
      return;
    }
  }

  private async getLayerOrCreate(layer: ILayer): Promise<ILayer | Layer> {
    let layerDB: ILayer;

    try {
      layerDB = await this.layerService.getBySource(layer.sourceOptions, layer.id);
    } catch (error) {
      // ignore error
    }

    if (layerDB) {
      return layerDB;
    }

    const params = layer.sourceOptions.params;
    return this.layerService.create({
      type: layer.sourceOptions.type,
      url: layer.sourceOptions.url,
      layers: params ? params.layers || params.LAYERS : undefined
    });
  }
}
