import * as Hapi from '@hapi/hapi';

import { handleError, HapiRequestToUser } from '../utils';

import { PoiService } from './poi.service';
import { IPoi } from './poi.interface';

export class PoiController {
  private poiService: PoiService;

  constructor () {
    this.poiService = new PoiService();
  }

  public async create (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const poiToCreate: IPoi = request.payload as IPoi;
    const user = HapiRequestToUser(request);
    poiToCreate.userId = user.id;
    const res = await this.poiService.create(poiToCreate).catch(handleError);
    return h.response(res).code(201);
  }

  public async update (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const user = HapiRequestToUser(request);
    const poiToUpdate: IPoi = request.payload as IPoi;

    return await this.poiService.update(id, user.id, poiToUpdate).catch(handleError);
  }

  public async delete (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const user = HapiRequestToUser(request);
    await this.poiService.delete(id, user.id).catch(handleError);

    return h.response().code(204);
  }

  public async getById (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const user = HapiRequestToUser(request);
    return await this.poiService.getById(id, user.id).catch(handleError);
  }

  public async get (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const user = HapiRequestToUser(request);
    return await this.poiService.get(user.id).catch(handleError);
  }
}
