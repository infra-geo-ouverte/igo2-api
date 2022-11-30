import * as Hapi from '@hapi/hapi';

import { handleError, HapiRequestToUser } from '../utils';

import { ContextHiddenService } from './index';

export class ContextHiddenController {
  private contextHiddenService: ContextHiddenService;

  constructor () {
    this.contextHiddenService = new ContextHiddenService();
  }

  public async show (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const contextId = request.params.contextId;
    const requestedUser = HapiRequestToUser(request);
    const owner = requestedUser.sourceId;

    await this.contextHiddenService.show(owner, contextId).catch(handleError);

    return h.response({
      contextId,
      hidden: false
    });
  }

  public async hide (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const contextId = request.params.contextId;
    const requestedUser = HapiRequestToUser(request);
    const owner = requestedUser.sourceId;
    await this.contextHiddenService.hide(owner, contextId).catch(handleError);

    return h.response({
      contextId,
      hidden: true
    });
  }

  public async get (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const requestedUser = HapiRequestToUser(request);
    const owner = requestedUser.sourceId;

    return await this.contextHiddenService.get(owner).catch(handleError);
  }

  public async getById (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const contextId = request.params.contextId;
    const requestedUser = HapiRequestToUser(request);
    const owner = requestedUser.sourceId;

    return await this.contextHiddenService.getById(owner, contextId).catch(handleError);
  }
}
