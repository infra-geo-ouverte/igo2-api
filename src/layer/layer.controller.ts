import * as Hapi from 'hapi';

import { handleError } from '../utils';

import { Layer } from './layer';
import { ILayer } from './layer.model';

export class LayerController {

  private layer: Layer;

  constructor() {
    this.layer = new Layer();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const layerToCreate: ILayer = request.payload as ILayer;

    const res = await this.layer.create(layerToCreate).catch(handleError);

    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];
    const layerToUpdate: ILayer = request.payload as ILayer;

    return await this.layer.update(id, layerToUpdate).catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];

    await this.layer.delete(id).catch(handleError);

    return h.response().code(204);
  }

  public async getById(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];
    const user = request.headers['x-consumer-username'];

    return await this.layer.getById(id, user).catch(handleError);
  }

  public async get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return await this.layer.get().catch(handleError);
  }

  public async getBaseLayers(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return await this.layer.getBaseLayers().catch(handleError);
  }

}
