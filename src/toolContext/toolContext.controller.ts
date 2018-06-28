import * as Hapi from 'hapi';

import { handleError } from '../utils';

import { ToolContext, IToolContext } from './index';

export class ToolContextController {

  private toolContext: ToolContext;

  constructor() {
    this.toolContext = new ToolContext();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const newToolContext = request.payload as IToolContext;
    newToolContext['contextId'] = request.params['contextId'];

    const res = await this.toolContext.create(newToolContext)
      .catch(handleError);

    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const toolId = request.params['toolId'];
    const contextId = request.params['contextId'];
    const toolContext = request.payload as IToolContext;

    return await this.toolContext.update(contextId, toolId, toolContext)
      .catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const toolId = request.params['toolId'];
    const contextId = request.params['contextId'];

    await this.toolContext.delete(contextId, toolId).catch(handleError);

    return h.response().code(204);
  }

  public async getById(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const toolId = request.params['toolId'];
    const contextId = request.params['contextId'];

    return await this.toolContext.getById(contextId, toolId).catch(handleError);
  }

  public async getByContextId(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const contextId = request.params['contextId'];

    return await this.toolContext.getByContextId(contextId).catch(handleError);
  }

}
