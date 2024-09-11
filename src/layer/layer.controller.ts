import * as Hapi from '@hapi/hapi';
import { handleError } from '../utils';

import { UserApi } from '../user/api';
import { LayerService } from './layer.service';
import { ILayer } from './layer.interface';
import { LayerWss } from './layer-wss';
import { convertLayerToOptions, isLayerItemOptions } from './layer.utils';

export class LayerController {
  private layerService: LayerService;

  constructor() {
    this.layerService = new LayerService();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const layerToCreate: ILayer = request.payload as ILayer;

    const res = await this.layerService.create(layerToCreate).catch(handleError);

    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const layerToUpdate: ILayer = request.payload as ILayer;

    return await this.layerService.update(id, layerToUpdate).catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params.id;

    await this.layerService.delete(id).catch(handleError);

    return h.response().code(204);
  }

  public async getById(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const user = request.headers['x-consumer-username'];

    return await this.layerService.getById(id, user).catch(handleError);
  }

  public async get(_request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    return await this.layerService.get().catch(handleError);
  }

  public async getBaseLayers(_request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    return await this.layerService.getBaseLayers().catch(handleError);
  }

  public async getAdminOptions(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const query: any = request.query;

    return await this.layerService
      .getBySource({
        type: query.type,
        url: query.url,
        params: {
          layers: query.layers
        }
      })
      .catch((e) => {
        if (e.isBoom && e.output.statusCode === 404) {
          return {};
        }
        throw e;
      })
      .catch(handleError);
  }

  public async getOptions(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const query = request.query;

    const isAllowed = await this.urlAllowed(query.url, request.headers);
    if (!isAllowed) {
      return {};
    }

    const layer: ILayer = await this.layerService
      .getBySource({
        type: query.type,
        url: query.url,
        params: {
          layers: query.layers
        }
      })
      .catch((e) => {
        if (e.isBoom && e.output.statusCode === 404) {
          return {};
        }
        throw e;
      })
      .catch(handleError);

    const options = convertLayerToOptions(layer);
    if (query.type === 'wms' && isLayerItemOptions(options)) {
      await LayerWss.setWssOptions(options, request);
    }

    return options;
  }
 
  private async urlAllowed(url: string, headers: object): Promise<boolean> {
    const userId = headers['x-consumer-id'];
    const username = headers['x-consumer-username'];

    const profils: string[] = await UserApi.getProfils(userId, headers['x-consumer-groups']).catch(() => {
      return [];
    });
    profils.push(username);

    return UserApi.verifyPermissionByUrl(url, profils);
  }
}
