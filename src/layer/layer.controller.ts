import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { Layer } from './layer';
import { ILayer, LayerInstance } from './layer.model';

export class LayerController {

  private layer: Layer;

  constructor() {
    this.layer = new Layer();
  }

  public create(request: Hapi.Request, reply: Hapi.IReply) {
    const layerToCreate: ILayer = request.payload;

    this.layer.create(layerToCreate).subscribe(
      (layer: LayerInstance) => reply(layer).code(201),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public update(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const layerToUpdate: ILayer = request.payload;

    this.layer.update(id, layerToUpdate).subscribe(
      (layer: LayerInstance) => reply(layer),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public delete(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];

    this.layer.delete(id).subscribe(
      (layer: LayerInstance) => reply(layer).code(204),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getById(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];

    this.layer.getById(id).subscribe(
      (layer: LayerInstance) => reply(layer),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public get(request: Hapi.Request, reply: Hapi.IReply) {
    this.layer.get().subscribe(
      (layers: LayerInstance[]) => reply(layers),
      (error: Boom.BoomError) => reply(error)
    );
  }
}
