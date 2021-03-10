import * as Boom from 'boom';
import * as URL from 'url';

import { IDatabase, database, ObjectUtils, Config } from '@igo2/base-api';
import { UserApi } from '../user';

import { ILayer, LayerInstance } from './layer.model';

const ServerConfigs = Config.getServerConfig();

export class Layer {
  private database: IDatabase = database;

  constructor() {}

  public async create(layer: ILayer): Promise<LayerInstance> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(layer.url || '');
    const url = urlObj ? urlObj.protocol + '//' + urlObj.hostname : '';
    if (url && hosts.indexOf(url) !== -1) {
      layer.url = urlObj.path;
    }

    return await this.database.models.layer.create(layer);
  }

  public async update(id: string, layer: ILayer): Promise<{ id: string }> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(layer.url || '');
    const url = urlObj ? urlObj.protocol + '//' + urlObj.hostname : '';
    if (url && hosts.indexOf(url) !== -1) {
      layer.url = urlObj.path;
    }

    return await this.database.models.layer
      .update(layer, {
        where: {
          id: id
        }
      })
      .then((count: [number, LayerInstance[]]) => {
        if (!count[0]) {
          throw Boom.notFound();
        }
        return { id: id };
      });
  }

  public async delete(id: string): Promise<void> {
    return await this.database.models.layer
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

  public async get(): Promise<LayerInstance[]> {
    return await this.database.models.layer
      .findAll()
      .then((layers: LayerInstance[]) => {
        const plainLayers = layers.map(layer =>
          ObjectUtils.removeNull(layer.get())
        );

        return plainLayers;
      });
  }

  public async getBaseLayers(): Promise<LayerInstance[]> {
    return await this.database.models.layer
      .findAll({
        where: {
          layerOptions: {
            baseLayer: true
          }
        }
      })
      .then((layers: LayerInstance[]) => {
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

  public async getById(id: string, user: string): Promise<LayerInstance> {
    const layer = await this.database.models.layer.findOne({
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

  public async getBySource(layer: ILayer): Promise<LayerInstance> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    layer.sourceOptions = layer.sourceOptions || {};
    const urlObj = URL.parse(layer.sourceOptions.url || '');
    const url = urlObj ? urlObj.protocol + '//' + urlObj.hostname : '';
    if (url && hosts.indexOf(url) !== -1) {
      layer.sourceOptions.url = urlObj.path;
    }
    const where: any = {
      $or: [
        { id: layer.id },
        {
          type: layer.sourceOptions.type,
          url: layer.sourceOptions.url || null,
          layers: (layer.sourceOptions.params || {}).layers || (layer.sourceOptions.params || {}).LAYERS || null
        }
      ]
    };

    return await this.database.models.layer
      .findOne({
        where: where
      })
      .then((layerFound: LayerInstance) => {
        if (!layerFound) {
          throw Boom.notFound();
        }
        return ObjectUtils.removeNull(layerFound.get());
      });
  }
}
