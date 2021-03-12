import * as Hapi from '@hapi/hapi';

import { handleError } from '../utils';

import { PoiService } from './poi.service';
import { IPoi } from './poi.interface';

export class PoiController {
  private poiService: PoiService;

  constructor() {
    this.poiService = new PoiService();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const poiToCreate: IPoi = request.payload as IPoi;
    poiToCreate.userId = request.headers['x-consumer-custom-id'];

    const res = await this.poiService.create(poiToCreate).catch(handleError);
    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const userId = request.headers['x-consumer-custom-id'];
    const poiToUpdate: IPoi = request.payload as IPoi;

    return await this.poiService.update(id, userId, poiToUpdate).catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const userId = request.headers['x-consumer-custom-id'];

    await this.poiService.delete(id, userId).catch(handleError);

    return h.response().code(204);
  }

  public async getById(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const userId = request.headers['x-consumer-custom-id'];

    return await this.poiService.getById(id, userId).catch(handleError);
  }

  public async get(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const userId = request.headers['x-consumer-custom-id'];

    return await this.poiService.get(userId).catch(handleError);
  }
}
