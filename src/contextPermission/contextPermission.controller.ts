import * as Hapi from '@hapi/hapi';
import * as Boom from '@hapi/boom';

import { handleError, HapiRequestToUser } from '../utils';
import { UserApi } from '../user';
import { IProfilIgo, ProfilIgoService } from '../profilIgo';
import { TypePermission } from './contextPermission.interface';

import { IContextPermission, ContextPermissionService } from './index';

export class ContextPermissionController {
  private contextPermissionService: ContextPermissionService;
  private profilIgoService: ProfilIgoService;

  constructor () {
    this.contextPermissionService = new ContextPermissionService();
    this.profilIgoService = new ProfilIgoService();
  }

  public async create (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    await this.verifyPermissions(request);
    const newContextPermission = request.payload as IContextPermission;
    newContextPermission.contextId = request.params.contextId;

    const res = await this.contextPermissionService.create(newContextPermission).catch(handleError);

    return h.response(res).code(201);
  }

  public async update (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    await this.verifyPermissions(request);
    const id = request.params.id;
    const newContextPermission = request.payload as IContextPermission;

    return await this.contextPermissionService.update(id, newContextPermission).catch(handleError);
  }

  public async delete (request: Hapi.Request, h: Hapi.ResponseToolkit) {
    const id = request.params.id;
    const requestedUser = HapiRequestToUser(request);
    const contextId = request.params.contextId;
    const typePerm = await this.contextPermissionService.getPermissionByContextId(
      contextId,
      requestedUser.sourceId
    );

    if (typePerm !== TypePermission.write) {
      const permissionToDelete = await this.contextPermissionService.getById(id).catch(handleError);
      if (permissionToDelete.profil !== requestedUser.sourceId) {
        throw Boom.forbidden('Must have write permission for this context');
      }
    }

    await this.contextPermissionService.delete(id).catch(handleError);

    return h.response().code(204);
  }

  public async getByContextId (request: Hapi.Request, _h: Hapi.ResponseToolkit) {
    const contextId = request.params.contextId;
    const requestedUser = HapiRequestToUser(request);

    const typePerm = await this.contextPermissionService.getPermissionByContextId(
      contextId,
      requestedUser.sourceId
    );
    const profils: string[] = await UserApi.getProfils(
      requestedUser.id
    ).catch(() => []);
    profils.push(requestedUser.sourceId);

    const permissions = (await this.contextPermissionService.getByContextId(contextId).catch(handleError))
      .filter((p) => {
        return typePerm === TypePermission.write || profils.includes(p.profil);
      })
      .map(async (p) => {
        const user = await UserApi.getUser(p.profil).then((u) => (u ? u.get() : undefined));
        if (user) {
          p.profilTitle = user.firstName + ' ' + user.lastName;
          return p;
        }

        const profil = await this.profilIgoService.getById(p.profil).catch((e) => undefined);
        if (profil) {
          p.profilTitle = profil.title;
          return p;
        }

        return p;
      });

    return Promise.all(permissions);
  }

  private async verifyPermissions (request: Hapi.Request) {
    const requestedUser = HapiRequestToUser(request);
    const id = requestedUser.id;
    const profils: string[] = await UserApi.getProfils(id).catch(() => []);

    const profilIgo: IProfilIgo[] = (await this.profilIgoService.get().catch(handleError)).filter((p) =>
      profils.includes(p.name)
    );

    const canShare = profilIgo.find((p) => p.canShare === true);
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

    const profilForbidden = profilIgo.filter((p) => !canShareToProfils.includes(p.id)).map((p) => p.name);
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
