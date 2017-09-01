import * as Hapi from 'hapi';
import * as Boom from 'boom';

import {
  IContextPermission,
  ContextPermissionInstance,
  ContextPermission
} from './index';

export class ContextPermissionController {

  private contextPermission: ContextPermission;

  constructor() {
    this.contextPermission = new ContextPermission();
  }

  public create(request: Hapi.Request, reply: Hapi.IReply) {
    const newContextPermission: IContextPermission = request.payload;
    newContextPermission['contextId'] = request.params['contextId'];

    this.contextPermission.create(newContextPermission).subscribe(
      (cp: ContextPermissionInstance) => reply(cp).code(201),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public update(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];
    const newContextPermission: IContextPermission = request.payload;

    this.contextPermission.update(id, newContextPermission).subscribe(
      (cp: ContextPermissionInstance) => reply(cp),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public delete(request: Hapi.Request, reply: Hapi.IReply) {
    const id = request.params['id'];

    this.contextPermission.delete(id).subscribe(
      (cp: ContextPermissionInstance) => reply(cp).code(204),
      (error: Boom.BoomError) => reply(error)
    );
  }

  public getByContextId(
    request: Hapi.Request, reply: Hapi.IReply) {

    const contextId = request.params['contextId'];

    this.contextPermission.getByContextId(contextId).subscribe(
      (cp: ContextPermissionInstance[]) => reply(cp),
      (error: Boom.BoomError) => reply(error)
    );
  }

}
