import { AppInstance, AppReply, AppRequest } from '../../app.interface';
import { ContextService } from '../context.service';
import {
  CreateContextLayerSchema,
  DeleteContextLayerSchema,
  GetContextLayerSchema,
  GetContextLayersSchema,
  UpdateContextLayerSchema
} from './context-layer.schema';
import { ContextLayerService } from './index';

export class ContextLayerController {
  private contextLayerService: ContextLayerService;
  private contextService: ContextService;

  constructor(app: AppInstance) {
    this.contextLayerService = new ContextLayerService(app);
    this.contextService = new ContextService(app);
  }

  create = async (
    request: AppRequest<typeof CreateContextLayerSchema>,
    reply: AppReply<typeof CreateContextLayerSchema>
  ) => {
    const contextId = request.params.contextId;

    const context = await this.contextService.getById(contextId);
    if (!context) {
      return reply.notFound('Context not found');
    }

    const contextLayer = request.body;
    const res = await this.contextLayerService.create({
      ...contextLayer,
      contextId,
      layerId: contextLayer.layerId ?? null,
      sourceOptions: contextLayer.sourceOptions ?? null,
      layerOptions: contextLayer.layerOptions ?? null
    });
    return reply.code(201).send(res);
  };

  update = async (
    request: AppRequest<typeof UpdateContextLayerSchema>,
    reply: AppReply<typeof UpdateContextLayerSchema>
  ) => {
    const { contextId, id } = request.params;
    const layer = await this.contextLayerService.getById(id);
    if (!layer) {
      return reply.notFound('Context layer not found');
    }

    const contextLayer = request.body;
    return this.contextLayerService.update(id, {
      ...contextLayer,
      layerId: layer.layerId,
      contextId,
      sourceOptions: contextLayer.sourceOptions ?? null,
      layerOptions: contextLayer.layerOptions ?? null
    });
  };

  delete = async (
    request: AppRequest<typeof DeleteContextLayerSchema>,
    reply: AppReply<typeof DeleteContextLayerSchema>
  ) => {
    const { id } = request.params;
    const layer = await this.contextLayerService.getById(id);
    if (!layer) {
      return reply.notFound('Context layer not found');
    }

    const response = await this.contextLayerService.delete(id);

    return reply.code(204).send(response);
  };

  getById = async (
    request: AppRequest<typeof GetContextLayerSchema>,
    reply: AppReply<typeof GetContextLayerSchema>
  ) => {
    const { contextId, id } = request.params;
    const context = await this.contextService.getById(contextId);
    if (!context) {
      return reply.notFound('Context not found');
    }

    const layer = await this.contextLayerService.getById(id);
    if (!layer) {
      return reply.notFound();
    }
    return layer;
  };

  getByContextId = async (
    request: AppRequest<typeof GetContextLayersSchema>,
    reply: AppReply<typeof GetContextLayersSchema>
  ) => {
    const contextId = request.params.contextId;

    const context = await this.contextService.getById(contextId);
    if (!context) {
      return reply.notFound('Context not found');
    }

    return this.contextLayerService.getByContextId(contextId);
  };
}
