import * as Hapi from 'hapi';

import { ObjectUtils, handleError } from '../utils';

import { UserApi } from '../user';
import { ProfilIgo, ProfilIgoInstance } from '../profilIgo';
import { UserIgo } from './userIgo';
import { IUserIgo } from './userIgo.model';

export class UserIgoController {
  private userIgo: UserIgo;
  private profilIgo: ProfilIgo;

  constructor() {
    this.userIgo = new UserIgo();
    this.profilIgo = new ProfilIgo();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const userIgoToCreate: IUserIgo = request.payload as IUserIgo;
    userIgoToCreate.userId = request.headers['x-consumer-custom-id'];

    const res = await this.userIgo.create(userIgoToCreate).catch(handleError);
    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const userIgoToUpdate: IUserIgo = request.payload as IUserIgo;

    const userId = request.headers['x-consumer-custom-id'];
    const userIGO = await this.userIgo.get(userId).catch(() => {});

    if (userIGO) {
      userIgoToUpdate.preference = ObjectUtils.removeUndefined(
        Object.assign({}, userIGO.preference, userIgoToUpdate.preference)
      );
      return await this.userIgo.update(userId, userIgoToUpdate).catch(handleError);
    } else {
      return await this.userIgo
        .create(ObjectUtils.removeUndefined(Object.assign(userIgoToUpdate, { userId })))
        .catch(handleError);
    }
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const userId = request.headers['x-consumer-custom-id'];

    await this.userIgo.delete(userId).catch(handleError);

    return h.response().code(204);
  }

  public async get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const userId = request.headers['x-consumer-id'];
    const userCustomId = request.headers['x-consumer-custom-id'];

    const user = await this.userIgo
      .get(userCustomId)
      .catch(e => {
        if (e && e.output && e.output.statusCode === 404) {
          return {}
        }
        throw e;
      })
      .catch(handleError);

    const profils = (await UserApi.getProfils(userId).catch(() => [])) as string[];
    const profilsIgo = (await this.profilIgo.getByProfils(profils).catch(() => [])) as ProfilIgoInstance[];
    const preference: any = profilsIgo.reduce((acc, value) => Object.assign(acc, value ? value.preference : {}), {});
    const canShare = profilsIgo.find(p => p.canShare === true);
    preference.canShare = !!canShare;
    user.preference = Object.assign(preference, user.preference);

    return h.response(user);
  }
}
