import * as Hapi from 'hapi';

import { handleError } from '../utils';

import { POI } from './poi';
import { IPOI } from './poi.model';

export class POIController {

  private poi: POI;

  constructor() {
    this.poi = new POI();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const poiToCreate: IPOI = request.payload as IPOI;
    poiToCreate.userId = request.headers['x-consumer-custom-id'];

    const res = await this.poi.create(poiToCreate)
      .catch(handleError);
    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];
    const userId = request.headers['x-consumer-custom-id'];
    const poiToUpdate: IPOI = request.payload as IPOI;

    return await this.poi.update(id, userId, poiToUpdate).catch(handleError);

  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];
    const userId = request.headers['x-consumer-custom-id'];

    await this.poi.delete(id, userId).catch(handleError);

    return h.response().code(204);
  }

  public async getById(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];
    const userId = request.headers['x-consumer-custom-id'];

    return await this.poi.getById(id, userId).catch(handleError);
  }

  public async get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const userId = request.headers['x-consumer-custom-id'];

    return await this.poi.get(userId).catch(handleError);
  }
}
