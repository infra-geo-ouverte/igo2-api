import * as Hapi from '@hapi/hapi';

import { handleError, HapiRequestToUser } from '../utils';

import { ToolService } from './tool.service';
import { ITool } from './tool.interface';

export class ToolController {
  private toolService: ToolService;

  constructor () {
    this.toolService = new ToolService();
  }

  public async create (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const toolToCreate: ITool = request.payload as ITool;

    const res = await this.toolService.create(toolToCreate).catch(handleError);

    return h.response(res).code(201);
  }

  public async update (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const toolToUpdate: ITool = request.payload as ITool;

    return await this.toolService.update(id, toolToUpdate).catch(handleError);
  }

  public async delete (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params.id;

    await this.toolService.delete(id).catch(handleError);
    return h.response().code(204);
  }

  public async getById (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const user = HapiRequestToUser(request);
    return await this.toolService.getById(id, user.id).catch(handleError);
  }

  public async get (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const user = HapiRequestToUser(request);
    return await this.toolService.get(user.id).catch(handleError);
  }
}
