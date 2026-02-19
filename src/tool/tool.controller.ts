import { AppInstance, AppReply, AppRequest } from '../app.interface';
import {
  CreateToolSchema,
  DeleteToolSchema,
  GetAllToolSchema,
  GetToolSchema,
  UpdateToolSchema
} from './tool.schema';
import { ToolService } from './tool.service';

export class ToolController {
  private toolService: ToolService;

  constructor(app: AppInstance) {
    this.toolService = new ToolService(app);
  }

  create = async (
    request: AppRequest<typeof CreateToolSchema>,
    reply: AppReply<typeof CreateToolSchema>
  ) => {
    const toolToCreate = request.body;
    const res = await this.toolService.create(toolToCreate);
    return reply.code(201).send(res);
  };

  update = async (
    request: AppRequest<typeof UpdateToolSchema>,
    reply: AppReply<typeof UpdateToolSchema>
  ) => {
    const id = request.params.id;
    const profils = request.user!.profils;

    const tool = await this.toolService.getById(id, profils);
    if (!tool) {
      return reply.notFound();
    }

    return this.toolService.update(id, request.body);
  };

  delete = async (
    request: AppRequest<typeof DeleteToolSchema>,
    reply: AppReply<typeof DeleteToolSchema>
  ) => {
    const id = request.params.id;
    const profils = request.user!.profils;

    const tool = await this.toolService.getById(id, profils);
    if (!tool) {
      return reply.notFound();
    }

    const result = await this.toolService.delete(id);
    return reply.code(204).send(result);
  };

  getById = async (
    request: AppRequest<typeof GetToolSchema>,
    reply: AppReply<typeof GetToolSchema>
  ) => {
    const id = request.params.id;
    const profils = request.user!.profils;

    const tool = await this.toolService.getById(id, profils);
    if (!tool) {
      return reply.notFound();
    }

    return tool;
  };

  get = async (request: AppRequest<typeof GetAllToolSchema>) => {
    const profils = request.user!.profils;
    return this.toolService.get(profils);
  };
}
