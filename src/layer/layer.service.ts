import * as Boom from '@hapi/boom';
import * as URL from 'url';
import { Op } from 'sequelize';

import { ObjectUtils } from '@igo2/base-api';
import { getServerConfig } from '../configurations';
import { UserApi } from '../user';

import { ILayer } from './layer.interface';
import { Layer } from './layer.model';

const ServerConfigs = getServerConfig();

export class LayerService {

  public async create(layer: ILayer): Promise<Layer> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(layer.url || '');
    const url = urlObj ? urlObj.protocol + '//' + urlObj.hostname : '';
    if (url && hosts.indexOf(url) !== -1) {
      layer.url = urlObj.path;
    }

    return await Layer.create(layer);
  }

  public async update(id: string, layer: ILayer): Promise<{ id: string }> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(layer.url || '');
    const url = urlObj ? urlObj.protocol + '//' + urlObj.hostname : '';
    if (url && hosts.indexOf(url) !== -1) {
      layer.url = urlObj.path;
    }

    return await Layer
      .update(layer, {
        where: {
          id: id
        }
      })
      .then((count: [number]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id: id };
      });
  }

  public async delete(id: string): Promise<void> {
    return await Layer
      .destroy({
        where: {
          id: id
        }
      })
      .then((count: number) => {
        if (!count) {
          throw Boom.notFound();
        }
        return;
      });
  }

  public async get(): Promise<Layer[]> {
    return await Layer
      .findAll()
      .then((layers: Layer[]) => {
        const plainLayers = layers.map(layer =>
          ObjectUtils.removeNull(layer.get())
        );

        return plainLayers;
      });
  }

  public async getBaseLayers(): Promise<Layer[]> {
    return await Layer
      .findAll({
        where: {
          layerOptions: {
            baseLayer: true
          }
        }
      })
      .then((layers: Layer[]) => {
        const plainLayers = layers.map(layer => {
          const plainLayer = layer.get();
          Object.assign(plainLayer, plainLayer.layerOptions);

          plainLayer.layerOptions = null;

          return ObjectUtils.removeNull(plainLayer);
        });
        // TODO verify permission
        return plainLayers;
      });
  }

  public async getById(id: string, user: string): Promise<Layer> {
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

    const isAllowed = await UserApi.verifyPermissionByUrl(
      layerPlain.url,
      profils
    );

    if (!isAllowed) {
      throw Boom.forbidden();
    }
    return layerPlain;
  }

  public async getBySource(layer: ILayer): Promise<Layer> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    layer.sourceOptions = layer.sourceOptions || {};
    const urlObj = URL.parse(layer.sourceOptions.url || '');
    const url = urlObj ? urlObj.protocol + '//' + urlObj.hostname : '';
    if (url && hosts.indexOf(url) !== -1) {
      layer.sourceOptions.url = urlObj.path;
    }

    const where: any = {
      [Op.or]: [
        {
          type: layer.sourceOptions.type,
          url: layer.sourceOptions.url || null,
          layers: (layer.sourceOptions.params || {}).layers || (layer.sourceOptions.params || {}).LAYERS || null
        }
      ]
    };
    if (layer.id) {
      where[Op.or].unshift({ id: layer.id });
    }

    return await Layer
      .findOne({
        where: where
      })
      .then((layerFound: Layer) => {
        if (!layerFound) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(layerFound.get());
      });
  }
}
