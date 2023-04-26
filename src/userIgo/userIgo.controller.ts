import * as Hapi from '@hapi/hapi';

import { ObjectUtils } from '@igo2/base-api';
import { handleError } from '../utils';

import { UserApi } from '../user';
import { ProfilIgoService, ProfilIgo } from '../profilIgo';
import { UserIgoService } from './userIgo.service';
import { IUserIgo } from './userIgo.interface';

export class UserIgoController {
  private userIgoService: UserIgoService;
  private profilIgoService: ProfilIgoService;

  constructor() {
    this.userIgoService = new UserIgoService();
    this.profilIgoService = new ProfilIgoService();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const userIgoToCreate: IUserIgo = request.payload as IUserIgo;
    userIgoToCreate.userId = request.headers['x-consumer-custom-id'];

    const res = await this.userIgoService.create(userIgoToCreate).catch(handleError);
    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const userIgoToUpdate: IUserIgo = request.payload as IUserIgo;
    const mergePreference = request.query.mergePreference === undefined ? true : request.query.mergePreference;

    const userId = request.headers['x-consumer-custom-id'];
    const userIGO = await this.userIgoService.get(userId).catch(() => {});

    if (userIGO) {
      if (mergePreference) {
          userIgoToUpdate.preference = Object.assign({}, userIGO.preference, userIgoToUpdate.preference);
      }
      userIgoToUpdate.preference = ObjectUtils.removeUndefined(userIgoToUpdate.preference);
      return await this.userIgoService.update(userId, userIgoToUpdate).catch(handleError);
    } else {
      return await this.userIgoService
        .create(ObjectUtils.removeUndefined(Object.assign(userIgoToUpdate, { userId })))
        .catch(handleError);
    }
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const userId = request.headers['x-consumer-custom-id'];

    await this.userIgoService.delete(userId).catch(handleError);

    return h.response().code(204);
  }

  public async get(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const userId = request.headers['x-consumer-id'];
    const userCustomId = request.headers['x-consumer-custom-id'];

    const user = await this.userIgoService
      .get(userCustomId)
      .catch(e => {
        if (e && e.output && e.output.statusCode === 404) {
          return {};
        }
        throw e;
      })
      .catch(handleError);

    const profils = (await UserApi.getProfils(userId, request.headers['x-consumer-groups']).catch(
      () => []
    )) as string[];
    let profilsIgo = (await this.profilIgoService.getByProfils(profils).catch(() => [])) as ProfilIgo[];
    const preference: any = profilsIgo.reduce((acc, value) => Object.assign(acc, value ? value.preference : {}), {});
    const canShare = profilsIgo.find(p => p.canShare === true);
    preference.canShare = !!canShare;
    user.preference = Object.assign(preference, user.preference);

    const hasAcrigeo = profilsIgo.find((p) => p.hasAcrigeo === true);
    if (!hasAcrigeo) {
      if (profilsIgo.length !== 1) {
        profilsIgo = profilsIgo.filter((p) => p.name !== 'acrigeo');
      } else {
        profilsIgo = profilsIgo[0].name === 'acrigeo' ? profilsIgo : profilsIgo.filter((p) => p.name !== 'acrigeo');
      }
    }

    user.guides = profilsIgo.reduce((acc, value) => {
      if (value.guides) {
        acc.push(...value.guides);
      }
      return [...new Set(acc)];
    }, []);

    return h.response(user);
  }
}
