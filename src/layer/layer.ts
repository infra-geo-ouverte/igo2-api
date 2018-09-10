import * as Boom from 'boom';
import * as URL from 'url';

import * as Configs from '../configurations';

import { IDatabase, database } from '../database';
import { ObjectUtils } from '../utils';
import { UserApi } from '../user';

import { ILayer, LayerInstance } from './layer.model';

const ServerConfigs = Configs.getServerConfig();

export class Layer {
  private database: IDatabase = database;

  constructor() {}

  public async create(layer: ILayer): Promise<LayerInstance> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(
      layer.source && layer.source.url ? layer.source.url : ''
    );
    if (urlObj && hosts.indexOf(urlObj.hostname) !== -1) {
      Object.assign(layer.source, { url: urlObj.path });
    }

    return await this.database.layer.create(layer);
  }

  public async update(id: string, layer: ILayer): Promise<{ id: string }> {
    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(
      layer.source && layer.source.url ? layer.source.url : ''
    );
    if (urlObj && hosts.indexOf(urlObj.hostname) !== -1) {
      Object.assign(layer.source, { url: urlObj.path });
    }

    return await this.database.layer
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
    return await this.database.layer
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
    return await this.database.layer
      .findAll()
      .then((layers: LayerInstance[]) => {
        const plainLayers = layers.map(layer =>
          ObjectUtils.removeNull(layer.get())
        );

        return plainLayers;
      });
  }

  public async getBaseLayers(): Promise<LayerInstance[]> {
    return await this.database.layer
      .findAll({
        where: {
          baseLayer: true
        }
      })
      .then((layers: LayerInstance[]) => {
        const plainLayers = layers.map(layer =>
          ObjectUtils.removeNull(layer.get())
        );
        // TODO verify permission
        return plainLayers;
      });
  }

  public async getById(id: string, user: string): Promise<LayerInstance> {
    const layer = await this.database.layer.findOne({
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
      layerPlain.source.url,
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
    const urlObj = URL.parse(layer.source.url || '');
    if (urlObj && hosts.indexOf(urlObj.hostname) !== -1) {
      layer.source.url = urlObj.path;
    }

    const where: any = {
      $or: [
        { id: layer.id },
        {
          type: layer.type,
          source: JSON.stringify(layer.source)
        }
      ]
    };

    return await this.database.layer
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
