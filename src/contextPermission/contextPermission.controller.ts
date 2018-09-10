import * as Hapi from 'hapi';

import { handleError } from '../utils';

import { IContextPermission, ContextPermission } from './index';

export class ContextPermissionController {
  private contextPermission: ContextPermission;

  constructor() {
    this.contextPermission = new ContextPermission();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const newContextPermission = request.payload as IContextPermission;
    newContextPermission['contextId'] = request.params['contextId'];

    const res = await this.contextPermission
      .create(newContextPermission)
      .catch(handleError);

    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const id = request.params['id'];
    const newContextPermission = request.payload as IContextPermission;

    return await this.contextPermission
      .update(id, newContextPermission)
      .catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];

    await this.contextPermission.delete(id).catch(handleError);

    return h.response().code(204);
  }

  public async getByContextId(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const contextId = request.params['contextId'];

    return await this.contextPermission
      .getByContextId(contextId)
      .catch(handleError);
  }
}
