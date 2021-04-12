import * as Hapi from '@hapi/hapi';
import * as URL from 'url';
import * as https from 'https';
import axios from 'axios';
import * as Boom from '@hapi/boom';

import { getServerConfig } from '../configurations';
import { handleError } from '../utils';

import { UserApi } from '../user/api';
import { LayerService } from './layer.service';
import { ILayer } from './layer.interface';

const ServerConfigs = getServerConfig();

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
        sourceOptions: {
          type: query.type,
          url: query.url,
          params: {
            layers: query.layers
          }
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
    const query: any = request.query;

    const localhost = ServerConfigs.localhost;
    const hosts = localhost ? localhost.hosts : [];
    const urlObj = URL.parse(query.url || '');
    const url = urlObj && urlObj.hostname ? urlObj.protocol + '//' + urlObj.hostname : '';

    let permission: any = {};
    if (ServerConfigs.wssApi && (!url || hosts.indexOf(url) !== -1) && UserApi.isInBasePath(urlObj.pathname)) {
      const theme = query.url.substring(query.url.lastIndexOf('/') + 1, query.url.lastIndexOf('.fcgi'));
      https.globalAgent.options.rejectUnauthorized = false;
      permission = await axios
        .get(`${ServerConfigs.wssApi}layers/${query.layers}/allowed?theme=${theme}`, {
          headers: request.headers
        })
        .then((p) => p.data)
        .catch((e) => {
          throw Boom.badImplementation(e);
        });

      if (query.type === 'wms') {
        if (!permission.wmsAllowed) {
          return {};
        }
      } else if (query.type === 'wfs') {
        if (!permission.wfsAllowed) {
          return {};
        }
      }
    }

    const options = await this.layerService
      .getBySource({
        sourceOptions: {
          type: query.type,
          url: query.url,
          params: {
            layers: query.layers
          }
        }
      })
      .catch((e) => {
        if (e.isBoom && e.output.statusCode === 404) {
          return {};
        }
        throw e;
      })
      .catch(handleError);

    if (query.type === 'wms' && permission.wfsAllowed) {
      options.layerOptions = Object.assign(
        {
          workspace: {
            enabled: true
          }
        },
        options.layerOptions
      );

      options.sourceOptions = Object.assign(
        {
          urlWfs: options.url,
          paramsWFS: {
            featureTypes: options.layers
          }
        },
        options.sourceOptions
      );
    }

    return options;
  }
}
