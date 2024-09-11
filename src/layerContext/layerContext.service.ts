import * as Boom from '@hapi/boom';
import { Transaction } from 'sequelize';

import { ObjectUtils } from '@igo2/base-api';

import { LayerService, ILayer, Layer, AnyLayerOptions, LayerOptions, LayerGroupOptions, LayerType } from '../layer';
import { ILayerContext } from './layerContext.interface';
import { LayerContext } from './layerContext.model';
import { isLayerGroupOptions, isLayerItemOptions } from '../layer/layer.utils';
import { getAncestorId } from '../utils/tree/tree.utils';

export class LayerContextService {
  private layerService: LayerService = new LayerService();

  public async create(layerContext: ILayerContext, transaction?: Transaction): Promise<LayerContext> {
    return LayerContext.create(layerContext, { transaction }).catch((error) => {
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

  public async update(contextId: number, layerId: number, layerContext: ILayerContext): Promise<ILayerContext> {
    return LayerContext.update(layerContext, {
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

  public async delete(contextId: number, layerId: string): Promise<void> {
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

  public async deleteByContextId(contextId: number): Promise<number> {
    return LayerContext.destroy({
      where: {
        contextId: contextId
      }
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

  public async bulkCreate(contextId: number, layers: AnyLayerOptions[]): Promise<(LayerContext | LayerContext[])[]> {
    const promises = layers.map((layer) => this.createAnyLayerContext(layer, contextId));
    return Promise.all(promises);
  }

  private async createAnyLayerContext(
    layer: AnyLayerOptions,
    contextId: number
  ): Promise<LayerContext | LayerContext[]> {
    if (isLayerItemOptions(layer)) {
      return this.createLayerContext(layer, contextId);
    } else if (isLayerGroupOptions(layer)) {
      return this.createLayerContextGroup(layer, contextId);
    }
  }

  private async createLayerContext(layer: LayerOptions, contextId: number): Promise<LayerContext> {
    const layerDB = await this.getLayerOrCreate(layer);
    if (layerDB?.global && !layer.visible) {
      return;
    }

    const { sourceOptions, ...restLayer } = layer;
    // The type, url and params should not be saved for LayerContext
    const { type, url, params, ...restSourceOptions } = sourceOptions;

    const layerContext: ILayerContext = {
      contextId: contextId,
      layerId: layerDB?.id,
      layerOptions: restLayer,
      sourceOptions: restSourceOptions
    };

    return this.create(layerContext);
  }

  private async createLayerContextGroup(
    { children, id, ...restLayer }: LayerGroupOptions,
    contextId: number
  ): Promise<LayerContext | LayerContext[]> {
    const layerContext: ILayerContext = {
      contextId: contextId,
      layerOptions: restLayer
    };
    const layerContextDb = await this.create(layerContext);

    if (children?.length) {
      children.forEach((child) => {
        child.parentId = this.getParentId(layerContextDb);
      });

      await this.bulkCreate(contextId, children);
    }

    return layerContextDb;
  }

  private getParentId(layerContext: LayerContext): string {
    return getAncestorId(String(layerContext.id), layerContext.layerOptions?.parentId);
  }

  /**
   * Try to get the layer by source options or create if it's doesn't exist
   */
  private async getLayerOrCreate(layer: LayerOptions): Promise<ILayer | Layer | undefined> {
    try {
      const layerDB = await this.layerService.getBySource(layer.sourceOptions, layer.id);
      return layerDB;
    } catch (error) {
      // Mute for 404
      if (error instanceof Boom.Boom && error.output.statusCode !== 404) {
        throw error;
      }
    }

    const params = layer.sourceOptions.params;
    return this.layerService.create({
      type: layer.sourceOptions.type as LayerType,
      url: layer.sourceOptions.url,
      layers: params ? params.layers : undefined
    });
  }
}
