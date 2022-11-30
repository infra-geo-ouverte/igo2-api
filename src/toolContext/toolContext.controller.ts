import * as Hapi from '@hapi/hapi';

import { handleError } from '../utils';

import { ToolContextService, IToolContext } from './index';

export class ToolContextController {
  private toolContextService: ToolContextService;

  constructor () {
    this.toolContextService = new ToolContextService();
  }

  public async create (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const newToolContext = request.payload as IToolContext;
    newToolContext.contextId = request.params.contextId;

    const res = await this.toolContextService.create(newToolContext).catch(handleError);

    return h.response(res).code(201);
  }

  public async update (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const toolId = request.params.toolId;
    const contextId = request.params.contextId;
    const toolContext = request.payload as IToolContext;

    return await this.toolContextService.update(contextId, toolId, toolContext).catch(handleError);
  }

  public async delete (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const toolId = request.params.toolId;
    const contextId = request.params.contextId;

    await this.toolContextService.delete(contextId, toolId).catch(handleError);

    return h.response().code(204);
  }

  public async getById (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const toolId = request.params.toolId;
    const contextId = request.params.contextId;

    return await this.toolContextService.getById(contextId, toolId).catch(handleError);
  }

  public async getByContextId (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const contextId = request.params.contextId;

    return await this.toolContextService.getByContextId(contextId).catch(handleError);
  }
}
