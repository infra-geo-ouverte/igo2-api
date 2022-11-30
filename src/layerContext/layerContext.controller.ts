import * as Hapi from '@hapi/hapi';

import { handleError } from '../utils';

import { LayerContextService, ILayerContext } from './index';

export class LayerContextController {
  private layerContextService: LayerContextService;

  constructor () {
    this.layerContextService = new LayerContextService();
  }

  public async create (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const newLayerContext = request.payload as ILayerContext;
    newLayerContext.contextId = request.params.contextId;

    const res = await this.layerContextService.create(newLayerContext).catch(handleError);

    return h.response(res).code(201);
  }

  public async update (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const layerId = request.params.layerId;
    const contextId = request.params.contextId;
    const layerContext = request.payload as ILayerContext;

    return await this.layerContextService.update(contextId, layerId, layerContext).catch(handleError);
  }

  public async delete (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const layerId = request.params.layerId;
    const contextId = request.params.contextId;

    await this.layerContextService.delete(contextId, layerId).catch(handleError);

    return h.response().code(204);
  }

  public async getById (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const layerId = request.params.layerId;
    const contextId = request.params.contextId;

    return await this.layerContextService.getById(contextId, layerId).catch(handleError);
  }

  public async getByContextId (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const contextId = request.params.contextId;

    return await this.layerContextService.getByContextId(contextId).catch(handleError);
  }
}
