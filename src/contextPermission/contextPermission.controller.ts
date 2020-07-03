import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { handleError } from '../utils';
import { UserApi } from '../user';
import { IProfilIgo, ProfilIgo } from '../profilIgo';

import { IContextPermission, ContextPermission } from './index';

export class ContextPermissionController {
  private contextPermission: ContextPermission;
  private profilIgo: ProfilIgo;

  constructor() {
    this.contextPermission = new ContextPermission();
    this.profilIgo = new ProfilIgo();
  }

  public async create(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    await this.verifyPermissions(request);
    const newContextPermission = request.payload as IContextPermission;
    newContextPermission['contextId'] = request.params['contextId'];

    const res = await this.contextPermission.create(newContextPermission).catch(handleError);

    return h.response(res).code(201);
  }

  public async update(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    await this.verifyPermissions(request);
    const id = request.params['id'];
    const newContextPermission = request.payload as IContextPermission;

    return await this.contextPermission.update(id, newContextPermission).catch(handleError);
  }

  public async delete(request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params['id'];

    await this.contextPermission.delete(id).catch(handleError);

    return h.response().code(204);
  }

  public async getByContextId(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const contextId = request.params['contextId'];

    return await this.contextPermission.getByContextId(contextId).catch(handleError);
  }

  private async verifyPermissions(request: Hapi.Request) {
    const id = request.headers['x-consumer-id'];
    const profils: string[] = await UserApi.getProfils(id, request.headers['x-consumer-groups']).catch(() => []);

    const profilIgo: IProfilIgo[] = (await this.profilIgo.get().catch(handleError)).filter(p =>
      profils.includes(p.name)
    );

    const canShare = profilIgo.find(p => p.canShare === true);
    if (!canShare) {
      throw Boom.forbidden('You can not share a context');
    }

    const canShareToProfils = [
      ...profilIgo.reduce(
        (accumulator, currentValue) =>
          accumulator.concat(currentValue.canShareToProfils ? currentValue.canShareToProfils : []),
        []
      )
    ];

    const profilForbidden = profilIgo.filter(p => !canShareToProfils.includes(p.id)).map(p => p.name);
    const newContextPermission = request.payload as IContextPermission;
    const profilsToAdd = newContextPermission.profil ? newContextPermission.profil.split(/[,;]/) : [];
    for (let p of profilsToAdd) {
      p = p.trim();
      if (profilForbidden.includes(p)) {
        throw Boom.forbidden('You can not share a context to this profil');
      }
    }
  }
}
