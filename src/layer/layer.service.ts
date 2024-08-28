import * as Boom from '@hapi/boom';
import { Op } from 'sequelize';

import { ObjectUtils } from '@igo2/base-api';
import { UserApi } from '../user';
import { ILayer, ILayerIn, SourceOptions } from './layer.interface';
import { Layer } from './layer.model';
import { getUrlPath } from '../utils/url.utils';

export class LayerService {
  public async create(layer: ILayerIn): Promise<Layer> {
    if (layer.url) {
      layer.url = getUrlPath(layer.url);
    }
    return await Layer.create(layer);
  }

  public async update(id: string, layer: ILayer): Promise<{ id: string }> {
    if (layer.url) {
      layer.url = getUrlPath(layer.url);
    }
    return await Layer.update(layer, {
      where: {
        id: id
      }
    }).then((count: [number]) => {
      if (!count[0]) {
        throw Boom.notFound();
      }
      return { id: id };
    });
  }

  public async delete(id: string): Promise<void> {
    return await Layer.destroy({
      where: {
        id: id
      }
    }).then((count: number) => {
      if (!count) {
        throw Boom.notFound();
      }
      return;
    });
  }

  public async get(): Promise<ILayer[]> {
    return Layer.findAll().then((layers: Layer[]) => {
      const plainLayers = layers.map((layer) => ObjectUtils.removeNull(layer.get()));

      return plainLayers;
    });
  }

  public async getBaseLayers(): Promise<ILayer[]> {
    return Layer.findAll({
      where: {
        layerOptions: {
          baseLayer: true
        }
      }
    }).then((layers: Layer[]) => {
      const plainLayers = layers.map((layer) => {
        const plainLayer = layer.get();
        Object.assign(plainLayer, plainLayer.layerOptions);

        plainLayer.layerOptions = null;

        return ObjectUtils.removeNull(plainLayer);
      });
      // TODO verify permission
      return plainLayers;
    });
  }

  public async getById(id: string, user: string): Promise<ILayer> {
    const layer = await Layer.findOne({
      where: {
        id: id
      }
    });
    if (!layer) {
      throw Boom.notFound();
    }
    const layerPlain = ObjectUtils.removeNull(layer.get());

    const profils: string[] = await UserApi.getProfils(user).catch(() => {
      return [];
    });
    profils.push(user);

    const isAllowed = await UserApi.verifyPermissionByUrl(layerPlain.url, profils);

    if (!isAllowed) {
      throw Boom.forbidden();
    }
    return layerPlain;
  }

  public async getBySource(options: SourceOptions, layerId?: string): Promise<ILayer> {
    if (options.url) {
      options.url = getUrlPath(options.url);
    }
    const where: any = {
      [Op.or]: [
        {
          type: options.type,
          url: options.url,
          layers: (options.params || {}).layers || (options.params || {}).LAYERS || null
        }
      ]
    };
    if (layerId) {
      where[Op.or].unshift({ id: layerId });
    }

    return Layer.findOne({
      where: where
    }).then((layerFound: Layer) => {
      if (!layerFound) {
        throw Boom.notFound();
      }
      return ObjectUtils.removeNull(layerFound.get());
    });
  }
}
