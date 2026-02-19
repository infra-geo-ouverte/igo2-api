import { AppInstance, AppReply, AppRequest } from '../app.interface';
import {
  CreateLayerSchema,
  DeleteLayerSchema,
  GetLayerAdminOptionSchema,
  GetLayerOptionSchema,
  GetLayerSchema,
  UpdateLayerSchema
} from './layer.schema';
import { LayerService } from './layer.service';

export class LayerController {
  private layerService: LayerService;

  constructor(app: AppInstance) {
    this.layerService = new LayerService(app);
  }

  create = async (
    request: AppRequest<typeof CreateLayerSchema>,
    reply: AppReply<typeof CreateLayerSchema>
  ) => {
    const layerToCreate = request.body;

    const res = await this.layerService.create(layerToCreate);
    return reply.code(201).send(res);
  };

  update = async (
    request: AppRequest<typeof UpdateLayerSchema>,
    reply: AppReply<typeof UpdateLayerSchema>
  ) => {
    const id = request.params.id;
    const profils = request.user!.profils;

    const layer = this.layerService.getByIdWithPermission(id, profils);
    if (!layer) {
      return reply.notFound();
    }

    return this.layerService.update(id, request.body);
  };

  delete = async (
    request: AppRequest<typeof DeleteLayerSchema>,
    reply: AppReply<typeof DeleteLayerSchema>
  ) => {
    const id = request.params.id;
    const profils = request.user!.profils;

    const layer = this.layerService.getByIdWithPermission(id, profils);
    if (!layer) {
      return reply.notFound();
    }

    await this.layerService.delete(id);

    return reply.code(204).send();
  };

  getById = async (
    request: AppRequest<typeof GetLayerSchema>,
    reply: AppReply<typeof GetLayerSchema>
  ) => {
    const id = request.params.id;
    const profils = request.user!.profils;

    const layer = await this.layerService.getByIdWithPermission(id, profils);
    if (!layer) {
      return reply.notFound();
    }

    return layer;
  };

  getAll = async () => {
    return this.layerService.getAll();
  };

  getBaseLayers = async () => {
    return this.layerService.getBaseLayers();
  };

  getAdminOptions = async (
    request: AppRequest<typeof GetLayerAdminOptionSchema>,
    reply: AppReply<typeof GetLayerAdminOptionSchema>
  ) => {
    const query = request.query;

    const layer = await this.layerService.getBySource({
      type: query.type,
      url: query.url,
      params: {
        layers: query.layers
      }
    });
    if (!layer) {
      return reply.notFound();
    }

    return layer;
  };

  getOptions = async (request: AppRequest<typeof GetLayerOptionSchema>) => {
    const profils = request.user!.profils;
    const { type, layers, url } = request.query;

    const isAllowed = await this.layerService.urlAllowed(url, profils);
    if (!isAllowed) {
      return {};
    }

    const options = await this.layerService.getOptions(type, layers, url);
    if (!options) {
      return {};
    }

    return options;
  };
}
