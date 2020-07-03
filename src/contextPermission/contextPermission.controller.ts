import * as Hapi from 'hapi';
import * as Boom from 'boom';

import { handleError } from '../utils';
import { UserApi } from '../user';
import { IProfilIgo, ProfilIgo } from '../profilIgo';
import { TypePermission } from './contextPermission.model';

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
    const contextId = request.params['contextId'];
    const typePerm = await this.contextPermission.getPermissionByContextId(
      contextId,
      request.headers['x-consumer-username']
    );

    if (typePerm !== TypePermission.write) {
      const permissionToDelete = await this.contextPermission.getById(id).catch(handleError);
      if (permissionToDelete.profil !== request.headers['x-consumer-username']) {
        throw Boom.forbidden('Must have write permission for this context');
      }
    }

    await this.contextPermission.delete(id).catch(handleError);

    return h.response().code(204);
  }

  public async getByContextId(request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const contextId = request.params['contextId'];

    const typePerm = await this.contextPermission.getPermissionByContextId(
      contextId,
      request.headers['x-consumer-username']
    );
    const profils: string[] = await UserApi.getProfils(
      request.headers['x-consumer-id'],
      request.headers['x-consumer-groups']
    ).catch(() => []);
    profils.push(request.headers['x-consumer-username']);

    const permissions = (await this.contextPermission.getByContextId(contextId).catch(handleError))
      .filter(p => {
        return typePerm === TypePermission.write || profils.includes(p.profil);
      })
      .map(async p => {
        const user = await UserApi.getUser(p.profil).then(u => (u ? u.get() : undefined));
        if (user) {
          p.profilTitle = user.firstName + ' ' + user.lastName;
          return p;
        }

        const profil = await this.profilIgo.getById(p.profil).catch(e => undefined);
        if (profil) {
          p.profilTitle = profil.title;
          return p;
        }

        return p;
      });

    return Promise.all(permissions);
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
