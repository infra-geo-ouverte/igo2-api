import * as Hapi from 'hapi';

import { handleError } from '../utils';

import { Tool } from './tool';
import { ITool } from './tool.model';

export class ToolController {

  private tool: Tool;

  constructor() {
    this.tool = new Tool();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const toolToCreate: ITool = request.payload as ITool;

    const res = await this.tool.create(toolToCreate)
      .catch(handleError);

    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];
    const toolToUpdate: ITool = request.payload as ITool;

    return await this.tool.update(id, toolToUpdate).catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];

    await this.tool.delete(id).catch(handleError);
    return h.response().code(204);
  }

  public async getById(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];

    return await this.tool.getById(id).catch(handleError);
  }

  public async get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    return await this.tool.get().catch(handleError);
  }
}
