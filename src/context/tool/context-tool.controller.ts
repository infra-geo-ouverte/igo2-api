import { AppInstance, AppReply, AppRequest } from '../../app.interface';
import { ToolService } from '../../tool';
import {
  CreateContextToolSchema,
  DeleteContextToolSchema,
  GetContextToolSchema,
  GetContextToolsSchema,
  UpdateContextToolSchema
} from './context-tool.schema';
import { ContextToolService, IContextTool } from './index';

export class ContextToolController {
  private contextToolService: ContextToolService;
  private toolService: ToolService;

  constructor(app: AppInstance) {
    this.contextToolService = new ContextToolService(app);
    this.toolService = new ToolService(app);
  }

  create = async (
    request: AppRequest<typeof CreateContextToolSchema>,
    reply: AppReply<typeof CreateContextToolSchema>
  ) => {
    const contextId = request.params.contextId;
    const user = request.user;
    if (!user) {
      return reply.forbidden('Accès refusé');
    }
    const profils = user.profils;
    const newToolContext = request.body as IContextTool;
    newToolContext.contextId = contextId;

    const tool = await this.toolService.getById(newToolContext.toolId, profils);
    if (!tool) {
      return reply.notFound("The global tool doesn't exist");
    }

    const res = await this.contextToolService.create(newToolContext);
    return reply.code(201).send(res);
  };

  update = async (
    request: AppRequest<typeof UpdateContextToolSchema>,
    reply: AppReply<typeof UpdateContextToolSchema>
  ) => {
    const contextId = request.params.contextId;

    const toolId = request.params.toolId;
    const toolContextDb = await this.contextToolService.getById(
      contextId,
      toolId
    );
    if (!toolContextDb) {
      return reply.notFound();
    }

    const toolContext = request.body as IContextTool;
    return this.contextToolService.update(contextId, toolId, toolContext);
  };

  delete = async (
    request: AppRequest<typeof DeleteContextToolSchema>,
    reply: AppReply<typeof DeleteContextToolSchema>
  ) => {
    const toolId = request.params.toolId;
    const contextId = request.params.contextId;

    const tool = await this.contextToolService.getById(contextId, toolId);
    if (!tool) {
      return reply.notFound();
    }

    await this.contextToolService.delete(contextId, toolId);

    return reply.code(204).send();
  };

  getById = async (
    request: AppRequest<typeof GetContextToolSchema>,
    reply: AppReply<typeof GetContextToolSchema>
  ) => {
    const toolId = request.params.toolId;
    const contextId = request.params.contextId;

    const tool = await this.contextToolService.getById(contextId, toolId);
    if (!tool) {
      return reply.notFound();
    }

    return tool;
  };

  getByContextId = async (
    request: AppRequest<typeof GetContextToolsSchema>
  ) => {
    const contextId = request.params.contextId;
    return this.contextToolService.getByContextId(contextId);
  };
}
