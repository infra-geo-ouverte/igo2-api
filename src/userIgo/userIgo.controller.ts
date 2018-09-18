import * as Hapi from 'hapi';

import { handleError } from '../utils';

import { UserIgo } from './userIgo';
import { IUserIgo } from './userIgo.model';

export class UserIgoController {
  private userIgo: UserIgo;

  constructor() {
    this.userIgo = new UserIgo();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const userIgoToCreate: IUserIgo = request.payload as IUserIgo;
    userIgoToCreate.userId = request.headers['x-consumer-custom-id'];

    const res = await this.userIgo.create(userIgoToCreate).catch(handleError);
    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const userId = request.headers['x-consumer-custom-id'];
    const userIgoToUpdate: IUserIgo = request.payload as IUserIgo;

    return await this.userIgo
      .update(userId, userIgoToUpdate)
      .catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const userId = request.headers['x-consumer-custom-id'];

    await this.userIgo.delete(userId).catch(handleError);

    return h.response().code(204);
  }

  public async get(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const userId = request.headers['x-consumer-custom-id'];

    return await this.userIgo.get(userId).catch(handleError);
  }

  public async setDefaultContext(
    request: Hapi.Request,
    h: Hapi.ResponseToolkit
  ) {
    const userId = request.headers['x-consumer-custom-id'];

    const userIGO = await this.userIgo.get(userId).catch(handleError);

    if (userIGO) {
      return await this.update(request, h);
    } else {
      return await this.create(request, h);
    }
  }
}
