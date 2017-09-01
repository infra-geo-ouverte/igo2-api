import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { POI } from './poi';
import { IPOI, POIInstance } from './poi.model';

export class POIController {

  private poi: POI;

  constructor() {
    this.poi = new POI();
  }

  public create(request: Hapi.Request, reply: Hapi.IReply) {
    const poiToCreate: IPOI = request.payload;
    poiToCreate.userId = request.headers['x-consumer-custom-id'];
    this.poi.create(poiToCreate).subscribe(
      (poi: POIInstance) => reply(poi).code(201),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public update(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const userId = request.headers['x-consumer-custom-id'];
    const poiToUpdate: IPOI = request.payload;

    this.poi.update(id, userId, poiToUpdate).subscribe(
      (poi: POIInstance) => reply(poi),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public delete(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const userId = request.headers['x-consumer-custom-id'];

    this.poi.delete(id, userId).subscribe(
      (poi: POIInstance) => reply(poi).code(204),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getById(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const userId = request.headers['x-consumer-custom-id'];

    this.poi.getById(id, userId).subscribe(
      (poi: POIInstance) => reply(poi),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public get(request: Hapi.Request, reply: Hapi.IReply) {
    const userId = request.headers['x-consumer-custom-id'];

    this.poi.get(userId).subscribe(
      (pois: POIInstance[]) => reply(pois),
      (error: Boom.BoomError) => reply(error)
    );
  }
}
