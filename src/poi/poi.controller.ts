import { AppInstance, AppReply, AppRequest } from '../app.interface';
import {
  CreatePoiSchema,
  DeletePoiSchema,
  GetPoiSchema,
  UpdatePoiSchema
} from './poi.schema';
import { PoiService } from './poi.service';

export class PoiController {
  private poiService: PoiService;

  constructor(app: AppInstance) {
    this.poiService = new PoiService(app);
  }

  create = async (
    request: AppRequest<typeof CreatePoiSchema>,
    reply: AppReply<typeof CreatePoiSchema>
  ) => {
    const user = request.user!;

    const res = await this.poiService.create({
      ...request.body,
      userId: user.id
    });
    return reply.code(201).send(res);
  };

  update = async (
    request: AppRequest<typeof UpdatePoiSchema>,
    reply: AppReply<typeof UpdatePoiSchema>
  ) => {
    const user = request.user!;

    const id = request.params.id;
    const poiToUpdate = request.body;

    const poi = await this.poiService.getById(id, user.id);
    if (!poi) {
      return reply.notFound();
    }

    return this.poiService.update(id, poiToUpdate);
  };

  delete = async (
    request: AppRequest<typeof DeletePoiSchema>,
    reply: AppReply<typeof DeletePoiSchema>
  ) => {
    const user = request.user!;
    const id = request.params.id;

    const poi = await this.poiService.getById(id, user.id);
    if (!poi) {
      return reply.notFound();
    }

    const response = await this.poiService.delete(id, user.id);
    return reply.code(204).send(response);
  };

  getById = async (
    request: AppRequest<typeof GetPoiSchema>,
    reply: AppReply<typeof GetPoiSchema>
  ) => {
    const user = request.user!;
    const id = request.params.id;

    const poi = await this.poiService.getById(id, user.id);
    if (!poi) {
      return reply.notFound();
    }

    return poi;
  };

  getAll = async (request: AppRequest) => {
    const user = request.user!;
    return this.poiService.getAll(user.id);
  };
}
