import * as Hapi from '@hapi/hapi';

import * as Boom from '@hapi/boom';
import { handleError, HapiRequestToUser } from '../utils';

import { LayerService } from './layer.service';
import { ILayer, SourceOptions } from './layer.interface';
import * as Configs from '../configurations';
import { IDatabaseConfiguration } from '../configurations';
export class LayerController {
  private layerService: LayerService;

  constructor () {
    this.layerService = new LayerService();
  }

  public async create (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const layerToCreate: ILayer = request.payload as ILayer;
    layerToCreate.type = layerToCreate.sourceOptions.type || 'wms';
    layerToCreate.url = layerToCreate.sourceOptions.url;
    const params = layerToCreate.sourceOptions.params;
    layerToCreate.layers = params ? params.layers || params.LAYERS : undefined;

    const res = await this.layerService.create(layerToCreate).catch(handleError);

    return h.response(res).code(201);
  }

  public async update (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const layerToUpdate: ILayer = request.payload as ILayer;
    layerToUpdate.type = layerToUpdate.sourceOptions.type || 'wms';
    layerToUpdate.url = layerToUpdate.sourceOptions.url;
    const params = layerToUpdate.sourceOptions.params;
    layerToUpdate.layers = params ? params.layers || params.LAYERS : undefined;

    return await this.layerService.update(id, layerToUpdate).catch(handleError);
  }

  public async delete (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params.id;

    await this.layerService.delete(id).catch(handleError);

    return h.response().code(204);
  }

  public async getById (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const requestedUser = HapiRequestToUser(request);
    const user = requestedUser.sourceId;

    return await this.layerService.getById(id, user).catch(handleError);
  }

  public async get (_request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    return await this.layerService.get().catch(handleError);
  }

  public async search (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    if ((Configs.getDatabaseConfig() as IDatabaseConfiguration).dialect !== 'postgres') {
      const msg = ` You must use a postgresql database. If you want this feature, you check these projects:   
      https://github.com/nextapps-de/flexsearch
      https://www.npmjs.com/package/lunr
      https://www.npmjs.com/package/elasticlunr 
      or raise a feature request on sequelize for FTS5 support on sqlite. 
      `;
      throw Boom.methodNotAllowed(msg);
    }
    const query: any = request.query;
    return this.layerService.getByMatch(query.q, query.type, query.limit, query.page).catch(handleError);
  }

  public async searchAndFormatAsItems (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    if ((Configs.getDatabaseConfig() as IDatabaseConfiguration).dialect !== 'postgres') {
      const msg = ` You must use a postgresql database. If you want this feature, you check these projects:   
      https://github.com/nextapps-de/flexsearch
      https://www.npmjs.com/package/lunr
      https://www.npmjs.com/package/elasticlunr 
      or raise a feature request on sequelize for FTS5 support on sqlite. 
      `;
      throw Boom.methodNotAllowed(msg);
    }
    const geoservicesConfig = Configs.getGeoServiceConfig();
    const getInfoFromCapabilities = geoservicesConfig?.getInfoFromCapabilities === true ? true : false;

    const query: any = request.query;
    return this.layerService.getFormattedLayersItemsByMatch(query.q, query.type, query.limit, query.page, getInfoFromCapabilities).catch(handleError);
  }

  public async getBaseLayers (_request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    return await this.layerService.getBaseLayers().catch(handleError);
  }

  public async getAdminOptions (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const query: any = request.query;

    return await this.layerService
      .getBySource({
        sourceOptions: {
          type: query.type,
          url: query.url,
          params: {
            layers: query.layers
          }
        } as SourceOptions
      })
      .catch((e) => {
        if (e.isBoom && e.output.statusCode === 404) {
          return {};
        }
        throw e;
      })
      .catch(handleError);
  }

  public async getOptions (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const query: any = request.query;

    const options = await this.layerService
      .getBySource({
        sourceOptions: {
          type: query.type,
          url: query.url,
          params: {
            layers: query.layers
          }
        } as SourceOptions
      })
      .catch((e) => {
        if (e.isBoom && e.output.statusCode === 404) {
          return {};
        }
        throw e;
      })
      .catch(handleError);

    /* if (query.type === 'wms' && permission.wfsAllowed) {
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
    } */

    return options;
  }
}
