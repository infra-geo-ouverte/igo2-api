import * as Hapi from 'hapi';

import { handleError } from '../utils';

import { LayerContext, ILayerContext } from './index';

export class LayerContextController {

  private layerContext: LayerContext;

  constructor() {
    this.layerContext = new LayerContext();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const newLayerContext = request.payload as ILayerContext;
    newLayerContext['contextId'] = request.params['contextId'];

    const res = await this.layerContext.create(newLayerContext)
      .catch(handleError);

    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const layerId = request.params['layerId'];
    const contextId = request.params['contextId'];
    const layerContext = request.payload as ILayerContext;

    return await this.layerContext.update(contextId, layerId, layerContext)
      .catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const layerId = request.params['layerId'];
    const contextId = request.params['contextId'];

    await this.layerContext.delete(contextId, layerId).catch(handleError);

    return h.response().code(204);
  }

  public async getById(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const layerId = request.params['layerId'];
    const contextId = request.params['contextId'];

    return await this.layerContext.getById(contextId, layerId)
      .catch(handleError);
  }

  public async getByContextId(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const contextId = request.params['contextId'];

    return await this.layerContext.getByContextId(contextId).catch(handleError);
  }

}
