import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { Tool } from './tool';
import { ITool, ToolInstance } from './tool.model';

export class ToolController {

  private tool: Tool;

  constructor() {
    this.tool = new Tool();
  }

  public create(request: Hapi.Request, reply: Hapi.IReply) {
    const toolToCreate: ITool = request.payload;

    this.tool.create(toolToCreate).subscribe(
      (tool: ToolInstance) => reply(tool).code(201),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public update(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const toolToUpdate: ITool = request.payload;

    this.tool.update(id, toolToUpdate).subscribe(
      (tool: ToolInstance) => reply(tool),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public delete(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];

    this.tool.delete(id).subscribe(
      (tool: ToolInstance) => reply(tool).code(204),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getById(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];

    this.tool.getById(id).subscribe(
      (tool: ToolInstance) => reply(tool),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public get(request: Hapi.Request, reply: Hapi.IReply) {
    this.tool.get().subscribe(
      (tools: ToolInstance[]) => reply(tools),
      (error: Boom.BoomError) => reply(error)
    );
  }
}
