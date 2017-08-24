import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { ToolContext, IToolContext, ToolContextInstance } from './index';

export class ToolContextController {

  private toolContext: ToolContext;

  constructor() {
    this.toolContext = new ToolContext();
  }

  public create(request: Hapi.Request, reply: Hapi.IReply) {
    const newToolContext: IToolContext = request.payload;
    newToolContext['contextId'] = request.params['contextId'];

    this.toolContext.create(newToolContext).subscribe(
      (tc: ToolContextInstance) => reply(tc).code(201),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public update(request: Hapi.Request, reply: Hapi.IReply) {
    const toolId = request.params['toolId'];
    const contextId = request.params['contextId'];
    const toolContext: IToolContext = request.payload;

    this.toolContext.update(contextId, toolId, toolContext).subscribe(
      (cp: ToolContextInstance) => reply(cp),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public delete(request: Hapi.Request, reply: Hapi.IReply) {
    const toolId = request.params['toolId'];
    const contextId = request.params['contextId'];

    this.toolContext.delete(contextId, toolId).subscribe(
      (cp: ToolContextInstance) => reply(cp).code(204),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getById(request: Hapi.Request, reply: Hapi.IReply) {
    const toolId = request.params['toolId'];
    const contextId = request.params['contextId'];

    this.toolContext.getById(contextId, toolId).subscribe(
      (cp: ToolContextInstance) => reply(cp),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getByContextId(request: Hapi.Request, reply: Hapi.IReply) {
    const contextId = request.params['contextId'];

    this.toolContext.getByContextId(contextId).subscribe(
      (cp: ToolContextInstance[]) => reply(cp),
      (error: Boom.BoomError) => reply(error)
    );
  }

}
