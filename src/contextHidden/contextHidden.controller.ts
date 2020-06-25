import * as Hapi from 'hapi';

import { handleError } from '../utils';

import { ContextHidden } from './index';

export class ContextHiddenController {
  private contextHidden: ContextHidden;

  constructor() {
    this.contextHidden = new ContextHidden();
  }

  public async show(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const contextId = request.params['contextId'];
    const owner = request.headers['x-consumer-username'];

    await this.contextHidden.show(owner, contextId).catch(handleError);

    return h.response({
      contextId,
      hidden: false
    });
  }

  public async hide(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const contextId = request.params['contextId'];
    const owner = request.headers['x-consumer-username'];

    await this.contextHidden.hide(owner, contextId).catch(handleError);

    return h.response({
      contextId,
      hidden: true
    });
  }

  public async get(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const owner = request.headers['x-consumer-username'];

    return await this.contextHidden.get(owner).catch(handleError);
  }

  public async getById(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const contextId = request.params['contextId'];
    const owner = request.headers['x-consumer-username'];

    return await this.contextHidden.getById(owner, contextId).catch(handleError);
  }
}
