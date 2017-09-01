import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { LayerContext, ILayerContext, LayerContextInstance } from './index';

export class LayerContextController {

  private layerContext: LayerContext;

  constructor() {
    this.layerContext = new LayerContext();
  }

  public create(request: Hapi.Request, reply: Hapi.IReply) {
    const newLayerContext: ILayerContext = request.payload;
    newLayerContext['contextId'] = request.params['contextId'];

    this.layerContext.create(newLayerContext).subscribe(
      (tc: LayerContextInstance) => reply(tc).code(201),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public update(request: Hapi.Request, reply: Hapi.IReply) {
    const layerId = request.params['layerId'];
    const contextId = request.params['contextId'];
    const layerContext: ILayerContext = request.payload;

    this.layerContext.update(contextId, layerId, layerContext).subscribe(
      (cp: LayerContextInstance) => reply(cp),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public delete(request: Hapi.Request, reply: Hapi.IReply) {
    const layerId = request.params['layerId'];
    const contextId = request.params['contextId'];

    this.layerContext.delete(contextId, layerId).subscribe(
      (cp: LayerContextInstance) => reply(cp).code(204),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getById(request: Hapi.Request, reply: Hapi.IReply) {
    const layerId = request.params['layerId'];
    const contextId = request.params['contextId'];

    this.layerContext.getById(contextId, layerId).subscribe(
      (cp: LayerContextInstance) => reply(cp),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getByContextId(request: Hapi.Request, reply: Hapi.IReply) {
    const contextId = request.params['contextId'];

    this.layerContext.getByContextId(contextId).subscribe(
      (cp: LayerContextInstance[]) => reply(cp),
      (error: Boom.BoomError) => reply(error)
    );
  }

}
